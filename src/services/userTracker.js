/**
 * userTracker.js — Tracks page views and product views for logged-in users.
 * Sends activity data to the backend so admins can see customer behavior.
 */

import { API_BASE, STORAGE_KEYS } from './config.js';

let lastTrackedPath = '';

/**
 * Track a page view for the current logged-in user.
 * Call this on every route change.
 */
export function trackPageView(pagePath) {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return;

  // Debounce: don't track the same path twice in a row
  if (pagePath === lastTrackedPath) return;
  lastTrackedPath = pagePath;

  sendActivity({
    action_type: 'page_view',
    page_path: pagePath,
  });
}

/**
 * Track a product view for the current logged-in user.
 */
export function trackProductView(productId, productName, pagePath) {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return;

  sendActivity({
    action_type: 'product_view',
    page_path: pagePath || window.location.pathname,
    product_id: productId,
    product_name: productName,
  });
}

function sendActivity(data) {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return;

  // Use sendBeacon for reliability, fallback to fetch
  const payload = JSON.stringify(data);
  const url = `${API_BASE}/api/analytics/user-activity`;

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Authorization': `Bearer ${token}`,
    };

    fetch(url, {
      method: 'POST',
      headers,
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silent fail — never break the user experience for tracking
  }
}
