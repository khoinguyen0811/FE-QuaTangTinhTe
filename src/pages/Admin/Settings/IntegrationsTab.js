import { showToast } from '../shared/ui.js';

console.log('=== IntegrationsTab.js v1.0.79 loaded ===');

export function renderIntegrationsTab(settings) {
  const integrations = settings.third_party_integrations || {
    zalo: { oa_id: '', access_token: '', secret_key: '' },
    sms: { api_key: '', sender_name: '' },
    gmail: { smtp_host: 'smtp.gmail.com', smtp_port: '587', smtp_user: '', smtp_pass: '' },
    google_login: { client_id: '', client_secret: '' },
    facebook_login: { app_id: '', app_secret: '' },
    momo: { partner_code: '', access_key: '', secret_key: '', phone_number: '' },
    bank_transfer: { bank_name: '', account_number: '', account_holder: '' },
    resend: { api_key: 're_YZacxp8u_GsVckHN83YFDyAYNtKbu9FVw', sender_name: `${settings.brand_name || window.APP_SETTINGS?.brand_name || 'Mắt Bão WS'} <onboarding@resend.dev>` },
    cloudinary: { cloud_name: '', api_key: '', api_secret: '', upload_preset: '' }
  };

  return `
    <div class="space-y-8">
      <div class="border-b pb-3 flex justify-between items-center">
        <h3 class="text-base font-bold text-gray-900">Tích Hợp API Bên Thứ Ba</h3>
        <p class="text-xs text-gray-400">Thiết lập khóa API cho Zalo, SMS, Gmail SMTP, Google & Facebook Login, Momo & Chuyển khoản ngân hàng</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Zalo Integration -->
        <div class="bg-gray-50/50 border border-gray-150 rounded-xl p-5 space-y-4">
          <div class="flex items-center gap-2 border-b pb-2">
            <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm select-none">Z</div>
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-800">Cấu hình Zalo OA API</h4>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Zalo Official Account ID</label>
              <input type="text" id="int-zalo-oa" value="${integrations.zalo?.oa_id || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập Zalo OA ID" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Access Token</label>
              <input type="password" id="int-zalo-token" value="${integrations.zalo?.access_token || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập Zalo Access Token" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Secret Key</label>
              <input type="password" id="int-zalo-secret" value="${integrations.zalo?.secret_key || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập Zalo Secret Key" />
            </div>
          </div>
        </div>

        <!-- SMS Integration -->
        <div class="bg-gray-50/50 border border-gray-150 rounded-xl p-5 space-y-4">
          <div class="flex items-center gap-2 border-b pb-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm select-none">S</div>
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-800">Cấu hình SMS API Gateway</h4>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">API Key (SpeedSMS/eSMS)</label>
              <input type="password" id="int-sms-key" value="${integrations.sms?.api_key || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập API Key của nhà cung cấp SMS" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Tên Thương Hiệu SMS (Brandname)</label>
              <input type="text" id="int-sms-brand" value="${integrations.sms?.sender_name || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Ví dụ: SLYCLOTHING hoặc ${settings.brand_name || window.APP_SETTINGS?.brand_name || 'Mắt Bão WS'}" />
            </div>
          </div>
        </div>

        <!-- Gmail SMTP Integration -->
        <div class="bg-gray-50/50 border border-gray-150 rounded-xl p-5 space-y-4">
          <div class="flex items-center gap-2 border-b pb-2">
            <div class="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm select-none">M</div>
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-800">Cấu hình Gmail SMTP (Gửi Email)</h4>
          </div>
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-2">
              <div class="col-span-2">
                <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">SMTP Server Host</label>
                <input type="text" id="int-mail-host" value="${integrations.gmail?.smtp_host || 'smtp.gmail.com'}" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Port</label>
                <input type="text" id="int-mail-port" value="${integrations.gmail?.smtp_port || '587'}" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" />
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Tài khoản Gmail (Email)</label>
              <input type="text" id="int-mail-user" value="${integrations.gmail?.smtp_user || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="your-email@gmail.com" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Mật khẩu ứng dụng (App Password)</label>
              <input type="password" id="int-mail-pass" value="${integrations.gmail?.smtp_pass || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập mật khẩu ứng dụng Gmail 16 ký tự" />
            </div>
          </div>
        </div>

        <!-- Google & Facebook Logins -->
        <div class="bg-gray-50/50 border border-gray-150 rounded-xl p-5 space-y-4">
          <div class="flex items-center gap-2 border-b pb-2">
            <div class="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-black text-sm select-none">SSO</div>
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-800">Cấu hình Đăng Nhập (OAuth SSO)</h4>
          </div>
          <div class="space-y-4">
            <!-- Google -->
            <div class="space-y-2 border-b border-gray-200/55 pb-3">
              <span class="text-[10px] font-extrabold text-red-500 tracking-wider">GOOGLE LOGIN OAUTH</span>
              <div class="grid grid-cols-1 gap-2">
                <input type="text" id="int-gg-id" value="${integrations.google_login?.client_id || ''}" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Google Client ID" />
                <input type="password" id="int-gg-secret" value="${integrations.google_login?.client_secret || ''}" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Google Client Secret" />
              </div>
            </div>
            <!-- Facebook -->
            <div class="space-y-2">
              <span class="text-[10px] font-extrabold text-blue-600 tracking-wider">FACEBOOK LOGIN OAUTH</span>
              <div class="grid grid-cols-1 gap-2">
                <input type="text" id="int-fb-id" value="${integrations.facebook_login?.app_id || ''}" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Facebook App ID" />
                <input type="password" id="int-fb-secret" value="${integrations.facebook_login?.app_secret || ''}" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Facebook App Secret Key" />
              </div>
            </div>
          </div>
        </div>



        <!-- Resend API Integration -->
        <div class="bg-gray-50/50 border border-gray-150 rounded-xl p-5 space-y-4">
          <div class="flex items-center gap-2 border-b pb-2">
            <div class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-black text-sm select-none">R</div>
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-800">Cấu hình Resend API (Gửi Email)</h4>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Resend API Key</label>
              <input type="password" id="int-resend-key" value="${integrations.resend?.api_key || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập Resend API Key" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Email gửi đi (Sender / From Email)</label>
              <input type="text" id="int-resend-sender" value="${integrations.resend?.sender_name || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="${settings.brand_name || window.APP_SETTINGS?.brand_name || 'Mắt Bão WS'} <onboarding@resend.dev>" />
            </div>
          </div>
        </div>

        <!-- Cloudinary Integration -->
        <div class="bg-gray-50/50 border border-gray-150 rounded-xl p-5 space-y-4">
          <div class="flex items-center gap-2 border-b pb-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm select-none">C</div>
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-800">Cấu hình Cloudinary (Lưu trữ ảnh)</h4>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Cloud Name</label>
              <input type="text" id="int-cloudinary-name" value="${integrations.cloudinary?.cloud_name || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập Cloud Name" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">API Key</label>
              <input type="text" id="int-cloudinary-key" value="${integrations.cloudinary?.api_key || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập API Key" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">API Secret</label>
              <input type="password" id="int-cloudinary-secret" value="${integrations.cloudinary?.api_secret || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập API Secret" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Upload Preset (Không bắt buộc)</label>
              <input type="text" id="int-cloudinary-preset" value="${integrations.cloudinary?.upload_preset || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập Upload Preset" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindIntegrationsTab(container, settings) {
  if (!settings.third_party_integrations) {
    settings.third_party_integrations = {
      zalo: { oa_id: '', access_token: '', secret_key: '' },
      sms: { api_key: '', sender_name: '' },
      gmail: { smtp_host: 'smtp.gmail.com', smtp_port: '587', smtp_user: '', smtp_pass: '' },
      google_login: { client_id: '', client_secret: '' },
      facebook_login: { app_id: '', app_secret: '' },
      momo: { partner_code: '', access_key: '', secret_key: '', phone_number: '' },
      bank_transfer: { bank_name: '', account_number: '', account_holder: '' },
      cloudinary: { cloud_name: '', api_key: '', api_secret: '', upload_preset: '' }
    };
  }
  const integrations = settings.third_party_integrations;

  // Zalo OA
  container.querySelector('#int-zalo-oa')?.addEventListener('input', (e) => {
    if (!integrations.zalo) integrations.zalo = {};
    integrations.zalo.oa_id = e.target.value.trim();
  });
  container.querySelector('#int-zalo-token')?.addEventListener('input', (e) => {
    if (!integrations.zalo) integrations.zalo = {};
    integrations.zalo.access_token = e.target.value.trim();
  });
  container.querySelector('#int-zalo-secret')?.addEventListener('input', (e) => {
    if (!integrations.zalo) integrations.zalo = {};
    integrations.zalo.secret_key = e.target.value.trim();
  });

  // SMS
  container.querySelector('#int-sms-key')?.addEventListener('input', (e) => {
    if (!integrations.sms) integrations.sms = {};
    integrations.sms.api_key = e.target.value.trim();
  });
  container.querySelector('#int-sms-brand')?.addEventListener('input', (e) => {
    if (!integrations.sms) integrations.sms = {};
    integrations.sms.sender_name = e.target.value.trim();
  });

  // Gmail
  container.querySelector('#int-mail-host')?.addEventListener('input', (e) => {
    if (!integrations.gmail) integrations.gmail = {};
    integrations.gmail.smtp_host = e.target.value.trim();
  });
  container.querySelector('#int-mail-port')?.addEventListener('input', (e) => {
    if (!integrations.gmail) integrations.gmail = {};
    integrations.gmail.smtp_port = e.target.value.trim();
  });
  container.querySelector('#int-mail-user')?.addEventListener('input', (e) => {
    if (!integrations.gmail) integrations.gmail = {};
    integrations.gmail.smtp_user = e.target.value.trim();
  });
  container.querySelector('#int-mail-pass')?.addEventListener('input', (e) => {
    if (!integrations.gmail) integrations.gmail = {};
    integrations.gmail.smtp_pass = e.target.value.trim();
  });

  // Google Login
  container.querySelector('#int-gg-id')?.addEventListener('input', (e) => {
    if (!integrations.google_login) integrations.google_login = {};
    integrations.google_login.client_id = e.target.value.trim();
  });
  container.querySelector('#int-gg-secret')?.addEventListener('input', (e) => {
    if (!integrations.google_login) integrations.google_login = {};
    integrations.google_login.client_secret = e.target.value.trim();
  });

  // Facebook Login
  container.querySelector('#int-fb-id')?.addEventListener('input', (e) => {
    if (!integrations.facebook_login) integrations.facebook_login = {};
    integrations.facebook_login.app_id = e.target.value.trim();
  });
  container.querySelector('#int-fb-secret')?.addEventListener('input', (e) => {
    if (!integrations.facebook_login) integrations.facebook_login = {};
    integrations.facebook_login.app_secret = e.target.value.trim();
  });



  // Resend API
  container.querySelector('#int-resend-key')?.addEventListener('input', (e) => {
    if (!integrations.resend) integrations.resend = {};
    integrations.resend.api_key = e.target.value.trim();
  });
  container.querySelector('#int-resend-sender')?.addEventListener('input', (e) => {
    if (!integrations.resend) integrations.resend = {};
    integrations.resend.sender_name = e.target.value.trim();
  });

  // Cloudinary
  container.querySelector('#int-cloudinary-name')?.addEventListener('input', (e) => {
    if (!integrations.cloudinary) integrations.cloudinary = {};
    integrations.cloudinary.cloud_name = e.target.value.trim();
  });
  container.querySelector('#int-cloudinary-key')?.addEventListener('input', (e) => {
    if (!integrations.cloudinary) integrations.cloudinary = {};
    integrations.cloudinary.api_key = e.target.value.trim();
  });
  container.querySelector('#int-cloudinary-secret')?.addEventListener('input', (e) => {
    if (!integrations.cloudinary) integrations.cloudinary = {};
    integrations.cloudinary.api_secret = e.target.value.trim();
  });
  container.querySelector('#int-cloudinary-preset')?.addEventListener('input', (e) => {
    if (!integrations.cloudinary) integrations.cloudinary = {};
    integrations.cloudinary.upload_preset = e.target.value.trim();
  });
}
