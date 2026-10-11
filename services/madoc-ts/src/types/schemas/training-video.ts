export interface TrainingVideoWatchedRequest {
  projectId: number;
}

/** Project id → date the user marked the project's training video as watched. */
export interface TrainingVideoWatchedResponse {
  watched: Record<string, string>;
}
