import { API_BASE } from '../../../services/config.js';

let pickerOverlay = null;
let imagesCache = {};
let isSelectedOrClosing = false;

function cleanUrl(u) {
  if (!u || typeof u !== 'string') return '';
  let p = u.trim().split('?')[0].split('#')[0];
  const match = p.match(/^https?:\/\/[^\/]+(\/.*)/);
  if (match) p = match[1];
  return p.replace(/^\/+/, '');
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

function hasSelectedUrl(set, url) {
  if (!set || !url) return false;
  const target = cleanUrl(url);
  for (let u of set) {
    if (cleanUrl(u) === target) return true;
  }
  return false;
}

function getSelectedIndex(set, url) {
  if (!set || !url) return -1;
  const target = cleanUrl(url);
  const arr = Array.from(set);
  for (let i = 0; i < arr.length; i++) {
    if (cleanUrl(arr[i]) === target) return i;
  }
  return -1;
}

function removeSelectedUrl(set, url) {
  if (!set || !url) return;
  const target = cleanUrl(url);
  for (let u of set) {
    if (cleanUrl(u) === target) {
      set.delete(u);
    }
  }
}

function addSelectedUrl(set, url) {
  if (!set || !url) return;
  if (!hasSelectedUrl(set, url)) {
    set.add(url);
  }
}

export function openImagePicker(onSelect, isMultiple = false, initialSelected = []) {
  if (pickerOverlay) pickerOverlay.remove();
  isSelectedOrClosing = false;

  pickerOverlay = document.createElement('div');
  pickerOverlay.className = 'fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4';
  pickerOverlay.setAttribute('data-lenis-prevent', 'true');
  pickerOverlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <h3 class="text-base font-bold text-gray-900">${isMultiple ? 'Chọn nhiều hình ảnh' : 'Chọn hình ảnh'}</h3>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#b8963e] transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
            Tải ảnh lên
            <input type="file" id="ip-upload-input" accept="image/*" class="hidden" multiple>
          </label>
          <button id="ip-add-video-btn" type="button" class="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            Thêm link video
          </button>
          <button id="ip-close" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Đóng (Esc)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      
      <!-- Filter Tabs & Sort Dropdown -->
      <div class="px-6 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0 overflow-x-auto">
        <div class="flex items-center gap-2" id="ip-filter-tabs">
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C9A84C] text-white focus:outline-none transition-all tab-btn" data-type="all">Tất cả</button>
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 focus:outline-none transition-all tab-btn" data-type="sp">Sản phẩm</button>
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 focus:outline-none transition-all tab-btn" data-type="banner">Banner</button>
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 focus:outline-none transition-all tab-btn" data-type="vid">Video</button>
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 focus:outline-none transition-all tab-btn" data-type="other">Khác</button>
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 focus:outline-none transition-all tab-btn" data-type="unused">Ảnh dư</button>
        </div>
        <div class="flex items-center gap-1.5 ml-4 flex-shrink-0">
          <span class="text-xs font-medium text-gray-500">Sắp xếp:</span>
          <select id="ip-sort-select" class="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 outline-none focus:border-[#C9A84C] transition-colors cursor-pointer">
            <option value="newest" selected>Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>
      
      <div id="ip-alert" class="hidden mx-6 mt-4 p-3 rounded-lg text-sm flex-shrink-0"></div>
      
      <!-- Grid Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <div id="ip-grid" class="grid grid-cols-4 gap-3">
          <div class="col-span-4 py-10 text-center text-gray-400 text-sm">Đang tải...</div>
        </div>
      </div>

      <!-- Footer -->
      <div id="ip-footer" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50 ${isMultiple ? '' : 'hidden'}">
        <span class="text-sm font-medium text-gray-600"><span id="ip-selected-count" class="font-bold text-[#C9A84C]">0</span> hình ảnh đã chọn</span>
        <div class="flex items-center gap-2">
          <button id="ip-delete-selected" type="button" class="hidden px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Xóa đã chọn
          </button>
          <button id="ip-cancel" type="button" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Hủy</button>
          <button id="ip-confirm" type="button" class="px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-[#b8963e] transition-colors">Xác nhận</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(pickerOverlay);

  const selectedUrls = new Set();
  if (initialSelected) {
    const arr = Array.isArray(initialSelected) ? initialSelected : [initialSelected];
    arr.forEach(url => {
      if (url && typeof url === 'string' && url.trim()) {
        selectedUrls.add(url.trim());
      }
    });
  }

  // Update selected count for multiple select mode initially
  if (isMultiple) {
    const countEl = pickerOverlay.querySelector('#ip-selected-count');
    if (countEl) countEl.textContent = selectedUrls.size;
  }

  const close = () => {
    if (isSelectedOrClosing) return;
    isSelectedOrClosing = true;
    document.removeEventListener('keydown', handlePickerKeydown);
    
    const content = pickerOverlay?.querySelector('.bg-white');
    if (content) content.style.visibility = 'hidden';
    if (pickerOverlay) {
      pickerOverlay.className = 'fixed inset-0 bg-transparent z-[200] cursor-default';
    }
    
    setTimeout(() => {
      pickerOverlay?.remove();
      pickerOverlay = null;
    }, 300);
  };

  const handlePickerKeydown = (e) => {
    if (e.key === 'Escape' || e.key === 'F4') { e.preventDefault(); close(); }
  };
  document.addEventListener('keydown', handlePickerKeydown);

  pickerOverlay.querySelector('#ip-close').addEventListener('click', close);
  
  // cancel and confirm listeners are always present since footer is always rendered now
  pickerOverlay.querySelector('#ip-cancel').addEventListener('click', close);
  pickerOverlay.querySelector('#ip-confirm').addEventListener('click', () => {
    if (isSelectedOrClosing) return;
    if (isMultiple) {
      onSelect(Array.from(selectedUrls));
    } else {
      const selectedArr = Array.from(selectedUrls);
      if (selectedArr.length > 0) {
        onSelect(selectedArr[0]);
      }
    }
    close();
  });

  // Bind bulk delete button
  const deleteBtn = pickerOverlay.querySelector('#ip-delete-selected');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (isSelectedOrClosing) return;
      if (selectedUrls.size === 0) {
        alert('Vui lòng chọn ít nhất một ảnh để xóa!');
        return;
      }
      
      const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa ${selectedUrls.size} ảnh đã chọn không? Hành động này không thể hoàn tác!`);
      if (!confirmDelete) return;

      showAlert('Đang xóa các ảnh đã chọn...', 'info');

      try {
        const token = localStorage.getItem('sly_admin_auth_token');
        const filenames = Array.from(selectedUrls).map(url => {
          return url.substring(url.lastIndexOf('/') + 1);
        });

        const res = await fetch(`${API_BASE}/api/admin/images/delete-bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ filenames })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Xóa ảnh thất bại');
        }

        showAlert(data.data?.message || `Đã xóa thành công ${filenames.length} ảnh!`, 'info');
        
        // Clear selection
        selectedUrls.clear();
        
        // Clear images cache
        imagesCache = {};

        // Reload current tab (unused)
        await loadImages(onSelect, activeType, isMultiple, selectedUrls);
      } catch (err) {
        showAlert(`Lỗi: ${err.message}`);
      }
    });
  }

  pickerOverlay.addEventListener('click', (e) => {
    if (e.target === pickerOverlay) close();
  });

  pickerOverlay.querySelector('#ip-upload-input').addEventListener('change', async (e) => {
    if (isSelectedOrClosing) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    e.target.value = '';
    await uploadImages(files, onSelect, isMultiple, selectedUrls);
  });

  pickerOverlay.querySelector('#ip-add-video-btn').addEventListener('click', async () => {
    if (isSelectedOrClosing) return;
    const url = prompt('Nhập đường dẫn link video (ví dụ: link YouTube hoặc link video mp4):');
    if (!url) return;
    try {
      new URL(url);
    } catch {
      alert('Đường dẫn link không hợp lệ!');
      return;
    }
    await saveVideoLink(url, onSelect, isMultiple, selectedUrls);
  });

  // Bind tabs
  let activeType = 'all';
  const tabs = pickerOverlay.querySelectorAll('#ip-filter-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (isSelectedOrClosing) return;
      tabs.forEach(t => {
        t.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 focus:outline-none transition-all tab-btn';
      });
      tab.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C9A84C] text-white focus:outline-none transition-all tab-btn';
      activeType = tab.dataset.type;

      // Clear selection if single-select mode to prevent carry-over
      if (!isMultiple) {
        selectedUrls.clear();
      }

      loadImages(onSelect, activeType, isMultiple, selectedUrls);
    });
  });

  // Bind sorting dropdown
  const sortSelect = pickerOverlay.querySelector('#ip-sort-select');
  sortSelect.addEventListener('change', () => {
    if (isSelectedOrClosing) return;
    const activeTab = pickerOverlay.querySelector('#ip-filter-tabs .bg-\\[\\#C9A84C\\]');
    const activeType = activeTab ? activeTab.dataset.type : 'all';
    const images = imagesCache[activeType] || [];
    renderGrid(images, onSelect, isMultiple, selectedUrls, activeType);
  });

  loadImages(onSelect, activeType, isMultiple, selectedUrls);
}

