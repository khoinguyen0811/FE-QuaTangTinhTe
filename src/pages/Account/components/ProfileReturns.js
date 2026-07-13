import { formatDate } from '../../../utils/helpers.js';
import { createReturnRequest } from '../../../services/userService.js';

export class ProfileReturns {
  constructor(page) {
    this.page = page;
    this.page.openReturnDetails = this.openReturnDetails.bind(this);
    this.page.openExternalReturnRequestForm = this.openExternalReturnRequestForm.bind(this);
  }

  render() {
    let filtered = this.page._returns;

    if (this.page._returnFilter !== 'all') {
      if (this.page._returnFilter === 'pending') {
        filtered = filtered.filter(r => ['requested', 'approved', 'approved_shipping', 'shipper_pickup', 'received_checking', 'shipping_to_seller', 'received_by_seller', 'shipping_to_buyer'].includes(r.status));
      } else if (this.page._returnFilter === 'completed') {
        filtered = filtered.filter(r => r.status === 'completed');
      } else if (this.page._returnFilter === 'rejected') {
        filtered = filtered.filter(r => r.status === 'rejected');
      }
    }

    const tabs = [
      { id: 'all', label: 'Tất cả' },
      { id: 'pending', label: 'Đang xử lý' },
      { id: 'completed', label: 'Hoàn tất' },
      { id: 'rejected', label: 'Từ chối' }
    ];

    const refreshIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-950" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
      </svg>
    `;

    const infoIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-zinc-300 mx-auto mb-4" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
        <path d="M12 9h.01" />
        <path d="M11 12h1v4h1" />
      </svg>
    `;

    return `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-100">
        <h2 class="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
          ${refreshIcon}
          <span>Đổi / Trả hàng</span>
          <span class="ml-1 px-1.5 py-0.5 text-[9px] font-black tracking-normal bg-emerald-500 text-white rounded normal-case">Free</span>
        </h2>
        <button data-open-external-return
          class="h-9 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition">
          + Tạo yêu cầu đổi hàng
        </button>
      </div>

      <div class="flex gap-2 border-b border-zinc-100 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
        ${tabs.map(t => `
          <button data-return-filter="${t.id}"
            class="pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 focus:outline-none transition ${this.page._returnFilter === t.id ? 'border-zinc-950 text-zinc-950 font-black' : 'border-transparent text-zinc-400'}">
            ${t.label}
          </button>
        `).join('')}
      </div>

      <div class="space-y-4">
        ${filtered.length === 0 ? `
          <div class="text-center py-16">
            ${infoIcon}
            <p class="text-sm font-bold text-zinc-400">Chưa có yêu cầu đổi/trả nào.</p>
            <p class="text-xs text-zinc-450 mt-1">Bạn có thể tạo yêu cầu cho đơn Shopee, TikTok Shop hoặc bấm Đổi/Trả tại đơn mua trên web.</p>
          </div>
        ` : filtered.map(req => this.returnCardHTML(req)).join('')}
      </div>
    `;
  }

