import { FooterTheme } from './footer';
import { GlobalTheme } from './global';
import { HeaderTheme } from './header';
import { AccentTheme } from './accent';
import { Fonts } from './fonts';
import { SiteContainerTheme } from './site-container';
import { DefaultButtonsTheme, PrimaryButtonTheme} from './buttons';

export type ThemeDefinitions = {
  header: HeaderTheme;
  accent: AccentTheme;
  siteContainer: SiteContainerTheme;
  footer: FooterTheme;
  global: GlobalTheme;
  fonts: Fonts;
  primaryButton: PrimaryButtonTheme;
  defaultButton: DefaultButtonsTheme;
};
