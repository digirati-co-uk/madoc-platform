import React, { useEffect, useRef, useState } from 'react';
import { useDecayState } from '../../../../hooks/use-decay-state';
import { DownArrowIcon } from '../../../../icons/DownArrowIcon';
import { useSelectorHelper } from '../../../editor/stores/selectors/selector-helper';
import { resolveSelector } from '../../../helpers/resolve-selector';
import { useModelTranslation } from '../../../hooks/use-model-translation';
import { CaptureModel } from '../../../types/capture-model';
import { getEntityLabel } from '../../../utility/get-entity-label';
import { DocumentEntityLabel, DocumentHeading, DocumentSection } from '../ViewDocument.styles';
import { ViewSelector } from './ViewSelector';

export interface ViewEntityProps {
  collapsed?: boolean;
  entity: CaptureModel['document'];
  interactive?: boolean;
  fluidImage?: boolean;
  highlightRevisionChanges?: string;
  children: React.ReactNode;
}

export function ViewEntity({
  entity,
  collapsed,
  children,
  interactive = true,
  fluidImage,
  highlightRevisionChanges,
}: ViewEntityProps) {
  const ref = useRef<HTMLDivElement>(null);
  const helper = useSelectorHelper();
  const [isCollapsed, setIsCollapsed] = useState(collapsed || !!entity.selector);
  const selector = entity.selector ? resolveSelector(entity.selector, highlightRevisionChanges) : undefined;
  const selectorId = selector?.id;
  const { t: tModel } = useModelTranslation();
  const label = getEntityLabel(entity, undefined, false, tModel);
  const [isOn, trigger] = useDecayState();

  useEffect(() => {
    if (selectorId) {
      return helper.withSelector(selectorId).on('click', () => {
        trigger();
        setIsCollapsed(false);
        if (ref.current) {
          ref.current.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
      });
    }
  }, [helper, selectorId]);

  return (
    <DocumentSection data-highlighted={isOn} ref={ref}>
      <DocumentHeading
        onMouseEnter={() => (selectorId ? helper.highlight(selectorId) : null)}
        onMouseLeave={() => (selectorId ? helper.clearHighlight(selectorId) : null)}
        $interactive={interactive}
        onClick={() => (interactive ? setIsCollapsed(i => !i) : undefined)}
      >
        <DocumentEntityLabel style={{ display: 'flex', alignItems: 'center' }}>
          {selector && !fluidImage ? <ViewSelector small selector={selector} inline /> : null}
          <div style={{ flex: 1, paddingLeft: '0.5em' }}>{label}</div>
          {interactive ? (
            <DownArrowIcon
              style={
                isCollapsed
                  ? { transform: 'rotate(180deg)', fill: '#6c757d', width: '22px', height: '23px' }
                  : { transform: 'rotate(0deg)', fill: '#6c757d', width: '22px', height: '23px' }
              }
            />
          ) : null}
        </DocumentEntityLabel>
      </DocumentHeading>
      {/* This is where the shortened label goes, and where the collapse UI goes. Should be collapsed by default. */}
      {/* This is where the entity selector will go, if it exists. */}
      {isCollapsed ? null : (
        <>
          {selector && fluidImage ? (
            <ViewSelector
              selector={selector}
              fluidImage={fluidImage}
              highlightRevisionChanges={highlightRevisionChanges}
            />
          ) : null}
          {children}
        </>
      )}
    </DocumentSection>
  );
}
