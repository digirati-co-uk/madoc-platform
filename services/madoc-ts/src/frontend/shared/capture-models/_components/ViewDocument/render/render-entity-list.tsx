import React from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { ViewEntity } from '../components/ViewEntity';
import { DocumentCollapse, DocumentEntityList } from '../ViewDocument.styles';
import { renderProperty } from './render-property';

export const renderEntityList = (
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
        <ViewEntity
          key={entity.id}
          entity={entity}
          fluidImage={fluidImage}
          highlightRevisionChanges={highlightRevisionChanges}
        >
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
