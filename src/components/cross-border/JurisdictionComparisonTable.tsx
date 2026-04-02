import type { LegalPoint } from "@/lib/contracts/types";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Props {
  jurisdictionA: string;
  jurisdictionB: string;
  points: LegalPoint[];
}

export function JurisdictionComparisonTable({ jurisdictionA, jurisdictionB, points }: Props) {
  if (!points?.length) {
    return <p className="text-muted-foreground text-sm">No analysis points available yet.</p>;
  }

  const icon = (agreement: string) => {
    if (agreement === "agree") return <CheckCircle className="h-4 w-4 text-success" />;
    if (agreement === "conflict") return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  };

  const label = (agreement: string) => {
    if (agreement === "agree") return "Agree";
    if (agreement === "conflict") return "Conflict";
    return "Partial";
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold">Legal Issue</th>
              <th className="px-4 py-3 text-left font-semibold">🏛 {jurisdictionA}</th>
              <th className="px-4 py-3 text-center font-semibold">Agreement</th>
              <th className="px-4 py-3 text-left font-semibold">🏛 {jurisdictionB}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point, i) => (
              <tr
                key={i}
                className={`border-t ${
                  point.agreement === "agree" ? "bg-agree" :
                  point.agreement === "conflict" ? "bg-conflict" : "bg-partial"
                }`}
              >
                <td className="px-4 py-3 font-medium">{point.issue}</td>
                <td className="px-4 py-3">{point.jurisdiction_a}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1.5">
                    {icon(point.agreement)}
                    <span className="text-xs font-medium">{label(point.agreement)}</span>
                  </span>
                </td>
                <td className="px-4 py-3">{point.jurisdiction_b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
