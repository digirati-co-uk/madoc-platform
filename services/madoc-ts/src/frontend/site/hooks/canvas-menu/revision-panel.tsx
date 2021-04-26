import { Revisions } from '@capture-models/editor';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../shared/atoms/EmptyState';
import {
  filterUserRevisions,
  revisionsMapToRevisionsList,
  useRevisionList,
} from '../../../shared/caputre-models/new/hooks/use-revision-list';
import { RevisionList } from '../../../shared/components/RevisionList';
import { useUser } from '../../../shared/hooks/use-site';
import { PersonIcon } from '../../../shared/icons/PersonIcon';
import { CanvasMenuHook } from './types';

const ViewRevisions: React.FC = () => {
  const { t } = useTranslation();
  const revisions = useRevisionList({ filterCurrentView: false });

  if (revisions.myUnpublished.length === 0 && revisions.mySubmitted.length === 0) {
    return <EmptyState>{t('No submissions yet')}</EmptyState>;
  }

  return (
    <div style={{ padding: 10 }}>
      <RevisionList revisions={revisions.myUnpublished} editable />

      <RevisionList revisions={revisions.mySubmitted} />
    </div>
  );
};

export function useRevisionPanel(): CanvasMenuHook {
  const { t } = useTranslation();
  const store = Revisions.useStore();
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
      });
    }
  }, [store, totalRevisions]);

  useEffect(() => {
    if (store) {
      const state = store.getState();
      const revisions = revisionsMapToRevisionsList(state.revisions);
      const currentUserSubmissions = filterUserRevisions(revisions, user);

      if (currentUserSubmissions.length) {
        setNotifications(currentUserSubmissions.length);
      }
    }
  }, [totalRevisions, store, user]);

  return {
    id: 'revision-panel',
    isHidden: !store,
    content: <ViewRevisions />,
    icon: <PersonIcon />,
    label: t('My Contributions', { count: notifications }),
    isLoaded: true,
    notifications: notifications,
  };
}
