// Entry point for types/library.

export * from './frontend/shared/plugins/public-api';

import { Madoc as M } from './frontend/shared/plugins/globals';

declare global {
  const Madoc: typeof M;
}

export default M;
