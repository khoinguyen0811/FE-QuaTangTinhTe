/**
 * Home/index.js — Homepage orchestrator for SLY Clothing
 */
import { openQuickSettings } from '../../components/QuickSettingsModal.js?v=1.0.24';
import { hasAdminPermission } from '../../utils/adminAuth.js';
import { escapeHtml } from '../../utils/helpers.js';
import { applyHeadMetadata } from '../../seo/head.js';
import { organizationSchema, websiteSchema } from '../../seo/schema.js';
import { robotsForLocation } from '../../seo/urlMap.js';

function toCssNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeHref(value, fallback = '/products') {
  const href = String(value || '').trim();
  if (!href) return fallback;
  return /^(https?:\/\/|\/|#)/i.test(href) ? href : fallback;
}

export default class HomePage {
  constructor() { }

  async render() {
    const wrap = document.createElement('div');
    wrap.id = 'home-page';
    wrap.className = 'w-full h-[100dvh] bg-zinc-100 overflow-hidden relative';

    const brand = window.APP_SETTINGS?.brand_name || 'Mắt Bão WS';
    const domain = window.APP_SETTINGS?.project_domain || 'matbaows.vn';

    // Fetch dynamic banner from settings
    const banners = window.APP_SETTINGS?.hero_banners || [];
    const banner = banners[0] || {
      img: '../backend/public/image/banner/sale_online_w.webp',
      mobile_img: '../backend/public/image/banner/sale_online_m.webp',
      title: brand + ' — Only Sell Online',
      subtitle: 'Thời trang thiết kế độc quyền. Only Sell Online.',
      ctaHref: '/products'
    };

    const canEditSettings = hasAdminPermission('settings:write');
    const title = banner.title || `${brand} — Only Sell Online`;
    const description = window.APP_SETTINGS?.website_description
      || window.APP_SETTINGS?.meta_description
      || banner.subtitle
      || `${brand} là thương hiệu thời trang thiết kế độc quyền, chuyên bán trực tuyến tại ${domain}.`;
    const ctaHref = safeHref(banner.ctaHref);
    const desktopImage = banner.img || '../backend/public/image/banner/sale_online_w.webp';
    const mobileImage = banner.mobile_img || desktopImage || '../backend/public/image/banner/sale_online_m.webp';
    const desktopPanX = toCssNumber(banner.panX);
    const desktopPanY = toCssNumber(banner.panY);
    const desktopZoom = toCssNumber(banner.zoom, 1);
    const mobilePanX = toCssNumber(banner.mobile_panX);
    const mobilePanY = toCssNumber(banner.mobile_panY);
    const mobileZoom = toCssNumber(banner.mobile_zoom, 1);

    this._applySeo({ title, description, image: desktopImage });

    // Simple full-screen responsive banner link
    wrap.innerHTML = `
      <style>
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        .float-voucher {
          animation: gentle-float 3s ease-in-out infinite;
        }
      </style>

      <h1 class="sr-only">${escapeHtml(title)}</h1>

      <a href="${escapeHtml(ctaHref)}" class="block w-full h-full relative overflow-hidden select-none">
        <!-- Desktop Banner -->
        <img 
          src="${escapeHtml(desktopImage)}" 
          alt="${escapeHtml(title)}" 
          class="hidden md:block w-full h-full object-cover" 
          style="object-position: calc(50% + ${desktopPanX}%) calc(50% + ${desktopPanY}%); transform: scale(${desktopZoom}); transform-origin: center center;"
        />
        <!-- Mobile Banner -->
        <img 
          src="${escapeHtml(mobileImage)}" 
          alt="${escapeHtml(title)}" 
          class="block md:hidden w-full h-full object-cover" 
          style="object-position: calc(50% + ${mobilePanX}%) calc(50% + ${mobilePanY}%); transform: scale(${mobileZoom}); transform-origin: center center;"
        />
      </a>

      <!-- Floating Voucher Sticker/Badge (Bottom Left) -->
      <div 
        id="home-floating-voucher"
        class="float-voucher absolute bottom-4 left-4 md:bottom-24 md:left-8 z-40 flex items-center justify-between border border-dashed border-accent-gold/60 bg-white text-zinc-950 hover:bg-zinc-950 hover:text-accent-gold hover:border-zinc-950 active:scale-95 transition-all duration-300 rounded-xl p-3 shadow-xl cursor-pointer select-none"
        style="min-width: 170px;"
      >
        <!-- Ticket notches -->
        <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-zinc-100 border-r border-dashed border-accent-gold/60 rounded-full"></div>
        <div class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-zinc-100 border-l border-dashed border-accent-gold/60 rounded-full"></div>
        
        <div class="pl-2 pr-3 border-r border-dashed border-zinc-950/20 flex flex-col justify-center">
          <span class="text-xs font-black leading-none uppercase">Giảm 50K</span>
          <span class="text-[8px] opacity-75 font-bold mt-1 uppercase">Đơn từ 50K</span>
        </div>
        <div class="pl-3 pr-2 flex flex-col items-center justify-center">
          <span class="text-xs font-black font-mono tracking-wide leading-none">WELCOME</span>
          <span id="home-voucher-label" class="text-[8px] font-black mt-1 uppercase tracking-wider text-zinc-650 transition-colors">Lưu Mã</span>
        </div>
      </div>

      <!-- Circular pencil edit button for Admins (like Watch website) -->
      ${canEditSettings ? `
        <div class="absolute top-28 left-8 z-40">
          <button id="quick-edit-home-btn" class="flex items-center justify-center h-11 w-11 rounded-full bg-zinc-950/80 hover:bg-accent-gold text-primary-gold hover:text-white border border-white/20 shadow-lg scale-100 hover:scale-110 transition-all cursor-pointer" title="Chỉnh sửa banner trang chủ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      ` : ''}
    `;

    setTimeout(() => {
      // Admin Banner Edit Button
      wrap.querySelector('#quick-edit-home-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openQuickSettings('banner', 0);
      });

      // Floating Voucher Copy Function
      const voucherBtn = wrap.querySelector('#home-floating-voucher');
      if (voucherBtn) {
        voucherBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const code = 'WELCOME';
          const copyToClipboard = (text) => {
            if (navigator.clipboard && window.isSecureContext) {
              return navigator.clipboard.writeText(text);
            } else {
              return new Promise((resolve, reject) => {
                try {
                  const textArea = document.createElement('textarea');
                  textArea.value = text;
                  textArea.style.top = '0';
                  textArea.style.left = '0';
                  textArea.style.position = 'fixed';
                  textArea.style.opacity = '0';
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();
                  const successful = document.execCommand('copy');
                  document.body.removeChild(textArea);
                  if (successful) {
                    resolve();
                  } else {
                    reject(new Error('Fallback copy failed'));
                  }
                } catch (err) {
                  reject(err);
                }
              });
            }
          };

          copyToClipboard(code).then(() => {
            const label = voucherBtn.querySelector('#home-voucher-label');
            if (label) {
              label.textContent = 'Đã nhận!';
              label.className = 'text-[8px] font-black mt-1 uppercase tracking-wider text-emerald-600';
              voucherBtn.classList.remove('bg-white');
              voucherBtn.classList.add('border-emerald-500/50', 'bg-emerald-50/95');
              
              // Fade out and disappear after 1.2 seconds
              setTimeout(() => {
                voucherBtn.style.transition = 'all 0.5s ease-in-out';
                voucherBtn.style.opacity = '0';
                voucherBtn.style.transform = 'translateY(20px) scale(0.95)';
                setTimeout(() => {
                  voucherBtn.style.display = 'none';
                }, 500);
              }, 1200);
            }
          }).catch(err => {
            console.error('Failed to copy text:', err);
          });
        });
      }
    }, 50);

    return wrap;
  }

  _applySeo({ title, description, image }) {
    const settings = window.APP_SETTINGS || {};
    const isPreview = window.location.pathname === '/admin/template';

    applyHeadMetadata({
      title,
      description,
      canonicalPath: isPreview ? '/admin/template' : '/',
      robots: robotsForLocation(settings),
      openGraph: {
        title,
        description,
        image,
        type: 'website'
      },
      schemas: isPreview ? [] : [
        organizationSchema(settings),
        websiteSchema(settings)
      ]
    }, settings);
  }
}
