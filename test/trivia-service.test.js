const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createTriviaService } = require('../services/trivia-service');

const settings = { category: '15', difficulty: 'easy', amount: 5 };
const results = Array.from({ length: 5 }, () => ({
  type: 'multiple', difficulty: 'easy', category: encodeURIComponent('Games & more'),
  question: encodeURIComponent('What does "&" mean?'),
  correct_answer: encodeURIComponent('And'),
  incorrect_answers: ['Or', 'Not', 'Maybe'].map(encodeURIComponent)
}));

async function fakeApi(t, handler) {
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    handler(req, res);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('service passes user settings to Axios, decodes text, and caches categories', async (t) => {
  const calls = [];
  const baseURL = await fakeApi(t, (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    calls.push(url);
    res.end(JSON.stringify(url.pathname === '/api_category.php'
      ? { trivia_categories: [{ id: 15, name: 'Games' }, { id: 18, name: 'Computers' }] }
      : { response_code: 0, results }));
  });
  const service = createTriviaService({ baseURL, cooldownMs: 0 });
  assert.equal((await service.getCategories())[0].name, 'Computers');
  await service.getCategories();
  const questions = await service.getQuestions(settings);
  assert.equal(questions[0].question, 'What does "&" mean?');
  assert.equal(questions[0].category, 'Games & more');
  assert.equal(calls.filter((url) => url.pathname === '/api_category.php').length, 1);
  assert.equal(calls[1].searchParams.get('category'), '15');
  assert.equal(calls[1].searchParams.get('difficulty'), 'easy');
  assert.equal(calls[1].searchParams.get('amount'), '5');
  assert.equal(calls[1].searchParams.get('encode'), 'url3986');
  assert.equal(calls[1].searchParams.get('type'), 'multiple');
  await service.getQuestions({ category: 'any', difficulty: 'any', amount: 5 });
  assert.equal(calls[2].searchParams.has('category'), false);
  assert.equal(calls[2].searchParams.has('difficulty'), false);
});

test('API response codes and malformed payloads become friendly operational errors', async (t) => {
  let payload;
  const baseURL = await fakeApi(t, (req, res) => res.end(JSON.stringify(payload)));
  const service = createTriviaService({ baseURL, cooldownMs: 0 });
  for (const [body, status] of [
    [{ response_code: 1, results: [] }, 422],
    [{ response_code: 5, results: [] }, 429],
    [{ response_code: 2, results: [] }, 502],
    [{ response_code: 0, results: [] }, 502],
    [null, 502],
    [{ response_code: 0, results: results.map((item) => ({ ...item, question: '%invalid' })) }, 502],
    [{ response_code: 0, results: results.map((item) => ({ ...item, incorrect_answers: [] })) }, 502]
  ]) {
    payload = body;
    await assert.rejects(service.getQuestions(settings), (error) => error.statusCode === status && error.isOperational);
  }
  payload = { trivia_categories: [null] };
  await assert.rejects(service.getCategories(), (error) => error.statusCode === 502);
});

test('HTTP errors, timeouts, and broken connections are handled', async (t) => {
  let mode = '429';
  const baseURL = await fakeApi(t, (req, res) => {
    if (mode === 'timeout') return;
    if (mode === 'disconnect') return req.socket.destroy();
    res.statusCode = Number(mode);
    res.end('{}');
  });
  const service = createTriviaService({ baseURL, cooldownMs: 0, timeoutMs: 70 });
  for (const [value, status] of [['429', 429], ['500', 503], ['timeout', 504], ['disconnect', 503]]) {
    mode = value;
    await assert.rejects(service.getQuestions(settings), (error) => error.statusCode === status);
  }
});

test('local cooldown prevents rapid duplicate requests to OpenTDB', async (t) => {
  let calls = 0;
  const baseURL = await fakeApi(t, (req, res) => {
    calls += 1;
    res.end(JSON.stringify({ response_code: 0, results }));
  });
  const service = createTriviaService({ baseURL });
  await service.getQuestions(settings);
  await assert.rejects(service.getQuestions(settings), (error) => error.statusCode === 429 && error.retryAfter > 0);
  assert.equal(calls, 1);
});
