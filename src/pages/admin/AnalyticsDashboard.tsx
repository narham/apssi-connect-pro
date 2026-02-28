import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  Trophy,
  Target,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Filter,
  Map,
  Activity,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Line,
} from "recharts";
import { toast } from "sonner";

// ==================== MOCK DATA ====================

const playerGrowthData = [
  { month: "Jan", "Jawa Barat": 45, "Jawa Timur": 38, "DKI Jakarta": 52 },
  { month: "Feb", "Jawa Barat": 52, "Jawa Timur": 48, "DKI Jakarta": 61 },
  { month: "Mar", "Jawa Barat": 61, "Jawa Timur": 55, "DKI Jakarta": 68 },
  { month: "Apr", "Jawa Barat": 78, "Jawa Timur": 72, "DKI Jakarta": 84 },
  { month: "May", "Jawa Barat": 95, "Jawa Timur": 88, "DKI Jakarta": 102 },
  { month: "Jun", "Jawa Barat": 120, "Jawa Timur": 110, "DKI Jakarta": 135 },
];

const verificationData = [
  { name: "Approved", value: 75, color: "hsl(151,100%,39%)" },
  { name: "Rejected", value: 15, color: "hsl(349,100%,55%)" },
  { name: "Pending", value: 10, color: "hsl(45,100%,50%)" },
];

const fairPlayData = [
  { subject: "Discipline", A: 85, B: 70, fullMark: 100 },
  { subject: "Respect", A: 92, B: 85, fullMark: 100 },
  { subject: "Punctuality", A: 78, B: 90, fullMark: 100 },
  { subject: "Compliance", A: 95, B: 80, fullMark: 100 },
  { subject: "Engagement", A: 88, B: 75, fullMark: 100 },
];

const topClubsData = [
  { name: "Persib Academy", wins: 42, goals: 118, color: "hsl(216,90%,50%)" },
  { name: "Persija Young", wins: 38, goals: 105, color: "hsl(349,100%,55%)" },
  { name: "Persebaya Youth", wins: 35, goals: 98, color: "hsl(151,100%,39%)" },
  { name: "Bali United Acad", wins: 31, goals: 88, color: "hsl(0,100%,50%)" },
  { name: "Arema Junior", wins: 28, goals: 75, color: "hsl(216,70%,45%)" },
];

const avgMinutesData = [
  { age: "U-13", minutes: 58, players: 450 },
  { age: "U-15", minutes: 72, players: 680 },
  { age: "U-17", minutes: 85, players: 820 },
  { age: "U-19", minutes: 92, players: 540 },
  { age: "Senior", minutes: 90, players: 210 },
];

const scoutActivity = [
  { id: 1, name: "Andi Saputra", province: "Jawa Barat", reports: 24, status: "Active", lastActivity: "2h ago" },
  { id: 2, name: "Bambang H.", province: "Jawa Timur", reports: 18, status: "Active", lastActivity: "5h ago" },
  { id: 3, name: "Siti Aminah", province: "DKI Jakarta", reports: 31, status: "Away", lastActivity: "1d ago" },
  { id: 4, name: "Rizky Fauzi", province: "Banten", reports: 12, status: "Active", lastActivity: "1h ago" },
];

const heatmapData = [
  { day: "Mon", "08:00": 10, "12:00": 45, "16:00": 78, "20:00": 32 },
  { day: "Tue", "08:00": 15, "12:00": 52, "16:00": 84, "20:00": 41 },
  { day: "Wed", "08:00": 12, "12:00": 48, "16:00": 92, "20:00": 38 },
  { day: "Thu", "08:00": 20, "12:00": 61, "16:00": 88, "20:00": 45 },
  { day: "Fri", "08:00": 25, "12:00": 72, "16:00": 95, "20:00": 58 },
  { day: "Sat", "08:00": 35, "12:00": 88, "16:00": 120, "20:00": 75 },
  { day: "Sun", "08:00": 30, "12:00": 82, "16:00": 110, "20:00": 68 },
];

// ==================== COMPONENT ====================

