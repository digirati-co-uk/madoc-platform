import React from 'react';
import { VerboseSelector } from '../../VerboseSelector';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultInlineSelector: EditorRenderingConfig['InlineSelector'] = () => {
  const [entity, { isTop }] = useCurrentEntity();
  const { configuration } = useSlotContext();

  if (!entity.selector) {
    return null;
  }

  return <VerboseSelector isTopLevel={isTop} readOnly={!configuration.allowEditing} selector={entity.selector} />;
};
