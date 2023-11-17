import { stringify } from 'query-string';

export function createLink(opt: {
  projectId?: string | number;
  collectionId?: string | number;
  manifestId?: string | number;
  canvasId?: string | number;
  taskId?: string;
  parentTaskId?: string;
  query?: any;
  subRoute?: string;
  admin?: boolean;
  hash?: string;
}) {
  const subRoute = opt.subRoute ? `/${opt.subRoute}` : '';
  const query = opt.query && Object.keys(opt.query).length ? `?${stringify(opt.query)}` : '';
  const hash = opt.hash ? `#${opt.hash}` : '';
  const suffix = `${subRoute}${query}${hash}`;
  const canvasSubRoute = opt.admin ? 'canvases' : 'c';

  // Tasks.
  if (opt.taskId) {
    if (opt.parentTaskId) {
      if (opt.projectId) {
        return `/projects/${opt.projectId}/tasks/${opt.parentTaskId}/subtasks/${opt.taskId}${suffix}`;
      }
      return `/tasks/${opt.parentTaskId}/subtasks/${opt.taskId}${suffix}`;
    }
    if (opt.subRoute === 'tasks' || opt.subRoute === 'reviews') {
      if (opt.projectId) {
        return `/projects/${opt.projectId}/${opt.subRoute}/${opt.taskId}${query}${hash}`;
      }

      return `/${opt.subRoute}/${opt.taskId}${query}${hash}`;
    }
    if (opt.projectId) {
      return `/projects/${opt.projectId}/tasks/${opt.taskId}${suffix}`;
    }
    return `/tasks/${opt.taskId}${suffix}`;
  }

  // Canvas
  if (opt.canvasId) {
    const path = [];

    if (opt.projectId) {
      path.push(`/projects/${opt.projectId}`);
    }
    if (opt.collectionId) {
      path.push(`/collections/${opt.collectionId}`);
    }
    if (opt.manifestId) {
      path.push(`/manifests/${opt.manifestId}`);
    }

    if (path.length === 0) {
      return `/canvases/${opt.canvasId}${suffix}`;
    }

    path.push(`/${canvasSubRoute}/${opt.canvasId}`);

    return `${path.join('')}${suffix}`;
  }

  if (opt.manifestId) {
    const path = [];
    if (opt.projectId) {
      path.push(`/projects/${opt.projectId}`);
    }
    if (opt.collectionId) {
      path.push(`/collections/${opt.collectionId}`);
    }

    path.push(`/manifests/${opt.manifestId}`);

    return `${path.join('')}${suffix}`;
  }

  if (opt.collectionId) {
    const path = [];
    if (opt.projectId) {
      path.push(`/projects/${opt.projectId}`);
    }

    path.push(`/collections/${opt.collectionId}`);

    return `${path.join('')}${suffix}`;
  }

  if (opt.projectId) {
    return `/projects/${opt.projectId}${suffix}`;
  }

  if (opt.subRoute === 'tasks' || opt.subRoute === 'reviews') {
    return `/${opt.subRoute}${query}${hash}`;
  }

  return '';
}
