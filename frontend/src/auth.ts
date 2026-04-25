import type { CurrentUser } from './types';

const KEY = 'market.currentUser';

export const auth = {
  get(): CurrentUser | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as CurrentUser; } catch { return null; }
  },
  set(user: CurrentUser) {
    localStorage.setItem(KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
  },
  clear() {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event('auth-change'));
  },
};
