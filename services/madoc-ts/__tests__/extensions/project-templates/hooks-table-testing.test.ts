import { hooksTableTesting } from '../../../src/extensions/projects/templates/hooks-table-testing';

describe('Project template: hooks table testing', () => {
  test('has expected metadata and custom editors/renderers', () => {
    expect(hooksTableTesting.type).toEqual('hooks-table-testing');
    expect(hooksTableTesting.metadata.label).toContain('[TEST]');
    expect(typeof hooksTableTesting.components?.customEditor).toEqual('function');
    expect(typeof hooksTableTesting.components?.customReviewRenderer).toEqual('function');
    expect(typeof hooksTableTesting.components?.customAdminPreviewRenderer).toEqual('function');
  });

  test('has a table-friendly capture model with rows and top-level notes', () => {
    const modelDocument = hooksTableTesting.captureModel?.document as any;
    expect(modelDocument).toBeDefined();

    const rows = modelDocument.properties.rows;
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].type).toEqual('entity');

    const firstRowProperties = rows[0].properties;
    expect(firstRowProperties.entry[0].type).toEqual('text-field');
    expect(firstRowProperties.value[0].type).toEqual('text-field');
    expect(firstRowProperties.comment[0].type).toEqual('text-field');

    const notes = modelDocument.properties.pageNotes;
    expect(Array.isArray(notes)).toBe(true);
    expect(notes[0].type).toEqual('text-field');
  });
});
