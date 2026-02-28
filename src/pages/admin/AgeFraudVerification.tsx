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
import { validateWithDukcapil, DukcapilValidationResult } from "@/services/dukcapilService";
import { apiConnectionManager, ConnectionStatus } from "@/services/apiConnectionManager";
import ApiConnectionStatus from "@/components/admin/ApiConnectionStatus";
import { playerService } from "@/services/playerService";
import { useEffect } from "react";

// ==================== INTERFACES ====================

type VerificationStatus = "VERIFIED" | "MANUAL REVIEW" | "REJECTED";

interface VerificationMetric {
  id: string;
  label: string;
  score: number; // 0-100
  status: "pass" | "warn" | "fail";
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Check, X, CalendarCheck } from "lucide-react";

// ==================== INTERFACES ====================

/**
 * Masks NIK for privacy (e.g., 3171**********01)
 * Data Masking for NIK Display
 */
const maskNik = (nik: string) => {
  if (!nik || nik.length < 6) return nik;
  return `${nik.substring(0, 4)}${"*".repeat(nik.length - 6)}${nik.substring(nik.length - 2)}`;
};

// ==================== COMPONENTS ====================

const VerificationStatusBadge = ({ status, riskScore }: { status: VerificationStatus, riskScore: number }) => {
  const getStatusConfig = (status: VerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return {
          bg: "bg-emerald-500/10",
          text: "text-emerald-400",
          border: "border-emerald-500/30",
          glow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]",
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: "VERIFIED"
        };
      case "MANUAL REVIEW":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          border: "border-amber-500/30",
          glow: "shadow-[0_0_10px_rgba(245,158,11,0.3)]",
          icon: <AlertTriangle className="w-3 h-3" />,
          label: "MANUAL REVIEW"
        };
      case "REJECTED":
        return {
          bg: "bg-destructive/10",
          text: "text-destructive",
          border: "border-destructive/30",
          glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)]",
          icon: <ShieldAlert className="w-3 h-3" />,
          label: "REJECTED"
        };
      default:
        return {
          bg: "bg-slate-500/10",
          text: "text-slate-400",
          border: "border-slate-500/30",
          glow: "",
          icon: <Info className="w-3 h-3" />,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border} ${config.glow} flex items-center gap-2 transition-all duration-500 animate-pulse`}>
        {config.icon}
        {config.label}
      </div>
      
      {/* Risk Meter Bar */}
      <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
        <div 
          className={`h-full transition-all duration-1000 ${
            riskScore > 60 ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
            riskScore > 30 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
            'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
          }`} 
          style={{ width: `${riskScore}%` }} 
        />
      </div>
    </div>
  );
};

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

interface IdentityVerificationLog {
  timestamp: string;
  matchResult: string;
  score: number;
  adminOverride: boolean;
  overrideReason?: string;
  oldStatus?: string;
  newStatus?: string;
  attemptType: "INITIAL" | "RE-VALIDATION" | "OVERRIDE";
  executor: string;
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
  civilIdentityConsistencyScore?: number; // Aggregated score (0-100)
  civilIdentityStatus?: "HIGH CONSISTENCY" | "MODERATE" | "LOW CONSISTENCY";
  status: VerificationStatus;
  metrics: VerificationMetric[];
  flags: string[];
  documents?: DocumentData;
  dukcapilResult?: DukcapilValidationResult;
  verificationLogs: IdentityVerificationLog[]; // Immutable History
}

// ==================== LOGIC ENGINE ====================

/**
 * Combines DUKCAPIL Match, Document Consistency, and Face Match into a single score.
 * Weights: DUKCAPIL (50%), Document (30%), Face Match (20%)
 */
const calculateCivilIdentityConsistency = (
  dukcapilScore: number,
  docScore: number,
  faceScore: number
) => {
  const aggregatedScore = Math.round(
    (dukcapilScore * 0.5) + 
    (docScore * 0.3) + 
    (faceScore * 0.2)
  );

  let status: "HIGH CONSISTENCY" | "MODERATE" | "LOW CONSISTENCY" = "LOW CONSISTENCY";
  if (aggregatedScore >= 85) status = "HIGH CONSISTENCY";
  else if (aggregatedScore >= 60) status = "MODERATE";

  return { score: aggregatedScore, status };
};

/**
 * Final Decision Logic based on DUKCAPIL Match and Consistency Level
 */
const determineFinalDecision = (
  dukcapilStatus: string,
  consistencyStatus: string
): VerificationStatus => {
  if (dukcapilStatus === "VALID MATCH" && consistencyStatus === "HIGH CONSISTENCY") {
    return "VERIFIED";
  }
  if (dukcapilStatus === "PARTIAL MATCH" || consistencyStatus === "MODERATE") {
    return "MANUAL REVIEW";
  }
  if (dukcapilStatus === "NO MATCH" || consistencyStatus === "LOW CONSISTENCY") {
    return "REJECTED";
  }
  return "MANUAL REVIEW"; // Default fallback
};

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

  let level: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (masterScore > 60) level = "HIGH";
  else if (masterScore >= 30) level = "MEDIUM";
  else level = "LOW";

  // 3. Status Decision
  let status: VerificationStatus = "VERIFIED";
  if (level === "HIGH") status = "REJECTED";
  else if (level === "MEDIUM") status = "MANUAL REVIEW";

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
  const parentScore = parentMatch ? 100 : 0;
  if (!parentMatch) {
    flags.push("PARENT MISMATCH: Birth Cert vs Family Card");
  }
  metrics.push({ id: "parent", label: "Parent Data Sync", score: parentScore, status: parentScore === 100 ? "pass" : "fail" });

  // 4. Birthplace Integrity (Weight: 20%)
  const birthplaceScore = docs.birthCertificate.birthplace ? 100 : 0;
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
    civilIdentityConsistencyScore: 99,
    civilIdentityStatus: "HIGH CONSISTENCY",
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
    dukcapilResult: {
      status: "VALID MATCH",
      score: 100,
      details: {
        nikMatch: true,
        nameMatch: true,
        dobMatch: true,
        parentMatch: true,
        kkMatch: true,
        placeMatch: true,
      },
      lastChecked: "2026-02-28T14:30:00Z"
    },
    verificationLogs: [
      {
        timestamp: "2026-02-28T14:30:00Z",
        matchResult: "VALID MATCH",
        score: 100,
        adminOverride: false,
        attemptType: "INITIAL",
        executor: "SYSTEM_AUTO_SCAN"
      }
    ]
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
    civilIdentityConsistencyScore: 35,
    civilIdentityStatus: "LOW CONSISTENCY",
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
    flags: ["OVER-AGE ATTEMPT (Born 2013)", "DOB MISMATCH detected between source documents", "High Biological Age Risk (14.8y)", "CRITICAL: DUKCAPIL Registry mismatch", "OVER AGE FLAG (DUKCAPIL: 2013)"],
    dukcapilResult: {
      status: "NO MATCH",
      score: 33,
      details: {
        nikMatch: false,
        nameMatch: true,
        dobMatch: false,
        parentMatch: true,
        kkMatch: false,
        placeMatch: true,
      },
      lastChecked: "2026-02-28T14:35:00Z"
    },
    verificationLogs: [
      {
        timestamp: "2026-02-28T10:15:00Z",
        matchResult: "NO MATCH",
        score: 33,
        adminOverride: false,
        attemptType: "INITIAL",
        executor: "SYSTEM_AUTO_SCAN"
      },
      {
        timestamp: "2026-02-28T14:35:00Z",
        matchResult: "NO MATCH",
        score: 35,
        adminOverride: false,
        attemptType: "RE-VALIDATION",
        executor: "ADMIN_FORCE_SCAN"
      }
    ]
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
    civilIdentityConsistencyScore: 93,
    civilIdentityStatus: "HIGH CONSISTENCY",
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
    dukcapilResult: {
      status: "VALID MATCH",
      score: 100,
      details: {
        nikMatch: true,
        nameMatch: true,
        dobMatch: true,
        parentMatch: true,
        kkMatch: true,
        placeMatch: true,
      },
      lastChecked: "2026-02-28T14:40:00Z"
    },
    verificationLogs: [
      {
        timestamp: "2026-02-28T14:40:00Z",
        matchResult: "VALID MATCH",
        score: 100,
        adminOverride: false,
        attemptType: "INITIAL",
        executor: "SYSTEM_AUTO_SCAN"
      }
    ]
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
    civilIdentityConsistencyScore: 62,
    civilIdentityStatus: "MODERATE",
    status: "MANUAL REVIEW",
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
    flags: ["NAME VARIATION detected in identity registry", "PARENT MISMATCH: Birth Cert vs Family Card", "WARNING: Partial identity match in Civil Registry"],
    dukcapilResult: {
      status: "PARTIAL MATCH",
      score: 66,
      details: {
        nikMatch: true,
        nameMatch: false,
        dobMatch: true,
        parentMatch: false,
        kkMatch: true,
        placeMatch: true,
      },
      lastChecked: "2026-02-28T14:45:00Z"
    },
    verificationLogs: [
      {
        timestamp: "2026-02-28T14:45:00Z",
        matchResult: "PARTIAL MATCH",
        score: 66,
        adminOverride: false,
        attemptType: "INITIAL",
        executor: "SYSTEM_AUTO_SCAN"
      }
    ]
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
    status: "MANUAL REVIEW",
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
    dukcapilResult: {
      status: "VALID MATCH",
      score: 100,
      details: {
        nikMatch: true,
        nameMatch: true,
        dobMatch: true,
        parentMatch: true,
        kkMatch: true,
        placeMatch: true,
      },
      lastChecked: "2026-02-28T14:50:00Z"
    },
    verificationLogs: [
      {
        timestamp: "2026-02-28T14:50:00Z",
        matchResult: "VALID MATCH",
        score: 100,
        adminOverride: false,
        attemptType: "INITIAL",
        executor: "SYSTEM_AUTO_SCAN"
      }
    ]
  },
];

const CivilDataMatchIndicator = ({ result }: { result: DukcapilValidationResult }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "VALID MATCH":
        return {
          label: "DATA VERIFIED",
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          glow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        };
      case "PARTIAL MATCH":
        return {
          label: "PARTIAL MATCH",
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          glow: "shadow-[0_0_10px_rgba(245,158,11,0.3)]"
        };
      case "NO MATCH":
      default:
        return {
          label: "DATA MISMATCH",
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)]"
        };
    }
  };

  const config = getStatusConfig(result.status);

  return (
    <div className={`p-4 rounded-xl ${config.bg} border ${config.border} ${config.glow} space-y-4 transition-all duration-500`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className={`w-4 h-4 ${config.color}`} />
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {result.details.dobMatch && (
            <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
              <CalendarCheck className="w-2.5 h-2.5" /> DOB CONFIRMED
            </div>
          )}
          {result.details.parentMatch && (
            <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
              <Check className="w-2.5 h-2.5" /> PARENT MATCH
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Match Score Bar</span>
          <span className={`text-xs font-oswald font-bold ${config.color}`}>{result.score}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all duration-1000 ${
              result.score >= 100 ? 'bg-emerald-500' : 
              result.score >= 70 ? 'bg-amber-500' : 
              'bg-destructive'
            }`} 
            style={{ width: `${result.score}%` }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "NIK", match: result.details.nikMatch },
          { label: "NAME", match: result.details.nameMatch },
          { label: "PLACE", match: result.details.placeMatch },
        ].map(field => (
          <div key={field.label} className="flex flex-col items-center p-2 rounded bg-slate-950/30 border border-white/5">
            <span className="text-[7px] font-black text-slate-600 mb-1">{field.label}</span>
            {field.match ? 
              <Check className="w-3 h-3 text-emerald-500" /> : 
              <X className="w-3 h-3 text-destructive" />
            }
          </div>
        ))}
      </div>
    </div>
  );
};

