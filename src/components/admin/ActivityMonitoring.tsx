import React, { useState } from "react";
import {
  Search,
  Clock,
  LogIn,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface LoginEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  ipAddress: string;
  device: string;
  location: string;
  status: "success" | "failed" | "suspicious";
  reason?: string;
  userAgent?: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: "login" | "logout" | "role_change" | "permission_change" | "data_access" | "2fa_enabled" | "2fa_disabled";
  details: string;
  affectedUser?: string;
  previousValue?: string;
  newValue?: string;
  status: "success" | "pending" | "failed";
}

// ==================== MOCK DATA ====================

const mockLoginEvents: LoginEvent[] = [
  {
    id: "login_001",
    timestamp: "2026-02-27 16:32:15",
    userId: "user_001",
    userName: "Budi Santoso",
    ipAddress: "192.168.1.100",
    device: "Windows - Chrome",
    location: "Jakarta",
    status: "success",
    userAgent: "Chrome 123.0 on Windows 10",
  },
  {
    id: "login_002",
    timestamp: "2026-02-27 15:45:00",
    userId: "user_003",
    userName: "Ahmad Wijaya",
    ipAddress: "203.0.113.10",
    device: "Mobile - Safari",
    location: "Bandung",
    status: "suspicious",
    reason: "Login from new location",
  },
  {
    id: "login_003",
    timestamp: "2026-02-27 14:20:30",
    userId: "user_010",
    userName: "Hari Saputra",
    ipAddress: "192.168.1.50",
    device: "Desktop - Firefox",
    location: "Jakarta",
    status: "success",
    userAgent: "Firefox 124.0 on Windows 10",
  },
  {
    id: "login_004",
    timestamp: "2026-02-27 13:15:00",
    userId: "user_005",
    userName: "Eka Prasetya",
    ipAddress: "198.51.100.5",
    device: "Unknown - Unknown",
    location: "Unknown",
    status: "failed",
    reason: "Invalid credentials",
  },
  {
    id: "login_005",
    timestamp: "2026-02-27 11:50:45",
    userId: "user_002",
    userName: "Siti Nurhaliza",
    ipAddress: "192.168.1.101",
    device: "MacBook - Safari",
    location: "Jakarta",
    status: "success",
    userAgent: "Safari on macOS 14.3",
  },
  {
    id: "login_006",
    timestamp: "2026-02-26 22:30:00",
    userId: "user_009",
    userName: "Gita Maharani",
    ipAddress: "203.0.113.50",
    device: "Mobile - Chrome",
    location: "Unknown",
    status: "suspicious",
    reason: "Failed authentication attempts followed by success",
  },
  {
    id: "login_007",
    timestamp: "2026-02-26 16:45:20",
    userId: "user_017",
    userName: "Olivia Handoko",
    ipAddress: "203.0.113.30",
    device: "Mobile - Safari",
    location: "Jakarta",
    status: "suspicious",
    reason: "Multiple failed attempts (3x)",
  },
];

const mockActivityLogs: ActivityLog[] = [
  {
    id: "activity_001",
    timestamp: "2026-02-27 15:32:00",
    userId: "user_001",
    userName: "Budi Santoso",
    action: "role_change",
    details: "Changed user role from Data Operator to Match Commissioner",
    affectedUser: "Pandu Hermawan",
    previousValue: "data_operator",
    newValue: "match_commissioner",
    status: "success",
  },
  {
    id: "activity_002",
    timestamp: "2026-02-27 14:15:00",
    userId: "user_002",
    userName: "Siti Nurhaliza",
    action: "2fa_enabled",
    details: "Enabled 2FA with authenticator method",
    status: "success",
  },
  {
    id: "activity_003",
    timestamp: "2026-02-27 13:20:00",
    userId: "user_001",
    userName: "Budi Santoso",
    action: "permission_change",
    details: "Enabled tournament setup module for Provincial Admin",
    status: "success",
  },
  {
    id: "activity_004",
    timestamp: "2026-02-27 11:45:00",
    userId: "user_003",
    userName: "Ahmad Wijaya",
    action: "data_access",
    details: "Accessed player management for Jawa Barat province",
    status: "success",
  },
  {
    id: "activity_005",
    timestamp: "2026-02-26 17:30:00",
    userId: "user_001",
    userName: "Budi Santoso",
    action: "role_change",
    details: "Suspended user account",
    affectedUser: "Olivia Handoko",
    previousValue: "active",
    newValue: "suspended",
    status: "success",
  },
  {
    id: "activity_006",
    timestamp: "2026-02-26 16:00:00",
    userId: "user_010",
    userName: "Hari Saputra",
    action: "data_access",
    details: "Attempted unauthorized access to admin settings",
    status: "failed",
  },
];

