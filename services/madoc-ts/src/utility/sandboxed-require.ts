import * as fs from 'fs';
import { NodeVM, VMScript } from 'vm2';
import * as publicApi from '../frontend/shared/plugins/public-api';
import { ALLOWED_MODULES } from '../frontend/shared/plugins/use-module';

const vm = new NodeVM({
  require: {
    external: ALLOWED_MODULES,
  },
  sandbox: {
    Madoc: publicApi,
  },
});

export async function sandboxedRequire(name: string) {
  const script = new VMScript((await fs.promises.readFile(name)).toString(), name);

  return vm.run(script);
}

export function sandboxRun(code: string) {
  const script = new VMScript(code, '');

  return vm.run(script);
}
