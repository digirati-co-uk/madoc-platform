import { JSONSchema7 } from 'json-schema';

export type ApiDefinition = {
  id: string;
  name: string;
  description: string[];
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params: JSONSchema7 | null;
  scope: string[];
  query: JSONSchema7 | null;
  body: JSONSchema7 | null;
  options?: {
    queryArrayType: 'bracket' | 'index' | 'comma' | 'separator' | 'none';
  };
};

export type ApiRequest<
  Type extends string,
  T extends {
    params?: any | never;
    query?: any | never;
    body?: any | never;
  }
> = {
  id: Type;
  params: T['params'];
  query: T['query'];
  body: T['body'];
};
