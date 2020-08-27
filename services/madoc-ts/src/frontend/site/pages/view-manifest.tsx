import React, { useMemo } from 'react';
import { LocaleString } from '../../shared/components/LocaleString';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { ProjectFull } from '../../../types/schemas/project-full';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { Heading5 } from '../../shared/atoms/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { useTranslation } from 'react-i18next';
import { createLink } from '../../shared/utility/create-link';
import { parseUrn } from '../../../utility/parse-urn';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { Button } from '../../shared/atoms/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { Heading3, Subheading3 } from '../../shared/atoms/Heading3';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { useApi } from '../../shared/hooks/use-api';
import { useMutation } from 'react-query';
import { ErrorMessage } from '../../shared/atoms/ErrorMessage';
import { Heading1, Subheading1 } from '../../shared/atoms/Heading1';

export const ViewManifest: React.FC<{
  project?: ProjectFull;
  collection?: CollectionFull['collection'];
  manifest: ManifestFull['manifest'];
  pagination: ManifestFull['pagination'];
  manifestSubjects: ManifestFull['subjects'];
}> = ({ collection, manifest, pagination, project, manifestSubjects }) => {
  const { t } = useTranslation();
  const { filter, page } = useLocationQuery();
  const api = useApi();
  const user = api.getIsServer() ? undefined : api.getCurrentUser();
  const bypassCanvasNavigation =
    user?.scope.indexOf('site.admin') !== -1 || user?.scope.indexOf('models.revision') !== -1;

  const [subjectMap, showDoneButton] = useMemo(() => {
    if (!manifestSubjects) return [];
    const mapping: { [id: number]: number } = {};
    let showDone = false;
    for (const { subject, status } of manifestSubjects) {
      if (!showDone && status === 3) {
        showDone = true;
      }
      const parsed = parseUrn(subject);
      if (parsed) {
        mapping[parsed.id] = status;
      }
    }
    return [mapping, showDone] as const;
  }, [manifestSubjects]);

  const [getRandomCanvas, randomCanvas] = useMutation(async () => {
    if (project) {
      return await api.randomlyAssignedCanvas(project.id, manifest.id, {
        type: 'canvas',
        collectionId: collection?.id,
      });
    }
  });

  const preventCanvasNavigation = project && project.config.allowCanvasNavigation === false;
  const randomlyAssignCanvas = project && project.config.randomlyAssignCanvas;

  return (
    <>
      <DisplayBreadcrumbs />
      <Heading1>
        <LocaleString>{manifest.label}</LocaleString>
      </Heading1>
      <Subheading1
        as={HrefLink}
        href={createLink({
          collectionId: collection?.id,
          projectId: project?.id,
          manifestId: manifest.id,
          subRoute: 'mirador',
        })}
      >
        Open in mirador
      </Subheading1>
      {showDoneButton || filter ? (
        <Button
          as={HrefLink}
          href={createLink({
            projectId: project?.slug,
            collectionId: collection?.id,
            manifestId: manifest.id,
            query: { filter: filter ? undefined : 3, page },
          })}
        >
          {filter ? 'Show completed' : 'Hide completed'}
        </Button>
      ) : null}
      <div>
        {preventCanvasNavigation ? (
          <div style={{ textAlign: 'center', padding: '2em', background: '#eee' }}>
            <LockIcon style={{ fontSize: '3em' }} />
            <Heading3>This manifest is not available to browse</Heading3>
            {randomlyAssignCanvas ? (
              <>
                <Subheading3>Click below if you want to contribute to a random image.</Subheading3>
                {!randomCanvas.data ? (
                  <Button disabled={randomCanvas.status === 'loading'} onClick={() => getRandomCanvas()}>
                    Contribute to random canvas
                  </Button>
                ) : (
                  <div>
                    {randomCanvas.data.remainingTasks === 0 ? (
                      <ErrorMessage>Sorry no canvases are available at the moment</ErrorMessage>
                    ) : (
                      <>
                        <div>
                          <img src={randomCanvas.data.canvas.thumbnail} alt="thumbnail" />
                        </div>
                        <Heading3 $margin>
                          <LocaleString>{randomCanvas.data.canvas.label}</LocaleString>
                        </Heading3>
                        <Button as={HrefLink} href={createLink({ taskId: randomCanvas.data.claim.id })}>
                          Go to resource
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        ) : null}
        {preventCanvasNavigation && !bypassCanvasNavigation ? null : (
          <>
            <Pagination
              pageParam={'m'}
              page={pagination ? pagination.page : 1}
              totalPages={pagination ? pagination.totalPages : 1}
              stale={!pagination}
              extraQuery={{ filter }}
            />
            <ImageGrid>
              {manifest.items.map((canvas, idx) => (
                <Link
                  key={`${canvas.id}_${idx}`}
                  to={createLink({
                    projectId: project?.slug,
                    collectionId: collection?.id,
                    manifestId: manifest.id,
                    canvasId: canvas.id,
                  })}
                >
                  <ImageStripBox>
                    <CroppedImage>
                      {canvas.thumbnail ? <img alt={t('First image in manifest')} src={canvas.thumbnail} /> : null}
                    </CroppedImage>
                    {manifestSubjects && subjectMap ? <CanvasStatus status={subjectMap[canvas.id]} /> : null}
                    <LocaleString as={Heading5}>{canvas.label}</LocaleString>
                  </ImageStripBox>
                </Link>
              ))}
            </ImageGrid>
          </>
        )}
      </div>
    </>
  );
};
