import { Users, Trophy, Shield, Eye } from "lucide-react";
import MetricCard from "./MetricCard";
import { useDashboardStats } from "@/hooks/useAdminData";

const StatsPanel = () => {
  const { data: dbStats } = useDashboardStats();

  const stats = [
    { icon: Users, label: "Registered Players", value: dbStats ? dbStats.totalPlayers.toLocaleString() : "—", change: dbStats && dbStats.totalPlayers > 0 ? `${dbStats.totalPlayers}` : undefined, variant: "red" as const },
    { icon: Shield, label: "Active Clubs", value: dbStats ? String(dbStats.totalClubs) : "—", change: undefined, variant: "green" as const },
    { icon: Trophy, label: "Matches", value: dbStats ? String(dbStats.totalMatches) : "—", change: undefined, variant: "red" as const },
    { icon: Eye, label: "Scouts Active", value: dbStats ? String(dbStats.scoutCount) : "—", change: undefined, variant: "green" as const },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <MetricCard key={stat.label} {...stat} delay={i * 100} />
      ))}
    </div>
  );
};

export default StatsPanel;
