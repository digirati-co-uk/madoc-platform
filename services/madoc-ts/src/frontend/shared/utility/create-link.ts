import { stringify } from 'query-string';

export function createLink(opt: {
  projectId?: string | number;
  collectionId?: string | number;
  manifestId?: string | number;
  canvasId?: string | number;
  taskId?: string;
  parentTaskId?: string;
  topicType?: string;
  topic?: string;
  query?: any;
  subRoute?: string;
  admin?: boolean;
  hash?: string;
}) {
  const subRoute = opt.subRoute ? `/${opt.subRoute}` : '';
  const suffix = `${subRoute}${opt.query && Object.keys(opt.query).length ? `?${stringify(opt.query)}` : ''}${
    opt.hash ? `#${opt.hash}` : ''
  }`;
  const canvasSubRoute = opt.admin ? 'canvases' : 'c';

  // Topics.
  if (opt.topicType) {
    const path = [];

    path.push(`/topics/${opt.topicType}`);
    if (opt.topic) {
      path.push(`/${opt.topic}`);
    }
    if (opt.manifestId) {
      path.push(`/manifests/${opt.manifestId}`);
    }
    if (opt.canvasId) {
      path.push(`/${canvasSubRoute}/${opt.canvasId}`);
    }
    return `${path.join('')}${suffix}`;
  }

  // Tasks.
  if (opt.taskId) {
    if (opt.parentTaskId) {
      if (opt.projectId) {
        return `/projects/${opt.projectId}/tasks/${opt.parentTaskId}/subtasks/${opt.taskId}${suffix}`;
      }
      return `/tasks/${opt.parentTaskId}/subtasks/${opt.taskId}${suffix}`;
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
    if (opt.collectionId && !opt.admin) {
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

  return '';
}
