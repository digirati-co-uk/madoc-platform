import { ProjectConfiguration } from '../src/types/schemas/project-configuration';
import { ProjectFull } from '../src/types/project-full';

export function createProjectMock(config: Partial<ProjectConfiguration> = {}) {
  return {
    id: 1,
    slug: '1',
    config: config,
    collection_id: 1,
    capture_model_id: 'model-id',
    status: 1,
    label: { en: ['A test project'] },
    content: {
      canvases: 0,
      manifests: 0,
    },
    statistics: {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
    },
    summary: { en: [''] },
    task_id: 'task-id',
  } as ProjectFull;
}

export class KoaContextMock {
  context = {
    state: {
      jwt: {
        user: { id: 1, name: 'test' },
        site: { id: 1 },
        scope: ['site.view'],
      },
    },
    params: {},
    requestBody: {},
    response: {
      status: 0,
      body: {},
    },
    siteManager: {
      getSiteUserById: (userId: number, siteId: number) => {
        if (userId === this.context.state.jwt.user.id) {
          return {
            id: this.context.state.jwt.user.id,
            name: this.context.state.jwt.user.name,
          };
        }

        if (this.otherUsers) {
          return this.otherUsers[userId];
        }

        return {
          id: userId,
          name: 'Test user',
        };
      },
    },
  };

  otherUsers: Array<{ id: number; name: string }> | undefined;

  withOtherUsers(users: Array<{ id: number; name: string }>) {
    this.otherUsers = users;
  }

  withRequestBody(rb: any) {
    this.context.requestBody = rb;
    return this;
  }

  withUser(user: { id: number; name: string }) {
    this.context.state.jwt.user = user;
    return this;
  }

  withScope(scope: string[]) {
    this.context.state.jwt.scope = scope;
    return this;
  }

  withParams(params: any) {
    this.context.params = params;
    return this;
  }

  get() {
    return this.context;
  }
}
