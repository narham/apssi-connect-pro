import { FileText, Download, Calendar, BarChart3, Users, Trophy, Filter } from "lucide-react";

const reports = [
  { title: "Monthly Player Registration Report", type: "Registration", date: "Feb 2026", status: "ready", size: "2.4 MB" },
  { title: "Tournament Season Summary Q1", type: "Tournament", date: "Jan 2026", status: "ready", size: "5.1 MB" },
  { title: "Provincial Distribution Analysis", type: "Analytics", date: "Feb 2026", status: "generating", size: "—" },
  { title: "Player Verification Audit Log", type: "Audit", date: "Feb 2026", status: "ready", size: "1.8 MB" },
  { title: "Scout Activity & Coverage Report", type: "Scout", date: "Jan 2026", status: "ready", size: "3.2 MB" },
  { title: "Fair Play & Discipline Summary", type: "Discipline", date: "Feb 2026", status: "ready", size: "1.1 MB" },
];

const typeIcons: Record<string, typeof FileText> = {
  Registration: Users,
  Tournament: Trophy,
  Analytics: BarChart3,
  Audit: FileText,
  Scout: FileText,
  Discipline: FileText,
};

const AdminReports = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Report Center</h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">Generate and download operational reports</p>
        </div>
        <button className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
          <FileText className="w-4 h-4" /> Generate Report
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground micro-hover relative z-0">
          <Calendar className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Date Range</span>
        </button>
        <button className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground micro-hover relative z-0">
          <Filter className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Type</span>
        </button>
      </div>

      <div className="space-y-3">
        {reports.map((report) => {
          const Icon = typeIcons[report.type] || FileText;
          return (
            <div key={report.title} className="glass-card rounded-lg p-4 flex items-center justify-between gap-4 micro-hover relative z-0">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-sm font-montserrat font-semibold text-foreground">{report.title}</h3>
                  <p className="text-[10px] font-montserrat text-muted-foreground">
                    {report.type} • {report.date} • {report.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 relative z-10">
                {report.status === "generating" ? (
                  <span className="text-[10px] font-montserrat font-bold text-accent animate-pulse-neon">Generating...</span>
                ) : (
                  <button className="flex items-center gap-1.5 glass-card rounded-lg px-3 py-1.5 text-[10px] font-montserrat font-bold text-foreground hover:text-accent micro-hover relative z-0">
                    <Download className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Download</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminReports;
