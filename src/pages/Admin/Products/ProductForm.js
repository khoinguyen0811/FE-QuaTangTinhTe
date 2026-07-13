import { showToast, showUnsavedChangesModal } from '../shared/ui.js?v=1.0.9';
import { 
  createProduct, 
  updateProduct, 
  getCategories, 
  getVariantTypes
} from '../../../services/adminService.js';
import { openImagePicker } from './ImagePicker.js?v=1.2.0';
import { renderProductFormHtml } from './ProductFormTemplate.js?v=1.3.0';
import { setupProductPromotions } from './ProductPromotions.js?v=1.2.0';
import { setupProductImages } from './ProductFormImages.js?v=1.2.0';
import { setupProductVariants } from './ProductVariantsForm.js?v=1.4.0';
import { setupProductTags } from './ProductFormTags.js?v=1.2.0';
import { setupProductCategories } from './ProductFormCategories.js?v=1.3.0';
import { slugify, injectFormStyles, saveProductDraft } from './ProductFormPart2.js?v=1.2.0';

export function openProductForm(product, onSaved) {
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

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  overlay.setAttribute('data-lenis-prevent', 'true');
  overlay.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
  overlay.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });

  overlay.innerHTML = renderProductFormHtml(mergedProduct);

  injectFormStyles();
  document.body.appendChild(overlay);

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
        image_url: v.image_url || '',
        is_active: v.is_active !== 0 && v.is_active !== false,
        sort_order: v.sort_order || 0,
        allow_out_of_stock_order: v.allow_out_of_stock_order === 1 || v.allow_out_of_stock_order === true || v.allow_out_of_stock_order === '1',
        images: v.images || []
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

  let variantFilter = {
    search: ''
  };
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

  // Determine hasVariants
  let hasVariants = false;
  if (currentVariants.length > 1) {
    hasVariants = true;
  } else if (currentVariants.length === 1) {
    const v0 = currentVariants[0];
    if (v0.size && v0.size !== 'Mặc định' && v0.size !== 'Default Title' && v0.size !== '') {
      hasVariants = true;
    }
  }

  // Pre-fill generator inputs dynamically scan from existing variants
  let activeAttributes = [];
  if (restoredDraft && Array.isArray(restoredDraft.activeAttributes)) {
    activeAttributes = restoredDraft.activeAttributes.filter(a => !SYSTEM_FIELDS.includes(a.name));
  }

  // Ensure default size & material are always present
  if (!activeAttributes.some(a => a.name === 'size')) {
    activeAttributes.unshift({ name: 'size', displayName: 'Kích cỡ', values: '', isCustom: false });
  }
  if (!activeAttributes.some(a => a.name === 'material')) {
    const sizeIdx = activeAttributes.findIndex(a => a.name === 'size');
    activeAttributes.splice(sizeIdx + 1, 0, { name: 'material', displayName: 'Chất liệu', values: '', isCustom: false });
  }

  // Pre-fill default values from currentVariants
  if (currentVariants.length > 0) {
    const sizes = [...new Set(currentVariants.map(v => v.size).filter(Boolean))];
    const materials = [...new Set(currentVariants.map(v => v.material || v.color).filter(Boolean))];
    
    const sizeAttr = activeAttributes.find(a => a.name === 'size');
    if (sizeAttr && !sizeAttr.values) {
      sizeAttr.values = sizes.join(', ');
    }
    const matAttr = activeAttributes.find(a => a.name === 'material');
    if (matAttr && !matAttr.values) {
      matAttr.values = materials.join(', ');
    }
  }

  if (currentVariants.length > 0 && hasVariants) {
    const attrKeys = new Set();
    currentVariants.forEach(v => {
      if (v.size) attrKeys.add('size');
      if (v.material || v.color) attrKeys.add('material');
      if (v.attribute_values) {
        Object.keys(v.attribute_values).forEach(k => {
          if (!SYSTEM_FIELDS.includes(k) && k !== 'size' && k !== 'material' && k !== 'color') {
            attrKeys.add(k);
          }
        });
      }
      Object.keys(v).forEach(k => {
        if (!SYSTEM_FIELDS.includes(k) && k !== 'size' && k !== 'material' && k !== 'color') {
          attrKeys.add(k);
        }
      });
    });

    attrKeys.forEach(key => {
      if (!activeAttributes.some(a => a.name === key)) {
        const uniqueVals = [...new Set(currentVariants.map(v => {
          if (key === 'size') return v.size;
          if (key === 'material') return v.material || v.color;
          return v.attribute_values?.[key] || v[key];
        }).filter(Boolean))];
        
        let displayName = key === 'size' ? 'Kích thước' : key === 'material' ? 'Chất liệu' : key.charAt(0).toUpperCase() + key.slice(1);
        activeAttributes.push({
          name: key,
          displayName: displayName,
          values: uniqueVals.join(', '),
          isCustom: (key !== 'size' && key !== 'material')
        });
      }
    });
  }

  // Define shared context
  const context = {
    product: mergedProduct,
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
  setupProductCategories(overlay, context);

  async function initFormConfiguration() {
    try {
      const typesRes = await getVariantTypes();

      // Process Variant Types and render Suggestions Datalists
      const types = Array.isArray(typesRes.data) ? typesRes.data : [];
      
      const dlSize = overlay.querySelector('#dl-pf-size');
      const dlColor = overlay.querySelector('#dl-pf-material');
      
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
      // 3. Detect and add other active custom attributes from existing variants
      if (currentVariants.length > 0) {
        const firstVar = currentVariants[0];
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
  setupProductImages(overlay, context);
  setupProductVariants(overlay, context);
  setupProductTags(overlay, context);

  const hasVariantsToggle = overlay.querySelector('#pf-has-variants-toggle');
  const singleProductContainer = overlay.querySelector('#pf-single-product-container');
  const multipleVariantsContainer = overlay.querySelector('#pf-multiple-variants-container');

  const singlePrice = overlay.querySelector('#pf-single-price');
  const singleCompare = overlay.querySelector('#pf-single-compare-price');
  const singleSku = overlay.querySelector('#pf-single-sku');
  const singleStock = overlay.querySelector('#pf-single-stock');

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
        // If single variant is currently "Mặc định", clear it so they can input new variant properties
        if (context.currentVariants.length === 1 && 
            (context.currentVariants[0].size === 'Mặc định' || context.currentVariants[0].size === 'Default Title' || !context.currentVariants[0].size)) {
          context.currentVariants = [];
        }
      }
      const tableWrapper = overlay.querySelector('#pf-variants-table-wrapper');
      const placeholder = overlay.querySelector('#pf-variants-placeholder');
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
  }

  // Pre-fill single product fields if context.hasVariants is false
  if (!context.hasVariants && context.currentVariants.length > 0) {
    const v0 = context.currentVariants[0];
    if (singlePrice && v0.price) singlePrice.value = Number(v0.price).toLocaleString('vi-VN');
    if (singleCompare && v0.compare_at_price) singleCompare.value = Number(v0.compare_at_price).toLocaleString('vi-VN');
    if (singleSku) singleSku.value = v0.sku || '';
    if (singleStock) singleStock.value = v0.stock_quantity ?? 0;
    const singleAllowOutOfStock = overlay.querySelector('#pf-single-allow-out-of-stock');
    if (singleAllowOutOfStock) {
      singleAllowOutOfStock.checked = v0.allow_out_of_stock_order === 1 || v0.allow_out_of_stock_order === true;
    }
  } else if (!context.hasVariants && product) {
    // Fallback to product general fields
    if (singlePrice && product.base_price) singlePrice.value = Number(product.base_price).toLocaleString('vi-VN');
    if (singleSku) singleSku.value = product.sku || '';
    if (singleStock) singleStock.value = product.stock ?? 0;
    const singleAllowOutOfStock = overlay.querySelector('#pf-single-allow-out-of-stock');
    if (singleAllowOutOfStock) {
      singleAllowOutOfStock.checked = product.allow_out_of_stock_order === 1 || product.allow_out_of_stock_order === true;
    }
  }

  // Initial renders & Quill Setup
  setTimeout(() => {
    if (context.renderImageSlots) context.renderImageSlots();
    if (hasVariantsToggle) syncToggleUI();

    const editorEl = overlay.querySelector('#pf-description-editor');
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

      const descInput = overlay.querySelector('#pf-description');
      quill.on('text-change', () => {
        descInput.value = quill.root.innerHTML.trim() === '<p><br></p>' ? '' : quill.root.innerHTML;
        onDraftChange();
      });
    }
  }, 100);

  if (product) {
    setupProductPromotions(overlay, product);
  }

  setupTabs(overlay);

  const onDraftChange = () => {
    saveProductDraft(productId, overlay, context, context.selectedCategoryIds);
  };
  context.onDraftChange = onDraftChange;

  const formEl = overlay.querySelector('#product-form');
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
            overlay.remove();
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
      overlay.remove();
    }
    
    document.removeEventListener('keydown', handleKeydown);
  };
  const handleKeydown = (e) => {
    if (e.key === 'Escape' || e.key === 'F4') { e.preventDefault(); close(); }
  };
  document.addEventListener('keydown', handleKeydown);
  overlay.querySelector('#pf-close').addEventListener('click', close);
  overlay.querySelector('#pf-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
 
  const nameInput = overlay.querySelector('[name="name"]');
  const slugInput = overlay.querySelector('#pf-slug');
 
  nameInput.addEventListener('input', () => {
    if (!product) slugInput.value = slugify(nameInput.value);
  });
 
  overlay.querySelector('#pf-gen-slug').addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name) slugInput.value = slugify(name);
  });

  const selectSizeChartBtn = overlay.querySelector('#pf-select-size-chart-btn');
  const sizeChartUrlInput = overlay.querySelector('#pf-size-chart-url');
  if (selectSizeChartBtn && sizeChartUrlInput) {
    selectSizeChartBtn.addEventListener('click', () => {
      openImagePicker(url => {
        sizeChartUrlInput.value = url;
      }, false, [sizeChartUrlInput.value]);
    });
  }

  const priceInput = overlay.querySelector('#pf-base-price');
  priceInput.addEventListener('input', () => {
    const value = priceInput.value;
    const selectionStart = priceInput.selectionStart;
    
    let digitsBeforeCursor = 0;
    for (let i = 0; i < selectionStart; i++) {
      if (/\d/.test(value[i])) {
        digitsBeforeCursor++;
      }
    }
    
    let digits = value.replace(/\D/g, '');
    if (!digits) {
      priceInput.value = '';
      return;
    }
    
    const formatted = Number(digits).toLocaleString('vi-VN');
    priceInput.value = formatted;
    
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
    
    priceInput.setSelectionRange(newCursorPos, newCursorPos);
  });

  // Submit Handler
  overlay.querySelector('#product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = overlay.querySelector('#pf-submit');
    btn.textContent = 'Đang lưu...'; btn.disabled = true;
    
    try {
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      
      body.is_active = fd.has('is_active');
      body.is_featured = fd.has('is_featured');
      body.is_customizable = fd.has('is_customizable');
      
      body.images = context.currentImages.map(img => img.trim()).filter(Boolean);
      
      if (!context.hasVariants) {
        const singlePriceVal = overlay.querySelector('#pf-single-price').value.replace(/\D/g, '');
        const singleCompareVal = overlay.querySelector('#pf-single-compare-price').value.replace(/\D/g, '');
        const singleSkuVal = overlay.querySelector('#pf-single-sku').value.trim();
        const singleStockVal = parseInt(overlay.querySelector('#pf-single-stock').value) || 0;
        const singleAllowOutOfStock = overlay.querySelector('#pf-single-allow-out-of-stock').checked ? 1 : 0;

        if (!singleSkuVal) {
          showToast('Vui lòng nhập mã SKU cho sản phẩm', 'error');
          btn.textContent = 'Lưu'; btn.disabled = false;
          return;
        }

        const firstImg = context.currentImages && context.currentImages[0] ? context.currentImages[0].trim() : null;
        body.variants = [{
          size: 'Mặc định',
          color: '',
          material: '',
          price: Number(singlePriceVal) || 0,
          compare_at_price: singleCompareVal ? Number(singleCompareVal) : null,
          stock_quantity: singleStockVal,
          sku: singleSkuVal,
          image_url: firstImg || null,
          is_active: 1,
          sort_order: 0,
          allow_out_of_stock_order: singleAllowOutOfStock,
          images: context.currentImages || [],
          attribute_values: {
            size: 'Mặc định',
            color: '',
            material: ''
          }
        }];

        body.base_price = Number(singlePriceVal) || 0;
        body.allow_out_of_stock_order = singleAllowOutOfStock;
      } else {
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
          const sizeVal = v.size.trim();
          const matVal = v.material ? v.material.trim() : (v.color ? v.color.trim() : '');
          const firstImg = v.images && v.images[0] ? v.images[0].trim() : null;
          
          const item = {
            size: sizeVal,
            color: matVal,
            material: matVal,
            price: v.price !== '' && v.price !== null && v.price !== undefined ? Number(v.price) : null,
            compare_at_price: v.compare_at_price !== '' && v.compare_at_price !== null && v.compare_at_price !== undefined ? Number(v.compare_at_price) : null,
            stock_quantity: Number(v.stock_quantity) || 0,
            sku: v.sku.trim(),
            image_url: firstImg || v.image_url || null,
            is_active: v.is_active !== false ? 1 : 0,
            sort_order: Number(v.sort_order) || 0,
            allow_out_of_stock_order: v.allow_out_of_stock_order ? 1 : 0,
            images: v.images || [],
            attribute_values: {
              size: sizeVal,
              color: matVal,
              material: matVal
            }
          };
          Object.keys(v).forEach(k => {
            if (k !== 'id' && k !== 'size' && k !== 'color' && k !== 'material' && k !== 'price' && k !== 'compare_at_price' && k !== 'stock_quantity' && k !== 'sku' && k !== 'image_url' && k !== 'is_active' && k !== 'sort_order' && k !== 'allow_out_of_stock_order' && k !== 'attribute_values' && k !== 'images' && k !== '_originalIdx') {
              item.attribute_values[k] = v[k];
            }
          });
          return item;
        });

        body.base_price = body.variants[0]?.price || 0;
        body.allow_out_of_stock_order = body.variants[0]?.allow_out_of_stock_order || 0;
      }

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

      let savedData = null;
      if (product) {
        const res = await updateProduct(product.id, body);
        savedData = res?.data || res;
        localStorage.removeItem(draftKey);
        showToast('Cập nhật sản phẩm thành công!');
      } else {
        const res = await createProduct(body);
        savedData = res?.data || res;
        localStorage.removeItem(draftKey);
        showToast('Thêm sản phẩm thành công!');
      }
      close();
      if (onSaved) onSaved(savedData);
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
  const inactiveClass = "pf-tab-btn py-3.5 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-all focus:outline-none border-transparent text-gray-400 hover:text-white";

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
