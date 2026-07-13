import { API_BASE } from '../services/config.js';
import { getAdminToken, hasAdminPermission } from '../utils/adminAuth.js';

function isAdmin() {
  return hasAdminPermission('settings:write');
}

export function initContactWidget() {
  if (document.getElementById('contact-channels-widget')) return;

  const settings = window.APP_SETTINGS?.contact_channels || {
    facebook: 'https://facebook.com',
    messenger: 'https://m.me',
    zalo: 'https://zalo.me',
    hotline: '0900000000'
  };

  const widget = document.createElement('div');
  widget.id = 'contact-channels-widget';
  widget.className = 'fixed bottom-6 right-6 z-[999] flex flex-col items-center gap-3 select-none';

  // Inject CSS styles for animation and look
  const style = document.createElement('style');
  style.textContent = `
    #contact-channels-widget {
      font-family: 'Montserrat', sans-serif;
      pointer-events: none;
    }
    #ccw-btn-toggle {
      pointer-events: auto;
    }
    .ccw-options {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
      transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transform: scale(0) translateY(30px);
      opacity: 0;
      pointer-events: none;
      transform-origin: bottom;
    }
    .ccw-options a,
    .ccw-options button {
      pointer-events: none;
    }
    .ccw-expanded .ccw-options {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }
    .ccw-expanded .ccw-options a,
    .ccw-expanded .ccw-options button {
      pointer-events: auto;
    }
    .ccw-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      transition: all 0.25s ease;
      cursor: pointer;
      border: none;
      text-decoration: none;
      color: white;
    }
    .ccw-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }
    .ccw-btn:active {
      transform: scale(0.95);
    }
    .ccw-main-toggle {
      width: 56px;
      height: 56px;
      background: #18181b;
      color: #C9A84C;
      position: relative;
    }
    .ccw-main-toggle svg {
      transition: transform 0.3s ease;
    }
    .ccw-expanded .ccw-main-toggle svg {
      transform: rotate(90deg);
    }
    .ccw-pulse-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      background: #ef4444;
      border: 2px solid #18181b;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 8px;
      font-weight: 700;
      animation: ccw-bounce 1.5s infinite;
    }
    @keyframes ccw-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .ccw-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .ccw-modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      animation: ccw-modal-in 0.3s ease-out;
    }
    @keyframes ccw-modal-in {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  widget.innerHTML = `
    <!-- Options Stack -->
    <div class="ccw-options">
      <!-- Admin Edit Button -->
      ${isAdmin() ? `
        <button id="ccw-btn-edit" class="ccw-btn bg-zinc-900 border border-zinc-700/50 hover:bg-zinc-800 text-[#C9A84C]" title="Cấu hình liên kết">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
      ` : ''}
      
      <!-- Facebook Page -->
      <a id="ccw-link-fb" href="${settings.facebook}" target="_blank" class="ccw-btn bg-[#1877F2]" title="Facebook Page">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>

      <!-- Messenger Chat -->
      <a id="ccw-link-messenger" href="${settings.messenger}" target="_blank" class="ccw-btn bg-gradient-to-tr from-[#006AFF] via-[#A033FF] to-[#FF5252]" title="Chat Messenger">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-9.96 4.19-9.96 9.36 0 2.94 1.44 5.56 3.69 7.23V22l3.25-1.78c.95.26 1.95.4 3.02.4 5.5 0 9.96-4.19 9.96-9.36S17.5 2.04 12 2.04zm1.07 12.56-2.74-2.93-5.35 2.93 5.89-6.25 2.8 2.93 5.29-2.93-5.89 6.25z"/></svg>
      </a>

      <!-- Zalo Chat -->
      <a id="ccw-link-zalo" href="${settings.zalo.startsWith('http') ? settings.zalo : `https://zalo.me/${settings.zalo}`}" target="_blank" class="ccw-btn bg-[#0068FF] font-bold text-xs tracking-wider" style="font-family: system-ui, -apple-system, sans-serif;" title="Chat Zalo">
        Zalo
      </a>

      <!-- Hotline Call -->
      <a id="ccw-link-hotline" href="tel:${settings.hotline}" class="ccw-btn bg-[#C9A84C]" title="Gọi Hotline">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      </a>
    </div>

    <!-- Main FAB Toggle -->
    <button id="ccw-btn-toggle" class="ccw-btn ccw-main-toggle" title="Kênh liên hệ">
      <span class="ccw-pulse-badge">!</span>
      <svg id="ccw-toggle-open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <svg id="ccw-toggle-close" class="hidden" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  document.body.appendChild(widget);

  const toggleBtn = widget.querySelector('#ccw-btn-toggle');
  const toggleOpenIcon = widget.querySelector('#ccw-toggle-open');
  const toggleCloseIcon = widget.querySelector('#ccw-toggle-close');
  const pulseBadge = widget.querySelector('.ccw-pulse-badge');

  toggleBtn.addEventListener('click', () => {
    const isExpanded = widget.classList.toggle('ccw-expanded');
    if (isExpanded) {
      toggleOpenIcon.classList.add('hidden');
      toggleCloseIcon.classList.remove('hidden');
      if (pulseBadge) pulseBadge.style.display = 'none';
    } else {
      toggleOpenIcon.classList.remove('hidden');
      toggleCloseIcon.classList.add('hidden');
    }
  });

  // Admin Click Handler
  const editBtn = widget.querySelector('#ccw-btn-edit');
  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openConfigModal(widget);
    });
  }
}

