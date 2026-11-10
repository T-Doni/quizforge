class AppError extends Error {
  constructor(message, statusCode = 500, retryAfter = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
    this.isOperational = true;
  }
}

module.exports = AppError;
