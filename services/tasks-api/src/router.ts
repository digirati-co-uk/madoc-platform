import { TypedRouter } from './utility/typed-router';
import { getSingleTask } from './routes/get-single-task';
import { updateSingleTask } from './routes/update-single-task';
import { deleteTask } from './routes/delete-task';
import { createSubtask } from './routes/create-subtask';
import { getAllTasks } from './routes/get-all-tasks';
import { createTask } from './routes/create-task';
import { acceptTask } from './routes/accept-task';

export const router = new TypedRouter({
  // All tasks
  'get-all-tasks': [TypedRouter.GET, '/tasks', getAllTasks],
  'create-task': [TypedRouter.POST, '/tasks', createTask, 'create-task'],

  // Single task.
  'get-single-task': [TypedRouter.GET, '/tasks/:id', getSingleTask],
  'update-single-task': [TypedRouter.PATCH, '/tasks/:id', updateSingleTask, 'update-task'],
  'delete-task': [TypedRouter.DELETE, '/tasks/:id', deleteTask],
  'create-subtask': [TypedRouter.POST, '/tasks/:id/subtasks', createSubtask, 'create-sub-task'],
  'accept-task': [TypedRouter.POST, '/tasks/:id/accept', acceptTask],
});
