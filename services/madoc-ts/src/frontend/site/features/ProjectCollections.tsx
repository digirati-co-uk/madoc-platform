import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { Button } from '../../shared/atoms/Button';
import { Heading3 } from '../../shared/atoms/Heading3';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { CollectionSnippet } from '../../shared/components/CollectionSnippet';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useStaticData } from '../../shared/hooks/use-data';
import { HrefLink } from '../../shared/utility/href-link';
import { ProjectLoader } from '../pages/loaders/project-loader';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const ProjectCollections: React.FC = () => {
  const { data: project } = useStaticData(ProjectLoader);
  const { isExact } = useRouteMatch();
  const { t } = useTranslation();
  const {
    project: { allowCollectionNavigation, hideProjectCollectionNavigation },
  } = useSiteConfiguration();

  const { data: collections } = apiHooks.getSiteCollection(() =>
    project && isExact ? [project.collection_id, { type: 'collection' }] : undefined
  );

  const shownCollections = collections ? collections.collection.items.slice(0, 4) : [];
  const showAllCollectionsButton = (collections?.collection.items.length || 0) > shownCollections.length;

  if (!allowCollectionNavigation || hideProjectCollectionNavigation || !shownCollections.length || !project) {
    return null;
  }

  return (
    <>
      <Heading3>{t('Collections')}</Heading3>
      <ImageGrid>
        {shownCollections.map((collection, idx) => (
          <CollectionSnippet key={idx} id={collection.id} projectId={project.slug} />
        ))}
      </ImageGrid>
      {showAllCollectionsButton ? (
        <Button as={HrefLink} href={`/projects/${project.slug}/collections`}>
          {t('See all collections')}
        </Button>
      ) : null}
    </>
  );
};
