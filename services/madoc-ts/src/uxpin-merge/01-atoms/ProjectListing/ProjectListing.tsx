import React from 'react';
import { ProjectListing as OriginalProjectListing } from '../../../frontend/shared/atoms/ProjectListing';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function ProjectListing(props: Props) {
  return <OriginalProjectListing {...props} />;
}

export default ProjectListing;