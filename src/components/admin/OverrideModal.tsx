"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface OverrideModalProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  currentStats: Record<string, any>;
  onSave: (matchId: string, field: string, newValue: any, reason: string, auditEntry: any) => void;
  onClose: () => void;
}

const OverrideModal = ({ matchId, homeTeam, awayTeam, currentStats, onSave, onClose }: OverrideModalProps) => {
  const [selectedField, setSelectedField] = useState("");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");

  const fields = [
    { id: "homeScore", label: "Home Score", current: currentStats.homeScore },
    { id: "awayScore", label: "Away Score", current: currentStats.awayScore },
    { id: "status", label: "Match Status", current: currentStats.status },
    { id: "commissioner", label: "Commissioner", current: currentStats.commissioner },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedField || !reason.trim()) {
      toast.error("Please select a field and provide a reason");
      return;
    }

    const field = fields.find((f) => f.id === selectedField);
    if (!field) return;

    // Validate new value based on field type
    if (selectedField === "homeScore" || selectedField === "awayScore") {
      const score = parseInt(newValue);
      if (score < 0 || score > 99) {
        toast.error("Score must be between 0 and 99");
        return;
      }
    }

    // Create audit entry
    const auditEntry = {
      id: `AUD-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
      timestamp: new Date().toISOString(),
      action: "override_applied",
      field: selectedField,
      previousValue: field.current,
      newValue: selectedField === "homeScore" || selectedField === "awayScore" ? parseInt(newValue) : newValue,
      editedBy: "Admin User",
      reason,
      matchId,
    };

    onSave(matchId, selectedField, newValue, reason, auditEntry);
    toast.success(`Match ${field.label} overridden successfully`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wider">Override Match Data</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Match Info */}
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-xs font-montserrat text-muted-foreground mb-1">Match</p>
            <p className="text-sm font-montserrat font-bold text-foreground">
              {homeTeam} vs {awayTeam}
            </p>
          </div>

          {/* Field Selection */}
          <div>
            <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
              Field to Override
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            >
              <option value="">Select field...</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.label} (Current: {field.current})
                </option>
              ))}
            </select>
          </div>

          {/* Current Value Display */}
          {selectedField && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-[9px] font-montserrat font-bold text-destructive uppercase mb-1">Previous Value</p>
              <p className="text-sm font-montserrat font-bold text-foreground">
                {fields.find((f) => f.id === selectedField)?.current}
              </p>
            </div>
          )}

          {/* New Value Input */}
          {selectedField && (
            <div>
              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                New Value
              </label>
              <input
                type={selectedField === "homeScore" || selectedField === "awayScore" ? "number" : "text"}
                min={selectedField === "homeScore" || selectedField === "awayScore" ? "0" : undefined}
                max={selectedField === "homeScore" || selectedField === "awayScore" ? "99" : undefined}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter new value"
                className="w-full bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
              Reason for Override <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 300))}
              placeholder="e.g., Video review correction, calculation error, official request, etc."
              className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground placeholder:text-muted-foreground resize-none h-24 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
            <p className="text-[9px] font-montserrat text-muted-foreground mt-1">{reason.length}/300</p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-[10px] font-montserrat text-yellow-500">
              This override will be logged in the audit trail with your name and timestamp. All changes are immutable and traceable for compliance.
            </p>
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
              disabled={!selectedField || !reason.trim()}
              className={`px-4 py-2 rounded-lg text-xs font-montserrat font-bold transition-colors ${
                selectedField && reason.trim()
                  ? "bg-yellow-600 text-background hover:bg-yellow-600/90"
                  : "bg-muted/30 text-muted-foreground cursor-not-allowed"
              }`}
            >
              Apply Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OverrideModal;
