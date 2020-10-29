import React from 'react';
import { SnippetLarge as OriginalSnippetLarge } from '../../../frontend/shared/atoms/SnippetLarge';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function SnippetLarge(props: Props) {
  return <OriginalSnippetLarge {...props} />;
}

export default SnippetLarge;