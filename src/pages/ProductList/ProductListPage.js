import { productService } from '../../services/productService.js';
import { getCategoryTree } from '../../services/categoryService.js';
import { formatPrice, navigate, throttle } from '../../utils/helpers.js';
import { renderProductListHtml } from './ProductListTemplate.js';
import { applyHeadMetadata } from '../../seo/head.js';
import { itemListSchema } from '../../seo/schema.js';
import { canonicalPathForLocation, robotsForLocation } from '../../seo/urlMap.js';

export default class ProductListPage {
  constructor(params = {}) {
    this._params = params;
    this._products = [];
    this._categories = [];
    this._meta = { total: 0, page: 1, limit: 12, total_pages: 1 };
    this._loading = true;
    this._currentPage = 1;
  }

  async render() {
    const wrap = document.createElement('div');
    wrap.className = 'min-h-screen pt-32 md:pt-40 pb-16 px-6 sm:px-12 max-w-[1440px] mx-auto font-sans text-black';
    wrap.innerHTML = `
      <!-- Breadcrumbs & Stats Row Skeleton -->
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-6 mb-8 mt-4">
        <div>
          <div class="skeleton-shimmer h-3 w-40" style="height: 12px; width: 160px;"></div>
        </div>
      </div>

      <!-- Controls & Filter Toolbar Skeleton -->
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
        <div class="flex gap-4">
          <div class="skeleton-shimmer h-10 w-44" style="height: 40px; width: 176px;"></div>
          <div class="skeleton-shimmer h-10 w-44" style="height: 40px; width: 176px;"></div>
        </div>
        <div class="skeleton-shimmer h-10 w-72" style="height: 40px; width: 288px;"></div>
      </div>

      <!-- Products Grid Skeleton -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
        ${Array.from({ length: 8 }).map(() => `
          <div class="flex flex-col text-center">
            <div class="skeleton-shimmer w-full aspect-[3/4] mb-4" style="aspect-ratio: 3/4; width: 100%;"></div>
            <div class="skeleton-shimmer h-4 w-3/4 mx-auto mb-2" style="height: 16px; width: 75%; margin-left: auto; margin-right: auto;"></div>
            <div class="skeleton-shimmer h-4 w-1/2 mx-auto" style="height: 16px; width: 50%; margin-left: auto; margin-right: auto;"></div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Load data asynchronously
    this._fetchData().then(() => {
      this._applySeo();
      wrap.innerHTML = this._html();
      this._bindEvents(wrap);
      window.dispatchEvent(new CustomEvent('page-rendered'));
    });

    return wrap;
  }

