import { BaseSelector } from '../../../types/selector-types';

export type SelectorModel = {
  // This is a list of all of the available selectors that are in whatever is currently being edited. This can be
  // used to toggle on all to be visible, or some by whatever is querying the state.
  availableSelectors: BaseSelector[];

  // When we need to update a selector, we will be updating the store above AND the revision directly. The reason for
  // duplicating this logic is that all of the selectors in a revisions need to be extracted and flattened during
  // the editing of a revision in order to display them on the target. The overhead of updating in 2 places is worth
  // managing in order to get a really easy to maintain index of the selectors for easily displaying them.
  selectorPaths: {
    [id: string]: Array<[string, string]>;
  };

  // We'll use IDs for selectors too, like the others. These need to be unique however, since in a full document
  // editing mode you may come across more than one. Full document editing mode may have to change these IDs during
  // the import or mapping to include revision prefix or similar.
  // This is current selector that is visible on the content.
  currentSelectorId: string | null;

  // The top level selector or the outer-most selector is the least specific selector on the resource. This could
  // be a cropped image, or a page in a book. It can be used in the UI to focus the work a subset of the resource. It's
  // also going to be used to present the model with some basic navigation.
  topLevelSelector: string | null;

  // This is another set of selectors that are visible on the content but not editable. Whatever is displaying
  // these on the content could decide to also make it so when you click on one it selects the field.
  visibleSelectorIds: string[];

  // This is the state of the current selector. It may have to be changed to be an any type since it can be any
  // selector state that is available and this has been unreliable for setting in the past.
  currentSelectorState: BaseSelector['state'];

  // This may get a type at some point, but it is completely up to the plugin to decide what the shape of this is.
  // If a plugin wants to put an Image URL or text in here, that's fine, since the plugin will simply be passed this
  // in order to render it. It's not something that always exists, but it is something that an active selector can
  // choose to populate (on mount or on change I suppose.)
  selectorPreviewData: {
    [id: string]: any;
  };
};
