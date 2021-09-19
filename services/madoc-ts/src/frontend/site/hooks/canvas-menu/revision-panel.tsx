import { Revisions } from '@capture-models/editor';
import { RevisionRequest } from '@capture-models/types';
import React, { useEffect, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../shared/layout/EmptyState';
import {
  filterUserRevisions,
  revisionsMapToRevisionsList,
  useRevisionList,
} from '../../../shared/caputre-models/new/hooks/use-revision-list';
import { RevisionList } from '../../../shared/components/RevisionList';
import { useUser } from '../../../shared/hooks/use-site';
import { PersonIcon } from '../../../shared/icons/PersonIcon';
import { useCanvasUserTasks } from '../use-canvas-user-tasks';
import { CanvasMenuHook } from './types';

const ViewRevisions = memo(
  ({ totalRevisions }: { totalRevisions?: number }) => {
    const { t } = useTranslation();
    const revisions = useRevisionList({ filterCurrentView: false });
    const { updatedAt } = useCanvasUserTasks();

    const [myUnpublished, setMyUnpublished] = useState<RevisionRequest[]>([]);
    const [mySubmitted, setMySubmitted] = useState<RevisionRequest[]>([]);

    useEffect(() => {
      setMySubmitted([]);
      setMyUnpublished([]);
    }, [updatedAt]);

    useEffect(() => {
      if (revisions.myUnpublished.length !== myUnpublished.length) {
        setMyUnpublished(revisions.myUnpublished);
      }
    }, [myUnpublished.length, revisions.myUnpublished]);

    useEffect(() => {
      if (revisions.mySubmitted.length !== mySubmitted.length) {
        setMySubmitted(revisions.mySubmitted);
      }
    }, [mySubmitted.length, revisions.mySubmitted]);

    if (myUnpublished.length === 0 && mySubmitted.length === 0) {
      return <EmptyState>{t('No submissions yet')}</EmptyState>;
    }

    return (
      <div style={{ padding: 10 }}>
        <RevisionList revisions={myUnpublished} editable />

        <RevisionList revisions={mySubmitted} />
      </div>
    );
  },
  (a, b) => a.totalRevisions === b.totalRevisions
);

export function useRevisionPanel(): CanvasMenuHook {
  const { t } = useTranslation();
  const store = Revisions.useStore();
  const [unsaved, setUnsaved] = useState<string[]>([]);
  const user = useUser();
  const [totalRevisions, setTotalRevisions] = useState<number | undefined>();
  const [notifications, setNotifications] = useState<number | undefined>();

  useEffect(() => {
    if (store) {
      return store.subscribe(() => {
        const state = store.getState();
        const revs = Object.keys(state.revisions);
        if (totalRevisions !== revs.length) {
          setTotalRevisions(revs.length);
        }
        if (state.unsavedRevisionIds !== unsaved) {
          setUnsaved(state.unsavedRevisionIds);
        }
      });
    }
  }, [store, unsaved, totalRevisions]);

  useEffect(() => {
    if (store) {
      const state = store.getState();
      const revisions = revisionsMapToRevisionsList(state.revisions);
      const currentUserSubmissions = filterUserRevisions(revisions, user);

      if (currentUserSubmissions.length) {
        setNotifications(currentUserSubmissions.length);
      }
    }
  }, [totalRevisions, unsaved, store, user]);

  return {
    id: 'revision-panel',
    isHidden: !store,
    content: <ViewRevisions totalRevisions={totalRevisions} />,
    icon: <PersonIcon />,
    label: t('My Contributions', { count: notifications }),
    isLoaded: true,
    notifications: notifications,
  };
}
