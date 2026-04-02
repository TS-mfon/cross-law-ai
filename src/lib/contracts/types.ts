export interface Dispute {
  dispute_id: string;
  party_a: string;
  party_b: string;
  contract_description: string;
  disputed_provision: string;
  jurisdiction_a: string;
  jurisdiction_b: string;
  status: string;
  execution_amount: number;
}

export interface LegalPoint {
  issue: string;
  jurisdiction_a: string;
  jurisdiction_b: string;
  agreement: "agree" | "conflict" | "partial";
}

export interface ComparativeAnalysis {
  analysis_points: LegalPoint[];
}

export interface JurisdictionRuling {
  winner: string;
  summary: string;
}

export interface Ruling {
  ruling_under_a: JurisdictionRuling;
  ruling_under_b: JurisdictionRuling;
  final_ruling: {
    winner: string;
    reasoning: string;
  };
}

export interface RecentRuling {
  dispute_id: string;
  ruling: Ruling;
}

export interface AppealStatus {
  appeal_id: string;
  payload: {
    dispute_id: string;
    new_legal_authority: string;
    new_sources: string[];
  };
  updated_ruling: Ruling;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  [key: string]: any;
}

export const DISPUTE_STATUSES: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Awaiting Response", color: "warning" },
  ANALYZING: { label: "AI Analyzing", color: "primary" },
  RULING_READY: { label: "Ruling Ready", color: "success" },
  EXECUTED: { label: "Executed", color: "success" },
  REJECTED: { label: "Rejected", color: "destructive" },
};