// ==================== COMPONENT ====================

const ActivityMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"logins" | "activity">("logins");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLoginEvents = mockLoginEvents.filter((event) => {
    const matchesSearch =
      event.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ipAddress.includes(searchQuery) ||
      event.device.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredActivityLogs = mockActivityLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.affectedUser?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const suspiciousLogins = mockLoginEvents.filter((e) => e.status === "suspicious");
  const failedLogins = mockLoginEvents.filter((e) => e.status === "failed");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "suspicious":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-600/10 border-green-600/50 text-green-300";
      case "failed":
        return "bg-red-600/10 border-red-600/50 text-red-300";
      case "suspicious":
        return "bg-yellow-600/10 border-yellow-600/50 text-yellow-300";
      default:
        return "bg-slate-700/50 border-slate-600 text-slate-300";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
        return <LogIn className="w-4 h-4 text-blue-400" />;
      case "logout":
        return <LogOut className="w-4 h-4 text-slate-400" />;
      case "role_change":
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case "2fa_enabled":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "2fa_disabled":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "permission_change":
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleExportLogs = () => {
    const data =
      activeTab === "logins"
        ? filteredLoginEvents.map((e) => ({
            timestamp: e.timestamp,
            user: e.userName,
            ip: e.ipAddress,
            device: e.device,
            location: e.location,
            status: e.status,
          }))
        : filteredActivityLogs.map((l) => ({
            timestamp: l.timestamp,
            user: l.userName,
            action: l.action,
            details: l.details,
            status: l.status,
          }));

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map((row) =>
        Object.values(row)
          .map((v) => `"${v}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Logs exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="glass-card p-6 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user name or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="suspicious">Suspicious</option>
            </select>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition">
            <Download className="w-5 h-5" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab("logins")}
          className={`pb-4 px-2 text-sm font-medium transition relative ${
            activeTab === "logins" ? "text-blue-500" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Login History
          {activeTab === "logins" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`pb-4 px-2 text-sm font-medium transition relative ${
            activeTab === "activity" ? "text-blue-500" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Activity Logs
          {activeTab === "activity" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="glass-card border border-white/10 overflow-hidden">
        {activeTab === "logins" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    IP Address
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Device
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredLoginEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                      {event.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{event.userName}</div>
                      <div className="text-xs text-slate-400">{event.userId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{event.ipAddress}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{event.device}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{event.location}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          event.status === "success"
                            ? "bg-green-500/10 text-green-400"
                            : event.status === "failed"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {event.status === "success" ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : event.status === "failed" ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredActivityLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-slate-800/30 transition">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{log.userName}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs font-mono text-slate-400">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{log.details}</p>
                      <div className="flex items-center gap-4">
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] font-bold uppercase tracking-wider">
                          {log.action.replace("_", " ")}
                        </span>
                        {log.affectedUser && (
                          <span className="text-xs text-slate-400">
                            Affected User: <span className="text-slate-300">{log.affectedUser}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      log.status === "success"
                        ? "text-green-400"
                        : log.status === "failed"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {log.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityMonitoring;
