import { Grid } from '@capture-models/editor';
import { useMemo } from 'react';
import AdminPageTitle from '../atoms/AdminPageTitle';
import { Breadcrumbs } from '../atoms/Breadcrumbs';
import { Button } from '../atoms/Button';
import { ButtonDropdown } from '../atoms/ButtonDropdown';
import { CanvasStatus } from '../atoms/CanvasStatus';
import { CloseIcon } from '../atoms/CloseIcon';
import { Debug } from '../atoms/Debug';
import { Dropdown } from '../atoms/Dropdown';
import { EmptyState } from '../atoms/EmptyState';
import { ErrorIcon } from '../atoms/ErrorIcon';
import { ErrorMessage } from '../atoms/ErrorMessage';
import { GlobalHeader } from '../atoms/GlobalHeader';
import { GlobalStyles } from '../atoms/GlobalStyles';
import { Header } from '../atoms/Header';
import { Heading1 } from '../atoms/Heading1';
import { Heading2 } from '../atoms/Heading2';
import { Heading3 } from '../atoms/Heading3';
import { Heading5 } from '../atoms/Heading5';
import { HelpText } from '../atoms/HelpText';
import { ImageGrid } from '../atoms/ImageGrid';
import { ImageStrip } from '../atoms/ImageStrip';
import { InfoMessage } from '../atoms/InfoMessage';
import { Input } from '../atoms/Input';
import { IntlField } from '../atoms/IntlField';
import { LanguageSwitcher } from '../atoms/LanguageSwitcher';
import { LayoutContainer } from '../atoms/LayoutContainer';
import { LightNavigation } from '../atoms/LightNavigation';
import { LinkingProperty } from '../atoms/LinkingProperty';
import { LoadingBlock } from '../atoms/LoadingBlock';
import { LockIcon } from '../atoms/LockIcon';
import { MaximiseWindow } from '../atoms/MaximiseWindow';
import { Message } from '../atoms/Message';
import { NotStartedIcon } from '../atoms/NotStartedIcon';
import { PageTitle } from '../atoms/PageTitle';
import { ProgressBar } from '../atoms/ProgressBar';
import { ProgressIcon } from '../atoms/ProgressIcon';
import { ProjectListing } from '../atoms/ProjectListing';
import { ProjectStatus } from '../atoms/ProjectStatus';
import { ReorderTable } from '../atoms/ReorderTable';
import { SearchBox } from '../atoms/SearchBox';
import { SearchIcon } from '../atoms/SearchIcon';
import { SimpleTable } from '../atoms/SimpleTable';
import { SiteContainer } from '../atoms/SiteContainer';
import { SlotLayout } from '../atoms/SlotLayout';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { StandardButton } from '../atoms/StandardButton';
import { Status } from '../atoms/Status';
import { SubtaskProgress } from '../atoms/SubtaskProgress';
import { SuccessMessage } from '../atoms/SuccessMessage';
import { Surface } from '../atoms/Surface';
import { TickIcon } from '../atoms/TickIcon';
import { TranslationInput } from '../atoms/TranslationInput';
import { WarningMessage } from '../atoms/WarningMessage';
import { WidePage } from '../atoms/WidePage';
import { SlotEditor } from '../page-blocks/slot-editor';

export const atoms = {
  AdminPageTitle: AdminPageTitle,
  Breadcrumbs: Breadcrumbs,
  Button: Button,
  ButtonDropdown: ButtonDropdown,
  CanvasStatus: CanvasStatus,
  CloseIcon: CloseIcon,
  Debug: Debug,
  Dropdown: Dropdown,
  // EditorToolbar: EditorToolbar,
  // EmptySlot: EmptySlot,
  EmptyState: EmptyState,
  ErrorIcon: ErrorIcon,
  ErrorMessage: ErrorMessage,
  GlobalHeader: GlobalHeader,
  GlobalStyles: GlobalStyles,
  Grid: Grid,
  Header: Header,
  Heading1: Heading1,
  Heading2: Heading2,
  Heading3: Heading3,
  Heading5: Heading5,
  HelpText: HelpText,
  ImageGrid: ImageGrid,
  ImageStrip: ImageStrip,
  // Images: Images,
  InfoMessage: InfoMessage,
  Input: Input,
  IntlField: IntlField,
  // Kanban: Kanban,
  LanguageSwitcher: LanguageSwitcher,
  LayoutContainer: LayoutContainer,
  LightNavigation: LightNavigation,
  LinkingProperty: LinkingProperty,
  LoadingBlock: LoadingBlock,
  LockIcon: LockIcon,
  MaximiseWindow: MaximiseWindow,
  Message: Message,
  // MetadataConfiguration: MetadataConfiguration,
  // Modal: Modal,
  // MoreButton: MoreButton,
  NotStartedIcon: NotStartedIcon,
  // PageEditor: PageEditor,
  PageTitle: PageTitle,
  // Pill: Pill,
  ProgressBar: ProgressBar,
  ProgressIcon: ProgressIcon,
  ProjectListing: ProjectListing,
  ProjectStatus: ProjectStatus,
  ReorderTable: ReorderTable,
  SearchBox: SearchBox,
  SearchIcon: SearchIcon,
  SimpleTable: SimpleTable,
  SiteContainer: SiteContainer,
  SlotEditor: SlotEditor,
  SlotLayout: SlotLayout,
  SnippetLarge: SnippetLarge,
  StandardButton: StandardButton,
  // Statistics: Statistics,
  Status: Status,
  SubtaskProgress: SubtaskProgress,
  SuccessMessage: SuccessMessage,
  Surface: Surface,
  // Table: Table,
  // TaskList: TaskList,
  TickIcon: TickIcon,
  TranslationInput: TranslationInput,
  WarningMessage: WarningMessage,
  WidePage: WidePage,
};

export function useAtoms() {
  return atoms;
}
