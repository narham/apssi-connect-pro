import heroPlayer from "@/assets/hero-player.png";
import StatusBadge from "./StatusBadge";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="relative h-[260px] md:h-[340px]">
        <img
          src={heroPlayer}
          alt="Young football player in action"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-8 gradient-line" />
            <StatusBadge status="live" />
          </div>
          <h1 className="text-3xl md:text-4xl font-oswald font-black text-foreground uppercase leading-none tracking-tight">
            APSSI
          </h1>
          <h1 className="text-3xl md:text-4xl font-oswald font-black uppercase leading-none tracking-tight text-gradient-brand mt-1">
            CONNECT
          </h1>
          <p className="text-[11px] font-montserrat font-medium text-muted-foreground mt-3 max-w-xs leading-relaxed">
            National Youth Football Competition<br />
            <span className="text-foreground/70">KU-12 • Born 2014 • Player Registration & Scouting</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
