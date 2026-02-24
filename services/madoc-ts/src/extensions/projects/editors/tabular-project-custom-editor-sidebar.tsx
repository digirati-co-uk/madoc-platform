import React, { useMemo, useState } from 'react';
import { EmptyState } from '@/frontend/shared/layout/EmptyState';
import { NotificationIcon } from '@/frontend/shared/icons/NotificationIcon';
import { LockIcon } from '@/frontend/shared/icons/LockIcon';
import { ReviewIcon } from '@/frontend/shared/icons/ReviewIcon';
import { ModelDocumentIcon } from '@/frontend/shared/icons/ModelDocumentIcon';
import { PersonIcon } from '@/frontend/shared/icons/PersonIcon';
import { InfoIcon } from '@/frontend/shared/icons/InfoIcon';
import { NavIconContainer, NavIconNotifcation, PanelTitle } from '@/frontend/shared/layout/LayoutContainer';
import { useDocumentPanel } from '@/frontend/site/hooks/canvas-menu/document-panel';
import { useMetadataMenu } from '@/frontend/site/hooks/canvas-menu/metadata-panel';
import { useRevisionPanel } from '@/frontend/site/hooks/canvas-menu/revision-panel';

type TabularSidebarPanelId = 'metadata' | 'document' | 'my-contributions' | 'comments' | 'personal-notes' | 'flag-cell';

type TabularSidebarPanel = {
  id: TabularSidebarPanelId;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  isDisabled?: boolean;
  notifications?: number;
};

type TabularProjectCustomEditorSidebarProps = {
  isPanelOpen: boolean;
  onPanelOpenChange: (isOpen: boolean) => void;
};

function TabularSidebarEmptyPanel({ message }: { message: string }) {
  return <EmptyState>{message}</EmptyState>;
}

export function TabularProjectCustomEditorSidebar({
  isPanelOpen,
  onPanelOpenChange,
}: TabularProjectCustomEditorSidebarProps) {
  const metadataPanel = useMetadataMenu();
  const documentPanel = useDocumentPanel();
  const myContributionsPanel = useRevisionPanel();
  const [activePanelId, setActivePanelId] = useState<TabularSidebarPanelId>('metadata');

  const panels = useMemo<TabularSidebarPanel[]>(
    () => [
      {
        id: 'metadata',
        label: metadataPanel.label || 'Metadata',
        icon: metadataPanel.icon || <InfoIcon />,
        content: metadataPanel.content,
        isDisabled: metadataPanel.isDisabled,
      },
      {
        id: 'document',
        label: documentPanel.label || 'Document',
        icon: documentPanel.icon || <ModelDocumentIcon />,
        content: documentPanel.content,
        isDisabled: documentPanel.isDisabled,
        notifications: documentPanel.notifications,
      },
      {
        id: 'my-contributions',
        label: myContributionsPanel.label || 'My Contributions',
        icon: myContributionsPanel.icon || <PersonIcon />,
        content: myContributionsPanel.content,
        isDisabled: myContributionsPanel.isDisabled,
        notifications: myContributionsPanel.notifications,
      },
      {
        id: 'comments',
        label: 'Comments',
        icon: <ReviewIcon />,
        content: <TabularSidebarEmptyPanel message="Comments panel coming soon." />,
      },
      {
        id: 'personal-notes',
        label: 'Personal notes',
        icon: <LockIcon />,
        content: <TabularSidebarEmptyPanel message="Personal notes panel coming soon." />,
      },
      {
        id: 'flag-cell',
        label: 'Flag a cell',
        icon: <NotificationIcon />,
        content: <TabularSidebarEmptyPanel message="Flag a cell panel coming soon." />,
      },
    ],
    [
      metadataPanel.label,
      metadataPanel.icon,
      metadataPanel.content,
      metadataPanel.isDisabled,
      documentPanel.label,
      documentPanel.icon,
      documentPanel.content,
      documentPanel.isDisabled,
      documentPanel.notifications,
      myContributionsPanel.label,
      myContributionsPanel.icon,
      myContributionsPanel.content,
      myContributionsPanel.isDisabled,
      myContributionsPanel.notifications,
    ]
  );

  const fallbackPanel = panels.find(panel => !panel.isDisabled) || panels[0];
  const requestedPanel = panels.find(panel => panel.id === activePanelId);
  const resolvedActivePanel = requestedPanel && !requestedPanel.isDisabled ? requestedPanel : fallbackPanel;
  const activePanel = isPanelOpen ? resolvedActivePanel : null;
  const activePanelLabel = activePanel?.label || '';
  const activePanelContent = activePanel?.content || null;

  return (
    <aside className="flex h-full min-h-0 min-w-0 overflow-hidden bg-white" style={{ height: '100%' }}>
      <nav className="h-full min-h-0 w-14 shrink-0 overflow-y-auto border-r border-gray-300 bg-white p-1">
        {panels.map(panel => {
          const isActive = !panel.isDisabled && isPanelOpen && resolvedActivePanel?.id === panel.id;
          const isDisabled = !!panel.isDisabled;
          const panelNotification = panel.notifications;

          return (
            <NavIconContainer
              key={panel.id}
              as="button"
              data-has-label="false"
              $active={isActive}
              $disabled={isDisabled}
              onClick={() => {
                if (isDisabled) {
                  return;
                }

                const isCurrent = resolvedActivePanel?.id === panel.id;
                if (isPanelOpen && isCurrent) {
                  onPanelOpenChange(false);
                } else {
                  setActivePanelId(panel.id);
                  onPanelOpenChange(true);
                }
              }}
              title={panel.label}
              aria-label={panel.label}
              style={{
                width: '2.5em',
                height: '2.5em',
                margin: '0.25em auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {panelNotification && !isActive ? <NavIconNotifcation>{panelNotification}</NavIconNotifcation> : null}
              {panel.icon}
            </NavIconContainer>
          );
        })}
      </nav>

      {activePanel ? (
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-gray-300 px-4 py-3">
            <PanelTitle style={{ margin: 0 }}>{activePanelLabel}</PanelTitle>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-white">{activePanelContent}</div>
        </div>
      ) : null}
    </aside>
  );
}
