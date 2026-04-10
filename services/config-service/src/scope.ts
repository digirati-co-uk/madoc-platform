export function genKey(context: string[] | null | undefined, separator: string): string | undefined {
  if (context && Array.isArray(context) && context.length > 0) {
    return context.join(separator);
  }
  return undefined;
}

export function extendKeylist(
  keys: string[] | null | undefined,
  implicitKeys: string[] | null | undefined,
  appendImplicit: boolean
): string[] | undefined {
  if (keys == null) {
    return undefined;
  }

  const working = [...keys];
  if (implicitKeys && appendImplicit) {
    for (const key of implicitKeys) {
      if (working.length > 0) {
        if (working[working.length - 1] !== key) {
          working.push(key);
        }
      } else {
        working.push(key);
      }
    }
  }

  return working;
}

export function iterateKeylist(keys: string[] | null | undefined): string[][] | undefined {
  if (!keys || keys.length === 0) {
    return undefined;
  }

  const keyList: string[][] = [];
  const length = keys.length;

  for (let index = 0; index < length - 1; index++) {
    keyList.push([keys[0], ...keys.slice(index + 1)]);
    keyList.push(keys.slice(index + 1));
  }

  return keyList;
}

export function iterateSeparatedKeylist(
  keys: string[] | null | undefined,
  sep = '|',
  extendImpl = true,
  implicit?: string[] | null
): string[] | undefined {
  if (!keys || !Array.isArray(keys) || keys.length === 0) {
    return undefined;
  }

  const keylist = extendKeylist([...keys], implicit, extendImpl);
  const iterated = iterateKeylist(keylist);

  if (!iterated) {
    return undefined;
  }

  return iterated
    .map(context => genKey(context, sep))
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
}
