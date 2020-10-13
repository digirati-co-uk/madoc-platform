import React from 'react';
import { CrowdsourcingManifestTask } from '../../../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingReview } from '../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { SuccessMessage } from '../../shared/atoms/SuccessMessage';
import { WarningMessage } from '../../shared/atoms/WarningMessage';
import { LocaleString } from '../../shared/components/LocaleString';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { Link, useHistory } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { ProjectFull } from '../../../types/schemas/project-full';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { Heading5 } from '../../shared/atoms/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { useTranslation } from 'react-i18next';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { createLink } from '../../shared/utility/create-link';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { Button, MediumRoundedButton } from '../../shared/atoms/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { Heading3, Subheading3 } from '../../shared/atoms/Heading3';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { useApi } from '../../shared/hooks/use-api';
import { useMutation } from 'react-query';
import { ErrorMessage } from '../../shared/atoms/ErrorMessage';
import { Heading1, Subheading1 } from '../../shared/atoms/Heading1';

const ManifestUserTasks: React.FC<{
  tasks: Array<CrowdsourcingTask | CrowdsourcingManifestTask>;
  onSubmit: (id: string) => void;
}> = ({ tasks, onSubmit }) => {
  const inProgress = tasks.filter(task => task.status !== -1 && task.status !== 3);
  const doneTasks = tasks.filter(task => task.status === 3);
  const inReview = tasks.filter(task => task.status === 2);

  if (inReview.length) {
    return <WarningMessage>This manifest is currently in review</WarningMessage>;
  }

  if (inProgress.length) {
    const inProgressTask = inProgress[0];

    return (
      <InfoMessage>
        You are currently working on this manifest{' '}
        <Button onClick={() => onSubmit(inProgressTask.id as string)} style={{ marginLeft: 10 }}>
          Submit for review
        </Button>
      </InfoMessage>
    );
  }

  if (doneTasks.length) {
    return <SuccessMessage>You have already completed this manifest</SuccessMessage>;
  }

  return null;
};

export const ViewManifest: React.FC<{
  project?: ProjectFull;
  collection?: CollectionFull['collection'];
  manifest?: ManifestFull['manifest'];
  pagination?: ManifestFull['pagination'];
  manifestSubjects?: ManifestFull['subjects'];
  manifestTask?: CrowdsourcingManifestTask | CrowdsourcingTask;
  manifestUserTasks?: Array<CrowdsourcingTask | CrowdsourcingReview>;
  canUserSubmit?: boolean;
  refetch: () => Promise<any>;
}> = ({ collection, manifest, pagination, project, manifestUserTasks, manifestSubjects, refetch }) => {
  const { t } = useTranslation();
  const { filter, page } = useLocationQuery();
  const api = useApi();
  const history = useHistory();
  const user = api.getIsServer() ? undefined : api.getCurrentUser();
  const userCanSubmit = user
    ? user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.contribute') !== -1
    : false;
  const bypassCanvasNavigation = user
    ? user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.revision') !== -1
    : false;

  const claimManifest = project?.config.claimGranularity === 'manifest';

  const [subjectMap, showDoneButton] = useSubjectMap(manifestSubjects);

  const [getRandomCanvas, randomCanvas] = useMutation(async () => {
    if (project && manifest) {
      return await api.randomlyAssignedCanvas(project.id, manifest.id, {
        type: 'canvas',
        collectionId: collection?.id,
      });
    }
  });

  const [onContribute, { status: contributeStatus }] = useMutation(async (projectId: number | string) => {
    if (manifest) {
      return api
        .createResourceClaim(projectId, {
          collectionId: collection ? Number(collection.id) : undefined,
          manifestId: Number(manifest.id),
        })
        .then(resp => {
          history.push(
            createLink({
              projectId: project?.id,
              taskId: resp.claim.id,
            })
          );
        });
    }
  });

  const [onSubmitForReview] = useMutation(async (tid: string) => {
    await api.updateTask(tid, {
      status: 2,
      status_text: 'in review',
    });
    await refetch();
  });

  const preventCanvasNavigation =
    project &&
    project.config.allowCanvasNavigation === false &&
    (manifestUserTasks ? manifestUserTasks.length === 0 : true);
  const randomlyAssignCanvas = project && project.config.randomlyAssignCanvas;

  if (!manifest) {
    return <DisplayBreadcrumbs />;
  }

  return (
    <>
      <DisplayBreadcrumbs />
      <Heading1>
        <LocaleString>{manifest.label}</LocaleString>
      </Heading1>
      {manifestUserTasks && manifestUserTasks.length ? (
        <ManifestUserTasks onSubmit={onSubmitForReview} tasks={manifestUserTasks as any} />
      ) : null}
      {!preventCanvasNavigation || bypassCanvasNavigation ? (
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
      ) : null}
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
            {claimManifest && userCanSubmit && project ? (
              <>
                <Subheading3>Click below if you want to claim this manifest to contribute to.</Subheading3>
                <Button disabled={contributeStatus === 'loading'} onClick={() => onContribute(project.id)}>
                  Claim manifest
                </Button>
              </>
            ) : null}
            {randomlyAssignCanvas && userCanSubmit ? (
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
        {!preventCanvasNavigation || bypassCanvasNavigation ? (
          <>
            <Pagination
              pageParam={'m'}
              page={pagination ? pagination.page : 1}
              totalPages={pagination ? pagination.totalPages : 1}
              stale={!pagination}
              extraQuery={{ filter }}
            />
            <MediumRoundedButton as={Link} to={`/search?madoc_id=urn:madoc:manifest:${manifest.id}`}>
              Search this manifest
            </MediumRoundedButton>
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
        ) : null}
      </div>
    </>
  );
};
