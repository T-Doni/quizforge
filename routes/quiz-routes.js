const express = require('express');
const createQuizController = require('../controllers/quiz-controller');
const validateSettings = require('../middleware/validate-settings');

module.exports = function createQuizRouter(triviaService) {
  const router = express.Router();
  const controller = createQuizController(triviaService);
  router.get('/', controller.home);
  router.post('/quiz', validateSettings, controller.start);
  router.post('/results', controller.submit);
  router.get('/results', controller.results);
  router.get('/about', (req, res) => res.render('about', { title: 'Made for curious minds', page: 'about' }));
  return router;
};
