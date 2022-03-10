import { Target } from '../../types/capture-model';
import { ContentOptions } from '../../types/content-types';
import { PluginContext } from '../context';
import React, { useContext } from 'react';

export function useContentType<Custom = any>(target?: Target[], options: ContentOptions<Custom> = {}, children = []) {
  const ctx = useContext(PluginContext);

  if (!target) {
    return null;
  }

  const keys = Object.keys(ctx.contentTypes);
  for (const key of keys) {
    const type = ctx.contentTypes[key];
    if (type && type.supports(target, options)) {
      return React.createElement(
        type.DefaultComponent,
        {
          state: type.targetToState(target, options),
          options,
        } as any,
        children
      );
    }
  }
  return null;
}
