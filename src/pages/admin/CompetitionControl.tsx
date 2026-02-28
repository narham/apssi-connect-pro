import React, { useState, useMemo } from "react";
import {
  Trophy,
  MapPin,
  ChevronRight,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  LayoutGrid,
  Zap,
  Filter,
  Search,
  Settings2,
  AlertCircle,
  Building2,
  Users,
  List,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Lock as LockIcon,
} from "lucide-react";
import { toast } from "sonner";

// ==================== INTERFACES ====================

type CompetitionLevel = "Kab/Kota" | "Provincial" | "National";
type QualificationStatus = "QUALIFIED" | "ELIMINATED" | "PENDING REVIEW";

interface TeamProgress {
  id: string;
  name: string;
  club: string;
  province: string;
  city: string;
  points: number;
  rank: number;
  status: QualificationStatus;
  currentLevel: CompetitionLevel;
  nextLevel?: CompetitionLevel;
}

interface LevelStat {
  level: CompetitionLevel;
  totalTeams: number;
  qualified: number;
  active: boolean;
  completion: number;
}

  // ==================== MOCK DATA ====================
  
  const initialTeams: TeamProgress[] = [
    { id: "T1", name: "Garuda Muda FC", club: "Garuda Academy", province: "DKI Jakarta", city: "Jakarta Pusat", points: 12, rank: 1, status: "QUALIFIED", currentLevel: "Provincial", nextLevel: "National" },
    { id: "T2", name: "Elang Jaya", club: "Elang United", province: "DKI Jakarta", city: "Jakarta Timur", points: 10, rank: 2, status: "QUALIFIED", currentLevel: "Provincial", nextLevel: "National" },
    { id: "T3", name: "Rajawali United", club: "Rajawali FC", province: "DKI Jakarta", city: "Jakarta Selatan", points: 9, rank: 3, status: "PENDING REVIEW", currentLevel: "Provincial" },
    { id: "T4", name: "Banteng FC", club: "Banteng Muda", province: "DKI Jakarta", city: "Jakarta Utara", points: 4, rank: 4, status: "ELIMINATED", currentLevel: "Provincial" },
    { id: "T5", name: "Macan Kumbang", club: "Macan Academy", province: "Jawa Barat", city: "Bandung", points: 15, rank: 1, status: "QUALIFIED", currentLevel: "Kab/Kota", nextLevel: "Provincial" },
    { id: "T6", name: "Singa Putih", club: "Singa Academy", province: "Jawa Barat", city: "Bandung", points: 11, rank: 2, status: "PENDING REVIEW", currentLevel: "Kab/Kota" },
    { id: "T8", name: "Elang Merah", club: "Elang FC", province: "Jawa Barat", city: "Bekasi", points: 10, rank: 3, status: "PENDING REVIEW", currentLevel: "Kab/Kota" },
    { id: "T7", name: "Naga Emas", club: "Naga Academy", province: "Jawa Timur", city: "Surabaya", points: 18, rank: 1, status: "QUALIFIED", currentLevel: "National" },
  ];

const levelStats: LevelStat[] = [
  { level: "Kab/Kota", totalTeams: 512, qualified: 128, active: false, completion: 100 },
  { level: "Provincial", totalTeams: 128, qualified: 32, active: true, completion: 65 },
  { level: "National", totalTeams: 32, qualified: 0, active: false, completion: 0 },
];

// ==================== COMPONENT ====================

