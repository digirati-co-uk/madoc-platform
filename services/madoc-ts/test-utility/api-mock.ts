import { Response } from 'cross-fetch';
import { ConfigResponse } from '../src/types/schemas/config-response';
import { ProjectFull } from '../src/types/project-full';

export type ApiMockEndpoint = {
  response: any;
  bodyAssertion?: (body: any) => void;
};

export class ApiMock {
  mockStacks: {
    [url: string]: {
      GET: Array<ApiMockEndpoint>;
      POST: Array<ApiMockEndpoint>;
      PATCH: Array<ApiMockEndpoint>;
    };
  } = {};

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error();
    }
    jest.mock('cross-fetch', () => {
      return {
        __esModule: true,
        default: async (url: RequestInfo, options?: RequestInit): Promise<Response> => {
          return this.handleRequest(url, options);
        },
      };
    });
    const { api } = require('../src/gateway/api.server');
    api.jwtFunction = () => {
      return '1234';
    };
    api.gateway = 'https://mock';
  }

  async handleRequest(url: RequestInfo, options: RequestInit = {}): Promise<Response> {
    const method: any = options.method || 'GET';
    const endpoint = typeof url === 'string' ? url : url.url;
    const stacks: any = this.mockStacks[endpoint];
    if (!stacks || !stacks[method as any] || stacks[method as any].length === 0) {
      throw new Error(`No mock available.
Mock this route using the following:

    apiMock.mockRoute('${method}', '${(url as string).slice('https://mock'.length)}', {  });
  
      `);
    }

    const { response, bodyAssertion } = stacks[method as any].shift();

    if (bodyAssertion && options.body) {
      bodyAssertion(JSON.parse(options.body.toString() as any));
    }

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  }

  mockRoute(method: 'GET' | 'POST' | 'PATCH', url: string, response: any, bodyAssertion?: (body: any) => void) {
    const fullUrl = `https://mock${url}`;
    this.mockStacks[fullUrl] = this.mockStacks[fullUrl]
      ? this.mockStacks[fullUrl]
      : {
          GET: [],
          POST: [],
          PATCH: [],
        };

    this.mockStacks[fullUrl][method].push({ response, bodyAssertion });
  }

  mockConfigRequest(projectId: number, config: Partial<ProjectFull['config']>, service = 'madoc', extra = '') {
    const wrapper: ConfigResponse<ProjectFull['config']> = {
      config: [
        {
          id: '123',
          config_object: config,
          scope: [],
          scope_key: '',
        },
      ],
      query: {
        context: [],
        service: service,
      } as any,
    };
    this.mockRoute(
      'GET',
      `/api/configurator/query?context=urn%3Amadoc%3Asite%3A1&context=urn%3Amadoc%3Aproject%3A${projectId}${extra}&service=${service}`,
      wrapper
    );
  }

  assertEmpty() {
    const remaining = [];
    for (const stackKey of Object.keys(this.mockStacks)) {
      const stack = this.mockStacks[stackKey];
      for (const method of Object.keys(stack)) {
        if ((stack as any)[method].length) {
          remaining.push(`${method} ${stackKey.slice('https://mock'.length)}`);
        }
      }
    }

    if (remaining.length) {
      throw new Error(`
Some Fixtures were unused:
   ${remaining.join('\n   ')}
    
    `);
    }
  }
}
