import { showToast } from '../shared/ui.js';

export function renderSecurityTab(settings) {
  const geo = settings.ip_geo_blocking || {
    mode: 'disabled',
    blocked_ips: [],
    allowed_countries: [],
    blocked_countries: []
  };

  const blockedIpsText = Array.isArray(geo.blocked_ips) ? geo.blocked_ips.join('\n') : (geo.blocked_ips || '');
  const allowedText = Array.isArray(geo.allowed_countries) ? geo.allowed_countries.join('\n') : (geo.allowed_countries || '');
  const blockedText = Array.isArray(geo.blocked_countries) ? geo.blocked_countries.join('\n') : (geo.blocked_countries || '');

  return `
    <div class="space-y-8">
      <h3 class="text-base font-bold text-gray-900 border-b pb-3">Bảo Mật & Chặn IP / Quốc Gia</h3>
      
      <div class="max-w-2xl space-y-6">
        <!-- Chế độ chặn -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Chế độ giới hạn Quốc gia (Geo-blocking)</label>
          <select id="geo-mode-select" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/25 focus:border-[#C9A84C]">
            <option value="disabled" ${geo.mode === 'disabled' ? 'selected' : ''}>Tắt chế độ chặn Quốc gia</option>
            <option value="whitelist" ${geo.mode === 'whitelist' ? 'selected' : ''}>Chế độ Whitelist (Chỉ cho phép các quốc gia cụ thể)</option>
            <option value="blacklist" ${geo.mode === 'blacklist' ? 'selected' : ''}>Chế độ Blacklist (Chặn các quốc gia cụ thể)</option>
          </select>
          <p class="text-[11px] text-gray-400 mt-1">Khi bật giới hạn, hệ thống sẽ tự động phân tích IP truy cập để phát hiện quốc gia (Country Code) tương ứng và áp dụng luật chặn.</p>
        </div>

        <!-- Ô nhập danh sách IP bị chặn (Luôn hiện) -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Danh sách địa chỉ IP bị chặn (IP Blacklist)</label>
          <textarea id="geo-blocked-ips" rows="5" placeholder="Ví dụ:\n1.2.3.4\n5.6.7.8" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/25 focus:border-[#C9A84C]">${blockedIpsText}</textarea>
          <p class="text-[11px] text-gray-400 mt-1">Nhập danh sách IP bạn muốn chặn truy cập toàn bộ hệ thống. Nhập mỗi địa chỉ IP trên một dòng.</p>
        </div>

        <!-- Whitelist quốc gia (Hiện khi chọn Whitelist) -->
        <div id="wrapper-whitelist" class="${geo.mode === 'whitelist' ? '' : 'hidden'}">
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Danh sách quốc gia được phép truy cập (Whitelist)</label>
          <textarea id="geo-allowed-countries" rows="4" placeholder="Ví dụ:\nVN\nSG\nJP" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/25 focus:border-[#C9A84C]">${allowedText}</textarea>
          <p class="text-[11px] text-gray-400 mt-1">Nhập danh sách mã Quốc gia (2 ký tự ISO, ví dụ: VN đại diện Việt Nam, SG đại diện Singapore) được phép truy cập. Mọi quốc gia ngoài danh sách này sẽ bị chặn. Nhập mỗi mã trên một dòng.</p>
        </div>

        <!-- Blacklist quốc gia (Hiện khi chọn Blacklist) -->
        <div id="wrapper-blacklist" class="${geo.mode === 'blacklist' ? '' : 'hidden'}">
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Danh sách quốc gia bị chặn truy cập (Blacklist)</label>
          <textarea id="geo-blocked-countries" rows="4" placeholder="Ví dụ:\nUS\nCN\nRU" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/25 focus:border-[#C9A84C]">${blockedText}</textarea>
          <p class="text-[11px] text-gray-400 mt-1">Nhập danh sách mã Quốc gia (ví dụ: US đại diện Mỹ, CN đại diện Trung Quốc) bị chặn không được phép truy cập trang web. Nhập mỗi mã trên một dòng.</p>
        </div>
      </div>
    </div>
  `;
}

export function bindSecurityTab(container, settings, token, API_BASE, ctx) {
  const selectMode = container.querySelector('#geo-mode-select');
  const textareaIps = container.querySelector('#geo-blocked-ips');
  const textareaAllowed = container.querySelector('#geo-allowed-countries');
  const textareaBlocked = container.querySelector('#geo-blocked-countries');

  const wrapperWhitelist = container.querySelector('#wrapper-whitelist');
  const wrapperBlacklist = container.querySelector('#wrapper-blacklist');

  function syncData() {
    if (!settings.ip_geo_blocking) {
      settings.ip_geo_blocking = {};
    }
    settings.ip_geo_blocking.mode = selectMode.value;
    settings.ip_geo_blocking.blocked_ips = textareaIps.value.split('\n').map(x => x.trim()).filter(Boolean);
    settings.ip_geo_blocking.allowed_countries = textareaAllowed.value.split('\n').map(x => x.trim()).filter(Boolean);
    settings.ip_geo_blocking.blocked_countries = textareaBlocked.value.split('\n').map(x => x.trim()).filter(Boolean);
    
    ctx.saveSettingsDraft();
  }

  selectMode?.addEventListener('change', () => {
    const val = selectMode.value;
    if (val === 'whitelist') {
      wrapperWhitelist?.classList.remove('hidden');
      wrapperBlacklist?.classList.add('hidden');
    } else if (val === 'blacklist') {
      wrapperWhitelist?.classList.add('hidden');
      wrapperBlacklist?.classList.remove('hidden');
    } else {
      wrapperWhitelist?.classList.add('hidden');
      wrapperBlacklist?.classList.add('hidden');
    }
    syncData();
  });

  textareaIps?.addEventListener('input', syncData);
  textareaAllowed?.addEventListener('input', syncData);
  textareaBlocked?.addEventListener('input', syncData);
}
