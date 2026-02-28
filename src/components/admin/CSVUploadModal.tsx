"use client";

import { useState } from "react";
import { X, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CSVUploadModalProps {
  onSubmit: (matches: any[]) => void;
  commissioners: any[];
  onClose: () => void;
}

const CSVUploadModal = ({ onSubmit, commissioners, onClose }: CSVUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  const validateCSVRow = (row: string[], headers: string[], rowIdx: number): { valid: boolean; error?: string; data?: any } => {
    const data: Record<string, any> = {};

    // Map CSV columns
    const homeTeamIdx = headers.indexOf("home_team");
    const awayTeamIdx = headers.indexOf("away_team");
    const homeScoreIdx = headers.indexOf("home_score");
    const awayScoreIdx = headers.indexOf("away_score");
    const dateIdx = headers.indexOf("date");
    const timeIdx = headers.indexOf("time");
    const venueIdx = headers.indexOf("venue");
    const commissionerIdx = headers.indexOf("commissioner");
    const groupIdx = headers.indexOf("group");

    if (homeTeamIdx === -1) return { valid: false, error: `Row ${rowIdx}: Missing home_team column` };
    if (awayTeamIdx === -1) return { valid: false, error: `Row ${rowIdx}: Missing away_team column` };
    if (dateIdx === -1) return { valid: false, error: `Row ${rowIdx}: Missing date column` };
    if (timeIdx === -1) return { valid: false, error: `Row ${rowIdx}: Missing time column` };
    if (venueIdx === -1) return { valid: false, error: `Row ${rowIdx}: Missing venue column` };
    if (commissionerIdx === -1) return { valid: false, error: `Row ${rowIdx}: Missing commissioner column` };

    const homeTeam = row[homeTeamIdx]?.trim();
    const awayTeam = row[awayTeamIdx]?.trim();
    const homeScore = parseInt(row[homeScoreIdx]?.trim() || "0");
    const awayScore = parseInt(row[awayScoreIdx]?.trim() || "0");
    const date = row[dateIdx]?.trim();
    const time = row[timeIdx]?.trim();
    const venue = row[venueIdx]?.trim();
    const commissionerName = row[commissionerIdx]?.trim();
    const group = row[groupIdx]?.trim() || "Group A";

    if (!homeTeam) return { valid: false, error: `Row ${rowIdx}: Home team is required` };
    if (!awayTeam) return { valid: false, error: `Row ${rowIdx}: Away team is required` };
    if (homeTeam === awayTeam) return { valid: false, error: `Row ${rowIdx}: Teams must be different` };
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { valid: false, error: `Row ${rowIdx}: Invalid date format (use YYYY-MM-DD)` };
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return { valid: false, error: `Row ${rowIdx}: Invalid time format (use HH:MM)` };
    if (!venue) return { valid: false, error: `Row ${rowIdx}: Venue is required` };
    if (homeScore < 0 || homeScore > 99) return { valid: false, error: `Row ${rowIdx}: Home score must be 0-99` };
    if (awayScore < 0 || awayScore > 99) return { valid: false, error: `Row ${rowIdx}: Away score must be 0-99` };

    const commissioner = commissioners.find((c) => c.name.toLowerCase() === commissionerName.toLowerCase());
    if (!commissioner) return { valid: false, error: `Row ${rowIdx}: Commissioner "${commissionerName}" not found` };

    return {
      valid: true,
      data: {
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        date,
        time,
        venue,
        commissioner,
        group,
      },
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setFile(selectedFile);

    // Parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        setErrors(["CSV must have header row and at least one data row"]);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const newErrors: string[] = [];
      const validRows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map((cell) => cell.trim());
        const validation = validateCSVRow(row, headers, i + 1);

        if (!validation.valid) {
          newErrors.push(validation.error!);
        } else {
          validRows.push({
            ...validation.data,
            id: `M-${String(Math.floor(Math.random() * 10000)).padStart(3, "0")}`,
            status: "scheduled",
            matchStats: [],
            auditLog: [
              {
                id: `AUD-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
                timestamp: new Date().toISOString(),
                action: "uploaded",
                field: "match_created",
                previousValue: null,
                newValue: `${validation.data.homeTeam} vs ${validation.data.awayTeam}`,
                editedBy: "CSV Import",
              },
            ],
          });
        }
      }

      setErrors(newErrors);
      setPreview(validRows);
      if (validRows.length > 0) {
        setStep("preview");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (preview.length === 0) {
      toast.error("No valid matches to import");
      return;
    }

    onSubmit(preview);
    toast.success(`Imported ${preview.length} match(es)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wider">Import Matches (CSV)</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === "upload" ? (
            <>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-montserrat text-muted-foreground mb-3">
                    CSV must have these columns: home_team, away_team, home_score, away_score, date (YYYY-MM-DD), time (HH:MM), venue, commissioner, group
                  </p>
                  <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                    <p className="text-[10px] font-montserrat text-muted-foreground font-mono">
                      home_team,away_team,home_score,away_score,date,time,venue,commissioner,group
                    </p>
                    <p className="text-[10px] font-montserrat text-muted-foreground font-mono mt-2">
                      Garuda Muda FC,Elang Jaya,2,1,2026-03-15,19:00,Stadium A,John Doe,Group A
                    </p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-input"
                  />
                  <label htmlFor="csv-input" className="block cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-montserrat text-foreground font-medium">Click or drag CSV file here</p>
                    <p className="text-[10px] font-montserrat text-muted-foreground mt-1">
                      {file ? file.name : "Max 10MB"}
                    </p>
                  </label>
                </div>

                {errors.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-xs font-montserrat font-bold text-destructive">Validation Errors ({errors.length})</p>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {errors.map((error, idx) => (
                        <p key={idx} className="text-[10px] font-montserrat text-destructive">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 bg-muted/30 hover:bg-muted/50 text-foreground px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <p className="text-sm font-montserrat font-bold text-foreground">Ready to Import</p>
                </div>
                <p className="text-xs font-montserrat text-muted-foreground mb-4">
                  {preview.length} match{preview.length !== 1 ? "es" : ""} validated and ready to import
                </p>

                <div className="bg-muted/20 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b border-border/30">
                        <tr>
                          <th className="text-left px-3 py-2 font-montserrat font-bold text-muted-foreground">Match</th>
                          <th className="text-left px-3 py-2 font-montserrat font-bold text-muted-foreground">Date</th>
                          <th className="text-left px-3 py-2 font-montserrat font-bold text-muted-foreground">Commissioner</th>
                          <th className="text-left px-3 py-2 font-montserrat font-bold text-muted-foreground">Group</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((match, idx) => (
                          <tr key={idx} className="border-b border-border/30">
                            <td className="px-3 py-2 font-montserrat text-foreground">
                              {match.homeTeam} vs {match.awayTeam}
                            </td>
                            <td className="px-3 py-2 font-montserrat text-muted-foreground">{match.date}</td>
                            <td className="px-3 py-2 font-montserrat text-muted-foreground">{match.commissioner.name}</td>
                            <td className="px-3 py-2 font-montserrat text-muted-foreground">{match.group}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
                <button
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                    setPreview([]);
                    setErrors([]);
                  }}
                  className="flex items-center gap-1.5 bg-muted/30 hover:bg-muted/50 text-foreground px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-1.5 bg-accent text-background hover:bg-accent/90 px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" /> Import {preview.length} Match{preview.length !== 1 ? "es" : ""}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;
