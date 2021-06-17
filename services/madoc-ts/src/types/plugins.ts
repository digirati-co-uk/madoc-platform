import React from 'react';
import { RouteComponents } from '../frontend/site/routes';
import { UniversalRoute } from '../frontend/types';

export type PluginRow = {
  plugin_id: string;
  name: string;
  description?: string | null;
  repository: string;
  thumbnail?: string;
  repository_owner: string;
  version: string;
  installed: boolean;
};

export type PluginSiteRow = {
  plugin_id: string;
  site_id: number;
  enabled: boolean;
  dev_mode: boolean;
  dev_revision?: string | null;
};

export type PluginTokenRow = {
  id: string;
  name: string;
  token_hash: string;
  expires_in: number;
  created_at?: number;
  revoked: boolean;
  dev_token: boolean;
  user_id: number;
  last_used?: number | null;
  scope: string[];
  plugin_id: string;
  site_id: number;
};

export type RemotePlugin = {
  name: string;
  owner: {
    name: string;
    logo?: string;
    url: string;
  };
  description: string;
  enabled: boolean;
  installed: boolean;
  installable: boolean;
  upToDate: boolean;
  url: string;
  stars: number;
  issues: number;
  license: null | {
    name: string;
    key: string;
    spdx_id: string;
  };
  installedVersion: string;
  latestVersion: string | null;
  versions: string[];
};

export type ModuleWrapper = {
  id: string;
  hookRoutes?: (routes: UniversalRoute[], components: RouteComponents) => UniversalRoute[];
  hookComponents?: (components: RouteComponents) => any;
  hookBlocks?: () => { [name: string]: React.FC<any> };
};
