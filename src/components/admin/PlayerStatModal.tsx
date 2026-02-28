"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface PlayerStat {
  playerId: string;
  playerName: string;
  club: string;
  position: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  team: "home" | "away";
}

interface PlayerStatModalProps {
  player: PlayerStat;
  matchId: string;
  onSave: (matchId: string, playerId: string, updatedStat: PlayerStat, auditEntry: any) => void;
  onClose: () => void;
}

const PlayerStatModal = ({ player, matchId, onSave, onClose }: PlayerStatModalProps) => {
  const [formData, setFormData] = useState<PlayerStat>(player);
  const [reason, setReason] = useState("");

  const handleChange = (field: keyof PlayerStat, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "playerName" || field === "club" || field === "position" || field === "team" ? value : parseInt(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (formData.minutesPlayed < 0 || formData.minutesPlayed > 120) {
      toast.error("Minutes must be between 0 and 120");
      return;
    }
    if (formData.goals < 0 || formData.goals > 20) {
      toast.error("Goals must be realistic (0-20)");
      return;
    }
    if (formData.assists < 0 || formData.assists > 10) {
      toast.error("Assists must be realistic (0-10)");
      return;
    }
    if (formData.yellowCards < 0 || formData.yellowCards > 5) {
      toast.error("Yellow cards must be between 0 and 5");
      return;
    }
    if (formData.redCards < 0 || formData.redCards > 2) {
      toast.error("Red cards must be between 0 and 2");
      return;
    }

    // Create audit entry
    const auditEntry = {
      id: `AUD-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
      timestamp: new Date().toISOString(),
      action: "stat_edited",
      field: player.playerId,
      previousValue: {
        minutesPlayed: player.minutesPlayed,
        goals: player.goals,
        assists: player.assists,
        yellowCards: player.yellowCards,
        redCards: player.redCards,
      },
      newValue: {
        minutesPlayed: formData.minutesPlayed,
        goals: formData.goals,
        assists: formData.assists,
        yellowCards: formData.yellowCards,
        redCards: formData.redCards,
      },
      editedBy: "Admin User",
      reason: reason || undefined,
      matchId,
    };

    onSave(matchId, player.playerId, formData, auditEntry);
    toast.success(`${player.playerName} statistics updated`);
    onClose();
  };

  const StatField = ({
    label,
    field,
    value,
    max = 999,
  }: {
    label: string;
    field: keyof PlayerStat;
    value: number;
    max?: number;
  }) => (
    <div>
      <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
        {label}
      </label>
      <input
        type="number"
        min="0"
        max={max}
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div>
            <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wider">
              Edit Player Statistics
            </h2>
            <p className="text-xs font-montserrat text-muted-foreground mt-1">{player.playerName} • {player.club}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Before/After comparison */}
          <div className="grid grid-cols-2 gap-3 bg-muted/20 rounded-lg p-4 mb-4">
            <div>
              <p className="text-[9px] font-montserrat font-bold text-muted-foreground uppercase mb-2">Before</p>
              <div className="space-y-1 text-[10px] font-montserrat">
                <p>GOA: <span className="text-foreground font-bold">{player.goals}</span></p>
                <p>ASI: <span className="text-foreground font-bold">{player.assists}</span></p>
                <p>MIN: <span className="text-foreground font-bold">{player.minutesPlayed}</span></p>
                <p>YC: <span className="text-foreground font-bold">{player.yellowCards}</span></p>
                <p>RC: <span className="text-foreground font-bold">{player.redCards}</span></p>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-montserrat font-bold text-muted-foreground uppercase mb-2">After</p>
              <div className="space-y-1 text-[10px] font-montserrat">
                <p>GOA: <span className="text-accent font-bold">{formData.goals}</span></p>
                <p>ASI: <span className="text-accent font-bold">{formData.assists}</span></p>
                <p>MIN: <span className="text-accent font-bold">{formData.minutesPlayed}</span></p>
                <p>YC: <span className="text-accent font-bold">{formData.yellowCards}</span></p>
                <p>RC: <span className="text-accent font-bold">{formData.redCards}</span></p>
              </div>
            </div>
          </div>

          {/* Minutes */}
          <StatField label="Minutes Played" field="minutesPlayed" value={formData.minutesPlayed} max={120} />

          {/* Goals and Assists Row */}
          <div className="grid grid-cols-2 gap-3">
            <StatField label="Goals" field="goals" value={formData.goals} max={20} />
            <StatField label="Assists" field="assists" value={formData.assists} max={10} />
          </div>

          {/* Cards Row */}
          <div className="grid grid-cols-2 gap-3">
            <StatField label="Yellow Cards" field="yellowCards" value={formData.yellowCards} max={5} />
            <StatField label="Red Cards" field="redCards" value={formData.redCards} max={2} />
          </div>

          {/* Reason for change */}
          <div>
            <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
              Reason for Change (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 200))}
              placeholder="e.g., Video review correction, data entry error, etc."
              className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground placeholder:text-muted-foreground resize-none h-20 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
            <p className="text-[9px] font-montserrat text-muted-foreground mt-1">{reason.length}/200</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-montserrat font-bold text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-montserrat font-bold bg-accent text-background hover:bg-accent/90 transition-colors"
            >
              Save Statistics
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerStatModal;
