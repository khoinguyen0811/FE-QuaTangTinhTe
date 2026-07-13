/**
 * cartService.js — localStorage cart management for Đồng Hồ Anh Tuấn
 */
import { STORAGE_KEYS } from './config.js';

const KEY = STORAGE_KEYS.CART;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items } }));
}

export function getCartItemKey(item) {
  const parts = [item.id, item.size || '', item.color || ''];
  if (item.attributes) {
    Object.keys(item.attributes).sort().forEach(k => {
      if (k !== 'size' && k !== 'color') {
        parts.push(`${k}:${item.attributes[k]}`);
      }
    });
  }
  return parts.join('_');
}

export const cartService = {
  getCart() {
    return load();
  },

  getCount() {
    return load().reduce((sum, item) => sum + (item.qty || 1), 0);
  },

  getTotal() {
    return load().reduce((sum, item) => {
      const price = item.sale_price && item.sale_price < item.price ? item.sale_price : item.price;
      return sum + price * (item.qty || 1);
    }, 0);
  },

  addItem(product, qty = 1) {
    const items = load();
    const size = product.size || '';
    const color = product.color || '';
    const attrs = product.attributes || {};

    const idx = items.findIndex(i => {
      if (i.id !== product.id) return false;
      if ((i.size || '') !== size) return false;
      if ((i.color || '') !== color) return false;
      
      const iAttrs = i.attributes || {};
      const iKeys = Object.keys(iAttrs).filter(k => k !== 'size' && k !== 'color');
      const pKeys = Object.keys(attrs).filter(k => k !== 'size' && k !== 'color');
      if (iKeys.length !== pKeys.length) return false;
      return pKeys.every(k => iAttrs[k] === attrs[k]);
    });

    if (idx > -1) {
      items[idx].qty = (items[idx].qty || 1) + qty;
    } else {
      items.push({
        id: product.id,
        variant_id: product.variant_id || null,
        name: product.name,
        slug: product.slug,
        price: product.price,
        sale_price: product.sale_price || null,
        image: product.image || product.images?.[0] || '',
        category_name: product.category_name || '',
        size: size,
        color: color,
        attributes: attrs,
        sku: product.sku || '',
        qty,
      });
    }
    save(items);
    return items;
  },

  removeItem(key) {
    const items = load().filter(i => {
      const itemKey = getCartItemKey(i);
      if (!isNaN(key) && Number(key) === i.id) {
        return false;
      }
      return itemKey !== String(key);
    });
    save(items);
    return items;
  },

  updateQty(key, qty) {
    const items = load();
    const idx = items.findIndex(i => {
      const itemKey = getCartItemKey(i);
      if (!isNaN(key) && Number(key) === i.id) {
        return true;
      }
      return itemKey === String(key);
    });
    if (idx === -1) return items;
    if (qty <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx].qty = qty;
    }
    save(items);
    return items;
  },

  clearCart() {
    save([]);
  },
};
