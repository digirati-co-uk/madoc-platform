import { addons } from '@storybook/addons';
import madocTheme from './madoc-theme';

addons.setConfig({
    theme: madocTheme,
    // sidebarAnimations: false,
    // selectedPanel: 'docs',
});
