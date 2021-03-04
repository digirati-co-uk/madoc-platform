import { ThemeVariation } from './types';

export type SiteContainerTheme = ThemeVariation<
  {
    containerBackground: string;
    background: string;
  },
  'default' | 'dark' | 'light'
>;
