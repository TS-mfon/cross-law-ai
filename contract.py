# {"Depends": "py-genlayer:test"}

from dataclasses import dataclass
import json
import re

from genlayer import *


ERROR_EXPECTED = "[EXPECTED]"
ERROR_LLM = "[LLM_ERROR]"
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"


def _parse_json_dict(raw: str) -> dict:
    if not raw:
        return {}
    try:
        first = raw.find("{")
        last = raw.rfind("}")
        if first == -1 or last == -1:
            return {}
        cleaned = re.sub(r",\s*([}\]])", r"\1", raw[first:last + 1])
        data = json.loads(cleaned)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _parse_json_list(raw: str) -> list:
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _handle_leader_error(leaders_res, leader_fn) -> bool:
    leader_msg = getattr(leaders_res, "message", "")
    try:
        leader_fn()
        return False
    except gl.vm.UserError as exc:
        return str(exc) == leader_msg
    except Exception:
        return False


@allow_storage
@dataclass
class CrossBorderDispute:
    party_a: Address
    party_b: Address
    contract_description: str
    disputed_provision: str
    jurisdiction_a: str
    legal_arguments_a: str
    legal_sources_a_json: str
    jurisdiction_b: str
    legal_arguments_b: str
    legal_sources_b_json: str
    execution_amount: u256
    status: str
    analysis_json: str
    ruling_json: str
    accept_a: bool
    accept_b: bool


