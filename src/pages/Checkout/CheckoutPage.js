import { cartService } from '../../services/cartService.js';
import { createOrder, getEligibleVouchers, getUserAddresses, createUserAddress, applyCoupon, removeCoupon, recalculateCart } from '../../services/orderService.js?v=1.0.20';
import { formatPrice, navigate } from '../../utils/helpers.js';
import { isLoggedIn, getUser, getToken } from '../../services/authService.js?v=1.0.20';
import { CustomerForm } from './components/CustomerForm.js';
import { OrderSummary } from './components/OrderSummary.js';
import { renderCheckoutHtml } from './CheckoutTemplate.js';
import { BankTransferModal } from './components/BankTransferModal.js';
import { API_BASE } from '../../services/config.js';

export default class CheckoutPage {
  constructor() {
    this._submitting = false;
    this._eligibleVouchers = [];
    this._appliedVouchers = [];
    this._discountAmount = 0;
    this._addresses = [];
    this._selectedAddress = null;
    this._currentUser = null;
    
    // Sub-components
    this.customerForm = new CustomerForm(this);
    this.orderSummary = new OrderSummary(this);
  }

  async render() {
    const wrap = document.createElement('div');
    wrap.className = 'min-h-[60vh] font-sans pt-32 md:pt-40 pb-16';

    const items = cartService.getCart();
    if (items.length === 0) {
      wrap.innerHTML = `
        <div class="flex flex-col items-center px-4 py-20 text-center sm:px-6">
          <h2 class="text-2xl font-bold text-zinc-900">Giỏ hàng trống</h2>
          <button data-nav="/products" class="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-zinc-950 px-8 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-amber-500 hover:text-zinc-950">
            Tiếp Tục Mua Sắm
          </button>
        </div>
      `;
      wrap.querySelector('[data-nav]').addEventListener('click', () => navigate('/products'));
      return wrap;
    }

    const total = cartService.getTotal();
    const shipping = 0;

    // Fetch eligible vouchers only if user is logged in
    this._eligibleVouchers = [];
    this._appliedVouchers = [];
    if (isLoggedIn()) {
      try {
        const res = await getEligibleVouchers(total);
        this._eligibleVouchers = res.data || res || [];
        
        const welcome = this._eligibleVouchers.find(v => v.code === 'WELCOME50K');
        if (welcome && total >= 199000) {
          this._appliedVouchers.push(welcome);
        }
      } catch (err) {
        console.error('Failed to load eligible vouchers:', err);
      }
    }

    // Load addresses for logged in user
    this._addresses = [];
    this._selectedAddress = null;
    this._currentUser = isLoggedIn() ? getUser() : null;

    if (this._currentUser) {
      try {
        const addressRes = await getUserAddresses();
        this._addresses = addressRes.data || [];
        this._selectedAddress = this._addresses.find(a => a.is_default === 1) || this._addresses[0] || null;
      } catch (err) {
        console.error('Failed to load user addresses:', err);
      }
    }

    wrap.innerHTML = renderCheckoutHtml.call(this, items, total, shipping);

    this._bindEvents(wrap, items, total, shipping);
    return wrap;
  }

  _field(label, type, id, placeholder, required = false, defaultValue = '') {
    return `
      <div class="mb-4">
        <label for="${id}" class="mb-2 block text-xs font-bold uppercase tracking-[0.05em] text-zinc-700">${label}</label>
        <input type="${type}" id="${id}" placeholder="${placeholder}" ${required ? 'required' : ''} value="${defaultValue}"
          class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none transition focus:border-amber-500" />
      </div>
    `;
  }

