import React, { useState, useEffect } from "react";
import {
  Trophy,
  ChevronRight,
  Shield,
  Star,
  Target,
  Zap,
  Award,
  Medal,
  Table,
  GitBranch,
  Settings2,
  AlertCircle,
  History,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  ArrowUpRight,
  MoreVertical,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface StandingTeam {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  fairPlayPoints: number;
  points: number;
  h2hPoints?: number; // Simplified H2H mock data
}

interface GroupStandings {
  groupName: string;
  teams: StandingTeam[];
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  detail: string;
}

// ==================== MOCK DATA ====================

const initialGroupA: GroupStandings = {
  groupName: "Group A",
  teams: [
    { id: "T1", name: "Garuda Muda FC", played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 8, goalsAgainst: 2, fairPlayPoints: 12, points: 7, h2hPoints: 0 },
    { id: "T2", name: "Elang Jaya", played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 6, goalsAgainst: 4, fairPlayPoints: 10, points: 6, h2hPoints: 0 },
    { id: "T3", name: "Rajawali United", played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 4, goalsAgainst: 5, fairPlayPoints: 8, points: 4, h2hPoints: 0 },
    { id: "T4", name: "Banteng FC", played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 1, goalsAgainst: 8, fairPlayPoints: 15, points: 0, h2hPoints: 0 },
  ],
};

const initialGroupB: GroupStandings = {
  groupName: "Group B",
  teams: [
    { id: "T5", name: "Macan Kumbang FC", played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 7, goalsAgainst: 3, fairPlayPoints: 11, points: 7, h2hPoints: 0 },
    { id: "T6", name: "Harimau FC", played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, fairPlayPoints: 9, points: 6, h2hPoints: 0 },
    { id: "T7", name: "Naga Emas", played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 4, goalsAgainst: 6, fairPlayPoints: 14, points: 3, h2hPoints: 0 },
    { id: "T8", name: "Singa Putih", played: 3, won: 0, drawn: 1, lost: 2, goalsFor: 2, goalsAgainst: 6, fairPlayPoints: 12, points: 1, h2hPoints: 0 },
  ],
};

const initialAuditLogs: AuditLogEntry[] = [
  { id: "L1", timestamp: "2026-02-28 14:22", action: "MANUAL_OVERRIDE", user: "SuperAdmin_01", detail: "Modified Group A - Garuda Muda Points (+1)" },
  { id: "L2", timestamp: "2026-02-28 15:05", action: "BRACKET_GENERATE", user: "Operator_Joko", detail: "Generated Quarterfinal Bracket for U12" },
];

// ==================== COMPONENT ====================

const TournamentBracket: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"standings" | "bracket" | "plate" | "audit">("standings");
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);
  const [standings, setStandings] = useState<GroupStandings[]>([initialGroupA, initialGroupB]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);

  // Sorting Logic: Points > GD > GS > H2H > FairPlay
  const sortTeams = (teams: StandingTeam[]) => {
    return [...teams].sort((a, b) => {
      // 1. Points
      if (b.points !== a.points) return b.points - a.points;
      
      // 2. Goal Difference
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      
      // 3. Goals Scored
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      
      // 4. Head-to-Head (using mock h2hPoints)
      if ((b.h2hPoints || 0) !== (a.h2hPoints || 0)) return (b.h2hPoints || 0) - (a.h2hPoints || 0);
      
      // 5. Fair Play Score (Lower score is better discipline)
      return a.fairPlayPoints - b.fairPlayPoints;
    });
  };

  const handleToggleOverride = () => {
    setIsOverrideEnabled(!isOverrideEnabled);
    if (!isOverrideEnabled) {
      toast.warning("Manual Override Enabled. All changes will be logged.");
    } else {
      toast.success("Manual Override Disabled. Standings Locked.");
    }
  };

  const handleManualEdit = (groupIdx: number, teamId: string, field: keyof StandingTeam, value: number) => {
    if (!isOverrideEnabled) return;
    
    const newStandings = [...standings];
    const group = newStandings[groupIdx];
    const team = group.teams.find(t => t.id === teamId);
    
    if (team) {
      (team[field] as any) = value;
      setStandings(newStandings);
      
      // Log Action
      const newLog: AuditLogEntry = {
        id: `L${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: "MANUAL_OVERRIDE",
        user: "Admin_Current",
        detail: `Modified ${group.groupName} - ${team.name} ${field} to ${value}`
      };
      setAuditLogs([newLog, ...auditLogs]);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-950 min-h-screen font-montserrat text-slate-300 page-fade-in">
      
      {/* ── HEADER / TABS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/40 p-6 rounded-2xl border border-white/5 glass-reflection relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-destructive to-emerald-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
        <div>
          <h1 className="text-3xl font-oswald font-bold text-white uppercase tracking-wider flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center shadow-2xl relative group overflow-hidden">
              <Trophy className="w-7 h-7 text-destructive relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
            </div>
            Tournament Management
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            Standings Control, Brackets, and Audit Monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-900/80 p-1.5 rounded-xl border border-white/10 flex shadow-2xl">
            {[
              { id: "standings", label: "Group Stage", icon: Table },
              { id: "bracket", label: "National Bracket", icon: GitBranch },
              { id: "plate", label: "Plate Bracket", icon: LayoutGrid },
              { id: "audit", label: "Audit Logs", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-600 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={handleToggleOverride}
            className={`flex items-center gap-3 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border group micro-tap ${
              isOverrideEnabled 
                ? "bg-destructive/20 border-destructive/50 text-destructive shadow-[0_0_20px_rgba(255,23,68,0.2)]" 
                : "bg-slate-900 border-white/10 text-slate-500 hover:border-white/20 hover:text-white"
            }`}
          >
            {isOverrideEnabled ? <Unlock className="w-4 h-4 animate-pulse" /> : <Lock className="w-4 h-4" />}
            Manual Override
          </button>
        </div>
      </div>

      {/* ── STANDINGS VIEW ── */}
      {activeTab === "standings" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
          {standings.map((group, groupIdx) => (
            <div key={group.groupName} className="glass-panel border border-white/10 rounded-2xl overflow-hidden group/panel hover:border-white/20 transition-all duration-500 glass-reflection shadow-2xl smooth-refresh" style={{ animationDelay: `${groupIdx * 0.1}s` }}>
              <div className="bg-slate-900/80 p-5 border-b border-white/10 flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full group-hover/panel:h-7 transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <h2 className="text-xl font-oswald font-bold text-white uppercase tracking-widest">{group.groupName}</h2>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-950 px-3 py-1.5 rounded-full border border-white/5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-blue-500" /> 
                  Live Operation Console
                </div>
              </div>

              <div className="overflow-x-auto bg-slate-950/20">
                <table className="w-full text-left border-collapse font-montserrat">
                  <thead>
                    <tr className="bg-slate-950/80">
                      <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] w-12 text-center">Pos</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Operational Unit</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">P</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">GF</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">GA</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">GD</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">FP</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortTeams(group.teams).map((team, i) => (
                      <tr key={team.id} className={`transition-all duration-300 group/row hover:bg-white/5 ${i < 2 ? 'bg-blue-600/5' : ''}`}>
                        <td className="p-5 text-center">
                          <span className={`text-sm font-oswald font-bold ${i < 2 ? 'text-blue-400 led-display-blue' : 'text-slate-700'}`}>{i + 1}</span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border transition-all duration-500 group-hover/row:scale-110 ${i < 2 ? 'border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'border-white/5'}`}>
                              <Shield className={`w-5 h-5 ${i < 2 ? 'text-blue-500' : 'text-slate-600'}`} />
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-tight group-hover/row:text-blue-400 transition-colors">{team.name}</span>
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <input 
                            type="number" 
                            disabled={!isOverrideEnabled}
                            value={team.played}
                            onChange={(e) => handleManualEdit(groupIdx, team.id, 'played', parseInt(e.target.value))}
                            className="w-12 bg-slate-900/50 rounded-lg py-1 border border-white/5 text-xs font-black text-center disabled:cursor-default focus:outline-none focus:border-blue-500/50 focus:text-blue-400 transition-all"
                          />
                        </td>
                        <td className="p-5 text-center">
                          <input 
                            type="number" 
                            disabled={!isOverrideEnabled}
                            value={team.goalsFor}
                            onChange={(e) => handleManualEdit(groupIdx, team.id, 'goalsFor', parseInt(e.target.value))}
                            className="w-12 bg-slate-900/50 rounded-lg py-1 border border-white/5 text-xs font-bold text-center disabled:cursor-default focus:outline-none focus:border-blue-500/50 focus:text-blue-400 text-slate-500 transition-all"
                          />
                        </td>
                        <td className="p-5 text-center">
                          <input 
                            type="number" 
                            disabled={!isOverrideEnabled}
                            value={team.goalsAgainst}
                            onChange={(e) => handleManualEdit(groupIdx, team.id, 'goalsAgainst', parseInt(e.target.value))}
                            className="w-12 bg-slate-900/50 rounded-lg py-1 border border-white/5 text-xs font-bold text-center disabled:cursor-default focus:outline-none focus:border-blue-500/50 focus:text-blue-400 text-slate-500 transition-all"
                          />
                        </td>
                        <td className="p-5 text-center text-xs font-black text-slate-400 group-hover/row:text-white transition-colors">{team.goalsFor - team.goalsAgainst}</td>
                        <td className="p-5 text-center">
                          <input 
                            type="number" 
                            disabled={!isOverrideEnabled}
                            value={team.fairPlayPoints}
                            onChange={(e) => handleManualEdit(groupIdx, team.id, 'fairPlayPoints', parseInt(e.target.value))}
                            className="w-12 bg-slate-900/50 rounded-lg py-1 border border-white/5 text-xs font-black text-amber-500/80 text-center disabled:cursor-default focus:outline-none focus:border-amber-500/50 transition-all"
                          />
                        </td>
                        <td className="p-5 text-center">
                          <input 
                            type="number" 
                            disabled={!isOverrideEnabled}
                            value={team.points}
                            onChange={(e) => handleManualEdit(groupIdx, team.id, 'points', parseInt(e.target.value))}
                            className={`w-14 bg-slate-900/80 rounded-lg py-1.5 border border-white/10 text-base font-oswald font-bold text-center disabled:cursor-default focus:outline-none focus:border-blue-500/50 ${i < 2 ? 'text-blue-400 led-display-blue' : 'text-white led-display'} transition-all`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── NATIONAL BRACKET VIEW ── */}
      {activeTab === "bracket" && (
        <div className="space-y-8 animate-fade-in relative">
          <div className="flex items-center justify-between bg-slate-900/40 p-5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-destructive rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <h2 className="text-xl font-oswald font-bold text-white uppercase tracking-widest">National Championship Tree</h2>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center gap-3 micro-tap glow-hover-blue">
                <Plus className="w-4 h-4" /> Auto-Deploy Bracket
              </button>
            </div>
          </div>

          <div className="flex items-start gap-12 overflow-x-auto pb-16 pt-8 min-h-[650px] scrollbar-hide">
            {/* Quarterfinals */}
            <div className="space-y-16 shrink-0">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] text-center mb-12 bg-slate-900/50 py-2 rounded-lg border border-white/5">Quarterfinals</h3>
              {[1, 2, 3, 4].map((m) => (
                <div key={m} className="w-72 glass-card border border-white/10 rounded-2xl overflow-hidden relative group hover:border-blue-500/30 transition-all duration-500 hover:translate-y-[-6px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] glass-reflection smooth-refresh" style={{ animationDelay: `${m * 0.1}s` }}>
                  <div className="p-5 space-y-4 bg-slate-950/20">
                    <div className="flex items-center justify-between opacity-50">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Signal QF-0{m}</span>
                      <span className="status-confirmed py-0.5 px-2 text-[8px]">LIVE OPS</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-3">
                          <Shield className="w-3.5 h-3.5 text-blue-500/50" />
                          <span className="text-xs font-bold text-white uppercase tracking-tight">Team Gamma 0{m*2-1}</span>
                        </div>
                        <span className="text-lg font-oswald font-bold text-blue-400 led-display-blue">2</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-3">
                          <Shield className="w-3.5 h-3.5 text-blue-500/50" />
                          <span className="text-xs font-bold text-white uppercase tracking-tight">Team Delta 0{m*2}</span>
                        </div>
                        <span className="text-lg font-oswald font-bold text-blue-400 led-display-blue">1</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 group-hover:bg-blue-600 transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                </div>
              ))}
            </div>

            {/* Semifinals */}
            <div className="space-y-36 shrink-0 pt-32">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] text-center mb-12 bg-slate-900/50 py-2 rounded-lg border border-white/5">Semifinals</h3>
              {[1, 2].map((m) => (
                <div key={m} className="w-72 glass-card border border-white/10 rounded-2xl overflow-hidden relative group hover:border-purple-500/30 transition-all duration-500 hover:translate-y-[-6px] glass-reflection smooth-refresh" style={{ animationDelay: `${m * 0.2}s` }}>
                  <div className="p-5 space-y-4 bg-slate-950/20">
                    <div className="flex items-center justify-between opacity-50">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">Signal SF-0{m}</span>
                      <span className="status-pending py-0.5 px-2 text-[8px]">SCHEDULED</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-purple-500/20 transition-all">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">TBD Winner QF-{m*2-1}</span>
                        <span className="text-lg font-oswald font-bold text-purple-400 opacity-50">-</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-purple-500/20 transition-all">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">TBD Winner QF-{m*2}</span>
                        <span className="text-lg font-oswald font-bold text-purple-400 opacity-50">-</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 group-hover:bg-purple-600 transition-all duration-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
                </div>
              ))}
            </div>

            {/* Final */}
            <div className="space-y-32 shrink-0 pt-56">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] text-center mb-12 bg-slate-900/50 py-2 rounded-lg border border-white/5">Grand Final</h3>
              <div className="w-80 glass-card border border-destructive/40 rounded-2xl overflow-hidden relative group neon-border-red transition-all duration-700 hover:scale-[1.05] shadow-[0_0_60px_rgba(255,23,68,0.2)] glass-reflection smooth-refresh">
                <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
                <div className="p-8 space-y-6 relative z-10 bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-destructive/20 border border-destructive/40 flex items-center justify-center shadow-2xl">
                      <Trophy className="w-7 h-7 text-destructive animate-bounce-slow" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-destructive tracking-[0.5em] animate-pulse">Championship Match</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/5 group-hover:border-destructive/30 transition-all">
                      <span className="text-sm font-oswald font-bold text-white uppercase tracking-[0.1em]">TBD Winner SF-01</span>
                      <span className="text-2xl font-oswald font-bold text-destructive led-display">-</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/5 group-hover:border-destructive/30 transition-all">
                      <span className="text-sm font-oswald font-bold text-white uppercase tracking-[0.1em]">TBD Winner SF-02</span>
                      <span className="text-2xl font-oswald font-bold text-destructive led-display">-</span>
                    </div>
                  </div>
                </div>
                <div className="h-3 w-full bg-destructive shadow-[0_0_30px_rgba(255,23,68,0.8)]" />
              </div>

              {/* 3rd Place */}
              <div className="mt-16 space-y-6 flex flex-col items-center">
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">3rd Place Ops</h3>
                <div className="w-72 glass-card border border-amber-500/20 rounded-2xl overflow-hidden opacity-60 hover:opacity-100 transition-all duration-500 glass-reflection">
                  <div className="p-5 space-y-3 bg-slate-950/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">SF-01 Defeated</span>
                      <span className="text-lg font-oswald font-bold text-amber-500 opacity-50">-</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">SF-02 Defeated</span>
                      <span className="text-lg font-oswald font-bold text-amber-500 opacity-50">-</span>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-amber-500/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PLATE BRACKET VIEW ── */}
      {activeTab === "plate" && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between bg-slate-900/40 p-5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <h2 className="text-xl font-oswald font-bold text-white uppercase tracking-widest">Plate Championship Ops</h2>
            </div>
          </div>

          <div className="flex items-start gap-12 overflow-x-auto pb-16 pt-12 min-h-[500px] scrollbar-hide">
            {/* Semifinals */}
            <div className="space-y-28 shrink-0 pt-16">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] text-center mb-12 bg-slate-900/50 py-2 rounded-lg border border-white/5">Plate Semifinals</h3>
              {[1, 2].map((m) => (
                <div key={m} className="w-72 glass-card border border-white/10 rounded-2xl overflow-hidden relative group hover:border-amber-500/30 transition-all duration-500 hover:translate-y-[-6px] glass-reflection smooth-refresh" style={{ animationDelay: `${m * 0.1}s` }}>
                  <div className="p-5 space-y-4 bg-slate-950/20">
                    <div className="flex items-center justify-between opacity-50">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Signal P-SF-0{m}</span>
                      <span className="status-pending py-0.5 px-2 text-[8px]">WAITING</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-amber-500/20 transition-all">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Group A 3rd</span>
                        <span className="text-lg font-oswald font-bold text-amber-500 opacity-50">-</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-amber-500/20 transition-all">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Group B 4th</span>
                        <span className="text-lg font-oswald font-bold text-amber-500 opacity-50">-</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 group-hover:bg-amber-500 transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                </div>
              ))}
            </div>

            {/* Plate Final */}
            <div className="space-y-16 shrink-0 pt-40">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] text-center mb-12 bg-slate-900/50 py-2 rounded-lg border border-white/5">Plate Final</h3>
              <div className="w-80 glass-card border border-amber-500/40 rounded-2xl overflow-hidden relative group hover:scale-[1.05] transition-all duration-700 shadow-[0_0_40px_rgba(245,158,11,0.1)] glass-reflection smooth-refresh">
                <div className="p-6 space-y-5 bg-slate-950/40 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-xl">
                      <Award className="w-6 h-6 text-amber-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Consolation Final</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/5 group-hover:border-amber-500/30 transition-all">
                      <span className="text-sm font-oswald font-bold text-white uppercase tracking-wider">Winner P-SF-01</span>
                      <span className="text-xl font-oswald font-bold text-amber-500 opacity-50">-</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/5 group-hover:border-amber-500/30 transition-all">
                      <span className="text-sm font-oswald font-bold text-white uppercase tracking-wider">Winner P-SF-02</span>
                      <span className="text-xl font-oswald font-bold text-amber-500 opacity-50">-</span>
                    </div>
                  </div>
                </div>
                <div className="h-2 w-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOGS VIEW ── */}
      {activeTab === "audit" && (
        <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden animate-fade-in glass-reflection shadow-2xl smooth-refresh">
          <div className="bg-slate-900/80 p-6 border-b border-white/10 flex items-center justify-between backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <h2 className="text-xl font-oswald font-bold text-white uppercase tracking-widest">Command Audit Stream</h2>
            </div>
            <button className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] hover:text-blue-300 transition-colors flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Force Flush History
            </button>
          </div>
          <div className="p-3 divide-y divide-white/5 bg-slate-950/20">
            {auditLogs.map((log, i) => (
              <div key={log.id} className="p-5 hover:bg-white/5 transition-all rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 group smooth-refresh" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start gap-5">
                  <div className={`p-3 rounded-xl shrink-0 transition-all duration-500 group-hover:scale-110 shadow-2xl border ${log.action === 'MANUAL_OVERRIDE' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-blue-600/10 text-blue-400 border-blue-600/20'}`}>
                    {log.action === 'MANUAL_OVERRIDE' ? <AlertCircle className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">{log.detail}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="text-slate-700">SIG_ID:</span> {log.id} 
                      </p>
                      <span className="text-slate-800 font-black">|</span>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="text-slate-700">OPERATOR:</span> <span className="text-slate-400">{log.user}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] bg-slate-900 px-4 py-2 rounded-xl border border-white/5 shrink-0 group-hover:text-white group-hover:border-white/10 transition-all shadow-inner">
                  <Clock className="w-4 h-4 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;
