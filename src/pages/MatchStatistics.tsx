import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Timer, Target, Handshake, Shield, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import BottomNav from "@/components/BottomNav";
import DashboardPanel from "@/components/DashboardPanel";
import PlayerAvatarFrame from "@/components/PlayerAvatarFrame";
import playerAhmad from "@/assets/player-ahmad.png";

/* ─── Animated Counter ─── */
const AnimatedCounter = ({ target, duration = 1200 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
};

/* ─── Radial Progress ─── */
const RadialProgress = ({
  value,
  max,
  label,
  icon: Icon,
  color,
  size = 100,
}: {
  value: number;
  max: number;
  label: string;
  icon: typeof Timer;
  color: "green" | "red" | "brand";
  size?: number;
}) => {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circumference - pct * circumference;

  const strokeColor =
    color === "green" ? "hsl(var(--neon-green))" :
    color === "red" ? "hsl(var(--neon-red))" :
    "url(#grad)";

  const glowFilter =
    color === "green" ? "drop-shadow(0 0 6px hsla(var(--neon-green)/0.5))" :
    color === "red" ? "drop-shadow(0 0 6px hsla(var(--neon-red)/0.5))" :
    "drop-shadow(0 0 6px hsla(var(--neon-red)/0.3))";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--neon-red))" />
              <stop offset="100%" stopColor="hsl(var(--neon-green))" />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" opacity="0.3" />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: glowFilter }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={cn("w-4 h-4 mb-0.5",
            color === "green" ? "text-neon-green" : color === "red" ? "text-neon-red" : "text-foreground"
          )} />
          <span className={cn("text-lg font-oswald font-bold leading-none",
            color === "green" ? "text-neon-green" : color === "red" ? "text-neon-red" : "text-foreground"
          )}>
            <AnimatedCounter target={value} />
          </span>
        </div>
      </div>
      <span className="text-[9px] font-montserrat font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
};

/* ─── Fair Play Indicator ─── */
const FairPlayIndicator = ({ cards }: { cards: { yellow: number; red: number } }) => {
  const status = cards.red > 0 ? "red" : cards.yellow > 0 ? "yellow" : "green";

  return (
    <div className={cn(
      "glass-card-gradient rounded-lg p-4 relative z-0",
      status === "green" && "neon-border-green",
      status === "red" && "neon-border-red"
    )}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-oswald font-bold text-foreground uppercase tracking-wide">Fair Play</span>
          <Shield className={cn("w-4 h-4",
            status === "green" ? "text-neon-green" : status === "red" ? "text-neon-red" : "text-yellow-400"
          )} />
        </div>

        <div className="flex items-center gap-4">
          {/* Status Dot */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-lg",
            status === "green" && "bg-neon-green/15 shadow-[0_0_12px_hsla(var(--neon-green)/0.3)]",
            status === "yellow" && "bg-yellow-500/15 shadow-[0_0_12px_hsla(45,100%,50%,0.3)]",
            status === "red" && "bg-neon-red/15 shadow-[0_0_12px_hsla(var(--neon-red)/0.3)]"
          )}>
            {status === "green" ? "🟢" : status === "yellow" ? "🟡" : "🔴"}
          </div>

          <div className="flex-1">
            <p className={cn("text-sm font-oswald font-bold uppercase",
              status === "green" ? "text-neon-green neon-glow-green" : status === "red" ? "text-neon-red neon-glow-red" : "text-yellow-400"
            )}>
              {status === "green" ? "Clean Record" : status === "yellow" ? "Caution" : "Suspended"}
            </p>
            <p className="text-[10px] font-montserrat font-medium text-muted-foreground mt-0.5">
              {cards.yellow} Yellow • {cards.red} Red
            </p>
          </div>

          {/* Rating */}
          <div className="text-right">
            <div className={cn("text-2xl font-oswald font-bold",
              status === "green" ? "text-neon-green neon-glow-green" : status === "red" ? "text-neon-red" : "text-yellow-400"
            )}>
              {status === "green" ? "A+" : status === "yellow" ? "B" : "D"}
            </div>
            <p className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase">Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Match Rating Card ─── */
const MatchRatingCard = ({ match, rating, result, delay }: { match: string; rating: number; result: "W" | "D" | "L"; delay: number }) => {
  const ratingColor = rating >= 7.5 ? "text-neon-green neon-glow-green" : rating >= 6 ? "text-yellow-400" : "text-neon-red";
  const resultColor = result === "W" ? "bg-neon-green/15 text-neon-green" : result === "D" ? "bg-yellow-500/10 text-yellow-400" : "bg-neon-red/15 text-neon-red";

  return (
    <div className="glass-card rounded-lg p-3 flex items-center gap-3 micro-hover animate-slide-up relative z-0" style={{ animationDelay: `${delay}ms` }}>
      <span className={cn("w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-oswald font-bold", resultColor)}>{result}</span>
      <div className="flex-1 relative z-10">
        <p className="text-[11px] font-montserrat font-semibold text-foreground">{match}</p>
      </div>
      <div className={cn("text-xl font-oswald font-bold", ratingColor)}>
        {rating.toFixed(1)}
      </div>
    </div>
  );
};

/* ─── Data ─── */
const performanceData = [
  { match: "M1", rating: 7.2, goals: 1, assists: 0 },
  { match: "M2", rating: 6.8, goals: 0, assists: 1 },
  { match: "M3", rating: 8.1, goals: 2, assists: 1 },
  { match: "M4", rating: 7.5, goals: 1, assists: 0 },
  { match: "M5", rating: 6.4, goals: 0, assists: 0 },
  { match: "M6", rating: 7.8, goals: 1, assists: 2 },
  { match: "M7", rating: 8.5, goals: 2, assists: 1 },
  { match: "M8", rating: 7.1, goals: 0, assists: 1 },
  { match: "M9", rating: 7.9, goals: 1, assists: 0 },
  { match: "M10", rating: 8.2, goals: 2, assists: 1 },
];

const last5Matches = [
  { match: "vs Elang Jaya", rating: 8.2, result: "W" as const },
  { match: "vs Rajawali United", rating: 7.9, result: "W" as const },
  { match: "vs Banteng FC", rating: 7.1, result: "D" as const },
  { match: "vs Harimau FC", rating: 8.5, result: "W" as const },
  { match: "vs Singa Putih", rating: 6.4, result: "L" as const },
];

const avgRating = (last5Matches.reduce((s, m) => s + m.rating, 0) / last5Matches.length).toFixed(1);

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-sm px-3 py-2 relative z-0 border border-border/30">
      <p className="text-[9px] font-montserrat font-bold text-muted-foreground uppercase relative z-10">{label}</p>
      <p className="text-sm font-oswald font-bold text-neon-green relative z-10">{payload[0].value.toFixed(1)}</p>
    </div>
  );
};

