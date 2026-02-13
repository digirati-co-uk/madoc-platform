import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddIcon } from '@/frontend/shared/icons/AddIcon';
import { AddImageIcon } from '@/frontend/shared/icons/AddImageIcon';
import { AnnotationsIcon } from '@/frontend/shared/icons/AnnotationsIcon';
import { ArrowBackIcon } from '@/frontend/shared/icons/ArrowBackIcon';
import { ArrowDownIcon } from '@/frontend/shared/icons/ArrowDownIcon';
import { ArrowForwardIcon } from '@/frontend/shared/icons/ArrowForwardIcon';
import { BoxIcon } from '@/frontend/shared/icons/BoxIcon';
import { BugIcon } from '@/frontend/shared/icons/BugIcon';
import { BuildingIcon } from '@/frontend/shared/icons/BuildingIcon';
import { CallMergeIcon } from '@/frontend/shared/icons/CallMergeIcon';
import CheckCircleIcon from '@/frontend/shared/icons/CheckCircleIcon';
import { ChevronDown, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from '@/frontend/shared/icons/ChevronIcon';
import { CircleIcon } from '@/frontend/shared/icons/CircleIcon';
import { CloseIcon } from '@/frontend/shared/icons/CloseIcon';
import { CodeIcon } from '@/frontend/shared/icons/CodeIcon';
import CollectionIcon from '@/frontend/shared/icons/CollectionIcon';
import { CompareIcon } from '@/frontend/shared/icons/CompareIcon';
import { ContributionIcon } from '@/frontend/shared/icons/ContributionIcon';
import { CusorIcon } from '@/frontend/shared/icons/CursorIcon';
import { DeleteForeverIcon } from '@/frontend/shared/icons/DeleteForeverIcon';
import { DownArrowIcon } from '@/frontend/shared/icons/DownArrowIcon';
import { DrawIcon } from '@/frontend/shared/icons/DrawIcon';
import { EditIcon } from '@/frontend/shared/icons/EditIcon';
import { ErrorIcon } from '@/frontend/shared/icons/ErrorIcon';
import { ExperimentalIcon } from '@/frontend/shared/icons/ExperimentalIcon';
import { FilterIcon } from '@/frontend/shared/icons/FilterIcon';
import { FullScreenEnterIcon } from '@/frontend/shared/icons/FullScreenEnterIcon';
import { FullScreenExitIcon } from '@/frontend/shared/icons/FullScreenExitIcon';
import { GradingIcon } from '@/frontend/shared/icons/GradingIcon';
import { GridIcon } from '@/frontend/shared/icons/GridIcon';
import { HexagonIcon } from '@/frontend/shared/icons/HexagonIcon';
import { HomeIcon } from '@/frontend/shared/icons/HomeIcon';
import HourglassIcon from '@/frontend/shared/icons/HourglassIcon';
import { InfoIcon } from '@/frontend/shared/icons/InfoIcon';
import InProgressIcon from '@/frontend/shared/icons/InProgressIcon';
import { InterfaceIcon } from '@/frontend/shared/icons/InterfaceIcon';
import { LineBoxIcon } from '@/frontend/shared/icons/LineBoxIcon';
import { LineIcon } from '@/frontend/shared/icons/LineIcon';
import { LinkIcon } from '@/frontend/shared/icons/LinkIcon';
import ListItemIcon from '@/frontend/shared/icons/ListItemIcon';
import { LockIcon } from '@/frontend/shared/icons/LockIcon';
import { MailIcon } from '@/frontend/shared/icons/MailIcon';
import { MinusIcon } from '@/frontend/shared/icons/MinusIcon';
import { ModelDocumentIcon } from '@/frontend/shared/icons/ModelDocumentIcon';
import NoEntryIcon from '@/frontend/shared/icons/NoEntryIcon';
import { NotificationIcon } from '@/frontend/shared/icons/NotificationIcon';
import { NotStartedIcon } from '@/frontend/shared/icons/NotStartedIcon';
import { NumberedListIcon } from '@/frontend/shared/icons/NumberedListIcon';
import { OpacityIcon } from '@/frontend/shared/icons/OpacityIcon';
import { PanIcon } from '@/frontend/shared/icons/PanIcon';
import PendingIcon from '@/frontend/shared/icons/PendingIcon';
import { PersonIcon } from '@/frontend/shared/icons/PersonIcon';
import { PlusIcon } from '@/frontend/shared/icons/PlusIcon';
import { PolygonIcon } from '@/frontend/shared/icons/PolgonIcon';
import { PreviewIcon } from '@/frontend/shared/icons/PreviewIcon';
import { ProgressIcon } from '@/frontend/shared/icons/ProgressIcon';
import { QuoteIcon } from '@/frontend/shared/icons/QuoteIcon';
import { RequestChangesIcon } from '@/frontend/shared/icons/RequestChangesIcon';
import ResizeHandleIcon from '@/frontend/shared/icons/ResizeHandleIcon';
import { ReviewIcon } from '@/frontend/shared/icons/ReviewIcon';
import { RotateIcon } from '@/frontend/shared/icons/RotateIcon';
import { SearchIcon } from '@/frontend/shared/icons/SearchIcon';
import { SettingsIcon } from '@/frontend/shared/icons/SettingsIcon';
import { ShapesIcon } from '@/frontend/shared/icons/ShapesIcon';
import { SortIcon } from '@/frontend/shared/icons/SortIcon';
import { SplitIcon } from '@/frontend/shared/icons/SplitIcon';
import { SquareIcon } from '@/frontend/shared/icons/SquareIcon';
import { TableHandleIcon } from '@/frontend/shared/icons/TableHandleIcon';
import { ThemeIcon } from '@/frontend/shared/icons/ThemeIcon';
import { TickIcon, WhiteTickIcon } from '@/frontend/shared/icons/TickIcon';
import { TranscriptionIcon } from '@/frontend/shared/icons/TranscriptionIcon';
import { TriangleIcon } from '@/frontend/shared/icons/TriangleIcon';
import UnlockSmileyIcon from '@/frontend/shared/icons/UnlockSmileyIcon';
import { UnorderedListIcon } from '@/frontend/shared/icons/UnorderedListIcon';

const icons = [
  {
    name: 'AddIcon',
    component: AddIcon,
    importLine: 'import { AddIcon } from \'@/frontend/shared/icons/AddIcon\';',
  },
  {
    name: 'AddImageIcon',
    component: AddImageIcon,
    importLine: 'import { AddImageIcon } from \'@/frontend/shared/icons/AddImageIcon\';',
  },
  {
    name: 'AnnotationsIcon',
    component: AnnotationsIcon,
    importLine: 'import { AnnotationsIcon } from \'@/frontend/shared/icons/AnnotationsIcon\';',
  },
  {
    name: 'ArrowBackIcon',
    component: ArrowBackIcon,
    importLine: 'import { ArrowBackIcon } from \'@/frontend/shared/icons/ArrowBackIcon\';',
  },
  {
    name: 'ArrowDownIcon',
    component: ArrowDownIcon,
    importLine: 'import { ArrowDownIcon } from \'@/frontend/shared/icons/ArrowDownIcon\';',
  },
  {
    name: 'ArrowForwardIcon',
    component: ArrowForwardIcon,
    importLine: 'import { ArrowForwardIcon } from \'@/frontend/shared/icons/ArrowForwardIcon\';',
  },
  {
    name: 'BoxIcon',
    component: BoxIcon,
    importLine: 'import { BoxIcon } from \'@/frontend/shared/icons/BoxIcon\';',
  },
  {
    name: 'BugIcon',
    component: BugIcon,
    importLine: 'import { BugIcon } from \'@/frontend/shared/icons/BugIcon\';',
  },
  {
    name: 'BuildingIcon',
    component: BuildingIcon,
    importLine: 'import { BuildingIcon } from \'@/frontend/shared/icons/BuildingIcon\';',
  },
  {
    name: 'CallMergeIcon',
    component: CallMergeIcon,
    importLine: 'import { CallMergeIcon } from \'@/frontend/shared/icons/CallMergeIcon\';',
  },
  {
    name: 'CheckCircleIcon',
    component: CheckCircleIcon,
    importLine: 'import CheckCircleIcon from \'@/frontend/shared/icons/CheckCircleIcon\';',
  },
  {
    name: 'ChevronDown',
    component: ChevronDown,
    importLine: 'import { ChevronDown } from \'@/frontend/shared/icons/ChevronIcon\';',
  },
  {
    name: 'ChevronFirst',
    component: ChevronFirst,
    importLine: 'import { ChevronFirst } from \'@/frontend/shared/icons/ChevronIcon\';',
  },
  {
    name: 'ChevronLast',
    component: ChevronLast,
    importLine: 'import { ChevronLast } from \'@/frontend/shared/icons/ChevronIcon\';',
  },
  {
    name: 'ChevronLeft',
    component: ChevronLeft,
    importLine: 'import { ChevronLeft } from \'@/frontend/shared/icons/ChevronIcon\';',
  },
  {
    name: 'ChevronRight',
    component: ChevronRight,
    importLine: 'import { ChevronRight } from \'@/frontend/shared/icons/ChevronIcon\';',
  },
  {
    name: 'CircleIcon',
    component: CircleIcon,
    importLine: 'import { CircleIcon } from \'@/frontend/shared/icons/CircleIcon\';',
  },
  {
    name: 'CloseIcon',
    component: CloseIcon,
    importLine: 'import { CloseIcon } from \'@/frontend/shared/icons/CloseIcon\';',
  },
  {
    name: 'CodeIcon',
    component: CodeIcon,
    importLine: 'import { CodeIcon } from \'@/frontend/shared/icons/CodeIcon\';',
  },
  {
    name: 'CollectionIcon',
    component: CollectionIcon,
    importLine: 'import CollectionIcon from \'@/frontend/shared/icons/CollectionIcon\';',
  },
  {
    name: 'CompareIcon',
    component: CompareIcon,
    importLine: 'import { CompareIcon } from \'@/frontend/shared/icons/CompareIcon\';',
  },
  {
    name: 'ContributionIcon',
    component: ContributionIcon,
    importLine: 'import { ContributionIcon } from \'@/frontend/shared/icons/ContributionIcon\';',
  },
  {
    name: 'CusorIcon',
    component: CusorIcon,
    importLine: 'import { CusorIcon } from \'@/frontend/shared/icons/CursorIcon\';',
  },
  {
    name: 'DeleteForeverIcon',
    component: DeleteForeverIcon,
    importLine: 'import { DeleteForeverIcon } from \'@/frontend/shared/icons/DeleteForeverIcon\';',
  },
  {
    name: 'DownArrowIcon',
    component: DownArrowIcon,
    importLine: 'import { DownArrowIcon } from \'@/frontend/shared/icons/DownArrowIcon\';',
  },
  {
    name: 'DrawIcon',
    component: DrawIcon,
    importLine: 'import { DrawIcon } from \'@/frontend/shared/icons/DrawIcon\';',
  },
  {
    name: 'EditIcon',
    component: EditIcon,
    importLine: 'import { EditIcon } from \'@/frontend/shared/icons/EditIcon\';',
  },
  {
    name: 'ErrorIcon',
    component: ErrorIcon,
    importLine: 'import { ErrorIcon } from \'@/frontend/shared/icons/ErrorIcon\';',
  },
  {
    name: 'ExperimentalIcon',
    component: ExperimentalIcon,
    importLine: 'import { ExperimentalIcon } from \'@/frontend/shared/icons/ExperimentalIcon\';',
  },
  {
    name: 'FilterIcon',
    component: FilterIcon,
    importLine: 'import { FilterIcon } from \'@/frontend/shared/icons/FilterIcon\';',
  },
  {
    name: 'FullScreenEnterIcon',
    component: FullScreenEnterIcon,
    importLine: 'import { FullScreenEnterIcon } from \'@/frontend/shared/icons/FullScreenEnterIcon\';',
  },
  {
    name: 'FullScreenExitIcon',
    component: FullScreenExitIcon,
    importLine: 'import { FullScreenExitIcon } from \'@/frontend/shared/icons/FullScreenExitIcon\';',
  },
  {
    name: 'GradingIcon',
    component: GradingIcon,
    importLine: 'import { GradingIcon } from \'@/frontend/shared/icons/GradingIcon\';',
  },
  {
    name: 'GridIcon',
    component: GridIcon,
    importLine: 'import { GridIcon } from \'@/frontend/shared/icons/GridIcon\';',
  },
  {
    name: 'HexagonIcon',
    component: HexagonIcon,
    importLine: 'import { HexagonIcon } from \'@/frontend/shared/icons/HexagonIcon\';',
  },
  {
    name: 'HomeIcon',
    component: HomeIcon,
    importLine: 'import { HomeIcon } from \'@/frontend/shared/icons/HomeIcon\';',
  },
  {
    name: 'HourglassIcon',
    component: HourglassIcon,
    importLine: 'import HourglassIcon from \'@/frontend/shared/icons/HourglassIcon\';',
  },
  {
    name: 'InfoIcon',
    component: InfoIcon,
    importLine: 'import { InfoIcon } from \'@/frontend/shared/icons/InfoIcon\';',
  },
  {
    name: 'InProgressIcon',
    component: InProgressIcon,
    importLine: 'import InProgressIcon from \'@/frontend/shared/icons/InProgressIcon\';',
  },
  {
    name: 'InterfaceIcon',
    component: InterfaceIcon,
    importLine: 'import { InterfaceIcon } from \'@/frontend/shared/icons/InterfaceIcon\';',
  },
  {
    name: 'LineBoxIcon',
    component: LineBoxIcon,
    importLine: 'import { LineBoxIcon } from \'@/frontend/shared/icons/LineBoxIcon\';',
  },
  {
    name: 'LineIcon',
    component: LineIcon,
    importLine: 'import { LineIcon } from \'@/frontend/shared/icons/LineIcon\';',
  },
  {
    name: 'LinkIcon',
    component: LinkIcon,
    importLine: 'import { LinkIcon } from \'@/frontend/shared/icons/LinkIcon\';',
  },
  {
    name: 'ListItemIcon',
    component: ListItemIcon,
    importLine: 'import ListItemIcon from \'@/frontend/shared/icons/ListItemIcon\';',
  },
  {
    name: 'LockIcon',
    component: LockIcon,
    importLine: 'import { LockIcon } from \'@/frontend/shared/icons/LockIcon\';',
  },
  {
    name: 'MailIcon',
    component: MailIcon,
    importLine: 'import { MailIcon } from \'@/frontend/shared/icons/MailIcon\';',
  },
  {
    name: 'MinusIcon',
    component: MinusIcon,
    importLine: 'import { MinusIcon } from \'@/frontend/shared/icons/MinusIcon\';',
  },
  {
    name: 'ModelDocumentIcon',
    component: ModelDocumentIcon,
    importLine: 'import { ModelDocumentIcon } from \'@/frontend/shared/icons/ModelDocumentIcon\';',
  },
  {
    name: 'NoEntryIcon',
    component: NoEntryIcon,
    importLine: 'import NoEntryIcon from \'@/frontend/shared/icons/NoEntryIcon\';',
  },
  {
    name: 'NotificationIcon',
    component: NotificationIcon,
    importLine: 'import { NotificationIcon } from \'@/frontend/shared/icons/NotificationIcon\';',
  },
  {
    name: 'NotStartedIcon',
    component: NotStartedIcon,
    importLine: 'import { NotStartedIcon } from \'@/frontend/shared/icons/NotStartedIcon\';',
  },
  {
    name: 'NumberedListIcon',
    component: NumberedListIcon,
    importLine: 'import { NumberedListIcon } from \'@/frontend/shared/icons/NumberedListIcon\';',
  },
  {
    name: 'OpacityIcon',
    component: OpacityIcon,
    importLine: 'import { OpacityIcon } from \'@/frontend/shared/icons/OpacityIcon\';',
  },
  {
    name: 'PanIcon',
    component: PanIcon,
    importLine: 'import { PanIcon } from \'@/frontend/shared/icons/PanIcon\';',
  },
  {
    name: 'PendingIcon',
    component: PendingIcon,
    importLine: 'import PendingIcon from \'@/frontend/shared/icons/PendingIcon\';',
  },
  {
    name: 'PersonIcon',
    component: PersonIcon,
    importLine: 'import { PersonIcon } from \'@/frontend/shared/icons/PersonIcon\';',
  },
  {
    name: 'PlusIcon',
    component: PlusIcon,
    importLine: 'import { PlusIcon } from \'@/frontend/shared/icons/PlusIcon\';',
  },
  {
    name: 'PolygonIcon',
    component: PolygonIcon,
    importLine: 'import { PolygonIcon } from \'@/frontend/shared/icons/PolgonIcon\';',
  },
  {
    name: 'PreviewIcon',
    component: PreviewIcon,
    importLine: 'import { PreviewIcon } from \'@/frontend/shared/icons/PreviewIcon\';',
  },
  {
    name: 'ProgressIcon',
    component: ProgressIcon,
    importLine: 'import { ProgressIcon } from \'@/frontend/shared/icons/ProgressIcon\';',
  },
  {
    name: 'QuoteIcon',
    component: QuoteIcon,
    importLine: 'import { QuoteIcon } from \'@/frontend/shared/icons/QuoteIcon\';',
  },
  {
    name: 'RequestChangesIcon',
    component: RequestChangesIcon,
    importLine: 'import { RequestChangesIcon } from \'@/frontend/shared/icons/RequestChangesIcon\';',
  },
  {
    name: 'ResizeHandleIcon',
    component: ResizeHandleIcon,
    importLine: 'import ResizeHandleIcon from \'@/frontend/shared/icons/ResizeHandleIcon\';',
  },
  {
    name: 'ReviewIcon',
    component: ReviewIcon,
    importLine: 'import { ReviewIcon } from \'@/frontend/shared/icons/ReviewIcon\';',
  },
  {
    name: 'RotateIcon',
    component: RotateIcon,
    importLine: 'import { RotateIcon } from \'@/frontend/shared/icons/RotateIcon\';',
  },
  {
    name: 'SearchIcon',
    component: SearchIcon,
    importLine: 'import { SearchIcon } from \'@/frontend/shared/icons/SearchIcon\';',
  },
  {
    name: 'SettingsIcon',
    component: SettingsIcon,
    importLine: 'import { SettingsIcon } from \'@/frontend/shared/icons/SettingsIcon\';',
  },
  {
    name: 'ShapesIcon',
    component: ShapesIcon,
    importLine: 'import { ShapesIcon } from \'@/frontend/shared/icons/ShapesIcon\';',
  },
  {
    name: 'SortIcon',
    component: SortIcon,
    importLine: 'import { SortIcon } from \'@/frontend/shared/icons/SortIcon\';',
  },
  {
    name: 'SplitIcon',
    component: SplitIcon,
    importLine: 'import { SplitIcon } from \'@/frontend/shared/icons/SplitIcon\';',
  },
  {
    name: 'SquareIcon',
    component: SquareIcon,
    importLine: 'import { SquareIcon } from \'@/frontend/shared/icons/SquareIcon\';',
  },
  {
    name: 'TableHandleIcon',
    component: TableHandleIcon,
    importLine: 'import { TableHandleIcon } from \'@/frontend/shared/icons/TableHandleIcon\';',
  },
  {
    name: 'ThemeIcon',
    component: ThemeIcon,
    importLine: 'import { ThemeIcon } from \'@/frontend/shared/icons/ThemeIcon\';',
  },
  {
    name: 'TickIcon',
    component: TickIcon,
    importLine: 'import { TickIcon } from \'@/frontend/shared/icons/TickIcon\';',
  },
  {
    name: 'TranscriptionIcon',
    component: TranscriptionIcon,
    importLine: 'import { TranscriptionIcon } from \'@/frontend/shared/icons/TranscriptionIcon\';',
  },
  {
    name: 'TriangleIcon',
    component: TriangleIcon,
    importLine: 'import { TriangleIcon } from \'@/frontend/shared/icons/TriangleIcon\';',
  },
  {
    name: 'UnlockSmileyIcon',
    component: UnlockSmileyIcon,
    importLine: 'import UnlockSmileyIcon from \'@/frontend/shared/icons/UnlockSmileyIcon\';',
  },
  {
    name: 'UnorderedListIcon',
    component: UnorderedListIcon,
    importLine: 'import { UnorderedListIcon } from \'@/frontend/shared/icons/UnorderedListIcon\';',
  },
  {
    name: 'WhiteTickIcon',
    component: WhiteTickIcon,
    importLine: 'import { WhiteTickIcon } from \'@/frontend/shared/icons/TickIcon\';',
  }
] as const;

const meta: Meta = {
  title: 'components / icons (Generated)',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const iconPreviewProps = {
  width: '1.35em',
  height: '1.35em',
  title: 'icon',
  className: 'generated-icon',
} as const;

export const AllIcons: Story = {
  render: () => {
    return (
      <div style={{ padding: '1rem', background: '#f7f7f7' }}>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          }}
        >
          {icons.map(icon => {
            const Icon = icon.component as any;
            return (
              <div
                key={icon.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px minmax(0, 1fr)',
                  gap: '0.75rem',
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: '#fff',
                  padding: '0.65rem',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 4,
                    border: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111',
                  }}
                >
                  {React.createElement(Icon, iconPreviewProps)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>{icon.name}</div>
                  <code
                    style={{
                      display: 'block',
                      fontSize: '0.74rem',
                      lineHeight: 1.25,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      color: '#334155',
                    }}
                  >
                    {icon.importLine}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
