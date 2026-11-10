# Canvas: Individual Project – API choice

Check whether **Open Trivia / OpenTDB** has already been chosen in your group. The following is a draft message for the discussion; approval is not recorded by this file.

---

**Project title:** QuizForge — Custom Trivia Quiz

**Chosen API:** Open Trivia Database (OpenTDB)

**Documentation:** https://opentdb.com/api_config.php

I would like to use Open Trivia Database for my individual project.

QuizForge will allow users to choose a category, difficulty, and number of questions, complete a multiple-choice quiz, and view their score and an answer review. The application will use Node.js, Express, Axios, EJS, and dotenv with an MVC-style structure.

It will process API data by shuffling answer options, checking submitted answers on the server, and calculating the score and percentage.

Planned API requests:

1. `GET /api_category.php` — retrieve quiz categories.
2. `GET /api.php` — retrieve questions using the selected category, difficulty, and amount.

The API is listed in the public-apis repository, is free, and does not require an API key. Both request types have been tested successfully.

Please confirm whether this API is available for my group and suitable for the project.
