/**
 * authService.js — Authentication service for Đồng Hồ Anh Tuấn
 */
import { API_BASE, STORAGE_KEYS } from './config.js';
import { clearAdminSession } from '../utils/adminAuth.js';

const TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;
const USER_KEY = STORAGE_KEYS.AUTH_USER;

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  return !!payload?.exp && payload.exp <= Math.floor(Date.now() / 1000);
}

async function apiFetch(endpoint, method, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

function normalizeUser(rawUser) {
  if (!rawUser) return null;
  return {
    id: rawUser.id,
    email: rawUser.email,
    name: rawUser.full_name || rawUser.name || '',
    full_name: rawUser.full_name || rawUser.name || '',
    phone: rawUser.phone || '',
    avatar: rawUser.avatar || null,
    roles: rawUser.roles || [],
  };
}

export function persistAuthSession(token, rawUser = null, emitEvent = true) {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const userFromPayload = payload ? {
    id: payload?.user_id,
    email: payload?.email,
    full_name: payload?.full_name,
    roles: payload?.roles || [],
  } : null;
  const user = normalizeUser(rawUser) || normalizeUser(userFromPayload);

  localStorage.setItem(TOKEN_KEY, token);
  setCookie(TOKEN_KEY, token, 7);

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  if (emitEvent) {
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user } }));
  }
  return user;
}

function getStoredTokenCandidates() {
  return [
    localStorage.getItem(TOKEN_KEY),
    getCookie(TOKEN_KEY),
  ].filter(Boolean).filter((token, index, list) => list.indexOf(token) === index);
}

function removeTokenValue(token) {
  if (localStorage.getItem(TOKEN_KEY) === token) localStorage.removeItem(TOKEN_KEY);
  if (getCookie(TOKEN_KEY) === token) deleteCookie(TOKEN_KEY);
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `; expires=${date.toUTCString()}`;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
  document.cookie = `${name}=; path=/; Max-Age=-99999999; SameSite=Lax`;
  document.cookie = `${name}=; path=/; Max-Age=-99999999; SameSite=Lax; Secure`;
}

export function getToken() {
  const tokens = getStoredTokenCandidates();
  for (const token of tokens) {
    if (isTokenExpired(token)) {
      removeTokenValue(token);
      continue;
    }

    localStorage.setItem(TOKEN_KEY, token);
    setCookie(TOKEN_KEY, token, 7);
    return token;
  }

  if (tokens.length > 0) {
    logout();
  }
  return null;
}

export function getUser() {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    const cached = JSON.parse(userStr || 'null');
    if (cached) return cached;
  } catch {
    // Fall through to JWT payload.
  }

  const token = getToken();
  const payload = token ? decodeJwtPayload(token) : null;
  if (!payload) return null;
  return normalizeUser({
    id: payload?.user_id,
    email: payload?.email,
    full_name: payload?.full_name,
    roles: payload?.roles || [],
  });
}

export function isLoggedIn() {
  return !!getToken();
}

export async function login(email, password) {
  const response = await apiFetch('/api/auth/login', 'POST', { email, password });
  const data = response.data || response;
  if (data.token) persistAuthSession(data.token, data.user);
  return data;
}

export async function register(payload) {
  const response = await apiFetch('/api/auth/register', 'POST', {
    full_name: payload.full_name || payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    otp_code: payload.otp_code,
  });
  const data = response.data || response;
  if (data.token) persistAuthSession(data.token, data.user);
  return data;
}

export async function sendOtp(phone) {
  return await apiFetch('/api/auth/otp/send', 'POST', { phone });
}

export async function verifyOtp(phone, code) {
  const response = await apiFetch('/api/auth/otp/verify', 'POST', { phone, code });
  const data = response.data || response;
  if (data.token) persistAuthSession(data.token, data.user);
  return data;
}

export async function resetPassword(phone, code, password) {
  return await apiFetch('/api/auth/reset-password', 'POST', { phone, code, password });
}

export function getGoogleClientId() {
  return window.APP_SETTINGS?.third_party_integrations?.google_login?.client_id || '';
}

export async function googleLogin(credential) {
  const response = await apiFetch('/api/auth/google', 'POST', { credential });
  const data = response.data || response;
  if (data.token) persistAuthSession(data.token, data.user);
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  deleteCookie(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // Clear legacy auth tokens to prevent inline synchronization script in index.html from restoring the session on reload
  localStorage.removeItem('dhat_token');
  deleteCookie('dhat_token');
  localStorage.removeItem('dhat_user');
  localStorage.removeItem('dhat_auth_user');

  localStorage.removeItem('tls_orders_count');
  localStorage.removeItem('tls_vouchers_count');
  localStorage.removeItem('tls_returns_active');
  clearAdminSession();
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
}

export const authService = { login, register, logout, getToken, getUser, isLoggedIn, sendOtp, verifyOtp, resetPassword, persistAuthSession, googleLogin, getGoogleClientId };
