import type { Ruling } from "@/lib/contracts/types";
import { Card } from "@/components/ui/card";
import { Gavel, ArrowRight } from "lucide-react";

interface Props {
  ruling: Ruling;
  jurisdictionA: string;
  jurisdictionB: string;
}

export function DualVerdictDisplay({ ruling, jurisdictionA, jurisdictionB }: Props) {
  if (!ruling?.final_ruling) return null;

  const winnerColor = (winner: string) => {
    if (winner === "party_a") return "text-primary";
    if (winner === "party_b") return "text-destructive";
    return "text-warning";
  };

  const winnerLabel = (winner: string) => {
    if (winner === "party_a") return "Party A";
    if (winner === "party_b") return "Party B";
    return "Split Decision";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-l-4 border-l-primary">
          <p className="text-xs font-medium text-muted-foreground mb-1">Under {jurisdictionA}'s Law</p>
          <p className={`text-lg font-bold font-display ${winnerColor(ruling.ruling_under_a?.winner || "")}`}>
            {winnerLabel(ruling.ruling_under_a?.winner || "")} prevails
          </p>
          <p className="text-sm text-muted-foreground mt-2">{ruling.ruling_under_a?.summary}</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-destructive">
          <p className="text-xs font-medium text-muted-foreground mb-1">Under {jurisdictionB}'s Law</p>
          <p className={`text-lg font-bold font-display ${winnerColor(ruling.ruling_under_b?.winner || "")}`}>
            {winnerLabel(ruling.ruling_under_b?.winner || "")} prevails
          </p>
          <p className="text-sm text-muted-foreground mt-2">{ruling.ruling_under_b?.summary}</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-hero text-primary-foreground">
        <div className="flex items-center gap-2 mb-3">
          <Gavel className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Final Ruling</span>
        </div>
        <p className="text-2xl font-bold font-display mb-3">
          {winnerLabel(ruling.final_ruling.winner)} prevails
        </p>
        <p className="text-sm opacity-90 leading-relaxed">{ruling.final_ruling.reasoning}</p>
      </Card>
    </div>
  );
}
