import React from 'react';
import styled from 'styled-components';
import { BaseField } from '../../../types/field-types';
import { FieldPreview } from '../FieldPreview/FieldPreview';
import { Revisions } from '../../stores/revisions/index';
import { SelectorPreview } from '../SelectorPreview/SelectorPreview';
import ReactTooltip from 'react-tooltip';

const PreviewListContainer = styled.div`
  & ~ & {
    margin-top: 1.5em;
  }
`;

const PreviewList = styled.div`
  background: rgba(5, 42, 68, 0.1);
  padding: 0.5em;
  border-radius: 3px;
`;

const PreviewLabel = styled.div`
  font-size: 1em;
  font-weight: 600;
  margin-bottom: 0.5em;
`;

export const FieldInstanceReadOnly: React.FC<{
  fields: Array<BaseField>;
  showSelectorPreview?: boolean;
}> = ({ fields, showSelectorPreview }) => {
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);
  const previewData = Revisions.useStoreState(s => s.selector.selectorPreviewData);

  return (
    <PreviewListContainer>
      <PreviewLabel>{fields[0].label}</PreviewLabel>
      <PreviewList>
        {fields.map(field => (
          <span key={field.id}>
            <span data-for={field.id} data-tip="">
              <FieldPreview key={field.id} field={field} />
            </span>
            {showSelectorPreview && field.selector && field.selector.state ? (
              <ReactTooltip id={field.id} effect="solid" backgroundColor="#000" aria-haspopup="true">
                <SelectorPreview
                  selector={field.selector}
                  chooseSelector={chooseSelector}
                  currentSelectorId={currentSelectorId}
                  selectorPreview={field.selector ? previewData[field.selector.id] : undefined}
                />
              </ReactTooltip>
            ) : null}
          </span>
        ))}
      </PreviewList>
    </PreviewListContainer>
  );
};
