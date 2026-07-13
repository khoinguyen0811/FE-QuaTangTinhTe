import { showToast, showUnsavedChangesModal } from '../shared/ui.js?v=1.0.9';
import { 
  getProduct, 
  getProductAnalytics,
  createProduct, 
  updateProduct, 
  getCategories, 
  getVariantTypes
} from '../../../services/adminService.js';
import { openImagePicker } from './ImagePicker.js?v=1.0.55';
import { renderProductFormHtml } from './ProductFormTemplate.js?v=1.3.0';
import { setupProductPromotions } from './ProductPromotions.js?v=1.0.55';
import { setupProductImages } from './ProductFormImages.js?v=1.0.55';
import { setupProductVariants } from './ProductVariantsForm.js?v=1.4.0';
import { setupProductTags } from './ProductFormTags.js?v=1.2.0';
import { setupProductCategories } from './ProductFormCategories.js?v=1.3.0';
import { slugify, injectFormStyles, saveProductDraft } from './ProductFormPart2.js?v=1.0.55';

let productCharts = {};

export function renderProductDetail(container, productId, goBack) {
  // Render main container structure
  container.innerHTML = `
    <div class="space-y-5 max-w-[1200px] mx-auto p-2">
      <!-- Header Bar -->
      <div class="bg-white dark:bg-[#161c32] rounded-2xl px-6 py-4 shadow-sm border border-gray-150 dark:border-gray-800 flex items-center justify-between flex-wrap gap-4 select-none">
        <div class="flex items-center gap-3">
          <button id="back-to-products" class="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white flex-shrink-0 text-sm font-bold border-none bg-transparent cursor-pointer flex items-center justify-center" title="Quay lại danh sách">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
          <h2 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider leading-none">
            ${productId === 'new' ? 'Thêm Sản Phẩm Mới' : 'Chi Tiết Sản Phẩm'}
          </h2>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <a href="#dashboard" class="text-gray-400 hover:text-gray-650 dark:hover:text-white transition-colors" title="Trang chủ">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </a>
          <span class="text-gray-300 dark:text-gray-700">/</span>
          <a href="#products" class="text-gray-550 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white font-bold transition-colors">Sản phẩm</a>
          <span class="text-gray-300 dark:text-gray-700">/</span>
          <span class="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-[#5d58f0] dark:text-indigo-400 rounded-lg font-bold text-[10px] uppercase tracking-wider">
            ${productId === 'new' ? 'Thêm sản phẩm' : 'Chi tiết sản phẩm'}
          </span>
        </div>
      </div>

      <div class="rounded-2xl" id="pd-form-container">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C9A84C] rounded-full"></div>
          <span class="ml-3 text-xs text-gray-500 font-semibold">Đang tải biểu mẫu...</span>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#back-to-products').addEventListener('click', goBack);

  // Load details
  loadDetails(container, productId, goBack);
}

async function loadDetails(container, productId, goBack) {
  const formContainer = container.querySelector('#pd-form-container');

  try {
    let product = null;

    if (productId !== 'new') {
      const prodRes = await getProduct(productId);
      product = prodRes.data || prodRes;
    }

    // Initialize Form inline
    initProductFormInline(formContainer, product, goBack);
  } catch (err) {
    formContainer.innerHTML = `
      <div class="text-center py-8">
        <div class="text-red-500 text-sm font-semibold mb-2">${err.message || 'Lỗi tải dữ liệu sản phẩm'}</div>
        <button id="pd-retry-btn" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition">Thử lại</button>
      </div>
    `;
    formContainer.querySelector('#pd-retry-btn')?.addEventListener('click', () => {
      loadDetails(container, productId, goBack);
    });
  }
}

function initProductFormInline(formContainer, product, goBack) {
  const productId = product?.id || 'new';
  const draftKey = 'sly_draft_product_' + productId;
  const draftDataStr = localStorage.getItem(draftKey);
  let restoredDraft = null;
  if (draftDataStr) {
    try {
      restoredDraft = JSON.parse(draftDataStr);
    } catch (e) {
      console.error(e);
    }
  }

  const mergedProduct = restoredDraft
    ? {
        id: product?.id,
        ...product,
        name: restoredDraft.name || product?.name,
        slug: restoredDraft.slug || product?.slug,
        base_price: restoredDraft.base_price !== undefined ? restoredDraft.base_price : product?.base_price,
        subcategory_id: restoredDraft.subcategory_id !== undefined ? restoredDraft.subcategory_id : product?.subcategory_id,
        print_detail: restoredDraft.print_detail !== undefined ? restoredDraft.print_detail : product?.print_detail,
        size_chart_url: restoredDraft.size_chart_url !== undefined ? restoredDraft.size_chart_url : product?.size_chart_url,
        video_url: restoredDraft.video_url !== undefined ? restoredDraft.video_url : product?.video_url,
        care_instructions: restoredDraft.care_instructions !== undefined ? restoredDraft.care_instructions : product?.care_instructions,
        is_active: restoredDraft.is_active !== undefined ? restoredDraft.is_active : product?.is_active,
        is_featured: restoredDraft.is_featured !== undefined ? restoredDraft.is_featured : product?.is_featured,
        is_customizable: restoredDraft.is_customizable !== undefined ? restoredDraft.is_customizable : product?.is_customizable,
        images: restoredDraft.images || product?.images,
        variants: restoredDraft.variants || product?.variants,
        tags: restoredDraft.tags || product?.tags
      }
    : product;

  let formHtml = renderProductFormHtml(mergedProduct);
  
  formHtml = formHtml.replace(
    '<button id="pf-close"',
    '<button id="pf-close" class="hidden"'
  );

  formHtml = formHtml.replaceAll('h-[90vh]', '');
  formHtml = formHtml.replaceAll('overflow-hidden', '');
  formHtml = formHtml.replaceAll('lg:overflow-hidden', '');
  formHtml = formHtml.replaceAll('flex-1 flex flex-col overflow-hidden', 'flex flex-col');
  formHtml = formHtml.replaceAll('lg:h-full', '');
  formHtml = formHtml.replaceAll(
    'id="pf-variants-tab-content" style="display: none;" class="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 p-6 overflow-y-auto min-h-0 bg-gray-50/20"',
    'id="pf-variants-tab-content" style="display: none;" class="flex-1 flex flex-col gap-6 p-6 overflow-y-auto min-h-0 bg-gray-50/20"'
  );
  
  formContainer.innerHTML = formHtml;
  injectFormStyles();

  if (restoredDraft) {
    setTimeout(() => {
      showToast('Đã tự động khôi phục bản nháp chưa lưu của sản phẩm này!', 'success');
    }, 200);
  }

  // Load state and images
  let categoryTree = [];
  let currentImages = [];
  if (mergedProduct?.images && Array.isArray(mergedProduct.images)) {
    currentImages = [...mergedProduct.images];
  }
  let currentVariants = [];
  if (mergedProduct && Array.isArray(mergedProduct.variants)) {
    currentVariants = mergedProduct.variants.map(v => {
      const item = {
        id: v.id,
        size: v.size || '',
        material: v.material || v.color || '',
        price: v.price || '',
        compare_at_price: v.compare_at_price || '',
        stock_quantity: v.stock_quantity ?? 0,
        sku: v.sku || '',
        images: v.images || [],
        allow_out_of_stock_order: v.allow_out_of_stock_order === 1 || v.allow_out_of_stock_order === true || v.allow_out_of_stock_order === '1',
        is_active: v.is_active !== 0 && v.is_active !== false,
        sort_order: v.sort_order || 0
      };
      if (v.attribute_values) {
        Object.entries(v.attribute_values).forEach(([k, val]) => {
          if (k !== 'size' && k !== 'material' && k !== 'color' && k !== 'compare_at_price' && k !== 'image_url' && k !== 'is_active' && k !== 'sort_order' && k !== 'allow_out_of_stock_order') {
            item[k] = val;
          }
        });
      }
      return item;
    });
  }

  let variantFilter = { search: '' };
  let selectedVariants = new Set();

  const SYSTEM_FIELDS = [
    'id',
    'product_id',
    'variant_id',
    'sku',
    'price',
    'compare_at_price',
    'stock_quantity',
    'image_url',
    'is_active',
    'sort_order',
    'allow_out_of_stock_order',
    'created_at',
    'updated_at',
    'images',
    '_originalIdx'
  ];

  let activeAttributes = [];
  if (restoredDraft && Array.isArray(restoredDraft.activeAttributes)) {
    activeAttributes = restoredDraft.activeAttributes.filter(a => !SYSTEM_FIELDS.includes(a.name));
  }

  // Ensure default size & material are always present
  if (!activeAttributes.some(a => a.name === 'size')) {
    activeAttributes.unshift({ name: 'size', displayName: 'Kích cỡ', values: '' });
  }
  if (!activeAttributes.some(a => a.name === 'material')) {
    const sizeIdx = activeAttributes.findIndex(a => a.name === 'size');
    activeAttributes.splice(sizeIdx + 1, 0, { name: 'material', displayName: 'Chất liệu', values: '' });
  }

  // Pre-fill default values from currentVariants
  if (currentVariants.length > 0) {
    const sizes = [...new Set(currentVariants.map(v => v.size).filter(Boolean))];
    const materials = [...new Set(currentVariants.map(v => v.material).filter(Boolean))];
    
    const sizeAttr = activeAttributes.find(a => a.name === 'size');
    if (sizeAttr && !sizeAttr.values) {
      sizeAttr.values = sizes.join(', ');
    }
    const matAttr = activeAttributes.find(a => a.name === 'material');
    if (matAttr && !matAttr.values) {
      matAttr.values = materials.join(', ');
    }
  }

  let hasVariants = false;
  if (currentVariants.length > 1) {
    hasVariants = true;
  } else if (currentVariants.length === 1) {
    const v0 = currentVariants[0];
    if (v0.size && v0.size !== 'Mặc định' && v0.size !== 'Default Title' && v0.size !== '') {
      hasVariants = true;
    }
  }

  const context = {
    product,
    currentImages,
    currentVariants,
    activeAttributes,
    variantFilter,
    selectedVariants,
    hasVariants,
    renderImageSlots: null,
    renderAttributeInputs: null,
    populateFilterOptions: null,
    renderVariantRows: null
  };

  // Categories and subcategories setup (WordPress style checkbox tree)
  setupProductCategories(formContainer, context);

  async function initFormConfiguration() {
    try {
      const typesRes = await getVariantTypes();

      // Process Variant Types and render Suggestions Datalists
      const types = Array.isArray(typesRes.data) ? typesRes.data : [];
      const dlSize = formContainer.querySelector('#dl-pf-size');
      const dlColor = formContainer.querySelector('#dl-pf-material');
      
      const sizeType = types.find(t => t.name === 'size');
      if (sizeType && sizeType.predefined_values && dlSize) {
        const sizeOpts = sizeType.predefined_values.split(',').map(v => v.trim()).filter(Boolean);
        dlSize.innerHTML = sizeOpts.map(opt => `<option value="${opt}"></option>`).join('');
      }

      const colorType = types.find(t => t.name === 'material' || t.name === 'color');
      if (colorType && colorType.predefined_values && dlColor) {
        const colorOpts = colorType.predefined_values.split(',').map(v => v.trim()).filter(Boolean);
        dlColor.innerHTML = colorOpts.map(opt => `<option value="${opt}"></option>`).join('');
      }

      if (currentVariants.length > 0) {
        Object.keys(firstVar).forEach(key => {
          if (!SYSTEM_FIELDS.includes(key) && key !== 'size' && key !== 'material' && key !== 'color') {
            const typeInfo = types.find(t => t.name === key);
            const displayName = typeInfo ? (typeInfo.display_name || typeInfo.name) : key;
            const values = [...new Set(currentVariants.map(v => v[key]).filter(Boolean))].join(', ');
            
            if (!activeAttributes.some(a => a.name === key)) {
              activeAttributes.push({
                name: key,
                displayName: displayName,
                values: values,
                isCustom: true
              });
            }
          }
        });
        if (context.renderAttributeInputs) context.renderAttributeInputs();
        if (context.populateFilterOptions) context.populateFilterOptions();
      }
    } catch (e) {
      showToast('Lỗi tải cấu hình dữ liệu: ' + e.message, 'error');
    }
  }
  
  initFormConfiguration();

  // Setup visual components
  setupProductImages(formContainer, context);
  setupProductVariants(formContainer, context);
  setupProductTags(formContainer, context);
  setupProductCategories(formContainer, context);

  // Initial renders & Quill Setup
  setTimeout(() => {
    if (context.renderImageSlots) context.renderImageSlots();
    if (context.renderAttributeInputs) context.renderAttributeInputs();
    if (context.currentVariants.length > 0) {
      const tableWrapper = formContainer.querySelector('#pf-variants-table-wrapper');
      if (tableWrapper) tableWrapper.classList.remove('hidden');
    }
    if (context.populateFilterOptions) context.populateFilterOptions();
    if (context.renderVariantRows) context.renderVariantRows();

    const editorEl = formContainer.querySelector('#pf-description-editor');
    if (editorEl && typeof Quill !== 'undefined') {
      const quill = new Quill(editorEl, {
        theme: 'snow',
        placeholder: 'Nhập mô tả chi tiết sản phẩm...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
          ]
        }
      });

      const descInput = formContainer.querySelector('#pf-description');
      quill.on('text-change', () => {
        descInput.value = quill.root.innerHTML.trim() === '<p><br></p>' ? '' : quill.root.innerHTML;
        onDraftChange();
      });
    }
  }, 100);

  if (product) {
    setupProductPromotions(formContainer, product);
  }

  setupTabs(formContainer);

  const onDraftChange = () => {
    saveProductDraft(productId, formContainer, context, context.selectedCategoryIds);
  };
  context.onDraftChange = onDraftChange;

  const formEl = formContainer.querySelector('#product-form');
  if (formEl) {
    formEl.addEventListener('input', onDraftChange);
    formEl.addEventListener('change', onDraftChange);
  }

  // Close and cancel handlers
  const close = () => {
    if (localStorage.getItem(draftKey)) {
      showUnsavedChangesModal({
        onSave: () => {
          formEl?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        },
        onDiscard: () => {
          localStorage.removeItem(draftKey);
          document.removeEventListener('keydown', handleKeydown);
          if (window.pendingNavigationTarget) {
            const target = window.pendingNavigationTarget;
            window.pendingNavigationTarget = null;
            window.location.hash = target;
          } else {
            goBack();
          }
        },
        onCancel: () => {
          // Keep editing, do nothing
        }
      });
      return;
    }
    
    if (window.pendingNavigationTarget) {
      const target = window.pendingNavigationTarget;
      window.pendingNavigationTarget = null;
      window.location.hash = target;
    } else {
      goBack();
    }
    
    document.removeEventListener('keydown', handleKeydown);
  };
  const handleKeydown = (e) => {
    if (e.key === 'Escape' || e.key === 'F4') {
      e.preventDefault();
      close();
    }
  };
  document.addEventListener('keydown', handleKeydown);
  
  formContainer.querySelector('#pf-cancel').addEventListener('click', close);
 
  const nameInput = formContainer.querySelector('[name="name"]');
  const slugInput = formContainer.querySelector('#pf-slug');
nameInput.addEventListener('input', () => {
    if (!product) slugInput.value = slugify(nameInput.value);
  });
 
  const hasVariantsToggle = formContainer.querySelector('#pf-has-variants-toggle');
  const singleProductContainer = formContainer.querySelector('#pf-single-product-container');
  const multipleVariantsContainer = formContainer.querySelector('#pf-multiple-variants-container');

  const singlePrice = formContainer.querySelector('#pf-single-price');
  const singleCompare = formContainer.querySelector('#pf-single-compare-price');
  const singleSku = formContainer.querySelector('#pf-single-sku');
  const singleStock = formContainer.querySelector('#pf-single-stock');

  // Format currency helper
  function formatCurrencyInput(input) {
    input.addEventListener('input', () => {
      const value = input.value;
      const selectionStart = input.selectionStart;
      let digitsBeforeCursor = 0;
      for (let i = 0; i < selectionStart; i++) {
        if (/\d/.test(value[i])) digitsBeforeCursor++;
      }
      let digits = value.replace(/\D/g, '');
      if (!digits) {
        input.value = '';
        return;
      }
      const formatted = Number(digits).toLocaleString('vi-VN');
      input.value = formatted;
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
      if (digitsCount < digitsBeforeCursor || newCursorPos === 0) {
        newCursorPos = formatted.length;
      }
      input.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  if (singlePrice) formatCurrencyInput(singlePrice);
  if (singleCompare) formatCurrencyInput(singleCompare);

  function syncToggleUI() {
    const isChecked = hasVariantsToggle.checked;
    context.hasVariants = isChecked;
    if (isChecked) {
      if (singleProductContainer) singleProductContainer.style.display = 'none';
      if (multipleVariantsContainer) {
        multipleVariantsContainer.style.display = '';
        if (context.currentVariants.length === 1 && 
            (context.currentVariants[0].size === 'Mặc định' || context.currentVariants[0].size === 'Default Title' || !context.currentVariants[0].size)) {
          context.currentVariants = [];
        }
      }
      const tableWrapper = formContainer.querySelector('#pf-variants-table-wrapper');
      const placeholder = formContainer.querySelector('#pf-variants-placeholder');
      if (context.currentVariants.length > 0) {
        if (tableWrapper) tableWrapper.classList.remove('hidden');
        if (placeholder) placeholder.classList.add('hidden');
      } else {
        if (tableWrapper) tableWrapper.classList.add('hidden');
        if (placeholder) placeholder.classList.remove('hidden');
      }
      if (context.renderAttributeInputs) context.renderAttributeInputs();
      if (context.populateFilterOptions) context.populateFilterOptions();
      if (context.renderVariantRows) context.renderVariantRows();
    } else {
      if (singleProductContainer) singleProductContainer.style.display = '';
      if (multipleVariantsContainer) multipleVariantsContainer.style.display = 'none';
    }
    onDraftChange();
  }

  if (hasVariantsToggle) {
    hasVariantsToggle.checked = context.hasVariants;
    hasVariantsToggle.addEventListener('change', syncToggleUI);
    syncToggleUI();
  }

  // Pre-fill single product fields if context.hasVariants is false
  if (!context.hasVariants && context.currentVariants.length > 0) {
    const v0 = context.currentVariants[0];
    if (singlePrice && v0.price) singlePrice.value = Number(v0.price).toLocaleString('vi-VN');
    if (singleCompare && v0.compare_at_price) singleCompare.value = Number(v0.compare_at_price).toLocaleString('vi-VN');
    if (singleSku) singleSku.value = v0.sku || '';
    if (singleStock) singleStock.value = v0.stock_quantity ?? 0;
    const singleAllowOutOfStock = formContainer.querySelector('#pf-single-allow-out-of-stock');
    if (singleAllowOutOfStock) {
      singleAllowOutOfStock.checked = v0.allow_out_of_stock_order === 1 || v0.allow_out_of_stock_order === true;
    }
  } else if (!context.hasVariants && product) {
    if (singlePrice && product.base_price) singlePrice.value = Number(product.base_price).toLocaleString('vi-VN');
    if (singleSku) singleSku.value = product.sku || '';
    if (singleStock) singleStock.value = product.stock ?? 0;
    const singleAllowOutOfStock = formContainer.querySelector('#pf-single-allow-out-of-stock');
    if (singleAllowOutOfStock) {
      singleAllowOutOfStock.checked = product.allow_out_of_stock_order === 1 || product.allow_out_of_stock_order === true;
    }
  }
 
  if (nameInput && slugInput) {
    const genSlugBtn = formContainer.querySelector('#pf-gen-slug');
    if (genSlugBtn) {
      genSlugBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name) slugInput.value = slugify(name);
      });
    }
  }

  // Submit Handler
  formContainer.querySelector('#product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formContainer.querySelector('#pf-submit');
    btn.textContent = 'Đang lưu...'; btn.disabled = true;
    
    try {
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      
      body.is_active = fd.has('is_active');
      body.is_featured = fd.has('is_featured');
      body.is_customizable = fd.has('is_customizable');
      body.images = context.currentImages.map(img => img.trim()).filter(Boolean);
      
      for (const v of context.currentVariants) {
        if (!v.size.trim()) {
          showToast('Vui lòng nhập kích cỡ cho tất cả biến thể', 'error');
          btn.textContent = 'Lưu'; btn.disabled = false;
          return;
        }
        if (!v.sku.trim()) {
          showToast('Vui lòng nhập SKU cho tất cả biến thể', 'error');
          btn.textContent = 'Lưu'; btn.disabled = false;
          return;
        }
      }

      body.variants = context.currentVariants.map(v => {
        const item = {
          size: v.size.trim(),
          color: v.material ? v.material.trim() : (v.color ? v.color.trim() : null),
          material: v.material ? v.material.trim() : (v.color ? v.color.trim() : null),
          price: v.price !== '' && v.price !== null && v.price !== undefined ? Number(v.price) : null,
          stock_quantity: Number(v.stock_quantity) || 0,
          sku: v.sku.trim(),
          images: v.images || [],
          attribute_values: {
            size: v.size.trim(),
            color: v.material ? v.material.trim() : (v.color ? v.color.trim() : null),
            material: v.material ? v.material.trim() : (v.color ? v.color.trim() : null)
          }
        };
        Object.keys(v).forEach(k => {
          if (k !== 'id' && k !== 'size' && k !== 'color' && k !== 'material' && k !== 'price' && k !== 'stock_quantity' && k !== 'sku' && k !== 'attribute_values' && k !== 'images' && k !== '_originalIdx') {
            item.attribute_values[k] = v[k];
          }
        });
        return item;
      });

      const priceVal = formContainer.querySelector('#pf-base-price').value.replace(/\D/g, '');
      body.base_price = Number(priceVal) || 0;

      body.tags = (context.selectedTags || []).map(t => t.name);

      if (!context.selectedCategoryIds || context.selectedCategoryIds.length === 0) {
        showToast('Vui lòng chọn ít nhất một danh mục', 'error');
        btn.textContent = 'Lưu'; btn.disabled = false;
        return;
      }

      body.category_ids = context.selectedCategoryIds;
      body.category_id = context.selectedCategoryIds.find(id => Number(id) !== 1) || 1;

      if (body.subcategory_id === '') {
        body.subcategory_id = null;
      } else {
        body.subcategory_id = Number(body.subcategory_id);
      }

      if (product) {
        await updateProduct(product.id, body);
        localStorage.removeItem(draftKey);
        showToast('Cập nhật sản phẩm thành công!');
      } else {
        await createProduct(body);
        localStorage.removeItem(draftKey);
        showToast('Thêm sản phẩm thành công!');
      }
      
      close();
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra', 'error');
    } finally {
      btn.textContent = 'Lưu'; btn.disabled = false;
    }
  });
}

function setupTabs(container) {
  const tabInfo = container.querySelector('#pf-tab-info');
  const tabVariants = container.querySelector('#pf-tab-variants');
  const tabPromotions = container.querySelector('#pf-tab-promotions');

  const infoContent = container.querySelector('#pf-info-content');
  const variantsContent = container.querySelector('#pf-variants-tab-content');
  const promotionsContent = container.querySelector('#pf-promotions-content');
  const footerButtons = container.querySelector('#pf-footer-buttons');

  const activeClass = "pf-tab-btn py-3.5 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-all focus:outline-none border-[#C9A84C] text-[#C9A84C]";
  const inactiveClass = "pf-tab-btn py-3.5 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-all focus:outline-none border-transparent text-gray-500 hover:text-gray-700";

  function setTabActive(activeTab) {
    if (tabInfo) tabInfo.className = activeTab === 'info' ? activeClass : inactiveClass;
    if (tabVariants) tabVariants.className = activeTab === 'variants' ? activeClass : inactiveClass;
    if (tabPromotions) tabPromotions.className = activeTab === 'promotions' ? activeClass : inactiveClass;

    if (infoContent) infoContent.style.display = activeTab === 'info' ? '' : 'none';
    if (variantsContent) variantsContent.style.display = activeTab === 'variants' ? '' : 'none';
    if (promotionsContent) promotionsContent.style.display = activeTab === 'promotions' ? '' : 'none';

    if (footerButtons) {
      footerButtons.style.display = activeTab === 'promotions' ? 'none' : '';
    }
  }

  if (tabInfo) {
    tabInfo.addEventListener('click', () => setTabActive('info'));
  }
  if (tabVariants) {
    tabVariants.addEventListener('click', () => setTabActive('variants'));
  }
  if (tabPromotions) {
    tabPromotions.addEventListener('click', () => setTabActive('promotions'));
  }
}

function renderAnalyticsPanel(container, data) {
  container.innerHTML = `
    <!-- Total Views KPI Card -->
    <div class="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden group cursor-default">
      <div class="absolute right-4 top-4 bg-white/10 p-2 text-sm rounded-xl">
        👁️
      </div>
      <div class="text-3xl font-black tracking-tight leading-none">${Number(data.total_views || 0).toLocaleString('vi-VN')}</div>
      <div class="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-2">Tổng số lượt xem sản phẩm</div>
    </div>

    <!-- Hourly Chart Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 leading-none">Lượt xem hôm nay theo giờ</h3>
      <div class="h-44 relative">
        <canvas id="product-hourly-chart"></canvas>
      </div>
    </div>

    <!-- Daily Chart Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 leading-none">Xu hướng lượt xem 7 ngày gần đây</h3>
      <div class="h-44 relative">
        <canvas id="product-daily-chart"></canvas>
      </div>
    </div>

    <!-- Device Chart Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 leading-none">Thiết bị truy cập</h3>
      <div class="h-44 relative">
        <canvas id="product-device-chart"></canvas>
      </div>
    </div>

    <!-- Recent Visitors Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 leading-none">Lượt xem gần đây nhất</h3>
      <div class="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th class="px-3 py-2">Thời gian</th>
              <th class="px-3 py-2">Khách / IP</th>
              <th class="px-3 py-2">Thiết bị</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            ${data.recent_visitors && data.recent_visitors.length > 0 ? data.recent_visitors.map(v => {
              const userStr = v.email 
                ? `<a href="#members/${v.user_id || ''}" class="text-[#C9A84C] hover:underline font-bold">${v.email}</a>` 
                : `<span class="text-gray-400 font-medium">Khách ẩn danh</span>`;
              const dateObj = new Date(v.created_at);
              const timeStr = isNaN(dateObj.getTime()) 
                ? '—' 
                : dateObj.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
              
              return `
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-3 py-2.5 font-semibold text-gray-500 whitespace-nowrap">${timeStr}</td>
                  <td class="px-3 py-2.5">
                    <div class="font-medium text-gray-900 truncate max-w-[150px]">${userStr}</div>
                    <div class="text-[9px] text-gray-400 font-mono mt-0.5">${v.ip_address || '-'}</div>
                  </td>
                  <td class="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                    <div class="capitalize text-gray-700 font-medium text-[11px]">${v.device_type || 'Desktop'}</div>
                    <div class="text-[9px] text-gray-400 truncate max-w-[90px]" title="${v.browser || '-'}">${v.browser || '-'}</div>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr>
                <td colspan="3" class="px-3 py-8 text-center text-gray-400 font-semibold">Chưa có lượt xem nào ghi nhận</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;

  renderProductCharts(data);
}

function renderProductCharts(data) {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js is not loaded globally.');
    return;
  }

  // Destroy previous chart instances
  if (productCharts.hourly) productCharts.hourly.destroy();
  if (productCharts.daily) productCharts.daily.destroy();
  if (productCharts.device) productCharts.device.destroy();

  // 1. Hourly Chart (Today)
  const ctxHourly = document.getElementById('product-hourly-chart')?.getContext('2d');
  if (ctxHourly && data.hourly) {
    const hours = data.hourly.map(item => item.hour);
    const hourlyCounts = data.hourly.map(item => item.count);
    const gradient = ctxHourly.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(201, 168, 76, 0.4)');
    gradient.addColorStop(1, 'rgba(201, 168, 76, 0.05)');

    productCharts.hourly = new Chart(ctxHourly, {
      type: 'bar',
      data: {
        labels: hours,
        datasets: [{
          label: 'Lượt xem',
          data: hourlyCounts,
          backgroundColor: gradient,
          borderColor: '#C9A84C',
          borderWidth: 1.5,
          borderRadius: 4,
          hoverBackgroundColor: '#C9A84C',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 10,
            cornerRadius: 8,
            backgroundColor: '#1a1a1a',
            titleFont: { size: 10, weight: 'bold' },
            bodyFont: { size: 11 },
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 0 } },
          y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 9 }, stepSize: 1, precision: 0 } }
        }
      }
    });
  }

  // 2. Daily Chart (Last 7 Days)
  const ctxDaily = document.getElementById('product-daily-chart')?.getContext('2d');
  if (ctxDaily && data.daily) {
    const dates = data.daily.map(item => item.date);
    const dailyCounts = data.daily.map(item => item.count);
    const dailyUniques = data.daily.map(item => item.unique);

    const gradViews = ctxDaily.createLinearGradient(0, 0, 0, 160);
    gradViews.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradViews.addColorStop(1, 'rgba(59, 130, 246, 0)');

    const gradUniques = ctxDaily.createLinearGradient(0, 0, 0, 160);
    gradUniques.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    gradUniques.addColorStop(1, 'rgba(16, 185, 129, 0)');

    productCharts.daily = new Chart(ctxDaily, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Tổng lượt xem',
            data: dailyCounts,
            borderColor: '#3b82f6',
            backgroundColor: gradViews,
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: '#3b82f6',
          },
          {
            label: 'Người xem duy nhất',
            data: dailyUniques,
            borderColor: '#10b981',
            backgroundColor: gradUniques,
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: '#10b981',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, font: { size: 8, weight: 'bold' } } },
          tooltip: {
            padding: 10,
            cornerRadius: 8,
            backgroundColor: '#1a1a1a',
            titleFont: { size: 10, weight: 'bold' },
            bodyFont: { size: 11 },
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 } } },
          y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 9 }, precision: 0 } }
        }
      }
    });
  }

  // 3. Device Chart
  const ctxDevice = document.getElementById('product-device-chart')?.getContext('2d');
  if (ctxDevice && data.devices) {
    const deviceLabels = data.devices.map(item => item.device_type || 'Máy tính');
    const deviceCounts = data.devices.map(item => item.count);

    productCharts.device = new Chart(ctxDevice, {
      type: 'doughnut',
      data: {
        labels: deviceLabels,
        datasets: [{
          data: deviceCounts,
          backgroundColor: ['#C9A84C', '#3b82f6', '#10b981', '#a855f7'],
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 10, font: { size: 9, weight: 'bold' } } },
          tooltip: {
            padding: 10,
            cornerRadius: 8,
            backgroundColor: '#1a1a1a',
            titleFont: { size: 10, weight: 'bold' },
            bodyFont: { size: 11 },
          }
        },
        cutout: '60%'
      }
    });
  }

  // Track charts for cleanup
  if (!window.adminCleanups) {
    window.adminCleanups = [];
  }
  window.adminCleanups.push(() => {
    if (productCharts.hourly) productCharts.hourly.destroy();
    if (productCharts.daily) productCharts.daily.destroy();
    if (productCharts.device) productCharts.device.destroy();
    productCharts = {};
  });
}
