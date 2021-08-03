import React, { useContext } from 'react';
import { ResolvedTheme } from '../../../types/themes';
import { PublicSite } from '../../../utility/omeka-api';

const SiteReactContext = React.createContext<
  | {
      site: PublicSite;
      user?: { id: number; name: string; scope: string[] };
      supportedLocales: Array<{ code: string; label: string }>;
      contentLanguages: Array<{ label: string; code: string }>;
      displayLanguages: Array<{ label: string; code: string }>;
      defaultLocale: string;
      navigationOptions: {
        enableProjects?: boolean;
        enableCollections?: boolean;
      };
      theme?: ResolvedTheme | null;
    }
  | undefined
>(undefined);

export const useSiteTheme = () => {
  const details = useContext(SiteReactContext);

  return details?.theme;
};

export const useSite = () => {
  const details = useContext(SiteReactContext);

  return details?.site as PublicSite;
};

export const useUser = () => {
  const details = useContext(SiteReactContext);

  return details?.user;
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
