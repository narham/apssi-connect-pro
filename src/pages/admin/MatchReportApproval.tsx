import React, { useState } from "react";
import {
  ShieldCheck,
  Shield,
  Users,
  Trophy,
  Target,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronRight,
  User,
  Zap,
  History,
  Lock,
  Unlock,
  FileText,
  Stamp,
  Check,
  X,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface MatchEvent {
  id: string;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
  minute: number;
  player: string;
  detail?: string;
  team: "home" | "away";
}

interface PlayerStat {
  id: string;
  name: string;
  number: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
}

// ==================== MOCK DATA ====================

const matchInfo = {
  id: "M-101",
  homeTeam: "Garuda Muda FC",
  awayTeam: "Elang Jaya",
  homeScore: 3,
  awayScore: 1,
  venue: "Stadium Gelora Bung Karno",
  date: "Feb 28, 2026",
  time: "19:00",
  commissioner: "Pak Hadi Saputra",
  referee: "Budi Santoso",
  status: "pending_review",
};

const homeLineup: PlayerStat[] = [
  { id: "P1", name: "Ahmad Rizki", number: 10, goals: 2, assists: 0, yellowCards: 0, redCards: 0, minutes: 30 },
  { id: "P2", name: "Budi Hartono", number: 7, goals: 1, assists: 1, yellowCards: 1, redCards: 0, minutes: 30 },
  { id: "P3", name: "Fajar Maulana", number: 1, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 30 },
  { id: "P4", name: "Dimas Arya", number: 4, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 30 },
  { id: "P5", name: "Rizki Fauzan", number: 5, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 30 },
];

const awayLineup: PlayerStat[] = [
  { id: "P6", name: "Andi Pratama", number: 9, goals: 1, assists: 0, yellowCards: 0, redCards: 0, minutes: 30 },
  { id: "P7", name: "Siti Nurhaliza", number: 8, goals: 0, assists: 1, yellowCards: 0, redCards: 0, minutes: 30 },
  { id: "P8", name: "Joko Kusuma", number: 1, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 30 },
  { id: "P9", name: "Farhan Yusuf", number: 3, goals: 0, assists: 0, yellowCards: 1, redCards: 0, minutes: 30 },
  { id: "P10", name: "Hendrik Wijaya", number: 6, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 30 },
];

const matchEvents: MatchEvent[] = [
  { id: "E1", type: "goal", minute: 12, player: "Ahmad Rizki", detail: "Assist by Budi Hartono", team: "home" },
  { id: "E2", type: "goal", minute: 18, player: "Andi Pratama", detail: "Assist by Siti Nurhaliza", team: "away" },
  { id: "E3", type: "yellow_card", minute: 22, player: "Budi Hartono", team: "home" },
  { id: "E4", type: "goal", minute: 25, player: "Ahmad Rizki", team: "home" },
  { id: "E5", type: "goal", minute: 28, player: "Budi Hartono", team: "home" },
  { id: "E6", type: "yellow_card", minute: 29, player: "Farhan Yusuf", team: "away" },
];

// ==================== COMPONENT ====================

const MatchReportApproval: React.FC = () => {
  const [status, setStatus] = useState<"pending_review" | "approved" | "revision_requested" | "flagged">(matchInfo.status as any);
  const [isLocked, setIsLocked] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [scoreValidated, setScoreValidated] = useState(false);
  const [refereeConfirmed, setRefereeConfirmed] = useState(false);

  const handleApprove = () => {
    if (!isSigned || !scoreValidated || !refereeConfirmed) {
      toast.error("Please complete all verification steps first.");
      return;
    }
    setStatus("approved");
    setIsLocked(true);
    toast.success("Match report approved. Results are now official and locked.");
  };

  const handleRevision = () => {
    setStatus("revision_requested");
    toast.info("Revision request sent to Match Commissioner.");
  };

  const handleFlag = () => {
    setStatus("flagged");
    toast.warning("Report flagged for senior administrative review.");
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-950 min-h-screen font-montserrat text-slate-300 page-fade-in">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/40 p-6 rounded-2xl border border-white/5 glass-reflection">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-900 rounded-xl transition border border-white/5 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-oswald font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                Match Report Approval
              </h1>
              <span className={`status-${status === 'approved' ? 'confirmed' : status === 'pending_review' ? 'pending' : 'flagged'} ${status === 'pending_review' ? 'animate-pulse' : ''}`}>
                <div className={status === 'pending_review' ? 'live-pulse' : ''} />
                {status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium flex items-center gap-2">
              <Target className="w-3 h-3 text-destructive" />
              Tournament ID: {matchInfo.id} • {matchInfo.venue}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isLocked && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-emerald-500 neon-border-green">
              <Lock className="w-4 h-4" />
              Official & Locked
            </div>
          )}
          {!isLocked && (
            <>
              <button 
                onClick={handleFlag}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-destructive/10 hover:border-destructive/50 transition text-slate-400 hover:text-destructive micro-tap"
              >
                <AlertTriangle className="w-4 h-4" />
                Flag Report
              </button>
              <button 
                onClick={handleRevision}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600/10 hover:border-blue-500/50 transition text-slate-400 hover:text-blue-400 micro-tap"
              >
                <MessageSquare className="w-4 h-4" />
                Request Revision
              </button>
              <button 
                onClick={handleApprove}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow-lg shadow-blue-900/40 micro-tap glow-hover-blue"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Result
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* ── LEFT COLUMN: MATCH SUMMARY & LINEUPS ── */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Score & Venue Card */}
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden relative glass-reflection">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-destructive to-emerald-500" />
            <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-12 bg-slate-900/20">
              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-900 mx-auto mb-4 border border-white/5 flex items-center justify-center shadow-2xl relative">
                  <Shield className="w-12 h-12 text-blue-500" />
                  <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-pulse" />
                </div>
                <h3 className="text-2xl font-oswald font-bold text-white uppercase tracking-wider">{matchInfo.homeTeam}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Primary Home</p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="text-8xl led-display text-white flex items-center gap-10">
                  <span className="led-display-blue">{matchInfo.homeScore}</span>
                  <span className="text-slate-800 opacity-50 font-oswald">:</span>
                  <span className="led-display">{matchInfo.awayScore}</span>
                </div>
                <div className="px-6 py-2 bg-slate-950 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                  <div className="live-pulse" />
                  Official Full Time
                </div>
              </div>

              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-900 mx-auto mb-4 border border-white/5 flex items-center justify-center shadow-2xl relative">
                  <Shield className="w-12 h-12 text-destructive" />
                  <div className="absolute inset-0 rounded-full border border-destructive/20 animate-pulse" />
                </div>
                <h3 className="text-2xl font-oswald font-bold text-white uppercase tracking-wider">{matchInfo.awayTeam}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Primary Away</p>
              </div>
            </div>
          </div>

          {/* Lineups & Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Home Lineup */}
            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden glass-reflection group">
              <div className="bg-slate-900/80 p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <h2 className="text-sm font-oswald font-bold text-white uppercase tracking-widest">{matchInfo.homeTeam} Squad</h2>
                </div>
                <Users className="w-4 h-4 text-slate-600" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-montserrat">
                  <thead>
                    <tr className="bg-slate-950/50">
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest w-12">No</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Operator Name</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center">G</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center">A</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center w-12">YC</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center w-12">RC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {homeLineup.map((player) => (
                      <tr key={player.id} className="hover:bg-blue-600/5 transition-colors group/row">
                        <td className="p-4 text-xs font-bold text-slate-500 group-hover/row:text-blue-400 transition-colors">#{player.number}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">{player.name}</span>
                        </td>
                        <td className="p-4 text-center text-xs font-bold text-blue-400 led-display-blue">{player.goals || "-"}</td>
                        <td className="p-4 text-center text-xs font-bold text-slate-400">{player.assists || "-"}</td>
                        <td className="p-4 text-center">
                          {player.yellowCards > 0 && <div className="w-3.5 h-4.5 bg-amber-400 rounded-sm mx-auto shadow-[0_0_12px_rgba(251,191,36,0.4)] border border-amber-300/30" />}
                        </td>
                        <td className="p-4 text-center">
                          {player.redCards > 0 && <div className="w-3.5 h-4.5 bg-destructive rounded-sm mx-auto shadow-[0_0_12px_rgba(255,23,68,0.4)] border border-red-300/30" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Away Lineup */}
            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden glass-reflection group">
              <div className="bg-slate-900/80 p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-destructive rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <h2 className="text-sm font-oswald font-bold text-white uppercase tracking-widest">{matchInfo.awayTeam} Squad</h2>
                </div>
                <Users className="w-4 h-4 text-slate-600" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-montserrat">
                  <thead>
                    <tr className="bg-slate-950/50">
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest w-12">No</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Operator Name</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center">G</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center">A</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center w-12">YC</th>
                      <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center w-12">RC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {awayLineup.map((player) => (
                      <tr key={player.id} className="hover:bg-destructive/5 transition-colors group/row">
                        <td className="p-4 text-xs font-bold text-slate-500 group-hover/row:text-destructive transition-colors">#{player.number}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">{player.name}</span>
                        </td>
                        <td className="p-4 text-center text-xs font-bold text-destructive led-display">{player.goals || "-"}</td>
                        <td className="p-4 text-center text-xs font-bold text-slate-400">{player.assists || "-"}</td>
                        <td className="p-4 text-center">
                          {player.yellowCards > 0 && <div className="w-3.5 h-4.5 bg-amber-400 rounded-sm mx-auto shadow-[0_0_12px_rgba(251,191,36,0.4)] border border-amber-300/30" />}
                        </td>
                        <td className="p-4 text-center">
                          {player.redCards > 0 && <div className="w-3.5 h-4.5 bg-destructive rounded-sm mx-auto shadow-[0_0_12px_rgba(255,23,68,0.4)] border border-red-300/30" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Goals & Events Timeline */}
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden glass-reflection">
            <div className="bg-slate-900/80 p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <h2 className="text-sm font-oswald font-bold text-white uppercase tracking-widest">Match Operations Timeline</h2>
              </div>
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <div className="p-8 relative bg-slate-950/20">
              <div className="absolute left-[50%] top-8 bottom-8 w-px bg-white/5 hidden md:block" />
              <div className="space-y-12">
                {matchEvents.map((event) => (
                  <div key={event.id} className={`flex items-center gap-8 ${event.team === 'home' ? 'md:flex-row' : 'md:flex-row-reverse'} smooth-refresh`}>
                    <div className="flex-1 hidden md:block" />
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-full bg-slate-900 border-2 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 ${
                        event.type === 'goal' ? 'border-emerald-500/50 text-emerald-500 shadow-emerald-500/10' :
                        event.type === 'yellow_card' ? 'border-amber-500/50 text-amber-500 shadow-amber-500/10' :
                        'border-destructive/50 text-destructive shadow-destructive/10'
                      }`}>
                        {event.type === 'goal' && <Target className="w-6 h-6" />}
                        {event.type === 'yellow_card' && <div className="w-4 h-5 bg-amber-400 rounded-sm" />}
                        {event.type === 'red_card' && <div className="w-4 h-5 bg-destructive rounded-sm" />}
                      </div>
                      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 font-oswald bg-slate-900 px-2 rounded-full border border-white/5">
                        {event.minute}'
                      </div>
                    </div>
                    <div className={`flex-1 ${event.team === 'home' ? 'text-left' : 'md:text-right'}`}>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{event.player}</p>
                      {event.detail && <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">{event.detail}</p>}
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2 ${event.team === 'home' ? 'text-blue-500' : 'md:flex-row-reverse text-destructive'}`}>
                        <div className={`w-1 h-3 rounded-full ${event.team === 'home' ? 'bg-blue-500' : 'bg-destructive'}`} />
                        {event.team === 'home' ? matchInfo.homeTeam : matchInfo.awayTeam}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: VERIFICATION SECTION ── */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-white/10 rounded-2xl relative overflow-hidden h-full glass-reflection">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Stamp className="w-4 h-4 text-blue-500" />
              Official Verification
            </h3>

            <div className="space-y-8">
              {/* Score Validation */}
              <div 
                onClick={() => !isLocked && setScoreValidated(!scoreValidated)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                  scoreValidated ? 'bg-emerald-500/10 border-emerald-500/30 neon-border-green' : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Match Outcome Validation</span>
                  {scoreValidated ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-white/5 group-hover:border-white/20 transition-colors" />}
                </div>
                <p className="text-3xl font-oswald font-bold text-white tracking-[0.2em] flex items-center gap-3">
                  <span className="led-display-blue">{matchInfo.homeScore}</span>
                  <span className="text-slate-700">-</span>
                  <span className="led-display">{matchInfo.awayScore}</span>
                </p>
                <p className="text-[9px] text-slate-600 mt-2 uppercase font-black tracking-widest group-hover:text-slate-500 transition-colors flex items-center gap-2">
                  <Check className="w-3 h-3 text-emerald-500" />
                  Manual Referee Cards Verified
                </p>
              </div>

              {/* Referee Confirmation */}
              <div 
                onClick={() => !isLocked && setRefereeConfirmed(!refereeConfirmed)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                  refereeConfirmed ? 'bg-emerald-500/10 border-emerald-500/30 neon-border-green' : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Referee Authentication</span>
                  {refereeConfirmed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-white/5 group-hover:border-white/20 transition-colors" />}
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-colors relative">
                    <User className="w-6 h-6 text-slate-400" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div>
                    <p className="text-sm font-oswald font-bold text-white uppercase tracking-wider">{matchInfo.referee}</p>
                    <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Head Match Official</p>
                  </div>
                </div>
              </div>

              {/* Commissioner Signature */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Stamp className="w-3 h-3" /> Digital Commissioner Seal
                </span>
                <div 
                  onClick={() => !isLocked && setIsSigned(!isSigned)}
                  className={`relative h-40 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group overflow-hidden ${
                    isSigned ? 'bg-white/5 border-emerald-500/30' : 'bg-slate-900/50 border-white/10 hover:border-blue-500/30'
                  }`}
                >
                  {isSigned ? (
                    <>
                      <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                      <p className="font-signature text-4xl text-emerald-400 opacity-80 rotate-[-3deg] relative z-10 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{matchInfo.commissioner}</p>
                      <div className="absolute top-3 right-3 flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/30 backdrop-blur-md">
                        <Zap className="w-2.5 h-2.5 animate-pulse" /> Certified Digital ID
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Stamp className="w-6 h-6 text-slate-700 group-hover:text-blue-500/50 transition-colors" />
                      </div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">Authorize official report</p>
                    </>
                  )}
                </div>
                <p className="text-[9px] text-slate-600 text-center italic leading-relaxed">Legal declaration: All recorded events are verified as official tournament record.</p>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administrative Log</span>
                  <History className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Report Finalized</p>
                      <p className="text-[9px] text-slate-600 font-medium">Feb 28, 21:15 • {matchInfo.commissioner}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-slate-700 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">System Integrity Check</p>
                      <p className="text-[9px] text-slate-600 font-medium">Feb 28, 21:20 • Automated Ops</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchReportApproval;
