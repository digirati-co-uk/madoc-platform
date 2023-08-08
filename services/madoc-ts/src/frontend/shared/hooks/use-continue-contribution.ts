import { SubjectSnippet as SubjectSnippetType } from '../../../extensions/tasks/resolvers/subject-resolver';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { useTaskMetadata } from '../../site/hooks/use-task-metadata';

export function useContinueContribution(task?: BaseTask, manifestModel?: boolean) {
  const { subject } = useTaskMetadata<{ subject?: SubjectSnippetType }>(task);
  const createLink = useRelativeLinks();

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

  return link;
}
