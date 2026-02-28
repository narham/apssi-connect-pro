import { useState } from "react";
import {
  Radio, Clock, Trophy, MapPin, AlertTriangle, Zap, Timer, Target,
  ChevronRight, Activity, Signal, Wifi, Play, Pause, SkipForward,
  TrendingUp, Users, Shield, ArrowUpRight, Eye,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

/* ── mock data ── */
const liveMatches = [
  {
    id: "M-101", home: "Garuda Muda FC", away: "Elang Jaya", homeScore: 2, awayScore: 1,
    minute: 67, status: "live", venue: "GBK Mini Field A", group: "Group A",
    events: [
      { min: 12, type: "goal", team: "home", player: "Ahmad Rizki" },
      { min: 34, type: "yellow", team: "away", player: "Rendi Saputra" },
      { min: 41, type: "goal", team: "away", player: "Budi Santoso" },
      { min: 58, type: "goal", team: "home", player: "Dimas Pratama" },
    ],
  },
  {
    id: "M-102", home: "Rajawali United", away: "Banteng FC", homeScore: 0, awayScore: 0,
    minute: 23, status: "live", venue: "GBK Mini Field B", group: "Group A",
    events: [
      { min: 18, type: "yellow", team: "home", player: "Fajar M." },
    ],
  },
  {
    id: "M-103", home: "Singa Putih", away: "Harimau FC", homeScore: 1, awayScore: 3,
    minute: 88, status: "live", venue: "Senayan Training Ground", group: "Group B",
    events: [
      { min: 5, type: "goal", team: "away", player: "Galih P." },
      { min: 22, type: "goal", team: "home", player: "Irfan S." },
      { min: 55, type: "goal", team: "away", player: "Joko S." },
      { min: 72, type: "red", team: "home", player: "Hendra W." },
      { min: 80, type: "goal", team: "away", player: "Galih P." },
    ],
  },
];

const upcomingMatches = [
  { id: "M-104", home: "Naga Emas", away: "Macan Kumbang FC", time: "15:30", venue: "GBK Mini Field A", group: "Group B" },
  { id: "M-105", home: "Garuda Muda FC", away: "Rajawali United", time: "17:00", venue: "GBK Mini Field B", group: "Group A" },
  { id: "M-106", home: "Elang Jaya", away: "Banteng FC", time: "17:00", venue: "Senayan Training Ground", group: "Group A" },
];

const standings = [
  { pos: 1, team: "Garuda Muda FC", p: 4, w: 3, d: 1, l: 0, gf: 10, ga: 3, pts: 10 },
  { pos: 2, team: "Elang Jaya", p: 4, w: 2, d: 1, l: 1, gf: 7, ga: 5, pts: 7 },
  { pos: 3, team: "Rajawali United", p: 4, w: 1, d: 2, l: 1, gf: 5, ga: 4, pts: 5 },
  { pos: 4, team: "Banteng FC", p: 4, w: 0, d: 0, l: 4, gf: 2, ga: 12, pts: 0 },
];

const goalTimeline = [
  { period: "0-15", goals: 8 },
  { period: "16-30", goals: 14 },
  { period: "31-45", goals: 12 },
  { period: "46-60", goals: 18 },
  { period: "61-75", goals: 22 },
  { period: "76-90", goals: 16 },
];

const controlStats = [
  { icon: Radio, label: "Live Matches", value: "3", color: "text-destructive", pulse: true },
  { icon: Clock, label: "Upcoming Today", value: "3", color: "text-accent" },
  { icon: Trophy, label: "Completed", value: "18", color: "text-foreground" },
  { icon: MapPin, label: "Active Venues", value: "3", color: "text-accent" },
  { icon: Users, label: "Players Active", value: "66", color: "text-destructive" },
  { icon: Eye, label: "Commissioners", value: "6", color: "text-accent" },
];

const pendingReports = [
  { match: "Naga Emas vs Singa Putih", commissioner: "Pak Hadi", submitted: "14:22", status: "pending" },
  { match: "Macan FC vs Harimau FC", commissioner: "Pak Joko", submitted: "12:05", status: "approved" },
  { match: "Garuda vs Banteng", commissioner: "Pak Surya", submitted: "10:30", status: "flagged" },
];

const eventTypeConfig = {
  goal: { emoji: "⚽", color: "text-accent" },
  yellow: { emoji: "🟡", color: "text-yellow-400" },
  red: { emoji: "🔴", color: "text-destructive" },
};

const TournamentDashboard = () => {
  const [selectedGroup, setSelectedGroup] = useState("Group A");

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider flex items-center gap-3">
            <Signal className="w-6 h-6 text-destructive animate-pulse-neon" />
            Tournament Control Center
          </h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">
            APSSI KU-12 National Championship 2026 • Matchday 5 • Live Operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5 neon-border-red relative z-0">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-neon relative z-10" />
            <span className="text-[10px] font-montserrat font-bold text-destructive uppercase tracking-wider relative z-10">
              3 LIVE
            </span>
          </span>
          <span className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5 relative z-0">
            <Wifi className="w-3 h-3 text-accent relative z-10" />
            <span className="text-[10px] font-montserrat font-bold text-accent uppercase tracking-wider relative z-10">
              All Systems Operational
            </span>
          </span>
        </div>
      </div>

      {/* Control Stats Strip */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {controlStats.map((stat) => (
          <div key={stat.label} className="glass-card-gradient rounded-lg p-3 relative z-0">
            <div className="relative z-10 flex items-center gap-2.5">
              <stat.icon className={`w-5 h-5 ${stat.color} ${stat.pulse ? "animate-pulse-neon" : ""}`} />
              <div>
                <p className="text-xl font-oswald font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Match Monitor — Full Width */}
      <div className="glass-card rounded-lg p-5 neon-border-red relative z-0">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-destructive rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                Live Match Monitor
              </h2>
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-neon ml-1" />
            </div>
            <span className="text-[9px] font-montserrat text-muted-foreground">Auto-refresh: 30s</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {liveMatches.map((match) => (
              <div key={match.id} className="glass-card rounded-lg p-4 relative z-0 border border-destructive/20">
                <div className="relative z-10">
                  {/* Match Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-montserrat font-bold text-muted-foreground">{match.group} • {match.id}</span>
                    <span className="flex items-center gap-1 text-[9px] font-montserrat font-bold text-destructive">
                      <Timer className="w-3 h-3" /> {match.minute}'
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-xs font-oswald font-bold text-foreground uppercase truncate">{match.home}</p>
                    </div>
                    <div className="flex items-center gap-2 mx-3">
                      <span className="text-3xl font-oswald font-black text-foreground">{match.homeScore}</span>
                      <span className="text-lg font-oswald text-muted-foreground">-</span>
                      <span className="text-3xl font-oswald font-black text-foreground">{match.awayScore}</span>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs font-oswald font-bold text-foreground uppercase truncate">{match.away}</p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-center gap-1 mb-3 text-[9px] font-montserrat text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {match.venue}
                  </div>

                  {/* Match Timeline */}
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                    {match.events.map((evt, i) => {
                      const cfg = eventTypeConfig[evt.type as keyof typeof eventTypeConfig];
                      return (
                        <div key={i} className="flex items-center gap-2 text-[10px] font-montserrat">
                          <span className="w-6 text-right font-bold text-muted-foreground">{evt.min}'</span>
                          <span>{cfg.emoji}</span>
                          <span className={`font-medium ${cfg.color}`}>{evt.player}</span>
                          <span className="text-muted-foreground ml-auto">{evt.team === "home" ? match.home.split(" ")[0] : match.away.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Match minute progress bar */}
                  <div className="mt-3">
                    <div className="w-full h-1 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-destructive transition-all duration-500"
                        style={{ width: `${Math.min(match.minute / 90 * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[8px] font-montserrat text-muted-foreground">
                      <span>KO</span>
                      <span>HT</span>
                      <span>FT</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Standings + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Standings — 3 cols */}
        <div className="lg:col-span-3 glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 gradient-line-vertical rounded-full" />
                <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                  Standings
                </h2>
              </div>
              <div className="flex gap-1">
                {["Group A", "Group B"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGroup(g)}
                    className={`text-[10px] font-montserrat font-bold px-2.5 py-1 rounded transition-colors ${
                      selectedGroup === g
                        ? "bg-destructive text-destructive-foreground"
                        : "text-muted-foreground hover:text-foreground bg-muted/30"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["#", "Team", "P", "W", "D", "L", "GF", "GA", "PTS"].map((h) => (
                      <th key={h} className="text-[9px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest px-2 py-2 text-left first:pl-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr key={row.pos} className={`border-b border-border/30 ${row.pos <= 2 ? "bg-accent/5" : ""}`}>
                      <td className="px-2 py-2.5 first:pl-0">
                        <span className={`text-xs font-oswald font-bold ${row.pos <= 2 ? "text-accent" : "text-muted-foreground"}`}>
                          {row.pos}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-xs font-montserrat font-semibold text-foreground">{row.team}</td>
                      {[row.p, row.w, row.d, row.l, row.gf, row.ga].map((v, i) => (
                        <td key={i} className="px-2 py-2.5 text-xs font-montserrat text-muted-foreground">{v}</td>
                      ))}
                      <td className="px-2 py-2.5 text-sm font-oswald font-black text-foreground">{row.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="w-3 h-1 rounded bg-accent" />
              <span className="text-[9px] font-montserrat text-muted-foreground">Qualifies for knockout stage</span>
            </div>
          </div>
        </div>

        {/* Upcoming Matches — 2 cols */}
        <div className="lg:col-span-2 glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                Upcoming Matches
              </h2>
            </div>
            <div className="space-y-2.5">
              {upcomingMatches.map((match) => (
                <div key={match.id} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-montserrat font-bold text-muted-foreground">{match.group} • {match.id}</span>
                    <span className="flex items-center gap-1 text-[10px] font-montserrat font-bold text-accent">
                      <Clock className="w-3 h-3" /> {match.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-oswald font-bold text-foreground uppercase">{match.home}</span>
                    <span className="text-[10px] font-montserrat font-bold text-muted-foreground mx-2">vs</span>
                    <span className="text-xs font-oswald font-bold text-foreground uppercase">{match.away}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] font-montserrat text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {match.venue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Goal Timeline + Match Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goal Distribution */}
        <div className="glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                Goal Distribution by Period
              </h2>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(216,40%,22%,0.5)" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(216,60%,18%)", border: "1px solid hsl(216,40%,22%)", borderRadius: "8px", fontSize: "11px" }} />
                  <Bar dataKey="goals" fill="hsl(349,100%,55%)" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Match Report Validation */}
        <div className="glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 gradient-line-vertical rounded-full" />
                <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                  Match Report Validation
                </h2>
              </div>
              <span className="text-[10px] font-montserrat font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                1 Flagged
              </span>
            </div>
            <div className="space-y-2.5">
              {pendingReports.map((report, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div>
                    <p className="text-xs font-montserrat font-semibold text-foreground">{report.match}</p>
                    <p className="text-[10px] font-montserrat text-muted-foreground">
                      {report.commissioner} • {report.submitted}
                    </p>
                  </div>
                  <span className={`text-[9px] font-montserrat font-bold px-2 py-0.5 rounded-full ${
                    report.status === "approved" ? "text-accent bg-accent/10" :
                    report.status === "flagged" ? "text-destructive bg-destructive/10" :
                    "text-muted-foreground bg-muted/40"
                  }`}>
                    {report.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bracket Preview */}
      <div className="glass-card rounded-lg p-5 relative z-0">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                Knockout Bracket Preview
              </h2>
            </div>
            <span className="text-[9px] font-montserrat font-medium text-muted-foreground">
              Bracket locks after group stage completion
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 overflow-x-auto py-4">
            {/* Quarterfinals */}
            <div className="space-y-3 shrink-0">
              <p className="text-[9px] font-montserrat font-bold text-muted-foreground text-center uppercase tracking-widest mb-2">
                Quarterfinals
              </p>
              {[["A1 vs B2", "TBD"], ["B1 vs A2", "TBD"], ["C1 vs D2", "TBD"], ["D1 vs C2", "TBD"]].map(([label], i) => (
                <div key={i} className="w-40 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-[10px] font-oswald font-bold text-foreground text-center uppercase">{label}</p>
                  <p className="text-[8px] font-montserrat text-muted-foreground text-center mt-0.5">Pending</p>
                </div>
              ))}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            {/* Semifinals */}
            <div className="space-y-3 shrink-0">
              <p className="text-[9px] font-montserrat font-bold text-muted-foreground text-center uppercase tracking-widest mb-2">
                Semifinals
              </p>
              {["QF1 Winner vs QF2 Winner", "QF3 Winner vs QF4 Winner"].map((label, i) => (
                <div key={i} className="w-48 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-[10px] font-oswald font-bold text-foreground text-center uppercase">{label}</p>
                  <p className="text-[8px] font-montserrat text-muted-foreground text-center mt-0.5">Pending</p>
                </div>
              ))}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            {/* Final */}
            <div className="space-y-3 shrink-0">
              <p className="text-[9px] font-montserrat font-bold text-muted-foreground text-center uppercase tracking-widest mb-2">
                Final
              </p>
              <div className="w-52 p-4 rounded-lg bg-destructive/5 border border-destructive/20 neon-border-red">
                <Trophy className="w-5 h-5 text-destructive mx-auto mb-1" />
                <p className="text-[10px] font-oswald font-bold text-foreground text-center uppercase">SF1 Winner vs SF2 Winner</p>
                <p className="text-[8px] font-montserrat text-muted-foreground text-center mt-0.5">Championship Match</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDashboard;
