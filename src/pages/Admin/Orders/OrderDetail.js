import { updateOrderStatus, getOrder } from '../../../services/adminService.js?v=1.0.82';
import { formatPrice, formatDate, showToast, showShippingModal, copyToClipboard } from '../shared/ui.js?v=1.0.82';

function getImgSrc(img) {
  if (!img) return 'https://images.pexels.com/photos/236915/pexels-photo-236915.jpeg?auto=compress&cs=tinysrgb&w=400';
  if (img.startsWith('http')) return img;
  const apiBase = `${window.location.origin}/backend/public`;
  if (img.startsWith('../backend/public/')) {
    return img.replace('../backend/public', apiBase);
  }
  if (img.startsWith('/backend/public/')) {
    return img.replace('/backend/public', apiBase);
  }
  if (img.startsWith('backend/public/')) {
    return img.replace('backend/public', apiBase);
  }
  return `./image/product/${img}`;
}

const STATUS_STEPS = ['pending', 'processing', 'shipping', 'completed'];
const STATUS_LABELS = {
  pending: 'Chờ xử lý', processing: 'Đang xử lý',
  shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy',
};

export function renderOrderDetail(container, orderId, onBack) {
  container.innerHTML = `<div class="text-center py-12 text-gray-400">Đang tải đơn hàng...</div>`;
  loadDetail(container, orderId, onBack);
}

async function loadDetail(container, orderId, onBack) {
  try {
    const res = await getOrder(orderId);
    const order = res.data || res;
    renderDetail(container, order, onBack);
  } catch {
    container.innerHTML = `<div class="text-center py-12 text-red-400">Không tải được đơn hàng</div>`;
  }
}

