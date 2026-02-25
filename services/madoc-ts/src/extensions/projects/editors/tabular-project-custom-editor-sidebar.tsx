import React, { useMemo, useState } from 'react';
import { EmptyState } from '@/frontend/shared/layout/EmptyState';
import { NotificationIcon } from '@/frontend/shared/icons/NotificationIcon';
import { LockIcon } from '@/frontend/shared/icons/LockIcon';
import { ModelDocumentIcon } from '@/frontend/shared/icons/ModelDocumentIcon';
import { PersonIcon } from '@/frontend/shared/icons/PersonIcon';
import { InfoIcon } from '@/frontend/shared/icons/InfoIcon';
import { NavIconContainer, NavIconNotifcation, PanelTitle } from '@/frontend/shared/layout/LayoutContainer';
import { useDocumentPanel } from '@/frontend/site/hooks/canvas-menu/document-panel';
import { useMetadataMenu } from '@/frontend/site/hooks/canvas-menu/metadata-panel';
import { usePersonalNotesMenu } from '@/frontend/site/hooks/canvas-menu/personal-notes';
import { useRevisionPanel } from '@/frontend/site/hooks/canvas-menu/revision-panel';
import type { TabularCellRef } from '@/frontend/admin/components/tabular/cast-a-net/types';
import FlagIcon from '@/frontend/shared/icons/FlagIcon';

type TabularSidebarPanelId = 'metadata' | 'document' | 'my-contributions' | 'personal-notes' | 'flag-cell';

type TabularSidebarPanel = {
  id: TabularSidebarPanelId;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  isHidden?: boolean;
  isDisabled?: boolean;
  notifications?: number;
};

export type TabularFlaggedCellItem = {
  key: string;
  rowIndex: number;
  columnKey: string;
  columnLabel: string;
  isVisibleInTable: boolean;
  comment?: string;
};

type TabularProjectCustomEditorSidebarProps = {
  isPanelOpen: boolean;
  onPanelOpenChange: (isOpen: boolean) => void;
  activeCell: TabularCellRef | null;
  activeCellColumnKey?: string;
  activeCellColumnLabel?: string;
  activeCellIsFlagged: boolean;
  activeCellComment: string;
  flaggedCells: TabularFlaggedCellItem[];
  canPersistFlags: boolean;
  onToggleActiveCellFlag: () => void;
  onUpdateActiveCellComment: (nextComment: string) => void;
  onFocusFlaggedCell: (rowIndex: number, columnKey: string) => void;
  onRemoveFlag: (rowIndex: number, columnKey: string) => void;
  onClearAllFlags: () => void;
};

type TabularSidebarFlagPanelProps = Pick<
  TabularProjectCustomEditorSidebarProps,
  | 'activeCell'
  | 'activeCellColumnKey'
  | 'activeCellColumnLabel'
  | 'activeCellIsFlagged'
  | 'activeCellComment'
  | 'flaggedCells'
  | 'canPersistFlags'
  | 'onToggleActiveCellFlag'
  | 'onUpdateActiveCellComment'
  | 'onFocusFlaggedCell'
  | 'onRemoveFlag'
  | 'onClearAllFlags'
>;

function TabularSidebarEmptyPanel({ message }: { message: string }) {
  return <EmptyState>{message}</EmptyState>;
}

