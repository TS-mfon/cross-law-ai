import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import CrossBorderSettlement from "../contracts/CrossBorderSettlement";
import { useWallet } from "../genlayer/WalletProvider";
import { toast } from "sonner";

function useContract() {
  const { address } = useWallet();
  return useMemo(() => new CrossBorderSettlement(address), [address]);
}

export function useMyDisputes() {
  const contract = useContract();
  const { address } = useWallet();
  return useQuery({
    queryKey: ["myDisputes", address],
    queryFn: () => contract.getMyDisputes(address!),
    enabled: !!address,
    staleTime: 5000,
  });
}

export function useDispute(disputeId: string) {
  const contract = useContract();
  return useQuery({
    queryKey: ["dispute", disputeId],
    queryFn: () => contract.getDispute(disputeId),
    enabled: !!disputeId,
  });
}

export function useComparativeAnalysis(disputeId: string) {
  const contract = useContract();
  return useQuery({
    queryKey: ["analysis", disputeId],
    queryFn: () => contract.getComparativeAnalysis(disputeId),
    enabled: !!disputeId,
  });
}

export function useRuling(disputeId: string) {
  const contract = useContract();
  return useQuery({
    queryKey: ["ruling", disputeId],
    queryFn: () => contract.getRuling(disputeId),
    enabled: !!disputeId,
  });
}

export function useRecentRulings(limit = 5) {
  const contract = useContract();
  return useQuery({
    queryKey: ["recentRulings", limit],
    queryFn: () => contract.getRecentRulings(limit),
    staleTime: 10000,
  });
}

export function useJurisdictions() {
  const contract = useContract();
  return useQuery({
    queryKey: ["jurisdictions"],
    queryFn: () => contract.getJurisdictionsSupported(),
    staleTime: 60000,
  });
}

export function useAppealStatus(appealId: string) {
  const contract = useContract();
  return useQuery({
    queryKey: ["appeal", appealId],
    queryFn: () => contract.getAppealStatus(appealId),
    enabled: !!appealId,
  });
}

export function useRegisterDispute() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      contractDescription: string;
      disputedProvision: string;
      jurisdictionA: string;
      legalArgumentsA: string;
      legalSourcesA: string[];
      partyBAddress: string;
      executionAmount: number;
    }) => contract.registerDispute(
      args.contractDescription, args.disputedProvision, args.jurisdictionA,
      args.legalArgumentsA, args.legalSourcesA, args.partyBAddress, args.executionAmount,
    ),
    onSuccess: () => {
      toast.success("Dispute registered successfully");
      queryClient.invalidateQueries({ queryKey: ["myDisputes"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to register dispute"),
  });
}

export function useSubmitCounterpartyCase() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      disputeId: string;
      jurisdictionB: string;
      legalArgumentsB: string;
      legalSourcesB: string[];
    }) => contract.submitCounterpartyCase(args.disputeId, args.jurisdictionB, args.legalArgumentsB, args.legalSourcesB),
    onSuccess: (_, vars) => {
      toast.success("Case submitted — AI analysis in progress");
      queryClient.invalidateQueries({ queryKey: ["dispute", vars.disputeId] });
      queryClient.invalidateQueries({ queryKey: ["myDisputes"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to submit case"),
  });
}

export function useSubmitAppeal() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { disputeId: string; newLegalAuthority: string; newSources: string[] }) =>
      contract.submitAppeal(args.disputeId, args.newLegalAuthority, args.newSources),
    onSuccess: (_, vars) => {
      toast.success("Appeal submitted — AI re-evaluating");
      queryClient.invalidateQueries({ queryKey: ["dispute", vars.disputeId] });
      queryClient.invalidateQueries({ queryKey: ["ruling", vars.disputeId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to submit appeal"),
  });
}

export function useAcceptRuling() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (disputeId: string) => contract.acceptRuling(disputeId),
    onSuccess: (_, disputeId) => {
      toast.success("Ruling accepted");
      queryClient.invalidateQueries({ queryKey: ["dispute", disputeId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to accept ruling"),
  });
}

export function useRejectRuling() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { disputeId: string; reason: string }) => contract.rejectRuling(args.disputeId, args.reason),
    onSuccess: (_, vars) => {
      toast.success("Ruling rejected");
      queryClient.invalidateQueries({ queryKey: ["dispute", vars.disputeId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to reject ruling"),
  });
}
