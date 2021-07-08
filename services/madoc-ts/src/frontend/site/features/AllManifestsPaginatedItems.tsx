import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { SingleLineHeading5, Subheading5 } from '../../shared/atoms/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { useManifestList } from '../hooks/use-manifest-list';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const AllManifestsPaginatedItems: React.FC = () => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { resolvedData: data } = useManifestList();
  const createLocaleString = useCreateLocaleString();

  return (
    <ImageGrid>
      {data?.manifests.map((manifest, idx) => (
        <Link to={createLink({ manifestId: manifest.id })} key={`${manifest.id}_${idx}`}>
          <ImageStripBox>
            <CroppedImage>
              {manifest.thumbnail ? (
                <img alt={createLocaleString(manifest.label, t('Untitled Manifest'))} src={manifest.thumbnail} />
              ) : null}
            </CroppedImage>
            <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
            <Subheading5>{t('{{count}} images', { count: manifest.canvasCount })}</Subheading5>
          </ImageStripBox>
        </Link>
      ))}
    </ImageGrid>
  );
};

blockEditorFor(AllManifestsPaginatedItems, {
  type: 'default.AllManifestsPaginatedItems',
  label: 'All manifests grid',
  internal: true,
  source: {
    name: 'All manifests page',
    type: 'custom-page',
    id: '/manifests',
  },
  anyContext: [],
  requiredContext: [],
  editor: {},
});
