import { ThemeVariation } from './types';

export type FooterTheme = ThemeVariation<
  {
    background: string;
    containerBackground: string;
    color: string;
  },
  'light' | 'dark'
>;
