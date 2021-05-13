export type SitePlugin = {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  installed: boolean;
  thumbnail?: string;
  repository: {
    owner: string;
    name: string;
  };
  version: string;
  development:
    | { enabled: false }
    | {
        enabled: true;
        revision: string | null;
      };
};

export type PluginTokenRequest = {
  name: string;
  pluginId: string;
  isDevToken: boolean;
  expiresIn: number;
  tokenHash: string;
  scope: string[];
};
