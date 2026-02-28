import React, { useState } from "react";
import {
  Shield,
  User as UserIcon,
  Activity,
  Lock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/admin/UserManagement";
import SecuritySettings from "@/components/admin/SecuritySettings";
import ActivityMonitoring from "@/components/admin/ActivityMonitoring";
import { PermissionEditorModal } from "@/components/admin/RoleManagementModals";

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
    description: "View-only access for player evaluation (Limited Access)",
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

// ==================== COMPONENT ====================

const RoleManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleSavePermissions = (permissions: RolePermissions) => {
    console.log("Saving permissions:", permissions);
    setEditingRole(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Role Management Interface</h1>
          <p className="text-slate-400">Configure roles, permissions, data access, and security settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-white/10 p-1 h-auto grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <UserIcon className="w-4 h-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              className="flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4" />
              <span>Roles & Permissions</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4" />
              <span>Activity Monitoring</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Lock className="w-4 h-4" />
              <span>Security Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-0">
            <UserManagement />
          </TabsContent>

          <TabsContent value="roles" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(roleDefinitions).map((role) => (
                <div key={role.id} className="glass-card p-6 border border-white/10 hover:border-blue-500/50 transition">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{role.name}</h3>
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-slate-400 text-sm mb-6 h-10">{role.description}</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Active Users</span>
                      <span className="text-white font-semibold">{role.userCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Modules Enabled</span>
                      <span className="text-white font-semibold">
                        {Object.values(role.permissions).filter(Boolean).length} / {Object.keys(role.permissions).length}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingRole(role)}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
                  >
                    Edit Permissions
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <ActivityMonitoring />
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <SecuritySettings />
          </TabsContent>
        </Tabs>

        {editingRole && (
          <PermissionEditorModal
            isOpen={!!editingRole}
            onClose={() => setEditingRole(null)}
            onSave={handleSavePermissions}
            roleName={editingRole.name}
            initialPermissions={editingRole.permissions}
          />
        )}
      </div>
    </div>
  );
};

export default RoleManagement;
