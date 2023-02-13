import React, { useEffect, useRef } from 'react';
import { useDecayState } from '../../../../hooks/use-decay-state';
import { FieldPreview } from '../../../editor/components/FieldPreview/FieldPreview';
import { useSelectorHelper } from '../../../editor/stores/selectors/selector-helper';
import { resolveSelector } from '../../../helpers/resolve-selector';
import { BaseField } from '../../../types/field-types';
import { FieldSection } from '../ViewDocument.styles';
import { ViewSelector } from './ViewSelector';

export function ViewField({
  field,
  fluidImage,
  revisionId,
}: {
  field: BaseField;
  fluidImage?: boolean;
  revisionId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const helper = useSelectorHelper();

  const selector = field.selector ? resolveSelector(field.selector, revisionId) : undefined;
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

  if (!selector) {
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
      <ViewSelector selector={selector} fluidImage={fluidImage} />
      <FieldPreview field={field} />
    </FieldSection>
  );
}
