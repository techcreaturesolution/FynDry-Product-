import ApiError from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      if (!schema) return next();
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.') || source,
          message: e.message,
        }));
        return next(new ApiError(400, 'Validation failed', formattedErrors));
      }
      return next(new ApiError(400, err.message || 'Invalid input data'));
    }
  };
};

export default validate;
