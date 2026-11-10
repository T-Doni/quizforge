const axios = require('axios');
const AppError = require('../utils/app-error');

function createTriviaService({ baseURL = 'https://opentdb.com', cooldownMs = 5500, timeoutMs = 8000 } = {}) {
  const client = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: { 'User-Agent': 'QuizForge/1.0 (educational trivia application)' }
  });
  let cachedCategories = null;
  let categoriesExpireAt = 0;
  let nextQuestionRequestAt = 0;

  // Translate technical Axios failures into messages suitable for an EJS error page.
  async function request(endpoint, params) {
    try {
      const response = await client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`[OpenTDB] ${endpoint}: ${error.code || error.response?.status || error.message}`);
      if (error.response?.status === 429) {
        throw new AppError('Open Trivia DB is busy. Please wait a few seconds and try again.', 429, 6);
      }
      if (['ECONNABORTED', 'ETIMEDOUT'].includes(error.code)) {
        throw new AppError('The question service took too long to respond. Please try again.', 504);
      }
      throw new AppError('We cannot reach Open Trivia DB right now. Please try again shortly.', 503);
    }
  }

  async function getCategories() {
    if (cachedCategories && Date.now() < categoriesExpireAt) return cachedCategories;
    const data = await request('/api_category.php');
    if (!Array.isArray(data?.trivia_categories) || data.trivia_categories.length === 0 ||
        !data.trivia_categories.every((item) => item && Number.isInteger(item.id) && typeof item.name === 'string')) {
      throw new AppError('The question service returned an unexpected category list. Please try again later.', 502);
    }
    cachedCategories = [...data.trivia_categories].sort((a, b) => a.name.localeCompare(b.name));
    categoriesExpireAt = Date.now() + 6 * 60 * 60 * 1000;
    return cachedCategories;
  }

  async function getQuestions({ category, difficulty, amount }) {
    // OpenTDB permits one question request per IP every five seconds.
    const remaining = nextQuestionRequestAt - Date.now();
    if (remaining > 0) {
      throw new AppError('Your next round is almost ready. Wait a few seconds before starting another quiz.',
        429, Math.ceil(remaining / 1000));
    }
    nextQuestionRequestAt = Date.now() + cooldownMs;
    const params = { amount, type: 'multiple', encode: 'url3986' };
    if (category !== 'any') params.category = category;
    if (difficulty !== 'any') params.difficulty = difficulty;
    const data = await request('/api.php', params);

    // A 200 HTTP response can still contain an OpenTDB application-level error.
    if (data?.response_code === 1) {
      throw new AppError('There are not enough questions for that combination. Try 5 questions or Mixed difficulty.', 422);
    }
    if (data?.response_code === 5) {
      throw new AppError('Open Trivia DB received too many requests. Please wait a few seconds and try again.', 429, 6);
    }
    if (data?.response_code !== 0 || !Array.isArray(data.results) || data.results.length !== amount) {
      throw new AppError('The question service returned an incomplete quiz. Please try another round.', 502);
    }

    try {
      return data.results.map((item) => {
        const fields = [item.question, item.category, item.correct_answer, ...(item.incorrect_answers || [])];
        if (item.type !== 'multiple' || !Array.isArray(item.incorrect_answers) ||
            item.incorrect_answers.length !== 3 || !fields.every((value) => typeof value === 'string' && value.length > 0) ||
            !['easy', 'medium', 'hard'].includes(item.difficulty)) {
          throw new Error('Invalid question structure');
        }
        return {
          question: decodeURIComponent(item.question),
          category: decodeURIComponent(item.category),
          difficulty: item.difficulty,
          correctAnswer: decodeURIComponent(item.correct_answer),
          incorrectAnswers: item.incorrect_answers.map((answer) => decodeURIComponent(answer))
        };
      });
    } catch (error) {
      console.error(`[OpenTDB] Invalid question data: ${error.message}`);
      throw new AppError('Some questions could not be read. Please try another round.', 502);
    }
  }

  return { getCategories, getQuestions };
}

module.exports = { createTriviaService };
