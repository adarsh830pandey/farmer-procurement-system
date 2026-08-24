/**
 * Middleware to handle 404 (Not Found) routes
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global centralized error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // If status code is 200 (default ok), change to 500 (internal server error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only include stack trace in development mode for easier debugging
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
