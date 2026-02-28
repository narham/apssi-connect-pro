import { BarChart3, TrendingUp, Users, Trophy, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const matchData = [
  { week: "W1", matches: 12, goals: 28 },
  { week: "W2", matches: 15, goals: 34 },
  { week: "W3", matches: 10, goals: 22 },
  { week: "W4", matches: 18, goals: 45 },
  { week: "W5", matches: 14, goals: 31 },
  { week: "W6", matches: 20, goals: 52 },
  { week: "W7", matches: 16, goals: 38 },
  { week: "W8", matches: 22, goals: 58 },
];

const positionDistribution = [
  { name: "ST", value: 320, color: "hsl(349,100%,55%)" },
  { name: "AMF", value: 280, color: "hsl(349,100%,65%)" },
  { name: "CM", value: 410, color: "hsl(151,100%,39%)" },
  { name: "CB", value: 380, color: "hsl(151,100%,49%)" },
  { name: "GK", value: 190, color: "hsl(216,40%,45%)" },
  { name: "Other", value: 520, color: "hsl(216,40%,30%)" },
];

const ageDistribution = [
  { age: "14", count: 180 },
  { age: "15", count: 420 },
  { age: "16", count: 680 },
  { age: "17", count: 820 },
  { age: "18", count: 540 },
  { age: "19", count: 210 },
];

const topStats = [
  { label: "Total Goals", value: "1,284", icon: Target, color: "text-destructive" },
  { label: "Avg Goals/Match", value: "3.12", icon: TrendingUp, color: "text-accent" },
  { label: "Fair Play Index", value: "87%", icon: Trophy, color: "text-accent" },
  { label: "Active Age Groups", value: "6", icon: Users, color: "text-destructive" },
];

const AdminStatistics = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Tournament Statistics</h1>
        <p className="text-xs font-montserrat text-muted-foreground mt-1">Comprehensive analytics across all tournaments</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {topStats.map((stat) => (
          <div key={stat.label} className="glass-card-gradient rounded-lg p-4 micro-hover relative z-0">
            <div className="relative z-10 flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-oswald font-bold text-foreground">{stat.value}</p>
                <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Match & Goals Trend */}
        <div className="lg:col-span-2 glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">Match & Goals Trend</h2>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={matchData}>
                  <defs>
                    <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(349,100%,55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(349,100%,55%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="goalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(151,100%,39%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(151,100%,39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(216,40%,22%,0.5)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(216,60%,18%)", border: "1px solid hsl(216,40%,22%)", borderRadius: "8px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="goals" stroke="hsl(151,100%,39%)" fill="url(#goalGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="matches" stroke="hsl(349,100%,55%)" fill="url(#matchGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Position Distribution */}
        <div className="glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">Position Distribution</h2>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={positionDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                    {positionDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(216,60%,18%)", border: "1px solid hsl(216,40%,22%)", borderRadius: "8px", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {positionDistribution.map((p) => (
                <span key={p.name} className="flex items-center gap-1 text-[9px] font-montserrat font-medium text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} /> {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Age Distribution */}
      <div className="glass-card rounded-lg p-5 relative z-0">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 gradient-line-vertical rounded-full" />
            <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">Age Group Distribution</h2>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(216,40%,22%,0.5)" />
                <XAxis dataKey="age" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(216,60%,18%)", border: "1px solid hsl(216,40%,22%)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="count" fill="hsl(349,100%,55%)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
