import { formatPrice } from '../../../utils/helpers.js';
import { API_BASE } from '../../../services/config.js';
import { getToken } from '../../../services/authService.js?v=1.0.20';

/**
 * BankTransferModal — Shows VietQR code and bank transfer info after order.
 */
export class BankTransferModal {
  constructor(orderId, total) {
    this._orderId = orderId;
    this._total = total;
  }

  async render() {
    const wrap = document.createElement('div');
    wrap.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm';
    wrap.id = 'bank-transfer-modal';

    // Fetch QR data from backend
    let qrData = null;
    try {
      const token = getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/payment/bank-qr/${this._orderId}`, { headers });
      const json = await res.json();
      if (json.success) qrData = json.data;
    } catch (e) {
      console.error('Failed to load bank QR:', e);
    }

    if (!qrData) {
      wrap.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
          <p class="text-red-600 font-semibold">Không thể tải thông tin chuyển khoản.</p>
          <button id="close-bank-modal" class="mt-4 px-6 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold">Đóng</button>
        </div>
      `;
      this._bindClose(wrap);
      return wrap;
    }

    wrap.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease]">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 text-white">
          <h3 class="text-lg font-bold">Chuyển Khoản Ngân Hàng</h3>
          <p class="text-xs text-indigo-100 mt-1">Quét mã QR hoặc chuyển khoản thủ công</p>
        </div>

        <div class="p-6 space-y-5">
          <!-- QR Code -->
          <div class="flex justify-center">
            <img src="${qrData.qr_url}" alt="VietQR" class="w-56 h-56 rounded-xl border-2 border-gray-100 shadow-sm" />
          </div>

          <!-- Bank Info -->
          <div class="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Ngân hàng</span>
              <span class="font-bold text-gray-900">${qrData.bank_code}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Số tài khoản</span>
              <div class="flex items-center gap-2">
                <span class="font-bold text-gray-900 font-mono">${qrData.account_no}</span>
                <button data-copy="${qrData.account_no}" class="copy-btn text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase">Copy</button>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Chủ tài khoản</span>
              <span class="font-bold text-gray-900">${qrData.account_name}</span>
            </div>
            <div class="flex justify-between border-t pt-2.5">
              <span class="text-gray-500">Số tiền</span>
              <span class="font-black text-lg text-indigo-700">${formatPrice(qrData.amount)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Nội dung CK</span>
              <div class="flex items-center gap-2">
                <span class="font-bold text-red-600 font-mono">${qrData.content}</span>
                <button data-copy="${qrData.content}" class="copy-btn text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase">Copy</button>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-gray-400 text-center leading-5">
            Vui lòng chuyển khoản <strong>đúng số tiền</strong> và <strong>nội dung</strong> như trên.<br>
            Đơn hàng sẽ được xác nhận sau khi nhận được tiền.
          </p>

          <button id="close-bank-modal" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold text-sm rounded-xl hover:opacity-90 transition">
            Tôi Đã Chuyển Khoản
          </button>
        </div>
      </div>
    `;

    this._bindClose(wrap);
    this._bindCopy(wrap);
    return wrap;
  }

  _bindClose(wrap) {
    wrap.querySelector('#close-bank-modal')?.addEventListener('click', () => {
      wrap.remove();
    });
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) wrap.remove();
    });
  }

  _bindCopy(wrap) {
    wrap.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.copy;
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = '✓';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
        });
      });
    });
  }
}
