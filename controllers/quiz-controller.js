const AppError = require('../utils/app-error');
const { buildQuiz, publicQuiz, readAnswers, gradeQuiz } = require('../utils/quiz');

module.exports = function createQuizController(triviaService) {
  async function renderHome(res, values = { category: 'any', difficulty: 'easy', amount: '5' }, errors = {}, status = 200) {
    const categories = await triviaService.getCategories();
    const shortcuts = [
      { id: 'any', label: 'Surprise me', detail: 'A bit of everything', icon: 'sparkles' },
      { id: '15', label: 'Video games', detail: 'Press play on your knowledge', icon: 'gamepad' },
      { id: '11', label: 'Movies', detail: 'Beyond the end credits', icon: 'film' },
      { id: '18', label: 'Technology', detail: 'A different kind of debugging', icon: 'chip' },
      { id: '12', label: 'Music', detail: 'For the record', icon: 'music' },
      { id: '31', label: 'Anime', detail: 'Your next character arc', icon: 'star' }
    ].filter((topic) => topic.id === 'any' || categories.some((category) => String(category.id) === topic.id));
    res.status(status).render('home', {
      title: 'Find your next challenge', page: 'home', categories, shortcuts, values, errors
    });
  }

  async function home(req, res, next) {
    try { await renderHome(res); } catch (error) { next(error); }
  }

  async function start(req, res, next) {
    try {
      const { values, errors } = req.quizForm;
      if (Object.keys(errors).length) return await renderHome(res, values, errors, 422);
      const categories = await triviaService.getCategories();
      const category = categories.find((item) => String(item.id) === values.category);
      if (values.category !== 'any' && !category) {
        return await renderHome(res, values, { category: 'That category is not available. Choose one from the list.' }, 422);
      }
      const settings = {
        ...values, amount: Number(values.amount),
        categoryName: category?.name.replace(/^Entertainment: |^Science: /, '') || 'All topics'
      };
      const questions = await triviaService.getQuestions(settings);
      const quiz = buildQuiz(questions, settings);
      req.session.quiz = quiz;
      req.session.result = null;
      res.render('quiz', { title: 'Your challenge', page: 'quiz', quiz: publicQuiz(quiz), selected: {}, missing: [] });
    } catch (error) { next(error); }
  }

  function submit(req, res, next) {
    const body = req.body || {};
    // A repeated form submission reopens the stored result rather than grading twice.
    if (typeof body.quizId === 'string' && body.quizId === req.session.result?.quizId) {
      return res.redirect(303, '/results');
    }
    const quiz = req.session.quiz;
    if (!quiz || body.quizId !== quiz.id) {
      return next(new AppError('This round has expired or was replaced by a newer one. Please start a new quiz.', 409));
    }
    const { selected, missing } = readAnswers(quiz, body);
    if (missing.length) {
      return res.status(422).render('quiz', {
        title: 'Finish your challenge', page: 'quiz', quiz: publicQuiz(quiz), selected, missing
      });
    }
    req.session.result = gradeQuiz(quiz, selected);
    req.session.quiz = null;
    res.redirect(303, '/results');
  }

  function results(req, res) {
    if (!req.session.result) return res.redirect('/');
    res.render('results', { title: 'Your results', page: 'results', result: req.session.result });
  }

  return { home, start, submit, results };
};
