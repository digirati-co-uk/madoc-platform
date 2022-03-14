import { UpdateModelConfigRequest } from '../../../gateway/api-definitions/update-model-config';
import { useCollectionList } from '../../site/hooks/use-collection-list';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { useCustomTheme, usePageTheme } from '../../themes/helpers/CustomThemeProvider';
import { BaseMessage } from '../callouts/BaseMessage';
import { ErrorMessage } from '../callouts/ErrorMessage';
import { InfoMessage } from '../callouts/InfoMessage';
import { LoadingBlock } from '../callouts/LoadingBlock';
import { SmallToast } from '../callouts/SmallToast';
import { SuccessMessage } from '../callouts/SuccessMessage';
import { WarningMessage } from '../callouts/WarningMessage';
import {
  RevisionProviderFeatures,
  RevisionProviderWithFeatures,
} from '../capture-models/new/components/RevisionProviderWithFeatures';
import { EditorContentViewer } from '../capture-models/new/EditorContent';
import { CanvasVaultContext } from '../components/CanvasVaultContext';
import { DefaultSelect } from '../form/DefaulSelect';
import { GlobalSearch } from '../form/GlobalSearch';
import {
  Input,
  CheckboxInput,
  InputCheckboxContainer,
  InputContainer,
  InputCheckboxInputContainer,
  EmptyInputValue,
  HighlightInput,
  InputAsCard,
  InputBorderless,
  InputLabel,
  InputLink,
} from '../form/Input';
import { IntlField } from '../form/IntlField';
import { useAccessibleColor } from '../hooks/use-accessible-color';
import { useAnnotationPage } from '../hooks/use-annotation-page';
import { useApiCanvas } from '../hooks/use-api-canvas';
import { useApiCaptureModel } from '../hooks/use-api-capture-model';
import { useApiCollection } from '../hooks/use-api-collection';
import { useApiManifest } from '../hooks/use-api-manifest';
import { useApiStructure } from '../hooks/use-api-structure';
import { useApiTask } from '../hooks/use-api-task';
import { useApiTaskSearch } from '../hooks/use-api-task-search';
import { useAutocomplete } from '../hooks/use-autocomplete';
import { useBase64 } from '../hooks/use-base64';
import { useCanvasSearch } from '../hooks/use-canvas-search';
import { useContributorTasks } from '../hooks/use-contributor-tasks';
import { useCroppedRegion } from '../hooks/use-cropped-region';
import { useCurrentUser } from '../hooks/use-current-user';
import { useData } from '../hooks/use-data';
import { useEventHandler } from '../hooks/use-event-handler';
import { useGoogleFonts } from '../hooks/use-google-fonts';
import { useHighlightedRegions } from '../hooks/use-highlighted-regions';
import { useLoadedCaptureModel } from '../hooks/use-loaded-capture-model';
import { useLocalStorage } from '../hooks/use-local-storage';
import { useLocationQuery } from '../hooks/use-location-query';
import { useManifestProjects } from '../hooks/use-manifest-projects';
import { useManifestStructure } from '../hooks/use-manifest-structure';
import { useProjectByTask } from '../hooks/use-project-by-task';
import { useProjectTemplate } from '../hooks/use-project-template';
import { useProjectTemplates } from '../hooks/use-project-templates';
import { useRecent } from '../hooks/use-recent';
import { useResizeLayout } from '../hooks/use-resize-layout';
import { useReviewerTasks } from '../hooks/use-reviewer-tasks';
import { useShortMessage } from '../hooks/use-short-message';
import { useSiteMetadataConfiguration } from '../hooks/use-site-metadata-configuration';
import { useSubjectMap } from '../hooks/use-subject-map';
import { useTranslationWrapper } from '../hooks/use-translation-wrapper';
import { useUserDetails } from '../hooks/use-user-details';
import { useViewerSaving } from '../hooks/use-viewer-saving';
import { AddIcon } from '../icons/AddIcon';
import { AnnotationsIcon } from '../icons/AnnotationsIcon';
import { ArrowBackIcon } from '../icons/ArrowBackIcon';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { ArrowForwardIcon } from '../icons/ArrowForwardIcon';
import { CallMergeIcon } from '../icons/CallMergeIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { CompareIcon } from '../icons/CompareIcon';
import { DeleteForeverIcon } from '../icons/DeleteForeverIcon';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { EditIcon } from '../icons/EditIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { FilterIcon } from '../icons/FilterIcon';
import { FullScreenEnterIcon } from '../icons/FullScreenEnterIcon';
import { FullScreenExitIcon } from '../icons/FullScreenExitIcon';
import { GradingIcon } from '../icons/GradingIcon';
import { GridIcon } from '../icons/GridIcon';
import { IIIFLogo } from '../icons/iiif-logo';
import { InfoIcon } from '../icons/InfoIcon';
import { LockIcon } from '../icons/LockIcon';
import { ModelDocumentIcon } from '../icons/ModelDocumentIcon';
import { NotificationIcon } from '../icons/NotificationIcon';
import { NotStartedIcon } from '../icons/NotStartedIcon';
import { PersonIcon } from '../icons/PersonIcon';
import { PreviewIcon } from '../icons/PreviewIcon';
import { ProgressIcon } from '../icons/ProgressIcon';
import { ReadMoreIcon } from '../icons/ReadMoreIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { Spinner } from '../icons/Spinner';
import { TableHandleIcon } from '../icons/TableHandleIcon';
import { TickIcon } from '../icons/TickIcon';
import { TranscriptionIcon } from '../icons/TranscriptionIcon';
import { Button } from '../navigation/Button';
import { LocaleString } from '../components/LocaleString';
import { useApi } from '../hooks/use-api';
import { useSite, useUser } from '../hooks/use-site';
import AdminPageTitle from '../typography/AdminPageTitle';
import { AttributionText } from '../typography/AttributionText';
import { GlobalStyles } from '../typography/GlobalStyles';
import { Heading1 } from '../typography/Heading1';
import { Heading2 } from '../typography/Heading2';
import { Heading3 } from '../typography/Heading3';
import { Heading4 } from '../typography/Heading4';
import { Heading5 } from '../typography/Heading5';
import { HelpText } from '../typography/HelpText';
import { blockConfigFor } from './external/block-config-for';
import { serverRendererFor } from './external/server-renderer-for';
import { atoms, useAtoms } from './use-atoms';
import { useComponents } from './use-components';
import { useModule } from './use-module';
import {
  EditorRenderingConfig,
  EditorSlots,
  ProfileProvider,
  ProfileConfig,
  useProfile,
  useProfileOverride,
  EditorConfig,
  useSlotConfiguration,
  useSlotContext,
} from '../capture-models/new/components/EditorSlots';
import { BaseTheme } from '../../../types/schemas/madoc-theme';
import { captureModelShorthand } from '../capture-models/helpers/capture-model-shorthand';

