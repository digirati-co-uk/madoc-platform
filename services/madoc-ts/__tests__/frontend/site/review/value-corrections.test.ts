import copy from 'fast-copy';
import type { CaptureModel, Document } from '../../../../src/frontend/shared/capture-models/types/capture-model';
import type { BaseField } from '../../../../src/frontend/shared/capture-models/types/field-types';
import { canCorrectApprovedValues } from '../../../../src/frontend/site/pages/tasks/review-listing/correction-policy';
import {
  applyValueCorrections,
  correctionTargets,
  saveValueCorrections,
  ValueCorrection,
  requireFullCorrectionModel,
  FULL_CORRECTION_MODEL_QUERY,
} from '../../../../src/frontend/site/pages/tasks/review-listing/save-value-corrections';

function fixture(): CaptureModel {
  return {
    id: 'model',
    structure: { id: 'structure', type: 'model', label: 'Form', fields: ['title', 'shared'] },
    contributors: { contributor: { id: 'contributor', type: 'Person', name: 'Original author' } },
    target: [{ type: 'Canvas', id: 'urn:madoc:canvas:1' }],
    revisions: [
      {
        id: 'approved',
        status: 'accepted',
        approved: true,
        authors: ['contributor'],
        fields: ['title', 'shared'],
        structureId: 'structure',
      },
      { id: 'other', status: 'draft', approved: false, authors: ['other-person'], fields: ['title'] },
    ],
    document: {
      id: 'document',
      type: 'entity',
      label: 'Document',
      properties: {
        title: [
          {
            id: 'title',
            type: 'text-field',
            label: 'Title',
            value: 'Typo',
            revision: 'approved',
            authors: ['contributor'],
            selector: {
              id: 'region',
              type: 'box-selector',
              state: { x: 1, y: 2, width: 3, height: 4 },
              revisedBy: [
                {
                  id: 'revised-region',
                  type: 'box-selector',
                  revisionId: 'approved',
                  state: { x: 5, y: 6, width: 7, height: 8 },
                },
              ],
            },
          },
          { id: 'other-title', type: 'text-field', label: 'Title', value: 'Other draft', revision: 'other' },
        ],
        shared: [
          {
            id: 'canonical',
            type: 'text-field',
            label: 'Shared value',
            value: 'Canonical value',
            authors: ['original-person'],
          },
        ],
      },
    },
  };
}

function field(model: CaptureModel, id: string): BaseField {
  return Object.values(model.document.properties)
    .flat()
    .find(item => item.id === id) as BaseField;
}

function nestedFixture(): CaptureModel {
  const model = fixture();
  model.revisions![0].fields.push(['groups', [['nested', ['text']]]]);
  model.document.properties.groups = [
    {
      id: 'group',
      type: 'entity',
      label: 'Group',
      selector: { id: 'group-region', type: 'box-selector', state: { x: 0, y: 0, width: 1, height: 1 } },
      properties: {
        nested: [
          {
            id: 'nested',
            type: 'entity',
            label: 'Nested',
            selector: { id: 'nested-region', type: 'box-selector', state: { x: 0, y: 0, width: 1, height: 1 } },
            properties: { text: [{ id: 'nested-text', type: 'text-field', label: 'Text', value: 'Shared child' }] },
          },
        ],
      },
    },
  ];
  return model;
}

function freeze(value: unknown): void {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
}

