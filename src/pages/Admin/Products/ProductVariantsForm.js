// ProductVariantsForm.js — Shopify/Haravan style table-based variants management
import { openImagePicker } from './ImagePicker.js';
import { showToast, createConfirmDialog } from '../shared/ui.js';
import { isSameImage, isVideoUrl, getVideoThumbnail, slugify } from './ProductFormPart2.js';

export function setupProductVariants(overlay, context) {
  let currentPage = 1;
  const PAGE_SIZE = 10;

  // Initialize deleted combinations set
  if (!context.deletedCombinations) {
    context.deletedCombinations = new Set();
  }

  // 1. Render Option Attributes list on the left (WordPress/Shopify visual tags)
  function renderAttributeInputs() {
    const container = overlay.querySelector('#pf-attribute-inputs-container');
    if (!container) return;
    container.innerHTML = '';

    context.activeAttributes.forEach((attr, idx) => {
      const row = document.createElement('div');
      row.className = 'pf-attr-row items-center gap-4 w-full py-1';
      
      // Col 1: Attribute name
      const nameCol = document.createElement('div');
      nameCol.className = 'relative';

      if (attr.isCustom) {
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-input h-11 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 dark:border-gray-700 focus:border-[#C9A84C]';
        nameInput.value = attr.displayName;
        nameInput.placeholder = 'Tên thuộc tính...';
        nameInput.addEventListener('input', (e) => {
          attr.displayName = e.target.value;
          attr.name = slugify(e.target.value);
          context.onDraftChange?.();
        });
        nameCol.appendChild(nameInput);
      } else {
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-input h-11 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-850 text-gray-500 border border-gray-200 dark:border-gray-700 select-none';
        nameInput.value = attr.displayName;
        nameInput.readOnly = true;
        nameCol.appendChild(nameInput);
      }

      // Col 2: Attribute values input (WordPress-style visual chips)
      const valuesCol = document.createElement('div');
      valuesCol.className = 'w-full';

      const chipContainer = document.createElement('div');
      chipContainer.className = 'pf-chip-container';

      // Parse current chips
      const chips = attr.values.split(',')
        .map(v => v.trim())
        .filter(Boolean);

      // Render current chips
      chips.forEach((chipText, chipIdx) => {
        const chip = document.createElement('span');
        chip.className = 'pf-chip';
        chip.textContent = chipText;

        const removeBtn = document.createElement('span');
        removeBtn.className = 'pf-chip-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          chips.splice(chipIdx, 1);
          attr.values = chips.join(', ');
          renderAttributeInputs();
          context.onDraftChange?.();
        });

        chip.appendChild(removeBtn);
        chipContainer.appendChild(chip);
      });

      // Render input field inside the chip container
      const chipInput = document.createElement('input');
      chipInput.type = 'text';
      chipInput.className = 'pf-chip-input';
      chipInput.placeholder = chips.length === 0 ? 'Nhập giá trị và nhấn Enter hoặc dấu phẩy...' : '';
      
      // Helper function to commit input text as chips
      const commitInput = () => {
        const val = chipInput.value.trim();
        if (val) {
          const newVals = val.split(/[,，\n]/)
            .map(v => v.trim())
            .filter(v => v !== '' && !chips.includes(v));
          if (newVals.length > 0) {
            chips.push(...newVals);
            attr.values = chips.join(', ');
            renderAttributeInputs();
            // Focus the newly rendered input field
            setTimeout(() => {
              const inputs = container.querySelectorAll('.pf-chip-input');
              inputs[idx]?.focus();
            }, 10);
            context.onDraftChange?.();
          }
        }
        chipInput.value = '';
      };

      chipInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          commitInput();
        } else if (e.key === 'Backspace' && chipInput.value === '' && chips.length > 0) {
          // Backspace on empty input removes the last chip
          chips.pop();
          attr.values = chips.join(', ');
          renderAttributeInputs();
          setTimeout(() => {
            const inputs = container.querySelectorAll('.pf-chip-input');
            inputs[idx]?.focus();
          }, 10);
          context.onDraftChange?.();
        }
      });

      chipInput.addEventListener('blur', () => {
        commitInput();
      });

      chipInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        if (pastedText) {
          const newVals = pastedText.split(/[,，\n\t]/)
            .map(v => v.trim())
            .filter(v => v !== '' && !chips.includes(v));
          if (newVals.length > 0) {
            chips.push(...newVals);
            attr.values = chips.join(', ');
            renderAttributeInputs();
            setTimeout(() => {
              const inputs = container.querySelectorAll('.pf-chip-input');
              inputs[idx]?.focus();
            }, 10);
            context.onDraftChange?.();
          }
        }
      });

      chipContainer.addEventListener('click', () => {
        chipInput.focus();
      });

      chipContainer.appendChild(chipInput);
      valuesCol.appendChild(chipContainer);

      // Col 3: Delete button
      const deleteCol = document.createElement('div');
      deleteCol.className = 'flex items-center justify-center';
      
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'text-red-500 hover:text-red-700 text-lg transition-colors border-none bg-transparent cursor-pointer p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg flex items-center justify-center w-9 h-9';
      delBtn.innerHTML = '&times;';
      delBtn.title = 'Xóa thuộc tính';
      delBtn.addEventListener('click', () => {
        const hasData = attr.displayName.trim() !== '' || attr.values.trim() !== '';
        if (hasData) {
          // Use custom confirm dialog
          createConfirmDialog(
            `Bạn có chắc chắn muốn xóa thuộc tính "${attr.displayName || 'Chưa đặt tên'}"? Hành động này không làm mất các biến thể đã tạo cho đến khi bạn bấm lưu.`,
            () => {
              context.activeAttributes.splice(idx, 1);
              renderAttributeInputs();
              if (context.renderCombinationMatrix) context.renderCombinationMatrix();
              context.onDraftChange?.();
            }
          );
        } else {
          // Remove immediately if empty
          context.activeAttributes.splice(idx, 1);
          renderAttributeInputs();
          context.onDraftChange?.();
        }
      });
      deleteCol.appendChild(delBtn);

      row.appendChild(nameCol);
      row.appendChild(valuesCol);
      row.appendChild(deleteCol);
      container.appendChild(row);
    });
  }

  // 2. Dynamic filter options popover
  function updateFilterBadge() {
    let hasActiveFilters = false;
    if (context.variantFilter.search) {
      hasActiveFilters = true;
    }
    for (const attr of context.activeAttributes) {
      if (context.variantFilter[attr.name]) {
        hasActiveFilters = true;
      }
    }
    const badge = overlay.querySelector('#pf-filter-badge');
    if (badge) {
      if (hasActiveFilters) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  function populateFilterOptions() {
    const listEl = overlay.querySelector('#pf-var-filters-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    context.activeAttributes.forEach(attr => {
      const vals = [...new Set(context.currentVariants.map(v => v[attr.name]).filter(Boolean))].sort();
      if (vals.length === 0) return;

      const prevSelected = context.variantFilter[attr.name] || '';

      const wrapper = document.createElement('div');
      wrapper.className = 'space-y-1';

      const label = document.createElement('label');
      label.className = 'text-[10px] font-bold text-gray-500 uppercase block';
      label.textContent = attr.displayName;

      const select = document.createElement('select');
      select.className = 'pf-dynamic-filter w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C] bg-white';
      select.dataset.attribute = attr.name;
      select.innerHTML = `<option value="">Tất cả ${attr.displayName.toLowerCase()}</option>` +
        vals.map(val => `<option value="${val}" ${prevSelected === val ? 'selected' : ''}>${val}</option>`).join('');

      context.variantFilter[attr.name] = vals.includes(prevSelected) ? prevSelected : '';

      select.addEventListener('change', (e) => {
        context.variantFilter[attr.name] = e.target.value;
        currentPage = 1;
        updateFilterBadge();
        renderVariantRows();
      });

      wrapper.appendChild(label);
      wrapper.appendChild(select);
      listEl.appendChild(wrapper);
    });

    updateFilterBadge();
  }

  // 3. Variant List rows sorting and pagination
  function getFilteredVariants() {
    return context.currentVariants.filter((v, originalIdx) => {
      v._originalIdx = originalIdx;

      if (context.variantFilter.search) {
        const query = context.variantFilter.search.toLowerCase();
        const sku = (v.sku || '').toLowerCase();
        let matchSearch = sku.includes(query);
        if (!matchSearch) {
          matchSearch = context.activeAttributes.some(attr => {
            const val = (v[attr.name] || '').toLowerCase();
            return val.includes(query);
          });
        }
        if (!matchSearch) return false;
      }

      for (const attr of context.activeAttributes) {
        const selectedVal = context.variantFilter[attr.name];
        if (selectedVal && v[attr.name] !== selectedVal) {
          return false;
        }
      }
      return true;
    });
  }

  function updateBulkActionBar() {
    const selectAllCheckbox = overlay.querySelector('#pf-select-all-vars-checkbox');
    const bulkBar = overlay.querySelector('#pf-var-bulk-bar');
    const bulkCountLabel = overlay.querySelector('#pf-bulk-count');
    if (!selectAllCheckbox || !bulkBar || !bulkCountLabel) return;

    const filtered = getFilteredVariants();
    if (filtered.length > 0) {
      const allSelected = filtered.every(v => context.selectedVariants.has(v));
      selectAllCheckbox.checked = allSelected;
    } else {
      selectAllCheckbox.checked = false;
    }

    const count = context.selectedVariants.size;
    if (count > 0) {
      bulkBar.classList.remove('hidden');
      bulkCountLabel.textContent = count;
    } else {
      bulkBar.classList.add('hidden');
    }

    // Sync individual card checkboxes
    overlay.querySelectorAll('.pf-var-chk').forEach(chk => {
      const card = chk.closest('.pf-variant-card');
      if (!card) return;
      const idx = parseInt(card.dataset.originalIdx, 10);
      const v = context.currentVariants[idx];
      if (v) chk.checked = context.selectedVariants.has(v);
    });
  }

  function renderPagination(totalPages) {
    const pagContainer = overlay.querySelector('#pf-variants-pagination');
    if (!pagContainer) return;
    pagContainer.innerHTML = '';

    if (totalPages <= 1) {
      pagContainer.classList.add('hidden');
      return;
    }
    pagContainer.classList.remove('hidden');

    const wrap = document.createElement('div');
    wrap.className = 'flex items-center gap-1.5 justify-center';

    const button = (label, page, isActive = false, disabled = false) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
        isActive
          ? 'bg-[#C9A84C] text-white border-[#C9A84C]'
          : disabled
            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
            : 'text-gray-600 border-gray-300 hover:bg-gray-50'
      }`;
      el.textContent = label;
      el.disabled = disabled || isActive;
      if (!disabled && !isActive) {
        el.addEventListener('click', () => {
          currentPage = page;
          renderVariantRows();
        });
      }
      return el;
    };

    wrap.appendChild(button('Trước', currentPage - 1, false, currentPage <= 1));

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    
    if (start > 1) {
      wrap.appendChild(button('1', 1));
      if (start > 2) {
        const dot = document.createElement('span');
        dot.className = 'text-gray-400 px-1 text-xs select-none font-bold';
        dot.textContent = '...';
        wrap.appendChild(dot);
      }
    }

    for (let i = start; i <= end; i++) {
      wrap.appendChild(button(String(i), i, i === currentPage));
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        const dot = document.createElement('span');
        dot.className = 'text-gray-400 px-1 text-xs select-none font-bold';
        dot.textContent = '...';
        wrap.appendChild(dot);
      }
      wrap.appendChild(button(String(totalPages), totalPages));
    }

    wrap.appendChild(button('Sau', currentPage + 1, false, currentPage >= totalPages));
    pagContainer.appendChild(wrap);
  }

  // 4. Render Variant Cards (Accordion style)
  function renderVariantRows() {
    const listEl = overlay.querySelector('#pf-variants-list');
    const tableWrapper = overlay.querySelector('#pf-variants-table-wrapper');
    const placeholder = overlay.querySelector('#pf-variants-placeholder');
    if (!listEl) return;

    if (context.currentVariants.length > 0) {
      if (tableWrapper) tableWrapper.classList.remove('hidden');
      if (placeholder) placeholder.classList.add('hidden');
    } else {
      if (tableWrapper) tableWrapper.classList.add('hidden');
      if (placeholder) placeholder.classList.remove('hidden');
    }

    const filteredVariants = getFilteredVariants();
    listEl.innerHTML = '';

    if (filteredVariants.length === 0) {
      listEl.innerHTML = `<div class="py-8 text-center text-gray-400 text-xs font-semibold">Không tìm thấy biến thể nào khớp với bộ lọc.</div>`;
      updateBulkActionBar();
      renderPagination(0);
      return;
    }

    const totalPages = Math.ceil(filteredVariants.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedVariants = filteredVariants.slice(startIndex, startIndex + PAGE_SIZE);

    paginatedVariants.forEach((v) => {
      const idx = v._originalIdx;
      const isSelected = context.selectedVariants.has(v);
      const comboLabel = context.activeAttributes.map(attr => v[attr.name] || '').filter(Boolean).join(' / ');

      const displayImg = v.images && v.images[0] ? v.images[0] : (v.image_url || '/image/default-placeholder.png');
      const isVid = isVideoUrl(displayImg);
      const imgSrc = isVid ? getVideoThumbnail(displayImg) : displayImg;

      const isInStock = v.is_active !== false;
      const stockQty = v.stock_quantity ?? 0;
      const stockBadge = !isInStock
        ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400">Tắt</span>`
        : stockQty <= 0
          ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-500">Hết hàng</span>`
          : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">Còn hàng</span>`;

      const priceDisplay = v.price ? new Intl.NumberFormat('vi-VN').format(v.price) + '₫' : '—';

      const card = document.createElement('div');
      card.className = `pf-variant-card border rounded-xl overflow-hidden transition-all ${
        isSelected ? 'border-[#C9A84C] bg-amber-50/30' : 'border-gray-200 bg-white'
      }`;
      card.dataset.originalIdx = idx;

      card.innerHTML = `
        <!-- Collapsed summary row -->
        <div class="pf-card-header flex items-center gap-3 px-4 py-3 cursor-pointer select-none">
          <input type="checkbox" class="pf-var-chk w-3.5 h-3.5 rounded border-gray-200 text-[#C9A84C] focus:ring-0 accent-[#C9A84C] cursor-pointer flex-shrink-0" ${isSelected ? 'checked' : ''}>
          
          <!-- Thumbnail -->
          <button type="button" class="v-img-btn w-10 h-10 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:border-[#C9A84C] transition relative group">
            <img src="${imgSrc}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/image/default-placeholder.png';">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
          </button>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-gray-800 truncate">${comboLabel || 'Phiên bản'}</span>
              ${stockBadge}
            </div>
            <div class="flex items-center gap-3 mt-0.5 flex-wrap">
              <span class="text-[10px] text-gray-400 font-mono">${v.sku || '—'}</span>
              <span class="text-[10px] text-gray-500 font-bold">${priceDisplay}</span>
              <span class="text-[10px] text-gray-400">Tồn: ${stockQty}</span>
            </div>
          </div>

          <!-- Expand & Delete buttons -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button type="button" class="v-delete-btn p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer" title="Xóa">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
            <button type="button" class="v-expand-btn p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition border-none bg-transparent cursor-pointer" title="Mở rộng">
              <svg class="v-expand-icon transition-transform duration-200" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>

        <!-- Expanded form -->
        <div class="pf-card-body hidden border-t border-gray-100">
          <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- SKU -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mã SKU *</label>
              <input type="text" class="v-sku form-input !py-2 !text-xs font-mono" value="${v.sku || ''}" placeholder="Nhập mã SKU..." required>
            </div>
            <!-- Giá bán -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Giá bán (₫)</label>
              <input type="number" class="v-price form-input !py-2 !text-xs font-bold" value="${v.price || ''}" placeholder="0" min="0">
            </div>
            <!-- Giá gốc -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Giá gốc (₫)</label>
              <input type="number" class="v-compare-price form-input !py-2 !text-xs" value="${v.compare_at_price || ''}" placeholder="0" min="0">
            </div>
            <!-- Tồn kho -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tồn kho</label>
              <input type="number" class="v-stock form-input !py-2 !text-xs font-bold" value="${stockQty}" min="0" required>
            </div>
            <!-- Thứ tự -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Thứ tự</label>
              <input type="number" class="v-sort form-input !py-2 !text-xs text-center" value="${v.sort_order || 0}" min="0">
            </div>
            <!-- Toggles -->
            <div class="flex flex-col gap-3 justify-end">
              <label class="flex items-center justify-between cursor-pointer select-none">
                <span class="text-[10px] font-bold text-gray-600">Đang bán</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="v-active sr-only peer" ${v.is_active !== false ? 'checked' : ''}>
                  <div class="w-8 h-4 bg-zinc-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#5d58f0]"></div>
                </label>
              </label>
              <label class="flex items-center justify-between cursor-pointer select-none">
                <span class="text-[10px] font-bold text-gray-600">Đặt khi hết hàng</span>
                <input type="checkbox" class="v-allow-backorder w-3.5 h-3.5 rounded accent-[#5d58f0] cursor-pointer" ${v.allow_out_of_stock_order ? 'checked' : ''}>
              </label>
            </div>
          </div>
        </div>
      `;

      // === Event Bindings ===
      const chk = card.querySelector('.pf-var-chk');
      chk.addEventListener('change', (e) => {
        e.stopPropagation();
        if (e.target.checked) {
          context.selectedVariants.add(v);
          card.classList.add('border-[#C9A84C]', 'bg-amber-50/30');
          card.classList.remove('border-gray-200');
        } else {
          context.selectedVariants.delete(v);
          card.classList.remove('border-[#C9A84C]', 'bg-amber-50/30');
          card.classList.add('border-gray-200');
        }
        updateBulkActionBar();
      });

      // Expand/collapse card body
      const expandBtn = card.querySelector('.v-expand-btn');
      const cardBody = card.querySelector('.pf-card-body');
      const expandIcon = card.querySelector('.v-expand-icon');
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cardBody.classList.toggle('hidden');
        expandIcon.style.transform = cardBody.classList.contains('hidden') ? '' : 'rotate(180deg)';
      });

      // Image picker
      card.querySelector('.v-img-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openImagePicker(urls => {
          const arr = Array.isArray(urls) ? urls : [urls];
          const filtered = arr.filter(Boolean);
          v.images = filtered;
          v.image_url = filtered[0] || null;
          renderVariantRows();
          context.onDraftChange?.();
        }, true, v.images || []);
      });

      card.querySelector('.v-sku').addEventListener('input', (e) => {
        v.sku = e.target.value.trim();
        context.onDraftChange?.();
      });
      card.querySelector('.v-price').addEventListener('input', (e) => {
        v.price = e.target.value.trim() === '' ? '' : (parseFloat(e.target.value) || 0);
        context.onDraftChange?.();
      });
      card.querySelector('.v-compare-price').addEventListener('input', (e) => {
        v.compare_at_price = e.target.value.trim() === '' ? '' : (parseFloat(e.target.value) || 0);
        context.onDraftChange?.();
      });
      card.querySelector('.v-stock').addEventListener('input', (e) => {
        v.stock_quantity = parseInt(e.target.value) || 0;
        context.onDraftChange?.();
      });
      card.querySelector('.v-sort').addEventListener('input', (e) => {
        v.sort_order = parseInt(e.target.value) || 0;
        context.onDraftChange?.();
      });
      card.querySelector('.v-active').addEventListener('change', (e) => {
        v.is_active = e.target.checked;
        context.onDraftChange?.();
      });
      card.querySelector('.v-allow-backorder').addEventListener('change', (e) => {
        v.allow_out_of_stock_order = e.target.checked ? 1 : 0;
        context.onDraftChange?.();
      });

      // Delete
      card.querySelector('.v-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const key = (v.size || '').toLowerCase().trim() + '|' + (v.material || '').toLowerCase().trim();
        context.deletedCombinations = context.deletedCombinations || new Set();
        context.deletedCombinations.add(key);
        context.selectedVariants.delete(v);
        context.currentVariants.splice(idx, 1);
        showToast(`Đã gỡ phiên bản ${comboLabel}`, 'info');
        populateFilterOptions();
        renderVariantRows();
        context.onDraftChange?.();
      });

      listEl.appendChild(card);
    });

    updateBulkActionBar();
    renderPagination(totalPages);
  }

  // 5. Select all checkboxes header trigger
  const selectAllVarsHeaderCheckbox = overlay.querySelector('#pf-select-all-vars-checkbox');
  if (selectAllVarsHeaderCheckbox) {
    selectAllVarsHeaderCheckbox.addEventListener('change', (e) => {
      const checked = e.target.checked;
      const filtered = getFilteredVariants();
      
      filtered.forEach(v => {
        if (checked) {
          context.selectedVariants.add(v);
        } else {
          context.selectedVariants.delete(v);
        }
      });
      renderVariantRows();
    });
  }

  // Bulk Cancel Button
  const bulkClearBtn = overlay.querySelector('#pf-bulk-clear-btn');
  if (bulkClearBtn) {
    bulkClearBtn.addEventListener('click', () => {
      context.selectedVariants.clear();
      if (selectAllVarsHeaderCheckbox) selectAllVarsHeaderCheckbox.checked = false;
      renderVariantRows();
    });
  }

  // Bulk Actions implementation (Shopify style)
  const bulkSelect = overlay.querySelector('#pf-bulk-action-select');
  if (bulkSelect) {
    bulkSelect.addEventListener('change', (e) => {
      const action = e.target.value;
      if (!action || context.selectedVariants.size === 0) return;

      const selectedList = Array.from(context.selectedVariants);
      
      if (action === 'price') {
        const input = prompt(`Nhập giá bán chung cho ${selectedList.length} phiên bản đã chọn (₫):`);
        if (input !== null) {
          const numVal = parseFloat(input.replace(/\D/g, '')) || 0;
          selectedList.forEach(v => v.price = numVal);
          showToast('Đã áp dụng giá bán mới!', 'success');
        }
      } else if (action === 'compare_price') {
        const input = prompt(`Nhập giá so sánh chung cho ${selectedList.length} phiên bản đã chọn (₫):`);
        if (input !== null) {
          const numVal = parseFloat(input.replace(/\D/g, '')) || 0;
          selectedList.forEach(v => v.compare_at_price = numVal);
          showToast('Đã áp dụng giá so sánh mới!', 'success');
        }
      } else if (action === 'stock') {
        const input = prompt(`Nhập số lượng tồn kho cho ${selectedList.length} phiên bản đã chọn:`);
        if (input !== null) {
          const numVal = parseInt(input.replace(/\D/g, '')) || 0;
          selectedList.forEach(v => v.stock_quantity = numVal);
          showToast('Đã áp dụng số lượng tồn kho mới!', 'success');
        }
      } else if (action === 'sku_prefix') {
        const input = prompt(`Nhập tiền tố SKU cho ${selectedList.length} phiên bản đã chọn (ví dụ: SLY-):`);
        if (input !== null) {
          selectedList.forEach(v => {
            const currentSuffix = v.sku.replace(/^[^-]+-/, '');
            v.sku = input.trim().toUpperCase() + currentSuffix;
          });
          showToast('Đã đặt lại tiền tố SKU!', 'success');
        }
      } else if (action === 'image') {
        openImagePicker(urls => {
          const arr = Array.isArray(urls) ? urls : [urls];
          const filtered = arr.filter(Boolean);
          if (filtered.length > 0) {
            selectedList.forEach(v => {
              v.images = filtered;
              v.image_url = filtered[0] || null;
            });
            showToast('Đã đặt hình ảnh chung cho các phiên bản!', 'success');
            renderVariantRows();
            context.onDraftChange?.();
          }
        }, true, []);
      } else if (action === 'enable') {
        selectedList.forEach(v => v.is_active = true);
        showToast('Đã kích hoạt các phiên bản!', 'success');
      } else if (action === 'disable') {
        selectedList.forEach(v => v.is_active = false);
        showToast('Đã tắt các phiên bản!', 'success');
      }

      // Reset selection
      context.selectedVariants.clear();
      bulkSelect.value = '';
      renderVariantRows();
      context.onDraftChange?.();
    });
  }

  // Left Column Add Option Attribute button trigger (No prompt - adds inline immediately)
  overlay.querySelector('#pf-add-attribute-btn').addEventListener('click', () => {
    // Add a clean empty custom attribute
    context.activeAttributes.push({
      name: '',
      displayName: '',
      values: '',
      isCustom: true
    });
    renderAttributeInputs();
    
    // Focus the newly added attribute name input field
    setTimeout(() => {
      const inputs = overlay.querySelectorAll('#pf-attribute-inputs-container input[placeholder="Tên thuộc tính..."]');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
      }
    }, 50);
  });

  // Cartesian Variant Generator trigger
  overlay.querySelector('#pf-generate-variants-btn').addEventListener('click', () => {
    // Filter active attributes that have name and non-empty values
    const attributeArrays = context.activeAttributes
      .filter(attr => attr.displayName.trim() !== '' && attr.values.trim() !== '')
      .map(attr => {
        const vals = attr.values.split(',')
          .map(v => v.trim())
          .filter(Boolean);
        return {
          name: attr.name,
          displayName: attr.displayName,
          vals: vals
        };
      });

    const sizeAttr = attributeArrays.find(a => a.name === 'size');
    if (sizeAttr && sizeAttr.vals.length === 0) {
      showToast('Vui lòng nhập ít nhất một giá trị cho Kích thước', 'warning');
      return;
    }

    // Cartesian Product
    let combinations = [{}];
    attributeArrays.forEach(attr => {
      if (attr.vals.length === 0) return;
      const temp = [];
      combinations.forEach(combo => {
        attr.vals.forEach(val => {
          temp.push({
            ...combo,
            [attr.name]: val
          });
        });
      });
      combinations = temp;
    });

    if (combinations.length === 0 || Object.keys(combinations[0]).length === 0) {
      showToast('Vui lòng nhập giá trị thuộc tính để tạo biến thể', 'warning');
      return;
    }

    const nameInput = overlay.querySelector('[name="name"]');
    const slugInput = overlay.querySelector('#pf-slug');
    const slug = slugInput?.value.trim() || slugify(nameInput?.value.trim() || '') || 'sp';
    
    const newVariants = [];
    combinations.forEach(combo => {
      const comboSize = combo.size || '';
      const comboMaterial = combo.material || combo.color || '';
      
      // Universal key format combining all attribute values
      const key = attributeArrays.map(attr => (combo[attr.name] || '').toLowerCase().trim()).join('|');

      // Skip manually deleted/unticked combinations
      if (context.deletedCombinations && context.deletedCombinations.has(key)) {
        return;
      }

      // Check cache first to restore previously input price/sku/stock/images
      if (context.deletedVariantsCache && context.deletedVariantsCache[key]) {
        newVariants.push(context.deletedVariantsCache[key]);
        return;
      }

      const match = context.currentVariants.find(v => {
        return attributeArrays.every(attr => {
          const comboVal = combo[attr.name] || '';
          const varVal = v[attr.name] || '';
          return comboVal.toLowerCase().trim() === varVal.toLowerCase().trim();
        });
      });

      if (match) {
        const updated = {
          ...match,
          size: comboSize,
          color: comboMaterial,
          material: comboMaterial
        };
        Object.keys(combo).forEach(k => {
          updated[k] = combo[k];
        });
        newVariants.push(updated);
      } else {
        // Auto sku generation
        const parts = [slug];
        attributeArrays.forEach(attr => {
          const val = combo[attr.name];
          if (val) {
            parts.push(skuFriendly(val));
          }
        });
        const autoSku = parts.join('-');

        const item = {
          size: comboSize,
          color: comboMaterial,
          material: comboMaterial,
          price: '',
          compare_at_price: '',
          stock_quantity: 0,
          sku: autoSku,
          images: [],
          is_active: true,
          sort_order: 0
        };
        Object.keys(combo).forEach(k => {
          item[k] = combo[k];
        });
        newVariants.push(item);
      }
    });

    context.selectedVariants.clear();
    context.currentVariants = newVariants;
    currentPage = 1;
    
    const tableWrapper = overlay.querySelector('#pf-variants-table-wrapper');
    if (tableWrapper) {
      tableWrapper.classList.remove('hidden');
    }

    populateFilterOptions();
    renderVariantRows();
    renderCombinationMatrix();
    showToast(`Đã sinh ra ${context.currentVariants.length} biến thể!`, 'success');
    context.onDraftChange?.();
  });

  function skuFriendly(text) {
    return slugify(text).toUpperCase().replace(/[^A-Z0-9-]/g, '');
  }

  // Helper method to toggle a specific matrix cell
  function toggleCombination(comboObj, key, checked) {
    context.deletedCombinations = context.deletedCombinations || new Set();
    context.deletedVariantsCache = context.deletedVariantsCache || {};

    if (checked) {
      context.deletedCombinations.delete(key);
      const isAlreadyIn = context.currentVariants.some(v => {
        return context.activeAttributes.every(attr => {
          if (!comboObj[attr.name]) return true;
          return (v[attr.name] || '').toLowerCase().trim() === (comboObj[attr.name] || '').toLowerCase().trim();
        });
      });

      if (!isAlreadyIn) {
        if (context.deletedVariantsCache[key]) {
          context.currentVariants.push(context.deletedVariantsCache[key]);
        } else {
          // Create new variant object
          const nameInput = overlay.querySelector('[name="name"]');
          const slugInput = overlay.querySelector('#pf-slug');
          const slug = slugInput?.value.trim() || slugify(nameInput?.value.trim() || '') || 'sp';
          
          const parts = [slug];
          context.activeAttributes.forEach(attr => {
            const val = comboObj[attr.name];
            if (val) {
              parts.push(skuFriendly(val));
            }
          });
          const autoSku = parts.join('-');

          const newVar = {
            size: comboObj.size || '',
            color: comboObj.material || comboObj.color || '',
            material: comboObj.material || comboObj.color || '',
            price: '',
            compare_at_price: '',
            stock_quantity: 0,
            sku: autoSku,
            images: [],
            is_active: true,
            sort_order: 0
          };
          
          Object.keys(comboObj).forEach(k => {
            newVar[k] = comboObj[k];
          });

          context.currentVariants.push(newVar);
        }
      }
    } else {
      context.deletedCombinations.add(key);
      const matchIdx = context.currentVariants.findIndex(v => {
        return context.activeAttributes.every(attr => {
          const comboVal = comboObj[attr.name] || '';
          const varVal = v[attr.name] || '';
          return comboVal.toLowerCase().trim() === varVal.toLowerCase().trim();
        });
      });

      if (matchIdx !== -1) {
        const [removedVar] = context.currentVariants.splice(matchIdx, 1);
        context.deletedVariantsCache[key] = removedVar;
      }
    }

    renderVariantRows();
    context.onDraftChange?.();
  }

  // Render combinations matrix checkbox tree (Only for 2+ attributes)
  function renderCombinationMatrix() {
    const wrapper = overlay.querySelector('#pf-variant-matrix-wrapper');
    const container = overlay.querySelector('#pf-variant-matrix-container');
    if (!wrapper || !container) return;

    const attributeArrays = context.activeAttributes
      .filter(attr => attr.displayName.trim() !== '' && attr.values.trim() !== '')
      .map(attr => {
        const vals = attr.values.split(',')
          .map(v => v.trim())
          .filter(Boolean);
        return {
          name: attr.name,
          displayName: attr.displayName,
          vals: vals
        };
      });

    if (attributeArrays.length < 2 || context.currentVariants.length === 0) {
      wrapper.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    wrapper.classList.remove('hidden');
    container.innerHTML = '';

    const rowAttr = attributeArrays[0];
    const rowVals = rowAttr.vals;

    // Col combos is cartesian of index 1 to end
    let colCombos = [{}];
    for (let i = 1; i < attributeArrays.length; i++) {
      const attr = attributeArrays[i];
      const temp = [];
      colCombos.forEach(combo => {
        attr.vals.forEach(val => {
          temp.push({
            ...combo,
            [attr.name]: val
          });
        });
      });
      colCombos = temp;
    }

    const table = document.createElement('table');
    table.className = 'w-full border-collapse border border-gray-250 dark:border-gray-800 text-xs text-left bg-white dark:bg-[#161c32] rounded-xl overflow-hidden shadow-sm';

    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50 dark:bg-gray-800 border-b border-gray-250 dark:border-gray-800';
    const headerRow = document.createElement('tr');

    const cornerTh = document.createElement('th');
    cornerTh.className = 'p-3 font-bold text-gray-500 border-r border-gray-250 dark:border-gray-800';
    cornerTh.textContent = rowAttr.displayName;
    headerRow.appendChild(cornerTh);

    colCombos.forEach(combo => {
      const th = document.createElement('th');
      th.className = 'p-3 font-bold text-center border-r border-gray-250 dark:border-gray-800 text-gray-700 dark:text-gray-300';
      th.textContent = Object.values(combo).join(' / ');
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = 'divide-y divide-gray-200 dark:divide-gray-800';

    rowVals.forEach(rowVal => {
      const tr = document.createElement('tr');

      const rowTd = document.createElement('td');
      rowTd.className = 'p-3 font-semibold text-gray-800 dark:text-gray-200 border-r border-gray-250 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30';
      rowTd.textContent = rowVal;
      tr.appendChild(rowTd);

      colCombos.forEach(colCombo => {
        const td = document.createElement('td');
        td.className = 'p-3 text-center border-r border-gray-250 dark:border-gray-800';

        const comboObj = {
          [rowAttr.name]: rowVal,
          ...colCombo
        };

        const key = attributeArrays.map(attr => (comboObj[attr.name] || '').toLowerCase().trim()).join('|');

        const exists = context.currentVariants.some(v => {
          return attributeArrays.every(attr => {
            const comboVal = comboObj[attr.name] || '';
            const varVal = v[attr.name] || '';
            return comboVal.toLowerCase().trim() === varVal.toLowerCase().trim();
          });
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#5d58f0] focus:ring-0 accent-[#5d58f0] cursor-pointer';
        checkbox.checked = exists;

        checkbox.addEventListener('change', (e) => {
          toggleCombination(comboObj, key, e.target.checked);
        });

        td.appendChild(checkbox);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  // Bulk matrix action listeners
  const matrixSelectAll = overlay.querySelector('#pf-matrix-select-all');
  if (matrixSelectAll) {
    matrixSelectAll.addEventListener('click', () => {
      const checkboxes = overlay.querySelectorAll('#pf-variant-matrix-container input[type="checkbox"]');
      checkboxes.forEach(cb => {
        if (!cb.checked) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  const matrixDeselectAll = overlay.querySelector('#pf-matrix-deselect-all');
  if (matrixDeselectAll) {
    matrixDeselectAll.addEventListener('click', () => {
      const checkboxes = overlay.querySelectorAll('#pf-variant-matrix-container input[type="checkbox"]');
      checkboxes.forEach(cb => {
        if (cb.checked) {
          cb.checked = false;
          cb.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  const matrixReset = overlay.querySelector('#pf-matrix-reset');
  if (matrixReset) {
    matrixReset.addEventListener('click', () => {
      context.deletedCombinations = new Set();
      context.deletedVariantsCache = {};
      const generateBtn = overlay.querySelector('#pf-generate-variants-btn');
      if (generateBtn) generateBtn.click();
    });
  }

  // Bind local filter events
  const localSearch = overlay.querySelector('#pf-var-search');
  if (localSearch) {
    localSearch.addEventListener('input', (e) => {
      context.variantFilter.search = e.target.value.trim().toLowerCase();
      currentPage = 1;
      renderVariantRows();
    });
  }

  const localFilterToggle = overlay.querySelector('#pf-var-filter-toggle');
  const localFilterPopover = overlay.querySelector('#pf-var-filter-popover');
  if (localFilterToggle && localFilterPopover) {
    localFilterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      localFilterPopover.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (localFilterPopover && !e.target.closest('#pf-filter-wrapper')) {
        localFilterPopover.classList.add('hidden');
      }
    });
  }

  const clearAllLocalFilters = overlay.querySelector('#pf-clear-all-filters');
  if (clearAllLocalFilters) {
    clearAllLocalFilters.addEventListener('click', () => {
      context.variantFilter = { search: '' };
      currentPage = 1;
      updateFilterBadge();
      populateFilterOptions();
      renderVariantRows();
    });
  }

  // Bind to context
  context.renderAttributeInputs = renderAttributeInputs;
  context.populateFilterOptions = populateFilterOptions;
  context.renderVariantRows = renderVariantRows;
  context.renderCombinationMatrix = renderCombinationMatrix;

  // Initialize Matrix on setup
  setTimeout(() => {
    renderCombinationMatrix();
  }, 100);
}
