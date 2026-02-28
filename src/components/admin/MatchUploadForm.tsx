"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface MatchUploadFormProps {
  onSubmit: (match: any) => void;
  commissioners: any[];
  onClose: () => void;
}

const teams = [
  "Garuda Muda FC",
  "Elang Jaya",
  "Rajawali United",
  "Banteng FC",
  "Singa Putih",
  "Macan FC",
  "Naga Emas",
  "Burung Hantu FC",
];

const groups = ["Group A", "Group B", "Group C", "Group D"];

const MatchUploadForm = ({ onSubmit, commissioners, onClose }: MatchUploadFormProps) => {
  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    homeScore: "",
    awayScore: "",
    date: "",
    time: "",
    venue: "",
    commissioner: "",
    group: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.homeTeam) newErrors.homeTeam = "Home team is required";
    if (!formData.awayTeam) newErrors.awayTeam = "Away team is required";
    if (formData.homeTeam === formData.awayTeam) newErrors.awayTeam = "Teams must be different";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.venue) newErrors.venue = "Venue is required";
    if (!formData.commissioner) newErrors.commissioner = "Commissioner is required";
    if (!formData.group) newErrors.group = "Group is required";

    const homeScore = parseInt(formData.homeScore || "0");
    const awayScore = parseInt(formData.awayScore || "0");

    if (homeScore < 0 || homeScore > 99) newErrors.homeScore = "Score must be 0-99";
    if (awayScore < 0 || awayScore > 99) newErrors.awayScore = "Score must be 0-99";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newMatch = {
      id: `M-${String(Math.floor(Math.random() * 10000)).padStart(3, "0")}`,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      homeScore: parseInt(formData.homeScore),
      awayScore: parseInt(formData.awayScore),
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      commissioner: commissioners.find((c) => c.id === formData.commissioner),
      group: formData.group,
      status: "scheduled",
      matchStats: [],
      auditLog: [
        {
          id: `AUD-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
          timestamp: new Date().toISOString(),
          action: "uploaded",
          field: "match_created",
          previousValue: null,
          newValue: `${formData.homeTeam} vs ${formData.awayTeam}`,
          editedBy: "Admin User",
        },
      ],
    };

    onSubmit(newMatch);
    toast.success(`Match created: ${formData.homeTeam} vs ${formData.awayTeam}`);
    onClose();
  };

  const FormField = ({
    label,
    name,
    type = "text",
    required = false,
    error,
    children,
  }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    error?: string;
    children?: React.ReactNode;
  }) => (
    <div className="space-y-1">
      <label className="text-xs font-montserrat font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          value={(formData as any)[name]}
          onChange={handleChange}
          className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground placeholder:text-muted-foreground outline-none transition-all ${
            error
              ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
              : "border-border/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          }`}
        />
      )}
      {error && <p className="text-[10px] text-destructive font-montserrat">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wider">Create Match</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Teams Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Home Team" name="homeTeam" required error={errors.homeTeam}>
              <select
                name="homeTeam"
                value={formData.homeTeam}
                onChange={handleChange}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none transition-all ${
                  errors.homeTeam
                    ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
                    : "border-border/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
                }`}
              >
                <option value="">Select team...</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Away Team" name="awayTeam" required error={errors.awayTeam}>
              <select
                name="awayTeam"
                value={formData.awayTeam}
                onChange={handleChange}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none transition-all ${
                  errors.awayTeam
                    ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
                    : "border-border/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
                }`}
              >
                <option value="">Select team...</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Scores Row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Home Score" name="homeScore" type="number" error={errors.homeScore} />
            <FormField label="Away Score" name="awayScore" type="number" error={errors.awayScore} />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date" name="date" type="date" required error={errors.date} />
            <FormField label="Time" name="time" type="time" required error={errors.time} />
          </div>

          {/* Venue Row */}
          <FormField label="Venue" name="venue" required error={errors.venue} />

          {/* Commissioner and Group Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Commissioner" name="commissioner" required error={errors.commissioner}>
              <select
                name="commissioner"
                value={formData.commissioner}
                onChange={handleChange}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none transition-all ${
                  errors.commissioner
                    ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
                    : "border-border/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
                }`}
              >
                <option value="">Select commissioner...</option>
                {commissioners.map((comm) => (
                  <option key={comm.id} value={comm.id}>
                    {comm.name} ({comm.status})
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Group/Stage" name="group" required error={errors.group}>
              <select
                name="group"
                value={formData.group}
                onChange={handleChange}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none transition-all ${
                  errors.group
                    ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
                    : "border-border/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
                }`}
              >
                <option value="">Select group...</option>
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 bg-muted/30 hover:bg-muted/50 text-foreground px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-accent text-background hover:bg-accent/90 px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchUploadForm;
