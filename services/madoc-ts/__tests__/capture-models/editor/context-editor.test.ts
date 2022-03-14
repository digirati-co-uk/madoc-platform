/**
 * @jest-environment jsdom
 */

import {
  addContext,
  addDefaultContext,
  removeContext,
  removeDefaultContext,
} from '../../../src/frontend/shared/capture-models/editor/core/context-editor';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

describe('document editor', () => {
  const emptyModel: CaptureModel = {
    structure: {
      id: '1',
      label: '',
      type: 'model',
      fields: [],
    },
    document: {
      id: '2',
      type: 'entity',
      label: 'untitled entity',
      properties: {},
    },
  };

  describe('addDefaultContext', () => {
    test('add context to empty model', () => {
      const result = addDefaultContext(emptyModel, 'http://example.org/context');

      expect(result).toEqual({
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': 'http://example.org/context',
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      });
    });

    test('it throws when default context already exists', () => {
      const result = addDefaultContext(emptyModel, 'http://example.org/context/1');

      expect(() => addDefaultContext(result, 'http://example.org/context/2')).toThrowErrorMatchingInlineSnapshot(
        `"Cannot add default context, context already exists"`
      );
    });

    test('it throws when default context already exists (2)', () => {
      const result: CaptureModel = {
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': { '@vocab': 'http://example.org/context/1' },
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };

      expect(() => addDefaultContext(result, 'http://example.org/context/2')).toThrowErrorMatchingInlineSnapshot(
        `"Cannot add default context, context already exists"`
      );
    });

    test('it allows the same default context to be added', () => {
      const result = addDefaultContext(emptyModel, 'http://example.org/context/1');

      expect(addDefaultContext(result, 'http://example.org/context/1')).toEqual({
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': { '@vocab': 'http://example.org/context/1' },
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      });
    });

    test('it allows the same default context to be added (using @vocab)', () => {
      const result: CaptureModel = {
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': { '@vocab': 'http://example.org/context/1' },
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };

      expect(addDefaultContext(result, 'http://example.org/context/1')).toEqual({
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': { '@vocab': 'http://example.org/context/1' },
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      });
    });
  });

  describe('addContext', () => {
    test('you can add context to empty model', () => {
      const result = addContext(emptyModel, 'http://example.org/context/3', 'c1');

      expect(result.document['@context']).toEqual({
        c1: 'http://example.org/context/3',
      });
    });

    test('you can add multiple contexts', () => {
      const c1 = addContext(emptyModel, 'http://example.org/context/1', 'c1');

      const c2 = addContext(c1, 'http://example.org/context/2', 'c2');

      expect(c2.document['@context']).toEqual({
        c1: 'http://example.org/context/1',
        c2: 'http://example.org/context/2',
      });
    });

    test('it throws if you add the same alias twice', () => {
      const c1 = addContext(emptyModel, 'http://example.org/context/1', 'c1');

      expect(() => addContext(c1, 'http://example.org/context/2', 'c1')).toThrowErrorMatchingInlineSnapshot(
        `"Cannot add context c1, context already exists (http://example.org/context/1)"`
      );
    });

    test('it can add when default context exists', () => {
      const c1 = addDefaultContext(emptyModel, 'http://example.org/context/1');

      const c2 = addContext(c1, 'http://example.org/context/2', 'c2');

      expect(c2.document['@context']).toEqual({
        '@vocab': 'http://example.org/context/1',
        c2: 'http://example.org/context/2',
      });
    });

    test('it can add when default context exists (string)', () => {
      const c1: CaptureModel = {
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': 'http://example.org/context/1',
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };

      const c2 = addContext(c1, 'http://example.org/context/2', 'c2');

      expect(c2.document['@context']).toEqual({
        '@vocab': 'http://example.org/context/1',
        c2: 'http://example.org/context/2',
      });
    });
  });

  describe('removeContext', () => {
    test('removing non-existent context', () => {
      const c1: CaptureModel = {
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': {
            '@vocab': 'http://example.org/context/1',
            c2: 'http://example.org/context/2',
          },
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };

      expect(removeContext(c1, 'c1').document['@context']).toEqual({
        '@vocab': 'http://example.org/context/1',
        c2: 'http://example.org/context/2',
      });
    });

    test('removing non-existent context (string)', () => {
      const c1: CaptureModel = {
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': 'http://example.org/context/1',
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };

      expect(removeContext(c1, 'c1').document['@context']).toEqual('http://example.org/context/1');
    });

    test('removing non-existent context (undefined)', () => {
      const c1: CaptureModel = {
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };

      expect(removeContext(c1, 'c1').document['@context']).not.toBeDefined();
    });

    test('removing existing context', () => {
      const c1: CaptureModel = {
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': {
            '@vocab': 'http://example.org/context/1',
            c2: 'http://example.org/context/2',
          },
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };
      expect(removeContext(c1, 'c2').document['@context']).toEqual({
        '@vocab': 'http://example.org/context/1',
      });
    });

    test('removing last context', () => {
      const c1: CaptureModel = {
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': {
            c2: 'http://example.org/context/2',
          },
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };
      expect(removeContext(c1, 'c2').document['@context']).toEqual({});
    });
  });

  describe('removeDefaultContext', () => {
    test('remove default context', () => {
      const c1: CaptureModel = {
        structure: {
          id: '1',
          label: '',
          type: 'model',
          fields: [],
        },
        document: {
          id: '2',
          '@context': {
            '@vocab': 'http://example.org/context/2',
            c1: 'http://example.org/context/1',
          },
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };
      expect(removeDefaultContext(c1).document['@context']).toEqual({
        c1: 'http://example.org/context/1',
      });
    });

    test('remove default context (string)', () => {
      const c1: CaptureModel = {
        structure: { id: '1', label: '', type: 'model', fields: [] },
        document: {
          id: '2',
          '@context': 'http://example.org/context/2',
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };
      expect(removeDefaultContext(c1).document['@context']).not.toBeDefined();
    });

    test('remove default context (non-existent)', () => {
      const c1: CaptureModel = {
        structure: { id: '1', label: '', type: 'model', fields: [] },
        document: {
          id: '2',
          '@context': { c2: 'http://example.org/context/2' },
          type: 'entity',
          label: 'untitled entity',
          properties: {},
        },
      };
      expect(removeDefaultContext(c1)).toEqual(c1);
    });
  });
});
