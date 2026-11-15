# QuizForge — verification and submission checklist

## Implemented and checked

- [x] Express, Axios, EJS, dotenv; consistent CommonJS modules.
- [x] npm start script and an environment-variable example.
- [x] Local `.env` configured with a port and randomly generated session secret; Git exclusion checked.
- [x] Routes, controllers, services, middleware, views/partials and public assets.
- [x] Two OpenTDB endpoints; form values are used in the question request.
- [x] Axios async/await/try/catch and meaningful question/answer processing.
- [x] Home GET, quiz-creation POST, answer POST and results GET.
- [x] Built-in static/form middleware and a custom request logger.
- [x] Server-side input/answer validation, 404 and centralized error handler.
- [x] EJS partials, loops, conditions, custom SVG imagery and responsive styling.
- [x] Friendly empty-result, network, timeout, rate-limit and malformed-response handling.
- [x] Correct answers stored on the server; results isolated by session.
- [x] Automated tests: grading, invalid requests, session flow and simulated external failures.
- [x] Live OpenTDB browser flow: 5 questions, 3 correct answers, expected 60% result.
- [x] Desktop 1440×1000 and mobile 375×812 checked for horizontal overflow.
- [x] Browser console checked for JavaScript errors during the full flow.
- [x] README and three screenshots captured from the running app.
- [x] Student details added to the README, API choice post, proposal, and declaration: Tanatarov Danial / 32291.
- [x] Light/dark themes, remembered quiz settings, category illustrations, unanswered-question navigation, and answer-review filters implemented.
- [x] GitHub remote connected to https://github.com/T-Doni/quizforge.

API key errors are not applicable because OpenTDB needs no key. Other upstream failures are handled.

## Manual checks to repeat yourself

1. Run `npm install`, configure `.env`, then run `npm start` from the QuizForge folder.
2. Choose a shortcut card and check that the category dropdown updates.
3. Start a round with your chosen category and difficulty.
4. Try submitting before choosing all answers; the form should request the missing choices.
5. Answer every question and check the result against the displayed review.
6. Refresh `/results`; the same result should remain.
7. Open `/results` in a private browser window; it should return to the builder.
8. Start a new round, then try submitting an older round from another tab; it should be rejected.
9. Open `/missing-page`; the response should be a friendly 404 page.
10. Test 10 questions and Mixed difficulty, allowing six seconds between new API requests.
11. Try the site at a mobile width and navigate form controls with the keyboard.
12. Run `npm test` and read what each test verifies. Simulated errors print diagnostics to the terminal deliberately.
13. Switch themes, reload, and check that the selected theme remains. Start a round, return home, and check the saved settings.
14. Use Next unanswered with skipped questions, then finish all answers and check that the link disappears.
15. In results, select All, Correct, and Incorrect; check the visible count and empty-state messages for perfect/zero scores.

The automated service tests exercise rate limits, unavailable APIs and timeouts without deliberately overloading OpenTDB.

## Assistant verification — 15 November 2026

- `npm test`: all 13 tests passed after the final interface changes.
- Browser checks confirmed saved settings after returning home/reloading, safe defaults for invalid storage, and preservation of server validation responses.
- Browser checks confirmed keyboard focus on the next unanswered question and correct behavior after a missing-answer response.
- Review filters were checked for 3/5, 5/5 and 0/5 results, including empty views, counts, keyboard activation, dark mode, and 320px layout.
- A live OpenTDB round produced the expected 3/5 (60%) result. Both themes were checked at 320, 375, 768 and 1440px; all 13 illustrations loaded and no JavaScript errors were recorded.
- Theme switching and form submission remained usable with browser storage blocked. Without JavaScript, the complete quiz/result flow remained available and optional controls stayed hidden.
- Screenshots in `docs/screenshots/` were refreshed from the live round.

These are assistant-run checks, not a declaration that the student personally repeated them.

## Student actions still required

- [ ] Check API availability in your group and register OpenTDB in Canvas (Week 7 requirement).
- [ ] Submit the completed proposal by Week 9.
- [ ] Review every submitted file and make your own meaningful improvements.
- [ ] Verify at least 8 meaningful Git commits on GitHub using their actual dates and the applicable instructor requirements.
- [ ] Verify that the instructor can open the GitHub repository; grant access if it is private.
- [ ] Complete the AI Declaration with your actual work and understanding confirmation.
- [ ] Preserve prompts, AI outputs and drafts for 30 days after final grades.
- [ ] Practice a 5–7 minute demo, questions, and a small live code change without AI.
- [ ] Check the precise Week 11 deadline in Canvas.
- [ ] Submit the repository link, declaration and project ZIP without `.env` or `node_modules`.

## Meaningful future commits

Commit the starting project honestly as a starting project. Subsequent commits should reflect real work completed on those days, for example: your own visual refinements, an accessibility improvement, a useful filter, an additional tested edge case, a clearer API error message, updated screenshots after changes, your completed documentation, or a bug found during rehearsal. Do not split already-completed work merely to manufacture a development history.