  bindEvents(container) {
    container.querySelector('[data-open-external-return]')?.addEventListener('click', () => {
      this.openExternalReturnRequestForm();
    });

    container.querySelectorAll('[data-return-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.page._returnFilter = btn.dataset.returnFilter;
        this.page._renderTabContent();
      });
    });
  }

  returnCardHTML(req) {
    const statusMap = {
      requested: { text: 'Yêu cầu mới', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      approved: { text: 'Đã duyệt', color: 'text-blue-650 bg-blue-50 border-blue-200' },
      approved_shipping: { text: 'Đã duyệt', color: 'text-blue-650 bg-blue-50 border-blue-200' },
      shipper_pickup: { text: 'Shipper đang lấy', color: 'text-indigo-650 bg-indigo-50 border-indigo-200' },
      received_checking: { text: 'Đang kiểm tra', color: 'text-purple-650 bg-purple-50 border-purple-200' },
      shipping_to_seller: { text: 'Đang vận chuyển về', color: 'text-indigo-650 bg-indigo-50 border-indigo-200' },
      received_by_seller: { text: 'Đã nhận hàng', color: 'text-purple-650 bg-purple-50 border-purple-200' },
      shipping_to_buyer: { text: 'Đang gửi lại', color: 'text-teal-650 bg-teal-50 border-teal-200' },
      completed: { text: 'Hoàn tất', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      rejected: { text: 'Bị từ chối', color: 'text-red-600 bg-red-50 border-red-200' }
    };
    const current = statusMap[req.status] || { text: req.status, color: 'text-zinc-650 bg-zinc-50 border-zinc-200' };

    const typeLabels = {
      exchange_size: 'Đổi size sản phẩm',
      return_goods: 'Trả hàng hoàn tiền',
      refund: 'Trả hàng hoàn tiền',
      exchange_product: 'Đổi sản phẩm khác'
    };
    const typeText = typeLabels[req.type] || req.type;
    const orderLabel = this._orderLabel(req);

    return `
      <div class="border border-zinc-150/70 rounded-2xl bg-white p-5 hover:shadow-md transition">
        <div class="flex flex-wrap items-center justify-between border-b border-zinc-100 pb-3 mb-4 gap-2">
          <div>
            <span class="text-xs font-black text-zinc-800">${this._escape(req.return_code)}</span>
            <span class="text-[10px] text-zinc-400 ml-2">${this._escape(orderLabel)}</span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${current.color}">
            ${current.text}
          </span>
        </div>

        <div class="space-y-2 text-xs">
          <div class="text-zinc-650">Phân loại: <strong class="text-zinc-900">${this._escape(typeText)}</strong></div>
          ${req.exchange_to_size ? `<div class="text-zinc-650">Size muốn đổi: <strong class="text-zinc-900">${this._escape(req.exchange_to_size)}</strong></div>` : ''}
          <div class="text-zinc-650">Tình trạng/Lý do: <span class="text-zinc-800">${this._escape(req.reason)}</span></div>
          ${req.receiver_address ? `<div class="text-zinc-450">Địa chỉ lấy hàng: ${this._escape(req.receiver_address)}</div>` : ''}
          ${req.description ? `<div class="text-zinc-400 italic">Ghi chú: "${this._escape(req.description)}"</div>` : ''}
        </div>

        <div class="flex items-center justify-between border-t border-zinc-100 mt-4 pt-4 flex-wrap gap-2">
          <span class="text-[10px] text-zinc-400">Yêu cầu: ${formatDate(req.created_at)}</span>
          <button onclick="window.accountPage.openReturnDetails(${Number(req.id)})" class="h-9 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition">
            Theo dõi chi tiết →
          </button>
        </div>
      </div>
    `;
  }

  openExternalReturnRequestForm() {
    this._openReturnForm({
      title: 'Tạo yêu cầu đổi hàng',
      isWebOrder: false,
      source: 'shopee',
      orderCode: '',
      defaults: this._receiverDefaults()
    });
  }

  _openReturnForm({ title, isWebOrder, source, orderId = null, orderCode = '', defaults = {} }) {
    const sourceField = isWebOrder ? `
      <input type="hidden" id="ret-source" value="web" />
      <div class="rounded-xl border border-zinc-150 bg-zinc-50 p-3 text-xs">
        <div class="text-[10px] uppercase tracking-wider font-black text-zinc-400 mb-1">Nguồn đơn</div>
        <div class="font-black text-zinc-900">Đơn mua trên website ${this._escape(orderCode)}</div>
      </div>
    ` : `
      <div>
        <label for="ret-source" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Nguồn đơn hàng *</label>
        <select id="ret-source" required class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm font-medium outline-none bg-white focus:border-zinc-950">
          <option value="shopee" ${source === 'shopee' ? 'selected' : ''}>Shopee</option>
          <option value="tiktok_shop" ${source === 'tiktok_shop' ? 'selected' : ''}>TikTok Shop</option>
          <option value="other" ${source === 'other' ? 'selected' : ''}>Khác</option>
        </select>
      </div>
      <div>
        <label for="ret-external-code" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Mã đơn hàng trên sàn *</label>
        <input id="ret-external-code" required maxlength="100" value="${this._escapeAttr(orderCode)}" placeholder="VD: 250601ABC..." class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm font-medium outline-none bg-white focus:border-zinc-950" />
      </div>
    `;

    const formHtml = `
      <form id="return-submit-form" class="space-y-4">
        ${sourceField}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="ret-type" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Loại yêu cầu *</label>
            <select id="ret-type" required class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm font-medium outline-none bg-white focus:border-zinc-950">
              <option value="exchange_size">Đổi size</option>
              <option value="refund">Trả hàng hoàn tiền</option>
              <option value="exchange_product">Đổi sản phẩm khác</option>
            </select>
          </div>
          <div id="ret-size-wrap">
            <label for="ret-exchange-size" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Size muốn đổi sang *</label>
            <select id="ret-exchange-size" class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm font-medium outline-none bg-white focus:border-zinc-950">
              <option value="">-- Chọn size mới --</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
        </div>
        <div>
          <label for="ret-reason" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Tình trạng sản phẩm *</label>
          <select id="ret-reason" required class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm font-medium outline-none bg-white focus:border-zinc-950">
            <option value="">-- Chọn tình trạng --</option>
            <option value="Còn mới, chưa sử dụng, còn nguyên tag">Còn mới, chưa sử dụng, còn nguyên tag</option>
            <option value="Đã thử nhưng chưa dùng, còn nguyên tag">Đã thử nhưng chưa dùng, còn nguyên tag</option>
            <option value="Đã giặt nhẹ, còn nguyên form dáng">Đã giặt nhẹ, còn nguyên form dáng</option>
            <option value="Sản phẩm lỗi hoặc giao sai">Sản phẩm lỗi hoặc giao sai</option>
          </select>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="ret-receiver-name" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Họ tên người nhận *</label>
            <input id="ret-receiver-name" required maxlength="150" value="${this._escapeAttr(defaults.name || '')}" class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm font-medium outline-none bg-white focus:border-zinc-950" />
          </div>
          <div>
            <label for="ret-receiver-phone" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Số điện thoại *</label>
            <input id="ret-receiver-phone" required maxlength="20" value="${this._escapeAttr(defaults.phone || '')}" class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm font-medium outline-none bg-white focus:border-zinc-950" />
          </div>
        </div>
        <div>
          <label for="ret-receiver-address" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Địa chỉ lấy/nhận hàng *</label>
          <textarea id="ret-receiver-address" required rows="3" class="w-full p-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none bg-white resize-none focus:border-zinc-950">${this._escape(defaults.address || '')}</textarea>
        </div>
        <div>
          <label for="ret-desc" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Ghi chú thêm</label>
          <textarea id="ret-desc" rows="3" placeholder="VD: giao giờ hành chính, gọi trước 30 phút..." class="w-full p-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none bg-white resize-none focus:border-zinc-950"></textarea>
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1">Ảnh minh chứng *</label>
          <input type="file" id="ret-images-input" multiple accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" />
          <div class="flex flex-wrap gap-2 items-center">
            <button type="button" id="btn-add-return-image" class="w-16 h-16 border-2 border-dashed border-zinc-200 hover:border-zinc-900 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-800 transition">
              <span class="text-lg font-bold">+</span>
            </button>
            <div id="ret-images-preview" class="flex flex-wrap gap-2"></div>
          </div>
          <p class="text-[10px] text-zinc-400 mt-1">Cần 3-5 ảnh sản phẩm/tag để shop kiểm tra.</p>
        </div>
        <p id="ret-submit-error" class="text-xs font-bold text-red-650 hidden"></p>
        <button type="submit" id="btn-ret-submit" class="w-full h-12 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black tracking-widest transition uppercase">Gửi yêu cầu đổi / trả</button>
      </form>
    `;

    this.page._openModal(title, formHtml, (sheet) => this._bindReturnForm(sheet, { isWebOrder, orderId }));
  }

  _bindReturnForm(sheet, { isWebOrder, orderId }) {
    const imgInput = sheet.querySelector('#ret-images-input');
    const previewDiv = sheet.querySelector('#ret-images-preview');
    const errEl = sheet.querySelector('#ret-submit-error');
    const typeEl = sheet.querySelector('#ret-type');
    const sizeWrap = sheet.querySelector('#ret-size-wrap');
    const sizeEl = sheet.querySelector('#ret-exchange-size');
    let base64Files = [];

    const syncSizeField = () => {
      const exchangeSize = typeEl.value === 'exchange_size';
      sizeWrap.classList.toggle('hidden', !exchangeSize);
      sizeEl.required = exchangeSize;
      if (!exchangeSize) sizeEl.value = '';
    };
    typeEl.addEventListener('change', syncSizeField);
    syncSizeField();

    sheet.querySelector('#btn-add-return-image')?.addEventListener('click', () => imgInput.click());

    imgInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (base64Files.length + files.length > 5) {
        alert('Chỉ được chọn tối đa 5 hình ảnh.');
        imgInput.value = '';
        return;
      }
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          base64Files.push(event.target.result);
          renderPreviews();
        };
        reader.readAsDataURL(file);
      });
      imgInput.value = '';
    });

    const renderPreviews = () => {
      previewDiv.innerHTML = base64Files.map((src, idx) => `
        <div class="relative w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
          <img src="${src}" class="w-full h-full object-cover" />
          <button type="button" data-remove-preview="${idx}" class="absolute top-0.5 right-0.5 w-4 h-4 bg-zinc-900/80 hover:bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center focus:outline-none">×</button>
        </div>
      `).join('');
      previewDiv.querySelectorAll('[data-remove-preview]').forEach(btn => {
        btn.addEventListener('click', () => {
          base64Files.splice(Number(btn.dataset.removePreview), 1);
          renderPreviews();
        });
      });
    };

    sheet.querySelector('#return-submit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      errEl.classList.add('hidden');

      if (base64Files.length < 3) {
        errEl.textContent = 'Vui lòng tải lên tối thiểu 3 ảnh sản phẩm còn tag.';
        errEl.classList.remove('hidden');
        return;
      }

      const submitBtn = sheet.querySelector('#btn-ret-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang gửi...';

      try {
        const payload = {
          order_source: isWebOrder ? 'web' : sheet.querySelector('#ret-source').value,
          order_id: isWebOrder ? orderId : null,
          external_order_code: isWebOrder ? '' : sheet.querySelector('#ret-external-code').value.trim(),
          type: typeEl.value,
          exchange_to_size: sizeEl.value,
          reason: sheet.querySelector('#ret-reason').value,
          description: sheet.querySelector('#ret-desc').value.trim(),
          receiver_name: sheet.querySelector('#ret-receiver-name').value.trim(),
          receiver_phone: sheet.querySelector('#ret-receiver-phone').value.trim(),
          receiver_address: sheet.querySelector('#ret-receiver-address').value.trim(),
          images: base64Files
        };

        await createReturnRequest(payload);
        alert('Tạo yêu cầu đổi trả thành công.');
        this.page._closeModal();
        await this.page._loadData();
        this.page.setTab('returns');
      } catch (err) {
        errEl.textContent = err.message || 'Lỗi gửi yêu cầu.';
        errEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi yêu cầu đổi / trả';
      }
    });
  }

  openReturnDetails(reqId) {
    const req = this.page._returns.find(r => Number(r.id) === Number(reqId));
    if (!req) return;

    const stages = [
      { id: 'requested', label: 'Yêu cầu' },
      { id: 'approved_shipping', label: 'Duyệt' },
      { id: 'shipper_pickup', label: 'Ship lấy' },
      { id: 'received_checking', label: 'Kiểm tra' },
      { id: 'completed', label: 'Hoàn tất' }
    ];
    const currentIdx = stages.findIndex(s => s.id === req.status);
    const timelineHtml = req.status === 'rejected' ? `
      <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-750 rounded-xl">
        <span class="text-lg">!</span>
        <div>
          <div class="text-xs font-black uppercase tracking-wider">Yêu cầu đã bị từ chối</div>
          ${req.rejection_reason ? `<div class="text-xs mt-1">${this._escape(req.rejection_reason)}</div>` : ''}
        </div>
      </div>
    ` : `
      <div class="flex justify-between items-start pt-6 pb-2 relative min-h-[80px]">
        ${stages.map((stg, idx) => `
          <div class="timeline-node flex-1 text-center relative z-10 ${idx <= currentIdx ? 'active' : ''} ${idx === currentIdx ? 'current' : ''}">
            <div class="timeline-dot w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-black text-white ${idx <= currentIdx ? 'bg-zinc-900' : 'bg-zinc-250'}">${idx <= currentIdx ? '✓' : ''}</div>
            <div class="text-[9px] font-black uppercase mt-2 tracking-wider ${idx <= currentIdx ? 'text-zinc-900' : 'text-zinc-400'}">${stg.label}</div>
            <div class="timeline-line absolute top-2.5 left-1/2 w-full h-[2px] bg-zinc-200 -z-10 ${idx <= currentIdx ? 'bg-zinc-900' : 'bg-zinc-200'}"></div>
          </div>
        `).join('')}
      </div>
    `;

    const detailHtml = `
      <div class="space-y-6">
        <div>
          <div class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Trạng thái xử lý</div>
          ${timelineHtml}
        </div>
        <div class="text-xs space-y-1">
          <div class="text-zinc-500">Đơn hàng liên quan: <strong class="text-zinc-900">${this._escape(this._orderLabel(req))}</strong></div>
          <div class="text-zinc-500">Phân loại: <strong class="text-zinc-900">${this._escape(req.type)}</strong></div>
          ${req.exchange_to_size ? `<div class="text-zinc-500">Size muốn đổi: <strong class="text-zinc-900">${this._escape(req.exchange_to_size)}</strong></div>` : ''}
          <div class="text-zinc-500">Tình trạng/Lý do: <span class="text-zinc-900">${this._escape(req.reason)}</span></div>
          <div class="text-zinc-500">Người nhận: <span class="text-zinc-900">${this._escape(req.receiver_name || '')} - ${this._escape(req.receiver_phone || '')}</span></div>
          <div class="text-zinc-500">Địa chỉ: <span class="text-zinc-900">${this._escape(req.receiver_address || '')}</span></div>
        </div>
        ${req.images && req.images.length > 0 ? `
          <div>
            <div class="text-[10px] font-black tracking-widest text-zinc-400 mb-3 uppercase">Ảnh đính kèm</div>
            <div class="flex flex-wrap gap-2">
              ${req.images.map(img => {
      const src = img.startsWith('http') ? img : '.' + img;
      return `
                  <div class="w-16 h-16 border rounded-xl overflow-hidden">
                    <img src="${this._escapeAttr(src)}" class="w-full h-full object-cover" />
                  </div>
                `;
    }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    this.page._openModal(`Yêu cầu ${this._escape(req.return_code)}`, detailHtml);
  }

  _receiverDefaults(order = null) {
    if (order) {
      return {
        name: order.customer_name || this.page._userProfile?.full_name || '',
        phone: order.customer_phone || this.page._userProfile?.phone || '',
        address: order.shipping_address || this._profileAddressText()
      };
    }

    const defaultAddress = this._defaultAddress();
    return {
      name: defaultAddress?.receiver_name || this.page._userProfile?.full_name || '',
      phone: defaultAddress?.receiver_phone || this.page._userProfile?.phone || '',
      address: defaultAddress ? this._addressText(defaultAddress) : ''
    };
  }

  _defaultAddress() {
    return this.page._addresses.find(addr => addr.is_default === true || Number(addr.is_default) === 1) || this.page._addresses[0] || null;
  }

  _profileAddressText() {
    const defaultAddress = this._defaultAddress();
    return defaultAddress ? this._addressText(defaultAddress) : '';
  }

  _addressText(addr) {
    return [
      addr.address_line,
      addr.ward,
      addr.district,
      addr.city
    ].filter(Boolean).join(', ');
  }

  _orderLabel(req) {
    const sourceLabels = {
      web: 'Web',
      shopee: 'Shopee',
      tiktok_shop: 'TikTok Shop',
      other: 'Khác'
    };
    if (req.order_source && req.order_source !== 'web') {
      return `${sourceLabels[req.order_source] || req.order_source}: ${req.external_order_code || '-'}`;
    }
    return `Web: #ORD-${req.order_id}`;
  }

  _escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]);
  }

  _escapeAttr(value) {
    return this._escape(value).replace(/`/g, '&#96;');
  }
}
