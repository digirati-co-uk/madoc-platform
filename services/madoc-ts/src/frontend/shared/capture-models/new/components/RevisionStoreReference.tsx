import { forwardRef, useImperativeHandle } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';

export const RevisionStoreReference = forwardRef(function RevisionStoreReference(props, ref) {
  const store = Revisions.useStore();

  useImperativeHandle(
    ref,
    () => ({
      store,
    }),
    [store]
  );

  return null;
});
