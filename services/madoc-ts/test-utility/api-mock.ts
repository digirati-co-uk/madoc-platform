import { Response } from 'cross-fetch';

export type ApiMockEndpoint = {
  response: any;
  bodyAssertion?: (body: any) => void;
};

export class ApiMock {
  mockStacks: {
    [url: string]: {
      GET: Array<ApiMockEndpoint>;
      POST: Array<ApiMockEndpoint>;
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

  mockRoute(method: 'GET' | 'POST', url: string, response: any, bodyAssertion?: (body: any) => void) {
    const fullUrl = `https://mock${url}`;
    this.mockStacks[fullUrl] = this.mockStacks[fullUrl]
      ? this.mockStacks[fullUrl]
      : {
          GET: [],
          POST: [],
        };

    this.mockStacks[fullUrl][method].push({ response, bodyAssertion });
  }
}
