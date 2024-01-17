import {
  FixedSizeImage,
  FixedSizeImageService,
  UnknownSizeImage,
  VariableSizeImage,
} from '@atlas-viewer/iiif-image-api';
import { createThumbnailHelper } from '@iiif/helpers/thumbnail';
import * as path from 'path';
import { MANIFESTS_PATH } from '../../paths';
import { BaseTask } from './base-task';
import mkdirp from 'mkdirp';
import { promises, existsSync } from 'fs';
import cache from 'memory-cache';
import { Vault } from '@iiif/helpers/vault';
import { Manifest } from '@iiif/presentation-3';
import { CanvasNormalized, ManifestNormalized } from '@iiif/presentation-3-normalized';
import { createHash } from 'crypto';
const { readFile, writeFile } = promises;
import fetch from 'node-fetch';

// @ts-ignore
global.fetch = fetch;

export const STATUS = {
  NOT_STARTED: 0,
  ACCEPTED: 1,
  IN_PROGRESS: 2,
  DONE: 3,
};

export function changeStatus<Task extends BaseTask>(
  availableStatuses: any,
  newStatus: string,
  data: { state?: any; name?: string; description?: string } = {}
): Partial<Task> {
  const statusIdx = availableStatuses.indexOf(newStatus);

  return {
    status: statusIdx,
    status_text: statusIdx === -1 ? 'error' : availableStatuses[statusIdx],
    ...data,
  } as Partial<Task>;
}

export async function saveManifestToDisk(idHash: string, content: string) {
  await mkdirp(path.join(MANIFESTS_PATH, `/${idHash}`));
  const fileLocation = path.join(MANIFESTS_PATH, `/${idHash}/manifest.json`);
  if (!existsSync(fileLocation)) {
    await writeFile(path.join(MANIFESTS_PATH, `/${idHash}/manifest.json`), Buffer.from(content));
  }
  return fileLocation;
}

export function loadFileWithRetries(file: string): Promise<string> {
  if (!existsSync(file)) {
    throw new Error('File does not exist');
  }

  function doLoad() {
    return readFile(file, { encoding: 'utf-8' }).then(data => {
      return data.toString();
    });
  }

  let maxTries = 5;

  while (maxTries > 0) {
    try {
      return doLoad();
    } catch (e) {
      maxTries--;
    }
  }

  throw new Error(`File ${file} could not be opened`);
}

export function manifestHash(manifestId: string) {
  return createHash('sha1').update(manifestId).digest('hex');
}

export async function loadManifest(file: string) {
  const fileFromCache = cache.get(file);
  if (fileFromCache) {
    const file1 = JSON.parse(fileFromCache);
    const file2 = JSON.parse(fileFromCache);
    return [file1, file2];
  }

  const manifestJson = await loadFileWithRetries(file);

  cache.put(file, manifestJson, 30 * 60 * 1000); // 30 minutes cache a manifest.
  const file1 = JSON.parse(manifestJson);
  const file2 = JSON.parse(manifestJson);

  return [file1, file2];
}

export function sharedVault(manifestId: string): Vault {
  const oldVault = cache.get(`vault:${manifestHash(manifestId)}`);
  if (oldVault) {
    return oldVault;
  }

  const vault = new Vault();
  cache.put(`vault:${manifestHash(manifestId)}`, vault, 10 * 60 * 1000); // 10 minutes cache for vault.
  return vault;
}

export async function getThumbnail(
  vault: Vault,
  canvas: any
): Promise<null | undefined | FixedSizeImage | FixedSizeImageService | VariableSizeImage | UnknownSizeImage> {
  const sizes = [512, 256, 768, 1024];

  const { getBestThumbnailAtSize } = createThumbnailHelper(vault);

  for (const size of sizes) {
    try {
      const { best } = await getBestThumbnailAtSize(
        canvas,
        {
          maxWidth: size,
          maxHeight: size,
          explain: false,
        } as any,
        true
      );
      if (best) {
        return best;
      }
    } catch (e) {
      console.log(e);
      // do nothing.
    }
  }

  return undefined;
}

export async function ensureManifestLoaded(vault: Vault, manifestId: string, manifestJson: any) {
  const state = vault.getState();

  const manifestJsonId = manifestJson['@id'] ? manifestJson['@id'] : manifestJson.id;

  if (state.iiif.requests[manifestId]) {
    let times = 0;
    if (state.iiif.requests[manifestId].loadingState === 'RESOURCE_LOADING') {
      while (times < 10) {
        if (state.iiif.requests[manifestId].loadingState === 'RESOURCE_LOADING') {
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          break;
        }
        times++;
      }
    }
    if (state.iiif.requests[manifestId].loadingState === 'RESOURCE_ERROR') {
      // I don't know? Try again?
      await vault.loadManifest(manifestJsonId, manifestJson);
    }
  } else if (!state.iiif.entities.Manifest[manifestJsonId]) {
    await vault.loadManifest(manifestJsonId, manifestJson).catch(err => {
      console.log(err);
    });
  }
}

export function getCanvasFromManifest(manifest: any, canvasId: string) {
  try {
    if (manifest.sequences) {
      for (const seq of manifest.sequences) {
        if (seq.canvases) {
          for (const canvas of seq.canvases) {
            const id = canvas.id ? canvas.id : canvas['@id'] ? canvas['@id'] : undefined;
            if (id && decodeURI(id) === decodeURI(canvasId)) {
              return canvas;
            }
          }
        }
      }
    }
    if (manifest.items) {
      const p3Manifest = manifest as Manifest;
      for (const canvas of p3Manifest.items) {
        if (canvas.id === canvasId) {
          return canvas;
        }
      }
    }
  } catch (err) {
    return undefined;
  }
  return undefined;
}

export async function tryGetManifest(manifestId: string, pathToManifest: string, canvasId: string) {
  async function doGet() {
    const [manifestJson, unmodifiedManifest] = await loadManifest(pathToManifest);
    const vault = sharedVault(manifestId);

    await ensureManifestLoaded(vault, manifestId, manifestJson);

    const manifest = vault.get<ManifestNormalized>({ id: manifestId, type: 'Manifest' });
    const ref: { id: string; type: 'Canvas' } = { id: canvasId, type: 'Canvas' };
    // @todo handle case where canvas does not exist.
    const canvas = vault.get<CanvasNormalized>(ref);
    if (Object.keys(canvas).length === 2) {
      throw new Error('Could not load manifest from vault.');
    }

    return { manifest, unmodifiedManifest, canvas, vault };
  }

  let maxTries = 5;
  let returnManifest;
  while (maxTries > 0) {
    try {
      returnManifest = await doGet();
      if (returnManifest) {
        break;
      }
    } catch (err) {
      // do nothing.
      maxTries--;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (returnManifest) {
    return returnManifest;
  }

  throw new Error('Could not load manifest from vault after 5 tries');
}
