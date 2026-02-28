import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("container mx-auto px-4 pt-5 pb-24 md:px-6 md:pb-6", className)}>
      {children}
    </div>
  );
}
