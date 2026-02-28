import React, { useState } from "react";
import { X, Check } from "lucide-react";
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

interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string, role: string) => void;
  userName: string;
  currentRole: string;
  userId: string;
}

// ==================== ROLE ASSIGNMENT MODAL ====================

export const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  userName,
  currentRole,
  userId,
}) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [confirmationText, setConfirmationText] = useState("");

  const roleOptions = [
    { value: "super_admin", label: "Super Admin" },
    { value: "provincial_admin", label: "Provincial Admin" },
    { value: "match_commissioner", label: "Match Commissioner" },
    { value: "data_operator", label: "Data Operator" },
    { value: "scout", label: "Scout" },
  ];

  const roleDescriptions: Record<string, string> = {
    super_admin: "Full system access with administrative privileges. Can manage users, roles, and system settings.",
    provincial_admin: "Manage tournaments and matches in assigned province. Limited admin capabilities.",
    match_commissioner: "Manage match data and commissioner assignments. Data entry and validation.",
    data_operator: "Enter and manage tournament and match data. No administrative access.",
    scout: "View-only access for player evaluation. No data entry or modification.",
  };

  if (!isOpen) return null;

  const handleAssign = () => {
    if (selectedRole !== currentRole && !confirmationText.includes("CONFIRM")) {
      toast.error("Please type 'CONFIRM' to proceed with role change");
      return;
    }

    onAssign(userId, selectedRole);
    setConfirmationText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card p-6 max-w-md w-full border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Assign Role</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white font-medium mb-1">{userName}</p>
          <p className="text-xs text-slate-400">User ID: {userId}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Select New Role
          </label>
          <div className="space-y-3">
            {roleOptions.map((role) => (
              <label
                key={role.value}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                  selectedRole === role.value
                    ? "border-blue-600 bg-blue-600/10"
                    : "border-slate-600 hover:border-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="accent-blue-600 mt-1"
                />
                <div>
                  <p className="text-white font-medium text-sm">{role.label}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {roleDescriptions[role.value]}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedRole !== currentRole && (
          <div className="mb-6 p-4 bg-yellow-600/10 border border-yellow-600/50 rounded-lg">
            <p className="text-sm text-yellow-300 mb-3">
              ⚠️ You are changing the role for this user. This will update their permissions and access levels.
            </p>
            <input
              type="text"
              placeholder='Type "CONFIRM" to proceed'
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-yellow-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 text-sm"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
          >
            Assign Role
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== PERMISSION EDITOR MODAL ====================

interface PermissionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: RolePermissions) => void;
  roleName: string;
  initialPermissions: RolePermissions;
}

export const PermissionEditorModal: React.FC<PermissionEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  roleName,
  initialPermissions,
}) => {
  const [permissions, setPermissions] = useState<RolePermissions>(initialPermissions);

  if (!isOpen) return null;

  const permissionsList = [
    { key: "playerManagement", label: "Player Management", description: "View and manage player data" },
    { key: "matchManagement", label: "Match Management", description: "Create and manage matches" },
    { key: "tournamentSetup", label: "Tournament Setup", description: "Create and configure tournaments" },
    { key: "dataValidation", label: "Data Validation", description: "Validate and approve data" },
    { key: "reportGeneration", label: "Report Generation", description: "Generate system reports" },
    { key: "roleManagement", label: "Role Management", description: "Manage user roles and permissions" },
    { key: "systemSettings", label: "System Settings", description: "Access system configuration" },
    { key: "auditLogs", label: "Audit Logs", description: "View system audit trail" },
  ];

  const handleToggle = (key: keyof RolePermissions) => {
    setPermissions({
      ...permissions,
      [key]: !permissions[key],
    });
  };

  const handleSave = () => {
    onSave(permissions);
    onClose();
    toast.success(`Permissions updated for ${roleName}`);
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card p-6 max-w-xl w-full border border-white/10 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-800/50 -m-6 p-6 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{roleName} Permissions</h3>
            <p className="text-xs text-slate-400 mt-1">
              {enabledCount} out of {permissionsList.length} permissions enabled
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {permissionsList.map((perm) => (
            <label
              key={perm.key}
              className="flex items-start gap-3 p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition"
            >
              <input
                type="checkbox"
                checked={permissions[perm.key as keyof RolePermissions]}
                onChange={() => handleToggle(perm.key as keyof RolePermissions)}
                className="accent-blue-600 mt-1"
              />
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{perm.label}</p>
                <p className="text-xs text-slate-400">{perm.description}</p>
              </div>
              {permissions[perm.key as keyof RolePermissions] && (
                <Check className="w-4 h-4 text-green-400 mt-1" />
              )}
            </label>
          ))}
        </div>

        <div className="flex gap-3 sticky bottom-0 bg-slate-800/50 -m-6 p-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MODULE ACCESS MODAL ====================

interface ModuleAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modules: Record<string, boolean>) => void;
  roleName: string;
  initialModules: Record<string, boolean>;
}

export const ModuleAccessModal: React.FC<ModuleAccessModalProps> = ({
  isOpen,
  onClose,
  onSave,
  roleName,
  initialModules,
}) => {
  const [modules, setModules] = useState<Record<string, boolean>>(initialModules);

  if (!isOpen) return null;

  const modulesList = [
    { key: "playerDatabase", label: "Player Database", description: "Access player information and records" },
    { key: "matchSchedule", label: "Match Schedule", description: "View and manage match schedules" },
    { key: "tournamentManagement", label: "Tournament Management", description: "Create and manage tournaments" },
    { key: "statistics", label: "Statistics", description: "View system statistics and reports" },
    { key: "userManagement", label: "User Management", description: "Create and manage user accounts" },
    { key: "verification", label: "Verification", description: "Approve player verifications" },
    { key: "dataOverride", label: "Data Override", description: "Override and correct data entries" },
    { key: "systemLogs", label: "System Logs", description: "Access audit and system logs" },
  ];

  const handleToggle = (key: string) => {
    setModules({
      ...modules,
      [key]: !modules[key],
    });
  };

  const handleSave = () => {
    onSave(modules);
    onClose();
    toast.success(`Module access updated for ${roleName}`);
  };

  const enabledCount = Object.values(modules).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card p-6 max-w-xl w-full border border-white/10 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-800/50 -m-6 p-6 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{roleName} Module Access</h3>
            <p className="text-xs text-slate-400 mt-1">
              {enabledCount} out of {modulesList.length} modules enabled
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {modulesList.map((mod) => (
            <label
              key={mod.key}
              className="flex items-start gap-3 p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition"
            >
              <input
                type="checkbox"
                checked={modules[mod.key] || false}
                onChange={() => handleToggle(mod.key)}
                className="accent-blue-600 mt-1"
              />
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{mod.label}</p>
                <p className="text-xs text-slate-400">{mod.description}</p>
              </div>
              {modules[mod.key] && <Check className="w-4 h-4 text-green-400 mt-1" />}
            </label>
          ))}
        </div>

        <div className="flex gap-3 sticky bottom-0 bg-slate-800/50 -m-6 p-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
          >
            Save Module Access
          </button>
        </div>
      </div>
    </div>
  );
};
