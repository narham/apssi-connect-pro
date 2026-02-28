import { cn } from "@/lib/utils";

type StatusType = "live" | "completed" | "upcoming" | "verified" | "pending" | "rejected";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  live: {
    label: "LIVE",
    dotClass: "bg-neon-red animate-pulse-neon",
    bgClass: "bg-neon-red/15 border-neon-red/30",
    textClass: "text-neon-red",
  },
  completed: {
    label: "FT",
    dotClass: "bg-muted-foreground",
    bgClass: "bg-secondary border-border",
    textClass: "text-muted-foreground",
  },
  upcoming: {
    label: "UPCOMING",
    dotClass: "bg-foreground",
    bgClass: "bg-secondary border-border",
    textClass: "text-foreground",
  },
  verified: {
    label: "VERIFIED",
    dotClass: "bg-neon-green animate-glow-pulse",
    bgClass: "bg-neon-green/15 border-neon-green/30",
    textClass: "text-neon-green",
  },
  pending: {
    label: "PENDING",
    dotClass: "bg-yellow-500",
    bgClass: "bg-yellow-500/10 border-yellow-500/20",
    textClass: "text-yellow-400",
  },
  rejected: {
    label: "REJECTED",
    dotClass: "bg-neon-red",
    bgClass: "bg-neon-red/10 border-neon-red/20",
    textClass: "text-neon-red",
  },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-montserrat text-[9px] font-bold uppercase tracking-widest",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
