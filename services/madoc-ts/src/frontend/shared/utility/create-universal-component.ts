import { ApiClient } from '../../../gateway/api';
import React from 'react';
import { QueryComponent } from '../../types';
import { AdditionalHooks } from '../hooks/use-api-query';

export function createUniversalComponent<
  Definition extends { query: any; params: any; variables: any; data: any },
  GetData = (
    key: string,
    vars: Definition['variables'],
    api: ApiClient,
    pathname: string
  ) => Promise<Definition['data']> | Definition['data'],
  Ret = [string, Definition['variables']],
  GetKey = (params: Definition['params'], query: Definition['query'], pathname: string) => Ret
>(
  Component: React.FC,
  options: {
    getKey?: GetKey;
    getData?: GetData;
    hooks?: AdditionalHooks[];
  }
): QueryComponent<Definition['data'], string, Definition['variables'], Definition['params'], Definition['query']> {
  const ReturnComponent: any = React.memo(Component);
  ReturnComponent.displayName = 'PageComponent';
  ReturnComponent.getKey = options.getKey;
  ReturnComponent.getData = options.getData;
  ReturnComponent.hooks = options.hooks;
  return ReturnComponent;
}
