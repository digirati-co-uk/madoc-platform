import React from 'react';
import { LocaleString } from '../../shared/components/LocaleString';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';

export const ViewManifest: React.FC<{
  collection: CollectionFull['collection'];
  manifest: ManifestFull['manifest'];
  pagination: ManifestFull['pagination'];
}> = ({ collection, manifest, pagination }) => {
  return (
    <>
      {collection ? (
        <h5>
          Part of{' '}
          <Link to={`/collections/${collection.id}`}>
            <LocaleString>{collection.label}</LocaleString>
          </Link>
        </h5>
      ) : null}
      <h1>
        <LocaleString>{manifest.label}</LocaleString>
      </h1>
      <Pagination
        pageParam={'m'}
        page={pagination ? pagination.page : 1}
        totalPages={pagination ? pagination.totalPages : 1}
        stale={!pagination}
      />
      <hr />
      <div>
        {manifest.items.map(canvas => (
          <div key={canvas.id} style={{ float: 'left' }}>
            {canvas.thumbnail ? <img src={canvas.thumbnail} alt="thumb" /> : null}
            <Link
              to={
                collection
                  ? `/collections/${collection.id}/manifests/${manifest.id}/c/${canvas.id}`
                  : `/manifests/${manifest.id}/c/${canvas.id}`
              }
            >
              <LocaleString>{canvas.label}</LocaleString>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};
