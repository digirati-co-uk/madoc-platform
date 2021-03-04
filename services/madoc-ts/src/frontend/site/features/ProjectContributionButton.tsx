import React from 'react';
import { useTranslation } from 'react-i18next';
import { parseUrn } from '../../../utility/parse-urn';
import { Button, SmallButton } from '../../shared/atoms/Button';
import { GridContainer, ThirdGrid } from '../../shared/atoms/Grid';
import { Heading3 } from '../../shared/atoms/Heading3';
import { SubjectSnippet } from '../../shared/components/SubjectSnippet';
import { useContributorTasks } from '../../shared/hooks/use-contributor-tasks';
import { HrefLink } from '../../shared/utility/href-link';
import { useProject } from '../hooks/use-project';
import { useRelativeLinks } from '../hooks/use-relative-links';

const PrimaryButtonLink: React.FC<any> = props => {
  return <Button as={HrefLink} $primary {...props} />;
};

export const ProjectContributionButton: React.FC = () => {
  const { t } = useTranslation();
  const { data: project } = useProject();
  const createLink = useRelativeLinks();
  const contributorTasks = useContributorTasks({ rootTaskId: project?.task_id }, !!project);

  const currentTasks = contributorTasks?.drafts.tasks;
  const tasksInReview = contributorTasks?.reviews.tasks;

  if (!project) {
    return null;
  }

  if (currentTasks && currentTasks.length) {
    const firstThree = currentTasks.slice(0, 3);
    return (
      <>
        <Heading3 $margin>{t('Continue where you left off')}</Heading3>
        <GridContainer>
          {firstThree.map((currentTask, key) => (
            <ThirdGrid key={currentTask.id}>
              <SubjectSnippet
                subject={currentTask.subject}
                subjectParent={currentTask.subject_parent}
                model
                buttonText={t('Continue contribution')}
                size="sm"
                center
                lightBackground
                linkAs={PrimaryButtonLink}
              />
            </ThirdGrid>
          ))}
        </GridContainer>
        <SmallButton
          as={HrefLink}
          href={createLink({ projectId: project.id, subRoute: 'tasks', query: { type: 'crowdsourcing-task' } })}
        >
          {t('View all contributions')}
        </SmallButton>
      </>
    );
  }

  if (tasksInReview && tasksInReview.length) {
    const firstThree = tasksInReview.slice(0, 3);

    return (
      <>
        <Heading3 $margin>{t('Continue where you left off')}</Heading3>
        <GridContainer>
          {firstThree.map((currentTask, key) => {
            const parsed = parseUrn(currentTask.subject);

            if (!parsed || parsed.type !== 'canvas') {
              return null;
            }

            return (
              <ThirdGrid key={currentTask.id}>
                <SubjectSnippet
                  subject={currentTask.subject}
                  subjectParent={currentTask.subject_parent}
                  model
                  buttonText={t('Contribute to the next image')}
                  size="sm"
                  center
                  lightBackground
                  linkAs={PrimaryButtonLink}
                  query={{ goToNext: true }}
                />
              </ThirdGrid>
            );
          })}
        </GridContainer>
        <SmallButton
          as={HrefLink}
          href={createLink({ projectId: project.id, subRoute: 'tasks', query: { type: 'crowdsourcing-task' } })}
        >
          {t('View all contributions')}
        </SmallButton>
      </>
    );
  }

  return null;
};
