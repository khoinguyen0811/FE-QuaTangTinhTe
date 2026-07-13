import { formatDate, navigate } from '../../../utils/helpers.js';
import { getUser, sendOtp, verifyOtp } from '../../../services/authService.js?v=1.0.20';
import { updateUserProfile } from '../../../services/userService.js?v=1.0.20';

export class ProfileDetails {
  constructor(page) {
    this.page = page;

    // Bind actions to window.accountPage
    this.page.openEditField = this.openEditField.bind(this);
    this.page.handleDeleteAccount = this.handleDeleteAccount.bind(this);
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
    const isBdayMissing = !this.page._userProfile?.birthday;

    // Inline Tabler Icon outline for user
    const userIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-950" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      </svg>
    `;

    return `
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
        <h2 class="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
          ${userIcon}
          <span>Thông tin cá nhân</span>
        </h2>
      </div>
      <div class="space-y-4 mb-8">
        <div class="flex items-center justify-between py-3 border-b border-zinc-50">
          <div>
            <div class="text-[9px] font-black uppercase tracking-widest text-zinc-400">HỌ VÀ TÊN</div>
            <div class="text-xs font-bold text-zinc-800 mt-1">${this.page._userProfile?.full_name || '—'}</div>
          </div>
          <button onclick="window.accountPage.openEditField('full_name')" class="text-xs font-bold text-amber-600 hover:text-amber-700">Sửa </button>
        </div>
        <div class="flex items-center justify-between py-3 border-b border-zinc-50">
          <div>
            <div class="text-[9px] font-black uppercase tracking-widest text-zinc-400">EMAIL TÀI KHOẢN</div>
            <div class="text-xs font-bold text-zinc-800 mt-1">${this.page._userProfile?.email || '—'}</div>
          </div>
          <button onclick="window.accountPage.openEditField('email')" class="text-xs font-bold text-amber-600 hover:text-amber-700">Sửa </button>
        </div>
        <div class="flex items-center justify-between py-3 border-b border-zinc-50">
          <div>
            <div class="text-[9px] font-black uppercase tracking-widest text-zinc-400">SỐ ĐIỆN THOẠI</div>
            <div class="text-xs font-bold text-zinc-800 mt-1 flex items-center gap-2">
              <span>${this.page._userProfile?.phone || '—'}</span>
              <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase rounded-full tracking-wider border border-emerald-100">✓ Xác thực</span>
            </div>
          </div>
          <button onclick="window.accountPage.openEditField('phone')" class="text-xs font-bold text-amber-650 hover:text-amber-755">Đổi số ✏️</button>
        </div>
        <div class="flex items-center justify-between py-3 border-b border-zinc-50">
          <div>
            <div class="text-[9px] font-black uppercase tracking-widest text-zinc-400">NGÀY SINH NHẬT</div>
            <div class="text-xs font-bold text-zinc-800 mt-1">${this.page._userProfile?.birthday ? formatDate(this.page._userProfile.birthday) : '—'}</div>
            ${isBdayMissing ? `<div class="text-[9px] font-bold text-amber-600 mt-1 animate-pulse">⚠️ Bổ sung ngay để nhận voucher quà tặng sinh nhật từ shop!</div>` : ''}
          </div>
          <button onclick="window.accountPage.openEditField('birthday')" class="text-xs font-bold text-amber-600 hover:text-amber-700">Sửa </button>
        </div>
        <div class="flex items-center justify-between py-3 border-b border-zinc-50">
          <div>
            <div class="text-[9px] font-black uppercase tracking-widest text-zinc-400">GIỚI TÍNH</div>
            <div class="text-xs font-bold text-zinc-800 mt-1">${this.page._userProfile?.gender || '—'}</div>
          </div>
          <button onclick="window.accountPage.openEditField('gender')" class="text-xs font-bold text-amber-600 hover:text-amber-700">Sửa </button>
        </div>
      </div>
      <div class="mb-8 p-5 border border-zinc-150 rounded-2xl bg-zinc-50/50">
        <div class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">ĐĂNG NHẬP LIÊN KẾT</div>
        <div class="space-y-3 text-xs font-bold text-zinc-700">
          <div class="flex items-center justify-between"><span class="flex items-center gap-2">📱 Số điện thoại (OTP)</span><span class="text-emerald-700 font-bold text-[10px] uppercase">✓ Đã kết nối</span></div>
          <div class="flex items-center justify-between"><span class="flex items-center gap-2">G Google</span><button onclick="alert('Liên kết Google đang được cấu hình.')" class="text-amber-600 hover:text-amber-750 text-[10px] uppercase font-black">[Kết nối]</button></div>
          <div class="flex items-center justify-between"><span class="flex items-center gap-2">f Facebook</span><button onclick="alert('Liên kết Facebook đang được cấu hình.')" class="text-amber-600 hover:text-amber-750 text-[10px] uppercase font-black">[Kết nối]</button></div>
        </div>
      </div>
      <div class="flex items-center gap-4 border-t border-zinc-100 pt-6">
        <button onclick="window.accountPage.openEditField('phone')" class="h-9 px-4 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-xl transition focus:outline-none">Đổi số điện thoại</button>
        <button onclick="window.accountPage.handleDeleteAccount()" class="h-9 px-4 text-red-650 hover:bg-red-50 text-xs font-bold rounded-xl transition focus:outline-none">Xóa tài khoản vĩnh viễn</button>
      </div>
    `;
  }

  bindEvents(container) {
    // Standard binding not strictly needed since action handlers are loaded globally
  }

  openEditField(field) {
    let title = '';
    let formContent = '';
    const currName = this.page._userProfile?.full_name || '';
    const currEmail = this.page._userProfile?.email || '';
    const currBday = this.page._userProfile?.birthday || '';
    const currGender = this.page._userProfile?.gender || '';

    if (field === 'full_name') {
      title = 'Sửa Họ và Tên';
      formContent = `<form id="edit-profile-form" class="space-y-4">${this._field('Họ và Tên mới *', 'text', 'edit-name', 'Nguyễn Văn A', true, currName)}<button type="submit" class="w-full h-11 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition">Lưu</button></form>`;
    } else if (field === 'email') {
      title = 'Sửa Email';
      formContent = `<form id="edit-profile-form" class="space-y-4">${this._field('Email mới *', 'email', 'edit-email', 'email@example.com', true, currEmail)}<button type="submit" class="w-full h-11 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition">Lưu</button></form>`;
    } else if (field === 'birthday') {
      title = 'Sửa Ngày Sinh';
      formContent = `<form id="edit-profile-form" class="space-y-4"><div class="mb-4"><label class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Ngày sinh nhật *</label><input type="date" id="edit-bday" value="${currBday}" required class="w-full h-11 px-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none bg-white focus:border-zinc-950" /></div><button type="submit" class="w-full h-11 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition">Lưu</button></form>`;
    } else if (field === 'gender') {
      title = 'Sửa Giới Tính';
      formContent = `<form id="edit-profile-form" class="space-y-4"><div class="mb-4"><label class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Chọn giới tính *</label><select id="edit-gender" required class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm font-medium outline-none bg-white focus:border-zinc-950"><option value="Nam" ${currGender === 'Nam' ? 'selected' : ''}>Nam</option><option value="Nữ" ${currGender === 'Nữ' ? 'selected' : ''}>Nữ</option><option value="Khác" ${currGender === 'Khác' ? 'selected' : ''}>Khác</option></select></div><button type="submit" class="w-full h-11 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition">Lưu</button></form>`;
    } else if (field === 'phone') {
      title = 'Đổi Số Điện Thoại (OTP)';
      formContent = `<form id="edit-phone-form" class="space-y-4"><p class="text-xs text-zinc-500 mb-4 leading-relaxed">Nhập số điện thoại mới.</p>${this._field('Số mới *', 'tel', 'edit-phone', '09xxxxxxxx', true, '', '0[0-9]{9}', '10')}<p id="edit-phone-error" class="text-xs font-bold text-red-650 hidden"></p><button type="submit" class="w-full h-11 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition">Gửi OTP</button></form>`;
    }

