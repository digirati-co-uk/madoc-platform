import { ApiClient } from '../gateway/api';

export interface BaseExtension {
  api: ApiClient;
}

type MethodArgs<T> = T extends (arg: infer R) => Promise<infer R> ? R : never;

export class ExtensionManager<T extends BaseExtension> {
  extensions: T[];

  constructor(extensions: T[]) {
    this.extensions = extensions;
  }

  async dispatch<Type extends MethodArgs<T[R]>, R extends keyof T>(name: R, arg: Type) {
    let ret = arg;
    for (const extension of this.extensions) {
      console.log('Dispatch => ', (extension[name] as any));
      ret = await (extension[name] as any).call(extension, arg);
    }
    return ret;
  }
}
