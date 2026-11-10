// These enhancements are optional: normal HTML form submission still works without JS.
const categorySelect = document.querySelector('#category');
const topicButtons = document.querySelectorAll('[data-category]');
function syncTopics() {
  topicButtons.forEach((button) => {
    const selected = button.dataset.category === categorySelect.value;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
if (categorySelect) {
  topicButtons.forEach((button) => button.addEventListener('click', () => {
    categorySelect.value = button.dataset.category;
    syncTopics();
  }));
  categorySelect.addEventListener('change', syncTopics);
  syncTopics();
}

const startForm = document.querySelector('.start-form');
const startButton = document.querySelector('[data-start-button]');
if (startForm && startButton) {
  startForm.addEventListener('submit', () => {
    startButton.disabled = true;
    startButton.querySelector('span').textContent = 'Finding your questions…';
  });
  // The back button can restore a page with its previous disabled button state.
  window.addEventListener('pageshow', () => {
    startButton.disabled = false;
    startButton.querySelector('span').textContent = 'Let’s play';
  });
}

const quizForm = document.querySelector('#quiz-form');
if (quizForm) {
  function updateProgress() {
    const answered = quizForm.querySelectorAll('input[type="radio"]:checked').length;
    document.querySelector('#quiz-progress').value = answered;
    document.querySelector('#progress-text').textContent = `${answered} of ${quizForm.dataset.total} answered`;
  }
  quizForm.addEventListener('change', updateProgress);
  window.addEventListener('pageshow', updateProgress);
  updateProgress();
}
