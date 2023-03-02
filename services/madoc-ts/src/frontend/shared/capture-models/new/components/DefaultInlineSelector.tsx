import React from 'react';
import { VerboseSelector } from '../../VerboseSelector';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';
import { useResolvedSelector } from '../hooks/use-resolved-selector';

export const DefaultInlineSelector: EditorRenderingConfig['InlineSelector'] = () => {
  const [entity, { isTop }] = useCurrentEntity();
  const { configuration } = useSlotContext();
  const [selector] = useResolvedSelector(entity);

  if (!selector) {
    return null;
  }

  return <VerboseSelector isTopLevel={isTop} readOnly={!configuration.allowEditing} selector={selector} />;
};
