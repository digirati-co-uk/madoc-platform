import { FooterTheme } from './footer';
import { GlobalTheme } from './global';
import { HeaderTheme } from './header';
import { AccentTheme } from './accent';
import { Fonts } from './fonts';
import { SiteContainerTheme } from './site-container';

export type ThemeDefinitions = {
  header: HeaderTheme;
  accent: AccentTheme;
  siteContainer: SiteContainerTheme;
  footer: FooterTheme;
  global: GlobalTheme;
  fonts: Fonts;
};

console.log()