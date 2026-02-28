import cardBg from "@/assets/card-bg.png";
import PlayerAvatarFrame from "./PlayerAvatarFrame";

interface PlayerCardProps {
  name: string;
  position: string;
  team: string;
  number: number;
  rating: number;
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
}

const StatBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] font-montserrat font-semibold text-muted-foreground uppercase w-8">{label}</span>
    <div className="flex-1 h-1.5 bg-secondary/60 rounded-sm overflow-hidden inner-shadow">
      <div
        className="h-full gradient-line rounded-sm transition-all duration-700 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-[11px] font-oswald font-bold text-foreground w-6 text-right">{value}</span>
  </div>
);

const PlayerCard = ({ name, position, team, number, rating, stats }: PlayerCardProps) => {
  return (
    <div className="relative w-[280px] group">
      <div className="glass-card-gradient rounded-lg overflow-hidden micro-hover relative z-0">
        {/* Card BG texture */}
        <div className="absolute inset-0 opacity-20 z-0">
          <img src={cardBg} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative p-5 z-10">
          {/* Header with avatar */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <PlayerAvatarFrame name={name} number={number} size="md" variant="red" />
              <div>
                <h3 className="text-base font-oswald font-bold text-foreground uppercase tracking-wide leading-tight">{name}</h3>
                <p className="text-[10px] font-montserrat font-medium text-muted-foreground mt-0.5">{team}</p>
              </div>
            </div>
          </div>

          {/* Rating & Position */}
          <div className="flex items-end gap-3 mb-4">
            <div className="text-4xl font-oswald font-bold text-neon-red neon-glow-red leading-none">{rating}</div>
            <div className="glass-card rounded-sm px-2 py-0.5 mb-1">
              <span className="text-[10px] font-montserrat font-bold text-neon-green uppercase tracking-widest relative z-10">{position}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] gradient-line mb-4 opacity-50" />

          {/* Stats */}
          <div className="space-y-2">
            <StatBar label="PAC" value={stats.pace} />
            <StatBar label="SHO" value={stats.shooting} />
            <StatBar label="PAS" value={stats.passing} />
            <StatBar label="DRI" value={stats.dribbling} />
            <StatBar label="DEF" value={stats.defending} />
            <StatBar label="PHY" value={stats.physical} />
          </div>

          {/* QR & Verification */}
          <div className="mt-4 pt-3 border-t border-border/30 flex items-center gap-3">
            <div className="w-11 h-11 rounded-sm inner-shadow bg-secondary/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="8" height="8" rx="1" opacity="0.8" />
                <rect x="14" y="2" width="8" height="8" rx="1" opacity="0.8" />
                <rect x="2" y="14" width="8" height="8" rx="1" opacity="0.8" />
                <rect x="14" y="14" width="4" height="4" rx="0.5" opacity="0.5" />
                <rect x="20" y="16" width="2" height="2" rx="0.25" opacity="0.5" />
                <rect x="16" y="20" width="2" height="2" rx="0.25" opacity="0.5" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">E-Player Card</p>
              <p className="text-[10px] font-montserrat font-semibold text-neon-green neon-glow-green">APSSI Verified ✓</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
