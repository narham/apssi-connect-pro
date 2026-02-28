import cardBg from "@/assets/card-bg.png";

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
    <div className="flex-1 h-1 bg-secondary rounded-sm overflow-hidden">
      <div
        className="h-full gradient-line rounded-sm transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-[11px] font-oswald font-bold text-foreground w-6 text-right">{value}</span>
  </div>
);

const PlayerCard = ({ name, position, team, number, rating, stats }: PlayerCardProps) => {
  return (
    <div className="relative w-[260px] group">
      {/* Card */}
      <div className="relative glass-card rounded-lg overflow-hidden neon-border-red">
        {/* Card BG */}
        <div className="absolute inset-0 opacity-30">
          <img src={cardBg} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-3xl font-oswald font-bold text-neon-red neon-glow-red">{rating}</div>
              <div className="text-[10px] font-montserrat font-bold text-accent uppercase tracking-widest">{position}</div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-oswald font-black text-foreground/10">#{number}</div>
            </div>
          </div>

          {/* Player Info */}
          <div className="mb-4">
            <h3 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wide">{name}</h3>
            <p className="text-xs font-montserrat text-muted-foreground">{team}</p>
          </div>

          {/* Divider */}
          <div className="h-[1px] gradient-line mb-3 opacity-60" />

          {/* Stats */}
          <div className="space-y-1.5">
            <StatBar label="PAC" value={stats.pace} />
            <StatBar label="SHO" value={stats.shooting} />
            <StatBar label="PAS" value={stats.passing} />
            <StatBar label="DRI" value={stats.dribbling} />
            <StatBar label="DEF" value={stats.defending} />
            <StatBar label="PHY" value={stats.physical} />
          </div>

          {/* QR Placeholder */}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-12 h-12 border border-glass-border rounded flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="8" height="8" rx="1" opacity="0.8" />
                <rect x="14" y="2" width="8" height="8" rx="1" opacity="0.8" />
                <rect x="2" y="14" width="8" height="8" rx="1" opacity="0.8" />
                <rect x="14" y="14" width="4" height="4" rx="0.5" opacity="0.5" />
                <rect x="20" y="16" width="2" height="2" rx="0.25" opacity="0.5" />
                <rect x="16" y="20" width="2" height="2" rx="0.25" opacity="0.5" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-montserrat text-muted-foreground uppercase tracking-wider">E-Player Card</p>
              <p className="text-[10px] font-montserrat font-semibold text-accent">APSSI Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
