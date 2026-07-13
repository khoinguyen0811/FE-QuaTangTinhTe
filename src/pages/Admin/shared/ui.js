import { STORAGE_KEYS, API_BASE } from '../../../services/config.js';

export function createModal(content, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  overlay.setAttribute('data-lenis-prevent', 'true');
  overlay.innerHTML = `
    <div class="admin-modal-panel bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
      <button id="modal-close" class="admin-icon-btn absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10" title="Đóng (Esc)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div id="modal-body"></div>
    </div>
  `;

  overlay.querySelector('#modal-body').appendChild(
    typeof content === 'string'
      ? Object.assign(document.createElement('div'), { innerHTML: content })
      : content
  );

  const close = () => {
    document.removeEventListener('keydown', handleKeydown);
    overlay.remove();
    if (onClose) onClose();
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape' || e.key === 'F4') {
      e.preventDefault();
      close();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  overlay.querySelector('#modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  document.body.appendChild(overlay);
  return overlay;
}

export function createConfirmDialog(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  overlay.setAttribute('data-lenis-prevent', 'true');
  overlay.innerHTML = `
    <div class="admin-modal-panel bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Xác nhận</h3>
      <p class="text-gray-600 mb-6">${message}</p>
      <div class="flex gap-3 justify-end">
        <button id="confirm-cancel" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm">Hủy</button>
        <button id="confirm-ok" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium text-sm">Xóa</button>
      </div>
    </div>
  `;

  const closeOverlay = () => {
    document.removeEventListener('keydown', handleKeydown);
    overlay.remove();
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape' || e.key === 'F4') {
      e.preventDefault();
      closeOverlay();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  overlay.querySelector('#confirm-cancel').addEventListener('click', closeOverlay);
  overlay.querySelector('#confirm-ok').addEventListener('click', () => {
    closeOverlay();
    if (onConfirm) onConfirm();
  });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeOverlay();
  });

  document.body.appendChild(overlay);
  return overlay;
}

export function showToast(message, type = 'success') {
  if (type === 'success') {
    window.adminFormIsDirty = false;

    // Remove settings draft if saving settings
    if (message.includes('cấu hình') || message.includes('Cài đặt') || message.includes('Settings')) {
      localStorage.removeItem('sly_draft_settings');
    }
    
    // Remove active form draft
    const activeForm = document.querySelector('#admin-content form') || document.querySelector('body > div.fixed form');
    if (activeForm && activeForm.id) {
      localStorage.removeItem('sly_draft_form_' + activeForm.id);
    }

    if (window.pendingNavigationTarget) {
      const target = window.pendingNavigationTarget;
      window.pendingNavigationTarget = null;
      window.location.hash = target;
    }
  }

  // SweetAlert2 Toast configuration
  if (typeof Swal !== 'undefined') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500, // 1.5 seconds
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: type,
      title: message
    });
  } else {
    // Fallback if Swal is not loaded
    const colors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-yellow-500',
      info: 'bg-blue-600',
    };

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[9999] px-5 py-3 rounded-lg text-white text-sm font-medium shadow-lg transition-all duration-300 ${colors[type] || colors.success}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 1000);
  }
}

export function createPagination(current, total, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'admin-pagination flex items-center gap-1 justify-end mt-4';

  const button = (label, page, disabled = false) => {
    const el = document.createElement('button');
    el.className = `admin-page-btn px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
      page === current ? 'is-active' : disabled ? 'is-disabled cursor-not-allowed' : ''
    }`;
    el.textContent = label;
    el.disabled = disabled;
    if (!disabled) {
      el.addEventListener('click', () => onChange(page));
    }
    return el;
  };

  wrap.appendChild(button('<<', current - 1, current <= 1));
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  for (let i = start; i <= end; i += 1) {
    wrap.appendChild(button(String(i), i));
  }
  wrap.appendChild(button('>>', current + 1, current >= total));
  return wrap;
}

