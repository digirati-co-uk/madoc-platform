import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { IIIFHero } from '../../shared/components/IIIFHero';
import { useManifest } from '../hooks/use-manifest';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const ManifestHero: React.FC<{
  backgroundColor?: string;
  hideAsset?: boolean;
  titleOverride?: string;
  fullWidth?: boolean;
}> = ({ backgroundColor, hideAsset, titleOverride, fullWidth = true }) => {
  const { data } = useManifest();
  const manifest = data?.manifest;
  const createLink = useRelativeLinks();

  if (!manifest) {
    return null;
  }

  return (
    <IIIFHero
      fullWidth={fullWidth}
      title={titleOverride ? { none: [titleOverride] } : manifest.label}
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
    titleOverride: '',
    fullWidth: true,
  },
  editor: {
    titleOverride: { type: 'text-field', label: 'Override the hero title' },
    backgroundColor: { type: 'text-field', label: 'Background color (right side)' },
    hideAsset: { type: 'checkbox-field', label: 'Hide asset', inlineLabel: 'Check this to hide asset on the right' },
    fullWidth: { type: 'checkbox-field', label: 'Full width', inlineLabel: 'Show full width' },
  },
});
