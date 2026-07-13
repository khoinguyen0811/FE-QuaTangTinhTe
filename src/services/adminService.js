import { API_BASE, STORAGE_KEYS } from './config.js';

function headers() {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
  const h = { 'Content-Type': 'application/json' };
  if (token) {
    h.Authorization = `Bearer ${token}`;
    h['X-Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function api(method, path, body, extra = {}) {
  const opts = {
    method,
    headers: headers(),
    ...extra,
  };

  if (body) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
      document.dispatchEvent(new CustomEvent('admin:logout'));
    }
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }
  return data;
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    const mappedKey = key === 'per_page' ? 'limit' : key;
    query.set(mappedKey, String(value));
  });

  const str = query.toString();
  return str ? `?${str}` : '';
}

// Dashboard
export const getDashboardStats = () => api('GET', '/api/admin/dashboard/stats');

// Products
export const getProducts = (params = {}) => api('GET', `/api/admin/products${buildQuery(params)}`);
export const getProduct = (id) => api('GET', `/api/admin/products/${id}`);
export const createProduct = (d) => api('POST', '/api/admin/products', d);
export const updateProduct = (id, d) => api('PUT', `/api/admin/products/${id}`, d);
export const quickUpdateProduct = (id, d) => api('PATCH', `/api/admin/products/${id}/quick-edit`, d);
export const toggleProduct = (id) => api('PATCH', `/api/admin/products/${id}/toggle`);
export const deleteProduct = (id) => api('DELETE', `/api/admin/products/${id}`);
export const getLowStock = () => api('GET', '/api/admin/products/low-stock');
export const getProductAnalytics = (id) => api('GET', `/api/admin/products/${id}/analytics`);

// Variants
export const getVariants = (params = {}) => api('GET', `/api/admin/variants${buildQuery(params)}`);
export const getVariant = (id) => api('GET', `/api/admin/variants/${id}`);
export const createVariant = (d) => api('POST', '/api/admin/variants', d);
export const updateVariant = (id, d) => api('PUT', `/api/admin/variants/${id}`, d);
export const deleteVariant = (id) => api('DELETE', `/api/admin/variants/${id}`);
export const computeBadges = () => api('POST', '/api/admin/products/compute-badges');

// Variant Types
export const getVariantTypes = () => api('GET', '/api/admin/variant-types');
export const createVariantType = (d) => api('POST', '/api/admin/variant-types', d);
export const updateVariantType = (id, d) => api('PUT', `/api/admin/variant-types/${id}`, d);
export const deleteVariantType = (id) => api('DELETE', `/api/admin/variant-types/${id}`);

// Images
export const getImages = () => api('GET', '/api/admin/images');
export const deleteImage = (filename) => api('DELETE', `/api/admin/images/${filename}`);

// Categories
export const getCategories = (params = {}) => api('GET', `/api/admin/categories${buildQuery(params)}`);
export const createCategory = (d) => api('POST', '/api/admin/categories', d);
export const updateCategory = (id, d) => api('PUT', `/api/admin/categories/${id}`, d);
export const deleteCategory = (id) => api('DELETE', `/api/admin/categories/${id}`);
export const getCategoryProducts = (id, type) => api('GET', `/api/admin/categories/${id}/products${buildQuery({ type })}`);
export const saveCategoryProductsSort = (id, type, sortData) => api('POST', `/api/admin/categories/${id}/products/sort`, { type, sort_data: sortData });

// Subcategories
export const createSubCategory = (d) => api('POST', '/api/admin/subcategories', d);
export const updateSubCategory = (id, d) => api('PUT', `/api/admin/subcategories/${id}`, d);
export const deleteSubCategory = (id) => api('DELETE', `/api/admin/subcategories/${id}`);

// Brands
export const getBrands = () => api('GET', '/api/admin/brands');
export const createBrand = (d) => api('POST', '/api/admin/brands', d);
export const updateBrand = (id, d) => api('PUT', `/api/admin/brands/${id}`, d);
export const deleteBrand = (id) => api('DELETE', `/api/admin/brands/${id}`);

// Orders
export const getOrders = (params = {}) => api('GET', `/api/admin/orders${buildQuery(params)}`);
export const getOrder = (id) => api('GET', `/api/admin/orders/${id}`);
export const updateOrderStatus = (id, status, extra = {}) => api('PUT', `/api/admin/orders/${id}/status`, { status, ...extra });

// Users
export const getUsers = (params = {}) => api('GET', `/api/admin/users${buildQuery(params)}`);
export const createUser = (d) => api('POST', '/api/admin/users', d);
export const updateUser = (id, d) => api('PUT', `/api/admin/users/${id}`, d);
export const deleteUser = (id) => api('DELETE', `/api/admin/users/${id}`);

