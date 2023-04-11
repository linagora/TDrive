export type NotificationType = {
  id: string;
  user_id: string;
  company_id: string;
  workspace_id: string | 'all';
  channel_id: string | 'all';
  thread_id: string | 'all';
  message_id: string;
  mention_type: 'reply' | 'global' | 'me' | 'unread' | null;

  count: number;
};
