import { useAuthStore } from '../stores/auth.store';
import { Permission, ROLE_PERMISSIONS } from '@uniqflow/shared';
import { UserRole } from '@uniqflow/shared';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role as UserRole | undefined;
  const permissions = role ? ROLE_PERMISSIONS[role] ?? [] : [];

  return {
    hasPermission: (permission: Permission) => permissions.includes(permission),
    hasAnyPermission: (...perms: Permission[]) => perms.some((p) => permissions.includes(p)),
    hasAllPermissions: (...perms: Permission[]) => perms.every((p) => permissions.includes(p)),
    permissions,
    role,
  };
}
