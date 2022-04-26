import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { Slot } from '../../shared/page-blocks/slot';
import { ManifestActions } from '../features/ManifestActions';
import { ManifestCanvasGrid } from '../features/ManifestCanvasGrid';
import { ManifestHeading } from '../features/ManifestHeading';
import { ManifestMetadata } from '../features/ManifestMetadata';
import { ManifestNotAvailableToBrowse } from '../features/ManifestNotAvailableToBrowse';
import { ManifestPagination } from '../features/ManifestPagination';
import { ManifestUserNotification } from '../features/ManifestUserNotification';
import { RequiredStatement } from '../features/RequiredStatement';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useManifest } from '../hooks/use-manifest';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { Redirect } from 'react-router-dom';
import '../features/ManifestHero';

export function ViewManifest() {
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

      <Slot name="manifest-listing-header" id="listing-header">
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
}
