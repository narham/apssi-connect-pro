import { useState, useRef, TouchEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import BottomNav from "@/components/BottomNav";
import cardBg from "@/assets/card-bg.png";
import playerAhmad from "@/assets/player-ahmad.png";
import playerBudi from "@/assets/player-budi.png";
import playerDimas from "@/assets/player-dimas.png";
import playerFajar from "@/assets/player-fajar.png";
import playerGalih from "@/assets/player-galih.png";

interface PlayerData {
  id: string;
  name: string;
  club: string;
  position: string;
  province: string;
  photo: string;
  status: "verified" | "pending" | "rejected";
}

const players: PlayerData[] = [
  { id: "APSSI-U12-2401", name: "Ahmad Rizki Pratama", club: "Garuda Muda FC", position: "Attacking Midfielder", province: "DKI Jakarta", photo: playerAhmad, status: "verified" },
  { id: "APSSI-U12-2402", name: "Budi Santoso", club: "Elang Jaya FC", position: "Striker", province: "Jawa Barat", photo: playerBudi, status: "verified" },
  { id: "APSSI-U12-2403", name: "Dimas Pratama", club: "Rajawali United", position: "Center Back", province: "Jawa Tengah", photo: playerDimas, status: "pending" },
  { id: "APSSI-U12-2404", name: "Fajar Nugroho", club: "Persija Junior", position: "Goalkeeper", province: "DKI Jakarta", photo: playerFajar, status: "verified" },
  { id: "APSSI-U12-2405", name: "Galih Permana", club: "Semen Padang Youth", position: "Right Winger", province: "Sumatera Barat", photo: playerGalih, status: "rejected" },
];

const IndonesiaFlag = () => (
  <div className="flex items-center gap-1.5">
    <div className="w-5 h-3.5 rounded-[2px] overflow-hidden border border-border/30 flex flex-col">
      <div className="flex-1 bg-neon-red" />
      <div className="flex-1 bg-foreground" />
    </div>
    <span className="text-[9px] font-montserrat font-semibold text-muted-foreground uppercase tracking-wider">IDN</span>
  </div>
);

const EPlayerCardItem = ({ player, isActive }: { player: PlayerData; isActive: boolean }) => {
  const borderClass = player.status === "verified" ? "neon-border-green" : player.status === "rejected" ? "neon-border-red" : "";

  return (
    <div
      className={cn(
        "w-[300px] flex-shrink-0 transition-all duration-500 ease-out snap-center",
        isActive ? "scale-100 opacity-100" : "scale-90 opacity-40"
      )}
    >
      <div className={cn("glass-card-gradient rounded-lg overflow-hidden relative z-0", borderClass)}>
        {/* BG texture */}
        <div className="absolute inset-0 opacity-15 z-0">
          <img src={cardBg} alt="" className="w-full h-full object-cover" />
        </div>

        {/* ── TOP: Photo + Name ── */}
        <div className="relative z-10 pt-5 px-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-montserrat font-bold text-muted-foreground uppercase tracking-[0.2em]">E-Player Card</span>
            <StatusBadge status={player.status} />
          </div>

          <div className="flex items-center gap-4">
            {/* Player Photo - Circular Frame with neon ring */}
            <div className={cn(
              "w-20 h-20 rounded-full overflow-hidden flex-shrink-0",
              player.status === "verified" ? "avatar-ring-green" : player.status === "rejected" ? "avatar-ring-red" : "ring-2 ring-yellow-500/50"
            )}>
              <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-oswald font-bold text-foreground uppercase tracking-wide leading-tight truncate">
                {player.name}
              </h3>
              <p className="text-[11px] font-montserrat font-medium text-muted-foreground mt-1">{player.club}</p>
              <div className="mt-2">
                <IndonesiaFlag />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-[1px] gradient-line opacity-40" />

        {/* ── MIDDLE: Club | Position | Age ── */}
        <div className="relative z-10 px-5 py-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider mb-1">Position</p>
              <p className="text-[11px] font-oswald font-bold text-neon-green uppercase leading-tight">{player.position}</p>
            </div>
            <div className="text-center border-x border-border/20">
              <p className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider mb-1">Age Group</p>
              <p className="text-[11px] font-oswald font-bold text-neon-red uppercase">KU-12</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider mb-1">Province</p>
              <p className="text-[11px] font-oswald font-bold text-foreground uppercase leading-tight">{player.province}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-[1px] gradient-line opacity-40" />

        {/* ── BOTTOM: QR + Player ID ── */}
        <div className="relative z-10 px-5 py-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-sm bg-foreground p-1.5 flex-shrink-0">
            <QRCodeSVG
              value={`https://apssi-connect.id/player/${player.id}`}
              size={52}
              bgColor="hsl(210, 40%, 95%)"
              fgColor="hsl(216, 72%, 14%)"
              level="M"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-[0.15em]">Player ID</p>
            <p className="text-sm font-oswald font-bold text-foreground tracking-wider mt-0.5">{player.id}</p>
            <p className="text-[8px] font-montserrat font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">
              Season 2024/2025 • APSSI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ECardDashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left" && currentIndex < players.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === "right" && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      handleSwipe(diff > 0 ? "left" : "right");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-neon-green/20 neon-border-green flex items-center justify-center border">
            <span className="text-[10px] font-oswald font-black text-neon-green">ID</span>
          </div>
          <div>
            <span className="text-xs font-oswald font-bold text-foreground uppercase tracking-[0.12em] block leading-none">E-Player Cards</span>
            <span className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">Digital Identity</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-montserrat font-bold text-neon-green">{players.length}</span>
          <span className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase">Cards</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto pt-6">
        {/* Swipe Counter */}
        <div className="px-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wide">
              Player <span className="text-gradient-brand">{String(currentIndex + 1).padStart(2, "0")}</span>
              <span className="text-muted-foreground">/{String(players.length).padStart(2, "0")}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwipe("right")}
              disabled={currentIndex === 0}
              className={cn("w-8 h-8 rounded-sm glass-card flex items-center justify-center micro-tap relative z-0", currentIndex === 0 && "opacity-30")}
            >
              <ChevronLeft className="w-4 h-4 text-foreground relative z-10" />
            </button>
            <button
              onClick={() => handleSwipe("left")}
              disabled={currentIndex === players.length - 1}
              className={cn("w-8 h-8 rounded-sm glass-card flex items-center justify-center micro-tap relative z-0", currentIndex === players.length - 1 && "opacity-30")}
            >
              <ChevronRight className="w-4 h-4 text-foreground relative z-10" />
            </button>
          </div>
        </div>

        {/* Card Carousel */}
        <div
          className="overflow-hidden px-4"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          ref={scrollRef}
        >
          <div
            className="flex transition-transform duration-500 ease-out gap-4"
            style={{ transform: `translateX(calc(-${currentIndex * 316}px))` }}
          >
            {players.map((player, i) => (
              <EPlayerCardItem key={player.id} player={player} isActive={i === currentIndex} />
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {players.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentIndex ? "w-6 gradient-line" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Summary Stats */}
        <div className="px-4 mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Verified", count: players.filter(p => p.status === "verified").length, color: "text-neon-green neon-glow-green" },
            { label: "Pending", count: players.filter(p => p.status === "pending").length, color: "text-yellow-400" },
            { label: "Rejected", count: players.filter(p => p.status === "rejected").length, color: "text-neon-red neon-glow-red" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-lg p-3 text-center relative z-0">
              <div className={cn("text-2xl font-oswald font-bold relative z-10", s.color)}>{s.count}</div>
              <div className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider mt-1 relative z-10">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Swipe hint */}
        <p className="text-center text-[10px] font-montserrat font-medium text-muted-foreground/50 mt-4 uppercase tracking-widest">
          ← Swipe to browse cards →
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default ECardDashboard;
