import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  UserCheck,
  Fingerprint,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Scan,
  Database,
  History,
  Info,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Camera,
  FileText,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// ==================== INTERFACES ====================

type VerificationStatus = "VERIFIED" | "FLAGGED" | "REQUIRES MANUAL REVIEW" | "REJECTED";

interface VerificationMetric {
  id: string;
  label: string;
  score: number; // 0-100
  status: "pass" | "warn" | "fail";
}

interface DocumentData {
  birthCertificate: {
    name: string;
    dob: string;
    birthplace: string;
    parentName: string;
  };
  familyCard: {
    name: string;
    dob: string;
    parentName: string;
  };
  nikRegistry: {
    name: string;
    dob: string;
    status: string;
  };
}

interface PlayerEligibility {
  id: string;
  name: string;
  nik: string;
  birthYear: number;
  club: string;
  province: string;
  faceMatchConfidence: number; // Percentage
  predictedAge?: number; // Estimated biological age
  ageRiskScore?: number; // 0-100 based on prediction vs expected
  duplicateRiskScore?: number; // 0-100 based on multi-reg detection
  masterRiskScore?: number; // Combined risk score 0-100
  riskLevel?: "LOW" | "MEDIUM" | "HIGH"; // Qualitative risk level
  docConsistencyScore: number; // Percentage
  status: VerificationStatus;
  metrics: VerificationMetric[];
  flags: string[];
  documents?: DocumentData;
}

// ==================== LOGIC ENGINE ====================

const calculateMasterRisk = (player: Partial<PlayerEligibility>) => {
  const docScore = player.docConsistencyScore || 0;
  const bioMatch = player.faceMatchConfidence || 0;
  const ageRisk = player.ageRiskScore || 0;
  const dupRisk = player.duplicateRiskScore || 0;

  // 1. Calculate weighted master risk score (0-100)
  // Higher is more risky
  // Weights: Doc Integrity (30%), Bio Match (20%), Age Prediction (30%), Duplicate (20%)
  const docRisk = 100 - docScore;
  const bioRisk = 100 - bioMatch;
  
  const masterScore = Math.round(
    (docRisk * 0.35) + 
    (bioRisk * 0.15) + 
    (ageRisk * 0.30) + 
    (dupRisk * 0.20)
  );

  // 2. Determine Risk Level
  let level: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (masterScore > 60 || ageRisk > 80 || dupRisk > 70) level = "HIGH";
  else if (masterScore > 25 || docRisk > 30 || bioRisk > 30) level = "MEDIUM";

  // 3. Status Decision
  let status: VerificationStatus = "VERIFIED";
  if (level === "HIGH") status = "REJECTED";
  else if (level === "MEDIUM") status = "REQUIRES MANUAL REVIEW";

  return { masterScore, level, status };
};

const detectMultiRegistration = (player: PlayerEligibility, allPlayers: PlayerEligibility[]) => {
  let riskScore = 0;
  const flags: string[] = [];
  
  // 1. NIK Already Registered Check
  const nikDuplicate = allPlayers.find(p => p.id !== player.id && p.nik === player.nik);
  if (nikDuplicate) {
    riskScore += 50;
    flags.push(`CRITICAL: NIK already registered under ID ${nikDuplicate.id}`);
  }

  // 2. Same Face Match / Biometric Similarity
  // In a real system, this would use a vector search. Here we simulate similarity.
  const faceSimilarity = player.faceMatchConfidence; // Using confidence as a proxy for similarity in mock
  if (faceSimilarity > 85) {
    riskScore += 30;
    flags.push(`FLAG: Biometric similarity (${faceSimilarity}%) exceeds duplicate threshold`);
  }

  // 3. Document Overlap (Same Parent + Same DOB)
  if (player.documents) {
    const docDuplicate = allPlayers.find(p => 
      p.id !== player.id && 
      p.documents?.familyCard.parentName.toLowerCase() === player.documents?.familyCard.parentName.toLowerCase() &&
      p.documents?.familyCard.dob === player.documents?.familyCard.dob
    );
    if (docDuplicate) {
      riskScore += 20;
      flags.push(`WARNING: Identical Parent/DOB found in unit ${docDuplicate.id}`);
    }
  }

  return { riskScore: Math.min(100, riskScore), flags };
};

