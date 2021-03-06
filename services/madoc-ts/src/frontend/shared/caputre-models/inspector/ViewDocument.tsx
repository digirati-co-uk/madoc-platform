import { FieldPreview } from '@capture-models/editor';
import { filterRevises, isEntity, isEntityList } from '@capture-models/helpers';
import { BaseField, BaseSelector, CaptureModel } from '@capture-models/types';
import { useCanvas, useImageService } from '@hyperion-framework/react-vault';
import { ImageService } from '@hyperion-framework/types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { EmptyState } from '../../atoms/EmptyState';
import { CroppedImage } from '../../atoms/Images';
import { useCroppedRegion } from '../../hooks/use-cropped-region';
import { DownArrowIcon } from '../../icons/DownArrowIcon';
import { getEntityLabel } from '../utility/get-entity-label';
import { isEmptyFieldList } from '../utility/is-field-list-empty';

const DocumentLabel = styled.div`
  position: relative;
  font-size: 13px;
  font-weight: bold;
  color: #333;
`;

const DocumentLabelIcon = styled.div`
  position: absolute;
  right: 2px;
  top: 2px;
`;

const DocumentDescription = styled.div`
  font-size: 11px;
  color: #999;
`;

const DocumentHeading = styled.div<{ $interactive?: boolean }>`
  margin-bottom: 5px;
  ${props =>
    props.$interactive &&
    css`
      cursor: pointer;
    `}
`;

const DocumentValueWrapper = styled.div`
  //background: palegoldenrod;
`;

const DocumentSection = styled.div`
  //border-bottom: 1px solid #eee;
  //padding-bottom: 5px;
  margin-bottom: 5px;
  background: #fff;
`;

const DocumentCollapse = styled.div`
  background: #fff;
  padding: 10px;
  overflow-y: auto;
`;

const DocumentEntityList = styled.div`
  border-left: 1px solid #ddd;
  padding: 4px 3px;
  background: #e9effc;
  overflow-y: auto;
`;

const DocumentEntityLabel = styled.div`
  color: #111;
  font-weight: bold;
  font-size: 15px;
  position: relative;
  padding: 5px 10px;
`;

const FieldPreviewWrapper = styled.div`
  white-space: pre-wrap;
`;

const renderFieldList = (fields: BaseField[]) => {
  if (!fields || isEmptyFieldList(fields)) {
    return null;
  }

  const filteredFields = filterRevises(fields) as BaseField[];

  // @todo filter revisions, but this time add the revisions to the fields

  return (
    <FieldPreviewWrapper>
      {filteredFields.map(field => {
        if (field.value && field.selector) {
          return (
            <React.Fragment key={field.id}>
              <SelectorPreview selector={field.selector} />
              <FieldPreview field={field} />
            </React.Fragment>
          );
        }

        return field.value ? <FieldPreview key={field.id} field={field} /> : null;
      })}
    </FieldPreviewWrapper>
  );
};

const renderEntityList = (
  entities: CaptureModel['document'][],
  {
    filterRevisions = [],
    highlightRevisionChanges,
    collapsedEntity,
  }: { filterRevisions: string[]; highlightRevisionChanges?: string; collapsedEntity?: boolean }
) => {
  const toRender = entities
    .map(entity => {
      const flatInnerProperties = Object.entries(entity.properties);

      const renderedProps = flatInnerProperties
        .map(([key, field]) => {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          const rendered = renderProperty(field, {
            key,
            filterRevisions,
            highlightRevisionChanges,
            collapsed: collapsedEntity,
          });
          if (!rendered) {
            return null;
          }
          return <DocumentCollapse key={key}>{rendered}</DocumentCollapse>;
        })
        .filter(e => e !== null);

      if (renderedProps.length === 0) {
        return null;
      }

      return (
        <ViewEntity key={entity.id} entity={entity}>
          {renderedProps}
        </ViewEntity>
      );
    })
    .filter(e => e !== null);

  if (toRender.length === 0) {
    return null;
  }

  return <DocumentEntityList>{toRender}</DocumentEntityList>;
};

