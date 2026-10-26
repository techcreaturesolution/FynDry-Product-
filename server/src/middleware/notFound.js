import ApiError from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Resource not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;
