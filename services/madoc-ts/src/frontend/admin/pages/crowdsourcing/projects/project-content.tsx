import { UniversalComponent } from '../../../../types';
import React from 'react';
import { useApi } from '../../../../shared/hooks/use-api';
import { CollectionEditorStructure } from '../../../molecules/CollectionStructureEditor';
import { ItemStructureListItem } from '../../../../../types/schemas/item-structure-list';
import { useTranslation } from 'react-i18next';
import { HelpText } from '../../../../shared/atoms/HelpText';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type ProjectContentType = {
  params: { id: string };
  query: {};
  variables: { id: number };
  data: {
    collectionId: number;
    items: ItemStructureListItem[];
  };
};

export const ProjectContent: UniversalComponent<ProjectContentType> = createUniversalComponent<ProjectContentType>(
  () => {
    // Collection structure editor
    // But different
    // - Shows manifests in separate list
    // - Only allows addition of collections
    // - Update on the backend, will calculate which manifests should be in the flat collection.
    // Actions
    // - Add new collection.
    // - Listing all manifests.
    // - Listing all collections.
    // - Option to browse paginated content in a nice way? - NO.
    const { t } = useTranslation();
    const { data, refetch } = useData(ProjectContent);
    const api = useApi();

    return (
      <>
        <div style={{ fontSize: `1.25em` }}>
          <HelpText>
            {t('help.flat_collection', {
              defaultValue: `
                This shows all of the collections and manifests in your project. When you add a collection you will see 
                all off the manifests inside of the collection are added to this view. When you remove a collection you 
                will have to also manually remove any manifests you want to remove.
            `,
            })}
          </HelpText>
          <CollectionEditorStructure
            searchCollections={true}
            searchManifests={true}
            enableNavigation={true}
            hideManifests={false}
            items={data ? data.items : undefined}
            saveOrder={async newOrder => {
              if (data) {
                await api.updateCollectionStructure(data.collectionId, newOrder);
                await refetch();
              }
            }}
          />
        </div>
      </>
    );
  },
  {
    getKey: params => {
      return ['project-content', { id: Number(params.id) }];
    },
    getData: (key, vars, api) => {
      return api.getProjectStructure(vars.id);
    },
  }
);
