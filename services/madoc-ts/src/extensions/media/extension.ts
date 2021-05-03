import { stringify } from 'query-string';
import { ApiClient } from '../../gateway/api';
import { CreateMediaRow, MediaItem, MediaListResponse } from '../../types/media';
import { BaseExtension } from '../extension-manager';

async function getImageDimensions(file: File): Promise<{ height: number; width: number }> {
  return new Promise(resolve => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = function() {
      resolve({
        width: image.width,
        height: image.height,
      });
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });
}

export class MediaExtension implements BaseExtension {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async createMedia(file: File) {
    // Step 0 - Validation.
    if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
      throw new Error('Unsupported file type');
    }
    if (file.size > 5000000 /* 5 mb */) {
      throw new Error('Image too large');
    }

    const { width, height } = await getImageDimensions(file);

    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    // @todo Step 1 - create metadata.
    const media = await this.createMediaRecord({
      source: 'upload',
      size: file.size,
      ingester: 'upload-widget',
      extension,
      renderer: 'image',
      displayName: file.name,
      hashtags: [],
      fileName: file.name,
      thumbnails: {},
      metadata: {
        width,
        height,
      },
    });

    // Step 2 - Upload media to correct location from metadata.
    try {
      const id = media.id;
      const data = new FormData();
      data.append('image', file);
      await this.api.request(`/api/storage/data/media/public/${id}/${media.fileName}`, {
        method: 'POST',
        body: data,
        formData: true,
      });

      await this.generateThumbnails(media.id, [256, 512]);

      return media;
    } catch (err) {
      // Upload failed.
      // @todo delete media record or mark as failed?
      throw new Error('Upload failed');
    }
  }

  async listMedia(page = 1) {
    return this.api.request<MediaListResponse>(`/api/madoc/media?${stringify({ page })}`);
  }

  async getMedia(id: string) {
    return this.api.request<{ media: MediaItem }>(`/api/madoc/media/${id}`);
  }

  async deleteMedia(id: string) {
    return this.api.request<void>(`/api/madoc/media/${id}`, {
      method: 'DELETE',
    });
  }

  async generateThumbnails(id: string, sizes: number[]) {
    return this.api.request<MediaItem>(`/api/madoc/media/${id}/generate-thumbnails`, {
      method: 'POST',
      body: { sizes },
    });
  }

  async createMediaRecord(mediaRequest: CreateMediaRow) {
    return await this.api.request<MediaItem>(`/api/madoc/media`, {
      method: 'POST',
      body: mediaRequest,
    });
  }

  async listBucket(bucketName: string, path: string | string[]) {
    const fullPath = Array.isArray(path) ? path.join('/') : path;

    return this.api.request(`/api/storage/list/${bucketName}/${fullPath}`);
  }
}
