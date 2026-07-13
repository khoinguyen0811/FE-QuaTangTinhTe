import { createFlashSale, updateFlashSaleCampaign } from '../../../services/adminService.js';
import { showToast } from '../shared/ui.js';
import { initProductSelector, renderProductList } from './ProductSelector.js';
import { loadFlashSalesList } from './CampaignList.js';
import { resetFlashSalesState, state } from './FlashSalesState.js';

export function renderFlashSales(container) {
  resetFlashSalesState();
  
  container.innerHTML = `
    <div class="space-y-6 font-sans">
      <!-- Title & Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Quản Lý Chiến Dịch Flash Sale</h2>
          <p class="text-sm text-gray-500 mt-0.5 font-medium">Lên lịch giảm giá chớp nhoáng hàng loạt theo thời gian chạy</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- FORM & BULK PRICING (4 cols) -->
        <div class="xl:col-span-4 bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-5 h-fit">
          <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-3">1. Thiết Lập Chiến Dịch</h3>
          
          <form id="create-flash-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Tên chiến dịch</label>
              <input type="text" id="fs-campaign-name" required class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] transition" placeholder="Ví dụ: Sale Hè Rực Rỡ, Black Friday...">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Cách thiết lập thời gian</label>
              <div class="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 border border-gray-200 rounded-xl mb-3">
                <button type="button" id="fs-mode-days" class="py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-[#C9A84C] bg-white shadow-sm transition-all focus:outline-none">Theo ngày</button>
                <button type="button" id="fs-mode-range" class="py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-gray-500 hover:text-gray-700 transition-all focus:outline-none">Thời gian cụ thể</button>
                <button type="button" id="fs-mode-forever" class="py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-gray-500 hover:text-gray-700 transition-all focus:outline-none">Chạy vĩnh viễn</button>
              </div>
            </div>

            <div id="fs-start-container">
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Ngày & Giờ Bắt Đầu</label>
              <input type="datetime-local" id="fs-start" required class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] transition">
            </div>

            <div id="fs-duration-container">
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Thời Lượng (ngày)</label>
              <div class="relative flex items-center">
                <input type="number" id="fs-duration-days" min="0.1" step="any" value="1" required class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] transition pr-16" placeholder="Ví dụ: 1, 2, 0.5...">
                <span class="absolute right-3.5 text-xs font-bold text-gray-400">ngày</span>
              </div>
            </div>

            <div id="fs-end-container" class="hidden">
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Ngày & Giờ Kết Thúc</label>
              <input type="datetime-local" id="fs-end" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] transition">
            </div>

            <div class="border-t border-gray-100 pt-4 space-y-3">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide">Cấu hình giá nhanh cho SP đã chọn</label>
              <div class="grid grid-cols-2 gap-2">
                <select id="fs-bulk-type" class="px-2.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A84C] transition">
                  <option value="fixed">Đồng giá (đ)</option>
                  <option value="percent">Giảm phần trăm (%)</option>
                  <option value="discount">Giảm số tiền (đ)</option>
                </select>
                <input type="text" id="fs-bulk-val" class="px-2.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A84C] transition" placeholder="Nhập giá trị...">
              </div>
              <button type="button" id="fs-apply-bulk-price" class="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500 hover:text-zinc-950 text-amber-600 border border-amber-500/20 text-xs font-bold rounded-xl transition-all">
                Áp dụng giá nhanh
              </button>
            </div>

            <div class="border-t border-gray-100 pt-4">
              <div class="flex justify-between items-center text-sm font-semibold text-gray-700">
                <span>Số sản phẩm đã chọn:</span>
                <span id="fs-selected-count" class="text-amber-500 font-bold">0</span>
              </div>
            </div>

            <button type="submit" id="fs-submit-btn" class="w-full py-3.5 bg-gray-950 hover:bg-amber-500 hover:text-zinc-950 text-white rounded-xl text-xs font-black uppercase tracking-wider transition duration-300">
              Kích Hoạt Flash Sale Hàng Loạt
            </button>
          </form>
        </div>

        <!-- PRODUCT SELECTION TABLE (8 cols) -->
        <div class="xl:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[550px] overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
            <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider">2. Chọn Sản Phẩm</h3>
            <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <label class="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-900 select-none bg-white border border-gray-200 px-3 py-2 rounded-xl">
                <input type="checkbox" id="fs-hide-active-chk" class="w-3.5 h-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 accent-amber-500">
                <span>Bỏ qua SP đang chạy Flash Sale</span>
              </label>
              <select id="fs-cat-filter" class="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A84C] bg-white">
                <option value="">Tất cả danh mục</option>
              </select>
              <input type="text" id="fs-prod-search" class="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A84C] w-full sm:w-48 bg-white" placeholder="Tìm tên, SKU...">
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase sticky top-0 z-10">
                <tr>
                  <th class="px-4 py-3 w-12 text-center">
                    <input type="checkbox" id="fs-select-all-visible" class="rounded border-gray-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer">
                  </th>
                  <th class="px-4 py-3 w-16">Ảnh</th>
                  <th class="px-4 py-3">Sản phẩm / SKU</th>
                  <th class="px-4 py-3 w-28">Giá gốc</th>
                  <th class="px-4 py-3 w-36">Giá Flash Sale</th>
                </tr>
              </thead>
              <tbody id="fs-prod-tbody" class="divide-y divide-gray-50">
                <tr>
                  <td colspan="5" class="px-4 py-12 text-center text-gray-400 font-medium">Đang tải danh sách sản phẩm...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- EXISTING CAMPAIGNS -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <!-- Filter and Search Header -->
        <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3 flex-1 w-full sm:w-auto">
            <div class="relative w-full sm:w-64 flex items-center">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input type="text" id="fs-list-search" class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] bg-white" placeholder="Tìm sản phẩm, SKU...">
            </div>
            <!-- Popover Filter Wrapper -->
            <div class="relative inline-block text-left" id="fs-list-filter-wrapper">
              <button type="button" id="fs-list-filter-toggle" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center relative text-xs font-bold" title="Bộ lọc nâng cao">
                Lọc
                <span id="fs-list-filter-badge" class="hidden absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full"></span>
              </button>

              <div id="fs-list-filter-popover" class="hidden absolute left-0 mt-2 w-60 bg-white border border-gray-250 shadow-xl rounded-xl p-4 z-50">
                <div class="flex items-center justify-between border-b border-gray-150 pb-2 mb-3">
                  <span class="text-xs font-bold text-gray-800 flex items-center gap-1.5 select-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    Bộ lọc chiến dịch
                  </span>
                  <button type="button" id="fs-list-clear-all-filters" class="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline transition-all">
                    Xóa bộ lọc
                  </button>
                </div>
                <div class="space-y-3">
                  <div class="space-y-1">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</label>
                    <select id="fs-list-status" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C] bg-white">
                      <option value="all">Tất cả trạng thái</option>
                      <option value="running">Đang chạy</option>
                      <option value="scheduled">Đã lên lịch</option>
                      <option value="ended">Đã kết thúc</option>
                      <option value="inactive">Đã tắt</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider">Chiến dịch Flash Sale hiện tại</h3>
            <span id="fs-campaigns-total-badge" class="px-2.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full font-bold">0</span>
          </div>
        </div>

        <!-- Bulk Actions Panel (Hidden by default, displayed via JS when state.selectedFlashSales.size > 0) -->
        <div id="fs-bulk-actions-panel" class="hidden px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between transition-all duration-300">
          <div class="text-xs font-bold text-amber-800">
            Đã chọn <span id="fs-bulk-select-count" class="text-sm font-black">0</span> chiến dịch
          </div>
          <div class="flex items-center gap-2">
            <button id="fs-bulk-enable-btn" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition">
              Bật đã chọn
            </button>
            <button id="fs-bulk-disable-btn" class="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold rounded-lg transition">
              Tắt đã chọn
            </button>
            <button id="fs-bulk-delete-btn" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition">
              Xóa đã chọn
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead>
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
            </thead>
            <tbody id="flash-tbody" class="divide-y divide-gray-50">
              <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-400 text-sm">Đang tải...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div id="flash-pagination" class="p-4 border-t border-gray-100 flex items-center justify-between"></div>
      </div>
    </div>
  `;

  // Intercept keydown on the setup form to block Enter key submit, and run quick pricing calculation instead if targeted inside bulk input
  const setupForm = container.querySelector('#create-flash-form');
  setupForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (e.target.id === 'fs-bulk-val') {
        e.preventDefault();
        container.querySelector('#fs-apply-bulk-price').click();
      } else {
        e.preventDefault();
      }
    }
  });

  initProductSelector(container);

  let currentMode = 'days';
  
  const modeDaysBtn = container.querySelector('#fs-mode-days');
  const modeRangeBtn = container.querySelector('#fs-mode-range');
  const modeForeverBtn = container.querySelector('#fs-mode-forever');
  const durationContainer = container.querySelector('#fs-duration-container');
  const endContainer = container.querySelector('#fs-end-container');
  const endInput = container.querySelector('#fs-end');

  const updateModeUI = (mode) => {
    currentMode = mode;
    
    // Reset classes
    modeDaysBtn.className = 'py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-gray-500 hover:text-gray-700 transition-all focus:outline-none';
    modeRangeBtn.className = 'py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-gray-500 hover:text-gray-700 transition-all focus:outline-none';
    modeForeverBtn.className = 'py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-gray-500 hover:text-gray-700 transition-all focus:outline-none';

    if (mode === 'days') {
      modeDaysBtn.className = 'py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-[#C9A84C] bg-white shadow-sm transition-all focus:outline-none';
      durationContainer.classList.remove('hidden');
      endContainer.classList.add('hidden');
      endInput.removeAttribute('required');
    } else if (mode === 'range') {
      modeRangeBtn.className = 'py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-[#C9A84C] bg-white shadow-sm transition-all focus:outline-none';
      durationContainer.classList.add('hidden');
      endContainer.classList.remove('hidden');
      endInput.setAttribute('required', 'required');
    } else if (mode === 'forever') {
      modeForeverBtn.className = 'py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-[#C9A84C] bg-white shadow-sm transition-all focus:outline-none';
      durationContainer.classList.add('hidden');
      endContainer.classList.add('hidden');
      endInput.removeAttribute('required');
    }
  };

  modeDaysBtn.addEventListener('click', () => updateModeUI('days'));
  modeRangeBtn.addEventListener('click', () => updateModeUI('range'));
  modeForeverBtn.addEventListener('click', () => updateModeUI('forever'));

  // Submit Handler
  setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.selectedProducts.size === 0) {
      showToast('Vui lòng chọn ít nhất một sản phẩm để tạo Flash Sale!', 'error');
      return;
    }

    const campaignName = container.querySelector('#fs-campaign-name').value.trim();
    if (!campaignName) {
      showToast('Vui lòng nhập Tên chiến dịch!', 'error');
      return;
    }

    const startVal = container.querySelector('#fs-start').value;
    if (!startVal) {
      showToast('Vui lòng chọn Ngày & Giờ Bắt Đầu!', 'error');
      return;
    }

    // Validate pricing of selected products
    let hasInvalidPrice = false;
    state.selectedProducts.forEach((price) => {
      if (price === undefined || price === null || isNaN(price) || price <= 0) {
        hasInvalidPrice = true;
      }
    });

    if (hasInvalidPrice) {
      showToast('Vui lòng nhập giá Flash Sale hợp lệ (> 0) cho tất cả sản phẩm đã chọn!', 'error');
      return;
    }

    const startDateObj = new Date(startVal);
    let endDateObj = null;

    if (currentMode === 'days') {
      const daysInput = container.querySelector('#fs-duration-days');
      const durationDays = parseFloat(daysInput.value);
      if (isNaN(durationDays) || durationDays <= 0) {
        showToast('Vui lòng nhập số ngày chạy Flash Sale hợp lệ!', 'error');
        return;
      }
      endDateObj = new Date(startDateObj.getTime() + durationDays * 24 * 60 * 60 * 1000);
    } else if (currentMode === 'range') {
      const endVal = container.querySelector('#fs-end').value;
      if (!endVal) {
        showToast('Vui lòng chọn Ngày & Giờ Kết Thúc!', 'error');
        return;
      }
      endDateObj = new Date(endVal);
      if (endDateObj <= startDateObj) {
        showToast('Ngày & Giờ Kết Thúc phải lớn hơn Ngày & Giờ Bắt Đầu!', 'error');
        return;
      }
    }

    const formatDateTime = (date) => {
      if (!date) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const productsPayload = [];
    state.selectedProducts.forEach((price, pid) => {
      productsPayload.push({
        product_id: pid,
        sale_price: price
      });
    });

    const payload = {
      campaign_name: campaignName,
      products: productsPayload,
      start_time: formatDateTime(startDateObj),
      end_time: endDateObj ? formatDateTime(endDateObj) : '',
      is_active: 1
    };

    const submitBtn = container.querySelector('#fs-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = state.editingCampaign ? 'Đang cập nhật...' : 'Đang kích hoạt...';

    try {
      if (state.editingCampaign) {
        const updatePayload = {
          old_campaign_name: state.editingCampaign.campaign_name,
          old_start_time: state.editingCampaign.start_time,
          old_end_time: state.editingCampaign.end_time,
          ...payload
        };
        await updateFlashSaleCampaign(updatePayload);
        showToast('Cập nhật chiến dịch Flash Sale thành công!');
        
        state.editingCampaign = null;
        container.querySelector('#fs-cancel-edit-btn')?.remove();
        container.querySelector('#create-flash-form').previousElementSibling.textContent = '1. Thiết Lập Chiến Dịch';
      } else {
        await createFlashSale(payload);
        showToast(`Đã tạo chiến dịch Flash Sale thành công cho ${productsPayload.length} sản phẩm!`);
      }
      
      state.selectedProducts.clear();
      container.querySelector('#fs-campaign-name').value = '';
      container.querySelector('#fs-start').value = '';
      container.querySelector('#fs-end').value = '';
      container.querySelector('#fs-selected-count').textContent = '0';
      container.querySelector('#fs-select-all-visible').checked = false;
      
      // Reset mode
      container.querySelector('#fs-mode-days').click();
      container.querySelector('#fs-duration-days').value = '1';

      renderProductList(container);
      loadFlashSalesList(container);
    } catch (err) {
      showToast(err.message || 'Lỗi lưu dữ liệu', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Kích Hoạt Flash Sale Hàng Loạt';
    }
  });

  loadFlashSalesList(container);
}
