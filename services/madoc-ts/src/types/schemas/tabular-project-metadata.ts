/** @additionalProperties false */
export interface TabularProjectMetadataUpdate {
  crowdsourcingInstructions?: string;
  columns?: TabularColumnMetadataUpdate[];
}

/** @additionalProperties false */
export interface TabularColumnMetadataUpdate {
  /** @minLength 1 */
  id: string;
  /** @minLength 1
   * @maxLength 160
   */
  label: string;
  helpText: string;
}
