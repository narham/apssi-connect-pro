import React, { useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Shield,
  User,
  Lock,
  Activity,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface RolePermissions {
  playerManagement: boolean;
  matchManagement: boolean;
  tournamentSetup: boolean;
  dataValidation: boolean;
  reportGeneration: boolean;
  roleManagement: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: "authenticator" | "sms" | "email";
  ipWhitelist: string[];
  sessionTimeout: number; // minutes
  requirePasswordChange: boolean;
  passwordExpiryDays: number;
}

interface LoginHistory {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: "success" | "failed" | "suspicious";
  reason?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  affectedUser?: string;
  previousValue?: string;
  newValue?: string;
  reason: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "provincial_admin" | "match_commissioner" | "data_operator" | "scout";
  province?: string;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  lastLogin: string;
  permissions: RolePermissions;
  security: SecuritySettings;
  loginHistory: LoginHistory[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermissions;
  userCount: number;
  createdAt: string;
}

// ==================== ROLE DEFINITIONS ====================

const roleDefinitions: Record<string, Role> = {
  super_admin: {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access with administrative privileges",
    permissions: {
      playerManagement: true,
      matchManagement: true,
      tournamentSetup: true,
      dataValidation: true,
      reportGeneration: true,
      roleManagement: true,
      systemSettings: true,
      auditLogs: true,
    },
    userCount: 2,
    createdAt: "2024-01-15",
  },
  provincial_admin: {
    id: "provincial_admin",
    name: "Provincial Admin",
    description: "Manage tournaments and matches in assigned province",
    permissions: {
      playerManagement: true,
      matchManagement: true,
      tournamentSetup: true,
      dataValidation: true,
      reportGeneration: true,
      roleManagement: false,
      systemSettings: false,
      auditLogs: true,
    },
    userCount: 8,
    createdAt: "2024-01-20",
  },
  match_commissioner: {
    id: "match_commissioner",
    name: "Match Commissioner",
    description: "Manage match data and commissioner assignments",
    permissions: {
      playerManagement: false,
      matchManagement: true,
      tournamentSetup: false,
      dataValidation: true,
      reportGeneration: true,
      roleManagement: false,
      systemSettings: false,
      auditLogs: true,
    },
    userCount: 12,
    createdAt: "2024-02-01",
  },
  data_operator: {
    id: "data_operator",
    name: "Data Operator",
    description: "Enter and manage tournament and match data",
    permissions: {
      playerManagement: true,
      matchManagement: true,
      tournamentSetup: false,
      dataValidation: false,
      reportGeneration: false,
      roleManagement: false,
      systemSettings: false,
      auditLogs: false,
    },
    userCount: 4,
    createdAt: "2024-02-10",
  },
  scout: {
    id: "scout",
    name: "Scout",
    description: "View-only access for player evaluation",
    permissions: {
      playerManagement: false,
      matchManagement: false,
      tournamentSetup: false,
      dataValidation: false,
      reportGeneration: false,
      roleManagement: false,
      systemSettings: false,
      auditLogs: false,
    },
    userCount: 2,
    createdAt: "2024-02-15",
  },
};

// ==================== MOCK DATA ====================

const mockUsers: User[] = [
  {
    id: "user_001",
    name: "Budi Santoso",
    email: "budi.santoso@apssi.id",
    role: "super_admin",
    status: "active",
    joinDate: "2024-01-15",
    lastLogin: "2026-02-27 14:32:00",
    permissions: roleDefinitions.super_admin.permissions,
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "authenticator",
      ipWhitelist: ["192.168.1.100", "10.0.0.0/8"],
      sessionTimeout: 60,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_001",
        timestamp: "2026-02-27 14:32:00",
        ipAddress: "192.168.1.100",
        device: "Windows - Chrome",
        status: "success",
      },
      {
        id: "login_002",
        timestamp: "2026-02-26 09:15:00",
        ipAddress: "192.168.1.100",
        device: "Windows - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_002",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@apssi.id",
    role: "super_admin",
    status: "active",
    joinDate: "2024-01-20",
    lastLogin: "2026-02-27 16:45:00",
    permissions: roleDefinitions.super_admin.permissions,
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "authenticator",
      ipWhitelist: ["192.168.1.101"],
      sessionTimeout: 60,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_003",
        timestamp: "2026-02-27 16:45:00",
        ipAddress: "192.168.1.101",
        device: "MacBook - Safari",
        status: "success",
      },
    ],
  },
  {
    id: "user_003",
    name: "Ahmad Wijaya",
    email: "ahmad.wijaya@apssi-jabar.id",
    province: "Jawa Barat",
    role: "provincial_admin",
    status: "active",
    joinDate: "2024-01-25",
    lastLogin: "2026-02-27 12:20:00",
    permissions: roleDefinitions.provincial_admin.permissions,
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "sms",
      ipWhitelist: ["10.50.0.0/16"],
      sessionTimeout: 45,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_004",
        timestamp: "2026-02-27 12:20:00",
        ipAddress: "10.50.15.42",
        device: "Windows - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_004",
    name: "Rini Susanto",
    email: "rini.susanto@apssi-jabar.id",
    province: "Jawa Barat",
    role: "provincial_admin",
    status: "active",
    joinDate: "2024-02-01",
    lastLogin: "2026-02-27 11:30:00",
    permissions: roleDefinitions.provincial_admin.permissions,
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "email",
      ipWhitelist: ["10.50.0.0/16"],
      sessionTimeout: 45,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_005",
        timestamp: "2026-02-27 11:30:00",
        ipAddress: "10.50.20.15",
        device: "Windows - Edge",
        status: "success",
      },
    ],
  },
  {
    id: "user_005",
    name: "Eka Prasetya",
    email: "eka.prasetya@apssi-jabar.id",
    province: "Jawa Barat",
    role: "provincial_admin",
    status: "active",
    joinDate: "2024-02-05",
    lastLogin: "2026-02-26 15:45:00",
    permissions: roleDefinitions.provincial_admin.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      ipWhitelist: [],
      sessionTimeout: 45,
      requirePasswordChange: true,
      passwordExpiryDays: 60,
    },
    loginHistory: [
      {
        id: "login_006",
        timestamp: "2026-02-26 15:45:00",
        ipAddress: "10.50.25.88",
        device: "Windows - Chrome",
        status: "success",
      },
      {
        id: "login_007",
        timestamp: "2026-02-25 09:20:00",
        ipAddress: "192.168.50.1",
        device: "Mobile - Safari",
        status: "suspicious",
        reason: "New device detected",
      },
    ],
  },
  {
    id: "user_006",
    name: "Hendra Kusuma",
    email: "hendra.kusuma@apssi-sumbar.id",
    province: "Sumatera Barat",
    role: "provincial_admin",
    status: "active",
    joinDate: "2024-02-08",
    lastLogin: "2026-02-27 10:15:00",
    permissions: roleDefinitions.provincial_admin.permissions,
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "authenticator",
      ipWhitelist: ["10.60.0.0/16"],
      sessionTimeout: 45,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_008",
        timestamp: "2026-02-27 10:15:00",
        ipAddress: "10.60.30.22",
        device: "Windows - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_007",
    name: "Dewi Lestari",
    email: "dewi.lestari@apssi-sumbar.id",
    province: "Sumatera Barat",
    role: "provincial_admin",
    status: "inactive",
    joinDate: "2024-02-10",
    lastLogin: "2026-02-15 08:30:00",
    permissions: roleDefinitions.provincial_admin.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "sms",
      ipWhitelist: [],
      sessionTimeout: 45,
      requirePasswordChange: true,
      passwordExpiryDays: 30,
    },
    loginHistory: [
      {
        id: "login_009",
        timestamp: "2026-02-15 08:30:00",
        ipAddress: "10.60.35.11",
        device: "Windows - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_008",
    name: "Farid Mustafa",
    email: "farid.mustafa@apssi-sumsel.id",
    province: "Sumatera Selatan",
    role: "provincial_admin",
    status: "active",
    joinDate: "2024-02-12",
    lastLogin: "2026-02-27 13:40:00",
    permissions: roleDefinitions.provincial_admin.permissions,
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "email",
      ipWhitelist: ["10.70.0.0/16"],
      sessionTimeout: 45,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_010",
        timestamp: "2026-02-27 13:40:00",
        ipAddress: "10.70.40.55",
        device: "Windows - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_009",
    name: "Gita Maharani",
    email: "gita.maharani@apssi-sumsel.id",
    province: "Sumatera Selatan",
    role: "provincial_admin",
    status: "suspended",
    joinDate: "2024-02-14",
    lastLogin: "2026-02-20 16:50:00",
    permissions: roleDefinitions.provincial_admin.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "authenticator",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: true,
      passwordExpiryDays: 0,
    },
    loginHistory: [
      {
        id: "login_011",
        timestamp: "2026-02-20 16:50:00",
        ipAddress: "10.70.45.22",
        device: "Windows - Chrome",
        status: "success",
      },
      {
        id: "login_012",
        timestamp: "2026-02-20 14:25:00",
        ipAddress: "203.0.113.5",
        device: "Unknown - Unknown",
        status: "failed",
        reason: "Invalid credentials",
      },
    ],
  },
  {
    id: "user_010",
    name: "Hari Saputra",
    email: "hari.saputra@apssi.id",
    role: "match_commissioner",
    status: "active",
    joinDate: "2024-02-16",
    lastLogin: "2026-02-27 14:05:00",
    permissions: roleDefinitions.match_commissioner.permissions,
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "sms",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_013",
        timestamp: "2026-02-27 14:05:00",
        ipAddress: "203.0.113.20",
        device: "Mobile - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_011",
    name: "Indri Setiawan",
    email: "indri.setiawan@apssi.id",
    role: "match_commissioner",
    status: "active",
    joinDate: "2024-02-18",
    lastLogin: "2026-02-27 09:30:00",
    permissions: roleDefinitions.match_commissioner.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_014",
        timestamp: "2026-02-27 09:30:00",
        ipAddress: "203.0.113.21",
        device: "Mobile - Safari",
        status: "success",
      },
    ],
  },
  {
    id: "user_012",
    name: "Joko Wardoyo",
    email: "joko.wardoyo@apssi.id",
    role: "match_commissioner",
    status: "active",
    joinDate: "2024-02-20",
    lastLogin: "2026-02-26 17:15:00",
    permissions: roleDefinitions.match_commissioner.permissions,
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "authenticator",
      ipWhitelist: ["203.0.113.0/24"],
      sessionTimeout: 30,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_015",
        timestamp: "2026-02-26 17:15:00",
        ipAddress: "203.0.113.25",
        device: "Tablet - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_013",
    name: "Karina Dewi",
    email: "karina.dewi@apssi.id",
    role: "match_commissioner",
    status: "active",
    joinDate: "2024-02-22",
    lastLogin: "2026-02-27 15:20:00",
    permissions: roleDefinitions.match_commissioner.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "sms",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_016",
        timestamp: "2026-02-27 15:20:00",
        ipAddress: "203.0.113.26",
        device: "Mobile - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_014",
    name: "Luthfi Rahman",
    email: "luthfi.rahman@apssi.id",
    role: "match_commissioner",
    status: "inactive",
    joinDate: "2024-02-24",
    lastLogin: "2026-02-10 11:45:00",
    permissions: roleDefinitions.match_commissioner.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: true,
      passwordExpiryDays: 45,
    },
    loginHistory: [
      {
        id: "login_017",
        timestamp: "2026-02-10 11:45:00",
        ipAddress: "203.0.113.27",
        device: "Windows - Firefox",
        status: "success",
      },
    ],
  },
  {
    id: "user_015",
    name: "Maya Kusuma",
    email: "maya.kusuma@apssi.id",
    role: "match_commissioner",
    status: "active",
    joinDate: "2024-02-26",
    lastLogin: "2026-02-27 10:50:00",
    permissions: roleDefinitions.match_commissioner.permissions,
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "authenticator",
      ipWhitelist: ["203.0.113.0/24"],
      sessionTimeout: 30,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_018",
        timestamp: "2026-02-27 10:50:00",
        ipAddress: "203.0.113.28",
        device: "Mobile - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_016",
    name: "Nizar Ubaidillah",
    email: "nizar.ubaidillah@apssi.id",
    role: "match_commissioner",
    status: "active",
    joinDate: "2024-02-28",
    lastLogin: "2026-02-27 08:25:00",
    permissions: roleDefinitions.match_commissioner.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "sms",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_019",
        timestamp: "2026-02-27 08:25:00",
        ipAddress: "203.0.113.29",
        device: "Windows - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_017",
    name: "Olivia Handoko",
    email: "olivia.handoko@apssi.id",
    role: "match_commissioner",
    status: "suspended",
    joinDate: "2024-03-01",
    lastLogin: "2026-02-20 14:30:00",
    permissions: roleDefinitions.match_commissioner.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: true,
      passwordExpiryDays: 0,
    },
    loginHistory: [
      {
        id: "login_020",
        timestamp: "2026-02-20 14:30:00",
        ipAddress: "203.0.113.30",
        device: "Mobile - Safari",
        status: "success",
      },
      {
        id: "login_021",
        timestamp: "2026-02-20 13:50:00",
        ipAddress: "198.51.100.5",
        device: "Unknown - Unknown",
        status: "suspicious",
        reason: "Multiple failed attempts before success",
      },
    ],
  },
  {
    id: "user_018",
    name: "Pandu Hermawan",
    email: "pandu.hermawan@apssi.id",
    role: "data_operator",
    status: "active",
    joinDate: "2024-03-05",
    lastLogin: "2026-02-27 16:10:00",
    permissions: roleDefinitions.data_operator.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_022",
        timestamp: "2026-02-27 16:10:00",
        ipAddress: "203.0.113.40",
        device: "Windows - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_019",
    name: "Quarik Aziz",
    email: "quarik.aziz@apssi.id",
    role: "data_operator",
    status: "active",
    joinDate: "2024-03-07",
    lastLogin: "2026-02-27 13:55:00",
    permissions: roleDefinitions.data_operator.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "sms",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_023",
        timestamp: "2026-02-27 13:55:00",
        ipAddress: "203.0.113.41",
        device: "Windows - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_020",
    name: "Rosa Amelia",
    email: "rosa.amelia@apssi.id",
    role: "data_operator",
    status: "active",
    joinDate: "2024-03-10",
    lastLogin: "2026-02-26 10:20:00",
    permissions: roleDefinitions.data_operator.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
    },
    loginHistory: [
      {
        id: "login_024",
        timestamp: "2026-02-26 10:20:00",
        ipAddress: "203.0.113.42",
        device: "Windows - Edge",
        status: "success",
      },
    ],
  },
  {
    id: "user_021",
    name: "Sandi Pratama",
    email: "sandi.pratama@apssi.id",
    role: "data_operator",
    status: "inactive",
    joinDate: "2024-03-12",
    lastLogin: "2026-01-30 09:00:00",
    permissions: roleDefinitions.data_operator.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      ipWhitelist: [],
      sessionTimeout: 30,
      requirePasswordChange: true,
      passwordExpiryDays: 0,
    },
    loginHistory: [
      {
        id: "login_025",
        timestamp: "2026-01-30 09:00:00",
        ipAddress: "203.0.113.43",
        device: "Windows - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_022",
    name: "Tomi Prasetyo",
    email: "tomi.prasetyo@apssi.id",
    role: "scout",
    status: "active",
    joinDate: "2024-03-15",
    lastLogin: "2026-02-27 12:35:00",
    permissions: roleDefinitions.scout.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "sms",
      ipWhitelist: [],
      sessionTimeout: 15,
      requirePasswordChange: false,
      passwordExpiryDays: 60,
    },
    loginHistory: [
      {
        id: "login_026",
        timestamp: "2026-02-27 12:35:00",
        ipAddress: "203.0.113.50",
        device: "Mobile - Chrome",
        status: "success",
      },
    ],
  },
  {
    id: "user_023",
    name: "Uma Suryanto",
    email: "uma.suryanto@apssi.id",
    role: "scout",
    status: "active",
    joinDate: "2024-03-18",
    lastLogin: "2026-02-27 11:15:00",
    permissions: roleDefinitions.scout.permissions,
    security: {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      ipWhitelist: [],
      sessionTimeout: 15,
      requirePasswordChange: false,
      passwordExpiryDays: 60,
    },
    loginHistory: [
      {
        id: "login_027",
        timestamp: "2026-02-27 11:15:00",
        ipAddress: "203.0.113.51",
        device: "Mobile - Safari",
        status: "success",
      },
    ],
  },
];

