"use client";

import { useState } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal, CheckCircle2, Clock, XCircle, ChevronDown, Eye, Edit, UserX, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  club: string;
  position: string;
  age: number;
  province: string;
  status: "verified" | "pending" | "rejected";
  rating: number;
  fairPlayScore: number;
  hasQRCode: boolean;
  photoUrl?: string;
}

const initialPlayers: Player[] = [
  { id: "PLY-001", name: "Ahmad Rizki", club: "Garuda Muda FC", position: "AMF", age: 17, province: "DKI Jakarta", status: "verified", rating: 78, fairPlayScore: 9, hasQRCode: true },
  { id: "PLY-002", name: "Budi Santoso", club: "Elang Jaya", position: "ST", age: 16, province: "Jawa Barat", status: "verified", rating: 82, fairPlayScore: 8, hasQRCode: true },
  { id: "PLY-003", name: "Dimas Pratama", club: "Rajawali United", position: "CB", age: 18, province: "Jawa Timur", status: "pending", rating: 71, fairPlayScore: 6, hasQRCode: false },
  { id: "PLY-004", name: "Fajar Maulana", club: "Banteng FC", position: "GK", age: 17, province: "Banten", status: "rejected", rating: 68, fairPlayScore: 3, hasQRCode: true },
  { id: "PLY-005", name: "Galih Permana", club: "Singa Putih", position: "LW", age: 16, province: "Jawa Tengah", status: "verified", rating: 75, fairPlayScore: 7, hasQRCode: true },
  { id: "PLY-006", name: "Hendra Wijaya", club: "Macan FC", position: "CM", age: 18, province: "DKI Jakarta", status: "pending", rating: 73, fairPlayScore: 5, hasQRCode: false },
  { id: "PLY-007", name: "Irfan Setiawan", club: "Naga Emas", position: "RB", age: 17, province: "Sulawesi Sel.", status: "verified", rating: 70, fairPlayScore: 9, hasQRCode: true },
  { id: "PLY-008", name: "Joko Susanto", club: "Garuda Muda FC", position: "DMF", age: 16, province: "DKI Jakarta", status: "verified", rating: 76, fairPlayScore: 8, hasQRCode: true },
  { id: "PLY-009", name: "Kharisma Putra", club: "Elang Jaya", position: "LB", age: 17, province: "Jawa Barat", status: "verified", rating: 74, fairPlayScore: 7, hasQRCode: true },
  { id: "PLY-010", name: "Luthfi Rahman", club: "Rajawali United", position: "CM", age: 16, province: "Jawa Timur", status: "verified", rating: 79, fairPlayScore: 10, hasQRCode: true },
];

const statusConfig = {
  verified: { icon: CheckCircle2, label: "Verified", className: "text-accent bg-accent/10" },
  pending: { icon: Clock, label: "Pending", className: "text-muted-foreground bg-muted/50" },
  rejected: { icon: XCircle, label: "Rejected", className: "text-destructive bg-destructive/10" },
};

const positions = ["AMF", "ST", "CB", "GK", "LW", "CM", "RB", "LB", "DMF", "RW"];
const clubs = ["Garuda Muda FC", "Elang Jaya", "Rajawali United", "Banteng FC", "Singa Putih", "Macan FC", "Naga Emas"];
const provinces = ["DKI Jakarta", "Jawa Barat", "Jawa Timur", "Banten", "Jawa Tengah", "Sulawesi Sel.", "Sumatra Utara", "Bali"];
const ageCategories = [
  { label: "U-16", min: 15, max: 16 },
  { label: "U-17", min: 17, max: 17 },
  { label: "U-18", min: 18, max: 18 },
  { label: "U-20", min: 19, max: 20 },
];

interface FilterState {
  province: string[];
  club: string[];
  position: string[];
  status: string[];
  ageCategory: string[];
}

interface ActionMenuProps {
  playerId: string;
  onViewDetail: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  onSuspend: (id: string) => void;
  onDelete: (id: string) => void;
}

