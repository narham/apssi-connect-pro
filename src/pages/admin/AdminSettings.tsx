import { Settings, Shield, Bell, Globe, Database, Lock } from "lucide-react";

const settingsSections = [
  {
    title: "Access Control",
    icon: Shield,
    items: [
      { label: "Super Admin accounts", value: "2 active" },
      { label: "Provincial Admin accounts", value: "8 active" },
      { label: "Match Commissioner accounts", value: "14 active" },
      { label: "Data Operator accounts", value: "10 active" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Email notifications", value: "Enabled" },
      { label: "Verification alerts", value: "Immediate" },
      { label: "Report generation alerts", value: "Daily digest" },
    ],
  },
  {
    title: "System",
    icon: Database,
    items: [
      { label: "Database status", value: "Online" },
      { label: "Last backup", value: "2026-02-28 03:00" },
      { label: "Storage used", value: "12.4 GB / 50 GB" },
      { label: "API rate limit", value: "1000 req/min" },
    ],
  },
];

const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">System Settings</h1>
        <p className="text-xs font-montserrat text-muted-foreground mt-1">Configure admin panel and system preferences</p>
      </div>

      <div className="space-y-4">
        {settingsSections.map((section) => (
          <div key={section.title} className="glass-card rounded-lg p-5 relative z-0">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-5 h-5 text-destructive" />
                <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-xs font-montserrat text-foreground">{item.label}</span>
                    <span className="text-xs font-montserrat font-semibold text-muted-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
