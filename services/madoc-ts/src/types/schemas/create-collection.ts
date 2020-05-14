import { CollectionNormalized } from '@hyperion-framework/types';

export type CreateCollection = {
  collection: Partial<CollectionNormalized>;
  taskId?: string;
  flat?: boolean;
};
