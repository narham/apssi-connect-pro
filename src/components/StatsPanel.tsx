import { Users, Trophy, Shield, Eye } from "lucide-react";
import MetricCard from "./MetricCard";

const stats = [
  { icon: Users, label: "Registered Players", value: "2,847", change: "+128", variant: "red" as const },
  { icon: Shield, label: "Active Teams", value: "186", change: "+12", variant: "green" as const },
  { icon: Trophy, label: "Matches Played", value: "412", change: "+8", variant: "red" as const },
  { icon: Eye, label: "Scouts Active", value: "34", change: "+3", variant: "green" as const },
];

const StatsPanel = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <MetricCard key={stat.label} {...stat} delay={i * 100} />
      ))}
    </div>
  );
};

export default StatsPanel;
