import { getFlashSales, deleteFlashSale, bulkDeleteFlashSales, bulkToggleFlashSales, updateFlashSale, updateFlashSaleCampaign } from '../../../services/adminService.js';
import { showToast, createPagination } from '../shared/ui.js';
import { formatInputWithSelection } from './CurrencyInput.js';
import { state } from './FlashSalesState.js';
import { renderProductList } from './ProductSelector.js';

export async function loadFlashSalesList(container) {
  const tbody = container.querySelector('#flash-tbody');
  const paginationContainer = container.querySelector('#flash-pagination');
  const totalBadge = container.querySelector('#fs-campaigns-total-badge');

  try {
    const res = await getFlashSales();
    state.listData = res.data || [];
    
    // Bind search and filter events once if they haven't been bound yet
    const searchInput = container.querySelector('#fs-list-search');
    const statusSelect = container.querySelector('#fs-list-status');
    const filterToggleBtn = container.querySelector('#fs-list-filter-toggle');
    const filterPopover = container.querySelector('#fs-list-filter-popover');
    const clearFiltersBtn = container.querySelector('#fs-list-clear-all-filters');

    if (filterToggleBtn && filterPopover && !filterToggleBtn.dataset.bound) {
      filterToggleBtn.dataset.bound = "true";
      filterToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterPopover.classList.toggle('hidden');
      });

      const closeFilterPopover = (e) => {
        if (filterPopover && !e.target.closest('#fs-list-filter-wrapper')) {
          filterPopover.classList.add('hidden');
        }
      };
      document.addEventListener('click', closeFilterPopover);

      window.adminCleanups = window.adminCleanups || [];
      window.adminCleanups.push(() => {
        document.removeEventListener('click', closeFilterPopover);
      });

      filterPopover.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    const syncFilterBadge = () => {
      const badge = container.querySelector('#fs-list-filter-badge');
      if (badge) {
        if (state.fsStatusFilter !== 'all') {
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }
    };

    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "true";
      searchInput.addEventListener('input', (e) => {
        state.fsSearchQuery = e.target.value.trim().toLowerCase();
        state.fsPage = 1;
        renderFilteredList();
      });
    }

    if (statusSelect && !statusSelect.dataset.bound) {
      statusSelect.dataset.bound = "true";
      statusSelect.addEventListener('change', (e) => {
        state.fsStatusFilter = e.target.value;
        state.fsPage = 1;
        syncFilterBadge();
        renderFilteredList();
      });
    }

    if (clearFiltersBtn && !clearFiltersBtn.dataset.bound) {
      clearFiltersBtn.dataset.bound = "true";
      clearFiltersBtn.addEventListener('click', () => {
        state.fsStatusFilter = 'all';
        state.fsPage = 1;
        if (statusSelect) statusSelect.value = 'all';
        syncFilterBadge();
        renderFilteredList();
      });
    }

    // Select all campaigns checkbox
    const selectAllCampaignsChk = container.querySelector('#fs-select-all-campaigns');
    if (selectAllCampaignsChk && !selectAllCampaignsChk.dataset.bound) {
      selectAllCampaignsChk.dataset.bound = "true";
      selectAllCampaignsChk.addEventListener('change', (e) => {
        const checked = e.target.checked;
        const currentFiltered = getFilteredCampaigns();
        
        currentFiltered.forEach(campaign => {
          const key = `${campaign.campaign_name}||${campaign.start_time}||${campaign.end_time}`;
          if (checked) {
            state.selectedFlashSales.add(key);
          } else {
            state.selectedFlashSales.delete(key);
          }
        });
        updateBulkActionsPanel();
        
        const limit = 10;
        const startIdx = (state.fsPage - 1) * limit;
        const paginatedItems = currentFiltered.slice(startIdx, startIdx + limit);
        renderTableRows(paginatedItems);
      });
    }

    // Bulk buttons event handlers
    const enableBtn = container.querySelector('#fs-bulk-enable-btn');
    const disableBtn = container.querySelector('#fs-bulk-disable-btn');
    const deleteBtn = container.querySelector('#fs-bulk-delete-btn');

    if (enableBtn && !enableBtn.dataset.bound) {
      enableBtn.dataset.bound = "true";
      enableBtn.addEventListener('click', async () => {
        const keys = Array.from(state.selectedFlashSales);
        if (keys.length === 0) return;
        
        const ids = [];
        state.listData.forEach(item => {
          const key = `${item.campaign_name || 'Không có tên'}||${item.start_time}||${item.end_time}`;
          if (keys.includes(key)) {
            ids.push(item.id);
          }
        });

        if (ids.length === 0) return;
        enableBtn.disabled = true;
        try {
          await bulkToggleFlashSales(ids, 1);
          showToast(`Đã bật ${keys.length} chiến dịch Flash Sale thành công!`);
          state.selectedFlashSales.clear();
          loadFlashSalesList(container);
        } catch (err) {
          showToast(err.message || 'Lỗi bật chiến dịch', 'error');
        } finally {
          enableBtn.disabled = false;
        }
      });
    }

    if (disableBtn && !disableBtn.dataset.bound) {
      disableBtn.dataset.bound = "true";
      disableBtn.addEventListener('click', async () => {
        const keys = Array.from(state.selectedFlashSales);
        if (keys.length === 0) return;

        const ids = [];
        state.listData.forEach(item => {
          const key = `${item.campaign_name || 'Không có tên'}||${item.start_time}||${item.end_time}`;
          if (keys.includes(key)) {
            ids.push(item.id);
          }
        });

        if (ids.length === 0) return;
        disableBtn.disabled = true;
        try {
          await bulkToggleFlashSales(ids, 0);
          showToast(`Đã tắt ${keys.length} chiến dịch Flash Sale thành công!`);
          state.selectedFlashSales.clear();
          loadFlashSalesList(container);
        } catch (err) {
          showToast(err.message || 'Lỗi tắt chiến dịch', 'error');
        } finally {
          disableBtn.disabled = false;
        }
      });
    }

    if (deleteBtn && !deleteBtn.dataset.bound) {
      deleteBtn.dataset.bound = "true";
      deleteBtn.addEventListener('click', async () => {
        const keys = Array.from(state.selectedFlashSales);
        if (keys.length === 0) return;
        if (!confirm(`Bạn có chắc chắn muốn xóa ${keys.length} chiến dịch đã chọn?`)) return;
        
        const ids = [];
        state.listData.forEach(item => {
          const key = `${item.campaign_name || 'Không có tên'}||${item.start_time}||${item.end_time}`;
          if (keys.includes(key)) {
            ids.push(item.id);
          }
        });

        if (ids.length === 0) return;
        deleteBtn.disabled = true;
        try {
          await bulkDeleteFlashSales(ids);
          showToast(`Đã xóa ${keys.length} chiến dịch Flash Sale thành công!`);
          state.selectedFlashSales.clear();
          loadFlashSalesList(container);
        } catch (err) {
          showToast(err.message || 'Lỗi xóa chiến dịch', 'error');
        } finally {
          deleteBtn.disabled = false;
        }
      });
    }

    // Grouping helper
    function groupIntoCampaigns(flatList) {
      const groups = {};
      flatList.forEach(item => {
        const name = item.campaign_name || 'Không có tên';
        const start = item.start_time || '';
        const end = item.end_time || '';
        const key = `${name}||${start}||${end}`;
        if (!groups[key]) {
          groups[key] = {
            campaign_name: name,
            start_time: item.start_time,
            end_time: item.end_time,
            is_active: Number(item.is_active),
            created_at: item.created_at,
            products: [],
            total_revenue: 0
          };
        }
        groups[key].products.push(item);
        groups[key].total_revenue += Number(item.revenue || 0);
      });
      return Object.values(groups);
    }

    function getFilteredCampaigns() {
      const now = new Date();
      const campaigns = groupIntoCampaigns(state.listData);

      return campaigns.filter(campaign => {
        // Status filter
        const start = new Date(campaign.start_time);
        const end = campaign.end_time ? new Date(campaign.end_time) : null;
        const isAct = campaign.is_active != 0;

        let status = "inactive";
        if (!isAct) status = "inactive";
        else if (now < start) status = "scheduled";
        else if (end && now > end) status = "ended";
        else status = "running";

        if (state.fsStatusFilter !== "all" && status !== state.fsStatusFilter) return false;

        // Search filter
        if (state.fsSearchQuery) {
          const search = state.fsSearchQuery.toLowerCase();
          const campaignName = (campaign.campaign_name || "").toLowerCase();
          
          const matchCampaignName = campaignName.includes(search);
          const matchProduct = campaign.products.some(p => {
            const prodName = (p.product_name || "").toLowerCase();
            const prodSku = (p.product_sku || "").toLowerCase();
            const prodId = String(p.product_id);
            return prodName.includes(search) || prodSku.includes(search) || prodId.includes(search);
          });

          if (!matchCampaignName && !matchProduct) {
            return false;
          }
        }
        return true;
      });
    }

    function updateBulkActionsPanel() {
      const panel = container.querySelector('#fs-bulk-actions-panel');
      const countEl = container.querySelector('#fs-bulk-select-count');
      if (panel && countEl) {
        if (state.selectedFlashSales.size > 0) {
          countEl.textContent = state.selectedFlashSales.size;
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      }
    }

    function renderFilteredList() {
      const filtered = getFilteredCampaigns();
      if (totalBadge) totalBadge.textContent = filtered.length;

      const totalItems = filtered.length;
      const limit = 10;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));

      if (state.fsPage > totalPages) state.fsPage = totalPages;

      const startIdx = (state.fsPage - 1) * limit;
      const paginatedItems = filtered.slice(startIdx, startIdx + limit);

      // Check if all filtered items across all pages are selected
      if (selectAllCampaignsChk) {
        selectAllCampaignsChk.checked = filtered.length > 0 && filtered.every(campaign => {
          const key = `${campaign.campaign_name}||${campaign.start_time}||${campaign.end_time}`;
          return state.selectedFlashSales.has(key);
        });
      }

      renderTableRows(paginatedItems);

      // Render Pagination
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
        if (totalItems > 0) {
          // Info text
          const infoText = document.createElement('div');
          infoText.className = 'text-xs text-gray-500 font-medium';
          infoText.textContent = `Hiển thị ${startIdx + 1}-${Math.min(startIdx + limit, totalItems)} trên ${totalItems} chiến dịch`;
          paginationContainer.appendChild(infoText);

          // Pagination buttons
          const pg = createPagination(state.fsPage, totalPages, (page) => {
            state.fsPage = page;
            renderFilteredList();
          });
          paginationContainer.appendChild(pg);
        } else {
          paginationContainer.innerHTML = `<div class="text-xs text-gray-400 font-medium w-full text-center">Không có chiến dịch nào</div>`;
        }
      }

      updateBulkActionsPanel();
    }

    // Set custom table headers with Campaign Name column
    const tableHeaderContainer = container.querySelector('#flash-tbody').parentElement;
    if (tableHeaderContainer) {
      const thead = tableHeaderContainer.querySelector('thead');
      if (thead) {
        thead.innerHTML = `
          <tr class="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
            <th class="px-4 py-4 w-12 text-center">
              <input type="checkbox" id="fs-select-all-campaigns" class="rounded border-gray-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer">
            </th>
            <th class="px-6 py-4">Tên Chiến Dịch</th>
            <th class="px-6 py-4">Số Sản Phẩm</th>
            <th class="px-6 py-4">Tổng Doanh Thu</th>
            <th class="px-6 py-4">Thời Gian Hoạt Động</th>
            <th class="px-6 py-4">Trạng Thái</th>
            <th class="px-6 py-4 text-right">Thao Tác</th>
          </tr>
        `;
        
        // Re-bind selectAllCampaignsChk event listener since we changed the header html
        const newSelectAllCampaignsChk = thead.querySelector('#fs-select-all-campaigns');
        if (newSelectAllCampaignsChk) {
          newSelectAllCampaignsChk.addEventListener('change', (e) => {
            const checked = e.target.checked;
            const currentFiltered = getFilteredCampaigns();
            
            currentFiltered.forEach(campaign => {
              const key = `${campaign.campaign_name}||${campaign.start_time}||${campaign.end_time}`;
              if (checked) {
                state.selectedFlashSales.add(key);
              } else {
                state.selectedFlashSales.delete(key);
              }
            });
            updateBulkActionsPanel();
            
            const limit = 10;
            const startIdx = (state.fsPage - 1) * limit;
            const paginatedItems = currentFiltered.slice(startIdx, startIdx + limit);
            renderTableRows(paginatedItems);
          });
        }
      }
    }

    function renderTableRows(items) {
      if (!items.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400 text-sm">Không tìm thấy chiến dịch nào</td></tr>`;
        return;
      }

      tbody.innerHTML = '';
      const now = new Date();

      items.forEach(campaign => {
        const tr = document.createElement('tr');
        tr.className = 'text-gray-700 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50';

        const start = new Date(campaign.start_time);
        const end = campaign.end_time ? new Date(campaign.end_time) : null;

        let statusBadge = '';
        if (!campaign.is_active || campaign.is_active == 0) {
          statusBadge = '<span class="px-2.5 py-1 text-[10px] rounded-full bg-gray-100 text-gray-500 font-bold uppercase tracking-wider">Tắt</span>';
        } else if (now < start) {
          statusBadge = '<span class="px-2.5 py-1 text-[10px] rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-bold uppercase tracking-wider">Đã lên lịch</span>';
        } else if (end && now > end) {
          statusBadge = '<span class="px-2.5 py-1 text-[10px] rounded-full bg-red-50 text-red-700 border border-red-100 font-bold uppercase tracking-wider">Đã kết thúc</span>';
        } else {
          statusBadge = '<span class="px-2.5 py-1 text-[10px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase tracking-wider animate-pulse">Đang chạy</span>';
        }

        const campaignKey = `${campaign.campaign_name}||${campaign.start_time}||${campaign.end_time}`;
        const isChecked = state.selectedFlashSales.has(campaignKey);

        tr.innerHTML = `
          <td class="px-4 py-4 text-center">
            <input type="checkbox" class="fs-campaign-chk rounded border-gray-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer" data-key="${campaignKey}" ${isChecked ? 'checked' : ''}>
          </td>
          <td class="px-6 py-4 font-bold text-gray-900">
            ${campaign.campaign_name}
          </td>
          <td class="px-6 py-4">
            <span class="px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200/50 font-bold text-xs">
              ${campaign.products.length} sản phẩm
            </span>
          </td>
          <td class="px-6 py-4 font-bold text-emerald-600">
            ${Number(campaign.total_revenue).toLocaleString('vi-VN')}đ
          </td>
          <td class="px-6 py-4 text-xs space-y-0.5">
            <div class="text-gray-600 font-medium">Bắt đầu: ${start.toLocaleString('vi-VN')}</div>
            <div class="text-gray-400">Kết thúc: ${end ? end.toLocaleString('vi-VN') : 'Vĩnh viễn'}</div>
          </td>
          <td class="px-6 py-4">${statusBadge}</td>
          <td class="px-6 py-4 text-right space-x-1">
            <button class="details-fs-btn px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-all" data-key="${campaignKey}">Chi tiết</button>
            <button class="edit-fs-campaign-btn px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all" data-key="${campaignKey}">Sửa</button>
            <button class="dup-fs-btn px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all" data-key="${campaignKey}">Nhân bản</button>
            <button class="toggle-fs-btn px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${campaign.is_active ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-green-50 hover:bg-green-100 text-green-700'}" data-key="${campaignKey}">
              ${campaign.is_active ? 'Tắt' : 'Bật'}
            </button>
            <button class="del-fs-btn px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-bold transition-all" data-key="${campaignKey}">Xóa</button>
          </td>
        `;

        // Checkbox listener
        tr.querySelector('.fs-campaign-chk').addEventListener('change', (e) => {
          const key = e.target.getAttribute('data-key');
          if (e.target.checked) {
            state.selectedFlashSales.add(key);
          } else {
            state.selectedFlashSales.delete(key);
          }
          updateBulkActionsPanel();
          const selectAllChk = container.querySelector('#fs-select-all-campaigns');
          if (selectAllChk) {
            const currentFiltered = getFilteredCampaigns();
            selectAllChk.checked = currentFiltered.length > 0 && currentFiltered.every(i => {
              const k = `${i.campaign_name}||${i.start_time}||${i.end_time}`;
              return state.selectedFlashSales.has(k);
            });
          }
        });

        // Details button listener
        tr.querySelector('.details-fs-btn').addEventListener('click', () => {
          showCampaignDetailsModal(campaign, container);
        });

        // Edit button listener
        tr.querySelector('.edit-fs-campaign-btn').addEventListener('click', () => {
          editFlashSaleCampaign(campaign, container);
        });

        // Duplicate button listener
        tr.querySelector('.dup-fs-btn').addEventListener('click', () => {
          container.querySelector('#fs-campaign-name').value = `Sao chép - ${campaign.campaign_name}`;
          container.querySelector('#fs-start').value = campaign.start_time ? campaign.start_time.replace(' ', 'T').substring(0, 16) : '';
          
          const endInput = container.querySelector('#fs-end');
          if (campaign.end_time) {
            container.querySelector('#fs-mode-range').click();
            endInput.value = campaign.end_time.replace(' ', 'T').substring(0, 16);
          } else {
            container.querySelector('#fs-mode-forever').click();
          }

          // Load products in campaign to state.selectedProducts
          state.selectedProducts.clear();
          campaign.products.forEach(p => {
            state.selectedProducts.set(p.product_id, parseFloat(p.sale_price));
          });

          container.querySelector('#fs-selected-count').textContent = state.selectedProducts.size;
          renderProductList(container);
          
          showToast('Đã nhân bản cấu hình chiến dịch sang form thiết lập!', 'success');
          // Scroll up to the form
          container.scrollIntoView({ behavior: 'smooth' });
        });

        // Toggle button listener
        tr.querySelector('.toggle-fs-btn').addEventListener('click', async () => {
          const ids = campaign.products.map(p => p.id);
          const newActive = campaign.is_active ? 0 : 1;
          try {
            await bulkToggleFlashSales(ids, newActive);
            showToast(`Đã ${newActive ? 'bật' : 'tắt'} chiến dịch thành công`);
            loadFlashSalesList(container);
          } catch (err) {
            showToast(err.message, 'error');
          }
        });

        // Delete button listener
        tr.querySelector('.del-fs-btn').addEventListener('click', async () => {
          if (!confirm(`Xác nhận xóa toàn bộ chiến dịch "${campaign.campaign_name}" cùng các sản phẩm bên trong?`)) return;
          const ids = campaign.products.map(p => p.id);
          try {
            await bulkDeleteFlashSales(ids);
            showToast('Đã xóa chiến dịch thành công');
            state.selectedFlashSales.delete(campaignKey);
            loadFlashSalesList(container);
          } catch (err) {
            showToast(err.message, 'error');
          }
        });

        tbody.appendChild(tr);
      });
    }

    renderFilteredList();

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-red-500 text-sm">${err.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}

