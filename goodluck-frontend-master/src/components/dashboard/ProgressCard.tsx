import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
  description?: string;
  className?: string; 
}

export default function ProgressCard({
  title,
  current,
  total,
  unit = "",
  description,
  className,
}: ProgressCardProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">{current.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground ml-1">/ {total.toLocaleString()}</span>
            {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
          </div>
          <span className="text-sm font-medium">{percentage}%</span>
        </div>

        <Progress value={percentage} className="h-2" />

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
