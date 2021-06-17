export class ReactServerError {
  name: string;
  message: string;
  stack?: string;
  constructor(e: Error) {
    this.name = e.name;
    this.message = e.message;
    this.stack = e.stack;
  }
}
