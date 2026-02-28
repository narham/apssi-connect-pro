import { UserPlus, ScanLine, ClipboardList, Radar } from "lucide-react";

const actions = [
  { icon: UserPlus, label: "Register Player", desc: "KU-12 Registration", color: "neon-red" as const },
  { icon: ScanLine, label: "Verify ID", desc: "QR Scan & Verify", color: "neon-green" as const },
  { icon: ClipboardList, label: "Match Report", desc: "Submit Stats", color: "neon-red" as const },
  { icon: Radar, label: "Scout Mode", desc: "Talent Discovery", color: "neon-green" as const },
];

const QuickActions = () => {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-widest">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <button
            key={action.label}
            className={`glass-card rounded-lg p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-slide-up ${
              action.color === "neon-red" ? "hover:neon-border-red" : "hover:neon-border-green"
            }`}
            style={{ animationDelay: `${(i + 4) * 100}ms` }}
          >
            <action.icon className={`w-6 h-6 mb-2 ${action.color === "neon-red" ? "text-neon-red" : "text-neon-green"}`} />
            <div className="text-sm font-oswald font-bold text-foreground uppercase">{action.label}</div>
            <div className="text-[10px] font-montserrat text-muted-foreground mt-0.5">{action.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
