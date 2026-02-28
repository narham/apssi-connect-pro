import { Trophy, ChevronRight, Shield, Star, Target, Zap, Award, Medal } from "lucide-react";

const bracketRounds = [
  {
    name: "Quarterfinals",
    matches: [
      { id: "QF1", teamA: "Garuda Muda FC", teamB: "Macan Kumbang FC", scoreA: 3, scoreB: 1, status: "completed", winner: "A" },
      { id: "QF2", teamA: "Elang Jaya", teamB: "Harimau FC", scoreA: 2, scoreB: 2, penalties: "4-3", status: "completed", winner: "A" },
      { id: "QF3", teamA: "Rajawali United", teamB: "Naga Emas", scoreA: null, scoreB: null, status: "scheduled", time: "Mar 2, 09:00" },
      { id: "QF4", teamA: "Singa Putih", teamB: "Banteng FC", scoreA: null, scoreB: null, status: "scheduled", time: "Mar 2, 11:00" },
    ],
  },
  {
    name: "Semifinals",
    matches: [
      { id: "SF1", teamA: "Garuda Muda FC", teamB: "Elang Jaya", scoreA: null, scoreB: null, status: "scheduled", time: "Mar 4, 09:00" },
      { id: "SF2", teamA: "QF3 Winner", teamB: "QF4 Winner", scoreA: null, scoreB: null, status: "pending" },
    ],
  },
  {
    name: "3rd Place",
    matches: [
      { id: "3RD", teamA: "SF1 Loser", teamB: "SF2 Loser", scoreA: null, scoreB: null, status: "pending" },
    ],
  },
  {
    name: "Final",
    matches: [
      { id: "FIN", teamA: "SF1 Winner", teamB: "SF2 Winner", scoreA: null, scoreB: null, status: "pending" },
    ],
  },
];

const topScorers = [
  { pos: 1, name: "Ahmad Rizki", club: "Garuda Muda FC", goals: 6, assists: 3 },
  { pos: 2, name: "Budi Santoso", club: "Elang Jaya", goals: 5, assists: 2 },
  { pos: 3, name: "Galih Permana", club: "Naga Emas", goals: 4, assists: 4 },
  { pos: 4, name: "Dimas Pratama", club: "Rajawali United", goals: 4, assists: 1 },
  { pos: 5, name: "Joko Susanto", club: "Garuda Muda FC", goals: 3, assists: 3 },
];

const awards = [
  { title: "Golden Boot", desc: "Top Scorer", player: "Ahmad Rizki", stat: "6 Goals", icon: Target, color: "text-destructive" },
  { title: "Golden Glove", desc: "Best Goalkeeper", player: "Fajar Maulana", stat: "12 Saves", icon: Shield, color: "text-accent" },
  { title: "Fair Play Award", desc: "Best Discipline", player: "TBD", stat: "—", icon: Award, color: "text-accent" },
  { title: "MVP", desc: "Most Valuable Player", player: "TBD", stat: "—", icon: Star, color: "text-destructive" },
];

const TournamentBracket = () => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider flex items-center gap-3">
          <Trophy className="w-6 h-6 text-destructive" />
          Bracket & Awards
        </h1>
        <p className="text-xs font-montserrat text-muted-foreground mt-1">
          Knockout stage bracket management and tournament awards tracking
        </p>
      </div>

      {/* Bracket Visualization */}
      <div className="glass-card rounded-lg p-5 relative z-0">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 gradient-line-vertical rounded-full" />
            <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
              Knockout Stage Bracket
            </h2>
          </div>

          <div className="flex items-start gap-3 overflow-x-auto pb-4">
            {bracketRounds.map((round, roundIdx) => (
              <div key={round.name} className="flex items-center gap-3">
                <div className="shrink-0 space-y-3" style={{ minWidth: round.name === "Final" ? "240px" : "200px" }}>
                  <p className="text-[9px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest text-center">
                    {round.name}
                  </p>
                  <div className="space-y-3" style={{ paddingTop: roundIdx === 1 ? "32px" : roundIdx >= 2 ? "60px" : "0" }}>
                    {round.matches.map((match) => (
                      <div
                        key={match.id}
                        className={`rounded-lg p-3 border transition-all ${
                          match.id === "FIN"
                            ? "bg-destructive/5 border-destructive/30 neon-border-red"
                            : match.status === "completed"
                            ? "bg-muted/20 border-border/30"
                            : "bg-muted/10 border-border/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-montserrat font-bold text-muted-foreground">{match.id}</span>
                          <span className={`text-[8px] font-montserrat font-bold px-1.5 py-0.5 rounded ${
                            match.status === "completed" ? "text-accent bg-accent/10" :
                            match.status === "scheduled" ? "text-muted-foreground bg-muted/40" :
                            "text-muted-foreground bg-muted/20"
                          }`}>
                            {match.status === "completed" ? "FT" : match.status === "scheduled" ? match.time : "TBD"}
                          </span>
                        </div>
                        {/* Team A */}
                        <div className={`flex items-center justify-between py-1 ${match.winner === "A" ? "" : ""}`}>
                          <span className={`text-[10px] font-oswald font-bold uppercase truncate ${
                            match.winner === "A" ? "text-accent" : "text-foreground"
                          }`}>
                            {match.winner === "A" && "✓ "}{match.teamA}
                          </span>
                          {match.scoreA !== null && (
                            <span className="text-xs font-oswald font-black text-foreground ml-2">{match.scoreA}</span>
                          )}
                        </div>
                        {/* Team B */}
                        <div className="flex items-center justify-between py-1">
                          <span className={`text-[10px] font-oswald font-bold uppercase truncate ${
                            match.winner === "B" ? "text-accent" : "text-foreground"
                          }`}>
                            {match.winner === "B" && "✓ "}{match.teamB}
                          </span>
                          {match.scoreB !== null && (
                            <span className="text-xs font-oswald font-black text-foreground ml-2">{match.scoreB}</span>
                          )}
                        </div>
                        {match.penalties && (
                          <p className="text-[8px] font-montserrat text-muted-foreground text-center mt-1">
                            Penalties: {match.penalties}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {roundIdx < bracketRounds.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Awards + Top Scorers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tournament Awards */}
        <div className="glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                Tournament Awards
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {awards.map((award) => (
                <div key={award.title} className="glass-card-gradient rounded-lg p-4 relative z-0">
                  <div className="relative z-10">
                    <award.icon className={`w-6 h-6 ${award.color} mb-2`} />
                    <p className="text-xs font-oswald font-bold text-foreground uppercase">{award.title}</p>
                    <p className="text-[9px] font-montserrat text-muted-foreground">{award.desc}</p>
                    <div className="mt-2 pt-2 border-t border-border/20">
                      <p className="text-xs font-montserrat font-semibold text-foreground">{award.player}</p>
                      <p className="text-[9px] font-montserrat font-bold text-accent">{award.stat}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Scorers */}
        <div className="glass-card rounded-lg p-5 relative z-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 gradient-line-vertical rounded-full" />
              <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">
                Top Scorers
              </h2>
            </div>
            <div className="space-y-2">
              {topScorers.map((player) => (
                <div key={player.pos} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20">
                  <span className={`text-lg font-oswald font-black w-6 text-center ${
                    player.pos <= 3 ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {player.pos}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-oswald font-bold text-foreground">
                      {player.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-montserrat font-semibold text-foreground truncate">{player.name}</p>
                    <p className="text-[9px] font-montserrat text-muted-foreground">{player.club}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-oswald font-bold text-accent">{player.goals}</p>
                    <p className="text-[8px] font-montserrat text-muted-foreground">{player.assists} ast</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
