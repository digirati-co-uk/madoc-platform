import { MadocTheme } from '../../frontend/themes/definitions/types';

export type BaseTheme = {
  name: string;
  version: string;
  description?: string;
  thumbnail?: string;
  theme: MadocTheme;
};