const VerificationHistoryModal = ({ isOpen, onClose, logs, playerName }: { isOpen: boolean, onClose: () => void, logs: IdentityVerificationLog[], playerName: string }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950 border border-white/10 text-slate-300">
        <DialogHeader>
          <DialogTitle className="text-xl font-oswald font-bold text-white uppercase tracking-tight">
            Verification History: <span className="text-blue-500">{playerName}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {logs.map((log, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-3 relative group">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-600">
                {new Date(log.timestamp).toLocaleString()}
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                  log.attemptType === "INITIAL" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                }`}>
                  {log.attemptType}
                </div>
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                  log.matchResult === "VALID MATCH" ? "bg-emerald-500/10 text-emerald-500" :
                  log.matchResult === "PARTIAL MATCH" ? "bg-amber-500/10 text-amber-500" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {log.matchResult}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Consistency Score</p>
                  <p className="text-sm font-oswald font-bold text-white">{log.score}%</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Executor</p>
                  <p className="text-sm font-oswald font-bold text-slate-400">{log.executor}</p>
                </div>
              </div>
              {log.adminOverride && (
                <div className="pt-2 space-y-2 border-t border-white/5 mt-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Admin Override Applied</span>
                  </div>
                  {log.oldStatus && log.newStatus && (
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="text-slate-500 uppercase">Status Change:</span>
                      <span className="text-slate-400">{log.oldStatus}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span className="text-blue-400">{log.newStatus}</span>
                    </div>
                  )}
                  {log.overrideReason && (
                    <div className="p-2 rounded bg-amber-500/5 border border-amber-500/10">
                      <p className="text-[8px] font-black text-amber-500/50 uppercase mb-1">Justification</p>
                      <p className="text-[10px] text-slate-400 italic">"{log.overrideReason}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="p-3 bg-blue-600/5 border border-dashed border-blue-500/20 rounded-xl">
            <p className="text-[9px] font-black text-center text-blue-500/60 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> Immutable Verification Record • Sealed by APSSI CONNECT
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminOverrideModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  playerName, 
  currentStatus 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (newStatus: VerificationStatus, reason: string) => void, 
  playerName: string,
  currentStatus: VerificationStatus
}) => {
  const [newStatus, setNewStatus] = useState<VerificationStatus>("VERIFIED");
  const [reason, setReason] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-950 border border-white/10 text-slate-300">
        <DialogHeader>
          <DialogTitle className="text-xl font-oswald font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Admin Decision Override
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Manually override the system decision for <strong>{playerName}</strong>. 
            This action will be recorded in the immutable audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Status</Label>
            <Select value={newStatus} onValueChange={(val) => setNewStatus(val as VerificationStatus)}>
              <SelectTrigger className="bg-slate-900 border-white/5 text-white">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                <SelectItem value="VERIFIED">VERIFIED</SelectItem>
                <SelectItem value="MANUAL REVIEW">MANUAL REVIEW</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Justification / Reason</Label>
            <Textarea 
              placeholder="Provide a detailed reason for this override..." 
              className="bg-slate-900 border-white/5 text-white min-h-[100px] text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(newStatus, reason)}
            disabled={!reason.trim()}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            Confirm Override
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AgeFraudVerification: React.FC = () => {
  const [players, setPlayers] = useState<PlayerEligibility[]>(initialPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerEligibility | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("CONNECTED");
  const [lastSync, setLastSync] = useState<string>(new Date().toISOString());
  const [showLogHistory, setShowLogHistory] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  // Load players from database on mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await playerService.getPlayers();
        if (data && data.length > 0) {
          // Map database data to our UI model
          const mappedPlayers: PlayerEligibility[] = data.map((p: any) => ({
            id: p.id,
            name: p.full_name,
            nik: p.nik,
            birthYear: new Date(p.birth_date).getFullYear(),
            club: p.clubs?.name || "Independent",
            province: "Unknown", // Would come from joined table in production
            faceMatchConfidence: p.face_match_confidence || 0,
            predictedAge: undefined,
            ageRiskScore: 0,
            masterRiskScore: 0,
            riskLevel: "LOW",
            docConsistencyScore: p.consistency_score || 0,
            civilIdentityConsistencyScore: p.consistency_score || 0,
            civilIdentityStatus: "MODERATE",
            status: p.verification_status,
            metrics: [],
            flags: [],
            verificationLogs: []
          }));
          setPlayers(mappedPlayers);
        }
      } catch (error) {
        console.error("Failed to fetch players:", error);
      }
    };
    fetchPlayers();
  }, []);

  const handleAdminOverride = async (newStatus: VerificationStatus, reason: string) => {
    if (!selectedPlayer) return;

    try {
      // 1. Persist to Database
      await playerService.performAdminOverride(
        selectedPlayer.id,
        newStatus,
        reason,
        "ADMIN_ROOT", // Mock Admin ID
        selectedPlayer.status
      );

      // 2. Update Local State
      const updatedPlayers = players.map(p => {
        if (p.id === selectedPlayer.id) {
          const newLog: IdentityVerificationLog = {
            timestamp: new Date().toISOString(),
            matchResult: "ADMIN_OVERRIDE",
            score: p.civilIdentityConsistencyScore || 0,
            adminOverride: true,
            overrideReason: reason,
            oldStatus: p.status,
            newStatus: newStatus,
            attemptType: "OVERRIDE",
            executor: "ADMIN_ROOT"
          };

          return {
            ...p,
            status: newStatus,
            adminOverride: true,
            verificationLogs: [...(p.verificationLogs || []), newLog]
          };
        }
        return p;
      });

      setPlayers(updatedPlayers);
      const updated = updatedPlayers.find(p => p.id === selectedPlayer.id);
      if (updated) setSelectedPlayer(updated);
      
      setShowOverrideModal(false);
      toast.success(`Identity status for ${selectedPlayer.name} overridden to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to save override to database.");
    }
  };

  const handleReconnect = async () => {
    setConnectionStatus("INITIALIZING");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = await apiConnectionManager.refreshToken();
    setConnectionStatus(success ? "CONNECTED" : "UNAUTHORIZED");
    setLastSync(new Date().toISOString());
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.nik.includes(searchQuery) ||
      p.club.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [players, searchQuery]);

  const handleRunVerification = async (id: string) => {
    setIsScanning(true);
    
    const runVerificationTask = async () => {
      if (id === "ALL") {
        const updatedPlayers = await Promise.all(players.map(async (player) => {
          const { score: docScore, flags: docFlags, metrics } = calculateConsistency(player);
          const { riskScore: dupRisk, flags: dupFlags } = detectMultiRegistration(player, players);
          
          // DUKCAPIL Validation Integration with Connection Manager
          let dukcapilRes: DukcapilValidationResult | undefined;
          if (player.documents) {
            // 1. Establish Secure Connection via Manager
            const apiResponse = await apiConnectionManager.sendPostRequest("/api/v1/dukcapil/validate", {
              nik: player.nik,
              fullName: player.name,
              dob: player.documents.birthCertificate.dob,
              kkNumber: player.nik.substring(0, 16),
            });

            // 2. Handle Connection Errors
            if (apiResponse.error) {
              setConnectionStatus(apiResponse.error as ConnectionStatus);
              throw new Error(apiResponse.error);
            }

            // 3. Process Validation
            dukcapilRes = await validateWithDukcapil({
              nik: player.nik,
              fullName: player.name,
              dob: player.documents.birthCertificate.dob,
              parentName: player.documents.birthCertificate.parentName,
              familyCardNumber: player.nik.substring(0, 16),
              placeOfBirth: player.documents.birthCertificate.birthplace,
            });
            setLastSync(new Date().toISOString());
          }

          const { masterScore, level } = calculateMasterRisk({
            ...player,
            docConsistencyScore: docScore,
            duplicateRiskScore: dupRisk,
            ageRiskScore: player.ageRiskScore || 0,
            faceMatchConfidence: player.faceMatchConfidence
          });

          const { score: civilScore, status: civilStatus } = calculateCivilIdentityConsistency(
            dukcapilRes?.score || 0,
            docScore,
            player.faceMatchConfidence || 0
          );

          // Final Decision Logic: DUKCAPIL Match + Consistency Level
          const finalStatus = determineFinalDecision(
            dukcapilRes?.status || "NO MATCH",
            civilStatus
          );

          const dukcapilFlags = dukcapilRes?.status === "NO MATCH" ? ["CRITICAL: DUKCAPIL Registry mismatch"] : 
                               dukcapilRes?.status === "PARTIAL MATCH" ? ["WARNING: Partial identity match in Civil Registry"] : [];

          // DUKCAPIL Birth Year Validation (Target: 2014)
          const registryAgeFlags: string[] = [];
          if (player.documents?.birthCertificate.dob) {
            const registryYear = new Date(player.documents.birthCertificate.dob).getFullYear();
            if (registryYear < 2014) registryAgeFlags.push("OVER AGE FLAG (DUKCAPIL: " + registryYear + ")");
            else if (registryYear > 2014) registryAgeFlags.push("UNDER AGE FLAG (DUKCAPIL: " + registryYear + ")");
          }

          // 4. Create Immutable Log Entry
          const newLog: IdentityVerificationLog = {
            timestamp: new Date().toISOString(),
            matchResult: dukcapilRes?.status || "NO MATCH",
            score: civilScore,
            adminOverride: false,
            attemptType: player.verificationLogs && player.verificationLogs.length > 0 ? "RE-VALIDATION" : "INITIAL",
            executor: "SYSTEM_AUTO_SCAN"
          };

          return { 
            ...player, 
            docConsistencyScore: docScore, 
            duplicateRiskScore: dupRisk,
            masterRiskScore: masterScore,
            riskLevel: level,
            civilIdentityConsistencyScore: civilScore,
            civilIdentityStatus: civilStatus,
            flags: Array.from(new Set([...player.flags, ...docFlags, ...dupFlags, ...dukcapilFlags, ...registryAgeFlags])), 
            metrics,
            status: finalStatus,
            dukcapilResult: dukcapilRes,
            verificationLogs: [...(player.verificationLogs || []), newLog]
          };
        }));
        setPlayers(updatedPlayers);
      } else {
        const updatedPlayers = await Promise.all(players.map(async (player) => {
          if (player.id === id) {
            const { score: docScore, flags: docFlags, metrics } = calculateConsistency(player);
            const { riskScore: dupRisk, flags: dupFlags } = detectMultiRegistration(player, players);
            
            // DUKCAPIL Validation Integration with Connection Manager
            let dukcapilRes: DukcapilValidationResult | undefined;
            if (player.documents) {
              // 1. Establish Secure Connection via Manager
              const apiResponse = await apiConnectionManager.sendPostRequest("/api/v1/dukcapil/validate", {
                nik: player.nik,
                fullName: player.name,
                dob: player.documents.birthCertificate.dob,
                kkNumber: player.nik.substring(0, 16),
              });

              // 2. Handle Connection Errors
              if (apiResponse.error) {
                setConnectionStatus(apiResponse.error as ConnectionStatus);
                throw new Error(apiResponse.error);
              }

              // 3. Process Validation
              dukcapilRes = await validateWithDukcapil({
                nik: player.nik,
                fullName: player.name,
                dob: player.documents.birthCertificate.dob,
                parentName: player.documents.birthCertificate.parentName,
                familyCardNumber: player.nik.substring(0, 16),
                placeOfBirth: player.documents.birthCertificate.birthplace,
              });
              setLastSync(new Date().toISOString());
            }

            const { masterScore, level } = calculateMasterRisk({
              ...player,
              docConsistencyScore: docScore,
              duplicateRiskScore: dupRisk,
              ageRiskScore: player.ageRiskScore || 0,
              faceMatchConfidence: player.faceMatchConfidence
            });

            const { score: civilScore, status: civilStatus } = calculateCivilIdentityConsistency(
              dukcapilRes?.score || 0,
              docScore,
              player.faceMatchConfidence || 0
            );

            // Final Decision Logic: DUKCAPIL Match + Consistency Level
            const finalStatus = determineFinalDecision(
              dukcapilRes?.status || "NO MATCH",
              civilStatus
            );

            const dukcapilFlags = dukcapilRes?.status === "NO MATCH" ? ["CRITICAL: DUKCAPIL Registry mismatch"] : 
                                 dukcapilRes?.status === "PARTIAL MATCH" ? ["WARNING: Partial identity match in Civil Registry"] : [];

            // DUKCAPIL Birth Year Validation (Target: 2014)
            const registryAgeFlags: string[] = [];
            if (player.documents?.birthCertificate.dob) {
              const registryYear = new Date(player.documents.birthCertificate.dob).getFullYear();
              if (registryYear < 2014) registryAgeFlags.push("OVER AGE FLAG (DUKCAPIL: " + registryYear + ")");
              else if (registryYear > 2014) registryAgeFlags.push("UNDER AGE FLAG (DUKCAPIL: " + registryYear + ")");
            }

            // 4. Create Immutable Log Entry
            const newLog: IdentityVerificationLog = {
              timestamp: new Date().toISOString(),
              matchResult: dukcapilRes?.status || "NO MATCH",
              score: civilScore,
              adminOverride: false,
              attemptType: player.verificationLogs && player.verificationLogs.length > 0 ? "RE-VALIDATION" : "INITIAL",
              executor: "SYSTEM_AUTO_SCAN"
            };

            // 5. Persist to Database
            try {
              await playerService.updateVerificationStatus(
                player.id,
                {
                  dukcapil_status: dukcapilRes?.status as any,
                  dukcapil_match_score: dukcapilRes?.score || 0,
                  consistency_score: civilScore,
                  verification_status: finalStatus,
                },
                {
                  action_type: 'VALIDATION',
                  new_status: finalStatus,
                  payload: dukcapilRes
                }
              );
            } catch (dbError) {
              console.error("Database sync failed:", dbError);
            }

            return { 
              ...player, 
              docConsistencyScore: docScore, 
              duplicateRiskScore: dupRisk,
              masterRiskScore: masterScore,
              riskLevel: level,
              civilIdentityConsistencyScore: civilScore,
              civilIdentityStatus: civilStatus,
              flags: Array.from(new Set([...player.flags, ...docFlags, ...dupFlags, ...dukcapilFlags, ...registryAgeFlags])), 
                metrics,
                status: finalStatus,
                dukcapilResult: dukcapilRes,
                verificationLogs: [...(player.verificationLogs || []), newLog]
              };
          }
          return player;
        }));
        setPlayers(updatedPlayers);
        const newlyVerified = updatedPlayers.find(p => p.id === id);
        if (newlyVerified) setSelectedPlayer(newlyVerified);
      }
    };

    toast.promise(runVerificationTask(), {
      loading: "Establishing DUKCAPIL Uplink...",
      success: () => {
        setIsScanning(false);
        return "Civil Registry Verification Complete. Data synchronized.";
      },
      error: "Connection failure to Population Database."
    });
  };

  const getStatusStyles = (status: VerificationStatus) => {
    switch (status) {
      case "VERIFIED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "REJECTED": return "bg-destructive/10 text-destructive border-destructive/20";
      case "MANUAL REVIEW": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-950 min-h-screen font-montserrat text-slate-300 page-fade-in">
      
      {/* ── COMMAND HEADER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden glass-reflection">
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
              disabled={isScanning || connectionStatus !== "CONNECTED"}
              className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/40 group micro-tap glow-hover-blue"
            >
              <Scan className={`w-4 h-4 ${isScanning ? 'animate-spin' : 'group-hover:animate-bounce'}`} />
              Run Global Scan
            </button>
          </div>
        </div>

        {/* API Connection Manager UI */}
        <ApiConnectionStatus 
          status={connectionStatus} 
          lastChecked={lastSync}
          onReconnect={handleReconnect}
        />
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
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Verification Status</th>
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
                      <code className="text-xs font-oswald text-slate-400 tracking-wider" title={player.nik}>
                        {maskNik(player.nik)}
                      </code>
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
                      <VerificationStatusBadge status={player.status} riskScore={player.masterRiskScore || 0} />
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
                <VerificationStatusBadge status={selectedPlayer.status} riskScore={selectedPlayer.masterRiskScore || 0} />
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

                  {/* Civil Identity Consistency Score */}
                  {selectedPlayer.civilIdentityConsistencyScore !== undefined && (
                    <div className="p-5 rounded-2xl bg-blue-600/5 border border-blue-500/20 space-y-4 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Fingerprint className="w-12 h-12 text-blue-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Civil Identity Consistency</p>
                          <p className={`text-[9px] font-bold uppercase mt-1 ${
                            selectedPlayer.civilIdentityStatus === "HIGH CONSISTENCY" ? "text-emerald-500" :
                            selectedPlayer.civilIdentityStatus === "MODERATE" ? "text-amber-500" :
                            "text-destructive"
                          }`}>
                            {selectedPlayer.civilIdentityStatus}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-3xl font-oswald font-bold drop-shadow-lg ${
                            selectedPlayer.civilIdentityConsistencyScore >= 85 ? "text-emerald-500" :
                            selectedPlayer.civilIdentityConsistencyScore >= 60 ? "text-amber-500" :
                            "text-destructive"
                          }`}>
                            {selectedPlayer.civilIdentityConsistencyScore}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Integrated Progress Bar */}
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            selectedPlayer.civilIdentityConsistencyScore >= 85 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                            selectedPlayer.civilIdentityConsistencyScore >= 60 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                            'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                          }`} 
                          style={{ width: `${selectedPlayer.civilIdentityConsistencyScore}%` }} 
                        />
                      </div>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight text-center">
                        Weighted Aggregation: DUKCAPIL (50%) + Documents (30%) + Biometrics (20%)
                      </p>
                    </div>
                  )}

                  {/* Civil Registry Status Indicator */}
                  {selectedPlayer.dukcapilResult && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-blue-500" /> Civil Registry Status
                      </p>
                      <CivilDataMatchIndicator result={selectedPlayer.dukcapilResult} />
                    </div>
                  )}
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
                  <button 
                    onClick={() => setShowLogHistory(true)}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all micro-tap"
                  >
                    <History className="w-4 h-4" /> Log History
                  </button>
                  <button 
                    onClick={() => setShowOverrideModal(true)}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all micro-tap"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Override Decision
                  </button>
                  <button className="flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/40 micro-tap glow-hover-green">
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
