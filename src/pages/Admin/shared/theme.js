export const ADMIN_THEME_KEY = 'admin_theme';

const VALID_THEMES = new Set(['dark', 'light']);

export function normalizeAdminTheme(theme) {
  return VALID_THEMES.has(theme) ? theme : 'dark';
}

export function getStoredAdminTheme() {
  return normalizeAdminTheme(localStorage.getItem(ADMIN_THEME_KEY));
}

export function getCurrentAdminTheme() {
  return normalizeAdminTheme(document.documentElement.dataset.theme || getStoredAdminTheme());
}

export function applyAdminTheme(theme = getStoredAdminTheme()) {
  const normalized = normalizeAdminTheme(theme);
  const root = document.documentElement;

  root.dataset.theme = normalized;
  root.classList.toggle('dark', normalized === 'dark');
  root.style.colorScheme = normalized;

  return normalized;
}

export function setAdminTheme(theme) {
  const normalized = applyAdminTheme(theme);
  localStorage.setItem(ADMIN_THEME_KEY, normalized);
  document.dispatchEvent(new CustomEvent('admin:theme-changed', { detail: { theme: normalized } }));
  return normalized;
}

export function toggleAdminTheme() {
  const nextTheme = getCurrentAdminTheme() === 'dark' ? 'light' : 'dark';
  return setAdminTheme(nextTheme);
}
