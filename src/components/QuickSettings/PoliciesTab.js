import { showToast } from '../../pages/Admin/shared/ui.js';

export const policyList = [
  { slug: 'worldwide-shipping', label: 'WORLDWIDE SHIPPING' },
  { slug: 'product-care', label: 'BẢO QUẢN SẢN PHẨM' },
  { slug: 'exchange-policy', label: 'CHÍNH SÁCH ĐỔI - TRẢ HÀNG' },
  { slug: 'privacy-policy', label: 'CHÍNH SÁCH BẢO MẬT' },
  { slug: 'member-system', label: 'HỆ THỐNG THÀNH VIÊN' },
  { slug: 'store-system', label: 'HỆ THỐNG CỬA HÀNG MẮT BÃO WS' },
  { slug: 'brand-massage', label: 'BRAND MASSAGE / STORY' }
];

export function getDefaultPolicyContent(slug) {
  const brand = window.APP_SETTINGS?.brand_name || 'Mắt Bão WS';
  const policies = {
    'worldwide-shipping': {
      title: 'WORLDWIDE SHIPPING',
      content: `
        <p class="font-bold">${brand} cung cấp dịch vụ giao hàng toàn cầu với tiêu chuẩn cao nhất.</p>
        <p>Thời gian giao hàng quốc tế dao động từ 7 đến 14 ngày làm việc tùy thuộc vào quốc gia nhận hàng.</p>
        <p class="mt-4 font-bold text-black uppercase">1. Biểu phí vận chuyển:</p>
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Khu vực Châu Á: Đồng giá 250,000 VND. Miễn phí cho đơn hàng trên 3,000,000 VND.</li>
          <li>Khu vực Châu Âu & Mỹ: Đồng giá 450,000 VND. Miễn phí cho đơn hàng trên 5,000,000 VND.</li>
        </ul>
        <p class="mt-4 font-bold text-black uppercase">2. Thuế & Lệ phí hải quan:</p>
        <p>Khách hàng tại nước sở tại chịu trách nhiệm thanh toán các khoản thuế nhập khẩu và phí hải quan phát sinh theo quy định của quốc gia đó.</p>
      `
    },
    'product-care': {
      title: 'BẢO QUẢN SẢN PHẨM',
      content: `
        <p class="font-bold">Hướng dẫn giặt và bảo quản trang phục ${brand} để giữ form dáng và chất lượng vải tốt nhất:</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h3 class="font-bold text-black uppercase text-xs mb-2">1. Cách giặt:</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>Nên giặt bằng tay ở nhiệt độ thường hoặc lộn trái áo khi giặt máy ở chế độ nhẹ.</li>
              <li>Không đổ trực tiếp bột giặt/nước xả lên hình in.</li>
              <li>Sử dụng nước lạnh hoặc ấm dưới 30 độ C.</li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-black uppercase text-xs mb-2">2. Phơi & Ủi:</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>Phơi sản phẩm ở nơi thoáng mát, tránh ánh nắng trực tiếp gây phai màu.</li>
              <li>Lộn trái hình in khi ủi, tốt nhất nên sử dụng bàn ủi hơi nước ở nhiệt độ thấp.</li>
              <li>Tránh sấy khô ở nhiệt độ cao.</li>
            </ul>
          </div>
        </div>
      `
    },
    'exchange-policy': {
      title: 'CHÍNH SÁCH ĐỔI - TRẢ HÀNG',
      content: `
        <p class="font-bold">${brand} hỗ trợ đổi hàng trong vòng 7 ngày kể từ ngày nhận sản phẩm.</p>
        <p class="mt-4 font-bold text-black uppercase">1. Điều kiện đổi trả:</p>
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Sản phẩm còn nguyên nhãn mác, chưa qua sử dụng, giặt ủi và không bị hư hại.</li>
          <li>Sản phẩm bị lỗi kỹ thuật từ nhà sản xuất (được hỗ trợ phí vận chuyển 2 chiều).</li>
          <li>Không áp dụng trả hàng hoàn tiền trừ trường hợp sản phẩm hết size đổi và gặp lỗi từ nhà sản xuất.</li>
        </ul>
        <p class="mt-4 font-bold text-black uppercase">2. Quy trình đổi trả:</p>
        <p>Vui lòng liên hệ Hotline hoặc nhắn tin trực tiếp qua Fanpage ${brand} để được nhân viên hướng dẫn gửi hàng đổi trả về store gần nhất.</p>
      `
    },
    'privacy-policy': {
      title: 'CHÍNH SÁCH BẢO MẬT',
      content: `
        <p class="font-bold">${brand} cam kết bảo vệ tuyệt đối thông tin cá nhân của khách hàng.</p>
        <p class="mt-4 font-bold text-black uppercase">1. Thu thập thông tin:</p>
        <p>Chúng tôi chỉ thu thập thông tin khách hàng dùng cho mục đích đặt hàng, giao nhận sản phẩm và gửi các chương trình khuyến mãi tri ân.</p>
        <p class="mt-4 font-bold text-black uppercase">2. Bảo mật dữ liệu:</p>
        <p>Mọi giao dịch thanh toán trực tuyến qua cổng liên kết đều được mã hóa SSL chuẩn bảo mật cao nhất, tránh rò rỉ dữ liệu bên ngoài.</p>
      `
    },
    'store-system': {
      title: `HỆ THỐNG CỬA HÀNG ${brand.toUpperCase()}`,
      content: `
        <p class="font-bold text-lg mb-4 text-[#ff3b30]">${brand.toUpperCase()} CLOTHING STORE LOCATIONS</p>
        <div class="space-y-6">
          <div class="border-l-2 border-black pl-4">
            <h3 class="font-bold text-black">CHI NHÁNH HỒ CHÍ MINH</h3>
            <p class="mt-1">Địa chỉ: 123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh</p>
            <p class="text-xs text-zinc-500">Giờ mở cửa: 09:30 - 22:00 (Hàng ngày)</p>
          </div>
          <div class="border-l-2 border-black pl-4">
            <h3 class="font-bold text-black">CHI NHÁNH HÀ NỘI</h3>
            <p class="mt-1">Địa chỉ: 45 Đường Láng, Đống Đa, Hà Nội</p>
            <p class="text-xs text-zinc-500">Giờ mở cửa: 09:30 - 22:00 (Hàng ngày)</p>
          </div>
        </div>
      `
    },
    'brand-massage': {
      title: 'BRAND MASSAGE / STORY',
      content: `
        <p class="font-bold text-lg mb-2 text-[#ff3b30] tracking-widest font-serif italic">"${brand.toUpperCase()} — Only Sell Online"</p>
        <p>Được thành lập từ niềm đam mê văn hóa đường phố độc đáo, ${brand} định hình phong cách thời trang đường phố tối giản nhưng không kém phần nổi bật và cá tính.</p>
        <p class="mt-4">Chúng tôi hướng đến những bạn trẻ hiện đại, yêu tự do, thích dịch chuyển và khao khát thể hiện bản thân qua những trang phục được thiết kế tỉ mỉ, chất liệu cao cấp và form dáng hoàn hảo nhất.</p>
        <p class="mt-4"><strong>Only Sell Online:</strong> Tập trung bán lẻ qua nền tảng trực tuyến giúp ${brand} tối ưu hóa trải nghiệm số, đưa sản phẩm chất lượng cao nhất tới khách hàng nhanh chóng với giá cả phù hợp nhất.</p>
      `
    },
    'member-system': {
      title: `HỆ THỐNG THÀNH VIÊN ${brand.toUpperCase()}`,
      content: `
        <p class="font-bold text-base text-[#ff3b30] tracking-wider uppercase">Chương trình Khách hàng Thân Thiết ${brand} Loyalty Program</p>
        <p>Khi đăng ký tài khoản mua hàng tại ${brand} Clothing, bạn sẽ tự động tham gia tích lũy điểm thưởng để thăng hạng thành viên với các ưu đãi đặc quyền dài hạn.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div class="border border-zinc-200 p-6 rounded-lg bg-zinc-50">
            <h3 class="font-black text-black text-lg mb-2">SILVER MEMBER</h3>
            <p class="text-xs text-[#ff3b30] font-bold uppercase mb-4">Chi tiêu từ 1,000,000 VND</p>
            <ul class="list-disc pl-5 space-y-1 text-xs">
              <li>Giảm giá 5% cho tất cả đơn hàng sau.</li>
              <li>Quà tặng sinh nhật trị giá 100,000 VND.</li>
              <li>Nhận trước thông tin về các bộ sưu tập mới.</li>
            </ul>
          </div>
          <div class="border border-zinc-200 p-6 rounded-lg bg-zinc-50">
            <h3 class="font-black text-black text-lg mb-2">GOLD MEMBER</h3>
            <p class="text-xs text-[#ff3b30] font-bold uppercase mb-4">Chi tiêu từ 5,000,000 VND</p>
            <ul class="list-disc pl-5 space-y-1 text-xs">
              <li>Giảm giá 10% cho tất cả đơn hàng sau.</li>
              <li>Quà tặng sinh nhật trị giá 300,000 VND.</li>
              <li>Miễn phí vận chuyển toàn quốc không giới hạn đơn hàng.</li>
            </ul>
          </div>
          <div class="border border-zinc-200 p-6 rounded-lg bg-zinc-50">
            <h3 class="font-black text-black text-lg mb-2">PLATINUM</h3>
            <p class="text-xs text-[#ff3b30] font-bold uppercase mb-4">Chi tiêu từ 10,000,000 VND</p>
            <ul class="list-disc pl-5 space-y-1 text-xs">
              <li>Giảm giá 15% cho tất cả đơn hàng sau.</li>
              <li>Quà tặng sinh nhật trị giá 500,000 VND.</li>
              <li>Đặc quyền tham gia các Private Sale đặc biệt từ ${brand}.</li>
            </ul>
          </div>
        </div>
      `
    }
  };
  return policies[slug] || { title: 'THÔNG TIN CHÍNH SÁCH', content: '<p>Nội dung đang được cập nhật...</p>' };
}

