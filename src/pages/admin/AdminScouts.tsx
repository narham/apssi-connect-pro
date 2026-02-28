import { Eye, Search, Shield, Star, MapPin, CheckCircle2, Clock } from "lucide-react";

const scouts = [
  { name: "Coach Hendrik", level: "Provincial", province: "DKI Jakarta", playersWatched: 45, reports: 28, status: "active", rating: 4.8 },
  { name: "Coach Bambang", level: "National", province: "Jawa Barat", playersWatched: 82, reports: 56, status: "active", rating: 4.9 },
  { name: "Coach Surya", level: "Provincial", province: "Jawa Timur", playersWatched: 31, reports: 18, status: "active", rating: 4.5 },
  { name: "Coach Agus", level: "District", province: "Banten", playersWatched: 22, reports: 12, status: "pending", rating: 4.2 },
  { name: "Coach Dedi", level: "Provincial", province: "Jawa Tengah", playersWatched: 38, reports: 24, status: "active", rating: 4.6 },
  { name: "Coach Rudi", level: "National", province: "Sulawesi Sel.", playersWatched: 65, reports: 41, status: "suspended", rating: 3.8 },
];

const AdminScouts = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Scout Access Control</h1>
        <p className="text-xs font-montserrat text-muted-foreground mt-1">Manage scout permissions and monitor activity</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 flex-1 min-w-[200px] relative z-0">
          <Search className="w-4 h-4 text-muted-foreground relative z-10" />
          <input type="text" placeholder="Search scouts..." className="bg-transparent border-none outline-none text-xs font-montserrat text-foreground placeholder:text-muted-foreground w-full relative z-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {scouts.map((scout) => (
          <div key={scout.name} className="glass-card-gradient rounded-lg p-5 micro-hover relative z-0">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Eye className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-oswald font-bold text-foreground uppercase">{scout.name}</h3>
                    <p className="text-[10px] font-montserrat text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {scout.province}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-montserrat font-bold px-2 py-0.5 rounded-full ${
                  scout.status === "active" ? "text-accent bg-accent/10" :
                  scout.status === "pending" ? "text-muted-foreground bg-muted/50" :
                  "text-destructive bg-destructive/10"
                }`}>
                  {scout.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-3.5 h-3.5 text-destructive" />
                <span className="text-[10px] font-montserrat font-bold text-foreground uppercase tracking-wider">{scout.level}</span>
                <span className="ml-auto flex items-center gap-1 text-[10px] font-montserrat font-bold text-accent">
                  <Star className="w-3 h-3 fill-accent" /> {scout.rating}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-muted/30 text-center">
                  <p className="text-sm font-oswald font-bold text-foreground">{scout.playersWatched}</p>
                  <p className="text-[8px] font-montserrat text-muted-foreground uppercase">Watched</p>
                </div>
                <div className="p-2 rounded bg-muted/30 text-center">
                  <p className="text-sm font-oswald font-bold text-foreground">{scout.reports}</p>
                  <p className="text-[8px] font-montserrat text-muted-foreground uppercase">Reports</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminScouts;