describe('approved correction policy', () => {
  const input = () => ({
    scope: ['models.create', 'site.admin'],
    taskStatus: 3,
    revisionId: 'approved',
    model: fixture(),
  });
  test('allows capable admins on approved work, independent of an old review task', () => {
    expect(canCorrectApprovedValues(input())).toBe(true);
  });
  test('matches the backend site.admin override and explicit model-admin write capability', () => {
    expect(canCorrectApprovedValues({ ...input(), scope: ['site.admin'] })).toBe(true);
    expect(canCorrectApprovedValues({ ...input(), scope: ['site.admin', 'tasks.admin', 'models.admin'] })).toBe(true);
    expect(canCorrectApprovedValues({ ...input(), scope: ['models.admin', 'models.create'] })).toBe(true);
    expect(canCorrectApprovedValues({ ...input(), scope: ['models.admin', 'models.revision'] })).toBe(false);
  });
  test('denies contributors, limited reviewers, unsupported work and active merges', () => {
    expect(canCorrectApprovedValues({ ...input(), scope: ['models.revision'] })).toBe(false);
    expect(canCorrectApprovedValues({ ...input(), scope: ['models.create'] })).toBe(false);
    expect(canCorrectApprovedValues({ ...input(), scope: ['models.admin'] })).toBe(false);
    expect(canCorrectApprovedValues({ ...input(), scope: ['tasks.admin'] })).toBe(false);
    for (const taskStatus of [-1, 0, 1, 2, 4, 5])
      expect(canCorrectApprovedValues({ ...input(), taskStatus })).toBe(false);
    expect(canCorrectApprovedValues({ ...input(), revisionId: 'missing' })).toBe(false);
    expect(canCorrectApprovedValues({ ...input(), revisionId: 'other' })).toBe(false);
    expect(canCorrectApprovedValues({ ...input(), activeMerge: true })).toBe(false);
    expect(canCorrectApprovedValues({ ...input(), tabular: true })).toBe(false);
    expect(canCorrectApprovedValues({ ...input(), customRenderer: true })).toBe(false);
    const withAlignment = fixture();
    withAlignment.revisions![0].tabularAlignment = {} as NonNullable<
      CaptureModel['revisions']
    >[number]['tabularAlignment'];
    expect(canCorrectApprovedValues({ ...input(), model: withAlignment })).toBe(false);
  });
});

