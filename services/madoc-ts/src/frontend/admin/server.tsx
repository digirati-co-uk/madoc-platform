// Fetch data
// Send data to component
// Render component to string
// Add inline script tag for bootstrapped data
import React from 'react';

// Silence warning.
React.useLayoutEffect = React.useEffect;

import AdminApp from './index';
import { queryConfig } from './query-config';
import { routes } from './routes';
import { createServerRenderer } from '../shared/utility/create-server-renderer';
import { apiGateway } from '../../gateway/api.server';

export const render = createServerRenderer(AdminApp as any, routes, {}, apiGateway, queryConfig);
