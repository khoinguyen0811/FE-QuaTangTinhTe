import { showToast } from '../shared/ui.js';

console.log('=== PaymentTab.js v1.0.79 loaded ===');

export function renderPaymentTab(settings) {
  const integrations = settings.third_party_integrations || {
    momo: { partner_code: '', access_key: '', secret_key: '', phone_number: '' },
    bank_transfer: { bank_name: '', account_number: '', account_holder: '' }
  };

  return `
    <div class="space-y-8">
      <div class="border-b pb-3 flex justify-between items-center">
        <h3 class="text-base font-bold text-gray-900">Cấu Hình Thanh Toán Online</h3>
        <p class="text-xs text-gray-400">Thiết lập kết nối ví điện tử MoMo và thông tin Chuyển khoản ngân hàng tự động (VietQR)</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- MoMo Pay Integration -->
        <div class="bg-gray-50/50 border border-gray-150 rounded-xl p-5 space-y-4">
          <div class="flex items-center gap-2 border-b pb-2">
            <div class="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white font-black text-sm select-none">M</div>
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-800">Cấu hình thanh toán MoMo</h4>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Momo Partner Code</label>
              <input type="text" id="int-momo-partner" value="${integrations.momo?.partner_code || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập Partner Code" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Access Key</label>
              <input type="password" id="int-momo-access" value="${integrations.momo?.access_key || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập Access Key" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Secret Key</label>
              <input type="password" id="int-momo-secret" value="${integrations.momo?.secret_key || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập Secret Key" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Số điện thoại ví MoMo</label>
              <input type="text" id="int-momo-phone" value="${integrations.momo?.phone_number || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập số điện thoại ví Momo nhận tiền" />
            </div>
          </div>
        </div>

        <!-- Bank Transfer Integration -->
        <div class="bg-gray-50/50 border border-gray-150 rounded-xl p-5 space-y-4">
          <div class="flex items-center gap-2 border-b pb-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white font-black text-sm select-none">B</div>
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-800">Cấu hình chuyển khoản ngân hàng</h4>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Tên viết tắt ngân hàng (VietQR Code)</label>
              <input type="text" id="int-bank-name" value="${integrations.bank_transfer?.bank_name || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Ví dụ: VCB, TCB, MB, ACB..." />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Số tài khoản ngân hàng</label>
              <input type="text" id="int-bank-account" value="${integrations.bank_transfer?.account_number || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập số tài khoản ngân hàng" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Tên chủ tài khoản (Viết không dấu)</label>
              <input type="text" id="int-bank-holder" value="${integrations.bank_transfer?.account_holder || ''}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Ví dụ: NGUYEN VAN A" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindPaymentTab(container, settings) {
  if (!settings.third_party_integrations) {
    settings.third_party_integrations = {
      momo: { partner_code: '', access_key: '', secret_key: '', phone_number: '' },
      bank_transfer: { bank_name: '', account_number: '', account_holder: '' }
    };
  }
  const integrations = settings.third_party_integrations;

  // Momo Pay
  container.querySelector('#int-momo-partner')?.addEventListener('input', (e) => {
    if (!integrations.momo) integrations.momo = {};
    integrations.momo.partner_code = e.target.value.trim();
  });
  container.querySelector('#int-momo-access')?.addEventListener('input', (e) => {
    if (!integrations.momo) integrations.momo = {};
    integrations.momo.access_key = e.target.value.trim();
  });
  container.querySelector('#int-momo-secret')?.addEventListener('input', (e) => {
    if (!integrations.momo) integrations.momo = {};
    integrations.momo.secret_key = e.target.value.trim();
  });
  container.querySelector('#int-momo-phone')?.addEventListener('input', (e) => {
    if (!integrations.momo) integrations.momo = {};
    integrations.momo.phone_number = e.target.value.trim();
  });

  // Bank Transfer
  container.querySelector('#int-bank-name')?.addEventListener('input', (e) => {
    if (!integrations.bank_transfer) integrations.bank_transfer = {};
    integrations.bank_transfer.bank_name = e.target.value.trim();
  });
  container.querySelector('#int-bank-account')?.addEventListener('input', (e) => {
    if (!integrations.bank_transfer) integrations.bank_transfer = {};
    integrations.bank_transfer.account_number = e.target.value.trim();
  });
  container.querySelector('#int-bank-holder')?.addEventListener('input', (e) => {
    if (!integrations.bank_transfer) integrations.bank_transfer = {};
    integrations.bank_transfer.account_holder = e.target.value.trim();
  });
}
