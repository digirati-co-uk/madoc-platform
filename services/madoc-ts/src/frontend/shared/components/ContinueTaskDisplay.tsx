import React from 'react';
import { useTranslation } from 'react-i18next';
import { SubjectSnippet as SubjectSnippetType } from '../../../extensions/tasks/resolvers/subject-resolver';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useTaskMetadata } from '../../site/hooks/use-task-metadata';
import { useContinueContribution } from '../hooks/use-continue-contribution';
import { PrimaryButtonLink } from '../navigation/Button';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { useCreateLocaleString } from './LocaleString';

export function ContinueTaskDisplay({
  task,
  next,
  manifestModel,
}: {
  task: BaseTask;
  next?: boolean;
  manifestModel?: boolean;
}) {
  const { subject } = useTaskMetadata<{ subject?: SubjectSnippetType }>(task);
  const link = useContinueContribution(task, manifestModel);
  const createLocalString = useCreateLocaleString();
  const { t } = useTranslation();

  if (!subject || !link) {
    return null;
  }

  return (
    <SnippetLarge
      size="sm"
      thumbnail={subject.thumbnail}
      subtitle={subject.parent ? createLocalString(subject.label) : subject.type}
      center
      margin
      lightBackground
      label={subject.parent ? createLocalString(subject.parent.label) : createLocalString(subject.label)}
      link={link}
      linkAs={PrimaryButtonLink}
      query={next ? { goToNext: true } : undefined}
      buttonText={next ? t('Contribute to the next image') : t('Continue contribution')}
    />
  );
}
