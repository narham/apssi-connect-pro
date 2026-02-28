import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  variant?: "red" | "green";
  delay?: number;
}

const MetricCard = ({ icon: Icon, label, value, change, variant = "red", delay = 0 }: MetricCardProps) => {
  return (
    <div
      className={cn(
        "glass-card-gradient rounded-lg p-4 micro-hover animate-slide-up",
        "relative z-0"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <Icon
            className={cn(
              "w-5 h-5",
              variant === "red" ? "text-neon-red" : "text-neon-green"
            )}
          />
          {change && (
            <span className={cn(
              "text-[10px] font-montserrat font-bold",
              change.startsWith("+") ? "text-neon-green" : "text-neon-red"
            )}>
              {change}
            </span>
          )}
        </div>
        <div className="text-2xl font-oswald font-bold text-foreground leading-none">{value}</div>
        <div className="text-[10px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider mt-1.5">
          {label}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
