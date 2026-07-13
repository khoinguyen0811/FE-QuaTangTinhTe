import { showToast } from '../../pages/Admin/shared/ui.js';
import {
  categoryTree,
  loadCategoryTree,
  renderCategorySelector,
  populateTree
} from './CategorySelector.js';

export function renderMenuForm(settings) {
  if (!settings.navigation_menu) {
    settings.navigation_menu = [];
  } else {
    settings.navigation_menu = settings.navigation_menu.filter(Boolean);
    settings.navigation_menu.forEach(item => {
      if (item && item.children) {
        item.children = item.children.filter(Boolean);
      }
    });
  }

  return `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-2.5">
        <h4 class="text-xs font-bold text-gray-900 uppercase">Cấu hình Menu chính ${settings.brand_name || 'Mắt Bão WS'}</h4>
        <button type="button" id="quick-add-menu-item" class="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 border-0 cursor-pointer">
          + Thêm Menu
        </button>
      </div>
      <div class="space-y-4" id="quick-menu-items-list">
        ${settings.navigation_menu.length === 0 
          ? `<div class="text-center py-6 text-gray-400">Chưa có menu nào.</div>` 
          : settings.navigation_menu.map((item, i) => `
            <div class="quick-menu-item-row border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-3 relative" data-item-index="${i}">
              <div class="flex flex-wrap items-center gap-2.5 bg-white p-2.5 border border-gray-100 rounded-lg shadow-sm">
                <div class="w-5 h-5 flex items-center justify-center bg-zinc-950 text-white rounded-full text-[9px] font-bold">
                  ${i + 1}
                </div>
                <div class="flex-1 min-w-[120px]">
                  <input type="text" class="quick-menu-label w-full px-2 py-1 border border-gray-300 rounded text-[11px] focus:outline-none" value="${item.label || ''}" placeholder="Tên menu" />
                </div>
                <div class="flex-[2] min-w-[180px]">
                  ${renderCategorySelector(item, i)}
                </div>
                <div class="flex items-center gap-1">
                  <label class="flex items-center gap-0.5 cursor-pointer select-none mr-1.5 shrink-0">
                    <input type="checkbox" class="quick-menu-visible accent-[#C9A84C]" ${item.visible !== false ? 'checked' : ''} />
                    <span class="text-[9px] font-bold text-gray-500 uppercase">Hiện</span>
                  </label>
                  <button type="button" class="quick-move-up-menu-btn p-1 border border-gray-200 hover:bg-gray-50 rounded bg-white cursor-pointer ${i === 0 ? 'opacity-30 cursor-not-allowed' : ''}" ${i === 0 ? 'disabled' : ''}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                  </button>
                  <button type="button" class="quick-move-down-menu-btn p-1 border border-gray-200 hover:bg-gray-50 rounded bg-white cursor-pointer ${i === settings.navigation_menu.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" ${i === settings.navigation_menu.length - 1 ? 'disabled' : ''}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button type="button" class="quick-add-child-menu-btn px-2 py-1 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/5 text-[10px] font-semibold rounded bg-white cursor-pointer">
                    + Con
                  </button>
                  <button type="button" class="quick-delete-menu-btn p-1 border border-red-50 hover:bg-red-50 text-red-500 rounded bg-white cursor-pointer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                  </button>
                </div>
              </div>
              <!-- Submenu -->
              <div class="pl-6 border-l border-gray-200/80 ml-2.5 space-y-1.5">
                ${(item.children || []).map((child, j) => `
                  <div class="quick-submenu-item-row flex items-center gap-2 bg-white p-1.5 border border-gray-100 rounded shadow-sm" data-child-index="${j}">
                    <div class="flex-1 min-w-[100px]">
                      <input type="text" class="quick-child-label w-full px-1.5 py-0.5 border border-gray-200 rounded text-[10px] focus:outline-none" value="${child.label || ''}" placeholder="Tên con" />
                    </div>
                    <div class="flex-[2] min-w-[160px]">
                      ${renderCategorySelector(child, i, j)}
                    </div>
                    <div class="flex items-center gap-1">
                      <label class="flex items-center gap-0.5 cursor-pointer select-none mr-1 shrink-0">
                        <input type="checkbox" class="quick-child-visible accent-[#C9A84C]" ${child.visible !== false ? 'checked' : ''} />
                        <span class="text-[9px] font-bold text-gray-500 uppercase">Hiện</span>
                      </label>
                      <button type="button" class="quick-move-up-child-btn p-0.5 border border-gray-200 rounded bg-white ${j === 0 ? 'opacity-30' : ''}" ${j === 0 ? 'disabled' : ''}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                      </button>
                      <button type="button" class="quick-move-down-child-btn p-0.5 border border-gray-200 rounded bg-white ${j === item.children.length - 1 ? 'opacity-30' : ''}" ${j === item.children.length - 1 ? 'disabled' : ''}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      <button type="button" class="quick-delete-child-btn p-0.5 border border-red-50 text-red-500 rounded bg-white">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
      </div>
    </div>
  `;
}

export function bindMenuEvents(modalEl, settings, renderModal) {
  const itemsList = modalEl.querySelector('#quick-menu-items-list');

  // Set up popovers for both parent and child category dropdowns
  itemsList?.querySelectorAll('.category-selector-container').forEach(container => {
    const trigger = container.querySelector('.quick-menu-href-trigger, .quick-child-href-trigger');
    const dropdown = container.querySelector('.category-selector-dropdown');
    const searchInput = container.querySelector('.category-search-input');
    const customLinkBtn = container.querySelector('.custom-link-btn');
    const confirmBtn = container.querySelector('.confirm-selection-btn');

    if (!trigger || !dropdown || !searchInput || !customLinkBtn || !confirmBtn) {
      return;
    }

    const itemIdx = parseInt(trigger.dataset.itemIndex, 10);
    const childIdx = trigger.dataset.childIndex !== undefined && trigger.dataset.childIndex !== '' 
      ? parseInt(trigger.dataset.childIndex, 10) 
      : null;
    const isChild = childIdx !== null;
    
    const menuGroup = settings.navigation_menu[itemIdx];
    if (!menuGroup) return;
    const item = isChild ? (menuGroup.children ? menuGroup.children[childIdx] : null) : menuGroup;
    if (!item) return;

    // Track temp selected values
    let tempSelected = {
      type: trigger.dataset.categoryId ? 'category' : (trigger.dataset.subcategoryId ? 'subcategory' : null),
      id: trigger.dataset.categoryId ? parseInt(trigger.dataset.categoryId, 10) : (trigger.dataset.subcategoryId ? parseInt(trigger.dataset.subcategoryId, 10) : null),
      name: '',
      slug: ''
    };

    // Open/Close dropdown
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Close all other dropdowns
      modalEl.querySelectorAll('.category-selector-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.add('hidden');
      });

      // Toggle this one
      const isHidden = dropdown.classList.contains('hidden');
      dropdown.classList.toggle('hidden');

      if (isHidden) {
        if (categoryTree.length === 0) {
          dropdown.querySelector('.category-tree-container').innerHTML = 
            `<div class="text-center py-4 text-zinc-400">Đang tải danh mục...</div>`;
          loadCategoryTree().then(() => {
            populateTree(dropdown, '', tempSelected.type === 'category' ? tempSelected.id : null, tempSelected.type === 'subcategory' ? tempSelected.id : null);
          });
        } else {
          populateTree(dropdown, '', tempSelected.type === 'category' ? tempSelected.id : null, tempSelected.type === 'subcategory' ? tempSelected.id : null);
        }
        searchInput.value = '';
        searchInput.focus();
      }
    });

    // Prevent click inside dropdown from closing it
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Search filtering
    searchInput.addEventListener('input', (e) => {
      populateTree(dropdown, e.target.value, tempSelected.type === 'category' ? tempSelected.id : null, tempSelected.type === 'subcategory' ? tempSelected.id : null);
    });

    // Click actions in tree (delegated)
    dropdown.querySelector('.category-tree-container')?.addEventListener('click', (e) => {
      const expandBtn = e.target.closest('.category-expand-btn');
      const optionItem = e.target.closest('.category-option-item');

      if (expandBtn) {
        e.stopPropagation();
        const node = expandBtn.closest('.category-tree-node');
        const subContainer = node?.querySelector('.subcategory-list-container');
        if (subContainer) {
          const isHidden = subContainer.classList.contains('hidden');
          subContainer.classList.toggle('hidden');
          expandBtn.classList.toggle('rotate-90', isHidden);
        }
      } else if (optionItem) {
        e.stopPropagation();
        
        // Highlight selection
        dropdown.querySelectorAll('.category-option-item').forEach(el => {
          el.classList.remove('category-option-selected');
          el.classList.add('text-zinc-800');
        });
        optionItem.classList.add('category-option-selected');
        optionItem.classList.remove('text-zinc-800');

        // Save temp selected state
        tempSelected.type = optionItem.dataset.type;
        tempSelected.id = parseInt(optionItem.dataset.id, 10);
        tempSelected.name = optionItem.dataset.name;
        tempSelected.slug = optionItem.dataset.slug;

        // Auto-expand parent category if parent selected
        if (tempSelected.type === 'category') {
          const node = optionItem.closest('.category-tree-node');
          const subContainer = node?.querySelector('.subcategory-list-container');
          const expBtn = node?.querySelector('.category-expand-btn');
          if (subContainer && subContainer.classList.contains('hidden')) {
            subContainer.classList.remove('hidden');
            expBtn?.classList.add('rotate-90');
          }
        }
      }
    });

    // Confirm choice
    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!tempSelected.id) {
        showToast('Vui lòng chọn một danh mục hoặc chọn Tự điền link.', 'warning');
        return;
      }

      if (tempSelected.type === 'category') {
        item.category_id = tempSelected.id;
        delete item.subcategory_id;
        item.label = tempSelected.name;
        item.href = `/products?category_slug=${tempSelected.slug}`;
      } else if (tempSelected.type === 'subcategory') {
        item.subcategory_id = tempSelected.id;
        delete item.category_id;
        item.label = tempSelected.name;
        item.href = `/products?subcategory_slug=${tempSelected.slug}`;
      }

      dropdown.classList.add('hidden');
      showToast(`Đã chọn liên kết: ${item.label}`, 'success');
      renderModal();
    });

    // Custom link entry
    customLinkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const customUrl = prompt('Nhập liên kết tùy chỉnh (ví dụ: /policies/worldwide-shipping hoặc https://...):', item.href || '');
      
      if (customUrl !== null) {
        item.href = customUrl.trim();
        delete item.category_id;
        delete item.subcategory_id;
        
        const customLabel = prompt('Nhập tên hiển thị của menu:', item.label || '');
        if (customLabel !== null && customLabel.trim() !== '') {
          item.label = customLabel.trim();
        }

        dropdown.classList.add('hidden');
        showToast(`Đã cập nhật liên kết tùy chỉnh`, 'success');
        renderModal();
      }
    });
  });

  // Global click listener to close dropdowns when clicking outside
  const outsideClickListener = (e) => {
    if (!e.target.closest('.category-selector-container')) {
      modalEl.querySelectorAll('.category-selector-dropdown').forEach(d => {
        d.classList.add('hidden');
      });
    }
  };
  modalEl.addEventListener('click', outsideClickListener);

  // Bind parent menu item actions
  itemsList?.querySelectorAll('.quick-menu-item-row').forEach(itemRow => {
    const itemIdx = parseInt(itemRow.dataset.itemIndex, 10);
    const item = settings.navigation_menu[itemIdx];
    if (!item) return;

    itemRow.querySelector('.quick-menu-label')?.addEventListener('input', (e) => {
      item.label = e.target.value.trim();
    });
    itemRow.querySelector('.quick-menu-visible')?.addEventListener('change', (e) => {
      item.visible = e.target.checked;
    });

    itemRow.querySelector('.quick-add-child-menu-btn')?.addEventListener('click', () => {
      if (!item.children) item.children = [];
      item.children.push({ label: 'Menu Con Mới', href: '#' });
      showToast('Đã thêm một menu con.', 'success');
      renderModal();
    });

    itemRow.querySelector('.quick-delete-menu-btn')?.addEventListener('click', () => {
      if (confirm('Xóa menu này sẽ xóa cả menu con?')) {
        settings.navigation_menu.splice(itemIdx, 1);
        showToast('Đã xóa menu chính.', 'info');
        renderModal();
      }
    });

    itemRow.querySelector('.quick-move-up-menu-btn')?.addEventListener('click', () => {
      if (itemIdx === 0) return;
      const temp = settings.navigation_menu[itemIdx];
      settings.navigation_menu[itemIdx] = settings.navigation_menu[itemIdx - 1];
      settings.navigation_menu[itemIdx - 1] = temp;
      renderModal();
    });

    itemRow.querySelector('.quick-move-down-menu-btn')?.addEventListener('click', () => {
      if (itemIdx === settings.navigation_menu.length - 1) return;
      const temp = settings.navigation_menu[itemIdx];
      settings.navigation_menu[itemIdx] = settings.navigation_menu[itemIdx + 1];
      settings.navigation_menu[itemIdx + 1] = temp;
      renderModal();
    });

    // Bind sub-menu item actions
    itemRow.querySelectorAll('.quick-submenu-item-row').forEach(childRow => {
      const childIdx = parseInt(childRow.dataset.childIndex, 10);
      const child = item.children[childIdx];
      if (!child) return;

      childRow.querySelector('.quick-child-label')?.addEventListener('input', (e) => {
        child.label = e.target.value.trim();
      });
      childRow.querySelector('.quick-child-visible')?.addEventListener('change', (e) => {
        child.visible = e.target.checked;
      });

      childRow.querySelector('.quick-move-up-child-btn')?.addEventListener('click', () => {
        if (childIdx === 0) return;
        const temp = item.children[childIdx];
        item.children[childIdx] = item.children[childIdx - 1];
        item.children[childIdx - 1] = temp;
        renderModal();
      });

      childRow.querySelector('.quick-move-down-child-btn')?.addEventListener('click', () => {
        if (childIdx === item.children.length - 1) return;
        const temp = item.children[childIdx];
        item.children[childIdx] = item.children[childIdx + 1];
        item.children[childIdx + 1] = temp;
        renderModal();
      });

      childRow.querySelector('.quick-delete-child-btn')?.addEventListener('click', () => {
        item.children.splice(childIdx, 1);
        showToast('Đã xóa menu con.', 'info');
        renderModal();
      });
    });
  });

  // Add main menu item action
  modalEl.querySelector('#quick-add-menu-item')?.addEventListener('click', () => {
    settings.navigation_menu.push({ label: 'Menu Mới', href: '#', children: [] });
    showToast('Đã thêm một menu chính.', 'success');
    renderModal();
  });
}
