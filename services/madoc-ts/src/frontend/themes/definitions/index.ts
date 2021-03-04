import { FooterTheme } from './footer';
import { HeaderTheme } from './header';
import { AccentTheme } from './accent';
import { SiteContainerTheme } from './site-container';

export type ThemeDefinitions = {
  header: HeaderTheme;
  accent: AccentTheme;
  siteContainer: SiteContainerTheme;
  footer: FooterTheme;
};
