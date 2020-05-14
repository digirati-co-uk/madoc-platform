export type MetadataDefinition = {
  id?: number;
  language: string;
  value: string;
  key: string;
  source?: string;
  edited?: boolean;
  auto_update?: boolean;
  readonly?: boolean;
  data?: any;
};
