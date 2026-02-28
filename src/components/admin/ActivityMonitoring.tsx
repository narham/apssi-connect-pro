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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Activity Monitoring</h1>
          <p className="text-slate-400">Track login history and user activities</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 border border-white/10">
            <p className="text-slate-400 text-sm mb-2">Total Logins (24h)</p>
            <p className="text-2xl font-bold text-white">{mockLoginEvents.length}</p>
          </div>
          <div className="glass-card p-4 border border-yellow-600/50">
            <p className="text-slate-400 text-sm mb-2">Suspicious Logins</p>
            <p className="text-2xl font-bold text-yellow-300">{suspiciousLogins.length}</p>
          </div>
          <div className="glass-card p-4 border border-red-600/50">
            <p className="text-slate-400 text-sm mb-2">Failed Logins</p>
            <p className="text-2xl font-bold text-red-300">{failedLogins.length}</p>
          </div>
          <div className="glass-card p-4 border border-white/10">
            <p className="text-slate-400 text-sm mb-2">Activities (24h)</p>
            <p className="text-2xl font-bold text-white">{mockActivityLogs.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card border border-white/10 mb-6 overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("logins")}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === "logins"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login History ({mockLoginEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === "activity"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Activities ({mockActivityLogs.length})
            </button>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-white/10 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, IP, or device..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                {activeTab === "logins" ? (
                  <>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="suspicious">Suspicious</option>
                  </>
                ) : (
                  <>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </>
                )}
              </select>

              <button
                onClick={handleExportLogs}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="divide-y divide-white/10">
            {activeTab === "logins" ? (
              filteredLoginEvents.length > 0 ? (
                filteredLoginEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-6 hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">{getStatusIcon(event.status)}</div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{event.userName}</p>
                          <p className="text-sm text-slate-400">{event.timestamp}</p>
                          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-slate-400">IP Address</p>
                              <p className="text-white font-mono">{event.ipAddress}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Device</p>
                              <p className="text-white">{event.device}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Location</p>
                              <p className="text-white">{event.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                        {event.reason && ` - ${event.reason}`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400">
                  No login events found
                </div>
              )
            ) : filteredActivityLogs.length > 0 ? (
              filteredActivityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-6 hover:bg-slate-800/30 transition cursor-pointer"
                  onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getActionIcon(log.action)}</div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{log.userName}</p>
                        <p className="text-sm text-slate-400">{log.timestamp}</p>
                        <p className="text-white mt-2">{log.details}</p>
                        {log.affectedUser && (
                          <p className="text-sm text-slate-300 mt-2">
                            Affected User: <span className="font-medium">{log.affectedUser}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {log.status}
                    </span>
                  </div>

                  {expandedLogId === log.id && log.previousValue && (
                    <div className="mt-4 pt-4 border-t border-white/10 bg-slate-800/30 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-slate-400 mb-1">Previous Value</p>
                          <p className="text-white font-mono text-sm bg-slate-900/50 p-2 rounded">
                            {log.previousValue}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400 mb-1">New Value</p>
                          <p className="text-white font-mono text-sm bg-slate-900/50 p-2 rounded">
                            {log.newValue}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                No activity logs found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMonitoring;
