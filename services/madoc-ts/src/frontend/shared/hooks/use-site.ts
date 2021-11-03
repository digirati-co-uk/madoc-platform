import React, { useContext } from 'react';
import { CurrentUserWithScope, SystemConfig, Site } from '../../../extensions/site-manager/types';
import { ResolvedTheme } from '../../../types/themes';

const SiteReactContext = React.createContext<
  | {
      site: Site;
      user?: CurrentUserWithScope;
      supportedLocales: Array<{ code: string; label: string }>;
      contentLanguages: Array<{ label: string; code: string }>;
      displayLanguages: Array<{ label: string; code: string }>;
      defaultLocale: string;
      navigationOptions: {
        enableProjects?: boolean;
        enableCollections?: boolean;
      };
      theme?: ResolvedTheme | null;
      setSite: (site: Site) => void;
      formResponse?: any;
      systemConfig: SystemConfig;
      clearFormResponse?: () => void;
      updateSystemConfig?: (config: SystemConfig) => void;
    }
  | undefined
>(undefined);

export const useSiteTheme = () => {
  const details = useContext(SiteReactContext);

  return details?.theme;
};

export const useSystemConfig = () => {
  const details = useContext(SiteReactContext);

  return details?.systemConfig as SystemConfig;
};

const noOp = () => {
  // no-op
};

export const useUpdateSystemConfig = () => {
  const details = useContext(SiteReactContext);

  return details?.updateSystemConfig || noOp;
};

export const useClearFormResponse = () => {
  const details = useContext(SiteReactContext);

  return details?.clearFormResponse || noOp;
};

export const useFormResponse = <T>() => {
  const details = useContext(SiteReactContext);

  return details?.formResponse as T | undefined;
};

export const useSite = () => {
  const details = useContext(SiteReactContext);

  return details?.site as Site;
};

export const useSetSite = () => {
  const details = useContext(SiteReactContext);

  return details?.setSite || noOp;
};

export const useUser = () => {
  const details = useContext(SiteReactContext);

  return details?.user;
};

export const useUserPermissions = () => {
  const user = useUser();
  const isAdmin =
    user && user.scope && (user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('tasks.admin') !== -1);
  const canProgress = user && user.scope && user.scope.indexOf('tasks.create') !== -1;

  return {
    user,
    isAdmin,
    canProgress,
  };
};

export const useNavigationOptions = () => {
  const details = useContext(SiteReactContext);

  return (
    details?.navigationOptions || {
      enableProjects: true,
      enableCollections: true,
    }
  );
};

export const useDetailedSupportLocales = () => {
  const details = useContext(SiteReactContext);

  return details?.displayLanguages || [{ label: 'English', code: 'en' }];
};

export const useSupportedLocales = () => {
  const details = useContext(SiteReactContext);

  return details?.contentLanguages.map(r => r.code) || ['en'];
};

export const useDefaultLocale = () => {
  const details = useContext(SiteReactContext);

  return details?.defaultLocale || 'en';
};

export const SiteProvider = SiteReactContext.Provider;
