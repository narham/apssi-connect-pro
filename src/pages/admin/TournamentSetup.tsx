"use client";

import { useState } from "react";
import { Plus, Search, Filter, Download, ChevronDown, Calendar, MapPin, Users, Trophy, Clock, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import TournamentCreateForm from "@/components/admin/TournamentCreateForm";
import BracketGeneratorModal from "@/components/admin/BracketGeneratorModal";
import QualifierSystemModal from "@/components/admin/QualifierSystemModal";

// ============================================================================
// DATA MODELS
// ============================================================================

type TournamentCategory = "U-12" | "U-15" | "U-16" | "U-17" | "U-18" | "Open";
type TournamentFormat = "group_stage" | "knockout" | "hybrid";
type TournamentStatus = "draft" | "registration_open" | "in_progress" | "completed" | "archived";

interface Location {
  city: string;
  province: string;
  venue?: string;
  coordinates?: { lat: number; lng: number };
}

interface Schedule {
  registrationDeadline: string;
  startDate: string;
  endDate: string;
}

interface Logo {
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface TeamStanding {
  position: number;
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

interface Group {
  id: string;
  name: string;
  teams: {
    teamId: string;
    teamName: string;
    club?: string;
    province: string;
    position?: number;
    played?: number;
    won?: number;
    drawn?: number;
    lost?: number;
    gf?: number;
    ga?: number;
    gd?: number;
    points?: number;
  }[];
  matches?: string[];
  standings?: TeamStanding[];
}

interface BracketMatch {
  id: string;
  homeTeam: {
    teamId: string;
    teamName: string;
    seed?: number;
  };
  awayTeam: {
    teamId: string;
    teamName: string;
    seed?: number;
  };
  date?: string;
  time?: string;
  venue?: string;
  homeScore?: number;
  awayScore?: number;
  winner?: "home" | "away" | null;
  penalties?: { home: number; away: number };
  status: "scheduled" | "completed" | "pending";
}

interface BracketRound {
  id: string;
  name: string;
  roundNumber: number;
  matches: BracketMatch[];
}

interface TournamentStructure {
  id: string;
  format: TournamentFormat;
  groups?: Group[];
  rounds?: BracketRound[];
  totalTeams: number;
  teamsPerGroup?: number;
  advanceFromGroup?: number;
  knockoutFormat?: "single" | "double";
  createdAt: string;
}

interface QualifierStage {
  id: string;
  level: "kab_kota" | "provinsi" | "nasional";
  levelName: string;
  location?: string;
  teamCount: number;
  matches?: string[];
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

interface Team {
  id: string;
  name: string;
  province: string;
  city?: string;
  logo?: string;
  coach?: {
    name: string;
    phone?: string;
  };
  players: {
    playerId: string;
    playerName: string;
    position: string;
    age: number;
  }[];
  registrationStatus: "pending" | "approved" | "rejected";
  qualifierStage?: "kab_kota" | "provinsi" | "nasional";
  createdAt: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: "created" | "updated" | "bracket_generated" | "qualifier_setup" | "status_changed" | "logo_uploaded";
  field?: string;
  previousValue?: any;
  newValue?: any;
  editedBy: string;
  reason?: string;
  details?: any;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  category: TournamentCategory;
  location: Location;
  schedule: Schedule;
  logo: Logo;
  format: TournamentFormat;
  structure: TournamentStructure;
  qualifierSystem?: QualifierSystem;
  status: TournamentStatus;
  registrationCount: number;
  maxTeams: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  auditLog: AuditLog[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const indonesianProvinces = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Banten",
  "Yogyakarta",
  "Bali",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
];

const indonesianCities: Record<string, string[]> = {
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat"],
  "Jawa Barat": ["Bandung", "Bekasi", "Depok", "Bogor"],
  "Jawa Tengah": ["Semarang", "Solo", "Yogyakarta"],
  "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo"],
  Banten: ["Tangerang", "Serang", "Cilegon"],
  Yogyakarta: ["Yogyakarta"],
  Bali: ["Denpasar", "Ubud"],
  "Sumatera Utara": ["Medan", "Binjai"],
  "Sumatera Barat": ["Padang", "Pariaman"],
  Riau: ["Pekanbaru", "Dumai"],
};

const sampleGroups: Group[] = [
  {
    id: "G-A",
    name: "Group A",
    teams: [
      { teamId: "T-001", teamName: "Garuda Muda FC", club: "Jakarta", province: "DKI Jakarta", position: 1, played: 2, won: 2, drawn: 0, lost: 0, gf: 6, ga: 1, gd: 5, points: 6 },
      { teamId: "T-002", teamName: "Elang Jaya", club: "Bandung", province: "Jawa Barat", position: 2, played: 2, won: 1, drawn: 1, lost: 0, gf: 4, ga: 2, gd: 2, points: 4 },
      { teamId: "T-003", teamName: "Rajawali United", club: "Semarang", province: "Jawa Tengah", position: 3, played: 2, won: 0, drawn: 1, lost: 1, gf: 2, ga: 4, gd: -2, points: 1 },
    ],
    matches: ["M-001", "M-002", "M-003"],
  },
  {
    id: "G-B",
    name: "Group B",
    teams: [
      { teamId: "T-004", teamName: "Banteng FC", club: "Surabaya", province: "Jawa Timur", position: 1, played: 2, won: 2, drawn: 0, lost: 0, gf: 5, ga: 1, gd: 4, points: 6 },
      { teamId: "T-005", teamName: "Singa Putih", club: "Medan", province: "Sumatera Utara", position: 2, played: 2, won: 1, drawn: 0, lost: 1, gf: 3, ga: 2, gd: 1, points: 3 },
    ],
    matches: ["M-004", "M-005"],
  },
];

const sampleQualifiers: QualifierSystem = {
  id: "QS-001",
  tournamentId: "TOURN-2026-001",
  enabled: true,
  stages: [
    {
      id: "QS-KAB-JKT",
      level: "kab_kota",
      levelName: "Jakarta District",
      location: "Jakarta",
      teamCount: 12,
      advancementSlots: 3,
      startDate: "2026-02-01",
      endDate: "2026-02-15",
      status: "in_progress",
    },
    {
      id: "QS-KAB-JBA",
      level: "kab_kota",
      levelName: "Bandung District",
      location: "Bandung",
      teamCount: 10,
      advancementSlots: 3,
      startDate: "2026-02-01",
      endDate: "2026-02-15",
      status: "in_progress",
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
  ],
  advancement: {
    kabToProv: 3,
    provToNasional: 2,
  },
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-01-15T10:00:00Z",
};

const initialTournaments: Tournament[] = [
  {
    id: "TOURN-2026-001",
    name: "Piala Indonesia U-16 2026",
    description: "National U-16 Football Championship with province qualifier system",
    category: "U-16",
    location: {
      city: "Jakarta",
      province: "DKI Jakarta",
      venue: "Stadion Gelora Bung Karno",
      coordinates: { lat: -6.2088, lng: 106.8194 },
    },
    schedule: {
      registrationDeadline: "2026-02-28",
      startDate: "2026-03-15",
      endDate: "2026-04-30",
    },
    logo: {
      url: "https://via.placeholder.com/200x200?text=Piala+Indonesia+U16",
      uploadedAt: "2026-01-10T14:00:00Z",
      uploadedBy: "Admin User",
    },
    format: "hybrid",
    structure: {
      id: "TS-001",
      format: "hybrid",
      groups: sampleGroups,
      totalTeams: 16,
      teamsPerGroup: 4,
      advanceFromGroup: 2,
      knockoutFormat: "single",
      createdAt: "2026-01-15T10:00:00Z",
    },
    qualifierSystem: sampleQualifiers,
    status: "in_progress",
    registrationCount: 16,
    maxTeams: 16,
    createdAt: "2026-01-10T09:00:00Z",
    createdBy: "Admin User",
    updatedAt: "2026-02-15T14:30:00Z",
    updatedBy: "Admin User",
    auditLog: [
      {
        id: "AUD-001",
        timestamp: "2026-01-10T09:00:00Z",
        action: "created",
        editedBy: "Admin User",
        details: { status: "draft" },
      },
      {
        id: "AUD-002",
        timestamp: "2026-01-15T10:00:00Z",
        action: "bracket_generated",
        editedBy: "Admin User",
        details: { format: "hybrid", groups: 2, totalTeams: 16 },
      },
    ],
  },
  {
    id: "TOURN-2026-002",
    name: "Piala Indonesia U-18 2026",
    description: "National U-18 Football Championship",
    category: "U-18",
    location: {
      city: "Surabaya",
      province: "Jawa Timur",
      venue: "Stadion Gelora Delta Sidoarjo",
    },
    schedule: {
      registrationDeadline: "2026-03-31",
      startDate: "2026-04-10",
      endDate: "2026-05-30",
    },
    logo: {
      url: "https://via.placeholder.com/200x200?text=Piala+Indonesia+U18",
      uploadedAt: "2026-01-12T10:00:00Z",
      uploadedBy: "Admin User",
    },
    format: "group_stage",
    structure: {
      id: "TS-002",
      format: "group_stage",
      groups: sampleGroups,
      totalTeams: 12,
      teamsPerGroup: 4,
      createdAt: "2026-01-16T09:00:00Z",
    },
    status: "registration_open",
    registrationCount: 8,
    maxTeams: 12,
    createdAt: "2026-01-12T08:00:00Z",
    createdBy: "Admin User",
    updatedAt: "2026-01-12T08:00:00Z",
    updatedBy: "Admin User",
    auditLog: [
      {
        id: "AUD-003",
        timestamp: "2026-01-12T08:00:00Z",
        action: "created",
        editedBy: "Admin User",
      },
      {
        id: "AUD-004",
        timestamp: "2026-01-12T12:00:00Z",
        action: "status_changed",
        field: "status",
        previousValue: "draft",
        newValue: "registration_open",
        editedBy: "Admin User",
      },
    ],
  },
  {
    id: "TOURN-2026-003",
    name: "Piala Indonesia Open 2026",
    description: "Open Category Football Championship",
    category: "Open",
    location: {
      city: "Bandung",
      province: "Jawa Barat",
      venue: "Stadion Gelora Bandung Lautan Api",
    },
    schedule: {
      registrationDeadline: "2026-02-15",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
    },
    logo: {
      url: "https://via.placeholder.com/200x200?text=Piala+Indonesia+Open",
      uploadedAt: "2026-01-08T11:00:00Z",
      uploadedBy: "Admin User",
    },
    format: "knockout",
    structure: {
      id: "TS-003",
      format: "knockout",
      rounds: [
        {
          id: "R-001",
          name: "Quarterfinals",
          roundNumber: 1,
          matches: [
            {
              id: "QF-001",
              homeTeam: { teamId: "T-001", teamName: "Garuda Muda FC" },
              awayTeam: { teamId: "T-004", teamName: "Banteng FC" },
              status: "scheduled",
            },
            {
              id: "QF-002",
              homeTeam: { teamId: "T-002", teamName: "Elang Jaya" },
              awayTeam: { teamId: "T-005", teamName: "Singa Putih" },
              status: "scheduled",
            },
          ],
        },
      ],
      totalTeams: 8,
      knockoutFormat: "single",
      createdAt: "2026-01-08T10:00:00Z",
    },
    status: "completed",
    registrationCount: 8,
    maxTeams: 8,
    createdAt: "2026-01-08T09:00:00Z",
    createdBy: "Admin User",
    updatedAt: "2026-03-31T22:00:00Z",
    updatedBy: "Admin User",
    auditLog: [
      {
        id: "AUD-005",
        timestamp: "2026-01-08T09:00:00Z",
        action: "created",
        editedBy: "Admin User",
      },
    ],
  },
];

const tournamentStats = [
  { label: "Total Tournaments", value: "3", icon: Trophy, color: "text-accent" },
  { label: "Registration Open", value: "1", icon: Users, color: "text-blue-500" },
  { label: "In Progress", value: "1", icon: Clock, color: "text-yellow-500" },
  { label: "Completed", value: "1", icon: Trophy, color: "text-green-500" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TournamentSetup = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTournaments, setSelectedTournaments] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBracketGenerator, setShowBracketGenerator] = useState(false);
  const [showQualifierSetup, setShowQualifierSetup] = useState(false);
  const [selectedTournamentForBracket, setSelectedTournamentForBracket] = useState<string | null>(null);
  const [selectedTournamentForQualifier, setSelectedTournamentForQualifier] = useState<string | null>(null);

  // Filtered tournaments
  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(t.status);
    const matchesCategory = filterCategory.length === 0 || filterCategory.includes(t.category);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateTournament = (formData: any) => {
    const newTournament: Tournament = {
      id: `TOURN-${new Date().getFullYear()}-${String(tournaments.length + 1).padStart(3, "0")}`,
      name: formData.name,
      description: formData.description,
      category: formData.category as TournamentCategory,
      location: {
        city: formData.city,
        province: formData.province,
        venue: formData.venue,
      },
      schedule: {
        registrationDeadline: formData.registrationDeadline,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
      logo: {
        url: formData.logoPreview || "https://via.placeholder.com/200x200?text=Tournament",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Admin User",
      },
      format: formData.format as TournamentFormat,
      structure: {
        id: `TS-${tournaments.length + 1}`,
        format: formData.format,
        totalTeams: formData.maxTeams,
        teamsPerGroup: 4,
        createdAt: new Date().toISOString(),
      },
      status: "draft" as TournamentStatus,
      registrationCount: 0,
      maxTeams: formData.maxTeams,
      createdAt: new Date().toISOString(),
      createdBy: "Admin User",
      updatedAt: new Date().toISOString(),
      updatedBy: "Admin User",
      auditLog: [
        {
          id: `AUD-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
          timestamp: new Date().toISOString(),
          action: "created",
          editedBy: "Admin User",
          details: { status: "draft" },
        },
      ],
    };

    setTournaments([newTournament, ...tournaments]);
    setShowCreateForm(false);
    toast.success(`Tournament "${newTournament.name}" created successfully!`);
  };

  const handleGenerateBracket = (bracket: any) => {
    const updatedTournaments = tournaments.map((t) =>
      t.id === selectedTournamentForBracket
        ? {
            ...t,
            structure: bracket,
            auditLog: [
              ...t.auditLog,
              {
                id: `AUD-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
                timestamp: new Date().toISOString(),
                action: "bracket_generated" as const,
                editedBy: "Admin User",
                details: { format: bracket.format },
              },
            ],
          }
        : t
    );

    setTournaments(updatedTournaments);
    setShowBracketGenerator(false);
    setSelectedTournamentForBracket(null);
    toast.success("Bracket generated and saved!");
  };

  const handleSetupQualifier = (qualifierSystem: any) => {
    const updatedTournaments = tournaments.map((t) =>
      t.id === selectedTournamentForQualifier
        ? {
            ...t,
            qualifierSystem,
            auditLog: [
              ...t.auditLog,
              {
                id: `AUD-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
                timestamp: new Date().toISOString(),
                action: "qualifier_setup" as const,
                editedBy: "Admin User",
                details: { enabled: qualifierSystem.enabled },
              },
            ],
          }
        : t
    );

    setTournaments(updatedTournaments);
    setShowQualifierSetup(false);
    setSelectedTournamentForQualifier(null);
    toast.success("Qualifier system configured!");
  };

  const handleStatusFilter = (status: string) => {
    const newFilter = filterStatus.includes(status)
      ? filterStatus.filter((s) => s !== status)
      : [...filterStatus, status];
    setFilterStatus(newFilter);
  };

  const handleCategoryFilter = (category: string) => {
    const newFilter = filterCategory.includes(category)
      ? filterCategory.filter((c) => c !== category)
      : [...filterCategory, category];
    setFilterCategory(newFilter);
  };

  const handleSelectRow = (tournamentId: string) => {
    const newSelected = new Set(selectedTournaments);
    if (newSelected.has(tournamentId)) {
      newSelected.delete(tournamentId);
    } else {
      newSelected.add(tournamentId);
    }
    setSelectedTournaments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTournaments.size === filteredTournaments.length) {
      setSelectedTournaments(new Set());
    } else {
      setSelectedTournaments(new Set(filteredTournaments.map((t) => t.id)));
    }
  };

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case "draft":
        return "bg-muted/10 text-muted-foreground";
      case "registration_open":
        return "bg-blue-500/10 text-blue-500";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-500";
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "archived":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-muted/30 text-foreground";
    }
  };

  const isAllSelected = selectedTournaments.size > 0 && selectedTournaments.size === filteredTournaments.length;
  const activeFilterCount = filterStatus.length + filterCategory.length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Tournament Setup</h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">Create and manage tournaments with bracket generation and qualifier system</p>
        </div>
        <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 bg-accent text-background px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
          <Plus className="w-4 h-4" /> Create Tournament
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tournamentStats.map((stat) => {
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
      {selectedTournaments.size > 0 && (
        <div className="glass-card rounded-lg px-4 py-3 flex items-center justify-between relative z-10">
          <span className="text-xs font-montserrat font-medium text-foreground">
            {selectedTournaments.size} tournament{selectedTournaments.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
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
            placeholder="Search by tournament name..."
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
          {activeFilterCount > 0 && <span className="text-[10px] font-bold bg-accent text-background px-1.5 rounded-sm relative z-10">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card rounded-lg p-4 mb-4 relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-montserrat font-bold text-foreground uppercase tracking-widest mb-2">Status</h3>
              <div className="space-y-1">
                {["draft", "registration_open", "in_progress", "completed", "archived"].map((status) => (
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
            <div>
              <h3 className="text-xs font-montserrat font-bold text-foreground uppercase tracking-widest mb-2">Category</h3>
              <div className="space-y-1">
                {["U-12", "U-15", "U-16", "U-17", "U-18", "Open"].map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={filterCategory.includes(category)}
                      onChange={() => handleCategoryFilter(category)}
                      className="rounded"
                    />
                    <span className="text-muted-foreground">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setFilterStatus([]);
              setFilterCategory([]);
            }}
            className="w-full text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground py-1 text-center"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Tournaments Table */}
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
                  Tournament
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">
                  Location
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">
                  Teams
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTournaments.length > 0 ? (
                filteredTournaments.map((tournament) => (
                  <tr
                    key={tournament.id}
                    className={`border-b border-border/50 transition-colors ${
                      selectedTournaments.has(tournament.id) ? "bg-muted/40" : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="text-center px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTournaments.has(tournament.id)}
                        onChange={() => handleSelectRow(tournament.id)}
                        className="rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-montserrat font-semibold text-foreground">{tournament.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[9px] font-montserrat text-muted-foreground">{tournament.id}</span>
                          <span className="text-[9px] font-oswald font-bold text-accent">{tournament.format.replace(/_/g, " ").toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-montserrat text-foreground hidden md:table-cell">
                      {tournament.category}
                    </td>
                    <td className="px-4 py-3 text-xs font-montserrat text-muted-foreground hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tournament.location.city}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full ${getStatusColor(tournament.status)}`}>
                        {tournament.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-montserrat font-bold text-foreground">
                        {tournament.registrationCount}/{tournament.maxTeams}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors" title="View Details">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <div className="relative group">
                          <button className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors" title="More Actions">
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <div className="absolute right-0 mt-1 w-40 bg-secondary rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                            <button
                              onClick={() => {
                                setSelectedTournamentForBracket(tournament.id);
                                setShowBracketGenerator(true);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-montserrat font-medium text-foreground hover:bg-muted/50 transition-colors"
                            >
                              Generate Bracket
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTournamentForQualifier(tournament.id);
                                setShowQualifierSetup(true);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-montserrat font-medium text-foreground hover:bg-muted/50 transition-colors border-t border-border/30"
                            >
                              Setup Qualifiers
                            </button>
                          </div>
                        </div>
                        <button className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-destructive/20 flex items-center justify-center transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs font-montserrat text-muted-foreground">
                    No tournaments found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border relative z-10">
          <span className="text-[10px] font-montserrat text-muted-foreground">
            Showing {filteredTournaments.length} of {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Modals */}
      {showCreateForm && (
        <TournamentCreateForm
          onSubmit={handleCreateTournament}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {showBracketGenerator && selectedTournamentForBracket && (
        <BracketGeneratorModal
          tournamentId={selectedTournamentForBracket}
          format={tournaments.find((t) => t.id === selectedTournamentForBracket)?.format || "hybrid"}
          totalTeams={tournaments.find((t) => t.id === selectedTournamentForBracket)?.maxTeams || 16}
          onGenerate={handleGenerateBracket}
          onClose={() => setShowBracketGenerator(false)}
        />
      )}

      {showQualifierSetup && selectedTournamentForQualifier && (
        <QualifierSystemModal
          tournamentId={selectedTournamentForQualifier}
          onSetup={handleSetupQualifier}
          onClose={() => setShowQualifierSetup(false)}
        />
      )}
    </div>
  );
};

export default TournamentSetup;
