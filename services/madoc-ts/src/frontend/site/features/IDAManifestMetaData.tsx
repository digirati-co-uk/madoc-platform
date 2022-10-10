// import React from 'react';
// import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
// import { MetaData } from '../../shared/custom-blocks/metadata/metadata';
// import { usePaginatedData } from '../../shared/hooks/use-data';
// import { useSiteMetadataConfiguration } from '../../shared/hooks/use-site-metadata-configuration';
// import { useRouteContext } from '../hooks/use-route-context';
// import { ManifestLoader } from '../pages/loaders/manifest-loader';
//
// export const IDAManifestMetadata: React.FC = () => {
//   const { manifestId } = useRouteContext();
//   const { resolvedData: data } = usePaginatedData(ManifestLoader, undefined, { enabled: !!manifestId });
//   const { data: metadataConfig } = useSiteMetadataConfiguration();
//
//   if (!data || !metadataConfig) {
//     return null;
//   }
//
//   const metadata = data.manifest.metadata;
//
//   if (!metadata || !metadata.length) {
//     return null;
//   }
//
//   return <MetaData metadata={metadata || []} />;
// };
//
// blockEditorFor(IDAManifestMetadata, {
//   type: 'Metadata',
//   label: 'IDA Manifest metadata',
//   anyContext: ['manifest', 'canvas'],
//   requiredContext: ['manifest'],
//   editor: {},
//   defaultProps: {},
// });
