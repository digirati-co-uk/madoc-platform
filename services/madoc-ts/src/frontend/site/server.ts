// Fetch data
// Send data to component
// Render component to string
// Add inline script tag for bootstrapped data
import React from 'react';

// Silence warning.
React.useLayoutEffect = React.useEffect;

import SiteApp from './index';
import { createRoutes } from './routes';
import * as components from './components';
import { createServerRenderer } from '../shared/utility/create-server-renderer';
import { apiGateway } from '../../gateway/api.server';

export const render = createServerRenderer(SiteApp, createRoutes(components), apiGateway);