const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: string) => {
    setIsExporting(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Exporting dashboard to ${format}...`,
        success: `Dashboard exported as ${format} successfully!`,
        error: "Failed to export dashboard.",
      }
    );
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-white uppercase tracking-wider">Analytics Dashboard</h1>
          <p className="text-slate-400 font-montserrat text-sm mt-1">Real-time performance metrics and system monitoring</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-slate-300 hover:text-white transition">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{dateRange}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 p-1 rounded-lg">
            <button 
              onClick={() => handleExport("PDF")}
              className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-400 transition"
              title="Export PDF"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleExport("Excel")}
              className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-green-400 transition"
              title="Export Excel"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleExport("CSV")}
              className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-amber-400 transition"
              title="Export CSV"
            >
              <FileCode className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Players", value: "12,482", growth: "+12.5%", icon: Users, color: "text-blue-500", glow: "glow-hover-blue" },
          { label: "Total Clubs", value: "842", growth: "+4.2%", icon: Trophy, color: "text-amber-500", glow: "glow-hover" },
          { label: "Avg. Minutes", value: "78.4", growth: "+2.1%", icon: Activity, color: "text-emerald-500", glow: "glow-hover-green" },
          { label: "Approval Rate", value: "89.2%", growth: "+0.8%", icon: CheckCircle2, color: "text-purple-500", glow: "glow-hover" },
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-6 border border-white/10 rounded-xl transition group ${stat.glow}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-slate-900/80 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" />
                {stat.growth}
              </div>
            </div>
            <p className="text-2xl font-oswald font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Growth by Province */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/10 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <h2 className="text-lg font-oswald font-bold text-white uppercase tracking-wider">Player Growth by Province</h2>
            </div>
            <button className="text-xs text-blue-400 hover:underline">Detailed Report</button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={playerGrowthData}>
                <defs>
                  <linearGradient id="colorJB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorJT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDKI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="Jawa Barat" stroke="#3b82f6" fillOpacity={1} fill="url(#colorJB)" strokeWidth={3} />
                <Area type="monotone" dataKey="Jawa Timur" stroke="#10b981" fillOpacity={1} fill="url(#colorJT)" strokeWidth={3} />
                <Area type="monotone" dataKey="DKI Jakarta" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDKI)" strokeWidth={3} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Rate */}
        <div className="glass-card p-6 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-5 bg-purple-500 rounded-full" />
            <h2 className="text-lg font-oswald font-bold text-white uppercase tracking-wider">Verification Rate</h2>
          </div>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">75%</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Approved</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {verificationData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fair Play Distribution */}
        <div className="glass-card p-6 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h2 className="text-lg font-oswald font-bold text-white uppercase tracking-wider">Fair Play Index</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={fairPlayData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="League Average" dataKey="B" stroke="#64748b" fill="#64748b" fillOpacity={0.3} />
                <Radar name="Top 10% Clubs" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Clubs */}
        <div className="glass-card p-6 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-amber-500 rounded-full" />
            <h2 className="text-lg font-oswald font-bold text-white uppercase tracking-wider">Top Performing Clubs</h2>
          </div>
          <div className="space-y-6">
            {topClubsData.map((club, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{club.name}</span>
                  <span className="text-slate-400 text-xs">{club.wins} Wins • {club.goals} Goals</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(club.wins / 50) * 100}%`, backgroundColor: club.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 border border-white/10 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-900 transition flex items-center justify-center gap-2">
            View All Club Rankings
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Average Player Minutes */}
        <div className="glass-card p-6 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-red-500 rounded-full" />
            <h2 className="text-lg font-oswald font-bold text-white uppercase tracking-wider">Avg Player Minutes</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={avgMinutesData}>
                <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="age" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
                <Bar yAxisId="left" dataKey="players" fill="#334155" radius={[4, 4, 0, 0]} barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="minutes" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444" }} />
                <Legend />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Heatmap & Scout Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Heatmap */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/10 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-cyan-500 rounded-full" />
              <h2 className="text-lg font-oswald font-bold text-white uppercase tracking-wider">System Activity Heatmap</h2>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span>Low</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded bg-slate-900" />
                <div className="w-3 h-3 rounded bg-blue-900/50" />
                <div className="w-3 h-3 rounded bg-blue-700/50" />
                <div className="w-3 h-3 rounded bg-blue-500/50" />
                <div className="w-3 h-3 rounded bg-blue-400" />
              </div>
              <span>High</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Day</th>
                  {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"].map(t => (
                    <th key={t} className="p-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <tr key={day}>
                    <td className="p-2 text-xs font-bold text-slate-400">{day}</td>
                    {Array.from({ length: 8 }).map((_, i) => {
                      const val = Math.floor(Math.random() * 100);
                      let color = "bg-slate-900";
                      if (val > 80) color = "bg-blue-400";
                      else if (val > 60) color = "bg-blue-500/50";
                      else if (val > 40) color = "bg-blue-700/50";
                      else if (val > 20) color = "bg-blue-900/50";
                      return (
                        <td key={i} className="p-1">
                          <div className={`w-full h-8 rounded-md ${color} transition-all hover:scale-105 hover:brightness-125 cursor-help`} title={`${val}% intensity`} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scout Activity Monitoring */}
        <div className="glass-card p-6 border border-white/10 rounded-xl flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
            <h2 className="text-lg font-oswald font-bold text-white uppercase tracking-wider">Scout Activity</h2>
          </div>
          <div className="flex-1 space-y-4">
            {scoutActivity.map((scout) => (
              <div key={scout.id} className="p-4 bg-slate-900/50 border border-white/5 rounded-xl hover:border-white/10 transition group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                      <Users className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{scout.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{scout.province}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scout.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                      {scout.status}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">{scout.lastActivity}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <FileText className="w-3 h-3" />
                    {scout.reports} Reports
                  </div>
                  <button className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                    Profile
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-blue-900/20">
            View All Active Scouts
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
