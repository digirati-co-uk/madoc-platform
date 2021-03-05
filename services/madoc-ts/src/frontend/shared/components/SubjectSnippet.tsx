import React, { useMemo } from 'react';
import { parseUrn } from '../../../utility/parse-urn';
import { SnippetLargeProps } from '../atoms/SnippetLarge';
import { CollectionSnippet } from './CollectionSnippet';
import { ManifestSnippet } from './ManifestSnippet';
import { CanvasSnippet } from './CanvasSnippet';

export const SubjectSnippet: React.FC<{
  subject: string;
  subjectParent?: string;
  model?: boolean;
  buttonText?: any;
} & Partial<SnippetLargeProps>> = ({ subject, subjectParent, model, buttonText, ...props }) => {
  const sub = useMemo(() => {
    const regex = /urn:madoc:(.*):(.*)/g;
    const result = regex.exec(subject);
    if (!result) {
      return { type: undefined, id: undefined };
    }

    const [, type, id] = result;

    return { type, id: Number(id) };
  }, [subject]);

  const parent = useMemo(() => (subjectParent ? parseUrn(subjectParent) : undefined), [subjectParent]);

  if (sub.type === 'collection') {
    return <CollectionSnippet id={sub.id} {...props} />;
  }

  if (sub.type === 'manifest') {
    return <ManifestSnippet id={sub.id} {...props} />;
  }

  if (sub.type === 'canvas') {
    return (
      <CanvasSnippet
        id={sub.id}
        manifestId={parent?.type === 'manifest' ? parent.id : undefined}
        model={model}
        buttonText={buttonText}
        {...props}
      />
    );
  }

  return null;
};
