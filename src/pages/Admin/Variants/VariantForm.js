import { showToast } from '../shared/ui.js';
import { getProducts, getVariantTypes, createVariant, updateVariant } from '../../../services/adminService.js';
import { openImagePicker } from '../Products/ImagePicker.js';

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

export function openVariantForm(variant, onSaved) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  overlay.setAttribute('data-lenis-prevent', 'true');

  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-bold text-gray-900">${variant ? 'Chỉnh sửa biến thể' : 'Thêm biến thể'}</h2>
        <button id="vf-close" class="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form id="var-form" class="p-6 space-y-4">
        <div id="vf-loading" class="py-8 text-center text-gray-400 text-sm">
          Đang tải cấu hình dữ liệu...
        </div>
        <div id="vf-fields" class="space-y-4 hidden">
          <!-- Fields injected dynamically -->
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const form = overlay.querySelector('#var-form');
  const loadingEl = overlay.querySelector('#vf-loading');
  const fieldsWrap = overlay.querySelector('#vf-fields');

  const close = () => overlay.remove();
  overlay.querySelector('#vf-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  let currentImages = [];
  if (variant?.images && Array.isArray(variant.images)) {
    currentImages = [...variant.images];
  }

  Promise.all([
    getProducts({ limit: 1000 }),
    getVariantTypes()
  ]).then(([productsRes, typesRes]) => {
    const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes || []);
    const types = Array.isArray(typesRes.data) ? typesRes.data : [];

    loadingEl.classList.add('hidden');
    fieldsWrap.classList.remove('hidden');

    // Build the form fields
    let fieldsHtml = `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Sản phẩm *</label>
        <select name="product_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" id="vf-product">
          <option value="">-- Chọn sản phẩm --</option>
        </select>
      </div>
    `;

    // Dynamic attribute fields
    types.forEach(type => {
      const isRequired = type.name === 'size'; // Size is required by model schema
      const placeholder = type.name === 'size' 
        ? 'Ví dụ: 80x120x50mm...' 
        : type.name === 'material' 
          ? 'Ví dụ: Pha lê cao cấp...'
          : `Nhập ${type.display_name.toLowerCase()}...`;

      let currentVal = variant?.attribute_values?.[type.name];
      if (currentVal === undefined || currentVal === null) {
        currentVal = variant?.[type.name];
      }

      let datalistHtml = '';
      let listAttr = '';
      
      if (type.predefined_values && type.predefined_values.trim() !== '') {
        const options = type.predefined_values.split(',').map(v => v.trim()).filter(v => v !== '');
        listAttr = `list="dl-${type.name}"`;
        datalistHtml = `
          <datalist id="dl-${type.name}">
            ${options.map(opt => `<option value="${opt}"></option>`).join('')}
          </datalist>
        `;
      }

      fieldsHtml += `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">${type.display_name} ${isRequired ? '*' : ''}</label>
          <input name="attr_${type.name}" ${listAttr} ${isRequired ? 'required' : ''} class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
            value="${currentVal || ''}" placeholder="${placeholder}"/>
          ${datalistHtml}
        </div>
      `;
    });

    // Stock & SKU
    fieldsHtml += `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Giá bán (VND) *</label>
        <input name="price" type="number" required min="0" step="1000" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
          value="${variant?.price ?? ''}" placeholder="Ví dụ: 250000"/>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Số lượng tồn kho *</label>
        <input name="stock_quantity" type="number" required min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
          value="${variant?.stock_quantity ?? 0}"/>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Mã SKU *</label>
        <div class="flex gap-2">
          <input name="sku" id="vf-sku" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
            value="${variant?.sku || ''}" placeholder="Ví dụ: SP-0040-S"/>
          <button type="button" id="vf-gen-sku"
            class="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 whitespace-nowrap flex items-center gap-1">
            Tạo tự động
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Hình ảnh biến thể (Kéo thả hoặc chọn vị trí để sắp xếp)</label>
        <div id="vf-image-grid-slots" class="grid grid-cols-5 gap-2.5 mt-2">
          <!-- Rendered dynamically -->
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" id="vf-cancel" class="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Hủy</button>
        <button type="submit" id="vf-submit" class="px-5 py-2 rounded-lg bg-[#C9A84C] text-white hover:bg-[#b8963e] text-sm font-medium">Lưu</button>
      </div>
    `;

    fieldsWrap.innerHTML = fieldsHtml;

    // Populating products dropdown
    const productSelect = fieldsWrap.querySelector('#vf-product');
    products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.sku || 'Không SKU'})`;
      if (p.id == variant?.product_id) opt.selected = true;
      productSelect.appendChild(opt);
    });

    if (variant) {
      productSelect.disabled = true; // Block changing product on edit
    }

    // Setup Visual Image Dynamic Grid Manager
    function renderImageSlots() {
      const container = fieldsWrap.querySelector('#vf-image-grid-slots');
      if (!container) return;
      container.innerHTML = '';

      // 1. Render existing selected images
      currentImages.forEach((img, idx) => {
        const isSlot1 = idx === 0;
        const isSlot2 = idx === 1;

        let cardClass = "relative aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all overflow-hidden cursor-grab active:cursor-grabbing bg-white ";
        let title = `Ảnh P${idx + 1}`;
        let badgeText = '';
        let badgeClass = 'bg-gray-500';

        if (isSlot1) {
          cardClass += "border-amber-400 bg-amber-50/20 shadow-sm ring-2 ring-amber-400/5";
          title = "Ảnh Bìa (P1)";
          badgeText = "Ảnh bìa";
          badgeClass = 'bg-amber-500';
        } else if (isSlot2) {
          cardClass += "border-blue-400 bg-blue-50/20 shadow-sm ring-2 ring-blue-400/5";
          title = "Ảnh Hover (P2)";
          badgeText = "Ảnh Hover";
          badgeClass = 'bg-blue-500';
        } else {
          cardClass += "border-gray-200 hover:border-gray-300 shadow-sm";
          badgeText = `Ảnh P${idx + 1}`;
        }

        const card = document.createElement('div');
        card.className = cardClass;
        card.setAttribute('draggable', 'true');
        card.dataset.index = idx;

        const isVid = isVideoUrl(img);
        const displaySrc = isVid ? getVideoThumbnail(img) : img;

        card.innerHTML = `
          <img src="${displaySrc}" class="w-full h-full object-cover rounded-lg" onerror="this.src='/image/default-placeholder.png'">
          ${isVid ? `
            <div class="absolute inset-0 flex items-center justify-center bg-black/25">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          ` : ''}
          <div class="absolute inset-0 bg-black/55 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1.5 rounded-lg">
            <span class="text-[8px] text-white/90 font-bold uppercase tracking-wider mb-1">${title}</span>
            <div class="flex items-center gap-1 mt-0.5">
              <button type="button" class="change-slot bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded text-xs font-semibold shadow transition-colors" title="Thay đổi">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button type="button" class="delete-slot bg-red-600/90 hover:bg-red-600 text-white p-1.5 rounded text-xs font-semibold shadow transition-colors" title="Xóa">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="absolute bottom-1 left-1 right-1 flex items-center justify-between text-white text-[8px] bg-black/60 px-1 py-0.5 rounded">
              <span>Vị trí:</span>
              <select class="pos-select bg-transparent text-white text-[8px] font-bold border-none outline-none cursor-pointer">
                ${currentImages.map((_, numIdx) => `<option value="${numIdx + 1}" ${numIdx === idx ? 'selected' : ''} class="text-black">${numIdx + 1}</option>`).join('')}
              </select>
            </div>
          </div>
          ${badgeText ? `<span class="absolute top-0.5 left-0.5 px-1 py-0.2 text-[7px] font-bold text-white rounded ${badgeClass}">${badgeText}</span>` : ''}
        `;

        // Binds
        card.querySelector('.change-slot').addEventListener('click', () => {
          openImagePicker(url => {
            if (idx === 0 && isVideoUrl(url)) {
              showToast('Không thể chọn video làm ảnh bìa sản phẩm!', 'warning');
              return;
            }
            currentImages[idx] = url;
            renderImageSlots();
          }, false, [currentImages[idx]]);
        });

        card.querySelector('.delete-slot').addEventListener('click', () => {
          currentImages.splice(idx, 1);
          renderImageSlots();
        });

        card.querySelector('.pos-select').addEventListener('change', (e) => {
          const newPos = parseInt(e.target.value) - 1;
          if (newPos === 0 && isVideoUrl(currentImages[idx])) {
            showToast('Không thể di chuyển video làm ảnh bìa sản phẩm!', 'warning');
            renderImageSlots();
            return;
          }
          if (idx === 0 && isVideoUrl(currentImages[1])) {
            showToast('Không thể di chuyển ảnh bìa vì ảnh tiếp theo là video!', 'warning');
            renderImageSlots();
            return;
          }
          const [movedImage] = currentImages.splice(idx, 1);
          currentImages.splice(newPos, 0, movedImage);
          renderImageSlots();
        });

        // Drag & Drop
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', idx);
          card.classList.add('opacity-40');
        });

        card.addEventListener('dragover', (e) => {
          e.preventDefault();
          card.classList.add('border-solid', isSlot1 ? 'border-amber-500' : isSlot2 ? 'border-blue-500' : 'border-gray-500', 'scale-[1.03]');
        });

        card.addEventListener('dragleave', () => {
          card.classList.remove('border-solid', 'border-amber-500', 'border-blue-500', 'border-gray-500', 'scale-[1.03]');
        });

        card.addEventListener('drop', (e) => {
          e.preventDefault();
          const srcIdx = parseInt(e.dataTransfer.getData('text/plain'));
          if (isNaN(srcIdx) || srcIdx === idx) return;

          if (idx === 0 && isVideoUrl(currentImages[srcIdx])) {
            showToast('Không thể di chuyển video làm ảnh bìa sản phẩm!', 'warning');
            renderImageSlots();
            return;
          }
          if (srcIdx === 0 && isVideoUrl(currentImages[idx])) {
            showToast('Không thể di chuyển ảnh bìa vì ảnh tiếp theo sẽ là video!', 'warning');
            renderImageSlots();
            return;
          }

          const [movedImage] = currentImages.splice(srcIdx, 1);
          currentImages.splice(idx, 0, movedImage);
          renderImageSlots();
        });

        container.appendChild(card);
      });

      // 2. Render "+" (Add Image) button slot
      const addCard = document.createElement('div');
      addCard.className = "relative aspect-square rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100/50 flex flex-col items-center justify-center p-4 transition-all cursor-pointer shadow-sm";
      addCard.innerHTML = `
        <svg class="text-gray-400 hover:text-gray-600 transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span class="text-[9px] font-semibold text-gray-500 tracking-wider mt-1.5 uppercase">Thêm ảnh</span>
      `;
      addCard.addEventListener('click', () => {
        openImagePicker(urls => {
          const newImages = Array.isArray(urls) ? urls : [urls];
          currentImages = newImages.filter(url => url && url.trim() !== '');
          renderImageSlots();
        }, true, currentImages);
      });
      container.appendChild(addCard);
    }

    renderImageSlots();

    // Cancel bind
    fieldsWrap.querySelector('#vf-cancel').addEventListener('click', close);

    // Auto SKU generator helper
    const skuInput = fieldsWrap.querySelector('#vf-sku');
    fieldsWrap.querySelector('#vf-gen-sku').addEventListener('click', () => {
      const selectedOpt = productSelect.options[productSelect.selectedIndex];
      if (!selectedOpt || !selectedOpt.value) {
        showToast('Vui lòng chọn sản phẩm trước', 'warning');
        return;
      }
      const sizeInput = fieldsWrap.querySelector('[name="attr_size"]');
      const size = sizeInput ? sizeInput.value.trim() : '';
      if (!size) {
        showToast('Vui lòng nhập kích cỡ trước', 'warning');
        return;
      }
      
      const productName = selectedOpt.textContent.split(' (')[0];
      const slug = slugify(productName);
      skuInput.value = `${slug.toUpperCase()}-${size.toUpperCase()}`;
    });

    // Form submit logic
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = fieldsWrap.querySelector('#vf-submit');
      btn.textContent = 'Đang lưu...'; btn.disabled = true;

      try {
        const fd = new FormData(form);
        const data = Object.fromEntries(fd.entries());

        const body = {
          sku: data.sku,
          price: data.price !== '' ? Number(data.price) : null,
          stock_quantity: Number(data.stock_quantity),
          product_id: variant ? variant.product_id : Number(data.product_id),
          attribute_values: {},
          images: currentImages.filter(url => url && url.trim() !== '')
        };

        // Extract attributes
        Object.entries(data).forEach(([key, val]) => {
          if (key.startsWith('attr_')) {
            const attrName = key.replace('attr_', '');
            body.attribute_values[attrName] = val.trim();
          }
        });

        if (variant) {
          await updateVariant(variant.id, body);
          showToast('Cập nhật biến thể thành công!');
        } else {
          await createVariant(body);
          showToast('Thêm biến thể thành công!');
        }
        close();
        if (onSaved) onSaved();
      } catch (err) {
        showToast(err.message || 'Có lỗi xảy ra', 'error');
      } finally {
        btn.textContent = 'Lưu'; btn.disabled = false;
      }
    });

  }).catch((err) => {
    loadingEl.textContent = 'Không thể tải cấu hình: ' + err.message;
    loadingEl.className = 'py-8 text-center text-red-500 text-sm';
  });
}

function slugify(text) {
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

