import { getMemberDetail, adjustMemberPoints, toggleMemberBlacklist } from '../../../services/adminService.js';
import { showToast, hasPermission, getRankBadgeHtml } from '../shared/ui.js';

const STATUS_LABELS = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Đang xử lý',
  shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy', returned: 'Đã trả',
};
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipping: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  returned: 'bg-gray-100 text-gray-700 border-gray-200',
};
};
const ACTION_ICONS = {
  login: '🔐', page_view: '👁️', product_view: '🛍️',
};
const ACTION_LABELS = {
  login: 'Đăng nhập', page_view: 'Xem trang', product_view: 'Xem sản phẩm',
};

const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '—';
const fmtMoney = (v) => Number(v || 0).toLocaleString('vi-VN') + 'đ';

let memberCharts = {};
let currentChartRange = '7';
let currentStartDate = null;
let currentEndDate = null;

export function renderMemberDetail(container, userId, goBack) {
  currentChartRange = '7';
  currentStartDate = null;
  currentEndDate = null;
  container.innerHTML = `
    <div class="space-y-5 max-w-[1600px] mx-auto p-2">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <button id="back-to-members" class="p-2 rounded-xl hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700 flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-black text-gray-900 tracking-tight leading-none">Chi tiết khách hàng</h2>
          <p class="text-xs text-gray-400 mt-0.5 font-medium">Báo cáo phân tích hành vi, đơn hàng & điểm thưởng tích lũy</p>
        </div>
      </div>
      <div id="member-detail-body">
        <div class="flex items-center justify-center py-16">
          <div class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C9A84C] rounded-full"></div>
          <span class="ml-3 text-xs text-gray-500 font-semibold">Đang tải hồ sơ phân tích...</span>
        </div>
      </div>
    </div>
  `;
  container.querySelector('#back-to-members').addEventListener('click', goBack);
  loadDetail(container, userId, goBack);
}

