import { ThemeVariation } from './types';

export type PrimaryButton = ThemeVariation<
  {
    color: string;
    background: string;
    borderRadius: string;
    border: string;
  },
  'default'
>;

