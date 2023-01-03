import { FooterTheme } from './footer';
import { GlobalTheme } from './global';
import { HeaderTheme } from './header';
import { AccentTheme } from './accent';
import { Fonts } from './fonts';
import { SiteContainerTheme } from './site-container';
import { DefaultButton } from './defaultButton';
import { PrimaryButton, primaryButtonHover } from './primaryButton';

export type ThemeDefinitions = {
  header: HeaderTheme;
  accent: AccentTheme;
  siteContainer: SiteContainerTheme;
  footer: FooterTheme;
  global: GlobalTheme;
  fonts: Fonts;
  primaryButton: PrimaryButton;
  primaryButtonHover: primaryButtonHover;
  defaultButton: DefaultButton;
};
