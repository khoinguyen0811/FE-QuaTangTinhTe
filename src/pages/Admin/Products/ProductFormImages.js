// ProductFormImages.js — Controls drag-and-drop and slot rendering for product images
import { openImagePicker } from './ImagePicker.js';
import { showToast } from '../shared/ui.js';
import { isVideoUrl, getVideoThumbnail } from './ProductFormPart2.js';

export function setupProductImages(overlay, context) {
  function renderImageSlots() {
    const container = overlay.querySelector('#image-grid-slots');
    if (!container) return;
    container.innerHTML = '';

    // 1. Render existing selected images
    context.currentImages.forEach((img, idx) => {
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
        <img src="${displaySrc}" class="w-full h-full object-cover rounded-lg" onerror="this.onerror=null; this.src='/image/default-placeholder.png';">
        ${isVid ? `
          <div class="absolute inset-0 flex items-center justify-center bg-black/25">
            <span class="text-white font-bold text-xs">Video</span>
          </div>
        ` : ''}
        
        <!-- Visible delete button at top-right -->
        <button type="button" class="delete-slot absolute top-0.5 right-0.5 z-20 px-1.5 py-0.5 rounded bg-red-650 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-colors border-none cursor-pointer hover:scale-105 active:scale-95 text-[8px] font-bold" title="Xóa ảnh">
          Xóa
        </button>

        <!-- Mobile Edit Pencil Button -->
        <button type="button" class="img-mobile-edit absolute top-0.5 right-8 bg-black/60 text-white px-1.5 py-0.5 rounded md:hidden z-10 hover:bg-black/80 shadow-sm transition-all text-[8px] font-bold" title="Chỉnh sửa ảnh">
          Sửa
        </button>

        <div class="img-overlay absolute inset-0 bg-black/55 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1.5 rounded-lg z-10">
          <span class="text-[8px] text-white/90 font-bold uppercase tracking-wider mb-1">${title}</span>
          <div class="flex items-center gap-1 mt-0.5">
            <button type="button" class="change-slot bg-white/90 hover:bg-white text-gray-800 px-2 py-1 rounded text-[10px] font-bold shadow transition-colors" title="Thay đổi">
              Thay đổi
            </button>
          </div>
          <div class="absolute bottom-1 left-1 right-1 flex items-center justify-between text-white text-[8px] bg-black/60 px-1 py-0.5 rounded">
            <span>Vị trí:</span>
            <select class="pos-select bg-transparent text-white text-[8px] font-bold border-none outline-none cursor-pointer">
              ${context.currentImages.map((_, numIdx) => `<option value="${numIdx + 1}" ${numIdx === idx ? 'selected' : ''} class="text-black">${numIdx + 1}</option>`).join('')}
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
          context.currentImages[idx] = url;
          renderImageSlots();
          context.onDraftChange?.();
        }, false, [context.currentImages[idx]]);
      });

      card.querySelector('.delete-slot').addEventListener('click', () => {
        context.currentImages.splice(idx, 1);
        renderImageSlots();
        context.onDraftChange?.();
      });

      // Click handler to toggle overlay on touch screens/mobile
      card.addEventListener('click', (e) => {
        const isOverlayBtn = e.target.closest('.img-overlay button') || e.target.closest('.img-overlay select') || e.target.closest('.delete-slot');
        if (isOverlayBtn) return;
        
        const overlayEl = card.querySelector('.img-overlay');
        if (overlayEl) {
          const isActive = overlayEl.classList.contains('!opacity-100');
          container.querySelectorAll('.img-overlay').forEach(el => el.classList.remove('!opacity-100'));
          if (!isActive) {
            overlayEl.classList.add('!opacity-100');
          }
        }
      });

      card.querySelector('.pos-select').addEventListener('change', (e) => {
        const newPos = parseInt(e.target.value) - 1;
        if (newPos === 0 && isVideoUrl(context.currentImages[idx])) {
          showToast('Không thể di chuyển video làm ảnh bìa sản phẩm!', 'warning');
          renderImageSlots();
          return;
        }
        if (idx === 0 && isVideoUrl(context.currentImages[1])) {
          showToast('Không thể di chuyển ảnh bìa vì ảnh tiếp theo là video!', 'warning');
          renderImageSlots();
          return;
        }
        const [movedImage] = context.currentImages.splice(idx, 1);
        context.currentImages.splice(newPos, 0, movedImage);
        renderImageSlots();
        context.onDraftChange?.();
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

        if (idx === 0 && isVideoUrl(context.currentImages[srcIdx])) {
          showToast('Không thể di chuyển video làm ảnh bìa sản phẩm!', 'warning');
          renderImageSlots();
          return;
        }
        if (srcIdx === 0 && isVideoUrl(context.currentImages[idx])) {
          showToast('Không thể di chuyển ảnh bìa vì ảnh tiếp theo sẽ là video!', 'warning');
          renderImageSlots();
          return;
        }

        const [movedImage] = context.currentImages.splice(srcIdx, 1);
        context.currentImages.splice(idx, 0, movedImage);
        renderImageSlots();
        context.onDraftChange?.();
      });

      container.appendChild(card);
    });

    // 2. Render "+" (Add Image) button slot
    const addCard = document.createElement('div');
    addCard.className = "relative aspect-square rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100/50 flex flex-col items-center justify-center p-4 transition-all cursor-pointer shadow-sm";
    addCard.innerHTML = `
      <span class="text-gray-400 font-extrabold text-lg">+</span>
      <span class="text-[9px] font-semibold text-gray-500 tracking-wider mt-1 uppercase">Thêm ảnh</span>
    `;
    addCard.addEventListener('click', () => {
      openImagePicker(urls => {
        const newImages = Array.isArray(urls) ? urls : [urls];
        context.currentImages = newImages.filter(url => url && url.trim() !== '');
        renderImageSlots();
        context.onDraftChange?.();
      }, true, context.currentImages);
    });
    container.appendChild(addCard);
  }

  // Bind to context
  context.renderImageSlots = renderImageSlots;
}