  async _updateTotals(wrap, total, shipping) {
    const items = cartService.getCart();

    try {
      const code = this._appliedVouchers.length > 0 ? this._appliedVouchers[0].code : null;
      const res = await recalculateCart(
        items.map(item => ({
          product_id: item.id,
          variant_id: item.variant_id || null,
          quantity: item.qty,
          unit_price: item.sale_price || item.price
        })),
        code,
        this._selectedAddress ? this._selectedAddress.receiver_phone : null,
        this._currentUser ? this._currentUser.email : null
      );

      const data = res.data || {};
      const discount = parseFloat(data.discount_amount || 0);
      const isFreeShip = data.is_free_shipping || false;
      const actualShipping = isFreeShip ? 0 : shipping;

      this._discountAmount = discount;

      // Update coupon list based on returned promotions
      const couponPromos = (data.applied_promotions || []).filter(p => p.promotion_type === 'coupon');
      this._appliedVouchers = couponPromos;

      // Update discount row in UI
      const discountRow = wrap.querySelector('#discount-row');
      const discountVal = wrap.querySelector('#discount-val');
      const grandTotalVal = wrap.querySelector('#grand-total-val');
      
      if (discount > 0) {
        discountRow?.classList.remove('hidden');
        if (discountVal) discountVal.textContent = `-${formatPrice(discount)}`;
      } else {
        discountRow?.classList.add('hidden');
      }

      if (grandTotalVal) {
        grandTotalVal.textContent = formatPrice(Math.max(0, total - discount + actualShipping));
      }

      // Update shipping badge
      const shippingVal = wrap.querySelector('#shipping-fee-val') || wrap.querySelector('#shipping-val');
      if (shippingVal) {
        shippingVal.textContent = actualShipping === 0 ? 'Free ship' : formatPrice(actualShipping);
        if (actualShipping === 0) {
          shippingVal.className = 'font-semibold text-emerald-600';
        } else {
          shippingVal.className = 'font-semibold text-zinc-900';
        }
      }

      // Render applied vouchers list
      const appliedList = wrap.querySelector('#applied-vouchers-list');
      if (appliedList) {
        appliedList.innerHTML = this._appliedVouchers.map((v, i) => `
          <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            ${v.code}
            <button type="button" data-remove-code="${v.code}" class="text-amber-500 hover:text-amber-800 font-extrabold focus:outline-none ml-1 select-none">×</button>
          </span>
        `).join('');

        appliedList.querySelectorAll('[data-remove-code]').forEach(btn => {
          btn.addEventListener('click', async () => {
            await removeCoupon();
            this._appliedVouchers = [];
            this._updateTotals(wrap, total, shipping);
          });
        });
      }

      // Render gifts dynamically in order summary!
      let giftsContainer = wrap.querySelector('#order-gifts-summary-container');
      if (!giftsContainer) {
        giftsContainer = document.createElement('div');
        giftsContainer.id = 'order-gifts-summary-container';
        giftsContainer.className = 'mt-3 pt-3 border-t border-dashed border-zinc-200 space-y-3';
      }
      
      const gifts = data.gifts || [];
      if (gifts.length > 0) {
        giftsContainer.innerHTML = `
          <p class="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Quà tặng kèm của bạn</p>
          ${gifts.map(gift => `
            <div class="flex items-center gap-3">
              <div class="relative h-12 w-12 shrink-0">
                <div class="h-full w-full overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span class="absolute -right-1.5 -top-1.5 z-10 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[8px] font-bold text-white">${gift.quantity}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-semibold text-zinc-900">${gift.name}</p>
                <div class="mt-0.5 text-[10px] text-zinc-400 flex items-center gap-2">
                  ${gift.sku ? `<span>SKU: ${gift.sku}</span>` : ''}
                  ${gift.size ? `<span class="px-1 py-0.2 bg-zinc-100 rounded text-[9px]">Size: ${gift.size}</span>` : ''}
                  ${gift.material ? `<span class="px-1 py-0.2 bg-zinc-100 rounded text-[9px]">Màu: ${gift.material}</span>` : ''}
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-600">Quà tặng (0đ)</span>
            </div>
          `).join('')}
        `;
        
        const summaryBox = wrap.querySelector('.space-y-4');
        if (summaryBox && !wrap.querySelector('#order-gifts-summary-container')) {
          summaryBox.parentNode.insertBefore(giftsContainer, summaryBox.nextSibling);
        }
      } else {
        const existingContainer = wrap.querySelector('#order-gifts-summary-container');
        if (existingContainer) existingContainer.remove();
      }

      // Re-render eligible list checkboxes checked state
      wrap.querySelectorAll('[data-voucher-code]').forEach(checkbox => {
        const c = checkbox.dataset.voucherCode;
        checkbox.checked = this._appliedVouchers.some(av => av.code === c);
      });

    } catch (err) {
      console.error('Failed to recalculate totals:', err);
    }
  }

