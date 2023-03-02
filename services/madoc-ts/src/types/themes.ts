export type ThemeRow = {
  theme_id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  version: string;
  enabled: boolean;
  created_at: number;
  theme: any;
  extra: ExtraThemeConfig | null;
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
  extra?: ExtraThemeConfig;
};

export type ExtraThemeConfig = {
  // Extra fields
  classNames?: {
    main?: string;
    html?: string;
  };
  remote?: {
    header?: string;
    footer?: string;
    languages?: Record<string, { header?: string; footer?: string }>;
  };
  stylesheets?: string[];
  scripts?: string[];
  footerScripts?: string[];
  options?: ExtraOptions;
};

export type ExtraOptions = {
  userBarAbove?: boolean;
};

export type DiskTheme = {
  id: string;
  config: {
    name: string;
    description?: string;
    version?: string;
    thumbnail?: string;
    theme?: any;
    extra?: ExtraThemeConfig;
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
    main?: string;
    inlineJs?: string[];
    footerInlineJs?: string[];
  };
  classNames: {
    main?: string;
    html?: string;
  };
  assets: {
    css: string[];
    js: string[];
    footerJs: string[];
  };
  languages: Record<
    string,
    {
      html?: {
        header?: string;
        footer?: string;
        inlineJs?: string[];
      };
    }
  >;
  options: ExtraOptions;
};