const ViewEntity: React.FC<{ collapsed?: boolean; entity: CaptureModel['document']; interactive?: boolean }> = ({
  entity,
  collapsed,
  children,
  interactive = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // @todo make better.
  const label = getEntityLabel(entity);

  return (
    <DocumentSection>
      <DocumentHeading $interactive={interactive} onClick={() => (interactive ? setIsCollapsed(i => !i) : undefined)}>
        <DocumentEntityLabel>
          {label}
          {interactive ? (
            <DocumentLabelIcon>
              <DownArrowIcon
                style={
                  isCollapsed
                    ? { transform: 'rotate(180deg)', fill: '#6c757d', width: '22px', height: '23px' }
                    : { transform: 'rotate(0deg)', fill: '#6c757d', width: '22px', height: '23px' }
                }
              />
            </DocumentLabelIcon>
          ) : null}
        </DocumentEntityLabel>
      </DocumentHeading>
      {/* This is where the shortened label goes, and where the collapse UI goes. Should be collapsed by default. */}
      {/* This is where the entity selector will go, if it exists. */}
      {isCollapsed ? null : (
        <>
          {entity.selector ? <SelectorPreview selector={entity.selector} /> : null}
          {children}
        </>
      )}
    </DocumentSection>
  );
};

const renderProperty = (
  fields: BaseField[] | CaptureModel['document'][],
  {
    key,
    filterRevisions = [],
    collapsed,
    collapsedEntity,
    highlightRevisionChanges,
  }: {
    key: any;
    filterRevisions?: string[];
    highlightRevisionChanges?: string;
    collapsed?: boolean;
    collapsedEntity?: boolean;
  }
) => {
  const label = fields.length > 1 && fields[0].pluralLabel ? fields[0].pluralLabel : fields[0].label;
  const filteredFields = filterRevises(fields).filter(f => {
    if (highlightRevisionChanges) {
      return f.type === 'entity' || (f.revision && f.revision === highlightRevisionChanges);
    }

    return !f.revision || filterRevisions.indexOf(f.revision) === -1;
  });
  const description = fields[0].description;
  const renderedProperties = isEntityList(filteredFields)
    ? renderEntityList(filteredFields, { filterRevisions, highlightRevisionChanges, collapsedEntity })
    : renderFieldList(filteredFields as any);

  if (!renderedProperties) {
    return null;
  }

  return (
    <ViewProperty
      key={key}
      label={label}
      description={description}
      collapsed={collapsed}
      interactive={isEntityList(filteredFields)}
    >
      {renderedProperties}
    </ViewProperty>
  );
};

export const ViewProperty: React.FC<{
  collapsed?: boolean;
  interactive?: boolean;
  label: string;
  description?: string;
  fallback?: any;
}> = ({ label, description, interactive, collapsed, fallback, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <DocumentSection>
      <DocumentHeading $interactive={interactive} onClick={() => (interactive ? setIsCollapsed(i => !i) : undefined)}>
        <DocumentLabel>
          {label}
          {interactive ? (
            <DocumentLabelIcon>
              <DownArrowIcon
                style={
                  isCollapsed
                    ? { transform: 'rotate(180deg)', fill: '#6c757d', width: '22px', height: '23px' }
                    : { transform: 'rotate(0deg)', fill: '#6c757d', width: '22px', height: '23px' }
                }
              />
            </DocumentLabelIcon>
          ) : null}
        </DocumentLabel>
        {isCollapsed && fallback ? (
          <DocumentDescription>{fallback}</DocumentDescription>
        ) : description ? (
          <DocumentDescription>{description}</DocumentDescription>
        ) : null}
      </DocumentHeading>
      {!isCollapsed ? <DocumentValueWrapper>{children}</DocumentValueWrapper> : null}
    </DocumentSection>
  );
};

export const SelectorPreview: React.FC<{ selector?: BaseSelector }> = ({ selector }) => {
  const { data: service } = useImageService() as { data?: ImageService };
  const croppedRegion = useCroppedRegion();
  const [image, setImage] = useState('');

  useEffect(() => {
    if (selector && service && selector.state) {
      const cropped = croppedRegion(selector.state);
      if (cropped) {
        setImage(cropped);
      }
    }
  }, [croppedRegion, selector, service]);

  if (!image) {
    return null;
  }

  return (
    <CroppedImage $size="small" style={{ margin: '.5em' }}>
      <img src={image} alt="cropped region of image" width={100} />
    </CroppedImage>
  );
};

export const ViewDocument: React.FC<{
  document: CaptureModel['document'];
  filterRevisions?: string[];
  hideTitle?: boolean;
  padding?: boolean;
  collapsed?: boolean;
  highlightRevisionChanges?: string;
}> = ({ document, filterRevisions = [], hideTitle, padding = true, highlightRevisionChanges, collapsed }) => {
  const { t } = useTranslation();
  // ✅ Label (plural label / labelled by)
  // ✅ Description
  // -  Profile
  // -  Revision
  // -  Selector
  // -  Revises
  // -  Data sources
  // -  allow multiple

  // Properties

  // Property
  // Hide if empty value (not property)
  // If no non-empty property then show empty state
  // If a field or entity is revised by another, show it grayed out
  // - Click to highlight all of the same revision
  // - Click to also highlight the revises property (can we draw a line?)
  // - Click to highlight which field revises it.
  // Option to only show canonical document.
  // Add show history on field
  //  - Traverses up the revises field
  //  - Shows it in a list

  const flatProperties = Object.entries(document.properties);

  if (flatProperties.length === 0) {
    return <EmptyState>{t('No document yet')}</EmptyState>;
  }

  const rendered = flatProperties
    .map(([, field], key) => {
      return renderProperty(field, { key: key, filterRevisions, highlightRevisionChanges });
    })
    .filter(r => r !== null);

  if (rendered.length === 0) {
    return <EmptyState>{t('No document yet')}</EmptyState>;
  }

  return (
    <div style={{ padding: padding ? 20 : 0 }}>
      {!hideTitle ? <h3>{document.label}</h3> : null}
      {!hideTitle ? <p>{document.description}</p> : null}
      {rendered}
    </div>
  );
};
