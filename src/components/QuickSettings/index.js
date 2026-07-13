import { showToast } from '../../pages/Admin/shared/ui.js';
import { API_BASE } from '../../services/config.js';
import { getAdminToken } from '../../utils/adminAuth.js';
import { loadCategoryTree } from './CategorySelector.js';
import { renderBrandForm, bindBrandEvents } from './BrandTab.js';
import { renderMenuForm, bindMenuEvents } from './MenuTab.js';
import { renderBannerForm, bindBannerEvents } from './BannerTab.js';
import { renderSectionsForm, bindSectionsEvents } from './SectionsTab.js';
import { renderColorsForm, bindColorsEvents, defaultColors } from './ColorsTab.js';
import { renderPoliciesForm, bindPoliciesEvents, policyList } from './PoliciesTab.js';

let modalEl = null;

export function openQuickSettings(defaultTab = 'brand', extraParam = 0) {
  const token = getAdminToken();
  if (!token) {
    showToast('Bạn cần đăng nhập quản trị viên để chỉnh sửa.', 'error');
    return;
  }

  // Pre-load category tree in background
  loadCategoryTree();

  if (modalEl) {
    modalEl.remove();
  }

  let activeTab = defaultTab;
  let selectedSlideIndex = typeof extraParam === 'number' ? extraParam : 0;
  let selectedPolicySlug = policyList.some(p => p.slug === extraParam) ? extraParam : 'worldwide-shipping';

  let settings = window.APP_SETTINGS || {
    brand_name: 'Mắt Bão WS',
    logo_url: '',
    hero_banners: [],
    theme_colors: {},
    policies: {}
  };

  const initialColors = JSON.parse(JSON.stringify(settings.theme_colors || {}));

  function restoreInitialColors() {
    Object.entries(initialColors).forEach(([key, val]) => {
      if (val) document.documentElement.style.setProperty(`--color-${key}`, val);
    });
    document.body.style.overflow = '';
    if (modalEl) modalEl.remove();
  }

  modalEl = document.createElement('div');
  modalEl.className = 'fixed inset-0 z-[10000] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm';
  modalEl.setAttribute('data-lenis-prevent', 'true');
  modalEl.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
  modalEl.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) restoreInitialColors();
  });
  document.body.style.overflow = 'hidden';

  renderModal();
  document.body.appendChild(modalEl);

  function getElementOffsetTop(element, container) {
    let offsetTop = 0;
    let el = element;
    while (el && el !== container) {
      offsetTop += el.offsetTop;
      el = el.offsetParent;
    }
    return offsetTop;
  }

  if (activeTab === 'sections' && typeof extraParam === 'string') {
    const targetSec = modalEl.querySelector(`#quick-sec-${extraParam}`);
    if (targetSec) {
      const modalBody = modalEl.querySelector('#quick-modal-body');
      if (modalBody) {
        setTimeout(() => {
          const topPos = getElementOffsetTop(targetSec, modalBody);
          modalBody.scrollTop = topPos - 12;
          targetSec.classList.add('quick-sec-highlight');
        }, 100);
      }
    }
  }

  function renderModal() {
    modalEl.innerHTML = `
      <style>
        #quick-modal-body::-webkit-scrollbar { width: 6px; }
        #quick-modal-body::-webkit-scrollbar-track { background: #f9f9f9; }
        #quick-modal-body::-webkit-scrollbar-thumb { background: #d4cfc5; border-radius: 3px; }
        #quick-modal-body::-webkit-scrollbar-thumb:hover { background: #C9A84C; }
        .scrollbar-none::-webkit-scrollbar { display: none !important; }
        .scrollbar-none { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .quick-sec-highlight {
          border-left: 4px solid #C9A84C !important;
          background-color: rgba(201, 168, 76, 0.05) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
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
      <div class="bg-white border border-gray-200 w-full max-w-3xl md:max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]" data-lenis-prevent>
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div class="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Chỉnh Sửa Nhanh Giao Diện</h3>
          </div>
          <button id="close-quick-modal" class="text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-0 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="px-5 pt-3 flex items-end border-b border-gray-100 gap-3.5 text-xs font-bold text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button id="tab-brand-trigger" class="relative pb-2.5 transition-all shrink-0 whitespace-nowrap outline-none bg-transparent border-0 cursor-pointer ${activeTab === 'brand' ? 'text-[#C9A84C]' : 'text-gray-400 hover:text-gray-700'}">
            Thương hiệu & Logo
            ${activeTab === 'brand' ? '<span class="absolute bottom-[3px] left-0 right-0 h-[2px] bg-[#C9A84C]"></span>' : ''}
          </button>
          <button id="tab-menu-trigger" class="relative pb-2.5 transition-all shrink-0 whitespace-nowrap outline-none bg-transparent border-0 cursor-pointer ${activeTab === 'menu' ? 'text-[#C9A84C]' : 'text-gray-400 hover:text-gray-700'}">
            Menu
            ${activeTab === 'menu' ? '<span class="absolute bottom-[3px] left-0 right-0 h-[2px] bg-[#C9A84C]"></span>' : ''}
          </button>
          <button id="tab-banner-trigger" class="relative pb-2.5 transition-all shrink-0 whitespace-nowrap outline-none bg-transparent border-0 cursor-pointer ${activeTab === 'banner' ? 'text-[#C9A84C]' : 'text-gray-400 hover:text-gray-700'}">
            Banner
            ${activeTab === 'banner' ? '<span class="absolute bottom-[3px] left-0 right-0 h-[2px] bg-[#C9A84C]"></span>' : ''}
          </button>
          <button id="tab-sections-trigger" class="relative pb-2.5 transition-all shrink-0 whitespace-nowrap outline-none bg-transparent border-0 cursor-pointer ${activeTab === 'sections' ? 'text-[#C9A84C]' : 'text-gray-400 hover:text-gray-700'}">
            Section Trang Chủ
            ${activeTab === 'sections' ? '<span class="absolute bottom-[3px] left-0 right-0 h-[2px] bg-[#C9A84C]"></span>' : ''}
          </button>
          <button id="tab-colors-trigger" class="relative pb-2.5 transition-all shrink-0 whitespace-nowrap outline-none bg-transparent border-0 cursor-pointer ${activeTab === 'colors' ? 'text-[#C9A84C]' : 'text-gray-400 hover:text-gray-700'}">
            Màu Sắc
            ${activeTab === 'colors' ? '<span class="absolute bottom-[3px] left-0 right-0 h-[2px] bg-[#C9A84C]"></span>' : ''}
          </button>
          <button id="tab-policies-trigger" class="relative pb-2.5 transition-all shrink-0 whitespace-nowrap outline-none bg-transparent border-0 cursor-pointer ${activeTab === 'policies' ? 'text-[#C9A84C]' : 'text-gray-400 hover:text-gray-700'}">
            Chính Sách
            ${activeTab === 'policies' ? '<span class="absolute bottom-[3px] left-0 right-0 h-[2px] bg-[#C9A84C]"></span>' : ''}
          </button>
        </div>

        <div id="quick-modal-body" class="p-6 flex-1 overflow-y-auto space-y-5 text-xs text-gray-700 relative">
          ${activeTab === 'brand' ? renderBrandForm(settings)
        : activeTab === 'menu' ? renderMenuForm(settings)
          : activeTab === 'banner' ? renderBannerForm(settings, selectedSlideIndex)
            : activeTab === 'sections' ? renderSectionsForm(settings)
              : activeTab === 'policies' ? renderPoliciesForm(settings, selectedPolicySlug)
                : renderColorsForm(settings)}
        </div>

        <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
          <button id="cancel-quick-modal" class="border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer bg-white">Hủy</button>
          <button id="save-quick-modal" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer border-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Lưu thay đổi
          </button>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Base close/cancel triggers
    modalEl.querySelector('#close-quick-modal')?.addEventListener('click', () => restoreInitialColors());
    modalEl.querySelector('#cancel-quick-modal')?.addEventListener('click', () => restoreInitialColors());

    // Tab triggers
    modalEl.querySelector('#tab-brand-trigger')?.addEventListener('click', () => { activeTab = 'brand'; renderModal(); });
    modalEl.querySelector('#tab-menu-trigger')?.addEventListener('click', () => { activeTab = 'menu'; renderModal(); });
    modalEl.querySelector('#tab-banner-trigger')?.addEventListener('click', () => { activeTab = 'banner'; renderModal(); });
    modalEl.querySelector('#tab-sections-trigger')?.addEventListener('click', () => { activeTab = 'sections'; renderModal(); });
    modalEl.querySelector('#tab-colors-trigger')?.addEventListener('click', () => { activeTab = 'colors'; renderModal(); });
    modalEl.querySelector('#tab-policies-trigger')?.addEventListener('click', () => { activeTab = 'policies'; renderModal(); });

    // Delegated tab binds
    if (activeTab === 'brand') {
      bindBrandEvents(modalEl, settings, renderModal, token);
    } else if (activeTab === 'menu') {
      bindMenuEvents(modalEl, settings, renderModal, token);
    } else if (activeTab === 'banner') {
      bindBannerEvents(modalEl, settings, renderModal, token, selectedSlideIndex, (idx) => { selectedSlideIndex = idx; });
    } else if (activeTab === 'sections') {
      bindSectionsEvents(modalEl, settings, renderModal);
    } else if (activeTab === 'colors') {
      bindColorsEvents(modalEl, settings, renderModal);
    } else if (activeTab === 'policies') {
      bindPoliciesEvents(modalEl, settings, renderModal, selectedPolicySlug, (slug) => { selectedPolicySlug = slug; });
    }

    // Save configuration trigger
    modalEl.querySelector('#save-quick-modal')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = `<div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...`;

      try {
        const res = await fetch(`${API_BASE}/api/admin/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(settings)
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Đã lưu cấu hình thay đổi thành công!', 'success');
          window.APP_SETTINGS = settings;
          document.body.style.overflow = '';
          modalEl.remove();

          // Refresh page to apply colors and brand config globally
          setTimeout(() => {
            window.location.reload();
          }, 400);
        } else {
          showToast(json.error || 'Có lỗi khi lưu thay đổi.', 'error');
          btn.disabled = false;
          btn.innerHTML = `Lưu thay đổi`;
        }
      } catch {
        showToast('Lỗi kết nối máy chủ API.', 'error');
        btn.disabled = false;
        btn.innerHTML = `Lưu thay đổi`;
      }
    });
  }
}
