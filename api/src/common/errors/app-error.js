export class AppError extends Error {
  constructor(statusCode, code, message, { details, cause, expose = statusCode < 500 } = {}) {
    super(message, { cause });
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.expose = expose;
  }

  static internal(cause) {
    return new AppError(500, 'INTERNAL_ERROR', 'Unexpected application error', { cause });
  }
}