function TabularSidebarFlagPanel({
  activeCell,
  activeCellColumnKey,
  activeCellColumnLabel,
  activeCellIsFlagged,
  activeCellComment,
  flaggedCells,
  canPersistFlags,
  onToggleActiveCellFlag,
  onUpdateActiveCellComment,
  onFocusFlaggedCell,
  onRemoveFlag,
  onClearAllFlags,
}: TabularSidebarFlagPanelProps) {
  const hasActiveCell = !!activeCell && !!activeCellColumnKey;
  const activeCellLabel = hasActiveCell
    ? `Row ${activeCell.row + 1}, ${activeCellColumnLabel || activeCellColumnKey}`
    : 'Select a cell in the table to flag it.';
  const flagButtonClasses = [
    'inline-flex h-10 w-12 items-center justify-center rounded-md border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    activeCellIsFlagged
      ? 'border-red-400 bg-red-100 text-red-700'
      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ].join(' ');

  return (
    <div className="flex flex-col gap-5 p-5">
      {!canPersistFlags ? (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-900">
          Cell flag storage is unavailable for this project capture model.
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Selected cell</div>
        <div className="mt-2 text-sm font-medium text-slate-900">{activeCellLabel}</div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className={flagButtonClasses}
            disabled={!hasActiveCell || !canPersistFlags}
            onClick={onToggleActiveCellFlag}
          >
            <FlagIcon />
          </button>
          <p className="text-xs font-medium text-slate-700">
            {activeCellIsFlagged ? 'Clear flag' : 'Flag as unclear / needs review'}
          </p>
        </div>
        <div className="mt-4">
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
            htmlFor="tabular-cell-flag-comment"
          >
            Reviewer note
          </label>
          <textarea
            id="tabular-cell-flag-comment"
            rows={4}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            placeholder={
              activeCellIsFlagged ? 'Add optional context for reviewers.' : 'Add a note to create a flag for this cell.'
            }
            disabled={!hasActiveCell || !canPersistFlags}
            value={activeCellComment}
            onChange={event => onUpdateActiveCellComment(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Flagged cells ({flaggedCells.length})
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!flaggedCells.length || !canPersistFlags}
            onClick={onClearAllFlags}
          >
            Clear all
          </button>
        </div>

        {!flaggedCells.length ? (
          <div className="pt-4 text-sm text-slate-500">No flagged cells yet.</div>
        ) : (
          <div className="mt-4 flex flex-col gap-3 pr-1">
            {flaggedCells.map(flag => (
              <div key={flag.key} className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="text-xs font-semibold leading-tight text-slate-900">
                  Row {flag.rowIndex + 1}, {flag.columnLabel}
                </div>
                {flag.comment ? (
                  <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{flag.comment}</div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!flag.isVisibleInTable}
                    onClick={() => onFocusFlaggedCell(flag.rowIndex, flag.columnKey)}
                  >
                    Go to cell
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => onRemoveFlag(flag.rowIndex, flag.columnKey)}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TabularProjectCustomEditorSidebar({
  isPanelOpen,
  onPanelOpenChange,
  activeCell,
  activeCellColumnKey,
  activeCellColumnLabel,
  activeCellIsFlagged,
  activeCellComment,
  flaggedCells,
  canPersistFlags,
  onToggleActiveCellFlag,
  onUpdateActiveCellComment,
  onFocusFlaggedCell,
  onRemoveFlag,
  onClearAllFlags,
}: TabularProjectCustomEditorSidebarProps) {
  const metadataPanel = useMetadataMenu();
  const documentPanel = useDocumentPanel();
  const myContributionsPanel = useRevisionPanel();
  const personalNotesPanel = usePersonalNotesMenu();
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
        id: 'personal-notes',
        label: personalNotesPanel.label || 'Personal notes',
        icon: personalNotesPanel.icon || <LockIcon />,
        content: personalNotesPanel.content || <TabularSidebarEmptyPanel message="No personal notes yet." />,
        isHidden: personalNotesPanel.isHidden,
        isDisabled: personalNotesPanel.isDisabled,
        notifications: personalNotesPanel.notifications,
      },
      {
        id: 'flag-cell',
        label: 'Cell review',
        icon: <NotificationIcon />,
        content: (
          <TabularSidebarFlagPanel
            activeCell={activeCell}
            activeCellColumnKey={activeCellColumnKey}
            activeCellColumnLabel={activeCellColumnLabel}
            activeCellIsFlagged={activeCellIsFlagged}
            activeCellComment={activeCellComment}
            flaggedCells={flaggedCells}
            canPersistFlags={canPersistFlags}
            onToggleActiveCellFlag={onToggleActiveCellFlag}
            onUpdateActiveCellComment={onUpdateActiveCellComment}
            onFocusFlaggedCell={onFocusFlaggedCell}
            onRemoveFlag={onRemoveFlag}
            onClearAllFlags={onClearAllFlags}
          />
        ),
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
      personalNotesPanel.label,
      personalNotesPanel.icon,
      personalNotesPanel.content,
      personalNotesPanel.isHidden,
      personalNotesPanel.isDisabled,
      personalNotesPanel.notifications,
      activeCell,
      activeCellColumnKey,
      activeCellColumnLabel,
      activeCellIsFlagged,
      activeCellComment,
      flaggedCells,
      canPersistFlags,
      onToggleActiveCellFlag,
      onUpdateActiveCellComment,
      onFocusFlaggedCell,
      onRemoveFlag,
      onClearAllFlags,
    ]
  );

  const visiblePanels = panels.filter(panel => !panel.isHidden);
  const fallbackPanel = visiblePanels.find(panel => !panel.isDisabled) || visiblePanels[0];
  const requestedPanel = panels.find(panel => panel.id === activePanelId);
  const resolvedActivePanel =
    requestedPanel && !requestedPanel.isDisabled && !requestedPanel.isHidden ? requestedPanel : fallbackPanel;
  const activePanel = isPanelOpen ? resolvedActivePanel : null;
  const activePanelLabel = activePanel?.label || '';
  const activePanelContent = activePanel?.content || null;

  return (
    <aside className="flex h-full min-h-0 min-w-0 overflow-hidden bg-white" style={{ height: '100%' }}>
      <nav className="h-full min-h-0 w-14 shrink-0 overflow-y-auto border-r border-gray-300 bg-white p-1">
        {panels.map(panel => {
          if (panel.isHidden) {
            return null;
          }
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
