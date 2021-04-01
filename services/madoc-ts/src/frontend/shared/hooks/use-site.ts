import React, { useContext } from 'react';
import { PublicSite } from '../../../utility/omeka-api';

const SiteReactContext = React.createContext<
  | {
      site: PublicSite;
      user?: { id: number; name: string; scope: string[] };
      supportedLocales: Array<{ code: string; label: string }>;
      defaultLocale: string;
      navigationOptions: {
        enableProjects?: boolean;
        enableCollections?: boolean;
      };
    }
  | undefined
>(undefined);

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

  return details?.supportedLocales || [{ label: 'English', code: 'en' }];
};

export const useSupportedLocales = () => {
  const details = useContext(SiteReactContext);

  return details?.supportedLocales.map(r => r.code) || ['en'];
};

export const useDefaultLocale = () => {
  const details = useContext(SiteReactContext);

  return details?.defaultLocale || 'en';
};

export const SiteProvider = SiteReactContext.Provider;
