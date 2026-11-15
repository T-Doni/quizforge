// Category illustrations are local and never depend on a question's correct answer.
const topics = [
  { pattern: /video games|board games/i, file: 'gamepad' },
  { pattern: /japanese anime|manga|comics/i, file: 'star' },
  { pattern: /film|television|cartoon/i, file: 'film' },
  { pattern: /music|musicals/i, file: 'music' },
  { pattern: /computers|gadgets/i, file: 'chip' },
  { pattern: /animals|nature/i, file: 'nature' },
  { pattern: /science|mathematics/i, file: 'science' },
  { pattern: /vehicles/i, file: 'car' },
  { pattern: /geography|history|politics/i, file: 'world' },
  { pattern: /books|mythology/i, file: 'books' },
  { pattern: /sports/i, file: 'sport' },
  { pattern: /\bart\b|celebrities/i, file: 'art' }
];

function getTopicArt(category) {
  const file = topics.find((topic) => topic.pattern.test(category || ''))?.file || 'sparkles';
  return `/images/topics/${file}.svg`;
}

module.exports = { getTopicArt };
