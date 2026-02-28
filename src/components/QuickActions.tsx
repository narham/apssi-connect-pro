import { UserPlus, ScanLine, ClipboardList, Radar } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { icon: UserPlus, label: "Register Player", desc: "KU-12 Registration", variant: "red" as const },
  { icon: ScanLine, label: "Verify ID", desc: "QR Scan & Verify", variant: "green" as const },
  { icon: ClipboardList, label: "Match Report", desc: "Submit Stats", variant: "red" as const },
  { icon: Radar, label: "Scout Mode", desc: "Talent Discovery", variant: "green" as const },
];

const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, i) => (
        <button
          key={action.label}
          className={cn(
            "glass-card-gradient rounded-lg p-4 text-left micro-hover animate-slide-up relative z-0"
          )}
          style={{ animationDelay: `${(i + 4) * 100}ms` }}
        >
          <div className="relative z-10">
            <div className={cn(
              "w-9 h-9 rounded-sm inner-shadow flex items-center justify-center mb-3",
              action.variant === "red" ? "bg-neon-red/10" : "bg-neon-green/10"
            )}>
              <action.icon className={cn("w-5 h-5", action.variant === "red" ? "text-neon-red" : "text-neon-green")} />
            </div>
            <div className="text-sm font-oswald font-bold text-foreground uppercase tracking-wide">{action.label}</div>
            <div className="text-[10px] font-montserrat font-medium text-muted-foreground mt-0.5">{action.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
