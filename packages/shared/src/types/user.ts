export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export interface ITeam {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  members?: IUser[];
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  team?: ITeam;
  isActive: boolean;
}
