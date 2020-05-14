export type ExternalConfig = {
  cookieName?: string;
  tokenExpires?: number;
  permissions: {
    [role: string]: string[];
  };
};
