import React from 'react';
import { useTranslation } from 'react-i18next';
import { SubjectSnippet as SubjectSnippetType } from '../../../extensions/tasks/resolvers/subject-resolver';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { useTaskMetadata } from '../../site/hooks/use-task-metadata';
import { PrimaryButtonLink } from '../atoms/Button';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { useCreateLocaleString } from './LocaleString';

export function ContinueTaskDisplay({ task, next }: { task: BaseTask; next?: boolean }) {
  const { subject } = useTaskMetadata<{ subject?: SubjectSnippetType }>(task);
  const createLocalString = useCreateLocaleString();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();

  const link = subject
    ? subject.type === 'manifest'
      ? createLink({ manifestId: subject.id })
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
      size="sm"
      thumbnail={subject.thumbnail}
      subtitle={subject.parent ? createLocalString(subject.parent.label) : subject.type}
      center
      margin
      lightBackground
      label={createLocalString(subject.label)}
      link={link}
      linkAs={PrimaryButtonLink}
      query={next ? { goToNext: true } : undefined}
      buttonText={next ? t('Contribute to the next image') : t('Continue contribution')}
    />
  );
}
