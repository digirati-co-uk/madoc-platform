import copy from 'fast-copy';
import type { CaptureModel, Document } from '../../../../shared/capture-models/types/capture-model';
import type { BaseField } from '../../../../shared/capture-models/types/field-types';
import type { BaseSelector } from '../../../../shared/capture-models/types/selector-types';
import { filterRevises } from '../../../../shared/capture-models/helpers/filter-revises';
import { filterCaptureModel } from '../../../../shared/capture-models/helpers/filter-capture-model';
import { expandModelFields } from '../../../../shared/capture-models/helpers/expand-model-fields';
import { recurseRevisionDependencies } from '../../../../shared/capture-models/helpers/recurse-revision-dependencies';

// Models are JSON data; compare object keys independently of serialization order.
function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  return (
    keys.length === Object.keys(right).length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(right, key) && equal(left[key], right[key]))
  );
}

export type ValueCorrection =
  { kind: 'value'; id: string; value: unknown } | { kind: 'selector'; id: string; state: unknown };

export interface CorrectionTargets {
  fields: BaseField[];
  selectors: Array<{ label: string; selector: BaseSelector }>;
}

export const FULL_CORRECTION_MODEL_QUERY = { debug: true, 'debug.fullModel': true };

// Ordinary GETs run display filters (including missing revisions). Never PUT that projection.
export function requireFullCorrectionModel(
  response: CaptureModel & {
    __debug_options__?: { fullModel?: boolean };
    debug?: unknown;
  }
): CaptureModel {
  const { __debug_options__: options, debug: _timings, ...model } = response;
  if (options?.fullModel !== true)
    throw new Error('The complete model could not be loaded. Correction is unavailable.');
  return copy(model);
}

interface LocatedNode {
  node: Document | BaseField;
  location: string;
  ancestors: string[];
}

function isDocument(node: Document | BaseField): node is Document {
  return node.type === 'entity';
}

function indexDocument(document: Document) {
  const nodes = new Map<string, LocatedNode>();
  const selectors = new Map<string, { selector: BaseSelector; owner: string; ancestors: string[] }>();
  const visitSelector = (selector: BaseSelector, owner: string, ancestors: string[] = []) => {
    if (selectors.has(selector.id)) throw new Error('Ambiguous selector IDs; correction is unavailable.');
    selectors.set(selector.id, { selector, owner, ancestors });
    selector.revisedBy?.forEach(child => visitSelector(child, owner, [...ancestors, selector.id]));
  };
  const visit = (node: Document | BaseField, location: string, ancestors: string[]) => {
    if (nodes.has(node.id)) throw new Error('Ambiguous instance IDs; correction is unavailable.');
    nodes.set(node.id, { node, location, ancestors });
    if (node.selector) visitSelector(node.selector, node.id);
    if (isDocument(node)) {
      for (const [property, values] of Object.entries(node.properties)) {
        values.forEach((child, index) => visit(child, `${location}/${property}/${index}`, [...ancestors, node.id]));
      }
    }
  };
  visit(document, 'document', []);
  return { nodes, selectors };
}

export function correctionTargets(model: CaptureModel, revisionId: string): CorrectionTargets {
  const revision = model.revisions?.find(item => item.id === revisionId);
  if (!revision || revision.status !== 'accepted' || !revision.approved || revision.tabularAlignment) {
    throw new Error('An approved ordinary revision is required.');
  }
  // Filtering may mark inherited fields; never give it the stored snapshot.
  const snapshot = copy(model);
  const dependencies = recurseRevisionDependencies(revisionId, snapshot.revisions);
  const deleted = new Set(revision.deletedFields || []);
  const ownsNode = (node: Document | BaseField) =>
    !deleted.has(node.id) && (!node.revision || dependencies.includes(node.revision));
  const prune = (entity: Document) => {
    for (const [property, values] of Object.entries(entity.properties)) {
      const owned = [...values].filter(ownsNode);
      // Each stored property is homogeneous; removing instances preserves that contract.
      entity.properties[property] = owned as Document[] | BaseField[];
      owned.forEach(child => {
        if (isDocument(child)) prune(child);
      });
    }
  };
  if (!ownsNode(snapshot.document)) return { fields: [], selectors: [] };
  // The shared projection helper only predicates leaves, so prune entity subtrees first.
  prune(snapshot.document);
  const view = filterCaptureModel(revisionId, snapshot.document, expandModelFields(revision.fields), ownsNode);
  if (!view) throw new Error('No existing values are available to correct.');
  const fields: BaseField[] = [];
  const selectors: CorrectionTargets['selectors'] = [];
  const seenSelectors = new Set<string>();
  const visit = (node: Document | BaseField) => {
    // Keep ownership explicit at every level of the target walk.
    if (!ownsNode(node)) return;
    if (node.selector && (!node.selector.revisionId || dependencies.includes(node.selector.revisionId))) {
      // Persist the actual revised selector, rather than the display resolver's synthetic copy.
      const selector = node.selector.revisedBy?.find(item => item.revisionId === revisionId) || node.selector;
      if (!seenSelectors.has(selector.id)) {
        selectors.push({ label: node.label, selector });
        seenSelectors.add(selector.id);
      }
    }
    if (isDocument(node)) {
      // Match the ordinary editor's superseded-instance refinement, without destructive ID normalization.
      Object.values(node.properties).forEach(values => filterRevises([...values].filter(ownsNode)).forEach(visit));
    } else fields.push(node);
  };
  visit(view);
  return { fields, selectors };
}

