export type NotificationType = 'FRIEND_LINK_APPLY' | 'USER_REGISTER' | 'LIKE_ARTICLE' | 'NEW_COMMENT';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  senderName?: string;
  targetId?: number;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