const CompetitionControl: React.FC = () => {
  const [teams, setTeams] = useState<TeamProgress[]>(initialTeams);
  const [selectedLevel, setSelectedLevel] = useState<CompetitionLevel>("Provincial");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "grid">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Automatic Promotion Logic
  const handleAutoPromoteAll = () => {
    setIsProcessing(true);
    
    // Define rules for promotion
    const RANK_CUTOFF = 2;
    const POINTS_THRESHOLD = 9;

    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          const eligibleTeams = teams.filter(t => 
            t.currentLevel === selectedLevel && 
            t.status === "PENDING REVIEW" && 
            t.rank <= RANK_CUTOFF && 
            t.points >= POINTS_THRESHOLD
          );

          if (eligibleTeams.length === 0) {
            reject("No teams meet the promotion criteria (Rank <= 2 & Points >= 9).");
            return;
          }
          resolve(eligibleTeams.length);
        }, 2000);
      }),
      {
        loading: "Running promotion engine...",
        success: (count) => {
          setTeams(prev => prev.map(team => {
            if (
              team.currentLevel === selectedLevel && 
              team.status === "PENDING REVIEW" && 
              team.rank <= RANK_CUTOFF && 
              team.points >= POINTS_THRESHOLD
            ) {
              return { 
                ...team, 
                status: "QUALIFIED", 
                nextLevel: team.currentLevel === "Kab/Kota" ? "Provincial" : "National" 
              };
            }
            return team;
          }));
          setIsProcessing(false);
          return `Promotion complete! ${count} teams advanced.`;
        },
        error: (err) => {
          setIsProcessing(false);
          return err as string;
        },
      }
    );
  };

  const handlePromote = (teamId: string) => {
    setTeams(prev => prev.map(team => {
      if (team.id === teamId && team.status === "PENDING REVIEW") {
        toast.success(`${team.name} promoted!`);
        return { 
          ...team, 
          status: "QUALIFIED", 
          nextLevel: team.currentLevel === "Kab/Kota" ? "Provincial" : team.currentLevel === "Provincial" ? "National" : undefined
        };
      }
      return team;
    }));
  };

  const getStatusStyles = (status: QualificationStatus) => {
    switch (status) {
      case "QUALIFIED": return "status-confirmed"; // Green
      case "ELIMINATED": return "status-flagged"; // Red
      case "PENDING REVIEW": return "status-pending"; // Yellow
      default: return "";
    }
  };

  const getStatusTextStyles = (status: QualificationStatus) => {
    switch (status) {
      case "QUALIFIED": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "ELIMINATED": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "PENDING REVIEW": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const filteredTeams = useMemo(() => teams.filter(t => 
    t.currentLevel === selectedLevel && 
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.city.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [teams, selectedLevel, searchQuery]);

  const stats = useMemo(() => {
    const levelTeams = teams.filter(t => t.currentLevel === selectedLevel);
    return {
      qualified: levelTeams.filter(t => t.status === "QUALIFIED").length,
      pending: levelTeams.filter(t => t.status === "PENDING REVIEW").length,
      eliminated: levelTeams.filter(t => t.status === "ELIMINATED").length,
    };
  }, [teams, selectedLevel]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-950 min-h-screen font-montserrat text-slate-300 page-fade-in">
      
      {/* ── TOP BAR: QUALIFICATION PROGRESS TRACKER ── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] glass-reflection">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
        
        <div className="flex flex-col xl:flex-row items-center justify-between gap-10">
          <div className="shrink-0">
            <h1 className="text-3xl font-oswald font-bold text-white uppercase tracking-wider flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center shadow-2xl relative group overflow-hidden">
                <Trophy className="w-7 h-7 text-destructive relative z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
              </div>
              Competition Control
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isProcessing ? 'animate-spin' : ''}`} />
              Level Progression Console • Automated Engine
            </p>
          </div>

          {/* Flow Visualizer */}
          <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto pb-4 xl:pb-0 scrollbar-hide relative">
            {levelStats.map((stat, i) => (
              <React.Fragment key={stat.level}>
                <div className="flex flex-col items-center gap-4 relative z-10 group/stat">
                  <button 
                    onClick={() => setSelectedLevel(stat.level)}
                    className={`min-w-[200px] p-5 rounded-2xl border transition-all duration-500 group relative glass-reflection overflow-hidden ${
                      selectedLevel === stat.level 
                        ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.2)] neon-border-blue' 
                        : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-2xl ${
                        selectedLevel === stat.level ? 'bg-blue-600 text-white scale-110' : 'bg-slate-800 text-slate-600 group-hover:text-slate-400'
                      }`}>
                        {i === 0 ? <Building2 className="w-6 h-6" /> : i === 1 ? <MapPin className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                      </div>
                      <div className="text-left">
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedLevel === stat.level ? 'text-blue-400' : 'text-slate-600'}`}>Level 0{i + 1}</p>
                        <p className="text-base font-oswald font-bold text-white uppercase tracking-tight">{stat.level}</p>
                      </div>
                    </div>
                    {/* Completion Bar */}
                    <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ${selectedLevel === stat.level ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse' : 'bg-slate-700'}`}
                        style={{ width: `${stat.completion}%` }}
                      />
                    </div>
                    {stat.active && (
                      <div className="absolute top-2 right-2">
                        <div className="live-pulse" />
                      </div>
                    )}
                  </button>
                  <div className="flex flex-col items-center gap-1.5 opacity-60 group-hover/stat:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.completion}% Operation Sync</span>
                    <span className="text-[9px] font-black text-blue-500/80 uppercase tracking-widest bg-blue-600/5 px-2 py-0.5 rounded border border-blue-600/10">{stat.totalTeams} Units Active</span>
                  </div>
                </div>
                {i < levelStats.length - 1 && (
                  <div className="flex items-center justify-center min-w-[80px] relative h-24">
                    <div className={`absolute h-[2px] w-full top-1/2 -translate-y-1/2 transition-all duration-700 ${
                      selectedLevel === levelStats[i].level || selectedLevel === levelStats[i+1].level ? 'bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-slate-800'
                    }`} />
                    <ArrowRight className={`w-8 h-8 shrink-0 transition-all duration-500 relative z-10 ${
                      selectedLevel === levelStats[i].level || selectedLevel === levelStats[i+1].level ? 'text-blue-500 animate-pulse scale-125' : 'text-slate-800'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* ── MAIN CONTENT: TEAM MANAGEMENT ── */}
        <div className="xl:col-span-3 space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
            <div className="relative w-full md:w-[450px] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder={`Search ${selectedLevel} operational units...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-700 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="bg-slate-950/80 p-1.5 rounded-xl border border-white/10 flex shadow-inner">
                <button 
                  onClick={() => setViewMode("card")}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'card' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-600 hover:text-white'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-600 hover:text-white'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 hover:text-white transition-all group micro-tap shadow-2xl">
                <Filter className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
                Filter Console
              </button>
              <button 
                onClick={handleAutoPromoteAll}
                disabled={isProcessing}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/40 group micro-tap glow-hover-blue"
              >
                <Zap className={`w-4 h-4 ${isProcessing ? 'animate-pulse' : 'group-hover:animate-bounce'}`} />
                Auto-Promote Engine
              </button>
            </div>
          </div>

          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 animate-fade-in">
              {filteredTeams.map((team, i) => (
                <div key={team.id} className="glass-panel border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-500 group relative overflow-hidden glass-reflection smooth-refresh shadow-2xl" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-500 group-hover:w-2 ${
                    team.status === 'QUALIFIED' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]' :
                    team.status === 'ELIMINATED' ? 'bg-destructive shadow-[0_0_20px_rgba(239,68,68,0.6)]' :
                    'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                  }`} />
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-white/20 transition-all duration-500 shadow-2xl">
                        <Shield className={`w-7 h-7 ${team.status === 'QUALIFIED' ? 'text-emerald-500' : team.status === 'ELIMINATED' ? 'text-destructive' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-oswald font-bold text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">{team.name}</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">{team.club}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg ${getStatusTextStyles(team.status)}`}>
                      {team.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-5 border-y border-white/5 mb-6 bg-slate-950/40 rounded-2xl px-4 shadow-inner">
                    <div className="border-r border-white/5 pr-2">
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2">Operation Region</p>
                      <p className="text-xs font-bold text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-destructive animate-pulse" /> {team.city}
                      </p>
                    </div>
                    <div className="pl-2">
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2">Ops Performance</p>
                      <p className="text-xs font-bold text-white flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {team.points} <span className="text-[10px] text-slate-600 font-black">PTS</span> • <span className="text-blue-400">#{team.rank}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between h-8">
                    <div className="flex items-center gap-2">
                      {team.status === "QUALIFIED" && team.nextLevel && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                          <ArrowUpRight className="w-4 h-4" /> Deploy to {team.nextLevel}
                        </div>
                      )}
                    </div>
                    {team.status === "PENDING REVIEW" && (
                      <button 
                        onClick={() => handlePromote(team.id)}
                        className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] hover:text-white transition-all underline underline-offset-4 flex items-center gap-2 group/btn micro-tap"
                      >
                        <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 
                        Execute Promotion
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden animate-fade-in glass-reflection shadow-2xl">
              <table className="w-full text-left border-collapse font-montserrat">
                <thead>
                  <tr className="bg-slate-950/80">
                    <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] w-20 text-center">Rank</th>
                    <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Operational Unit</th>
                    <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Region</th>
                    <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Points</th>
                    <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Status</th>
                    <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTeams.map((team, i) => (
                    <tr key={team.id} className="group/row hover:bg-white/5 transition-all duration-300">
                      <td className="p-5 text-center">
                        <span className={`text-sm font-oswald font-bold ${team.rank <= 2 ? 'text-blue-400 led-display-blue' : 'text-slate-700'}`}>#{team.rank}</span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover/row:scale-110 transition-all duration-500">
                            <Shield className={`w-5 h-5 ${team.status === 'QUALIFIED' ? 'text-emerald-500' : 'text-blue-500'}`} />
                          </div>
                          <span className="text-sm font-bold text-white uppercase tracking-tight group-hover/row:text-blue-400 transition-colors">{team.name}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{team.city}</span>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{team.province}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="text-lg font-oswald font-bold text-white led-display-green drop-shadow-lg">{team.points}</span>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block shadow-lg ${getStatusTextStyles(team.status)}`}>
                          {team.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        {team.status === "PENDING REVIEW" ? (
                          <button 
                            onClick={() => handlePromote(team.id)} 
                            className="p-3 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg micro-tap group/btn"
                          >
                            <CheckCircle2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        ) : (
                          <div className="p-3 bg-slate-900/50 text-slate-700 rounded-xl flex items-center justify-center">
                            <LockIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: OPERATIONAL METRICS ── */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-white/10 rounded-2xl h-full shadow-2xl glass-reflection relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Intelligence Summary
            </h3>

            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-500 shadow-inner glass-reflection relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-400 transition-colors">Qualified Units</p>
                    <p className="text-4xl font-oswald font-bold text-emerald-500 group-hover:scale-110 transition-transform origin-left led-display-green">{stats.qualified}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10 group-hover:rotate-12 transition-transform shadow-2xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                  </div>
                </div>
                
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-all duration-500 shadow-inner glass-reflection relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 group-hover:text-amber-400 transition-colors">Pending Review</p>
                    <p className="text-4xl font-oswald font-bold text-amber-500 group-hover:scale-110 transition-transform origin-left">{stats.pending}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-amber-500/5 flex items-center justify-center border border-amber-500/10 group-hover:rotate-12 transition-transform shadow-2xl">
                    <Clock className="w-8 h-8 text-amber-500/40" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-between group hover:border-destructive/30 transition-all duration-500 shadow-inner glass-reflection relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 group-hover:text-destructive transition-colors">Decommissioned</p>
                    <p className="text-4xl font-oswald font-bold text-destructive group-hover:scale-110 transition-transform origin-left led-display">{stats.eliminated}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-destructive/5 flex items-center justify-center border border-destructive/10 group-hover:rotate-12 transition-transform shadow-2xl">
                    <XCircle className="w-8 h-8 text-destructive/40" />
                  </div>
                </div>
              </div>

              {/* Promotion Config */}
              <div className="pt-8 border-t border-white/5 space-y-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Settings2 className="w-4 h-4 text-blue-500 animate-spin-slow" /> Engine Rule-set
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/5 shadow-inner group">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Ranking Cutoff</span>
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg font-black border border-blue-600/30 text-[10px] shadow-lg">TOP 2</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/5 shadow-inner group">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Points Floor</span>
                    <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg font-black border border-white/10 text-[10px] shadow-lg">MIN 9</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/5 shadow-inner group">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Authority Seal</span>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg font-black border border-amber-500/30 text-[10px] shadow-lg uppercase">REQUIRED</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="p-5 rounded-2xl bg-blue-600/5 border border-blue-500/20 glass-reflection relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-1.5 transition-all" />
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Operator Protocol</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-500 font-bold uppercase tracking-tight italic opacity-70 group-hover:opacity-100 transition-opacity">
                    "Promotion to National level requires final sign-off from the central Match Commissioner after document verification."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionControl;
