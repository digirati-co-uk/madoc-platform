export type MockTaggedWrapper<T, P> = string & {
  __Response: T;
  __Params: P;
};

export function sqlMock<T = any, P = any>(
  strings: TemplateStringsArray,
  ...vars: string[]
): MockTaggedWrapper<T & { rowCount?: number }, P> {
  let str = '';
  strings.forEach((string, i) => {
    str += string + (vars[i] || '');
  });
  return str as any;
}

export type GetTaggedWrapperParams<T> = T extends MockTaggedWrapper<infer R, any> ? R : never;
export type GetTaggedWrapperResponse<T> = T extends MockTaggedWrapper<any, infer R> ? R : never;
