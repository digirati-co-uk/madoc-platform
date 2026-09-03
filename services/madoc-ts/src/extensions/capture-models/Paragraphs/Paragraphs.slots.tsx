import React, { useState } from 'react';
import { InlineReadonlyValue } from '../../../frontend/shared/capture-models/new/components/DefaultInlineField';
import { ProfileConfig, useSlotContext } from '../../../frontend/shared/capture-models/new/components/EditorSlots';
import { Revisions } from '../../../frontend/shared/capture-models/editor/stores/revisions';
import { ModifiedStatus } from '../../../frontend/shared/capture-models/new/features/ModifiedStatus';
import { useCurrentEntity } from '../../../frontend/shared/capture-models/new/hooks/use-current-entity';
import { useEntityDetails } from '../../../frontend/shared/capture-models/new/hooks/use-entity-details';
import { useFieldDetails } from '../../../frontend/shared/capture-models/new/hooks/use-field-details';
import { mapProperties } from '../../../frontend/shared/capture-models/new/utility/map-properties';
import { getEntityLabel } from '../../../frontend/shared/capture-models/utility/get-entity-label';
import { DocumentPreview } from '../../../frontend/shared/capture-models/DocumentPreview';
import { useModelPageConfiguration } from '../../../frontend/site/hooks/use-model-page-configuration';
import { OcrParagraph, PARAGRAPHS_PROFILE, paragraphsToPlaintext, reconcileOcrText } from './Paragraphs.helpers';

function InlineLine({
  isModified,
  onClick,
  children,
}: {
  isModified?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`mb-2 cursor-pointer border-l-[3px] pl-2 ${
        isModified ? 'border-[#e38627] hover:border-[#b76909]' : 'border-transparent hover:border-[#4a67e4]'
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

const InlineParagraphEntity: ProfileConfig['InlineEntity'] = props => {
  const { entity, chooseEntity, property } = props;
  const { configuration } = useSlotContext();
  const { isModified } = useEntityDetails(entity);
  const { textOnlyOcrCorrection = false } = useModelPageConfiguration();
  const [currentEntity, { path }] = useCurrentEntity();
  const revisionId = Revisions.useStoreState(state => state.currentRevisionId);
  const replaceEntityProperty = Revisions.useStoreActions(actions => actions.replaceEntityProperty);
  const paragraphs = (currentEntity.properties[property] || []) as OcrParagraph[];
  const [value, setValue] = useState(() => paragraphsToPlaintext(paragraphs));

  if (textOnlyOcrCorrection && entity.profile === PARAGRAPHS_PROFILE) {
    if (paragraphs[0]?.id !== entity.id) {
      return null;
    }

    return (
      <textarea
        aria-label={entity.pluralLabel || entity.label || 'OCR transcription'}
        className="min-h-80 w-full resize-y rounded border border-slate-300 bg-white p-3 font-mono leading-relaxed text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 read-only:bg-slate-100"
        readOnly={!configuration.allowEditing}
        value={value}
        onChange={event => {
          const nextValue = event.currentTarget.value;
          setValue(nextValue);
          if (revisionId) {
            const reconciled = reconcileOcrText(paragraphs, nextValue, revisionId);
            replaceEntityProperty({
              path: path as Array<[string, string]>,
              property,
              value: reconciled.paragraphs,
              deletedFieldIds: reconciled.deletedFieldIds,
            });
          }
        }}
      />
    );
  }

  return (
    <InlineLine key={entity.id} onClick={chooseEntity} isModified={isModified}>
      <DocumentPreview entity={entity}>
        {getEntityLabel(
          entity,
          <span style={{ color: '#999' }}>No value {configuration.allowEditing ? '(click to edit)' : null}</span>
        )}
      </DocumentPreview>
    </InlineLine>
  );
};

const InlineParagraphWord: ProfileConfig['InlineField'] = props => {
  const { field, chooseField } = props;
  const { isModified } = useFieldDetails(field);

  return (
    <InlineLine key={field.id} onClick={chooseField} isModified={isModified}>
      <InlineReadonlyValue field={field} />
    </InlineLine>
  );
};

const SingleParagraphEntity: ProfileConfig['SingleEntity'] = ({ showTitle = true }) => {
  const Slots = useSlotContext();
  const [entity] = useCurrentEntity();
  const { isModified } = useEntityDetails(entity);

  return (
    <>
      <Slots.Breadcrumbs />

      <Slots.AdjacentNavigation>
        {isModified && <ModifiedStatus />}
        <Slots.InlineSelector />
        {mapProperties(entity, ({ hasSelector, type, label, description, property, canInlineField }) => {
          return (
            <Slots.InlineProperties
              hasSelector={hasSelector}
              type={type}
              property={property}
              label={label}
              description={description}
              canInlineField={canInlineField}
              disableRemoving
            />
          );
        })}
      </Slots.AdjacentNavigation>
    </>
  );
};

export const slotConfig: ProfileConfig = {
  InlineEntity: InlineParagraphEntity,
  SingleEntity: SingleParagraphEntity,
  InlineField: InlineParagraphWord,
};
