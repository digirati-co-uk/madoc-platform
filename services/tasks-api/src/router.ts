import { deleteSubtasks } from './routes/delete-subtasks';
import { exportTasks } from './routes/export-tasks';
import { importTasks } from './routes/import-tasks';
import { updateMetadata } from './routes/update-metadata';
import { TypedRouter } from './utility/typed-router';
import { getSingleTask } from './routes/get-single-task';
import { updateSingleTask } from './routes/update-single-task';
import { deleteTask } from './routes/delete-task';
import { createSubtask } from './routes/create-subtask';
import { getAllTasks } from './routes/get-all-tasks';
import { createTask } from './routes/create-task';
import { acceptTask } from './routes/accept-task';
import { postEvent } from './routes/event';
import { getStatistics } from './routes/get-statistics';
import { getSubjectStatistics } from './routes/get-subject-statistics';

export const router = new TypedRouter({
  // All tasks
  'get-all-tasks': [TypedRouter.GET, '/tasks', getAllTasks],
  'create-task': [TypedRouter.POST, '/tasks', createTask, 'create-task'],
  'get-all-statistics': [TypedRouter.GET, '/tasks/stats', getStatistics],
  'export-tasks': [TypedRouter.GET, '/tasks/export-all', exportTasks],
  'import-tasks': [TypedRouter.POST, '/tasks/import', importTasks],

  // Single task.
  'get-single-task': [TypedRouter.GET, '/tasks/:id', getSingleTask],
  'get-task-statistics': [TypedRouter.GET, '/tasks/:id/stats', getStatistics],
  'update-single-task': [TypedRouter.PATCH, '/tasks/:id', updateSingleTask, 'update-task'],
  'update-task-metadata': [TypedRouter.PATCH, '/tasks/:id/metadata', updateMetadata],
  'delete-task': [TypedRouter.DELETE, '/tasks/:id', deleteTask],
  'delete-subtasks': [TypedRouter.DELETE, '/tasks/:id/subtasks', deleteSubtasks],
  'create-subtask': [TypedRouter.POST, '/tasks/:id/subtasks', createSubtask, 'create-sub-task'],
  'get-task-subjects': [TypedRouter.GET, '/tasks/:id/subjects', getSubjectStatistics],
  'post-task-subjects': [TypedRouter.POST, '/tasks/:id/subjects', getSubjectStatistics],
  'accept-task': [TypedRouter.POST, '/tasks/:id/accept', acceptTask],
  'post-task-event': [TypedRouter.POST, '/tasks/:id/dispatch/:event', postEvent],
});
