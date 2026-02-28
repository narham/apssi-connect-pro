import { Home, UserPlus, CreditCard, BarChart3, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: UserPlus, label: "Register" },
  { icon: CreditCard, label: "E-Card" },
  { icon: BarChart3, label: "Stats" },
  { icon: Search, label: "Scout" },
];

const BottomNav = () => {
  const [active, setActive] = useState(0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t-0">
      {/* Top gradient line */}
      <div className="h-[1px] gradient-line opacity-40" />

      <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto safe-area-bottom">
        {navItems.map((item, i) => {
          const isActive = active === i;
          return (
            <button
              key={item.label}
              onClick={() => setActive(i)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-sm micro-tap",
                "transition-colors duration-200",
                isActive ? "text-neon-red" : "text-muted-foreground"
              )}
            >
              {/* Active glow background */}
              {isActive && (
                <div className="absolute inset-0 rounded-sm bg-neon-red/8" />
              )}

              <item.icon className={cn("w-5 h-5 relative z-10 transition-all duration-200", isActive && "drop-shadow-[0_0_6px_hsla(349,100%,55%,0.5)]")} />
              <span className="text-[9px] font-montserrat font-semibold uppercase tracking-wider relative z-10">{item.label}</span>

              {isActive && (
                <div className="w-5 h-[2px] gradient-line rounded-full mt-0.5 relative z-10" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
