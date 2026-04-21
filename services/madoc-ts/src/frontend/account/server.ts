import React from 'react';

// Silence warning.
React.useLayoutEffect = React.useEffect;

import AccountApp from './index';
import { createServerRenderer } from '../shared/utility/create-server-renderer';
import { routes } from './routes';

const apiGateway = process.env.API_GATEWAY as string;

export const render = createServerRenderer(AccountApp, routes, {}, apiGateway, {}, { disableDevLoading: true });