class CrossBorderSettlement(gl.Contract):
    disputes: TreeMap[str, CrossBorderDispute]
    dispute_order: DynArray[str]
    appeals: TreeMap[str, str]
    dispute_nonce: u256
    appeal_nonce: u256

    def __init__(self):
        self.dispute_nonce = 0
        self.appeal_nonce = 0

    @gl.public.write
    def register_dispute(
        self,
        contract_description: str,
        disputed_provision: str,
        jurisdiction_a: str,
        legal_arguments_a: str,
        legal_sources_a: list[str],
        party_b_address: str,
        execution_amount: u256,
    ) -> str:
        dispute_id = "cross-border-" + str(int(self.dispute_nonce))
        self.dispute_nonce += 1
        self.disputes[dispute_id] = CrossBorderDispute(
            party_a=gl.message.sender_address,
            party_b=Address(party_b_address),
            contract_description=contract_description[:2000],
            disputed_provision=disputed_provision[:1000],
            jurisdiction_a=jurisdiction_a[:200],
            legal_arguments_a=legal_arguments_a[:3000],
            legal_sources_a_json=json.dumps(legal_sources_a),
            jurisdiction_b="",
            legal_arguments_b="",
            legal_sources_b_json="[]",
            execution_amount=execution_amount,
            status="OPEN",
            analysis_json="{}",
            ruling_json="{}",
            accept_a=False,
            accept_b=False,
        )
        self.dispute_order.append(dispute_id)
        return dispute_id

    @gl.public.write
    def submit_counterparty_case(self, dispute_id: str, jurisdiction_b: str, legal_arguments_b: str, legal_sources_b: list[str]) -> str:
        if dispute_id not in self.disputes:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown dispute")
        dispute = self.disputes[dispute_id]
        if gl.message.sender_address != dispute.party_b:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only party B")
        dispute.jurisdiction_b = jurisdiction_b[:200]
        dispute.legal_arguments_b = legal_arguments_b[:3000]
        dispute.legal_sources_b_json = json.dumps(legal_sources_b)
        dispute.status = "ANALYZING"
        self.disputes[dispute_id] = dispute
        self._evaluate_dispute(dispute_id)
        return dispute_id + "-case"

    def _evaluate_dispute(self, dispute_id: str) -> None:
        dispute = self.disputes[dispute_id]

        def leader_fn():
            prompt = f"""
Contract description: {dispute.contract_description}
Disputed provision: {dispute.disputed_provision}
Jurisdiction A: {dispute.jurisdiction_a}
Arguments A: {dispute.legal_arguments_a}
Sources A: {_parse_json_list(dispute.legal_sources_a_json)}
Jurisdiction B: {dispute.jurisdiction_b}
Arguments B: {dispute.legal_arguments_b}
Sources B: {_parse_json_list(dispute.legal_sources_b_json)}

Return JSON only with:
{{
  "analysis_points": [{{"issue":"...", "jurisdiction_a":"...", "jurisdiction_b":"...", "agreement":"agree|conflict|partial"}}],
  "ruling_under_a": {{"winner":"party_a|party_b|split", "summary":"..." }},
  "ruling_under_b": {{"winner":"party_a|party_b|split", "summary":"..." }},
  "final_ruling": {{"winner":"party_a|party_b|split", "reasoning":"..." }}
}}
"""
            result = _parse_json_dict(gl.nondet.exec_prompt(prompt))
            points = result.get("analysis_points", [])
            if not isinstance(points, list):
                points = []
            ruling_under_a = result.get("ruling_under_a", {})
            ruling_under_b = result.get("ruling_under_b", {})
            final_ruling = result.get("final_ruling", {})
            if not isinstance(ruling_under_a, dict):
                ruling_under_a = {}
            if not isinstance(ruling_under_b, dict):
                ruling_under_b = {}
            if not isinstance(final_ruling, dict):
                final_ruling = {}
            return {
                "analysis_points": points[:20],
                "ruling_under_a": ruling_under_a,
                "ruling_under_b": ruling_under_b,
                "final_ruling": final_ruling,
            }

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return _handle_leader_error(leaders_res, leader_fn)
            leader = leaders_res.calldata
            validator = leader_fn()
            return leader.get("final_ruling", {}).get("winner", "") == validator.get("final_ruling", {}).get("winner", "")

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        dispute.analysis_json = json.dumps({"analysis_points": result.get("analysis_points", [])}, sort_keys=True)
        dispute.ruling_json = json.dumps(
            {
                "ruling_under_a": result.get("ruling_under_a", {}),
                "ruling_under_b": result.get("ruling_under_b", {}),
                "final_ruling": result.get("final_ruling", {}),
            },
            sort_keys=True,
        )
        dispute.status = "RULING_READY"
        self.disputes[dispute_id] = dispute

    @gl.public.write
    def submit_appeal(self, dispute_id: str, new_legal_authority: str, new_sources: list[str]) -> str:
        if dispute_id not in self.disputes:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown dispute")
        appeal_id = "appeal-" + str(int(self.appeal_nonce))
        self.appeal_nonce += 1
        self.appeals[appeal_id] = json.dumps(
            {"dispute_id": dispute_id, "new_legal_authority": new_legal_authority[:2000], "new_sources": new_sources},
            sort_keys=True,
        )
        self._evaluate_dispute(dispute_id)
        return appeal_id

    @gl.public.write
    def accept_ruling(self, dispute_id: str) -> bool:
        if dispute_id not in self.disputes:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown dispute")
        dispute = self.disputes[dispute_id]
        if gl.message.sender_address == dispute.party_a:
            dispute.accept_a = True
        elif gl.message.sender_address == dispute.party_b:
            dispute.accept_b = True
        else:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only parties")
        if dispute.accept_a and dispute.accept_b:
            dispute.status = "EXECUTED"
        self.disputes[dispute_id] = dispute
        return True

    @gl.public.write
    def reject_ruling(self, dispute_id: str, reason: str) -> bool:
        del reason
        if dispute_id not in self.disputes:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown dispute")
        dispute = self.disputes[dispute_id]
        dispute.status = "REJECTED"
        self.disputes[dispute_id] = dispute
        return True

    @gl.public.view
    def get_dispute(self, dispute_id: str) -> dict:
        if dispute_id not in self.disputes:
            return {}
        dispute = self.disputes[dispute_id]
        return {
            "dispute_id": dispute_id,
            "party_a": dispute.party_a.as_hex,
            "party_b": dispute.party_b.as_hex,
            "contract_description": dispute.contract_description,
            "disputed_provision": dispute.disputed_provision,
            "jurisdiction_a": dispute.jurisdiction_a,
            "jurisdiction_b": dispute.jurisdiction_b,
            "status": dispute.status,
            "execution_amount": int(dispute.execution_amount),
        }

    @gl.public.view
    def get_comparative_analysis(self, dispute_id: str) -> dict:
        if dispute_id not in self.disputes:
            return {}
        return _parse_json_dict(self.disputes[dispute_id].analysis_json)

    @gl.public.view
    def get_ruling(self, dispute_id: str) -> dict:
        if dispute_id not in self.disputes:
            return {}
        return _parse_json_dict(self.disputes[dispute_id].ruling_json)

    @gl.public.view
    def get_my_disputes(self, wallet_address: str) -> list[dict]:
        items: list[dict] = []
        for dispute_id in self.dispute_order:
            dispute = self.disputes[dispute_id]
            if dispute.party_a.as_hex == wallet_address or dispute.party_b.as_hex == wallet_address:
                items.append(self.get_dispute(dispute_id))
        return items

    @gl.public.view
    def get_dispute_status(self, dispute_id: str) -> str:
        if dispute_id not in self.disputes:
            return ""
        return self.disputes[dispute_id].status

    @gl.public.view
    def get_appeal_status(self, appeal_id: str) -> dict:
        if appeal_id not in self.appeals:
            return {}
        payload = _parse_json_dict(self.appeals[appeal_id])
        return {"appeal_id": appeal_id, "payload": payload, "updated_ruling": self.get_ruling(str(payload.get("dispute_id", "")))}

    @gl.public.view
    def get_recent_rulings(self, limit: u256) -> list[dict]:
        items: list[dict] = []
        count = len(self.dispute_order)
        start = 0
        if count > int(limit):
            start = count - int(limit)
        for index in range(start, count):
            dispute_id = self.dispute_order[index]
            items.append({"dispute_id": dispute_id, "ruling": self.get_ruling(dispute_id)})
        return items

    @gl.public.view
    def get_jurisdictions_supported(self) -> list[str]:
        return [
            "United States (Common Law)",
            "United Kingdom",
            "European Union (Civil Law)",
            "Nigeria",
            "Singapore",
            "UAE (DIFC)",
            "India",
            "China",
            "Brazil",
            "Switzerland",
            "Cayman Islands",
            "BVI",
        ]
