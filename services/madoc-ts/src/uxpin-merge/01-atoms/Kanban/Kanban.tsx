import React from 'react';
import { Kanban as OriginalKanban } from '../../../frontend/shared/atoms/Kanban';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Kanban(props: Props) {
  return <OriginalKanban {...props} />;
}

export default Kanban;