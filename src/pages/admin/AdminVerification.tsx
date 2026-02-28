import { useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, Camera, User, Check, X, Upload, Eye, Lock, CalendarCheck, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface DocumentFile {
  fileName: string;
  fileType: string;
  uploadedAt: string;
  previewUrl: string;
}

interface VerificationLog {
  timestamp: string;
  action: "submitted" | "under_review" | "approved" | "rejected" | "reupload_requested" | "risk_score_changed" | "verification_attempt" | "log_viewed";
  adminName?: string;
  notes?: string;
  details?: {
    oldScore?: number;
    newScore?: number;
    attemptNumber?: number;
    documentsUploaded?: string[];
  };
}

interface VerificationRequest {
  id: string;
  playerId?: string;
  playerName: string;
  club: string;
  type: string;
  documentNames: string[];
  status: "pending" | "review" | "approved" | "rejected";
  priority: "normal" | "high";
  submitted: string;
  age: number;
  uploadTimestamp: string;
  verificationAttempts: number;
  currentRiskScore: number;
  documents: {
    nik: DocumentFile;
    kk: DocumentFile;
    selfie: DocumentFile;
  };
  faceMatchData: {
    matchPercentage: number;
    confidenceScore: number;
    faceGeometry: number;
    featurePoints: number;
    documentMatch: number;
  };
  adminNotes: string;
  verificationHistory: VerificationLog[];
}

const initialVerificationRequests: VerificationRequest[] = [
  {
    id: "VER-001",
    playerId: "PLY-001",
    playerName: "Rizki Fauzan",
    club: "Garuda Muda FC",
    type: "New Registration",
    documentNames: ["ID Card", "Birth Certificate", "Photo"],
    status: "pending",
    priority: "normal",
    submitted: "2026-02-28 09:15",
    age: 16,
    uploadTimestamp: "2026-02-28 09:15",
    verificationAttempts: 2,
    currentRiskScore: 8,
    documents: {
      nik: { fileName: "nik_001.jpg", fileType: "jpg", uploadedAt: "2026-02-28 09:00", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect fill='%23334155' width='120' height='160'/%3E%3Ctext x='50%' y='50%' fill='%2394a3b8' font-size='12' text-anchor='middle' dy='.3em'%3EID Card%3C/text%3E%3C/svg%3E" },
      kk: { fileName: "kk_001.jpg", fileType: "jpg", uploadedAt: "2026-02-28 09:05", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect fill='%23475569' width='120' height='160'/%3E%3Ctext x='50%' y='50%' fill='%23cbd5e1' font-size='12' text-anchor='middle' dy='.3em'%3EBirth Cert%3C/text%3E%3C/svg%3E" },
      selfie: { fileName: "selfie_001.jpg", fileType: "jpg", uploadedAt: "2026-02-28 09:10", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280'%3E%3Crect fill='%23334155' width='280' height='280'/%3E%3Ccircle cx='140' cy='100' r='30' fill='%236366f1'/%3E%3Crect x='80' y='140' width='120' height='100' fill='%236366f1'/%3E%3Ctext x='140' y='260' fill='%2394a3b8' font-size='14' text-anchor='middle'%3ESelfie%3C/text%3E%3C/svg%3E" },
    },
    faceMatchData: {
      matchPercentage: 92,
      confidenceScore: 95,
      faceGeometry: 97,
      featurePoints: 93,
      documentMatch: 94,
    },
    adminNotes: "",
    verificationHistory: [
      { timestamp: "2026-02-28 09:15", action: "submitted" },
      { timestamp: "2026-02-28 09:30", action: "verification_attempt", details: { attemptNumber: 1 } },
      { timestamp: "2026-02-28 09:45", action: "risk_score_changed", details: { oldScore: 15, newScore: 8 } },
      { timestamp: "2026-02-28 10:00", action: "under_review" },
    ],
  },
  {
    id: "VER-002",
    playerId: "PLY-002",
    playerName: "Andi Pratama",
    club: "Elang Jaya",
    type: "Document Update",
    documentNames: ["ID Card", "Transfer Letter"],
    status: "pending",
    priority: "normal",
    submitted: "2026-02-28 08:42",
    age: 17,
    uploadTimestamp: "2026-02-28 08:42",
    verificationAttempts: 1,
    currentRiskScore: 22,
    documents: {
      nik: { fileName: "nik_002.jpg", fileType: "jpg", uploadedAt: "2026-02-28 08:30", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect fill='%23334155' width='120' height='160'/%3E%3Ctext x='50%' y='50%' fill='%23cbd5e1' font-size='12' text-anchor='middle' dy='.3em'%3EID Card%3C/text%3E%3C/svg%3E" },
      kk: { fileName: "kk_002.jpg", fileType: "jpg", uploadedAt: "2026-02-28 08:35", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect fill='%23475569' width='120' height='160'/%3E%3Ctext x='50%' y='50%' fill='%23cbd5e1' font-size='12' text-anchor='middle' dy='.3em'%3EPending%3C/text%3E%3C/svg%3E" },
      selfie: { fileName: "selfie_002.jpg", fileType: "jpg", uploadedAt: "2026-02-28 08:40", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280'%3E%3Crect fill='%23364151' width='280' height='280'/%3E%3Ccircle cx='140' cy='100' r='30' fill='%2360a5fa'/%3E%3Crect x='80' y='140' width='120' height='100' fill='%2360a5fa'/%3E%3Ctext x='140' y='260' fill='%23cbd5e1' font-size='14' text-anchor='middle'%3EPhoto%3C/text%3E%3C/svg%3E" },
    },
    faceMatchData: {
      matchPercentage: 78,
      confidenceScore: 82,
      faceGeometry: 85,
      featurePoints: 79,
      documentMatch: 81,
    },
    adminNotes: "",
    verificationHistory: [{ timestamp: "2026-02-28 08:42", action: "submitted" }],
  },
  {
    id: "VER-003",
    playerId: "PLY-003",
    playerName: "Dimas Arya",
    club: "Rajawali United",
    type: "Age Verification",
    documentNames: ["Birth Certificate", "School ID"],
    status: "review",
    priority: "high",
    submitted: "2026-02-27 14:20",
    age: 15,
    uploadTimestamp: "2026-02-27 14:20",
    verificationAttempts: 3,
    currentRiskScore: 55,
    documents: {
      nik: { fileName: "nik_003.jpg", fileType: "jpg", uploadedAt: "2026-02-27 14:10", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect fill='%23334155' width='120' height='160'/%3E%3Ctext x='50%' y='50%' fill='%23fed7aa' font-size='12' text-anchor='middle' dy='.3em'%3EID Card%3C/text%3E%3C/svg%3E" },
      kk: { fileName: "kk_003.jpg", fileType: "jpg", uploadedAt: "2026-02-27 14:12", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect fill='%23714f3d' width='120' height='160'/%3E%3Ctext x='50%' y='50%' fill='%23fed7aa' font-size='12' text-anchor='middle' dy='.3em'%3EBirth Cert%3C/text%3E%3C/svg%3E" },
      selfie: { fileName: "selfie_003.jpg", fileType: "jpg", uploadedAt: "2026-02-27 14:15", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280'%3E%3Crect fill='%23734c3d' width='280' height='280'/%3E%3Ccircle cx='140' cy='100' r='30' fill='%23fbbf24'/%3E%3Crect x='80' y='140' width='120' height='100' fill='%23fbbf24'/%3E%3Ctext x='140' y='260' fill='%23fed7aa' font-size='14' text-anchor='middle'%3ESelfie%3C/text%3E%3C/svg%3E" },
    },
    faceMatchData: {
      matchPercentage: 45,
      confidenceScore: 48,
      faceGeometry: 42,
      featurePoints: 46,
      documentMatch: 51,
    },
    adminNotes: "",
    verificationHistory: [
      { timestamp: "2026-02-27 14:20", action: "submitted" },
      { timestamp: "2026-02-27 14:30", action: "verification_attempt", details: { attemptNumber: 1 } },
      { timestamp: "2026-02-27 14:45", action: "reupload_requested", notes: "Selfie blurry", adminName: "Admin John" },
      { timestamp: "2026-02-27 15:00", action: "under_review", adminName: "Admin John" },
    ],
  },
  {
    id: "VER-004",
    playerId: "PLY-004",
    playerName: "Budi Hartono",
    club: "Banteng FC",
    type: "Transfer Request",
    documentNames: ["Transfer Letter", "Release Form", "ID Card"],
    status: "pending",
    priority: "normal",
    submitted: "2026-02-27 11:05",
    age: 18,
    uploadTimestamp: "2026-02-27 11:05",
    verificationAttempts: 1,
    currentRiskScore: 12,
    documents: {
      nik: { fileName: "nik_004.jpg", fileType: "jpg", uploadedAt: "2026-02-27 11:00", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect fill='%23334155' width='120' height='160'/%3E%3Ctext x='50%' y='50%' fill='%2386efac' font-size='12' text-anchor='middle' dy='.3em'%3EID Card%3C/text%3E%3C/svg%3E" },
      kk: { fileName: "kk_004.jpg", fileType: "jpg", uploadedAt: "2026-02-27 11:02", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect fill='%232d4a2b' width='120' height='160'/%3E%3Ctext x='50%' y='50%' fill='%2386efac' font-size='12' text-anchor='middle' dy='.3em'%3EBirth Cert%3C/text%3E%3C/svg%3E" },
      selfie: { fileName: "selfie_004.jpg", fileType: "jpg", uploadedAt: "2026-02-27 11:05", previewUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280'%3E%3Crect fill='%232d5a2d' width='280' height='280'/%3E%3Ccircle cx='140' cy='100' r='30' fill='%2310b981'/%3E%3Crect x='80' y='140' width='120' height='100' fill='%2310b981'/%3E%3Ctext x='140' y='260' fill='%2386efac' font-size='14' text-anchor='middle'%3ESelfie%3C/text%3E%3C/svg%3E" },
    },
    faceMatchData: {
      matchPercentage: 88,
      confidenceScore: 91,
      faceGeometry: 89,
      featurePoints: 87,
      documentMatch: 93,
    },
    adminNotes: "",
    verificationHistory: [
      { timestamp: "2026-02-27 11:05", action: "submitted" },
      { timestamp: "2026-02-27 12:00", action: "under_review", adminName: "Admin Jane" },
    ],
  },
];

const verificationStats = [
  { label: "Total Pending", value: "43", icon: Clock, color: "text-muted-foreground" },
  { label: "Approved Today", value: "12", icon: CheckCircle2, color: "text-accent" },
  { label: "Rejected Today", value: "3", icon: XCircle, color: "text-destructive" },
  { label: "Urgent", value: "5", icon: AlertTriangle, color: "text-destructive" },
];

// Face Match Ring Component
interface FaceMatchRingProps {
  percentage: number;
  size?: number;
}

const FaceMatchRing = ({ percentage, size = 120 }: FaceMatchRingProps) => {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let color = "#ef4444"; // red
  if (percentage >= 80) color = "#10b981"; // green
  else if (percentage >= 50) color = "#f59e0b"; // yellow

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center">
          <p className="text-2xl font-oswald font-bold text-foreground">{percentage}%</p>
          <p className="text-[10px] font-montserrat text-muted-foreground">Match</p>
        </div>
      </div>
    </div>
  );
};

// Verification Detail Modal Component
interface VerificationModalProps {
  request: VerificationRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, notes: string) => void;
  onRequestReupload: (id: string, notes: string) => void;
  adminNotes: Record<string, string>;
  onNotesChange: (id: string, notes: string) => void;
}

const VerificationDetailModal = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRequestReupload,
  adminNotes,
  onNotesChange,
}: VerificationModalProps) => {
  if (!request) return null;

  const notes = adminNotes[request.id] || "";
  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "text-accent bg-accent/10";
    if (value >= 50) return "text-yellow-500 bg-yellow-500/10";
    return "text-destructive bg-destructive/10";
  };

  const formatTime = (timestamp: string) => {
    return timestamp.split(" ").slice(0, 2).join(" ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-oswald font-bold uppercase">
              {request.playerName} - Verification Request
            </DialogTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs font-montserrat font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {request.id}
              </span>
              {request.priority === "high" && (
                <span className="text-xs font-montserrat font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> URGENT
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Side-by-side layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Documents */}
            <div className="space-y-4">
              <h3 className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider">Documents</h3>
              <div className="space-y-3">
                {[
                  { label: "ID Card (NIK)", doc: request.documents.nik },
                  { label: "Birth Certificate (KK)", doc: request.documents.kk },
                  { label: "Selfie", doc: request.documents.selfie },
                ].map(({ label, doc }) => (
                  <div key={label} className="space-y-2">
                    <p className="text-xs font-montserrat font-medium text-muted-foreground">{label}</p>
                    <div className="relative group">
                      <img
                        src={doc.previewUrl}
                        alt={label}
                        className="w-full rounded-lg border border-border/50 hover:border-accent/50 transition-all group-hover:shadow-lg group-hover:shadow-accent/20"
                      />
                      <p className="text-[9px] font-montserrat text-muted-foreground mt-1">{doc.fileName}</p>
                      <p className="text-[9px] font-montserrat text-muted-foreground">{formatTime(doc.uploadedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Selfie & Face Match */}
            <div className="space-y-4">
              <h3 className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider">Face Match Analysis</h3>

              {/* Selfie */}
              <div>
                <p className="text-xs font-montserrat font-medium text-muted-foreground mb-2">Player Selfie</p>
                <img
                  src={request.documents.selfie.previewUrl}
                  alt="Player Selfie"
                  className="w-full max-w-xs rounded-lg border border-border/50"
                />
              </div>

              {/* Face Match Ring */}
              <div className="flex justify-center py-4">
                <div className="relative">
                  <FaceMatchRing percentage={request.faceMatchData.matchPercentage} size={140} />
                </div>
              </div>

              {/* AI Confidence Breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-montserrat font-medium text-muted-foreground">AI Confidence Score</p>
                {[
                  { label: "Face Geometry", value: request.faceMatchData.faceGeometry },
                  { label: "Feature Points", value: request.faceMatchData.featurePoints },
                  { label: "Document Match", value: request.faceMatchData.documentMatch },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-montserrat text-muted-foreground">{label}</span>
                      <span className={`font-montserrat font-bold px-2 py-0.5 rounded ${getConfidenceColor(value)}`}>
                        {value}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          value >= 80 ? "bg-accent" : value >= 50 ? "bg-yellow-500" : "bg-destructive"
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="border-t border-border/30 pt-6 space-y-3">
            <div>
              <label className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider block mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" /> Admin Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(request.id, e.target.value.slice(0, 500))}
                placeholder="Add notes about verification decision, issues, or recommendations..."
                className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 h-24"
              />
              <p className="text-[9px] font-montserrat text-muted-foreground mt-1">{notes.length}/500</p>
            </div>
          </div>

          {/* Verification Timeline */}
          <div className="border-t border-border/30 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider">Verification Audit Trail</h3>
              <div className="flex gap-4 text-[10px] font-montserrat text-muted-foreground uppercase tracking-tighter">
                <span>Upload: {request.uploadTimestamp}</span>
                <span>Attempts: {request.verificationAttempts}</span>
                <span>Risk Index: {request.currentRiskScore}</span>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {request.verificationHistory.map((log, idx) => (
                <div key={idx} className="flex gap-3 group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        log.action === "approved"
                          ? "bg-accent/10 border-accent text-accent"
                          : log.action === "rejected"
                          ? "bg-destructive/10 border-destructive text-destructive"
                          : log.action === "risk_score_changed"
                          ? "bg-blue-500/10 border-blue-500 text-blue-500"
                          : log.action === "verification_attempt"
                          ? "bg-purple-500/10 border-purple-500 text-purple-500"
                          : log.action === "submitted"
                          ? "bg-muted/10 border-muted text-foreground"
                          : "bg-yellow-500/10 border-yellow-500 text-yellow-500"
                      }`}
                    >
                      {log.action === "approved" ? (
                        <Check className="w-4 h-4" />
                      ) : log.action === "rejected" ? (
                        <X className="w-4 h-4" />
                      ) : log.action === "risk_score_changed" ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : log.action === "verification_attempt" ? (
                        <Camera className="w-4 h-4" />
                      ) : log.action === "submitted" ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </div>
                    {idx < request.verificationHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-border/20 my-1" />
                    )}
                  </div>
                  <div className="pt-1 pb-2 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-montserrat font-bold text-foreground uppercase tracking-tight">
                        {log.action.replace(/_/g, " ")}
                      </p>
                      <span className="text-[9px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                        {log.timestamp}
                      </span>
                    </div>
                    
                    {log.adminName && (
                      <p className="text-[9px] font-montserrat font-medium text-accent/70 mt-0.5">Executor: {log.adminName}</p>
                    )}

                    {log.details && (
                      <div className="mt-2 p-2 rounded bg-muted/30 border border-border/20 text-[10px] font-montserrat space-y-1">
                        {log.details.oldScore !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Transition:</span>
                            <span className="font-bold">{log.details.oldScore} → {log.details.newScore}</span>
                          </div>
                        )}
                        {log.details.attemptNumber && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Scan Sequence:</span>
                            <span className="font-bold">#{log.details.attemptNumber}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {log.notes && (
                      <div className="mt-2 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent/30 rounded-full" />
                        <p className="text-[10px] font-montserrat text-muted-foreground italic pl-3 leading-relaxed">
                          "{log.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-muted/10 border border-dashed border-border/50 rounded-lg">
              <p className="text-[9px] font-montserrat text-center text-muted-foreground/60 uppercase tracking-widest flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" /> System Sealed Log • Non-Editable Audit Trail
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <button
            onClick={() => {
              onRequestReupload(request.id, notes);
              onClose();
            }}
            className="flex items-center gap-1.5 bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30 px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover"
          >
            <Upload className="w-4 h-4" /> Reupload
          </button>
          <button
            onClick={() => {
              onReject(request.id, notes);
              onClose();
            }}
            className="flex items-center gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover"
          >
            <X className="w-4 h-4" /> Reject
          </button>
          <button
            onClick={() => {
              onApprove(request.id, notes);
              onClose();
            }}
            className="flex items-center gap-1.5 bg-accent text-background hover:bg-accent/90 px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
const AdminVerification = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>(initialVerificationRequests);
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const selectedRequest = requests.find((r) => r.id === selectedVerificationId);

  const statusConfig = {
    pending: { label: "Pending", icon: Clock, className: "status-pending" },
    review: { label: "Under Review", icon: ShieldCheck, className: "status-pending" },
    approved: { label: "Approved", icon: CheckCircle2, className: "status-approved" },
    rejected: { label: "Rejected", icon: XCircle, className: "status-rejected" },
  };

  const handleApprove = (id: string, notes: string) => {
    setRequests(
      requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "approved",
              adminNotes: notes,
              verificationHistory: [
                ...r.verificationHistory,
                {
                  timestamp: new Date().toISOString().replace("T", " ").split(".")[0],
                  action: "approved",
                  adminName: "Admin Jane",
                  notes: notes || undefined,
                },
              ],
            }
          : r
      )
    );
    toast.success(`${requests.find((r) => r.id === id)?.playerName} verified successfully`);
    setAdminNotes({ ...adminNotes, [id]: "" });
  };

  const handleReject = (id: string, notes: string) => {
    setRequests(
      requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "rejected",
              adminNotes: notes,
              verificationHistory: [
                ...r.verificationHistory,
                {
                  timestamp: new Date().toISOString().replace("T", " ").split(".")[0],
                  action: "rejected",
                  adminName: "Admin Jane",
                  notes: notes || undefined,
                },
              ],
            }
          : r
      )
    );
    toast.error(`${requests.find((r) => r.id === id)?.playerName} verification rejected`);
    setAdminNotes({ ...adminNotes, [id]: "" });
  };

  const handleRequestReupload = (id: string, notes: string) => {
    setRequests(
      requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "pending",
              adminNotes: notes,
              verificationHistory: [
                ...r.verificationHistory,
                {
                  timestamp: new Date().toISOString().replace("T", " ").split(".")[0],
                  action: "reupload_requested",
                  adminName: "Admin Jane",
                  notes: notes || undefined,
                },
              ],
            }
          : r
      )
    );
    toast.info(`${requests.find((r) => r.id === id)?.playerName} reupload requested`);
    setAdminNotes({ ...adminNotes, [id]: "" });
  };

  const handleNotesChange = (id: string, notes: string) => {
    setAdminNotes({ ...adminNotes, [id]: notes });
  };

  const handleOpenDetails = (id: string) => {
    setSelectedVerificationId(id);
    
    // Log Access Monitoring: Track whenever a sensitive record is opened
    setRequests(prev => prev.map(r => 
      r.id === id ? {
        ...r,
        verificationHistory: [
          ...r.verificationHistory,
          {
            timestamp: new Date().toISOString().replace("T", " ").split(".")[0],
            action: "log_viewed",
            adminName: "Admin Jane",
            notes: "Admin opened full verification report"
          }
        ]
      } : r
    ));
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Verification Center</h1>
        <p className="text-xs font-montserrat text-muted-foreground mt-1">Review and approve player identity documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {verificationStats.map((stat) => (
          <div key={stat.label} className="glass-card-gradient rounded-lg p-4 micro-hover relative z-0">
            <div className="relative z-10 flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-oswald font-bold text-foreground">{stat.value}</p>
                <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            onClick={() => handleOpenDetails(req.id)}
            className="glass-card rounded-lg p-5 micro-hover relative z-0 cursor-pointer hover:border-accent/30 transition-all"
          >
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-oswald font-bold text-foreground uppercase">{req.playerName}</h3>
                      <span className="text-[9px] font-montserrat font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {req.id}
                      </span>
                      {req.status === "approved" && (
                        <span className="text-[9px] font-montserrat font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="text-[9px] font-montserrat font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      {req.priority === "high" && req.status !== "approved" && (
                        <span className="text-[9px] font-montserrat font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-montserrat text-muted-foreground mt-0.5">
                      {req.club} • {req.type} • Age: {req.age}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {req.documentNames.map((doc) => (
                        <span key={doc} className="flex items-center gap-1 text-[9px] font-montserrat font-medium text-foreground bg-muted/40 px-2 py-1 rounded">
                          <FileText className="w-3 h-3 text-muted-foreground" /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[9px] font-montserrat text-muted-foreground">{req.submitted}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(req.id);
                    }}
                    className="flex items-center gap-1.5 bg-muted/30 hover:bg-muted/50 text-foreground px-3 py-1.5 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider micro-hover transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <VerificationDetailModal
        request={selectedRequest || null}
        isOpen={selectedVerificationId !== null}
        onClose={() => setSelectedVerificationId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestReupload={handleRequestReupload}
        adminNotes={adminNotes}
        onNotesChange={handleNotesChange}
      />
    </div>
  );
};

export default AdminVerification;
