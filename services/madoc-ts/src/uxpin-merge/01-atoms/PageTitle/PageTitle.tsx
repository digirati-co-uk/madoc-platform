import React from 'react';
import { PageTitle as OriginalPageTitle } from '../../../frontend/shared/atoms/PageTitle';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function PageTitle(props: Props) {
  return <OriginalPageTitle {...props} />;
}

export default PageTitle;