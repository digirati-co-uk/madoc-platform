import React, { useContext, useMemo } from 'react';
import { RouteContext } from '../../../../site/hooks/use-route-context';
import { CaptureModel } from '../../types/capture-model';
import { BaseField } from '../../types/field-types';
import { RevisionRequest } from '../../types/revision-request';
import { useCanSubmit } from '../hooks/use-can-submit';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { DefaultAdjacentNavigation } from './DefaultAdjacentNavigation';
import { DefaultBreadcrumbs } from './DefaultBreadcrumbs';
import { DefaultChoice } from './DefaultChoice';
import { DefaultEditorWrapper } from './DefaultEditorWrapper';
import { DefaultFieldInstance } from './DefaultFieldInstance';
import { DefaultInlineEntity } from './DefaultInlineEntity';
import { DefaultInlineField } from './DefaultInlineField';
import { DefaultInlineProperties } from './DefaultInlineProperties';
import { DefaultInlineSelector } from './DefaultInlineSelector';
import { DefaultManagePropertyList } from './DefaultManagePropertiesList';
import { DefaultPostSubmission } from './DefaultPostSubmission';
import { DefaultPreviewSubmission } from './DefaultPreviewSubmission';
import { DefaultSingleEntity } from './DefaultSingleEntity';
import { DefaultSingleField } from './DefaultSingleField';
import { DefaultSubmitButton } from './DefaultSubmitButton';
import { DefaultTopLevelEditor } from './DefaultTopLevelEditor';


type ReactFC<Props = {}> = React.FC<Props & { children?: React.ReactNode }>;

// Driven by context.
export type EditorRenderingConfig = {
  configuration: EditorConfig;
  // Driven by hooks
  TopLevelEditor: ReactFC;
  Breadcrumbs: ReactFC;
  SingleEntity: ReactFC<{ showTitle?: boolean }>;
  SingleField: ReactFC;
  AdjacentNavigation: ReactFC;
  ManagePropertyList: ReactFC<{ property: string; type: 'field' | 'entity' }>; // Fallbacks passed in
  EditorWrapper: ReactFC;
  FieldInstance: ReactFC<{
    field: BaseField;
    property: string;
    path: Array<[string, string]>;
    hideHeader?: boolean;
  }>;
  InlineProperties: ReactFC<{
    type: 'field' | 'entity';
    property: string;
    hasSelector: boolean;
    canInlineField?: boolean;
    label?: string;
    description?: string;
    disableRemoving?: boolean;
  }>;
  InlineField: ReactFC<{
    property: string;
    field: BaseField;
    path: [string, string, boolean?][];
    chooseField?: () => void;
    canRemove: boolean;
    readonly: boolean;
    onRemove?: () => void;
  }>; // Fallbacks passed in
  InlineEntity: ReactFC<{
    property: string;
    entity: CaptureModel['document'];
    chooseEntity: () => void;
    canRemove: boolean;
    onRemove: () => void;
  }>; // Fallbacks passed in
  InlineSelector: any; // Fallbacks passed in
  Choice: ReactFC;
  SubmitButton: ReactFC<{
    afterSave?: (req: { revisionRequest: RevisionRequest; context: RouteContext }) => void | Promise<void>;
    saveOnNavigate?: boolean;
    captureModel?: CaptureModel;
    canSubmit?: boolean;
  }>;
  PreviewSubmission: ReactFC;
  PostSubmission: ReactFC<{
    stacked?: boolean;
    messageOnly?: boolean;
    onContinue?: () => void;
    subRoute?: string;
  }>;
};

export type ProfileConfig = Partial<Omit<EditorRenderingConfig, 'configuration'>>;

export type EditorConfig = {
  allowEditing: boolean;
  immutableFields: string[];
  selectEntityWhenCreating: boolean;
  selectFieldWhenCreating: boolean;
  deselectRevisionAfterSaving: boolean;
  disableSaveForLater: boolean;
  saveOnNavigate: boolean;
  profileConfig: {
    [profile: string]: ProfileConfig;
  };
};

const defaultEditorConfig: EditorConfig = {
  allowEditing: false,
  selectEntityWhenCreating: true,
  selectFieldWhenCreating: true,
  deselectRevisionAfterSaving: false,
  disableSaveForLater: false,
  saveOnNavigate: false,
  profileConfig: {},
  immutableFields: [],
};

const globalDefaultContextRef: { state: EditorRenderingConfig | null } = { state: null };

export function getDefaultContextValue(): EditorRenderingConfig {
  if (!globalDefaultContextRef.state) {
    globalDefaultContextRef.state = {
      configuration: {
        ...defaultEditorConfig,
      },
      TopLevelEditor: DefaultTopLevelEditor,
      InlineField: DefaultInlineField,
      InlineEntity: DefaultInlineEntity,
      InlineSelector: DefaultInlineSelector,
      FieldInstance: DefaultFieldInstance,
      ManagePropertyList: DefaultManagePropertyList,
      Breadcrumbs: DefaultBreadcrumbs,
      SingleEntity: DefaultSingleEntity,
      SingleField: DefaultSingleField,
      AdjacentNavigation: DefaultAdjacentNavigation,
      InlineProperties: DefaultInlineProperties,
      Choice: DefaultChoice,
      SubmitButton: DefaultSubmitButton,
      PreviewSubmission: DefaultPreviewSubmission,
      PostSubmission: DefaultPostSubmission,
      EditorWrapper: DefaultEditorWrapper,
    };
  }
  return globalDefaultContextRef.state!;
}

const Context = React.createContext<EditorRenderingConfig | null>(null);

Context.displayName = 'EditorSlots';

export function useSlotContext() {
  const ctx = useContext(Context);
  if (!ctx) {
    return getDefaultContextValue();
  }
  return ctx;
}

