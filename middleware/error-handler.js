const AppError = require('../utils/app-error');

function notFound(req, res, next) {
  next(new AppError('This page is not part of the quiz. Head home to start a new round.', 404));
}

// Four arguments identify an Express error-handling middleware.
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.statusCode || error.status || 500;
  if (status >= 500) console.error(error);
  const headings = {
    400: 'Let’s check that request.',
    404: 'A question mark of a page.',
    409: 'Time for a fresh round.',
    413: 'That is a little too much data.',
    422: 'Try a different combination.',
    429: 'A quick breather.',
    502: 'The questions took a wrong turn.',
    503: 'The question bank is taking a break.',
    504: 'That took longer than expected.'
  };
  const message = error.isOperational ? error.message :
    status === 413 ? 'Please submit the quiz using the form provided.' :
      status === 400 ? 'We could not read that request. Please return to the quiz form.' :
        'Something unexpected happened. Please return home and try again.';
  if (error.retryAfter) res.set('Retry-After', String(error.retryAfter));
  res.status(status).render('error', {
    title: 'A small detour', page: '', status,
    heading: headings[status] || 'A small detour.', message,
    retryAfter: error.retryAfter || null
  });
}

module.exports = { notFound, errorHandler };