function showCampaignDetailsModal(campaign, parentContainer) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm';
  modal.setAttribute('data-lenis-prevent', 'true');

  const now = new Date();
  const start = new Date(campaign.start_time);
  const end = campaign.end_time ? new Date(campaign.end_time) : null;
  let statusBadge = '';
  if (!campaign.is_active) {
    statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500 font-bold uppercase">Tắt</span>';
  } else if (now < start) {
    statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-bold uppercase">Đã lên lịch</span>';
  } else if (end && now > end) {
    statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-red-50 text-red-700 border border-red-100 font-bold uppercase">Đã kết thúc</span>';
  } else {
    statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase animate-pulse">Đang chạy</span>';
  }

  modal.innerHTML = `
    <div class="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden border border-gray-150 flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-gray-900">${campaign.campaign_name}</h3>
            ${statusBadge}
          </div>
          <p class="text-xs text-gray-500 mt-1 font-medium">
            Thời gian: ${start.toLocaleString('vi-VN')} - ${end ? end.toLocaleString('vi-VN') : 'Vĩnh viễn'}
          </p>
        </div>
        <button id="close-details-modal" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Đóng (Esc)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Info Stats Banner -->
      <div class="p-4 bg-amber-500/5 border-b border-gray-100 grid grid-cols-3 gap-4 text-center">
        <div>
          <span class="text-[10px] text-gray-400 font-bold uppercase block">Tổng sản phẩm</span>
          <span class="text-lg font-black text-amber-600 mt-0.5 block">${campaign.products.length} SP</span>
        </div>
        <div>
          <span class="text-[10px] text-gray-400 font-bold uppercase block">Tổng Doanh thu</span>
          <span class="text-lg font-black text-emerald-600 mt-0.5 block">${Number(campaign.total_revenue).toLocaleString('vi-VN')}đ</span>
        </div>
        <div>
          <span class="text-[10px] text-gray-400 font-bold uppercase block">Trạng thái phát</span>
          <span class="text-lg font-black text-gray-700 mt-0.5 block">${campaign.is_active ? 'Đã kích hoạt' : 'Đang tạm dừng'}</span>
        </div>
      </div>

      <!-- Products List inside Campaign -->
      <div class="flex-1 overflow-y-auto p-4">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0 z-10">
            <tr class="border-b border-gray-100">
              <th class="px-4 py-3 w-16">Ảnh</th>
              <th class="px-4 py-3">Sản phẩm / SKU</th>
              <th class="px-4 py-3 w-28">Giá gốc</th>
              <th class="px-4 py-3 w-40">Giá Flash Sale</th>
              <th class="px-4 py-3 w-28">Doanh thu SP</th>
              <th class="px-4 py-3 text-right w-36">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            ${campaign.products.map(p => {
              const origPrice = p.original_price ? Number(p.original_price).toLocaleString('vi-VN') + 'đ' : '-';
              const formattedPrice = Number(p.sale_price).toLocaleString('vi-VN') + 'đ';
              const image = p.product_image || '';
              return `
                <tr class="hover:bg-gray-50/50 transition-colors border-b border-gray-100" data-id="${p.id}">
                  <td class="px-4 py-3">
                    ${image
                      ? `<img src="${image}" alt="" class="w-10 h-10 object-cover rounded-lg border border-gray-100 bg-gray-50" onerror="this.src='https://placehold.co/40'">`
                      : `<div class="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200/50 flex items-center justify-center text-[10px] text-gray-300 font-bold">No img</div>`}
                  </td>
                  <td class="px-4 py-3.5">
                    <div class="font-bold text-gray-800 line-clamp-1">${p.product_name || 'Sản phẩm đã bị xóa'}</div>
                    <div class="text-[10px] text-gray-400 font-mono mt-0.5">ID: #${p.product_id} ${p.product_sku ? `| SKU: ${p.product_sku}` : ''}</div>
                  </td>
                  <td class="px-4 py-3.5 text-xs text-gray-500 font-semibold">${origPrice}</td>
                  <td class="px-4 py-3.5">
                    <input type="text" class="modal-price-input w-28 px-2 py-1 border border-gray-200 rounded-lg text-xs font-bold text-red-600 focus:outline-none focus:border-red-500" value="${formattedPrice}">
                  </td>
                  <td class="px-4 py-3.5 font-bold text-emerald-600 text-xs">${Number(p.revenue || 0).toLocaleString('vi-VN')}đ</td>
                  <td class="px-4 py-3.5 text-right space-x-1">
                    <button class="modal-save-btn px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200/50 rounded-lg text-xs font-bold transition-all">Lưu</button>
                    <button class="modal-del-btn px-2 py-1 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200/50 rounded-lg text-xs font-bold transition-all">Gỡ</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-100 bg-gray-50/50 text-right">
        <button id="close-details-modal-footer" class="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition">Đóng</button>
      </div>
    </div>
  `;

  // Attach event listeners for each row
  const rows = modal.querySelectorAll('tbody tr');
  rows.forEach((row, idx) => {
    const p = campaign.products[idx];
    const input = row.querySelector('.modal-price-input');
    const saveBtn = row.querySelector('.modal-save-btn');
    const delBtn = row.querySelector('.modal-del-btn');

    // Input selection formatter
    input.addEventListener('input', (e) => {
      formatInputWithSelection(e.target, false);
    });

    // Save handler
    saveBtn.addEventListener('click', async () => {
      const priceVal = parseFloat(input.value.replace(/\D/g, '')) || 0;
      if (priceVal <= 0) {
        showToast('Vui lòng nhập giá Flash Sale hợp lệ!', 'warning');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = '...';

      try {
        const payload = {
          campaign_name: campaign.campaign_name,
          product_id: p.product_id,
          sale_price: priceVal,
          start_time: p.start_time,
          end_time: p.end_time,
          is_active: p.is_active
        };

        await updateFlashSale(p.id, payload);
        showToast('Đã cập nhật giá bán mới thành công!');
        
        // Refresh detail list state locally
        p.sale_price = priceVal;
        
        // Reload parent list to sync totals
        loadFlashSalesList(parentContainer);
      } catch (err) {
        showToast(err.message || 'Lỗi cập nhật giá', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Lưu';
      }
    });

    // Del handler (remove single item from campaign)
    delBtn.addEventListener('click', async () => {
      if (!confirm(`Xác nhận gỡ sản phẩm "${p.product_name || 'này'}" khỏi chiến dịch?`)) return;
      delBtn.disabled = true;
      try {
        await deleteFlashSale(p.id);
        showToast('Đã gỡ sản phẩm thành công');
        
        // Remove from local array
        campaign.products.splice(idx, 1);
        
        if (campaign.products.length === 0) {
          // If no products left, close modal
          modal.remove();
        } else {
          // Update total count and revenue metrics
          campaign.total_revenue = campaign.products.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0);
          
          // Re-render stats banner and rows
          modal.querySelector('.bg-amber-500\\/5').outerHTML = `
            <div class="p-4 bg-amber-500/5 border-b border-gray-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <span class="text-[10px] text-gray-400 font-bold uppercase block">Tổng sản phẩm</span>
                <span class="text-lg font-black text-amber-600 mt-0.5 block">${campaign.products.length} SP</span>
              </div>
              <div>
                <span class="text-[10px] text-gray-400 font-bold uppercase block">Tổng Doanh thu</span>
                <span class="text-lg font-black text-emerald-600 mt-0.5 block">${Number(campaign.total_revenue).toLocaleString('vi-VN')}đ</span>
              </div>
              <div>
                <span class="text-[10px] text-gray-400 font-bold uppercase block">Trạng thái phát</span>
                <span class="text-lg font-black text-gray-700 mt-0.5 block">${campaign.is_active ? 'Đã kích hoạt' : 'Đang tạm dừng'}</span>
              </div>
            </div>
          `;
          row.remove();
        }
        
        // Reload parent list to sync totals
        loadFlashSalesList(parentContainer);
      } catch (err) {
        showToast(err.message || 'Lỗi gỡ sản phẩm', 'error');
        delBtn.disabled = false;
      }
    });
  });

  const closeModal = () => {
    document.removeEventListener('keydown', handleKeydown);
    modal.remove();
  };
  const handleKeydown = (e) => {
    if (e.key === 'Escape' || e.key === 'F4') { e.preventDefault(); closeModal(); }
  };
  document.addEventListener('keydown', handleKeydown);
  modal.querySelector('#close-details-modal').addEventListener('click', closeModal);
  modal.querySelector('#close-details-modal-footer').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.body.appendChild(modal);
}

export function editFlashSaleCampaign(campaign, container) {
  state.editingCampaign = {
    campaign_name: campaign.campaign_name,
    start_time: campaign.start_time,
    end_time: campaign.end_time
  };

  // 1. Populate the form fields on the left
  container.querySelector('#fs-campaign-name').value = campaign.campaign_name;
  
  // Set start time
  container.querySelector('#fs-start').value = campaign.start_time ? campaign.start_time.replace(' ', 'T').substring(0, 16) : '';
  
  const endInput = container.querySelector('#fs-end');
  const modeRangeBtn = container.querySelector('#fs-mode-range');
  const modeForeverBtn = container.querySelector('#fs-mode-forever');

  if (campaign.end_time) {
    modeRangeBtn.click();
    endInput.value = campaign.end_time.replace(' ', 'T').substring(0, 16);
  } else {
    modeForeverBtn.click();
  }

  // 2. Set the selected products state
  state.selectedProducts.clear();
  campaign.products.forEach(p => {
    state.selectedProducts.set(p.product_id, parseFloat(p.sale_price));
  });
  container.querySelector('#fs-selected-count').textContent = state.selectedProducts.size;

  // 3. Change form title and submit button text
  container.querySelector('#create-flash-form').previousElementSibling.textContent = `1. Cài Đặt Sửa Chiến Dịch`;
  
  const submitBtn = container.querySelector('#fs-submit-btn');
  submitBtn.textContent = 'Cập Nhật Chiến Dịch Flash Sale';

  // 4. Render product selector list (this will sort checked to top and check them)
  renderProductList(container);

  // 5. Add "Hủy Chỉnh Sửa" cancel button next to submit or at the bottom
  let cancelBtn = container.querySelector('#fs-cancel-edit-btn');
  if (!cancelBtn) {
    cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.id = 'fs-cancel-edit-btn';
    cancelBtn.className = 'w-full py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold mt-2 transition text-center';
    cancelBtn.textContent = 'Hủy Chỉnh Sửa';
    cancelBtn.addEventListener('click', () => {
      cancelCampaignEditing(container);
    });
    submitBtn.parentNode.appendChild(cancelBtn);
  }

  // 6. Scroll to form smoothly
  const formCard = container.querySelector('#create-flash-form')?.parentNode;
  if (formCard) {
    formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function cancelCampaignEditing(container) {
  state.editingCampaign = null;

  // Reset form header
  container.querySelector('#create-flash-form').previousElementSibling.textContent = '1. Thiết Lập Chiến Dịch';

  // Reset submit button text
  const submitBtn = container.querySelector('#fs-submit-btn');
  submitBtn.textContent = 'Kích Hoạt Flash Sale Hàng Loạt';

  // Remove cancel button
  container.querySelector('#fs-cancel-edit-btn')?.remove();

  // Reset fields
  container.querySelector('#fs-campaign-name').value = '';
  container.querySelector('#fs-start').value = '';
  container.querySelector('#fs-end').value = '';
  container.querySelector('#fs-mode-days').click(); // back to default
  container.querySelector('#fs-duration-days').value = '1';

  // Clear selected
  state.selectedProducts.clear();
  container.querySelector('#fs-selected-count').textContent = '0';
  container.querySelector('#fs-select-all-visible').checked = false;

  // Re-render product selector
  renderProductList(container);
}
