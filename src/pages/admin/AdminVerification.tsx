import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, Camera, User } from "lucide-react";

const verificationRequests = [
  {
    id: "VER-001", name: "Rizki Fauzan", club: "Garuda Muda FC", type: "New Registration",
    documents: ["ID Card", "Birth Certificate", "Photo"], status: "pending", priority: "normal",
    submitted: "2026-02-28 09:15", age: 16,
  },
  {
    id: "VER-002", name: "Andi Pratama", club: "Elang Jaya", type: "Document Update",
    documents: ["ID Card", "Transfer Letter"], status: "pending", priority: "normal",
    submitted: "2026-02-28 08:42", age: 17,
  },
  {
    id: "VER-003", name: "Dimas Arya", club: "Rajawali United", type: "Age Verification",
    documents: ["Birth Certificate", "School ID"], status: "urgent", priority: "high",
    submitted: "2026-02-27 14:20", age: 15,
  },
  {
    id: "VER-004", name: "Budi Hartono", club: "Banteng FC", type: "Transfer Request",
    documents: ["Transfer Letter", "Release Form", "ID Card"], status: "review", priority: "normal",
    submitted: "2026-02-27 11:05", age: 18,
  },
];

const verificationStats = [
  { label: "Total Pending", value: "43", icon: Clock, color: "text-muted-foreground" },
  { label: "Approved Today", value: "12", icon: CheckCircle2, color: "text-accent" },
  { label: "Rejected Today", value: "3", icon: XCircle, color: "text-destructive" },
  { label: "Urgent", value: "5", icon: AlertTriangle, color: "text-destructive" },
];

const AdminVerification = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Verification Center</h1>
        <p className="text-xs font-montserrat text-muted-foreground mt-1">Review and approve player identity documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {verificationStats.map((stat) => (
          <div key={stat.label} className="glass-card-gradient rounded-lg p-4 micro-hover relative z-0">
            <div className="relative z-10 flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-oswald font-bold text-foreground">{stat.value}</p>
                <p className="text-[9px] font-montserrat font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {verificationRequests.map((req) => (
          <div key={req.id} className="glass-card rounded-lg p-5 micro-hover relative z-0">
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-oswald font-bold text-foreground uppercase">{req.name}</h3>
                      <span className="text-[9px] font-montserrat font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {req.id}
                      </span>
                      {req.priority === "high" && (
                        <span className="text-[9px] font-montserrat font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-montserrat text-muted-foreground mt-0.5">
                      {req.club} • {req.type} • Age: {req.age}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {req.documents.map((doc) => (
                        <span key={doc} className="flex items-center gap-1 text-[9px] font-montserrat font-medium text-foreground bg-muted/40 px-2 py-1 rounded">
                          <FileText className="w-3 h-3 text-muted-foreground" /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-montserrat text-muted-foreground">{req.submitted}</span>
                  <button className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider micro-hover">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider micro-hover">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminVerification;
