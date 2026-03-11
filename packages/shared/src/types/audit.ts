export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'execute'
  | 'approve'
  | 'reject'
  | 'dispatch'
  | 'login'
  | 'logout';

export interface IAuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  diff?: { before: unknown; after: unknown };
  timestamp: string;
}
