import { DISPUTE_STATUSES } from "@/lib/contracts/types";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const config = DISPUTE_STATUSES[status] || { label: status, color: "secondary" };

  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    primary: "default",
    success: "default",
    warning: "secondary",
    destructive: "destructive",
    secondary: "secondary",
  };

  return (
    <Badge variant={variantMap[config.color] || "secondary"} className={
      config.color === "success" ? "bg-success text-success-foreground" :
      config.color === "warning" ? "bg-warning text-warning-foreground" : ""
    }>
      {config.label}
    </Badge>
  );
}
