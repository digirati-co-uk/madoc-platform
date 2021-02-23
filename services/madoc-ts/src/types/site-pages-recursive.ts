// These cannot be made into JSON schemas.

import { CreateNormalPageRequest, SiteSlot } from './schemas/site-page';

export type SitePage = CreateNormalPageRequest & {
  id: number;
  previousPaths?: string[];
  created: number;
  modified: number;
  author: { id: string; name: string };
  slug?: string;
  subpages?: SitePage[];
  slots: {
    [name: string]: SiteSlot;
  };
};