const calculateAgeRisk = (predicted: number, expectedMax: number = 12) => {
  if (predicted <= expectedMax) return 0;
  // Risk increases exponentially as predicted age exceeds threshold
  const diff = predicted - expectedMax;
  return Math.min(100, Math.round((diff / 3) * 100)); 
};

const calculateConsistency = (player: Partial<PlayerEligibility>) => {
  if (!player.documents) return { score: 0, flags: ["Missing document records"], metrics: [] };

  const docs = player.documents;
  const flags: string[] = [];
  const metrics: VerificationMetric[] = [];

  // 1. Date of Birth Cross-Check (Weight: 40%)
  const dobMatchBC_KK = docs.birthCertificate.dob === docs.familyCard.dob;
  const dobMatchBC_NIK = docs.birthCertificate.dob === docs.nikRegistry.dob;
  
  let dobScore = 0;
  if (dobMatchBC_KK && dobMatchBC_NIK) {
    dobScore = 100;
  } else {
    flags.push("DOB MISMATCH detected between source documents");
    dobScore = dobMatchBC_KK || dobMatchBC_NIK ? 50 : 0;
  }
  metrics.push({ id: "dob", label: "DOB Cross-Check", score: dobScore, status: dobScore === 100 ? "pass" : dobScore === 50 ? "warn" : "fail" });

  // 2. Name Consistency (Weight: 20%)
  const nameMatchBC_KK = docs.birthCertificate.name.toLowerCase() === docs.familyCard.name.toLowerCase();
  const nameMatchBC_NIK = docs.birthCertificate.name.toLowerCase() === docs.nikRegistry.name.toLowerCase();
  
  let nameScore = 0;
  if (nameMatchBC_KK && nameMatchBC_NIK) {
    nameScore = 100;
  } else {
    flags.push("NAME VARIATION detected in identity registry");
    nameScore = 50;
  }
  metrics.push({ id: "name", label: "Identity Alignment", score: nameScore, status: nameScore === 100 ? "pass" : "warn" });

  // 3. Parent Data Sync (Weight: 20%)
  const parentMatch = docs.birthCertificate.parentName.toLowerCase() === docs.familyCard.parentName.toLowerCase();
  let parentScore = parentMatch ? 100 : 0;
  if (!parentMatch) {
    flags.push("PARENT MISMATCH: Birth Cert vs Family Card");
  }
  metrics.push({ id: "parent", label: "Parent Data Sync", score: parentScore, status: parentScore === 100 ? "pass" : "fail" });

  // 4. Birthplace Integrity (Weight: 20%)
  let birthplaceScore = docs.birthCertificate.birthplace ? 100 : 0;
  if (birthplaceScore === 0) flags.push("Birthplace record missing");
  metrics.push({ id: "place", label: "Birthplace Record", score: birthplaceScore, status: birthplaceScore === 100 ? "pass" : "fail" });

  // Total Score Calculation
  const totalScore = Math.round((dobScore * 0.4) + (nameScore * 0.2) + (parentScore * 0.2) + (birthplaceScore * 0.2));

  return { score: totalScore, flags, metrics };
};

// ==================== MOCK DATA ====================