function showAlert(msg, type = 'error') {
  const el = pickerOverlay?.querySelector('#ip-alert');
  if (!el) return;
  el.className = `mx-6 mt-4 p-3 rounded-lg text-sm flex-shrink-0 ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3500);
}

async function loadImages(onSelect, type = 'all', isMultiple = false, selectedUrls = null) {
  const grid = pickerOverlay?.querySelector('#ip-grid');
  if (!grid) return;

  if (imagesCache && imagesCache[type]) {
    renderGrid(imagesCache[type], onSelect, isMultiple, selectedUrls, type);
    return;
  }

  grid.innerHTML = '<div class="col-span-4 py-10 text-center text-gray-400 text-sm">Đang tải...</div>';

  try {
    const token = localStorage.getItem('sly_admin_auth_token');
    const res = await fetch(`${API_BASE}/api/admin/images?type=${type}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Authorization': `Bearer ${token}`
      },
    });
    const data = await res.json();
    const images = data.data || [];

    imagesCache = imagesCache || {};
    imagesCache[type] = images;

    renderGrid(images, onSelect, isMultiple, selectedUrls, type);
  } catch {
    if (grid) grid.innerHTML = `<div class="col-span-4 py-10 text-center text-red-400 text-sm">Lỗi tải danh sách ảnh</div>`;
  }
}

