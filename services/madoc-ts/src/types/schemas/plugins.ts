import React from 'react';
import { NodeVM } from 'vm2';
import { RouteComponents } from '../../frontend/site/routes';
import { UniversalRoute } from '../../frontend/types';

export type SitePlugin = {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  installed: boolean;
  thumbnail?: string;
  siteId?: number;
  repository: {
    owner: string;
    name: string;
  };
  version: string;
  development:
    | { enabled: false }
    | {
        enabled: true;
        revision: string | null;
      };
};

export type PluginTokenRequest = {
  name: string;
  pluginId: string;
  isDevToken: boolean;
  expiresIn: number;
  tokenHash: string;
  scope: string[];
};

export type ModuleWrapper = {
  id: string;
  hookRoutes?: (routes: UniversalRoute[], components: RouteComponents) => UniversalRoute[];
  hookComponents?: (components: RouteComponents) => any;
  hookBlocks?: () => { [name: string]: React.FC<any> };
};