function nodeIdentity(node: Document | BaseField) {
  if (isDocument(node)) {
    const { properties: _properties, selector: _selector, ...identity } = node;
    return identity;
  }
  const { value: _value, selector: _selector, ...identity } = node;
  return identity;
}

function selectorIdentity(selector: BaseSelector) {
  const { state: _state, revisedBy: _revisedBy, ...identity } = selector;
  return identity;
}

/** Apply only explicit existing-value edits to a fresh model; never merge an editor document. */
export function applyValueCorrections(
  baseline: CaptureModel,
  fresh: CaptureModel,
  revisionId: string,
  changes: readonly ValueCorrection[]
): CaptureModel {
  if (!baseline.id || baseline.id !== fresh.id || !equal(baseline.structure, fresh.structure)) {
    throw new Error('The model structure changed. Cancel and reload before correcting values.');
  }
  const oldRevision = baseline.revisions?.find(item => item.id === revisionId);
  const freshRevision = fresh.revisions?.find(item => item.id === revisionId);
  if (!oldRevision || !equal(oldRevision, freshRevision)) {
    throw new Error('This revision changed. Cancel and reload before correcting values.');
  }
  const targets = correctionTargets(baseline, revisionId);
  const freshTargets = correctionTargets(fresh, revisionId);
  const allowedFields = new Set(targets.fields.filter(field => !field.immutable).map(field => field.id));
  const freshFields = new Set(freshTargets.fields.filter(field => !field.immutable).map(field => field.id));
  const freshSelectors = new Set(freshTargets.selectors.map(item => item.selector.id));
  const allowedSelectors = new Set(targets.selectors.map(item => item.selector.id));
  const before = indexDocument(baseline.document);
  const result = copy(fresh);
  const after = indexDocument(result.document);
  const sameOwnership = (old: LocatedNode, current: LocatedNode) =>
    old.location === current.location &&
    equal(old.ancestors, current.ancestors) &&
    equal(nodeIdentity(old.node), nodeIdentity(current.node)) &&
    old.ancestors.every(id => {
      const previous = before.nodes.get(id);
      const latest = after.nodes.get(id);
      return previous && latest && equal(nodeIdentity(previous.node), nodeIdentity(latest.node));
    });
  const seen = new Set<string>();
  for (const change of changes) {
    const key = `${change.kind}:${change.id}`;
    if (seen.has(key)) throw new Error('Duplicate correction target.');
    seen.add(key);
    if (change.kind === 'value') {
      const old = before.nodes.get(change.id);
      const current = after.nodes.get(change.id);
      if (
        !allowedFields.has(change.id) ||
        !freshFields.has(change.id) ||
        !old ||
        !current ||
        isDocument(old.node) ||
        isDocument(current.node)
      ) {
        throw new Error('Only existing contribution values can be corrected.');
      }
      if (equal(old.node.value, change.value)) continue;
      if (!sameOwnership(old, current) || !equal(old.node.value, current.node.value)) {
        throw new Error('A value you are correcting changed since editing began. Cancel and reload.');
      }
      current.node.value = copy(change.value);
    } else if (change.kind === 'selector') {
      const old = before.selectors.get(change.id);
      const current = after.selectors.get(change.id);
      if (!allowedSelectors.has(change.id) || !freshSelectors.has(change.id) || !old || !current) {
        throw new Error('Only existing contribution selectors can be corrected.');
      }
      if (equal(old.selector.state, change.state)) continue;
      const oldOwner = before.nodes.get(old.owner);
      const newOwner = after.nodes.get(current.owner);
      if (
        old.owner !== current.owner ||
        !oldOwner ||
        !newOwner ||
        !sameOwnership(oldOwner, newOwner) ||
        !equal(old.ancestors, current.ancestors) ||
        !old.ancestors.every(id => {
          const previous = before.selectors.get(id);
          const latest = after.selectors.get(id);
          return previous && latest && equal(selectorIdentity(previous.selector), selectorIdentity(latest.selector));
        }) ||
        !equal(selectorIdentity(old.selector), selectorIdentity(current.selector)) ||
        !equal(old.selector.state, current.selector.state)
      ) {
        throw new Error('A region you are correcting changed since editing began. Cancel and reload.');
      }
      current.selector.state = copy(change.state);
    } else {
      throw new Error('Structural corrections are not supported.');
    }
  }
  return result;
}

export async function saveValueCorrections(input: {
  baseline: CaptureModel;
  revisionId: string;
  changes: readonly ValueCorrection[];
  loadFresh: () => Promise<CaptureModel>;
  save: (model: CaptureModel) => Promise<unknown>;
}): Promise<CaptureModel> {
  const fresh = await input.loadFresh();
  const corrected = applyValueCorrections(input.baseline, fresh, input.revisionId, input.changes);
  if (!equal(corrected, fresh)) await input.save(corrected);
  return corrected;
}
