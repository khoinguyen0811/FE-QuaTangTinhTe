import { createUserAddress, updateUserAddress, deleteUserAddress } from '../../../services/userService.js';

export class ProfileAddresses {
  constructor(page) {
    this.page = page;

    // Bind action handlers to window.accountPage
    this.page.openAddressForm = this.openAddressForm.bind(this);
    this.page.setAddressDefault = this.setAddressDefault.bind(this);
    this.page.deleteAddress = this.deleteAddress.bind(this);
  }

  _field(label, type, id, placeholder, required = false, value = '', pattern = '', maxlength = '') {
    return `
      <div class="mb-4">
        <label for="${id}" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">${label}</label>
        <input type="${type}" id="${id}" placeholder="${placeholder}" ${required ? 'required' : ''} ${pattern ? `pattern="${pattern}"` : ''} ${maxlength ? `maxlength="${maxlength}"` : ''}
          value="${value}"
          class="w-full h-11 px-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white" />
      </div>
    `;
  }

  render() {
    const pinIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-950" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
      </svg>
    `;

    const pinIconLarge = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-zinc-300 mx-auto mb-4" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
      </svg>
    `;

    return `
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
        <h2 class="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
          ${pinIcon}
          <span>Sổ địa chỉ giao hàng</span>
        </h2>
        ${this.page._addresses.length < 5 ? `
          <button onclick="window.accountPage.openAddressForm(null)"
            class="h-9 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition">
            + Thêm Địa Chỉ
          </button>
        ` : ''}
      </div>

      <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-4">
        Danh sách địa chỉ (${this.page._addresses.length}/5). Trên thiết bị di động, vuốt thẻ địa chỉ sang trái để xóa nhanh.
      </p>

      <div id="addresses-list-container" class="space-y-4">
        ${this.page._addresses.length === 0 ? `
          <div class="text-center py-16">
            ${pinIconLarge}
            <p class="text-sm font-bold text-zinc-400 mb-6">Chưa có địa chỉ nào được lưu.</p>
            <button onclick="window.accountPage.openAddressForm(null)" class="h-11 px-8 bg-zinc-950 text-white rounded-xl text-xs font-black tracking-widest uppercase hover:bg-amber-500 transition">
              + THÊM ĐỊA CHỈ MỚI
            </button>
          </div>
        ` : this.page._addresses.map(addr => `
          <!-- Swipe Card wrapper -->
          <div class="relative overflow-hidden rounded-2xl border border-zinc-150/70 bg-white swipe-card" data-address-id="${addr.id}">
            
            <!-- Hidden Swipe Delete Action Behind -->
            <div class="absolute inset-y-0 right-0 w-24 bg-red-650 text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center cursor-pointer z-0"
              onclick="window.accountPage.deleteAddress(${addr.id})">
              XÓA
            </div>

            <!-- Foreground Card -->
            <div class="relative bg-white p-5 z-10 transition-transform duration-300 swipe-card-content flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-black text-zinc-850">${addr.receiver_name}</span>
                  <span class="text-xs text-zinc-400">${addr.receiver_phone}</span>
                  ${addr.is_default ? `<span class="px-2 py-0.5 bg-zinc-900 text-white text-[8px] font-black uppercase tracking-wider rounded-md">Mặc định</span>` : ''}
                </div>
                <div class="text-xs text-zinc-550 mt-2 leading-relaxed">
                  ${addr.address_line}${addr.ward ? ', ' + addr.ward : ''}, ${addr.district}, ${addr.city}
                </div>
                
                <div class="flex items-center gap-3 mt-4 text-[10px] font-bold">
                  <button onclick="window.accountPage.openAddressForm(${addr.id})" class="text-amber-600 hover:text-amber-700">Chỉnh sửa</button>
                  <button onclick="window.accountPage.deleteAddress(${addr.id})" class="text-red-500 hover:text-red-600 md:inline-block hidden">Xóa địa chỉ</button>
                  ${!addr.is_default ? `<button onclick="window.accountPage.setAddressDefault(${addr.id})" class="text-zinc-500 hover:text-zinc-800">Đặt làm mặc định</button>` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  bindEvents(container) {
    const list = container.querySelector('#addresses-list-container');
    if (!list) return;

    const cards = list.querySelectorAll('.swipe-card');
    cards.forEach(card => {
      const content = card.querySelector('.swipe-card-content');
      if (!content) return;

      let startX = 0;
      let isOpen = false;

      card.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        content.style.transition = 'none';
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        const moveX = e.touches[0].clientX - startX;

        if (moveX < 0 && moveX > -120) {
          content.style.transform = `translateX(${moveX}px)`;
        }
      }, { passive: true });

      card.addEventListener('touchend', (e) => {
        content.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        const finalDiff = e.changedTouches[0].clientX - startX;

        if (finalDiff < -50) {
          content.style.transform = 'translateX(-96px)'; // Open delete button
          isOpen = true;
        } else {
          content.style.transform = 'translateX(0)';
          isOpen = false;
        }
      }, { passive: true });
    });
  }

