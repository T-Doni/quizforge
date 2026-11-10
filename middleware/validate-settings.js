module.exports = function validateSettings(req, res, next) {
  const body = req.body || {};
  const values = {
    category: typeof body.category === 'string' ? body.category : 'any',
    difficulty: typeof body.difficulty === 'string' ? body.difficulty : 'easy',
    amount: typeof body.amount === 'string' ? body.amount : '5'
  };
  const errors = {};
  if (typeof body.category !== 'string' || !/^(any|[1-9]\d{0,2})$/.test(body.category)) {
    errors.category = 'Choose a category from the list.';
  }
  if (!['any', 'easy', 'medium', 'hard'].includes(body.difficulty)) {
    errors.difficulty = 'Choose Mixed, Easy, Medium, or Hard.';
  }
  if (!['5', '10'].includes(body.amount)) {
    errors.amount = 'Choose either 5 or 10 questions.';
  }
  req.quizForm = { values, errors };
  next();
};
