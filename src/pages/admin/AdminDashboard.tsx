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
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const overviewStats = [
  { icon: Users, label: "Total Players", value: "2,847", change: "+128 this month", trend: "up", variant: "red" as const },
  { icon: ShieldCheck, label: "Pending Verifications", value: "43", change: "12 urgent", trend: "alert", variant: "red" as const },
  { icon: Building2, label: "Registered Clubs", value: "186", change: "+12 this month", trend: "up", variant: "green" as const },
  { icon: Trophy, label: "Active Tournaments", value: "8", change: "3 ongoing", trend: "up", variant: "green" as const },
  { icon: Eye, label: "Active Scouts", value: "34", change: "+5 this week", trend: "up", variant: "green" as const },
  { icon: TrendingUp, label: "Match Reports", value: "412", change: "98% completed", trend: "up", variant: "red" as const },
];

const registrationData = [
  { month: "Aug", players: 180, clubs: 12 },
  { month: "Sep", players: 220, clubs: 18 },
  { month: "Oct", players: 310, clubs: 22 },
  { month: "Nov", players: 280, clubs: 20 },
  { month: "Dec", players: 420, clubs: 28 },
  { month: "Jan", players: 380, clubs: 25 },
  { month: "Feb", players: 490, clubs: 32 },
];

const verificationQueue = [
  { name: "Rizki Fauzan", club: "Garuda Muda FC", type: "New Registration", status: "pending", time: "2m ago" },
  { name: "Andi Pratama", club: "Elang Jaya", type: "Document Update", status: "pending", time: "8m ago" },
  { name: "Dimas Arya", club: "Rajawali United", type: "Age Verification", status: "urgent", time: "15m ago" },
  { name: "Budi Hartono", club: "Banteng FC", type: "Transfer Request", status: "pending", time: "22m ago" },
  { name: "Farhan Yusuf", club: "Singa Putih", type: "New Registration", status: "review", time: "30m ago" },
];

const recentActivity = [
  { action: "Player verified", detail: "Ahmad Rizki → Garuda Muda FC", icon: CheckCircle2, color: "text-accent" },
  { action: "Verification rejected", detail: "Document mismatch - Fajar M.", icon: XCircle, color: "text-destructive" },
  { action: "New club registered", detail: "Macan Kumbang FC - Jakarta", icon: Building2, color: "text-accent" },
  { action: "Scout access granted", detail: "Coach Hendrik - Provincial", icon: Eye, color: "text-neon-green" },
  { action: "Match report filed", detail: "Garuda Muda vs Elang Jaya (3-1)", icon: Trophy, color: "text-foreground" },
  { action: "Urgent: Age dispute", detail: "Player #2847 - Banteng FC", icon: AlertTriangle, color: "text-destructive" },
];

const provinceData = [
  { province: "DKI Jakarta", count: 420 },
  { province: "Jawa Barat", count: 380 },
  { province: "Jawa Timur", count: 310 },
  { province: "Banten", count: 250 },
  { province: "Jawa Tengah", count: 220 },
  { province: "Sulawesi Sel.", count: 180 },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">
            Command Center
          </h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">
            Tournament operations overview • Last updated: 2 minutes ago
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
            className="glass-card-gradient rounded-lg p-4 micro-hover animate-slide-up relative z-0"
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
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <item.icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.color}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-montserrat font-semibold text-foreground">{item.action}</p>
                    <p className="text-[10px] font-montserrat text-muted-foreground truncate">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
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
                {verificationQueue.length} Pending
              </span>
            </div>
            <div className="space-y-2">
              {verificationQueue.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-oswald font-bold text-foreground">
                      {item.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-montserrat font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] font-montserrat text-muted-foreground">{item.club} • {item.type}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-montserrat text-muted-foreground">{item.time}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      item.status === "urgent" ? "bg-destructive animate-pulse-neon" :
                      item.status === "review" ? "bg-accent" : "bg-muted-foreground"
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Province Distribution */}
        <div className="glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                Player Distribution by Province
              </h2>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(216,40%,22%,0.5)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="province" type="category" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(216,60%,18%)",
                      border: "1px solid hsl(216,40%,22%)",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(349,100%,55%)" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
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
              { role: "Super Admin", count: 2, color: "bg-destructive" },
              { role: "Provincial Admin", count: 8, color: "bg-accent" },
              { role: "Match Commissioner", count: 14, color: "bg-destructive" },
              { role: "Data Operator", count: 10, color: "bg-accent" },
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
