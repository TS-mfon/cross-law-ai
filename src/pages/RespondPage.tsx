import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JurisdictionSelector } from "@/components/cross-border/JurisdictionSelector";
import { useSubmitCounterpartyCase } from "@/lib/hooks/useCrossBorder";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function RespondPage() {
  const { id } = useParams<{ id: string }>();
  const disputeId = id || "";
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useWallet();
  const submitMutation = useSubmitCounterpartyCase();

  const [jurisdictionB, setJurisdictionB] = useState("");
  const [legalArgumentsB, setLegalArgumentsB] = useState("");
  const [sources, setSources] = useState<string[]>([""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) { connectWallet(); return; }

    await submitMutation.mutateAsync({
      disputeId,
      jurisdictionB,
      legalArgumentsB,
      legalSourcesB: sources.filter(Boolean),
    });

    navigate(`/disputes/${disputeId}`);
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <Link to={`/disputes/${disputeId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dispute
      </Link>

      <h1 className="text-3xl font-bold font-display mb-2">Submit Counterparty Case</h1>
      <p className="text-muted-foreground mb-8">Respond as Party B with your jurisdiction's legal framework for dispute <span className="font-mono">{disputeId}</span>.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <JurisdictionSelector label="Your Jurisdiction" value={jurisdictionB} onChange={setJurisdictionB} />

          <div className="space-y-1.5">
            <Label>Legal Arguments</Label>
            <Textarea
              placeholder="Present your legal arguments with references to applicable law (max 3000 chars)..."
              maxLength={3000}
              value={legalArgumentsB}
              onChange={e => setLegalArgumentsB(e.target.value)}
              required
              rows={6}
            />
            <p className="text-xs text-muted-foreground">{legalArgumentsB.length}/3000</p>
          </div>

          <div className="space-y-2">
            <Label>Legal Sources (URLs)</Label>
            {sources.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={s}
                  onChange={e => {
                    const n = [...sources];
                    n[i] = e.target.value;
                    setSources(n);
                  }}
                />
                {sources.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSources(sources.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setSources([...sources, ""])} className="gap-1">
              <Plus className="h-3 w-3" /> Add Source
            </Button>
          </div>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={submitMutation.isPending}>
          {submitMutation.isPending ? "Submitting & Analyzing (this may take a while)..." : "Submit Case"}
        </Button>
      </form>
    </div>
  );
}
