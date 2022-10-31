import { themeVariable } from '../themes/helpers/themeVariable';

export const accent = themeVariable('accent', 'primary', {
  default: '#5b80b2',
});

export const globalFont = themeVariable('fonts', 'fontFamily', {
  default:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
});

export const buttonRadius = themeVariable('buttons', 'borderRadius', {
  default: '12px',
});

export const buttonColor = themeVariable('buttons', 'color', {
  default: '#bd11ee',
});
