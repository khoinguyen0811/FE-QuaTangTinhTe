import { sendOtp, verifyOtp, isLoggedIn, googleLogin, getGoogleClientId } from '../../services/authService.js?v=1.0.20';
import { navigate } from '../../utils/helpers.js';
import { renderWelcomeHtml } from './WelcomeTemplate.js';

export default class WelcomePage {
  constructor() {
    this._phoneNum = '';
    this._timerInterval = null;
    this._resendTimer = null;
  }

  async render() {
    const wrap = document.createElement('div');
    wrap.className = 'min-h-screen bg-zinc-50 pt-32 md:pt-40 pb-20 px-4 font-sans text-zinc-950 flex items-center justify-center';
    
    wrap.innerHTML = renderWelcomeHtml();

    this._bindEvents(wrap);
    return wrap;
  }

  _bindEvents(wrap) {
    const phoneState = wrap.querySelector('#phone-state');
    const otpState = wrap.querySelector('#otp-state');
    const successState = wrap.querySelector('#success-state');
    
    const phoneForm = wrap.querySelector('#welcome-phone-form');
    const phoneInput = wrap.querySelector('#welcome-phone');
    const phoneError = wrap.querySelector('#welcome-phone-error');
    const sendOtpBtn = wrap.querySelector('#send-otp-btn');
    
    const otpForm = wrap.querySelector('#welcome-otp-form');
    const otpInput = wrap.querySelector('#welcome-otp');
    const otpError = wrap.querySelector('#welcome-otp-error');
    const verifyOtpBtn = wrap.querySelector('#verify-otp-btn');
    
    const timerVal = wrap.querySelector('#timer-val');
    const resendBtn = wrap.querySelector('#welcome-resend-btn');
    const backBtn = wrap.querySelector('#back-to-phone');

    const startOtpTimer = () => {
      // Clear previous timers
      clearInterval(this._timerInterval);
      clearTimeout(this._resendTimer);

      // Validity timer (60s)
      let seconds = 60;
      timerVal.textContent = seconds;
      this._timerInterval = setInterval(() => {
        seconds--;
        timerVal.textContent = seconds;
        if (seconds <= 0) {
          clearInterval(this._timerInterval);
        }
      }, 1000);

      // Resend cooldown timer (30s)
      resendBtn.disabled = true;
      resendBtn.className = 'text-zinc-400 cursor-not-allowed text-xs font-semibold';
      resendBtn.textContent = 'Gửi lại mã (30s)';

      let resendSeconds = 30;
      const countdownResend = () => {
        resendSeconds--;
        if (resendSeconds > 0) {
          resendBtn.textContent = `Gửi lại mã (${resendSeconds}s)`;
          this._resendTimer = setTimeout(countdownResend, 1000);
        } else {
          resendBtn.disabled = false;
          resendBtn.className = 'text-primary-gold cursor-pointer hover:underline text-xs font-semibold';
          resendBtn.textContent = 'Gửi lại mã';
        }
      };
      this._resendTimer = setTimeout(countdownResend, 1000);
    };

    phoneForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      phoneError.classList.add('hidden');
      this._phoneNum = phoneInput.value.trim();

      const isPhone = /^0[0-9]{9}$/.test(this._phoneNum);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._phoneNum);

      if (!isPhone && !isEmail) {
        phoneError.textContent = 'Vui lòng nhập email hợp lệ (VD: ten@gmail.com) hoặc số điện thoại 10 chữ số bắt đầu bằng 0.';
        phoneError.classList.remove('hidden');
        return;
      }

      sendOtpBtn.disabled = true;
      sendOtpBtn.innerHTML = `<span class="spinner w-4 h-4 border-2 border-zinc-500 border-t-zinc-950 inline-block mr-2"></span> Đang gửi OTP...`;

