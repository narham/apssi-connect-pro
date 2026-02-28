import { useState } from "react";
import { Building2, Users, MapPin, Search, Plus, Loader2 } from "lucide-react";
import { useClubs } from "@/hooks/useAdminData";

const AdminClubs = () => {
  const { data: clubs, isLoading } = useClubs();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClubs = (clubs ?? []).filter((club: any) =>
    !searchQuery ||
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.provinceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Club Management</h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">Manage registered clubs and their rosters</p>
        </div>
        <button className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
          <Plus className="w-4 h-4" /> Register Club
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 flex-1 min-w-[200px] relative z-0">
          <Search className="w-4 h-4 text-muted-foreground relative z-10" />
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-montserrat text-foreground placeholder:text-muted-foreground w-full relative z-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="glass-card rounded-lg p-8 text-center relative z-0">
          <div className="relative z-10">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-xs font-montserrat text-muted-foreground">No clubs found</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClubs.map((club: any) => (
            <div key={club.id} className="glass-card-gradient rounded-lg p-5 micro-hover relative z-0">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-sm font-oswald font-bold text-foreground uppercase">{club.name}</h3>
                      <p className="text-[10px] font-montserrat text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {club.provinceName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-montserrat font-bold px-2 py-0.5 rounded-full text-accent bg-accent/10">
                    ACTIVE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <div>
                      <p className="text-sm font-oswald font-bold text-foreground">{club.playerCount}</p>
                      <p className="text-[8px] font-montserrat text-muted-foreground uppercase">Players</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminClubs;
