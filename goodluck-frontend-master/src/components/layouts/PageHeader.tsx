import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight leading-tight md:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2 shrink-0 mt-0.5">{action}</div>
        )}
      </div>
    </div>
  );
}
