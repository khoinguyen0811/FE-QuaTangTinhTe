import { renderVouchersTab } from './VoucherTab.js';
import { renderGiftsTab } from './GiftTab.js';

let activeTab = 'list'; // 'list' or 'wizard'
let promoIdToEdit = null;

export function renderVouchers(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Khuyến mãi</h2>
          <p class="text-sm text-gray-500 mt-0.5 font-medium">Quản lý mã giảm giá, chương trình tự động, quà tặng và mua X tặng Y.</p>
        </div>
        <button id="header-create-promo-btn" class="flex items-center gap-1.5 px-4 py-2 bg-[#5d58f0] hover:bg-[#473ebd] text-white rounded-xl text-sm font-bold shadow-sm transition-all focus:outline-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Tạo khuyến mãi
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8">
          <button id="tab-promo-list" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm transition-all focus:outline-none ${activeTab === 'list' ? 'border-[#5d58f0] text-[#5d58f0]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
            Danh sách khuyến mãi
          </button>
          <button id="tab-promo-wizard" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm transition-all focus:outline-none ${activeTab === 'wizard' ? 'border-[#5d58f0] text-[#5d58f0]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
            ${promoIdToEdit ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi'}
          </button>
        </nav>
      </div>

      <!-- Dynamic Section -->
      <div id="promotions-content-wrap"></div>
    </div>
  `;

  // Bind Header & Tab switching events
  container.querySelector('#header-create-promo-btn').addEventListener('click', () => {
    promoIdToEdit = null;
    switchTab('wizard', container);
  });

  container.querySelector('#tab-promo-list').addEventListener('click', () => {
    promoIdToEdit = null; // Clear edit mode when switching back to list
    switchTab('list', container);
  });
  
  container.querySelector('#tab-promo-wizard').addEventListener('click', () => {
    switchTab('wizard', container);
  });

  renderActiveTab(container);
}

function switchTab(tab, container) {
  activeTab = tab;
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.className = 'tab-btn py-4 px-1 border-b-2 font-medium text-sm transition-all focus:outline-none border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  });
  
  const activeBtn = container.querySelector(tab === 'list' ? '#tab-promo-list' : '#tab-promo-wizard');
  if (activeBtn) {
    activeBtn.className = 'tab-btn py-4 px-1 border-b-2 font-medium text-sm transition-all focus:outline-none border-[#5d58f0] text-[#5d58f0]';
    if (tab === 'wizard') {
      activeBtn.textContent = promoIdToEdit ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi';
    } else {
      const wizardBtn = container.querySelector('#tab-promo-wizard');
      if (wizardBtn) wizardBtn.textContent = 'Tạo khuyến mãi';
    }
  }

  renderActiveTab(container);
}

function renderActiveTab(container) {
  const wrap = container.querySelector('#promotions-content-wrap');
  if (!wrap) return;

  if (activeTab === 'list') {
    // List tab callback for edit actions
    renderVouchersTab(wrap, (idToEdit) => {
      promoIdToEdit = idToEdit;
      switchTab('wizard', container);
    });
  } else {
    // Wizard tab callback for successful save actions
    renderGiftsTab(wrap, promoIdToEdit, () => {
      promoIdToEdit = null;
      switchTab('list', container);
    });
  }
}
