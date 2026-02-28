import React, { useState } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  MapPin,
  ChevronDown,
  Save,
  X,
  AlertCircle,
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

interface DataRestriction {
  type: "province" | "match" | "club";
  value: string;
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
  dataRestrictions: DataRestriction[];
}

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
    dataRestrictions: [],
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
    dataRestrictions: [{ type: "province", value: "Jawa Barat" }],
  },
  {
    id: "user_010",
    name: "Hari Saputra",
    email: "hari.saputra@apssi.id",
    role: "match_commissioner",
    status: "active",
    joinDate: "2024-02-16",
    lastLogin: "2026-02-27 14:05:00",
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
    dataRestrictions: [{ type: "match", value: "M001" }, { type: "match", value: "M002" }],
  },
  {
    id: "user_018",
    name: "Pandu Hermawan",
    email: "pandu.hermawan@apssi.id",
    role: "data_operator",
    status: "active",
    joinDate: "2024-03-05",
    lastLogin: "2026-02-27 16:10:00",
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
    dataRestrictions: [{ type: "club", value: "CLUB001" }, { type: "club", value: "CLUB002" }],
  },
  {
    id: "user_022",
    name: "Tomi Prasetyo",
    email: "tomi.prasetyo@apssi.id",
    role: "scout",
    status: "active",
    joinDate: "2024-03-15",
    lastLogin: "2026-02-27 12:35:00",
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
    dataRestrictions: [{ type: "club", value: "CLUB001" }],
  },
];

const provinces = [
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Kalimantan Timur",
];

const clubs = [
  "CLUB001",
  "CLUB002",
  "CLUB003",
  "CLUB004",
  "CLUB005",
];

const matches = [
  "M001",
  "M002",
  "M003",
  "M004",
  "M005",
];

const roleOptions = [
  { value: "super_admin", label: "Super Admin" },
  { value: "provincial_admin", label: "Provincial Admin" },
  { value: "match_commissioner", label: "Match Commissioner" },
  { value: "data_operator", label: "Data Operator" },
  { value: "scout", label: "Scout (Limited Access)" },
];

// ==================== COMPONENT ====================

interface EditingUser extends User {
  originalRole?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>("");
  const [newRestriction, setNewRestriction] = useState<DataRestriction | null>(null);
  const [restrictionType, setRestrictionType] = useState<"province" | "match" | "club">("province");
  const [restrictionValue, setRestrictionValue] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditingRole(user.role);
    setExpandedUserId(user.id);
  };

  const saveRoleChange = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const updatedUsers = users.map((u) =>
      u.id === userId
        ? {
            ...u,
            role: editingRole as User["role"],
          }
        : u
    );

    setUsers(updatedUsers);
    setEditingUserId(null);
    toast.success(`Role updated for ${user.name}`);
  };

  const addDataRestriction = (userId: string) => {
    if (!restrictionValue.trim()) {
      toast.error("Please select a restriction value");
      return;
    }

    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const restriction: DataRestriction = {
      type: restrictionType,
      value: restrictionValue,
    };

    // Check if restriction already exists
    if (
      user.dataRestrictions.some(
        (r) => r.type === restrictionType && r.value === restrictionValue
      )
    ) {
      toast.error("This restriction already exists");
      return;
    }

    const updatedUsers = users.map((u) =>
      u.id === userId
        ? {
            ...u,
            dataRestrictions: [...u.dataRestrictions, restriction],
          }
        : u
    );

    setUsers(updatedUsers);
    setRestrictionValue("");
    setRestrictionType("province");
    toast.success("Data restriction added");
  };

  const removeDataRestriction = (userId: string, index: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const updatedUsers = users.map((u) =>
      u.id === userId
        ? {
            ...u,
            dataRestrictions: u.dataRestrictions.filter((_, i) => i !== index),
          }
        : u
    );

    setUsers(updatedUsers);
    toast.success("Data restriction removed");
  };

  const deleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter((u) => u.id !== userId));
      toast.success(`${user.name} has been deleted`);
    }
  };

  const getRestrictionLabel = (restriction: DataRestriction): string => {
    const labels: Record<string, string> = {
      province: "Province",
      match: "Match",
      club: "Club",
    };
    return `${labels[restriction.type]}: ${restriction.value}`;
  };

  const getRestrictionOptions = (type: "province" | "match" | "club"): string[] => {
    switch (type) {
      case "province":
        return provinces;
      case "match":
        return matches;
      case "club":
        return clubs;
      default:
        return [];
    }
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      super_admin: "bg-purple-100 text-purple-800",
      provincial_admin: "bg-blue-100 text-blue-800",
      match_commissioner: "bg-amber-100 text-amber-800",
      data_operator: "bg-green-100 text-green-800",
      scout: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const canRestrictData = (role: string): boolean => {
    return role !== "super_admin";
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="glass-card p-4 border border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="glass-card border border-white/10 overflow-hidden"
            >
              {/* User Header */}
              <div
                className="p-6 cursor-pointer hover:bg-slate-800/30 transition"
                onClick={() =>
                  setExpandedUserId(expandedUserId === user.id ? null : user.id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {roleOptions.find((r) => r.value === user.role)?.label}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition ${
                        expandedUserId === user.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* User Details */}
              {expandedUserId === user.id && (
                <div className="border-t border-white/10 p-6 bg-slate-800/20">
                  {/* Role Assignment */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Role Assignment
                    </h4>

                    {editingUserId === user.id ? (
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-300 mb-2">
                            Select Role
                          </label>
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          >
                            {roleOptions.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => saveRoleChange(user.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">
                          {roleOptions.find((r) => r.value === user.role)?.label}
                        </p>
                        <button
                          onClick={() => startEditing(user)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Role
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Data Access Restrictions */}
                  {canRestrictData(user.role) && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Data Access Restrictions
                      </h4>

                      {/* Existing Restrictions */}
                      {user.dataRestrictions.length > 0 && (
                        <div className="space-y-2 mb-6">
                          {user.dataRestrictions.map((restriction, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-slate-700/50 px-4 py-3 rounded-lg border border-slate-600"
                            >
                              <div className="flex items-center gap-3">
                                <Unlock className="w-4 h-4 text-slate-400" />
                                <span className="text-white text-sm">
                                  {getRestrictionLabel(restriction)}
                                </span>
                              </div>
                              <button
                                onClick={() => removeDataRestriction(user.id, index)}
                                className="p-1 hover:bg-red-600 rounded transition"
                              >
                                <X className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Restriction */}
                      {user.dataRestrictions.length < 5 && (
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                          <p className="text-xs text-slate-400 mb-4">
                            Add data access restrictions for this user
                          </p>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <select
                              value={restrictionType}
                              onChange={(e) =>
                                setRestrictionType(e.target.value as "province" | "match" | "club")
                              }
                              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                            >
                              <option value="province">Province</option>
                              <option value="match">Match</option>
                              <option value="club">Club</option>
                            </select>

                            <select
                              value={restrictionValue}
                              onChange={(e) => setRestrictionValue(e.target.value)}
                              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select {restrictionType}...</option>
                              {getRestrictionOptions(restrictionType).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => addDataRestriction(user.id)}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-1">Joined</p>
                      <p className="text-white">{user.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-1">Last Login</p>
                      <p className="text-white">{user.lastLogin}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-6 pt-6 border-t border-white/10">
                    <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition">
                      View Activity
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="glass-card p-12 border border-white/10 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
