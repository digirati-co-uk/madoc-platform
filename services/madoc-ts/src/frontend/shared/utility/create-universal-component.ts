import { ApiClient } from '../../../gateway/api';
import React from 'react';
import { QueryComponent, UniversalRoute } from '../../types';

export function createUniversalComponent<Definition extends { query: any; params: any; variables: any; data: any },
  GetData = (
    key: string,
    vars: Definition['variables'],
    api: ApiClient
  ) => Promise<Definition['data']> | Definition['data'],
  GetKey = (params: Definition['params'], query: Definition['query']) => [string, Definition['variables']]>(
  Component: React.FC<{ route: UniversalRoute }>,
  options: {
    getKey?: GetKey;
    getData?: GetData;
  }
): QueryComponent<Definition['data'], string, Definition['variables'], Definition['params'], Definition['query']> {
  const ReturnComponent: any = Component;
  ReturnComponent.displayName = 'PageComponent';
  ReturnComponent.getKey = options.getKey;
  ReturnComponent.getData = options.getData;
  return ReturnComponent;
}
