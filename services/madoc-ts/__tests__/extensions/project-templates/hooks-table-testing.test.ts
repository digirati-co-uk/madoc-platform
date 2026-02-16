import { hooksTableTesting } from '../../../src/extensions/projects/templates/hooks-table-testing';

type TestField = {
  type: string;
  multiline?: boolean;
  options?: Array<{ value: string; text: string }>;
  dataSource?: string;
};

type TestEntity = {
  type: 'entity';
  properties: Record<string, TestField[]>;
};

type TestDocument = {
  properties: Record<string, TestField[] | TestEntity[]>;
};

describe('Project template: hooks table testing', () => {
  test('has expected metadata and custom editors/renderers', () => {
    expect(hooksTableTesting.type).toEqual('hooks-table-testing');
    expect(hooksTableTesting.metadata.label).toContain('[TEST]');
    expect(typeof hooksTableTesting.components?.customEditor).toEqual('function');
    expect(typeof hooksTableTesting.components?.customReviewRenderer).toEqual('function');
    expect(typeof hooksTableTesting.components?.customAdminPreviewRenderer).toEqual('function');
  });

  test('has a table-friendly capture model with typed row fields and top-level modal fields', () => {
    const modelDocument = hooksTableTesting.captureModel?.document as unknown as TestDocument | undefined;
    expect(modelDocument).toBeDefined();
    if (!modelDocument) {
      throw new Error('Missing capture model document');
    }

    const rows = modelDocument.properties.rows as TestEntity[];
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].type).toEqual('entity');

    const firstRowProperties = rows[0].properties;
    expect(firstRowProperties.entry[0].type).toEqual('text-field');
    expect(firstRowProperties.status[0].type).toEqual('dropdown-field');
    expect(firstRowProperties.status[0].options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'not_started', text: 'Not started' }),
        expect.objectContaining({ value: 'in_progress', text: 'In progress' }),
        expect.objectContaining({ value: 'done', text: 'Done' }),
      ])
    );
    expect(firstRowProperties.entity[0].type).toEqual('autocomplete-field');
    expect(firstRowProperties.entity[0].dataSource).toEqual('hooks-table-testing://entities');
    expect(firstRowProperties.verified[0].type).toEqual('checkbox-field');
    expect(firstRowProperties.comment[0].type).toEqual('text-field');
    expect(firstRowProperties.comment[0].multiline).toEqual(true);

    const notes = modelDocument.properties.pageNotes as TestField[];
    expect(Array.isArray(notes)).toBe(true);
    expect(notes[0].type).toEqual('text-field');
    expect(notes[0].multiline).toEqual(true);

    const reviewPriority = modelDocument.properties.reviewPriority as TestField[];
    expect(Array.isArray(reviewPriority)).toBe(true);
    expect(reviewPriority[0].type).toEqual('dropdown-field');
    expect(reviewPriority[0].options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'low', text: 'Low' }),
        expect.objectContaining({ value: 'medium', text: 'Medium' }),
        expect.objectContaining({ value: 'high', text: 'High' }),
      ])
    );

    const referenceEntity = modelDocument.properties.referenceEntity as TestField[];
    expect(Array.isArray(referenceEntity)).toBe(true);
    expect(referenceEntity[0].type).toEqual('autocomplete-field');
    expect(referenceEntity[0].dataSource).toEqual('hooks-table-testing://entities');

    const requiresFollowUp = modelDocument.properties.requiresFollowUp as TestField[];
    expect(Array.isArray(requiresFollowUp)).toBe(true);
    expect(requiresFollowUp[0].type).toEqual('checkbox-field');
  });
});
