import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { Button } from '../../../shared/navigation/Button';
import { Heading3 } from '../../../shared/typography/Heading3';
import { ImageGrid } from '../../../shared/atoms/ImageGrid';
import { CollectionSnippet } from '../../../shared/components/CollectionSnippet';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { HrefLink } from '../../../shared/utility/href-link';
import { useProject } from '../../hooks/use-project';
import { useSiteConfiguration } from '../SiteConfigurationContext';
import {CSSHalfGrid, HalfGird} from '../../../shared/layout/Grid';

export const ProjectCollections: React.FC = () => {
  const { data: project } = useProject();
  const isExact = true; // @todo fix this.
  const { t } = useTranslation();
  const {
    project: { allowCollectionNavigation, hideProjectCollectionNavigation },
  } = useSiteConfiguration();

  const { data: collections } = apiHooks.getSiteCollection(
    () => (project && isExact ? [project.collection_id, { type: 'collection' }] : undefined),
    { forceFetchOnMount: true }
  );

  const shownCollections = collections ? collections.collection.items.slice(0, 4) : [];
  const showAllCollectionsButton = (collections?.collection.items.length || 0) > shownCollections.length;

  if (!allowCollectionNavigation || hideProjectCollectionNavigation || !shownCollections.length || !project) {
    return null;
  }

  return (
    <>
      <Heading3>{t('Collections')}</Heading3>
      <CSSHalfGrid>
        {shownCollections.map((collection, idx) => (
          <CollectionSnippet key={idx} id={collection.id} projectId={project.slug} />
        ))}
      </CSSHalfGrid>
      {showAllCollectionsButton ? (
        <Button as={HrefLink} href={`/projects/${project.slug}/collections`}>
          {t('See all collections')}
        </Button>
      ) : null}
    </>
  );
};

blockEditorFor(ProjectCollections, {
  type: 'default.ProjectCollections',
  label: 'Project collections',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
