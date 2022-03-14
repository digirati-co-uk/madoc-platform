import { CaptureModel } from './capture-model';
import { NestedField } from './field-types';
import { BaseSelector } from './selector-types';

export type UseCaptureModel<Model extends CaptureModel = CaptureModel> = {
  captureModel: Model;
};

export type CaptureModelContext<
  Selector extends BaseSelector = BaseSelector,
  Model extends CaptureModel = CaptureModel
> = UseCaptureModel<Model> & NavigationContext<Model> & UseCurrentForm<Model> & CurrentSelectorState<Selector>;

// How will the API for this work.
//
// The first step is setting the context of the content.
// <Content type="canvas-panel" state={{ thumbnail: '...', ... }}> ... </Content>
//
// This will let the hooks know which components to serve when you are displaying
// various selectors.
//
// => First the current active selector.
// The actions here will be for updating the selector, its state and preview.
// Also for removing it as the active selector.
//
// const = [ Component, actions ] = useContentSelector();
//
//
// => Display selectors next.
// These are optionally to be displayed on the content. They have some actions
// that can be applied.
// @todo new content-type display selector OR editing parameter passed to current.
//
// const [ Array<[Component, actions]> ] = useContentDisplaySelectors();
//
// The actions will also let you:
// - select/highlight attached field + select selector
// - show/hide individual selectors
//
//
// => Finally, the top level selector.
// This is the outermost and least specific selector on the current form. For example, a form
// may be a paragraph level box with fields for each line (and boxes for each
// line). This top level selector allows the content to focus in on a region
// where the work is being done (e.g. the paragraph in a viewer).
// @todo new prop for display OR editing to indicate top level selector.
// @todo what happens if the top level selector is edited?
// const [ Component, state, actions ] = useTopLevelSelector();
//
// NOTE: Instead of passing `content-type-id` we will have a static context.

export type UseCurrentForm<Model extends CaptureModel = CaptureModel> = {
  currentFields: NestedField<Model['document']>;
  updateFieldValue: (path: Array<[string, number]>, value: any) => void;
  createUpdateFieldValue: (partialPath: Array<[string, number]>) => CaptureModelContext['updateFieldValue'];
};
export type CurrentSelectorState<Selector extends BaseSelector = BaseSelector> = {
  // @todo at the moment, the selectors are global to the capture model context.
  //   This could be changed however, with a new context specifically for selectors.
  //   This would require the context around the form too, which could complicate things.
  //   It would not change the core functionality: updateCustomSelector and availableSelectors.
  currentSelectorPath: Array<[string, number]> | null;
  currentSelector: Selector['state'] | null;
  currentSelectorOriginalState: Selector['state'] | null;
  setCurrentSelector: (selectorPath: Array<[string, number]> | null) => void;
  // @todo possibly reintroduce availableSelectors. Will contain available selectors for the
  //   content to display without being instantiated by the form to support UX cases. The information
  //   is still technically available, so not a huge issue. This will possibly used to show regions
  //   on an image or document that have existing selectors, supporting the UX experience where
  //   you can click on a selector and be taken to a field. This should really work in hand with
  //   the current form shown. Will get more complex with nested models.
  // availableSelectors: Array<{
  //   path: Array<[string, number]>;
  //   selector: BaseSelector;
  // }>;
  updateCustomSelector: (path: Array<[string, number]>, state: BaseSelector['state']) => void;
};

export type UseCurrentSelector<Selector extends BaseSelector = BaseSelector> = CurrentSelectorState & {
  updateSelector: (state: Selector['state'], confirm?: boolean) => void;
  confirmSelector: () => void;
  resetSelector: () => void;
};

export type NavigationContext<Model extends CaptureModel = CaptureModel> = {
  currentView: Model['structure'];
  replacePath: (path: number[]) => void;
  currentPath: number[];
};

export type UseNavigation<Model extends CaptureModel = CaptureModel> = NavigationContext<Model> & {
  pushPath: (index: number) => void;
  popPath: () => void;
  resetPath: () => void;
};

export type StoredCaptureModel = {
  _id?: string;
  _rev?: string;
} & CaptureModel;
