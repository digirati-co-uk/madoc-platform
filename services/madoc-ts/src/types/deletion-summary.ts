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
