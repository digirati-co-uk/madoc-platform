import * as fs from 'fs';
import React from 'react';
import * as ReactQuery from 'react-query';
import * as ReactRouterDom from 'react-router-dom';
import styled from 'styled-components';
import { NodeVM, VMScript } from 'vm2';
import * as publicApi from '../frontend/shared/plugins/public-api';

const vm = new NodeVM({
  require: {
    mock: {
      '@madoc.io/types': publicApi,
      'react-router-dom': ReactRouterDom,
      'react-query': ReactQuery,
      react: React,
      'styled-components': styled,
    },
  },

  // require: {
  //   // external: {
  //   //   transitive: false,
  //   //   modules: ALLOWED_MODULES as any,
  //   // },
  //   external: true,
  //   mock: {
  //     '@madoc.io/types': publicApi,
  //   },
  // },
  // wrapper: 'none',
  // sandbox: {
  //   Madoc: publicApi,
  //
  //   // global.Madoc, global.React, global.reactRouterDom
  //   React: React,
  //   reactRouteDom: ReactRouterDom,
  //   global: {
  //     React: React,
  //     reactRouteDom: ReactRouterDom,
  //     Madoc: publicApi,
  //   },
  // },
});

export async function sandboxedRequire(name: string) {
  const script = new VMScript((await fs.promises.readFile(name)).toString(), name);

  return vm.run(script);
}

export function sandboxRun(code: string) {
  const script = new VMScript(code, '');

  return vm.run(script);
}
