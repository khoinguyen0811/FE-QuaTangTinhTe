/**
 * helpers.js — Utility functions for Đồng Hồ Anh Tuấn
 */

/**
 * Format a number as Vietnamese currency string
 * e.g. 1990000 → "1.990.000₫"
 */
export function formatPrice(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return Number(num).toLocaleString('en-US') + 'đ';
}

/**
 * Generate a RFC4122-compliant UUID v4
 */
export function generateUUID() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Debounce: delay fn execution until after `wait` ms since last call
 */
export function debounce(fn, wait = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle: ensure fn is called at most once per `limit` ms
 */
export function throttle(fn, limit = 200) {
  let lastRun = 0;
  let timer;
  return function (...args) {
    const now = Date.now();
    const remaining = limit - (now - lastRun);
    if (remaining <= 0) {
      lastRun = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        lastRun = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Format an ISO date string to Vietnamese locale
 * e.g. "2025-01-15T10:30:00Z" → "15/01/2025"
 */
export function formatDate(isoString, options = {}) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    const formatStr = window.APP_SETTINGS?.time_format;
    if (formatStr) {
      let targetFormat = formatStr;
      const isPureDate = typeof isoString === 'string' && isoString.length <= 10 && !isoString.includes(':') && !isoString.includes('T');
      if (options.dateOnly || isPureDate) {
        targetFormat = formatStr.replace(/[\s,]*[Hh]+:[mm]+(:[ss]+)?(\s*[Aa])?/, '').trim();
        if (!targetFormat) targetFormat = 'DD/MM/YYYY';
      }

      const pad = (num, size = 2) => String(num).padStart(size, '0');
      const YYYY = d.getFullYear();
      const YY = String(YYYY).slice(-2);
      const M = d.getMonth() + 1;
      const MM = pad(M);
      const D = d.getDate();
      const DD = pad(D);
      const H = d.getHours();
      const HH = pad(H);
      const h = H % 12 || 12;
      const hh = pad(h);
      const m = d.getMinutes();
      const mm = pad(m);
      const s = d.getSeconds();
      const ss = pad(s);
      const A = H >= 12 ? 'PM' : 'AM';
      const a = H >= 12 ? 'pm' : 'am';

      return targetFormat
        .replace('YYYY', YYYY)
        .replace('YY', YY)
        .replace('MM', MM)
        .replace('DD', DD)
        .replace('HH', HH)
        .replace('hh', hh)
        .replace('mm', mm)
        .replace('ss', ss)
        .replace('A', A)
        .replace('a', a)
        .replace('M', M)
        .replace('D', D)
        .replace('H', H)
        .replace('h', h);
    }

    const defaults = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const opts = Object.assign(defaults, options);
    return d.toLocaleDateString('vi-VN', opts);
  } catch {
    return isoString;
  }
}

/**
 * Truncate string to maxLength and add ellipsis
 */
export function truncate(str, maxLength = 60) {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
}

/**
 * Slugify a Vietnamese string (basic)
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Deep clone a plain object/array
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get or create a persistent session ID
 */
export function getSessionId() {
  const key = 'dhat_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

/**
 * Detect device type from user agent
 */
export function getDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Navigate using pushState (for SPA routing)
 */
export function navigate(path) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Clamp a number between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Wait for N milliseconds (Promise-based)
 */
export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Create an element with attributes and children
 */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') el.className = val;
    else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
    else el.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  }
  return el;
}

export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      const success = document.execCommand('copy');
      document.body.removeChild(el);
      if (success) {
        resolve();
      } else {
        reject(new Error('Copy failed'));
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

