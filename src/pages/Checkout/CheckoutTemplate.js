export function renderCheckoutHtml(items, total, shipping) {
  const brandName = window.APP_SETTINGS?.brand_name || 'Mắt Bão WS';
  return `
      <div class="border-b border-zinc-200 bg-zinc-50">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav class="mb-3 flex flex-wrap items-center gap-2 text-xs tracking-[0.05em] text-zinc-500">
            <span data-nav="/" class="cursor-pointer transition hover:text-amber-600">Trang chủ</span>
            <span>›</span>
            <span data-nav="/cart" class="cursor-pointer transition hover:text-amber-600">Giỏ hàng</span>
            <span>›</span>
            <span class="font-semibold text-zinc-900">Thanh Toán</span>
          </nav>
          <h1 class="text-3xl font-black uppercase tracking-[0.05em] text-zinc-950 sm:text-4xl">Thanh Toán</h1>
        </div>
      </div>

      <div id="checkout-grid" class="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr),380px] lg:gap-10 lg:px-8 lg:py-10">
        <div class="order-2 lg:order-1 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <form id="checkout-form" novalidate class="space-y-6">
            <!-- Customer & Shipping Form -->
            <div id="customer-form-container">
              ${this.customerForm.render()}
            </div>

            <div>
              <h3 class="border-b-2 border-zinc-900 pb-3 text-sm font-black uppercase tracking-[0.05em] text-zinc-950">Phương Thức Thanh Toán</h3>
              <div class="mt-5 space-y-3">
                ${[
      { id: 'pm-cod', value: 'cod', label: 'Thanh toán khi nhận hàng (COD)', checked: true },
      { id: 'pm-bank', value: 'bank', label: 'Chuyển khoản ngân hàng' },
      { id: 'pm-momo', value: 'momo', label: 'Ví MoMo' },
    ].map((pm) => `
                  <label class="pm-label flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-4 transition has-[input:checked]:border-amber-500 has-[input:checked]:bg-amber-50/50">
                    <input type="radio" id="${pm.id}" name="payment_method" value="${pm.value}" ${pm.checked ? 'checked' : ''} class="h-4 w-4 accent-amber-500" />
                    <span class="text-sm font-medium text-zinc-900">${pm.label}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <p id="checkout-error" class="hidden text-sm text-red-600"></p>
            <button type="submit" id="place-order-btn" class="inline-flex h-12 w-full items-center justify-center rounded-xl bg-amber-500 px-4 text-xs font-black uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-amber-600">
              Đặt Hàng Ngay
            </button>
          </form>
        </div>

        <!-- Order Summary & Vouchers Sidebar -->
        <div id="order-summary-container" class="order-1 lg:order-2 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
          ${this.orderSummary.render(items, total, shipping)}
        </div>
      </div>

      <div id="order-success" class="mx-auto hidden max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" class="mx-auto mb-6">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h2 class="text-3xl font-black uppercase tracking-[0.05em] text-zinc-950">Đặt Hàng Thành Công</h2>
        <p class="mt-4 text-sm leading-7 text-zinc-600">Cảm ơn bạn đã mua sắm tại <strong>${brandName}</strong>.</p>
        <p id="order-id-display" class="mt-2 text-sm text-zinc-500"></p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button id="view-order-btn" class="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-950 bg-white px-8 text-xs font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-zinc-50">
            Xem Đơn Hàng
          </button>
          <button data-nav="/" class="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-950 px-8 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-amber-500 hover:text-zinc-950">
            Về Trang Chủ
          </button>
        </div>
      </div>
    `;
}
