import HeroSection from "@/components/HeroSection";
import StatsPanel from "@/components/StatsPanel";
import QuickActions from "@/components/QuickActions";
import PlayerCard from "@/components/PlayerCard";
import BottomNav from "@/components/BottomNav";

const samplePlayer = {
  name: "Ahmad Rizki",
  position: "AMF",
  team: "Garuda Muda FC",
  number: 10,
  rating: 78,
  stats: {
    pace: 82,
    shooting: 65,
    passing: 74,
    dribbling: 80,
    defending: 45,
    physical: 58,
  },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="glass-panel sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-xs font-oswald font-black text-primary-foreground">AC</span>
          </div>
          <span className="text-sm font-oswald font-bold text-foreground uppercase tracking-wider">APSSI Connect</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse-neon" />
          <span className="text-[9px] font-montserrat text-accent font-semibold uppercase">Live</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto space-y-6 px-4 pt-4">
        <HeroSection />
        <StatsPanel />
        <QuickActions />

        {/* Featured Player */}
        <div className="space-y-3">
          <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-widest">
            Featured Player
          </h2>
          <div className="flex justify-center">
            <PlayerCard {...samplePlayer} />
          </div>
        </div>

        {/* Recent Matches Teaser */}
        <div className="space-y-3">
          <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-widest">
            Recent Matches
          </h2>
          <div className="space-y-2">
            {[
              { home: "Garuda Muda FC", away: "Elang Jaya", score: "3 - 1", status: "FT" },
              { home: "Rajawali United", away: "Banteng FC", score: "2 - 2", status: "FT" },
              { home: "Singa Putih", away: "Harimau FC", score: "0 - 1", status: "LIVE" },
            ].map((match, i) => (
              <div key={i} className="glass-card rounded-lg p-3 flex items-center justify-between animate-slide-up" style={{ animationDelay: `${(i + 8) * 80}ms` }}>
                <div className="flex-1">
                  <p className="text-xs font-montserrat font-semibold text-foreground">{match.home}</p>
                  <p className="text-[10px] font-montserrat text-muted-foreground">vs {match.away}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-oswald font-bold text-foreground">{match.score}</p>
                </div>
                <div className="flex-1 flex justify-end">
                  <span className={`text-[9px] font-montserrat font-bold uppercase px-2 py-0.5 rounded ${
                    match.status === "LIVE"
                      ? "bg-neon-red/20 text-neon-red animate-pulse-neon"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {match.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
