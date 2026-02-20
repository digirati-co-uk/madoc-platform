import type { Collection as IIIFCollection, InternationalString } from '@iiif/presentation-3';
import type { TabularProjectSetupPayload } from '../../../../components/tabular/cast-a-net/types';

export type IiifSelectionLink = {
  id?: string | number;
  type?: string | number;
};

export type IiifSelectionLinkValue = IiifSelectionLink | string | number;

export type IiifSelectionResource = {
  id?: string | number;
  type?: string | number;
  partOf?: IiifSelectionLinkValue | IiifSelectionLinkValue[];
};

export type IiifSelectionPayload = IiifSelectionResource & {
  resource?: IiifSelectionResource | string | number;
  parent?: IiifSelectionResource | string | number | null;
};

export type TabularOutlineSharePayload = {
  label?: InternationalString;
  summary?: InternationalString;
  slug?: string;
  enableZoomTracking?: boolean;
  iiif?: {
    manifestId?: string;
    canvasId?: string;
  };
  tabular?: TabularProjectSetupPayload;
};

export type IiifHistoryItem = {
  url: string;
  route: string;
  resource: string | null;
  metadata?: {
    type?: string;
    label?: InternationalString;
  };
  timestamp?: string | null;
};

export type MadocCollectionSnippet = {
  id: number;
  label: InternationalString;
  thumbnail: string | null;
};

export type MadocManifestSnippet = {
  id: number;
  label: InternationalString;
  thumbnail: string | null;
};

export type TabularWizardStep = {
  id: number;
  label: string;
  disabled?: boolean;
};

export type IiifHomeStats = {
  collections: number;
  manifests: number;
};

export type IiifHomeCollection = IIIFCollection;
