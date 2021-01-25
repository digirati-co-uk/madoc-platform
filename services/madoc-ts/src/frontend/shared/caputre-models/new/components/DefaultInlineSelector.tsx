import React from 'react';
import { VerboseSelector } from '../../VerboseSelector';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { EditorRenderingConfig } from './EditorSlots';

export const DefaultInlineSelector: EditorRenderingConfig['InlineSelector'] = () => {
  const [entity, { isTop }] = useCurrentEntity();

  if (!entity.selector || entity.immutable) {
    return null;
  }

  return <VerboseSelector isTopLevel={isTop} readOnly={false} selector={entity.selector} />;
};
