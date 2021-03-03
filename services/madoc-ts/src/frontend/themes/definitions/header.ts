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

type GetType<Var extends ThemeVariation<any, any>, T extends string> = Var extends ThemeVariation<
  {
    [key in T]: infer R;
  },
  any
>
  ? R
  : never;

type Test = GetType<HeaderTheme, 'headerBackground'>;
