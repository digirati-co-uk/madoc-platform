import fetch from 'node-fetch';
import type { Response } from 'node-fetch';

export async function fetchIiifResource(
  url: string,
  {
    attempts = 3,
    retryDelay = 1000,
    timeout = 30000,
  }: { attempts?: number; retryDelay?: number; timeout?: number } = {}
): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    let response: Response | undefined;
    try {
      response = await fetch(url, { timeout });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    if (response) {
      if (response.ok) {
        return await response.text();
      }

      lastError = new Error(`Unable to fetch IIIF resource: ${response.status} ${response.statusText}`);
      if (response.status !== 408 && response.status !== 429 && response.status < 500) {
        throw lastError;
      }
    }

    if (attempt < attempts) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  throw lastError || new Error(`Unable to fetch IIIF resource: ${url}`);
}
