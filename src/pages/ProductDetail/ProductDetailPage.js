import { productService } from '../../services/productService.js';
import { cartService } from '../../services/cartService.js';
import { getEligibleVouchers } from '../../services/orderService.js';
import { formatPrice, navigate } from '../../utils/helpers.js';
import { showToast } from '../../utils/toast.js';
import { openLightbox } from './components/LightboxModal.js?v=1.0.52';
import { openSizeGuide } from './components/SizeGuideModal.js';
import { renderRelatedGrid } from './components/RelatedGrid.js';
import { renderProductDetailHtml } from './ProductDetailTemplate.js';
import { getAdminToken } from '../../utils/adminAuth.js';
import { trackProductView } from '../../services/userTracker.js';
import { applyHeadMetadata } from '../../seo/head.js';
import { breadcrumbSchema, productSchema } from '../../seo/schema.js';

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

function uniqueImages(images = []) {
  return [...new Set((images || []).filter(Boolean))];
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default class ProductDetailPage {
  constructor(params = {}) {
    this._slug = params.slug || '';
    this._product = null;
    this._selectedSize = '';
    this._selectedColor = '';
    this._selectedAttributes = {};
    this._qty = 1;
    this._selectedImg = '';
    this._relatedProducts = [];
    this._crossSellProducts = [];
    this._activeTab = 'related';
    this._vouchers = [];
  }

  async render() {
    const wrap = document.createElement('div');
    wrap.className = 'min-h-screen pt-32 md:pt-40 pb-16 px-6 sm:px-12 max-w-[1280px] mx-auto font-sans text-black';
    wrap.innerHTML = `
      <!-- Breadcrumbs Skeleton -->
      <div class="skeleton-shimmer h-4 w-48 mb-8" style="height: 16px; width: 192px;"></div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <!-- Images Column Skeleton -->
        <div class="space-y-4">
          <div class="skeleton-shimmer w-full aspect-[3/4]" style="aspect-ratio: 3/4; width: 100%;"></div>
          <div class="flex gap-3">
            <div class="skeleton-shimmer w-20 aspect-[3/4]" style="aspect-ratio: 3/4; width: 80px;"></div>
            <div class="skeleton-shimmer w-20 aspect-[3/4]" style="aspect-ratio: 3/4; width: 80px;"></div>
            <div class="skeleton-shimmer w-20 aspect-[3/4]" style="aspect-ratio: 3/4; width: 80px;"></div>
          </div>
        </div>

        <!-- Info Column Skeleton -->
        <div class="space-y-6">
          <div class="space-y-3">
            <div class="skeleton-shimmer h-8 w-3/4" style="height: 32px; width: 75%;"></div>
            <div class="space-y-2 pt-2">
              <div class="skeleton-shimmer h-4 w-full" style="height: 16px; width: 100%;"></div>
              <div class="skeleton-shimmer h-4 w-5/6" style="height: 16px; width: 83.3%;"></div>
              <div class="skeleton-shimmer h-4 w-2/3" style="height: 16px; width: 66.6%;"></div>
            </div>
          </div>
          <!-- Colors -->
          <div class="space-y-2 pt-4 border-t border-zinc-100">
            <div class="skeleton-shimmer h-4 w-16" style="height: 16px; width: 64px;"></div>
            <div class="flex gap-2">
              <div class="skeleton-shimmer h-9 w-16" style="height: 36px; width: 64px; border-radius: 9999px;"></div>
              <div class="skeleton-shimmer h-9 w-16" style="height: 36px; width: 64px; border-radius: 9999px;"></div>
            </div>
          </div>
          <!-- Sizes -->
          <div class="space-y-2 pt-4 border-t border-zinc-100">
            <div class="skeleton-shimmer h-4 w-12" style="height: 16px; width: 48px;"></div>
            <div class="flex gap-2">
              <div class="skeleton-shimmer h-9 w-9" style="height: 36px; width: 36px; border-radius: 9999px;"></div>
              <div class="skeleton-shimmer h-9 w-9" style="height: 36px; width: 36px; border-radius: 9999px;"></div>
              <div class="skeleton-shimmer h-9 w-9" style="height: 36px; width: 36px; border-radius: 9999px;"></div>
            </div>
          </div>
          <!-- Price and Button -->
          <div class="space-y-4 pt-4 border-t border-zinc-100">
            <div class="skeleton-shimmer h-6 w-24" style="height: 24px; width: 96px;"></div>
            <div class="flex gap-4">
              <div class="skeleton-shimmer h-12 flex-1" style="height: 48px; width: 100%;"></div>
              <div class="skeleton-shimmer h-12 w-20" style="height: 48px; width: 80px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    await this._fetchData();

    if (!this._product) {
      wrap.innerHTML = `
        <div class="text-center py-20">
          <h2 class="text-xl font-bold uppercase mb-4">Không tìm thấy sản phẩm</h2>
          <button id="go-back-btn" class="bg-black text-white px-8 py-3 text-xs font-black uppercase tracking-widest cursor-pointer select-none">Tiếp tục mua sắm</button>
        </div>
      `;
      wrap.querySelector('#go-back-btn')?.addEventListener('click', () => navigate('/products'));
      return wrap;
    }

    wrap.innerHTML = this._html();
    this._bindEvents(wrap);
    this._updateRelatedGrid(wrap);
    this._applySeo();

    // Track product view for logged-in users
    trackProductView(this._product.id, this._product.name, `/product/${this._slug}`);

    // Initialize Flash Sale Countdown if active
    if (this._product && this._product.is_flash_sale && this._product.flash_sale_end) {
      import('../../components/ui/CountdownTimer.js').then(({ createCountdownTimer }) => {
        const cdContainer = wrap.querySelector('#detail-flash-countdown');
        if (cdContainer) {
          // Clean up any existing timer first
          if (this._cdTimer && typeof this._cdTimer._destroy === 'function') {
            this._cdTimer._destroy();
          }
          const timerEl = createCountdownTimer(this._product.flash_sale_end);
          cdContainer.appendChild(timerEl);
          this._cdTimer = timerEl;
        }
      }).catch(console.error);
    }

    return wrap;
  }

  async _fetchData() {
    try {
      const data = await productService.getProduct(this._slug);
      this._product = data.data || data;
      
      // Default selection setup
      if (this._product) {
        const variants = this._product.variants || [];
        
        // 1. Check for variant ID in URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const queryVariantId = urlParams.get('variant');
        
        let initialVariant = null;
        if (queryVariantId) {
          initialVariant = variants.find(v => v.id == queryVariantId && v.is_active !== 0 && v.is_active !== false);
        }
        
        // 2. Fallback to first active and in-stock variant
        if (!initialVariant) {
          initialVariant = variants.find(v => (v.is_active !== 0 && v.is_active !== false) && v.stock_quantity > 0);
        }
        
        // 3. Fallback to first active variant
        if (!initialVariant) {
          initialVariant = variants.find(v => v.is_active !== 0 && v.is_active !== false);
        }
        
        // 4. Default fallback if absolutely no active variants
        if (!initialVariant && variants.length > 0) {
          initialVariant = variants[0];
        }

        this._selectedAttributes = {};
        if (initialVariant) {
          if (initialVariant.size) this._selectedAttributes.size = initialVariant.size;
          if (initialVariant.color) this._selectedAttributes.color = initialVariant.color;
          if (initialVariant.material) this._selectedAttributes.material = initialVariant.material;
          if (initialVariant.attribute_values) {
            Object.entries(initialVariant.attribute_values).forEach(([k, val]) => {
              this._selectedAttributes[k] = val;
            });
          }
          
          // Sync query param with initial selected variant without reload
          const newUrl = window.location.pathname + '?variant=' + initialVariant.id;
          window.history.replaceState({ path: newUrl }, '', newUrl);
        }
        
        this._selectedSize = this._selectedAttributes.size || '';
        this._selectedColor = this._selectedAttributes.color || this._selectedAttributes.material || '';
        
        const activeImages = this._getActiveImages();
        this._selectedImg = activeImages[0] || this._product.image || '';

        // Load related, cross sell items and vouchers in parallel
        const [relatedRes, crossSellRes, voucherRes] = await Promise.all([
          productService.getRelatedProducts(this._product.id),
          productService.getCrossSellProducts(this._product.id),
          getEligibleVouchers(99999999, this._product.id).catch(err => {
            console.warn('Failed to load eligible vouchers for product detail:', err);
            return { data: [] };
          })
        ]);
        this._relatedProducts = relatedRes.data || [];
        this._crossSellProducts = crossSellRes.data || [];
        this._vouchers = voucherRes?.data || voucherRes || [];
      }
    } catch (err) {
      console.error('Failed to load product detail:', err);
    }
  }

  _applySeo() {
    if (!this._product) return;

    const settings = window.APP_SETTINGS || {};
    const brandName = settings.brand_name || 'Thương hiệu';
    const product = this._product;
    const productName = product.name || product.title || 'Sản phẩm';
    const slug = product.slug || this._slug;
    const description = stripHtml(
      product.meta_description
      || product.short_description
      || product.description
      || `${productName} tại ${brandName}`
    );
    const image = this._selectedImg || product.image_url || product.image || '';
    const isActive = product.is_active !== 0 && product.is_active !== false;

    applyHeadMetadata({
      title: product.meta_title || `${productName} | ${brandName}`,
      description,
      canonicalPath: `/product/${slug}`,
      robots: isActive ? 'index, follow' : 'noindex, follow',
      openGraph: {
        title: product.meta_title || productName,
        description,
        image,
        type: 'product'
      },
      schemas: [
        productSchema(product, settings),
        breadcrumbSchema([
          { name: 'Trang chủ', url: '/' },
          { name: 'Sản phẩm', url: '/products' },
          { name: productName, url: `/product/${slug}` }
        ], settings)
      ]
    }, settings);
  }

  _html() {
    return renderProductDetailHtml.call(this);
  }

  _getActiveImages() {
    if (!this._product) return [];
    const variants = this._product.variants || [];
    const generalImages = this._product.images || [];

    let variantImages = [];

    // 1. Look for variant that matches all selected attributes
    const exactVariant = variants.find(v => {
      return Object.entries(this._selectedAttributes || {}).every(([k, val]) => {
        if (k === 'size') return v.size === val;
        if (k === 'color') return (v.color || '') === val;
        if (k === 'material') return (v.material || '') === val;
        return v.attribute_values && v.attribute_values[k] === val;
      });
    });

    if (exactVariant && exactVariant.images && exactVariant.images.length > 0) {
      variantImages = exactVariant.images;
    }

    // Combine variant-specific images first, followed by general/common images
    const combined = [...variantImages, ...generalImages];
    if (combined.length === 0 && this._product.image) {
      combined.push(this._product.image);
    }

    return uniqueImages(combined);
  }

  _getVariantImages() {
    const images = this._getActiveImages();
    return images.length > 0 ? images : uniqueImages([this._selectedImg]);
  }

  _updateRelatedGrid(wrap) {
    const gridContainer = wrap.querySelector('#related-grid-container');
    const items = this._activeTab === 'related' ? this._relatedProducts : this._crossSellProducts;
    renderRelatedGrid(gridContainer, items);
  }

  _bindEvents(wrap) {
    // Thumbnail click switching
    wrap.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.dataset.src;
        if (!src) return;
        this._selectedImg = src;
        
        const container = wrap.querySelector('#main-product-viewer-container');
        if (container) {
          const isVid = isVideoUrl(src);
          const expandBtn = wrap.querySelector('#expand-img-btn');
          
          if (isVid) {
            const isYt = src.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
            if (isYt) {
              container.innerHTML = `<iframe id="main-product-video-iframe" src="${getYouTubeEmbedUrl(src)}" class="w-full h-full border-none" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            } else {
              container.innerHTML = `<video id="main-product-video" src="${src}" controls autoplay muted class="w-full h-full object-cover object-center"></video>`;
            }
            if (expandBtn) expandBtn.classList.add('hidden');
          } else {
            container.innerHTML = `<img id="main-product-img" src="${src}" alt="" class="w-full h-full object-cover object-center cursor-pointer" />`;
            if (expandBtn) expandBtn.classList.remove('hidden');
            
            // Re-bind the click event on the newly created #main-product-img
            const imgEl = container.querySelector('#main-product-img');
            if (imgEl) {
              imgEl.addEventListener('click', () => {
                openLightbox(this._getVariantImages(), this._selectedImg, this._product.name);
              });
            }
          }
        }
        
        wrap.querySelectorAll('.thumb-btn').forEach(b => b.classList.replace('border-black', 'border-zinc-200'));
        btn.classList.replace('border-zinc-200', 'border-black');
      });
    });

    // Attribute buttons clicking (unified handler for size, color/material and custom attributes)
    wrap.querySelectorAll('.attr-btn').forEach(btn => {
      // Only block click if button is pointer-events-none or completely disabled
      if (btn.classList.contains('pointer-events-none') || btn.classList.contains('cursor-not-allowed') && !btn.classList.contains('line-through')) {
        return;
      }
      btn.addEventListener('click', () => {
        const name = btn.dataset.attributeName;
        const val = btn.dataset.attributeValue;
        if (!name || !val) return;

        this._selectedAttributes[name] = val;
        if (name === 'size') this._selectedSize = val;
        if (name === 'color' || name === 'material') this._selectedColor = val;

        // Auto-adjust out of stock/invalid combinations
        const variants = this._product.variants || [];
        const isComboAvail = variants.some(v => {
          if (v.is_active === 0 || v.is_active === false) return false;
          return Object.entries(this._selectedAttributes).every(([k, selectedV]) => {
            if (k === 'size') return v.size === selectedV;
            if (k === 'color') return (v.color || '') === selectedV;
            if (k === 'material') return (v.material || '') === selectedV;
            return v.attribute_values && v.attribute_values[k] === selectedV;
          });
        });

        if (!isComboAvail) {
          // Find first variant that matches this clicked attribute and is active
          const matchVar = variants.find(v => {
            if (v.is_active === 0 || v.is_active === false) return false;
            const matchesClicked = (name === 'size' ? v.size === val : (name === 'color' || name === 'material') ? (v.color === val || v.material === val) : v.attribute_values && v.attribute_values[name] === val);
            return matchesClicked && v.stock_quantity > 0;
          }) || variants.find(v => {
            if (v.is_active === 0 || v.is_active === false) return false;
            const matchesClicked = (name === 'size' ? v.size === val : (name === 'color' || name === 'material') ? (v.color === val || v.material === val) : v.attribute_values && v.attribute_values[name] === val);
            return matchesClicked;
          });

          if (matchVar) {
            this._selectedAttributes = {};
            if (matchVar.size) this._selectedAttributes.size = matchVar.size;
            if (matchVar.color) this._selectedAttributes.color = matchVar.color;
            if (matchVar.material) this._selectedAttributes.material = matchVar.material;
            if (matchVar.attribute_values) {
              Object.entries(matchVar.attribute_values).forEach(([k, v]) => {
                this._selectedAttributes[k] = v;
              });
            }
            this._selectedSize = this._selectedAttributes.size || '';
            this._selectedColor = this._selectedAttributes.color || this._selectedAttributes.material || '';
          }
        }

        // Sync query parameter with selected variant without reloading
        const selectedVariant = variants.find(v => {
          if (v.is_active === 0 || v.is_active === false) return false;
          return Object.entries(this._selectedAttributes).every(([k, selectedV]) => {
            if (k === 'size') return v.size === selectedV;
            if (k === 'color') return (v.color || '') === selectedV;
            if (k === 'material') return (v.material || '') === selectedV;
            return v.attribute_values && v.attribute_values[k] === selectedV;
          });
        });

        if (selectedVariant) {
          const newUrl = window.location.pathname + '?variant=' + selectedVariant.id;
          window.history.replaceState({ path: newUrl }, '', newUrl);
        }

        // Reset selected image to first active image when variant changes
        const activeImages = this._getActiveImages();
        if (activeImages.length > 0) {
          this._selectedImg = activeImages[0];
        }

        this._updateUI(wrap);
      });
    });

    // Quantity actions
    const qtySpan = wrap.querySelector('#qty-val-span');
    wrap.querySelector('#qty-dec-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._qty > 1) {
        this._qty--;
        if (qtySpan) qtySpan.textContent = this._qty;
      }
    });
    wrap.querySelector('#qty-inc-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._qty++;
      if (qtySpan) qtySpan.textContent = this._qty;
    });

    // Add to cart click
    wrap.querySelector('#add-to-cart-btn')?.addEventListener('click', () => {
      const activeVariant = (this._product.variants || []).find(v => {
        if (v.is_active === 0 || v.is_active === false) return false;
        return Object.entries(this._selectedAttributes).every(([k, val]) => {
          if (k === 'size') return v.size === val;
          if (k === 'color') return (v.color || '') === val;
          if (k === 'material') return (v.material || '') === val;
          return v.attribute_values && v.attribute_values[k] === val;
        });
      });
      
      let itemPrice = this._product.price;
      let itemSalePrice = null;

      if (activeVariant) {
        if (activeVariant.price !== null && activeVariant.price !== undefined && activeVariant.price !== '') {
          itemPrice = activeVariant.price;
        }
        if (activeVariant.compare_at_price !== null && activeVariant.compare_at_price !== undefined && activeVariant.compare_at_price !== '') {
          // Compare-at price acts as original price, selling price is activeVariant.price
          itemPrice = activeVariant.compare_at_price;
          itemSalePrice = activeVariant.price;
        }
      }

      const item = {
        id: this._product.id,
        variant_id: activeVariant ? activeVariant.id : null,
        name: this._product.name,
        slug: this._product.slug,
        price: itemPrice,
        sale_price: itemSalePrice,
        image: this._selectedImg,
        qty: this._qty,
        size: this._selectedSize,
        color: this._selectedColor,
        attributes: { ...this._selectedAttributes },
        sku: activeVariant ? activeVariant.sku : ''
      };
      
      cartService.addItem(item, this._qty);
      window.dispatchEvent(new CustomEvent('open-cart')); // Open side cart drawer
    });

    // Contact to buy click
    wrap.querySelector('#contact-to-buy-btn')?.addEventListener('click', () => {
      const toggleBtn = document.getElementById('ccw-btn-toggle');
      if (toggleBtn) {
        const widget = document.getElementById('contact-channels-widget');
        if (widget && !widget.classList.contains('ccw-expanded')) {
          toggleBtn.click();
        }
      } else {
        const hotline = window.APP_SETTINGS?.contact_channels?.hotline || '0900000000';
        window.location.href = `tel:${hotline}`;
      }
    });

    // Fullscreen lightbox button and main image click
    const openLightboxFn = (e) => {
      e.stopPropagation();
      openLightbox(this._getVariantImages(), this._selectedImg, this._product.name);
    };
    wrap.querySelector('#expand-img-btn')?.addEventListener('click', openLightboxFn);
    wrap.querySelector('#main-product-img')?.addEventListener('click', openLightboxFn);

    // Size guide click
    wrap.querySelector('#size-guide-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const variants = this._product?.variants || [];
      const availableSizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
      openSizeGuide(this._product?.size_chart_url, availableSizes);
    });

    // Quick Edit Product click
    wrap.querySelector('#quick-edit-product-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const { openQuickProductEditor } = await import('../../components/QuickProductEditor.js?v=1.0.0');
        openQuickProductEditor(this._product.id, {
          onSaved: (updatedProduct) => {
            if (updatedProduct && updatedProduct.slug && updatedProduct.slug !== this._slug) {
              navigate(`/product/${updatedProduct.slug}`);
            } else {
              this._fetchData().then(() => this._updateUI(wrap));
            }
          }
        });
      } catch (err) {
        console.error('Không thể mở form chỉnh sửa sản phẩm:', err);
      }
    });

    // Quick Edit Badges click
    wrap.querySelector('#quick-edit-badges-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { openQuickSettings } = await import('../../components/QuickSettingsModal.js?v=1.0.24');
      openQuickSettings('sections', 'trust_badges');
    });

    // Related tabs selection
    const tabRelatedBtn = wrap.querySelector('#tab-related-btn');
    const tabMatchBtn = wrap.querySelector('#tab-match-btn');
    
    tabRelatedBtn?.addEventListener('click', () => {
      if (this._activeTab === 'related') return;
      this._activeTab = 'related';
      tabRelatedBtn.classList.add('border-black', 'text-black');
      tabRelatedBtn.classList.remove('border-transparent', 'text-zinc-400');
      tabMatchBtn.classList.remove('border-black', 'text-black');
      tabMatchBtn.classList.add('border-transparent', 'text-zinc-400');
      this._updateRelatedGrid(wrap);
    });
    
    tabMatchBtn?.addEventListener('click', () => {
      if (this._activeTab === 'match') return;
      this._activeTab = 'match';
      tabMatchBtn.classList.add('border-black', 'text-black');
      tabMatchBtn.classList.remove('border-transparent', 'text-zinc-400');
      tabRelatedBtn.classList.remove('border-black', 'text-black');
      tabRelatedBtn.classList.add('border-transparent', 'text-zinc-400');
      this._updateRelatedGrid(wrap);
    });

    // Copy voucher card code
    wrap.querySelectorAll('.copy-voucher-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = card.dataset.code;
        if (!code) return;
        
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
          showToast('success', `Đã sao chép mã giảm giá: ${code}`);
          
          // Visual feedback on the card itself
          const label = card.querySelector('div:last-child span:last-child');
          if (label) {
            const originalText = label.textContent;
            label.textContent = 'Đã lưu!';
            label.className = 'text-[8px] text-green-600 font-bold mt-1 uppercase tracking-wider';
            card.classList.add('border-green-500/50', 'bg-green-500/5');
            
            setTimeout(() => {
              label.textContent = originalText;
              label.className = 'text-[8px] text-zinc-400 font-medium mt-1 uppercase tracking-wider';
              card.classList.remove('border-green-500/50', 'bg-green-500/5');
            }, 2000);
          }
        }).catch(err => {
          console.error('Failed to copy text:', err);
          showToast('error', 'Không thể sao chép mã giảm giá.');
        });
      });
    });
  }

  _updateUI(wrap) {
    wrap.innerHTML = this._html();
    this._bindEvents(wrap);
    this._updateRelatedGrid(wrap);
    this._applySeo();
  }
}
