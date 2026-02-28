"use client";

import { useState } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface BracketMatch {
  id: string;
  homeTeam: { teamId: string; teamName: string; seed?: number };
  awayTeam: { teamId: string; teamName: string; seed?: number };
  status: "scheduled" | "completed" | "pending";
}

interface BracketRound {
  id: string;
  name: string;
  roundNumber: number;
  matches: BracketMatch[];
}

interface Group {
  id: string;
  name: string;
  teams: Array<{
    teamId: string;
    teamName: string;
    province: string;
    points?: number;
    played?: number;
  }>;
}

interface BracketGeneratorModalProps {
  tournamentId: string;
  format: "group_stage" | "knockout" | "hybrid";
  totalTeams: number;
  onGenerate: (bracket: any) => void;
  onClose: () => void;
}

const BracketGeneratorModal = ({ tournamentId, format, totalTeams, onGenerate, onClose }: BracketGeneratorModalProps) => {
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [advanceFromGroup, setAdvanceFromGroup] = useState(2);
  const [knockoutFormat, setKnockoutFormat] = useState<"single" | "double">("single");
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  // Helper function to get round name
  const getRoundName = (teamsCount: number): { code: string; name: string } => {
    switch (teamsCount) {
      case 2:
        return { code: "F", name: "Final" };
      case 4:
        return { code: "SF", name: "Semifinals" };
      case 8:
        return { code: "QF", name: "Quarterfinals" };
      case 16:
        return { code: "R16", name: "Round of 16" };
      case 32:
        return { code: "R32", name: "Round of 32" };
      default:
        return { code: "R", name: "Round" };
    }
  };

  // Generate group stage
  const generateGroupStage = () => {
    const numGroups = Math.ceil(totalTeams / teamsPerGroup);
    const groups: Group[] = [];

    // Create group structure
    for (let i = 0; i < numGroups; i++) {
      groups.push({
        id: `G-${String.fromCharCode(65 + i)}`,
        name: `Group ${String.fromCharCode(65 + i)}`,
        teams: Array.from({ length: teamsPerGroup }, (_, j) => ({
          teamId: `T-${i * teamsPerGroup + j + 1}`,
          teamName: `Team ${i * teamsPerGroup + j + 1}`,
          province: "Province",
          points: 0,
          played: 0,
        })),
      });
    }

    return {
      format: "group_stage" as const,
      groups,
      totalTeams,
      teamsPerGroup,
      createdAt: new Date().toISOString(),
    };
  };

  // Generate knockout bracket
  const generateKnockoutBracket = () => {
    const rounds: BracketRound[] = [];
    let currentTeamCount = totalTeams;
    let roundNumber = 1;

    while (currentTeamCount > 1) {
      const roundName = getRoundName(currentTeamCount);
      const matches: BracketMatch[] = [];

      for (let i = 0; i < currentTeamCount; i += 2) {
        matches.push({
          id: `${roundName.code}-${Math.floor(i / 2) + 1}`,
          homeTeam: {
            teamId: `T-${i + 1}`,
            teamName: `Team ${i + 1}`,
            seed: i + 1,
          },
          awayTeam: {
            teamId: `T-${i + 2}`,
            teamName: `Team ${i + 2}`,
            seed: i + 2,
          },
          status: "scheduled" as const,
        });
      }

      rounds.push({
        id: `R-${roundNumber}`,
        name: roundName.name,
        roundNumber,
        matches,
      });

      currentTeamCount = currentTeamCount / 2;
      roundNumber++;
    }

    return {
      format: "knockout" as const,
      rounds,
      totalTeams,
      knockoutFormat,
      createdAt: new Date().toISOString(),
    };
  };

  // Generate hybrid bracket (group stage + knockout)
  const generateHybridBracket = () => {
    const groupStage = generateGroupStage();
    const advancingTeams = Math.ceil(totalTeams / teamsPerGroup) * advanceFromGroup;
    const knockoutRounds: BracketRound[] = [];
    let currentTeamCount = advancingTeams;
    let roundNumber = 1;

    while (currentTeamCount > 1) {
      const roundName = getRoundName(currentTeamCount);
      const matches: BracketMatch[] = [];

      for (let i = 0; i < currentTeamCount; i += 2) {
        matches.push({
          id: `${roundName.code}-${Math.floor(i / 2) + 1}`,
          homeTeam: {
            teamId: `T-${i + 1}`,
            teamName: `Team ${i + 1}`,
            seed: i + 1,
          },
          awayTeam: {
            teamId: `T-${i + 2}`,
            teamName: `Team ${i + 2}`,
            seed: i + 2,
          },
          status: "scheduled" as const,
        });
      }

      knockoutRounds.push({
        id: `R-${roundNumber}`,
        name: roundName.name,
        roundNumber,
        matches,
      });

      currentTeamCount = currentTeamCount / 2;
      roundNumber++;
    }

    return {
      format: "hybrid" as const,
      groups: groupStage.groups,
      rounds: knockoutRounds,
      totalTeams,
      teamsPerGroup,
      advanceFromGroup,
      knockoutFormat,
      createdAt: new Date().toISOString(),
    };
  };

  const handleGeneratePreview = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let bracket;

      if (format === "group_stage") {
        bracket = generateGroupStage();
      } else if (format === "knockout") {
        bracket = generateKnockoutBracket();
      } else {
        bracket = generateHybridBracket();
      }

      setPreview(bracket);
      setIsGenerating(false);
      toast.success("Bracket preview generated!");
    }, 1000);
  };

  const handleConfirmBracket = () => {
    if (!preview) {
      toast.error("Please generate a preview first");
      return;
    }

    onGenerate(preview);
    toast.success("Bracket generated and saved!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wider">Bracket Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Format Info */}
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-xs font-montserrat font-bold text-foreground mb-1">Tournament Format</p>
            <p className="text-[10px] font-montserrat text-muted-foreground capitalize">{format.replace(/_/g, " ")}</p>
            <p className="text-[10px] font-montserrat text-foreground mt-1 font-medium">Total Teams: {totalTeams}</p>
          </div>

          {/* Configuration based on format */}
          {(format === "group_stage" || format === "hybrid") && (
            <>
              <div>
                <label className="text-xs font-montserrat font-medium text-foreground block mb-2">Teams Per Group</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setTeamsPerGroup(num)}
                      className={`px-3 py-2 rounded-lg text-xs font-montserrat font-bold transition-colors ${
                        teamsPerGroup === num
                          ? "bg-accent text-background"
                          : "bg-muted/30 text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {num} Teams
                    </button>
                  ))}
                </div>
                <p className="text-[9px] font-montserrat text-muted-foreground mt-2">
                  Will create {Math.ceil(totalTeams / teamsPerGroup)} groups
                </p>
              </div>

              {format === "hybrid" && (
                <div>
                  <label className="text-xs font-montserrat font-medium text-foreground block mb-2">Teams Advancing from Each Group</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => setAdvanceFromGroup(num)}
                        className={`px-3 py-2 rounded-lg text-xs font-montserrat font-bold transition-colors ${
                          advanceFromGroup === num
                            ? "bg-accent text-background"
                            : "bg-muted/30 text-foreground hover:bg-muted/50"
                        }`}
                      >
                        Top {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] font-montserrat text-muted-foreground mt-2">
                    {Math.ceil(totalTeams / teamsPerGroup) * advanceFromGroup} teams will advance to knockout stage
                  </p>
                </div>
              )}
            </>
          )}

          {(format === "knockout" || format === "hybrid") && (
            <div>
              <label className="text-xs font-montserrat font-medium text-foreground block mb-2">Knockout Format</label>
              <div className="grid grid-cols-2 gap-2">
                {["single", "double"].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setKnockoutFormat(fmt as "single" | "double")}
                    className={`px-3 py-2 rounded-lg text-xs font-montserrat font-bold transition-colors capitalize ${
                      knockoutFormat === fmt
                        ? "bg-accent text-background"
                        : "bg-muted/30 text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {fmt} Elimination
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview Section */}
          {preview && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-montserrat font-bold text-foreground mb-2">Preview Generated</p>
                  {format === "group_stage" && preview.groups && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-montserrat text-muted-foreground">
                        ✓ {preview.groups.length} Groups Created
                      </p>
                      <p className="text-[10px] font-montserrat text-muted-foreground">
                        ✓ {preview.groups.reduce((acc: number, g: any) => acc + (g.teams?.length || 0), 0)} Teams Distributed
                      </p>
                    </div>
                  )}

                  {format === "knockout" && preview.rounds && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-montserrat text-muted-foreground">
                        ✓ {preview.rounds.length} Rounds Created
                      </p>
                      <p className="text-[10px] font-montserrat text-muted-foreground">
                        ✓ {preview.rounds.reduce((acc: number, r: any) => acc + (r.matches?.length || 0), 0)} Matches Scheduled
                      </p>
                    </div>
                  )}

                  {format === "hybrid" && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-montserrat text-muted-foreground">
                        ✓ {preview.groups?.length} Group Stage Groups
                      </p>
                      <p className="text-[10px] font-montserrat text-muted-foreground">
                        ✓ {preview.rounds?.length} Knockout Rounds
                      </p>
                      <p className="text-[10px] font-montserrat text-muted-foreground">
                        ✓ {Math.ceil(totalTeams / teamsPerGroup) * advanceFromGroup} Teams Advancing
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-[9px] font-montserrat text-blue-500">
                Generated brackets can be adjusted manually after creation. Teams will be assigned to groups/seeding based on registration order.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-montserrat font-bold text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg text-xs font-montserrat font-bold transition-colors ${
                isGenerating
                  ? "bg-muted/30 text-muted-foreground cursor-not-allowed"
                  : "bg-yellow-600 text-background hover:bg-yellow-600/90"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate Preview"}
            </button>
            {preview && (
              <button
                onClick={handleConfirmBracket}
                className="px-4 py-2 rounded-lg text-xs font-montserrat font-bold bg-accent text-background hover:bg-accent/90 transition-colors"
              >
                Confirm Bracket
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketGeneratorModal;
