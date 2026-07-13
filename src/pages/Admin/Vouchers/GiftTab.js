import { createPromotion, updatePromotion, getPromotion, getProducts, getRanks } from '../../../services/adminService.js';
import { showToast } from '../shared/ui.js';
import { populateRankCheckboxes, getSelectedRanks } from './RankCheckboxes.js';

let editPromoId = null;
let currentStep = 1;
let productsList = [];
let selectedProductIds = [];
let giftProductId = null;

// Wizard State Object
let wizardState = {
  name: '',
  description: '',
  promotion_type: 'coupon',
  discount_type: 'percentage',
  code: '',
  value: '',
  max_discount_amount: '',
  min_order_amount: '',
  min_quantity: '',
  starts_at: '',
  ends_at: '',
  is_active: 1,
  priority: 0,
  usage_limit: '',
  usage_limit_per_customer: '',
  is_combinable: 0,
  combinable_with_other_promotions: 0,
  combinable_with_coupon: 0,
  combinable_with_free_shipping: 0,
  combinable_with_gift: 0,
  conditions: [],
  rewards: []
};

export async function renderGiftsTab(wrap, promoIdToEdit = null, onSaved = null) {
  // We rename this tab render function to align with legacy imports, but it handles the Step Wizard Promotion Form.
  editPromoId = promoIdToEdit;
  currentStep = 1;
  selectedProductIds = [];
  giftProductId = null;

  // Load products list early for product conditions & rewards
  try {
    const prodRes = await getProducts({ limit: 100 });
    productsList = prodRes.data || [];
  } catch (err) {
    console.error('Failed to load products list for wizard:', err);
  }

  if (editPromoId) {
    wrap.innerHTML = `<div class="p-6 text-center text-gray-400 font-medium">Đang tải thông tin khuyến mãi để sửa...</div>`;
    await loadPromotionDetails(editPromoId);
  } else {
    // Reset state for new promotion
    resetWizardState();
  }

  renderStep(wrap, onSaved);
}

function resetWizardState() {
  wizardState = {
    name: '',
    description: '',
    promotion_type: 'coupon',
    discount_type: 'percentage',
    code: '',
    value: '',
    max_discount_amount: '',
    min_order_amount: '',
    min_quantity: '',
    starts_at: '',
    ends_at: '',
    is_active: 1,
    priority: 0,
    usage_limit: '',
    usage_limit_per_customer: '1', // default 1
    is_combinable: 0,
    combinable_with_other_promotions: 0,
    combinable_with_coupon: 0,
    combinable_with_free_shipping: 0,
    combinable_with_gift: 0,
    conditions: [],
    rewards: []
  };
}

async function loadPromotionDetails(id) {
  try {
    const res = await getPromotion(id);
    const promo = res.data;
    if (promo) {
      wizardState = {
        name: promo.name || '',
        description: promo.description || '',
        promotion_type: promo.promotion_type || 'coupon',
        discount_type: promo.discount_type || 'percentage',
        code: promo.code || '',
        value: promo.value ? parseFloat(promo.value) : '',
        max_discount_amount: promo.max_discount_amount ? parseFloat(promo.max_discount_amount) : '',
        min_order_amount: promo.min_order_amount ? parseFloat(promo.min_order_amount) : '',
        min_quantity: promo.min_quantity ? parseInt(promo.min_quantity) : '',
        starts_at: promo.starts_at ? promo.starts_at.replace(' ', 'T') : '',
        ends_at: promo.ends_at ? promo.ends_at.replace(' ', 'T') : '',
        is_active: parseInt(promo.is_active) === 1 ? 1 : 0,
        priority: parseInt(promo.priority) || 0,
        usage_limit: promo.usage_limit || '',
        usage_limit_per_customer: promo.usage_limit_per_customer || '',
        is_combinable: parseInt(promo.is_combinable) === 1 ? 1 : 0,
        combinable_with_other_promotions: parseInt(promo.combinable_with_other_promotions) === 1 ? 1 : 0,
        combinable_with_coupon: parseInt(promo.combinable_with_coupon) === 1 ? 1 : 0,
        combinable_with_free_shipping: parseInt(promo.combinable_with_free_shipping) === 1 ? 1 : 0,
        combinable_with_gift: parseInt(promo.combinable_with_gift) === 1 ? 1 : 0,
        conditions: promo.conditions || [],
        rewards: promo.rewards || []
      };

      // Extract specific products condition
      const prodCond = wizardState.conditions.find(c => c.condition_type === 'product');
      if (prodCond) {
        selectedProductIds = JSON_decode_fallback(prodCond.value_json, []);
      }

      // Extract gift reward
      const giftRew = wizardState.rewards.find(r => r.reward_type === 'gift_product');
      if (giftRew) {
        giftProductId = parseInt(giftRew.product_id);
      }
    }
  } catch (err) {
    showToast('Lỗi tải thông tin chi tiết khuyến mãi: ' + err.message, 'error');
  }
}

