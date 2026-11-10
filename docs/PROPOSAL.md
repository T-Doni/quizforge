# QuizForge — Custom Trivia Quiz

**Student name / ID:** Tanatarov Danial / 32291

**Course:** Web Development II (VR 113153)

QuizForge is a server-rendered trivia application that lets users choose a topic, difficulty, and either five or ten multiple-choice questions. After answering the questions on one page, users receive their score, accuracy percentage, an achievement label, and a review of their answers.

The project uses **Open Trivia Database (OpenTDB)**, a free public API requiring no API key. Documentation: https://opentdb.com/api_config.php. The two API requests are `GET /api_category.php` for available categories and `GET /api.php?amount=5&category=15&difficulty=easy&type=multiple&encode=url3986` for questions. Form choices determine the request parameters.

The application is built with Node.js, Express, Axios, EJS, dotenv, and express-session. Routes, controllers, API services, middleware, and views are separated. Data processing includes decoding question text, shuffling answer choices, validating submitted options, counting correct answers, and calculating a percentage. The correct answers are stored in a server-side session.

**Pages/routes:** `GET /` displays the setup form; `POST /quiz` creates and displays a round; `POST /results` checks answers; `GET /results` displays the result and review; `GET /about` explains the application and credits its data source.

**Main page layout:** a navigation bar and illustrated introduction above a quiz-builder card. The card contains topic shortcuts, a complete category dropdown, difficulty choices, question-count controls, and a “Let’s play” button. The responsive layout adapts to mobile screens. Server-side validation, API timeout/rate-limit messages, a 404 page, and centralized error handling provide friendly feedback when a request cannot be completed.