function renderDetail(container, order, onBack) {
  const isCancelled = order.status === 'cancelled';
  const currentIdx = STATUS_STEPS.indexOf(order.status);

  const historyList = [...(order.history || [])];
  const hasCreation = historyList.some(h => !h.old_status);
  if (!hasCreation) {
    historyList.push({
      old_status: null,
      new_status: 'pending',
      changed_by: order.customer_name || (order.user && order.user.name) || 'Khách hàng',
      note: 'Đơn hàng được tạo thành công',
      created_at: order.created_at
    });
  }

  const subtotal = Number(order.total_amount || 0) - Number(order.shipping_fee || 0) + Number(order.discount_amount || 0);
  const total = Number(order.total_amount || 0);

  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <button id="od-back" class="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Đơn hàng #${order.id}</h2>
          <p class="text-sm text-gray-500">${formatDate(order.created_at)}</p>
        </div>
        <div class="ml-auto">
          <span class="px-3 py-1.5 text-sm rounded-full font-semibold ${statusClass(order.status)}">${STATUS_LABELS[order.status] || order.status}</span>
        </div>
      </div>

      ${!isCancelled ? `
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Trạng thái đơn hàng</h3>
        <div class="flex items-center justify-between relative">
          <div class="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
          <div class="absolute top-4 left-0 h-0.5 bg-[#C9A84C] z-0 transition-all" style="width:${currentIdx >= 0 ? (currentIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%"></div>
          ${STATUS_STEPS.map((s, i) => `
            <div class="flex flex-col items-center z-10 flex-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${i <= currentIdx ? 'bg-[#C9A84C] border-[#C9A84C] text-white' : 'bg-white border-gray-300 text-gray-400'}">
                ${i < currentIdx ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : i + 1}
              </div>
              <p class="text-xs mt-1 font-medium ${i <= currentIdx ? 'text-gray-700' : 'text-gray-400'}">${STATUS_LABELS[s]}</p>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Thông tin khách hàng</h3>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex gap-2"><span class="text-gray-400 w-28">Họ tên:</span><span class="font-medium text-gray-800">${order.customer_name || order.user?.name || '—'}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-28">Email:</span><span>${order.customer_email || order.user?.email || '—'}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-28">Điện thoại:</span><span>${order.customer_phone || '—'}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-28">Địa chỉ:</span><span>${order.shipping_address || '—'}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-28">ĐV vận chuyển:</span><span class="font-medium text-zinc-950 font-bold">${order.shipping_carrier || '—'}</span></div>
            <div class="flex gap-2 items-center"><span class="text-gray-400 w-28">Mã vận đơn:</span><span class="font-mono font-bold text-zinc-950">${order.tracking_code || '—'}</span>${order.tracking_code ? `<button id="btn-admin-copy-tracking" class="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition" title="Sao chép mã"><svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>` : ''}</div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Thông tin thanh toán</h3>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex gap-2"><span class="text-gray-400 w-28">Phương thức:</span><span>${order.payment_method || '—'}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-28">Tạm tính:</span><span>${formatPrice(subtotal)}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-28">Phí ship:</span><span>${formatPrice(order.shipping_fee)}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-28 font-semibold">Tổng cộng:</span><span class="text-[#C9A84C] font-bold text-base">${formatPrice(total)}</span></div>
          </div>
        </div>
      </div>

      <!-- Order History Section -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Lịch sử thay đổi trạng thái</h3>
        <div class="flow-root">
          <ul role="list" class="-mb-8">
            ${historyList.map((h, hIdx) => {
              const isCreation = !h.old_status;
              const title = isCreation 
                ? `Đơn hàng được tạo thành công`
                : `Trạng thái đổi từ <span class="font-semibold text-gray-700">${STATUS_LABELS[h.old_status] || h.old_status}</span> sang <span class="font-semibold text-emerald-600">${STATUS_LABELS[h.new_status] || h.new_status}</span>`;
              const detailNote = isCreation
                ? `Trạng thái ban đầu: ${STATUS_LABELS[h.new_status] || h.new_status}`
                : h.note;
              
              return `
              <li>
                <div class="relative pb-8">
                  ${hIdx !== (historyList.length - 1) ? '<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>' : ''}
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center ring-8 ring-white text-[#C9A84C]">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </div>
                    <div class="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-xs text-gray-500">${title}</p>
                        ${detailNote ? `<p class="text-xs text-gray-400 mt-0.5">${detailNote}</p>` : ''}
                      </div>
                      <div class="text-right text-xs whitespace-nowrap text-gray-500">
                        <div>bởi <span class="font-medium text-gray-900">${h.changed_by}</span></div>
                        <time datetime="${h.created_at}">${formatDate(h.created_at)}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              `;
            }).join('') || '<p class="text-gray-400 text-xs">Chưa có lịch sử thay đổi.</p>'}
          </ul>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Sản phẩm trong đơn</h3>
        <div class="space-y-3">
          ${(order.items || order.order_items || []).map(item => {
            const itemImg = item.main_image || (item.product_images && item.product_images[0]) || item.product?.images?.[0] || item.image || '';
            const imgSrc = getImgSrc(itemImg);
            const itemPrice = item.product_price !== undefined ? item.product_price : item.price;
            return `
              <div class="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                <img src="${imgSrc}" alt="" class="w-14 h-14 object-cover rounded-lg bg-gray-200" onerror="this.src='https://images.pexels.com/photos/236915/pexels-photo-236915.jpeg?auto=compress&cs=tinysrgb&w=400'">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">${item.product?.name || item.product_name || '—'}</p>
                  <p class="text-xs text-gray-500 mt-0.5">SKU: ${item.product?.sku || item.sku || '—'}</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="font-semibold text-gray-900">${formatPrice(itemPrice)}</p>
                  <p class="text-xs text-gray-500">x${item.quantity}</p>
                </div>
              </div>
            `;
          }).join('') || '<p class="text-gray-400 text-sm">Không có sản phẩm</p>'}
        </div>
      </div>

      ${!isCancelled ? `
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Cập nhật trạng thái</h3>
        <div class="flex items-center gap-3">
          <select id="od-status-sel" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            ${Object.entries(STATUS_LABELS).map(([v, l]) => `<option value="${v}" ${order.status === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
          <button id="od-update-btn" class="px-5 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-[#b8963e]">Cập nhật</button>
        </div>
      </div>` : ''}
    </div>
  `;

  container.querySelector('#od-back')?.addEventListener('click', onBack);
  const adminCopyBtn = container.querySelector('#btn-admin-copy-tracking');
  if (adminCopyBtn) {
    adminCopyBtn.addEventListener('click', () => {
      copyToClipboard(order.tracking_code || '').then(() => {
        const originalHTML = adminCopyBtn.innerHTML;
        adminCopyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        setTimeout(() => {
          adminCopyBtn.innerHTML = originalHTML;
        }, 2000);
      });
    });
  }
  const updateBtn = container.querySelector('#od-update-btn');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      const status = container.querySelector('#od-status-sel').value;
      
      const doUpdate = async (extraPayload = {}) => {
        updateBtn.textContent = 'Đang lưu...'; updateBtn.disabled = true;
        try {
          await updateOrderStatus(order.id, status, extraPayload);
          showToast('Cập nhật trạng thái thành công!');
          order.status = status;
          if (status === 'shipping') {
            order.shipping_carrier = extraPayload.shipping_carrier;
            order.tracking_code = extraPayload.tracking_code;
          }
          renderDetail(container, order, onBack);
        } catch (e) { 
          showToast(e.message, 'error'); 
        } finally { 
          updateBtn.textContent = 'Cập nhật'; updateBtn.disabled = false; 
        }
      };

      if (status === 'shipping') {
        showShippingModal(
          order.shipping_carrier || '', 
          order.tracking_code || '',
          (data) => {
            doUpdate({ shipping_carrier: data.carrier, tracking_code: data.code });
          }
        );
      } else {
        doUpdate();
      }
    });
  }
}

function statusClass(s) {
  const m = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipping: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  return m[s] || 'bg-gray-100 text-gray-600';
}
