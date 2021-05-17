export type ResourceLinkResponse<T = { [key: string]: any }> = {
  id: number;
  resource_id: number;
  property: string;
  source?: string;
  link: {
    id: string;
    label: string;
    type?: string;
    format?: string;
    motivation?: string;
  } & T;
  file?: {
    path: string;
    bucket: string;
    hash?: string;
  };
};
