// Fetch data
// Send data to component
// Render component to string
// Add inline script tag for bootstrapped data
import React from 'react';

// Silence warning.
React.useLayoutEffect = React.useEffect;

import SiteApp from './index';
import { createRoutes } from './routes';
import { createServerRenderer } from '../shared/utility/create-server-renderer';
import * as components from './components';

const apiGateway = process.env.API_GATEWAY as string;

export const render = createServerRenderer(SiteApp, createRoutes, components, apiGateway);