function JSON_decode_fallback(str, fallback) {
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) ? val : fallback;
  } catch (e) {
    return fallback;
  }
}

function renderStep(wrap, onSaved) {
  const isEdit = editPromoId !== null;
  const title = isEdit ? `Sửa Chương Trình: ${wizardState.name || 'Khuyến mãi'}` : 'Tạo Khuyến Mãi Mới';

  wrap.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6" style="font-family: 'Quicksand', sans-serif;">
      <!-- Wizard Progress Header -->
      <div class="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 class="text-base font-bold text-gray-900">${title}</h3>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
          <span class="px-2 py-1 rounded ${currentStep === 1 ? 'bg-[#5d58f0] text-white' : 'bg-gray-100'}">1. Loại</span>
          <span class="text-gray-300">➔</span>
          <span class="px-2 py-1 rounded ${currentStep === 2 ? 'bg-[#5d58f0] text-white' : 'bg-gray-100'}">2. Thông tin</span>
          <span class="text-gray-300">➔</span>
          <span class="px-2 py-1 rounded ${currentStep === 3 ? 'bg-[#5d58f0] text-white' : 'bg-gray-100'}">3. Điều kiện</span>
          <span class="text-gray-300">➔</span>
          <span class="px-2 py-1 rounded ${currentStep === 4 ? 'bg-[#5d58f0] text-white' : 'bg-gray-100'}">4. Ưu đãi</span>
          <span class="text-gray-300">➔</span>
          <span class="px-2 py-1 rounded ${currentStep === 5 ? 'bg-[#5d58f0] text-white' : 'bg-gray-100'}">5. Giới hạn</span>
          <span class="text-gray-300">➔</span>
          <span class="px-2 py-1 rounded ${currentStep === 6 ? 'bg-[#5d58f0] text-white' : 'bg-gray-100'}">6. Xem trước</span>
        </div>
      </div>

      <!-- Step Content Box -->
      <div class="min-h-[300px]">
        ${renderStepContent()}
      </div>

      <!-- Navigation Footer -->
      <div class="flex justify-between border-t border-gray-100 pt-4 mt-6">
        <button id="wizard-prev-btn" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors ${currentStep === 1 ? 'invisible' : ''}">
          Quay lại
        </button>
        <button id="wizard-next-btn" class="px-5 py-2 bg-gray-950 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
          ${currentStep === 6 ? 'Lưu khuyến mãi' : 'Tiếp tục'}
        </button>
      </div>
    </div>
  `;

  // Bind navigation triggers
  wrap.querySelector('#wizard-prev-btn').addEventListener('click', () => {
    saveCurrentStepValues(wrap);
    currentStep--;
    renderStep(wrap, onSaved);
  });

  wrap.querySelector('#wizard-next-btn').addEventListener('click', async () => {
    saveCurrentStepValues(wrap);
    
    // Step validation checks
    if (currentStep === 2) {
      if (!wizardState.name) {
        showToast('Vui lòng nhập tên chương trình.', 'warning');
        return;
      }
      if (wizardState.promotion_type === 'coupon' && !wizardState.code) {
        showToast('Vui lòng nhập mã coupon.', 'warning');
        return;
      }
    } else if (currentStep === 4) {
      if (['gift', 'buy_x_get_y'].includes(wizardState.discount_type) && !giftProductId) {
        showToast('Vui lòng chọn sản phẩm quà tặng.', 'warning');
        return;
      }
      if ((wizardState.discount_type === 'percentage' || wizardState.discount_type === 'fixed_amount') && !wizardState.value) {
        showToast('Vui lòng nhập giá trị giảm.', 'warning');
        return;
      }
    }

    if (currentStep < 6) {
      currentStep++;
      renderStep(wrap, onSaved);
    } else {
      await savePromotion(onSaved);
    }
  });

  // Perform after-render initialization (e.g. checkbox setups)
  if (currentStep === 2) {
    const genBtn = wrap.querySelector('#wiz-gen-code-btn');
    if (genBtn) {
      genBtn.addEventListener('click', () => {
        const rand = 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const codeInput = wrap.querySelector('#wiz-code');
        if (codeInput) codeInput.value = rand;
        wizardState.code = rand;
      });
    }
  }

  if (currentStep === 3) {
    populateRankCheckboxes(wrap, 'wiz');
    
    // Bind rank buttons
    wrap.querySelector('#wiz-select-all-ranks')?.addEventListener('click', () => {
      wrap.querySelectorAll('input[name="wiz-customer-group"]').forEach(cb => cb.checked = true);
    });
    wrap.querySelector('#wiz-clear-all-ranks')?.addEventListener('click', () => {
      wrap.querySelectorAll('input[name="wiz-customer-group"]').forEach(cb => cb.checked = false);
    });

    // Toggle product scope checkboxes container
    const scopeSelect = wrap.querySelector('#wiz-apply-scope');
    scopeSelect?.addEventListener('change', (e) => {
      const wrapSelect = wrap.querySelector('#wiz-product-select-wrap');
      if (e.target.value === 'specific') {
        wrapSelect?.classList.remove('hidden');
      } else {
        wrapSelect?.classList.add('hidden');
      }
    });
  }

  if (currentStep === 4) {
    // Reward fields toggle visibility logic
    const rewardTypeSelect = wrap.querySelector('#wiz-reward-type');
    rewardTypeSelect?.addEventListener('change', (e) => {
      const val = e.target.value;
      const discountFields = wrap.querySelector('#wiz-discount-fields');
      const maxCapWrap = wrap.querySelector('#wiz-max-cap-wrap');
      const giftField = wrap.querySelector('#wiz-gift-field');

      if (['percentage', 'fixed_amount'].includes(val)) {
        discountFields?.classList.remove('hidden');
        if (val === 'percentage') {
          maxCapWrap?.classList.remove('hidden');
        } else {
          maxCapWrap?.classList.add('hidden');
        }
      } else {
        discountFields?.classList.add('hidden');
      }

      if (['gift', 'buy_x_get_y'].includes(val)) {
        giftField?.classList.remove('hidden');
      } else {
        giftField?.classList.add('hidden');
      }
    });
  }

  if (currentStep === 5) {
    // Combinable flags toggle
    const combinableCheck = wrap.querySelector('#wiz-is-combinable');
    combinableCheck?.addEventListener('change', (e) => {
      const flagsWrap = wrap.querySelector('#wiz-combination-flags-wrap');
      if (e.target.checked) {
        flagsWrap?.classList.remove('hidden');
      } else {
        flagsWrap?.classList.add('hidden');
      }
    });
  }
}

function renderStepContent() {
  switch (currentStep) {
    case 1:
      return `
        <div class="space-y-4">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chọn loại chương trình khuyến mãi</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Card 1: Mã giảm giá -->
            <label class="flex items-start gap-3.5 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${wizardState.promotion_type === 'coupon' && wizardState.discount_type !== 'buy_x_get_y' && wizardState.discount_type !== 'free_shipping' ? 'border-[#5d58f0] bg-[#5d58f0]/5' : 'border-gray-200'}">
              <input type="radio" name="wiz-promo-class" value="coupon" ${wizardState.promotion_type === 'coupon' && wizardState.discount_type !== 'buy_x_get_y' && wizardState.discount_type !== 'free_shipping' ? 'checked' : ''} class="text-[#5d58f0] focus:ring-[#5d58f0] mt-1">
              <div>
                <div class="text-sm font-bold text-gray-800">Mã giảm giá (Coupon)</div>
                <div class="text-xs text-gray-400 mt-1">Khách nhập mã code đã định trước để được giảm giá trực tiếp ở checkout.</div>
              </div>
            </label>

            <!-- Card 2: Khuyến mãi tự động -->
            <label class="flex items-start gap-3.5 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${wizardState.promotion_type === 'automatic' && wizardState.discount_type !== 'buy_x_get_y' && wizardState.discount_type !== 'free_shipping' ? 'border-[#5d58f0] bg-[#5d58f0]/5' : 'border-gray-200'}">
              <input type="radio" name="wiz-promo-class" value="automatic" ${wizardState.promotion_type === 'automatic' && wizardState.discount_type !== 'buy_x_get_y' && wizardState.discount_type !== 'free_shipping' ? 'checked' : ''} class="text-[#5d58f0] focus:ring-[#5d58f0] mt-1">
              <div>
                <div class="text-sm font-bold text-gray-800">Khuyến mãi tự động</div>
                <div class="text-xs text-gray-400 mt-1">Tự động áp dụng chiết khấu khi giỏ hàng thỏa mãn các điều kiện định sẵn.</div>
              </div>
            </label>

            <!-- Card 3: Mua X tặng Y -->
            <label class="flex items-start gap-3.5 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${wizardState.discount_type === 'buy_x_get_y' ? 'border-[#5d58f0] bg-[#5d58f0]/5' : 'border-gray-200'}">
              <input type="radio" name="wiz-promo-class" value="buy_x_get_y" ${wizardState.discount_type === 'buy_x_get_y' ? 'checked' : ''} class="text-[#5d58f0] focus:ring-[#5d58f0] mt-1">
              <div>
                <div class="text-sm font-bold text-gray-800">Mua X tặng Y (Buy X Get Y)</div>
                <div class="text-xs text-gray-400 mt-1">Tự động tặng sản phẩm quà Y khi khách hàng mua đủ số lượng sản phẩm X chỉ định.</div>
              </div>
            </label>

            <!-- Card 4: Miễn phí vận chuyển -->
            <label class="flex items-start gap-3.5 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${wizardState.discount_type === 'free_shipping' ? 'border-[#5d58f0] bg-[#5d58f0]/5' : 'border-gray-200'}">
              <input type="radio" name="wiz-promo-class" value="free_shipping" ${wizardState.discount_type === 'free_shipping' ? 'checked' : ''} class="text-[#5d58f0] focus:ring-[#5d58f0] mt-1">
              <div>
                <div class="text-sm font-bold text-gray-800">Miễn phí vận chuyển (Freeship)</div>
                <div class="text-xs text-gray-400 mt-1">Miễn hoàn toàn phí ship đơn hàng theo các điều kiện giá trị đơn hàng.</div>
              </div>
            </label>
          </div>
        </div>
      `;

    case 2:
      return `
        <div class="space-y-4 max-w-xl">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tên chương trình khuyến mãi</label>
            <input type="text" id="wiz-name" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" placeholder="Ví dụ: Ưu đãi hè rực rỡ" value="${wizardState.name || ''}">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Mô tả nội bộ / Ghi chú</label>
            <textarea id="wiz-desc" rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" placeholder="Ghi chú chi tiết chương trình ưu đãi...">${wizardState.description || ''}</textarea>
          </div>

          <div id="wiz-code-wrap" class="${wizardState.promotion_type === 'coupon' ? '' : 'hidden'} space-y-1">
            <label class="block text-xs font-bold text-gray-400 uppercase">Mã Coupon</label>
            <div class="flex gap-2">
              <input type="text" id="wiz-code" class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0] font-mono font-bold uppercase" placeholder="Ví dụ: WELCOME10" value="${wizardState.code || ''}">
              <button type="button" id="wiz-gen-code-btn" class="px-3.5 py-2 border border-gray-300 hover:border-gray-400 rounded-xl text-xs font-bold text-gray-700 transition-colors bg-gray-50 focus:outline-none">Tạo mã ngẫu nhiên</button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Độ ưu tiên áp dụng (Priority)</label>
            <input type="number" id="wiz-priority" class="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" value="${wizardState.priority || 0}">
            <p class="text-[10px] text-gray-400 mt-1">Độ ưu tiên cao hơn sẽ được áp dụng trước nếu không cho phép cộng dồn.</p>
          </div>

          <div class="pt-2">
            <label class="relative inline-flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" id="wiz-active" ${wizardState.is_active === 1 ? 'checked' : ''} class="sr-only peer">
              <div class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5d58f0]"></div>
              <span class="text-xs font-bold text-gray-700">Kích hoạt chương trình ngay lập tức</span>
            </label>
          </div>
        </div>
      `;

    case 3:
      return `
        <div class="space-y-4 max-w-xl">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Giá trị tối thiểu của đơn hàng (Min Thresholds)</label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] text-gray-400 mb-0.5">Giá trị đơn từ (đ)</label>
                <input type="number" id="wiz-min-order" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" placeholder="0" value="${wizardState.min_order_amount || ''}">
              </div>
              <div>
                <label class="block text-[10px] text-gray-400 mb-0.5">Số lượng sản phẩm từ</label>
                <input type="number" id="wiz-min-qty" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" placeholder="0" value="${wizardState.min_quantity || ''}">
              </div>
            </div>
            <div class="mt-2.5 p-2.5 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-1.5 text-[10px] text-amber-700 leading-normal">
              <svg class="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span><strong>Mẹo thiết lập Buy X Get Y:</strong> Nếu cấu hình "Sản phẩm cụ thể" ở bên dưới, các điều kiện về số lượng hoặc giá trị đơn hàng tối thiểu này sẽ chỉ tính trên các sản phẩm đó. Ví dụ: nhập số lượng từ 2 để yêu cầu mua tối thiểu 2 sản phẩm thuộc nhóm này mới được nhận quà.</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Nhóm khách hàng áp dụng</label>
            <div class="flex items-center gap-3 text-[10px] font-bold text-[#5d58f0] mb-1">
              <button type="button" id="wiz-select-all-ranks" class="hover:underline">✓ Chọn tất cả</button>
              <button type="button" id="wiz-clear-all-ranks" class="hover:underline">✕ Xóa chọn</button>
            </div>
            <div id="wiz-ranks-checkboxes-container" class="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
              <!-- Checkboxes populate dynamically -->
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Sản phẩm áp dụng</label>
            <select id="wiz-apply-scope" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0] bg-white">
              <option value="all" ${selectedProductIds.length === 0 ? 'selected' : ''}>Tất cả sản phẩm</option>
              <option value="specific" ${selectedProductIds.length > 0 ? 'selected' : ''}>Sản phẩm chỉ định</option>
            </select>
          </div>

          <div id="wiz-product-select-wrap" class="space-y-2 border border-gray-150 p-3 rounded-xl ${selectedProductIds.length > 0 ? '' : 'hidden'}">
            <span class="block text-xs font-bold text-gray-500">Chọn danh sách sản phẩm:</span>
            <div class="max-h-40 overflow-y-auto space-y-1">
              ${productsList.map(p => {
                const checked = selectedProductIds.includes(parseInt(p.id)) ? 'checked' : '';
                return `
                  <label class="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" name="wiz-product-item" value="${p.id}" ${checked} class="rounded border-gray-300 text-[#5d58f0] focus:ring-[#5d58f0]">
                    <span>${p.name} (SKU: ${p.sku})</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;

    case 4:
      return `
        <div class="space-y-4 max-w-xl">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Chọn loại ưu đãi (Rewards)</label>
            <select id="wiz-reward-type" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0] bg-white" ${['buy_x_get_y', 'free_shipping'].includes(wizardState.discount_type) ? 'disabled' : ''}>
              <option value="percentage" ${wizardState.discount_type === 'percentage' ? 'selected' : ''}>Giảm phần trăm (%)</option>
              <option value="fixed_amount" ${wizardState.discount_type === 'fixed_amount' ? 'selected' : ''}>Giảm tiền cố định (đ)</option>
              <option value="free_shipping" ${wizardState.discount_type === 'free_shipping' ? 'selected' : ''}>Miễn phí vận chuyển (Freeship)</option>
              <option value="gift" ${wizardState.discount_type === 'gift' ? 'selected' : ''}>Tặng quà tặng tự động (Free Gift)</option>
              <option value="buy_x_get_y" ${wizardState.discount_type === 'buy_x_get_y' ? 'selected' : ''}>Mua X tặng Y (Buy X Get Y)</option>
            </select>
          </div>

          <div id="wiz-discount-fields" class="${['percentage', 'fixed_amount'].includes(wizardState.discount_type) ? '' : 'hidden'} space-y-3">
            <div>
              <label class="block text-xs text-gray-400 mb-0.5">Giá trị giảm</label>
              <input type="number" id="wiz-reward-val" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" placeholder="Ví dụ: 10%" value="${wizardState.value || ''}">
            </div>
            <div id="wiz-max-cap-wrap" class="${wizardState.discount_type === 'percentage' ? '' : 'hidden'}">
              <label class="block text-xs text-gray-400 mb-0.5">Giảm tối đa (đ)</label>
              <input type="number" id="wiz-reward-max-cap" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" placeholder="Mặc định: không giới hạn" value="${wizardState.max_discount_amount || ''}">
            </div>
          </div>

          <div id="wiz-gift-field" class="${['gift', 'buy_x_get_y'].includes(wizardState.discount_type) ? '' : 'hidden'} space-y-2">
            <label class="block text-xs text-gray-400 mb-0.5">Sản phẩm tặng kèm</label>
            <select id="wiz-gift-product-select" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0] bg-white">
              <option value="">-- Chọn sản phẩm làm quà tặng --</option>
              ${productsList.map(p => `
                <option value="${p.id}" ${giftProductId === parseInt(p.id) ? 'selected' : ''}>${p.name}</option>
              `).join('')}
            </select>
            <div class="mt-2.5 p-2.5 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-1.5 text-[10px] text-amber-700 leading-normal">
              <svg class="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span><strong>Mẹo thiết lập Buy X Tặng Y:</strong> Kết hợp với Điều kiện ở Bước 3 để tự động tặng sản phẩm quà này khi khách hàng mua đủ số lượng/giá trị tối thiểu đối với danh sách sản phẩm chỉ định.</span>
            </div>
          </div>
        </div>
      `;

    case 5:
      return `
        <div class="space-y-4 max-w-xl">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Thời gian chạy chương trình</label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] text-gray-400 mb-0.5">Ngày bắt đầu</label>
                <input type="datetime-local" id="wiz-starts-at" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" value="${wizardState.starts_at || ''}">
              </div>
              <div>
                <label class="block text-[10px] text-gray-400 mb-0.5">Ngày kết thúc (Không giới hạn nếu để trống)</label>
                <input type="datetime-local" id="wiz-ends-at" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" value="${wizardState.ends_at || ''}">
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Giới hạn số lượng sử dụng</label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] text-gray-400 mb-0.5">Tổng số lượt sử dụng tối đa</label>
                <input type="number" id="wiz-limit" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" placeholder="Không giới hạn" value="${wizardState.usage_limit || ''}">
              </div>
              <div>
                <label class="block text-[10px] text-gray-400 mb-0.5">Lượt sử dụng mỗi khách hàng</label>
                <input type="number" id="wiz-limit-cust" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" placeholder="Không giới hạn (ví dụ: 1)" value="${wizardState.usage_limit_per_customer || ''}">
              </div>
            </div>
          </div>

          <div class="space-y-2 border-t border-gray-100 pt-4">
            <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
              <input type="checkbox" id="wiz-is-combinable" ${wizardState.is_combinable === 1 ? 'checked' : ''} class="rounded border-gray-300 text-[#5d58f0] focus:ring-[#5d58f0]">
              Cho phép áp dụng cộng dồn (Combinable)
            </label>
            
            <div id="wiz-combination-flags-wrap" class="pl-6 space-y-2 ${wizardState.is_combinable === 1 ? '' : 'hidden'}">
              <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                <input type="checkbox" id="wiz-comb-other" ${wizardState.combinable_with_other_promotions === 1 ? 'checked' : ''} class="rounded border-gray-300 text-[#5d58f0] focus:ring-[#5d58f0]">
                Cộng dồn với khuyến mãi tự động khác
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                <input type="checkbox" id="wiz-comb-coupon" ${wizardState.combinable_with_coupon === 1 ? 'checked' : ''} class="rounded border-gray-300 text-[#5d58f0] focus:ring-[#5d58f0]">
                Cộng dồn với mã coupon khác
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                <input type="checkbox" id="wiz-comb-ship" ${wizardState.combinable_with_free_shipping === 1 ? 'checked' : ''} class="rounded border-gray-300 text-[#5d58f0] focus:ring-[#5d58f0]">
                Cộng dồn với miễn phí vận chuyển
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                <input type="checkbox" id="wiz-comb-gift" ${wizardState.combinable_with_gift === 1 ? 'checked' : ''} class="rounded border-gray-300 text-[#5d58f0] focus:ring-[#5d58f0]">
                Cộng dồn với quà tặng
              </label>
            </div>
          </div>
        </div>
      `;

    case 6:
      return `
        <div class="space-y-4 max-w-xl">
          <h4 class="text-sm font-bold text-gray-800 uppercase tracking-wider">Xem trước cấu hình chương trình</h4>
          
          <div class="bg-amber-50/30 border border-amber-200/50 rounded-xl p-4 space-y-3 text-sm text-gray-700">
            <div>
              <span class="font-bold text-gray-500">Tên chương trình:</span>
              <span class="font-semibold text-gray-800 block mt-0.5">${wizardState.name}</span>
            </div>
            <div>
              <span class="font-bold text-gray-500">Mô tả:</span>
              <span class="block text-xs mt-0.5">${wizardState.description || 'Không có mô tả'}</span>
            </div>
            <div>
              <span class="font-bold text-gray-500">Hình thức áp dụng:</span>
              <span class="font-semibold text-gray-800 block mt-0.5">
                ${wizardState.promotion_type === 'coupon' ? `Mã giảm giá (Nhập mã: <strong>${wizardState.code}</strong>)` : 'Tự động áp dụng ở giỏ hàng'}
              </span>
            </div>
            <div>
              <span class="font-bold text-gray-500">Nội dung ưu đãi:</span>
              <span class="font-bold text-[#5d58f0] block mt-0.5">
                ${formatPreviewReward()}
              </span>
            </div>
            <div>
              <span class="font-bold text-gray-500">Thời gian chạy:</span>
              <span class="block text-xs mt-0.5">
                Từ: ${wizardState.starts_at ? formatDateString(wizardState.starts_at) : 'Kích hoạt ngay'}
                <br>
                Đến: ${wizardState.ends_at ? formatDateString(wizardState.ends_at) : 'Vô thời hạn'}
              </span>
            </div>
            <div>
              <span class="font-bold text-gray-500">Cộng dồn:</span>
              <span class="block text-xs mt-0.5">
                ${wizardState.is_combinable === 1 ? 'Có cho phép cộng dồn với các ưu đãi được tick chọn.' : 'Không cho phép cộng dồn với bất kỳ ưu đãi nào khác.'}
              </span>
            </div>
          </div>
        </div>
      `;

    default:
      return '';
  }
}

function formatPreviewReward() {
  if (wizardState.discount_type === 'percentage') {
    return `Giảm ${wizardState.value}% ${wizardState.max_discount_amount ? `(Tối đa ${parseFloat(wizardState.max_discount_amount).toLocaleString()}đ)` : ''}`;
  } else if (wizardState.discount_type === 'fixed_amount') {
    return `Giảm ${parseFloat(wizardState.value).toLocaleString()}đ`;
  } else if (wizardState.discount_type === 'free_shipping') {
    return `Miễn phí vận chuyển toàn quốc`;
  } else if (wizardState.discount_type === 'gift') {
    const prod = productsList.find(p => p.id == giftProductId);
    return `Tặng sản phẩm quà tặng: ${prod ? prod.name : 'Chưa chọn'}`;
  } else if (wizardState.discount_type === 'buy_x_get_y') {
    const buyProds = selectedProductIds.map(id => productsList.find(p => p.id == id)?.name || id).join(', ');
    const giftProd = productsList.find(p => p.id == giftProductId)?.name || 'Chưa chọn';
    return `Mua ${wizardState.min_quantity || 1} [${buyProds || 'Sản phẩm bất kỳ'}] tặng 1 [${giftProd}]`;
  }
  return '';
}

function formatDateString(str) {
  if (!str) return '';
  return new Date(str).toLocaleString('vi-VN');
}

function saveCurrentStepValues(wrap) {
  if (currentStep === 1) {
    const classEl = wrap.querySelector('input[name="wiz-promo-class"]:checked');
    const classVal = classEl ? classEl.value : 'coupon';
    if (classVal === 'coupon') {
      wizardState.promotion_type = 'coupon';
      if (['buy_x_get_y', 'free_shipping'].includes(wizardState.discount_type)) {
        wizardState.discount_type = 'percentage';
      }
    } else if (classVal === 'automatic') {
      wizardState.promotion_type = 'automatic';
      if (['buy_x_get_y', 'free_shipping'].includes(wizardState.discount_type)) {
        wizardState.discount_type = 'percentage';
      }
    } else if (classVal === 'buy_x_get_y') {
      wizardState.promotion_type = 'automatic';
      wizardState.discount_type = 'buy_x_get_y';
    } else if (classVal === 'free_shipping') {
      wizardState.promotion_type = 'automatic';
      wizardState.discount_type = 'free_shipping';
    }
  } else if (currentStep === 2) {
    wizardState.name = wrap.querySelector('#wiz-name')?.value.trim() || '';
    wizardState.description = wrap.querySelector('#wiz-desc')?.value.trim() || '';
    wizardState.code = wrap.querySelector('#wiz-code')?.value.trim().toUpperCase() || '';
    wizardState.priority = parseInt(wrap.querySelector('#wiz-priority')?.value) || 0;
    wizardState.is_active = wrap.querySelector('#wiz-active')?.checked ? 1 : 0;
  } else if (currentStep === 3) {
    wizardState.min_order_amount = wrap.querySelector('#wiz-min-order')?.value || '';
    wizardState.min_quantity = wrap.querySelector('#wiz-min-qty')?.value || '';

    // Sync min_order_amount to conditions
    const orderAmt = parseFloat(wizardState.min_order_amount);
    const existingAmtIdx = wizardState.conditions.findIndex(c => c.condition_type === 'order_amount');
    if (!isNaN(orderAmt) && orderAmt > 0) {
      if (existingAmtIdx !== -1) {
        wizardState.conditions[existingAmtIdx].value_json = JSON.stringify([orderAmt]);
      } else {
        wizardState.conditions.push({
          condition_type: 'order_amount',
          operator: 'greater_than_or_equal',
          value_json: JSON.stringify([orderAmt])
        });
      }
    } else {
      if (existingAmtIdx !== -1) wizardState.conditions.splice(existingAmtIdx, 1);
    }

    // Sync min_quantity to conditions
    const minQty = parseInt(wizardState.min_quantity);
    const existingQtyIdx = wizardState.conditions.findIndex(c => c.condition_type === 'quantity');
    if (!isNaN(minQty) && minQty > 0) {
      if (existingQtyIdx !== -1) {
        wizardState.conditions[existingQtyIdx].value_json = JSON.stringify([minQty]);
      } else {
        wizardState.conditions.push({
          condition_type: 'quantity',
          operator: 'greater_than_or_equal',
          value_json: JSON.stringify([minQty])
        });
      }
    } else {
      if (existingQtyIdx !== -1) wizardState.conditions.splice(existingQtyIdx, 1);
    }
    
    // Save rank conditions
    const ranks = getSelectedRanks(wrap, 'wiz');
    const existingRankIdx = wizardState.conditions.findIndex(c => c.condition_type === 'customer_group');
    if (existingRankIdx !== -1) {
      if (ranks === 'all') {
        wizardState.conditions.splice(existingRankIdx, 1);
      } else {
        wizardState.conditions[existingRankIdx].value_json = JSON.stringify(ranks.split(','));
      }
    } else if (ranks !== 'all') {
      wizardState.conditions.push({
        condition_type: 'customer_group',
        operator: 'in',
        value_json: JSON.stringify(ranks.split(','))
      });
    }

    // Save product scope conditions
    const scope = wrap.querySelector('#wiz-apply-scope')?.value || 'all';
    const existingProdIdx = wizardState.conditions.findIndex(c => c.condition_type === 'product');
    if (scope === 'all') {
      selectedProductIds = [];
      if (existingProdIdx !== -1) wizardState.conditions.splice(existingProdIdx, 1);
    } else {
      const selectedCbs = Array.from(wrap.querySelectorAll('input[name="wiz-product-item"]:checked'))
        .map(cb => parseInt(cb.value));
      selectedProductIds = selectedCbs;
      
      if (existingProdIdx !== -1) {
        wizardState.conditions[existingProdIdx].value_json = JSON.stringify(selectedProductIds);
      } else {
        wizardState.conditions.push({
          condition_type: 'product',
          operator: 'in',
          value_json: JSON.stringify(selectedProductIds)
        });
      }
    }
  } else if (currentStep === 4) {
    const typeEl = wrap.querySelector('#wiz-reward-type');
    if (typeEl && !typeEl.disabled) {
      wizardState.discount_type = typeEl.value || 'percentage';
    }
    wizardState.value = wrap.querySelector('#wiz-reward-val')?.value || '';
    wizardState.max_discount_amount = wrap.querySelector('#wiz-reward-max-cap')?.value || '';
    giftProductId = wrap.querySelector('#wiz-gift-product-select')?.value || null;

    // Build rewards array
    if (['gift', 'buy_x_get_y'].includes(wizardState.discount_type)) {
      wizardState.rewards = [{
        reward_type: 'gift_product',
        product_id: giftProductId,
        quantity: 1
      }];
    } else if (wizardState.discount_type === 'free_shipping') {
      wizardState.rewards = [{
        reward_type: 'free_shipping'
      }];
    } else {
      wizardState.rewards = [{
        reward_type: 'discount',
        discount_type: wizardState.discount_type,
        discount_value: wizardState.value,
        max_discount_amount: wizardState.max_discount_amount || null
      }];
    }
  } else if (currentStep === 5) {
    wizardState.starts_at = wrap.querySelector('#wiz-starts-at')?.value || '';
    wizardState.ends_at = wrap.querySelector('#wiz-ends-at')?.value || '';
    wizardState.usage_limit = wrap.querySelector('#wiz-limit')?.value || '';
    wizardState.usage_limit_per_customer = wrap.querySelector('#wiz-limit-cust')?.value || '';
    
    wizardState.is_combinable = wrap.querySelector('#wiz-is-combinable')?.checked ? 1 : 0;
    if (wizardState.is_combinable) {
      wizardState.combinable_with_other_promotions = wrap.querySelector('#wiz-comb-other')?.checked ? 1 : 0;
      wizardState.combinable_with_coupon = wrap.querySelector('#wiz-comb-coupon')?.checked ? 1 : 0;
      wizardState.combinable_with_free_shipping = wrap.querySelector('#wiz-comb-ship')?.checked ? 1 : 0;
      wizardState.combinable_with_gift = wrap.querySelector('#wiz-comb-gift')?.checked ? 1 : 0;
    } else {
      wizardState.combinable_with_other_promotions = 0;
      wizardState.combinable_with_coupon = 0;
      wizardState.combinable_with_free_shipping = 0;
      wizardState.combinable_with_gift = 0;
    }
  }
}

async function savePromotion(onSaved) {
  const isEdit = editPromoId !== null;

  // Final preparations of format
  const payload = { ...wizardState };
  if (payload.starts_at) payload.starts_at = payload.starts_at.replace('T', ' ');
  if (payload.ends_at) payload.ends_at = payload.ends_at.replace('T', ' ');

  try {
    if (isEdit) {
      await updatePromotion(editPromoId, payload);
      showToast('Cập nhật chương trình khuyến mãi thành công!', 'success');
    } else {
      await createPromotion(payload);
      showToast('Kích hoạt chương trình khuyến mãi thành công!', 'success');
    }
    
    if (onSaved) {
      onSaved();
    }
  } catch (err) {
    showToast('Lỗi lưu chương trình khuyến mãi: ' + err.message, 'error');
  }
}
