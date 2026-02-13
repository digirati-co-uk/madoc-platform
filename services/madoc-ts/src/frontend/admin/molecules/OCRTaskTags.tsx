import React from 'react';
import { PARAGRAPHS_PROFILE } from '../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { ResourceLinkResponse } from '../../../types/schemas/linking';
import { TaskItemTag, TaskItemTagSuccess } from '../../shared/atoms/TaskList';

export function OCRTaskTags(props: { links?: Array<ResourceLinkResponse> }) {
  const components: {
    alto: React.ReactNode | null;
    plaintext: React.ReactNode | null;
    importedOCR: React.ReactNode | null;
    otherTags: Array<React.ReactNode>;
  } = {
    alto: null,
    plaintext: null,
    importedOCR: null,
    otherTags: [],
  };

  if (!props.links || props.links.length === 0) {
    return <TaskItemTag>No OCR Data found</TaskItemTag>;
  }

  for (const link of props.links) {
    if (
      link.link.profile === 'http://www.loc.gov/standards/alto/v3/alto.xsd' ||
      link.link.profile === 'http://www.loc.gov/standards/alto/v4/alto.xsd'
    ) {
      components.alto = <TaskItemTag>ALTO</TaskItemTag>;
      continue;
    }

    if (link.link.format === 'text/plain') {
      components.plaintext = <TaskItemTag>Plaintext</TaskItemTag>;
      continue;
    }

    if (link.link.profile === PARAGRAPHS_PROFILE) {
      components.importedOCR = <TaskItemTagSuccess>Imported OCR</TaskItemTagSuccess>;
      continue;
    }

    components.otherTags.push(<TaskItemTag key={link.id}>{link.link.profile}</TaskItemTag>);
  }

  return (
    <>
      {components.alto}
      {components.plaintext}
      {components.importedOCR}
      {components.otherTags}
    </>
  );
}
