import { Home, UserPlus, CreditCard, BarChart3, Search } from "lucide-react";
import { useState } from "react";

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-glass-border/60">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActive(i)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded transition-all duration-200 ${
              active === i
                ? "text-neon-red"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-montserrat font-semibold uppercase tracking-wider">{item.label}</span>
            {active === i && (
              <div className="w-4 h-[2px] gradient-line rounded-full mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
