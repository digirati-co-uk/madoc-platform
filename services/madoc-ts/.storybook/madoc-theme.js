import { create } from '@storybook/theming/create';

export default create({
    base: 'light',

    colorPrimary: '#5071F4',
    colorSecondary: '#666',

    // UI
    appBg: 'white',
    appContentBg: 'silver',
    appBorderColor: 'grey',
    appBorderRadius: 4,

    // Typography
    fontBase: '"Open Sans", sans-serif',
    fontCode: 'monospace',

    // Text colors
    textColor: 'black',
    textInverseColor: 'rgba(255,255,255,0.9)',

    // Toolbar default and active colors
    barTextColor: '#fff',
    barSelectedColor: 'rgba(255, 255, 255, .8)',
    barBg: '#333333',

    // Form colors
    inputBg: 'white',
    inputBorder: 'silver',
    inputTextColor: 'black',
    inputBorderRadius: 4,

    brandTitle: 'Madoc storybook',
    brandUrl: 'https://github.com/digirati-co-uk/madoc-platform',
    brandImage: 'https://raw.githubusercontent.com/digirati-co-uk/madoc-platform/master/madoc-logo.png',

});

