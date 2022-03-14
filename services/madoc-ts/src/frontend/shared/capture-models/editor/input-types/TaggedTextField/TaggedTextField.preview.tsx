import React, { useMemo } from 'react';

import { presets } from './TaggedTextField.presets';
import { TagDefinition, TaggedTextFieldProps } from './TaggedTextField';
import { HTMLPreviewContainer } from '../HTMLField/HTMLField.preview';

function parseTags(prefix: string, tags: TagDefinition) {
  if (!tags.backgroundColor && !tags.color) {
    return '';
  }

  const selector = tags.isHTML ? tags.tag : `[data-tag="${tags.tag}"]`;
  return `
    ${prefix} ${selector} {
      ${tags.backgroundColor ? `background: ${tags.backgroundColor};` : ''}
      ${tags.color ? `color: ${tags.color};` : ''}
    }`;
}

function parseStyles(prefix: string, { tags = [], blocks = [] }: { tags?: TagDefinition[]; blocks?: TagDefinition[] }) {
  return `
    ${tags
      .map(tag => parseTags(prefix, tag))
      .filter(e => e)
      .join('')}
    ${blocks
      .map(block => parseTags(prefix, block))
      .filter(e => e)
      .join('')}
  `;
}

export const TaggedTextFieldPreview: React.FC<TaggedTextFieldProps> = ({ id, value, tags, blocks, preset }) => {
  const cssId = useMemo(() => id.replace(/-/, ''), [id]);
  const styles = useMemo(() => {
    return parseStyles(`.tagged-${cssId}`, preset && presets[preset] ? presets[preset] : { tags, blocks });
  }, [cssId, preset, tags, blocks]);

  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  return (
    <>
      <div className={`tagged-${cssId}`}>
        <HTMLPreviewContainer dangerouslySetInnerHTML={{ __html: value }} />
      </div>
      <style>{styles}</style>
    </>
  );
};
