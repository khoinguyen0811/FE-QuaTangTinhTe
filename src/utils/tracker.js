import { getSessionId, getDeviceType } from './helpers.js';
import { API_BASE } from '../services/config.js';

const PING_INTERVAL = 30000;

let pingTimer = null;
let initialized = false;
let currentViewId = null;
let visitStartedAt = Date.now();
let maxScrollDepth = 0;

function buildPayload(extra = {}) {
  return JSON.stringify({
    session_id: getSessionId(),
    page_url: window.location.href,
    page_title: document.title || '',
    referrer: document.referrer || '',
    device_type: getDeviceType(),
    timestamp: new Date().toISOString(),
    ...extra,
  });
}

function measureScrollDepth() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const viewport = window.innerHeight || doc.clientHeight || 0;
  const fullHeight = Math.max(doc.scrollHeight || 0, document.body.scrollHeight || 0, 1);
  const depth = Math.min(100, Math.round(((scrollTop + viewport) / fullHeight) * 100));
  maxScrollDepth = Math.max(maxScrollDepth, depth);
}

function resetViewState() {
  currentViewId = null;
  visitStartedAt = Date.now();
  maxScrollDepth = 0;
  measureScrollDepth();
}

function getTimeOnPage() {
  return Math.max(0, Math.round((Date.now() - visitStartedAt) / 1000));
}

let lastTrackedUrl = '';

export async function postVisit() {
  const currentUrl = window.location.href;
  if (currentUrl === lastTrackedUrl) return;
  lastTrackedUrl = currentUrl;

  resetViewState();

  try {
    const token = localStorage.getItem('dhat_auth_token') || localStorage.getItem('dhat_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/analytics/visit`, {
      method: 'POST',
      headers,
      body: buildPayload({ event: 'visit' }),
    });

    const data = await res.json().catch(() => ({}));
    currentViewId = data?.data?.view_id ?? null;
  } catch {
    currentViewId = null;
  }
}

export function startPing() {
  stopPing();
  pingTimer = setInterval(() => {
    const url = `${API_BASE}/api/analytics/ping`;
    const token = localStorage.getItem('dhat_auth_token') || localStorage.getItem('dhat_token');
    
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Authorization'] = `Bearer ${token}`;
    }

    fetch(url, { 
      method: 'POST', 
      headers,
      body: buildPayload({ event: 'ping', view_id: currentViewId }),
      keepalive: true 
    }).catch(() => {});
  }, PING_INTERVAL);
}

export function stopPing() {
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
}

function sendExitBeacon() {
  measureScrollDepth();
  const url = `${API_BASE}/api/analytics/exit`;
  const payload = buildPayload({
    event: 'exit',
    view_id: currentViewId,
    time_on_page: getTimeOnPage(),
    scroll_depth: maxScrollDepth,
  });
  const blob = new Blob([payload], { type: 'application/json' });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, { method: 'POST', body: blob, keepalive: true }).catch(() => {});
  }
}

function trackRouteChange() {
  sendExitBeacon();
  postVisit().catch(() => {});
}

export function initTracker() {
  if (initialized) return;
  initialized = true;

  startPing();
  window.addEventListener('scroll', measureScrollDepth, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendExitBeacon();
    }
  });

  window.addEventListener('beforeunload', sendExitBeacon);
  window.addEventListener('page-rendered', trackRouteChange);
}
