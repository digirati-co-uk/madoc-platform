import React from 'react';
import { apiDefinitionIndex } from '../../../../gateway/api-definitions/_index';
import { ApiActionTask } from '../../../../gateway/tasks/api-action-task';
import { Heading2 } from '../../../shared/atoms/Heading2';

export const ViewApiActionTask: React.FC<{ task: ApiActionTask }> = ({ task }) => {
  const details = task.parameters[0];
  const definitionId = details?.request?.id;
  const definition = definitionId ? apiDefinitionIndex[definitionId] : null;

  if (!definition) {
    return <div>Invalid action</div>;
  }

  // Site id check.
  // User id check.
  // Definition check.

  return (
    <div>
      {definition.description.map((para, n) => (
        <p key={n} style={{ maxWidth: 650 }}>
          {para}
        </p>
      ))}
    </div>
  );
};
