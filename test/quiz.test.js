const { test } = require('node:test');
const assert = require('node:assert/strict');
const { shuffle, buildQuiz, publicQuiz, readAnswers, gradeQuiz } = require('../utils/quiz');

test('shuffling preserves options and their correct-answer association', () => {
  const original = ['A', 'B', 'C', 'D'];
  assert.deepEqual([...shuffle(original)].sort(), original);
  assert.deepEqual(original, ['A', 'B', 'C', 'D']);
  const quiz = buildQuiz([{
    question: 'Which one?', category: 'Demo', difficulty: 'easy',
    correctAnswer: 'Correct', incorrectAnswers: ['One', 'Two', 'Three']
  }], { amount: 1 });
  const question = quiz.questions[0];
  assert.equal(question.answers.find((answer) => answer.id === question.correctAnswerId).text, 'Correct');
  assert.equal(publicQuiz(quiz).questions[0].correctAnswerId, undefined);
  assert.equal(quiz.questions[0].correctAnswerId, question.correctAnswerId);
  assert.deepEqual(readAnswers(quiz, { answer_q0: ['a0', 'a1'] }).missing, ['q0']);
});

test('rank thresholds and rounded percentages come from correct answers', () => {
  const quiz = {
    id: 'round', settings: {},
    questions: Array.from({ length: 5 }, (_, index) => ({
      id: `q${index}`, text: 'Question', correctAnswerId: 'a1',
      answers: [{ id: 'a0', text: 'Wrong' }, { id: 'a1', text: 'Right' }]
    }))
  };
  for (const [correct, rank] of [[0, 'Curiosity unlocked'], [2, 'Curiosity unlocked'], [3, 'Knowledge seeker'], [4, 'Quiz legend'], [5, 'Quiz legend']]) {
    const selected = Object.fromEntries(quiz.questions.map((question, index) => [question.id, index < correct ? 'a1' : 'a0']));
    const result = gradeQuiz(quiz, selected);
    assert.equal(result.percentage, correct * 20);
    assert.equal(result.correct, correct);
    assert.equal(result.rank, rank);
    assert.equal(result.review.filter((question) => question.isCorrect).length, correct);
  }
});
