const { randomInt, randomUUID } = require('node:crypto');

// Fisher–Yates shuffle: each remaining answer has an equal chance of moving here.
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuiz(items, settings) {
  return {
    id: randomUUID(),
    settings,
    questions: items.map((item, index) => {
      const options = shuffle([
        { text: item.correctAnswer, correct: true },
        ...item.incorrectAnswers.map((text) => ({ text, correct: false }))
      ]);
      return {
        id: `q${index}`,
        text: item.question,
        category: item.category,
        difficulty: item.difficulty,
        correctAnswerId: `a${options.findIndex((option) => option.correct)}`,
        answers: options.map((option, i) => ({ id: `a${i}`, text: option.text }))
      };
    })
  };
}

function publicQuiz(quiz) {
  return { ...quiz, questions: quiz.questions.map(({ correctAnswerId, ...question }) => question) };
}

function readAnswers(quiz, body) {
  const selected = {};
  const missing = [];
  for (const question of quiz.questions) {
    const answerId = body[`answer_${question.id}`];
    if (typeof answerId === 'string' && question.answers.some((answer) => answer.id === answerId)) {
      selected[question.id] = answerId;
    } else {
      missing.push(question.id);
    }
  }
  return { selected, missing };
}

function gradeQuiz(quiz, selected) {
  const review = quiz.questions.map((question) => ({
    ...question,
    selectedAnswerId: selected[question.id],
    isCorrect: selected[question.id] === question.correctAnswerId
  }));
  const correct = review.filter((question) => question.isCorrect).length;
  const total = review.length;
  const percentage = Math.round((correct / total) * 100);
  const rank = percentage >= 80 ? 'Quiz legend' : percentage >= 50 ? 'Knowledge seeker' : 'Curiosity unlocked';
  return { quizId: quiz.id, settings: quiz.settings, review, correct, total, percentage, rank };
}

module.exports = { shuffle, buildQuiz, publicQuiz, readAnswers, gradeQuiz };