export function renderPoliciesForm(settings, selectedPolicySlug) {
  if (!settings.policies) settings.policies = {};
  if (!settings.policies_menu) {
    settings.policies_menu = [
      { label: 'WORLDWIDE SHIPPING', href: '/policies/worldwide-shipping', visible: true },
      { label: 'BẢO QUẢN SẢN PHẨM', href: '/policies/product-care', visible: true },
      { label: 'CHÍNH SÁCH ĐỔI – TRẢ HÀNG', href: '/policies/exchange-policy', visible: true },
      { label: 'CHÍNH SÁCH BẢO MẬT', href: '/policies/privacy-policy', visible: true },
      { label: 'HỆ THỐNG THÀNH VIÊN', href: '/member/system', visible: true },
      { label: 'HỆ THỐNG CỬA HÀNG', href: '/policies/store-system', visible: true }
    ];
  }

  // Ensure all policy slugs have content (or fall back to default)
  policyList.forEach(p => {
    if (!settings.policies[p.slug]) {
      const defaultPol = getDefaultPolicyContent(p.slug);
      settings.policies[p.slug] = {
        title: defaultPol.title,
        content: defaultPol.content
      };
    }
  });

  const currentPolicy = settings.policies[selectedPolicySlug] || settings.policies[policyList[0].slug];

  return `
    <div class="space-y-6 font-sans text-xs">
      <!-- 1. Policy Menu List -->
      <div class="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-3">
        <div class="flex items-center justify-between border-b pb-2 border-gray-200">
          <span class="font-bold text-gray-800">1. Cấu hình Menu Chính Sách</span>
          <button type="button" id="quick-add-policy-menu-item" class="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-[9px] px-2 py-1 rounded transition-colors border-0 cursor-pointer">
            + Thêm liên kết
          </button>
        </div>
        <div class="space-y-2.5" id="quick-policy-menu-list">
          ${settings.policies_menu.length === 0
      ? `<div class="text-center py-6 text-gray-400">Chưa có liên kết chính sách nào.</div>`
      : settings.policies_menu.map((item, i) => `
              <div class="quick-policy-menu-row flex flex-wrap items-center gap-2 bg-white p-2 border border-gray-100 rounded shadow-sm" data-policy-item-index="${i}">
                <div class="flex-1 min-w-[100px]">
                  <input type="text" class="quick-policy-item-label w-full px-2 py-1 border border-gray-300 rounded text-[11px] focus:outline-none" value="${item.label || ''}" placeholder="Tên chính sách" />
                </div>
                <div class="flex-[1.5] min-w-[120px]">
                  <input type="text" class="quick-policy-item-href w-full px-2 py-1 border border-gray-300 rounded text-[11px] focus:outline-none" value="${item.href || ''}" placeholder="Liên kết" />
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <label class="flex items-center gap-0.5 cursor-pointer select-none">
                    <input type="checkbox" class="quick-policy-item-visible accent-[#C9A84C]" ${item.visible !== false ? 'checked' : ''} />
                    <span class="text-[9px] font-bold text-gray-500 uppercase">Hiện</span>
                  </label>
                  <button type="button" class="quick-move-up-policy-item-btn p-1 border border-gray-200 hover:bg-gray-50 rounded bg-white cursor-pointer ${i === 0 ? 'opacity-30 cursor-not-allowed' : ''}" ${i === 0 ? 'disabled' : ''}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                  </button>
                  <button type="button" class="quick-move-down-policy-item-btn p-1 border border-gray-200 hover:bg-gray-50 rounded bg-white cursor-pointer ${i === settings.policies_menu.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" ${i === settings.policies_menu.length - 1 ? 'disabled' : ''}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button type="button" class="quick-delete-policy-item-btn p-1 border border-red-50 hover:bg-red-50 text-red-500 rounded bg-white cursor-pointer">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                  </button>
                </div>
              </div>
            `).join('')}
        </div>
      </div>

      <!-- 2. Detailed Policy Editor -->
      <div class="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-3">
        <div class="flex items-center justify-between border-b pb-2 border-gray-200">
          <span class="font-bold text-gray-800">2. Soạn thảo Nội dung chi tiết</span>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Chọn trang chính sách để soạn thảo</label>
            <select id="quick-policy-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] font-semibold text-gray-700 bg-white">
              ${policyList.map(p => `
                <option value="${p.slug}" ${p.slug === selectedPolicySlug ? 'selected' : ''}>${p.label}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="space-y-3 pt-2">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề chính (Title)</label>
              <input type="text" id="quick-policy-title" value="${currentPolicy.title || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nội dung trang (Hỗ trợ định dạng HTML)</label>
              <textarea id="quick-policy-content" rows="12" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A84C] font-mono resize-none">${currentPolicy.content || ''}</textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindPoliciesEvents(modalEl, settings, renderModal, selectedPolicySlug, setPolicySlug) {
  const select = modalEl.querySelector('#quick-policy-select');
  if (select) {
    select.addEventListener('change', (e) => {
      setPolicySlug(e.target.value);
      renderModal();
    });
  }

  const currentPolicy = settings.policies[selectedPolicySlug] || settings.policies[policyList[0].slug];
  if (currentPolicy) {
    modalEl.querySelector('#quick-policy-title')?.addEventListener('input', (e) => {
      currentPolicy.title = e.target.value.trim();
    });
    modalEl.querySelector('#quick-policy-content')?.addEventListener('input', (e) => {
      currentPolicy.content = e.target.value;
    });
  }

  // 1. Policies Menu list row bindings
  const menuList = modalEl.querySelector('#quick-policy-menu-list');
  menuList?.querySelectorAll('.quick-policy-menu-row').forEach(row => {
    const idx = parseInt(row.dataset.policyItemIndex, 10);
    const item = settings.policies_menu[idx];
    if (!item) return;

    row.querySelector('.quick-policy-item-label')?.addEventListener('input', (e) => {
      item.label = e.target.value.trim();
    });
    row.querySelector('.quick-policy-item-href')?.addEventListener('input', (e) => {
      item.href = e.target.value.trim();
    });
    row.querySelector('.quick-policy-item-visible')?.addEventListener('change', (e) => {
      item.visible = e.target.checked;
    });

    row.querySelector('.quick-move-up-policy-item-btn')?.addEventListener('click', () => {
      if (idx === 0) return;
      const temp = settings.policies_menu[idx];
      settings.policies_menu[idx] = settings.policies_menu[idx - 1];
      settings.policies_menu[idx - 1] = temp;
      renderModal();
    });

    row.querySelector('.quick-move-down-policy-item-btn')?.addEventListener('click', () => {
      if (idx === settings.policies_menu.length - 1) return;
      const temp = settings.policies_menu[idx];
      settings.policies_menu[idx] = settings.policies_menu[idx + 1];
      settings.policies_menu[idx + 1] = temp;
      renderModal();
    });

    row.querySelector('.quick-delete-policy-item-btn')?.addEventListener('click', () => {
      if (confirm(`Bạn có chắc chắn muốn xóa liên kết chính sách này không?`)) {
        settings.policies_menu.splice(idx, 1);
        showToast('Đã xóa liên kết chính sách.', 'info');
        renderModal();
      }
    });
  });

  modalEl.querySelector('#quick-add-policy-menu-item')?.addEventListener('click', () => {
    if (!settings.policies_menu) settings.policies_menu = [];
    settings.policies_menu.push({ label: 'Chính Sách Mới', href: '/policies/new-policy', visible: true });
    showToast('Đã thêm liên kết chính sách mới.', 'success');
    renderModal();
  });
}
