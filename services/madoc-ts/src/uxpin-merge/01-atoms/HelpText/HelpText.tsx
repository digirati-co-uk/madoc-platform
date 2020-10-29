import React from 'react';
import { HelpText as OriginalHelpText } from '../../../frontend/shared/atoms/HelpText';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function HelpText(props: Props) {
  return <OriginalHelpText {...props} />;
}

export default HelpText;