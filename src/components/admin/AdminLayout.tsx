import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search } from "lucide-react";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="glass-panel sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-border">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="hidden md:flex items-center gap-2 glass-card rounded-lg px-3 py-1.5 relative z-0">
                <Search className="w-3.5 h-3.5 text-muted-foreground relative z-10" />
                <input
                  type="text"
                  placeholder="Search players, clubs, matches..."
                  className="bg-transparent border-none outline-none text-xs font-montserrat text-foreground placeholder:text-muted-foreground w-64 relative z-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button className="w-8 h-8 glass-card rounded-lg flex items-center justify-center micro-hover relative z-0">
                  <Bell className="w-4 h-4 text-muted-foreground relative z-10" />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-montserrat font-bold text-destructive-foreground">3</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-[10px] font-oswald font-bold text-accent">SA</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-montserrat font-semibold text-foreground leading-none">Super Admin</p>
                  <p className="text-[10px] font-montserrat text-muted-foreground">APSSI HQ</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
