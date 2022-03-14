// There will be something here.
import { MapValues } from './utility';
import { FC } from 'react';

export type BaseSelector = {
  id: string;
  type: string;
  state: any;
  revisionId?: string | null;
  revises?: string | null;
  revisedBy?: BaseSelector[];
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SelectorTypeMap {}

export type InjectedSelectorProps<T> = {
  // @todo I think these are where we need to expand for the recent store changes.
  //   These are all of the actions that both the form AND the content versions of the
  //   components have. List of all of them here:
  //    - chooseSelector: Action<RevisionsModel, { selectorId: string }>;
  //    - clearSelector: Action<RevisionsModel>;
  //    - updateSelector: Action<RevisionsModel, { selectorId: string; state: SelectorTypes['state'] }>;
  //    - updateSelectorPreview: Action<RevisionsModel, { selectorId: string; preview: any }>;
  //    - setTopLevelSelector: Action<RevisionsModel, { selectorId: string }>;
  //    - clearTopLevelSelector: Action<RevisionsModel>;
  //    - addVisibleSelectorIds: Action<RevisionsModel, { selectorIds: string[] }>;
  //    - removeVisibleSelectorIds: Action<RevisionsModel, { selectorIds: string[] }>;
  //   However the exact needs are not going to be clear without a UI to attach these to and test.
  updateSelector?(state: T | null): void;
  readOnly?: boolean;
  // Selector preview can be set and passed to the rendering components.
  selectorPreview?: any;
  updateSelectorPreview?: (data: { selectorId: string; preview: string }) => void;
  // For the form.
  chooseSelector?: (selectorId: string) => void;
  clearSelector?: () => void;
  // Controlling the display selector
  displaySelector?: (selectorId: string) => void;
  hideSelector?: (selectorId: string) => void;
  currentSelectorId?: string;
  isTopLevel?: boolean;
  isAdjacent?: boolean;
  onClick?: (selector: BaseSelector & InjectedSelectorProps<any>) => void;
};

export type SelectorTypes<Type extends SelectorTypeMap = SelectorTypeMap> = MapValues<Type>;

// Injected properties.
export type SelectorTypeProps<T extends { state: State }, State = T['state']> = T & InjectedSelectorProps<T['state']>;
export type SelectorComponent<T extends { state: State }, State = T['state']> = FC<SelectorTypeProps<T, State>>;

export type SelectorSpecification<Props extends BaseSelector = BaseSelector, CT extends string = string> = {
  label: string;
  type: Props['type'];
  description: string;
  supportedContentTypes: Array<CT>;
  defaultState: Props['state'];
  FormComponent: FC<Props & InjectedSelectorProps<Props['state']>>;
  contentComponents: {
    [contentType in CT]: FC<Props & InjectedSelectorProps<Props['state']>>;
  };
  Editor?: FC<Required<Omit<Props, 'state'>>>;
};
