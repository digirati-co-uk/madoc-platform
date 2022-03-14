import * as React from 'react';
import { useState } from 'react';
import { createChoice } from '../../../helpers/create-choice';
import { CaptureModel } from '../../../types/capture-model';
import { StructureMetadataEditor } from './StructureMetadataEditor';

export default { title: 'Capture model editor components/Edit structure' };

export const EditChoice: React.FC = () => {
  const [choice, setChoice] = useState<CaptureModel['structure']>(
    createChoice({
      label: 'Some choice',
      description: 'With a description',
    })
  );

  return <StructureMetadataEditor onSave={setChoice} structure={choice} />;
};
