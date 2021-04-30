import { ThemeVariation } from './types';

export type GlobalTheme = ThemeVariation<
  {
    maxWidth: string;
  },
  'default'
>;
