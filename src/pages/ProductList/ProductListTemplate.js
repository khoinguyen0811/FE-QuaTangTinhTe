import { formatPrice, escapeHtml } from '../../utils/helpers.js';
import { hasAdminPermission } from '../../utils/adminAuth.js';

export function renderProductListHtml() {
    const searchParams = new URLSearchParams(window.location.search);
    const activeSub = searchParams.get('subcategory_slug') || this._params.subcategory_slug || '';
    const activeCat = searchParams.get('category_slug') || this._params.category_slug || '';
    
    // Compile SLY categories list for dropdown selection
    let categoryTree = this._categories;
    if (!categoryTree || categoryTree.length === 0) {
      categoryTree = [
        { name: 'Tops', slug: 'tops', children: [
          { name: 'Tee', slug: 'tee' },
          { name: 'Polo', slug: 'polo' },
          { name: 'Shirt', slug: 'shirt' }
        ]},
        { name: 'Outwear', slug: 'outwears', children: [] },
        { name: 'Bottoms', slug: 'bottoms', children: [
          { name: 'Short', slug: 'short' },
          { name: 'Pant', slug: 'pant' }
        ]},
        { name: 'Accessories', slug: 'accessories', children: [
          { name: 'Wallet', slug: 'wallet' },
          { name: 'Cap', slug: 'cap' },
          { name: 'Backpacks', slug: 'backpacks' }
        ]}
      ];
    }

    // Find active category or subcategory details
    let activeCategoryObj = null;
    if (activeSub) {
      for (const cat of categoryTree) {
        if (cat.children) {
          const found = cat.children.find(sub => sub.slug === activeSub);
          if (found) {
            activeCategoryObj = found;
            break;
          }
        }
      }
    } else if (activeCat) {
      activeCategoryObj = categoryTree.find(cat => cat.slug === activeCat);
    }

    let bannerHtml = '';
    if (activeCategoryObj && (activeCategoryObj.image_url || activeCategoryObj.banner_mobile_url)) {
      const desktopImg = activeCategoryObj.image_url || activeCategoryObj.banner_mobile_url;
      const mobileImg = activeCategoryObj.banner_mobile_url || activeCategoryObj.image_url;
      bannerHtml = `
        <div class="category-banner w-full mb-8 relative overflow-hidden rounded-xl bg-zinc-100 aspect-[21/9] md:aspect-[21/7]">
          <!-- Desktop Banner -->
          <img src="${desktopImg}" alt="${escapeHtml(activeCategoryObj.name)}" class="hidden md:block w-full h-full object-cover" />
          <!-- Mobile Banner -->
          <img src="${mobileImg}" alt="${escapeHtml(activeCategoryObj.name)}" class="block md:hidden w-full h-full object-cover" />
          
          ${activeCategoryObj.description ? `
            <div class="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 md:p-10 text-white text-left">
              <h2 class="text-lg md:text-2xl font-black uppercase tracking-wider">${escapeHtml(activeCategoryObj.name)}</h2>
              <p class="text-xs md:text-sm text-white/90 max-w-xl mt-1.5 line-clamp-2">${escapeHtml(activeCategoryObj.description)}</p>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    const dropdownOptions = [];
    categoryTree.forEach(c => {
      if (c.slug === 'toan-bo-san-pham') return;
      dropdownOptions.push({ name: c.name, slug: c.slug, isSub: false });
      if (c.children) {
        const sortedChildren = [...c.children].sort((a, b) => {
          if (a.sort_order !== b.sort_order) {
            return String(a.sort_order).localeCompare(String(b.sort_order));
          }
          return a.id - b.id;
        });
        sortedChildren.forEach(sub => {
          dropdownOptions.push({ 
            name: sub.name, 
            displayName: `— ${sub.name}`, 
            slug: sub.slug, 
            isSub: true 
          });
        });
      }
    });
    
    let currentLabel = 'Toàn bộ sản phẩm';
    if (activeSub) {
      const found = dropdownOptions.find(o => o.slug === activeSub && o.isSub);
      if (found) currentLabel = found.name;
    } else if (activeCat) {
      const found = dropdownOptions.find(o => o.slug === activeCat && !o.isSub);
      if (found) {
        currentLabel = found.name;
      } else if (activeCat === 'toan-bo-san-pham') {
        currentLabel = 'Toàn bộ sản phẩm';
      }
    }
    
    let breadcrumbText = 'TOÀN BỘ SẢN PHẨM';
    if (activeSub) {
      const found = dropdownOptions.find(o => o.slug === activeSub && o.isSub);
      breadcrumbText = found ? found.name : activeSub;
    } else if (activeCat) {
      const found = dropdownOptions.find(o => o.slug === activeCat && !o.isSub);
      if (found) {
        breadcrumbText = found.name;
      } else if (activeCat === 'toan-bo-san-pham') {
        breadcrumbText = 'TOÀN BỘ SẢN PHẨM';
      } else {
        breadcrumbText = activeCat;
      }
    } else if (searchParams.get('voucher')) {
      breadcrumbText = `VOUCHER: "${escapeHtml(searchParams.get('voucher')).toUpperCase()}"`;
    } else if (searchParams.get('search')) {
      breadcrumbText = `TÌM KIẾM: "${escapeHtml(searchParams.get('search')).toUpperCase()}"`;
    }
    
    const meta = this._meta || { total: 0, page: 1, limit: 12, total_pages: 1 };
    const page = meta.page || 1;
    const limit = meta.limit || 12;
    const total = meta.total || 0;
    const total_pages = meta.total_pages || 1;
    
    const start = Math.min((page - 1) * limit + 1, total);
    const end = Math.min(page * limit, total);
    const resultsText = total > 0 ? `Hiển thị ${start}-${end} của ${total} kết quả` : 'Hiển thị 0 kết quả';
    
    const hasCategory = !!(activeCat || activeSub);
    const sortVal = searchParams.get('sort') || (hasCategory ? 'default' : 'new');
    const minVal = parseInt(searchParams.get('price_min')) || 0;
    const maxVal = parseInt(searchParams.get('price_max')) || 1000000;
    
    return `
      <style>
        .price-slider-container input[type=range] {
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%;
          outline: none;
          -webkit-appearance: none;
          background: transparent;
        }
        .price-slider-container input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: auto;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .price-slider-container input[type=range]::-moz-range-thumb {
          pointer-events: auto;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
      </style>

      ${bannerHtml}

      <!-- Breadcrumbs & Stats Row -->
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-6 mb-8 mt-4">
        <div>
          <!-- Breadcrumbs -->
          <h1 class="text-[11px] font-black tracking-widest text-zinc-400 uppercase">
            <a href="/" class="hover:text-black transition">TRANG CHỦ</a>
            <span class="mx-1 text-zinc-300">/</span>
            <span class="text-black">${breadcrumbText}</span>
          </h1>
        </div>
        
        <div class="hidden">
          <!-- Count Results (hidden but kept in DOM to avoid JS errors) -->
          <span id="results-count-text">${resultsText}</span>
        </div>
      </div>

      <!-- Active Voucher Filter Tag -->
      ${searchParams.get('voucher') ? `
        <div class="flex items-center gap-2 mb-6 bg-zinc-50 border border-zinc-150 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-700 w-fit">
          <span>Áp dụng cho mã: <strong class="text-zinc-950 font-black">${escapeHtml(searchParams.get('voucher')).toUpperCase()}</strong></span>
          <button id="clear-voucher-filter-btn" class="ml-2 p-0.5 rounded-full hover:bg-zinc-200 transition focus:outline-none" title="Xóa lọc">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      ` : ''}

      <!-- Controls & Filter Toolbar -->
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
        <!-- Category custom dropdown selection & Sort dropdown -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="relative inline-block text-left" id="category-dropdown-container">
              <button id="category-dropdown-btn" class="inline-flex items-center gap-2 border border-black px-4 py-2 text-xs font-black uppercase tracking-widest bg-white hover:bg-zinc-50 transition cursor-pointer select-none">
                <span>${currentLabel}</span>
                <svg class="w-3 h-3 text-black transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div id="category-dropdown-menu" data-lenis-prevent class="hidden absolute left-0 mt-1 w-48 bg-white border border-black shadow-lg z-30 max-h-60 overflow-y-auto">
                <button data-slug="toan-bo-san-pham" data-sub="false" class="category-opt-btn block w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-black hover:text-white transition">
                  TOÀN BỘ SẢN PHẨM
                </button>
                 ${dropdownOptions.map(opt => `
                  <button data-slug="${opt.slug}" data-sub="${opt.isSub}" class="category-opt-btn block w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-black hover:text-white transition">
                    ${opt.displayName || opt.name}
                  </button>
                `).join('')}
              </div>
            </div>
            ${(activeSub || activeCat) && hasAdminPermission('categories:write') ? `
              <button id="storefront-edit-category-btn" class="inline-flex items-center justify-center border border-black h-[34px] w-[34px] bg-white hover:bg-black hover:text-white transition cursor-pointer select-none" title="Chỉnh sửa danh mục">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button id="storefront-sort-products-btn" class="inline-flex items-center justify-center border border-black h-[34px] w-[34px] bg-white hover:bg-black hover:text-white transition cursor-pointer select-none" title="Sắp xếp sản phẩm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            ` : ''}
          </div>
          
          <!-- Sort Dropdown -->
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-black uppercase tracking-wider text-zinc-400">Sắp xếp:</span>
            <select id="sort-select" class="bg-white border border-black px-3 py-1.5 text-xs font-black uppercase tracking-widest outline-none rounded-none cursor-pointer">
              ${hasCategory ? `
                <option value="default" ${sortVal === 'default' ? 'selected' : ''}>MẶC ĐỊNH</option>
              ` : ''}
              <option value="new" ${sortVal === 'new' ? 'selected' : ''}>MỚI NHẤT</option>
              <option value="price_asc" ${sortVal === 'price_asc' ? 'selected' : ''}>GIÁ TĂNG DẦN</option>
              <option value="price_desc" ${sortVal === 'price_desc' ? 'selected' : ''}>GIÁ GIẢM DẦN</option>
              <option value="bestseller" ${sortVal === 'bestseller' ? 'selected' : ''}>MUA NHIỀU NHẤT</option>
            </select>
          </div>
        </div>

        <!-- Dual Price Slider Filter -->
        <div class="flex flex-wrap items-center gap-4 price-slider-container bg-zinc-50 border border-zinc-100 px-4 py-2.5">
          <span class="text-xs font-bold text-zinc-500" id="price-min-display">${formatPrice(minVal)}</span>
          <div class="relative w-40 h-1 bg-zinc-200 rounded-full flex items-center select-none">
            <div id="slider-track" class="absolute h-1 bg-black rounded-full"></div>
            <input type="range" id="slider-min" min="0" max="1000000" step="10000" value="${minVal}" class="w-full" />
            <input type="range" id="slider-max" min="0" max="1000000" step="10000" value="${maxVal}" class="w-full" />
          </div>
          <span class="text-xs font-bold text-zinc-500" id="price-max-display">${formatPrice(maxVal)}</span>
          <button id="price-filter-btn" class="bg-[#c0392b] text-white text-xs font-black px-4 py-1.5 uppercase hover:opacity-90 transition cursor-pointer select-none">
            Lọc
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      ${this._products.length === 0 ? `
        <div class="text-center py-24 border border-dashed border-zinc-200 rounded-lg">
          <p class="text-zinc-500 text-sm font-bold uppercase tracking-widest">Không tìm thấy sản phẩm nào</p>
        </div>
      ` : `
        <div id="product-grid" class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          ${this._products.map(p => this._productCard(p)).join('')}
        </div>
      `}
    `;
}
