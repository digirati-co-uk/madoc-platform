import React, { useContext } from 'react';
import { PublicSite } from '../../../utility/omeka-api';

const SiteReactContext = React.createContext<
  | {
      site: PublicSite;
      user?: { id: number; name: string; scope: string[] };
      supportedLocales: string[];
      defaultLocale: string;
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

export const useSupportedLocales = () => {
  const details = useContext(SiteReactContext);

  return details?.supportedLocales || ['en'];
};

export const useDefaultLocale = () => {
  const details = useContext(SiteReactContext);

  return details?.defaultLocale || 'en';
};

export const SiteProvider = SiteReactContext.Provider;
