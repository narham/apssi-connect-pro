import { Home, CreditCard, ShieldCheck, BarChart3, LogIn } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: CreditCard, label: "Player Card", path: "/e-card" },
  { icon: ShieldCheck, label: "Verify", path: "/register" },
  { icon: BarChart3, label: "Statistics", path: "/stats" },
  { icon: LogIn, label: "Admin", path: "/login" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t-0">
        <div className="h-[1px] gradient-line opacity-40" />
        <div className="flex items-center justify-around py-2 px-1 max-w-2xl mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-sm micro-tap tap-glow-container",
                  "transition-colors duration-200",
                  isActive ? "text-neon-red" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-sm bg-neon-red/[0.08]" />
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
    </>
  );
};

export default BottomNav;