async function loadDetail(container, userId, goBack) {
  const body = container.querySelector('#member-detail-body');
  try {
    const res = await getMemberDetail(userId, {
      days: currentChartRange,
      start_date: currentStartDate,
      end_date: currentEndDate
    });
    renderContent(body, res.data, container, userId, goBack);
  } catch (err) {
    body.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
        <div class="text-red-500 text-sm font-semibold">${err.message || 'Lỗi tải dữ liệu'}</div>
        <button id="retry-btn" class="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition">Thử lại</button>
      </div>
    `;
    body.querySelector('#retry-btn')?.addEventListener('click', () => loadDetail(container, userId, goBack));
  }
}

async function updateTrendChart(container, userId) {
  const chartWrapper = container.querySelector('#member-trend-chart')?.parentNode;
  if (!chartWrapper) return;
  
  // Show a mini loader in chart area
  const loader = document.createElement('div');
  loader.className = 'absolute inset-0 bg-white/70 flex items-center justify-center text-xs font-semibold text-gray-500 z-10';
  loader.innerHTML = '<div class="animate-spin w-4 h-4 border-2 border-gray-300 border-t-[#C9A84C] rounded-full mr-2"></div>Đang tải dữ liệu...';
  chartWrapper.appendChild(loader);

  try {
    const res = await getMemberDetail(userId, {
      days: currentChartRange,
      start_date: currentStartDate,
      end_date: currentEndDate
    });
    
    loader.remove();
    renderMemberCharts(res.data);
  } catch (err) {
    loader.innerHTML = `<span class="text-red-500 text-[10px]">${err.message || "Lỗi tải biểu đồ"}</span>`;
  }
}

function renderContent(body, data, container, userId, goBack) {
  const { profile, orders, order_stats: stats, points_history, login_history, page_views, product_views, activity_timeline } = data;

  body.innerHTML = `
    <!-- ── KPI Cards ── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-default hidden">
        <div class="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-[#C9A84C]"></div>
        <div class="text-2xl font-black text-gray-900 tracking-tight leading-none">${Number(profile.points || 0).toLocaleString('vi-VN')}</div>
        <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Điểm tích lũy</div>
      </div>
      
      <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-default">
        <div class="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-emerald-500"></div>
        <div class="text-2xl font-black text-gray-900 tracking-tight leading-none">${fmtMoney(profile.total_spend)}</div>
        <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Tổng chi tiêu</div>
      </div>
      
      <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-default">
        <div class="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-blue-500"></div>
        <div class="text-2xl font-black text-gray-900 tracking-tight leading-none">${stats?.total_orders || 0}</div>
        <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Tổng đơn hàng</div>
      </div>
      
      <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-default">
        <div class="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-purple-500"></div>
        <div class="text-2xl font-black text-gray-900 tracking-tight leading-none">${fmtMoney(stats?.avg_order_value)}</div>
        <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Trung bình / Đơn</div>
      </div>
    </div>

    <!-- ── Main split column layout ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
      
      <!-- Left Analytics Column (2/3 width) -->
      <div class="lg:col-span-2 space-y-5">
        
        <!-- Activity Chart -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col relative" id="member-trend-chart-card">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wider leading-none">Tương tác hoạt động</h3>
              <p id="member-trend-chart-desc" class="text-[10px] text-gray-400 mt-1 font-medium">
                ${currentChartRange === 'custom' && currentStartDate && currentEndDate
                  ? `Số lượt hành vi của người dùng từ ngày ${new Date(currentStartDate).toLocaleDateString('vi-VN')} đến ngày ${new Date(currentEndDate).toLocaleDateString('vi-VN')}`
                  : currentChartRange === '30'
                    ? 'Số lượt hành vi của người dùng trong 30 ngày gần đây'
                    : currentChartRange === '365'
                      ? 'Số lượt hành vi của người dùng trong 1 năm gần đây'
                      : 'Số lượt hành vi của người dùng trong 7 ngày gần đây'}
              </p>
            </div>
            
            <div class="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <div class="flex bg-gray-100 p-0.5 rounded-lg border border-gray-100 gap-0.5 shadow-sm text-[9px] font-bold">
                ${[['7', '7N'], ['30', '30N'], ['365', '1N'], ['custom', 'Tùy chọn']].map(([value, label]) => `
                  <button class="member-chart-range-btn px-2.5 py-1.5 rounded-md transition-all duration-150 ${value === currentChartRange ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}" data-range="${value}">${label}</button>
                `).join('')}
              </div>
            </div>
          </div>
          
          <!-- Custom Date Input Container -->
          <div id="member-custom-date-container" class="${currentChartRange === 'custom' ? 'flex' : 'hidden'} items-center gap-1.5 bg-white border border-gray-150 p-1.5 rounded-xl shadow-sm text-[9px] mb-4 w-max">
            <div class="flex items-center gap-1 text-gray-500 font-semibold">
              <span class="pl-1 text-gray-400">Từ</span>
              <input type="date" id="member-start-date" value="${currentStartDate || ''}" class="px-2 py-0.5 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#C9A84C] text-[9px] font-bold text-gray-700 bg-gray-50">
            </div>
            <div class="flex items-center gap-1 text-gray-500 font-semibold">
              <span class="text-gray-400">—</span>
              <input type="date" id="member-end-date" value="${currentEndDate || ''}" class="px-2 py-0.5 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#C9A84C] text-[9px] font-bold text-gray-700 bg-gray-50">
            </div>
            <button id="member-apply-date-btn" class="bg-[#C9A84C] text-white px-2.5 py-1.5 rounded-lg text-[9px] font-bold hover:bg-[#b8963e] transition-colors shadow-sm uppercase tracking-wider">Lọc</button>
          </div>

          <div class="relative h-44"><canvas id="member-trend-chart"></canvas></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Behavior breakdown doughnut -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center">
            <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wider self-start mb-4 leading-none">Phân bổ hành vi</h3>
            <div class="relative h-40 w-full mb-3"><canvas id="member-behavior-chart"></canvas></div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] w-full text-gray-500 font-bold uppercase mt-1 tracking-wider">
              <div class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>Mua hàng</div>
              <div class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"></span>Xem SP</div>
              <div class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>Xem trang</div>
              <div class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></span>Đăng nhập</div>
            </div>
          </div>

          <!-- Top viewed pages / items -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 leading-none">Sản phẩm xem nhiều</h3>
            <div class="space-y-3 flex-1 overflow-y-auto">
              ${(product_views || []).slice(0, 4).map(p => `
                <div class="flex items-center justify-between text-xs pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                  <span class="font-medium text-gray-700 truncate max-w-[170px]" title="${p.product_name || `SP #${p.product_id}`}">${p.product_name || `SP #${p.product_id}`}</span>
                  <span class="px-2 py-0.5 bg-amber-50 text-[#C9A84C] font-bold rounded text-[9px] border border-amber-100">${p.view_count} xem</span>
                </div>
              `).join('') || '<div class="text-center py-8 text-gray-400 text-xs">Chưa có dữ liệu sản phẩm</div>'}
            </div>
          </div>
        </div>

      </div>

      <!-- Right Profile & Actions Column (1/3 width) -->
      <div class="space-y-5">
        
        <!-- Profile Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div class="flex flex-col items-center text-center pb-4 border-b border-gray-100">
            <div class="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-2xl font-bold text-[#C9A84C] overflow-hidden ring-4 ring-[#C9A84C]/5 mb-3 flex-shrink-0">
              ${profile.avatar
                ? `<img src="${profile.avatar}" class="w-full h-full object-cover" />`
                : `<span>${(profile.full_name || 'U').charAt(0).toUpperCase()}</span>`}
            </div>
            <h3 class="text-sm font-bold text-gray-900 flex items-center justify-center gap-1.5">
              ${profile.full_name || 'Khách ẩn danh'}
              ${getRankBadgeHtml(profile.rank)}
            </h3>
            <div class="text-xs text-gray-400 mt-1">${profile.email || 'Không có email'}</div>
          </div>
          <div class="pt-4 space-y-2.5 text-xs text-gray-600">
            <div class="flex items-center gap-2"><span class="text-gray-400 w-24">Điện thoại:</span><span class="font-semibold text-gray-800 font-mono">${profile.phone || '—'}</span></div>
            <div class="flex items-center gap-2"><span class="text-gray-400 w-24">Ngày sinh:</span><span>${profile.birthday ? new Date(profile.birthday).toLocaleDateString('vi-VN') : '—'}</span></div>
            <div class="flex items-center gap-2"><span class="text-gray-400 w-24">Ngày tham gia:</span><span>${profile.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : '—'}</span></div>
            <div class="flex items-center gap-2"><span class="text-gray-400 w-24">Đăng nhập cuối:</span><span class="font-medium text-gray-700">${fmtDate(profile.last_login_at)}</span></div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400 w-24">Trạng thái:</span>
              ${profile.is_blacklisted == 1 
                ? '<span class="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-200 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Blacklist</span>' 
                : '<span class="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-200 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Hoạt động</span>'}
            </div>
          </div>
        </div>

        <!-- Loyalty Actions Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-50 leading-none">Thao tác tài khoản</h3>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <div class="text-xs font-bold text-gray-800">Danh sách đen</div>
                <div class="text-[9px] text-gray-400 font-semibold uppercase mt-0.5">Chặn tạo đổi trả hàng</div>
              </div>
              <button id="detail-toggle-blacklist-btn" class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${profile.is_blacklisted == 1 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors">
                ${profile.is_blacklisted == 1 ? 'Mở Khóa' : 'Khóa'}
              </button>
            </div>
            
            <div class="border-t border-gray-100 pt-3 hidden">
              <button id="detail-adjust-points-btn" class="w-full py-2.5 bg-gray-950 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Điều chỉnh điểm tích lũy
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ── Bottom Tab Details Section ── -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="border-b border-gray-100 px-4 overflow-x-auto bg-gray-50/50">
        <div class="flex gap-0 min-w-max">
          ${renderTabBtn('orders', '🛒', `Đơn hàng (${orders?.length || 0})`, true)}
          ${renderTabBtn('activity', '📊', `Hoạt động (${activity_timeline?.length || 0})`)}
          ${renderTabBtn('logins', '🔐', `Đăng nhập (${login_history?.length || 0})`)}
          ${renderTabBtn('pages', '👁️', `Trang đã xem (${page_views?.length || 0})`)}
        </div>
      </div>

      <div id="tab-orders" class="tab-content p-5">${renderOrdersTab(orders)}</div>
      <div id="tab-activity" class="tab-content p-5 hidden">${renderActivityTab(activity_timeline)}</div>
      <div id="tab-logins" class="tab-content p-5 hidden">${renderLoginsTab(login_history)}</div>
      <div id="tab-pages" class="tab-content p-5 hidden">${renderPagesTab(page_views)}</div>
    </div>
  `;

  // Draw Charts
  renderMemberCharts(data);

  // Range button listeners
  const chartCard = body.querySelector('#member-trend-chart-card');
  if (chartCard) {
    const rangeBtns = chartCard.querySelectorAll('.member-chart-range-btn');
    const customDateContainer = chartCard.querySelector('#member-custom-date-container');
    const descText = chartCard.querySelector('#member-trend-chart-desc');

    rangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.range;
        currentChartRange = val;

        // Toggle active button design
        rangeBtns.forEach(b => {
          b.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
          b.classList.add('text-gray-500');
        });
        btn.classList.remove('text-gray-500');
        btn.classList.add('bg-white', 'text-gray-900', 'shadow-sm');

        if (val === 'custom') {
          customDateContainer.classList.remove('hidden');
          customDateContainer.classList.add('flex');
        } else {
          customDateContainer.classList.remove('flex');
          customDateContainer.classList.add('hidden');
          currentStartDate = null;
          currentEndDate = null;

          // Update description
          if (val === '7') {
            descText.textContent = 'Số lượt hành vi của người dùng trong 7 ngày gần đây';
          } else if (val === '30') {
            descText.textContent = 'Số lượt hành vi của người dùng trong 30 ngày gần đây';
          } else if (val === '365') {
            descText.textContent = 'Số lượt hành vi của người dùng trong 1 năm gần đây';
          }

          updateTrendChart(container, userId);
        }
      });
    });

    // Custom date apply button
    chartCard.querySelector('#member-apply-date-btn')?.addEventListener('click', () => {
      const start = chartCard.querySelector('#member-start-date').value;
      const end = chartCard.querySelector('#member-end-date').value;

      if (!start || !end) {
        showToast('Vui lòng chọn đầy đủ từ ngày và đến ngày.', 'error');
        return;
      }
      if (new Date(start) > new Date(end)) {
        showToast('Ngày bắt đầu không được lớn hơn ngày kết thúc.', 'error');
        return;
      }

      currentStartDate = start;
      currentEndDate = end;

      // Format label for description
      const fmtStart = new Date(start).toLocaleDateString('vi-VN');
      const fmtEnd = new Date(end).toLocaleDateString('vi-VN');
      descText.textContent = `Số lượt hành vi của người dùng từ ngày ${fmtStart} đến ngày ${fmtEnd}`;

      updateTrendChart(container, userId);
    });
  }

  // Tab switching
  body.querySelectorAll('.detail-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      body.querySelectorAll('.detail-tab').forEach(t => {
        t.classList.remove('border-gray-900', 'text-gray-900');
        t.classList.add('border-transparent', 'text-gray-400');
      });
      tab.classList.remove('border-transparent', 'text-gray-400');
      tab.classList.add('border-gray-900', 'text-gray-900');
      body.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      body.querySelector(`#tab-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });

  // Action listeners
  body.querySelector('#detail-adjust-points-btn')?.addEventListener('click', () => {
    showAdjustPointsModal(profile, () => loadDetail(container, userId, goBack));
  });

  body.querySelector('#detail-toggle-blacklist-btn')?.addEventListener('click', async () => {
    if (!hasPermission('users:blacklist')) {
      showToast('Bạn không có quyền thực hiện chức năng này.', 'error');
      return;
    }
    try {
      await toggleMemberBlacklist(profile.id);
      showToast('Cập nhật trạng thái blacklist thành công');
      loadDetail(container, userId, goBack);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function renderTabBtn(id, icon, label, active = false) {
  return `<button class="detail-tab px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest border-b-2 ${
    active ? 'border-gray-900 text-gray-900 font-black' : 'border-transparent text-gray-400 hover:text-gray-600'
  } transition whitespace-nowrap" data-tab="${id}">
    <span class="flex items-center gap-2">${icon} ${label}</span>
  </button>`;
}

function emptyState(icon, text) {
  return `<div class="text-center py-10 border border-dashed border-gray-100 rounded-xl"><div class="text-2xl mb-1.5">${icon}</div><div class="text-xs text-gray-400 font-semibold">${text}</div></div>`;
}

// ========== ORDERS TAB ==========
function renderOrdersTab(orders) {
  if (!orders?.length) return emptyState('🛒', 'Khách hàng chưa có đơn hàng nào');
  return `<div class="space-y-3">${orders.map(o => {
    const finalAmount = Number(o.total_amount || 0) - Number(o.discount_amount || 0);
    return `
      <div class="border border-gray-100 rounded-2xl p-4 hover:border-gray-200 hover:shadow-sm transition-all bg-gray-50/20">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">#${o.id}</span>
            <span class="px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700 border-gray-200'}">${STATUS_LABELS[o.status] || o.status}</span>
            ${o.payment_method ? `<span class="text-[9px] text-gray-400 uppercase font-bold tracking-wider">${o.payment_method}</span>` : ''}
          </div>
          <div class="text-right">
            <div class="text-sm font-black text-gray-950">${fmtMoney(finalAmount)}</div>
            <div class="text-[9px] text-gray-400 font-semibold">${fmtDate(o.created_at)}</div>
          </div>
        </div>
        ${o.items?.length ? `<div class="space-y-2 pl-3 border-l-2 border-gray-200">
          ${o.items.map(item => `<div class="flex items-center justify-between text-xs text-gray-600">
            <div class="flex-1 min-w-0"><span class="font-medium text-gray-800">${item.product_name}</span> <span class="text-gray-400 font-bold">×${item.quantity}</span></div>
            <span class="font-semibold ml-2 flex-shrink-0">${fmtMoney(Number(item.product_price || 0) * Number(item.quantity || 1))}</span>
          </div>`).join('')}
        </div>` : ''}
      </div>`;
  }).join('')}</div>`;
}

// ========== ACTIVITY TIMELINE TAB ==========
function renderActivityTab(timeline) {
  if (!timeline?.length) return emptyState('📊', 'Chưa có dữ liệu hoạt động');
  return `<div class="divide-y divide-gray-50 max-h-[400px] overflow-y-auto pr-1">${timeline.map(a => `
    <div class="py-3.5 flex items-start gap-3">
      <div class="text-lg flex-shrink-0 mt-0.5">${ACTION_ICONS[a.action_type] || '📌'}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-gray-800">${ACTION_LABELS[a.action_type] || a.action_type}</span>
          ${a.product_name ? `<span class="text-xs text-[#C9A84C] font-semibold">${a.product_name}</span>` : ''}
        </div>
        <div class="text-[10px] text-gray-400 mt-1 flex items-center gap-3 flex-wrap font-medium">
          ${a.page_path ? `<span>📄 ${a.page_path}</span>` : ''}
          ${a.device_type ? `<span>💻 ${a.device_type}</span>` : ''}
          ${a.browser ? `<span>🌐 ${a.browser}</span>` : ''}
          ${a.ip_address ? `<span class="font-mono">${a.ip_address}</span>` : ''}
        </div>
      </div>
      <div class="text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap font-medium">${fmtDate(a.created_at)}</div>
    </div>
  `).join('')}</div>`;
}

// ========== LOGIN HISTORY TAB ==========
function renderLoginsTab(logins) {
  if (!logins?.length) return emptyState('🔐', 'Chưa có lịch sử đăng nhập');
  return `
    <div class="overflow-x-auto border border-gray-100 rounded-xl">
      <table class="w-full text-xs text-left">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <th class="px-4 py-3">Thời gian</th>
            <th class="px-4 py-3">IP Address</th>
            <th class="px-4 py-3">Thiết bị</th>
            <th class="px-4 py-3">Trình duyệt</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          ${logins.map(l => `
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-semibold text-gray-800">${fmtDate(l.created_at)}</td>
              <td class="px-4 py-3 font-mono text-gray-500">${l.ip_address || '—'}</td>
              <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${l.device_type === 'mobile' ? 'bg-blue-50 text-blue-700' : l.device_type === 'tablet' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'}">${l.device_type || '—'}</span></td>
              <td class="px-4 py-3 text-gray-600 font-medium">${l.browser || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ========== PAGE VIEWS TAB ==========
function renderPagesTab(pages) {
  if (!pages?.length) return emptyState('👁️', 'Chưa có dữ liệu trang đã xem');
  return `
    <div class="overflow-x-auto border border-gray-100 rounded-xl">
      <table class="w-full text-xs text-left">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <th class="px-4 py-3">Đường dẫn</th>
            <th class="px-4 py-3 text-center">Số lần xem</th>
            <th class="px-4 py-3">Lần cuối</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          ${pages.map(p => `
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-mono font-semibold text-gray-800">${p.page_path}</td>
              <td class="px-4 py-3 text-center"><span class="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full font-bold">${p.view_count}</span></td>
              <td class="px-4 py-3 text-gray-500 font-semibold">${fmtDate(p.last_viewed)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ========== POINTS TAB ==========
function renderPointsTab(history) {
  if (!history?.length) return emptyState('💰', 'Chưa có lịch sử tích lũy điểm');
  return `<div class="divide-y divide-gray-50 max-h-[400px] overflow-y-auto pr-1">${history.map(h => `
    <div class="py-3 flex items-center justify-between">
      <div>
        <div class="text-xs font-bold text-gray-800">${h.description || 'Giao dịch điểm'}</div>
        <div class="text-[10px] text-gray-400 mt-1 font-semibold">${fmtDate(h.created_at)}</div>
      </div>
      <div class="font-black text-sm ${h.action_type === 'earn' || h.action_type === 'welcome_bonus' ? 'text-green-600' : 'text-red-600'}">
        ${h.action_type === 'earn' || h.action_type === 'welcome_bonus' ? '+' : '-'}${Number(h.points).toLocaleString('vi-VN')}
      </div>
    </div>
  `).join('')}</div>`;
}

function renderMemberCharts(data) {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js is not loaded globally.');
    return;
  }

  const activity = data.activity_timeline || [];
  const orders = data.orders || [];

  // Destroy previous charts to avoid reuse issues
  if (memberCharts.trend) memberCharts.trend.destroy();
  if (memberCharts.behavior) memberCharts.behavior.destroy();

  // 1. Line Chart (Activity Trend)
  let dateLabels = [];
  let activityCounts = [];

  if (data.chart_data) {
    dateLabels = data.chart_data.map(item => item.label);
    activityCounts = data.chart_data.map(item => item.count);
  } else {
    // Fallback: calculate client-side for last 7 days
    const days = 7;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
      dateLabels.push(label);

      const targetDateStr = d.toISOString().split('T')[0];
      const dayActivities = activity.filter(a => a.created_at && a.created_at.startsWith(targetDateStr));
      const dayOrders = orders.filter(o => o.created_at && o.created_at.startsWith(targetDateStr));
      activityCounts.push(dayActivities.length + dayOrders.length);
    }
  }

  const hoverLinePlugin = {
    id: 'hoverLine',
    afterDraw(chart) {
      if (chart.tooltip?._active?.length) {
        const activePoint = chart.tooltip._active[0];
        const ctx = chart.ctx;
        const x = activePoint.element.x;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const ctxTrend = document.getElementById('member-trend-chart')?.getContext('2d');
  if (ctxTrend) {
    const gradient = ctxTrend.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(201, 168, 76, 0.25)');
    gradient.addColorStop(1, 'rgba(201, 168, 76, 0)');

    memberCharts.trend = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: dateLabels,
        datasets: [{
          label: 'Tương tác',
          data: activityCounts,
          borderColor: '#C9A84C',
          borderWidth: 2.5,
          pointBackgroundColor: '#C9A84C',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointRadius: 2.5,
          tension: 0.35,
          fill: true,
          backgroundColor: gradient,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 8,
            backgroundColor: '#0f172a',
            titleFont: { size: 10, weight: 'bold' },
            bodyFont: { size: 10 },
            callbacks: {
              label(context) {
                return ` ${context.raw} tương tác`;
              }
            }
          }
        },
        scales: {
          x: { 
            grid: { display: false }, 
            ticks: { color: '#94a3b8', font: { size: 9, weight: '500' } } 
          },
          y: { 
            grid: { color: '#f1f5f9' }, 
            ticks: { 
              color: '#94a3b8', 
              font: { size: 9 }, 
              stepSize: data.chart_group_type === 'month' ? undefined : 1 
            }, 
            beginAtZero: true 
          }
        }
      },
      plugins: [hoverLinePlugin]
    });
  }

  // 2. Doughnut Chart (Behavior breakdown)
  const behaviorCounts = {
    page_view: 0,
    product_view: 0,
    login: 0,
    orders: orders.length
  };

  activity.forEach(a => {
    if (a.action_type === 'page_view') behaviorCounts.page_view++;
    else if (a.action_type === 'product_view') behaviorCounts.product_view++;
    else if (a.action_type === 'login') behaviorCounts.login++;
  });

  const behaviorData = [
    behaviorCounts.orders,
    behaviorCounts.product_view,
    behaviorCounts.page_view,
    behaviorCounts.login
  ];

  const totalActions = behaviorData.reduce((sum, val) => sum + val, 0);

  const ctxBehavior = document.getElementById('member-behavior-chart')?.getContext('2d');
  if (ctxBehavior) {
    memberCharts.behavior = new Chart(ctxBehavior, {
      type: 'doughnut',
      data: {
        labels: ['Mua hàng', 'Xem sản phẩm', 'Xem trang', 'Đăng nhập'],
        datasets: [{
          data: behaviorData,
          backgroundColor: ['#10b981', '#C9A84C', '#3b82f6', '#8b5cf6'],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 8,
            backgroundColor: '#0f172a',
            titleFont: { size: 10, weight: 'bold' },
            bodyFont: { size: 10 },
            callbacks: {
              label(context) {
                const val = context.raw;
                const pct = totalActions ? Math.round((val / totalActions) * 100) : 0;
                return ` ${context.label}: ${val} (${pct}%)`;
              }
            }
          }
        },
        cutout: '72%',
      },
      plugins: [{
        id: 'centerText',
        beforeDraw(chart) {
          const { ctx, chartArea: { top, bottom, left, right } } = chart;
          ctx.save();
          const centerX = (left + right) / 2;
          const centerY = (top + bottom) / 2;
          ctx.font = 'bold 15px sans-serif';
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(totalActions.toLocaleString('vi-VN'), centerX, centerY - 5);
          
          ctx.font = '700 8px sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText('HOẠT ĐỘNG', centerX, centerY + 10);
          ctx.restore();
        }
      }]
    });
  }
}

function showAdjustPointsModal(user, reloadCallback) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
  modal.setAttribute('data-lenis-prevent', 'true');
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
        <h3 class="text-xs font-bold text-gray-900 uppercase tracking-wider">Điều chỉnh điểm</h3>
        <button id="close-modal-btn" class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Số điểm điều chỉnh</label>
          <input type="number" id="adjust-pts-val" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C] font-semibold" placeholder="Ví dụ: 1000 hoặc -500">
          <p class="text-[9px] text-gray-400 mt-1 font-semibold">Nhập số âm để trừ điểm</p>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Lý do điều chỉnh</label>
          <input type="text" id="adjust-pts-reason" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C]" placeholder="Ví dụ: Tặng quà sinh nhật">
        </div>
        <button id="submit-adjust-btn" class="w-full py-2 bg-gray-950 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm">Xác nhận điều chỉnh</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const close = () => modal.remove();

  modal.querySelector('#close-modal-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  modal.querySelector('#submit-adjust-btn').addEventListener('click', async () => {
    const pts = parseInt(modal.querySelector('#adjust-pts-val').value);
    const reason = modal.querySelector('#adjust-pts-reason').value.trim();

    if (isNaN(pts) || pts === 0) {
      alert('Vui lòng nhập số điểm hợp lệ khác 0.');
      return;
    }
    if (!reason) {
      alert('Vui lòng cung cấp lý do điều chỉnh.');
      return;
    }

    try {
      await adjustMemberPoints(user.id, pts, reason);
      showToast('Đã điều chỉnh điểm tích lũy thành công');
      close();
      reloadCallback();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
