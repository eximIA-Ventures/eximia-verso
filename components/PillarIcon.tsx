import {
  Brain,
  BarChart3,
  Zap,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  brain: Brain,
  "bar-chart-3": BarChart3,
  zap: Zap,
  "trending-up": TrendingUp,
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
