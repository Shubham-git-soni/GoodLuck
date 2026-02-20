import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("container mx-auto p-4 md:p-6 pb-20 md:pb-6", className)}>
      {children}
    </div>
  );
}
