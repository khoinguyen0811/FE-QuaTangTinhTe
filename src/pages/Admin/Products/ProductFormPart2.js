// ProductFormPart2.js — Shared utility helper functions for ProductForm modules
import { showToast } from '../shared/ui.js';

export function isSameImage(url1, url2) {
  if (!url1 || !url2) return false;
  const clean = (url) => {
    let u = url.trim().split('?')[0].split('#')[0];
    const match = u.match(/^https?:\/\/[^\/]+(\/.*)/);
    if (match) u = match[1];
    return u.replace(/^\/+/, '');
  };
  return clean(url1) === clean(url2);
}

export function isVideoUrl(url) {
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

export function getVideoThumbnail(url) {
  if (!url || typeof url !== 'string') return '/image/default-placeholder.png';
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(ytRegExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400';
}

export function slugify(text) {
  const map = {
    'àáạảãâầấậẩẫăằắặẳẵ': 'a', 'èéẹẻẽêềếệểễ': 'e', 'ìíịỉĩ': 'i',
    'òóọỏõôồốộổỗơờớợởỡ': 'o', 'ùúụủũưừứựửữ': 'u', 'ỳýỵỷỹ': 'y', 'đ': 'd',
  };
  let s = text.toLowerCase().trim();
  for (const [chars, rep] of Object.entries(map)) {
    for (const ch of [...chars]) s = s.replaceAll(ch, rep);
  }
  return s.replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function injectFormStyles() {
  if (document.getElementById('pf-styles')) return;
  const s = document.createElement('style');
  s.id = 'pf-styles';
  s.textContent = `
    .form-label{display:block;font-size:0.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.375rem}
    .form-input{width:100%;padding:0.625rem 0.875rem;border:1px solid #e4e4e7;border-radius:0.75rem;font-size:0.875rem;outline:none;transition:all 0.2s ease-in-out;background:#fff;color:#09090b}
    .form-input:focus{border-color:#C9A84C;box-shadow:0 0 0 3px rgba(201,168,76,0.12)}
    .glow-effect{transition: box-shadow 0.2s ease-in-out;}
    .glow-effect:hover{box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);}
  `;
  document.head.appendChild(s);
}

export function serializeProductState(container, context, selectedCategoryIds) {
  const form = container.querySelector('#product-form');
  if (!form) return null;

  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  // Handle checkboxes
  data.is_active = fd.has('is_active');
  data.is_featured = fd.has('is_featured');
  data.is_customizable = fd.has('is_customizable');

  // Handle price
  const priceVal = container.querySelector('#pf-base-price')?.value.replace(/\D/g, '') || '0';
  data.base_price = Number(priceVal);

  // Handle categories
  data.category_ids = selectedCategoryIds;
  data.category_id = selectedCategoryIds.find(id => Number(id) !== 1) || 1;
  
  if (data.subcategory_id === '') {
    data.subcategory_id = null;
  } else {
    data.subcategory_id = Number(data.subcategory_id);
  }

  // Handle gallery images
  data.images = context.currentImages.map(img => img.trim()).filter(Boolean);

  // Handle tags
  data.tags = context.selectedTags || [];

  // Handle variants
  data.variants = context.currentVariants.map(v => ({
    id: v.id,
    size: v.size ? v.size.trim() : '',
    color: v.color ? v.color.trim() : null,
    stock_quantity: Number(v.stock_quantity) || 0,
    sku: v.sku ? v.sku.trim() : '',
    images: v.images || [],
    attribute_values: {
      size: v.size ? v.size.trim() : '',
      color: v.color ? v.color.trim() : null,
      ...Object.keys(v).reduce((acc, k) => {
        if (k !== 'id' && k !== 'size' && k !== 'color' && k !== 'stock_quantity' && k !== 'sku' && k !== 'images' && k !== '_originalIdx') {
          acc[k] = v[k];
        }
        return acc;
      }, {})
    }
  }));

  // Add active attributes structure to recreate generator state
  data.activeAttributes = context.activeAttributes;

  return data;
}

export function saveProductDraft(productId, container, context, selectedCategoryIds) {
  const data = serializeProductState(container, context, selectedCategoryIds);
  if (data) {
    localStorage.setItem('sly_draft_product_' + productId, JSON.stringify(data));
  }
}
