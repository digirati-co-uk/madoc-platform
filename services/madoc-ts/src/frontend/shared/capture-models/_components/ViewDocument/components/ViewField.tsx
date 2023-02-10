import React, { useEffect, useRef } from 'react';
import { useDecayState } from '../../../../hooks/use-decay-state';
import { FieldPreview } from '../../../editor/components/FieldPreview/FieldPreview';
import { useSelectorHelper } from '../../../editor/stores/selectors/selector-helper';
import { resolveSelector } from '../../../helpers/resolve-selector';
import { BaseField } from '../../../types/field-types';
import { FieldSection } from '../ViewDocument.styles';
import { ViewSelector } from './ViewSelector';

export function ViewField({ field, fluidImage }: { field: BaseField; fluidImage?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const helper = useSelectorHelper();
  const selector = field.selector ? resolveSelector(field.selector) : undefined;
  const selectorId = selector?.id;
  const [isOn, trigger] = useDecayState();

  useEffect(() => {
    if (selectorId) {
      return helper.withSelector(selectorId).on('click', () => {
        trigger();
        if (ref.current) {
          ref.current.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
      });
    }
  }, [helper, selectorId]);

  useEffect(() => {
    if (selectorId) {
      return helper.withSelector(selectorId).on('hover', () => {
        trigger();
        if (ref.current) {
          ref.current.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
      });
    }
  }, [helper, selectorId]);

  if (!field.selector) {
    return <FieldPreview key={field.id} field={field} />;
  }

  return (
    <FieldSection
      ref={ref}
      key={field.id}
      onMouseEnter={() => (selectorId ? helper.highlight(selectorId) : null)}
      onMouseLeave={() => (selectorId ? helper.clearHighlight(selectorId) : null)}
      data-highlighted={isOn}
    >
      <ViewSelector selector={field.selector} fluidImage={fluidImage} />
      <FieldPreview field={field} />
    </FieldSection>
  );
}
