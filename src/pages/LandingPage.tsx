import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRecentRulings } from "@/lib/hooks/useCrossBorder";
import { StatusBadge } from "@/components/cross-border/StatusBadge";
import { Scale, Globe, Zap, Shield, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Globe, title: "Multi-Jurisdiction", desc: "Evaluate disputes under multiple legal frameworks simultaneously" },
  { icon: Zap, title: "AI-Powered Analysis", desc: "Intelligent comparative legal analysis using GenLayer consensus" },
  { icon: Shield, title: "On-Chain Rulings", desc: "Transparent, immutable rulings stored on the blockchain" },
];

export default function LandingPage() {
  const { data: recentRulings } = useRecentRulings(5);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Scale className="h-4 w-4" />
            AI-Powered International Arbitration
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-6">
            Cross-Border <span className="text-gradient-hero">Settlement</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Resolve commercial contract disputes between parties from different legal jurisdictions.
            AI evaluates both legal frameworks and issues equitable rulings — in minutes, not years.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/disputes/new">
              <Button size="lg" className="gap-2">
                Register a Dispute <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/disputes">
              <Button variant="outline" size="lg">View Disputes</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6 hover:shadow-lg transition-shadow animate-slide-up">
                <f.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-bold font-display mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold font-display text-center mb-12">How It Works</h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Register Dispute", desc: "Party A submits the contract details, disputed provision, and legal arguments from their jurisdiction." },
              { step: "2", title: "Counterparty Responds", desc: "Party B submits their jurisdiction's legal arguments and relevant precedents." },
              { step: "3", title: "AI Comparative Analysis", desc: "The Intelligent Contract fetches cited sources, analyzes both frameworks, and maps areas of agreement and conflict." },
              { step: "4", title: "Ruling Issued", desc: "A ruling is generated showing verdicts under each jurisdiction and a final equitable ruling." },
              { step: "5", title: "Accept or Appeal", desc: "Both parties can accept the ruling for execution or appeal with new legal authority within 14 days." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold font-display">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Rulings */}
      {recentRulings && recentRulings.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-display text-center mb-8">Recent Cases</h2>
            <div className="space-y-3">
              {recentRulings.map((r) => (
                <Link key={r.dispute_id} to={`/disputes/${r.dispute_id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-medium">{r.dispute_id}</span>
                      {r.ruling?.final_ruling?.winner && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Final: {r.ruling.final_ruling.winner === "party_a" ? "Party A" : r.ruling.final_ruling.winner === "party_b" ? "Party B" : "Split"} prevails
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold">
            <Scale className="h-5 w-5 text-primary" />
            CrossBorder Settlement
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by GenLayer Intelligent Contracts
          </p>
        </div>
      </footer>
    </div>
  );
}
