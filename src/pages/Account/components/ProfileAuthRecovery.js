import { sendOtp, resetPassword, googleLogin, getGoogleClientId } from '../../../services/authService.js?v=1.0.20';

export const profileAuthRecoveryMethods = {
renderForgotPassword(container) {
  this.page._forgotState = 'phone';
  this.page._forgotPhone = '';
  this.page._forgotOtp = '';

  const renderState = () => {
    if (this.page._forgotState === 'phone') {
      container.innerHTML = `
        <form id="forgot-phone-form">
          <h3 class="text-sm font-black text-zinc-950 uppercase tracking-widest mb-2">QUÊN MẬT KHẨU</h3>
          <p class="text-xs text-zinc-500 mb-6 leading-relaxed">Nhập số điện thoại đăng ký tài khoản để nhận mã OTP khôi phục.</p>
          
          ${this.page._field('Số Điện Thoại *', 'tel', 'forgot-phone', 'Ví dụ: 0912345678', true, '', '0[0-9]{9}', '10')}

          <p id="forgot-error" class="text-xs font-bold text-red-600 mb-4 hidden"></p>
          
          <button type="submit" id="forgot-submit"
            class="w-full h-12 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black tracking-widest transition uppercase">
            GỬI MÃ OTP
          </button>

          <button type="button" id="forgot-back-login" class="block mx-auto mt-4 text-xs font-bold text-zinc-400 hover:text-zinc-650 underline">
            Quay lại Đăng nhập
          </button>
        </form>
      `;

      container.querySelector('#forgot-back-login').addEventListener('click', () => this.renderLoginForm(container));

      container.querySelector('#forgot-phone-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = container.querySelector('#forgot-phone').value.trim();
        const error = container.querySelector('#forgot-error');
        const submit = container.querySelector('#forgot-submit');

        error.classList.add('hidden');

        if (!/^0[0-9]{9}$/.test(phone)) {
          error.textContent = 'Số điện thoại không hợp lệ.';
          error.classList.remove('hidden');
          return;
        }

        submit.disabled = true;
        submit.textContent = 'ĐANG GỬI...';

        try {
          const res = await sendOtp(phone);
          this.page._forgotPhone = phone;
          this.page._forgotState = 'otp';
          renderState();
          
          if (res.data?.message && res.data.message.includes('do lỗi')) {
            const otpErr = container.querySelector('#forgot-otp-error');
            if (otpErr) {
              otpErr.textContent = res.data.message;
              otpErr.classList.remove('hidden');
              otpErr.style.color = '#C9A84C';
            }
          }
        } catch (err) {
          error.textContent = err.message || 'Lỗi gửi OTP.';
          error.classList.remove('hidden');
          submit.disabled = false;
          submit.textContent = 'GỬI MÃ OTP';
        }
      });

    } else if (this.page._forgotState === 'otp') {
      container.innerHTML = `
        <form id="forgot-otp-form" class="text-center">
          <h3 class="text-sm font-black text-zinc-950 uppercase tracking-widest mb-2">XÁC THỰC MÃ OTP</h3>
          <p class="text-xs text-zinc-500 mb-6 leading-relaxed">Nhập mã OTP 6 chữ số gửi tới số điện thoại <strong>${this.page._forgotPhone}</strong>.</p>
          
          ${this.page._field('Mã OTP *', 'text', 'forgot-code', '123456', true, '', '[0-9]{6}', '6')}

          <div class="flex justify-between items-center text-xs mb-6">
            <span id="forgot-timer" class="text-zinc-400">Hết hạn sau: <strong id="forgot-timer-seconds" class="text-zinc-650">60</strong>s</span>
            <button type="button" id="forgot-resend-btn" disabled class="text-zinc-400 font-bold uppercase tracking-wide cursor-not-allowed text-[10px]">
              GỬI LẠI MÃ (30s)
            </button>
          </div>

          <p id="forgot-otp-error" class="text-xs font-bold text-red-655 mb-4 hidden"></p>
          
          <button type="submit" id="forgot-otp-submit"
            class="w-full h-12 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl text-xs font-black tracking-widest transition uppercase">
            XÁC MINH OTP
          </button>

          <button type="button" id="forgot-back-phone" class="block mx-auto mt-4 text-xs font-bold text-zinc-400 hover:text-zinc-600 underline">
            Quay lại đổi số điện thoại
          </button>
        </form>
      `;

      const timerText = container.querySelector('#forgot-timer-seconds');
      const resendBtn = container.querySelector('#forgot-resend-btn');
      const errEl = container.querySelector('#forgot-otp-error');

      const startTimer = () => {
        clearInterval(this.page._timerInterval);
        let seconds = 60;
        timerText.textContent = seconds;
        this.page._timerInterval = setInterval(() => {
          seconds--;
          timerText.textContent = seconds;
          if (seconds <= 0) clearInterval(this.page._timerInterval);
        }, 1000);

        resendBtn.disabled = true;
        resendBtn.classList.add('text-zinc-400', 'cursor-not-allowed');
        resendBtn.classList.remove('text-amber-600', 'cursor-pointer');
        resendBtn.textContent = 'GỬI LẠI MÃ (30s)';

        let resendSeconds = 30;
        clearTimeout(this.page._resendTimer);
        const countdown = () => {
          resendSeconds--;
          if (resendSeconds > 0) {
            resendBtn.textContent = `GỬI LẠI MÃ (${resendSeconds}s)`;
            this.page._resendTimer = setTimeout(countdown, 1000);
          } else {
            resendBtn.disabled = false;
            resendBtn.classList.remove('text-zinc-400', 'cursor-not-allowed');
            resendBtn.classList.add('text-amber-600', 'cursor-pointer');
            resendBtn.textContent = 'GỬI LẠI MÃ';
          }
        };
        this.page._resendTimer = setTimeout(countdown, 1000);
      };

      startTimer();

      resendBtn.addEventListener('click', async () => {
        errEl.classList.add('hidden');
        resendBtn.disabled = true;
        resendBtn.textContent = 'ĐANG GỬI...';
        try {
          const res = await sendOtp(this.page._forgotPhone);
          startTimer();
          if (res.data?.message && res.data.message.includes('do lỗi')) {
            errEl.textContent = res.data.message;
            errEl.classList.remove('hidden');
            errEl.style.color = '#C9A84C';
          }
        } catch (err) {
          errEl.textContent = err.message || 'Lỗi gửi lại OTP.';
          errEl.classList.remove('hidden');
          errEl.style.color = '#ef4444';
          resendBtn.disabled = false;
          resendBtn.classList.remove('text-zinc-400', 'cursor-not-allowed');
          resendBtn.classList.add('text-amber-600', 'cursor-pointer');
          resendBtn.textContent = 'GỬI LẠI MÃ';
        }
      });

      container.querySelector('#forgot-back-phone').addEventListener('click', () => {
        clearInterval(this.page._timerInterval);
        clearTimeout(this.page._resendTimer);
        this.page._forgotState = 'phone';
        renderState();
      });

      container.querySelector('#forgot-otp-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const code = container.querySelector('#forgot-code').value.trim();
        if (!/^[0-9]{6}$/.test(code)) {
          errEl.textContent = 'Mã OTP không hợp lệ.';
          errEl.classList.remove('hidden');
          return;
        }
        clearInterval(this.page._timerInterval);
        clearTimeout(this.page._resendTimer);
        this.page._forgotOtp = code;
        this.page._forgotState = 'reset';
        renderState();
      });

    } else if (this.page._forgotState === 'reset') {
      container.innerHTML = `
        <form id="forgot-reset-form">
          <h3 class="text-sm font-black text-zinc-950 uppercase tracking-widest mb-2">ĐẶT LẠI MẬT KHẨU</h3>
          <p class="text-xs text-zinc-500 mb-6 leading-relaxed">Nhập mật khẩu mới để thiết lập lại quyền truy cập tài khoản.</p>
          
          ${this.page._field('Mật khẩu mới *', 'password', 'forgot-pass', 'Tối thiểu 8 ký tự', true)}
          ${this.page._field('Xác nhận mật khẩu mới *', 'password', 'forgot-pass2', 'Nhập lại mật khẩu mới', true)}

          <p id="forgot-reset-error" class="text-xs font-bold text-red-600 mb-4 hidden"></p>
          
          <button type="submit" id="forgot-reset-submit"
            class="w-full h-12 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl text-xs font-black tracking-widest transition uppercase">
            LƯU MẬT KHẨU MỚI
          </button>
        </form>
      `;

      container.querySelector('#forgot-reset-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = container.querySelector('#forgot-pass').value;
        const pass2 = container.querySelector('#forgot-pass2').value;
        const error = container.querySelector('#forgot-reset-error');
        const submit = container.querySelector('#forgot-reset-submit');

        error.classList.add('hidden');

        if (pass.length < 8) {
          error.textContent = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
          error.classList.remove('hidden');
          return;
        }

        if (pass !== pass2) {
          error.textContent = 'Mật khẩu xác nhận không khớp.';
          error.classList.remove('hidden');
          return;
        }

        submit.disabled = true;
        submit.textContent = 'ĐANG LƯU...';

        try {
          await resetPassword(this.page._forgotPhone, this.page._forgotOtp, pass);
          alert('Đổi mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
          this.renderLoginForm(container);
        } catch (err) {
          error.textContent = err.message || 'Lỗi đặt lại mật khẩu. Vui lòng thử lại.';
          error.classList.remove('hidden');
          submit.disabled = false;
          submit.textContent = 'LƯU MẬT KHẨU MỚI';
        }
      });
    }
  };

  renderState();
},

