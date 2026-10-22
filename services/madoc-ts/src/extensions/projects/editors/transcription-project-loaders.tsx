import React from 'react';
import type { ProjectTemplateAdminModelProps } from '../types';

const Editor = React.lazy(async () => ({
  default: (await import('./transcription-project-editor')).TranscriptionProjectEditor,
}));
const MetadataEditor = React.lazy(async () => ({
  default: (await import('./transcription-project-metadata-editor')).TranscriptionProjectMetadataEditor,
}));

export function TranscriptionProjectEditorLoader() {
  if (typeof window === 'undefined') return null;
  return (
    <React.Suspense fallback={null}>
      <Editor />
    </React.Suspense>
  );
}

export function TranscriptionProjectMetadataEditorLoader(props: ProjectTemplateAdminModelProps) {
  if (typeof window === 'undefined') return null;
  return (
    <React.Suspense fallback={null}>
      <MetadataEditor {...props} />
    </React.Suspense>
  );
}
