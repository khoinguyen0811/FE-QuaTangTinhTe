import { API_BASE, STORAGE_KEYS } from '../../../services/config.js';

function getAdminToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
}

export async function loadBadges(container) {
  const token = getAdminToken();
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Authorization': `Bearer ${token}`
      },
    });
    if (!res.ok) return;
    const data = await res.json();
    const stats = data.data || data;
    
    // 1. Pending orders
    if (stats.pending_orders > 0) {
      const b = container.querySelector('#badge-pending');
      if (b) { b.textContent = stats.pending_orders; b.classList.remove('hidden'); }
      
      const pb = container.querySelector('#parent-badge-orders_group-pending');
      if (pb) { pb.textContent = stats.pending_orders; pb.classList.remove('hidden'); }
    }
    
    // 2. Low stock count
    if (stats.low_stock_count > 0) {
      const b = container.querySelector('#badge-lowstock');
      if (b) b.classList.remove('hidden');
      
      const pb = container.querySelector('#parent-badge-products_group-lowstock');
      if (pb) pb.classList.remove('hidden');
    }
  } catch { }
}