      try {
        const res = await sendOtp(this._phoneNum);
        phoneState.classList.add('hidden');
        otpState.classList.remove('hidden');
        startOtpTimer();

        // Check if there was a bypass message (simulated failure)
        if (res.data?.message && res.data.message.includes('do lỗi')) {
          otpError.textContent = res.data.message;
          otpError.className = 'text-xs text-amber-500 font-medium mt-2.5';
          otpError.classList.remove('hidden');
        }
      } catch (err) {
        phoneError.textContent = err.message || 'Lỗi gửi OTP. Vui lòng thử lại sau.';
        phoneError.classList.remove('hidden');
      } finally {
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = `
          <span>Nhận mã xác thực OTP</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        `;
      }
    });

    resendBtn.addEventListener('click', async () => {
      otpError.classList.add('hidden');
      resendBtn.disabled = true;
      resendBtn.textContent = 'Đang gửi...';

      try {
        const res = await sendOtp(this._phoneNum);
        startOtpTimer();
        if (res.data?.message && res.data.message.includes('do lỗi')) {
          otpError.textContent = res.data.message;
          otpError.className = 'text-xs text-amber-500 font-medium mt-2.5';
          otpError.classList.remove('hidden');
        }
      } catch (err) {
        otpError.textContent = err.message || 'Gửi lại mã thất bại.';
        otpError.className = 'text-xs text-rose-600 font-medium mt-2.5';
        otpError.classList.remove('hidden');
        resendBtn.disabled = false;
        resendBtn.className = 'text-primary-gold cursor-pointer hover:underline text-xs font-semibold';
        resendBtn.textContent = 'Gửi lại mã';
      }
    });

    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      otpError.classList.add('hidden');
      const code = otpInput.value.trim();

      if (!/^[0-9]{6}$/.test(code)) {
        otpError.textContent = 'Mã OTP yêu cầu đúng 6 chữ số.';
        otpError.className = 'text-xs text-rose-600 font-medium mt-2.5';
        otpError.classList.remove('hidden');
        return;
      }

      verifyOtpBtn.disabled = true;
      verifyOtpBtn.innerHTML = `<span class="spinner w-4 h-4 border-2 border-zinc-500 border-t-zinc-950 inline-block mr-2"></span> Đang xác thực...`;

      try {
        await verifyOtp(this._phoneNum, code);
        
        clearInterval(this._timerInterval);
        clearTimeout(this._resendTimer);
        
        otpState.classList.add('hidden');
        successState.classList.remove('hidden');
        
        // Broadcast user login state change
        window.dispatchEvent(new CustomEvent('auth-changed'));

        // Delayed redirect to products/shop page
        setTimeout(() => {
          navigate('/products');
        }, 2500);

      } catch (err) {
        otpError.textContent = err.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
        otpError.className = 'text-xs text-rose-600 font-medium mt-2.5';
        otpError.classList.remove('hidden');
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Xác nhận & Hoàn tất';
      }
    });

    backBtn.addEventListener('click', () => {
      clearInterval(this._timerInterval);
      clearTimeout(this._resendTimer);
      otpError.classList.add('hidden');
      otpInput.value = '';
      otpState.classList.add('hidden');
      phoneState.classList.remove('hidden');
    });

    wrap.querySelector('#fb-login-btn').addEventListener('click', () => {
      alert('Đăng nhập Facebook hiện chưa được cấu hình cho tên miền này.');
    });
    wrap.querySelector('#gg-login-btn').addEventListener('click', async () => {
      const clientId = getGoogleClientId();
      if (!clientId) {
        alert('Đăng nhập Google hiện chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
        return;
      }
      const ggBtn = wrap.querySelector('#gg-login-btn');
      ggBtn.disabled = true;
      ggBtn.textContent = 'ĐANG TẢI...';
      try {
        if (!window.google?.accounts?.id) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Không thể tải Google SDK'));
            document.head.appendChild(script);
          });
        }
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              await googleLogin(response.credential);
              navigate('/products');
            } catch (err) {
              alert(err.message || 'Đăng nhập Google thất bại.');
            }
          },
          auto_select: false,
        });
        window.google.accounts.id.prompt();
      } catch (err) {
        alert(err.message || 'Đăng nhập Google thất bại.');
      } finally {
        ggBtn.disabled = false;
        ggBtn.textContent = 'GOOGLE';
      }
    });
  }
}
