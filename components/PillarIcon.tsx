import {
  Brain,
  BarChart3,
  Zap,
  Wheat,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  brain: Brain,
  "bar-chart-3": BarChart3,
  zap: Zap,
  wheat: Wheat,
};

interface PillarIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export function PillarIcon({ icon, size = 20, className }: PillarIconProps) {
  const Icon = ICON_MAP[icon];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
