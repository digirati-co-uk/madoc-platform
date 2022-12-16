import { ThemeVariation } from './types';

export type PrimaryButtonTheme = ThemeVariation<
  {
    color: string;
    background: string;
    borderRadius: string;
    border: string;
    hover: {
      color: string;
      background: string;
      border: string;
    };
    active:
      | {
          color: string;
          background: string;
          border: string;
        }
      | 'defualt';
    focus: {
      color: string;
      background: string;
      border: string;
    };
  },
  'default'
>;

export type DefaultButtonsTheme = ThemeVariation<
  {
    button: {
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
    };
  },
  'default'
>;
