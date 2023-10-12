import * as React from 'react';
import { MetadataEmptyState } from '../../src/frontend/shared/atoms/MetadataConfiguration';
interface transcription {
  id: string;
  text: string;
  primary?: boolean;
}
export const TranscriptionsPanel: React.FC<{ transcriptions?: transcription[] }> = ({ transcriptions }) => {
  if (!transcriptions || !transcriptions.length) {
    return <MetadataEmptyState>No Transcriptions</MetadataEmptyState>;
  }
  transcriptions.map(trans => {
    return (
      <div key={trans.id}>
        <p>{trans.text}</p>
      </div>
    );
  });
};
