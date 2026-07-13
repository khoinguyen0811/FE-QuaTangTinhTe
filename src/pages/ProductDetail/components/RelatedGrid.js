import { formatPrice, navigate } from '../../../utils/helpers.js';

function productBadgesHTML(product) {
  const badges = [];
  if (product.is_flash_sale || product.flash_sale_price) {
    badges.push(`<span class="bg-[#e53e3e] text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 leading-none">FLASH SALE</span>`);
  }
  const origPrice = product.original_price || 0;
  const salePrice = product.price || product.base_price || 0;
  if (origPrice > 0 && salePrice > 0 && (origPrice - salePrice) / origPrice >= 0.5) {
    badges.push(`<span class="bg-black text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 leading-none">FINAL SALE</span>`);
  }
  if (product.is_web_exclusive) {
    badges.push(`<span class="bg-zinc-800 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 leading-none">WEB EXCLUSIVE</span>`);
  }
  if (badges.length === 0) return '';
  return `<div class="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">${badges.join('')}</div>`;
}

function relatedCardHTML(product) {
  const price = product.price || product.base_price || 0;
  const origPrice = product.original_price || 0;
  const imgUrl = product.images?.[0] || product.image_url || product.image || 'https://images.pexels.com/photos/18413243/pexels-photo-18413243.jpeg?auto=compress&cs=tinysrgb&w=600';
  const hoverImgUrl = product.images?.[1] || product.hover_image_url || imgUrl;

  return `
    <div class="product-card group relative flex flex-col cursor-pointer select-none text-center" data-slug="${product.slug}">

      <!-- Image container with hover swap transition -->
      <div class="relative w-full aspect-[3/4] bg-zinc-50 overflow-hidden mb-4 border border-zinc-100">
        ${productBadgesHTML(product)}
        <img
          data-src="${imgUrl}"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3C/svg%3E"
          alt="${product.name}"
          class="lazy absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
          onerror="this.src='https://images.pexels.com/photos/18413243/pexels-photo-18413243.jpeg?auto=compress&cs=tinysrgb&w=600'"
        />
        <img
          data-hover-src="${hoverImgUrl}"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3C/svg%3E"
          alt="${product.name}"
          class="hover-img absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          onerror="this.src='https://images.pexels.com/photos/18413243/pexels-photo-18413243.jpeg?auto=compress&cs=tinysrgb&w=600'"
        />
      </div>

      <!-- Name & Price info -->
      <div class="text-center space-y-1">
        <h3 class="text-xs sm:text-sm font-bold uppercase tracking-widest text-black group-hover:opacity-70 transition-opacity truncate px-2">
          ${product.name}
        </h3>
        <div class="flex justify-center items-center gap-2 text-xs sm:text-sm font-black">
          <span class="text-black tracking-wider">${formatPrice(price)}</span>
          ${origPrice > price ? `<span class="text-zinc-400 line-through font-medium text-[11px]">${formatPrice(origPrice)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

export function renderRelatedGrid(container, items) {
  if (!container) return;
  
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="col-span-4 text-center py-12 text-zinc-400 text-xs font-bold uppercase tracking-widest">
        Không có sản phẩm nào tương tự
      </div>
    `;
    return;
  }
  
  container.innerHTML = items
    .slice(0, 4)
    .map(item => relatedCardHTML(item))
    .join('');
    
  // Bind click event to new related cards
  container.querySelectorAll('[data-slug]').forEach(card => {
    card.addEventListener('click', () => {
      const slug = card.dataset.slug;
      if (slug) navigate(`/product/${slug}`);
    });
  });

  // Trigger lazy loading for newly created cards
  window.dispatchEvent(new CustomEvent('page-rendered'));
}
