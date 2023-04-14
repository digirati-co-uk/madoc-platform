import { Revisions } from '../../../shared/capture-models/editor/stores/revisions';
import React, { useEffect, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { RevisionRequest } from '../../../shared/capture-models/types/revision-request';
import { EmptyState } from '../../../shared/layout/EmptyState';
import {
  filterUserRevisions,
  revisionsMapToRevisionsList,
  useRevisionList,
} from '../../../shared/capture-models/new/hooks/use-revision-list';
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
    const [myRejected, setMyRejected] = useState<RevisionRequest[]>([]);
    const [myAcceptedRevisions, setMyAcceptedRevisions] = useState<RevisionRequest[]>([]);

    useEffect(() => {
      setMySubmitted([]);
      setMyUnpublished([]);
      setMyRejected([]);
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

    useEffect(() => {
      if (revisions.myRejected.length !== myRejected.length) {
        setMyRejected(revisions.myRejected);
      }
    }, [myRejected.length, revisions.myRejected]);

    useEffect(() => {
      if (revisions.myAcceptedRevisions.length !== myAcceptedRevisions.length) {
        setMyAcceptedRevisions(revisions.myAcceptedRevisions);
      }
    }, [myAcceptedRevisions.length, revisions.myAcceptedRevisions]);

    if (
      myUnpublished.length === 0 &&
      mySubmitted.length === 0 &&
      myAcceptedRevisions.length === 0 &&
      myRejected.length === 0
    ) {
      return <EmptyState>{t('No submissions yet')}</EmptyState>;
    }

    return (
      <div style={{ padding: '0 .5em' }}>
        <RevisionList title={t('Drafts')} revisions={myUnpublished} editable />
        <RevisionList title={t('In review')} revisions={mySubmitted} />
        <RevisionList title={t('Approved')} revisions={myAcceptedRevisions} />
        <RevisionList title={t('Rejected')} revisions={myRejected} />
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
