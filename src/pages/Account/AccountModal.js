import { getIconSvg } from './icons.js';

export const accountModalMethods = {
openMobileMenu() {
  try {
    const menuHtml = `
      <div class="space-y-1">
        <!-- Tạm thời ẩn theo yêu cầu:
        <button id="btn-menu-points" class="w-full flex items-center justify-between py-3.5 border-b text-xs font-black uppercase text-zinc-700 hover:bg-zinc-50 px-2 rounded-xl transition">
          <span class="flex items-center gap-3">
            <span class="w-5 h-5 flex items-center justify-center text-zinc-950">${getIconSvg('diamond', 'w-5 h-5')}</span>
            <span>Hạng & Điểm</span>
          </span>
          <span>➔</span>
        </button>
        -->
        <button id="btn-menu-profile" class="w-full flex items-center justify-between py-3.5 border-b text-xs font-black uppercase text-zinc-700 hover:bg-zinc-50 px-2 rounded-xl transition">
          <span class="flex items-center gap-3">
            <span class="w-5 h-5 flex items-center justify-center text-zinc-950">${getIconSvg('user', 'w-5 h-5')}</span>
            <span>Thông Tin Cá Nhân</span>
          </span>
          <span>➔</span>
        </button>
        <button id="btn-menu-addresses" class="w-full flex items-center justify-between py-3.5 border-b text-xs font-black uppercase text-zinc-700 hover:bg-zinc-50 px-2 rounded-xl transition">
          <span class="flex items-center gap-3">
            <span class="w-5 h-5 flex items-center justify-center text-zinc-950">${getIconSvg('map-pin', 'w-5 h-5')}</span>
            <span>Sổ Địa Chỉ</span>
          </span>
          <span>➔</span>
        </button>
        <button id="btn-menu-logout" class="w-full flex items-center justify-between py-4 text-xs font-black uppercase text-red-650 hover:bg-red-50 px-2 rounded-xl transition">
          <span class="flex items-center gap-3">
            <span class="w-5 h-5 flex items-center justify-center text-red-600">${getIconSvg('logout', 'w-5 h-5')}</span>
            <span>Đăng Xuất</span>
          </span>
          <span>➔</span>
        </button>
      </div>
    `;
    this._openModal('Menu Tác Vụ Khác', menuHtml, (sheet) => {
      sheet.querySelector('#btn-menu-points')?.addEventListener('click', () => {
        this._closeModal();
        this.setTab('points');
      });
      sheet.querySelector('#btn-menu-profile')?.addEventListener('click', () => {
        this._closeModal();
        this.setTab('profile');
      });
      sheet.querySelector('#btn-menu-addresses')?.addEventListener('click', () => {
        this._closeModal();
        this.setTab('addresses');
      });
      sheet.querySelector('#btn-menu-logout')?.addEventListener('click', () => {
        this._closeModal();
        this.handleLogout();
      });
    });
  } catch (err) {
    console.error(err);
    alert('Lỗi mở menu: ' + err.message);
  }
},

_openModal(title, htmlContent, onRender = null) {
  this._closeModal(true);
  const backdrop = document.createElement('div');
  backdrop.className = 'custom-modal-backdrop';
  backdrop.id = 'modal-backdrop';
  const sheet = document.createElement('div');
  sheet.className = 'custom-modal-sheet';
  sheet.id = 'modal-sheet';
  sheet.setAttribute('data-lenis-prevent', '');
  sheet.innerHTML = `
    <div class="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
      <h3 class="text-xs font-black uppercase tracking-widest text-zinc-950">${title}</h3>
      <button id="modal-close-btn" class="p-1 text-zinc-400 hover:text-zinc-900 focus:outline-none"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>
    </div>
    <div class="overflow-y-auto px-6 py-5" style="max-height: calc(85vh - 60px);">${htmlContent}</div>
  `;
  document.body.appendChild(backdrop);
  document.body.appendChild(sheet);
  sheet.offsetHeight;
  backdrop.classList.add('open');
  sheet.classList.add('open');
  document.body.style.overflow = 'hidden';
  backdrop.addEventListener('click', () => this._closeModal());
  sheet.querySelector('#modal-close-btn')?.addEventListener('click', () => this._closeModal());
  if (onRender) onRender(sheet);
},

_closeModal(immediate = false) {
  const backdrops = document.querySelectorAll('.custom-modal-backdrop');
  const sheets = document.querySelectorAll('.custom-modal-sheet');
  
  if (immediate) {
    backdrops.forEach(b => b.remove());
    sheets.forEach(s => s.remove());
    document.body.style.overflow = '';
  } else {
    backdrops.forEach(b => b.classList.remove('open'));
    sheets.forEach(s => s.classList.remove('open'));
    setTimeout(() => {
      backdrops.forEach(b => b.remove());
      sheets.forEach(s => s.remove());
    }, 300);
    document.body.style.overflow = '';
  }
},
};
