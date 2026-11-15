// Apply the saved theme before the stylesheet loads to avoid a flash on navigation.
(() => {
  const root = document.documentElement;
  const storageKey = 'quizforge.theme';

  function savedTheme() {
    try {
      const value = localStorage.getItem(storageKey);
      return value === 'dark' || value === 'light' ? value : null;
    } catch {
      return null;
    }
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#1b1d2b' : '#f8f6f1';
    const button = document.querySelector('[data-theme-toggle]');
    if (button) {
      const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', label);
      button.title = label;
      button.querySelector('.theme-label').textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
      button.hidden = false;
    }
  }

  applyTheme(savedTheme() || 'light');
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(root.dataset.theme);
    document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(theme);
      try { localStorage.setItem(storageKey, theme); } catch { /* Switching still works without storage. */ }
    });
  });
  window.addEventListener('pageshow', () => applyTheme(savedTheme() || root.dataset.theme));
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) applyTheme(savedTheme() || 'light');
  });
})();