describe('existing-value correction save', () => {
  test('enumerates only revision/shared fields and the actual selected revised selector', () => {
    const targets = correctionTargets(fixture(), 'approved');
    expect(targets.fields.map(item => item.id)).toEqual(['title', 'canonical']);
    expect(targets.selectors.map(item => item.selector.id)).toEqual(['revised-region']);
  });

  test.each(['group', 'nested'])('excludes canonical descendants and regions beneath unrelated %s entities', id => {
    const model = nestedFixture();
    const group = model.document.properties.groups[0] as Document;
    const entity = id === 'group' ? group : (group.properties.nested[0] as Document);
    entity.revision = 'other';
    entity.selector!.revisionId = 'other';
    // Even a selected selector revision cannot grant ownership through a draft ancestor.
    entity.selector!.revisedBy = [
      { id: 'selected-under-draft', type: 'box-selector', revisionId: 'approved', state: {} },
    ];
    const original = copy(model);
    expect(correctionTargets(model, 'approved').fields.map(item => item.id)).not.toContain('nested-text');
    const selectors = correctionTargets(model, 'approved').selectors.map(item => item.selector.id);
    expect(selectors).not.toContain('selected-under-draft');
    expect(selectors).not.toContain('nested-region');
    expect(() =>
      applyValueCorrections(model, model, 'approved', [{ kind: 'value', id: 'nested-text', value: 'Forbidden' }])
    ).toThrow(/Only existing/);
    expect(() =>
      applyValueCorrections(model, model, 'approved', [
        { kind: 'selector', id: 'selected-under-draft', state: { x: 9 } },
      ])
    ).toThrow(/Only existing/);
    expect(model).toEqual(original);
  });

  test.each([undefined, 'dependency', 'approved'])(
    'allows nested canonical/dependency/selected ownership: %s',
    revision => {
      const model = nestedFixture();
      model.revisions![0].revises = 'dependency';
      model.revisions!.push({ id: 'dependency', status: 'accepted', fields: ['title'] });
      const group = model.document.properties.groups[0] as Document;
      const nested = group.properties.nested[0] as Document;
      group.revision = revision;
      nested.revision = revision;
      nested.selector!.revisionId = revision;
      const corrected = applyValueCorrections(model, model, 'approved', [
        { kind: 'value', id: 'nested-text', value: 'Corrected' },
        { kind: 'selector', id: 'nested-region', state: { x: 5, y: 6, width: 7, height: 8 } },
      ]);
      const correctedGroup = corrected.document.properties.groups[0] as Document;
      const correctedNested = correctedGroup.properties.nested[0] as Document;
      expect((correctedNested.properties.text[0] as BaseField).value).toBe('Corrected');
      expect(correctedNested.selector!.state).toEqual({ x: 5, y: 6, width: 7, height: 8 });
      expect(corrected.revisions).toEqual(model.revisions);
    }
  );

  test('ignores unrelated superseding entities, and excludes revision-deleted entity subtrees', () => {
    const model = nestedFixture();
    const draft = copy(model.document.properties.groups[0] as Document);
    draft.id = 'draft-group';
    draft.revision = 'other';
    draft.revises = 'group';
    draft.properties = {};
    delete draft.selector;
    (model.document.properties.groups as Document[]).push(draft);
    expect(correctionTargets(model, 'approved').fields.map(item => item.id)).toContain('nested-text');
    model.revisions![0].deletedFields = ['group'];
    expect(correctionTargets(model, 'approved').fields.map(item => item.id)).not.toContain('nested-text');
    expect(correctionTargets(model, 'approved').selectors.map(item => item.selector.id)).not.toContain('nested-region');
  });

  test('excludes unrelated selectors on allowed nodes, including selected children of unrelated selectors', () => {
    const model = fixture();
    field(model, 'title').selector!.revisionId = 'other';
    expect(correctionTargets(model, 'approved').selectors).toEqual([]);
    for (const id of ['region', 'revised-region']) {
      expect(() =>
        applyValueCorrections(model, model, 'approved', [{ kind: 'selector', id, state: { x: 3 } }])
      ).toThrow(/Only existing/);
    }
  });

  test('rejects changes to selector ancestor ownership even between allowed dependencies', () => {
    const baseline = fixture();
    baseline.revisions![0].revises = 'dependency';
    baseline.revisions!.push({ id: 'dependency', fields: ['title'] });
    const fresh = copy(baseline);
    field(fresh, 'title').selector!.revisionId = 'dependency';
    expect(() =>
      applyValueCorrections(baseline, fresh, 'approved', [
        { kind: 'selector', id: 'revised-region', state: { x: 9, y: 9, width: 9, height: 9 } },
      ])
    ).toThrow(/changed since editing/);
  });

  test.each(['group', 'nested'])('rejects nested value/region patches when %s ownership changes during editing', id => {
    const baseline = nestedFixture();
    const fresh = copy(baseline);
    const group = fresh.document.properties.groups[0] as Document;
    (id === 'group' ? group : (group.properties.nested[0] as Document)).revision = 'other';
    const before = copy(fresh);
    for (const change of [
      { kind: 'value', id: 'nested-text', value: 'Forbidden' },
      { kind: 'selector', id: 'nested-region', state: { x: 5 } },
    ] as ValueCorrection[]) {
      expect(() => applyValueCorrections(baseline, fresh, 'approved', [change])).toThrow(/Only existing/);
    }
    expect(fresh).toEqual(before);
  });

  test('requires a verified unfiltered model read and strips only transport debug data', () => {
    const original = fixture();
    expect(FULL_CORRECTION_MODEL_QUERY).toEqual({ debug: true, 'debug.fullModel': true });
    expect(() => requireFullCorrectionModel(original)).toThrow(/complete model/);
    expect(() => requireFullCorrectionModel({ ...original, __debug_options__: { fullModel: false } })).toThrow(
      /complete model/
    );
    expect(
      requireFullCorrectionModel({ ...original, __debug_options__: { fullModel: true }, debug: { totalMs: 10 } })
    ).toEqual(original);
  });

  test('offers effective revision values, preserves superseded originals and keeps unsuperseded inherited values', () => {
    const original = fixture();
    (original.document.properties.title as BaseField[]).unshift({
      id: 'canonical-template',
      type: 'text-field',
      label: 'Title',
      value: '',
    });
    field(original, 'title').revises = 'canonical-template';
    const before = copy(original);
    freeze(original);
    expect(correctionTargets(original, 'approved').fields.map(item => item.id)).toEqual(['title', 'canonical']);
    const corrected = applyValueCorrections(original, original, 'approved', [
      { kind: 'value', id: 'title', value: 'Fixed' },
    ]);
    expect(field(corrected, 'canonical-template')).toEqual(field(before, 'canonical-template'));
    expect(field(corrected, 'canonical')).toEqual(field(before, 'canonical'));
    expect(corrected.revisions).toEqual(before.revisions);
    expect(() =>
      applyValueCorrections(original, original, 'approved', [
        { kind: 'value', id: 'canonical-template', value: 'Wrong target' },
      ])
    ).toThrow(/Only existing/);
    expect(original).toEqual(before);
  });

  test('preserves attribution, approval, unrelated fields/selectors, snapshots and input immutability', () => {
    const baseline = fixture();
    const fresh = copy(baseline);
    field(fresh, 'other-title').value = 'Concurrent unrelated edit';
    fresh.contributors!.new = { id: 'new', type: 'Person', name: 'Another author' };
    const originalBaseline = copy(baseline);
    const originalFresh = copy(fresh);
    const changes: ValueCorrection[] = [
      { kind: 'value', id: 'title', value: 'Corrected' },
      { kind: 'value', id: 'canonical', value: 'Corrected shared value' },
      { kind: 'selector', id: 'revised-region', state: { x: 50, y: 60, width: 70, height: 80 } },
    ];
    freeze(baseline);
    freeze(fresh);
    freeze(changes);
    const result = applyValueCorrections(baseline, fresh, 'approved', changes);
    expect(field(result, 'title').value).toBe('Corrected');
    expect(field(result, 'canonical').value).toBe('Corrected shared value');
    expect(field(result, 'other-title').value).toBe('Concurrent unrelated edit');
    expect(field(result, 'title').selector!.state).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    expect(field(result, 'title').selector!.revisedBy![0]).toEqual({
      id: 'revised-region',
      type: 'box-selector',
      revisionId: 'approved',
      state: { x: 50, y: 60, width: 70, height: 80 },
    });
    expect(result.revisions).toEqual(originalFresh.revisions);
    expect(result.contributors).toEqual(originalFresh.contributors);
    expect(field(result, 'title').authors).toEqual(['contributor']);
    expect(field(result, 'title').revision).toBe('approved');
    expect(field(result, 'canonical').revision).toBeUndefined();
    expect(baseline).toEqual(originalBaseline);
    expect(fresh).toEqual(originalFresh);
  });

  test('rejects divergent edited values and selectors', () => {
    const baseline = fixture();
    const fresh = copy(baseline);
    field(fresh, 'title').value = 'Someone else corrected this';
    expect(() =>
      applyValueCorrections(baseline, fresh, 'approved', [{ kind: 'value', id: 'title', value: 'My correction' }])
    ).toThrow(/changed since editing/);
    const selectorFresh = fixture();
    field(selectorFresh, 'title').selector!.revisedBy![0].state = { x: 9, y: 9, width: 9, height: 9 };
    expect(() =>
      applyValueCorrections(baseline, selectorFresh, 'approved', [
        { kind: 'selector', id: 'revised-region', state: { x: 1, y: 1, width: 2, height: 2 } },
      ])
    ).toThrow(/changed since editing/);
  });

  test('rejects structure/revision changes and attempts to add, delete, edit other revisions or canonicalize instances', () => {
    const baseline = fixture();
    const structure = fixture();
    structure.structure.label = 'Changed structure';
    expect(() => applyValueCorrections(baseline, structure, 'approved', [])).toThrow(/structure changed/);
    const revision = fixture();
    revision.revisions![0].status = 'rejected';
    expect(() => applyValueCorrections(baseline, revision, 'approved', [])).toThrow(/revision changed/);
    for (const id of ['new-instance', 'other-title', 'document']) {
      expect(() =>
        applyValueCorrections(baseline, fixture(), 'approved', [{ kind: 'value', id, value: 'Changed' }])
      ).toThrow(/Only existing/);
    }
    expect(() =>
      applyValueCorrections(baseline, fixture(), 'approved', [{ kind: 'selector', id: 'new-selector', state: {} }])
    ).toThrow(/Only existing/);
    expect(() =>
      applyValueCorrections(baseline, fixture(), 'approved', [
        { kind: 'delete', id: 'title' } as unknown as ValueCorrection,
      ])
    ).toThrow(/Structural/);
    const canonicalized = fixture();
    delete field(canonicalized, 'title').revision;
    expect(() =>
      applyValueCorrections(baseline, canonicalized, 'approved', [{ kind: 'value', id: 'title', value: 'Changed' }])
    ).toThrow(/changed since editing/);
    const removed = fixture();
    removed.document.properties.title.splice(0, 1);
    expect(() =>
      applyValueCorrections(baseline, removed, 'approved', [{ kind: 'value', id: 'title', value: 'Changed' }])
    ).toThrow(/Only existing/);
  });

  test('rejects changed parent ownership and a newly revised selector target', () => {
    const baseline = fixture();
    const changedParent = fixture();
    changedParent.document.revision = 'other';
    expect(() =>
      applyValueCorrections(baseline, changedParent, 'approved', [{ kind: 'value', id: 'title', value: 'Fixed' }])
    ).toThrow(/Only existing/);
    const old = fixture();
    delete field(old, 'title').selector!.revisedBy;
    const revised = copy(old);
    field(revised, 'title').selector!.revisedBy = [
      { id: 'newly-revised', type: 'box-selector', revisionId: 'approved', state: { x: 1, y: 1, width: 2, height: 2 } },
    ];
    expect(() =>
      applyValueCorrections(old, revised, 'approved', [
        { kind: 'selector', id: 'region', state: { x: 1, y: 1, width: 2, height: 2 } },
      ])
    ).toThrow(/Only existing/);
  });

  test('loads fresh before one save and refuses a conflicting save without PUT', async () => {
    const baseline = fixture();
    const save = jest.fn().mockResolvedValue(undefined);
    const loadFresh = jest.fn().mockResolvedValue(fixture());
    await saveValueCorrections({
      baseline,
      revisionId: 'approved',
      changes: [{ kind: 'value', id: 'title', value: 'Fixed' }],
      loadFresh,
      save,
    });
    expect(loadFresh).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(field(save.mock.calls[0][0], 'title').value).toBe('Fixed');
    save.mockClear();
    const conflict = fixture();
    field(conflict, 'title').value = 'Concurrent';
    loadFresh.mockResolvedValue(conflict);
    await expect(
      saveValueCorrections({
        baseline,
        revisionId: 'approved',
        changes: [{ kind: 'value', id: 'title', value: 'Fixed' }],
        loadFresh,
        save,
      })
    ).rejects.toThrow(/changed since editing/);
    expect(save).not.toHaveBeenCalled();
  });

  test('no-op edits preserve concurrent values; failed writes propagate without mutating snapshots', async () => {
    const baseline = fixture();
    const concurrent = fixture();
    field(concurrent, 'title').value = 'Concurrent';
    const save = jest.fn();
    const result = await saveValueCorrections({
      baseline,
      revisionId: 'approved',
      changes: [{ kind: 'value', id: 'title', value: 'Typo' }],
      loadFresh: async () => concurrent,
      save,
    });
    expect(field(result, 'title').value).toBe('Concurrent');
    expect(save).not.toHaveBeenCalled();
    save.mockRejectedValue(new Error('Network failure'));
    await expect(
      saveValueCorrections({
        baseline,
        revisionId: 'approved',
        changes: [{ kind: 'value', id: 'title', value: 'Fixed' }],
        loadFresh: async () => fixture(),
        save,
      })
    ).rejects.toThrow('Network failure');
    expect(field(baseline, 'title').value).toBe('Typo');
  });
});
