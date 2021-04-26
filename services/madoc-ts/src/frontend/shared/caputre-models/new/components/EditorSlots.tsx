import { BaseField, CaptureModel, RevisionRequest } from '@capture-models/types';
import React, { useContext, useMemo } from 'react';
import { useSlots } from '../../../page-blocks/slot-context';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { DefaultAdjacentNavigation } from './DefaultAdjacentNavigation';
import { DefaultBreadcrumbs } from './DefaultBreadcrumbs';
import { DefaultChoice } from './DefaultChoice';
import { DefaultEditorWrapper } from './DefaultEditorWrapper';
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

// Driven by context.

export type EditorRenderingConfig = {
  configuration: EditorConfig;
  // Driven by hooks
  TopLevelEditor: React.FC;
  Breadcrumbs: React.FC;
  SingleEntity: React.FC<{ showTitle?: boolean }>;
  SingleField: React.FC;
  AdjacentNavigation: React.FC;
  ManagePropertyList: React.FC<{ property: string; type: 'field' | 'entity' }>; // Fallbacks passed in
  EditorWrapper: React.FC;
  InlineProperties: React.FC<{
    property: string;
    canInlineField?: boolean;
    label?: string;
    description?: string;
    disableRemoving?: boolean;
  }>;
  InlineField: React.FC<{
    property: string;
    field: BaseField;
    path: [string, string, boolean?][];
    chooseField?: () => void;
    canRemove: boolean;
    readonly: boolean;
    onRemove?: () => void;
  }>; // Fallbacks passed in
  InlineEntity: React.FC<{
    property: string;
    entity: CaptureModel['document'];
    chooseEntity: () => void;
    canRemove: boolean;
    onRemove: () => void;
  }>; // Fallbacks passed in
  InlineSelector: any; // Fallbacks passed in
  Choice: React.FC;
  SubmitButton: React.FC<{ afterSave?: (req: RevisionRequest) => void }>;
  PreviewSubmission: React.FC;
  PostSubmission: React.FC;
};

export type EditorConfig = {
  allowEditing: boolean;
  selectEntityWhenCreating: boolean;
  selectFieldWhenCreating: boolean;
  deselectRevisionAfterSaving: boolean;
};

const defaultEditorConfig: EditorConfig = {
  allowEditing: false,
  selectEntityWhenCreating: true,
  selectFieldWhenCreating: true,
  deselectRevisionAfterSaving: false,
};

const Context = React.createContext<EditorRenderingConfig>({
  configuration: {
    ...defaultEditorConfig,
  },
  TopLevelEditor: DefaultTopLevelEditor,
  InlineField: DefaultInlineField,
  InlineEntity: DefaultInlineEntity,
  InlineSelector: DefaultInlineSelector,
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
});

export function useSlotContext() {
  return useContext(Context);
}

export function useSlotConfiguration() {
  const slots = useSlotContext();

  return slots.configuration;
}

const Provider: React.FC<{ config?: Partial<EditorConfig>; components?: Partial<EditorRenderingConfig> }> = ({
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
      },
    };
  }, [components, config, defaultConfig]);

  return <Context.Provider value={newConfig}>{children}</Context.Provider>;
};

const InlineBreadcrumbs: React.FC = () => {
  const { Breadcrumbs } = useSlotContext();

  return <Breadcrumbs />;
};

const InlineSelector: React.FC = () => {
  const [entity] = useCurrentEntity();
  const Slots = useSlotContext();

  if (!entity.selector) {
    return null;
  }

  return <Slots.InlineSelector />;
};

const InlineProperties: React.FC<{ property: string }> = ({ property }) => {
  const Slots = useSlotContext();

  return <Slots.InlineProperties property={property} />;
};

const AdjacentNavigation: React.FC = props => {
  const Slots = useSlotContext();

  return <Slots.AdjacentNavigation>{props.children}</Slots.AdjacentNavigation>;
};

const ViewEntity: React.FC<{ showTitle?: boolean }> = props => {
  const Slots = useSlotContext();

  return <Slots.SingleEntity showTitle={props.showTitle}>{props.children}</Slots.SingleEntity>;
};

const ViewField: React.FC = props => {
  const Slots = useSlotContext();

  return <Slots.SingleField>{props.children}</Slots.SingleField>;
};

const TopLevelEditor: React.FC = props => {
  const Slots = useSlotContext();

  return <Slots.TopLevelEditor>{props.children}</Slots.TopLevelEditor>;
};

const Choice: React.FC = props => {
  const Slots = useSlotContext();

  return <Slots.Choice>{props.children}</Slots.Choice>;
};

const SubmitButton: React.FC<{
  afterSave?: (req: RevisionRequest) => void;
}> = props => {
  const Slots = useSlotContext();

  return <Slots.SubmitButton afterSave={props.afterSave}>{props.children}</Slots.SubmitButton>;
};

const PreviewSubmission: React.FC = props => {
  const Slots = useSlotContext();

  return <Slots.PreviewSubmission>{props.children}</Slots.PreviewSubmission>;
};

const EditorWrapper: React.FC = props => {
  const Slots = useSlotContext();

  return <Slots.EditorWrapper>{props.children}</Slots.EditorWrapper>;
};

const PostSubmission: React.FC = props => {
  const Slots = useSlotContext();

  return <Slots.PostSubmission>{props.children}</Slots.PostSubmission>;
};

export const EditorSlots = {
  Provider,
  InlineBreadcrumbs,
  InlineProperties,
  InlineSelector,
  AdjacentNavigation,
  TopLevelEditor,
  ViewEntity,
  ViewField,
  Choice,
  SubmitButton,
  PreviewSubmission,
  PostSubmission,
  EditorWrapper,
};
