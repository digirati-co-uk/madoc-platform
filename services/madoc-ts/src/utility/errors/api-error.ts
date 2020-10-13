export class ApiError extends Error {
  constructor(message: string, response?: any) {
    super(message);
    this.response = response;

    if (response && response.debugResponse && response.debugResponse.json) {
      this.jsonError = response.debugResponse.json();
    }
  }
  response: any | undefined;
  jsonError: any | undefined;
}
