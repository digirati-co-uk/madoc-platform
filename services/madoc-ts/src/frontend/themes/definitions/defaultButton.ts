import { ThemeVariation } from './types';

export type DefaultButton = ThemeVariation<
  {
    color: string;
    borderRadius: string;
    border: string;
  },
  'default'
>;