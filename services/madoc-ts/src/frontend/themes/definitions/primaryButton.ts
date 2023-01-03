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

export type primaryButtonHover = ThemeVariation<
  {
    color: string;
    background: string;
    border: string;
  },
  'default'
>;