function renderGrid(images, onSelect, isMultiple, selectedUrls, type) {
  const grid = pickerOverlay?.querySelector('#ip-grid');
  if (!grid) return;

  if (!images.length) {
    grid.innerHTML = `<div class="col-span-4 py-10 text-center text-gray-400 text-sm">Chưa có ảnh nào trong mục này. Hãy tải ảnh lên bằng nút bên trên.</div>`;
    return;
  }

  // Read sorting
  const sortSelect = pickerOverlay?.querySelector('#ip-sort-select');
  const sortOrder = sortSelect ? sortSelect.value : 'newest';
  
  // Clone and sort images
  const sortedImages = [...images];
  if (sortOrder === 'oldest') {
    sortedImages.sort((a, b) => a.id - b.id); // ASC
  } else {
    sortedImages.sort((a, b) => b.id - a.id); // DESC (newest first)
  }

  // Visual updater for selections and numbers
  const updateGridSelectionVisuals = () => {
    const cards = grid.querySelectorAll('[data-url]');
    cards.forEach(card => {
      const url = card.dataset.url;
      const isSelected = hasSelectedUrl(selectedUrls, url);
      const badge = card.querySelector('.select-badge');
      
      if (isSelected) {
        card.className = 'cursor-pointer rounded-lg overflow-hidden border-2 border-[#C9A84C] ring-2 ring-[#C9A84C]/20 scale-95 transition-all group relative bg-gray-50 shadow-sm flex flex-col justify-between';
      } else {
        card.className = 'cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-[#C9A84C] transition-all group relative bg-gray-50 shadow-sm flex flex-col justify-between';
      }

      if (badge) {
        if (isSelected) {
          badge.className = 'absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm transition-all select-badge bg-[#C9A84C] border-[#C9A84C]';
          if (isMultiple || type === 'unused') {
            const index = getSelectedIndex(selectedUrls, url);
            badge.innerHTML = `<span class="text-[10px] font-bold text-white select-num">${index + 1}</span>`;
          } else {
            badge.innerHTML = `<svg class="w-3 h-3 text-white select-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>`;
          }
        } else {
          badge.className = 'absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm transition-all select-badge bg-black/30 border-white hover:bg-black/55';
          if (isMultiple || type === 'unused') {
            badge.innerHTML = '';
          } else {
            badge.innerHTML = `<svg class="w-3 h-3 text-white select-check opacity-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>`;
          }
        }
      }
    });

    const footer = pickerOverlay?.querySelector('#ip-footer');
    const deleteBtn = pickerOverlay?.querySelector('#ip-delete-selected');
    const confirmBtn = pickerOverlay?.querySelector('#ip-confirm');
    const countEl = pickerOverlay?.querySelector('#ip-selected-count');
    
    const count = selectedUrls ? selectedUrls.size : 0;
    if (countEl) countEl.textContent = count;

    if (footer) {
      if (isMultiple || type === 'unused') {
        footer.classList.remove('hidden');
      } else {
        footer.classList.add('hidden');
      }
    }

    if (deleteBtn) {
      if (type === 'unused' && count > 0) {
        deleteBtn.classList.remove('hidden');
      } else {
        deleteBtn.classList.add('hidden');
      }
    }

    if (confirmBtn) {
      if (!isMultiple && type === 'unused' && count !== 1) {
        confirmBtn.disabled = true;
        confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }
  };

  grid.innerHTML = '';
  sortedImages.forEach(img => {
    const isSelected = hasSelectedUrl(selectedUrls, img.url);
    const div = document.createElement('div');
    div.setAttribute('data-url', img.url);
    
    let borderClass = 'border-transparent';
    if (isSelected) {
      borderClass = 'border-[#C9A84C] ring-2 ring-[#C9A84C]/20 scale-95';
    }

    div.className = `cursor-pointer rounded-lg overflow-hidden border-2 transition-all group relative bg-gray-50 shadow-sm flex flex-col justify-between ${borderClass}`;
    
    // Determine type label and class
    let badgeText = 'Khác';
    let badgeClass = 'bg-gray-100 text-gray-600';
    if (img.type === 'sp') {
      badgeText = 'Sản phẩm';
      badgeClass = 'bg-blue-100 text-blue-700';
    } else if (img.type === 'banner') {
      badgeText = 'Banner';
      badgeClass = 'bg-purple-100 text-purple-700';
    } else if (img.type === 'unused') {
      badgeText = 'Ảnh dư';
      badgeClass = 'bg-red-100 text-red-700';
    } else if (img.type === 'vid') {
      badgeText = 'Video';
      badgeClass = 'bg-green-100 text-green-700';
    }

    let selectIndexText = '';
    if ((isMultiple || type === 'unused') && isSelected && selectedUrls) {
      const index = getSelectedIndex(selectedUrls, img.url);
      if (index !== -1) {
        selectIndexText = (index + 1).toString();
      }
    }

    const isVideo = img.type === 'vid';
    const thumbnailUrl = isVideo ? getVideoThumbnail(img.url) : img.url;

    div.innerHTML = `
      <div class="relative w-full h-24 overflow-hidden bg-gray-100">
        <img src="${thumbnailUrl}" alt="${img.filename}" class="w-full h-full object-cover" onerror="this.src='/image/default-placeholder.png'">
        ${isVideo ? `
          <div class="absolute inset-0 flex items-center justify-center bg-black/35">
            <div class="bg-white/90 rounded-full p-2 shadow-md border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-4 h-4 text-[#C9A84C] ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        ` : ''}
        <span class="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold rounded-full shadow-sm ${badgeClass}">${badgeText}</span>
        
        <!-- Checkbox / check mark top right -->
        ${isMultiple || type === 'unused' || isSelected ? `
          <div class="absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm transition-all select-badge ${isSelected ? 'bg-[#C9A84C] border-[#C9A84C]' : 'bg-black/30 border-white hover:bg-black/55'}">
            ${(isMultiple || type === 'unused') && isSelected ? `
              <span class="text-[10px] font-bold text-white select-num">${selectIndexText}</span>
            ` : `
              <svg class="w-3 h-3 text-white transition-opacity select-check ${isSelected ? 'opacity-100' : 'opacity-0'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>
            `}
          </div>
        ` : `
          <!-- Single Select Hover Overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <div class="bg-white/90 rounded-full p-1.5 shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        `}
      </div>
      <p class="text-xs text-gray-500 truncate px-2 py-1 bg-white border-t border-gray-50">${img.filename}</p>
    `;

    div.addEventListener('click', () => {
      if (isSelectedOrClosing) return;

      if ((isMultiple || type === 'unused') && selectedUrls) {
        if (hasSelectedUrl(selectedUrls, img.url)) {
          removeSelectedUrl(selectedUrls, img.url);
        } else {
          addSelectedUrl(selectedUrls, img.url);
        }
        updateGridSelectionVisuals();
      } else {
        onSelect(img.url);
        
        // Fast single select close pattern with block
        isSelectedOrClosing = true;
        const content = pickerOverlay?.querySelector('.bg-white');
        if (content) content.style.visibility = 'hidden';
        if (pickerOverlay) {
          pickerOverlay.className = 'fixed inset-0 bg-transparent z-[200] cursor-default';
        }
        setTimeout(() => {
          pickerOverlay?.remove();
          pickerOverlay = null;
        }, 300);
      }
    });

    grid.appendChild(div);
  });
}

async function uploadImages(files, onSelect, isMultiple = false, selectedUrls = null) {
  if (isSelectedOrClosing) return;
  const total = files.length;
  if (total === 0) return;

  showAlert(`Đang tải lên 1/${total}...`, 'info');

  const token = localStorage.getItem('sly_admin_auth_token');
  let successCount = 0;
  let failedCount = 0;
  let lastError = null;

  // Clear cache since we are uploading new images
  imagesCache = {};

  for (let i = 0; i < total; i++) {
    if (i > 0) {
      showAlert(`Đang tải lên ${i + 1}/${total}...`, 'info');
    }
    const file = files[i];
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'unused'); // Tell backend to categorize as unused

      const res = await fetch(`${API_BASE}/api/admin/images/upload`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-Authorization': `Bearer ${token}`
        },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload thất bại');
      }
      successCount++;
    } catch (err) {
      failedCount++;
      lastError = err.message;
    }
  }

  if (successCount > 0) {
    if (failedCount > 0) {
      showAlert(`Đã tải lên ${successCount} ảnh, thất bại ${failedCount} ảnh.`, 'error');
    } else {
      showAlert(`Đã tải lên thành công ${successCount} ảnh!`, 'info');
    }

    // Switch to "unused" (Ảnh dư) tab
    const tabs = pickerOverlay?.querySelectorAll('#ip-filter-tabs .tab-btn');
    if (tabs) {
      tabs.forEach(t => {
        if (t.dataset.type === 'unused') {
          t.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C9A84C] text-white focus:outline-none transition-all tab-btn';
        } else {
          t.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 focus:outline-none transition-all tab-btn';
        }
      });
    }

    // Reload the grid under 'unused' tab
    await loadImages(onSelect, 'unused', isMultiple, selectedUrls);
  } else {
    showAlert(`Lỗi tải lên: ${lastError || 'Không xác định'}`);
  }
}

async function saveVideoLink(url, onSelect, isMultiple = false, selectedUrls = null) {
  if (isSelectedOrClosing) return;
  showAlert('Đang lưu link video...', 'info');

  try {
    const token = localStorage.getItem('sly_admin_auth_token');
    
    const res = await fetch(`${API_BASE}/api/admin/images/link`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url, type: 'vid' }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) throw new Error(data.error || 'Lưu link thất bại');

    // Clear cache because a new image/video has been added
    imagesCache = {};

    showAlert('Đã lưu link video thành công!', 'info');

    // Switch to "vid" (Video) tab
    const tabs = pickerOverlay?.querySelectorAll('#ip-filter-tabs .tab-btn');
    if (tabs) {
      tabs.forEach(t => {
        if (t.dataset.type === 'vid') {
          t.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C9A84C] text-white focus:outline-none transition-all tab-btn';
        } else {
          t.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 focus:outline-none transition-all tab-btn';
        }
      });
    }

    await loadImages(onSelect, 'vid', isMultiple, selectedUrls);

  } catch (err) {
    showAlert(`Lỗi: ${err.message}`);
  }
}
