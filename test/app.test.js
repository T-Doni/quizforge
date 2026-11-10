const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../app');
const AppError = require('../utils/app-error');

const categories = [
  { id: 9, name: 'General Knowledge' },
  { id: 15, name: 'Entertainment: Video Games' },
  { id: 18, name: 'Science: Computers' }
];
const settings = { category: '15', difficulty: 'easy', amount: '5' };

function fixture(overrides = {}) {
  let questionCalls = 0;
  const service = {
    getCategories: async () => categories,
    getQuestions: async ({ amount }) => {
      questionCalls += 1;
      return Array.from({ length: amount }, (_, index) => ({
        question: `Question ${index + 1}: <script>alert("example")</script> & a clue?`,
        category: 'Entertainment: Video Games',
        difficulty: 'easy',
        correctAnswer: `Correct ${index}`,
        incorrectAnswers: [`Wrong ${index} A`, `Wrong ${index} B`, `Wrong ${index} C`]
      }));
    },
    ...overrides
  };
  const app = createApp({ triviaService: service });
  return { app, agent: request.agent(app), calls: () => questionCalls };
}

// Read the rendered form like a browser. Correct options are known only to this fixture.
function answersFrom(html, correctCount = 5) {
  const body = { quizId: html.match(/name="quizId" value="([^"]+)"/)[1] };
  const options = /name="answer_(q\d+)" value="(a\d+)"[\s\S]*?<span class="answer-text">([^<]*)<\/span>/g;
  for (const [, questionId, answerId, text] of html.matchAll(options)) {
    const index = Number(questionId.slice(1));
    if (text.startsWith(index < correctCount ? 'Correct' : 'Wrong')) {
      body[`answer_${questionId}`] = answerId;
    }
  }
  return body;
}

test('home and about render EJS, real category options, and attribution', async () => {
  const { agent, calls } = fixture();
  const home = await agent.get('/').expect(200);
  assert.match(home.text, /Science: Computers/);
  assert.match(home.text, /action="\/quiz" method="POST"/);
  assert.match(home.text, /quiz-orbit.svg/);
  const about = await agent.get('/about').expect(200);
  assert.match(about.text, /Creative Commons Attribution-ShareAlike 4.0/);
  assert.equal(calls(), 0);
});

test('full round grades on the server, survives a refresh, and is isolated by session', async () => {
  const { app, agent } = fixture();
  const quiz = await agent.post('/quiz').type('form').send(settings).expect(200);
  assert.match(quiz.text, /&lt;script&gt;/);
  assert.doesNotMatch(quiz.text, /<script>alert/);
  assert.doesNotMatch(quiz.text, /correctAnswerId|"correct":true/);
  const body = answersFrom(quiz.text, 3);
  assert.equal(Object.keys(body).length, 6);
  await agent.post('/results').type('form').send(body).expect(303).expect('Location', '/results');
  const result = await agent.get('/results').expect(200);
  assert.match(result.text, /60%/);
  assert.match(result.text, /Knowledge seeker/);
  assert.match(result.text, /3<span>\/5<\/span>/);
  assert.match(result.text, /Correct answer/);
  await agent.post('/results').type('form').send(body).expect(303);
  assert.match((await agent.get('/results').expect(200)).text, /60%/);
  await request(app).get('/results').expect(302).expect('Location', '/');
  await request(app).post('/results').type('form').send(body).expect(409);
});

test('missing and invented answer IDs preserve valid answers without revealing the answer key', async () => {
  const { agent, calls } = fixture();
  const quiz = await agent.post('/quiz').type('form').send(settings).expect(200);
  const body = answersFrom(quiz.text);
  delete body.answer_q1;
  body.answer_q3 = 'a999';
  const response = await agent.post('/results').type('form').send(body).expect(422);
  assert.match(response.text, /A few answers are missing/);
  assert.equal((response.text.match(/ checked required/g) || []).length, 3);
  assert.doesNotMatch(response.text, /correctAnswerId|Correct answer<\/span>/);
  assert.equal(calls(), 1);
  const fixed = answersFrom(response.text);
  await agent.post('/results').type('form').send(fixed).expect(303);
  assert.match((await agent.get('/results')).text, /100%/);
});

test('tampered settings are rejected before requesting questions', async () => {
  const { agent, calls } = fixture();
  for (const invalid of [
    { ...settings, amount: '100' },
    { ...settings, difficulty: '<script>' },
    { ...settings, category: '-1' },
    { ...settings, category: '999' },
    {}
  ]) {
    await agent.post('/quiz').type('form').send(invalid).expect(422);
  }
  await agent.post('/quiz').type('form').send('category=15&category=18&difficulty=easy&amount=5').expect(422);
  assert.equal(calls(), 0);
});

test('a replaced round cannot be submitted against the new round', async () => {
  const { agent } = fixture();
  const first = await agent.post('/quiz').type('form').send(settings).expect(200);
  const second = await agent.post('/quiz').type('form').send(settings).expect(200);
  await agent.post('/results').type('form').send(answersFrom(first.text)).expect(409);
  await agent.post('/results').type('form').send(answersFrom(second.text)).expect(303);
});

test('rate limits and empty results show actionable error pages', async () => {
  for (const [status, message, retryAfter] of [
    [429, 'Please wait before starting another round.', 6],
    [422, 'Try fewer questions or a different difficulty.', null],
    [503, 'The API is temporarily unavailable.', null]
  ]) {
    const { agent } = fixture({ getQuestions: async () => { throw new AppError(message, status, retryAfter); } });
    const response = await agent.post('/quiz').type('form').send(settings).expect(status);
    assert.ok(response.text.includes(message));
    assert.doesNotMatch(response.text, /at createQuizController|AppError:/);
    if (retryAfter) assert.equal(response.headers['retry-after'], '6');
  }
});

test('unexpected errors do not disclose diagnostics, and unknown routes return 404', async () => {
  const { agent } = fixture({ getCategories: async () => { throw new Error('private-debug-detail'); } });
  const failure = await agent.get('/').expect(500);
  assert.doesNotMatch(failure.text, /private-debug-detail|Error:/);
  assert.match(failure.text, /Something unexpected happened/);
  const missing = await agent.get('/not-a-real-page').expect(404);
  assert.match(missing.text, /Back to quiz builder/);
});
