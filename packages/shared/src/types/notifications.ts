export type NotificationType =
  | 'info'
  | 'warning'
  | 'action_required'
  | 'dispatch'
  | 'process_complete';

export interface INotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
