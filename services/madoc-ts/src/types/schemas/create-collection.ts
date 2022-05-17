// import { CollectionNormalized } from '@iiif/presentation-3';

export type CreateCollection = {
  // collection: Partial<CollectionNormalized>;
  collection: any;
  taskId?: string;
  flat?: boolean;
};
