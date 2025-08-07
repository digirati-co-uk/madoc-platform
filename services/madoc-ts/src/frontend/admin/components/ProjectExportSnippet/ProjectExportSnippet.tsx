import { ExportResourceTask } from '../../../../gateway/tasks/export-resource-task';
import { createDownload } from '../../../../utility/create-download';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { RootStatistics } from '../../../shared/components/RootStatistics';
import { useOptionalApi } from '../../../shared/hooks/use-api';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { ProjectExportSnippetStyles as S } from './ProjectExportSnippet.styles';
import { useMutation } from 'react-query';

interface ProjectExportSnippetProps {
  task: ExportResourceTask;
  flex?: boolean;
  taskLink?: string;

  onDownload?: (output: any) => void;

  apiDownload?: boolean;
  onRefresh?: () => void;
}
export function ProjectExportSnippet({
  task,
  flex,
  taskLink,
  onDownload,
  apiDownload,
  onRefresh,
}: ProjectExportSnippetProps) {
  const output = task.parameters[0].output;
  const api = useOptionalApi();
  const tags = Object.keys(task.parameters[0].exportPlan || {}).flatMap(r =>
    ((task.parameters[0].exportPlan || {}) as any)[r].map((r: any) => r[0])
  );

  const [manuallyComplete] = useMutation(
    async () => {
      return api?.updateTask(task.id!, { status: 3, status_text: 'complete (manually)' });
    },
    { onSuccess: onRefresh }
  );

  const onDownloadButton = () => {
    if (onDownload) {
      onDownload(output);
    }
    if (apiDownload && api && output.type === 'zip') {
      api.getStorageRaw(`export`, `${output.path}/${output.fileName}`, false).then(r => {
        r.blob().then(blob => createDownload(blob, output.fileName, 'application/zip' as any));
      });
    }
  };

  return (
    <S.Container $flex={flex}>
      <S.TitleSection>
        <S.Title>{task.name}</S.Title>
        <S.Subtitle>
          {task.creator?.name}{' '}
          {task.created_at || task.modified_at ? (
            <TimeAgo date={new Date(task.created_at || task.modified_at || 0)} />
          ) : null}
        </S.Subtitle>
        {taskLink ? (
          <S.ViewTask>
            <HrefLink href={taskLink}>view task</HrefLink>
          </S.ViewTask>
        ) : null}
        {task.root_statistics && task.status !== 3 ? (
          <S.Progress>
            <RootStatistics {...task.root_statistics} />
          </S.Progress>
        ) : null}
      </S.TitleSection>
      {tags.length ? (
        <S.TagList>
          {tags.map(tag => (
            <S.Tag key={tag}>{tag}</S.Tag>
          ))}
        </S.TagList>
      ) : null}
      {task.status !== 3 && (
        <Button $primary onClick={() => manuallyComplete()}>
          Manually complete
        </Button>
      )}
      {output && output.type === 'zip' && (onDownload || (apiDownload && api)) ? (
        <S.DownloadBox>
          <S.DownloadLabel>{output.fileName}</S.DownloadLabel>
          <Button $primary onClick={onDownloadButton}>
            Download
          </Button>
        </S.DownloadBox>
      ) : null}
    </S.Container>
  );
}
