import React, { createContext, useContext, useMemo, useState } from 'react';

export type Role = 'Admin' | 'Analyst' | 'Viewer';

export type Permissions = Record<string, boolean>;

const rolePermissions: Record<Role, Permissions> = {
  Admin: {
    'workflows.view': true,
    'workflows.edit': true,
    'workflows.delete': true,
    'agents.view': true,
    'agents.edit': true,
    'policies.view': true,
    'policies.edit': true,
    'access.view': true,
    'access.edit': true,
    'metrics.view': true,
    'logs.view': true,
  },
  Analyst: {
    'workflows.view': true,
    'workflows.edit': false,
    'workflows.delete': false,
    'agents.view': true,
    'agents.edit': false,
    'policies.view': true,
    'policies.edit': false,
    'access.view': false,
    'metrics.view': true,
    'logs.view': true,
  },
  Viewer: {
    'workflows.view': true,
    'workflows.edit': false,
    'policies.view': false,
    'metrics.view': false,
    'logs.view': false,
  },
};

type ContextType = {
  role: Role;
  permissions: Permissions;
  setRole: (r: Role) => void;
  can: (perm: string) => boolean;
};

const RBACContext = createContext<ContextType | null>(null);

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('Viewer');

  const permissions = useMemo(() => rolePermissions[role] || {}, [role]);

  const can = (perm: string) => !!permissions[perm];

  return (
    <RBACContext.Provider value={{ role, permissions, setRole, can }}>{children}</RBACContext.Provider>
  );
}

export function useRBAC() {
  const ctx = useContext(RBACContext);
  if (!ctx) throw new Error('useRBAC must be used within RBACProvider');
  return ctx;
}

export function RequirePermission({ perm, children }: { perm: string; children: React.ReactNode }) {
  const { can } = useRBAC();
  if (!can(perm)) return null;
  return <>{children}</>;
}
