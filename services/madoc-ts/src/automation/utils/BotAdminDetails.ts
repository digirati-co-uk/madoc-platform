export interface BotAdminDetails {
  type: string;
  metadata: {
    label: string;
    description: string;
    documentation?: string;
    actionLabel?: string;
    thumbnail?: string;
  };
  siteRole: string;
  config?: any;
}
