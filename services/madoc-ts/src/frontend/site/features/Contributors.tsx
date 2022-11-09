import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import React from 'react';
import { useProjectCanvasTasks } from '../hooks/use-project-canvas-tasks';
import {useTaskMetadata} from "../hooks/use-task-metadata";

export function Contributors() {
  // const { data: project } = useProject();
  // const contributorTasks = useContributorTasks({ rootTaskId: project?.task_id });
  const tasks = useTaskMetadata();
  console.log('tasks', tasks);

  return <div>Hey this is a block to display a list of contributors </div>;
}

blockEditorFor(Contributors, {
  label: 'Contributors',
  type: 'default.contributors',
  editor: {},
});
