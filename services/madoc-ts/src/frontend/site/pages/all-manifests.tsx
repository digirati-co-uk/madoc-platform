import React from 'react';
import { useTranslation } from 'react-i18next';
import {LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { useManifestList } from '../hooks/use-manifest-list';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../shared/atoms/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';

export const AllManifests: React.FC = () => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { latestData, resolvedData: data } = useManifestList();
  const createLocaleString = useCreateLocaleString();

  return (
    <>
      <h1>{t('All manifests')}</h1>
      <Pagination
        page={latestData ? latestData.pagination.page : 1}
        totalPages={latestData ? latestData.pagination.totalPages : 1}
        stale={!latestData}
      />
      <ImageGrid>
        {data?.manifests.map((manifest, idx) => (
          <Link to={createLink({ manifestId: manifest.id })} key={`${manifest.id}_${idx}`}>
            <ImageStripBox>
              <CroppedImage>
                {manifest.thumbnail ? (
                  <img
                    alt={createLocaleString(manifest.label, t('Untitled Manifest'))}
                    src={manifest.thumbnail}
                  />
                ) : null}
              </CroppedImage>
              <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
              <Subheading5>{t('{{count}} images', { count: manifest.canvasCount })}</Subheading5>
            </ImageStripBox>
          </Link>
        ))}
      </ImageGrid>
      <Pagination
        page={latestData ? latestData.pagination.page : 1}
        totalPages={latestData ? latestData.pagination.totalPages : 1}
        stale={!latestData}
      />
    </>
  );
};
