import { ThemeVariation } from './types';

export type Fonts = ThemeVariation<
  {
    fontFamily: string;
    fontFamilyMono: string;
  },
  'default'
>;
