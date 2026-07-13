import { getProduct, quickUpdateProduct } from '../services/adminService.js';
import { showToast } from '../pages/Admin/shared/ui.js';
import { escapeHtml } from '../utils/helpers.js';

function formatNumber(value) {
  const raw = String(value ?? '').replace(/\D/g, '');
  return raw ? Number(raw).toLocaleString('vi-VN') : '';
}

function readNumber(value) {
  const raw = String(value ?? '').replace(/\D/g, '');
  return raw ? Number(raw) : 0;
}

function normalizeImages(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  if (images.length > 0) return images.filter(Boolean);
  return [product?.image_url, product?.image].filter(Boolean);
}

function field(label, name, value, attrs = '') {
  return `
    <label class="block space-y-1.5">
      <span class="block text-[10px] font-black uppercase tracking-wider text-zinc-500">${label}</span>
      <input name="${name}" value="${escapeHtml(value ?? '')}" ${attrs}
        class="w-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 outline-none transition focus:border-[#C9A84C]" />
    </label>
  `;
}

function textarea(label, name, value) {
  return `
    <label class="block space-y-1.5 md:col-span-2">
      <span class="block text-[10px] font-black uppercase tracking-wider text-zinc-500">${label}</span>
      <textarea name="${name}" rows="4"
        class="w-full resize-none border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold leading-relaxed text-zinc-900 outline-none transition focus:border-[#C9A84C]">${escapeHtml(value ?? '')}</textarea>
    </label>
  `;
}

function renderImageRows(images) {
  const rows = images.length > 0 ? images : [''];
  return rows.map((url, index) => `
    <div class="quick-product-image-row flex items-center gap-2" data-index="${index}">
      <div class="h-12 w-10 shrink-0 overflow-hidden border border-zinc-200 bg-zinc-50">
        ${url ? `<img src="${escapeHtml(url)}" class="h-full w-full object-cover" alt="" />` : ''}
      </div>
      <input type="text" value="${escapeHtml(url || '')}" class="quick-product-image-input min-w-0 flex-1 border border-zinc-200 px-2 py-2 text-[11px] font-mono text-zinc-600 outline-none focus:border-[#C9A84C]" />
      <button type="button" class="quick-product-pick-image h-9 w-9 shrink-0 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-950 hover:text-white transition" title="Chon anh">
        <svg class="mx-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      </button>
      <button type="button" class="quick-product-remove-image h-9 w-9 shrink-0 border border-red-100 bg-white text-red-500 hover:bg-red-50 transition" title="Xoa anh">
        <svg class="mx-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
      </button>
    </div>
  `).join('');
}

function renderForm(product, images) {
  return `
    <form id="quick-product-form" class="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden bg-white text-zinc-950 shadow-2xl">
      <div class="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <div>
          <h3 class="text-sm font-black uppercase tracking-widest">Sửa nhanh sản phẩm</h3>
          <p class="mt-1 text-[11px] font-medium text-zinc-500">Chỉnh nội dung hiển thị ngoài client, không cần vào admin đầy đủ.</p>
        </div>
        <button type="button" id="quick-product-close" class="h-9 w-9 border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-950 hover:text-white transition" title="Dong">
          <svg class="mx-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-5" data-lenis-prevent>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          ${field('Tên sản phẩm', 'name', product.name, 'required')}
          ${field('Gia ban', 'base_price', formatNumber(product.base_price ?? product.price), 'inputmode="numeric"')}
          ${field('Chat lieu', 'material', product.material)}
          ${field('Hoa tiet / in / theu', 'print_detail', product.print_detail)}
          ${field('Kieu dang', 'style', product.style)}
          ${field('Ảnh bảng size', 'size_chart_url', product.size_chart_url)}
          ${textarea('Huong dan bao quan', 'care_instructions', product.care_instructions)}
        </div>

        <div class="mt-5 space-y-3 border-t border-zinc-100 pt-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[10px] font-black uppercase tracking-wider text-zinc-500">Ảnh sản phẩm</p>
              <p class="mt-0.5 text-[11px] font-medium text-zinc-400">Ảnh đầu tiên là ảnh bìa ngoài danh sách.</p>
            </div>
            <button type="button" id="quick-product-add-image" class="border border-zinc-950 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-950 hover:bg-zinc-950 hover:text-white transition">Them anh</button>
          </div>
          <div id="quick-product-images" class="space-y-2">
            ${renderImageRows(images)}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" id="quick-product-full-edit" class="border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 transition">Mở form đầy đủ</button>
        <div class="flex justify-end gap-2">
          <button type="button" id="quick-product-cancel" class="border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition">Hủy</button>
          <button type="submit" id="quick-product-submit" class="bg-[#C9A84C] px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-[#b8963e] transition">Lưu</button>
        </div>
      </div>
    </form>
  `;
}

