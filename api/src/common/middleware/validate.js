import { AppError } from '../errors/app-error.js';

export function validate(schema) {
  return function validationMiddleware(request, response, next) {
    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      next(
        new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', {
          details: result.error.issues.map(({ path, message }) => ({
            path: path.join('.'),
            message,
          })),
        }),
      );
      return;
    }

    request.validated = result.data;
    next();
  };
}
