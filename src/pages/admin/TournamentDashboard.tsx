import { useState, useEffect } from "react";
import {
  Radio, Clock, Trophy, MapPin, AlertTriangle, Zap, Timer, Target,
  ChevronRight, Activity, Signal, Wifi, Play, Pause, SkipForward,
  TrendingUp, Users, Shield, ArrowUpRight, Eye, CloudRain,
  Plus, Edit3, CheckCircle2, FileText, BarChart2,
} from "lucide-react";
import { toast } from "sonner";

/* ── mock data ── */
const liveMatchesData = [
  {
    id: "M-101", home: "Garuda Muda FC", away: "Elang Jaya", homeScore: 2, awayScore: 1,
    minute: 67, status: "LIVE", venue: "GBK Mini Field A", group: "Group A",
    category: "U12 - 2014"
  },
  {
    id: "M-102", home: "Rajawali United", away: "Banteng FC", homeScore: 0, awayScore: 0,
    minute: 23, status: "LIVE", venue: "GBK Mini Field B", group: "Group A",
    category: "U12 - 2014"
  },
  {
    id: "M-103", home: "Singa Putih", away: "Harimau FC", homeScore: 1, awayScore: 3,
    minute: 0, status: "HT", venue: "Senayan Training Ground", group: "Group B",
    category: "U12 - 2014"
  },
];

const CalendarCheck = ({ className }: { className?: string }) => <Clock className={className} />; // Placeholder

const tournamentKPIs = [
  { label: "Total Teams", value: "32", icon: Users, color: "text-blue-500" },
  { label: "Matches Scheduled", value: "64", icon: CalendarCheck, color: "text-purple-500" },
  { label: "Matches Completed", value: "18", icon: Trophy, color: "text-emerald-500" },
  { label: "Pending Reports", value: "4", icon: FileText, color: "text-amber-500" },
  { label: "Total Goals", value: "142", icon: Target, color: "text-destructive" },
  { label: "Fair Play Index", value: "8.4", icon: Shield, color: "text-cyan-500" },
];

