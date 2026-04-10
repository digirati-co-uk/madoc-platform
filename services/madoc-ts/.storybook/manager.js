import { addons } from 'storybook/manager-api';
import madocTheme from './madoc-theme';

addons.setConfig({
    theme: madocTheme,
    // sidebarAnimations: false,
    // selectedPanel: 'docs',
});
