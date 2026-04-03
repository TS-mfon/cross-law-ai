

Two parties in different jurisdictions dispute a contract. Each submits the relevant laws and precedents from their jurisdiction. The AI evaluates the contract dispute through both legal frameworks, identifies where they agree and disagree, and issues a ruling based on the most equitable interpretation across both systems. Legal pluralism resolved by AI consensus — addresses one of the biggest unsolved problems in international commercial law.

### Description

Cross-Border Settlement resolves commercial contract disputes between parties from different legal jurisdictions using AI as a comparative legal analyst and arbitrator. When two parties from different countries dispute a contract, each jurisdiction's law may lead to different rulings. Traditional international arbitration is extraordinarily expensive (hundreds of thousands of dollars) and slow (years). This contract offers a radical alternative: each party submits the relevant laws, precedents, and arguments from their jurisdiction. The Intelligent Contract evaluates the dispute through both legal frameworks simultaneously, identifies where the frameworks agree, where they differ, and issues a ruling based on the most equitable interpretation across both systems. Legal pluralism resolved by AI consensus — one of the most consequential unsolved problems in international commercial law.

**Core Problem Solved:** Cross-border commercial disputes are currently either prohibitively expensive (ICSID/ICC arbitration) or legally unenforceable (no agreed jurisdiction). This contract creates an affordable, fast, AI-conducted comparative law analysis and ruling that parties can pre-agree to treat as binding through the contract's execution mechanism.

---

### How It Works

1. **Dispute Registration** — Party A calls `register_dispute()` with: contract description, the disputed provision/event, their jurisdiction, and the relevant laws/precedents from their jurisdiction supporting their position.
2. **Party B Responds** — Party B calls `submit_counterparty_case()` with their jurisdiction, their legal arguments, and the laws/precedents from their jurisdiction.
3. **Comparative Analysis** — The Intelligent Contract fetches and reads the cited legal sources from both jurisdictions. It analyzes: what does Jurisdiction A's law say? What does Jurisdiction B's law say? Where do they agree? Where do they conflict?
4. **Ruling Generation** — The AI issues a ruling that: (a) applies the area of legal agreement first, (b) where laws conflict, identifies the more equitable outcome and explains why, and (c) notes which party prevails under each jurisdiction's law for full transparency.
5. **Ruling Published** — The ruling, comparative analysis, and reasoning are stored on-chain. Execution terms (payment, status change) are triggered if both parties pre-agreed to binding arbitration.
6. **Appeal Window** — Either party can submit new legal authority within 14 days. The AI re-evaluates with the new evidence.

---

### Frontend Architecture

| Route | Page Name | Purpose |
|---|---|---|
| `/` | Landing | What cross-border settlement does, jurisdictions supported, recent cases |
| `/disputes` | Dispute Dashboard | Active and resolved disputes |
| `/disputes/new` | Register Dispute | Form: contract description + disputed provision + jurisdiction A case |
| `/disputes/[id]` | Dispute Detail | Both parties' cases, comparative legal analysis, ruling |
| `/disputes/[id]/respond` | Submit Counterparty Case | Party B's form |
| `/disputes/[id]/appeal` | Appeal Form | New legal authority submission |
| `/disputes/[id]/ruling` | Ruling Detail | Full comparative analysis + ruling + execution proof |
| `/jurisdictions` | Supported Jurisdictions | List of jurisdictions the AI can evaluate |

---

### Key UI Moment

**The Comparative Legal Analysis on `/disputes/[id]/ruling`**

A side-by-side legal comparison table: left column = Jurisdiction A's law, right column = Jurisdiction B's law. Rows for each disputed provision. Green rows = both jurisdictions agree. Red rows = jurisdictions conflict. Below the table, the AI's ruling text with specific citations. The headline ruling — "Under both frameworks, Party A prevails on the payment obligation claim. Under Jurisdiction A only, Party A also prevails on the penalty clause." — makes the complexity of international law suddenly navigable.

---



---

### Write Methods Table

