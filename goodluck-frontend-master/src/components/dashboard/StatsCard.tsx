import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

// Cycle through gradient styles for visual variety
const gradients = [
  "gradient-card-orange",
  "gradient-card-amber",
  "gradient-card-neutral",
  "gradient-card-orange",
];

const iconBgs = [
  "bg-primary/10",
  "bg-amber-100 dark:bg-amber-900/30",
  "bg-muted",
  "bg-primary/10",
];

const iconColors = [
  "text-primary",
  "text-amber-600 dark:text-amber-400",
  "text-muted-foreground",
  "text-primary",
];

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  // Use a stable index based on title string so it's consistent across renders
  const idx = Math.abs(title.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % gradients.length;
  const gradient = gradients[idx];
  const iconBg = iconBgs[idx];
  const iconColor = iconColors[idx];

  return (
    <div className={cn("rounded-xl border-0 shadow-sm p-4", gradient, className)}>
      <div className="flex items-center justify-between mb-3">
        {Icon && (
          <div className={cn("p-1.5 rounded-lg", iconBg)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        )}
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            trend.isPositive
              ? "text-primary bg-primary/10"
              : "text-destructive bg-destructive/10"
          )}>
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
      {description && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      )}
    </div>
  );
}
