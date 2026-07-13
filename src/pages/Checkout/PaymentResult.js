import { API_BASE } from '../../services/config.js';
import { getToken } from '../../services/authService.js?v=1.0.20';
import { formatPrice, navigate } from '../../utils/helpers.js';

/**
 * PaymentResult — Landing page after MoMo payment redirect.
 * Route: /checkout/result?order_id=XXX
 */
export default class PaymentResult {
  async render() {
    const wrap = document.createElement('div');
    wrap.className = 'min-h-[60vh] font-sans pt-32 md:pt-40 pb-16';

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');

    if (!orderId) {
      wrap.innerHTML = this._errorHTML('Không tìm thấy thông tin đơn hàng.');
      this._bindNav(wrap);
      return wrap;
    }

    // Show loading
    wrap.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-sm text-gray-500">Đang kiểm tra trạng thái thanh toán...</p>
      </div>
    `;

    // Fetch payment status
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/payment/status/${orderId}`, { headers });
      const json = await res.json();

      if (!json.success || !json.data) {
        wrap.innerHTML = this._errorHTML('Không thể kiểm tra trạng thái thanh toán.');
        this._bindNav(wrap);
        return wrap;
      }

      const order = json.data;
      const isPaid = order.payment_status === 'paid';
      const isFailed = order.payment_status === 'failed';

      if (isPaid) {
        wrap.innerHTML = this._successHTML(orderId, order);
      } else if (isFailed) {
        wrap.innerHTML = this._failedHTML(orderId, order);
      } else {
        wrap.innerHTML = this._pendingHTML(orderId, order);
      }
    } catch (err) {
      wrap.innerHTML = this._errorHTML('Lỗi kết nối máy chủ.');
    }

    this._bindNav(wrap);
    return wrap;
  }

  _successHTML(orderId, order) {
    return `
      <div class="mx-auto max-w-lg px-4 py-16 text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 class="text-3xl font-black uppercase tracking-wide text-zinc-950">Thanh Toán Thành Công</h1>
        <p class="mt-4 text-sm text-zinc-600">Đơn hàng <strong>#${orderId}</strong> đã được thanh toán thành công.</p>
        <p class="mt-2 text-sm text-zinc-500">Tổng: <strong class="text-green-700">${formatPrice(order.total_amount)}</strong></p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button data-nav="/account?order_id=${orderId}" class="h-12 px-8 rounded-xl border border-zinc-950 bg-white text-xs font-bold uppercase tracking-widest text-zinc-950 hover:bg-zinc-50 transition">Xem Đơn Hàng</button>
          <button data-nav="/" class="h-12 px-8 rounded-xl bg-zinc-950 text-xs font-bold uppercase tracking-widest text-white hover:bg-amber-500 hover:text-zinc-950 transition">Về Trang Chủ</button>
        </div>
      </div>
    `;
  }

  _failedHTML(orderId, order) {
    return `
      <div class="mx-auto max-w-lg px-4 py-16 text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <h1 class="text-3xl font-black uppercase tracking-wide text-zinc-950">Thanh Toán Thất Bại</h1>
        <p class="mt-4 text-sm text-zinc-600">Đơn hàng <strong>#${orderId}</strong> chưa được thanh toán.</p>
        <p class="mt-2 text-xs text-zinc-400">Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button data-nav="/cart" class="h-12 px-8 rounded-xl bg-amber-500 text-xs font-bold uppercase tracking-widest text-zinc-950 hover:bg-amber-600 transition">Thử Lại</button>
          <button data-nav="/" class="h-12 px-8 rounded-xl bg-zinc-950 text-xs font-bold uppercase tracking-widest text-white hover:bg-amber-500 hover:text-zinc-950 transition">Về Trang Chủ</button>
        </div>
      </div>
    `;
  }

  _pendingHTML(orderId, order) {
    return `
      <div class="mx-auto max-w-lg px-4 py-16 text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h1 class="text-3xl font-black uppercase tracking-wide text-zinc-950">Đang Chờ Thanh Toán</h1>
        <p class="mt-4 text-sm text-zinc-600">Đơn hàng <strong>#${orderId}</strong> đang chờ xác nhận thanh toán.</p>
        <p class="mt-2 text-xs text-zinc-400">Hệ thống sẽ tự động cập nhật khi nhận được thanh toán.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button data-nav="/account?order_id=${orderId}" class="h-12 px-8 rounded-xl border border-zinc-950 bg-white text-xs font-bold uppercase tracking-widest text-zinc-950 hover:bg-zinc-50 transition">Xem Đơn Hàng</button>
          <button data-nav="/" class="h-12 px-8 rounded-xl bg-zinc-950 text-xs font-bold uppercase tracking-widest text-white hover:bg-amber-500 hover:text-zinc-950 transition">Về Trang Chủ</button>
        </div>
      </div>
    `;
  }

  _errorHTML(msg) {
    return `
      <div class="mx-auto max-w-lg px-4 py-16 text-center">
        <p class="text-red-600 font-semibold">${msg}</p>
        <button data-nav="/" class="mt-6 h-12 px-8 rounded-xl bg-zinc-950 text-xs font-bold uppercase tracking-widest text-white hover:bg-amber-500 hover:text-zinc-950 transition">Về Trang Chủ</button>
      </div>
    `;
  }

  _bindNav(wrap) {
    wrap.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.nav));
    });
  }
}