  _bindEvents(wrap, items, total, shipping) {
    wrap.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => navigate(btn.dataset.nav));
    });

    // Initialize voucher totals
    this._updateTotals(wrap, total, shipping);

    // Bind subcomponents
    this.customerForm.bindEvents(wrap);
    this.orderSummary.bindEvents(wrap, total, shipping);

    const form = wrap.querySelector('#checkout-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this._submitting) return;

      const get = (id) => wrap.querySelector(`#${id}`)?.value.trim() || '';
      const name = get('cust-name');
      const phone = get('cust-phone');
      const address = get('cust-address');
      const city = get('cust-city');
      const district = get('cust-district');
      const ward = get('cust-ward');
      const errEl = wrap.querySelector('#checkout-error');

      if (!name || !phone || !address || !city || !district) {
        errEl.textContent = 'Vui lòng điền đầy đủ thông tin bắt buộc.';
        errEl.classList.remove('hidden');
        return;
      }

      errEl.classList.add('hidden');
      this._submitting = true;

      const btn = wrap.querySelector('#place-order-btn');
      btn.textContent = 'Đang Xử Lý...';
      btn.disabled = true;

      const paymentMethod = wrap.querySelector('input[name="payment_method"]:checked')?.value || 'cod';

      // Save Address to Book if checked and not duplicate
      if (wrap.querySelector('#save-to-address-book')?.checked) {
        const alreadySaved = this._addresses.some(a => 
          a.receiver_name === name && 
          a.receiver_phone === phone && 
          a.address_line === address && 
          a.city === city && 
          a.district === district && 
          (a.ward || '') === (ward || '')
        );
        if (!alreadySaved) {
          try {
            await createUserAddress({
              receiver_name: name,
              receiver_phone: phone,
              address_line: address,
              city: city,
              district: district,
              ward: ward,
              is_default: this._addresses.length === 0 ? 1 : 0
            });
          } catch (e) {
            console.error('Failed to save address:', e);
          }
        }
      }

      try {
        const orderData = {
          customer_name: name,
          customer_email: get('cust-email'),
          customer_phone: phone,
          shipping_address: [address, ward, district, city].filter(Boolean).join(', '),
          note: get('cust-note'),
          payment_method: paymentMethod,
          items: items.map((item) => ({ 
            product_id: item.id, 
            variant_id: item.variant_id || null, 
            quantity: item.qty, 
            price: item.sale_price || item.price, 
            size: item.size || '', 
            color: item.color || '',
            custom_image_url: item.custom_image_url || null,
            custom_text: item.custom_text || null
          })),
          total: total + shipping - this._discountAmount,
          applied_vouchers: this._appliedVouchers.map(v => v.code),
        };

        const res = await createOrder(orderData);
        cartService.clearCart();
        const orderId = res?.order_id || res?.data?.id;

        // Handle payment method routing
        if (paymentMethod === 'momo' && orderId) {
          btn.textContent = 'Đang chuyển tới MoMo...';
          try {
            const token = getToken();
            const momoRes = await fetch(`${API_BASE}/api/payment/momo/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ order_id: orderId })
            });
            const momoJson = await momoRes.json();
            if (momoJson.success && momoJson.data?.payUrl) {
              window.location.href = momoJson.data.payUrl;
              return;
            }
            errEl.textContent = momoJson.error || 'Không thể tạo thanh toán MoMo.';
            errEl.classList.remove('hidden');
            btn.textContent = 'Đặt Hàng Ngay';
            btn.disabled = false;
            this._submitting = false;
            return;
          } catch (momoErr) {
            errEl.textContent = 'Lỗi kết nối MoMo. Đơn hàng đã tạo, vui lòng thử lại.';
            errEl.classList.remove('hidden');
            btn.textContent = 'Đặt Hàng Ngay';
            btn.disabled = false;
            this._submitting = false;
            return;
          }
        }

        if (paymentMethod === 'bank' && orderId) {
          wrap.querySelector('#checkout-grid').style.display = 'none';
          const successEl = wrap.querySelector('#order-success');
          successEl.style.display = 'block';
          const orderIdEl = wrap.querySelector('#order-id-display');
          if (orderIdEl) orderIdEl.textContent = `Mã đơn hàng: #${orderId}`;
          // Show bank transfer QR modal
          const modal = new BankTransferModal(orderId, total - this._discountAmount + shipping);
          const modalEl = await modal.render();
          document.body.appendChild(modalEl);
        } else {
          // COD — show success
          wrap.querySelector('#checkout-grid').style.display = 'none';
          const successEl = wrap.querySelector('#order-success');
          successEl.style.display = 'block';
          const orderIdEl = wrap.querySelector('#order-id-display');
          if (orderIdEl && orderId) orderIdEl.textContent = `Mã đơn hàng: #${orderId}`;
        }

        const viewOrderBtn = wrap.querySelector('#view-order-btn');
        if (viewOrderBtn && orderId) {
          viewOrderBtn.addEventListener('click', () => navigate(`/account?order_id=${orderId}`));
        }
      } catch (err) {
        errEl.textContent = err.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
        errEl.classList.remove('hidden');
        btn.textContent = 'Đặt Hàng Ngay';
        btn.disabled = false;
      }

      this._submitting = false;
    });
  }
}