const initialPlayers: PlayerEligibility[] = [
  {
    id: "P001",
    name: "ADITYA PRATAMA",
    nik: "3171012304140001",
    birthYear: 2014,
    club: "Garuda Muda FC",
    province: "DKI Jakarta",
    faceMatchConfidence: 98.5,
    predictedAge: 11.4,
    ageRiskScore: 0,
    masterRiskScore: 2,
    riskLevel: "LOW",
    docConsistencyScore: 100,
    status: "VERIFIED",
    documents: {
      birthCertificate: { name: "ADITYA PRATAMA", dob: "2014-04-23", birthplace: "Jakarta", parentName: "Budi Pratama" },
      familyCard: { name: "ADITYA PRATAMA", dob: "2014-04-23", parentName: "Budi Pratama" },
      nikRegistry: { name: "ADITYA PRATAMA", dob: "2014-04-23", status: "Active" }
    },
    metrics: [
      { id: "dob", label: "DOB Cross-Check", score: 100, status: "pass" },
      { id: "name", label: "Identity Alignment", score: 100, status: "pass" },
      { id: "parent", label: "Parent Data Sync", score: 100, status: "pass" },
      { id: "place", label: "Birthplace Record", score: 100, status: "pass" },
    ],
    flags: [],
  },
  {
    id: "P002",
    name: "REZA KURNIAWAN",
    nik: "3273021508130005",
    birthYear: 2013,
    club: "Elang Jaya",
    province: "Jawa Barat",
    faceMatchConfidence: 92.0,
    predictedAge: 14.8,
    ageRiskScore: 93,
    masterRiskScore: 85,
    riskLevel: "HIGH",
    docConsistencyScore: 40,
    status: "REJECTED",
    documents: {
      birthCertificate: { name: "REZA KURNIAWAN", dob: "2013-08-15", birthplace: "Bandung", parentName: "Hendra" },
      familyCard: { name: "REZA KURNIAWAN", dob: "2013-08-15", parentName: "Hendra" },
      nikRegistry: { name: "REZA KURNIAWAN", dob: "2014-08-15", status: "Active" } // NIK shows 2014 but cert shows 2013
    },
    metrics: [
      { id: "dob", label: "DOB Cross-Check", score: 0, status: "fail" },
      { id: "name", label: "Identity Alignment", score: 100, status: "pass" },
      { id: "parent", label: "Parent Data Sync", score: 100, status: "pass" },
      { id: "place", label: "Birthplace Record", score: 100, status: "pass" },
    ],
    flags: ["OVER-AGE ATTEMPT (Born 2013)", "DOB MISMATCH detected between source documents", "High Biological Age Risk (14.8y)"],
  },
  {
    id: "P003",
    name: "DIMAS SAPUTRA",
    nik: "3578031111140002",
    birthYear: 2014,
    club: "Macan Academy",
    province: "Jawa Timur",
    faceMatchConfidence: 65.4,
    predictedAge: 11.2,
    ageRiskScore: 0,
    masterRiskScore: 5,
    riskLevel: "LOW",
    docConsistencyScore: 100,
    status: "VERIFIED",
    documents: {
      birthCertificate: { name: "DIMAS SAPUTRA", dob: "2014-11-11", birthplace: "Surabaya", parentName: "Slamet" },
      familyCard: { name: "DIMAS SAPUTRA", dob: "2014-11-11", parentName: "Slamet" },
      nikRegistry: { name: "DIMAS SAPUTRA", dob: "2014-11-11", status: "Active" }
    },
    metrics: [
      { id: "dob", label: "DOB Cross-Check", score: 100, status: "pass" },
      { id: "name", label: "Identity Alignment", score: 100, status: "pass" },
      { id: "parent", label: "Parent Data Sync", score: 100, status: "pass" },
      { id: "place", label: "Birthplace Record", score: 100, status: "pass" },
    ],
    flags: [],
  },
  {
    id: "P004",
    name: "FARRAS HADYAN",
    nik: "3175040101140009",
    birthYear: 2014,
    club: "Rajawali FC",
    province: "DKI Jakarta",
    faceMatchConfidence: 88.2,
    predictedAge: 12.2,
    ageRiskScore: 7,
    masterRiskScore: 35,
    riskLevel: "MEDIUM",
    docConsistencyScore: 40,
    status: "REQUIRES MANUAL REVIEW",
    documents: {
      birthCertificate: { name: "FARRAS HADYAN", dob: "2014-01-01", birthplace: "Jakarta", parentName: "Ahmad Hadyan" },
      familyCard: { name: "FARRAS H", dob: "2014-01-01", parentName: "Ahmad H" }, // Mismatched names
      nikRegistry: { name: "FARRAS HADYAN", dob: "2014-01-01", status: "Active" }
    },
    metrics: [
      { id: "dob", label: "DOB Cross-Check", score: 100, status: "pass" },
      { id: "name", label: "Identity Alignment", score: 50, status: "warn" },
      { id: "parent", label: "Parent Data Sync", score: 0, status: "fail" },
      { id: "place", label: "Birthplace Record", score: 100, status: "pass" },
    ],
    flags: ["NAME VARIATION detected in identity registry", "PARENT MISMATCH: Birth Cert vs Family Card"],
  },
  {
    id: "P005",
    name: "DIMAS SAPUTRA",
    nik: "3578031111140002",
    birthYear: 2014,
    club: "Macan Academy",
    province: "Jawa Timur",
    faceMatchConfidence: 91.2,
    predictedAge: 11.8,
    ageRiskScore: 0,
    duplicateRiskScore: 80,
    masterRiskScore: 45,
    riskLevel: "MEDIUM",
    docConsistencyScore: 100,
    status: "FLAGGED",
    documents: {
      birthCertificate: { name: "DIMAS SAPUTRA", dob: "2014-11-11", birthplace: "Surabaya", parentName: "Slamet" },
      familyCard: { name: "DIMAS SAPUTRA", dob: "2014-11-11", parentName: "Slamet" },
      nikRegistry: { name: "DIMAS SAPUTRA", dob: "2014-11-11", status: "Active" }
    },
    metrics: [
      { id: "dob", label: "DOB Cross-Check", score: 100, status: "pass" },
      { id: "name", label: "Identity Alignment", score: 100, status: "pass" },
      { id: "parent", label: "Parent Data Sync", score: 100, status: "pass" },
      { id: "place", label: "Birthplace Record", score: 100, status: "pass" },
    ],
    flags: ["CRITICAL: NIK already registered under ID P003", "FLAG: Biometric similarity (91.2%) exceeds duplicate threshold"],
  },
];

