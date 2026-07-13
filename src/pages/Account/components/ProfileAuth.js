import { login, sendOtp } from '../../../services/authService.js?v=1.0.20';
import { profileAuthOtpMethods } from './ProfileAuthOtp.js';
import { profileAuthRecoveryMethods } from './ProfileAuthRecovery.js';

export class ProfileAuth {
  constructor(page) {
    this.page = page;
  }

  render() {
    const tab = this.page._tab;
    return `
      <div class="max-width-container mx-auto px-4 py-16">
        <div id="auth-main-container" class="max-w-[460px] mx-auto p-8 border border-zinc-200/80 rounded-2xl bg-white shadow-xl shadow-zinc-100/40">
          
          <!-- Tab Headers -->
          <div class="flex border-b border-zinc-100 mb-8">
            <button id="tab-login-btn" class="flex-1 pb-4 text-xs font-black tracking-widest text-center border-b-2 ${tab === 'login' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400'} transition focus:outline-none">
              ĐĂNG NHẬP
            </button>
            <button id="tab-register-btn" class="flex-1 pb-4 text-xs font-black tracking-widest text-center border-b-2 ${tab === 'register' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400'} transition focus:outline-none">
              ĐĂNG KÝ
            </button>
          </div>

          <div id="auth-form-content"></div>

        </div>
      </div>
    `;
  }

  bindEvents(container) {
    const formContent = container.querySelector('#auth-form-content');
    const setTab = (tab) => {
      this.page._tab = tab;
      const loginBtn = container.querySelector('#tab-login-btn');
      const registerBtn = container.querySelector('#tab-register-btn');
      
      if (tab === 'login') {
        loginBtn.classList.add('border-zinc-950', 'text-zinc-950');
        loginBtn.classList.remove('border-transparent', 'text-zinc-400');
        registerBtn.classList.add('border-transparent', 'text-zinc-400');
        registerBtn.classList.remove('border-zinc-950', 'text-zinc-950');
        this.renderLoginForm(formContent);
      } else {
        registerBtn.classList.add('border-zinc-950', 'text-zinc-950');
        registerBtn.classList.remove('border-transparent', 'text-zinc-400');
        loginBtn.classList.add('border-transparent', 'text-zinc-400');
        loginBtn.classList.remove('border-zinc-950', 'text-zinc-950');
        this.renderRegisterForm(formContent);
      }
    };

    container.querySelector('#tab-login-btn').addEventListener('click', () => setTab('login'));
    container.querySelector('#tab-register-btn').addEventListener('click', () => setTab('register'));
    setTab(this.page._tab);
  }

  renderLoginForm(container) {
    container.innerHTML = `
      <form id="login-form">
        ${this.page._field('Email *', 'email', 'login-email', 'email@example.com', true)}
        ${this.page._field('Mật Khẩu *', 'password', 'login-pass', '••••••••', true)}
        
        <div class="text-right -mt-2 mb-6">
          <button type="button" id="forgot-pw-link" class="text-xs font-bold text-amber-600 hover:text-amber-700 focus:outline-none">
            Quên mật khẩu?
          </button>
        </div>

        <p id="login-error" class="text-xs font-bold text-red-600 mb-4 hidden"></p>
        
        <button type="submit" id="btn-login-submit"
          class="w-full h-12 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black tracking-widest transition uppercase">
          ĐĂNG NHẬP
        </button>

        ${this.renderSocialLogins()}
      </form>
    `;

    this.bindSocialEvents(container);

    container.querySelector('#forgot-pw-link').addEventListener('click', () => {
      this.renderForgotPassword(container);
    });

    container.querySelector('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = container.querySelector('#login-email').value.trim();
      const pass = container.querySelector('#login-pass').value;
      const error = container.querySelector('#login-error');
      const submit = container.querySelector('#btn-login-submit');

      error.classList.add('hidden');
      submit.disabled = true;
      submit.textContent = 'ĐANG ĐĂNG NHẬP...';

      try {
        await login(email, pass);
        this.page._finishAuthRedirect();
        this.page._renderDashboardWrapper();
      } catch (err) {
        error.textContent = err.message || 'Email hoặc mật khẩu không đúng.';
        error.classList.remove('hidden');
        submit.disabled = false;
        submit.textContent = 'ĐĂNG NHẬP';
      }
    });
  }

  renderRegisterForm(container) {
    container.innerHTML = `
      <form id="register-form">
        ${this.page._field('Họ và Tên *', 'text', 'reg-name', 'Nguyễn Văn A', true)}
        ${this.page._field('Email *', 'email', 'reg-email', 'email@example.com', true)}
        ${this.page._field('Số Điện Thoại *', 'tel', 'reg-phone', 'Ví dụ: 0912345678', true, '', '0[0-9]{9}', '10')}
        ${this.page._field('Mật Khẩu *', 'password', 'reg-pass', 'Tối thiểu 8 ký tự', true)}
        ${this.page._field('Xác Nhận Mật Khẩu *', 'password', 'reg-pass2', 'Nhập lại mật khẩu', true)}

        <p id="reg-error" class="text-xs font-bold text-red-650 mb-4 hidden"></p>
        
        <button type="submit" id="btn-reg-submit"
          class="w-full h-12 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl text-xs font-black tracking-widest transition uppercase">
          ĐĂNG KÝ & XÁC THỰC EMAIL
        </button>

        ${this.renderSocialLogins()}
      </form>
    `;

    this.bindSocialEvents(container);

    container.querySelector('#register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const error = container.querySelector('#reg-error');
      const submit = container.querySelector('#btn-reg-submit');
      
      this.page._regPayload = {
        name: container.querySelector('#reg-name').value.trim(),
        email: container.querySelector('#reg-email').value.trim(),
        phone: container.querySelector('#reg-phone').value.trim(),
        password: container.querySelector('#reg-pass').value,
      };
      
      const pass2 = container.querySelector('#reg-pass2').value;
      error.classList.add('hidden');

      if (this.page._regPayload.password.length < 8) {
        error.textContent = 'Mật khẩu phải có ít nhất 8 ký tự.';
        error.classList.remove('hidden');
        return;
      }

      if (this.page._regPayload.password !== pass2) {
        error.textContent = 'Mật khẩu xác nhận không trùng khớp.';
        error.classList.remove('hidden');
        return;
      }

      if (!/^0[0-9]{9}$/.test(this.page._regPayload.phone)) {
        error.textContent = 'Số điện thoại không hợp lệ (yêu cầu 10 số bắt đầu bằng 0).';
        error.classList.remove('hidden');
        return;
      }

      submit.disabled = true;
      submit.textContent = 'ĐANG GỬI OTP...';

      try {
        const res = await sendOtp(this.page._regPayload.email);
        this.renderRegistrationOtpStep(container, res.data?.message);
      } catch (err) {
        error.textContent = err.message || 'Lỗi gửi mã xác thực OTP.';
        error.classList.remove('hidden');
        submit.disabled = false;
        submit.textContent = 'ĐĂNG KÝ & XÁC THỰC EMAIL';
      }
    });
  }

}

Object.assign(ProfileAuth.prototype, profileAuthOtpMethods, profileAuthRecoveryMethods);