/* ─── Main Page ─── */
const MatchStatistics = () => {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-neon-red/20 neon-border-red flex items-center justify-center border">
            <Activity className="w-4 h-4 text-neon-red" />
          </div>
          <div>
            <span className="text-xs font-oswald font-bold text-foreground uppercase tracking-[0.12em] block leading-none">Match Statistics</span>
            <span className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">Season 2024/25</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 space-y-6">
        {/* Player Header */}
        <div className="glass-card-gradient rounded-lg p-4 relative z-0 animate-fade-in">
          <div className="relative z-10 flex items-center gap-4">
            <PlayerAvatarFrame src={playerAhmad} name="Ahmad Rizki" size="lg" variant="green" />
            <div>
              <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wide">Ahmad Rizki</h2>
              <p className="text-[11px] font-montserrat font-medium text-muted-foreground">Garuda Muda FC • AMF</p>
              <div className="flex items-center gap-3 mt-2">
                <div>
                  <span className="text-xl font-oswald font-bold text-neon-green neon-glow-green">{avgRating}</span>
                  <p className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase">Avg Rating</p>
                </div>
                <div className="w-[1px] h-8 bg-border/30" />
                <div>
                  <span className="text-xl font-oswald font-bold text-foreground">10</span>
                  <p className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase">Matches</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Radial Stats */}
        <DashboardPanel title="Season Stats">
          <div className="grid grid-cols-4 gap-2">
            <RadialProgress value={847} max={900} label="Minutes" icon={Timer} color="brand" size={80} />
            <RadialProgress value={10} max={15} label="Goals" icon={Target} color="red" size={80} />
            <RadialProgress value={7} max={10} label="Assists" icon={Handshake} color="green" size={80} />
            <RadialProgress value={82} max={100} label="Fair Play" icon={Shield} color="green" size={80} />
          </div>
        </DashboardPanel>

        {/* Fair Play */}
        <DashboardPanel title="Discipline">
          <FairPlayIndicator cards={{ yellow: 1, red: 0 }} />
        </DashboardPanel>

        {/* Performance Timeline */}
        <DashboardPanel title="Performance Timeline">
          <div className="glass-card-gradient rounded-lg p-4 relative z-0">
            <div className="relative z-10 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--neon-green))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--neon-green))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="match"
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "Montserrat" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[5, 10]}
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "Oswald" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="hsl(var(--neon-green))"
                    strokeWidth={2}
                    fill="url(#ratingGradient)"
                    dot={{ r: 3, fill: "hsl(var(--neon-green))", stroke: "hsl(var(--navy-deep))", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "hsl(var(--neon-green))", stroke: "hsl(var(--neon-green))", strokeWidth: 2, filter: "drop-shadow(0 0 6px hsla(var(--neon-green)/0.6))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DashboardPanel>

        {/* Last 5 Match Ratings */}
        <DashboardPanel title="Last 5 Matches">
          <div className="space-y-2">
            {last5Matches.map((m, i) => (
              <MatchRatingCard key={m.match} {...m} delay={i * 80} />
            ))}
          </div>
        </DashboardPanel>

        {/* Stat Breakdown */}
        <DashboardPanel title="Detailed Breakdown">
          <div className="glass-card-gradient rounded-lg p-4 relative z-0">
            <div className="relative z-10 space-y-3">
              {[
                { label: "Shot Accuracy", value: 72 },
                { label: "Pass Completion", value: 85 },
                { label: "Dribble Success", value: 68 },
                { label: "Aerial Duels Won", value: 45 },
                { label: "Tackles Won", value: 58 },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-montserrat font-medium text-muted-foreground w-28">{stat.label}</span>
                  <div className="flex-1 h-1.5 bg-secondary/50 rounded-sm overflow-hidden inner-shadow">
                    <div
                      className={cn("h-full rounded-sm transition-all duration-1000 ease-out",
                        stat.value >= 75 ? "bg-neon-green" : stat.value >= 50 ? "gradient-line" : "bg-neon-red"
                      )}
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-oswald font-bold text-foreground w-8 text-right">{stat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardPanel>
      </main>

      <BottomNav />
    </div>
  );
};

export default MatchStatistics;
