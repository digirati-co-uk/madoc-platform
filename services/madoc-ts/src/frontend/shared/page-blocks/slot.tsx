import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../callouts/ErrorMessage';
import { ErrorBoundary } from '../utility/error-boundary';
import { RenderBlankSlot } from './render-blank-slot';
import { RenderSlot } from './render-slot';
import { useSlots } from './slot-context';

export interface SlotProps {
  id?: string;
  name: string;
  label?: string;
  hidden?: boolean;
  layout?: string;
  noSurface?: boolean;
  small?: boolean;
  source?: { type: string; id: string };
  children?: React.ReactNode;
}

export const Slot: React.FC<SlotProps> = props => {
  const { t } = useTranslation();
  const { slots, context, editable, onUpdateSlot, onUpdateBlock, invalidateSlots, pagePath } = useSlots();

  const slot = slots[props.name];

  const slotId = slot ? slot.id : undefined;
  const updateSlot = useCallback(() => (slotId ? onUpdateSlot(slotId) : undefined), [onUpdateSlot, slotId]);
  const onError = (e: any) => {
    return (
      <ErrorMessage $banner $margin>
        <h4>{t('Slot error {{slotId}}', { slotId: props.id || '' })}</h4>
        <p>{t('Part of this page crashed')}</p>
        <pre>{e.toString()}</pre>
      </ErrorMessage>
    );
  };

  if (props.hidden && !editable) {
    return null;
  }

  if (!slot) {
    return (
      <ErrorBoundary onError={onError}>
        <RenderBlankSlot id={props.id} name={props.name} source={props.source} layout={props.layout}>
          {props.children}
        </RenderBlankSlot>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <RenderSlot
        id={props.id}
        small={props.small}
        noSurface={props.noSurface}
        layout={props.layout}
        slot={slot}
        context={context}
        editable={editable}
        onUpdateSlot={updateSlot}
        onUpdateBlock={onUpdateBlock}
        invalidateSlots={invalidateSlots}
        defaultContents={props.children}
        pagePath={pagePath}
        source={props.source}
      />
    </ErrorBoundary>
  );
};
