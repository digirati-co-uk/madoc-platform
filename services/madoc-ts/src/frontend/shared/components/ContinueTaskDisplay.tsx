import React from 'react';
import { useTranslation } from 'react-i18next';
import { SubjectSnippet as SubjectSnippetType } from '../../../extensions/tasks/resolvers/subject-resolver';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { useTaskMetadata } from '../../site/hooks/use-task-metadata';
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
  const createLocalString = useCreateLocaleString();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();

  const link = subject
    ? subject.type === 'manifest'
      ? createLink({ manifestId: subject.id, subRoute: manifestModel ? 'model' : '' })
      : subject.type === 'canvas'
      ? createLink({
          canvasId: subject.id,
          manifestId: subject.parent?.id,
          subRoute: 'model',
        })
      : undefined
    : undefined;

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
