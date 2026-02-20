import 'iiif-browser';

type IIIFBrowserTypesenseDocument = {
  id?: string | number;
  resource_id?: string | number;
  resource_label?: string;
  sort_label?: string;
  thumbnail?: string;
  manifest_ids?: string[];
  manifest_id?: string;
  [key: string]: unknown;
};

type IIIFBrowserTypesenseHighlight = {
  snippet?: string | null;
};

type IIIFBrowserTypesenseHit = {
  document: IIIFBrowserTypesenseDocument;
  highlights?: IIIFBrowserTypesenseHighlight[];
};

type IIIFBrowserExternalSearchResult = {
  id: string;
  label: string;
  thumbnail: string | null;
  summary: string | null;
  kind: 'external';
  resourceId: string;
  resourceType: 'Manifest' | string;
  metadata: IIIFBrowserTypesenseDocument;
};

type IIIFBrowserSearchOptions = {
  enableWithinCollection: boolean;
  enableExternal: boolean;
  combination: {
    mode: 'externalFirst' | 'withinFirst' | 'parallel';
    maxExternalResults: number;
  };
  typesense: {
    host: string;
    port: string;
    protocol: string;
    path: string;
    collection: string;
    searchParams: {
      query_by: string;
      per_page: number;
      [key: string]: string | number | boolean;
    };
    mapHitToResult: (hit: IIIFBrowserTypesenseHit) => IIIFBrowserExternalSearchResult;
  };
  externalSectionLabel?: string;
};

declare module 'iiif-browser' {
  interface IIIFBrowserProps {
    search?: IIIFBrowserSearchOptions;
  }
}