// Roles
export const getRoles = () => api('GET', '/api/admin/roles');
export const createRole = (d) => api('POST', '/api/admin/roles', d);
export const deleteRole = (id) => api('DELETE', `/api/admin/roles/${id}`);
export const getPermissions = () => api('GET', '/api/admin/permissions');
export const updateRolePermissions = (id, permIds) =>
  api('PUT', `/api/admin/roles/${id}/permissions`, { permission_ids: permIds });

// Warranties
export const getWarranties = (params = {}) => api('GET', `/api/admin/warranties${buildQuery(params)}`);
export const createWarranty = (d) => api('POST', '/api/admin/warranties', d);
export const updateWarranty = (id, d) => api('PUT', `/api/admin/warranties/${id}`, d);
export const deleteWarranty = (id) => api('DELETE', `/api/admin/warranties/${id}`);

// Flash Sales
export const getFlashSales = () => api('GET', '/api/admin/flash-sales');
export const createFlashSale = (d) => api('POST', '/api/admin/flash-sales', d);
export const updateFlashSale = (id, d) => api('PUT', `/api/admin/flash-sales/${id}`, d);
export const deleteFlashSale = (id) => api('DELETE', `/api/admin/flash-sales/${id}`);
export const bulkDeleteFlashSales = (ids) => api('POST', '/api/admin/flash-sales/bulk-delete', { ids });
export const bulkToggleFlashSales = (ids, isActive) => api('POST', '/api/admin/flash-sales/bulk-toggle', { ids, is_active: isActive });
export const updateFlashSaleCampaign = (d) => api('PUT', '/api/admin/flash-sales/campaign/update', d);

// Analytics
export const getAnalytics = (params = {}) => api('GET', `/api/admin/visitors${buildQuery(params)}`);
export const getVisitorSessions = (params = {}) => api('GET', `/api/admin/analytics/visitor-sessions${buildQuery(params)}`);

// Returns & Exchanges
export const getReturns = (params = {}) => api('GET', `/api/admin/returns${buildQuery(params)}`);
export const getReturnDetail = (id) => api('GET', `/api/admin/returns/${id}`);
export const handleReturnAction = (id, data) => api('PUT', `/api/admin/returns/${id}/action`, data);

// Members & Loyalty
export const getMembers = (params = {}) => api('GET', `/api/admin/members${buildQuery(params)}`);
export const adjustMemberPoints = (id, points, reason) => api('PUT', `/api/admin/members/${id}/points`, { points, reason });
export const toggleMemberBlacklist = (id) => api('PUT', `/api/admin/members/${id}/blacklist`);
export const getMemberPointsHistory = (id) => api('GET', `/api/admin/members/${id}/history`);
export const getMemberDetail = (id, params = {}) => api('GET', `/api/admin/members/${id}/detail${buildQuery(params)}`);

// Promotions
export const getPromotions = () => api('GET', '/api/admin/promotions');
export const getPromotion = (id) => api('GET', `/api/admin/promotions/${id}`);
export const createPromotion = (d) => api('POST', '/api/admin/promotions', d);
export const updatePromotion = (id, d) => api('PUT', `/api/admin/promotions/${id}`, d);
export const deletePromotion = (id) => api('DELETE', `/api/admin/promotions/${id}`);
export const togglePromotionStatus = (id, active) => api('PATCH', `/api/admin/promotions/${id}/status`, { is_active: active });
export const getVouchers = getPromotions;
export const createVoucher = createPromotion;
export const updateVoucher = updatePromotion;
export const deleteVoucher = deletePromotion;

// Reviews
export const getReviews = (params = {}) => api('GET', `/api/admin/reviews${buildQuery(params)}`);
export const replyToReview = (id, reply) => api('POST', `/api/admin/reviews/${id}/reply`, { reply });
export const updateReviewStatus = (id, status) => api('PUT', `/api/admin/reviews/${id}/status`, { status });
export const bulkUploadReviews = (reviews) => api('POST', '/api/admin/reviews/bulk', { reviews });

// Ranks
export const getRanks = () => api('GET', '/api/admin/ranks');
export const createRank = (d) => api('POST', '/api/admin/ranks', d);
export const updateRank = (id, d) => api('PUT', `/api/admin/ranks/${id}`, d);
export const deleteRank = (id) => api('DELETE', `/api/admin/ranks/${id}`);

// Variants CSV Import/Export
export async function downloadVariantsCsv() {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['X-Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/api/admin/variants/export`, { headers });
  if (!res.ok) throw new Error('Không thể xuất dữ liệu');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'danh_sach_bien_the.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function importVariantsCsv(file) {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['X-Authorization'] = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/admin/variants/import`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const bulkUpdateVariantImages = (variantIds, images) =>
  api('POST', '/api/admin/variants/bulk-images', { variant_ids: variantIds, images });
