import { useState, useRef, useCallback, useEffect } from "react";
import { Search, Download, MoreHorizontal, CheckCircle2, Clock, XCircle, Eye, Check, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { usePlayers } from "@/hooks/useAdminData";
import { playerService } from "@/services/playerService";
import { useQueryClient } from "@tanstack/react-query";
import { PlayerDetailDialog } from "@/components/admin/PlayerDetailDialog";

const statusTabs = [
  { key: "ALL", label: "All" },
  { key: "MANUAL REVIEW", label: "Pending" },
  { key: "VERIFIED", label: "Verified" },
  { key: "REJECTED", label: "Rejected" },
];

const statusConfig: Record<string, { icon: any; label: string; className: string }> = {
  VERIFIED: { icon: CheckCircle2, label: "Verified", className: "status-approved" },
  "MANUAL REVIEW": { icon: Clock, label: "Pending", className: "status-pending" },
  REJECTED: { icon: XCircle, label: "Rejected", className: "status-rejected" },
};

const PAGE_SIZE = 20;

// ── Action Menu with click-outside ──
interface ActionMenuProps {
  playerId: string;
  onViewDetail: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ActionMenu = ({ playerId, onViewDetail, onApprove, onReject }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const actions = [
    { label: "View Detail", icon: Eye, onClick: () => { onViewDetail(playerId); setIsOpen(false); } },
    { label: "Approve", icon: Check, onClick: () => { onApprove(playerId); setIsOpen(false); } },
    { label: "Reject", icon: X, onClick: () => { onReject(playerId); setIsOpen(false); } },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors">
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 glass-card rounded-lg shadow-lg z-50 overflow-hidden">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} onClick={action.onClick} className="w-full text-left px-3 py-2 text-xs font-montserrat font-medium flex items-center gap-2 transition-colors text-foreground hover:bg-muted/50">
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

// ── Main Component ──
const AdminPlayers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [detailPlayerId, setDetailPlayerId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: result, isLoading } = usePlayers({ search: debouncedQuery, status: statusFilter, page, limit: PAGE_SIZE });
  const players = result?.data ?? [];
  const totalCount = result?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedQuery(value); setPage(0); }, 300);
  }, []);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(0);
    setSelectedPlayers(new Set());
  };

  const handleSelectRow = (playerId: string) => {
    const s = new Set(selectedPlayers);
    s.has(playerId) ? s.delete(playerId) : s.add(playerId);
    setSelectedPlayers(s);
  };

  const handleSelectAll = () => {
    setSelectedPlayers(selectedPlayers.size === players.length ? new Set() : new Set(players.map((p: any) => p.id)));
  };

  const handleApprove = async (playerId: string) => {
    const player = players.find((p: any) => p.id === playerId);
    try {
      await playerService.updateVerificationStatus(playerId, { verification_status: 'VERIFIED' }, {
        action_type: 'APPROVE',
        old_status: player?.verification_status ?? 'MANUAL REVIEW',
        new_status: 'VERIFIED',
      });
      toast.success("Player approved");
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    } catch { toast.error("Failed to approve"); }
  };

  const handleReject = async (playerId: string) => {
    const player = players.find((p: any) => p.id === playerId);
    try {
      await playerService.updateVerificationStatus(playerId, { verification_status: 'REJECTED' }, {
        action_type: 'REJECT',
        old_status: player?.verification_status ?? 'MANUAL REVIEW',
        new_status: 'REJECTED',
      });
      toast.error("Player rejected");
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    } catch { toast.error("Failed to reject"); }
  };

  const handleExport = () => {
    const exportPlayers = selectedPlayers.size > 0 ? players.filter((p: any) => selectedPlayers.has(p.id)) : players;
    if (exportPlayers.length === 0) { toast.error("No players to export"); return; }
    const headers = ["ID", "Name", "Club", "NIK", "Birth Date", "Verification Status"];
    const rows = exportPlayers.map((p: any) => [p.id, p.full_name, p.clubs?.name ?? '', p.nik, p.birth_date, p.verification_status]);
    const csvContent = [headers.join(","), ...rows.map((row: any) => row.map((c: any) => `"${c}"`).join(","))].join("\n");
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

  const isAllSelected = selectedPlayers.size > 0 && selectedPlayers.size === players.length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Player Management</h1>
        <p className="text-xs font-montserrat text-muted-foreground mt-1">
          {isLoading ? "Loading..." : `${totalCount} registered players`}
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-muted/20 rounded-lg p-1 w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusChange(tab.key)}
            className={`px-4 py-1.5 rounded-md text-xs font-montserrat font-bold uppercase tracking-wider transition-colors ${
              statusFilter === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedPlayers.size > 0 && (
        <div className="glass-card rounded-lg px-4 py-3 flex items-center justify-between relative z-10">
          <span className="text-xs font-montserrat font-medium text-foreground">
            {selectedPlayers.size} player{selectedPlayers.size !== 1 ? "s" : ""} selected
          </span>
          <button onClick={handleExport} className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 flex-1 min-w-[200px] relative z-0">
          <Search className="w-4 h-4 text-muted-foreground relative z-10" />
          <input
            type="text"
            placeholder="Search by name or NIK..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-montserrat text-foreground placeholder:text-muted-foreground w-full relative z-10"
          />
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground micro-hover relative z-0">
          <Download className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg overflow-hidden relative z-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 relative z-10">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-center px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest w-10">
                    <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="rounded cursor-pointer" />
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Player Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Club</th>
                  <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">NIK</th>
                  <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden xl:table-cell">Birth Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Consistency</th>
                  <th className="text-right px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.length > 0 ? (
                  players.map((player: any) => {
                    const statusKey = player.verification_status as string;
                    const status = statusConfig[statusKey] || statusConfig["MANUAL REVIEW"];
                    const StatusIcon = status.icon;
                    return (
                      <tr key={player.id} className={`border-b border-border/50 transition-colors ${selectedPlayers.has(player.id) ? "bg-muted/40" : "hover:bg-muted/20"}`}>
                        <td className="text-center px-4 py-3">
                          <input type="checkbox" checked={selectedPlayers.has(player.id)} onChange={() => handleSelectRow(player.id)} className="rounded cursor-pointer" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-oswald font-bold text-foreground">
                                {player.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-montserrat font-semibold text-foreground">{player.full_name}</p>
                              <p className="text-[10px] font-montserrat text-muted-foreground md:hidden">{player.clubs?.name ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-montserrat text-foreground hidden md:table-cell">{player.clubs?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-xs font-montserrat text-muted-foreground hidden lg:table-cell font-mono">{player.nik}</td>
                        <td className="px-4 py-3 text-xs font-montserrat text-muted-foreground hidden xl:table-cell">{player.birth_date}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full ${status.className}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">{status.label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`inline-flex items-center text-[10px] font-montserrat font-bold px-2 py-0.5 rounded ${
                            Number(player.consistency_score) >= 70 ? "text-accent bg-accent/10" :
                            Number(player.consistency_score) >= 40 ? "text-yellow-500 bg-yellow-500/10" :
                            "text-destructive bg-destructive/10"
                          }`}>
                            {Number(player.consistency_score).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ActionMenu playerId={player.id} onViewDetail={setDetailPlayerId} onApprove={handleApprove} onReject={handleReject} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-xs font-montserrat text-muted-foreground">No players found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border relative z-10">
          <span className="text-[10px] font-montserrat text-muted-foreground">
            {totalCount} player{totalCount !== 1 ? "s" : ""} total • Page {page + 1} of {Math.max(totalPages, 1)}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors disabled:opacity-30">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors disabled:opacity-30">
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Player Detail Dialog */}
      <PlayerDetailDialog playerId={detailPlayerId} open={!!detailPlayerId} onOpenChange={(open) => { if (!open) setDetailPlayerId(null); }} />
    </div>
  );
};

export default AdminPlayers;