function openConfigModal(widgetEl) {
  const settings = window.APP_SETTINGS?.contact_channels || {
    facebook: 'https://facebook.com',
    messenger: 'https://m.me',
    zalo: 'https://zalo.me',
    hotline: '0900000000'
  };

  const overlay = document.createElement('div');
  overlay.className = 'ccw-modal-overlay';
  overlay.innerHTML = `
    <div class="ccw-modal" style="font-family: system-ui, -apple-system, sans-serif;">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f3f4f6;background:#f9fafb;">
        <h3 style="margin:0;font-size:14px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Sửa Kênh Liên Hệ
        </h3>
        <button id="ccw-modal-close" style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:4px;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      
      <!-- Body -->
      <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
        <div>
          <label style="display:block;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px;">Liên kết Facebook Page</label>
          <input id="ccw-inp-fb" type="text" value="${settings.facebook}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;outline:none;" placeholder="https://facebook.com/trang_cua_ban" />
        </div>
        <div>
          <label style="display:block;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px;">Liên kết Messenger Chat</label>
          <input id="ccw-inp-messenger" type="text" value="${settings.messenger}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;outline:none;" placeholder="https://m.me/username_cua_ban" />
        </div>
        <div>
          <label style="display:block;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px;">Liên kết Zalo (SĐT hoặc Link)</label>
          <input id="ccw-inp-zalo" type="text" value="${settings.zalo}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;outline:none;" placeholder="SĐT hoặc link https://zalo.me/sdt" />
        </div>
        <div>
          <label style="display:block;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px;">Số Hotline Gọi Điện</label>
          <input id="ccw-inp-hotline" type="text" value="${settings.hotline}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;outline:none;" placeholder="Nhập số điện thoại hotline" />
        </div>
      </div>

      <!-- Footer -->
      <div style="display:flex;align-items:center;justify-content:end;gap:12px;padding:12px 20px;background:#f9fafb;border-top:1px solid #f3f4f6;">
        <button id="ccw-modal-cancel" style="background:white;border:1px solid #d1d5db;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;">Hủy</button>
        <button id="ccw-modal-save" style="background:#C9A84C;border:none;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;color:white;cursor:pointer;box-shadow:0 2px 4px rgba(201, 168, 76, 0.2);display:flex;align-items:center;gap:6px;">
          Lưu lại
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => {
    overlay.remove();
    document.body.style.overflow = '';
  };

  overlay.querySelector('#ccw-modal-close').addEventListener('click', close);
  overlay.querySelector('#ccw-modal-cancel').addEventListener('click', close);

  overlay.querySelector('#ccw-modal-save').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = `<div style="width:12px;height:12px;border:2px solid white;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin-right:4px;"></div> Lưu...`;

    // Inject spin animation keyframes dynamically if not exists
    if (!document.getElementById('ccw-spin-keyframes')) {
      const kf = document.createElement('style');
      kf.id = 'ccw-spin-keyframes';
      kf.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(kf);
    }

    const updatedChannels = {
      facebook: overlay.querySelector('#ccw-inp-fb').value.trim() || 'https://facebook.com',
      messenger: overlay.querySelector('#ccw-inp-messenger').value.trim() || 'https://m.me',
      zalo: overlay.querySelector('#ccw-inp-zalo').value.trim() || 'https://zalo.me',
      hotline: overlay.querySelector('#ccw-inp-hotline').value.trim() || '0900000000'
    };

    if (!window.APP_SETTINGS) window.APP_SETTINGS = {};
    window.APP_SETTINGS.contact_channels = updatedChannels;

    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(window.APP_SETTINGS)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // Success feedback
        import('../pages/Admin/shared/ui.js').then(({ showToast }) => {
          showToast('Đã lưu kênh liên hệ thành công!', 'success');
        }).catch(() => {
          alert('Đã lưu kênh liên hệ thành công!');
        });

        // Update widget anchors dynamically
        widgetEl.querySelector('#ccw-link-fb').href = updatedChannels.facebook;
        widgetEl.querySelector('#ccw-link-messenger').href = updatedChannels.messenger;
        widgetEl.querySelector('#ccw-link-zalo').href = updatedChannels.zalo.startsWith('http') ? updatedChannels.zalo : `https://zalo.me/${updatedChannels.zalo}`;
        widgetEl.querySelector('#ccw-link-hotline').href = `tel:${updatedChannels.hotline}`;

        close();
      } else {
        alert(json.error || 'Lỗi khi lưu.');
        btn.disabled = false;
        btn.innerHTML = 'Lưu lại';
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ API.');
      btn.disabled = false;
      btn.innerHTML = 'Lưu lại';
    }
  });
}
