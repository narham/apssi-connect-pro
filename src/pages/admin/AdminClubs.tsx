import { Building2, Users, MapPin, Trophy, Search, Plus } from "lucide-react";

const clubs = [
  { name: "Garuda Muda FC", province: "DKI Jakarta", players: 42, matches: 28, wins: 18, draws: 5, losses: 5, status: "active" },
  { name: "Elang Jaya", province: "Jawa Barat", players: 38, matches: 26, wins: 15, draws: 6, losses: 5, status: "active" },
  { name: "Rajawali United", province: "Jawa Timur", players: 35, matches: 24, wins: 12, draws: 8, losses: 4, status: "active" },
  { name: "Banteng FC", province: "Banten", players: 30, matches: 22, wins: 10, draws: 5, losses: 7, status: "active" },
  { name: "Singa Putih", province: "Jawa Tengah", players: 28, matches: 20, wins: 8, draws: 7, losses: 5, status: "suspended" },
  { name: "Macan Kumbang FC", province: "DKI Jakarta", players: 32, matches: 18, wins: 11, draws: 3, losses: 4, status: "active" },
];

const AdminClubs = () => {
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
          <input type="text" placeholder="Search clubs..." className="bg-transparent border-none outline-none text-xs font-montserrat text-foreground placeholder:text-muted-foreground w-full relative z-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clubs.map((club) => (
          <div key={club.name} className="glass-card-gradient rounded-lg p-5 micro-hover relative z-0">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-sm font-oswald font-bold text-foreground uppercase">{club.name}</h3>
                    <p className="text-[10px] font-montserrat text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {club.province}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-montserrat font-bold px-2 py-0.5 rounded-full ${
                  club.status === "active" ? "text-accent bg-accent/10" : "text-destructive bg-destructive/10"
                }`}>
                  {club.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <div>
                    <p className="text-sm font-oswald font-bold text-foreground">{club.players}</p>
                    <p className="text-[8px] font-montserrat text-muted-foreground uppercase">Players</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <Trophy className="w-3.5 h-3.5 text-destructive" />
                  <div>
                    <p className="text-sm font-oswald font-bold text-foreground">{club.matches}</p>
                    <p className="text-[8px] font-montserrat text-muted-foreground uppercase">Matches</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 text-[10px] font-montserrat font-medium">
                <span className="text-accent">W {club.wins}</span>
                <span className="text-muted-foreground">D {club.draws}</span>
                <span className="text-destructive">L {club.losses}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminClubs;
