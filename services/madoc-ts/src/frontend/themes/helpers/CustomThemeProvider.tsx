// Top level needs to pass the theme in.
// Bottom level items need to be able to override and communicate back up the chain.

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as _ThemeProvider } from 'styled-components';
import { MadocTheme } from '../definitions/types';

const ThemeProvider: any = _ThemeProvider;

const CustomTheme = React.createContext<{
  themeOverrides: any;
  setThemeOverrides: (name: string, overrides: any) => void;
  unsetThemeOverrides: (name: string) => void;
}>({
  setThemeOverrides: () => {
    // no-op.
  },
  unsetThemeOverrides: () => {
    // no-op
  },
  themeOverrides: {},
});

CustomTheme.displayName = 'Theme';

export const nullTheme = {};

export function usePageTheme(page: any) {
  const staticTheme = page.theme && page.theme.name ? page.theme : nullTheme;

  useCustomTheme(staticTheme.name, staticTheme);
}

export function useCustomTheme(name?: string, theme?: Partial<MadocTheme>) {
  const { setThemeOverrides, unsetThemeOverrides } = useContext(CustomTheme);

  useEffect(() => {
    if (name && theme) {
      setThemeOverrides(name, theme);
    }

    return () => {
      if (name) {
        unsetThemeOverrides(name);
      }
    };
  }, [setThemeOverrides, unsetThemeOverrides, name, theme]);
}

export const CustomThemeProvider: React.FC<{
  theme: any;
  themeOverrides: any;
  isTopLevel?: boolean;
}> = ({ theme, themeOverrides: initialThemeOverrides, children }) => {
  const [themeOverrides, setThemeOverrides] = useState<any>(initialThemeOverrides || {});

  const themeToUse = useMemo(() => {
    const overrides: Partial<MadocTheme>[] = Object.values(themeOverrides);
    const base = { ...theme };
    const custom = { ...(theme.custom || {}) };
    for (const override of overrides) {
      if (override) {
        Object.assign(base, override);
        Object.assign(custom, override.custom || {});
      }
    }

    base.custom = custom;

    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, themeOverrides]);

  const ctxSetThemeOverrides = useCallback((themeName: string, newTheme: any) => {
    setThemeOverrides((mapping: any) => {
      return { ...mapping, [themeName]: newTheme };
    });
  }, []);

  const ctxUnsetThemeOverrides = useCallback((themeName: string) => {
    setThemeOverrides((mapping: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [themeName]: old, ...existing } = mapping;

      return existing;
    });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ctxValue = useMemo(() => {
    return {
      themeOverrides,
      setThemeOverrides: ctxSetThemeOverrides,
      unsetThemeOverrides: ctxUnsetThemeOverrides,
    };
  }, [ctxSetThemeOverrides, ctxUnsetThemeOverrides, themeOverrides]);

  return (
    <CustomTheme.Provider value={ctxValue}>
      <ThemeProvider theme={themeToUse}>{children}</ThemeProvider>
    </CustomTheme.Provider>
  );
};