// ==================== COMPONENT ====================

const RoleManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: "bg-purple-100 text-purple-800",
      provincial_admin: "bg-blue-100 text-blue-800",
      match_commissioner: "bg-amber-100 text-amber-800",
      data_operator: "bg-green-100 text-green-800",
      scout: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleName = (role: string) => {
    return roleDefinitions[role]?.name || role;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Check className="w-4 h-4" />;
      case "suspended":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Role Management</h1>
          <p className="text-slate-400">Manage user roles, permissions, and security settings</p>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 mb-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="provincial_admin">Provincial Admin</option>
              <option value="match_commissioner">Match Commissioner</option>
              <option value="data_operator">Data Operator</option>
              <option value="scout">Scout</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition">
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded border-slate-600 accent-blue-600"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Province
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    2FA
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 rounded border-slate-600 accent-blue-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {getStatusIcon(user.status)}
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {user.province || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4">
                        {user.security.twoFactorEnabled ? (
                          <Shield className="w-5 h-5 text-green-500" />
                        ) : (
                          <Shield className="w-5 h-5 text-slate-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition">
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          {Object.entries(roleDefinitions).map(([key, role]) => (
            <div key={key} className="glass-card p-4 border border-white/10">
              <p className="text-slate-400 text-sm mb-1">{role.name}</p>
              <p className="text-2xl font-bold text-white">
                {users.filter((u) => u.role === key).length}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