| Method | Inputs | Character Limits | Returns | When to Call |
|---|---|---|---|---|
| `register_dispute` | `contract_description: str`, `disputed_provision: str`, `jurisdiction_a: str`, `legal_arguments_a: str`, `legal_sources_a: list[str]`, `party_b_address: str`, `execution_amount: int` | contract: 2000, arguments: 3000 | `dispute_id: str` | Party A opens dispute |
| `submit_counterparty_case` | `dispute_id: str`, `jurisdiction_b: str`, `legal_arguments_b: str`, `legal_sources_b: list[str]` | arguments: 3000 | `case_id: str` | Party B responds |
| `submit_appeal` | `dispute_id: str`, `new_legal_authority: str`, `new_sources: list[str]` | 2000 chars | `appeal_id: str` | Either party within 14-day window |
| `accept_ruling` | `dispute_id: str` | — | `success: bool` | Party accepts ruling for execution |
| `reject_ruling` | `dispute_id: str`, `reason: str` | 1000 chars | `success: bool` | Party rejects (ruling stands, but execution doesn't trigger) |

---

### View Methods Table

| Method | Inputs | Output | When to Use |
|---|---|---|---|
| `get_dispute` | `dispute_id: str` | Full dispute object | Dispute detail page |
| `get_comparative_analysis` | `dispute_id: str` | Per-issue comparison table | Ruling detail page |
| `get_ruling` | `dispute_id: str` | Final ruling + dual-jurisdiction verdicts + reasoning | Ruling page |
| `get_my_disputes` | `wallet_address: str` | All disputes as party A or B | Dashboard |
| `get_dispute_status` | `dispute_id: str` | Status string | Polling |
| `get_appeal_status` | `appeal_id: str` | Appeal status + updated ruling if any | Appeal tracking |
| `get_recent_rulings` | `limit: int` | Recent public rulings | Landing page |
| `get_jurisdictions_supported` | — | List of supported jurisdiction frameworks | Jurisdictions page |

---

### Complete Frontend Flow Diagram

```
Party A visits /disputes/new
      |
[Fill: Contract description + Disputed provision]
[Select: Jurisdiction A]
[Fill: Legal arguments + Cite legal sources (URLs)]
[Enter: Party B address + Execution amount]
      |
[Sign register_dispute()] --> dispute_id
      |
Party B notified
      |
Party B visits /disputes/[id]/respond
      |
[Select: Jurisdiction B]
[Fill: Legal arguments + Cite legal sources]
      |
[Sign submit_counterparty_case()]
      |
AI fetches both parties' cited legal sources
      |
Comparative legal analysis:
- Jurisdiction A framework evaluation
- Jurisdiction B framework evaluation
- Agreement/conflict mapping
      |
Ruling generated
      |
[/disputes/[id]/ruling]
      |
[Jurisdiction comparison table renders]
[Green rows (agreement) / Red rows (conflict)]
[Dual-jurisdiction verdict displayed]
[Final ruling revealed]
      |
14-day appeal window
      |
      +-- Appeal filed? --> [Submit new legal authority]
      |          |                    |
      |          Yes           [AI re-evaluates]
      |                       [Updated ruling]
      |
Both parties respond to ruling
      |
Both accept?
   /        \
  Yes         No
  |               |
[Execute       [Ruling on record,
 resolution]    no automatic execution]
```

---

### How Users Use the Contract — Realistic User Journey

**TechCorp (US) disputes a software delivery contract with DevFirm (Nigeria). TechCorp claims breach of warranty; DevFirm claims full payment is owed.**

1. TechCorp registers the dispute: "Software delivery contract for ERP system. DevFirm delivered 60% of contracted features but claims 100% payment. Under UCC Article 2, partial delivery is a breach of contract unless substantial performance is demonstrated." Legal sources: UCC § 2-601, relevant US case law citations.
2. DevFirm responds (from Nigeria): "Under Nigerian contract law (Contracts Act Cap 59), substantial performance doctrine applies. We delivered core functionality. TechCorp has been using the system for 3 months without complaint, which constitutes acceptance." Legal sources: Nigerian Contracts Act provisions, local case law.
3. AI fetches both legal sources. Comparative analysis: Payment obligation on partial delivery — both jurisdictions agree that substantial performance triggers payment obligation (AGREE). Definition of substantial performance — jurisdictions differ on threshold (CONFLICT). Acceptance by use — both jurisdictions recognise this doctrine (AGREE).
4. Ruling: "Both jurisdictions agree on the substantial performance doctrine. The key factual question is whether DevFirm's 60% delivery meets that standard. Both jurisdictions agree that continued use without complaint constitutes acceptance of delivered work. TechCorp's 3-month use period is significant under both frameworks. RULING: TechCorp owes 60% of contract value (proportional to delivery). The acceptance doctrine limits any damage claim to the undelivered portion."
5. Both parties accept the ruling. 60% of the disputed amount is released to DevFirm. TechCorp's damage claim for the remaining 40% is preserved.



this is the contract address deployed on studionet: 0x0bD510323aF2Bc538868eab1178543D446b1cC28
