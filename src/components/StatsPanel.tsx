import { Users, Trophy, Shield, Eye } from "lucide-react";

const stats = [
  { icon: Users, label: "Registered Players", value: "2,847", accent: "neon-red" as const },
  { icon: Shield, label: "Active Teams", value: "186", accent: "neon-green" as const },
  { icon: Trophy, label: "Matches Played", value: "412", accent: "neon-red" as const },
  { icon: Eye, label: "Scouts Active", value: "34", accent: "neon-green" as const },
];

const StatsPanel = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="glass-card rounded-lg p-4 animate-slide-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <stat.icon className={`w-5 h-5 mb-2 ${stat.accent === "neon-red" ? "text-neon-red" : "text-neon-green"}`} />
          <div className="text-2xl font-oswald font-bold text-foreground">{stat.value}</div>
          <div className="text-[10px] font-montserrat text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;
