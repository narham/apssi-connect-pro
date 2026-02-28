import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardPanelProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

const DashboardPanel = ({ title, children, action, className }: DashboardPanelProps) => {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 gradient-line-vertical rounded-full" />
          <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
            {title}
          </h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
};

export default DashboardPanel;
