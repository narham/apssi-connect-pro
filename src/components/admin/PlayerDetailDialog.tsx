import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlayerDetail } from "@/hooks/useAdminData";
import { CheckCircle2, Clock, XCircle, User, Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface PlayerDetailDialogProps {
  playerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { icon: any; label: string; className: string }> = {
  VERIFIED: { icon: CheckCircle2, label: "Verified", className: "text-accent bg-accent/10" },
  "MANUAL REVIEW": { icon: Clock, label: "Pending Review", className: "text-yellow-500 bg-yellow-500/10" },
  REJECTED: { icon: XCircle, label: "Rejected", className: "text-destructive bg-destructive/10" },
};

const ScoreBar = ({ label, value }: { label: string; value: number }) => {
  const color = value >= 70 ? "bg-accent" : value >= 40 ? "bg-yellow-500" : "bg-destructive";
  const textColor = value >= 70 ? "text-accent" : value >= 40 ? "text-yellow-500" : "text-destructive";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-montserrat">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-bold ${textColor}`}>{Number(value).toFixed(0)}%</span>
      </div>
      <div className="w-full bg-muted/30 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
};

export const PlayerDetailDialog = ({ playerId, open, onOpenChange }: PlayerDetailDialogProps) => {
  const { data: player, isLoading } = usePlayerDetail(playerId);

  const status = player ? statusConfig[player.verification_status] ?? statusConfig["MANUAL REVIEW"] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-oswald font-bold uppercase tracking-wider">Player Detail</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : player ? (
          <div className="space-y-6 py-2">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                {player.photo_url ? (
                  <img src={player.photo_url} alt={player.full_name} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-oswald font-bold text-foreground">{player.full_name}</h2>
                <p className="text-xs font-montserrat text-muted-foreground">{(player as any).clubs?.name ?? '—'}</p>
                {status && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full mt-1 ${status.className}`}>
                    <status.icon className="w-3 h-3" /> {status.label}
                  </span>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "NIK", value: player.nik },
                { label: "Birth Date", value: player.birth_date },
                { label: "Birth Place", value: player.birth_place ?? '—' },
                { label: "Parent Name", value: player.parent_name ?? '—' },
                { label: "KK Number", value: player.kk_number ?? '—' },
                { label: "Over Age", value: player.is_over_age ? "Yes" : "No" },
              ].map((item) => (
                <div key={item.label} className="bg-muted/20 rounded-lg p-3">
                  <p className="text-[10px] font-montserrat text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-montserrat font-semibold text-foreground mt-0.5 font-mono">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Scores */}
            <div className="space-y-3">
              <h3 className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider">Verification Scores</h3>
              <ScoreBar label="Consistency Score" value={Number(player.consistency_score)} />
              <ScoreBar label="Dukcapil Match" value={Number(player.dukcapil_match_score)} />
              <ScoreBar label="Face Match Confidence" value={Number(player.face_match_confidence)} />
            </div>

            {/* Verification History */}
            {(player as any).verification_logs?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Verification History
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {((player as any).verification_logs as any[]).map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 bg-muted/20 rounded-lg p-3">
                      <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-montserrat font-bold text-foreground uppercase">
                            {log.action_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm')}
                          </span>
                        </div>
                        {log.old_status && log.new_status && (
                          <p className="text-[10px] font-montserrat text-muted-foreground mt-0.5">
                            {log.old_status} → {log.new_status}
                          </p>
                        )}
                        {log.reason && (
                          <p className="text-[10px] font-montserrat text-muted-foreground italic mt-0.5">"{log.reason}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs font-montserrat text-muted-foreground py-8 text-center">Player not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
