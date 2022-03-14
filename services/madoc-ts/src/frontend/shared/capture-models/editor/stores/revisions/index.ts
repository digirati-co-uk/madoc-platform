import {
  RevisionProvider,
  useStore,
  useStoreActions,
  useStoreDispatch,
  useStoreRehydrated,
  useStoreState,
} from './revisions-provider';
import { createRevisionStore } from './revisions-store';

export * from './revisions-model';

export const Revisions = {
  Provider: RevisionProvider,
  useStore,
  useStoreState,
  useStoreActions,
  useStoreDispatch,
  useStoreRehydrated,
  createRevisionStore,
};
