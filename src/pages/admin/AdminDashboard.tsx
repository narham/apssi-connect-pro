import React from "react";
import {
  Users,
  ShieldCheck,
  Trophy,
  Building2,
  Eye,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useDashboardStats, useVerificationQueue, useRecentActivity } from "@/hooks/useAdminData";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: queue, isLoading: queueLoading } = useVerificationQueue();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();

  const isLoading = statsLoading;

  const overviewStats = stats ? [
    { icon: Users, label: "Total Players", value: stats.totalPlayers.toLocaleString(), change: `${stats.pendingVerifications} pending`, trend: "up" as const, variant: "red" as const },
    { icon: ShieldCheck, label: "Pending Verifications", value: String(stats.pendingVerifications), change: "Requires review", trend: "alert" as const, variant: "red" as const },
    { icon: Building2, label: "Registered Clubs", value: String(stats.totalClubs), change: "Active clubs", trend: "up" as const, variant: "green" as const },
    { icon: Trophy, label: "Active Tournaments", value: String(stats.activeTournaments), change: "In progress", trend: "up" as const, variant: "green" as const },
    { icon: Eye, label: "Active Scouts", value: String(stats.scoutCount), change: "Registered", trend: "up" as const, variant: "green" as const },
    { icon: TrendingUp, label: "Match Reports", value: String(stats.totalMatches), change: "Total matches", trend: "up" as const, variant: "red" as const },
  ] : [];

  // Static chart data (would need time-series tables for real trends)
  const registrationData = [
    { month: "Aug", players: 0, clubs: 0 },
    { month: "Sep", players: 0, clubs: 0 },
    { month: "Oct", players: 0, clubs: 0 },
    { month: "Nov", players: 0, clubs: 0 },
    { month: "Dec", players: 0, clubs: 0 },
    { month: "Jan", players: 0, clubs: 0 },
    { month: "Feb", players: stats?.totalPlayers ?? 0, clubs: stats?.totalClubs ?? 0 },
  ];

  const activityItems = (activity ?? []).map((item: any) => {
    const actionMap: Record<string, { label: string; icon: any; color: string }> = {
      OVERRIDE: { label: "Admin override", icon: ShieldCheck, color: "text-accent" },
      VERIFY: { label: "Player verified", icon: CheckCircle2, color: "text-accent" },
      REJECT: { label: "Verification rejected", icon: XCircle, color: "text-destructive" },
    };
    const mapped = actionMap[item.action_type] || { label: item.action_type, icon: Clock, color: "text-muted-foreground" };
    return {
      action: mapped.label,
      detail: `${item.players?.full_name ?? 'Unknown'} — ${item.new_status ?? ''}`,
      icon: mapped.icon,
      color: mapped.color,
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto animate-pulse p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="h-8 w-48 skeleton" />
            <div className="h-4 w-64 skeleton" />
          </div>
          <div className="h-10 w-32 skeleton rounded-full" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[300px] skeleton rounded-lg" />
          <div className="h-[300px] skeleton rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">
            Command Center
          </h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">
            Tournament operations overview • Live data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5 relative z-0">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-neon relative z-10" />
            <span className="text-[10px] font-montserrat font-bold text-accent uppercase tracking-wider relative z-10">
              System Online
            </span>
          </span>
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {overviewStats.map((stat, i) => (
          <div
            key={stat.label}
            className={`glass-card-gradient rounded-lg p-4 micro-hover animate-slide-up relative z-0 ${
              stat.variant === "red" ? "glow-hover" : "glow-hover-green"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <stat.icon
                  className={`w-5 h-5 ${stat.variant === "red" ? "text-destructive" : "text-accent"}`}
                />
                {stat.trend === "alert" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive animate-pulse-neon" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
                )}
              </div>
              <div className="text-2xl font-oswald font-bold text-foreground leading-none">{stat.value}</div>
              <div className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider mt-1.5">
                {stat.label}
              </div>
              <div className={`text-[9px] font-montserrat font-semibold mt-1 ${stat.trend === "alert" ? "text-destructive" : "text-accent"}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Registration Trends - 2 cols */}
        <div className="lg:col-span-2 glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 gradient-line-vertical rounded-full" />
                <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                  Registration Trends
                </h2>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-montserrat font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-destructive" /> Players
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent" /> Clubs
                </span>
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationData}>
                  <defs>
                    <linearGradient id="adminPlayerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(349,100%,55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(349,100%,55%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adminClubGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(151,100%,39%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(151,100%,39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(216,40%,22%,0.5)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(216,60%,18%)",
                      border: "1px solid hsl(216,40%,22%)",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Area type="monotone" dataKey="players" stroke="hsl(349,100%,55%)" fill="url(#adminPlayerGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="clubs" stroke="hsl(151,100%,39%)" fill="url(#adminClubGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                Activity Feed
              </h2>
            </div>
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : activityItems.length === 0 ? (
              <p className="text-xs font-montserrat text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activityItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <item.icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.color}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-montserrat font-semibold text-foreground">{item.action}</p>
                      <p className="text-[10px] font-montserrat text-muted-foreground truncate">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Verification Queue */}
        <div className="glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 gradient-line-vertical rounded-full" />
                <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                  Verification Queue
                </h2>
              </div>
              <span className="text-[10px] font-montserrat font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                {stats?.pendingVerifications ?? 0} Pending
              </span>
            </div>
            {queueLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : (queue ?? []).length === 0 ? (
              <p className="text-xs font-montserrat text-muted-foreground text-center py-8">No pending verifications</p>
            ) : (
              <div className="space-y-2">
                {(queue ?? []).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-oswald font-bold text-foreground">
                        {item.full_name.split(" ").map((n: string) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-montserrat font-semibold text-foreground truncate">{item.full_name}</p>
                      <p className="text-[10px] font-montserrat text-muted-foreground">
                        {item.clubs?.name ?? 'No Club'} • Manual Review
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-montserrat text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Province Distribution - placeholder since we don't have per-province player data easily */}
        <div className="glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                System Summary
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-oswald font-bold text-foreground">{stats?.totalPlayers ?? 0}</p>
                <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">Players</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-oswald font-bold text-foreground">{stats?.totalClubs ?? 0}</p>
                <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">Clubs</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-oswald font-bold text-foreground">{stats?.activeTournaments ?? 0}</p>
                <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">Tournaments</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-oswald font-bold text-foreground">{stats?.totalMatches ?? 0}</p>
                <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">Matches</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Roles Quick View */}
      <div className="glass-card rounded-lg p-5 relative z-0">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 gradient-line-vertical rounded-full" />
            <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
              Active Operators
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { role: "Super Admin", count: stats?.roleCounts.super_admin ?? 0, color: "bg-destructive" },
              { role: "Provincial Admin", count: stats?.roleCounts.provincial_admin ?? 0, color: "bg-accent" },
              { role: "Match Commissioner", count: stats?.roleCounts.match_commissioner ?? 0, color: "bg-destructive" },
              { role: "Data Operator", count: stats?.roleCounts.data_operator ?? 0, color: "bg-accent" },
            ].map((role) => (
              <div key={role.role} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <span className={`w-3 h-3 rounded-full ${role.color} shrink-0`} />
                <div>
                  <p className="text-lg font-oswald font-bold text-foreground">{role.count}</p>
                  <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">
                    {role.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
