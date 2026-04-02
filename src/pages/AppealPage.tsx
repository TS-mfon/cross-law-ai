import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitAppeal } from "@/lib/hooks/useCrossBorder";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function AppealPage() {
  const { id } = useParams<{ id: string }>();
  const disputeId = id || "";
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useWallet();
  const appealMutation = useSubmitAppeal();

  const [newLegalAuthority, setNewLegalAuthority] = useState("");
  const [sources, setSources] = useState<string[]>([""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) { connectWallet(); return; }

    await appealMutation.mutateAsync({
      disputeId,
      newLegalAuthority,
      newSources: sources.filter(Boolean),
    });

    navigate(`/disputes/${disputeId}`);
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <Link to={`/disputes/${disputeId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dispute
      </Link>

      <h1 className="text-3xl font-bold font-display mb-2">File Appeal</h1>
      <p className="text-muted-foreground mb-8">
        Submit new legal authority for dispute <span className="font-mono">{disputeId}</span>.
        The AI will re-evaluate with the new evidence.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label>New Legal Authority</Label>
            <Textarea
              placeholder="Present new legal authority, precedents, or arguments not previously considered (max 2000 chars)..."
              maxLength={2000}
              value={newLegalAuthority}
              onChange={e => setNewLegalAuthority(e.target.value)}
              required
              rows={6}
            />
            <p className="text-xs text-muted-foreground">{newLegalAuthority.length}/2000</p>
          </div>

          <div className="space-y-2">
            <Label>Supporting Sources (URLs)</Label>
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

        <Button type="submit" className="w-full" size="lg" disabled={appealMutation.isPending}>
          {appealMutation.isPending ? "Submitting Appeal & Re-evaluating..." : "Submit Appeal"}
        </Button>
      </form>
    </div>
  );
}