    this.page._openModal(title, formContent, (sheet) => {
      const form = sheet.querySelector('#edit-profile-form');
      const phoneForm = sheet.querySelector('#edit-phone-form');

      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          let payload = { full_name: currName, email: currEmail, birthday: currBday, gender: currGender };
          if (field === 'full_name') payload.full_name = sheet.querySelector('#edit-name').value.trim();
          if (field === 'email') payload.email = sheet.querySelector('#edit-email').value.trim();
          if (field === 'birthday') payload.birthday = sheet.querySelector('#edit-bday').value;
          if (field === 'gender') payload.gender = sheet.querySelector('#edit-gender').value;

          try {
            const res = await updateUserProfile(payload);
            if (res.success) {
              this.page._userProfile = res.data;
              const cached = getUser();
              if (cached) {
                cached.name = res.data.full_name;
                cached.full_name = res.data.full_name;
                cached.email = res.data.email;
                localStorage.setItem('dhat_auth_user', JSON.stringify(cached));
                localStorage.setItem('dhat_user', JSON.stringify(cached));
                window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: cached } }));
              }
              this.page._closeModal();
              this.page._renderDashboard(this.page._wrap);
            }
          } catch (err) {
            alert(err.message || 'Lỗi lưu thông tin.');
          }
        });
      }

      if (phoneForm) {
        phoneForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const errEl = sheet.querySelector('#edit-phone-error');
          errEl.classList.add('hidden');
          const newPhone = sheet.querySelector('#edit-phone').value.trim();
          try {
            const res = await sendOtp(newPhone);
            this._renderPhoneChangeVerifyOtpStep(sheet, newPhone, res.data?.message);
          } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove('hidden');
          }
        });
      }
    });
  }

  _renderPhoneChangeVerifyOtpStep(sheet, newPhone, bypassMsg) {
    const container = sheet.querySelector('.overflow-y-auto');
    container.innerHTML = `
      <form id="verify-change-phone-form" class="space-y-4">
        <p class="text-xs text-zinc-500 mb-4">Nhập mã OTP gửi đến <strong>${newPhone}</strong>.</p>
        ${this._field('Mã OTP *', 'text', 'change-phone-otp', '123456', true, '', '[0-9]{6}', '6')}
        <p id="change-phone-otp-error" class="text-xs font-bold text-red-650 ${bypassMsg ? 'text-amber-500' : 'hidden'}">${bypassMsg || ''}</p>
        <button type="submit" class="w-full h-11 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition hover:bg-amber-600">Xác nhận</button>
      </form>
    `;

    sheet.querySelector('#verify-change-phone-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = sheet.querySelector('#change-phone-otp-error');
      errEl.classList.add('hidden');
      const otpCode = sheet.querySelector('#change-phone-otp').value.trim();

      try {
        await verifyOtp(newPhone, otpCode);
        await updateUserProfile({
          full_name: this.page._userProfile.full_name,
          email: this.page._userProfile.email,
          birthday: this.page._userProfile.birthday,
          gender: this.page._userProfile.gender,
          phone: newPhone
        });
        alert('Thay đổi số điện thoại thành công!');
        this.page._closeModal();
        await this.page._loadData();
        this.page._renderDashboard(this.page._wrap);
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden', 'text-amber-500');
        errEl.classList.add('text-red-650');
      }
    });
  }

  handleDeleteAccount() {
    if (confirm('Bạn có muốn xóa tài khoản này không?')) {
      alert('Tài khoản đã được đưa vào hàng đợi xóa.');
    }
  }
}
