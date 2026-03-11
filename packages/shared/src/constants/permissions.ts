import { UserRole } from '../types/user';

export enum Permission {
  CREATE_PROCESS = 'create_process',
  EDIT_PROCESS = 'edit_process',
  DELETE_PROCESS = 'delete_process',
  VIEW_PROCESS = 'view_process',
  EXECUTE_PROCESS = 'execute_process',
  MANAGE_TEAMS = 'manage_teams',
  MANAGE_USERS = 'manage_users',
  VIEW_ADMIN = 'view_admin',
  VIEW_AUDIT = 'view_audit',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_TEAM_DASHBOARD = 'view_team_dashboard',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: Object.values(Permission).filter(
    (p) => p !== Permission.MANAGE_SETTINGS,
  ),
  [UserRole.MANAGER]: [
    Permission.CREATE_PROCESS,
    Permission.EDIT_PROCESS,
    Permission.VIEW_PROCESS,
    Permission.EXECUTE_PROCESS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_TEAM_DASHBOARD,
  ],
  [UserRole.EDITOR]: [
    Permission.EDIT_PROCESS,
    Permission.VIEW_PROCESS,
    Permission.EXECUTE_PROCESS,
    Permission.VIEW_DASHBOARD,
  ],
  [UserRole.VIEWER]: [Permission.VIEW_PROCESS, Permission.VIEW_DASHBOARD],
};
