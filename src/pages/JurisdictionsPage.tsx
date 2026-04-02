import { useJurisdictions } from "@/lib/hooks/useCrossBorder";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";

const FLAGS: Record<string, string> = {
  "United States (Common Law)": "🇺🇸",
  "United Kingdom": "🇬🇧",
  "European Union (Civil Law)": "🇪🇺",
  "Nigeria": "🇳🇬",
  "Singapore": "🇸🇬",
  "UAE (DIFC)": "🇦🇪",
  "India": "🇮🇳",
  "China": "🇨🇳",
  "Brazil": "🇧🇷",
  "Switzerland": "🇨🇭",
  "Cayman Islands": "🇰🇾",
  "BVI": "🇻🇬",
};

export default function JurisdictionsPage() {
  const { data: jurisdictions, isLoading } = useJurisdictions();

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Globe className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold font-display mb-2">Supported Jurisdictions</h1>
        <p className="text-muted-foreground">Legal frameworks the AI can evaluate for cross-border dispute resolution.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="p-5 animate-pulse"><div className="h-6 bg-muted rounded w-2/3" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(jurisdictions || []).map((j) => (
            <Card key={j} className="p-5 hover:shadow-md transition-shadow flex items-center gap-3">
              <span className="text-2xl">{FLAGS[j] || "🏛"}</span>
              <span className="font-medium text-sm">{j}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
