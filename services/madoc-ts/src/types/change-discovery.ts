import { InternationalString, Manifest } from '@hyperion-framework/types';

/**
 * Madoc change discovery implementation.
 *
 * - 1. Genesis - on initial start up, check for existing resources that do not have create events via configured endpoint.
 * - 2. Track creation events - a simple API to post events.
 * - 3. Publish endpoints for tracking those changes.
 */

export type ChangeDiscoveryActivity = {
  id: string;
  type: ChangeDiscoveryActivityType;
  object: ChangeDiscoveryObject;
};

export type ChangeDiscoveryBaseObject = {
  id: string;
  canonical?: string;
  type: 'Collection' | 'Manifest'; // Technically also: Range, Canvas etc.
  seeAlso?: ChangeDiscoverySeeAlso[];
  provider?: Manifest;
  endTime?: string; // xsd:dateTime
  startTime?: string; // xsd:dateTime
  summary?: string;
  actor?: {
    id: string;
    type: 'Person' | 'Application' | 'Organization';
  };
};

export type ChangeDiscoveryGenesisRequest = {
  ids: string[];
};

export type ChangeDiscoveryGenesisResponse = {
  prefix: string;
  ids: string[];
};

export type ChangeDiscoveryObject = ChangeDiscoveryBaseObject & {
  target: ChangeDiscoveryBaseObject;
};

export type ChangeDiscoveryImplementationState = {
  processItems: any[];
  lastCrawl: number;
  onlyDelete: boolean;
};

export type ActivityCollectionProcessor = (
  collection: ActivityOrderedCollection,
  state: ChangeDiscoveryImplementationState
) => ChangeDiscoveryImplementationState;

export type ActivityPageProcessor = (
  page: ActivityOrderedCollectionPage,
  state: ChangeDiscoveryImplementationState
) => ChangeDiscoveryImplementationState;

export type ChangeDiscoveryActivityType = 'Create' | 'Update' | 'Delete' | 'Move' | 'Add' | 'Remove';

export type ChangeDiscoverySeeAlso = {
  id: string;
  type: 'Dataset';
  format: string;
  label: InternationalString;
  profile: string;
};

export type ActivityOrderedCollection = {
  '@context': 'http://iiif.io/api/discovery/1/context.json' | string[];
  id: string;
  type: 'OrderedCollection';
  first?: {
    id: string;
    type: 'OrderedCollectionPage';
  };
  last: {
    id: string;
    type: 'OrderedCollectionPage';
  };
  totalItems?: number;
  seeAlso?: ChangeDiscoverySeeAlso[];
  partOf?: Array<{
    id: string;
    type: 'OrderedCollection';
  }>;
  rights: string;
};

export type ActivityOrderedCollectionPage = {
  '@context': 'http://iiif.io/api/discovery/1/context.json' | string[];
  id: string;
  type: 'OrderedCollectionPage';
  partOf?: {
    id: string;
    type: 'OrderedCollection';
  };
  startIndex?: number;
  next?: {
    id: string;
    type: 'OrderedCollectionPage';
  };
  prev?: {
    id: string;
    type: 'OrderedCollectionPage';
  };
  orderedItems: ChangeDiscoveryActivity[];
};
