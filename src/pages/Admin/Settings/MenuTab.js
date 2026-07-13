import { showToast } from '../shared/ui.js';
import {
  categoryTree,
  loadCategoryTree,
  renderCategorySelector,
  populateTree
} from '../../../components/QuickSettings/CategorySelector.js';

export function renderMenuTab(settings) {
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
    <style>
      .category-option-selected {
        background-color: rgba(201, 168, 76, 0.1) !important;
        border-color: #C9A84C !important;
        box-shadow: 0 0 8px rgba(201, 168, 76, 0.3) !important;
        color: #C9A84C !important;
        font-weight: 700 !important;
      }
      .category-tree-container::-webkit-scrollbar { width: 4px; }
      .category-tree-container::-webkit-scrollbar-track { background: #f9f9f9; }
      .category-tree-container::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 2px; }
    </style>

    <div class="space-y-6">
      <div class="flex items-center justify-between border-b pb-3">
        <div>
          <h3 class="text-base font-bold text-gray-900">Cấu Cấu Hình Menu Điều Hướng</h3>
          <p class="text-xs text-gray-500 mt-0.5">Tùy chỉnh các liên kết xuất hiện trên thanh menu chính của trang web.</p>
        </div>
        <button id="add-menu-item" class="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Thêm Menu Chính
        </button>
      </div>

      <div class="space-y-6" id="menu-items-list">
        ${settings.navigation_menu.length === 0 
          ? `<div class="text-center py-12 text-gray-400 text-sm">Chưa có menu nào. Hãy bấm "Thêm Menu Chính".</div>` 
          : settings.navigation_menu.map((item, i) => `
            <div class="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4 relative" data-item-index="${i}">
              <!-- Main Menu Item Inputs & Actions -->
              <div class="flex flex-wrap items-center gap-4 bg-white p-3 border border-gray-200 rounded-xl shadow-sm">
                <div class="w-6 h-6 flex items-center justify-center bg-zinc-950 text-white rounded-full text-[10px] font-bold">
                  ${i + 1}
                </div>
                <div class="flex-1 min-w-[150px]">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Tên hiển thị</label>
                  <input type="text" class="menu-label w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" value="${item.label || ''}" />
                </div>
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Liên kết (URL/Href)</label>
                  ${renderCategorySelector(item, i)}
                </div>
                <div class="w-24">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Nhãn (Badge)</label>
                  <input type="text" class="menu-badge w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" value="${item.badge || ''}" placeholder="e.g. HOT, NEW" />
                </div>
                <div class="flex items-center gap-1.5 mt-3 sm:mt-0">
                  <label class="flex items-center gap-0.5 cursor-pointer select-none mr-2 shrink-0">
                    <input type="checkbox" class="menu-visible accent-[#C9A84C]" ${item.visible !== false ? 'checked' : ''} />
                    <span class="text-[9px] font-bold text-gray-500 uppercase">Hiện</span>
                  </label>
                  <button class="move-up-menu-btn p-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors cursor-pointer bg-white ${i === 0 ? 'opacity-30 cursor-not-allowed' : ''}" ${i === 0 ? 'disabled' : ''} title="Di chuyển lên">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                  </button>
                  <button class="move-down-menu-btn p-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors cursor-pointer bg-white ${i === settings.navigation_menu.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" ${i === settings.navigation_menu.length - 1 ? 'disabled' : ''} title="Di chuyển xuống">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button class="add-child-menu-btn px-2.5 py-1.5 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/5 text-xs font-semibold rounded-lg transition-colors cursor-pointer bg-white" title="Thêm menu con">
                    + Menu Con
                  </button>
                  <button class="delete-menu-btn p-1.5 border border-red-100 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer bg-white" title="Xóa menu này">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>

              <!-- Child Menu Items (Submenu) -->
              <div class="pl-8 border-l-2 border-gray-200/60 ml-3 space-y-2.5">
                ${(item.children || []).length === 0 
                  ? `<p class="text-[11px] text-gray-400 italic">Chưa có menu con nào.</p>`
                  : item.children.map((child, j) => `
                    <div class="flex items-center gap-3 bg-white p-2.5 border border-gray-100 rounded-lg shadow-sm" data-child-index="${j}">
                      <div class="flex-1">
                        <input type="text" class="child-label w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none" value="${child.label || ''}" placeholder="Tên menu con" />
                      </div>
                      <div class="flex-[1.5] min-w-[150px]">
                        ${renderCategorySelector(child, i, j)}
                      </div>
                      <div class="flex items-center gap-1">
                        <label class="flex items-center gap-0.5 cursor-pointer select-none mr-2 shrink-0">
                          <input type="checkbox" class="child-visible accent-[#C9A84C]" ${child.visible !== false ? 'checked' : ''} />
                          <span class="text-[9px] font-bold text-gray-500 uppercase">Hiện</span>
                        </label>
                        <button class="move-up-child-btn p-1 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded transition-colors cursor-pointer bg-white ${j === 0 ? 'opacity-30' : ''}" ${j === 0 ? 'disabled' : ''} title="Di chuyển lên">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                        </button>
                        <button class="move-down-child-btn p-1 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded transition-colors cursor-pointer bg-white ${j === item.children.length - 1 ? 'opacity-30' : ''}" ${j === item.children.length - 1 ? 'disabled' : ''} title="Di chuyển xuống">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                        <button class="delete-child-btn p-1 border border-red-50 hover:bg-red-50 text-red-500 rounded transition-colors cursor-pointer bg-white" title="Xóa menu con">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                        </button>
                      </div>
                    </div>
                  `).join('')
                }
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
}

export function bindMenuTab(container, settings, token, API_BASE, ctx) {
  const menuList = container.querySelector('#menu-items-list');

  // Pre-load category tree in background
  loadCategoryTree();

  // Set up popovers for both parent and child category dropdowns
  container.querySelectorAll('.category-selector-container').forEach(selectorContainer => {
    const trigger = selectorContainer.querySelector('.quick-menu-href-trigger, .quick-child-href-trigger');
    const dropdown = selectorContainer.querySelector('.category-selector-dropdown');
    const searchInput = selectorContainer.querySelector('.category-search-input');
    const customLinkBtn = selectorContainer.querySelector('.custom-link-btn');
    const confirmBtn = selectorContainer.querySelector('.confirm-selection-btn');

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
      container.querySelectorAll('.category-selector-dropdown').forEach(d => {
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
      ctx.saveSettingsDraft();
      ctx.renderUI();
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
        ctx.saveSettingsDraft();
        ctx.renderUI();
      }
    });
  });

  // Global click listener to close dropdowns when clicking outside
  const outsideClickListener = (e) => {
    if (!e.target.closest('.category-selector-container')) {
      container.querySelectorAll('.category-selector-dropdown').forEach(d => {
        d.classList.add('hidden');
      });
    }
  };
  container.addEventListener('click', outsideClickListener);

  // Bind menu item actions
  menuList?.querySelectorAll('[data-item-index]').forEach(itemRow => {
    const itemIdx = parseInt(itemRow.dataset.itemIndex, 10);
    const item = settings.navigation_menu[itemIdx];
    if (!item) return;

    // Bind inputs & checkbox
    itemRow.querySelector('.menu-label')?.addEventListener('input', (e) => {
      item.label = e.target.value.trim();
    });
    itemRow.querySelector('.menu-badge')?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) {
        item.badge = val;
      } else {
        delete item.badge;
      }
    });
    itemRow.querySelector('.menu-visible')?.addEventListener('change', (e) => {
      item.visible = e.target.checked;
    });

    // Add child menu button
    itemRow.querySelector('.add-child-menu-btn')?.addEventListener('click', () => {
      if (!item.children) item.children = [];
      item.children.push({ label: 'Menu Con Mới', href: '#' });
      showToast('Đã thêm một dòng menu con mới.', 'success');
      ctx.saveSettingsDraft();
      ctx.renderUI();
    });

    // Delete main menu item
    itemRow.querySelector('.delete-menu-btn')?.addEventListener('click', () => {
      if (confirm('Xóa menu này sẽ xóa cả các menu con bên trong. Bạn có chắc không?')) {
        settings.navigation_menu.splice(itemIdx, 1);
        showToast('Đã xóa menu chính.', 'info');
        ctx.saveSettingsDraft();
        ctx.renderUI();
      }
    });

    // Move main menu item up
    itemRow.querySelector('.move-up-menu-btn')?.addEventListener('click', () => {
      if (itemIdx === 0) return;
      const temp = settings.navigation_menu[itemIdx];
      settings.navigation_menu[itemIdx] = settings.navigation_menu[itemIdx - 1];
      settings.navigation_menu[itemIdx - 1] = temp;
      ctx.saveSettingsDraft();
      ctx.renderUI();
    });

    // Move main menu item down
    itemRow.querySelector('.move-down-menu-btn')?.addEventListener('click', () => {
      if (itemIdx === settings.navigation_menu.length - 1) return;
      const temp = settings.navigation_menu[itemIdx];
      settings.navigation_menu[itemIdx] = settings.navigation_menu[itemIdx + 1];
      settings.navigation_menu[itemIdx + 1] = temp;
      ctx.saveSettingsDraft();
      ctx.renderUI();
    });

    // Child menu items bindings
    itemRow.querySelectorAll('[data-child-index]').forEach(childRow => {
      const childIdx = parseInt(childRow.dataset.childIndex, 10);
      const child = item.children[childIdx];
      if (!child) return;

      childRow.querySelector('.child-label')?.addEventListener('input', (e) => {
        child.label = e.target.value.trim();
      });
      childRow.querySelector('.child-visible')?.addEventListener('change', (e) => {
        child.visible = e.target.checked;
      });

      // Move child item up
      childRow.querySelector('.move-up-child-btn')?.addEventListener('click', () => {
        if (childIdx === 0) return;
        const temp = item.children[childIdx];
        item.children[childIdx] = item.children[childIdx - 1];
        item.children[childIdx - 1] = temp;
        ctx.saveSettingsDraft();
        ctx.renderUI();
      });

      // Move child item down
      childRow.querySelector('.move-down-child-btn')?.addEventListener('click', () => {
        if (childIdx === item.children.length - 1) return;
        const temp = item.children[childIdx];
        item.children[childIdx] = item.children[childIdx + 1];
        item.children[childIdx + 1] = temp;
        ctx.saveSettingsDraft();
        ctx.renderUI();
      });

      // Delete child item
      childRow.querySelector('.delete-child-btn')?.addEventListener('click', () => {
        item.children.splice(childIdx, 1);
        showToast('Đã xóa menu con.', 'info');
        ctx.saveSettingsDraft();
        ctx.renderUI();
      });
    });
  });

  // Add main menu item button
  container.querySelector('#add-menu-item')?.addEventListener('click', () => {
    settings.navigation_menu.push({ label: 'Menu Mới', href: '#', children: [] });
    showToast('Đã thêm một menu chính mới.', 'success');
    ctx.saveSettingsDraft();
    ctx.renderUI();
  });
}
