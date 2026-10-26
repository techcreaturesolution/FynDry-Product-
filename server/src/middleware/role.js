import ApiError from '../utils/ApiError.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required before checking role permissions'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Forbidden: User role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export default authorize;
