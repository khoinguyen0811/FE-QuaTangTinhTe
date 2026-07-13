import { formatPrice } from '../../utils/helpers.js';
import { getAdminToken, hasAdminPermission } from '../../utils/adminAuth.js';

function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  if (url.match(ytRegExp)) return true;
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg')) {
    return true;
  }
  if (url.includes('/video/')) return true;
  return false;
}

function getVideoThumbnail(url) {
  if (!url || typeof url !== 'string') return '/image/default-placeholder.png';
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(ytRegExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400';
}

function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(ytRegExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  }
  return url;
}

export function renderProductDetailHtml() {
    const p = this._product;
    const images = this._getActiveImages();
    if (images.length > 0 && !images.includes(this._selectedImg)) {
      this._selectedImg = images[0];
    }
    const variants = p.variants || [];
    const isEcommerce = window.APP_SETTINGS?.is_ecommerce !== 0;

    const vouchers = this._vouchers || [];
    const vouchersHtml = vouchers.length > 0 ? `
      <div class="space-y-3 pt-4 border-t border-zinc-100">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black uppercase tracking-widest text-zinc-500">Mã giảm giá khả dụng</span>
          <span class="text-[10px] text-accent-gold font-bold">Nhấp để sao chép mã</span>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-none" style="scrollbar-width: none; -ms-overflow-style: none;">
          ${vouchers.map(v => {
            let discountDesc = '';
            if (v.discount_type === 'percentage') {
              discountDesc = `Giảm ${parseFloat(v.discount_value)}%`;
            } else if (v.discount_type === 'fixed') {
              const valK = Math.round(parseFloat(v.discount_value) / 1000);
              discountDesc = `Giảm ${valK}K`;
            } else if (v.discount_type === 'freeship') {
              discountDesc = `Freeship`;
            } else {
              discountDesc = `Quà tặng`;
            }
            
            const minSpendDesc = parseFloat(v.min_order_amount) > 0 
              ? `Đơn từ ${Math.round(parseFloat(v.min_order_amount) / 1000)}K`
              : 'Mọi đơn hàng';

            return `
              <div 
                class="copy-voucher-card shrink-0 flex items-center justify-between border border-dashed border-accent-gold/40 bg-accent-gold/5 hover:bg-accent-gold/10 active:scale-95 transition-all duration-200 rounded-lg p-2.5 cursor-pointer relative overflow-hidden select-none"
                data-code="${v.code}"
                style="min-width: 140px;"
              >
                <!-- Ticket notches -->
                <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-dashed border-accent-gold/40 rounded-full"></div>
                <div class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-dashed border-accent-gold/40 rounded-full"></div>
                
                <div class="pl-2 pr-2 border-r border-dashed border-accent-gold/30 flex flex-col justify-center">
                  <span class="text-xs font-black text-accent-gold leading-none">${discountDesc}</span>
                  <span class="text-[8px] text-zinc-400 font-medium mt-1">${minSpendDesc}</span>
                </div>
                <div class="pl-2 pr-1 flex flex-col items-center justify-center">
                  <span class="text-xs font-black text-zinc-950 font-mono tracking-wide leading-none">${v.code}</span>
                  <span class="text-[8px] text-zinc-400 font-medium mt-1 uppercase tracking-wider">Lưu mã</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : '';

    // Dynamically collect all active attributes of this product
    const attrTypes = [];
    const hasColor = variants.some(v => v.color);
    if (hasColor) {
      attrTypes.push({ name: 'color', displayName: 'Màu sắc' });
    }
    const hasSize = variants.some(v => v.size);
    if (hasSize) {
      attrTypes.push({ name: 'size', displayName: 'Size' });
    }

    const customKeys = new Set();
    variants.forEach(v => {
      if (v.attribute_values) {
        Object.keys(v.attribute_values).forEach(k => {
          if (k !== 'size' && k !== 'color') {
            customKeys.add(k);
          }
        });
      }
    });

    customKeys.forEach(k => {
      const displayName = k.charAt(0).toUpperCase() + k.slice(1).replace(/[-_]/g, ' ');
      attrTypes.push({ name: k, displayName: displayName });
    });
 
    // Parse care instructions into list items
    const careLines = p.care_instructions 
      ? p.care_instructions.split(/[.,;\n]+/).map(s => s.trim()).filter(Boolean) 
      : [];

    const canEditProduct = !!getAdminToken();
    const canEditSettings = hasAdminPermission('settings:write');

    // Load dynamic trust badges
    const ICON_SVGS = {
      truck: `<svg class="w-5 h-5 shrink-0 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/></svg>`,
      'rotate-ccw': `<svg class="w-5 h-5 shrink-0 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
      shield: `<svg class="w-5 h-5 shrink-0 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      star: `<svg class="w-5 h-5 shrink-0 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    };

    const trustBadges = window.APP_SETTINGS?.home_sections?.trust_badges || [
      { title: "Freeship toàn quốc", desc: "Mọi đơn hàng", icon: "truck" },
      { title: "Đổi trả 15 ngày", desc: "Miễn phí đổi trả", icon: "rotate-ccw" },
      { title: "Cam kết chính hãng", desc: "100% hàng thật", icon: "shield" },
      { title: "Tích điểm member", desc: "1.000đ = 1 điểm", icon: "star" }
    ];
 
    return `
      <style>
        .size-btn-disabled {
          background: linear-gradient(135deg, transparent 48%, #e4e4e7 48%, #e4e4e7 52%, transparent 52%) !important;
          color: #a1a1aa !important;
          border-color: #e4e4e7 !important;
          pointer-events: none;
        }
      </style>

      <!-- Breadcrumbs Path -->
      <div class="text-[11px] font-black tracking-widest text-zinc-400 uppercase mb-8 select-none">
        <a href="/" class="hover:text-black transition">TRANG CHỦ</a>
        <span class="mx-1.5 text-zinc-300">/</span>
        <a href="/products?category_slug=${p.category_slug || ''}" class="hover:text-black transition">${p.category_name || ''}</a>
        ${p.subcategory_name ? `
          <span class="mx-1.5 text-zinc-300">/</span>
          <a href="/products?subcategory_slug=${p.subcategory_slug || p.subcategory_name?.toLowerCase()}" class="hover:text-black transition">${p.subcategory_name}</a>
        ` : ''}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <!-- Images Column (Left) -->
        <div class="md:sticky md:top-28 space-y-4 self-start">
          <div class="w-full aspect-[3/4] bg-zinc-50 border border-zinc-100 overflow-hidden relative" id="main-product-viewer-container">
            ${(() => {
              const isVid = isVideoUrl(this._selectedImg);
              if (isVid) {
                const isYt = this._selectedImg.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                if (isYt) {
                  return `<iframe id="main-product-video-iframe" src="${getYouTubeEmbedUrl(this._selectedImg)}" class="w-full h-full border-none" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
                } else {
                  return `<video id="main-product-video" src="${this._selectedImg}" controls autoplay muted class="w-full h-full object-cover object-center"></video>`;
                }
              } else {
                return `<img id="main-product-img" src="${this._selectedImg}" alt="${p.name}" class="w-full h-full object-cover object-center cursor-pointer" />`;
              }
            })()}
            
            <!-- Fullscreen Expand Button -->
            <button id="expand-img-btn" class="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-zinc-500 hover:text-black hover:scale-105 transition cursor-pointer select-none border-none ${isVideoUrl(this._selectedImg) ? 'hidden' : ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </button>
          </div>
          
          <!-- Thumbnail list -->
          ${images.length > 1 ? `
            <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              ${images.map(img => {
                const isVid = isVideoUrl(img);
                const displaySrc = isVid ? getVideoThumbnail(img) : img;
                return `
                  <button class="thumb-btn shrink-0 w-20 aspect-[3/4] border ${img === this._selectedImg ? 'border-black' : 'border-zinc-200'} overflow-hidden bg-transparent cursor-pointer relative" data-src="${img}">
                    <img src="${displaySrc}" alt="Thumbnail" class="w-full h-full object-cover object-center" />
                    ${isVid ? `
                      <div class="absolute inset-0 flex items-center justify-center bg-black/15">
                        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                    ` : ''}
                  </button>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Info Column (Right) -->
        <div class="text-left space-y-6">


          <div class="space-y-3">
            <h1 class="text-xl sm:text-2xl font-black uppercase tracking-widest text-black leading-tight flex items-center gap-3">
              <span>${p.name}</span>
              ${canEditProduct ? `
                <button id="quick-edit-product-btn" class="shrink-0 p-1.5 bg-black hover:bg-zinc-800 text-accent-gold hover:text-white rounded-lg border border-white/20 shadow-md transition cursor-pointer select-none border-none flex items-center justify-center" title="Sửa nhanh sản phẩm ngay tại trang">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              ` : ''}
            </h1>
            
            <!-- Description List (Material, Print, Style) -->
            <div class="space-y-1.5 text-xs text-zinc-500 font-medium leading-relaxed">
              ${p.material ? `<p>- <strong>Chất liệu:</strong> ${p.material}</p>` : ''}
              ${p.print_detail && !['không hình in', 'không', 'không có', 'không in', 'không thêu', 'none'].includes(p.print_detail.toLowerCase().trim()) ? `<p>- <strong>Họa tiết:</strong> ${p.print_detail}</p>` : ''}
              ${p.style ? `<p>- <strong>Kiểu dáng:</strong> ${p.style}</p>` : ''}
            </div>
            
            <!-- Care Instructions Bullet List -->
            ${careLines.length > 0 ? `
              <div class="space-y-1.5 pt-3">
                <span class="block text-xs font-black uppercase tracking-widest text-black">HƯỚNG DẪN BẢO QUẢN</span>
                <div class="space-y-1 text-xs text-zinc-500 font-medium">
                  ${careLines.map(line => `<p>- ${line}</p>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          ${vouchersHtml}

          <!-- Attribute Selections -->
          ${(() => {
            const activeVariant = variants.find(v => {
              if (v.is_active === 0 || v.is_active === false) return false;
              return Object.entries(this._selectedAttributes || {}).every(([k, val]) => {
                if (k === 'size') return v.size === val;
                if (k === 'color') return (v.color || '') === val;
                if (k === 'material') return (v.material || '') === val;
                return v.attribute_values && v.attribute_values[k] === val;
              });
            });

            let displayPrice = p.price;
            let displayOriginalPrice = p.original_price;

            if (activeVariant) {
              if (activeVariant.price !== null && activeVariant.price !== undefined && activeVariant.price !== '') {
                displayPrice = activeVariant.price;
              }
              if (activeVariant.compare_at_price !== null && activeVariant.compare_at_price !== undefined && activeVariant.compare_at_price !== '') {
                displayOriginalPrice = activeVariant.compare_at_price;
              } else {
                displayOriginalPrice = null;
              }
            }

            const isOutOfStock = activeVariant ? (activeVariant.stock_quantity <= 0) : true;

            const selectionsHtml = attrTypes.map(attr => {
              let vals = [];
              if (attr.name === 'size') {
                vals = [...new Set(variants.map(v => v.size).filter(Boolean))];
              } else if (attr.name === 'color') {
                vals = [...new Set(variants.map(v => v.color).filter(Boolean))];
              } else {
                vals = [...new Set(variants.map(v => v.attribute_values && v.attribute_values[attr.name]).filter(Boolean))];
              }

              // Filter out default titles
              vals = vals.filter(val => val !== 'Mặc định' && val !== 'Default Title');

              if (vals.length === 0) return '';
              const selectedVal = this._selectedAttributes[attr.name] || '';

              return `
                <div class="space-y-3 pt-4 border-t border-zinc-100">
                  <span class="text-xs font-black uppercase tracking-widest text-zinc-500">${attr.displayName}</span>
                  <div class="flex flex-wrap gap-3">
                    ${vals.map(val => {
                      const isActive = val === selectedVal;
                      
                      // Check if this option is invalid (doesn't exist in any active variant combination)
                      const isInvalid = !variants.some(v => {
                        if (v.is_active === 0 || v.is_active === false) return false;
                        const matchesCurrent = (attr.name === 'size' ? v.size === val : attr.name === 'color' ? v.color === val : v.attribute_values && v.attribute_values[attr.name] === val);
                        if (!matchesCurrent) return false;

                        return Object.entries(this._selectedAttributes).every(([k, selectedV]) => {
                          if (k === attr.name) return true;
                          if (k === 'size') return v.size === selectedV;
                          if (k === 'color') return (v.color || '') === selectedV;
                          return v.attribute_values && v.attribute_values[k] === selectedV;
                        });
                      });

                      // Check if this option value matches an out of stock variant
                      const matchingVariant = variants.find(v => {
                        if (v.is_active === 0 || v.is_active === false) return false;
                        const matchesCurrent = (attr.name === 'size' ? v.size === val : attr.name === 'color' ? v.color === val : v.attribute_values && v.attribute_values[attr.name] === val);
                        if (!matchesCurrent) return false;

                        return Object.entries(this._selectedAttributes).every(([k, selectedV]) => {
                          if (k === attr.name) return true;
                          if (k === 'size') return v.size === selectedV;
                          if (k === 'color') return (v.color || '') === selectedV;
                          return v.attribute_values && v.attribute_values[k] === selectedV;
                        });
                      });
                      const isValOutOfStock = matchingVariant ? (matchingVariant.stock_quantity <= 0) : false;

                      let btnClass = '';
                      let titleAttr = '';
                      if (isInvalid) {
                        btnClass = 'opacity-20 cursor-not-allowed bg-zinc-100 text-zinc-400 border-zinc-200 select-none pointer-events-none';
                        titleAttr = 'title="Không khả dụng"';
                      } else if (isActive) {
                        btnClass = 'bg-black text-white border-black';
                      } else if (isValOutOfStock) {
                        btnClass = 'bg-transparent text-zinc-400 border-zinc-300 border-dashed line-through hover:border-black cursor-pointer';
                        titleAttr = 'title="Hết hàng"';
                      } else {
                        btnClass = 'bg-transparent text-black border-zinc-200 hover:border-black cursor-pointer';
                      }
                      
                      return `
                        <button 
                          class="attr-btn px-4 h-9 rounded-full border ${btnClass} text-xs font-bold tracking-widest uppercase transition flex items-center justify-center relative" 
                          data-attribute-name="${attr.name}"
                          data-attribute-value="${val}"
                          ${titleAttr}
                        >
                          ${val}
                        </button>
                      `;
                    }).join('')}
                  </div>
                  ${attr.name === 'size' ? `
                    <!-- Size Guide Trigger -->
                    <button id="size-guide-btn" class="text-[10px] font-black text-zinc-400 hover:text-black uppercase tracking-widest underline bg-transparent border-none cursor-pointer flex items-center gap-1.5 pt-1 select-none">
                      Bảng hướng dẫn chọn size
                    </button>
                  ` : ''}
                </div>
              `;
            }).join('');

            return `
              ${selectionsHtml}

              <!-- Pricing and Add to Cart -->
              <div class="space-y-4 pt-4 border-t border-zinc-100">
                <!-- Flash Sale Countdown Banner -->
                ${(p.is_flash_sale) ? `
                  <div class="flash-sale-banner bg-red-50 border border-red-100 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div class="text-red-650 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                        <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                        Đang Flash Sale!
                      </div>
                      <p class="text-[10px] text-zinc-500 font-medium mt-0.5">Số lượng có hạn, hãy nhanh tay đặt hàng</p>
                    </div>
                    ${p.flash_sale_end ? `
                      <div id="detail-flash-countdown" class="shrink-0"></div>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Price Display -->
                <div class="text-2xl font-black text-black tracking-widest flex items-center gap-3">
                  <span class="${p.is_flash_sale ? 'text-red-650' : ''}">${formatPrice(displayPrice)}</span>
                  ${displayOriginalPrice && displayOriginalPrice > displayPrice ? `
                    <span class="text-zinc-400 line-through text-sm font-medium">${formatPrice(displayOriginalPrice)}</span>
                  ` : ''}
                </div>

                <div class="flex items-center gap-4">
                  ${isEcommerce ? `
                  <!-- Add to Cart Button -->
                  ${isOutOfStock ? `
                    <button id="add-to-cart-btn" class="flex-1 bg-zinc-450 text-white py-3.5 px-6 text-xs font-black uppercase tracking-widest transition duration-200 text-center select-none cursor-not-allowed border-none opacity-55" disabled>
                      HẾT HÀNG
                    </button>
                  ` : `
                    <button id="add-to-cart-btn" class="flex-1 bg-primary-gold hover:opacity-90 text-white py-3.5 px-6 text-xs font-black uppercase tracking-widest transition duration-200 text-center select-none cursor-pointer border-none">
                      THÊM VÀO GIỎ HÀNG
                    </button>
                  `}
                  
                  <!-- Quantity Selector -->
                  <div class="flex items-center border border-zinc-200 h-[44px] w-20 relative select-none bg-white shrink-0">
                    <span id="qty-val-span" class="w-12 text-center text-xs font-black text-black">${this._qty}</span>
                    <div class="flex flex-col border-l border-zinc-200 h-full w-8">
                      <button id="qty-inc-btn" class="h-1/2 flex items-center justify-center text-[10px] hover:bg-zinc-50 border-b border-zinc-200 font-bold select-none cursor-pointer border-none bg-transparent">+</button>
                      <button id="qty-dec-btn" class="h-1/2 flex items-center justify-center text-[10px] hover:bg-zinc-50 font-bold select-none cursor-pointer border-none bg-transparent">−</button>
                    </div>
                  </div>
                  ` : `
                  <!-- Contact to Buy Button -->
                  <button id="contact-to-buy-btn" class="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white py-3.5 px-6 text-xs font-black uppercase tracking-widest transition duration-200 text-center select-none cursor-pointer border-none">
                    LIÊN HỆ ĐẶT HÀNG
                  </button>
                  `}
                </div>
              </div>
            `;
          })()}

          <!-- Trust Badges (A2.1d + A5.2f) -->
          <div class="border-t border-zinc-100 pt-5 relative">
            ${canEditSettings ? `
              <button id="quick-edit-badges-btn" class="absolute top-4 right-0 p-1.5 bg-black hover:bg-zinc-800 text-accent-gold hover:text-white rounded border border-white/20 shadow-md transition cursor-pointer select-none border-none flex items-center justify-center" title="Chỉnh sửa các cam kết & chính sách">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            ` : ''}
            <div class="grid grid-cols-2 gap-3">
              ${trustBadges.map(badge => `
                <div class="flex items-center gap-2.5 text-left">
                  ${ICON_SVGS[badge.icon] || ICON_SVGS.truck}
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-black">${badge.title}</p>
                    <p class="text-[9px] font-medium text-zinc-400">${badge.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Row -->
      <div class="border-b border-zinc-200 mt-16 flex gap-8 select-none">
        <button id="tab-related-btn" class="tab-btn pb-3 text-xs font-black tracking-widest uppercase border-b-2 border-black text-black transition cursor-pointer select-none bg-transparent">
          SẢN PHẨM TƯƠNG TỰ
        </button>
        <button id="tab-match-btn" class="tab-btn pb-3 text-xs font-black tracking-widest uppercase border-b-2 border-transparent text-zinc-400 hover:text-black transition cursor-pointer select-none bg-transparent">
          MATCH WITH
        </button>
      </div>

      <!-- Related Products Grid -->
      <div id="related-grid-container" class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        <!-- Populated dynamically -->
      </div>
    `;
  }
