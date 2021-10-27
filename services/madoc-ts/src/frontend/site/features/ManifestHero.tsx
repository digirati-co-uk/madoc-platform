import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { IIIFHero } from '../../shared/components/IIIFHero';
import { useManifest } from '../hooks/use-manifest';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const ManifestHero: React.FC<{ backgroundColor?: string; hideAsset?: boolean }> = ({
  backgroundColor,
  hideAsset,
}) => {
  const { data } = useManifest();
  const manifest = data?.manifest;
  const createLink = useRelativeLinks();

  if (!manifest) {
    return null;
  }

  return (
    <IIIFHero
      title={manifest.label}
      description={manifest.summary}
      backgroundImage={manifest.items.length ? manifest.items[0].thumbnail : ''}
      asset={
        hideAsset || manifest.items.length === 0
          ? undefined
          : {
              label: manifest.label,
              attribution: manifest.requiredStatement?.value || { none: [''] },
              backgroundColor,
              thumbnails: manifest.items.slice(0, 5).map(i => i.thumbnail as string),
              link: createLink({ canvasId: manifest.items[0].id }),
            }
      }
    />
  );
};

blockEditorFor(ManifestHero, {
  type: 'default.ManifestHero',
  label: 'Manifest hero image',
  anyContext: ['manifest'],
  requiredContext: ['manifest'],
  defaultProps: {
    backgroundColor: '#000',
    hideAsset: false,
  },
  editor: {
    backgroundColor: { type: 'text-field', label: 'Background color (right side)' },
    hideAsset: { type: 'checkbox-field', label: 'Hide asset', inlineLabel: 'Check this to hide asset on the right' },
  },
});
