import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaginatedQuery } from 'react-query';
import { Link, useParams } from 'react-router-dom';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { parseUrn } from '../../../../utility/parse-urn';
import { Breadcrumbs } from '../../../shared/atoms/Breadcrumbs';
import { CanvasStatus } from '../../../shared/atoms/CanvasStatus';
import { Heading5 } from '../../../shared/atoms/Heading5';
import { ImageGrid } from '../../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../../shared/atoms/Images';
import { ImageStripBox } from '../../../shared/atoms/ImageStrip';
import { LocaleString } from '../../../shared/components/LocaleString';
import { Pagination } from '../../../shared/components/Pagination';
import { useApi } from '../../../shared/hooks/use-api';
import { useApiTaskSearch } from '../../../shared/hooks/use-api-task-search';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { createLink } from '../../../shared/utility/create-link';

export const CrowdsourcingManifestReview: React.FC<{
  task: CrowdsourcingTask;
  projectId?: string;
}> = ({ task, projectId }) => {
  // Load manifest.
  const { id } = parseUrn(task.subject) || {};
  const { page = 1 } = useLocationQuery();
  const { slug } = useParams<{ slug: string }>();
  const api = useApi();
  const { resolvedData } = usePaginatedQuery(['site-manifest', { id, page }], async () => {
    if (id) {
      return api.getSiteManifest(id, { parent_task: task.parent_task, page });
    }
  });
  const { data: parentTask } = useApiTaskSearch<CrowdsourcingReview>({
    all: true,
    subject_parent: task.subject,
    type: 'crowdsourcing-review',
    root_task_id: task.root_task,
    detail: true,
  });

  const { t } = useTranslation();

  const manifest = resolvedData?.manifest;
  const pagination = resolvedData?.pagination;
  const manifestSubjects = resolvedData?.subjects;
  const [subjectMap] = useMemo(() => {
    if (!manifestSubjects) return [];
    const mapping: { [id: number]: CrowdsourcingReview | undefined } = {};
    let showDone = false;
    for (const { subject, status } of manifestSubjects) {
      if (!showDone && status === 3) {
        showDone = true;
      }
      const parsed = parseUrn(subject);
      if (parsed) {
        mapping[parsed.id] = parentTask && parentTask.tasks.find(ta => ta.subject === subject);
      }
    }
    return [mapping, showDone] as const;
  }, [manifestSubjects, parentTask]);

  return (
    <div>
      <Breadcrumbs
        type="site"
        items={[
          {
            label: task.name,
            link: createLink({ projectId: slug, taskId: task.id }),
            active: true,
          },
        ]}
      />
      {manifest ? (
        <>
          <Pagination
            pageParam={'page'}
            page={pagination ? pagination.page : 1}
            totalPages={pagination ? pagination.totalPages : 1}
            stale={!pagination}
          />
          <ImageGrid>
            {manifest.items.map((canvas, idx) => {
              const canvasReviewTask = subjectMap ? subjectMap[canvas.id] : undefined;

              return canvasReviewTask ? (
                <Link
                  key={`${canvas.id}_${idx}`}
                  to={createLink({
                    projectId,
                    taskId: canvasReviewTask.id,
                  })}
                >
                  <ImageStripBox key={idx}>
                    <CroppedImage>
                      {canvas.thumbnail ? <img alt={t('First image in manifest')} src={canvas.thumbnail} /> : null}
                    </CroppedImage>
                    <CanvasStatus status={canvasReviewTask.status} />
                    <LocaleString as={Heading5}>{canvas.label}</LocaleString>
                  </ImageStripBox>
                </Link>
              ) : (
                <ImageStripBox key={idx} style={{ opacity: 0.5 }}>
                  <CroppedImage>
                    {canvas.thumbnail ? <img alt={t('First image in manifest')} src={canvas.thumbnail} /> : null}
                  </CroppedImage>
                  <CanvasStatus status={0} />
                  <LocaleString as={Heading5}>{canvas.label}</LocaleString>
                </ImageStripBox>
              );
            })}
          </ImageGrid>
        </>
      ) : null}
    </div>
  );
};
