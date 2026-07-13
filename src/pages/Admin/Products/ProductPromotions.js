import { showToast } from '../shared/ui.js';
import {
  getFlashSales,
  getVouchers,
  createFlashSale,
  createVoucher,
  updateFlashSale,
  updateVoucher,
  deleteFlashSale,
  deleteVoucher,
  bulkToggleFlashSales,
  getRanks
} from '../../../services/adminService.js';

export function setupProductPromotions(overlay, product) {
  if (!product) return;

  let editingFlashSaleId = null;
  let editingVoucherId = null;

  // Tab Switch Handling (Loading trigger only, visibility/styles managed globally)
  const tabPromotions = overlay.querySelector('#pf-tab-promotions');
  if (tabPromotions) {
    tabPromotions.addEventListener('click', () => {
      loadActivePromotions();
    });
  }

  // Load active promotions affecting the product
  async function loadActivePromotions() {
    const listEl = overlay.querySelector('#pf-active-promotions-list');
    if (!listEl) return;
    listEl.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A84C] mb-2"></div>
        <span class="text-xs text-gray-400">Đang tải danh sách khuyến mãi...</span>
      </div>
    `;

    try {
      const [fsRes, vRes] = await Promise.all([
        getFlashSales(),
        getVouchers()
      ]);

      const allFlashSales = fsRes.data || fsRes || [];
      const allVouchers = vRes.data || vRes || [];

      // Filter active promotions for this product
      const myFlashSales = allFlashSales.filter(fs => Number(fs.product_id) === Number(product.id));

      const myVouchers = allVouchers.filter(v => {
        if (v.apply_type === 'all') return true;
        if (v.apply_type === 'specific') {
          let pids = [];
          if (v.product_ids) {
            try {
              pids = typeof v.product_ids === 'string' ? JSON.parse(v.product_ids) : v.product_ids;
            } catch (e) {
              pids = String(v.product_ids).split(',').map(Number);
            }
          }
          pids = Array.isArray(pids) ? pids.map(Number) : [];
          return pids.includes(Number(product.id));
        }
        return false;
      });

      listEl.innerHTML = '';

      if (myFlashSales.length === 0 && myVouchers.length === 0) {
        listEl.innerHTML = `
          <div class="text-center py-10 bg-gray-50 rounded-xl border border-gray-150 p-6">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 12H4"/></svg>
            <p class="text-xs text-gray-400">Sản phẩm này chưa tham gia chương trình khuyến mãi hay mã giảm giá nào.</p>
          </div>
        `;
        return;
      }

      // Render Flash Sales
      if (myFlashSales.length > 0) {
        const titleFs = document.createElement('div');
        titleFs.className = 'text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2 mt-1';
        titleFs.textContent = 'Chiến dịch Flash Sale';
        listEl.appendChild(titleFs);

        // Find the currently applied flash sale campaign (active, started, not ended, sorted by ID desc)
        const activeRunningCampaigns = myFlashSales.filter(fs => {
          const now = new Date();
          const start = new Date(fs.start_time);
          const end = fs.end_time ? new Date(fs.end_time) : null;
          const isActive = fs.is_active && fs.is_active != '0';
          const hasStarted = now >= start;
          const hasNotEnded = !end || now <= end;
          return isActive && hasStarted && hasNotEnded;
        });
        activeRunningCampaigns.sort((a, b) => Number(b.id) - Number(a.id));
        const currentAppliedCampaignId = activeRunningCampaigns.length > 0 ? Number(activeRunningCampaigns[0].id) : null;

        myFlashSales.forEach(fs => {
          const now = new Date();
          const start = new Date(fs.start_time);
          const end = fs.end_time ? new Date(fs.end_time) : null;
          const isCurrentlyApplied = Number(fs.id) === currentAppliedCampaignId;

          let statusText = 'Đang chạy';
          let statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

          if (!fs.is_active || fs.is_active == '0') {
            statusText = 'Đang tắt';
            statusClass = 'bg-gray-50 text-gray-500 border-gray-200';
          } else if (now < start) {
            statusText = 'Sắp diễn ra';
            statusClass = 'bg-blue-50 text-blue-700 border-blue-200';
          } else if (end && now > end) {
            statusText = 'Đã kết thúc';
            statusClass = 'bg-gray-150 text-gray-400 border-gray-200';
          } else if (isCurrentlyApplied) {
            statusText = 'Đang áp dụng';
            statusClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
          }

          const card = document.createElement('div');
          card.className = isCurrentlyApplied
            ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/10 border-2 border-emerald-500 rounded-xl hover:shadow-sm transition-shadow mb-2'
            : 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow mb-2';
          card.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="p-2 bg-red-50 rounded-lg text-red-600 flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div class="text-xs space-y-0.5">
                <div class="font-bold text-gray-800">${fs.campaign_name || 'Chiến dịch Flash Sale'}</div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded text-[10px]">
                    Giá bán: ${Number(fs.sale_price).toLocaleString('vi-VN')}₫
                  </span>
                  <span class="text-[10px] border px-1 py-0.2 rounded font-semibold ${statusClass}">
                    ${statusText}
                  </span>
                </div>
                <div class="text-[10px] text-gray-500">
                  Thời gian: ${formatDateTime(fs.start_time)} - ${formatDateTime(fs.end_time)}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap sm:justify-end shrink-0">
              ${!isCurrentlyApplied ? `
                <button type="button" class="apply-fs-price-btn px-2 py-1 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-md text-[10px] font-bold transition-all shadow-sm" data-id="${fs.id}">
                  Áp Dụng
                </button>
              ` : ''}
              <button type="button" class="toggle-fs-btn px-2 py-1 border rounded-md text-[10px] font-bold transition-all ${fs.is_active && fs.is_active != '0' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}" data-id="${fs.id}" data-active="${fs.is_active && fs.is_active != '0' ? '0' : '1'}">
                ${fs.is_active && fs.is_active != '0' ? 'Tắt' : 'Bật'}
              </button>
              <button type="button" class="edit-fs-btn px-2 py-1 border border-gray-300 hover:bg-gray-50 rounded-md text-[10px] font-bold transition-all" data-id="${fs.id}">
                Sửa
              </button>
              <button type="button" class="delete-fs-btn px-2 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-[10px] font-bold transition-all" data-id="${fs.id}">
                Gỡ
              </button>
            </div>
          `;

          card.querySelector('.toggle-fs-btn').addEventListener('click', async (e) => {
            const fsId = Number(e.currentTarget.getAttribute('data-id'));
            const newActive = Number(e.currentTarget.getAttribute('data-active'));
            const selectedFs = myFlashSales.find(item => Number(item.id) === fsId);
            if (selectedFs) {
              const btn = e.currentTarget;
              btn.disabled = true;
              btn.textContent = newActive ? 'Bật...' : 'Tắt...';
              try {
                // Find all flash sales matching the campaign name, start time, and end time to bulk toggle them
                const campaignName = selectedFs.campaign_name;
                const startTime = selectedFs.start_time;
                const endTime = selectedFs.end_time;

                const matchingSales = allFlashSales.filter(item =>
                  item.campaign_name === campaignName &&
                  item.start_time === startTime &&
                  (item.end_time === endTime || (!item.end_time && !endTime))
                );
                const ids = matchingSales.map(item => Number(item.id));

                if (ids.length > 0) {
                  await bulkToggleFlashSales(ids, newActive);
                } else {
                  await updateFlashSale(fsId, { ...selectedFs, is_active: newActive });
                }

                showToast(`Đã ${newActive ? 'bật' : 'tắt'} chiến dịch thành công!`, 'success');
                loadActivePromotions();
              } catch (err) {
                showToast('Lỗi thay đổi trạng thái: ' + err.message, 'error');
                btn.disabled = false;
                btn.textContent = newActive ? 'Bật' : 'Tắt';
              }
            }
          });

          const applyPriceBtn = card.querySelector('.apply-fs-price-btn');
          if (applyPriceBtn) {
            applyPriceBtn.addEventListener('click', async (e) => {
              const fsId = Number(e.currentTarget.getAttribute('data-id'));
              const btn = e.currentTarget;
              btn.disabled = true;
              btn.textContent = 'Đang bật...';
              try {
                // Update all campaigns of this product: turn ON fsId, and turn OFF others
                const promises = myFlashSales.map(item => {
                  const targetActive = (Number(item.id) === fsId) ? 1 : 0;
                  if (Number(item.is_active) !== targetActive) {
                    return updateFlashSale(item.id, {
                      ...item,
                      is_active: targetActive
                    });
                  }
                  return Promise.resolve();
                });
                await Promise.all(promises);
                showToast('Đã áp dụng hiển thị giá chiến dịch này thành công!', 'success');
                loadActivePromotions();
              } catch (err) {
                showToast('Lỗi áp dụng giá chiến dịch: ' + err.message, 'error');
                btn.disabled = false;
                btn.textContent = 'Áp Dụng';
              }
            });
          }

          card.querySelector('.edit-fs-btn').addEventListener('click', (e) => {
            const fsId = Number(e.currentTarget.getAttribute('data-id'));
            const selectedFs = myFlashSales.find(item => Number(item.id) === fsId);
            if (selectedFs) {
              setFsEditingState(selectedFs);
            }
          });

          card.querySelector('.delete-fs-btn').addEventListener('click', async (e) => {
            const fsId = Number(e.currentTarget.getAttribute('data-id'));
            if (confirm('Bạn có chắc chắn muốn bỏ sản phẩm này ra khỏi chiến dịch Flash Sale không?')) {
              try {
                await deleteFlashSale(fsId);
                showToast('Đã gỡ sản phẩm khỏi chiến dịch Flash Sale thành công!', 'success');
                loadActivePromotions();
              } catch (err) {
                showToast('Lỗi khi gỡ: ' + err.message, 'error');
              }
            }
          });

          listEl.appendChild(card);
        });
      }

      // Render Vouchers
      if (myVouchers.length > 0) {
        const titleV = document.createElement('div');
        titleV.className = 'text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2 mt-4';
        titleV.textContent = 'Mã giảm giá (Vouchers)';
        listEl.appendChild(titleV);

        myVouchers.forEach(v => {
          const now = new Date();
          const start = v.start_date ? new Date(v.start_date) : null;
          const end = v.end_date ? new Date(v.end_date) : null;

          let statusText = 'Đang chạy';
          let statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

          if (!v.is_active || v.is_active == '0') {
            statusText = 'Đang tắt';
            statusClass = 'bg-gray-50 text-gray-500 border-gray-200';
          } else if (start && now < start) {
            statusText = 'Sắp diễn ra';
            statusClass = 'bg-blue-50 text-blue-700 border-blue-200';
          } else if (end && now > end) {
            statusText = 'Đã hết hạn';
            statusClass = 'bg-gray-150 text-gray-400 border-gray-200';
          }

          const isStoreWide = v.apply_type === 'all';
          const discountStr = v.discount_type === 'percentage'
            ? `${v.discount_value}%`
            : `${Number(v.discount_value).toLocaleString('vi-VN')}₫`;

          const card = document.createElement('div');
          card.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow mb-2';
          card.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0 font-bold border border-blue-100 uppercase tracking-wider text-[10px] font-mono min-w-[70px] text-center select-all">
                ${v.code}
              </div>
              <div class="text-xs space-y-0.5">
                <div class="font-bold text-gray-800">
                  Giảm <span class="text-blue-600 font-extrabold">${discountStr}</span>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[9px] text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.2 rounded font-medium">
                    Tối thiểu: ${Number(v.min_order_amount || 0).toLocaleString('vi-VN')}₫
                  </span>
                  ${isStoreWide
              ? `<span class="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-1.5 py-0.2 rounded text-[9px]">Toàn shop</span>`
              : `<span class="bg-amber-50 border border-amber-200 text-amber-700 font-bold px-1.5 py-0.2 rounded text-[9px]">Chỉ SP này</span>`
            }
                  <span class="text-[9px] font-semibold border px-1.5 py-0.2 rounded ${statusClass}">
                    ${statusText}
                  </span>
                </div>
                <div class="text-[10px] text-gray-500">
                  Hạn dùng: ${formatDateTime(v.start_date)} - ${formatDateTime(v.end_date)}
                </div>
                <div class="text-[9px] text-gray-400 hidden">
                  Hạng VIP: ${v.vip_rank === 'all' ? 'Tất cả' : v.vip_rank}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap sm:justify-end shrink-0">
              ${isStoreWide
              ? `
                <span class="text-[9px] text-gray-400 italic flex items-center gap-0.5 select-none" title="Voucher áp dụng toàn shop, không thể chỉnh sửa từ sản phẩm này">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Toàn shop
                </span>
                `
              : `
                <button type="button" class="edit-v-btn px-2.5 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-[10px] font-bold transition-all" data-id="${v.id}">
                  Sửa
                </button>
                <button type="button" class="toggle-v-btn px-2.5 py-1.5 border rounded-lg text-[10px] font-bold transition-all ${v.is_active && v.is_active != '0' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}" data-id="${v.id}" data-active="${v.is_active && v.is_active != '0' ? '0' : '1'}">
                  ${v.is_active && v.is_active != '0' ? 'Tắt' : 'Bật'}
                </button>
                <button type="button" class="delete-v-btn px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[10px] font-bold transition-all" data-id="${v.id}">
                  Gỡ
                </button>
                `
            }
            </div>
          `;

          if (!isStoreWide) {
            card.querySelector('.edit-v-btn').addEventListener('click', (e) => {
              const vId = Number(e.currentTarget.getAttribute('data-id'));
              const selectedV = myVouchers.find(item => Number(item.id) === vId);
              if (selectedV) {
                setVEditingState(selectedV);
              }
            });

            card.querySelector('.toggle-v-btn').addEventListener('click', async (e) => {
              const vId = Number(e.currentTarget.getAttribute('data-id'));
              const newActive = Number(e.currentTarget.getAttribute('data-active'));
              const selectedV = myVouchers.find(item => Number(item.id) === vId);
              if (selectedV) {
                try {
                  let pids = [];
                  if (selectedV.product_ids) {
                    try {
                      pids = typeof selectedV.product_ids === 'string' ? JSON.parse(selectedV.product_ids) : selectedV.product_ids;
                    } catch (err) {
                      pids = String(selectedV.product_ids).split(',').map(Number);
                    }
                  }
                  pids = Array.isArray(pids) ? pids.map(Number) : [];
                  const payload = {
                    ...selectedV,
                    is_active: newActive,
                    product_ids: pids
                  };
                  await updateVoucher(vId, payload);
                  showToast(`Đã ${newActive ? 'bật' : 'tắt'} Voucher thành công!`, 'success');
                  loadActivePromotions();
                } catch (err) {
                  showToast('Lỗi thay đổi trạng thái: ' + err.message, 'error');
                }
              }
            });

            card.querySelector('.delete-v-btn').addEventListener('click', async (e) => {
              const vId = Number(e.currentTarget.getAttribute('data-id'));
              if (confirm('Bạn có chắc muốn gỡ sản phẩm này khỏi mã giảm giá này không?')) {
                try {
                  const selectedV = myVouchers.find(item => Number(item.id) === vId);
                  if (selectedV) {
                    let pids = [];
                    if (selectedV.product_ids) {
                      try {
                        pids = typeof selectedV.product_ids === 'string' ? JSON.parse(selectedV.product_ids) : selectedV.product_ids;
                      } catch (err) {
                        pids = String(selectedV.product_ids).split(',').map(Number);
                      }
                    }
                    pids = Array.isArray(pids) ? pids.map(Number) : [];
                    const newPids = pids.filter(pid => Number(pid) !== Number(product.id));

                    if (newPids.length === 0) {
                      await deleteVoucher(vId);
                      showToast('Đã xóa mã giảm giá này!', 'success');
                    } else {
                      const payload = {
                        ...selectedV,
                        product_ids: newPids
                      };
                      await updateVoucher(vId, payload);
                      showToast('Đã gỡ sản phẩm khỏi mã giảm giá này!', 'success');
                    }
                    loadActivePromotions();
                  }
                } catch (err) {
                  showToast('Lỗi khi gỡ: ' + err.message, 'error');
                }
              }
            });
          }

          listEl.appendChild(card);
        });
      }

    } catch (err) {
      listEl.innerHTML = `
        <div class="text-center py-10 text-red-500 font-semibold text-xs">
          Lỗi tải danh sách khuyến mãi: ${err.message}
        </div>
      `;
    }
  }

  function formatDateTime(str) {
    if (!str) return 'Không giới hạn';
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Quick Flash Sale Editing state helpers
  function setFsEditingState(fs) {
    editingFlashSaleId = fs.id;

    quickFsPriceInput.value = fs.sale_price;
    formatInputWithSelection(quickFsPriceInput, false);

    quickFsStartInput.value = fs.start_time ? fs.start_time.replace(' ', 'T').substring(0, 16) : '';
    quickFsEndInput.value = fs.end_time ? fs.end_time.replace(' ', 'T').substring(0, 16) : '';

    quickFsBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
      Cập nhật Flash Sale
    `;
    quickFsBtn.className = "w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm";

    let cancelBtn = overlay.querySelector('#pf-quick-fs-cancel');
    if (!cancelBtn) {
      cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.id = 'pf-quick-fs-cancel';
      cancelBtn.className = 'w-full py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold mt-2 transition text-center flex items-center justify-center';
      cancelBtn.textContent = 'Hủy chỉnh sửa';
      cancelBtn.addEventListener('click', clearFsEditing);
      quickFsBtn.parentNode.insertBefore(cancelBtn, quickFsBtn.nextSibling);
    }
  }

  function clearFsEditing() {
    editingFlashSaleId = null;
    quickFsPriceInput.value = '';
    quickFsStartInput.value = '';
    quickFsEndInput.value = '';

    quickFsBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      Kích hoạt Flash Sale
    `;
    quickFsBtn.className = "w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm";

    overlay.querySelector('#pf-quick-fs-cancel')?.remove();
  }

  // Quick Voucher Editing state helpers
  function setVEditingState(v) {
    editingVoucherId = v.id;

    quickVCodeInput.value = v.code;
    quickVTypeSelect.value = v.discount_type;

    quickVValInput.value = v.discount_value;
    formatDiscountVal();

    quickVMinInput.value = v.min_order_amount;
    if (quickVMinInput.value) {
      formatInputWithSelection(quickVMinInput, false);
    }

    const vipAll = overlay.querySelector('#pf-quick-v-vip-all');
    const vipItems = overlay.querySelectorAll('input[name="pf-quick-v-vip-item"]');

    if (v.vip_rank === 'all') {
      if (vipAll) vipAll.checked = true;
      vipItems.forEach(item => item.checked = true);
    } else {
      if (vipAll) vipAll.checked = false;
      const ranks = v.vip_rank.split(',');
      vipItems.forEach(item => {
        item.checked = ranks.includes(item.value);
      });
    }

    quickVBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
      Cập nhật Voucher
    `;
    quickVBtn.className = "w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm mt-1";

    let cancelVBtn = overlay.querySelector('#pf-quick-v-cancel');
    if (!cancelVBtn) {
      cancelVBtn = document.createElement('button');
      cancelVBtn.type = 'button';
      cancelVBtn.id = 'pf-quick-v-cancel';
      cancelVBtn.className = 'w-full py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold mt-2 transition text-center flex items-center justify-center';
      cancelVBtn.textContent = 'Hủy chỉnh sửa';
      cancelVBtn.addEventListener('click', clearVEditing);
      quickVBtn.parentNode.insertBefore(cancelVBtn, quickVBtn.nextSibling);
    }
  }

  function clearVEditing() {
    editingVoucherId = null;
    quickVCodeInput.value = '';
    quickVValInput.value = '';
    quickVMinInput.value = '';
    const vipAll = overlay.querySelector('#pf-quick-v-vip-all');
    const vipItems = overlay.querySelectorAll('input[name="pf-quick-v-vip-item"]');
    if (vipAll) vipAll.checked = true;
    vipItems.forEach(i => i.checked = true);

    quickVBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
      Tạo mã giảm giá
    `;
    quickVBtn.className = "w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm mt-1";

    overlay.querySelector('#pf-quick-v-cancel')?.remove();
  }

  // Quick Flash Sale Inputs & Submit
  const quickFsPriceInput = overlay.querySelector('#pf-quick-fs-price');
  const quickFsStartInput = overlay.querySelector('#pf-quick-fs-start');
  const quickFsEndInput = overlay.querySelector('#pf-quick-fs-end');
  const quickFsBtn = overlay.querySelector('#pf-quick-fs-btn');

  if (quickFsPriceInput) {
    quickFsPriceInput.addEventListener('input', () => {
      formatInputWithSelection(quickFsPriceInput, false);
    });
  }

  if (quickFsBtn) {
    quickFsBtn.addEventListener('click', async () => {
      const priceStr = quickFsPriceInput.value.replace(/\D/g, '');
      const price = Number(priceStr);
      const startVal = quickFsStartInput.value;
      const endVal = quickFsEndInput.value;

      if (!priceStr || isNaN(price) || price <= 0) {
        showToast('Vui lòng nhập giá Flash Sale hợp lệ!', 'warning');
        return;
      }

      if (!startVal) {
        showToast('Vui lòng chọn thời gian bắt đầu!', 'warning');
        return;
      }

      if (endVal && new Date(endVal) <= new Date(startVal)) {
        showToast('Thời gian kết thúc phải sau thời gian bắt đầu!', 'warning');
        return;
      }

      quickFsBtn.disabled = true;
      const originalText = quickFsBtn.innerHTML;
      quickFsBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Đang xử lý...
      `;

      try {
        const payload = {
          product_id: Number(product.id),
          campaign_name: `Flash Sale - ${product.name}`,
          sale_price: price,
          start_time: startVal.replace('T', ' ') + ':00',
          end_time: endVal ? endVal.replace('T', ' ') + ':00' : null,
          is_active: 1
        };

        if (editingFlashSaleId) {
          await updateFlashSale(editingFlashSaleId, payload);
          showToast('Đã cập nhật chiến dịch Flash Sale thành công!', 'success');
          clearFsEditing();
        } else {
          await createFlashSale(payload);
          showToast('Đã tạo Flash Sale mới cho sản phẩm thành công!', 'success');
          quickFsPriceInput.value = '';
          quickFsStartInput.value = '';
          quickFsEndInput.value = '';
        }

        loadActivePromotions();
      } catch (err) {
        showToast('Lỗi lưu flash sale: ' + err.message, 'error');
      } finally {
        quickFsBtn.disabled = false;
        quickFsBtn.innerHTML = originalText;
      }
    });
  }

  // Quick Voucher Inputs & Submit
  const quickVCodeInput = overlay.querySelector('#pf-quick-v-code');
  const quickVTypeSelect = overlay.querySelector('#pf-quick-v-type');
  const quickVValInput = overlay.querySelector('#pf-quick-v-val');
  const quickVMinInput = overlay.querySelector('#pf-quick-v-min');
  const quickVBtn = overlay.querySelector('#pf-quick-v-btn');

  // Dynamic VIP Ranks Checkbox population inside Product Form
  const initQuickVipRanks = async () => {
    const container = overlay.querySelector('#pf-quick-v-vip-container');
    if (!container) return;
    try {
      const res = await getRanks();
      const ranks = res.data || [];
      if (ranks.length > 0) {
        container.innerHTML = `
          <label class="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
            <input type="checkbox" id="pf-quick-v-vip-all" value="all" checked class="w-3.5 h-3.5 accent-[#C9A84C] rounded border-gray-300"/>
            <span>Tất cả</span>
          </label>
          ${ranks.map(r => `
            <label class="flex items-center gap-1.5 cursor-pointer font-medium text-gray-600">
              <input type="checkbox" name="pf-quick-v-vip-item" value="${r.name}" checked class="w-3.5 h-3.5 accent-[#C9A84C] rounded border-gray-300"/>
              <span>${r.name}</span>
            </label>
          `).join('')}
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách hạng VIP trong Form sản phẩm:', err);
    }

    const vipAll = overlay.querySelector('#pf-quick-v-vip-all');
    const vipItems = overlay.querySelectorAll('input[name="pf-quick-v-vip-item"]');

    if (vipAll) {
      vipAll.addEventListener('change', (e) => {
        const checked = e.target.checked;
        vipItems.forEach(item => {
          item.checked = checked;
        });
      });
    }

    vipItems.forEach(item => {
      item.addEventListener('change', () => {
        const allChecked = Array.from(vipItems).every(i => i.checked);
        if (vipAll) {
          vipAll.checked = allChecked;
        }
      });
    });
  };

  initQuickVipRanks();

  if (quickVCodeInput) {
    quickVCodeInput.addEventListener('input', () => {
      quickVCodeInput.value = quickVCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
  }

  function formatDiscountVal() {
    if (!quickVValInput) return;
    let raw = quickVValInput.value.replace(/\D/g, '');
    if (!raw) {
      quickVValInput.value = '';
      return;
    }
    const type = quickVTypeSelect.value;
    if (type === 'percentage') {
      let percent = Math.min(100, Number(raw));
      quickVValInput.value = percent + '%';
    } else {
      quickVValInput.value = Number(raw).toLocaleString('vi-VN') + '₫';
    }
  }

  if (quickVValInput && quickVTypeSelect) {
    quickVValInput.addEventListener('input', () => {
      formatInputWithSelection(quickVValInput, quickVTypeSelect.value === 'percentage');
    });
    quickVTypeSelect.addEventListener('change', () => {
      formatInputWithSelection(quickVValInput, quickVTypeSelect.value === 'percentage');
    });
  }

  if (quickVMinInput) {
    quickVMinInput.addEventListener('input', () => {
      formatInputWithSelection(quickVMinInput, false);
    });
  }

  if (quickVBtn) {
    quickVBtn.addEventListener('click', async () => {
      const code = quickVCodeInput.value.trim();
      const type = quickVTypeSelect.value;
      const valStr = quickVValInput.value.replace(/\D/g, '');
      const val = Number(valStr);
      const minStr = quickVMinInput.value.replace(/\D/g, '');
      const minVal = minStr ? Number(minStr) : 0;

      if (!code) {
        showToast('Vui lòng nhập mã Voucher!', 'warning');
        return;
      }

      if (!valStr || isNaN(val) || val <= 0) {
        showToast('Vui lòng nhập mức giảm giá hợp lệ!', 'warning');
        return;
      }

      if (type === 'percentage' && val > 100) {
        showToast('Phần trăm giảm giá không thể vượt quá 100%!', 'warning');
        return;
      }

      const vipAll = overlay.querySelector('#pf-quick-v-vip-all');
      const vipItems = overlay.querySelectorAll('input[name="pf-quick-v-vip-item"]');
      let vipRank = 'all';
      if (vipAll && !vipAll.checked) {
        const checkedRanks = Array.from(vipItems)
          .filter(i => i.checked)
          .map(i => i.value);
        if (checkedRanks.length === 0) {
          showToast('Vui lòng chọn ít nhất một hạng VIP áp dụng!', 'warning');
          return;
        }
        vipRank = checkedRanks.join(',');
      }

      quickVBtn.disabled = true;
      const originalText = quickVBtn.innerHTML;
      quickVBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Đang xử lý...
      `;

      try {
        const payload = {
          code: code,
          discount_type: type,
          discount_value: val,
          min_order_amount: minVal,
          max_discount_amount: type === 'percentage' ? val * 5000 : 0,
          vip_rank: vipRank,
          is_active: 1,
          apply_type: 'specific',
          product_ids: [product.id]
        };

        if (editingVoucherId) {
          await updateVoucher(editingVoucherId, payload);
          showToast('Đã cập nhật Voucher thành công!', 'success');
          clearVEditing();
        } else {
          await createVoucher(payload);
          showToast('Đã tạo Voucher riêng cho sản phẩm này thành công!', 'success');
          quickVCodeInput.value = '';
          quickVValInput.value = '';
          quickVMinInput.value = '';
          if (vipAll) vipAll.checked = true;
          vipItems.forEach(i => i.checked = true);
        }

        loadActivePromotions();
      } catch (err) {
        showToast('Lỗi lưu voucher: ' + err.message, 'error');
      } finally {
        quickVBtn.disabled = false;
        quickVBtn.innerHTML = originalText;
      }
    });
  }
}

