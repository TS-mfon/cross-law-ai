import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDispute, useComparativeAnalysis, useRuling, useAcceptRuling, useRejectRuling } from "@/lib/hooks/useCrossBorder";
import { useWallet, formatAddress } from "@/lib/genlayer/WalletProvider";
import { StatusBadge } from "@/components/cross-border/StatusBadge";
import { JurisdictionComparisonTable } from "@/components/cross-border/JurisdictionComparisonTable";
import { DualVerdictDisplay } from "@/components/cross-border/DualVerdictDisplay";
import { ArrowLeft, FileText, Gavel, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const disputeId = id || "";
  const { address } = useWallet();
  const { data: dispute, isLoading } = useDispute(disputeId);
  const { data: analysis } = useComparativeAnalysis(disputeId);
  const { data: ruling } = useRuling(disputeId);
  const acceptMutation = useAcceptRuling();
  const rejectMutation = useRejectRuling();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  if (isLoading) {
    return (
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto text-center">
        <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground mb-4">Dispute not found</p>
        <Link to="/disputes"><Button variant="outline">Back to Disputes</Button></Link>
      </div>
    );
  }

  const isParty = address?.toLowerCase() === dispute.party_a.toLowerCase() || address?.toLowerCase() === dispute.party_b.toLowerCase();
  const isPartyB = address?.toLowerCase() === dispute.party_b.toLowerCase();
  const canRespond = isPartyB && dispute.status === "OPEN";
  const hasRuling = dispute.status === "RULING_READY" || dispute.status === "EXECUTED" || dispute.status === "REJECTED";

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <Link to="/disputes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Disputes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold font-display">{disputeId}</h1>
            <StatusBadge status={dispute.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {dispute.jurisdiction_a}{dispute.jurisdiction_b ? ` vs ${dispute.jurisdiction_b}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {canRespond && (
            <Link to={`/disputes/${disputeId}/respond`}>
              <Button>Submit Response</Button>
            </Link>
          )}
          {hasRuling && (
            <Link to={`/disputes/${disputeId}/ruling`}>
              <Button variant="outline" className="gap-2"><Gavel className="h-4 w-4" /> View Ruling</Button>
            </Link>
          )}
          {hasRuling && isParty && dispute.status === "RULING_READY" && (
            <Link to={`/disputes/${disputeId}/appeal`}>
              <Button variant="outline">Appeal</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Dispute details */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold font-display mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Contract Details
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground">Description:</span>
              <p className="mt-1">{dispute.contract_description}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Disputed Provision:</span>
              <p className="mt-1">{dispute.disputed_provision}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Party A:</span>
                <p className="font-mono text-xs mt-1">{formatAddress(dispute.party_a, 20)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Party B:</span>
                <p className="font-mono text-xs mt-1">{formatAddress(dispute.party_b, 20)}</p>
              </div>
            </div>
            {dispute.execution_amount > 0 && (
              <div>
                <span className="text-muted-foreground">Execution Amount:</span>
                <p className="mt-1 font-mono">{dispute.execution_amount} wei</p>
              </div>
            )}
          </div>
        </Card>

        {/* Comparative Analysis */}
        {analysis && analysis.analysis_points?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold font-display mb-3">Comparative Legal Analysis</h2>
            <JurisdictionComparisonTable
              jurisdictionA={dispute.jurisdiction_a}
              jurisdictionB={dispute.jurisdiction_b}
              points={analysis.analysis_points}
            />
          </div>
        )}

        {/* Inline Ruling Summary */}
        {ruling && ruling.final_ruling && (
          <div>
            <h2 className="text-lg font-semibold font-display mb-3">Ruling Summary</h2>
            <DualVerdictDisplay
              ruling={ruling}
              jurisdictionA={dispute.jurisdiction_a}
              jurisdictionB={dispute.jurisdiction_b}
            />
          </div>
        )}

        {/* Accept/Reject */}
        {isParty && dispute.status === "RULING_READY" && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold font-display mb-4">Respond to Ruling</h2>
            <div className="flex gap-3">
              <Button
                onClick={() => acceptMutation.mutate(disputeId)}
                disabled={acceptMutation.isPending}
                className="gap-2"
              >
                {acceptMutation.isPending ? "Processing..." : "Accept Ruling"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReject(!showReject)}
              >
                Reject Ruling
              </Button>
            </div>
            {showReject && (
              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="Reason for rejection (max 1000 chars)..."
                  maxLength={1000}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
                <Button
                  variant="destructive"
                  onClick={() => rejectMutation.mutate({ disputeId, reason: rejectReason })}
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? "Processing..." : "Confirm Rejection"}
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
