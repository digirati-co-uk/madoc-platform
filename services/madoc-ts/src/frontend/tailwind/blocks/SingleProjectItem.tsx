import { useTranslation } from 'react-i18next';
import { ProjectListItem } from '../../../types/schemas/project-list-item';
import { LocaleString } from '../../shared/components/LocaleString';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { Button } from '../../shared/navigation/Button';
import { Link } from 'react-router-dom';
import { InternationalString } from '@iiif/presentation-3';
import { HrefLink } from '../../shared/utility/href-link';

interface SingleProjectItemProps {
  project: { id: string };
  data: ProjectListItem;
  customButtonLabel?: InternationalString;
  radius?: string;
  background?: string;
}

function getThumbnail(image: string) {
  if (image.includes('/public/storage/')) {
    const parts = image.split('/');
    const filename = parts.pop();
    const file = (filename || '').split('.');
    file.pop(); // extension
    const path = parts.join('/');
    return `${path}/256/${file.join('.')}.jpg`;
  }

  return image;
}

export function SingleProjectItem({ data, project, customButtonLabel }: SingleProjectItemProps) {
  const { t } = useTranslation();
  const { label, summary, thumbnail, task_id, collection_id } = data || {};
  const { data: taskStats } = apiHooks.getTaskStats(() => (task_id ? [task_id] : undefined), {});
  const { data: collectionStats } = apiHooks.getCollectionStatistics(() =>
    collection_id ? [collection_id] : undefined
  );
  const createLink = useRelativeLinks();

  if (!data || !project) return null;

  return (
    <div className="flex bg-white p-5 border gap-10 rounded-md">
      <div className="flex-1 flex flex-col justify-between">
        <LocaleString as="h2" className="text-xl mb-0 mt-0">
          {label}
        </LocaleString>
        <LocaleString as="p" className="text-md mb-0 mt-0">
          {summary}
        </LocaleString>
        {/* <pre>{JSON.stringify({ data, taskStats, collectionStats }, null, 2)}</pre> */}
        {collectionStats && taskStats ? (
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="bg-slate-500 h-3 overflow-hidden rounded-full"
              style={{ width: `${(taskStats.total / collectionStats?.canvases) * 100}%` }}
            />
          </div>
        ) : (
          <div className="h-3 bg-slate-100" />
        )}
        <div>
          <Button $primary as={Link} to={createLink({ projectId: project.id })}>
            {customButtonLabel ? <LocaleString>{customButtonLabel}</LocaleString> : t('Go to project')}
          </Button>
        </div>
      </div>
      <div
        className={`${thumbnail ? 'aspect-video' : 'aspect-square h-32'} w-64 justify-center flex rounded-xl overflow-hidden`}
      >
        {thumbnail ? (
          <HrefLink className="w-full h-full" href={createLink({ projectId: project.id })}>
            <img
              className="object-cover w-full h-full hover:scale-110 transition-transform duration-1000"
              src={getThumbnail(thumbnail)}
              alt=""
            />
          </HrefLink>
        ) : null}
      </div>
    </div>
  );
}
