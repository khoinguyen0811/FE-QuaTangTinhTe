/**
 * orderService.js — Order API calls for Đồng Hồ Anh Tuấn
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
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

/**
 * Create a new order
 * @param {Object} orderData
 * {
 *   customer_name, customer_email, customer_phone, shipping_address,
 *   items: [{product_id, qty, price}],
 *   total, payment_method, note
 * }
 */
export async function createOrder(orderData) {
  return apiFetch('/api/orders', 'POST', orderData);
}

/**
 * Get orders for the logged-in user
 */
export async function getOrders() {
  return apiFetch('/api/orders', 'GET');
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId) {
  return apiFetch(`/api/orders/${orderId}`, 'GET');
}

/**
 * Get eligible vouchers based on order amount
 */
export async function getEligibleVouchers(amount, productId = null) {
  let url = `/api/vouchers/eligible?amount=${amount}`;
  if (productId !== null) {
    url += `&product_id=${productId}`;
  }
  return apiFetch(url, 'GET');
}

export async function getUserAddresses() {
  return apiFetch('/api/user/addresses', 'GET');
}

export async function createUserAddress(addressData) {
  return apiFetch('/api/user/addresses', 'POST', addressData);
}
export async function cancelOrder(orderId) {
  return apiFetch(`/api/orders/${orderId}/cancel`, 'PUT');
}

export async function applyCoupon(code, items) {
  return apiFetch('/api/promotions/apply-code', 'POST', { code, items });
}

export async function removeCoupon() {
  return apiFetch('/api/promotions/remove-code', 'POST');
}

export async function recalculateCart(items, code = null, phone = null, email = null) {
  return apiFetch('/api/cart/recalculate', 'POST', { items, code, phone, email });
}

export const orderService = { 
  createOrder, 
  getOrders, 
  getOrder, 
  getEligibleVouchers, 
  getUserAddresses, 
  createUserAddress, 
  cancelOrder,
  applyCoupon,
  removeCoupon,
  recalculateCart
};
