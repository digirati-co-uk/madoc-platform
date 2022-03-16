import { Action, Computed, Thunk } from 'easy-peasy';
import { CaptureModel } from '../../../types/capture-model';
import { BaseField } from '../../../types/field-types';
import { RevisionRequest } from '../../../types/revision-request';
import { BaseSelector } from '../../../types/selector-types';
import { SelectorModel } from '../selectors/selector-model';

/**
 * Revision model
 *
 * This takes in a map of revisions and will allow you to select a revision
 * and to edit fields (including selectors) on that revision. It's a step
 * after the navigation element. A revision can be optionally saved back to the
 * model or simply stored in a "local revisions" on the computer.
 *
 * There are a few entry-point for creating new revisions:
 * - Create new field using navigation through choices
 * - Seeing and editing existing (without permission to edit)
 * - Seeing and forking existing (intention of creating new = translation)
 *
 * Note: Editing subset of fields, detecting changed fields and only adding those
 *       as new revisions. Could be strict equality check on value so long as that works
 *       or field plugins could choose to implement custom logic for equality.
 *
 * Use case examples:
 * - 2 transcriptions, new user creates NEW revision each time [ createRevision ]
 * - Translation, new user forks revision to create NEW field (not merged) [ forkRevision ]
 * - Identifying people - user adds more data to existing person [ editRevision ]
 * - Identifying people - user proposes more data to existing person [ editRevision ]
 * - Identifying people - user creates new person [ createRevision ]
 * - Comments - user creates new comments always (behaviour driven by profile) [ createRevision ]
 *
 * Operations on models:
 * - [] capture model + revision id = filtered capture model
 * - [] capture model + user = filtered capture model
 * - [] capture model + user = revisions list
 * - [] capture model + revision = new capture model
 * - capture model + capture model + revision + user = true/false (validation)
 *
 * Sketch Notes:
 * - Create revision from model fields in choice
 * - Create form from revision
 * - Create form from user
 * - Edit revision - similar to model
 * - Save revision to server, taking couchdb rev id
 * - Verify revision
 * - Remove revision
 * - Merge revision (manual)
 * - Filtering revisions (for users)
 *
 * Remaining things:
 * - How to label structures in the UI?
 * - RevisionsManager should have structure ID.
 */
