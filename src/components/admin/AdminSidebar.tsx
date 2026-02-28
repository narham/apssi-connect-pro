import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BarChart3,
  Building2,
  Eye,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Players", url: "/admin/players", icon: Users },
  { title: "Verification", url: "/admin/verification", icon: ShieldCheck },
  { title: "Statistics", url: "/admin/statistics", icon: BarChart3 },
  { title: "Clubs", url: "/admin/clubs", icon: Building2 },
  { title: "Scouts", url: "/admin/scouts", icon: Eye },
  { title: "Reports", url: "/admin/reports", icon: FileText },
];

const systemNav = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 shrink-0 rounded-sm bg-destructive/20 neon-border-red flex items-center justify-center border">
            <span className="text-[10px] font-oswald font-black text-destructive">AC</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-xs font-oswald font-bold text-foreground uppercase tracking-[0.12em] block leading-none">
                APSSI Connect
              </span>
              <span className="text-[8px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-destructive/10 text-destructive font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="font-montserrat text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-montserrat font-bold text-muted-foreground uppercase tracking-widest">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="hover:bg-muted/50"
                      activeClassName="bg-destructive/10 text-destructive font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="font-montserrat text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="glass-card rounded-lg p-3 relative z-0">
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-[10px] font-oswald font-bold text-accent">SA</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-montserrat font-semibold text-foreground truncate">Super Admin</p>
                <p className="text-[10px] font-montserrat text-muted-foreground">Full Access</p>
              </div>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
