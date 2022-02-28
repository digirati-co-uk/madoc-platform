export type ThemeRow = {
  theme_id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  version: string;
  enabled: boolean;
  created_at: number;
  theme: any;
};

export type ThemeSiteRow = {
  theme_id: string;
  site_id: number;
};

export type ThemeListItem = {
  id: string;
  name: string;
  description: string;
  onDisk: boolean;
  isPlugin: boolean;
  enabled: boolean;
  installed: boolean;
  version: string;
  thumbnail: string | null;
};

export type DiskTheme = {
  id: string;
  config: {
    name: string;
    description?: string;
    version?: string;
    thumbnail?: string;
    theme: any;
  };
  source?: { type: string; id?: string; name: string };
};

export type ResolvedTheme = {
  id: string;
  name: string;
  theme: any;
  html: {
    header?: string;
    footer?: string;
  };
  assets: {
    css: string[];
    js: string[];
  };
};
