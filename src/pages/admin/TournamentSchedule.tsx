import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Shield,
  AlertTriangle,
  Zap,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Settings,
  MoreVertical,
  CheckCircle2,
  Info,
  CalendarDays,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  endTime: string;
  venueId: string;
  commissionerId: string;
  refereeTeam: string[];
  group: string;
  category: string;
  status: "scheduled" | "live" | "completed";
}

interface Venue {
  id: string;
  name: string;
  status: "active" | "maintenance";
}

interface Commissioner {
  id: string;
  name: string;
  status: "available" | "busy";
}

// ==================== MOCK DATA ====================

const initialVenues: Venue[] = [
  { id: "V-001", name: "GBK Mini Field A", status: "active" },
  { id: "V-002", name: "GBK Mini Field B", status: "active" },
  { id: "V-003", name: "Senayan Training Ground", status: "active" },
];

const initialCommissioners: Commissioner[] = [
  { id: "C-001", name: "Pak Hadi Saputra", status: "available" },
  { id: "C-002", name: "Pak Joko Widodo", status: "available" },
  { id: "C-003", name: "Pak Surya Darma", status: "available" },
];

const initialMatches: Match[] = [
  {
    id: "M-101",
    homeTeam: "Garuda Muda FC",
    awayTeam: "Elang Jaya",
    startTime: "09:00",
    endTime: "09:30",
    venueId: "V-001",
    commissionerId: "C-001",
    refereeTeam: ["Ref 1", "Ref 2", "Ref 3"],
    group: "Group A",
    category: "U12 - 2014",
    status: "scheduled",
  },
  {
    id: "M-102",
    homeTeam: "Rajawali United",
    awayTeam: "Banteng FC",
    startTime: "09:00",
    endTime: "09:30",
    venueId: "V-002",
    commissionerId: "C-002",
    refereeTeam: ["Ref 4", "Ref 5", "Ref 6"],
    group: "Group A",
    category: "U12 - 2014",
    status: "scheduled",
  },
];

const timeSlots = [
  "08:00", "08:45", "09:30", "10:15", "11:00", "11:45", 
  "13:00", "13:45", "14:30", "15:15", "16:00", "16:45"
];

// ==================== COMPONENT ====================

