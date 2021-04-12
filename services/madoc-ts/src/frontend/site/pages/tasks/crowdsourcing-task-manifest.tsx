import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePaginatedQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { parseUrn } from '../../../../utility/parse-urn';
import { CanvasStatus } from '../../../shared/atoms/CanvasStatus';
import { Heading5 } from '../../../shared/atoms/Heading5';
import { ImageGrid } from '../../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../../shared/atoms/Images';
import { ImageStripBox } from '../../../shared/atoms/ImageStrip';
import { LocaleString, useCreateLocaleString } from '../../../shared/components/LocaleString';
import { Pagination } from '../../../shared/components/Pagination';
import { useApi } from '../../../shared/hooks/use-api';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useSubjectMap } from '../../../shared/hooks/use-subject-map';
import { createLink } from '../../../shared/utility/create-link';

export const CrowdsourcingTaskManifest: React.FC<{
  task: CrowdsourcingTask;
  subtask?: CrowdsourcingTask;
  projectId?: string;
}> = ({ task, projectId }) => {
  // Load manifest.
  const { id } = parseUrn(task.subject) || {};
  const { page = 1 } = useLocationQuery();
  const api = useApi();
  const { resolvedData } = usePaginatedQuery(['site-manifest', { id, page }], async () => {
    if (id) {
      return api.getSiteManifest(id, { parent_task: task.id, page });
    }
  });
  const { t } = useTranslation();
  const createLocaleString = useCreateLocaleString();

  const manifest = resolvedData?.manifest;
  const pagination = resolvedData?.pagination;
  const manifestSubjects = resolvedData?.subjects;
  const [subjectMap] = useSubjectMap(manifestSubjects);

  return (
    <div>
      {manifest ? (
        <>
          <Pagination
            pageParam={'page'}
            page={pagination ? pagination.page : 1}
            totalPages={pagination ? pagination.totalPages : 1}
            stale={!pagination}
          />
          <ImageGrid>
            {manifest.items.map((canvas, idx) => (
              <Link
                key={`${canvas.id}_${idx}`}
                to={createLink({
                  projectId,
                  manifestId: manifest?.id,
                  canvasId: canvas.id,
                  subRoute: 'model',
                })}
              >
                <ImageStripBox key={idx}>
                  <CroppedImage>
                    {canvas.thumbnail ? (
                      <img alt={createLocaleString(canvas.label, t('Canvas thumbnail'))} src={canvas.thumbnail} />
                    ) : null}
                  </CroppedImage>
                  {manifestSubjects && subjectMap ? <CanvasStatus status={subjectMap[canvas.id]} /> : null}
                  <LocaleString as={Heading5}>{canvas.label}</LocaleString>
                </ImageStripBox>
              </Link>
            ))}
          </ImageGrid>
        </>
      ) : null}
    </div>
  );
};
