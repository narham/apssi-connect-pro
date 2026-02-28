import HeroSection from "@/components/HeroSection";
import StatsPanel from "@/components/StatsPanel";
import QuickActions from "@/components/QuickActions";
import PlayerCard from "@/components/PlayerCard";
import BottomNav from "@/components/BottomNav";
import DashboardPanel from "@/components/DashboardPanel";
import StatusBadge from "@/components/StatusBadge";
import PlayerAvatarFrame from "@/components/PlayerAvatarFrame";

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

const recentMatches = [
  { home: "Garuda Muda FC", away: "Elang Jaya", score: "3 - 1", status: "completed" as const },
  { home: "Rajawali United", away: "Banteng FC", score: "2 - 2", status: "completed" as const },
  { home: "Singa Putih", away: "Harimau FC", score: "0 - 1", status: "live" as const },
];

const topPlayers = [
  { name: "Ahmad Rizki", team: "Garuda Muda FC", goals: 12, variant: "red" as const },
  { name: "Budi Santoso", team: "Elang Jaya", goals: 9, variant: "green" as const },
  { name: "Dimas Pratama", team: "Rajawali United", goals: 8, variant: "red" as const },
];

const Index = () => {
  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar */}
      <header className="glass-panel sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-neon-red/20 neon-border-red flex items-center justify-center border">
            <span className="text-[10px] font-oswald font-black text-neon-red">AC</span>
          </div>
          <div>
            <span className="text-xs font-oswald font-bold text-foreground uppercase tracking-[0.12em] block leading-none">APSSI Connect</span>
            <span className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">Tournament HQ</span>
          </div>
        </div>
        <StatusBadge status="live" />
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto space-y-6 px-4 pt-4">
        <HeroSection />

        <DashboardPanel title="Tournament Overview">
          <StatsPanel />
        </DashboardPanel>

        <DashboardPanel title="Quick Actions">
          <QuickActions />
        </DashboardPanel>

        <DashboardPanel title="Featured Player">
          <div className="flex justify-center">
            <PlayerCard {...samplePlayer} />
          </div>
        </DashboardPanel>

        {/* Top Scorers */}
        <DashboardPanel title="Top Scorers">
          <div className="space-y-2">
            {topPlayers.map((player, i) => (
              <div
                key={player.name}
                className="glass-card rounded-lg p-3 flex items-center gap-3 micro-hover animate-slide-up relative z-0"
                style={{ animationDelay: `${(i + 6) * 80}ms` }}
              >
                <div className="text-lg font-oswald font-bold text-muted-foreground w-6 relative z-10">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <PlayerAvatarFrame name={player.name} size="sm" variant={player.variant} />
                <div className="flex-1 relative z-10">
                  <p className="text-xs font-oswald font-bold text-foreground uppercase">{player.name}</p>
                  <p className="text-[10px] font-montserrat font-medium text-muted-foreground">{player.team}</p>
                </div>
                <div className="relative z-10 text-right">
                  <span className="text-xl font-oswald font-bold text-neon-green neon-glow-green">{player.goals}</span>
                  <p className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase">Goals</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>

        {/* Recent Matches */}
        <DashboardPanel title="Recent Matches">
          <div className="space-y-2">
            {recentMatches.map((match, i) => (
              <div
                key={i}
                className="glass-card rounded-lg p-3 flex items-center justify-between animate-slide-up relative z-0"
                style={{ animationDelay: `${(i + 9) * 80}ms` }}
              >
                <div className="flex-1 relative z-10">
                  <p className="text-xs font-montserrat font-semibold text-foreground">{match.home}</p>
                  <p className="text-[10px] font-montserrat font-medium text-muted-foreground">vs {match.away}</p>
                </div>
                <div className="text-center relative z-10 mx-3">
                  <p className="text-xl font-oswald font-bold text-foreground tracking-wider">{match.score}</p>
                </div>
                <div className="flex-1 flex justify-end relative z-10">
                  <StatusBadge status={match.status} />
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
