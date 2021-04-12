import React from 'react';
import { ProjectStatus } from '../../shared/atoms/ProjectStatus';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { ProjectFull } from '../../../types/schemas/project-full';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../shared/atoms/Statistics';
import { SubtaskProgress } from '../../shared/atoms/SubtaskProgress';
import { Heading1, Subheading1 } from '../../shared/atoms/Heading1';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { ImageGrid, ImageGridItem } from '../../shared/atoms/ImageGrid';
import { Link } from 'react-router-dom';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../shared/atoms/Heading5';
import { Heading3 } from '../../shared/atoms/Heading3';
import { useTranslation } from 'react-i18next';
import { CollectionSnippet } from '../../shared/components/CollectionSnippet';
import { HrefLink } from '../../shared/utility/href-link';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { GoToRandomCanvas } from '../features/GoToRandomCanvas';
import { GoToRandomManifest } from '../features/GoToRandomManifest';
import { ProjectContributionButton } from '../features/ProjectContributionButton';

export const ViewProject: React.FC<Partial<{
  project: ProjectFull;
  collections: CollectionFull;
  manifests: CollectionFull;
}>> = props => {
  const { t } = useTranslation();
  const createLocaleString = useCreateLocaleString();
  const { project, collections, manifests } = props;

  if (!project) {
    return null;
  }

  const {
    allowCollectionNavigation = true,
    allowManifestNavigation = true,
    hideStatistics = false,
    hideProjectCollectionNavigation = false,
    hideProjectManifestNavigation = false,
  } = project.config;
  const shownCollections = collections ? collections.collection.items.slice(0, 4) : [];

  return (
    <>
      <DisplayBreadcrumbs />

      <ProjectStatus status={project.status} />

      <LocaleString as={Heading1}>{project.label}</LocaleString>
      <LocaleString as={Subheading1}>{project.summary}</LocaleString>

      <ButtonRow>
        <GoToRandomCanvas $primary label={{ none: [t('Start contributing')] }} navigateToModel />
        <Button as={Link} to={`/projects/${project.slug}/search`}>
          {t('Search this project')}
        </Button>
        <GoToRandomManifest />
        <GoToRandomCanvas />
      </ButtonRow>

      <ProjectContributionButton />

      {hideStatistics ? null : (
        <>
          <StatisticContainer>
            <Statistic>
              <StatisticNumber>{project.statistics['0'] || 0}</StatisticNumber>
              <StatisticLabel>{t('Not started')}</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{project.statistics['1'] || 0}</StatisticNumber>
              <StatisticLabel>{t('In progress')}</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{project.statistics['2'] || 0}</StatisticNumber>
              <StatisticLabel>{t('In review')}</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{project.statistics['3'] || 0}</StatisticNumber>
              <StatisticLabel>{t('Completed')}</StatisticLabel>
            </Statistic>
          </StatisticContainer>
          <SubtaskProgress
            total={
              project.statistics['0'] + project.statistics['1'] + project.statistics['2'] + project.statistics['3']
            }
            done={project.statistics['3'] || 0}
            progress={(project.statistics['2'] || 0) + (project.statistics['1'] || 0)}
          />
        </>
      )}
      {allowCollectionNavigation && !hideProjectCollectionNavigation && shownCollections.length && collections ? (
        <>
          <Heading3>{t('Collections')}</Heading3>
          <ImageGrid>
            {shownCollections.map((collection, idx) => (
              <CollectionSnippet key={idx} id={collection.id} projectId={project.slug} />
            ))}
          </ImageGrid>
          {shownCollections.length <= collections.collection.items.length ? (
            <Button as={HrefLink} href={`/projects/${project.slug}/collections`}>
              {t('See all collections')}
            </Button>
          ) : null}
        </>
      ) : null}
      {allowManifestNavigation && !hideProjectManifestNavigation && manifests && manifests.collection.items.length ? (
        <>
          <Heading3>{t('Manifests')}</Heading3>
          <ImageGrid>
            {manifests.collection.items.map((manifest, idx) => (
              <Link
                key={`${manifest.id}_${idx}`}
                to={
                  manifest.type === 'manifest'
                    ? `/projects/${project.slug}/manifests/${manifest.id}`
                    : `/projects/${project.slug}/collections/${manifest.id}`
                }
              >
                <ImageGridItem $size="large">
                  <CroppedImage $size="large">
                    {manifest.thumbnail ? (
                      <img alt={createLocaleString(manifest.label, t('Untitled manifest'))} src={manifest.thumbnail} />
                    ) : null}
                  </CroppedImage>
                  <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
                  <Subheading5>
                    {manifest.type === 'manifest'
                      ? t('{{count}} images', { count: manifest.canvasCount })
                      : t('{{count}} manifests', { count: manifest.canvasCount })}
                  </Subheading5>
                </ImageGridItem>
              </Link>
            ))}
          </ImageGrid>
        </>
      ) : null}
    </>
  );
};