export function formatPrice(num) {
  if (!num && num !== 0) return '-';
  return `${Number(num).toLocaleString('vi-VN')}đ`;
}

export function formatDate(isoStr, options = {}) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;

    const formatStr = window.APP_SETTINGS?.time_format;
    if (formatStr) {
      let targetFormat = formatStr;
      const isPureDate = typeof isoStr === 'string' && isoStr.length <= 10 && !isoStr.includes(':') && !isoStr.includes('T');
      if (options.dateOnly || isPureDate) {
        targetFormat = formatStr.replace(/[\s,]*[Hh]+:[mm]+(:[ss]+)?(\s*[Aa])?/, '').trim();
        if (!targetFormat) targetFormat = 'DD/MM/YYYY';
      }

      const pad = (num, size = 2) => String(num).padStart(size, '0');
      const YYYY = d.getFullYear();
      const YY = String(YYYY).slice(-2);
      const M = d.getMonth() + 1;
      const MM = pad(M);
      const D = d.getDate();
      const DD = pad(D);
      const H = d.getHours();
      const HH = pad(H);
      const h = H % 12 || 12;
      const hh = pad(h);
      const m = d.getMinutes();
      const mm = pad(m);
      const s = d.getSeconds();
      const ss = pad(s);
      const A = H >= 12 ? 'PM' : 'AM';
      const a = H >= 12 ? 'pm' : 'am';

      return targetFormat
        .replace('YYYY', YYYY)
        .replace('YY', YY)
        .replace('MM', MM)
        .replace('DD', DD)
        .replace('HH', HH)
        .replace('hh', hh)
        .replace('mm', mm)
        .replace('ss', ss)
        .replace('A', A)
        .replace('a', a)
        .replace('M', M)
        .replace('D', D)
        .replace('H', H)
        .replace('h', h);
    }

    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return isoStr;
  }
}

export function formatDuration(seconds) {
  const value = Math.round(Number(seconds || 0));
  if (!value) return '0s';
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  if (!mins) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function authHeaders() {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export function isSuperAdmin() {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload.roles || [];
    return roles.includes('super_admin') || roles.includes('system');
  } catch (e) {
    return false;
  }
}

export function isSystem() {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload.roles || [];
    return roles.includes('system');
  } catch (e) {
    return false;
  }
}

export function hasPermission(permission) {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload.roles || [];
    
    // Super Admin or System has all permissions
    if (roles.includes('super_admin') || roles.includes('system')) return true;
    
    // Check dynamic permissions from JWT payload first (enables custom roles like seller)
    if (payload.permissions) {
      return payload.permissions.includes(permission);
    }
    
    // Fallback logic for legacy tokens
    // Admin has everything except roles:manage
    if (roles.includes('admin')) {
      return permission !== 'roles:manage';
    }
    
    // Editor permissions
    if (roles.includes('editor')) {
      const editorPerms = [
        'admin:read',
        'products:read', 'products:write',
        'orders:read', 'orders:write',
        'categories:read', 'categories:write',
        'returns:read', 'returns:write',
        'members:read', 'members:write',
        'vouchers:read', 'vouchers:write',
        'ranks:read',
        'reviews:read', 'reviews:write',
        'flash_sales:read', 'flash_sales:write',
      ];
      return editorPerms.includes(permission);
    }
    
    // Viewer permissions
    if (roles.includes('viewer')) {
      return permission.endsWith(':read');
    }
  } catch (e) {
    return false;
  }
  return false;
}

