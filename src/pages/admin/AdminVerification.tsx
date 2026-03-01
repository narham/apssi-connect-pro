import { useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, Camera, User, Check, X, Upload, Eye, Lock, MessageSquare, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useVerificationPlayers, useVerificationStats } from "@/hooks/useAdminData";
import { playerService } from "@/services/playerService";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

// Face Match Ring Component
const FaceMatchRing = ({ percentage, size = 120 }: { percentage: number; size?: number }) => {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  let color = "hsl(var(--destructive))";
  if (percentage >= 80) color = "hsl(var(--accent))";
  else if (percentage >= 50) color = "#f59e0b";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/30" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="6" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
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

// ── Verification Detail Modal ──
interface VerificationModalProps {
  player: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, notes: string) => void;
  onRequestReupload: (id: string, notes: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

const VerificationDetailModal = ({ player, isOpen, onClose, onApprove, onReject, onRequestReupload, notes, onNotesChange }: VerificationModalProps) => {
  if (!player) return null;

  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "text-accent bg-accent/10";
    if (value >= 50) return "text-yellow-500 bg-yellow-500/10";
    return "text-destructive bg-destructive/10";
  };

  const faceMatch = Number(player.face_match_confidence);
  const dukcapilMatch = Number(player.dukcapil_match_score);
  const consistency = Number(player.consistency_score);
  const isHighRisk = consistency < 40;

  const logs = (player.verification_logs ?? []) as any[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-oswald font-bold uppercase">
              {player.full_name} - Verification Request
            </DialogTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs font-montserrat font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded font-mono">
                {player.id.slice(0, 8)}
              </span>
              {isHighRisk && (
                <span className="text-xs font-montserrat font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> HIGH RISK
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Player Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider">Player Information</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "NIK", value: player.nik },
                  { label: "Birth Date", value: player.birth_date },
                  { label: "Birth Place", value: player.birth_place ?? '—' },
                  { label: "Club", value: player.clubs?.name ?? '—' },
                  { label: "Parent Name", value: player.parent_name ?? '—' },
                  { label: "KK Number", value: player.kk_number ?? '—' },
                  { label: "Over Age", value: player.is_over_age ? "Yes ⚠️" : "No" },
                  { label: "Dukcapil Status", value: player.dukcapil_status },
                ].map((item) => (
                  <div key={item.label} className="bg-muted/20 rounded-lg p-3">
                    <p className="text-[10px] font-montserrat text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs font-montserrat font-semibold text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Scores */}
            <div className="space-y-4">
              <h3 className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider">Verification Scores</h3>

              <div className="flex justify-center py-4">
                <div className="relative">
                  <FaceMatchRing percentage={faceMatch} size={140} />
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Face Match Confidence", value: faceMatch },
                  { label: "Dukcapil Match Score", value: dukcapilMatch },
                  { label: "Consistency Score", value: consistency },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-montserrat text-muted-foreground">{label}</span>
                      <span className={`font-montserrat font-bold px-2 py-0.5 rounded ${getConfidenceColor(value)}`}>
                        {value.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${value >= 80 ? "bg-accent" : value >= 50 ? "bg-yellow-500" : "bg-destructive"}`} style={{ width: `${Math.min(value, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="border-t border-border/30 pt-6 space-y-3">
            <label className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider block">
              <MessageSquare className="w-4 h-4 inline mr-1" /> Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value.slice(0, 500))}
              placeholder="Add notes about verification decision..."
              className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 h-24"
            />
            <p className="text-[9px] font-montserrat text-muted-foreground">{notes.length}/500</p>
          </div>

          {/* Verification Timeline from DB */}
          {logs.length > 0 && (
            <div className="border-t border-border/30 pt-6 space-y-4">
              <h3 className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider">Verification Audit Trail</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {logs.map((log: any) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        log.new_status === 'VERIFIED' ? "bg-accent/10 border-accent text-accent" :
                        log.new_status === 'REJECTED' ? "bg-destructive/10 border-destructive text-destructive" :
                        "bg-muted/10 border-muted text-foreground"
                      }`}>
                        {log.new_status === 'VERIFIED' ? <Check className="w-4 h-4" /> :
                         log.new_status === 'REJECTED' ? <X className="w-4 h-4" /> :
                         <Clock className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="pt-1 pb-2 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-montserrat font-bold text-foreground uppercase tracking-tight">
                          {log.action_type.replace(/_/g, ' ')}
                        </p>
                        <span className="text-[9px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                          {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm')}
                        </span>
                      </div>
                      {log.old_status && log.new_status && (
                        <p className="text-[10px] font-montserrat text-muted-foreground mt-0.5">{log.old_status} → {log.new_status}</p>
                      )}
                      {log.reason && (
                        <p className="text-[10px] font-montserrat text-muted-foreground italic mt-1">"{log.reason}"</p>
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
          )}
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <button onClick={() => { onRequestReupload(player.id, notes); onClose(); }} className="flex items-center gap-1.5 bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30 px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
            <Upload className="w-4 h-4" /> Reupload
          </button>
          <button onClick={() => { onReject(player.id, notes); onClose(); }} className="flex items-center gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
            <X className="w-4 h-4" /> Reject
          </button>
          <button onClick={() => { onApprove(player.id, notes); onClose(); }} className="flex items-center gap-1.5 bg-accent text-background hover:bg-accent/90 px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
            <Check className="w-4 h-4" /> Approve
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Component ──
const AdminVerification = () => {
  const { data: players, isLoading } = useVerificationPlayers();
  const { data: stats } = useVerificationStats();
  const queryClient = useQueryClient();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const selectedPlayer = (players ?? []).find((p: any) => p.id === selectedPlayerId);

  const verificationStats = [
    { label: "Total Pending", value: String(stats?.pending ?? '—'), icon: Clock, color: "text-muted-foreground" },
    { label: "Approved Today", value: String(stats?.approvedToday ?? '—'), icon: CheckCircle2, color: "text-accent" },
    { label: "Rejected Today", value: String(stats?.rejectedToday ?? '—'), icon: XCircle, color: "text-destructive" },
    { label: "High Risk", value: String(stats?.highRisk ?? '—'), icon: AlertTriangle, color: "text-destructive" },
  ];

  const handleAction = async (playerId: string, newStatus: string, notes: string) => {
    const player = (players ?? []).find((p: any) => p.id === playerId);
    try {
      await playerService.updateVerificationStatus(
        playerId,
        { verification_status: newStatus },
        {
          action_type: newStatus === 'VERIFIED' ? 'APPROVE' : newStatus === 'REJECTED' ? 'REJECT' : 'REUPLOAD_REQUEST',
          old_status: player?.verification_status ?? 'MANUAL REVIEW',
          new_status: newStatus,
          reason: notes || undefined,
        }
      );
      const label = newStatus === 'VERIFIED' ? 'approved' : newStatus === 'REJECTED' ? 'rejected' : 'reupload requested';
      toast.success(`${player?.full_name} ${label}`);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setAdminNotes("");
    } catch {
      toast.error("Action failed");
    }
  };

  const handleOpenDetails = (id: string) => {
    setSelectedPlayerId(id);
    setAdminNotes("");
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
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (players ?? []).length === 0 ? (
        <div className="glass-card rounded-lg p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-sm font-montserrat font-semibold text-foreground">All Clear!</p>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">No players pending verification</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(players ?? []).map((player: any) => {
            const consistency = Number(player.consistency_score);
            const isHighRisk = consistency < 40;
            return (
              <div
                key={player.id}
                onClick={() => handleOpenDetails(player.id)}
                className="glass-card rounded-lg p-5 micro-hover relative z-0 cursor-pointer hover:border-accent/30 transition-all"
              >
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        {player.photo_url ? (
                          <img src={player.photo_url} alt={player.full_name} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-oswald font-bold text-foreground uppercase">{player.full_name}</h3>
                          {isHighRisk && (
                            <span className="text-[9px] font-montserrat font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> HIGH RISK
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-montserrat text-muted-foreground mt-0.5">
                          {player.clubs?.name ?? '—'} • NIK: {player.nik} • Score: {consistency.toFixed(0)}%
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-[9px] font-montserrat font-medium text-foreground bg-muted/40 px-2 py-1 rounded">
                            <FileText className="w-3 h-3 text-muted-foreground" /> Face: {Number(player.face_match_confidence).toFixed(0)}%
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-montserrat font-medium text-foreground bg-muted/40 px-2 py-1 rounded">
                            <ShieldCheck className="w-3 h-3 text-muted-foreground" /> Dukcapil: {player.dukcapil_status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[9px] font-montserrat text-muted-foreground">
                        {format(new Date(player.created_at), 'yyyy-MM-dd HH:mm')}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDetails(player.id); }}
                        className="flex items-center gap-1.5 bg-muted/30 hover:bg-muted/50 text-foreground px-3 py-1.5 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider micro-hover transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <VerificationDetailModal
        player={selectedPlayer || null}
        isOpen={selectedPlayerId !== null}
        onClose={() => setSelectedPlayerId(null)}
        onApprove={(id, notes) => handleAction(id, 'VERIFIED', notes)}
        onReject={(id, notes) => handleAction(id, 'REJECTED', notes)}
        onRequestReupload={(id, notes) => handleAction(id, 'MANUAL REVIEW', notes)}
        notes={adminNotes}
        onNotesChange={setAdminNotes}
      />
    </div>
  );
};

export default AdminVerification;
