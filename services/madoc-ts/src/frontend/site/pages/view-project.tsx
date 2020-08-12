import React from 'react';
import { LocaleString } from '../../shared/components/LocaleString';
import { ProjectFull } from '../../../types/schemas/project-full';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../shared/atoms/Statistics';
import { SubtaskProgress } from '../../shared/atoms/SubtaskProgress';
import { Subheading1 } from '../../shared/atoms/Heading1';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { ImageGrid, ImageGridItem } from '../../shared/atoms/ImageGrid';
import { Link } from 'react-router-dom';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../shared/atoms/Heading5';
import { Heading3 } from '../../shared/atoms/Heading3';
import { useTranslation } from 'react-i18next';
import { CollectionSnippet } from '../../shared/components/CollectionSnippet';
import { HrefLink } from '../../shared/utility/href-link';
import { Button } from '../../shared/atoms/Button';
import { useContributorTasks } from '../../shared/hooks/use-contributor-tasks';
import { ContributorTasks } from '../../shared/components/ContributorTasks';
import { useReviewerTasks } from '../../shared/hooks/use-reviewer-tasks';
import { ReviewerTasks } from '../../shared/components/ReviewerTasks';

// @todo create universal component and load up the main collection.
export const ViewProject: React.FC<{
  project: ProjectFull;
  collections: CollectionFull;
  manifests: CollectionFull;
}> = props => {
  const { t } = useTranslation();

  const { project, collections, manifests } = props;
  const contributorTasks = useContributorTasks({ rootTaskId: project.task_id });
  const reviewerTasks = useReviewerTasks({ rootTaskId: project.task_id });

  const { allowCollectionNavigation = true, allowManifestNavigation = true } = project.config;
  const shownCollections = collections.collection.items.slice(0, 4);

  return (
    <>
      <LocaleString as={'h1'}>{project.label}</LocaleString>
      <LocaleString as={Subheading1}>{project.summary}</LocaleString>
      <StatisticContainer>
        <Statistic>
          <StatisticNumber>{project.statistics['0'] || 0}</StatisticNumber>
          <StatisticLabel>Not started</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{project.statistics['1'] || 0}</StatisticNumber>
          <StatisticLabel>In progress</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{project.statistics['2'] || 0}</StatisticNumber>
          <StatisticLabel>In review</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{project.statistics['3'] || 0}</StatisticNumber>
          <StatisticLabel>Completed</StatisticLabel>
        </Statistic>
      </StatisticContainer>
      <SubtaskProgress
        total={project.statistics['0'] + project.statistics['1'] + project.statistics['2'] + project.statistics['3']}
        done={project.statistics['3'] || 0}
        progress={(project.statistics['2'] || 0) + (project.statistics['1'] || 0)}
      />
      {allowManifestNavigation ? (
        <>
          <Heading3>Manifests</Heading3>
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
                    {manifest.thumbnail ? <img alt={t('First image in manifest')} src={manifest.thumbnail} /> : null}
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
      {allowCollectionNavigation ? (
        <>
          <Heading3>Collections</Heading3>
          <ImageGrid>
            {shownCollections.map((collection, idx) => (
              <CollectionSnippet key={idx} id={collection.id} />
            ))}
          </ImageGrid>
          {shownCollections.length <= collections.collection.items.length ? (
            <Button as={HrefLink} href={`/projects/${project.slug}/collections`}>
              See all collections
            </Button>
          ) : null}
        </>
      ) : null}
      {reviewerTasks ? (
        <ReviewerTasks reviews={reviewerTasks} projectId={project.slug} rootTaskId={project.task_id} />
      ) : null}
      {contributorTasks ? (
        <ContributorTasks
          drafts={contributorTasks.drafts}
          reviews={contributorTasks.reviews}
          projectId={project.slug}
          rootTaskId={project.task_id}
        />
      ) : null}
    </>
  );
};
