export interface StaticPageStreamResponse {
  stream: NodeJS.ReadableStream;
  contentType?: string;
}

export type StaticPageResponse = string | StaticPageStreamResponse;
