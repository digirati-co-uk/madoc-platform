/**
 * @jest-environment node
 */

import { createRevisionStore } from '../../../../src/frontend/shared/capture-models/editor/stores/revisions/revisions-store';
import {
  getNextCanvasData,
  persistContributionRevision,
  resolveContributionPhase,
} from '../../../../src/frontend/site/hooks/use-capture-model-contribution-lifecycle';
import { ensureWorkingRevision } from '../../../../src/frontend/shared/capture-models/new/utility/ensure-working-revision';
import { CaptureModel } from '../../../../src/frontend/shared/capture-models/types/capture-model';

function createCanvasModelFixture(): CaptureModel {
  return {
    id: 'model-1',
    structure: {
      id: 'model-structure-1',
      type: 'model',
      label: 'Canvas model',
      fields: ['name'],
    },
    document: {
      id: 'root',
      type: 'entity',
      label: 'Root',
      properties: {
        name: [
          {
            id: 'field-1',
            type: 'text-field',
            label: 'Name',
            value: 'Initial',
          },
        ],
      },
    },
  };
}

describe('capture model contribution lifecycle utility', () => {
  test('empty canvas lifecycle can transition loading -> preparing -> ready', () => {
    expect(
      resolveContributionPhase({
        hasError: false,
        isLoading: true,
        isPreparing: false,
        isBlocked: false,
        pendingState: 'idle',
      })
    ).toEqual('loading');

    expect(
      resolveContributionPhase({
        hasError: false,
        isLoading: false,
        isPreparing: true,
        isBlocked: false,
        pendingState: 'idle',
      })
    ).toEqual('preparing');

    expect(
      resolveContributionPhase({
        hasError: false,
        isLoading: false,
        isPreparing: false,
        isBlocked: false,
        pendingState: 'idle',
      })
    ).toEqual('ready');
  });

  test('saveDraft persists with draft status and refreshes', async () => {
    const ensureRevision = jest.fn().mockResolvedValue('revision-1');
    const updateClaim = jest.fn().mockResolvedValue(undefined);
    const refresh = jest.fn().mockResolvedValue(undefined);

    await persistContributionRevision({
      status: 'draft',
      blocked: false,
      ensureRevision,
      getCurrentRevision: () => ({ revision: { id: 'revision-1' } } as any),
      saveRevision: async (revision, status) => {
        await updateClaim(revision, status);
      },
      refresh,
    });

    expect(ensureRevision).toHaveBeenCalledTimes(1);
    expect(updateClaim).toHaveBeenCalledTimes(1);
    expect(updateClaim).toHaveBeenCalledWith(expect.objectContaining({ revision: { id: 'revision-1' } }), 'draft');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test('submit persists with submitted status and refreshes', async () => {
    const ensureRevision = jest.fn().mockResolvedValue('revision-1');
    const updateClaim = jest.fn().mockResolvedValue(undefined);
    const refresh = jest.fn().mockResolvedValue(undefined);

    await persistContributionRevision({
      status: 'submitted',
      blocked: false,
      ensureRevision,
      getCurrentRevision: () => ({ revision: { id: 'revision-1' } } as any),
      saveRevision: async (revision, status) => {
        await updateClaim(revision, status);
      },
      refresh,
    });

    expect(updateClaim).toHaveBeenCalledWith(expect.objectContaining({ revision: { id: 'revision-1' } }), 'submitted');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test('next canvas data returns rich object in middle and end states', () => {
    const createLink = (opts?: { canvasId?: string | number; subRoute?: string }) => {
      return `/project/manifest/${opts?.canvasId}/${opts?.subRoute || ''}`;
    };

    const structure = {
      ids: [11, 12, 13],
      items: [
        { id: 11, label: { en: ['Canvas 11'] }, thumbnail: 'thumb-11' },
        { id: 12, label: { en: ['Canvas 12'] }, thumbnail: 'thumb-12' },
        { id: 13, label: { en: ['Canvas 13'] }, thumbnail: 'thumb-13' },
      ],
    };

    const middle = getNextCanvasData({
      structure,
      canvasId: 12,
      createLink,
    });

    expect(middle.hasNext).toBe(true);
    expect(middle.next).toEqual({
      id: 13,
      label: { en: ['Canvas 13'] },
      thumbnail: 'thumb-13',
      href: '/project/manifest/13/model',
    });

    const end = getNextCanvasData({
      structure,
      canvasId: 13,
      createLink,
    });

    expect(end.hasNext).toBe(false);
    expect(end.next).toBeUndefined();
  });

  test('blocked state prevents saving', async () => {
    await expect(
      persistContributionRevision({
        status: 'draft',
        blocked: true,
        ensureRevision: jest.fn(),
        getCurrentRevision: () => ({ revision: { id: 'revision-1' } } as any),
        saveRevision: jest.fn(),
        refresh: jest.fn(),
      })
    ).rejects.toThrow('Contribution is blocked');
  });

  test('ambiguous model selection requires revision selection', () => {
    const choiceModel: CaptureModel = {
      id: 'choice-capture-model',
      structure: {
        id: 'choice-root',
        type: 'choice',
        label: 'Choose one',
        items: [
          {
            id: 'model-a',
            type: 'model',
            label: 'Model A',
            fields: ['fieldA'],
          },
          {
            id: 'model-b',
            type: 'model',
            label: 'Model B',
            fields: ['fieldB'],
          },
        ],
      },
      document: {
        id: 'root-document',
        type: 'entity',
        label: 'Root',
        properties: {
          fieldA: [
            {
              id: 'field-a',
              type: 'text-field',
              label: 'Field A',
              value: '',
            },
          ],
          fieldB: [
            {
              id: 'field-b',
              type: 'text-field',
              label: 'Field B',
              value: '',
            },
          ],
        },
      },
    };

    const store = createRevisionStore({
      captureModel: choiceModel,
    });

    const result = ensureWorkingRevision(store);

    expect(result.revisionId).toBeNull();
    expect(result.needsSelection).toBe(true);
  });
});