const TournamentDashboard = () => {
  const [countdown, setCountdown] = useState("00:14:22");
  const [liveMatches, setLiveMatches] = useState(liveMatchesData);

  // Fake countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        const parts = prev.split(":").map(Number);
        let [h, m, s] = parts;
        if (s > 0) s--;
        else {
          s = 59;
          if (m > 0) m--;
          else {
            m = 59;
            if (h > 0) h--;
          }
        }
        return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateScore = (id: string, side: 'home' | 'away', delta: number) => {
    setLiveMatches(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          [side === 'home' ? 'homeScore' : 'awayScore']: Math.max(0, m[side === 'home' ? 'homeScore' : 'awayScore'] + delta)
        };
      }
      return m;
    }));
    toast.success("Score updated successfully");
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-950 min-h-screen font-montserrat">
      
      {/* ── TOP BAR / COMMAND HEADER ── */}
      <div className="glass-panel p-4 md:p-6 rounded-xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-destructive to-emerald-500" />
        
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-destructive/20 neon-border-red flex items-center justify-center border border-destructive/30 relative group overflow-hidden">
            <Trophy className="w-10 h-10 text-destructive relative z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-destructive/10 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-oswald font-bold text-white uppercase tracking-tighter">
                APSSI National Championship
              </h1>
              <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-600/30">
                Phase: Nasional
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium mt-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Category: <span className="text-white font-bold">U12 – 2014 Generation</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Jakarta, Indonesia
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Weather Placeholder */}
          <div className="hidden xl:flex items-center gap-3 px-4 border-l border-white/10">
            <CloudRain className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none">Weather</p>
              <p className="text-sm text-white font-bold mt-1">28°C Light Rain</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex flex-col items-center lg:items-end gap-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">
              <Timer className="w-3.5 h-3.5 text-destructive" />
              Next Kickoff In
            </div>
            <div className="text-3xl md:text-4xl font-oswald font-bold text-white tracking-widest flex items-baseline gap-1">
              {countdown}
              <span className="text-[10px] text-destructive animate-pulse ml-2 uppercase">Live Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI PANELS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {tournamentKPIs.map((kpi, i) => (
          <div key={i} className="glass-card p-5 border border-white/10 rounded-xl glow-hover transition group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg bg-slate-900/80 ${kpi.color} group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <p className="text-2xl font-oswald font-bold text-white">{kpi.value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1 leading-tight">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ── LIVE MATCH TRACKER ── */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-destructive rounded-full" />
              <h2 className="text-xl font-oswald font-bold text-white uppercase tracking-widest">Live Match Tracker</h2>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold border border-destructive/20 uppercase tracking-widest animate-pulse">
                <Wifi className="w-3 h-3" /> {liveMatches.length} Ongoing
              </span>
            </div>
            <button className="text-xs text-blue-400 font-bold hover:underline uppercase tracking-widest">Broadcast Console</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {liveMatches.map((match) => (
              <div key={match.id} className="glass-card border border-white/10 rounded-2xl overflow-hidden group">
                <div className="bg-slate-900/50 p-3 flex justify-between items-center border-b border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{match.venue}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${match.status === 'LIVE' ? 'bg-destructive text-white animate-pulse' : 'bg-amber-500/20 text-amber-400'}`}>
                    {match.status === 'LIVE' ? `${match.minute}'` : match.status}
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex-1 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto mb-2 border border-white/5 flex items-center justify-center">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-white uppercase leading-tight line-clamp-2 h-8">{match.home}</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-4xl font-oswald font-bold text-white flex items-center gap-3">
                        <span>{match.homeScore}</span>
                        <span className="text-slate-700 text-2xl">:</span>
                        <span>{match.awayScore}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Score</span>
                    </div>

                    <div className="flex-1 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto mb-2 border border-white/5 flex items-center justify-center">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-white uppercase leading-tight line-clamp-2 h-8">{match.away}</p>
                    </div>
                  </div>

                  {/* Quick Score Update Controls */}
                  <div className="flex items-center gap-2 p-2 bg-slate-950/50 rounded-xl border border-white/5">
                    <div className="flex-1 flex justify-center gap-1">
                      <button onClick={() => handleUpdateScore(match.id, 'home', 1)} className="p-1.5 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => handleUpdateScore(match.id, 'home', -1)} className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition"><Pause className="w-4 h-4" /></button>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex-1 flex justify-center gap-1">
                      <button onClick={() => handleUpdateScore(match.id, 'away', 1)} className="p-1.5 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => handleUpdateScore(match.id, 'away', -1)} className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition"><Pause className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-3 bg-slate-900/80 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition flex items-center justify-center gap-2">
                  <Edit3 className="w-3.5 h-3.5" /> Open Match Console
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-oswald font-bold text-white uppercase tracking-widest">Quick Actions</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { label: "Create Match", icon: Plus, desc: "Add new fixture to schedule", color: "bg-blue-600" },
              { label: "Update Scores", icon: Edit3, desc: "Manual score override", color: "bg-slate-800" },
              { label: "Approve Report", icon: CheckCircle2, desc: "Finalize match data", color: "bg-emerald-600" },
              { label: "Generate Standings", icon: BarChart2, desc: "Recalculate table points", color: "bg-purple-600" },
            ].map((action, i) => (
              <button 
                key={i}
                className="w-full glass-card p-4 border border-white/10 rounded-xl hover:border-white/20 transition flex items-center gap-4 text-left group"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-wide">{action.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 ml-auto group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>

          <div className="glass-card p-5 border border-white/10 rounded-xl mt-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Signal className="w-3 h-3 text-destructive animate-pulse" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Data Sync</span>
                <span className="text-emerald-500 font-black">STABLE</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Broadcast Latency</span>
                <span className="text-white font-black">1.2s</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDashboard;