export function useSlotConfiguration() {
  const slots = useSlotContext();

  return slots.configuration;
}

const ProfileContext = React.createContext<string | undefined>(undefined);

ProfileContext.displayName = 'Profile';

export const useProfile = () => {
  return useContext(ProfileContext);
};

export function useProfileOverride(slotName: keyof ProfileConfig): ReactFC | undefined {
  const configuration = useSlotConfiguration();
  const profile = useProfile();

  if (!profile) {
    return undefined;
  }

  const profileConfig = configuration.profileConfig[profile];

  if (!profileConfig) {
    return undefined;
  }

  return profileConfig[slotName];
}

export const ProfileProvider: ReactFC<{ profile?: string }> = props => {
  const profile = useProfile();

  return <ProfileContext.Provider value={props.profile || profile}>{props.children}</ProfileContext.Provider>;
};

const Provider: ReactFC<{ config?: Partial<EditorConfig>; components?: Partial<EditorRenderingConfig> }> = ({
  components = {},
  children,
  config = {},
}) => {
  const defaultConfig = useSlotContext();

  const newConfig = useMemo(() => {
    const filteredComponents: any = {
      configuration: {},
    };
    if (components) {
      for (const component of Object.keys(components)) {
        if ((components as any)[component]) {
          filteredComponents[component] = (components as any)[component];
        }
      }
    }

    return {
      ...defaultConfig,
      ...filteredComponents,
      configuration: {
        ...defaultConfig.configuration,
        ...filteredComponents.configuration,
        ...config,
        profileConfig: {
          ...(defaultConfig.configuration?.profileConfig || {}),
          ...(filteredComponents.configuration?.profileConfig || {}),
          ...(config?.profileConfig || {}),
        },
      },
    };
  }, [components, config, defaultConfig]);

  return <Context.Provider value={newConfig}>{children}</Context.Provider>;
};

const InlineBreadcrumbs: EditorRenderingConfig['Breadcrumbs'] = () => {
  const Slots = useSlotContext();

  return <Slots.Breadcrumbs />;
};

const InlineSelector: EditorRenderingConfig['InlineSelector'] = () => {
  const [entity] = useCurrentEntity();
  const Slots = useSlotContext();

  if (!entity.selector) {
    return null;
  }

  return <Slots.InlineSelector />;
};

const InlineProperties: EditorRenderingConfig['InlineProperties'] = props => {
  const Slots = useSlotContext();

  return <Slots.InlineProperties {...props} />;
};

const AdjacentNavigation: EditorRenderingConfig['AdjacentNavigation'] = props => {
  const Slots = useSlotContext();

  return <Slots.AdjacentNavigation>{props.children}</Slots.AdjacentNavigation>;
};

const ViewEntity: EditorRenderingConfig['SingleEntity'] = props => {
  const Slots = useSlotContext();

  return <Slots.SingleEntity showTitle={props.showTitle}>{props.children}</Slots.SingleEntity>;
};

const FieldInstance: EditorRenderingConfig['FieldInstance'] = props => {
  const Slots = useSlotContext();

  return <Slots.FieldInstance {...props} />;
};

const ViewField: EditorRenderingConfig['SingleField'] = props => {
  const Slots = useSlotContext();

  return <Slots.SingleField>{props.children}</Slots.SingleField>;
};

const TopLevelEditor: EditorRenderingConfig['TopLevelEditor'] = props => {
  const Slots = useSlotContext();

  return <Slots.TopLevelEditor>{props.children}</Slots.TopLevelEditor>;
};

const Choice: EditorRenderingConfig['Choice'] = props => {
  const Slots = useSlotContext();

  return <Slots.Choice>{props.children}</Slots.Choice>;
};

const SubmitButton: EditorRenderingConfig['SubmitButton'] = props => {
  const Slots = useSlotContext();
  const canSubmit = useCanSubmit();

  return (
    <Slots.SubmitButton
      saveOnNavigate={Slots.configuration.saveOnNavigate}
      captureModel={props.captureModel}
      afterSave={props.afterSave}
      canSubmit={typeof props.canSubmit !== 'undefined' ? props.canSubmit : canSubmit}
    >
      {props.children}
    </Slots.SubmitButton>
  );
};

const PreviewSubmission: EditorRenderingConfig['PreviewSubmission'] = props => {
  const Slots = useSlotContext();

  return <Slots.PreviewSubmission>{props.children}</Slots.PreviewSubmission>;
};

const EditorWrapper: EditorRenderingConfig['EditorWrapper'] = props => {
  const Slots = useSlotContext();

  return <Slots.EditorWrapper>{props.children}</Slots.EditorWrapper>;
};

const PostSubmission: EditorRenderingConfig['PostSubmission'] = props => {
  const Slots = useSlotContext();

  return <Slots.PostSubmission {...props}>{props.children}</Slots.PostSubmission>;
};

const InlineEntity: EditorRenderingConfig['InlineEntity'] = props => {
  const Slots = useSlotContext();

  return (
    <ProfileProvider profile={props.entity.profile}>
      <Slots.InlineEntity {...props} />
    </ProfileProvider>
  );
};

function addNames<T>(name: string, record: T): T {
  const keys = Object.keys(record as any);

  for (const key of keys) {
    (record as any)[key].displayName = `${name}.${key}`;
  }

  return record;
}

export const EditorSlots = addNames('EditorSlots', {
  Provider,
  InlineBreadcrumbs,
  InlineProperties,
  InlineSelector,
  InlineEntity,
  AdjacentNavigation,
  TopLevelEditor,
  ViewEntity,
  ViewField,
  Choice,
  SubmitButton,
  PreviewSubmission,
  PostSubmission,
  EditorWrapper,
  FieldInstance,
});
