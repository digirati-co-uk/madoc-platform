import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import { getValueDotNotation as dot } from '../../../src/utility/iiif-metadata';
import invariant from 'tiny-invariant';
import { updateRevisionInDocument } from '../../../src/capture-model-server/server-filters/update-revision-in-document';
import { captureModelRevisionStoreShorthand } from '../../../src/frontend/shared/capture-models/helpers/capture-model-revision-store-shorthand';
import { generateId } from '../../../src/frontend/shared/capture-models/helpers/generate-id';
import { registerField } from '../../../src/frontend/shared/capture-models/plugin-api/global-store';
import { BaseField } from '../../../src/frontend/shared/capture-models/types/field-types';

// For testing.
registerField({
  label: 'Text field',
  type: 'text-field',
  description: 'Simple text field for plain text',
  Component: undefined as any,
  defaultValue: '',
  allowMultiple: true,
  defaultProps: {},
  Editor: undefined as any,
  // Editor: TextFieldEditor,
  TextPreview: undefined as any,
} as any);

describe('Update revision', () => {
  const debug = (a: any) => console.log(JSON.stringify(a, null, 2));

  describe('Updating single field', () => {
    const { store, actions, captureModel, structureId } = captureModelRevisionStoreShorthand(
      `
      firstName
      lastName
    `,
      {
        firstName: 'John',
        lastName: 'Doe',
      }
    );

    let revisionId: string;

    test('Add new field revising another field in a revision', () => {
      actions.setRevisionMode({ editMode: true });

      actions.createRevision({
        revisionId: structureId,
        cloneMode: 'EDIT_ALL_VALUES',
      });

      actions.updateFieldValue({
        path: [['firstName', captureModel.document.properties.firstName[0].id]],
        value: 'Stephen',
      });

      expect((captureModel.document.properties.firstName[0] as BaseField).value).toEqual('John');

      const revision = store.getState().currentRevision;
      invariant(revision);

      revisionId = revision.revision.id;

      expect((revision.document.properties.firstName[0] as BaseField).value).toEqual('Stephen');

      updateRevisionInDocument(captureModel, revision, {
        allowAnonymous: true,
      });

      const originalField = (captureModel.document.properties.firstName as BaseField[]).find(
        r => !r.revision
      ) as BaseField;
      const newField = (captureModel.document.properties.firstName as BaseField[]).find(r => r.revision) as BaseField;

      expect(captureModel.document.properties.firstName).toHaveLength(2);
      expect(newField.value).toEqual('Stephen');
      expect(originalField.value).toEqual('John');
      expect(newField.revises).toEqual(originalField.id);

      // Before we exit, add the revision to the model.
      captureModel.revisions = captureModel.revisions ? captureModel.revisions : [];
      captureModel.revisions.push(revision.revision);
    });

    // Sec block.
    test('Change value of a field owned by revision', () => {
      // Setting the updated capture model
      actions.setCaptureModel({ captureModel, initialRevision: revisionId });

      // Now change the value of the revision.
      actions.selectRevision({ revisionId: revisionId });
      actions.updateFieldValue({
        path: [['firstName', captureModel.document.properties.firstName[0].id]],
        value: 'Stephen CHANGED',
      });

      // Ensure it remains unchanged in our capture model.
      expect((captureModel.document.properties.firstName[1] as BaseField).value).toEqual('Stephen');

      // Ensure it was updated.
      const revision = store.getState().currentRevision;
      invariant(revision, 'Current revision not set.');

      const newField = (revision.document.properties.firstName as BaseField[]).find(r => r.revision) as BaseField;
      expect(newField.value).toEqual('Stephen CHANGED');

      // Ensure it can be updated.
      updateRevisionInDocument(captureModel, revision, {
        allowAnonymous: true,
      });

      const firstNames = dot<BaseField[]>(captureModel.document, 'properties.firstName');

      const newSaveField = firstNames.find(r => r.revision) as BaseField;
      expect(newSaveField.value).toEqual('Stephen CHANGED');
    });
  });

  test('Remove a field owned by a revision', () => {
    const { store, actions, captureModel, structureId } = captureModelRevisionStoreShorthand(
      `
      firstName
      lastName
    `,
      {
        firstName: 'John',
        lastName: 'Doe',
      }
    );

    // Create the revision
    actions.setRevisionMode({ editMode: true });

    actions.createRevision({
      revisionId: structureId,
      cloneMode: 'EDIT_ALL_VALUES',
    });

    // Update both values.
    actions.updateFieldValue({
      path: [['firstName', captureModel.document.properties.firstName[0].id]],
      value: 'Stephen',
    });
    actions.updateFieldValue({
      path: [['lastName', captureModel.document.properties.lastName[0].id]],
      value: 'Fraser',
    });

    // Save the revision.
    const revision = store.getState().currentRevision;
    invariant(revision, 'Current revision not set.');
    updateRevisionInDocument(captureModel, revision, { allowAnonymous: true });
    captureModel.revisions = captureModel.revisions ? captureModel.revisions : [];
    captureModel.revisions.push(revision.revision);
    const revisionId = revision.revision.id;

    // Reset the store.
    // Setting the updated capture model
    actions.setCaptureModel({ captureModel, initialRevision: revisionId });
    actions.selectRevision({ revisionId: revisionId });

    // If we were to remove one of the values, it would not be possible in UI so it
    // does not need to go further.
    expect(() =>
      actions.removeInstance({
        path: [['firstName', captureModel.document.properties.firstName[0].id]],
      })
    ).toThrowError('Cannot delete last item');
  });

  test('Updating the selector owned by a revision (only selector)', () => {
    const { store, actions, captureModel, structureId } = captureModelRevisionStoreShorthand(
      `
      identifyRegion
    `,
      {},
      {
        withDocument: doc => {
          // Manually add in our selector.
          doc.properties.identifyRegion[0].selector = {
            id: generateId(),
            type: 'box-selector',
            state: null,
          };
          return doc;
        },
      }
    );

    // Create the revision
    actions.setRevisionMode({ editMode: true });

    actions.createRevision({
      revisionId: structureId,
      cloneMode: 'EDIT_ALL_VALUES',
    });

    // Update only selector.
    actions.updateSelector({
      selectorId: captureModel.document.properties.identifyRegion[0].selector!.id,
      state: { x: 25, y: 50, width: 100, height: 200 },
    });

    // Save the revision
    const revision = store.getState().currentRevision;
    invariant(revision, 'Current revision not set.');
    updateRevisionInDocument(captureModel, revision, { allowAnonymous: true });
    captureModel.revisions = captureModel.revisions ? captureModel.revisions : [];
    captureModel.revisions.push(revision.revision);
    const revisionId = revision.revision.id;

    expect(captureModel.document.properties.identifyRegion[0].selector?.state).toEqual(null);
    expect(captureModel.document.properties.identifyRegion[0].selector?.revisedBy).toHaveLength(1);
    expect((captureModel as any).document.properties.identifyRegion[0].selector!.revisedBy[0].state).toEqual({
      x: 25,
      y: 50,
      width: 100,
      height: 200,
    });

    const revisedSelectorId = (captureModel as any).document.properties.identifyRegion[0].selector.revisedBy[0].id;

    // Now reset the store and edit it.
    actions.setCaptureModel({ captureModel, initialRevision: revisionId });
    actions.selectRevision({ revisionId: revisionId });

    actions.updateSelector({
      selectorId: revisedSelectorId,
      state: { x: 50, y: 250, width: 200, height: 400 },
    });

    const revision2 = store.getState().currentRevision;
    invariant(revision2);
    updateRevisionInDocument(captureModel, revision2, { allowAnonymous: true });

    // Check the updated value.
    expect(captureModel.document.properties.identifyRegion[0].selector?.state).toEqual(null);
    expect(captureModel.document.properties.identifyRegion[0].selector?.revisedBy).toHaveLength(1);
    expect((captureModel as any).document.properties.identifyRegion[0].selector!.revisedBy[0].state).toEqual({
      x: 50,
      y: 250,
      width: 200,
      height: 400,
    });
  });

  test('Updating the selector owned by a revision (while editing field, then selector)', () => {
    const { store, actions, captureModel, structureId } = captureModelRevisionStoreShorthand(
      `
      identifyRegion
    `,
      {},
      {
        withDocument: doc => {
          // Manually add in our selector.
          doc.properties.identifyRegion[0].selector = {
            id: generateId(),
            type: 'box-selector',
            state: null,
          };
          return doc;
        },
      }
    );

    // Create the revision
    actions.setRevisionMode({ editMode: true });

    actions.createRevision({
      revisionId: structureId,
      cloneMode: 'EDIT_ALL_VALUES',
    });

    // Edit field...
    actions.updateFieldValue({
      path: [['identifyRegion', captureModel.document.properties.identifyRegion[0].id]],
      value: 'Stephen',
    });

    // And then selector...
    const doc = store.getState().currentRevision!.document;
    actions.updateSelector({
      selectorId: doc.properties.identifyRegion[0].selector!.id,
      state: { x: 50, y: 22, width: 203, height: 404 },
    });

    // Save the revision
    const revision = store.getState().currentRevision;
    invariant(revision, 'Current revision not set.');
    updateRevisionInDocument(captureModel, revision, { allowAnonymous: true });
    captureModel.revisions = captureModel.revisions ? captureModel.revisions : [];
    captureModel.revisions.push(revision.revision);
    const revisionId = revision.revision.id;
    const revisedSelectorId = captureModel.document.properties.identifyRegion[1].selector!.id;

    expect(captureModel.document.properties.identifyRegion[0].selector?.state).toEqual(null);
    expect(captureModel.document.properties.identifyRegion[0].selector?.revisedBy || []).toHaveLength(0);
    expect(captureModel.document.properties.identifyRegion[1].selector?.state).toEqual({
      x: 50,
      y: 22,
      width: 203,
      height: 404,
    });

    // Now reset the store and edit it.
    actions.setCaptureModel({ captureModel, initialRevision: revisionId });
    actions.selectRevision({ revisionId: revisionId });

    actions.updateSelector({
      selectorId: revisedSelectorId,
      state: { x: 50, y: 25, width: 23, height: 104 },
    });

    const revision2 = store.getState().currentRevision;
    invariant(revision2);
    updateRevisionInDocument(captureModel, revision2, { allowAnonymous: true });

    // Check the updated value.
    expect(captureModel.document.properties.identifyRegion[0].selector?.state).toEqual(null);
    expect(captureModel.document.properties.identifyRegion[0].selector?.revisedBy || []).toHaveLength(0);
    expect(captureModel.document.properties.identifyRegion[1].selector?.state).toEqual({
      x: 50,
      y: 25,
      width: 23,
      height: 104,
    });
  });

  test('Adding a new entity owned by a revision', () => {
    const { store, actions, captureModel, structureId } = captureModelRevisionStoreShorthand(
      `
      person.firstName
      person.lastName
    `,
      {
        person: [
          {
            firstName: 'Stephen',
            lastName: 'Fraser',
          },
          {
            firstName: 'Joe',
            lastName: 'Blogs',
          },
        ],
      },
      {
        withDocument(doc) {
          doc.properties.person[0].allowMultiple = true;
          return doc;
        },
        withStructure(structure) {
          if (structure.type === 'model') {
            structure.modelRoot = ['person'];
          }
          return structure;
        },
      }
    );

    // So there are 2 entities.
    // Create the revision
    actions.setRevisionMode({ editMode: true });

    actions.createRevision({
      revisionId: structureId,
      cloneMode: 'FORK_TEMPLATE', // <- important, this uses fork template.
    });

    // Make our edits.
    const person = store.getState().currentRevision!.document.properties.person[0] as CaptureModel['document'];
    actions.updateFieldValue({
      path: [
        ['person', person.id],
        ['firstName', person.properties.firstName[0].id],
      ],
      value: 'Git',
    });
    actions.updateFieldValue({
      path: [
        ['person', person.id],
        ['lastName', person.properties.lastName[0].id],
      ],
      value: 'Hub',
    });

    // Save the revision.
    const revision = store.getState().currentRevision;
    invariant(revision, 'Current revision not set.');
    updateRevisionInDocument(captureModel, revision, { allowAnonymous: true });
    captureModel.revisions = captureModel.revisions ? captureModel.revisions : [];
    captureModel.revisions.push(revision.revision);
    const revisionId = revision.revision.id;

    expect(captureModel.document.properties.person).toHaveLength(3);

    const people = dot<CaptureModel['document'][]>(captureModel.document, 'properties.person');

    const newPerson = people.find(e => e.revision === revisionId);

    invariant(newPerson);

    expect(dot(newPerson, 'properties.firstName.0').value).toEqual('Git');
    expect(dot(newPerson, 'properties.firstName.0').revision).toEqual(revisionId);
    expect(dot(newPerson, 'properties.lastName.0').value).toEqual('Hub');
    expect(dot(newPerson, 'properties.lastName.0').revision).toEqual(revisionId);
  });

  test('Deleting an entity owned by a revision', () => {
    const { store, actions, captureModel, structureId } = captureModelRevisionStoreShorthand(
      `
      person.firstName
      person.lastName
    `,
      {
        person: [
          {
            firstName: 'Stephen',
            lastName: 'Fraser',
          },
          {
            firstName: 'Joe',
            lastName: 'Blogs',
          },
        ],
      },
      {
        withDocument(doc) {
          doc.properties.person[0].allowMultiple = true;
          return doc;
        },
      }
    );

    // So there are 2 entities.
    // Create the revision
    actions.setRevisionMode({ editMode: true });

    actions.createRevision({
      revisionId: structureId,
      cloneMode: 'EDIT_ALL_VALUES', // <- this time we are editing all
    });

    // 1st we want to add 2 new entities.
    actions.createNewEntityInstance({
      path: [],
      property: 'person',
    });
    actions.createNewEntityInstance({
      path: [],
      property: 'person',
    });

    const person1 = store.getState().currentRevision?.document.properties.person[2] as CaptureModel['document'];
    const person2 = store.getState().currentRevision?.document.properties.person[3] as CaptureModel['document'];

    actions.updateFieldValue({
      path: [
        ['person', person1.id],
        ['firstName', person1.properties.firstName[0].id],
      ],
      value: 'Person A',
    });
    actions.updateFieldValue({
      path: [
        ['person', person2.id],
        ['firstName', person2.properties.firstName[0].id],
      ],
      value: 'Person B',
    });

    // Now we save both and reset the store.

    const revision = store.getState().currentRevision;
    invariant(revision, 'Current revision not set.');
    updateRevisionInDocument(captureModel, revision, { allowAnonymous: true });
    captureModel.revisions = captureModel.revisions ? captureModel.revisions : [];
    captureModel.revisions.push(revision.revision);
    const revisionId = revision.revision.id;

    // This time we want to check the order.
    expect(dot(captureModel.document, 'properties.person.0.properties.firstName.0.value')).toEqual('Stephen');
    expect(dot(captureModel.document, 'properties.person.1.properties.firstName.0.value')).toEqual('Joe');
    expect(dot(captureModel.document, 'properties.person.2.properties.firstName.0.value')).toEqual('Person A');
    expect(dot(captureModel.document, 'properties.person.3.properties.firstName.0.value')).toEqual('Person B');

    const personAId = dot(captureModel.document, 'properties.person.2.id');

    // Now we re-import and delete one.
    // Now reset the store and edit it.
    actions.setCaptureModel({ captureModel, initialRevision: revisionId });
    actions.selectRevision({ revisionId: revisionId });

    actions.removeInstance({
      path: [['person', personAId]],
    });

    const revision2 = store.getState().currentRevision;
    invariant(revision2);

    updateRevisionInDocument(captureModel, revision2, { allowAnonymous: true });

    // Now make sure it was deleted.
    expect(dot(captureModel.document, 'properties.person')).toHaveLength(3);
    expect(dot(captureModel.document, 'properties.person.0.properties.firstName.0.value')).toEqual('Stephen');
    expect(dot(captureModel.document, 'properties.person.1.properties.firstName.0.value')).toEqual('Joe');
    expect(dot(captureModel.document, 'properties.person.2.properties.firstName.0.value')).toEqual('Person B');
  });

  test('Updating a selector owned by an entity', () => {
    const { store, actions, captureModel, structureId } = captureModelRevisionStoreShorthand(
      `
      person.firstName
      person.lastName
    `,
      {
        person: [
          {
            firstName: 'Stephen',
            lastName: 'Fraser',
          },
          {
            firstName: 'Joe',
            lastName: 'Blogs',
          },
        ],
      },
      {
        withDocument(doc) {
          doc.properties.person[0].selector = {
            id: generateId(),
            type: 'box-selector',
            state: null,
          };
          doc.properties.person[0].allowMultiple = true;
          return doc;
        },
      }
    );

    // So there are 2 entities.
    // Create the revision
    actions.setRevisionMode({ editMode: true });

    actions.createRevision({
      revisionId: structureId,
      cloneMode: 'EDIT_ALL_VALUES', // <- this time we are editing all
    });

    actions.createNewEntityInstance({
      path: [],
      property: 'person',
    });

    // Update a selector.
    const person1 = dot<CaptureModel['document']>(store.getState().currentRevision, 'document.properties.person.2');
    actions.updateSelector({
      selectorId: person1.selector!.id,
      state: { x: 25, y: 50, width: 100, height: 200 },
    });

    // Save model
    const revision = store.getState().currentRevision;
    invariant(revision, 'Current revision not set.');
    updateRevisionInDocument(captureModel, revision, { allowAnonymous: true });
    captureModel.revisions = captureModel.revisions ? captureModel.revisions : [];
    captureModel.revisions.push(revision.revision);
    const revisionId = revision.revision.id;

    expect(dot(captureModel.document, 'properties.person.2.selector.state')).toEqual({
      x: 25,
      y: 50,
      width: 100,
      height: 200,
    });

    // Reimport it, and edit it.
    actions.setCaptureModel({ captureModel, initialRevision: revisionId });
    actions.selectRevision({ revisionId: revisionId });

    actions.updateSelector({
      selectorId: person1.selector!.id,
      state: { x: 250, y: 500, width: 1000, height: 2000 },
    });

    const revision2 = store.getState().currentRevision;
    invariant(revision2);

    updateRevisionInDocument(captureModel, revision2, { allowAnonymous: true });

    expect(dot(captureModel.document, 'properties.person.2.selector.state')).toEqual({
      x: 250,
      y: 500,
      width: 1000,
      height: 2000,
    });
  });
});
