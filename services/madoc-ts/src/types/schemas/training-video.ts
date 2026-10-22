export interface TrainingVideoWatchedRequest {
  /**
   * @TJS-type integer
   * @minimum 1
   * @maximum 9007199254740991
   */
  projectId: number;
}

/** Project id → date the user marked the project's training video as watched. */
export interface TrainingVideoWatchedResponse {
  watched: Record<string, string>;
}
