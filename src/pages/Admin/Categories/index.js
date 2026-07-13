import { getCategories, deleteCategory, deleteSubCategory, updateCategory, updateSubCategory } from '../../../services/adminService.js';
import { createConfirmDialog, showToast, createPagination } from '../shared/ui.js';
import { openCategoryForm } from './CategoryForm.js';
import { openProductSortModal, getMidpoint } from './ProductSortModal.js';

const PAGE_SIZE = 50;

const SKELETON_ROWS = Array(4).fill(0).map(() => `
  <tr>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-28"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-24"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-20"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-8"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-5 w-16 rounded-full"></div></td>
    <td class="px-4 py-4 text-right"><div class="skeleton-shimmer h-8 w-16 ml-auto rounded-lg"></div></td>
  </tr>
`).join('');

let state = { page: 1, sortDir: {}, data: [], searchQuery: '' };

export function renderCategories(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Danh Mục</h2>
          <p class="text-sm text-gray-500 mt-0.5">Quản lý cây danh mục sản phẩm</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <input id="cat-search-input" type="text" placeholder="Tìm kiếm danh mục..." 
              class="w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] bg-white text-gray-700 placeholder-gray-400" />
            <span class="absolute left-3 top-2.5 text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
          </div>
          <button id="cat-add-btn" class="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-[#b8963e]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm danh mục
          </button>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-800 sort-th" data-col="name">
                  <span class="flex items-center gap-1">Tên <span class="sort-icon text-gray-300">⇅</span></span>
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Danh mục cha</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-800 sort-th" data-col="count">
                  <span class="flex items-center gap-1">Sản phẩm <span class="sort-icon text-gray-300">⇅</span></span>
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody id="cat-tbody" class="divide-y divide-gray-50">
              ${SKELETON_ROWS}
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-100" id="cat-pagination"></div>
      </div>
    </div>
  `;

  container.querySelector('#cat-add-btn').addEventListener('click', () => {
    openCategoryForm(null, () => loadCategories(container));
  });

  const searchInput = container.querySelector('#cat-search-input');
  searchInput.addEventListener('input', () => {
    state.searchQuery = searchInput.value;
    state.page = 1;
    renderRows(container);
    renderPageNav(container);
  });

  container.querySelectorAll('.sort-th').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      const current = state.sortDir[col];
      state.sortDir = {};
      if (!current)            state.sortDir[col] = 'asc';
      else if (current === 'asc') state.sortDir[col] = 'desc';
      state.page = 1;
      updateSortIcons(container);
      renderRows(container);
      renderPageNav(container);
    });
  });

  const closeAllDropdowns = () => {
    container.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
  };
  document.addEventListener('click', closeAllDropdowns);
  window.adminCleanups = window.adminCleanups || [];
  window.adminCleanups.push(() => {
    document.removeEventListener('click', closeAllDropdowns);
  });

  loadCategories(container);
}

function updateSortIcons(container) {
  container.querySelectorAll('.sort-th').forEach(th => {
    const dir = state.sortDir[th.dataset.col];
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    if (dir === 'asc')       { icon.textContent = '↑'; icon.className = 'sort-icon text-[#C9A84C]'; }
    else if (dir === 'desc') { icon.textContent = '↓'; icon.className = 'sort-icon text-[#C9A84C]'; }
    else                     { icon.textContent = '⇅'; icon.className = 'sort-icon text-gray-300'; }
  });
}

function getSorted(data) {
  const [col, dir] = Object.entries(state.sortDir).find(([, v]) => v) || [];
  if (!col) return data;
  const factor = dir === 'asc' ? 1 : -1;
  return [...data].sort((a, b) => {
    let va, vb;
    if (col === 'name')  { va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase(); return va.localeCompare(vb) * factor; }
    if (col === 'count') { va = Number(a.products_count ?? 0); vb = Number(b.products_count ?? 0); return (va - vb) * factor; }
    return 0;
  });
}

function getFilteredData(data) {
  const query = (state.searchQuery || '').toLowerCase().trim();
  if (!query) return data;

  return data.map(parent => {
    const parentMatches = parent.name.toLowerCase().includes(query) || (parent.slug && parent.slug.toLowerCase().includes(query));
    const matchingChildren = (parent.children || []).filter(child => 
      child.name.toLowerCase().includes(query) || (child.slug && child.slug.toLowerCase().includes(query))
    );
    if (parentMatches || matchingChildren.length > 0) {
      return {
        ...parent,
        children: matchingChildren
      };
    }
    return null;
  }).filter(Boolean);
}

function getHierarchicalSorted(data) {
  const filtered = getFilteredData(data);
  const sortedParents = getSorted(filtered);
  const result = [];

  sortedParents.forEach(p => {
    result.push(p);
    const subcats = p.children || [];
    const sortedSubs = [...subcats].sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return String(a.sort_order || '').localeCompare(String(b.sort_order || ''));
      }
      return a.id - b.id;
    });
    
    sortedSubs.forEach((sub, subIdx) => {
      const isLast = subIdx === sortedSubs.length - 1;
      sub.parent_id = p.id;
      sub.treePrefix = isLast ? '└─' : '├─';
      result.push(sub);
    });
  });

  return result;
}

async function loadCategories(container) {
  const tbody = container.querySelector('#cat-tbody');
  if (!tbody) return;
  tbody.innerHTML = SKELETON_ROWS;
  try {
    const res = await getCategories({ tree: true });
    const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
    state.data = list;
    renderRows(container);
    renderPageNav(container);
  } catch {
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-red-400 text-sm">Lỗi tải danh mục</td></tr>`;
  }
}

