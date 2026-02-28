import React, { useState } from "react";
import {
  Search,
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Smartphone,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface LoginRecord {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: "success" | "failed" | "suspicious";
  location?: string;
  browser?: string;
}

interface SecuritySettings {
  id: string;
  userId: string;
  userName: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: "authenticator" | "sms" | "email" | "none";
  ipWhitelist: string[];
  sessionTimeout: number;
  passwordExpiryDays: number;
  requirePasswordChange: boolean;
  lastPasswordChange: string;
  suspiciousLogins: LoginRecord[];
  loginHistory: LoginRecord[];
  deviceTrustList: string[];
}

// ==================== MOCK DATA ====================

const mockSecuritySettings: SecuritySettings[] = [
  {
    id: "sec_001",
    userId: "user_001",
    userName: "Budi Santoso",
    twoFactorEnabled: true,
    twoFactorMethod: "authenticator",
    ipWhitelist: ["192.168.1.100", "10.0.0.0/8"],
    sessionTimeout: 60,
    passwordExpiryDays: 90,
    requirePasswordChange: false,
    lastPasswordChange: "2026-02-01",
    suspiciousLogins: [],
    loginHistory: [
      {
        id: "login_001",
        timestamp: "2026-02-27 14:32:00",
        ipAddress: "192.168.1.100",
        device: "Windows - Chrome",
        status: "success",
        location: "Jakarta",
        browser: "Chrome 123.0",
      },
      {
        id: "login_002",
        timestamp: "2026-02-26 09:15:00",
        ipAddress: "192.168.1.100",
        device: "Windows - Chrome",
        status: "success",
        location: "Jakarta",
        browser: "Chrome 123.0",
      },
    ],
    deviceTrustList: ["Windows - Chrome", "Mobile - Safari"],
  },
  {
    id: "sec_002",
    userId: "user_003",
    userName: "Ahmad Wijaya",
    twoFactorEnabled: true,
    twoFactorMethod: "sms",
    ipWhitelist: ["10.50.0.0/16"],
    sessionTimeout: 45,
    passwordExpiryDays: 90,
    requirePasswordChange: false,
    lastPasswordChange: "2026-02-10",
    suspiciousLogins: [
      {
        id: "susp_001",
        timestamp: "2026-02-25 22:45:00",
        ipAddress: "203.0.113.10",
        device: "Unknown - Unknown",
        status: "suspicious",
        location: "Bandung",
        browser: "Unknown",
      },
    ],
    loginHistory: [
      {
        id: "login_003",
        timestamp: "2026-02-27 12:20:00",
        ipAddress: "10.50.15.42",
        device: "Windows - Chrome",
        status: "success",
        location: "Bandung",
        browser: "Chrome 123.0",
      },
      {
        id: "login_004",
        timestamp: "2026-02-25 22:45:00",
        ipAddress: "203.0.113.10",
        device: "Unknown Device",
        status: "suspicious",
        location: "Unknown",
        browser: "Unknown",
      },
    ],
    deviceTrustList: ["Windows - Chrome", "Mobile - Safari"],
  },
  {
    id: "sec_003",
    userId: "user_005",
    userName: "Eka Prasetya",
    twoFactorEnabled: false,
    twoFactorMethod: "none",
    ipWhitelist: [],
    sessionTimeout: 45,
    passwordExpiryDays: 60,
    requirePasswordChange: true,
    lastPasswordChange: "2026-01-15",
    suspiciousLogins: [
      {
        id: "susp_002",
        timestamp: "2026-02-25 09:20:00",
        ipAddress: "192.168.50.1",
        device: "Mobile - Safari",
        status: "suspicious",
        location: "Bandung",
        browser: "Safari",
      },
    ],
    loginHistory: [
      {
        id: "login_005",
        timestamp: "2026-02-26 15:45:00",
        ipAddress: "10.50.25.88",
        device: "Windows - Chrome",
        status: "success",
        location: "Bandung",
        browser: "Chrome 123.0",
      },
      {
        id: "login_006",
        timestamp: "2026-02-25 09:20:00",
        ipAddress: "192.168.50.1",
        device: "Mobile - Safari",
        status: "suspicious",
        location: "Bandung",
        browser: "Safari",
      },
    ],
    deviceTrustList: [],
  },
];

// ==================== COMPONENT ====================

const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings[]>(mockSecuritySettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<SecuritySettings | null>(settings[0]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"authenticator" | "sms" | "email">(
    "authenticator"
  );
  const [ipAddress, setIpAddress] = useState("");
  const [showAddIpModal, setShowAddIpModal] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);

  const filteredSettings = settings.filter((s) =>
    s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEnableTwoFactor = () => {
    if (!selectedUser) return;

    const updatedSettings = settings.map((s) =>
      s.id === selectedUser.id
        ? {
            ...s,
            twoFactorEnabled: true,
            twoFactorMethod: twoFactorMethod,
          }
        : s
    );

    setSettings(updatedSettings);
    setSelectedUser(updatedSettings.find((s) => s.id === selectedUser.id) || null);
    toast.success("Two-factor authentication enabled");
    setShowTwoFactorModal(false);
  };

  const handleDisableTwoFactor = () => {
    if (!selectedUser) return;

    const updatedSettings = settings.map((s) =>
      s.id === selectedUser.id
        ? {
            ...s,
            twoFactorEnabled: false,
            twoFactorMethod: "none",
          }
        : s
    );

    setSettings(updatedSettings);
    setSelectedUser(updatedSettings.find((s) => s.id === selectedUser.id) || null);
    toast.success("Two-factor authentication disabled");
  };

  const handleAddIpAddress = () => {
    if (!selectedUser || !ipAddress.trim()) {
      toast.error("Please enter an IP address");
      return;
    }

    if (selectedUser.ipWhitelist.includes(ipAddress)) {
      toast.error("This IP address is already whitelisted");
      return;
    }

    const updatedSettings = settings.map((s) =>
      s.id === selectedUser.id
        ? {
            ...s,
            ipWhitelist: [...s.ipWhitelist, ipAddress],
          }
        : s
    );

    setSettings(updatedSettings);
    setSelectedUser(updatedSettings.find((s) => s.id === selectedUser.id) || null);
    setIpAddress("");
    setShowAddIpModal(false);
    toast.success("IP address whitelisted");
  };

  const handleRemoveIpAddress = (ip: string) => {
    if (!selectedUser) return;

    const updatedSettings = settings.map((s) =>
      s.id === selectedUser.id
        ? {
            ...s,
            ipWhitelist: s.ipWhitelist.filter((i) => i !== ip),
          }
        : s
    );

    setSettings(updatedSettings);
    setSelectedUser(updatedSettings.find((s) => s.id === selectedUser.id) || null);
    toast.success("IP address removed");
  };

  const handleTrustDevice = (device: string) => {
    if (!selectedUser) return;

    if (selectedUser.deviceTrustList.includes(device)) {
      toast.error("This device is already trusted");
      return;
    }

    const updatedSettings = settings.map((s) =>
      s.id === selectedUser.id
        ? {
            ...s,
            deviceTrustList: [...s.deviceTrustList, device],
          }
        : s
    );

    setSettings(updatedSettings);
    setSelectedUser(updatedSettings.find((s) => s.id === selectedUser.id) || null);
    toast.success("Device trusted");
  };

  const handleRemoveTrustedDevice = (device: string) => {
    if (!selectedUser) return;

    const updatedSettings = settings.map((s) =>
      s.id === selectedUser.id
        ? {
            ...s,
            deviceTrustList: s.deviceTrustList.filter((d) => d !== device),
          }
        : s
    );

    setSettings(updatedSettings);
    setSelectedUser(updatedSettings.find((s) => s.id === selectedUser.id) || null);
    toast.success("Device removed from trusted list");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
          <p className="text-slate-400">Manage 2FA, login history, and security alerts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="glass-card border border-white/10 overflow-hidden h-fit">
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
              {filteredSettings.map((setting) => (
                <button
                  key={setting.id}
                  onClick={() => setSelectedUser(setting)}
                  className={`w-full text-left px-4 py-3 transition ${
                    selectedUser?.id === setting.id
                      ? "bg-blue-600/20 border-l-2 border-blue-500"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <p className="text-sm font-medium text-white">{setting.userName}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {setting.twoFactorEnabled ? "✓ 2FA Enabled" : "✗ 2FA Disabled"}
                  </p>
                  {setting.suspiciousLogins.length > 0 && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {setting.suspiciousLogins.length} suspicious
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Details */}
          {selectedUser && (
            <div className="lg:col-span-2 space-y-6">
              {/* User Header */}
              <div className="glass-card p-6 border border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUser.userName}</h2>
                  <p className="text-sm text-slate-400 mt-1">User ID: {selectedUser.userId}</p>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="glass-card p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Two-Factor Authentication
                  </h3>
                  {selectedUser.twoFactorEnabled ? (
                    <button
                      onClick={handleDisableTwoFactor}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowTwoFactorModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
                    >
                      Enable 2FA
                    </button>
                  )}
                </div>

                {selectedUser.twoFactorEnabled ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-600/10 border border-green-600/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">2FA Active</p>
                        <p className="text-sm text-green-300/70">
                          Method: {selectedUser.twoFactorMethod.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-red-600/10 border border-red-600/50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-white font-medium">2FA Disabled</p>
                      <p className="text-sm text-red-300/70">
                        Enable 2FA for enhanced security
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Suspicious Logins */}
              {selectedUser.suspiciousLogins.length > 0 && (
                <div className="glass-card p-6 border border-red-600/50 bg-red-600/5">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Suspicious Login Attempts ({selectedUser.suspiciousLogins.length})
                  </h3>

                  <div className="space-y-3">
                    {selectedUser.suspiciousLogins.map((login) => (
                      <div key={login.id} className="p-4 bg-slate-800/50 rounded-lg border border-red-600/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">{login.device}</p>
                            <p className="text-sm text-slate-400">{login.timestamp}</p>
                          </div>
                          <span className="px-2 py-1 bg-red-600/20 text-red-300 text-xs font-medium rounded">
                            Suspicious
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 flex items-center gap-2">
                          <span className="text-slate-400">IP:</span>
                          {login.ipAddress}
                        </p>
                        {login.location && (
                          <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
                            <span className="text-slate-400">Location:</span>
                            {login.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IP Whitelist */}
              <div className="glass-card p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-400" />
                    IP Whitelist
                  </h3>
                  <button
                    onClick={() => setShowAddIpModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add IP
                  </button>
                </div>

                {selectedUser.ipWhitelist.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.ipWhitelist.map((ip) => (
                      <div
                        key={ip}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center gap-3">
                          <KeyRound className="w-4 h-4 text-slate-400" />
                          <span className="text-white font-mono text-sm">{ip}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveIpAddress(ip)}
                          className="p-1 hover:bg-red-600 rounded transition"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No IP addresses whitelisted yet</p>
                )}
              </div>

              {/* Trusted Devices */}
              <div className="glass-card p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  Trusted Devices
                </h3>

                {selectedUser.deviceTrustList.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.deviceTrustList.map((device) => (
                      <div
                        key={device}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <span className="text-white text-sm">{device}</span>
                        <button
                          onClick={() => handleRemoveTrustedDevice(device)}
                          className="p-1 hover:bg-red-600 rounded transition"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No devices added to trust list yet</p>
                )}
              </div>

              {/* Login History */}
              <div className="glass-card p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Login History</h3>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedUser.loginHistory.slice(0, 10).map((login) => (
                    <div
                      key={login.id}
                      className={`p-4 rounded-lg border ${
                        login.status === "suspicious"
                          ? "bg-red-600/10 border-red-600/30"
                          : "bg-slate-800/50 border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{login.device}</p>
                          <p className="text-sm text-slate-400">{login.timestamp}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            login.status === "success"
                              ? "bg-green-600/20 text-green-300"
                              : "bg-red-600/20 text-red-300"
                          }`}
                        >
                          {login.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 flex items-center gap-2">
                        <span className="text-slate-400">IP:</span>
                        <code className="text-xs bg-slate-900/50 px-2 py-1 rounded">
                          {login.ipAddress}
                        </code>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2FA Setup Modal */}
        {showTwoFactorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 max-w-md w-full border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Enable Two-Factor Authentication</h3>

              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-slate-800/30 transition">
                  <input
                    type="radio"
                    value="authenticator"
                    checked={twoFactorMethod === "authenticator"}
                    onChange={(e) => setTwoFactorMethod(e.target.value as "authenticator" | "sms" | "email")}
                    className="accent-blue-600"
                  />
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Authenticator App</p>
                    <p className="text-xs text-slate-400">Google Authenticator, Authy, etc.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-slate-800/30 transition">
                  <input
                    type="radio"
                    value="sms"
                    checked={twoFactorMethod === "sms"}
                    onChange={(e) => setTwoFactorMethod(e.target.value as "authenticator" | "sms" | "email")}
                    className="accent-blue-600"
                  />
                  <KeyRound className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">SMS Text Message</p>
                    <p className="text-xs text-slate-400">Verification code sent to phone</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-slate-800/30 transition">
                  <input
                    type="radio"
                    value="email"
                    checked={twoFactorMethod === "email"}
                    onChange={(e) => setTwoFactorMethod(e.target.value as "authenticator" | "sms" | "email")}
                    className="accent-blue-600"
                  />
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-xs text-slate-400">Verification code sent to email</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowTwoFactorModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnableTwoFactor}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
                >
                  Enable
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add IP Modal */}
        {showAddIpModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 max-w-md w-full border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Add IP Address to Whitelist</h3>

              <input
                type="text"
                placeholder="192.168.1.100 or 10.0.0.0/8"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddIpModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIpAddress}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;
