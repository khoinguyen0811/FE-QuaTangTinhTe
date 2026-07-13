import { showToast } from '../shared/ui.js';
import { API_BASE, STORAGE_KEYS } from '../../../services/config.js';

export function renderLogin(container) {
  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

      .modernize-login-body {
        min-height: 100vh;
        display: flex;
        background-color: #111C2D;
        font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        color: #fff;
        width: 100%;
      }

      .modernize-container {
        display: flex;
        width: 100%;
        min-height: 100vh;
      }

      .modernize-left {
        flex: 1.25;
        background-color: #1A2536;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 48px;
        position: relative;
        overflow: hidden;
      }

      .modernize-left::before {
        content: '';
        position: absolute;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(93,135,255,0.06) 0%, transparent 70%);
        top: -100px;
        left: -100px;
        pointer-events: none;
      }

      .modernize-right {
        flex: 0.75;
        background-color: #131924;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px;
        border-left: 1px solid rgba(255,255,255,0.04);
      }

      .modernize-right-card {
        width: 100%;
        max-width: 400px;
      }

      /* Vector Illustration styling */
      .illustration-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
      }

      /* Inputs & forms style */
      .modernize-input {
        width: 100%;
        padding: 12px 16px;
        background-color: #111827;
        border: 1px solid #334155;
        border-radius: 12px;
        font-size: 13px;
        color: #e2e8f0;
        transition: all 0.2s ease;
      }
      .modernize-input:focus {
        outline: none;
        border-color: #5d87ff;
        box-shadow: 0 0 0 1px #5d87ff;
      }

      /* Toggle Password button */
      .login-toggle-pw {
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .login-toggle-pw:hover {
        color: #cbd5e1;
      }

      /* Error container */
      .login-error {
        display: none;
        margin-top: 16px;
        padding: 12px;
        background-color: rgba(220, 38, 38, 0.15);
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: 12px;
        font-size: 12px;
        color: #f87171;
        align-items: center;
        gap: 8px;
      }
      .login-error.show {
        display: flex !important;
      }
      .login-error svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      /* Spinner */
      .login-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid transparent;
        border-top-color: #fff;
        border-right-color: #fff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Success animation overlay */
      .login-success-overlay {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(17, 28, 45, 0.96);
        backdrop-filter: blur(10px);
        opacity: 0;
        animation: success-fade-in 0.4s ease forwards;
      }
      @keyframes success-fade-in {
        to { opacity: 1; }
      }
      .login-success-content {
        text-align: center;
        animation: success-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        opacity: 0;
        transform: scale(0.9);
      }
      @keyframes success-pop {
        to { opacity: 1; transform: scale(1); }
      }
      .login-success-check {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        border-radius: 50%;
        background: linear-gradient(135deg, #5d87ff, #8ba8ff);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 48px rgba(93,135,255,0.4);
      }
      .login-success-check svg {
        width: 32px;
        height: 32px;
        color: #fff;
      }
      .login-success-text {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }
      .login-success-sub {
        font-size: 13px;
        color: rgba(255,255,255,0.4);
      }

      /* Responsive adjustments */
      @media (max-width: 1024px) {
        .modernize-left {
          display: none;
        }
        .modernize-right {
          flex: 1;
          padding: 24px;
        }
      }
    </style>

    <div class="modernize-login-body">
      <div class="modernize-container">
        <!-- Left Panel: Brand & Illustration -->
        <div class="modernize-left">
          <!-- Logo -->
          <div class="flex items-center gap-2.5 text-white">
            <svg class="w-8 h-8 text-[#5d87ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <span class="text-xl font-extrabold tracking-tight">${window.APP_SETTINGS?.brand_name || 'Quà Tặng Tinh Tế'}</span>
          </div>

          <!-- Centered Illustration -->
          <div class="illustration-container">
            <img src="/backend/public/image/banner/authBG.png" alt="Illustration" class="w-full max-w-[420px] h-auto select-none" />
          </div>

          <!-- Bottom Footer -->
          <div class="text-xs text-slate-500 font-medium">© 2026 ${window.APP_SETTINGS?.brand_name || 'Quà Tặng Tinh Tế'} · Cung cấp bởi Mắt Bão WS</div>
        </div>

        <!-- Right Panel: Login Card -->
        <div class="modernize-right">
          <div class="modernize-right-card">
            <!-- Header -->
            <h2 class="text-2xl font-bold text-white tracking-tight">Chào mừng đến với ${window.APP_SETTINGS?.brand_name || 'Quà Tặng Tinh Tế'}</h2>
            <p class="text-slate-400 text-sm mt-1 mb-6">Trang Quản Trị Hệ Thống</p>

            <!-- Social Logins -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <button type="button" class="flex items-center justify-center gap-2 py-2.5 border border-slate-800 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 bg-slate-850 hover:bg-slate-800 transition duration-200">
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.37 1 3.4 3.66 1.48 7.54l3.69 2.87c.86-2.58 3.28-4.37 6.83-4.37z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.69 2.87c2.16-1.99 3.41-4.93 3.41-8.53z"/>
                  <path fill="#FBBC05" d="M5.17 10.41A7.03 7.03 0 0 1 5 12c0 .55.08 1.09.23 1.62l-3.69 2.87A11.96 11.96 0 0 1 1 12c0-1.63.33-3.19.92-4.62l3.25 3.03z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-4.27 1.09-3.55 0-5.97-1.79-6.83-4.37L1.48 16.8A11.96 11.96 0 0 0 12 23z"/>
                </svg>
                Google
              </button>
              <button type="button" class="flex items-center justify-center gap-2 py-2.5 border border-slate-800 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 bg-slate-850 hover:bg-slate-800 transition duration-200">
                <svg class="w-4 h-4 fill-current text-slate-200" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Github
              </button>
            </div>

            <!-- Divider -->
            <div class="relative flex py-4 items-center mb-6">
              <div class="flex-grow border-t border-slate-800/80"></div>
              <span class="flex-shrink mx-4 text-slate-500 text-[11px] uppercase tracking-wider font-bold">hoặc đăng nhập bằng</span>
              <div class="flex-grow border-t border-slate-800/80"></div>
            </div>

            <!-- Login Form -->
            <form id="login-form" autocomplete="on">
              <div class="space-y-4">
                <!-- Username / Email -->
                <div class="space-y-1">
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wide" for="login-email">Tên đăng nhập / Email</label>
                  <input id="login-email" type="email" required autocomplete="email" placeholder="Nhập email đăng nhập" 
                    class="modernize-input" />
                </div>

                <!-- Password -->
                <div class="space-y-1">
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wide" for="login-password">Mật khẩu</label>
                  <div class="relative">
                    <input id="login-password" type="password" required autocomplete="current-password" placeholder="Nhập mật khẩu" 
                      class="modernize-input pr-11" />
                    <button type="button" id="toggle-pw" class="login-toggle-pw" aria-label="Hiện/ẩn mật khẩu">
                      <svg id="pw-icon-show" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      <svg id="pw-icon-hide" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Options -->
              <div class="flex items-center justify-between mt-4 mb-6">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#5d87ff] focus:ring-[#5d87ff] focus:ring-offset-slate-900" />
                  <span class="text-xs text-slate-400 font-medium">Ghi nhớ thiết bị</span>
                </label>
                <a href="#" class="text-xs font-bold text-[#5d87ff] hover:text-[#4570e6] transition">Quên mật khẩu?</a>
              </div>

              <!-- Error Alert -->
              <div id="login-error" class="login-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span id="login-error-text"></span>
              </div>

              <!-- Submit -->
              <button type="submit" id="login-btn" class="w-full py-3 mt-4 bg-[#5d87ff] hover:bg-[#4570e6] text-white font-semibold text-sm rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#5d87ff]/20">
                <span class="login-btn-text">Đăng nhập</span>
                <span class="login-btn-loading" style="display:none">
                  <span class="login-spinner"></span>
                  Đang xác thực...
                </span>
              </button>
            </form>

            <!-- Footer links -->
            <div class="text-center mt-6">
              <span class="text-xs text-slate-400">Bạn là thành viên mới?</span>
              <a href="/" class="text-xs font-bold text-[#5d87ff] hover:text-[#4570e6] ml-1 transition">Quay lại trang chủ</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const errorEl = container.querySelector('#login-error');
  const errorText = container.querySelector('#login-error-text');
  const btn = container.querySelector('#login-btn');
  const btnTextEl = container.querySelector('.login-btn-text');
  const btnLoadingEl = container.querySelector('.login-btn-loading');
  const spinnerEl = container.querySelector('.login-spinner');

  // Toggle password visibility
  const togglePw = container.querySelector('#toggle-pw');
  const iconShow = container.querySelector('#pw-icon-show');
  const iconHide = container.querySelector('#pw-icon-hide');
  togglePw.addEventListener('click', () => {
    const isPw = passwordInput.type === 'password';
    passwordInput.type = isPw ? 'text' : 'password';
    iconShow.style.display = isPw ? 'none' : 'block';
    iconHide.style.display = isPw ? 'block' : 'none';
  });

  // Show error helper
  function showError(msg) {
    errorText.textContent = msg;
    errorEl.classList.add('show');
  }
  function hideError() {
    errorEl.classList.remove('show');
  }

  // Set loading state
  function setLoading(loading) {
    btn.disabled = loading;
    if (loading) {
      btn.classList.add('loading');
      btnTextEl.style.display = 'none';
      btnLoadingEl.style.display = 'flex';
      spinnerEl.style.display = 'block';
    } else {
      btn.classList.remove('loading');
      btnTextEl.style.display = 'inline';
      btnLoadingEl.style.display = 'none';
      spinnerEl.style.display = 'none';
    }
  }

  // Show success animation then transition
  function showSuccessAndProceed() {
    const overlay = document.createElement('div');
    overlay.className = 'login-success-overlay';
    overlay.innerHTML = `
      <div class="login-success-content">
        <div class="login-success-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="login-success-text">Đăng nhập thành công!</div>
        <div class="login-success-sub">Đang chuyển đến trang quản trị...</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Transition to admin after brief animation
    setTimeout(() => {
      overlay.remove();
      window.location.hash = '#dashboard';
      document.dispatchEvent(new CustomEvent('admin:login'));
    }, 1200);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value,
        }),
      });
      const data = await res.json();

      if (res.ok && (data.token || data.access_token || (data.data && data.data.token))) {
        const token = data.token || data.access_token || data.data.token;

        // Verify admin permission before storing
        const verifyRes = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!verifyRes.ok) {
          if (verifyRes.status === 403) {
            showError('Tài khoản của bạn không có quyền truy cập trang quản trị.');
          } else {
            showError('Lỗi xác thực quyền truy cập.');
          }
          setLoading(false);
          return;
        }

        // Store token
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN, token);
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `sly_admin_auth_token=${token}; path=/; max-age=604800; SameSite=Lax${secure}`;

        // Show success animation then redirect seamlessly
        showSuccessAndProceed();

      } else {
        showError(data.error || data.message || 'Email hoặc mật khẩu không đúng.');
        setLoading(false);
      }
    } catch (err) {
      showError('Lỗi kết nối. Vui lòng thử lại.');
      setLoading(false);
    }
  });

  // Auto-focus email
  setTimeout(() => emailInput.focus(), 400);
}
