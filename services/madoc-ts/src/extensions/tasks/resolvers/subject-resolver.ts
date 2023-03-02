import { InternationalString } from '@iiif/presentation-3';
import { ApiClient } from '../../../gateway/api';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { parseUrn } from '../../../utility/parse-urn';
import { Resolver } from './resolver';

export type SubjectSnippet = {
  id: number;
  type: 'canvas' | 'manifest' | 'collection';
  label: InternationalString;
  thumbnail?: string | null;
  itemsTotal?: number;
  parent?: SubjectSnippet;
};

export class SubjectResolver implements Resolver<'subject', SubjectSnippet> {
  api: ApiClient;
  constructor(api: ApiClient) {
    this.api = api;
  }

  getKey() {
    return 'subject' as const;
  }

  hasMetadata(task: BaseTask) {
    const metadata = task.metadata;

    if (!metadata) {
      return false;
    }

    if (typeof metadata.subject === 'undefined') {
      return false;
    }

    if (task.type === 'search-index-task' || task.type === 'madoc-canvas-import') {
      return true; // Don't support these.
    }

    if (typeof metadata.subject === null) {
      return true; // Has been processed.
    }

    const subject = metadata.subject;
    const parsed = task.subject ? parseUrn(task.subject) : null;

    if (!parsed || ['canvas', 'manifest', 'collection'].indexOf(parsed.type) === -1) {
      return true; // Nothing to get.
    }

    if (subject.id !== parsed.id) {
      return false; // Needs refreshed.
    }

    // Otherwise it should be up to date.
    return true;
  }

  async resolve(task: BaseTask) {
    try {
      const subject = await this.resolveSubject(task.subject);

      if (subject && task.subject_parent) {
        subject.parent = await this.resolveSubject(task.subject_parent);
      }

      return subject;
    } catch (e) {
      return undefined;
    }
  }

  async resolveSubject(subject: string): Promise<SubjectSnippet | undefined> {
    const parsed = parseUrn(subject);

    if (!parsed) {
      return undefined;
    }

    switch (parsed.type) {
      case 'canvas': {
        // Check for manifest too.
        const { canvas } = await this.api.getCanvasById(parsed.id);
        const thumbnail = canvas && canvas.thumbnail && canvas.thumbnail[0] ? canvas.thumbnail[0].id : undefined;

        return {
          id: canvas.id,
          type: 'canvas',
          label: canvas.label,
          thumbnail,
        };
      }
      case 'manifest': {
        // Check for manifest too.
        const { manifest, pagination } = await this.api.getManifestById(parsed.id);

        return {
          id: manifest.id,
          type: 'manifest',
          label: manifest.label,
          thumbnail: manifest.thumbnail,
          itemsTotal: pagination.totalResults,
        };
      }
      case 'collection': {
        // Check for manifest too.
        const { collection, pagination } = await this.api.getCollectionById(parsed.id);

        return {
          id: collection.id,
          type: 'collection',
          label: collection.label,
          thumbnail: collection.thumbnail,
          itemsTotal: pagination.totalResults,
        };
      }
    }
  }
}
