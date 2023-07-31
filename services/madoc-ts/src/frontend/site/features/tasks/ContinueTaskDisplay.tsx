import React from 'react';
import { useTranslation } from 'react-i18next';
import { SubjectSnippet as SubjectSnippetType } from '../../../../extensions/tasks/resolvers/subject-resolver';
import { BaseTask } from '../../../../gateway/tasks/base-task';
import { useContinueContribution } from '../../../shared/hooks/use-continue-contribution';
import { useTaskMetadata } from '../../hooks/use-task-metadata';
import { SnippetLarge } from '../../../shared/atoms/SnippetLarge';
import { useCreateLocaleString } from '../../../shared/components/LocaleString';

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
      thumbnail={subject.thumbnail}
      portrait
      subtitle={subject.parent ? createLocalString(subject.label) : subject.type}
      lightBackground
      label={subject.parent ? createLocalString(subject.parent.label) : createLocalString(subject.label)}
      link={link}
      query={next ? { goToNext: true } : undefined}
      buttonText={next ? t('Contribute to the next image') : t('Continue contribution')}
    />
  );
}
