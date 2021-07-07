export type ManifestDeletionSummary = {
  siteCount: number;
  fullDelete: boolean;
  deleteAllCanvases: boolean;
  search: {
    indexed: boolean;
    id: string;
  };
  tasks: number;
  parentTasks: number;
  models: number;
};

export type CollectionDeletionSummary = {
  siteCount: number;
  fullDelete: boolean;
  search: {
    indexed: boolean;
    id: string;
  }
  tasks: number;
  parentTasks: number;
};

// TODO can a canvas be in multiple manifests? can a canvas be in a capture model?
export type CanvasDeletionSummary = {
  siteCount: number;
  manifestCount: number;
  search: {
    indexed: boolean;
    id: string;
  }
  tasks: number;
  parentTasks: number;
};

export type ProjectDeletionSummary = {
  collectionCount: number;
  manifestCount: number;
  search: {
    indexed: boolean;
    id: string;
  };
  tasks: number;
  parentTasks: number;
}
