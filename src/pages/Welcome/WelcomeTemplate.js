export function renderWelcomeHtml() {
  return `
      <div class="w-full max-w-4xl bg-white rounded-3xl border border-zinc-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        <!-- LEFT: Benefits (7 cols) -->
        <div class="lg:col-span-7 bg-zinc-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <!-- Ambient Gold Glow in background -->
          <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none"></div>
          <div class="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none"></div>
 
          <div class="relative z-10">
            <span class="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-primary-gold text-[10px] font-bold uppercase tracking-[0.15em] rounded-full mb-6">
              Đặc Quyền Thành Viên
            </span>
            <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight uppercase mb-4">
              Chào bạn từ <br/>
              <span class="bg-gradient-to-r from-amber-200 via-primary-gold to-amber-200 bg-clip-text text-transparent">TikTok / Shopee!</span> 👋
            </h1>
            <p class="text-zinc-400 text-sm leading-relaxed max-w-md mb-10">
              Đăng ký tài khoản ${window.APP_SETTINGS?.brand_name || 'Thương hiệu'} ngay hôm nay để nhận trọn bộ đặc quyền mua sắm và các chương trình ưu đãi dành riêng cho khách hàng.
            </p>
            <!-- Benefits list -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <!-- Benefit 1 -->
              <div class="flex gap-4 group">
                <div class="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-primary-gold group-hover:scale-110 transition duration-300">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 2v20M17 4H7"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white group-hover:text-primary-gold transition">Voucher 50.000đ</h4>
                  <p class="text-xs text-zinc-400 mt-1 leading-normal">Tự động cộng voucher vào ví khi đăng ký thành công (Hạn 7 ngày).</p>
                </div>
              </div>
 
              <!-- Benefit 2 -->
              <div class="flex gap-4 group">
                <div class="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-primary-gold group-hover:scale-110 transition duration-300">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white group-hover:text-primary-gold transition">Tích Điểm Đổi Quà</h4>
                  <p class="text-xs text-zinc-400 mt-1 leading-normal">1K chi tiêu = 1 điểm. Đổi điểm lấy voucher giảm giá và quà tặng hấp dẫn.</p>
                </div>
              </div>
 
              <!-- Benefit 3 -->
              <div class="flex gap-4 group">
                <div class="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-primary-gold group-hover:scale-110 transition duration-300">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white group-hover:text-primary-gold transition">Quà Tặng Sinh Nhật</h4>
                  <p class="text-xs text-zinc-400 mt-1 leading-normal">Nhận voucher sinh nhật trị giá lên đến 300K - 500K theo các thứ hạng.</p>
                </div>
              </div>
 
              <!-- Benefit 4 -->
              <div class="flex gap-4 group">
                <div class="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-primary-gold group-hover:scale-110 transition duration-300">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white group-hover:text-primary-gold transition">Web Exclusive</h4>
                  <p class="text-xs text-zinc-400 mt-1 leading-normal">Mua sớm các BST mới ra mắt và tiếp cận các sản phẩm limited đặc biệt.</p>
                </div>
              </div>
 
            </div>
          </div>
 
          <div class="mt-12 pt-6 border-t border-zinc-800 text-[10px] text-zinc-500 tracking-wider relative z-10 flex justify-between items-center">
            <span>${(window.APP_SETTINGS?.brand_name || 'Thương hiệu').toUpperCase()} COMMUNITY</span>
            <span>Est. 2026</span>
          </div>
        </div>
 
        <!-- RIGHT: Form (5 cols) -->
        <div class="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-center bg-white relative">
          
          <!-- State A: Phone Submission -->
          <div id="phone-state" class="space-y-6">
            <div>
              <h3 class="text-xl font-black text-zinc-900 tracking-tight">ĐĂNG KÝ NHANH</h3>
              <p class="text-xs text-zinc-500 mt-1">Xác thực số điện thoại để nhận quà tặng chào mừng.</p>
            </div>
 
            <form id="welcome-phone-form" class="space-y-4">
              <div>
                <label for="welcome-phone" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Email hoặc Số điện thoại *</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input 
                    type="text" 
                    id="welcome-phone" 
                    placeholder="Nhập Gmail hoặc SĐT (VD: email@gmail.com)" 
                    required 
                    class="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-medium transition duration-200"
                  />
                </div>
                <p id="welcome-phone-error" class="text-xs text-rose-600 mt-1.5 hidden font-medium"></p>
              </div>
 
              <button 
                type="submit" 
                id="send-otp-btn"
                class="w-full py-3.5 bg-zinc-950 hover:bg-primary-gold hover:text-zinc-950 text-white rounded-xl text-xs font-black uppercase tracking-[0.1em] shadow-lg shadow-zinc-950/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Nhận mã xác thực OTP</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </form>
 
            <div class="relative py-2 flex items-center justify-center">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-zinc-150"></div></div>
              <span class="relative px-3 bg-white text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Hoặc</span>
            </div>
 
            <!-- Social Media Buttons -->
            <div class="grid grid-cols-2 gap-3">
              <button id="fb-login-btn" class="py-2.5 px-4 bg-[#1877f2] hover:opacity-90 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
              <button id="gg-login-btn" class="py-2.5 px-4 bg-[#ea4335] hover:opacity-90 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.694 0-8.503-3.809-8.503-8.503s3.809-8.503 8.503-8.503c2.252 0 4.148.814 5.58 2.166l3.208-3.208C18.232 1.328 15.352 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.058 0 11.726-4.958 11.726-11.954 0-.806-.074-1.417-.22-2.24H12.24z"/></svg>
                Google
              </button>
            </div>
          </div>
 
          <!-- State B: OTP Verification -->
          <div id="otp-state" class="space-y-6 hidden">
            <div>
              <h3 class="text-xl font-black text-zinc-900 tracking-tight">NHẬP MÃ OTP</h3>
              <p class="text-xs text-zinc-500 mt-1">Mã xác thực gồm 6 chữ số đã được gửi đến email/SMS của bạn.</p>
            </div>
 
            <form id="welcome-otp-form" class="space-y-4">
              <div>
                <label for="welcome-otp" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">Mã OTP *</label>
                <input 
                  type="text" 
                  id="welcome-otp" 
                  placeholder="Nhập 6 chữ số" 
                  required 
                  maxlength="6"
                  pattern="[0-9]{6}"
                  class="w-full py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-lg text-center tracking-[0.4em] font-black focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition duration-200"
                />
                
                <div class="flex justify-between items-center mt-2.5 text-xs text-zinc-500 font-semibold select-none">
                  <span id="welcome-timer">Hết hạn sau: <strong id="timer-val" class="text-zinc-900">60</strong>s</span>
                  <button type="button" id="welcome-resend-btn" disabled class="text-zinc-400 cursor-not-allowed hover:text-amber-500 transition">
                    Gửi lại mã (30s)
                  </button>
                </div>
 
                <p id="welcome-otp-error" class="text-xs text-rose-600 mt-2.5 hidden font-medium"></p>
              </div>
 
              <button 
                type="submit" 
                id="verify-otp-btn"
                class="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-[0.1em] shadow-lg shadow-amber-500/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Xác nhận & Hoàn tất
              </button>
 
              <button 
                type="button" 
                id="back-to-phone"
                class="w-full py-2 bg-transparent text-zinc-500 hover:text-zinc-900 text-xs font-bold transition duration-200"
              >
                Quay lại đổi số điện thoại
              </button>
            </form>
          </div>
 
          <!-- State C: Success Display -->
          <div id="success-state" class="text-center space-y-6 hidden">
            <div class="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
              <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-black text-zinc-900 tracking-tight">XÁC THỰC THÀNH CÔNG!</h3>
              <p class="text-xs text-zinc-500 leading-relaxed px-4">
                Chúc mừng bạn đã nhận được voucher <strong class="text-zinc-900">WELCOME50K</strong> (trị giá 50.000đ, hạn dùng 7 ngày) tự động cộng vào tài khoản.
              </p>
            </div>
            <div class="p-4 bg-amber-50 border border-amber-200/50 rounded-2xl flex items-center justify-between text-left max-w-sm mx-auto">
              <div>
                <p class="text-[10px] font-black uppercase tracking-wider text-primary-gold">Voucher đã kích hoạt</p>
                <p class="text-xs font-bold text-zinc-900 mt-0.5">WELCOME50K (-50k)</p>
              </div>
              <span class="px-2.5 py-1 bg-white border border-amber-300 text-[10px] font-black text-zinc-900 rounded-lg">Áp dụng từ 199k</span>
            </div>
            <p class="text-[11px] text-zinc-400 font-medium">Đang chuyển hướng đến trang mua sắm...</p>
          </div>
 
        </div>
 
      </div>
    `;
}
