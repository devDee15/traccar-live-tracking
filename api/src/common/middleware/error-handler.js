import { AppError } from '../errors/app-error.js';
import { ZodError } from 'zod';

function normalizeError(error) {
  if (error?.name === 'ValidationError') {
    return new AppError(400, 'PERSISTENCE_VALIDATION_ERROR', 'Stored data validation failed', {
      details: Object.values(error.errors || {}).map(({ path, message }) => ({ path, message })),
    });
  }
  if (error?.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) {
    return new AppError(400, 'VALIDATION_ERROR', 'Data validation failed', {
      details: error.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
    });
  }
  if (error?.name === 'CastError')
    return new AppError(400, 'INVALID_IDENTIFIER', 'Invalid identifier');
  if (error?.code === 11000)
    return new AppError(409, 'DUPLICATE_RESOURCE', 'Resource already exists');
  return AppError.internal(error);
}

export function notFoundHandler(request, response, next) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${request.method} ${request.path} not found`));
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const appError = normalizeError(error);

  request.log?.[appError.statusCode >= 500 ? 'error' : 'warn'](
    { err: error, code: appError.code },
    appError.message,
  );

  response.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.expose ? appError.message : 'Internal server error',
      details: appError.expose ? appError.details : undefined,
      requestId: request.id,
    },
  });
}
