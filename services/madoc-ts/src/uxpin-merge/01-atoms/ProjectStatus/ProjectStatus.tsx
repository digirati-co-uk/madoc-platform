import React from 'react';
import { ProjectStatus as OriginalProjectStatus } from '../../../frontend/shared/atoms/ProjectStatus';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function ProjectStatus(props: Props) {
  return <OriginalProjectStatus {...props} />;
}

export default ProjectStatus;