export type RevisionsModel = {
  revisions: {
    [key: string]: RevisionRequest;
  };

  // New mode.
  revisionEditMode: boolean;
  setRevisionMode: Action<RevisionsModel, { editMode: boolean }>;

  // The revision.
  currentRevisionId: string | null;
  currentRevision: Computed<RevisionsModel, RevisionRequest | null>;
  currentRevisionReadMode: boolean;
  unsavedRevisionIds: string[];

  // Revision fields.
  revisionSubtreePath: [string, string, boolean][];
  revisionSelectedFieldProperty: string | null;
  revisionSelectedFieldInstance: string | null;
  revisionSubtreeField: Computed<RevisionsModel, CaptureModel['document'] | BaseField | undefined>;
  revisionSubtree: Computed<RevisionsModel, CaptureModel['document'] | BaseField | undefined>;
  revisionSubtreeFieldKeys: Computed<RevisionsModel, string[]>;
  revisionSubtreeFields: Computed<
    RevisionsModel,
    Array<{ term: string; value: Array<CaptureModel['document'] | BaseField> }>
  >;
  revisionSetSubtree: Action<RevisionsModel, [string, string, boolean][]>;
  revisionPushSubtree: Action<RevisionsModel, { term: string; id: string; skip?: boolean }>;
  revisionPopSubtree: Action<RevisionsModel, { count: number } | undefined>;
  revisionSelectField: Action<RevisionsModel, { term: string; id: string }>;
  revisionDeselectField: Action<RevisionsModel>;
  revisionPopTo: Action<RevisionsModel, { id: string }>;

  // Structure navigation
  structure: CaptureModel['structure'] | undefined;
  idStack: string[];
  isThankYou: boolean;
  isPreviewing: boolean;

  goToStructure: Action<RevisionsModel, string>;
  pushStructure: Action<RevisionsModel, string>;
  popStructure: Action<RevisionsModel>;
  setIsThankYou: Action<RevisionsModel, boolean>;
  setIsPreviewing: Action<RevisionsModel, boolean>;

  structureMap: Computed<
    RevisionsModel,
    {
      [id: string]: {
        id: string;
        structure: CaptureModel['structure'];
        path: string[];
      };
    }
  >;
  currentStructureId: Computed<RevisionsModel, string | undefined>;
  currentStructure: Computed<RevisionsModel, CaptureModel['structure'] | undefined>;
  choiceStack: Computed<RevisionsModel, Array<{ id: string; structure: CaptureModel['structure']; path: string[] }>>;

  // A slightly split out model for the selectors.
  selector: SelectorModel;

  // Actions
  createRevision: Action<
    RevisionsModel,
    // Either a structure id, fields (/w optional structure ID) and always an optional revises.
    {
      revisionId: string;
      cloneMode: string;
      readMode?: boolean;
      modelRoot?: string[];
      modelMapping?: { [key: string]: string };
      fieldsToEdit?: string[];
    }
  >;
  // Persist will handle the flow of saving.
  persistRevision: Thunk<
    RevisionsModel,
    {
      createRevision: (req: RevisionRequest, status?: string) => Promise<RevisionRequest>;
      updateRevision: (req: RevisionRequest, status?: string) => Promise<RevisionRequest>;
      revisionId?: string;
      status?: string;
    }
  >;
  // Import will take in the persisted revision, or a full PUT
  importRevision: Action<RevisionsModel, { revisionRequest: RevisionRequest }>;
  // Save will remove the revision from unsavedRevisionIds
  saveRevision: Action<RevisionsModel, { revisionId: string }>;
  selectRevision: Action<RevisionsModel, { revisionId: string; readMode?: boolean; modelRoot?: string[] }>;
  deselectRevision: Action<RevisionsModel, { revisionId: string }>;
  setRevisionLabel: Action<RevisionsModel, { revisionId?: string; label: string }>;
  // discardRevisionChanges(rid) -- maybe

  // Fields and selector state.
  updateFieldValue: Action<RevisionsModel, { path: Array<[string, string]>; revisionId?: string; value: any }>;

  // Field instances (for allowMultiple=true)
  createNewFieldInstance: Action<
    RevisionsModel,
    { path: Array<[string, string]>; revisionId?: string; property: string }
  >;
  createNewEntityInstance: Action<
    RevisionsModel,
    { path: Array<[string, string]>; revisionId?: string; property: string }
  >;
  // Remove a field OR entity instance when provided with a path.
  removeInstance: Action<RevisionsModel, { path: Array<[string, string]>; revisionId?: string }>;

  // And some selector actions
  chooseSelector: Action<RevisionsModel, { selectorId: string }>;
  clearSelector: Action<RevisionsModel>;
  updateSelector: Action<RevisionsModel, { selectorId: string; state: BaseSelector['state'] }>;
  updateCurrentSelector: Thunk<RevisionsModel, BaseSelector['state']>;
  updateSelectorPreview: Action<RevisionsModel, { selectorId: string; preview: any }>;
  setTopLevelSelector: Action<RevisionsModel, { selectorId: string }>;
  clearTopLevelSelector: Action<RevisionsModel>;
  addVisibleSelectorIds: Action<RevisionsModel, { selectorIds: string[] }>;
  removeVisibleSelectorIds: Action<RevisionsModel, { selectorIds: string[] }>;
  // And some computed values. (Removed for now)
  // currentSelector: Computed<RevisionsModel, SelectorTypes | null>;
  // visibleSelectors: Computed<RevisionsModel, SelectorTypes[]>;
  // currentRevisionSelectors: Computed<RevisionsModel, BaseSelector[]>;
  visibleCurrentLevelSelectorIds: Computed<RevisionsModel, string[]>;
  visibleAdjacentSelectorIds: Computed<RevisionsModel, string[]>;
  revisionAdjacentSubtreeFields: Computed<
    RevisionsModel,
    { fields: Array<BaseField | CaptureModel['document']>; currentId: undefined | string }
  >;
  //visibleCurrentLevelBelowSelectors: Computed<RevisionsModel, BaseSelector[]>;

  // Computed selectors.
  resolvedSelectors: Computed<RevisionsModel, BaseSelector[]>;
  visibleCurrentLevelSelectors: Computed<RevisionsModel, BaseSelector[]>;
  topLevelSelector: Computed<RevisionsModel, BaseSelector | undefined>;
  visibleAdjacentSelectors: Computed<RevisionsModel, BaseSelector[]>;

  setCaptureModel: Action<
    RevisionsModel,
    {
      captureModel: CaptureModel;
      initialRevision?: string;
      initialRevisionReadMode?: boolean;
      excludeStructures?: boolean;
    }
  >;
};

export type EDIT_ALL_VALUES = 'EDIT_ALL_VALUES';
export type FORK_ALL_VALUES = 'FORK_ALL_VALUES';
export type FORK_TEMPLATE = 'FORK_TEMPLATE';
export type FORK_INSTANCE = 'FORK_INSTANCE';

export type REVISION_CLONE_MODE =
  // Editing all of the values will keep the IDs and when saving back will either
  // directly edit the original fields, or be a new revision targeting those fields.
  | EDIT_ALL_VALUES
  // This will use an existing revision as a starting point, cloning all of the current
  // values, enumerated values, selectors and structure. The IDs of all of the fields
  // that are enumerable will be different. Fields become a change request if selected
  // fields are not enumerable, but will be filtered out if not changed.
  | FORK_ALL_VALUES
  // This will use an existing revision as a template, cloning all of the structure
  // and removing all of the values, selectors, following the template rules.
  | FORK_TEMPLATE
  | FORK_INSTANCE;
// @todo some extensions to this model:
// Same as above, but does not remove selectors. NOT YET SUPPORTED.
//| 'FORK_TEMPLATE_WITH_SELECTORS'
// This will use an existing revision as a template, removing ALL of the values
// and selectors regardless of the template rules. NOT YET SUPPORTED.
//| 'FORK_STRUCTURE';
