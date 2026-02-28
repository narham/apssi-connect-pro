import heroPlayer from "@/assets/hero-player.png";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Hero Image */}
      <div className="relative h-[280px] md:h-[360px]">
        <img
          src={heroPlayer}
          alt="Young football player"
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[2px] w-8 gradient-line" />
            <span className="text-[10px] font-montserrat font-bold text-accent uppercase tracking-[0.2em]">
              KU-12 • Born 2014
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-oswald font-black text-foreground uppercase leading-tight">
            APSSI<br />
            <span className="text-gradient-brand">CONNECT</span>
          </h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-2 max-w-xs">
            National Youth Football Competition — Player Registration & Scouting Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