const AgeFraudVerification: React.FC = () => {
  const [players, setPlayers] = useState<PlayerEligibility[]>(initialPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerEligibility | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.nik.includes(searchQuery) ||
      p.club.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [players, searchQuery]);

  const handleRunVerification = (id: string) => {
    setIsScanning(true);
    
    toast.promise(new Promise(resolve => {
      setTimeout(() => {
        if (id === "ALL") {
          setPlayers(prev => {
            return prev.map(player => {
              const { score: docScore, flags: docFlags, metrics } = calculateConsistency(player);
              const { riskScore: dupRisk, flags: dupFlags } = detectMultiRegistration(player, prev);
              
              // Calculate combined risk and decide status
              const { masterScore, level, status: newStatus } = calculateMasterRisk({
                ...player,
                docConsistencyScore: docScore,
                duplicateRiskScore: dupRisk,
                ageRiskScore: player.ageRiskScore || 0,
                faceMatchConfidence: player.faceMatchConfidence
              });

              return { 
                ...player, 
                docConsistencyScore: docScore, 
                duplicateRiskScore: dupRisk,
                masterRiskScore: masterScore,
                riskLevel: level,
                flags: Array.from(new Set([...player.flags, ...docFlags, ...dupFlags])), 
                metrics,
                status: newStatus as VerificationStatus
              };
            });
          });
        } else {
          setPlayers(prev => prev.map(player => {
            if (player.id === id) {
              const { score: docScore, flags: docFlags, metrics } = calculateConsistency(player);
              const { riskScore: dupRisk, flags: dupFlags } = detectMultiRegistration(player, prev);
              
              const { masterScore, level, status: newStatus } = calculateMasterRisk({
                ...player,
                docConsistencyScore: docScore,
                duplicateRiskScore: dupRisk,
                ageRiskScore: player.ageRiskScore || 0,
                faceMatchConfidence: player.faceMatchConfidence
              });

              return { 
                ...player, 
                docConsistencyScore: docScore, 
                duplicateRiskScore: dupRisk,
                masterRiskScore: masterScore,
                riskLevel: level,
                flags: Array.from(new Set([...player.flags, ...docFlags, ...dupFlags])), 
                metrics,
                status: newStatus as VerificationStatus
              };
            }
            return player;
          }));
        }
        resolve(true);
      }, 2500);
    }), {
      loading: "Initializing AI Verification Engine...",
      success: () => {
        setIsScanning(false);
        return "Verification Sequence Complete. Intelligence sync successful.";
      },
      error: "Engine failure. Connection lost to Civil Registry API."
    });
  };

  const getStatusStyles = (status: VerificationStatus) => {
    switch (status) {
      case "VERIFIED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "REJECTED": return "bg-destructive/10 text-destructive border-destructive/20";
      case "FLAGGED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "REQUIRES MANUAL REVIEW": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-950 min-h-screen font-montserrat text-slate-300 page-fade-in">
      
      {/* ── COMMAND HEADER ── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden glass-reflection">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-destructive shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
        
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 neon-border-blue flex items-center justify-center border border-blue-500/30 relative group overflow-hidden shadow-2xl">
            <Fingerprint className="w-12 h-12 text-blue-500 relative z-10 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
            <Scan className="absolute inset-0 w-full h-full text-blue-500/20 animate-pulse scale-150" />
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-oswald font-bold text-white uppercase tracking-tight drop-shadow-lg">
                Anti Age-Fraud <span className="text-blue-500">Engine</span>
              </h1>
              <span className="status-confirmed animate-pulse">
                <div className="live-pulse" />
                System: Active
              </span>
            </div>
            <p className="text-slate-500 text-sm font-bold mt-1.5 flex items-center gap-3 uppercase tracking-widest">
              <Database className="w-4 h-4 text-emerald-500" />
              Civil Registry Uplink: <span className="text-white">Encrypted</span>
              <span className="text-slate-800 font-black">|</span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> AI Confidence Threshold: 85%
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleRunVerification("ALL")}
            disabled={isScanning}
            className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/40 group micro-tap glow-hover-blue"
          >
            <Scan className={`w-4 h-4 ${isScanning ? 'animate-spin' : 'group-hover:animate-bounce'}`} />
            Run Global Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* ── LEFT: PLAYER QUEUE ── */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
            <div className="relative w-full md:w-[450px] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search NIK or Player Identity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 bg-slate-900 border border-white/5 rounded-xl hover:border-white/20 transition-all text-slate-500 hover:text-white">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-3 bg-slate-900 border border-white/5 rounded-xl hover:border-white/20 transition-all text-slate-500 hover:text-white">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden glass-reflection shadow-2xl">
            <table className="w-full text-left border-collapse font-montserrat">
              <thead>
                <tr className="bg-slate-950/80">
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Player Unit</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">NIK Registry</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">AI Bio-Score</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Doc Sync</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Risk Index</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Status</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPlayers.map((player, i) => (
                  <tr 
                    key={player.id} 
                    className={`group/row hover:bg-white/5 transition-all duration-300 cursor-pointer ${selectedPlayer?.id === player.id ? 'bg-blue-600/5' : ''}`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden group-hover/row:scale-110 transition-all">
                          <Users className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight group-hover/row:text-blue-400 transition-colors">{player.name}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{player.club}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <code className="text-xs font-oswald text-slate-400 tracking-wider">{player.nik}</code>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-oswald font-bold ${player.faceMatchConfidence > 90 ? 'text-emerald-500 led-display-green' : player.faceMatchConfidence > 70 ? 'text-amber-500' : 'text-destructive led-display'}`}>
                          {player.faceMatchConfidence}%
                        </span>
                        <div className="w-16 h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${player.faceMatchConfidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${player.faceMatchConfidence}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`text-sm font-oswald font-bold ${player.docConsistencyScore > 80 ? 'text-blue-400' : 'text-destructive'}`}>
                        {player.docConsistencyScore}%
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs font-black uppercase tracking-widest ${
                          player.riskLevel === 'HIGH' ? 'text-destructive' : 
                          player.riskLevel === 'MEDIUM' ? 'text-amber-500' : 
                          'text-emerald-500'
                        }`}>
                          {player.riskLevel || 'LOW'}
                        </span>
                        <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${
                            player.riskLevel === 'HIGH' ? 'bg-destructive' : 
                            player.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 
                            'bg-emerald-500'
                          }`} style={{ width: `${player.masterRiskScore || 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg ${getStatusStyles(player.status)}`}>
                        {player.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button className="p-3 bg-slate-900/50 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RIGHT: VERIFICATION INTELLIGENCE ── */}
        <div className="space-y-6">
          {selectedPlayer ? (
            <div className="glass-panel p-6 border border-white/10 rounded-2xl relative overflow-hidden glass-reflection animate-fade-in">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${getStatusStyles(selectedPlayer.status).split(' ')[1].replace('text-', 'bg-')} shadow-[0_0_15px_rgba(0,0,0,0.5)]`} />
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-blue-500" />
                  Unit Intelligence
                </h3>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyles(selectedPlayer.status)}`}>
                    {selectedPlayer.status}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    selectedPlayer.riskLevel === 'HIGH' ? 'text-destructive' : 
                    selectedPlayer.riskLevel === 'MEDIUM' ? 'text-amber-500' : 
                    'text-emerald-500'
                  }`}>
                    {selectedPlayer.riskLevel} RISK
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                {/* Identity Cards */}
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center shadow-2xl relative group overflow-hidden">
                      <Camera className="w-10 h-10 text-slate-700 group-hover:text-blue-500 transition-colors" />
                      <div className="absolute inset-0 border-2 border-blue-500/20 rounded-2xl animate-pulse" />
                      {selectedPlayer.predictedAge && (
                        <div className="absolute bottom-0 inset-x-0 bg-blue-600/80 backdrop-blur-md py-1 text-center">
                          <p className="text-[9px] font-black text-white uppercase tracking-tighter">AI Est: {selectedPlayer.predictedAge}y</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-oswald font-bold text-white uppercase tracking-tight">{selectedPlayer.name}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Expected: 10 – 12 Years Old</p>
                    </div>
                  </div>
                  
                  {/* Age Risk Alert */}
                  {selectedPlayer.ageRiskScore && selectedPlayer.ageRiskScore > 0 && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
                        <div>
                          <p className="text-[10px] font-black text-destructive uppercase tracking-widest">Biological Age Risk</p>
                          <p className="text-[9px] text-destructive/70 font-bold uppercase">Predicted age exceeds category limit</p>
                        </div>
                      </div>
                      <span className="text-2xl font-oswald font-bold text-destructive led-display">{selectedPlayer.ageRiskScore}</span>
                    </div>
                  )}

                  {/* Duplicate Risk Alert */}
                  {selectedPlayer.duplicateRiskScore && selectedPlayer.duplicateRiskScore > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-amber-500 animate-pulse" />
                        <div>
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Multi-Registration Risk</p>
                          <p className="text-[9px] text-amber-500/70 font-bold uppercase">Identity overlap detected in registry</p>
                        </div>
                      </div>
                      <span className="text-2xl font-oswald font-bold text-amber-500 led-display">{selectedPlayer.duplicateRiskScore}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Bio Match</p>
                      <p className={`text-xs font-bold ${selectedPlayer.faceMatchConfidence > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedPlayer.faceMatchConfidence}%</p>
                    </div>
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Region</p>
                      <p className="text-xs font-bold text-white">{selectedPlayer.province}</p>
                    </div>
                  </div>
                </div>

                {/* Metric Scoring */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Validation Metrics
                  </p>
                  <div className="space-y-3">
                    {selectedPlayer.metrics.map(metric => (
                      <div key={metric.id} className="p-4 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          {metric.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : metric.status === 'warn' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-destructive" />}
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{metric.label}</span>
                        </div>
                        <span className={`text-xs font-oswald font-bold ${metric.status === 'pass' ? 'text-emerald-500' : metric.status === 'warn' ? 'text-amber-500' : 'text-destructive'}`}>{metric.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detected Flags */}
                {selectedPlayer.flags.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-destructive uppercase tracking-[0.2em] flex items-center gap-2 animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" /> Intelligence Warnings
                    </p>
                    <div className="space-y-2">
                      {selectedPlayer.flags.map((flag, idx) => (
                        <div key={idx} className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
                          <Info className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                          <p className="text-[10px] font-bold text-destructive uppercase tracking-tight leading-relaxed">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all micro-tap">
                    <FileSearch className="w-4 h-4" /> View Docs
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all micro-tap">
                    <History className="w-4 h-4" /> Log History
                  </button>
                  <button className="col-span-2 flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/40 micro-tap glow-hover-green">
                    <UserCheck className="w-4 h-4" /> Confirm Eligibility
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full glass-panel border border-white/10 rounded-2xl flex flex-col items-center justify-center p-12 text-center space-y-6 group">
              <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center shadow-2xl relative">
                <Scan className="w-12 h-12 text-slate-800 group-hover:text-blue-500 transition-colors animate-pulse" />
                <div className="absolute inset-0 border-2 border-slate-800 rounded-full animate-ping opacity-20" />
              </div>
              <div>
                <p className="text-sm font-oswald font-bold text-white uppercase tracking-widest">Awaiting Command</p>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-2 max-w-[200px]">Select a player unit from the queue to initiate deep verification scan.</p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 border border-white/10 rounded-2xl glass-reflection hover:border-white/30 transition-all group">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">Total Scanned</p>
              <p className="text-3xl font-oswald font-bold text-white group-hover:scale-110 transition-transform origin-left drop-shadow-lg">1,248</p>
            </div>
            <div className="glass-card p-5 border border-white/10 rounded-2xl glass-reflection hover:border-white/30 transition-all group">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">Blocked Units</p>
              <p className="text-3xl font-oswald font-bold text-destructive group-hover:scale-110 transition-transform origin-left drop-shadow-lg led-display">42</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeFraudVerification;
