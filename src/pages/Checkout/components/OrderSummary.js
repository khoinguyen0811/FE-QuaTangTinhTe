import { formatPrice, navigate } from '../../../utils/helpers.js';
import { isLoggedIn } from '../../../services/authService.js?v=1.0.20';
import { applyCoupon, removeCoupon } from '../../../services/orderService.js?v=1.0.20';
import { cartService } from '../../../services/cartService.js';

export class OrderSummary {
  constructor(page) {
    this.page = page;
  }

  render(items, total, shipping) {
    return `
      <h3 class="mb-5 border-b border-zinc-200 pb-4 text-sm font-black uppercase tracking-[0.05em] text-zinc-950">Đơn Hàng (${items.length} sản phẩm)</h3>
      <div class="space-y-4">
        ${items.map((item) => {
          const price = item.sale_price && item.sale_price < item.price ? item.sale_price : item.price;
          return `
            <div class="flex items-center gap-3">
              <div class="relative h-16 w-16 shrink-0">
                <div class="h-full w-full overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-100">
                  <img src="${item.image || 'https://images.pexels.com/photos/236915/pexels-photo-236915.jpeg?auto=compress&cs=tinysrgb&w=400'}" class="h-full w-full object-contain p-2" />
                </div>
                <span class="absolute -right-1.5 -top-1.5 z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-950 px-1 text-[10px] font-bold text-white">${item.qty}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-zinc-900">${item.name}</p>
                <div class="mt-1 text-xs text-zinc-500 flex items-center gap-2">
                  ${item.category_name ? `<span>${item.category_name}</span>` : ''}
                  ${item.size && item.size !== 'Mặc định' && item.size !== 'Default Title' ? `<span class="px-1.5 py-0.5 bg-zinc-100 text-zinc-800 rounded font-bold text-[10px]">Size: ${item.size}</span>` : ''}
                  ${item.color && item.color !== 'Mặc định' && item.color !== 'Default Title' ? `<span class="px-1.5 py-0.5 bg-zinc-100 text-zinc-800 rounded font-bold text-[10px] ml-1">Màu: ${item.color}</span>` : ''}
                </div>
              </div>
              <span class="text-sm font-bold text-zinc-900">${formatPrice(price * item.qty)}</span>
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- Voucher Section -->
      <div class="mt-6 border-t border-zinc-200 pt-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">Mã Giảm Giá (Coupon)</h4>
        <div class="flex gap-2">
          <input type="text" id="voucher-input" placeholder="Nhập mã coupon..." class="h-9 flex-1 rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-amber-500 uppercase font-bold" />
          <button type="button" id="apply-voucher-btn" class="h-9 px-4 bg-zinc-950 text-white hover:bg-amber-500 hover:text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200">Áp dụng</button>
        </div>
        <p id="voucher-error" class="text-xs text-rose-600 mt-1.5 hidden font-medium"></p>
        <div id="applied-vouchers-list" class="mt-3 flex flex-wrap gap-1.5">
          <!-- Render applied vouchers here -->
        </div>
        
        <!-- Eligible Vouchers List -->
        <div id="eligible-vouchers-container" class="mt-4 hidden">
          <p class="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2">Voucher khả dụng</p>
          <div id="eligible-vouchers-list" data-lenis-prevent class="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            <!-- Render eligible vouchers here -->
          </div>
        </div>
      </div>

      <div class="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-zinc-500">Tạm tính</span>
          <span class="font-semibold text-zinc-900">${formatPrice(total)}</span>
        </div>
        <div id="discount-row" class="flex items-center justify-between hidden">
          <span class="text-zinc-500">Giảm giá</span>
          <span id="discount-val" class="font-semibold text-emerald-600">-0đ</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-zinc-500">Vận chuyển</span>
          <span id="shipping-val" class="font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-zinc-900'}">${shipping === 0 ? 'Free ship' : formatPrice(shipping)}</span>
        </div>
        <div class="flex items-center justify-between border-t border-zinc-200 pt-4 text-base font-black text-zinc-950">
          <span>Tổng Cộng</span>
          <span id="grand-total-val" class="text-amber-500">${formatPrice(total + shipping)}</span>
        </div>
      </div>
    `;
  }

  bindEvents(wrap, total, shipping) {
    const applyBtn = wrap.querySelector('#apply-voucher-btn');
    const voucherInput = wrap.querySelector('#voucher-input');
    const voucherError = wrap.querySelector('#voucher-error');

    applyBtn?.addEventListener('click', async () => {
      if (!voucherInput || !voucherError) return;
      voucherError.classList.add('hidden');
      if (!isLoggedIn()) {
        voucherError.textContent = 'Vui lòng đăng nhập để áp dụng mã giảm giá.';
        voucherError.classList.remove('hidden');
        return;
      }
      const code = voucherInput.value.trim().toUpperCase();
      if (!code) return;

      applyBtn.disabled = true;
      applyBtn.textContent = 'Đang áp dụng...';

      try {
        const cartItems = cartService.getCart();
        const res = await applyCoupon(
          code,
          cartItems.map(item => ({
            product_id: item.id,
            variant_id: item.variant_id || null,
            quantity: item.qty,
            unit_price: item.sale_price || item.price
          }))
        );

        if (res.success && res.data?.applied_promotions?.length > 0) {
          this.page._appliedVouchers = [{ code }];
          voucherInput.value = '';
          await this.page._updateTotals(wrap, total, shipping);
        } else {
          voucherError.textContent = 'Mã giảm giá đã hết hạn, hết lượt dùng, hoặc đơn hàng không còn đủ điều kiện áp dụng.';
          voucherError.classList.remove('hidden');
        }
      } catch (err) {
        voucherError.textContent = err.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện áp dụng.';
        voucherError.classList.remove('hidden');
      } finally {
        applyBtn.disabled = false;
        applyBtn.textContent = 'Áp dụng';
      }
    });
  }
}
