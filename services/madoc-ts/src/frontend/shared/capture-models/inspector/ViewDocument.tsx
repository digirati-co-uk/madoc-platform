import { useImageService } from 'react-iiif-vault';
import { ImageService } from '@iiif/presentation-3';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useHighlightedRegions } from '../../hooks/use-highlighted-regions';
import { EmptyState } from '../../layout/EmptyState';
import { CroppedImage } from '../../atoms/Images';
import { useCroppedRegion } from '../../hooks/use-cropped-region';
import { DownArrowIcon } from '../../icons/DownArrowIcon';
import { FieldPreview } from '../editor/components/FieldPreview/FieldPreview';
import { useSelectorHelper } from '../editor/stores/selectors/selector-helper';
import { filterRevises } from '../helpers/filter-revises';
import { isEntityList } from '../helpers/is-entity';
import { resolveSelector } from '../helpers/resolve-selector';
import { useModelTranslation } from '../hooks/use-model-translation';
import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { BaseSelector } from '../types/selector-types';
import { getEntityLabel } from '../utility/get-entity-label';
import { isEmptyFieldList } from '../utility/is-field-list-empty';
import { useResolvedSelector } from '../new/hooks/use-resolved-selector';

const DocumentLabel = styled.div`
  position: relative;
  font-size: 11px;
  font-weight: 600;
  color: #999;
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
  margin: 5px 0;
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
  border-bottom: 1px solid #eff3fd;
  background: #fff;
  overflow: hidden;
  margin: 0.4em;
  border-radius: 3px;
`;

const DocumentSectionField = styled.div`
  //border-bottom: 1px solid #eee;
  padding-bottom: 0.4em;
  margin-bottom: 0.2em;
  background: #fff;
`;

const DocumentCollapse = styled.div`
  background: #fff;
  padding: 10px;
  overflow-y: auto;
`;

const DocumentEntityList = styled.div`
  padding: 2px;
  background: #e9effc;
  border-radius: 5px;
  overflow-y: auto;
`;

const DocumentEntityLabel = styled.div`
  color: #777;
  font-weight: 600;
  font-size: 15px;
  position: relative;
  padding: 5px 10px;
`;

const FieldPreviewWrapper = styled.div`
  white-space: pre-wrap;
  display: flex;
  align-items: center;
`;

const renderFieldList = (
  fields: BaseField[],
  { fluidImage }: { fluidImage?: boolean; tModel: (s: string) => string }
) => {
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
              <SelectorPreview selector={field.selector} fluidImage={fluidImage} />
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
    fluidImage,
    tModel,
  }: {
    filterRevisions: string[];
    highlightRevisionChanges?: string;
    collapsedEntity?: boolean;
    fluidImage?: boolean;
    tModel: (s: string) => string;
  }
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
            tModel,
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
        <ViewEntity key={entity.id} entity={entity} fluidImage={fluidImage}>
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

const ViewEntity: React.FC<{
  collapsed?: boolean;
  entity: CaptureModel['document'];
  interactive?: boolean;
  fluidImage?: boolean;
}> = ({ entity, collapsed, children, interactive = true, fluidImage }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const selector = entity.selector ? resolveSelector(entity.selector) : undefined;
  const { t: tModel } = useModelTranslation();
  const label = getEntityLabel(entity, undefined, false, tModel);

  return (
    <DocumentSection>
      <DocumentHeading $interactive={interactive} onClick={() => (interactive ? setIsCollapsed(i => !i) : undefined)}>
        <DocumentEntityLabel style={{ display: 'flex', alignItems: 'center' }}>
          {selector && !fluidImage ? <SelectorPreview selector={selector} inline /> : null}
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
          {selector && fluidImage ? <SelectorPreview selector={selector} fluidImage={fluidImage} /> : null}
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
    fluidImage,
    tModel,
  }: {
    key: any;
    filterRevisions?: string[];
    highlightRevisionChanges?: string;
    collapsed?: boolean;
    collapsedEntity?: boolean;
    fluidImage?: boolean;
    tModel: (s: string) => string;
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
    ? renderEntityList(filteredFields, {
        filterRevisions,
        highlightRevisionChanges,
        collapsedEntity,
        fluidImage,
        tModel,
      })
    : renderFieldList(filteredFields as any, { fluidImage, tModel });

  if (!renderedProperties) {
    return null;
  }

  return (
    <ViewProperty
      key={key}
      label={tModel(label)}
      description={description ? tModel(description) : ''}
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
    <DocumentSectionField>
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
    </DocumentSectionField>
  );
};

export const SelectorPreview: React.FC<{ selector?: BaseSelector; fluidImage?: boolean; inline?: boolean }> = ({
  selector,
  fluidImage,
  inline,
}) => {
  const helper = useSelectorHelper();
  const { data: service } = useImageService() as { data?: ImageService };
  const croppedRegion = useCroppedRegion();
  const [image, setImage] = useState('');
  const selectorId = selector?.id;

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
    <CroppedImage
      $size={'tiny'}
      $fluid={fluidImage}
      $covered
      style={{ margin: inline ? 'none' : '0 .5em', background: '#f9f9f9' }}
      onMouseEnter={() => (selectorId ? helper.highlight(selectorId) : null)}
      onMouseLeave={() => (selectorId ? helper.clearHighlight(selectorId) : null)}
    >
      <img src={image} data-madoc-id={selectorId} alt="cropped region of image" width={fluidImage ? '100%' : 100} />
    </CroppedImage>
  );
};

export const ViewDocument: React.FC<{
  document: CaptureModel['document'] | Array<CaptureModel['document']>;
  filterRevisions?: string[];
  hideTitle?: boolean;
  padding?: boolean;
  collapsed?: boolean;
  fluidImage?: boolean;
  highlightRevisionChanges?: string;
  hideEmpty?: boolean;
}> = ({
  document: documentOrArray,
  filterRevisions = [],
  hideTitle,
  hideEmpty,
  padding = true,
  highlightRevisionChanges,
  collapsed,
  fluidImage,
}) => {
  const { t: tModel } = useModelTranslation();
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
  const documentList = Array.isArray(documentOrArray) ? documentOrArray : [documentOrArray];
  const renderedList: any[] = [];
  for (const document of documentList) {
    const flatProperties = Object.entries(document.properties);

    if (flatProperties.length === 0) {
      return <EmptyState>{t('No document yet')}</EmptyState>;
    }

    const rendered = flatProperties
      .map(([, field], key) => {
        return renderProperty(field, { key: key, filterRevisions, highlightRevisionChanges, fluidImage, tModel });
      })
      .filter(r => r !== null);

    if (rendered.length) {
      renderedList.push({
        label: tModel(document.label),
        description: document.description ? tModel(document.description) : undefined,
        rendered,
      });
    }
  }

  if (renderedList.length === 0) {
    return <EmptyState>{t('No document yet')}</EmptyState>;
  }

  return (
    <div style={{ padding: padding ? 20 : 0 }}>
      {renderedList.map(({ label, description, rendered }, n) => (
        <React.Fragment key={n}>
          {!hideTitle ? <h3>{tModel(label)}</h3> : null}
          {!hideTitle ? <p>{description ? tModel(description) : ''}</p> : null}
          {rendered}
        </React.Fragment>
      ))}
    </div>
  );
};
