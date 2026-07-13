import { register, sendOtp } from '../../../services/authService.js?v=1.0.20';

export const profileAuthOtpMethods = {
renderRegistrationOtpStep(container, bypassMsg) {
  container.innerHTML = `
    <form id="reg-otp-form" class="text-center">
      <h3 class="text-sm font-black text-zinc-950 uppercase tracking-widest mb-2">XÁC THỰC EMAIL</h3>
      <p class="text-xs text-zinc-500 mb-6 leading-relaxed">Mã OTP đã được gửi đến email <strong>${this.page._regPayload.email}</strong>. Vui lòng kiểm tra hộp thư (bao gồm cả Spam).</p>
      
      ${this.page._field('Nhập mã OTP (6 chữ số) *', 'text', 'reg-otp-code', '123456', true, '', '[0-9]{6}', '6')}
      
      <div class="flex justify-between items-center text-xs mb-6">
        <span id="reg-timer" class="text-zinc-400">Hết hạn sau: <strong id="reg-timer-seconds" class="text-zinc-650">60</strong>s</span>
        <button type="button" id="reg-resend-btn" disabled class="text-zinc-400 font-bold uppercase tracking-wide cursor-not-allowed text-[10px]">
          GỬI LẠI MÃ (30s)
        </button>
      </div>

      <p id="reg-otp-error" class="text-xs font-bold text-red-650 mb-4 ${bypassMsg ? 'text-amber-500' : 'hidden'}">${bypassMsg || ''}</p>
      
      <button type="submit" id="btn-verify-reg"
        class="w-full h-12 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl text-xs font-black tracking-widest transition uppercase">
        XÁC NHẬN & HOÀN TẤT
      </button>

      <button type="button" id="btn-back-reg" class="block mx-auto mt-4 text-xs font-bold text-zinc-400 hover:text-zinc-600 underline">
        Quay lại chỉnh sửa thông tin
      </button>
    </form>
  `;

  const timerText = container.querySelector('#reg-timer-seconds');
  const resendBtn = container.querySelector('#reg-resend-btn');
  const errEl = container.querySelector('#reg-otp-error');

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
      const res = await sendOtp(this.page._regPayload.email);
      startTimer();
      if (res.data?.message && res.data.message.includes('do lỗi')) {
        errEl.textContent = res.data.message;
        errEl.classList.remove('hidden', 'text-red-650');
        errEl.classList.add('text-amber-500');
      }
    } catch (err) {
      errEl.textContent = err.message || 'Lỗi gửi lại OTP.';
      errEl.classList.remove('hidden', 'text-amber-500');
      errEl.classList.add('text-red-650');
      resendBtn.disabled = false;
      resendBtn.classList.remove('text-zinc-400', 'cursor-not-allowed');
      resendBtn.classList.add('text-amber-600', 'cursor-pointer');
      resendBtn.textContent = 'GỬI LẠI MÃ';
    }
  });

  container.querySelector('#btn-back-reg').addEventListener('click', () => {
    clearInterval(this.page._timerInterval);
    clearTimeout(this.page._resendTimer);
    this.renderRegisterForm(container);
  });

  container.querySelector('#reg-otp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.classList.add('hidden');
    const otpCode = container.querySelector('#reg-otp-code').value.trim();

    if (!/^[0-9]{6}$/.test(otpCode)) {
      errEl.textContent = 'Mã OTP không hợp lệ (yêu cầu 6 chữ số).';
      errEl.classList.remove('hidden', 'text-amber-500');
      errEl.classList.add('text-red-650');
      return;
    }

    const submit = container.querySelector('#btn-verify-reg');
    submit.disabled = true;
    submit.textContent = 'ĐANG ĐĂNG KÝ...';

    try {
      const registerPayload = { ...this.page._regPayload, otp_code: otpCode };
      await register(registerPayload);

      clearInterval(this.page._timerInterval);
      clearTimeout(this.page._resendTimer);

      this.page._finishAuthRedirect();
      this.page._renderDashboardWrapper();
    } catch (err) {
      errEl.textContent = err.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
      errEl.classList.remove('hidden', 'text-amber-500');
      errEl.classList.add('text-red-650');
      submit.disabled = false;
      submit.textContent = 'XÁC NHẬN & HOÀN TẤT';
    }
  });
},
};
