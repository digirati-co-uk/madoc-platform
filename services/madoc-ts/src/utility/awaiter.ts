type UnpackPromise<T> = T extends Promise<infer R> ? R : never;

export function createAwaiter() {
  const toAwait: Promise<any>[] = [];
  let i = 0;
  function awaitProperty<R extends Promise<any>>(promise: R, cb?: (value: UnpackPromise<R>) => void) {
    const t = +i;
    toAwait.push(
      promise.then(value => {
        if (cb) {
          cb(value);
        }
      })
    );
    i++;
  }

  return {
    awaitProperty,
    awaiter: () => Promise.all(toAwait),
  };
}