const Callouts = {
  BaseMessage: BaseMessage,
  ErrorMessage: ErrorMessage,
  InfoMessage: InfoMessage,
  LoadingBlock: LoadingBlock,
  SmallToast: SmallToast,
  SuccessMessage: SuccessMessage,
  WarningMessage: WarningMessage,
};

const Form = {
  DefaultSelect,
  GlobalSearch,
  Input,
  IntlField,
  CheckboxInput,
  InputCheckboxContainer,
  InputContainer,
  InputCheckboxInputContainer,
  EmptyInputValue,
  HighlightInput,
  InputAsCard,
  InputBorderless,
  InputLabel,
  InputLink,
};

const Hooks = {
  useAccessibleColor,
  useAnnotationPage,
  useApi,
  useApiCanvas,
  useApiCaptureModel,
  useApiCollection,
  useApiManifest,
  useApiStructure,
  useApiTask,
  useApiTaskSearch,
  useAutocomplete,
  useBase64,
  useCanvasSearch,
  useContributorTasks,
  useCroppedRegion,
  useCurrentUser,
  useData,
  useEventHandler,
  useGoogleFonts,
  useHighlightedRegions,
  useLoadedCaptureModel,
  useLocalStorage,
  useLocationQuery,
  useManifestProjects,
  useManifestStructure,
  useProjectByTask,
  useProjectTemplate,
  useProjectTemplates,
  useRecent,
  useResizeLayout,
  useReviewerTasks,
  useShortMessage,
  useSite,
  useSiteMetadataConfiguration,
  useSubjectMap,
  useTranslationWrapper,
  useUserDetails,
  useViewerSaving,
};

const Icons = {
  AddIcon,
  AnnotationsIcon,
  ArrowBackIcon,
  ArrowDownIcon,
  ArrowForwardIcon,
  CallMergeIcon,
  CloseIcon,
  CompareIcon,
  DeleteForeverIcon,
  DownArrowIcon,
  EditIcon,
  ErrorIcon,
  FilterIcon,
  FullScreenEnterIcon,
  FullScreenExitIcon,
  GradingIcon,
  GridIcon,
  IIIFLogo,
  InfoIcon,
  LockIcon,
  ModelDocumentIcon,
  NotificationIcon,
  NotStartedIcon,
  PersonIcon,
  PreviewIcon,
  ProgressIcon,
  ReadMoreIcon,
  SearchIcon,
  SettingsIcon,
  Spinner,
  TableHandleIcon,
  TickIcon,
  TranscriptionIcon,
};

const Typography = {
  AdminPageTitle,
  AttributionText,
  GlobalStyles,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  HelpText,
};

const Models = {
  RevisionProviderWithFeatures,
  CanvasVaultContext,
  EditorContentViewer,
  ProfileProvider,
  useProfile,
  useProfileOverride,
  useSlotConfiguration,
  useSlotContext,
};

type PluginTheme = { id: string } & BaseTheme;

// export {
//   RevisionProviderFeatures,
//   EditorConfig,
//   ProfileConfig,
//   EditorRenderingConfig,
//   UpdateModelConfigRequest,
//   BaseTheme,
//   PluginTheme,
// };

export {
  useModule as require,
  useApi,
  Form,
  Icons,
  Typography,
  Models,
  atoms as Atoms,
  Hooks,
  Callouts,
  EditorSlots,
  Button,
  LocaleString,
  useAtoms,
  useComponents,
  useCollectionList,
  blockConfigFor,
  serverRendererFor,
  useRouteContext,
  useUser,
  usePageTheme,
  useCustomTheme,
  captureModelShorthand,
  // API Extensions
};
