export type NotificationRow = {
  id: string;
  title: string;
  summary?: string | null;
  created_at: number;
  read_at?: number | null;
  site_id: number;
  user_id: number;
  action_id: string;
  action_link?: string | null;
  action_text?: string | null;
  from_user_id?: number | null;
  from_user_name?: string | null;
  tags: string[];
};

export type NotificationRequest = {
  id: string;
  title: string;
  user: number;
  summary?: string;
  from?: {
    id: number;
    name?: string;
  };
  action: {
    id: string;
    text?: string;
    link?: string;
  };
  tags: string[];
};

export type Notification = NotificationRequest & {
  createdAt: number;
  readAt?: number;
};

export type NotificationList = {
  notifications: Notification[];
};
