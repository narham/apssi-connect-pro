"use client";

import { useState } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal, CheckCircle2, Clock, XCircle, Eye, Edit, UserX, Trash2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePlayers } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { icon: any; label: string; className: string }> = {
  VERIFIED: { icon: CheckCircle2, label: "Verified", className: "status-approved" },
  "MANUAL REVIEW": { icon: Clock, label: "Pending", className: "status-pending" },
  REJECTED: { icon: XCircle, label: "Rejected", className: "status-rejected" },
};

interface ActionMenuProps {
  playerId: string;
  onViewDetail: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ActionMenu = ({ playerId, onViewDetail, onApprove, onReject }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: "View Detail", icon: Eye, onClick: () => { onViewDetail(playerId); setIsOpen(false); } },
    { label: "Approve", icon: Check, onClick: () => { onApprove(playerId); setIsOpen(false); } },
    { label: "Reject", icon: X, onClick: () => { onReject(playerId); setIsOpen(false); } },
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
        <div className="absolute right-0 mt-2 w-40 glass-card rounded-lg shadow-lg z-50 overflow-hidden">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className="w-full text-left px-3 py-2 text-xs font-montserrat font-medium flex items-center gap-2 transition-colors text-foreground hover:bg-muted/50"
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

const AdminPlayers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { data: players, isLoading } = usePlayers(debouncedQuery);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Simple debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearTimeout((window as any).__searchTimeout);
    (window as any).__searchTimeout = setTimeout(() => setDebouncedQuery(value), 300);
  };

  const handleSelectRow = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) newSelected.delete(playerId);
    else newSelected.add(playerId);
    setSelectedPlayers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPlayers.size === (players ?? []).length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set((players ?? []).map((p: any) => p.id)));
    }
  };

  const handleApprove = async (playerId: string) => {
    const { error } = await supabase
      .from('players')
      .update({ verification_status: 'VERIFIED' })
      .eq('id', playerId);

    if (error) { toast.error("Failed to approve"); return; }
    toast.success("Player approved");
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  const handleReject = async (playerId: string) => {
    const { error } = await supabase
      .from('players')
      .update({ verification_status: 'REJECTED' })
      .eq('id', playerId);

    if (error) { toast.error("Failed to reject"); return; }
    toast.error("Player rejected");
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  const handleViewDetail = (playerId: string) => {
    const player = (players ?? []).find((p: any) => p.id === playerId);
    if (player) toast.info(`Viewing details for ${player.full_name}`);
  };

  const handleExport = () => {
    const exportPlayers = selectedPlayers.size > 0
      ? (players ?? []).filter((p: any) => selectedPlayers.has(p.id))
      : (players ?? []);

    if (exportPlayers.length === 0) { toast.error("No players to export"); return; }

    const headers = ["ID", "Name", "Club", "NIK", "Birth Date", "Verification Status"];
    const rows = exportPlayers.map((p: any) => [
      p.id, p.full_name, p.clubs?.name ?? '', p.nik, p.birth_date, p.verification_status,
    ]);

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

  const isAllSelected = selectedPlayers.size > 0 && selectedPlayers.size === (players ?? []).length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Player Management</h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${(players ?? []).length} registered players`}
          </p>
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
            <button onClick={handleExport} className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
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
                {(players ?? []).length > 0 ? (
                  (players ?? []).map((player: any) => {
                    const statusKey = player.verification_status as string;
                    const status = statusConfig[statusKey] || statusConfig["MANUAL REVIEW"];
                    const StatusIcon = status.icon;
                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-border/50 transition-colors ${
                          selectedPlayers.has(player.id) ? "bg-muted/40" : "hover:bg-muted/20"
                        }`}
                      >
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
                          <ActionMenu
                            playerId={player.id}
                            onViewDetail={handleViewDetail}
                            onApprove={handleApprove}
                            onReject={handleReject}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-xs font-montserrat text-muted-foreground">
                      No players found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border relative z-10">
          <span className="text-[10px] font-montserrat text-muted-foreground">
            {(players ?? []).length} player{(players ?? []).length !== 1 ? "s" : ""} total
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminPlayers;
