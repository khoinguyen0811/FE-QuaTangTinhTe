import { STORAGE_KEYS } from '../services/config.js';

const ADMIN_TOKEN_KEY = STORAGE_KEYS.ADMIN_AUTH_TOKEN || 'sly_admin_auth_token';
const AUTH_TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN || 'dhat_auth_token';

function getCookie(name) {
  const value = `; ${document.cookie || ''}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function decodeJwtPayload(token) {
  try {
    const payload = token?.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function normalizeRoleName(role) {
  const name = (typeof role === 'object' && role !== null)
    ? (role.name || role.display_name || role.value || '')
    : role;

  return String(name || '').toLowerCase().trim();
}

function getPayloadRoles(payload) {
  const roles = payload?.roles || [];
  const displayNames = payload?.role_display_names || [];
  return [...roles, ...displayNames].map(normalizeRoleName).filter(Boolean);
}

function isExpiredPayload(payload) {
  return !!payload?.exp && payload.exp <= Math.floor(Date.now() / 1000);
}

function isAdminCapablePayload(payload) {
  if (!payload || isExpiredPayload(payload)) return false;

  const roles = getPayloadRoles(payload);
  if (roles.some(role => ['system', 'system administrator', 'super_admin', 'super administrator', 'admin', 'administrator', 'editor'].includes(role) || role.includes('admin'))) {
    return true;
  }

  const permissions = payload.permissions || [];
  return permissions.some(permission => String(permission).startsWith('admin:') || String(permission).includes(':write'));
}

function removeAdminTokenValue(token) {
  if (localStorage.getItem(ADMIN_TOKEN_KEY) === token) localStorage.removeItem(ADMIN_TOKEN_KEY);
  if (localStorage.getItem('sly_admin_auth_token') === token) localStorage.removeItem('sly_admin_auth_token');
  if (getCookie(ADMIN_TOKEN_KEY) === token) {
    document.cookie = `${ADMIN_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
  if (getCookie('sly_admin_auth_token') === token) {
    document.cookie = 'sly_admin_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem('sly_admin_auth_token');
  
  const keys = [ADMIN_TOKEN_KEY, 'sly_admin_auth_token'];
  for (const name of keys) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
    document.cookie = `${name}=; path=/; Max-Age=-99999999; SameSite=Lax`;
    document.cookie = `${name}=; path=/; Max-Age=-99999999; SameSite=Lax; Secure`;
  }
}

export function getAdminToken() {
  const candidates = [
    localStorage.getItem(ADMIN_TOKEN_KEY),
    localStorage.getItem('sly_admin_auth_token'),
    getCookie(ADMIN_TOKEN_KEY),
    getCookie('sly_admin_auth_token'),
    localStorage.getItem(AUTH_TOKEN_KEY),
    localStorage.getItem('dhat_auth_token'),
    localStorage.getItem('dhat_token'),
    getCookie(AUTH_TOKEN_KEY),
    getCookie('dhat_auth_token'),
    getCookie('dhat_token'),
  ].filter(Boolean).filter((token, index, list) => list.indexOf(token) === index);

  for (const token of candidates) {
    const payload = decodeJwtPayload(token);
    if (!payload || isExpiredPayload(payload)) {
      continue;
    }
    if (isAdminCapablePayload(payload)) {
      return token;
    }
  }

  return null;
}

export function getAdminPayload() {
  const token = getAdminToken();
  return token ? decodeJwtPayload(token) : null;
}

export function isSuperAdmin() {
  const roles = getPayloadRoles(getAdminPayload());
  return roles.some(role => role === 'super_admin' || role === 'super administrator' || role === 'system' || role === 'system administrator');
}

export function hasAdminPermission(permission) {
  const payload = getAdminPayload();
  if (!payload) return false;

  if (isSuperAdmin()) return true;

  const permissions = payload.permissions || [];
  if (permissions.includes(permission)) return true;

  const roles = getPayloadRoles(payload);
  if (roles.some(role => role === 'admin' || role.includes('admin'))) return permission !== 'roles:manage';

  return false;
}
