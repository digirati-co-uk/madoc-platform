import { BaseTask } from './base-task';
import mkdirp from 'mkdirp';
import { existsSync, readFile, writeFileSync } from 'fs';
import cache from 'memory-cache';
import { Vault } from '@hyperion-framework/vault';
import { CanvasNormalized, Manifest, ManifestNormalized } from '@hyperion-framework/types';
import { createHash } from 'crypto';

// @ts-ignore
global.fetch = require('node-fetch');

export const STATUS = {
  NOT_STARTED: 0,
  ACCEPTED: 1,
  IN_PROGRESS: 2,
  DONE: 3,
};

export const fileDirectory = process.env.OMEKA_FILE_DIRECTORY || '/home/node/app/omeka-files';

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

export function saveManifestToDisk(idHash: string, content: string) {
  mkdirp.sync(`${fileDirectory}/original/madoc-manifests/${idHash}`);
  const fileLocation = `${fileDirectory}/original/madoc-manifests/${idHash}/manifest.json`;
  if (!existsSync(fileLocation)) {
    writeFileSync(`${fileDirectory}/original/madoc-manifests/${idHash}/manifest.json`, Buffer.from(content));
  }
  return fileLocation;
}

export function loadFileWithRetries(file: string): Promise<string> {
  if (!existsSync(file)) {
    throw new Error('File does not exist');
  }

  function doLoad() {
    return new Promise<string>((resolve, reject) => {
      readFile(file, { encoding: 'utf-8' }, (err, data) => {
        if (err) reject(err);
        resolve(data.toString());
      });
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

export async function loadManifest(file: string) {
  const fileFromCache = cache.get(file);
  if (fileFromCache) {
    const file1 = JSON.parse(fileFromCache);
    const file2 = JSON.parse(fileFromCache);
    return [file1, file2];
  }

  const manifestJson = await loadFileWithRetries(file);

  cache.put(file, manifestJson, 300); // 5 minutes cache a manifest.
  const file1 = JSON.parse(manifestJson);
  const file2 = JSON.parse(manifestJson);

  return [file1, file2];
}

export function sharedVault(manifestId: string): Vault {
  const oldVault = cache.get(`vault:${manifestId}`);
  if (oldVault) {
    return oldVault;
  }

  const vault = new Vault();
  cache.put(`vault:${manifestId}`, vault, 600); // 10 minutes cache for vault.
  return vault;
}

export function writeCanvasToDisk(idHash: string, content: any, canvasOrder: number) {
  mkdirp.sync(`${fileDirectory}/original/madoc-manifests/${idHash}/canvases/`);
  const fileLocation = `${fileDirectory}/original/madoc-manifests/${idHash}/canvases/c${canvasOrder}.json`;
  if (!existsSync(fileLocation)) {
    writeFileSync(fileLocation, Buffer.from(JSON.stringify(content)));
  }
  return fileLocation;
}

export async function getThumbnail(vault: Vault, canvas: any) {
  const sizes = [256, 512, 768, 1024];

  for (const size of sizes) {
    try {
      const { best, log } = await vault.getThumbnail(
        canvas,
        {
          maxWidth: size,
          maxHeight: size,
          explain: true,
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

  if (state.hyperion.requests[manifestId]) {
    // console.log('-> Found manifest');
    let times = 0;
    if (state.hyperion.requests[manifestId].loadingState === 'RESOURCE_LOADING') {
      while (times < 10) {
        if (state.hyperion.requests[manifestId].loadingState === 'RESOURCE_LOADING') {
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          break;
        }
        times++;
      }
    }
    if (state.hyperion.requests[manifestId].loadingState === 'RESOURCE_ERROR') {
      // console.log('-> Did errored manifest');
      // I don't know? Try again?
      await vault.loadManifest(manifestJsonId, manifestJson);
    }
  } else if (!state.hyperion.entities.Manifest[manifestJsonId]) {
    // console.log('-> Did not find manifest');
    await vault.loadManifest(manifestJsonId, manifestJson).catch(err => {
      // console.log(err);
    });
  }
}

export function getCanvasFromManifest(manifest: any, canvasId: string) {
  try {
    if (manifest.sequences) {
      for (const seq of manifest.sequences) {
        if (seq.canvases) {
          for (const canvas of seq.canvases) {
            if ((canvas.id && canvas.id === canvasId) || (canvas['@id'] && canvas['@id'] === canvasId)) {
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

export function manifestHash(manifestId: string) {
  return createHash('sha1')
    .update(manifestId)
    .digest('hex');
}

export async function tryGetManifest(manifestId: string, pathToManifest: string, canvasId: string) {
  async function doGet() {
    const [manifestJson, unmodifiedManifest] = await loadManifest(pathToManifest);
    const vault = sharedVault(manifestId);

    await ensureManifestLoaded(vault, manifestId, manifestJson);

    const manifest = vault.fromRef<ManifestNormalized>({ id: manifestId, type: 'Manifest' });
    const ref: { id: string; type: 'Canvas' } = { id: canvasId, type: 'Canvas' };
    // @todo handle case where canvas does not exist.
    const canvas = vault.fromRef<CanvasNormalized>(ref);
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
      console.log(err);
      // do nothing.
      maxTries--;
    }
  }

  if (returnManifest) {
    return returnManifest;
  }
  throw new Error('Could not load manifest from vault after 5 tries');
}