function formatInputWithSelection(input, isPercentage = false) {
  const value = input.value;
  const selectionStart = input.selectionStart;

  // 1. Count how many digits exist BEFORE the cursor currently
  let digitsBeforeCursor = 0;
  for (let i = 0; i < selectionStart; i++) {
    if (/\d/.test(value[i])) {
      digitsBeforeCursor++;
    }
  }

  // 2. Extract digits only (rejecting any alphabetic/special chars)
  let digits = value.replace(/\D/g, '');
  if (!digits) {
    input.value = '';
    return;
  }

  // 3. Format value dynamically
  let formatted = '';
  if (isPercentage) {
    let num = Math.min(100, parseInt(digits, 10) || 0);
    formatted = num + '%';
  } else {
    formatted = Number(digits).toLocaleString('vi-VN') + 'đ';
  }

  input.value = formatted;

  // 4. Calculate and restore the cursor position
  let newCursorPos = 0;
  let digitsCount = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      digitsCount++;
      if (digitsCount === digitsBeforeCursor) {
        newCursorPos = i + 1;
        break;
      }
    }
  }

  // Fallbacks if formatting shifted boundaries
  if (digitsCount < digitsBeforeCursor || newCursorPos === 0) {
    newCursorPos = formatted.length - 1;
  }
  if (newCursorPos > formatted.length - 1) {
    newCursorPos = formatted.length - 1;
  }

  input.setSelectionRange(newCursorPos, newCursorPos);
}
