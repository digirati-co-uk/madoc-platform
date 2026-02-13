import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import {
  getMaxEntityDepth,
  isTwoLevelInlineEntityModel,
} from '../../../src/frontend/shared/capture-models/new/utility/get-max-entity-depth';

function field(id: string, label: string) {
  return {
    id,
    type: 'text-field',
    label,
    value: '',
  };
}

describe('get-max-entity-depth', () => {
  test('root with only fields has depth 1', () => {
    const root: CaptureModel['document'] = {
      id: 'root',
      type: 'entity',
      label: 'Root',
      properties: {
        name: [field('name-1', 'Name') as any],
      },
    };

    expect(getMaxEntityDepth(root)).toEqual(1);
    expect(isTwoLevelInlineEntityModel(root)).toEqual(false);
  });

  test('exactly two levels deep returns true for inline two-level mode', () => {
    const root: CaptureModel['document'] = {
      id: 'root',
      type: 'entity',
      label: 'Root',
      properties: {
        person: [
          {
            id: 'person-1',
            type: 'entity',
            label: 'Person',
            allowMultiple: true,
            labelledBy: 'name',
            properties: {
              name: [field('person-name-1', 'Name') as any],
            },
          } as CaptureModel['document'],
        ],
      },
    };

    expect(getMaxEntityDepth(root)).toEqual(2);
    expect(isTwoLevelInlineEntityModel(root)).toEqual(true);
  });

  test('three levels deep returns false for inline two-level mode', () => {
    const root: CaptureModel['document'] = {
      id: 'root',
      type: 'entity',
      label: 'Root',
      properties: {
        section: [
          {
            id: 'section-1',
            type: 'entity',
            label: 'Section',
            allowMultiple: true,
            properties: {
              nested: [
                {
                  id: 'nested-1',
                  type: 'entity',
                  label: 'Nested',
                  allowMultiple: false,
                  properties: {
                    name: [field('nested-name-1', 'Nested name') as any],
                  },
                } as CaptureModel['document'],
              ],
            },
          } as CaptureModel['document'],
        ],
      },
    };

    expect(getMaxEntityDepth(root)).toEqual(3);
    expect(isTwoLevelInlineEntityModel(root)).toEqual(false);
  });

  test('mixed root fields and child entities still support two-level inline mode', () => {
    const root: CaptureModel['document'] = {
      id: 'root',
      type: 'entity',
      label: 'Root',
      properties: {
        title: [field('title-1', 'Title') as any],
        illustration: [
          {
            id: 'illustration-1',
            type: 'entity',
            label: 'Illustration',
            allowMultiple: true,
            properties: {
              notes: [field('notes-1', 'Notes') as any],
            },
          } as CaptureModel['document'],
        ],
      },
    };

    expect(getMaxEntityDepth(root)).toEqual(2);
    expect(isTwoLevelInlineEntityModel(root)).toEqual(true);
  });
});
