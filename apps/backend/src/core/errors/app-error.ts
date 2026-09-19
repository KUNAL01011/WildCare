export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);

    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, AppError);
  }
}