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
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-950 min-h-screen font-montserrat text-slate-300">
      
      {/* ── HEADER / CONTROLS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-white uppercase tracking-wider flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-destructive" />
            Match Scheduling Console
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Tournament Command Center • Elite Scheduling System</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900/50 p-1 rounded-xl border border-white/10 flex">
            <button 
              onClick={() => setView("daily")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition ${view === 'daily' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-white'}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setView("weekly")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition ${view === 'weekly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-white'}`}
            >
              Weekly
            </button>
          </div>

          <div className="h-10 w-px bg-white/10 mx-2" />

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleAutoGenerate("group")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 hover:border-blue-500/50 transition group"
            >
              <Zap className="w-4 h-4 text-amber-500 group-hover:animate-pulse" />
              Auto-Gen Group
            </button>
            <button 
              onClick={() => handleAutoGenerate("hybrid")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 hover:border-purple-500/50 transition group"
            >
              <Shield className="w-4 h-4 text-purple-500 group-hover:animate-pulse" />
              Auto-Gen Hybrid
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ── CALENDAR VIEW ── */}
        <div className="xl:col-span-3 space-y-4">
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
            <div className="bg-slate-900/80 p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"><ChevronLeft className="w-5 h-5" /></button>
                <h2 className="text-lg font-oswald font-bold text-white uppercase tracking-widest">February 28, 2026</h2>
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase">
                  <CheckCircle2 className="w-3 h-3" /> System Optimized
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-950">
                    <th className="p-4 border border-white/5 w-24 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-center">Time</th>
                    {initialVenues.map(venue => (
                      <th key={venue.id} className="p-4 border border-white/5 min-w-[300px]">
                        <div className="flex items-center justify-center gap-2">
                          <MapPin className="w-4 h-4 text-destructive" />
                          <span className="text-xs font-oswald font-bold text-white uppercase tracking-widest">{venue.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time} className="group">
                      <td className="p-4 border border-white/5 text-center bg-slate-900/30">
                        <span className="text-xs font-oswald font-bold text-slate-400">{time}</span>
                      </td>
                      {initialVenues.map(venue => {
                        const match = matches.find(m => m.startTime === time && m.venueId === venue.id);
                        const conflicts = match ? checkConflicts(match) : [];

                        return (
                          <td 
                            key={`${time}-${venue.id}`} 
                            className={`p-2 border border-white/5 min-h-[100px] transition-colors ${match ? 'bg-slate-900/20' : 'hover:bg-blue-600/5 cursor-pointer'}`}
                            onClick={() => !match && toast.info(`Scheduling match for ${time} at ${venue.name}`)}
                          >
                            {match ? (
                              <div className={`relative p-4 rounded-xl border transition-all duration-300 group/match ${conflicts.length > 0 ? 'border-destructive/50 bg-destructive/5' : 'border-white/10 bg-slate-800/50 hover:border-blue-500/50'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{match.group}</span>
                                  <div className="flex items-center gap-1">
                                    <button className="p-1 hover:bg-slate-700 rounded transition opacity-0 group-hover/match:opacity-100"><Edit3 className="w-3 h-3" /></button>
                                    <button className="p-1 hover:bg-red-900/50 text-red-400 rounded transition opacity-0 group-hover/match:opacity-100"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                </div>

                                <div className="space-y-1 mb-4">
                                  <p className="text-sm font-oswald font-bold text-white uppercase tracking-tight truncate">{match.homeTeam}</p>
                                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center py-0.5">VS</p>
                                  <p className="text-sm font-oswald font-bold text-white uppercase tracking-tight truncate">{match.awayTeam}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg text-[9px] font-bold text-slate-400" title="Commissioner">
                                    <Shield className="w-3 h-3" /> {initialCommissioners.find(c => c.id === match.commissionerId)?.name.split(' ')[1]}
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg text-[9px] font-bold text-slate-400" title="Referees">
                                    <Users className="w-3 h-3" /> Team Delta
                                  </div>
                                </div>

                                {conflicts.length > 0 && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-destructive/20 cursor-help" title={conflicts.join('\n')}>
                                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-full min-h-[80px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-900/40"><Plus className="w-4 h-4" /></button>
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
          <div className="glass-panel p-5 border border-white/10 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Conflict Warning System
            </h3>
            
            <div className="space-y-3">
              {matches.some(m => checkConflicts(m).length > 0) ? (
                matches.flatMap(m => checkConflicts(m)).map((conflict, i) => (
                  <div key={i} className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3 items-start animate-slide-up">
                    <Info className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-[10px] font-bold text-destructive leading-relaxed uppercase tracking-wide">{conflict}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex flex-col items-center text-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">No Conflicts Detected</p>
                  <p className="text-[10px] text-slate-600 font-medium">All venues and teams have optimized slots.</p>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling Rules */}
          <div className="glass-panel p-5 border border-white/10 rounded-2xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" />
              Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Match Duration</label>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                  <span className="text-sm font-bold text-white">2 x 15 Minutes</span>
                  <span className="text-[10px] text-blue-500 font-bold uppercase">U12 Default</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Rest Period Min.</label>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                  <span className="text-sm font-bold text-white">45 Minutes</span>
                  <Clock className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 border border-white/10 rounded-xl">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Total Slots</p>
              <p className="text-xl font-oswald font-bold text-white">36</p>
            </div>
            <div className="glass-card p-4 border border-white/10 rounded-xl">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Assigned</p>
              <p className="text-xl font-oswald font-bold text-blue-500">18</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentSchedule;
