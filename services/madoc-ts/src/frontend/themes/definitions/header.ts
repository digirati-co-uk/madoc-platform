import { ThemeVariation } from './types';

export type HeaderTheme = ThemeVariation<
  {
    headerBackground: string;
    globalBackground: string;
    menuHoverBackground: string;
    headerText: string;
    searchBorder: string;
    searchBorderFocusColor: string;
    size: number;
  },
  'default' | 'midnight' | 'dark'
>;
