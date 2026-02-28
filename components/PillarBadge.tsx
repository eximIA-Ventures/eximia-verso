import { PillarIcon } from "./PillarIcon";
import { getPillarById } from "@/lib/pillars-config";

const COLOR_MAP: Record<string, string> = {
  accent: "bg-accent/10 text-accent",
  "accent-alt": "bg-accent-alt/10 text-accent-alt",
  amber: "bg-amber-600/10 text-amber-600",
  green: "bg-emerald-600/10 text-emerald-600",
};

export function PillarBadge({ pillar }: { pillar: string }) {
  const pillarData = getPillarById(pillar);
  const colorClass = pillarData
    ? COLOR_MAP[pillarData.color] ?? "bg-elevated text-muted"
    : "bg-elevated text-muted";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {pillarData && <PillarIcon icon={pillarData.icon} size={12} />}
      {pillarData?.name ?? pillar}
    </span>
  );
}
