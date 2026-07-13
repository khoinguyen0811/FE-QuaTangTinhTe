/**
 * MainFooter.js — Site footer for Mắt Bão WS
 */
import { navigate } from '../utils/helpers.js';
import { hasAdminPermission } from '../utils/adminAuth.js';

const FOOTER_LINKS = {
  SHOP: [
    { label: 'Tops', href: '/products?category_slug=tops' },
    { label: 'Outwears', href: '/products?category_slug=outwears' },
    { label: 'Bottoms', href: '/products?category_slug=bottoms' },
    { label: 'Accessories', href: '/products?category_slug=accessories' },
  ],
  SERVICE: [
    { label: 'Worldwide Shipping', href: '/policies/worldwide-shipping' },
    { label: 'Bảo quản sản phẩm', href: '/policies/product-care' },
    { label: 'Chính sách đổi - trả hàng', href: '/policies/exchange-policy' },
    { label: 'Chính sách bảo mật', href: '/policies/privacy-policy' },
    { label: 'Hệ thống thành viên', href: '/member/system' },
    { label: 'Hệ thống cửa hàng', href: '/policies/store-system' },
  ],
};

export class MainFooter {
  render() {
    const canEditSettings = hasAdminPermission('settings:write');

    const footer = document.createElement('footer');
    footer.className = 'w-full bg-white text-black py-12 px-6 border-t border-zinc-100 font-sans text-xs relative';
    footer.innerHTML = this._html(canEditSettings);
    
    // Bind routing events
    footer.querySelectorAll('a[href^="/"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(a.getAttribute('href'));
      });
    });

    if (canEditSettings) {
      footer.querySelector('#footer-edit-info-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { openQuickSettings } = await import('./QuickSettingsModal.js?v=1.0.24');
        openQuickSettings('sections', 'footer');
      });
    }

    return footer;
  }

  _html(canEditSettings = false) {
    const brand = window.APP_SETTINGS?.brand_name || 'Mắt Bão WS';
    const footerData = window.APP_SETTINGS?.home_sections?.footer || {
      business_name: 'HỘ KINH DOANH MẮT BÃO WS',
      address: 'Trụ sở: 182/13A Lê Văn Sỹ, Phường 10, Quận Phú Nhuận, Thành phố Hồ Chí Minh',
      business_code: 'Mã số hộ kinh doanh: 8116645121-001',
      socials: {
        facebook: 'https://facebook.com',
        shopee: 'https://shopee.vn',
        tiktok: 'https://tiktok.com',
        instagram: 'https://instagram.com'
      }
    };
    
    const socials = footerData.socials || {};

    return `
      <div class="max-w-[1280px] mx-auto text-center space-y-8 py-4 font-sans text-black relative select-none">
        <!-- Follow Section -->
        <div class="space-y-3">
          <h4 class="text-xs font-black uppercase tracking-widest text-black">THEO DÕI ${brand.toUpperCase()} NGAY</h4>
          <div class="flex justify-center items-center gap-4 text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-wider">
            <a href="${socials.facebook || 'https://facebook.com'}" target="_blank" class="hover:text-black transition">FACEBOOK</a>
            <span class="text-zinc-200">|</span>
            <a href="${socials.shopee || 'https://shopee.vn'}" target="_blank" class="hover:text-black transition">SHOPEE</a>
            <span class="text-zinc-200">|</span>
            <a href="${socials.tiktok || 'https://tiktok.com'}" target="_blank" class="hover:text-black transition">TIKTOK</a>
            <span class="text-zinc-200">|</span>
            <a href="${socials.instagram || 'https://instagram.com'}" target="_blank" class="hover:text-black transition">INSTAGRAM</a>
          </div>
        </div>

        <!-- Links Section -->
        <div class="border-t border-b border-zinc-100 py-5 text-[9px] sm:text-xs font-black text-zinc-400 uppercase tracking-wider flex flex-wrap justify-center items-center gap-x-3 gap-y-1.5">
          ${(window.APP_SETTINGS?.policies_menu || [
            { label: 'WORLDWIDE SHIPPING', href: '/policies/worldwide-shipping', visible: true },
            { label: 'BẢO QUẢN SẢN PHẨM', href: '/policies/product-care', visible: true },
            { label: 'CHÍNH SÁCH ĐỔI – TRẢ HÀNG', href: '/policies/exchange-policy', visible: true },
            { label: 'CHÍNH SÁCH BẢO MẬT', href: '/policies/privacy-policy', visible: true },
            { label: 'HỆ THỐNG THÀNH VIÊN', href: '/member/system', visible: true },
            { label: 'HỆ THỐNG CỬA HÀNG', href: '/policies/store-system', visible: true }
          ])
            .filter(item => item.visible !== false)
            .map(item => `
              <a href="${item.href}" class="hover:text-black transition">${item.label}</a>
            `).join('\n<span class="text-zinc-200 hidden sm:inline">|</span>\n')}
        </div>

        <!-- Logo Seal -->
        ${'' /*
        <div class="flex justify-center">
          <a href="http://online.gov.vn" target="_blank">
            <img src="https://nhanluat.com.vn/wp-content/uploads/2023/10/logoSaleNoti.png" alt="Đã Thông Báo Bộ Công Thương" class="h-10 object-contain opacity-90 hover:opacity-100 transition" />
          </a>
        </div>
        */}

        <!-- Business Info -->
        <div class="relative text-[10px] sm:text-[11px] font-bold text-zinc-400 space-y-1 leading-relaxed max-w-xl mx-auto">
          ${canEditSettings ? `
            <div class="absolute -top-10 left-1/2 -translate-x-1/2 flex justify-center">
              <button id="footer-edit-info-btn" class="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white rounded-lg border border-white/20 shadow-md text-[10px] font-black uppercase tracking-wider hover:bg-[#C9A84C] transition cursor-pointer select-none border-none" title="Chỉnh sửa thông tin chân trang">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span>Sửa thông tin chân trang</span>
              </button>
            </div>
          ` : ''}
          <p class="text-zinc-800 font-black tracking-widest text-[11px] sm:text-xs uppercase mb-2">${footerData.business_name || 'HỘ KINH DOANH MẮT BÃO WS'}</p>
          <p>${footerData.address || 'Trụ sở: 182/13A Lê Văn Sỹ, Phường 10, Quận Phú Nhuận, Thành phố Hồ Chí Minh'}</p>
          <p>${footerData.business_code || 'Mã số hộ kinh doanh: 8116645121-001'}</p>
          <p class="pt-4 text-zinc-400 font-bold uppercase tracking-widest text-[9px]">${brand.toLowerCase().replace(/\s+/g, '')}</p>
        </div>
      </div>
    `;
  }
}
