export type ConfigResponse<T = any> = {
  query: {
    identifier: string | null;
    context: string[];
    service: string;
    scope_key: string | null;
    at_time: string | null;
  };
  config: Array<{
    id: string | null;
    scope_key: string;
    scope: string[];
    config_object: T;
  }>;
};
