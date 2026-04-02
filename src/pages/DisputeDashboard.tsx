import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyDisputes } from "@/lib/hooks/useCrossBorder";
import { useWallet, formatAddress } from "@/lib/genlayer/WalletProvider";
import { StatusBadge } from "@/components/cross-border/StatusBadge";
import { Plus, ArrowRight, Scale } from "lucide-react";

export default function DisputeDashboard() {
  const { isConnected, connectWallet } = useWallet();
  const { data: disputes, isLoading } = useMyDisputes();

  if (!isConnected) {
    return (
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto text-center">
        <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold font-display mb-4">Your Disputes</h1>
        <p className="text-muted-foreground mb-6">Connect your wallet to view your disputes.</p>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Your Disputes</h1>
          <p className="text-sm text-muted-foreground mt-1">Active and resolved cases</p>
        </div>
        <Link to="/disputes/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> New Dispute</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : !disputes?.length ? (
        <Card className="p-12 text-center">
          <Scale className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No disputes found</p>
          <Link to="/disputes/new">
            <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Register First Dispute</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <Link key={d.dispute_id} to={`/disputes/${d.dispute_id}`}>
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold">{d.dispute_id}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {d.contract_description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {d.jurisdiction_a && <span>🏛 {d.jurisdiction_a}</span>}
                      {d.jurisdiction_b && (
                        <>
                          <span>vs</span>
                          <span>🏛 {d.jurisdiction_b}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