function renderRows(container) {
  const tbody = container.querySelector('#cat-tbody');
  const sorted = getHierarchicalSorted(state.data);
  const catMap = {};
  state.data.forEach(item => { catMap[item.id] = item; });

  if (!sorted.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-gray-400 text-sm">Chưa có danh mục nào</td></tr>`;
    return;
  }

  const start = (state.page - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);
  tbody.innerHTML = '';

  const hasChildren = (parent) => {
    return parent.children && parent.children.length > 0;
  };

  const isSearchActive = !!(state.searchQuery || '').trim();

  rows.forEach((cat) => {
    const tr = document.createElement('tr');
    const isChild = !!cat.parent_id;
    
    const rowBg = isChild ? 'bg-zinc-50/40 hover:bg-zinc-100/30' : 'bg-white hover:bg-gray-50';
    tr.className = `${rowBg} transition-colors`;
    
    if (isChild) {
      tr.className += ` cat-child-row-of-${cat.parent_id}`;
      if (!isSearchActive) {
        tr.className += ' hidden';
      }
    }

    const prefix = cat.treePrefix 
      ? `<span class="text-gray-300 font-mono mr-1.5">${cat.treePrefix}</span>`
      : '';
    
    const nameClass = isChild 
      ? 'text-gray-600 font-medium text-xs' 
      : 'text-gray-900 font-bold text-sm';

    const indentClass = isChild ? 'pl-8' : 'pl-4';

    let toggleBtn = '';
    if (!isChild && hasChildren(cat)) {
      const rotateClass = isSearchActive ? 'rotate-90' : '';
      toggleBtn = `
        <button type="button" class="cat-toggle-expand-btn w-5 h-5 flex items-center justify-center text-[9px] text-zinc-400 hover:text-black rounded hover:bg-zinc-100 bg-transparent border-0 cursor-pointer select-none transition-transform duration-200 ${rotateClass}" data-cat-id="${cat.id}">
          ▶
        </button>
      `;
    } else if (!isChild) {
      toggleBtn = '<div class="w-5"></div>';
    }

    let isFirst = false;
    let isLast = false;

    if (!isChild) {
      const parentIdx = state.data.findIndex(p => p.id === cat.id);
      if (parentIdx !== -1) {
        isFirst = parentIdx === 0;
        isLast = parentIdx === state.data.length - 1;
      }
    } else {
      const parentCat = state.data.find(p => p.id === cat.parent_id);
      if (parentCat && parentCat.children) {
        const sortedChildren = [...parentCat.children].sort((a, b) => {
          if (a.sort_order !== b.sort_order) {
            return String(a.sort_order || '').localeCompare(String(b.sort_order || ''));
          }
          return a.id - b.id;
        });
        const subIdx = sortedChildren.findIndex(s => s.id === cat.id);
        if (subIdx !== -1) {
          isFirst = subIdx === 0;
          isLast = subIdx === sortedChildren.length - 1;
        }
      }
    }

    const actionsHtml = `
      <div class="inline-block text-left dropdown-wrapper relative">
        <button class="dropdown-trigger p-1.5 text-gray-500 hover:bg-gray-150 rounded-lg hover:text-gray-800 transition border-none bg-transparent cursor-pointer" title="Thao tác">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
        <div class="dropdown-menu hidden absolute right-0 top-7 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 font-medium text-left">
          ${isSearchActive || Object.keys(state.sortDir).length > 0 ? '' : `
            <button class="move-up-btn w-full text-left px-3 py-1.5 text-zinc-650 hover:bg-zinc-50 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer disabled:opacity-25" ${isFirst ? 'disabled' : ''}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
              Lên
            </button>
            <button class="move-down-btn w-full text-left px-3 py-1.5 text-zinc-650 hover:bg-zinc-50 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer disabled:opacity-25" ${isLast ? 'disabled' : ''}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              Xuống
            </button>
          `}
          <button class="sort-prod-btn w-full text-left px-3 py-1.5 text-amber-600 hover:bg-amber-50 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Sắp xếp sản phẩm
          </button>
          <button class="edit-btn w-full text-left px-3 py-1.5 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Sửa
          </button>
          <button class="del-btn w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Xóa
          </button>
        </div>
      </div>
    `;

    tr.innerHTML = `
      <td class="px-4 py-3 font-medium">
        <div class="flex items-center gap-1.5 ${indentClass}">
          ${toggleBtn}
          ${prefix}
          <span class="${nameClass}">${cat.name}</span>
        </div>
      </td>
      <td class="px-4 py-3 text-gray-500 font-mono text-xs">${cat.slug || '-'}</td>
      <td class="px-4 py-3 text-gray-600 text-xs">
        ${isChild && catMap[cat.parent_id] ? `
          <div class="flex items-center gap-1">
            <span class="font-semibold text-gray-800 text-[11px]">${catMap[cat.parent_id].name}</span>
          </div>
        ` : '<span class="text-gray-400">-</span>'}
      </td>
      <td class="px-4 py-3 text-gray-600 font-semibold">${cat.products_count ?? 0}</td>
      <td class="px-4 py-3">
        <button class="status-toggle-btn px-2 py-0.5 text-xs rounded-full font-medium transition cursor-pointer select-none border-0 ${cat.is_active !== false && Number(cat.is_active) !== 0 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}" title="Nhấn để đổi trạng thái">
          ${cat.is_active !== false && Number(cat.is_active) !== 0 ? 'Hoạt động' : 'Ẩn'}
        </button>
      </td>
      <td class="px-4 py-3 text-right">
        ${actionsHtml}
      </td>
    `;

    const trigger = tr.querySelector('.dropdown-trigger');
    const menu = tr.querySelector('.dropdown-menu');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      container.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.add('hidden');
      });
      menu.classList.toggle('hidden');
    });

    tr.querySelector('.move-up-btn')?.addEventListener('click', async () => {
      let siblings = [];
      let currentIdx = -1;
      if (!isChild) {
        siblings = [...state.data];
        currentIdx = siblings.findIndex(p => p.id === cat.id);
      } else {
        const parentCat = state.data.find(p => p.id === cat.parent_id);
        if (parentCat && parentCat.children) {
          siblings = [...parentCat.children].sort((a, b) => {
            if (a.sort_order !== b.sort_order) {
              return String(a.sort_order || '').localeCompare(String(b.sort_order || ''));
            }
            return a.id - b.id;
          });
          currentIdx = siblings.findIndex(s => s.id === cat.id);
        }
      }

      if (currentIdx > 0) {
        let prevKey = '';
        let nextKey = '';
        if (currentIdx - 1 === 0) {
          nextKey = siblings[0].sort_order;
        } else {
          prevKey = siblings[currentIdx - 2].sort_order;
          nextKey = siblings[currentIdx - 1].sort_order;
        }
        const newSortOrder = getMidpoint(prevKey, nextKey);
        
        try {
          if (isChild) {
            await updateSubCategory(cat.id, { sort_order: newSortOrder });
          } else {
            await updateCategory(cat.id, { sort_order: newSortOrder });
          }
          showToast('Đã di chuyển danh mục');
          loadCategories(container);
        } catch (error) {
          showToast(error.message || 'Lỗi sắp xếp', 'error');
        }
      }
    });

    tr.querySelector('.move-down-btn')?.addEventListener('click', async () => {
      let siblings = [];
      let currentIdx = -1;
      if (!isChild) {
        siblings = [...state.data];
        currentIdx = siblings.findIndex(p => p.id === cat.id);
      } else {
        const parentCat = state.data.find(p => p.id === cat.parent_id);
        if (parentCat && parentCat.children) {
          siblings = [...parentCat.children].sort((a, b) => {
            if (a.sort_order !== b.sort_order) {
              return String(a.sort_order || '').localeCompare(String(b.sort_order || ''));
            }
            return a.id - b.id;
          });
          currentIdx = siblings.findIndex(s => s.id === cat.id);
        }
      }

      if (currentIdx !== -1 && currentIdx < siblings.length - 1) {
        let prevKey = '';
        let nextKey = '';
        if (currentIdx + 1 === siblings.length - 1) {
          prevKey = siblings[siblings.length - 1].sort_order;
        } else {
          prevKey = siblings[currentIdx + 1].sort_order;
          nextKey = siblings[currentIdx + 2].sort_order;
        }
        const newSortOrder = getMidpoint(prevKey, nextKey);

        try {
          if (isChild) {
            await updateSubCategory(cat.id, { sort_order: newSortOrder });
          } else {
            await updateCategory(cat.id, { sort_order: newSortOrder });
          }
          showToast('Đã di chuyển danh mục');
          loadCategories(container);
        } catch (error) {
          showToast(error.message || 'Lỗi sắp xếp', 'error');
        }
      }
    });

    tr.querySelector('.status-toggle-btn')?.addEventListener('click', async () => {
      const currentStatus = cat.is_active !== false && Number(cat.is_active) !== 0;
      const newStatus = !currentStatus;
      try {
        if (isChild) {
          await updateSubCategory(cat.id, { is_active: newStatus ? 1 : 0 });
        } else {
          await updateCategory(cat.id, { is_active: newStatus ? 1 : 0 });
        }
        showToast('Đã cập nhật trạng thái');
        loadCategories(container);
      } catch (error) {
        showToast(error.message || 'Lỗi cập nhật trạng thái', 'error');
      }
    });

    tr.querySelector('.sort-prod-btn')?.addEventListener('click', () => openProductSortModal(cat, () => loadCategories(container)));
    tr.querySelector('.edit-btn')?.addEventListener('click', () => openCategoryForm(cat, () => loadCategories(container)));
    tr.querySelector('.del-btn')?.addEventListener('click', () => {
      const typeLabel = isChild ? 'danh mục con' : 'danh mục';
      createConfirmDialog(`Xóa ${typeLabel} "${cat.name}"?`, async () => {
        try {
          if (isChild) {
            await deleteSubCategory(cat.id);
          } else {
            await deleteCategory(cat.id);
          }
          showToast('Đã xóa');
          loadCategories(container);
        } catch (error) {
          showToast(error.message, 'error');
        }
      });
    });

    const expandBtn = tr.querySelector('.cat-toggle-expand-btn');
    expandBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const catId = expandBtn.dataset.catId;
      const isExpanded = expandBtn.classList.contains('rotate-90');
      
      expandBtn.classList.toggle('rotate-90');
      
      tbody.querySelectorAll(`.cat-child-row-of-${catId}`).forEach(childRow => {
        if (isExpanded) {
          childRow.classList.add('hidden');
        } else {
          childRow.classList.remove('hidden');
        }
      });
    });

    tbody.appendChild(tr);
  });
}

function renderPageNav(container) {
  const wrap = container.querySelector('#cat-pagination');
  wrap.innerHTML = '';
  const totalPages = Math.ceil(state.data.length / PAGE_SIZE);
  if (totalPages <= 1) return;
  wrap.appendChild(createPagination(state.page, totalPages, (page) => {
    state.page = page;
    renderRows(container);
    renderPageNav(container);
  }));
}
