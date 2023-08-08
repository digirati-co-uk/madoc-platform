import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Heading1 } from '../../shared/typography/Heading1';
import { LocaleString } from '../../shared/components/LocaleString';
import { useManifest } from '../hooks/use-manifest';

export const ManifestHeading: React.FC = () => {
  const { data } = useManifest();

  if (!data?.manifest) {
    return <Heading1>...</Heading1>;
  }

  return <LocaleString as={Heading1}>{data.manifest.label}</LocaleString>;
};

blockEditorFor(ManifestHeading, {
  type: 'default.ManifestHeading',
  label: 'Manifest heading',
  anyContext: ['manifest'],
  requiredContext: ['manifest'],
  editor: {},
});
