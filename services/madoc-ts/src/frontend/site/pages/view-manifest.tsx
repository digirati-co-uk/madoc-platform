import React from 'react';
import { CrowdsourcingManifestTask } from '../../../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingReview } from '../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
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
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { Heading3 } from '../../shared/atoms/Heading3';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { Heading1 } from '../../shared/atoms/Heading1';
import { Slot } from '../../shared/page-blocks/slot';
import { ManifestActions } from '../features/ManifestActions';
import { ManifestCanvasGrid } from '../features/ManifestCanvasGrid';
import { ManifestHeading } from '../features/ManifestHeading';
import { ManifestMetadata } from '../features/ManifestMetadata';
import { ManifestNotAvailableToBrowse } from '../features/ManifestNotAvailableToBrowse';
import { ManifestPagination } from '../features/ManifestPagination';
import { ManifestUserNotification } from '../features/ManifestUserNotification';
import { usePreventCanvasNavigation } from '../features/PreventUsersNavigatingCanvases';
import { RequiredStatement } from '../features/RequiredStatement';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useManifest } from '../hooks/use-manifest';
import { useManifestPageConfiguration } from '../hooks/use-manifest-page-configuration';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { Redirect } from 'react-router-dom';

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
}> = () => {
  const { data } = useManifest();
  const manifest = data?.manifest;
  const createLink = useRelativeLinks();
  const { listing, firstModel } = useLocationQuery();
  const config = useSiteConfiguration();

  if (!listing && config.project.skipManifestListingPage) {
    if (!manifest) {
      return null;
    }
    if (manifest.items.length) {
      return <Redirect to={createLink({ canvasId: manifest.items[0].id })} />;
    }
  }

  if (firstModel) {
    if (!manifest) {
      return null;
    }
    return <Redirect to={createLink({ canvasId: manifest?.items[0].id, subRoute: 'model' })} />;
  }

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="manifest-heading">
        <ManifestHeading />

        <RequiredStatement />

        <ManifestUserNotification />
      </Slot>

      <Slot name="manifest-actions">
        <ManifestActions />
      </Slot>

      <Slot name="manifest-fallback">
        <ManifestNotAvailableToBrowse />
      </Slot>

      <Slot name="manifest-listing-header">
        <ManifestPagination />
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '100%' }}>
          <Slot name="manifest-content">
            <ManifestCanvasGrid />
          </Slot>
        </div>
        <div style={{ maxWidth: 290 }}>
          <Slot name="manifest-metadata" small>
            <ManifestMetadata hidden={false} />
          </Slot>
        </div>
      </div>
      <Slot name="manifest-footer">
        <ManifestPagination />
      </Slot>
    </>
  );
};