export async function openQuickProductEditor(productOrId, options = {}) {
  const productId = typeof productOrId === 'object' ? productOrId.id : productOrId;
  if (!productId) {
    showToast('Không tìm thấy ID sản phẩm để sửa nhanh.', 'error');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm';
  overlay.setAttribute('data-lenis-prevent', 'true');
  overlay.innerHTML = `
    <div class="bg-white px-6 py-5 text-sm font-semibold text-zinc-600 shadow-2xl">
      Đang tải thông tin sản phẩm...
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  let product = null;
  let images = [];

  const close = () => {
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
    overlay.remove();
  };

  const onKeydown = (event) => {
    if (event.key === 'Escape' || event.key === 'F4') {
      event.preventDefault();
      close();
    }
  };
  document.addEventListener('keydown', onKeydown);

  try {
    const response = await getProduct(productId);
    product = response.data || response;
    images = normalizeImages(product);
    overlay.innerHTML = renderForm(product, images);
  } catch (error) {
    console.error('[QuickProductEditor] Failed to load product:', error);
    showToast(error.message || 'Không thể tải sản phẩm.', 'error');
    close();
    return;
  }

  const renderImages = () => {
    const list = overlay.querySelector('#quick-product-images');
    if (!list) return;
    list.innerHTML = renderImageRows(images);
    bindImageRows();
  };

  const bindImageRows = () => {
    overlay.querySelectorAll('.quick-product-image-row').forEach((row) => {
      const index = Number(row.dataset.index);
      row.querySelector('.quick-product-image-input')?.addEventListener('input', (event) => {
        images[index] = event.target.value.trim();
      });
      row.querySelector('.quick-product-remove-image')?.addEventListener('click', () => {
        images.splice(index, 1);
        renderImages();
      });
      row.querySelector('.quick-product-pick-image')?.addEventListener('click', async () => {
        const { openImagePicker } = await import('../pages/Admin/Products/ImagePicker.js?v=1.0.55');
        openImagePicker((url) => {
          images[index] = url;
          renderImages();
        }, false, images[index] || '');
      });
    });
  };

  bindImageRows();

  const closeButtons = ['#quick-product-close', '#quick-product-cancel'];
  closeButtons.forEach(selector => overlay.querySelector(selector)?.addEventListener('click', close));
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  overlay.querySelector('input[name="base_price"]')?.addEventListener('input', (event) => {
    event.target.value = formatNumber(event.target.value);
  });

  overlay.querySelector('#quick-product-add-image')?.addEventListener('click', () => {
    images.push('');
    renderImages();
  });

  overlay.querySelector('#quick-product-full-edit')?.addEventListener('click', async () => {
    const adminProduct = product;
    close();
    const { openProductForm } = await import('../pages/Admin/Products/ProductForm.js?v=1.0.55');
    openProductForm(adminProduct, options.onSaved);
  });

  overlay.querySelector('#quick-product-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = overlay.querySelector('#quick-product-submit');
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get('name') || '').trim(),
      base_price: readNumber(formData.get('base_price')),
      material: String(formData.get('material') || '').trim(),
      print_detail: String(formData.get('print_detail') || '').trim(),
      style: String(formData.get('style') || '').trim(),
      size_chart_url: String(formData.get('size_chart_url') || '').trim(),
      care_instructions: String(formData.get('care_instructions') || '').trim(),
      images: images.map(url => String(url || '').trim()).filter(Boolean),
    };

    if (!payload.name) {
      showToast('Tên sản phẩm không được để trống.', 'warning');
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Đang lưu...';

    try {
      const response = await quickUpdateProduct(product.id, payload);
      const updatedProduct = response.data || response;
      showToast('Đã lưu sản phẩm ngay ngoài client.', 'success');
      close();
      if (typeof options.onSaved === 'function') {
        options.onSaved(updatedProduct);
      }
    } catch (error) {
      console.error('[QuickProductEditor] Failed to save product:', error);
      showToast(error.message || 'Lưu sản phẩm thất bại.', 'error');
      submit.disabled = false;
      submit.textContent = 'Lưu';
    }
  });
}