const ActionMenu = ({ playerId, onViewDetail, onApprove, onReject, onEdit, onSuspend, onDelete }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: "View Detail", icon: Eye, onClick: () => { onViewDetail(playerId); setIsOpen(false); } },
    { label: "Approve", icon: Check, onClick: () => { onApprove(playerId); setIsOpen(false); } },
    { label: "Reject", icon: X, onClick: () => { onReject(playerId); setIsOpen(false); } },
    { label: "Edit Data", icon: Edit, onClick: () => { onEdit(playerId); setIsOpen(false); } },
    { label: "Suspend", icon: UserX, onClick: () => { onSuspend(playerId); setIsOpen(false); } },
    { label: "Delete", icon: Trash2, onClick: () => { onDelete(playerId); setIsOpen(false); }, isDestructive: true },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 glass-card rounded-lg shadow-lg z-50 overflow-hidden relative z-10">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`w-full text-left px-3 py-2 text-xs font-montserrat font-medium flex items-center gap-2 transition-colors ${
                  action.isDestructive
                    ? "text-destructive hover:bg-destructive/20"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface FilterPanelProps {
  isOpen: boolean;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const FilterPanel = ({ isOpen, filters, onFilterChange }: FilterPanelProps) => {
  if (!isOpen) return null;

  const handleCheckboxChange = (type: keyof FilterState, value: string) => {
    const newValues = filters[type].includes(value)
      ? filters[type].filter(v => v !== value)
      : [...filters[type], value];
    onFilterChange({ ...filters, [type]: newValues });
  };

  return (
    <div className="glass-card rounded-lg p-4 mb-4 relative z-10 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Province Filter */}
        <div>
          <h3 className="text-xs font-montserrat font-bold text-foreground uppercase tracking-widest mb-2">Province</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {provinces.map(prov => (
              <label key={prov} className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={filters.province.includes(prov)}
                  onChange={() => handleCheckboxChange('province', prov)}
                  className="rounded"
                />
                <span className="text-muted-foreground">{prov}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Club Filter */}
        <div>
          <h3 className="text-xs font-montserrat font-bold text-foreground uppercase tracking-widest mb-2">Club</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {clubs.map(club => (
              <label key={club} className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={filters.club.includes(club)}
                  onChange={() => handleCheckboxChange('club', club)}
                  className="rounded"
                />
                <span className="text-muted-foreground">{club}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Position Filter */}
        <div>
          <h3 className="text-xs font-montserrat font-bold text-foreground uppercase tracking-widest mb-2">Position</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {positions.map(pos => (
              <label key={pos} className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={filters.position.includes(pos)}
                  onChange={() => handleCheckboxChange('position', pos)}
                  className="rounded"
                />
                <span className="text-muted-foreground">{pos}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-xs font-montserrat font-bold text-foreground uppercase tracking-widest mb-2">Status</h3>
          <div className="space-y-1">
            {Object.entries(statusConfig).map(([key, config]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={filters.status.includes(key)}
                  onChange={() => handleCheckboxChange('status', key)}
                  className="rounded"
                />
                <span className="text-muted-foreground">{config.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Category Filter */}
        <div>
          <h3 className="text-xs font-montserrat font-bold text-foreground uppercase tracking-widest mb-2">Age Category</h3>
          <div className="space-y-1">
            {ageCategories.map(cat => (
              <label key={cat.label} className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={filters.ageCategory.includes(cat.label)}
                  onChange={() => handleCheckboxChange('ageCategory', cat.label)}
                  className="rounded"
                />
                <span className="text-muted-foreground">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onFilterChange({ province: [], club: [], position: [], status: [], ageCategory: [] })}
        className="w-full text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground py-1 text-center"
      >
        Clear All Filters
      </button>
    </div>
  );
};

const AdminPlayers = () => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    province: [],
    club: [],
    position: [],
    status: [],
    ageCategory: [],
  });

  // Filtered players based on search and filters
  const filteredPlayers = players.filter(player => {
    const matchesSearch = !searchQuery ||
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.club.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvince = filters.province.length === 0 || filters.province.includes(player.province);
    const matchesClub = filters.club.length === 0 || filters.club.includes(player.club);
    const matchesPosition = filters.position.length === 0 || filters.position.includes(player.position);
    const matchesStatus = filters.status.length === 0 || filters.status.includes(player.status);

    const matchesAge = filters.ageCategory.length === 0 ||
      filters.ageCategory.some(cat => {
        const ageCategory = ageCategories.find(a => a.label === cat);
        return ageCategory && player.age >= ageCategory.min && player.age <= ageCategory.max;
      });

    return matchesSearch && matchesProvince && matchesClub && matchesPosition && matchesStatus && matchesAge;
  });

  const handleSelectRow = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPlayers.size === filteredPlayers.length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set(filteredPlayers.map(p => p.id)));
    }
  };

  // Action handlers
  const handleApprove = (playerId: string) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, status: "verified" } : p));
    toast.success(`Player approved successfully`);
  };

  const handleBulkApprove = () => {
    setPlayers(players.map(p => selectedPlayers.has(p.id) ? { ...p, status: "verified" } : p));
    toast.success(`${selectedPlayers.size} player(s) approved successfully`);
    setSelectedPlayers(new Set());
  };

  const handleReject = (playerId: string) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, status: "rejected" } : p));
    toast.error(`Player rejected`);
  };

  const handleBulkReject = () => {
    setPlayers(players.map(p => selectedPlayers.has(p.id) ? { ...p, status: "rejected" } : p));
    toast.error(`${selectedPlayers.size} player(s) rejected`);
    setSelectedPlayers(new Set());
  };

  const handleDelete = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
    toast.success(`Player deleted`);
  };

  const handleSuspend = (playerId: string) => {
    toast.info(`Player suspended (Suspension feature coming soon)`);
  };

  const handleEdit = (playerId: string) => {
    toast.info(`Edit player data for ${playerId} (Edit feature coming soon)`);
  };

  const handleViewDetail = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      toast.info(`Viewing details for ${player.name}`);
    }
  };

  const handleExportSelected = () => {
    const exportPlayers = selectedPlayers.size > 0
      ? filteredPlayers.filter(p => selectedPlayers.has(p.id))
      : filteredPlayers;

    if (exportPlayers.length === 0) {
      toast.error("No players to export");
      return;
    }

    // Create CSV content
    const headers = ["ID", "Name", "Club", "Province", "Position", "Age", "Verification Status", "Fair Play Score", "QR Code Status"];
    const rows = exportPlayers.map(p => [
      p.id,
      p.name,
      p.club,
      p.province,
      p.position,
      p.age,
      p.status,
      p.fairPlayScore,
      p.hasQRCode ? "Generated" : "Pending",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `players_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success(`Exported ${exportPlayers.length} player(s)`);
    setSelectedPlayers(new Set());
  };

  const getFairPlayColor = (score: number) => {
    if (score <= 3) return "text-destructive bg-destructive/10";
    if (score <= 6) return "text-yellow-500 bg-yellow-500/10";
    return "text-accent bg-accent/10";
  };

  const isAllSelected = selectedPlayers.size > 0 && selectedPlayers.size === filteredPlayers.length;
  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Player Management</h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">Manage all registered players across provinces</p>
        </div>
        <button className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
          <Plus className="w-4 h-4" /> Register Player
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedPlayers.size > 0 && (
        <div className="glass-card rounded-lg px-4 py-3 flex items-center justify-between relative z-10">
          <span className="text-xs font-montserrat font-medium text-foreground">
            {selectedPlayers.size} player{selectedPlayers.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-1.5 bg-accent text-background px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              onClick={handleBulkReject}
              className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <FilterPanel isOpen={showFilters} filters={filters} onFilterChange={setFilters} />

      {/* Search and Control Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 flex-1 min-w-[200px] relative z-0">
          <Search className="w-4 h-4 text-muted-foreground relative z-10" />
          <input
            type="text"
            placeholder="Search by name, ID, or club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-montserrat text-foreground placeholder:text-muted-foreground w-full relative z-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 glass-card rounded-lg px-3 py-2 text-xs font-montserrat font-medium transition-colors relative z-0 ${
            activeFilterCount > 0
              ? "text-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Filter</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold bg-accent text-background px-1.5 rounded-sm relative z-10">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button
          onClick={handleExportSelected}
          className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground micro-hover relative z-0"
        >
          <Download className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Export</span>
        </button>
      </div>

      {/* Table */}
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
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Photo</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Player Name</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Club</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Province</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden xl:table-cell">Position</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Verification Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Fair Play</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">QR Code</th>
                <th className="text-right px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => {
                  const status = statusConfig[player.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={player.id}
                      className={`border-b border-border/50 transition-colors ${
                        selectedPlayers.has(player.id) ? "bg-muted/40" : "hover:bg-muted/20"
                      }`}
                    >
                      <td className="text-center px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPlayers.has(player.id)}
                          onChange={() => handleSelectRow(player.id)}
                          className="rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-oswald font-bold text-foreground">
                            {player.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-montserrat font-semibold text-foreground">{player.name}</p>
                          <p className="text-[10px] font-montserrat text-muted-foreground md:hidden">{player.club}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-montserrat text-foreground hidden md:table-cell">{player.club}</td>
                      <td className="px-4 py-3 text-xs font-montserrat text-muted-foreground hidden lg:table-cell">{player.province}</td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-[10px] font-oswald font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                          {player.position}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full ${status.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">{status.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center text-[10px] font-montserrat font-bold px-2 py-0.5 rounded ${getFairPlayColor(player.fairPlayScore)}`}>
                          {player.fairPlayScore}/10
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {player.hasQRCode ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-montserrat font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Generated</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-montserrat font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span className="hidden sm:inline">Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ActionMenu
                          playerId={player.id}
                          onViewDetail={handleViewDetail}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          onEdit={handleEdit}
                          onSuspend={handleSuspend}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-xs font-montserrat text-muted-foreground">
                    No players found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border relative z-10">
          <span className="text-[10px] font-montserrat text-muted-foreground">
            Showing {Math.min(filteredPlayers.length, 1)}-{Math.min(filteredPlayers.length, 10)} of {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 356].map((page, i) => (
              <button
                key={i}
                className={`w-7 h-7 rounded text-[10px] font-montserrat font-bold transition-colors ${
                  page === 1 ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPlayers;
