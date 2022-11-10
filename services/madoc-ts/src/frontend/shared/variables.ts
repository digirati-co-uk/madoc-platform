import { themeVariable } from '../themes/helpers/themeVariable';
import { useAccessibleColor } from './hooks/use-accessible-color';
import { useSiteTheme } from './hooks/use-site';

export const BtnColor = () => {
  const siteTheme = useSiteTheme();
  const color = siteTheme?.theme.custom.buttons.color;
  return useAccessibleColor(color ? color : '#000000');
};

export const accent = themeVariable('accent', 'primary', {
  default: '#5b80b2',
});

export const globalBackground = themeVariable('header', 'globalBackground', {
  default: '#fff',
  dark: '#222',
  midnight: '#000',
});

export const globalFont = themeVariable('fonts', 'fontFamily', {
  default:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
});

export const buttonRadius = themeVariable('buttons', 'borderRadius', {
  default: '3px',
});

export const buttonColor = themeVariable('buttons', 'color', {
  default: '#4265e9',
});

export const searchBorder = themeVariable('header', 'searchBorder', {
  default: '2px solid #c2c2c2',
  dark: '2px solid #000',
  midnight: '2px solid #000',
});

export const searchBorderFocusColor = themeVariable('header', 'searchBorderFocusColor', {
  default: accent,
  midnight: accent,
  dark: accent,
});

export const footerBackground = themeVariable('footer', 'background', {
  dark: '#333',
  light: '#eee',
});

export const footerContainerBackground = themeVariable('footer', 'containerBackground', {
  dark: '#111',
  light: '#eee',
});

export const footerColor = themeVariable('footer', 'color', {
  light: '#999',
  dark: '#BBB',
});
