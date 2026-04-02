import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { JurisdictionSelector } from "@/components/cross-border/JurisdictionSelector";
import { useRegisterDispute } from "@/lib/hooks/useCrossBorder";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegisterDisputePage() {
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useWallet();
  const registerMutation = useRegisterDispute();

  const [form, setForm] = useState({
    contractDescription: "",
    disputedProvision: "",
    jurisdictionA: "",
    legalArgumentsA: "",
    partyBAddress: "",
    executionAmount: "",
  });
  const [sources, setSources] = useState<string[]>([""]);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) { connectWallet(); return; }

    const result = await registerMutation.mutateAsync({
      contractDescription: form.contractDescription,
      disputedProvision: form.disputedProvision,
      jurisdictionA: form.jurisdictionA,
      legalArgumentsA: form.legalArgumentsA,
      legalSourcesA: sources.filter(Boolean),
      partyBAddress: form.partyBAddress,
      executionAmount: parseInt(form.executionAmount) || 0,
    });

    navigate("/disputes");
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <Link to="/disputes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Disputes
      </Link>

      <h1 className="text-3xl font-bold font-display mb-2">Register New Dispute</h1>
      <p className="text-muted-foreground mb-8">Submit your case as Party A to begin the cross-border arbitration process.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold font-display">Contract Details</h2>

          <div className="space-y-1.5">
            <Label>Contract Description</Label>
            <Textarea
              placeholder="Describe the contract in dispute (max 2000 chars)..."
              maxLength={2000}
              value={form.contractDescription}
              onChange={e => update("contractDescription", e.target.value)}
              required
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{form.contractDescription.length}/2000</p>
          </div>

          <div className="space-y-1.5">
            <Label>Disputed Provision</Label>
            <Textarea
              placeholder="Which specific provision or event is in dispute?"
              maxLength={1000}
              value={form.disputedProvision}
              onChange={e => update("disputedProvision", e.target.value)}
              required
              rows={3}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold font-display">Your Legal Case</h2>

          <JurisdictionSelector
            label="Your Jurisdiction"
            value={form.jurisdictionA}
            onChange={v => update("jurisdictionA", v)}
          />

          <div className="space-y-1.5">
            <Label>Legal Arguments</Label>
            <Textarea
              placeholder="Present your legal arguments with references to applicable law (max 3000 chars)..."
              maxLength={3000}
              value={form.legalArgumentsA}
              onChange={e => update("legalArgumentsA", e.target.value)}
              required
              rows={5}
            />
            <p className="text-xs text-muted-foreground">{form.legalArgumentsA.length}/3000</p>
          </div>

          <div className="space-y-2">
            <Label>Legal Sources (URLs)</Label>
            {sources.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={s}
                  onChange={e => {
                    const newSources = [...sources];
                    newSources[i] = e.target.value;
                    setSources(newSources);
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

        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold font-display">Counterparty & Terms</h2>

          <div className="space-y-1.5">
            <Label>Party B Wallet Address</Label>
            <Input
              placeholder="0x..."
              value={form.partyBAddress}
              onChange={e => update("partyBAddress", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Execution Amount (in wei)</Label>
            <Input
              type="number"
              placeholder="0"
              value={form.executionAmount}
              onChange={e => update("executionAmount", e.target.value)}
            />
          </div>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Submitting to GenLayer..." : isConnected ? "Register Dispute" : "Connect Wallet to Submit"}
        </Button>
      </form>
    </div>
  );
}
