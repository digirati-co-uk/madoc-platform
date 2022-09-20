// @ts-ignore
import deepmerge from 'deepmerge';
import invariant from 'tiny-invariant';
import { filterModelGetOptions } from '../../../src/capture-model-server/server-filters/filter-model-get-options';
import { CaptureModelGetOptions } from '../../../src/capture-model-server/types';
import { traverseDocument } from '../../../src/frontend/shared/capture-models/helpers/traverse-document';
// @ts-ignore
import fixture1 from './fixtures/example-1.json';

describe('filter capture model', () => {
  test.each([1, 2])('filtering user revisions (user: %s)', userId => {
    // This is what a request from a user will produce.
    const options: CaptureModelGetOptions = {
      showAllRevisions: false,
      userId,
      includeCanonical: false,
    };

    const newModel = filterModelGetOptions(deepmerge({}, fixture1 as any), options);

    const drafts =
      newModel.revisions
        ?.filter(r => !r.approved && (r.authors || []).indexOf(`urn:madoc:user:${options.userId}`) === -1)
        .map(r => r.id) || [];

    // In this model I know that non of the revisions are approved and should all be hidden.
    traverseDocument(newModel.document, {
      visitField(field) {
        invariant(
          !field.revision || drafts.indexOf(field.revision) === -1,
          `Revision ${field.revision} should not be visible to user(${userId})`
        );
      },
      visitEntity(entity) {
        invariant(
          !entity.revision || drafts.indexOf(entity.revision) === -1,
          `Revision ${entity.revision} should not be visible to user ${userId}`
        );
      },
    });

    const invalidRevisions = (newModel.revisions || [])
      .filter(r => {
        return r.authors && r.authors.indexOf(`urn:madoc:user:${options.userId}`) === -1 && !r.approved;
      })
      .map(r => r.id);

    invariant(
      invalidRevisions.length === 0,
      `Found ${invalidRevisions.length} invalid revisions (${invalidRevisions.join(',')})`
    );
  });

  test.each([
    [1, 'draft'],
    [1, 'accepted'],
    [1, 'submitted'],
    [2, 'draft'],
    [2, 'accepted'],
    [2, 'submitted'],
  ])('filtering statues (user: %s, status: %s)', (userId, status) => {
    // This is what a request from a user will produce.
    const options: CaptureModelGetOptions = {
      showAllRevisions: false,
      userId,
      includeCanonical: false,
      revisionStatus: status,
    };

    const newModel = filterModelGetOptions(deepmerge({}, fixture1 as any), options);

    const invalidRevisionIds =
      newModel.revisions
        ?.filter(r => {
          return (
            !r.approved &&
            (r.authors || []).indexOf(`urn:madoc:user:${options.userId}`) === -1 &&
            r.status !== options.revisionStatus
          );
        })
        .map(r => r.id) || [];

    // In this model I know that non of the revisions are approved and should all be hidden.
    traverseDocument(newModel.document, {
      visitField(field) {
        invariant(
          !field.revision || invalidRevisionIds.indexOf(field.revision) === -1,
          `Revision ${field.revision} should not be visible to user(${userId})`
        );
      },
      visitEntity(entity) {
        invariant(
          !entity.revision || invalidRevisionIds.indexOf(entity.revision) === -1,
          `Revision ${entity.revision} should not be visible to user ${userId}`
        );
      },
    });

    const invalidRevisions = (newModel.revisions || [])
      .filter(r => {
        return invalidRevisionIds.indexOf(r.id) !== -1;
      })
      .map(r => r.id);

    invariant(
      invalidRevisions.length === 0,
      `Found ${invalidRevisions.length} invalid revisions (${invalidRevisions.join(',')})`
    );
  });
});