renderSocialLogins() {
  return `
    <div class="mt-6 pt-6 border-t border-zinc-100 text-center">
      <p class="text-[10px] text-zinc-400 uppercase tracking-widest font-black mb-4">Hoặc đăng nhập bằng</p>
      <div class="flex gap-3 justify-center">
        <button type="button" class="btn-fb flex-1 h-10 bg-[#3b5998] hover:bg-[#324b80] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition">FACEBOOK</button>
        <button type="button" class="btn-gg flex-1 h-10 bg-[#db4437] hover:bg-[#c53d30] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition">GOOGLE</button>
      </div>
    </div>
  `;
},

bindSocialEvents(container) {
  container.querySelectorAll('.btn-fb').forEach(btn => {
    btn.addEventListener('click', () => alert('Đăng nhập Facebook hiện chưa được cấu hình cho tên miền này.'));
  });

  container.querySelectorAll('.btn-gg').forEach(btn => {
    btn.addEventListener('click', async () => {
      const clientId = getGoogleClientId();
      if (!clientId) {
        alert('Đăng nhập Google hiện chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'ĐANG TẢI...';

      try {
        // Load Google Identity Services if not already loaded
        if (!window.google?.accounts?.id) {
          await new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
              // Script tag exists but not loaded yet, wait
              const check = setInterval(() => {
                if (window.google?.accounts?.id) { clearInterval(check); resolve(); }
              }, 100);
              setTimeout(() => { clearInterval(check); reject(new Error('Timeout')); }, 5000);
            } else {
              const script = document.createElement('script');
              script.src = 'https://accounts.google.com/gsi/client';
              script.onload = resolve;
              script.onerror = () => reject(new Error('Không thể tải Google SDK'));
              document.head.appendChild(script);
            }
          });
        }

        // Use One Tap or popup
        await new Promise((resolve, reject) => {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              try {
                const result = await googleLogin(response.credential);
                if (result.token || result.user) {
                  this.page._finishAuthRedirect?.();
                  this.page._renderDashboardWrapper?.();
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            auto_select: false,
          });
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Fallback: try renderButton approach
              const tempDiv = document.createElement('div');
              tempDiv.style.display = 'none';
              document.body.appendChild(tempDiv);
              window.google.accounts.id.renderButton(tempDiv, { type: 'icon' });
              tempDiv.querySelector('[role="button"]')?.click();
              setTimeout(() => tempDiv.remove(), 100);
            }
          });
        });
      } catch (err) {
        alert(err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'GOOGLE';
      }
    });
  });
}
};
