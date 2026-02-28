import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, FileCheck, AlertTriangle, X, Camera, Shield, CheckCircle2, XCircle, Loader2, ScanLine, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";
import StatusBadge from "@/components/StatusBadge";

/* ─── Types ─── */
type DocType = "nik" | "birth";
type UploadState = "idle" | "scanning" | "uploading" | "done" | "error";
type FaceMatchStatus = "idle" | "scanning" | "matched" | "low" | "not_matched";

interface DocUpload {
  type: DocType;
  state: UploadState;
  progress: number;
  fileName?: string;
}

/* ─── Scan Frame Animation ─── */
const ScanFrame = ({ active }: { active: boolean }) => {
  return (
    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden inner-shadow bg-navy-deep/50">
      {/* Corner brackets */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-neon-green/70 rounded-tl" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-neon-green/70 rounded-tr" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-neon-green/70 rounded-bl" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-neon-green/70 rounded-br" />

      {/* Scanning line */}
      {active && (
        <div className="absolute left-4 right-4 h-[2px] gradient-line opacity-80 animate-scan-line" />
      )}

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ScanLine className={cn("w-12 h-12 transition-all duration-500", active ? "text-neon-green animate-pulse-neon" : "text-muted-foreground/30")} />
      </div>
    </div>
  );
};

/* ─── Document Upload Card ─── */
const DocUploadCard = ({
  doc,
  label,
  description,
  onUpload,
  onRemove,
}: {
  doc: DocUpload;
  label: string;
  description: string;
  onUpload: () => void;
  onRemove: () => void;
}) => {
  return (
    <div className={cn(
      "glass-card-gradient rounded-lg p-4 relative z-0 transition-all duration-300",
      doc.state === "done" && "neon-border-green",
      doc.state === "error" && "neon-border-red"
    )}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {doc.state === "done" ? (
              <FileCheck className="w-4 h-4 text-neon-green" />
            ) : doc.state === "error" ? (
              <AlertTriangle className="w-4 h-4 text-neon-red" />
            ) : (
              <Upload className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-xs font-oswald font-bold text-foreground uppercase tracking-wide">{label}</span>
          </div>
          {doc.state === "done" && (
            <button onClick={onRemove} className="micro-tap">
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-neon-red transition-colors" />
            </button>
          )}
        </div>

        <p className="text-[10px] font-montserrat font-medium text-muted-foreground mb-3">{description}</p>

        {doc.state === "idle" && (
          <button
            onClick={onUpload}
            className="w-full py-3 rounded-sm glass-card border border-dashed border-muted-foreground/30 flex flex-col items-center gap-1.5 micro-hover relative z-0 group"
          >
            <Upload className="w-5 h-5 text-muted-foreground group-hover:text-neon-green transition-colors relative z-10" />
            <span className="text-[10px] font-montserrat font-semibold text-muted-foreground group-hover:text-foreground transition-colors relative z-10">
              Tap to upload document
            </span>
          </button>
        )}

        {(doc.state === "scanning" || doc.state === "uploading") && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-neon-green animate-spin" />
              <span className="text-[10px] font-montserrat font-semibold text-neon-green uppercase tracking-wider">
                {doc.state === "scanning" ? "Scanning document..." : "Uploading..."}
              </span>
            </div>
            <div className="h-1.5 bg-secondary/60 rounded-sm overflow-hidden inner-shadow">
              <div
                className="h-full gradient-line rounded-sm transition-all duration-300 ease-out"
                style={{ width: `${doc.progress}%` }}
              />
            </div>
            <p className="text-[9px] font-montserrat text-muted-foreground text-right">{doc.progress}%</p>
          </div>
        )}

        {doc.state === "done" && (
          <div className="flex items-center gap-2 py-2">
            <CheckCircle2 className="w-4 h-4 text-neon-green" />
            <span className="text-[11px] font-montserrat font-semibold text-neon-green">{doc.fileName}</span>
          </div>
        )}

        {doc.state === "error" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-neon-red" />
              <span className="text-[10px] font-montserrat font-semibold text-neon-red">Upload failed. Try again.</span>
            </div>
            <button
              onClick={onUpload}
              className="text-[10px] font-montserrat font-bold text-foreground underline underline-offset-2 micro-tap"
            >
              Retry Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Face Match Ring ─── */
const FaceMatchRing = ({ percentage, status }: { percentage: number; status: FaceMatchStatus }) => {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percentage / 100) * circumference;
  const color = status === "matched" ? "var(--neon-green)" : status === "not_matched" ? "var(--neon-red)" : status === "low" ? "#EAB308" : "var(--muted-foreground)";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" opacity="0.4" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={`hsl(${color})`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: status === "matched" ? "drop-shadow(0 0 8px hsla(var(--neon-green) / 0.6))" :
                   status === "not_matched" ? "drop-shadow(0 0 8px hsla(var(--neon-red) / 0.6))" : "none"
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "text-2xl font-oswald font-bold",
          status === "matched" && "text-neon-green neon-glow-green",
          status === "not_matched" && "text-neon-red neon-glow-red",
          status === "low" && "text-yellow-400",
          (status === "idle" || status === "scanning") && "text-muted-foreground"
        )}>
          {percentage}%
        </span>
        <span className="text-[8px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Match</span>
      </div>
    </div>
  );
};

/* ─── Camera Frame ─── */
const CameraFrame = ({ status }: { status: FaceMatchStatus }) => {
  const glowClass = status === "matched" ? "border-neon-green shadow-[0_0_20px_hsla(var(--neon-green)/0.4)]"
    : status === "not_matched" ? "border-neon-red shadow-[0_0_20px_hsla(var(--neon-red)/0.4)]"
    : status === "low" ? "border-yellow-500 shadow-[0_0_20px_hsla(45,100%,50%,0.3)]"
    : "border-muted-foreground/30";

  return (
    <div className="relative w-full aspect-square max-w-[240px] mx-auto">
      {/* Outer ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-2 transition-all duration-700",
        glowClass
      )} />

      {/* Inner camera area */}
      <div className="absolute inset-3 rounded-full overflow-hidden bg-navy-deep/80 inner-shadow flex items-center justify-center">
        {status === "scanning" ? (
          <div className="relative">
            <Camera className="w-12 h-12 text-neon-green animate-pulse-neon" />
            <div className="absolute -inset-4 border-2 border-dashed border-neon-green/30 rounded-full animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        ) : (
          <Camera className="w-12 h-12 text-muted-foreground/40" />
        )}
      </div>

      {/* Crosshair markers */}
      <div className="absolute top-1/2 left-0 w-3 h-[1px] bg-neon-green/50 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-3 h-[1px] bg-neon-green/50 -translate-y-1/2" />
      <div className="absolute top-0 left-1/2 w-[1px] h-3 bg-neon-green/50 -translate-x-1/2" />
      <div className="absolute bottom-0 left-1/2 w-[1px] h-3 bg-neon-green/50 -translate-x-1/2" />
    </div>
  );
};

/* ─── Face Match Status Label ─── */
const FaceMatchLabel = ({ status }: { status: FaceMatchStatus }) => {
  if (status === "idle" || status === "scanning") return null;

  const config = {
    matched: { label: "FACE MATCHED", icon: CheckCircle2, cls: "text-neon-green neon-glow-green bg-neon-green/10 border-neon-green/30" },
    low: { label: "LOW CONFIDENCE", icon: AlertTriangle, cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
    not_matched: { label: "NOT MATCHED", icon: XCircle, cls: "text-neon-red neon-glow-red bg-neon-red/10 border-neon-red/30" },
  }[status];

  return (
    <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-sm border font-oswald font-bold text-sm uppercase tracking-wider animate-scale-in", config.cls)}>
      <config.icon className="w-4 h-4" />
      {config.label}
    </div>
  );
};

/* ─── Main Page ─── */
const IdentityVerification = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [docs, setDocs] = useState<Record<DocType, DocUpload>>({
    nik: { type: "nik", state: "idle", progress: 0 },
    birth: { type: "birth", state: "idle", progress: 0 },
  });
  const [faceStatus, setFaceStatus] = useState<FaceMatchStatus>("idle");
  const [facePercent, setFacePercent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const simulateUpload = useCallback((docType: DocType) => {
    const fileName = docType === "nik" ? "NIK_Document.jpg" : "Birth_Certificate.pdf";

    setDocs(prev => ({ ...prev, [docType]: { ...prev[docType], state: "scanning", progress: 0 } }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 50 && progress < 60) {
        setDocs(prev => ({ ...prev, [docType]: { ...prev[docType], state: "uploading", progress: Math.min(progress, 100) } }));
      } else if (progress >= 100) {
        clearInterval(interval);
        setDocs(prev => ({ ...prev, [docType]: { ...prev[docType], state: "done", progress: 100, fileName } }));
      } else {
        setDocs(prev => ({ ...prev, [docType]: { ...prev[docType], progress: Math.min(Math.round(progress), 100) } }));
      }
    }, 300);
  }, []);

  const removeDoc = useCallback((docType: DocType) => {
    setDocs(prev => ({ ...prev, [docType]: { type: docType, state: "idle", progress: 0 } }));
  }, []);

  const bothDone = docs.nik.state === "done" && docs.birth.state === "done";

  const startFaceScan = useCallback(() => {
    setFaceStatus("scanning");
    setFacePercent(0);

    let pct = 0;
    intervalRef.current = setInterval(() => {
      pct += Math.random() * 8 + 2;
      if (pct >= 100) {
        pct = 96;
        clearInterval(intervalRef.current!);
        setFacePercent(96);
        setTimeout(() => {
          setFaceStatus("matched");
        }, 600);
      } else {
        setFacePercent(Math.round(pct));
      }
    }, 200);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-neon-green/20 neon-border-green flex items-center justify-center border">
            <Shield className="w-4 h-4 text-neon-green" />
          </div>
          <div>
            <span className="text-xs font-oswald font-bold text-foreground uppercase tracking-[0.12em] block leading-none">Identity Verification</span>
            <span className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">Player KYC</span>
          </div>
        </div>
        <span className="text-[10px] font-montserrat font-bold text-muted-foreground">
          Step <span className="text-neon-green">{step}</span>/2
        </span>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <div className={cn("flex-1 h-1 rounded-full transition-all duration-500", step >= 1 ? "gradient-line" : "bg-secondary")} />
          <div className={cn("flex-1 h-1 rounded-full transition-all duration-500", step >= 2 ? "gradient-line" : "bg-secondary")} />
        </div>

        {/* ═══ STEP 1: Document Upload ═══ */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wide">
                Document <span className="text-gradient-brand">Upload</span>
              </h2>
              <p className="text-[11px] font-montserrat font-medium text-muted-foreground mt-1">
                Upload identity documents for player verification
              </p>
            </div>

            {/* Scan Frame Preview */}
            <ScanFrame active={docs.nik.state === "scanning" || docs.birth.state === "scanning"} />

            {/* Document Cards */}
            <div className="space-y-3">
              <DocUploadCard
                doc={docs.nik}
                label="NIK (KTP/KK)"
                description="Upload Kartu Keluarga or KTP of parent/guardian"
                onUpload={() => simulateUpload("nik")}
                onRemove={() => removeDoc("nik")}
              />
              <DocUploadCard
                doc={docs.birth}
                label="Birth Certificate"
                description="Upload Akta Kelahiran of the player"
                onUpload={() => simulateUpload("birth")}
                onRemove={() => removeDoc("birth")}
              />
            </div>

            {/* Next button */}
            <button
              onClick={() => setStep(2)}
              disabled={!bothDone}
              className={cn(
                "w-full py-3 rounded-sm font-oswald font-bold text-sm uppercase tracking-wider transition-all duration-300 micro-tap flex items-center justify-center gap-2",
                bothDone
                  ? "glass-card-gradient neon-border-green text-neon-green relative z-0"
                  : "glass-card text-muted-foreground/40 cursor-not-allowed relative z-0"
              )}
            >
              <span className="relative z-10">Continue to Face Match</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </button>
          </div>
        )}

        {/* ═══ STEP 2: Face Match ═══ */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wide">
                  Face <span className="text-gradient-brand">Match</span>
                </h2>
                <p className="text-[11px] font-montserrat font-medium text-muted-foreground mt-1">
                  AI-powered facial recognition verification
                </p>
              </div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-[10px] font-montserrat font-semibold text-muted-foreground micro-tap hover:text-foreground transition-colors">
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
            </div>

            {/* Camera Frame */}
            <CameraFrame status={faceStatus} />

            {/* Match Ring */}
            <FaceMatchRing percentage={facePercent} status={faceStatus} />

            {/* Status Label */}
            <div className="flex justify-center">
              {faceStatus === "scanning" ? (
                <div className="flex items-center gap-2 animate-pulse-neon">
                  <Loader2 className="w-4 h-4 text-neon-green animate-spin" />
                  <span className="text-xs font-oswald font-bold text-neon-green uppercase tracking-wider">Analyzing face data...</span>
                </div>
              ) : (
                <FaceMatchLabel status={faceStatus} />
              )}
            </div>

            {/* AI Confidence Details */}
            {(faceStatus === "matched" || faceStatus === "low" || faceStatus === "not_matched") && (
              <div className="glass-card-gradient rounded-lg p-4 relative z-0 animate-slide-up">
                <div className="relative z-10 space-y-3">
                  <h3 className="text-xs font-oswald font-bold text-foreground uppercase tracking-wide">AI Analysis</h3>
                  {[
                    { label: "Face Geometry", value: faceStatus === "matched" ? 97 : faceStatus === "low" ? 62 : 23 },
                    { label: "Feature Points", value: faceStatus === "matched" ? 94 : faceStatus === "low" ? 58 : 31 },
                    { label: "Document Match", value: faceStatus === "matched" ? 96 : faceStatus === "low" ? 55 : 18 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-[10px] font-montserrat font-medium text-muted-foreground w-24">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-secondary/60 rounded-sm overflow-hidden inner-shadow">
                        <div
                          className={cn("h-full rounded-sm transition-all duration-700", item.value > 80 ? "bg-neon-green" : item.value > 50 ? "bg-yellow-500" : "bg-neon-red")}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-oswald font-bold text-foreground w-7 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {faceStatus === "idle" && (
              <button
                onClick={startFaceScan}
                className="w-full py-3 rounded-sm glass-card-gradient neon-border-green text-neon-green font-oswald font-bold text-sm uppercase tracking-wider micro-tap flex items-center justify-center gap-2 relative z-0"
              >
                <Camera className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Start Face Scan</span>
              </button>
            )}

            {faceStatus === "matched" && (
              <div className="space-y-2 animate-slide-up">
                <button className="w-full py-3 rounded-sm glass-card-gradient neon-border-green text-neon-green font-oswald font-bold text-sm uppercase tracking-wider micro-tap flex items-center justify-center gap-2 relative z-0">
                  <CheckCircle2 className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Complete Verification</span>
                </button>
              </div>
            )}

            {(faceStatus === "low" || faceStatus === "not_matched") && (
              <div className="space-y-2 animate-slide-up">
                <button
                  onClick={() => { setFaceStatus("idle"); setFacePercent(0); }}
                  className="w-full py-3 rounded-sm glass-card-gradient neon-border-red text-neon-red font-oswald font-bold text-sm uppercase tracking-wider micro-tap flex items-center justify-center gap-2 relative z-0"
                >
                  <Camera className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Retry Face Scan</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default IdentityVerification;