  async _fetchData() {
    this._loading = true;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const page = parseInt(searchParams.get('page')) || 1;
      this._currentPage = page;
      const limit = 12; // Displaying 12 products per page
      
      let catSlug = searchParams.get('category_slug') || this._params.category_slug || '';
      let subcatSlug = searchParams.get('subcategory_slug') || this._params.subcategory_slug || '';

      if (!catSlug && !subcatSlug && !searchParams.get('search') && !searchParams.get('voucher')) {
        catSlug = 'toan-bo-san-pham';
      }

      const hasCategory = !!(catSlug || subcatSlug);
      const sortParam = searchParams.get('sort') || (hasCategory ? 'default' : 'new');
      
      const filters = {
        category_slug: catSlug,
        subcategory_slug: subcatSlug,
        search: searchParams.get('search') || '',
        sort: sortParam === 'default' ? '' : sortParam,
        badge: searchParams.get('badge') || this._params.badge || '',
        page: page,
        limit: limit,
        price_min: searchParams.get('price_min') || '',
        price_max: searchParams.get('price_max') || '',
        voucher: searchParams.get('voucher') || ''
      };
      
      // Load category tree for selector dropdown
      if (this._categories.length === 0) {
        try {
          this._categories = await getCategoryTree();
        } catch (catErr) {
          console.error('Failed to load category tree:', catErr);
        }
      }
      
      const res = await productService.getProducts(filters);
      this._products = res.data || [];
      this._meta = res.meta || {
        total: this._products.length,
        page: page,
        limit: limit,
        total_pages: 1
      };
    } catch (err) {
      console.error('Failed to load products:', err);
      this._products = []; // Remove fallback mock products
      this._meta = {
        total: 0,
        page: 1,
        limit: 12,
        total_pages: 1
      };
    } finally {
      this._loading = false;
    }
  }

  _html() {
    return renderProductListHtml.call(this);
  }

  _productBadges(product) {
    const badges = [];
    if (product.is_flash_sale || product.flash_sale_price) {
      badges.push(`<span class="bg-[#e53e3e] text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 leading-none">FLASH SALE</span>`);
    }
    const origPrice = product.original_price || 0;
    const salePrice = product.base_price || product.price || 0;
    if (origPrice > 0 && salePrice > 0 && (origPrice - salePrice) / origPrice >= 0.5) {
      badges.push(`<span class="bg-black text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 leading-none">FINAL SALE</span>`);
    }
    if (product.is_web_exclusive) {
      badges.push(`<span class="bg-zinc-800 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 leading-none">WEB EXCLUSIVE</span>`);
    }
    if (badges.length === 0) return '';
    return `<div class="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">${badges.join('')}</div>`;
  }

  _applySeo() {
    const settings = window.APP_SETTINGS || {};
    const brandName = settings.brand_name || 'Thương hiệu';
    const searchParams = new URLSearchParams(window.location.search);
    const hasSearch = Boolean(searchParams.get('search') || searchParams.get('q'));
    const titlePrefix = hasSearch
      ? `Tìm kiếm sản phẩm "${searchParams.get('search') || searchParams.get('q')}"`
      : 'Sản phẩm';
    const description = settings.products_meta_description
      || `Khám phá danh sách sản phẩm của ${brandName}, cập nhật theo danh mục, giá và tình trạng mới nhất.`;

    applyHeadMetadata({
      title: `${titlePrefix} | ${brandName}`,
      description,
      canonicalPath: canonicalPathForLocation(),
      robots: robotsForLocation(settings),
      openGraph: {
        title: `${titlePrefix} | ${brandName}`,
        description,
        image: settings.og_image_url || settings.logo_url || '',
        type: 'website'
      },
      schemas: [
        itemListSchema(this._products.slice(0, 24).map((product) => ({
          ...product,
          url: `/product/${product.slug || product.id}`
        })), settings)
      ]
    }, settings);
  }

  _productCard(product) {
    const price = product.base_price || product.price || 0;
    const origPrice = product.original_price || 0;
    const imgUrl = product.image_url || product.image || 'https://images.pexels.com/photos/18413243/pexels-photo-18413243.jpeg?auto=compress&cs=tinysrgb&w=600';
    const hoverImgUrl = product.hover_image_url || imgUrl;

    return `
      <div class="product-card group relative flex flex-col cursor-pointer select-none text-center" data-slug="${product.slug}" data-product-id="${product.id}">
        <!-- Product Image Container -->
        <div class="relative w-full aspect-[3/4] bg-zinc-50 overflow-hidden mb-4 border border-zinc-100">
          <!-- Badge Tags -->
          ${this._productBadges(product)}
          <!-- Main Image -->
          <img
            data-src="${imgUrl}"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3C/svg%3E"
            alt="${product.name}"
            class="lazy absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
            onerror="this.src='https://images.pexels.com/photos/18413243/pexels-photo-18413243.jpeg?auto=compress&cs=tinysrgb&w=600'"
          />
          <!-- Hover Image -->
          <img
            data-hover-src="${hoverImgUrl}"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3C/svg%3E"
            alt="${product.name}"
            class="hover-img absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            onerror="this.src='https://images.pexels.com/photos/18413243/pexels-photo-18413243.jpeg?auto=compress&cs=tinysrgb&w=600'"
          />
        </div>

        <!-- Product Text Info -->
        <div class="product-card-text-container space-y-1">
          <h2 class="text-xs sm:text-sm font-bold uppercase tracking-widest text-black group-hover:opacity-70 transition-opacity truncate px-2">
            ${product.name}
          </h2>
          <div class="flex items-center gap-2 text-xs sm:text-sm font-black product-card-price-container">
            <span class="text-black tracking-wider">${formatPrice(price)}</span>
            ${origPrice > price ? `<span class="text-zinc-400 line-through font-medium text-[11px]">${formatPrice(origPrice)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _refreshList(wrap) {
    this._fetchData().then(() => {
      if (!wrap.isConnected) return;
      this._applySeo();
      wrap.innerHTML = this._html();
      this._bindEvents(wrap);
      window.dispatchEvent(new CustomEvent('page-rendered'));
    });
  }

  _bindProductCard(card, wrap) {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      const slug = card.dataset.slug;
      if (slug) navigate(`/product/${slug}`);
    });
  }

  _bindEvents(wrap) {
    // Dropdown toggler
    const dropdownBtn = wrap.querySelector('#category-dropdown-btn');
    const dropdownMenu = wrap.querySelector('#category-dropdown-menu');
    const arrow = dropdownBtn?.querySelector('svg');
    
    dropdownBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const hidden = dropdownMenu.classList.contains('hidden');
      if (hidden) {
        dropdownMenu.classList.remove('hidden');
        arrow?.classList.add('rotate-180');
      } else {
        dropdownMenu.classList.add('hidden');
        arrow?.classList.remove('rotate-180');
      }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdownMenu?.classList.add('hidden');
      arrow?.classList.remove('rotate-180');
    });

    // Storefront edit category button click
    const editCatBtn = wrap.querySelector('#storefront-edit-category-btn');
    if (editCatBtn) {
      editCatBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const searchParams = new URLSearchParams(window.location.search);
        const activeSub = searchParams.get('subcategory_slug') || this._params.subcategory_slug || '';
        const activeCat = searchParams.get('category_slug') || this._params.category_slug || '';
        
        let activeCategoryObj = null;
        if (activeSub) {
          for (const parent of this._categories) {
            const found = (parent.children || []).find(sub => sub.slug === activeSub);
            if (found) {
              activeCategoryObj = { ...found, parent_id: parent.id };
              break;
            }
          }
        } else if (activeCat) {
          activeCategoryObj = this._categories.find(c => c.slug === activeCat);
        }

        if (activeCategoryObj) {
          const { openCategoryForm } = await import('../Admin/Categories/CategoryForm.js');
          openCategoryForm(activeCategoryObj, () => {
            navigate(window.location.pathname + window.location.search);
          });
        }
      });
    }

    // Storefront sort products button click
    const sortProdsBtn = wrap.querySelector('#storefront-sort-products-btn');
    if (sortProdsBtn) {
      sortProdsBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const searchParams = new URLSearchParams(window.location.search);
        const activeSub = searchParams.get('subcategory_slug') || this._params.subcategory_slug || '';
        const activeCat = searchParams.get('category_slug') || this._params.category_slug || '';
        
        let activeCategoryObj = null;
        if (activeSub) {
          for (const parent of this._categories) {
            const found = (parent.children || []).find(sub => sub.slug === activeSub);
            if (found) {
              activeCategoryObj = { ...found, parent_id: parent.id };
              break;
            }
          }
        } else if (activeCat) {
          activeCategoryObj = this._categories.find(c => c.slug === activeCat);
        }

        if (activeCategoryObj) {
          const { openProductSortModal } = await import('../Admin/Categories/ProductSortModal.js');
          openProductSortModal(activeCategoryObj, () => {
            navigate(window.location.pathname + window.location.search);
          });
        }
      });
    }

    // Dropdown option button clicks
    wrap.querySelectorAll('.category-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.slug;
        const isSub = btn.dataset.sub === 'true';
        
        const q = new URLSearchParams(window.location.search);
        q.delete('page'); // Reset to page 1 on category change
        q.delete('category_slug');
        q.delete('subcategory_slug');
        
        if (slug) {
          if (isSub) {
            q.set('subcategory_slug', slug);
          } else {
            q.set('category_slug', slug);
          }
        }
        
        navigate(`/products?${q.toString()}`);
      });
    });

    // Dual Price Slider logic
    const minInput = wrap.querySelector('#slider-min');
    const maxInput = wrap.querySelector('#slider-max');
    const track = wrap.querySelector('#slider-track');
    const minDisplay = wrap.querySelector('#price-min-display');
    const maxDisplay = wrap.querySelector('#price-max-display');

    if (minInput && maxInput && track) {
      const totalRange = 1000000;
      
      const updateSliderTrack = () => {
        let minVal = parseInt(minInput.value);
        let maxVal = parseInt(maxInput.value);

        if (minVal > maxVal) {
          const temp = minVal;
          minVal = maxVal;
          maxVal = temp;
        }

        const leftPercent = (minVal / totalRange) * 100;
        const rightPercent = 100 - (maxVal / totalRange) * 100;
        track.style.left = `${leftPercent}%`;
        track.style.right = `${rightPercent}%`;
        minDisplay.textContent = formatPrice(minVal);
        maxDisplay.textContent = formatPrice(maxVal);
      };

      minInput.addEventListener('input', updateSliderTrack);
      maxInput.addEventListener('input', updateSliderTrack);
      updateSliderTrack(); // Init positioning
    }

    // Filter button click
    wrap.querySelector('#price-filter-btn')?.addEventListener('click', () => {
      const q = new URLSearchParams(window.location.search);
      q.delete('page'); // Reset page
      q.set('price_min', minInput.value);
      q.set('price_max', maxInput.value);
      navigate(`/products?${q.toString()}`);
    });

    // Sort select change listener
    wrap.querySelector('#sort-select')?.addEventListener('change', e => {
      const q = new URLSearchParams(window.location.search);
      q.delete('page'); // Reset page
      q.set('sort', e.target.value);
      navigate(`/products?${q.toString()}`);
    });

    // Product card click listener
    wrap.querySelectorAll('.product-card').forEach(card => {
      this._bindProductCard(card, wrap);
    });

    // Infinite Scroll Scroll Listener
    const handleScroll = throttle(() => {
      if (!wrap.isConnected) {
        window.removeEventListener('scroll', handleScroll);
        return;
      }
      if (this._loading || this._currentPage >= this._meta.total_pages) return;

      const threshold = 400; // Load next page when 400px near bottom
      const totalHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.scrollY;

      if (totalHeight - scrollPosition < threshold) {
        this._loadNextPage(wrap);
      }
    }, 150);
    // Clear voucher filter listener
    wrap.querySelector('#clear-voucher-filter-btn')?.addEventListener('click', () => {
      const q = new URLSearchParams(window.location.search);
      q.delete('voucher');
      navigate(`/products?${q.toString()}`);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  async _loadNextPage(wrap) {
    if (this._loading || this._currentPage >= this._meta.total_pages) return;
    this._loading = true;

    const gridEl = wrap.querySelector('#product-grid');
    if (!gridEl) {
      this._loading = false;
      return;
    }

    // Show loading spinner
    let loaderEl = wrap.querySelector('#infinite-scroll-loader');
    if (!loaderEl) {
      loaderEl = document.createElement('div');
      loaderEl.id = 'infinite-scroll-loader';
      loaderEl.className = 'w-full flex justify-center py-8 col-span-2 md:col-span-4';
      loaderEl.innerHTML = '<div class="spinner h-8 w-8"></div>';
      gridEl.parentNode.appendChild(loaderEl);
    } else {
      loaderEl.classList.remove('hidden');
    }

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const nextPage = this._currentPage + 1;
      
      let catSlug = searchParams.get('category_slug') || this._params.category_slug || '';
      let subcatSlug = searchParams.get('subcategory_slug') || this._params.subcategory_slug || '';

      if (!catSlug && !subcatSlug && !searchParams.get('search') && !searchParams.get('voucher')) {
        catSlug = 'toan-bo-san-pham';
      }

      const hasCategory = !!(catSlug || subcatSlug);
      const sortParam = searchParams.get('sort') || (hasCategory ? 'default' : 'new');

      const filters = {
        category_slug: catSlug,
        subcategory_slug: subcatSlug,
        search: searchParams.get('search') || '',
        sort: sortParam === 'default' ? '' : sortParam,
        badge: searchParams.get('badge') || this._params.badge || '',
        page: nextPage,
        limit: 12,
        price_min: searchParams.get('price_min') || '',
        price_max: searchParams.get('price_max') || '',
        voucher: searchParams.get('voucher') || ''
      };

      const res = await productService.getProducts(filters);
      const newProducts = res.data || [];
      
      if (newProducts.length > 0) {
        this._products = [...this._products, ...newProducts];
        
        // Append new products directly to the grid
        newProducts.forEach(product => {
          const cardHtml = this._productCard(product);
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = cardHtml.trim();
          const cardEl = tempDiv.firstChild;

          this._bindProductCard(cardEl, wrap);
          gridEl.appendChild(cardEl);
        });

        this._currentPage = nextPage;
        this._meta = res.meta || {
          ...this._meta,
          page: nextPage
        };

        // Update results count text
        const resultsTextEl = wrap.querySelector('#results-count-text');
        if (resultsTextEl) {
          const newEnd = Math.min(this._currentPage * 12, this._meta.total);
          resultsTextEl.textContent = `Hiển thị 1-${newEnd} của ${this._meta.total} kết quả`;
        }
        
        // Trigger lazy loading for newly appended cards
        window.dispatchEvent(new CustomEvent('page-rendered'));
      }
    } catch (err) {
      console.error('Failed to load next page of products:', err);
    } finally {
      this._loading = false;
      if (loaderEl) {
        loaderEl.classList.add('hidden');
      }
    }
  }
}
