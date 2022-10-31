import { ThemeVariation } from './types';

export type ButtonsTheme = ThemeVariation<
  {
    color: string;
    borderRadius: string;
  },
  'default'
>;
