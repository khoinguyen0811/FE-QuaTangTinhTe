import { hasAdminPermission } from '../../utils/adminAuth.js';
import { escapeHtml } from '../../utils/helpers.js';
import { applyHeadMetadata } from '../../seo/head.js';
import { breadcrumbSchema } from '../../seo/schema.js';
import { robotsForLocation } from '../../seo/urlMap.js';

function stripHtml(value = '') {
  return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default class PolicyPage {
  constructor(params = {}) {
    this._slug = params.slug || '';
  }

  async render() {
    const wrap = document.createElement('div');
    // Changed py-16 to pt-28 pb-16 to clear the fixed navigation bar
    wrap.className = 'min-h-[60vh] pt-32 md:pt-40 pb-16 px-6 sm:px-12 max-w-4xl mx-auto font-sans text-black';

    const canEditSettings = hasAdminPermission('settings:write');

    const policyData = this._getPolicyContent(this._slug);
    this._applySeo(policyData);

    wrap.innerHTML = `
      <h1 class="text-2xl sm:text-3xl font-black uppercase tracking-widest border-b border-black pb-4 mb-8 text-left flex items-center justify-between gap-4">
        <span>${escapeHtml(policyData.title)}</span>
        ${canEditSettings ? `
          <button id="quick-edit-policy-btn" class="shrink-0 p-1.5 bg-black hover:bg-zinc-800 text-[#C9A84C] hover:text-white rounded-lg border border-white/20 shadow-md transition cursor-pointer select-none border-none flex items-center justify-center" title="Chỉnh sửa nội dung chính sách này">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        ` : ''}
      </h1>
      <div class="prose prose-zinc max-w-none text-sm font-medium leading-relaxed space-y-6 text-zinc-800">
        ${policyData.content}
      </div>
    `;

    if (canEditSettings) {
      wrap.querySelector('#quick-edit-policy-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { openQuickSettings } = await import('../../components/QuickSettingsModal.js?v=1.0.24');
        openQuickSettings('policies', this._slug);
      });
    }

    return wrap;
  }

  _applySeo(policyData) {
    const settings = window.APP_SETTINGS || {};
    const brand = settings.brand_name || 'Thương hiệu';
    const title = policyData.meta_title || `${policyData.title} | ${brand}`;
    const description = policyData.meta_description
      || stripHtml(policyData.description || policyData.content).slice(0, 160)
      || `${policyData.title} của ${brand}`;
    const path = `/policies/${this._slug || 'policy'}`;

    applyHeadMetadata({
      title,
      description,
      canonicalPath: path,
      robots: robotsForLocation(settings),
      openGraph: {
        title,
        description,
        image: settings.og_image_url || settings.logo_url || '',
        type: 'article'
      },
      schemas: [
        breadcrumbSchema([
          { name: 'Trang chủ', url: '/' },
          { name: policyData.title, url: path }
        ], settings)
      ]
    }, settings);
  }

  _getPolicyContent(slug) {
    const brand = window.APP_SETTINGS?.brand_name || 'Mắt Bão WS';

    // Check database settings first
    if (window.APP_SETTINGS?.policies?.[slug]) {
      return window.APP_SETTINGS.policies[slug];
    }

    // Fallback to default hardcoded policies
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
      }
    };

    return policies[slug] || {
      title: 'THÔNG TIN CHÍNH SÁCH',
      content: '<p>Nội dung đang được cập nhật...</p>'
    };
  }


}
