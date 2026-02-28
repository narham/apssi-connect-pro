import { useState, useEffect } from "react";
import {
  Radio, Clock, Trophy, MapPin, AlertTriangle, Zap, Timer, Target,
  ChevronRight, Activity, Signal, Wifi, Play, Pause, SkipForward,
  TrendingUp, Users, Shield, ArrowUpRight, Eye, CloudRain,
  Plus, Edit3, CheckCircle2,
  FileText,
  BarChart2,
  RefreshCw,
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
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-950 min-h-screen font-montserrat page-fade-in">
      
      {/* ── TOP BAR / COMMAND HEADER ── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden glass-reflection">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-destructive to-emerald-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
        
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 neon-border-red flex items-center justify-center border border-destructive/30 relative group overflow-hidden shadow-2xl">
            <Trophy className="w-12 h-12 text-destructive relative z-10 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-destructive/20 blur-xl rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-oswald font-bold text-white uppercase tracking-tight drop-shadow-lg">
                National Championship <span className="text-blue-500">2026</span>
              </h1>
              <span className="status-confirmed animate-pulse">
                <div className="live-pulse" />
                Phase: Nasional
              </span>
            </div>
            <p className="text-slate-500 text-sm font-bold mt-1.5 flex items-center gap-3 uppercase tracking-widest">
              <Activity className="w-4 h-4 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Category: <span className="text-white">U12 – 2014 Generation</span>
              <span className="text-slate-800 font-black">|</span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-destructive" /> Jakarta, Indonesia
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          {/* Weather Indicator */}
          <div className="hidden xl:flex items-center gap-4 px-6 border-x border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <CloudRain className="w-6 h-6 text-blue-400 animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-none mb-1">Ops Weather</p>
              <p className="text-sm text-white font-bold tracking-tight">28°C Light Rain</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex flex-col items-center lg:items-end gap-1.5">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
              <Timer className="w-4 h-4 text-destructive animate-pulse" />
              Next Kickoff Signal
            </div>
            <div className="text-4xl md:text-5xl font-oswald font-bold text-white tracking-[0.1em] flex items-baseline gap-2 drop-shadow-2xl">
              <span className="led-display">{countdown}</span>
              <span className="text-[10px] text-destructive font-black animate-pulse uppercase tracking-widest bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20">Live Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI PANELS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {tournamentKPIs.map((kpi, i) => (
          <div key={i} className="glass-card p-6 border border-white/10 rounded-2xl glow-hover transition-all group hover:border-white/20 glass-reflection smooth-refresh" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-slate-900/80 ${kpi.color} group-hover:scale-110 transition-transform shadow-lg border border-white/5`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <Activity className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-oswald font-bold text-white tracking-tight">{kpi.value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mt-1.5 leading-tight group-hover:text-slate-300 transition-colors">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ── LIVE MATCH TRACKER ── */}
        <div className="xl:col-span-3 space-y-5">
          <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-destructive rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <h2 className="text-xl font-oswald font-bold text-white uppercase tracking-widest">Live Operations Tracker</h2>
              <span className="status-flagged animate-pulse">
                <Wifi className="w-3.5 h-3.5" /> {liveMatches.length} Feeds Active
              </span>
            </div>
            <button className="text-xs text-blue-400 font-black hover:text-blue-300 uppercase tracking-widest flex items-center gap-2 transition-colors">
              <Activity className="w-3.5 h-3.5" /> Broadcast Console
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
            {liveMatches.map((match, i) => (
              <div key={match.id} className="glass-card border border-white/10 rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all glass-reflection smooth-refresh" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="bg-slate-900/80 p-4 flex justify-between items-center border-b border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-destructive" /> {match.venue}
                  </span>
                  <span className={`status-${match.status === 'LIVE' ? 'flagged' : 'pending'} animate-pulse`}>
                    <div className="live-pulse" />
                    {match.status === 'LIVE' ? `${match.minute}'` : match.status}
                  </span>
                </div>
                
                <div className="p-8 bg-slate-950/20">
                  <div className="flex items-center justify-between gap-6 mb-8">
                    <div className="flex-1 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 mx-auto mb-3 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Shield className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-xs font-bold text-white uppercase leading-tight tracking-tight h-8 line-clamp-2">{match.home}</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-5xl led-display text-white flex items-center gap-4">
                        <span className="led-display-blue">{match.homeScore}</span>
                        <span className="text-slate-800 opacity-50 font-oswald">:</span>
                        <span className="led-display">{match.awayScore}</span>
                      </div>
                      <div className="px-3 py-1 bg-slate-900 rounded-full border border-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">
                        Signal 100%
                      </div>
                    </div>

                    <div className="flex-1 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 mx-auto mb-3 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Shield className="w-8 h-8 text-destructive" />
                      </div>
                      <p className="text-xs font-bold text-white uppercase leading-tight tracking-tight h-8 line-clamp-2">{match.away}</p>
                    </div>
                  </div>

                  {/* Quick Score Update Controls */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-center gap-2 border-r border-white/5">
                      <button onClick={() => handleUpdateScore(match.id, 'home', 1)} className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition micro-tap"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => handleUpdateScore(match.id, 'home', -1)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-xl transition micro-tap"><Pause className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleUpdateScore(match.id, 'away', 1)} className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition micro-tap"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => handleUpdateScore(match.id, 'away', -1)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-xl transition micro-tap"><Pause className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-slate-900 hover:bg-blue-600 group/btn transition-all text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                  <Edit3 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" /> 
                  Open Match Control Console
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="space-y-5">
          <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-white/5">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            <h2 className="text-xl font-oswald font-bold text-white uppercase tracking-widest">Authority Control</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { label: "Initialize Match", icon: Plus, desc: "Deploy new fixture to field", color: "bg-blue-600" },
              { label: "Force Sync Scores", icon: RefreshCw, desc: "Manual API score override", color: "bg-slate-800" },
              { label: "Approve Official", icon: CheckCircle2, desc: "Finalize match report", color: "bg-emerald-600" },
              { label: "Engine Recalculate", icon: BarChart2, desc: "Update standings logic", color: "bg-purple-600" },
            ].map((action, i) => (
              <button 
                key={i}
                className="w-full glass-card p-5 border border-white/10 rounded-2xl hover:border-white/30 transition-all flex items-center gap-5 text-left group glass-reflection relative overflow-hidden smooth-refresh"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/10`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">{action.label}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">{action.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <div className="glass-card p-6 border border-white/10 rounded-2xl mt-8 glass-reflection relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Signal className="w-4 h-4 text-destructive animate-pulse" />
              Infrastructure Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-black uppercase tracking-widest">Operator Uplink</span>
                <span className="status-confirmed py-0.5">ENCRYPTED</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-black uppercase tracking-widest">Broadcast Feed</span>
                <span className="text-white font-black flex items-center gap-2">
                  <Wifi className="w-3 h-3 text-emerald-500" /> 1.2s Latency
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="w-3/4 h-full bg-gradient-to-r from-blue-600 to-emerald-500 animate-pulse" />
              </div>
              <p className="text-[9px] text-slate-600 italic mt-2 text-center uppercase font-black tracking-widest">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDashboard;
