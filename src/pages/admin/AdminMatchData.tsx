"use client";

import { useState } from "react";
import { ChevronDown, Search, Filter, Download, Plus, Clock, CheckCircle2, AlertCircle, Eye, Edit, Trash2, Upload, Check, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import MatchUploadForm from "@/components/admin/MatchUploadForm";
import CSVUploadModal from "@/components/admin/CSVUploadModal";
import OverrideModal from "@/components/admin/OverrideModal";
import AuditLogViewer from "@/components/admin/AuditLogViewer";

import { useNavigate } from "react-router-dom";

// ============================================================================
// DATA MODELS
// ============================================================================

interface DocumentFile {
  fileName: string;
  fileType: string;
  uploadedAt: string;
  previewUrl: string;
}

interface Commissioner {
  id: string;
  name: string;
  province: string;
  status: "on_duty" | "standby" | "off_duty";
  assignedMatches: number;
}

interface AuditLog {
  id: string;
  timestamp: string; // ISO timestamp
  action: "uploaded" | "stat_edited" | "override_applied" | "status_changed";
  field: string;
  previousValue: any;
  newValue: any;
  editedBy: string;
  reason?: string;
}

interface PlayerMatchStat {
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

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string; // ISO date
  time: string; // HH:MM format
  venue: string;
  commissioner: {
    id: string;
    name: string;
    province: string;
  };
  group: string;
  status: "scheduled" | "completed" | "pending_review";
  submittedAt?: string;
  submittedBy?: string;
  matchStats: PlayerMatchStat[];
  auditLog: AuditLog[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const initialCommissioners: Commissioner[] = [
  { id: "COM-001", name: "John Doe", province: "DKI Jakarta", status: "on_duty", assignedMatches: 3 },
  { id: "COM-002", name: "Jane Smith", province: "Jawa Barat", status: "on_duty", assignedMatches: 2 },
  { id: "COM-003", name: "Ahmad Kusuma", province: "Jawa Timur", status: "standby", assignedMatches: 1 },
  { id: "COM-004", name: "Siti Nurhaliza", province: "Banten", status: "off_duty", assignedMatches: 0 },
];

const initialMatches: Match[] = [
  {
    id: "M-001",
    homeTeam: "Garuda Muda FC",
    awayTeam: "Elang Jaya",
    homeScore: 2,
    awayScore: 1,
    date: "2026-03-15",
    time: "19:00",
    venue: "Stadium Gelora Bung Karno",
    commissioner: { id: "COM-001", name: "John Doe", province: "DKI Jakarta" },
    group: "Group A",
    status: "completed",
    submittedAt: "2026-03-15T21:30:00Z",
    submittedBy: "John Doe",
    matchStats: [
      {
        playerId: "PLY-001",
        playerName: "Ahmad Rizki",
        club: "Garuda Muda FC",
        position: "AMF",
        minutesPlayed: 90,
        goals: 1,
        assists: 1,
        yellowCards: 0,
        redCards: 0,
        team: "home",
      },
      {
        playerId: "PLY-002",
        playerName: "Budi Santoso",
        club: "Elang Jaya",
        position: "ST",
        minutesPlayed: 87,
        goals: 1,
        assists: 0,
        yellowCards: 1,
        redCards: 0,
        team: "away",
      },
    ],
    auditLog: [
      {
        id: "AUD-001",
        timestamp: "2026-03-15T19:00:00Z",
        action: "uploaded",
        field: "match_created",
        previousValue: null,
        newValue: "M-001",
        editedBy: "John Doe",
      },
      {
        id: "AUD-002",
        timestamp: "2026-03-15T21:00:00Z",
        action: "stat_edited",
        field: "PLY-001_goals",
        previousValue: 0,
        newValue: 1,
        editedBy: "John Doe",
      },
      {
        id: "AUD-003",
        timestamp: "2026-03-15T21:30:00Z",
        action: "status_changed",
        field: "status",
        previousValue: "scheduled",
        newValue: "completed",
        editedBy: "John Doe",
      },
    ],
  },
  {
    id: "M-002",
    homeTeam: "Rajawali United",
    awayTeam: "Banteng FC",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-16",
    time: "19:30",
    venue: "Stadion Internasional Kapten I Made Dipta",
    commissioner: { id: "COM-002", name: "Jane Smith", province: "Jawa Barat" },
    group: "Group B",
    status: "pending_review",
    submittedAt: "2026-03-16T21:45:00Z",
    submittedBy: "Jane Smith",
    matchStats: [
      {
        playerId: "PLY-003",
        playerName: "Dimas Pratama",
        club: "Rajawali United",
        position: "CB",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        yellowCards: 1,
        redCards: 0,
        team: "home",
      },
      {
        playerId: "PLY-004",
        playerName: "Fajar Maulana",
        club: "Banteng FC",
        position: "GK",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        team: "away",
      },
    ],
    auditLog: [
      {
        id: "AUD-004",
        timestamp: "2026-03-16T19:30:00Z",
        action: "uploaded",
        field: "match_created",
        previousValue: null,
        newValue: "M-002",
        editedBy: "Jane Smith",
      },
      {
        id: "AUD-005",
        timestamp: "2026-03-16T21:45:00Z",
        action: "status_changed",
        field: "status",
        previousValue: "scheduled",
        newValue: "pending_review",
        editedBy: "Admin Jane",
      },
    ],
  },
  {
    id: "M-003",
    homeTeam: "Singa Putih",
    awayTeam: "Macan FC",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-17",
    time: "18:00",
    venue: "Stadion Diponegoro",
    commissioner: { id: "COM-001", name: "John Doe", province: "DKI Jakarta" },
    group: "Group C",
    status: "scheduled",
    matchStats: [
      {
        playerId: "PLY-005",
        playerName: "Galih Permana",
        club: "Singa Putih",
        position: "LW",
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        team: "home",
      },
      {
        playerId: "PLY-006",
        playerName: "Hendra Wijaya",
        club: "Macan FC",
        position: "CM",
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        team: "away",
      },
    ],
    auditLog: [
      {
        id: "AUD-006",
        timestamp: "2026-03-17T18:00:00Z",
        action: "uploaded",
        field: "match_created",
        previousValue: null,
        newValue: "M-003",
        editedBy: "John Doe",
      },
    ],
  },
  {
    id: "M-004",
    homeTeam: "Naga Emas",
    awayTeam: "Garuda Muda FC",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-18",
    time: "19:00",
    venue: "Stadion Gelora Delta Sidoarjo",
    commissioner: { id: "COM-003", name: "Ahmad Kusuma", province: "Jawa Timur" },
    group: "Group A",
    status: "scheduled",
    matchStats: [
      {
        playerId: "PLY-007",
        playerName: "Irfan Setiawan",
        club: "Naga Emas",
        position: "RB",
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        team: "home",
      },
      {
        playerId: "PLY-001",
        playerName: "Ahmad Rizki",
        club: "Garuda Muda FC",
        position: "AMF",
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        team: "away",
      },
    ],
    auditLog: [
      {
        id: "AUD-007",
        timestamp: "2026-03-18T18:00:00Z",
        action: "uploaded",
        field: "match_created",
        previousValue: null,
        newValue: "M-004",
        editedBy: "Ahmad Kusuma",
      },
    ],
  },
  {
    id: "M-005",
    homeTeam: "Elang Jaya",
    awayTeam: "Rajawali United",
    homeScore: 3,
    awayScore: 2,
    date: "2026-03-14",
    time: "20:00",
    venue: "Stadion Patriot Candrabhaga",
    commissioner: { id: "COM-002", name: "Jane Smith", province: "Jawa Barat" },
    group: "Group B",
    status: "completed",
    submittedAt: "2026-03-14T22:15:00Z",
    submittedBy: "Jane Smith",
    matchStats: [
      {
        playerId: "PLY-002",
        playerName: "Budi Santoso",
        club: "Elang Jaya",
        position: "ST",
        minutesPlayed: 90,
        goals: 2,
        assists: 1,
        yellowCards: 0,
        redCards: 0,
        team: "home",
      },
      {
        playerId: "PLY-003",
        playerName: "Dimas Pratama",
        club: "Rajawali United",
        position: "CB",
        minutesPlayed: 90,
        goals: 2,
        assists: 0,
        yellowCards: 2,
        redCards: 0,
        team: "away",
      },
    ],
    auditLog: [
      {
        id: "AUD-008",
        timestamp: "2026-03-14T20:00:00Z",
        action: "uploaded",
        field: "match_created",
        previousValue: null,
        newValue: "M-005",
        editedBy: "Jane Smith",
      },
      {
        id: "AUD-009",
        timestamp: "2026-03-14T22:00:00Z",
        action: "stat_edited",
        field: "PLY-002_goals",
        previousValue: 1,
        newValue: 2,
        editedBy: "Jane Smith",
        reason: "Confirmed second goal by video review",
      },
      {
        id: "AUD-010",
        timestamp: "2026-03-14T22:15:00Z",
        action: "status_changed",
        field: "status",
        previousValue: "pending_review",
        newValue: "completed",
        editedBy: "Admin Jane",
      },
    ],
  },
];

const matchStats = [
  { label: "Total Matches", value: "12", icon: Clock, color: "text-muted-foreground" },
  { label: "Completed", value: "8", icon: CheckCircle2, color: "text-accent" },
  { label: "Pending Review", value: "2", icon: AlertCircle, color: "text-yellow-500" },
  { label: "Scheduled", value: "2", icon: Clock, color: "text-muted-foreground" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminMatchData = () => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [commissioners, setCommissioners] = useState<Commissioner[]>(initialCommissioners);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filtered matches based on search and filters
  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      !searchQuery ||
      match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.commissioner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(match.status);

    return matchesSearch && matchesStatus;
  });

  const handleSelectRow = (matchId: string) => {
    const newSelected = new Set(selectedMatches);
    if (newSelected.has(matchId)) {
      newSelected.delete(matchId);
    } else {
      newSelected.add(matchId);
    }
    setSelectedMatches(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMatches.size === filteredMatches.length) {
      setSelectedMatches(new Set());
    } else {
      setSelectedMatches(new Set(filteredMatches.map((m) => m.id)));
    }
  };

  const handleStatusFilter = (status: string) => {
    const newFilter = filterStatus.includes(status)
      ? filterStatus.filter((s) => s !== status)
      : [...filterStatus, status];
    setFilterStatus(newFilter);
  };

  const handleUploadMatch = (newMatch: Match) => {
    setMatches([newMatch, ...matches]);
    // Update commissioner assigned matches count
    const updatedCommissioners = commissioners.map((c) =>
      c.id === newMatch.commissioner.id ? { ...c, assignedMatches: c.assignedMatches + 1 } : c
    );
    setCommissioners(updatedCommissioners);
  };

  const handleImportMatchesCSV = (newMatches: Match[]) => {
    setMatches([...newMatches, ...matches]);
    // Update commissioner assigned matches count
    const commissionerUpdates: Record<string, number> = {};
    newMatches.forEach((match) => {
      commissionerUpdates[match.commissioner.id] = (commissionerUpdates[match.commissioner.id] || 0) + 1;
    });

    const updatedCommissioners = commissioners.map((c) =>
      c.id in commissionerUpdates ? { ...c, assignedMatches: c.assignedMatches + (commissionerUpdates[c.id] || 0) } : c
    );
    setCommissioners(updatedCommissioners);
  };

  const handleStatusChange = (matchId: string, newStatus: string) => {
    // Validate status flow
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const validNextStatuses: Record<string, string[]> = {
      scheduled: ["pending_review", "completed"],
      pending_review: ["completed", "scheduled"],
      completed: ["pending_review"],
    };

    if (!validNextStatuses[match.status].includes(newStatus)) {
      toast.error(`Cannot change status from ${match.status} to ${newStatus}`);
      return;
    }

    const auditEntry = {
      id: `AUD-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
      timestamp: new Date().toISOString(),
      action: "status_changed" as const,
      field: "status",
      previousValue: match.status,
      newValue: newStatus,
      editedBy: "Admin User",
    };

    const updatedMatches = matches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            status: newStatus as any,
            auditLog: [...m.auditLog, auditEntry],
          }
        : m
    );

    setMatches(updatedMatches);
    toast.success(`Match status changed to ${newStatus.replace(/_/g, " ")}`);
  };

  const handleOverride = (matchId: string, field: string, newValue: any, reason: string, auditEntry: AuditLog) => {
    const updatedMatches = matches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            [field]: newValue,
            auditLog: [...m.auditLog, auditEntry],
          }
        : m
    );

    setMatches(updatedMatches);
    setShowOverrideModal(false);
  };

  const handleDelete = (matchId: string) => {
    setMatches(matches.filter((m) => m.id !== matchId));
    toast.success("Match deleted successfully");
  };

  const handleExport = () => {
    const exportMatches = selectedMatches.size > 0 ? filteredMatches.filter((m) => selectedMatches.has(m.id)) : filteredMatches;

    if (exportMatches.length === 0) {
      toast.error("No matches to export");
      return;
    }

    const headers = ["ID", "Home Team", "Away Team", "Score", "Date", "Time", "Venue", "Commissioner", "Status"];
    const rows = exportMatches.map((m) => [
      m.id,
      m.homeTeam,
      m.awayTeam,
      `${m.homeScore}-${m.awayScore}`,
      m.date,
      m.time,
      m.venue,
      m.commissioner.name,
      m.status.replace(/_/g, " "),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `matches_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success(`Exported ${exportMatches.length} match(es)`);
    setSelectedMatches(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent/10 text-accent";
      case "pending_review":
        return "bg-yellow-500/10 text-yellow-500";
      case "scheduled":
        return "bg-muted/50 text-muted-foreground";
      default:
        return "bg-muted/30 text-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle2;
      case "pending_review":
        return AlertCircle;
      case "scheduled":
        return Clock;
      default:
        return Clock;
    }
  };

  const isAllSelected = selectedMatches.size > 0 && selectedMatches.size === filteredMatches.length;
  const activeFilterCount = filterStatus.length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Match Data Management</h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">Upload matches, manage player statistics, and track audit logs</p>
        </div>
        <div className="relative group">
          <button className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
            <Plus className="w-4 h-4" /> Upload Match
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="absolute right-0 mt-1 w-40 bg-secondary rounded-lg shadow-xl z-50 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={() => setShowUploadForm(true)}
              className="w-full text-left px-4 py-2 text-xs font-montserrat font-medium text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-3 h-3" /> Form Upload
            </button>
            <button
              onClick={() => setShowCSVUpload(true)}
              className="w-full text-left px-4 py-2 text-xs font-montserrat font-medium text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2 border-t border-border/30"
            >
              <Upload className="w-3 h-3" /> CSV Import
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {matchStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card-gradient rounded-lg p-4 micro-hover relative z-0">
              <div className="relative z-10 flex items-center gap-3">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-oswald font-bold text-foreground">{stat.value}</p>
                  <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Actions Bar */}
      {selectedMatches.size > 0 && (
        <div className="glass-card rounded-lg px-4 py-3 flex items-center justify-between relative z-10">
          <span className="text-xs font-montserrat font-medium text-foreground">
            {selectedMatches.size} match{selectedMatches.size !== 1 ? "es" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      )}

      {/* Search and Control Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 flex-1 min-w-[200px] relative z-0">
          <Search className="w-4 h-4 text-muted-foreground relative z-10" />
          <input
            type="text"
            placeholder="Search by team, commissioner, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-montserrat text-foreground placeholder:text-muted-foreground w-full relative z-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 glass-card rounded-lg px-3 py-2 text-xs font-montserrat font-medium transition-colors relative z-0 ${
            activeFilterCount > 0 ? "text-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Filter</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold bg-accent text-background px-1.5 rounded-sm relative z-10">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card rounded-lg p-4 mb-4 relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-xs font-montserrat font-bold text-foreground uppercase tracking-widest mb-2">Status</h3>
              <div className="space-y-1">
                {["scheduled", "pending_review", "completed"].map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={filterStatus.includes(status)}
                      onChange={() => handleStatusFilter(status)}
                      className="rounded"
                    />
                    <span className="text-muted-foreground capitalize">{status.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus([])}
            className="w-full text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground py-1 text-center"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Matches Table */}
      <div className="glass-card rounded-lg overflow-hidden relative z-0">
        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-center px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">
                  Match
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  Commissioner
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">
                  Date & Time
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.length > 0 ? (
                filteredMatches.map((match) => {
                  const StatusIcon = getStatusIcon(match.status);
                  return (
                    <tr
                      key={match.id}
                      className={`border-b border-border/50 transition-colors ${
                        selectedMatches.has(match.id) ? "bg-muted/40" : "hover:bg-muted/20"
                      }`}
                    >
                      <td className="text-center px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMatches.has(match.id)}
                          onChange={() => handleSelectRow(match.id)}
                          className="rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-montserrat font-semibold text-foreground">
                            {match.homeTeam} vs {match.awayTeam}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] font-oswald font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                              {match.homeScore}-{match.awayScore}
                            </span>
                            <span className="text-[9px] font-montserrat text-muted-foreground">{match.id}</span>
                            <span className="text-[9px] font-montserrat text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                              {match.group}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-montserrat text-foreground hidden md:table-cell">
                        {match.commissioner.name}
                      </td>
                      <td className="px-4 py-3 text-xs font-montserrat text-muted-foreground hidden lg:table-cell">
                        {match.date} {match.time}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full ${getStatusColor(match.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="hidden sm:inline capitalize">{match.status.replace(/_/g, " ")}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {match.status === "pending_review" && (
                            <button 
                              onClick={() => navigate("/admin/match-data/approval")}
                              className="w-7 h-7 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 flex items-center justify-center transition-colors group"
                              title="Approve Report"
                            >
                              <ShieldCheck className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                            </button>
                          )}
                          <button className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <div className="relative group">
                            <button className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors">
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <div className="absolute right-0 mt-1 w-32 bg-secondary rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                              {match.status !== "scheduled" && (
                                <button onClick={() => handleStatusChange(match.id, "scheduled")} className="w-full text-left px-3 py-2 text-xs font-montserrat font-medium text-foreground hover:bg-muted/50 transition-colors">Scheduled</button>
                              )}
                              {match.status !== "pending_review" && (
                                <button onClick={() => handleStatusChange(match.id, "pending_review")} className="w-full text-left px-3 py-2 text-xs font-montserrat font-medium text-foreground hover:bg-muted/50 transition-colors border-t border-border/30">Pending Review</button>
                              )}
                              {match.status !== "completed" && (
                                <button onClick={() => handleStatusChange(match.id, "completed")} className="w-full text-left px-3 py-2 text-xs font-montserrat font-medium text-foreground hover:bg-muted/50 transition-colors border-t border-border/30">Completed</button>
                              )}
                              <div className="border-t border-border/30" />
                              <button onClick={() => { setSelectedMatchForDetails(match.id); setShowOverrideModal(true); }} className="w-full text-left px-3 py-2 text-xs font-montserrat font-medium text-yellow-500 hover:bg-yellow-500/10 transition-colors">Override</button>
                            </div>
                          </div>
                          <button onClick={() => handleDelete(match.id)} className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-destructive/20 flex items-center justify-center transition-colors">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs font-montserrat text-muted-foreground">
                    No matches found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border relative z-10">
          <span className="text-[10px] font-montserrat text-muted-foreground">
            Showing {filteredMatches.length} of {matches.length} match{matches.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>

      {/* Modals */}
      {showUploadForm && (
        <MatchUploadForm
          commissioners={commissioners}
          onSubmit={handleUploadMatch}
          onClose={() => setShowUploadForm(false)}
        />
      )}

      {showCSVUpload && (
        <CSVUploadModal
          commissioners={commissioners}
          onSubmit={handleImportMatchesCSV}
          onClose={() => setShowCSVUpload(false)}
        />
      )}

      {showOverrideModal && selectedMatchForDetails && (
        <OverrideModal
          matchId={selectedMatchForDetails}
          homeTeam={matches.find((m) => m.id === selectedMatchForDetails)?.homeTeam || ""}
          awayTeam={matches.find((m) => m.id === selectedMatchForDetails)?.awayTeam || ""}
          currentStats={{
            homeScore: matches.find((m) => m.id === selectedMatchForDetails)?.homeScore,
            awayScore: matches.find((m) => m.id === selectedMatchForDetails)?.awayScore,
            status: matches.find((m) => m.id === selectedMatchForDetails)?.status,
            commissioner: matches.find((m) => m.id === selectedMatchForDetails)?.commissioner?.name,
          }}
          onSave={handleOverride}
          onClose={() => {
            setShowOverrideModal(false);
            setSelectedMatchForDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminMatchData;
