import React from 'react';
import { LocaleString } from '../components/LocaleString';
import { RoundedCard } from './editor/components/RoundedCard/RoundedCard';
import { Revisions } from './editor/stores/revisions/index';
import { getLabel } from './helpers/get-label';
import { NewEntityInstanceButton } from './NewEntityInstanceButton';
import { DocumentPreview } from './DocumentPreview';
import { useRefinement } from './plugin-api/hooks/use-refinement';
import { CaptureModel } from './types/capture-model';
import { EntityInstanceListRefinement } from './types/refinements';

export const EntityInstanceList: React.FC<{
  entities: Array<CaptureModel['document']>;
  property: string;
  path: Array<[string, string]>;
  chooseEntity: (field: { property: string; instance: CaptureModel['document'] }) => void;
  readOnly?: boolean;
}> = ({ entities, chooseEntity, property, path, readOnly }) => {
  const { removeInstance } = Revisions.useStoreActions(a => ({
    removeInstance: a.removeInstance,
  }));
  const refinement = useRefinement<EntityInstanceListRefinement>(
    'entity-instance-list',
    { property, instance: entities },
    {
      path,
      readOnly,
    }
  );

  if (refinement) {
    return refinement.refine(
      { property, instance: entities },
      {
        path,
        chooseEntity,
        readOnly,
      }
    );
  }

  const canRemove = entities[0].allowMultiple && !readOnly && entities.length > 1;

  return (
    <>
      {entities.map(field => {
        return (
          <RoundedCard
            key={field.id}
            interactive={true}
            onClick={() => chooseEntity({ instance: field, property })}
            onRemove={canRemove ? () => removeInstance({ path: [...path, [property, field.id]] }) : undefined}
          >
            <DocumentPreview entity={field}>
              <LocaleString>{getLabel(field)}</LocaleString>
            </DocumentPreview>
          </RoundedCard>
        );
      })}
      {entities[0].allowMultiple && !readOnly ? (
        <NewEntityInstanceButton entity={entities[0]} property={property} path={path} />
      ) : null}
    </>
  );
};
