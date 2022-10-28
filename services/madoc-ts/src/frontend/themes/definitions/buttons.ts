import { ThemeVariation } from './types';

export type ButtonsTheme = ThemeVariation<
  {
    solid: boolean;
    color: string;
    borderRadius: 'round' | 'med' | 'square';
  },
  'default'
>;
