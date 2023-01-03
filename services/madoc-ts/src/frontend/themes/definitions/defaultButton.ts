import { ThemeVariation } from './types';

export type DefaultButton = ThemeVariation<
  {
    color: string;
    borderRadius: string;
    border: string;
    hover: {
      color: string;
      background: string;
      border: string;
    };
    active: {
      color: string;
      background: string;
      border: string;
    };
    focus: {
      color: string;
      background: string;
      border: string;
    };
  },
  'default'
>;
