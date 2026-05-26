'use client';

/**
 * Get or create a persistent client identifier.
 * Stored in sessionStorage so it survives page reloads within the same tab
 * but is unique per tab/session.
 */
export function getClientId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('debug-duel-client-id');
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('debug-duel-client-id', id);
  }
  return id;
}
