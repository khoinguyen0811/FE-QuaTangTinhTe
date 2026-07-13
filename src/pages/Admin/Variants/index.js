import { renderVariantTable } from './VariantTable.js?v=1.0.99';
import { renderVariantTypesTable } from './VariantTypesTable.js?v=1.0.99';

export function renderVariants(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Quản Lý Biến Thể</h2>
          <p class="text-sm text-gray-500 mt-0.5">Cấu hình các loại biến thể và quản lý các thuộc tính, SKU, tồn kho sản phẩm</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button id="tab-variants" class="border-b-2 border-[#C9A84C] text-[#C9A84C] whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center gap-2 focus:outline-none transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Biến thể sản phẩm
          </button>
          <button id="tab-types" class="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center gap-2 focus:outline-none transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
            Loại biến thể
          </button>
        </nav>
      </div>

      <!-- Tab Contents -->
      <div id="variants-content" class="tab-content-pane"></div>
      <div id="types-content" class="tab-content-pane hidden"></div>
    </div>
  `;

  const tabVariants = container.querySelector('#tab-variants');
  const tabTypes = container.querySelector('#tab-types');
  const contentVariants = container.querySelector('#variants-content');
  const contentTypes = container.querySelector('#types-content');

  function switchTab(activeTab) {
    if (activeTab === 'variants') {
      // Style active tab
      tabVariants.className = 'border-b-2 border-[#C9A84C] text-[#C9A84C] whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center gap-2 focus:outline-none transition-all';
      tabTypes.className = 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center gap-2 focus:outline-none transition-all';
      // Show/Hide content
      contentVariants.classList.remove('hidden');
      contentTypes.classList.add('hidden');
      // Load content
      renderVariantTable(contentVariants);
    } else {
      // Style active tab
      tabTypes.className = 'border-b-2 border-[#C9A84C] text-[#C9A84C] whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center gap-2 focus:outline-none transition-all';
      tabVariants.className = 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center gap-2 focus:outline-none transition-all';
      // Show/Hide content
      contentTypes.classList.remove('hidden');
      contentVariants.classList.add('hidden');
      // Load content
      renderVariantTypesTable(contentTypes);
    }
  }

  // Bind Events
  tabVariants.addEventListener('click', () => switchTab('variants'));
  tabTypes.addEventListener('click', () => switchTab('types'));

  // Default to Variants list tab
  switchTab('variants');
}
