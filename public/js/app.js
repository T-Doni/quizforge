// These enhancements are optional: normal HTML form submission still works without JS.
const startForm = document.querySelector('.start-form');
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
  // Only restore valid available choices, and never overwrite a server validation error.
  if (startForm?.dataset.restoreSettings === 'true') {
    try {
      const saved = JSON.parse(localStorage.getItem('quizforge.settings'));
      if ([...categorySelect.options].some((option) => option.value === saved?.category)) {
        categorySelect.value = saved.category;
      }
      for (const name of ['difficulty', 'amount']) {
        const choice = [...startForm.querySelectorAll(`input[name="${name}"]`)]
          .find((input) => input.value === saved?.[name]);
        if (choice) choice.checked = true;
      }
    } catch { /* Defaults remain usable when storage is blocked or malformed. */ }
  }
  topicButtons.forEach((button) => button.addEventListener('click', () => {
    categorySelect.value = button.dataset.category;
    syncTopics();
  }));
  categorySelect.addEventListener('change', syncTopics);
  syncTopics();
}

const startButton = document.querySelector('[data-start-button]');
if (startForm && startButton) {
  startForm.addEventListener('submit', () => {
    try {
      localStorage.setItem('quizforge.settings', JSON.stringify({
        category: categorySelect.value,
        difficulty: startForm.elements.difficulty.value,
        amount: startForm.elements.amount.value
      }));
    } catch { /* Remembering settings is optional. */ }
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
  const questions = [...quizForm.querySelectorAll('fieldset.question-card')];
  const navigation = document.querySelector('[data-question-navigation]');
  function updateProgress() {
    const answered = quizForm.querySelectorAll('input[type="radio"]:checked').length;
    document.querySelector('#quiz-progress').value = answered;
    document.querySelector('#progress-text').textContent = `${answered} of ${quizForm.dataset.total} answered`;
    navigation.hidden = answered === questions.length;
  }
  document.querySelector('[data-next-unanswered]').addEventListener('click', () => {
    const question = questions.find((card) => !card.querySelector('input[type="radio"]:checked'));
    if (!question) return;
    question.querySelector('input[type="radio"]').focus({ preventScroll: true });
    question.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  });
  quizForm.addEventListener('change', updateProgress);
  window.addEventListener('pageshow', updateProgress);
  updateProgress();
}
