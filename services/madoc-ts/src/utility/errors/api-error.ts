interface ApiErrorResponse {
  status?: number;
  statusText?: string;
  url?: string;
}

export class ApiError extends Error {
  constructor(message: string, response?: ApiErrorResponse) {
    const status = response?.status
      ? `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`
      : '';
    const path = response?.url ? new URL(response.url).pathname : '';
    const details = [status, path].filter(Boolean).join(' · ');

    super(details ? `${message} (${details})` : message);
    this.response = response;
  }

  response: ApiErrorResponse | undefined;
}
