export class HmiError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'HmiError';
    this.statusCode = statusCode;
  }
}
