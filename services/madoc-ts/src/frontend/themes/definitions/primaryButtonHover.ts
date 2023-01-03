import { ThemeVariation } from './types';

export type PrimaryButtonHover = ThemeVariation<
  {
    color: string;
    background: string;
    border: string;
  },
  'default'
>;
