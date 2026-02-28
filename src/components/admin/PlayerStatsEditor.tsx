"use client";

import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";

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

interface PlayerStatsEditorProps {
  matchId: string;
  stats: PlayerStat[];
  onSave: (matchId: string, updatedStats: PlayerStat[], auditEntries: any[]) => void;
  onCancel: () => void;
}

const PlayerStatsEditor = ({ matchId, stats, onSave, onCancel }: PlayerStatsEditorProps) => {
  const [localStats, setLocalStats] = useState<PlayerStat[]>(stats);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  const startEdit = (playerIdField: string, currentValue: string) => {
    setEditingCell(playerIdField);
    setEditValue(currentValue);
  };

  const saveEdit = (playerIdField: string) => {
    const [playerId, field] = playerIdField.split("_");
    const newValue = parseInt(editValue) || 0;

    const playerIdx = localStats.findIndex((s) => s.playerId === playerId);
    if (playerIdx === -1) return;

    const player = localStats[playerIdx];
    const previousValue = (player as any)[field];

    if (previousValue !== newValue) {
      // Create audit entry
      const auditEntry = {
        id: `AUD-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
        timestamp: new Date().toISOString(),
        action: "stat_edited",
        field: `${playerId}_${field}`,
        previousValue,
        newValue,
        editedBy: "Admin User",
        matchId,
      };

      setAuditTrail([...auditTrail, auditEntry]);

      // Update local stats
      const updated = [...localStats];
      (updated[playerIdx] as any)[field] = newValue;
      setLocalStats(updated);
    }

    setEditingCell(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleSave = () => {
    onSave(matchId, localStats, auditTrail);
  };

  const EditableCell = ({
    playerIdField,
    value,
    label,
  }: {
    playerIdField: string;
    value: number;
    label: string;
  }) => {
    const isEditing = editingCell === playerIdField;

    return (
      <td className="px-3 py-2 text-xs font-montserrat">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="number"
              min="0"
              max="999"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(playerIdField);
                if (e.key === "Escape") cancelEdit();
              }}
              className="w-12 bg-muted/20 border border-accent rounded px-2 py-1 text-foreground text-xs outline-none"
            />
            <button onClick={() => saveEdit(playerIdField)} className="text-accent hover:text-accent/80">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={cancelEdit} className="text-destructive hover:text-destructive/80">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => startEdit(playerIdField, String(value))}
            className="flex items-center gap-2 cursor-pointer group hover:bg-muted/40 px-2 py-1 rounded transition-colors"
          >
            <span className="text-foreground">{value}</span>
            <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border/30">
              <tr>
                <th className="text-left px-3 py-2 font-montserrat font-bold text-muted-foreground">Player</th>
                <th className="text-center px-3 py-2 font-montserrat font-bold text-muted-foreground">MIN</th>
                <th className="text-center px-3 py-2 font-montserrat font-bold text-muted-foreground">G</th>
                <th className="text-center px-3 py-2 font-montserrat font-bold text-muted-foreground">A</th>
                <th className="text-center px-3 py-2 font-montserrat font-bold text-muted-foreground">YC</th>
                <th className="text-center px-3 py-2 font-montserrat font-bold text-muted-foreground">RC</th>
              </tr>
            </thead>
            <tbody>
              {localStats.map((stat) => (
                <tr key={stat.playerId} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-montserrat">
                    <div>
                      <p className="text-foreground font-semibold">{stat.playerName}</p>
                      <p className="text-muted-foreground text-[9px]">
                        {stat.club} • {stat.position}
                      </p>
                    </div>
                  </td>
                  <EditableCell playerIdField={`${stat.playerId}_minutesPlayed`} value={stat.minutesPlayed} label="Minutes" />
                  <EditableCell playerIdField={`${stat.playerId}_goals`} value={stat.goals} label="Goals" />
                  <EditableCell playerIdField={`${stat.playerId}_assists`} value={stat.assists} label="Assists" />
                  <EditableCell
                    playerIdField={`${stat.playerId}_yellowCards`}
                    value={stat.yellowCards}
                    label="Yellow Cards"
                  />
                  <EditableCell playerIdField={`${stat.playerId}_redCards`} value={stat.redCards} label="Red Cards" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {auditTrail.length > 0 && (
        <div className="bg-accent/10 rounded-lg p-3">
          <p className="text-xs font-montserrat font-bold text-accent mb-2">{auditTrail.length} Change(s)</p>
          <div className="space-y-1">
            {auditTrail.map((entry) => (
              <p key={entry.id} className="text-[9px] font-montserrat text-foreground">
                {entry.field.split("_").slice(1).join(" ")}: {entry.previousValue} → {entry.newValue}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg text-xs font-montserrat font-bold text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={auditTrail.length === 0}
          className={`px-3 py-2 rounded-lg text-xs font-montserrat font-bold transition-colors ${ auditTrail.length > 0
            ? "bg-accent text-background hover:bg-accent/90"
            : "bg-muted/30 text-muted-foreground cursor-not-allowed"
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PlayerStatsEditor;