const TournamentSchedule: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [selectedDate, setSelectedDate] = useState("2026-02-28");
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // Conflict Detection Logic
  const checkConflicts = (match: Match) => {
    const conflicts = [];

    // 1. Double Booking (Same Venue, Same Time)
    const venueConflict = matches.find(m => 
      m.id !== match.id && 
      m.venueId === match.venueId && 
      m.startTime === match.startTime
    );
    if (venueConflict) conflicts.push(`Venue ${initialVenues.find(v => v.id === match.venueId)?.name} is double booked at ${match.startTime}`);

    // 2. Same Team Consecutive Match (Less than 45 mins rest)
    const teamConflict = matches.find(m => 
      m.id !== match.id && 
      (m.homeTeam === match.homeTeam || m.awayTeam === match.homeTeam || m.homeTeam === match.awayTeam || m.awayTeam === match.awayTeam) &&
      m.startTime === match.startTime
    );
    if (teamConflict) conflicts.push(`One or both teams have concurrent matches at ${match.startTime}`);

    return conflicts;
  };

  const handleAutoGenerate = (type: "group" | "hybrid") => {
    setIsAutoGenerating(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: `Generating ${type} stage schedule...`,
        success: `${type === 'group' ? 'Group Stage' : 'Hybrid Stage'} schedule generated with optimized rest periods!`,
        error: "Failed to generate schedule.",
      }
    );
    setTimeout(() => setIsAutoGenerating(false), 2500);
  };

  const handleDropMatch = (matchId: string, newTime: string, newVenueId: string) => {
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, startTime: newTime, venueId: newVenueId };
      }
      return m;
    });
    setMatches(updatedMatches);
    toast.success("Match slot reassigned");
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-950 min-h-screen font-montserrat text-slate-300 page-fade-in">
      
      {/* ── HEADER / CONTROLS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/40 p-6 rounded-2xl border border-white/5 glass-reflection relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-destructive to-emerald-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
        <div>
          <h1 className="text-3xl font-oswald font-bold text-white uppercase tracking-wider flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center shadow-2xl relative group overflow-hidden">
              <CalendarDays className="w-7 h-7 text-destructive relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
            </div>
            Match Scheduling Console
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            Tournament Command Center • Elite Scheduling System
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-900/80 p-1.5 rounded-xl border border-white/10 flex shadow-2xl">
            <button 
              onClick={() => setView("daily")}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${view === 'daily' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-600 hover:text-white'}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setView("weekly")}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${view === 'weekly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-600 hover:text-white'}`}
            >
              Weekly
            </button>
          </div>

          <div className="h-10 w-px bg-white/5 mx-2 hidden lg:block" />

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleAutoGenerate("group")}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 hover:border-blue-500/50 transition-all group micro-tap"
            >
              <Zap className="w-4 h-4 text-amber-500 group-hover:animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              Auto-Gen Group
            </button>
            <button 
              onClick={() => handleAutoGenerate("hybrid")}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 hover:border-purple-500/50 transition-all group micro-tap"
            >
              <Shield className="w-4 h-4 text-purple-500 group-hover:animate-bounce shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              Auto-Gen Hybrid
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ── CALENDAR VIEW ── */}
        <div className="xl:col-span-3 space-y-5">
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden glass-reflection relative">
            <div className="bg-slate-900/80 p-5 border-b border-white/10 flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all border border-white/5 group micro-tap">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <h2 className="text-xl font-oswald font-bold text-white uppercase tracking-[0.1em] flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-blue-500" />
                  February 28, 2026
                </h2>
                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all border border-white/5 group micro-tap">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="status-confirmed py-1 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Engine Synced
                </span>
                <div className="w-px h-5 bg-white/5 mx-2" />
                <button className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-900/40 micro-tap">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-950/20">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-950/80">
                    <th className="p-5 border border-white/5 w-28 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Operation Time</th>
                    {initialVenues.map(venue => (
                      <th key={venue.id} className="p-5 border border-white/5 min-w-[320px]">
                        <div className="flex items-center justify-center gap-3">
                          <MapPin className="w-4 h-4 text-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                          <span className="text-sm font-oswald font-bold text-white uppercase tracking-widest">{venue.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, i) => (
                    <tr key={time} className="group smooth-refresh" style={{ animationDelay: `${i * 0.05}s` }}>
                      <td className="p-5 border border-white/5 text-center bg-slate-900/40 relative">
                        <span className="text-sm font-oswald font-bold text-slate-400 led-display-blue opacity-70 group-hover:opacity-100 transition-opacity">{time}</span>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                      {initialVenues.map(venue => {
                        const match = matches.find(m => m.startTime === time && m.venueId === venue.id);
                        const conflicts = match ? checkConflicts(match) : [];

                        return (
                          <td 
                            key={`${time}-${venue.id}`} 
                            className={`p-3 border border-white/5 min-h-[120px] transition-all relative ${match ? 'bg-slate-900/20' : 'hover:bg-blue-600/5 cursor-pointer group/cell'}`}
                            onClick={() => !match && toast.info(`Scheduling match for ${time} at ${venue.name}`)}
                          >
                            {match ? (
                              <div className={`relative p-5 rounded-2xl border transition-all duration-500 group/match glass-reflection overflow-hidden ${
                                conflicts.length > 0 
                                  ? 'border-destructive/50 bg-destructive/10 neon-border-red' 
                                  : 'border-white/10 bg-slate-800/40 hover:border-blue-500/50 hover:bg-slate-800/60 shadow-2xl'
                              }`}>
                                <div className="flex items-center justify-between mb-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                                    conflicts.length > 0 ? 'bg-destructive/20 text-white border-destructive/40' : 'bg-blue-600/10 text-blue-400 border-blue-600/30'
                                  }`}>
                                    {match.group}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button className="p-1.5 bg-slate-900/80 hover:bg-slate-700 rounded-lg transition-all opacity-0 group-hover/match:opacity-100 border border-white/5"><Edit3 className="w-3.5 h-3.5 text-slate-400 hover:text-white" /></button>
                                    <button className="p-1.5 bg-slate-900/80 hover:bg-red-900/50 text-red-400 rounded-lg transition-all opacity-0 group-hover/match:opacity-100 border border-white/5"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                  <p className="text-base font-oswald font-bold text-white uppercase tracking-tight truncate drop-shadow-lg">{match.homeTeam}</p>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-white/5" />
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] italic">vs</p>
                                    <div className="flex-1 h-px bg-white/5" />
                                  </div>
                                  <p className="text-base font-oswald font-bold text-white uppercase tracking-tight truncate drop-shadow-lg">{match.awayTeam}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5 bg-slate-900/20 -mx-5 px-5 -mb-5 pb-5">
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-white/5 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest shadow-inner" title="Commissioner">
                                    <Shield className="w-3.5 h-3.5 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> 
                                    {initialCommissioners.find(c => c.id === match.commissionerId)?.name.split(' ')[1]}
                                  </div>
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-white/5 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest shadow-inner" title="Referees">
                                    <Users className="w-3.5 h-3.5 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> 
                                    Squad Delta
                                  </div>
                                </div>

                                {conflicts.length > 0 && (
                                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-destructive rounded-full flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.6)] cursor-help border-2 border-white/10 z-20" title={conflicts.join('\n')}>
                                    <AlertTriangle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-full min-h-[100px] flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all duration-300 group/btn">
                                <button className="p-3 bg-blue-600 rounded-2xl text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover/btn:scale-110 transition-transform"><Plus className="w-6 h-6" /></button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR / CONFLICTS & STATS ── */}
        <div className="space-y-6">
          {/* Conflict Warning System */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl relative overflow-hidden glass-reflection shadow-2xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
              Operational Risks (CWS)
            </h3>
            
            <div className="space-y-4">
              {matches.some(m => checkConflicts(m).length > 0) ? (
                matches.flatMap(m => checkConflicts(m)).map((conflict, i) => (
                  <div key={i} className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex gap-4 items-start animate-slide-up relative overflow-hidden group">
                    <div className="absolute inset-0 bg-destructive/5 animate-pulse group-hover:bg-destructive/10 transition-colors" />
                    <Info className="w-5 h-5 text-destructive mt-0.5 shrink-0 relative z-10 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                    <p className="text-[10px] font-black text-destructive leading-relaxed uppercase tracking-widest relative z-10">{conflict}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative z-10">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Grid Operational</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">Zero conflicts detected in current schedule cycle.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling Rules */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl glass-reflection relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-500" />
              Engine Config
            </h3>
            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3 group-hover:text-slate-400 transition-colors">Match Duration Cycle</label>
                <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-white/5 shadow-inner">
                  <span className="text-sm font-oswald font-bold text-white tracking-widest uppercase">2 x 15 Min</span>
                  <span className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-600/30 font-black uppercase">Standard</span>
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3 group-hover:text-slate-400 transition-colors">Safety Rest Buffer</label>
                <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-white/5 shadow-inner">
                  <span className="text-sm font-oswald font-bold text-white tracking-widest uppercase">45 Minutes</span>
                  <Clock className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 border border-white/10 rounded-2xl glass-reflection hover:border-white/30 transition-all group">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">Operation Slots</p>
              <p className="text-3xl font-oswald font-bold text-white group-hover:scale-110 transition-transform origin-left drop-shadow-lg">36</p>
            </div>
            <div className="glass-card p-5 border border-white/10 rounded-2xl glass-reflection hover:border-white/30 transition-all group">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">Assignments</p>
              <p className="text-3xl font-oswald font-bold text-blue-500 group-hover:scale-110 transition-transform origin-left drop-shadow-lg led-display-blue">18</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentSchedule;