export function showShippingModal(currentCarrier, currentTracking, onSave, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4';
  overlay.setAttribute('data-lenis-prevent', 'true');
  
  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Thông tin vận chuyển</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Đơn vị vận chuyển</label>
          <select id="ship-carrier-sel" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" disabled>
            <option value="">Đang tải danh sách...</option>
          </select>
        </div>
        <div id="ship-custom-carrier-wrap" class="hidden">
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Tên đơn vị vận chuyển khác</label>
          <input type="text" id="ship-custom-carrier" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" 
            placeholder="Nhập tên hãng vận chuyển..." value="">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Mã vận đơn</label>
          <input type="text" id="ship-tracking-code" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] font-mono" 
            placeholder="Nhập mã vận đơn..." value="${currentTracking || ''}">
        </div>
      </div>
      <div class="flex gap-3 justify-end mt-6">
        <button id="ship-cancel" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors">Hủy</button>
        <button id="ship-ok" class="px-5 py-2 rounded-lg bg-[#C9A84C] text-white hover:bg-[#b8963e] font-medium text-sm transition-colors" disabled>Xác nhận</button>
      </div>
    </div>
  `;

  const carrierSel = overlay.querySelector('#ship-carrier-sel');
  const customCarrierWrap = overlay.querySelector('#ship-custom-carrier-wrap');
  const customCarrierInput = overlay.querySelector('#ship-custom-carrier');
  const trackingCodeInput = overlay.querySelector('#ship-tracking-code');
  const okBtn = overlay.querySelector('#ship-ok');

  const close = () => {
    document.removeEventListener('keydown', handleKeydown);
    overlay.remove();
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape' || e.key === 'F4') {
      e.preventDefault();
      close();
      if (onCancel) onCancel();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  overlay.querySelector('#ship-cancel').addEventListener('click', () => {
    close();
    if (onCancel) onCancel();
  });

  overlay.querySelector('#ship-ok').addEventListener('click', () => {
    let finalCarrier = carrierSel.value;
    if (finalCarrier === 'Khác') {
      finalCarrier = customCarrierInput.value.trim();
      if (!finalCarrier) {
        showToast('Vui lòng nhập tên hãng vận chuyển!', 'error');
        customCarrierInput.focus();
        return;
      }
    }
    const trackingCode = trackingCodeInput.value.trim();
    if (!trackingCode) {
      showToast('Vui lòng nhập mã vận đơn!', 'error');
      trackingCodeInput.focus();
      return;
    }

    close();
    if (onSave) onSave({ carrier: finalCarrier, code: trackingCode });
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
      if (onCancel) onCancel();
    }
  });

  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
  fetch(`${API_BASE}/api/admin/shipping-providers`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(json => {
      if (json.success && Array.isArray(json.data)) {
        const activeCarriers = json.data.filter(p => p.is_active).map(p => p.name);
        
        let selectedCarrier = currentCarrier || activeCarriers[0] || 'Shopee Express';
        let isCustom = !activeCarriers.includes(selectedCarrier) && selectedCarrier !== '';
        if (isCustom) {
          selectedCarrier = 'Khác';
        }

        carrierSel.innerHTML = `
          ${activeCarriers.map(c => `<option value="${c}" ${selectedCarrier === c ? 'selected' : ''}>${c}</option>`).join('')}
          <option value="Khác" ${selectedCarrier === 'Khác' ? 'selected' : ''}>Khác</option>
        `;
        carrierSel.disabled = false;
        okBtn.disabled = false;

        if (selectedCarrier === 'Khác') {
          customCarrierWrap.classList.remove('hidden');
          customCarrierInput.value = currentCarrier || '';
        }

        carrierSel.addEventListener('change', () => {
          if (carrierSel.value === 'Khác') {
            customCarrierWrap.classList.remove('hidden');
            customCarrierInput.focus();
          } else {
            customCarrierWrap.classList.add('hidden');
          }
        });
      } else {
        throw new Error('Failed to load carriers');
      }
    })
    .catch(() => {
      const fallbackCarriers = ['Shopee Express', 'Giao Hàng Nhanh (GHN)', 'Giao Hàng Tiết Kiệm (GHTK)'];
      let selectedCarrier = currentCarrier || fallbackCarriers[0];
      let isCustom = !fallbackCarriers.includes(selectedCarrier) && selectedCarrier !== '';
      if (isCustom) {
        selectedCarrier = 'Khác';
      }

      carrierSel.innerHTML = `
        ${fallbackCarriers.map(c => `<option value="${c}" ${selectedCarrier === c ? 'selected' : ''}>${c}</option>`).join('')}
        <option value="Khác" ${selectedCarrier === 'Khác' ? 'selected' : ''}>Khác</option>
      `;
      carrierSel.disabled = false;
      okBtn.disabled = false;

      if (selectedCarrier === 'Khác') {
        customCarrierWrap.classList.remove('hidden');
        customCarrierInput.value = currentCarrier || '';
      }

      carrierSel.addEventListener('change', () => {
        if (carrierSel.value === 'Khác') {
          customCarrierWrap.classList.remove('hidden');
          customCarrierInput.focus();
        } else {
          customCarrierWrap.classList.add('hidden');
        }
      });
    });

  document.body.appendChild(overlay);
  return overlay;
}

export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      const success = document.execCommand('copy');
      document.body.removeChild(el);
      if (success) {
        resolve();
      } else {
        reject(new Error('Copy failed'));
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function showUnsavedChangesModal({ onSave, onDiscard, onCancel }) {
  if (document.getElementById('pf-unsaved-changes-modal')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'pf-unsaved-changes-modal';
  overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-all';
  overlay.setAttribute('data-lenis-prevent', 'true');
  
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modalScaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-modal-fade { animation: modalFadeIn 0.2s ease-out forwards; }
    .animate-modal-scale { animation: modalScaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  `;
  document.head.appendChild(styleEl);
  
  overlay.classList.add('animate-modal-fade');

  overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 animate-modal-scale">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900 leading-tight">Thay đổi chưa lưu</h3>
          <p class="text-[11px] text-gray-400 mt-0.5">Thông tin sản phẩm đã bị chỉnh sửa.</p>
        </div>
      </div>

      <!-- Body text -->
      <div class="text-xs text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-150 leading-relaxed font-medium">
        Nếu rời đi bây giờ, những thay đổi tạm thời sẽ bị mất. Bạn muốn làm gì tiếp theo?
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col gap-2">
        <!-- Option 1: Save and Leave -->
        <button id="pf-unsaved-save" class="w-full px-4 py-2.5 rounded-xl bg-[#5d58f0] hover:bg-[#4b46d5] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Lưu thay đổi và rời đi
        </button>

        <!-- Option 2: Discard and Leave -->
        <button id="pf-unsaved-discard" class="w-full px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Bỏ qua thay đổi và rời đi
        </button>

        <!-- Option 3: Keep editing -->
        <button id="pf-unsaved-cancel" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Tiếp tục chỉnh sửa
        </button>
      </div>
    </div>
  `;

  const close = () => {
    document.removeEventListener('keydown', handleKeydown);
    styleEl.remove();
    overlay.remove();
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape' || e.key === 'F4') {
      e.preventDefault();
      close();
      if (onCancel) onCancel();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  overlay.querySelector('#pf-unsaved-save').addEventListener('click', () => {
    close();
    if (onSave) onSave();
  });

  overlay.querySelector('#pf-unsaved-discard').addEventListener('click', () => {
    close();
    if (onDiscard) onDiscard();
  });

  overlay.querySelector('#pf-unsaved-cancel').addEventListener('click', () => {
    close();
    if (onCancel) onCancel();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
      if (onCancel) onCancel();
    }
  });

  const adminRoot = document.getElementById('admin-root');
  if (adminRoot) {
    adminRoot.appendChild(overlay);
  } else {
    document.body.appendChild(overlay);
  }
  return overlay;
}

export function getRankBadgeHtml(rankName) {
  if (!rankName) return '';
  const styles = {
    Silver: 'bg-gray-100 text-gray-700 border-gray-300',
    Gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Diamond: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  const cls = styles[rankName] || 'bg-amber-50 text-[#C9A84C] border-amber-200';
  return `<span class="px-2.5 py-1 text-xs rounded-full font-bold border ${cls}">${rankName}</span>`;
}
