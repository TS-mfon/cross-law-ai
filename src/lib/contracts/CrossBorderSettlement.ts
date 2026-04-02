import { createGenLayerClient, CONTRACT_ADDRESS } from "../genlayer/client";
import type { Dispute, ComparativeAnalysis, Ruling, RecentRuling, AppealStatus, TransactionReceipt } from "./types";

class CrossBorderSettlement {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createGenLayerClient>;

  constructor(address?: string | null) {
    this.contractAddress = CONTRACT_ADDRESS as `0x${string}`;
    this.client = createGenLayerClient(address || undefined);
  }

  updateAccount(address: string): void {
    this.client = createGenLayerClient(address);
  }

  // --- Read methods ---

  async getDispute(disputeId: string): Promise<Dispute | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_dispute",
        args: [disputeId],
      });
      return this._mapToDispute(result);
    } catch (e) {
      console.error("Error fetching dispute:", e);
      return null;
    }
  }

  async getComparativeAnalysis(disputeId: string): Promise<ComparativeAnalysis> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_comparative_analysis",
        args: [disputeId],
      });
      return this._mapToObject(result) as ComparativeAnalysis;
    } catch (e) {
      console.error("Error fetching analysis:", e);
      return { analysis_points: [] };
    }
  }

  async getRuling(disputeId: string): Promise<Ruling | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_ruling",
        args: [disputeId],
      });
      return this._mapToObject(result) as Ruling;
    } catch (e) {
      console.error("Error fetching ruling:", e);
      return null;
    }
  }

  async getMyDisputes(walletAddress: string): Promise<Dispute[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_my_disputes",
        args: [walletAddress],
      });
      return this._mapToArray(result).map((d: any) => this._mapToDispute(d)!).filter(Boolean);
    } catch (e) {
      console.error("Error fetching disputes:", e);
      return [];
    }
  }

  async getDisputeStatus(disputeId: string): Promise<string> {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_dispute_status",
        args: [disputeId],
      });
      return String(result || "");
    } catch {
      return "";
    }
  }

  async getAppealStatus(appealId: string): Promise<AppealStatus | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_appeal_status",
        args: [appealId],
      });
      return this._mapToObject(result) as AppealStatus;
    } catch {
      return null;
    }
  }

  async getRecentRulings(limit: number = 10): Promise<RecentRuling[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_recent_rulings",
        args: [limit],
      });
      return this._mapToArray(result).map((r: any) => this._mapToObject(r) as RecentRuling);
    } catch (e) {
      console.error("Error fetching recent rulings:", e);
      return [];
    }
  }

  async getJurisdictionsSupported(): Promise<string[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_jurisdictions_supported",
        args: [],
      });
      if (Array.isArray(result)) return result.map(String);
      return [];
    } catch {
      return [];
    }
  }

  // --- Write methods ---

  async registerDispute(
    contractDescription: string,
    disputedProvision: string,
    jurisdictionA: string,
    legalArgumentsA: string,
    legalSourcesA: string[],
    partyBAddress: string,
    executionAmount: number,
  ): Promise<string> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "register_dispute",
      args: [contractDescription, disputedProvision, jurisdictionA, legalArgumentsA, legalSourcesA, partyBAddress, executionAmount],
      value: BigInt(0),
    });
    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash, status: "ACCEPTED" as any, retries: 30, interval: 5000,
    });
    return String((receipt as any)?.result || txHash);
  }

  async submitCounterpartyCase(
    disputeId: string,
    jurisdictionB: string,
    legalArgumentsB: string,
    legalSourcesB: string[],
  ): Promise<string> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "submit_counterparty_case",
      args: [disputeId, jurisdictionB, legalArgumentsB, legalSourcesB],
      value: BigInt(0),
    });
    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash, status: "ACCEPTED" as any, retries: 60, interval: 5000,
    });
    return String((receipt as any)?.result || txHash);
  }

  async submitAppeal(disputeId: string, newLegalAuthority: string, newSources: string[]): Promise<string> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "submit_appeal",
      args: [disputeId, newLegalAuthority, newSources],
      value: BigInt(0),
    });
    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash, status: "ACCEPTED" as any, retries: 60, interval: 5000,
    });
    return String((receipt as any)?.result || txHash);
  }

  async acceptRuling(disputeId: string): Promise<boolean> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "accept_ruling",
      args: [disputeId],
      value: BigInt(0),
    });
    await this.client.waitForTransactionReceipt({
      hash: txHash, status: "ACCEPTED" as any, retries: 24, interval: 5000,
    });
    return true;
  }

  async rejectRuling(disputeId: string, reason: string): Promise<boolean> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "reject_ruling",
      args: [disputeId, reason],
      value: BigInt(0),
    });
    await this.client.waitForTransactionReceipt({
      hash: txHash, status: "ACCEPTED" as any, retries: 24, interval: 5000,
    });
    return true;
  }

  // --- Helpers ---

  private _mapToObject(data: any): any {
    if (data instanceof Map) {
      const obj: any = {};
      data.forEach((value: any, key: any) => {
        obj[key] = this._mapToObject(value);
      });
      return obj;
    }
    if (Array.isArray(data)) return data.map((item: any) => this._mapToObject(item));
    return data;
  }

  private _mapToArray(data: any): any[] {
    if (Array.isArray(data)) return data.map((item: any) => this._mapToObject(item));
    if (data instanceof Map) return Array.from(data.values()).map((item: any) => this._mapToObject(item));
    return [];
  }

  private _mapToDispute(data: any): Dispute | null {
    if (!data) return null;
    const obj = this._mapToObject(data);
    if (!obj.dispute_id && !obj.party_a) return null;
    return {
      dispute_id: obj.dispute_id || "",
      party_a: obj.party_a || "",
      party_b: obj.party_b || "",
      contract_description: obj.contract_description || "",
      disputed_provision: obj.disputed_provision || "",
      jurisdiction_a: obj.jurisdiction_a || "",
      jurisdiction_b: obj.jurisdiction_b || "",
      status: obj.status || "",
      execution_amount: Number(obj.execution_amount || 0),
    };
  }
}

export default CrossBorderSettlement;
