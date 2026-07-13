export class CustomerForm {
  constructor(page) {
    this.page = page;
  }

  render() {
    const user = this.page._currentUser;
    const addresses = this.page._addresses;
    const selected = this.page._selectedAddress;

    const defName = selected?.receiver_name || user?.full_name || '';
    const defPhone = selected?.receiver_phone || user?.phone || '';
    const defEmail = user?.email || '';
    const defAddress = selected?.address_line || '';
    const defCity = selected?.city || '';
    const defDistrict = selected?.district || '';
    const defWard = selected?.ward || '';

    // Saved Addresses Selector HTML
    let addressSelectorHtml = '';
    if (addresses.length > 0) {
      addressSelectorHtml = `
        <div class="mb-5">
          <label for="saved-address-select" class="mb-2 block text-xs font-bold uppercase tracking-[0.05em] text-zinc-700">Chọn Địa Chỉ Giao Hàng Đã Lưu</label>
          <select id="saved-address-select" class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none transition focus:border-amber-500 bg-white">
            ${addresses.map(a => `
              <option value="${a.id}" ${selected && a.id === selected.id ? 'selected' : ''}>
                ${a.receiver_name} - ${a.receiver_phone} (${a.address_line}, ${a.ward ? a.ward + ', ' : ''}${a.district}, ${a.city}) ${a.is_default ? '[Mặc định]' : ''}
              </option>
            `).join('')}
            <option value="new">-- Sử dụng địa chỉ khác --</option>
          </select>
        </div>
      `;
    }

    // Save address checkbox
    let saveAddressCheckboxHtml = '';
    if (user) {
      saveAddressCheckboxHtml = `
        <label class="flex items-center gap-2 cursor-pointer mt-1 mb-4 select-none">
          <input type="checkbox" id="save-to-address-book" class="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500" checked />
          <span class="text-xs font-bold text-zinc-700">Lưu địa chỉ này vào sổ địa chỉ</span>
        </label>
      `;
    }

    return `
      <div>
        <h3 class="border-b-2 border-zinc-900 pb-3 text-sm font-black uppercase tracking-[0.05em] text-zinc-950">Thông Tin Khách Hàng</h3>
        <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          ${this.page._field('Họ và Tên *', 'text', 'cust-name', 'Nguyễn Văn A', true, defName)}
          ${this.page._field('Số Điện Thoại *', 'tel', 'cust-phone', '09xx xxx xxx', true, defPhone)}
        </div>
        ${this.page._field('Email', 'email', 'cust-email', 'email@example.com', false, defEmail)}
      </div>

      <div class="mt-6">
        <h3 class="border-b-2 border-zinc-900 pb-3 text-sm font-black uppercase tracking-[0.05em] text-zinc-950">Địa Chỉ Giao Hàng</h3>
        <div class="mt-5">
          ${addressSelectorHtml}
          ${this.page._field('Địa Chỉ *', 'text', 'cust-address', 'Số nhà, đường...', true, defAddress)}
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          ${this.page._field('Tỉnh / Thành Phố *', 'text', 'cust-city', 'TP. Hồ Chí Minh', true, defCity)}
          ${this.page._field('Quận', 'text', 'cust-district', 'Quận 1', true, defDistrict)}
          ${this.page._field('Phường / Xã', 'text', 'cust-ward', 'Phường Bến Nghé', false, defWard)}
        </div>
        ${saveAddressCheckboxHtml}
        ${this.page._field('Ghi Chú', 'text', 'cust-note', 'Giao giờ hành chính, gói trước khi giao...')}
      </div>
    `;
  }

  bindEvents(wrap) {
    const selectEl = wrap.querySelector('#saved-address-select');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const val = e.target.value;
        const setVal = (id, v) => {
          const el = wrap.querySelector(`#${id}`);
          if (el) el.value = v;
        };
        if (val === 'new') {
          setVal('cust-name', this.page._currentUser?.full_name || '');
          setVal('cust-phone', this.page._currentUser?.phone || '');
          setVal('cust-address', '');
          setVal('cust-city', '');
          setVal('cust-district', '');
          setVal('cust-ward', '');
        } else {
          const addr = this.page._addresses.find(a => a.id == val);
          if (addr) {
            setVal('cust-name', addr.receiver_name);
            setVal('cust-phone', addr.receiver_phone);
            setVal('cust-address', addr.address_line);
            setVal('cust-city', addr.city);
            setVal('cust-district', addr.district);
            setVal('cust-ward', addr.ward || '');
          }
        }
      });
    }
  }
}
