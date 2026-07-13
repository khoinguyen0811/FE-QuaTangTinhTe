/**
 * userService.js — User Profile, Addresses, Vouchers, Points, and Returns API calls
 */
import { API_BASE } from './config.js';
import { getToken } from './authService.js?v=1.0.20';

async function apiFetch(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  
  if (res.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

export async function getUserProfile() {
  return apiFetch('/api/user/profile', 'GET');
}

export async function updateUserProfile(profileData) {
  return apiFetch('/api/user/profile', 'PUT', profileData);
}

export async function getUserVouchers() {
  return apiFetch('/api/user/vouchers', 'GET');
}

export async function convertPointsToVoucher() {
  return apiFetch('/api/user/points/convert', 'POST');
}

export async function getUserAddresses() {
  return apiFetch('/api/user/addresses', 'GET');
}

export async function createUserAddress(addressData) {
  return apiFetch('/api/user/addresses', 'POST', addressData);
}

export async function updateUserAddress(addressId, addressData) {
  return apiFetch(`/api/user/addresses/${addressId}`, 'PUT', addressData);
}

export async function deleteUserAddress(addressId) {
  return apiFetch(`/api/user/addresses/${addressId}`, 'DELETE');
}

export async function getUserReturns() {
  return apiFetch('/api/returns', 'GET');
}

export async function createReturnRequest(returnData) {
  return apiFetch('/api/returns', 'POST', returnData);
}

export async function getRanksList() {
  return apiFetch('/api/ranks', 'GET');
}

export const userService = {
  getUserProfile,
  updateUserProfile,
  getUserVouchers,
  convertPointsToVoucher,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserReturns,
  createReturnRequest,
  getRanksList
};
