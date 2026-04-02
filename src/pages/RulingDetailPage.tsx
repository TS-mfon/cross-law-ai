import { useParams, Link } from "react-router-dom";
import { useDispute, useComparativeAnalysis, useRuling } from "@/lib/hooks/useCrossBorder";
import { JurisdictionComparisonTable } from "@/components/cross-border/JurisdictionComparisonTable";
import { DualVerdictDisplay } from "@/components/cross-border/DualVerdictDisplay";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RulingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const disputeId = id || "";
  const { data: dispute, isLoading: loadingDispute } = useDispute(disputeId);
  const { data: analysis } = useComparativeAnalysis(disputeId);
  const { data: ruling, isLoading: loadingRuling } = useRuling(disputeId);

  if (loadingDispute || loadingRuling) {
    return (
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!dispute || !ruling?.final_ruling) {
    return (
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto text-center">
        <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground mb-4">Ruling not available yet</p>
        <Link to={`/disputes/${disputeId}`}><Button variant="outline">Back to Dispute</Button></Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <Link to={`/disputes/${disputeId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dispute
      </Link>

      <h1 className="text-3xl font-bold font-display mb-2">Ruling — {disputeId}</h1>
      <p className="text-muted-foreground mb-8">
        {dispute.jurisdiction_a} vs {dispute.jurisdiction_b}
      </p>

      <div className="space-y-8">
        {/* Comparison table */}
        {analysis && analysis.analysis_points?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold font-display mb-4">Comparative Legal Analysis</h2>
            <JurisdictionComparisonTable
              jurisdictionA={dispute.jurisdiction_a}
              jurisdictionB={dispute.jurisdiction_b}
              points={analysis.analysis_points}
            />
          </div>
        )}

        {/* Verdicts */}
        <div>
          <h2 className="text-xl font-semibold font-display mb-4">Dual-Jurisdiction Verdict</h2>
          <DualVerdictDisplay
            ruling={ruling}
            jurisdictionA={dispute.jurisdiction_a}
            jurisdictionB={dispute.jurisdiction_b}
          />
        </div>
      </div>
    </div>
  );
}
