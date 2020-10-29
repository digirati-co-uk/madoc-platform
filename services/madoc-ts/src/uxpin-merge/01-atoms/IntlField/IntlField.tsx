import React from 'react';
import { IntlField as OriginalIntlField } from '../../../frontend/shared/atoms/IntlField';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function IntlField(props: Props) {
  return <OriginalIntlField {...props} />;
}

export default IntlField;