  openAddressForm(addressId) {
    const addr = addressId ? this.page._addresses.find(a => a.id === addressId) : null;
    const title = addr ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng mới';
    const formHtml = `
      <form id="address-submit-form" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${this._field('Họ và Tên *', 'text', 'addr-name', 'Nguyễn Văn A', true, addr ? addr.receiver_name : '')}
          ${this._field('Số Điện Thoại *', 'tel', 'addr-phone', '09xxxxxxxx', true, addr ? addr.receiver_phone : '', '0[0-9]{9}', '10')}
        </div>
        ${this._field('Địa Chỉ *', 'text', 'addr-line', 'Số nhà, đường...', true, addr ? addr.address_line : '')}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${this._field('Tỉnh / Thành Phố *', 'text', 'addr-city', 'Hồ Chí Minh', true, addr ? addr.city : '')}
          ${this._field('Quận', 'text', 'addr-district', 'Quận 1', false, addr ? addr.district : '')}
          ${this._field('Phường / Xã', 'text', 'addr-ward', 'Bến Nghé', false, addr ? addr.ward || '' : '')}
        </div>
        <label class="flex items-center gap-3 cursor-pointer select-none py-2">
          <input type="checkbox" id="addr-default" ${addr?.is_default ? 'checked' : ''} class="w-4 h-4 rounded text-zinc-900 border-zinc-200 focus:ring-zinc-900" />
          <span class="text-xs font-bold text-zinc-700">Đặt làm địa chỉ mặc định</span>
        </label>
        <p id="addr-submit-error" class="text-xs font-bold text-red-650 hidden"></p>
        <button type="submit" class="w-full h-11 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase transition hover:bg-zinc-800">Lưu Địa Chỉ</button>
      </form>
    `;

    this.page._openModal(title, formHtml, (sheet) => {
      sheet.querySelector('#address-submit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = sheet.querySelector('#addr-submit-error');
        errEl.classList.add('hidden');

        const payload = {
          receiver_name: sheet.querySelector('#addr-name').value.trim(),
          receiver_phone: sheet.querySelector('#addr-phone').value.trim(),
          address_line: sheet.querySelector('#addr-line').value.trim(),
          ward: sheet.querySelector('#addr-ward').value.trim(),
          district: sheet.querySelector('#addr-district').value.trim(),
          city: sheet.querySelector('#addr-city').value.trim(),
          is_default: sheet.querySelector('#addr-default').checked ? 1 : 0
        };

        try {
          if (addressId) {
            await updateUserAddress(addressId, payload);
          } else {
            await createUserAddress(payload);
          }
          this.page._closeModal();
          await this.page._loadData();
          this.page._renderTabContent();
        } catch (err) {
          errEl.textContent = err.message;
          errEl.classList.remove('hidden');
        }
      });
    });
  }

  async setAddressDefault(addressId) {
    const addr = this.page._addresses.find(a => a.id === addressId);
    if (!addr) return;
    try {
      await updateUserAddress(addressId, {
        receiver_name: addr.receiver_name,
        receiver_phone: addr.receiver_phone,
        address_line: addr.address_line,
        ward: addr.ward,
        district: addr.district,
        city: addr.city,
        is_default: 1
      });
      await this.page._loadData();
      this.page._renderTabContent();
    } catch (err) {
      alert(err.message);
    }
  }

  async deleteAddress(addressId) {
    if (!confirm('Bạn có muốn xóa địa chỉ này không?')) return;
    try {
      await deleteUserAddress(addressId);
      await this.page._loadData();
      this.page._renderTabContent();
    } catch (err) {
      alert(err.message);
    }
  }
}
