require('dotenv').config({ quiet: true });
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const express = require('express');
const session = require('express-session');
const { createTriviaService } = require('./services/trivia-service');
const createQuizRouter = require('./routes/quiz-routes');
const requestLogger = require('./middleware/request-logger');
const { notFound, errorHandler } = require('./middleware/error-handler');

// A factory lets integration tests supply a simulated API without changing app code.
function createApp({ triviaService = createTriviaService() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.locals.year = new Date().getFullYear();

  app.use(requestLogger);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: false, limit: '20kb' }));
  app.use(session({
    name: 'quizforge.sid',
    secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 2 * 60 * 60 * 1000 }
  }));

  app.use(createQuizRouter(triviaService));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('PORT must be an integer between 1 and 65535.');
    process.exitCode = 1;
  } else {
    createApp().listen(port, () => {
      console.log(`QuizForge is ready at http://localhost:${port}`);
    }).on('error', (error) => {
      console.error(`Could not start QuizForge: ${error.message}`);
      process.exitCode = 1;
    });
  }
}

module.exports = { createApp };
