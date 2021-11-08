import { Grid } from '@capture-models/editor';
import { CanvasUniversalViewer } from '../../site/features/CanvasUniversalViewer';
import { ManifestHero } from '../../site/features/ManifestHero';
import { ViewManifestUV } from '../../site/pages/view-manifest-uv';
import { DefaultSelect } from '../form/DefaulSelect';
import AdminPageTitle from '../typography/AdminPageTitle';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { Button } from '../navigation/Button';
import { ButtonDropdown } from '../navigation/ButtonDropdown';
import { CanvasStatus } from '../atoms/CanvasStatus';
import { CloseIcon } from '../icons/CloseIcon';
import { EmptyState } from '../layout/EmptyState';
import { ErrorIcon } from '../icons/ErrorIcon';
import { ErrorMessage } from '../callouts/ErrorMessage';
import { GlobalHeader } from '../navigation/GlobalHeader';
import { GlobalStyles } from '../typography/GlobalStyles';
import { Header } from '../atoms/Header';
import { Heading1 } from '../typography/Heading1';
import { Heading2 } from '../typography/Heading2';
import { Heading3 } from '../typography/Heading3';
import { Heading5 } from '../typography/Heading5';
import { HelpText } from '../typography/HelpText';
import { ImageGrid } from '../atoms/ImageGrid';
import { ImageStrip } from '../atoms/ImageStrip';
import { InfoMessage } from '../callouts/InfoMessage';
import { Input } from '../form/Input';
import { IntlField } from '../form/IntlField';
import { LanguageSwitcher } from '../navigation/LanguageSwitcher';
import { LayoutContainer } from '../layout/LayoutContainer';
import { LightNavigation } from '../navigation/LightNavigation';
import { LinkingProperty } from '../atoms/LinkingProperty';
import { LoadingBlock } from '../callouts/LoadingBlock';
import { LockIcon } from '../icons/LockIcon';
import { MaximiseWindow } from '../layout/MaximiseWindow';
import { Message } from '../atoms/Message';
import { NotStartedIcon } from '../icons/NotStartedIcon';
import { ProgressBar } from '../atoms/ProgressBar';
import { ProgressIcon } from '../icons/ProgressIcon';
import { ProjectListing } from '../atoms/ProjectListing';
import { ProjectStatus } from '../atoms/ProjectStatus';
import { ReorderTable } from '../atoms/ReorderTable';
import { SearchBox } from '../atoms/SearchBox';
import { SearchIcon } from '../icons/SearchIcon';
import { SimpleTable } from '../layout/SimpleTable';
import { SiteContainer } from '../layout/SiteContainer';
import { SlotLayout } from '../layout/SlotLayout';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { StandardButton } from '../atoms/StandardButton';
import { Status } from '../atoms/Status';
import { SubtaskProgress } from '../atoms/SubtaskProgress';
import { SuccessMessage } from '../callouts/SuccessMessage';
import { Surface } from '../layout/Surface';
import { TickIcon } from '../icons/TickIcon';
import { TranslationInput } from '../atoms/TranslationInput';
import { WarningMessage } from '../callouts/WarningMessage';
import { WidePage } from '../layout/WidePage';
import { SlotEditor } from '../page-blocks/slot-editor';

export const atoms = {
  AdminPageTitle: AdminPageTitle,
  Breadcrumbs: Breadcrumbs,
  Button: Button,
  ButtonDropdown: ButtonDropdown,
  CanvasStatus: CanvasStatus,
  DefaultSelect: DefaultSelect,
  // EditorToolbar: EditorToolbar,
  // EmptySlot: EmptySlot,
  CloseIcon: CloseIcon,
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
