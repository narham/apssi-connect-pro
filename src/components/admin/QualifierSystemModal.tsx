"use client";

import { useState } from "react";
import { X, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface QualifierStage {
  id: string;
  level: "kab_kota" | "provinsi" | "nasional";
  levelName: string;
  location?: string;
  teamCount: number;
  advancementSlots: number;
  startDate?: string;
  endDate?: string;
  status: "pending" | "in_progress" | "completed";
}

interface QualifierSystem {
  id: string;
  tournamentId: string;
  enabled: boolean;
  stages: QualifierStage[];
  advancement: {
    kabToProv: number;
    provToNasional: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface QualifierSystemDisabled {
  enabled: false;
}

interface QualifierSystemModalProps {
  tournamentId: string;
  onSetup: (qualifierSystem: QualifierSystem | QualifierSystemDisabled) => void;
  onClose: () => void;
}

const QualifierSystemModal = ({ tournamentId, onSetup, onClose }: QualifierSystemModalProps) => {
  const [enabled, setEnabled] = useState(true);
  const [kabToProv, setKabToProv] = useState(3);
  const [provToNasional, setProvToNasional] = useState(2);
  const [stages, setStages] = useState<QualifierStage[]>([
    {
      id: "QS-KAB-001",
      level: "kab_kota",
      levelName: "Jakarta District",
      location: "Jakarta",
      teamCount: 12,
      advancementSlots: 3,
      startDate: "2026-02-01",
      endDate: "2026-02-15",
      status: "pending",
    },
    {
      id: "QS-KAB-002",
      level: "kab_kota",
      levelName: "Bandung District",
      location: "Bandung",
      teamCount: 10,
      advancementSlots: 3,
      startDate: "2026-02-01",
      endDate: "2026-02-15",
      status: "pending",
    },
    {
      id: "QS-PROV",
      level: "provinsi",
      levelName: "Provincial Level",
      teamCount: 0,
      advancementSlots: 6,
      startDate: "2026-03-01",
      endDate: "2026-03-15",
      status: "pending",
    },
    {
      id: "QS-NAS",
      level: "nasional",
      levelName: "National Level",
      teamCount: 0,
      advancementSlots: 8,
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      status: "pending",
    },
  ]);

  const [expandedStage, setExpandedStage] = useState<string | null>("QS-KAB-001");

  const handleAdvancementChange = (level: string, value: number) => {
    if (level === "kab_to_prov") {
      setKabToProv(value);
    } else {
      setProvToNasional(value);
    }
  };

  const handleStageChange = (stageId: string, field: string, value: string | number) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === stageId ? { ...stage, [field]: value } : stage))
    );
  };

  const handleAddDistrictStage = () => {
    const newStage: QualifierStage = {
      id: `QS-KAB-${stages.filter((s) => s.level === "kab_kota").length + 1}`,
      level: "kab_kota",
      levelName: `District ${stages.filter((s) => s.level === "kab_kota").length + 1}`,
      location: "",
      teamCount: 10,
      advancementSlots: 3,
      status: "pending",
    };

    setStages((prev) => {
      const nonKabStages = prev.filter((s) => s.level !== "kab_kota");
      return [
        ...prev.filter((s) => s.level === "kab_kota"),
        newStage,
        ...nonKabStages,
      ];
    });

    toast.success("New district stage added!");
  };

  const handleRemoveDistrictStage = (stageId: string) => {
    setStages((prev) => prev.filter((s) => s.id !== stageId));
    toast.success("District stage removed");
  };

  const handleSetupQualifier = () => {
    if (!enabled) {
      onSetup({ enabled: false });
      onClose();
      return;
    }

    const qualifierSystem = {
      id: `QS-${tournamentId}`,
      tournamentId,
      enabled,
      stages,
      advancement: {
        kabToProv,
        provToNasional,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSetup(qualifierSystem);
    toast.success("Qualifier system setup complete!");
    onClose();
  };

  const districtStages = stages.filter((s) => s.level === "kab_kota");
  const provStage = stages.find((s) => s.level === "provinsi");
  const nasStage = stages.find((s) => s.level === "nasional");

  const totalAdvancingToProvinsi = districtStages.length * kabToProv;
  const totalAdvancingToNasional = Math.ceil(totalAdvancingToProvinsi / 2) * provToNasional;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wider">Qualifier System Setup</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="bg-muted/20 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="flex-1">
                <p className="text-xs font-montserrat font-bold text-foreground">Enable Province Qualifier System</p>
                <p className="text-[9px] font-montserrat text-muted-foreground mt-1">
                  Three-tier structure: District → Provincial → National
                </p>
              </div>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-5 h-5 cursor-pointer rounded"
              />
            </label>
          </div>

          {enabled && (
            <>
              {/* Advancement Configuration */}
              <div className="space-y-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-xs font-montserrat font-bold text-foreground mb-2">Advancement Rules</h3>

                <div>
                  <label className="text-xs font-montserrat font-medium text-foreground block mb-2">
                    Teams Advancing from Each District to Provincial
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleAdvancementChange("kab_to_prov", num)}
                        className={`px-3 py-2 rounded-lg text-xs font-montserrat font-bold transition-colors ${
                          kabToProv === num
                            ? "bg-blue-500 text-background"
                            : "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                        }`}
                      >
                        Top {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] font-montserrat text-blue-500 mt-2">
                    Total to Provincial: {districtStages.length} districts × {kabToProv} = {totalAdvancingToProvinsi} teams
                  </p>
                </div>

                <div className="border-t border-blue-500/30 pt-3">
                  <label className="text-xs font-montserrat font-medium text-foreground block mb-2">
                    Teams Advancing from Provincial to National
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleAdvancementChange("prov_to_nas", num)}
                        className={`px-3 py-2 rounded-lg text-xs font-montserrat font-bold transition-colors ${
                          provToNasional === num
                            ? "bg-blue-500 text-background"
                            : "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                        }`}
                      >
                        Top {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] font-montserrat text-blue-500 mt-2">
                    Total to National: ≈{totalAdvancingToNasional} teams
                  </p>
                </div>
              </div>

              {/* District Stages */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-montserrat font-bold text-foreground uppercase">Kab/Kota (District Level)</h3>
                  <button
                    onClick={handleAddDistrictStage}
                    className="px-3 py-1 rounded-lg bg-accent text-background text-[9px] font-montserrat font-bold hover:bg-accent/90 transition-colors"
                  >
                    + Add District
                  </button>
                </div>

                <div className="space-y-2">
                  {districtStages.map((stage) => (
                    <div
                      key={stage.id}
                      className="bg-muted/20 rounded-lg border border-border/50 overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedStage(expandedStage === stage.id ? null : stage.id)
                        }
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="text-left flex-1">
                          <p className="text-xs font-montserrat font-bold text-foreground">
                            {stage.location}
                          </p>
                          <p className="text-[9px] font-montserrat text-muted-foreground">
                            {stage.teamCount} teams • Top {kabToProv} advance
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform ${
                            expandedStage === stage.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {expandedStage === stage.id && (
                        <div className="p-3 border-t border-border/30 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                                Location
                              </label>
                              <input
                                type="text"
                                value={stage.location || ""}
                                onChange={(e) =>
                                  handleStageChange(stage.id, "location", e.target.value)
                                }
                                className="w-full bg-muted/50 border border-border/30 rounded px-2 py-1 text-xs font-montserrat text-foreground outline-none focus:border-accent/50"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                                Teams Count
                              </label>
                              <input
                                type="number"
                                value={stage.teamCount}
                                onChange={(e) =>
                                  handleStageChange(stage.id, "teamCount", parseInt(e.target.value) || 0)
                                }
                                className="w-full bg-muted/50 border border-border/30 rounded px-2 py-1 text-xs font-montserrat text-foreground outline-none focus:border-accent/50"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                                Start Date
                              </label>
                              <input
                                type="date"
                                value={stage.startDate || ""}
                                onChange={(e) =>
                                  handleStageChange(stage.id, "startDate", e.target.value)
                                }
                                className="w-full bg-muted/50 border border-border/30 rounded px-2 py-1 text-xs font-montserrat text-foreground outline-none focus:border-accent/50"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                                End Date
                              </label>
                              <input
                                type="date"
                                value={stage.endDate || ""}
                                onChange={(e) =>
                                  handleStageChange(stage.id, "endDate", e.target.value)
                                }
                                className="w-full bg-muted/50 border border-border/30 rounded px-2 py-1 text-xs font-montserrat text-foreground outline-none focus:border-accent/50"
                              />
                            </div>
                          </div>

                          {districtStages.length > 1 && (
                            <button
                              onClick={() => handleRemoveDistrictStage(stage.id)}
                              className="w-full px-2 py-1 rounded text-[9px] font-montserrat font-bold text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              Remove District
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Provincial Stage */}
              {provStage && (
                <div className="space-y-2">
                  <h3 className="text-xs font-montserrat font-bold text-foreground uppercase">Provinsi (Provincial Level)</h3>
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                    <p className="text-[10px] font-montserrat text-accent font-bold mb-2">
                      {districtStages.length} Provincial Tournaments
                    </p>
                    <p className="text-[9px] font-montserrat text-muted-foreground">
                      Top {kabToProv} teams from each district compete at provincial level
                    </p>
                    <p className="text-[9px] font-montserrat text-accent mt-2">
                      {provStage.advancementSlots} teams from {provToNasional} per provincial tournament will advance to nationals
                    </p>
                  </div>
                </div>
              )}

              {/* National Stage */}
              {nasStage && (
                <div className="space-y-2">
                  <h3 className="text-xs font-montserrat font-bold text-foreground uppercase">Nasional (National Level)</h3>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-[10px] font-montserrat text-green-500 font-bold mb-2">
                      Final National Tournament
                    </p>
                    <p className="text-[9px] font-montserrat text-muted-foreground">
                      Top teams from provincial level compete for the championship
                    </p>
                    <p className="text-[9px] font-montserrat text-green-500 mt-2">
                      Expected teams: ≈{totalAdvancingToNasional}
                    </p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[9px] font-montserrat text-blue-500">
                    This qualifier system creates a multi-tier tournament structure. Teams progress through district and provincial levels to reach the national championship.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-montserrat font-bold text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSetupQualifier}
              className="px-4 py-2 rounded-lg text-xs font-montserrat font-bold bg-accent text-background hover:bg-accent/90 transition-colors"
            >
              Save Qualifier System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifierSystemModal;
