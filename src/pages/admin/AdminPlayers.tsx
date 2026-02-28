import { Search, Filter, Download, Plus, MoreHorizontal, CheckCircle2, Clock, XCircle } from "lucide-react";

const players = [
  { id: "PLY-001", name: "Ahmad Rizki", club: "Garuda Muda FC", position: "AMF", age: 17, province: "DKI Jakarta", status: "verified", rating: 78 },
  { id: "PLY-002", name: "Budi Santoso", club: "Elang Jaya", position: "ST", age: 16, province: "Jawa Barat", status: "verified", rating: 82 },
  { id: "PLY-003", name: "Dimas Pratama", club: "Rajawali United", position: "CB", age: 18, province: "Jawa Timur", status: "pending", rating: 71 },
  { id: "PLY-004", name: "Fajar Maulana", club: "Banteng FC", position: "GK", age: 17, province: "Banten", status: "rejected", rating: 68 },
  { id: "PLY-005", name: "Galih Permana", club: "Singa Putih", position: "LW", age: 16, province: "Jawa Tengah", status: "verified", rating: 75 },
  { id: "PLY-006", name: "Hendra Wijaya", club: "Macan FC", position: "CM", age: 18, province: "DKI Jakarta", status: "pending", rating: 73 },
  { id: "PLY-007", name: "Irfan Setiawan", club: "Naga Emas", position: "RB", age: 17, province: "Sulawesi Sel.", status: "verified", rating: 70 },
  { id: "PLY-008", name: "Joko Susanto", club: "Garuda Muda FC", position: "DMF", age: 16, province: "DKI Jakarta", status: "verified", rating: 76 },
];

const statusConfig = {
  verified: { icon: CheckCircle2, label: "Verified", className: "text-accent bg-accent/10" },
  pending: { icon: Clock, label: "Pending", className: "text-muted-foreground bg-muted/50" },
  rejected: { icon: XCircle, label: "Rejected", className: "text-destructive bg-destructive/10" },
};

const AdminPlayers = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Player Management</h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">Manage all registered players across provinces</p>
        </div>
        <button className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
          <Plus className="w-4 h-4" /> Register Player
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 flex-1 min-w-[200px] relative z-0">
          <Search className="w-4 h-4 text-muted-foreground relative z-10" />
          <input
            type="text"
            placeholder="Search by name, ID, or club..."
            className="bg-transparent border-none outline-none text-xs font-montserrat text-foreground placeholder:text-muted-foreground w-full relative z-10"
          />
        </div>
        <button className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground micro-hover relative z-0">
          <Filter className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Filter</span>
        </button>
        <button className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground micro-hover relative z-0">
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
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">ID</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Player</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Club</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Position</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Province</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Rating</th>
                <th className="text-left px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="text-right px-4 py-3 text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const status = statusConfig[player.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <tr key={player.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-montserrat font-medium text-muted-foreground">{player.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-oswald font-bold text-foreground">
                            {player.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-montserrat font-semibold text-foreground">{player.name}</p>
                          <p className="text-[10px] font-montserrat text-muted-foreground md:hidden">{player.club}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-montserrat text-foreground hidden md:table-cell">{player.club}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[10px] font-oswald font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                        {player.position}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-montserrat text-muted-foreground hidden lg:table-cell">{player.province}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-oswald font-bold text-foreground">{player.rating}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full ${status.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center ml-auto transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border relative z-10">
          <span className="text-[10px] font-montserrat text-muted-foreground">Showing 1-8 of 2,847 players</span>
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
