// ProductFormTemplate.js — Two-column dashboard page layout (MatDash style, theme-ready with bg-white)

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

export function renderProductFormHtml(product) {
  return `
    <style>
      /* Quill Editor Theme Styles */
      .ql-toolbar.ql-snow {
        border-color: var(--border-color, #e5e7eb) !important;
        background: var(--bg-card, #f9fafb) !important;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }
      .ql-container.ql-snow {
        border-color: var(--border-color, #e5e7eb) !important;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
        min-height: 200px;
        font-family: 'Quicksand', sans-serif !important;
        font-size: 14px !important;
      }
      .ql-editor.ql-blank::before {
        color: #9ca3af !important;
        font-style: normal !important;
      }
      
      /* Dark mode overrides for Quill */
      html.dark .ql-toolbar.ql-snow {
        border-color: #1e2945 !important;
        background: #0f1322 !important;
      }
      html.dark .ql-container.ql-snow {
        border-color: #1e2945 !important;
        background: #161c32 !important;
        color: #e4e4e7 !important;
      }
      html.dark .ql-snow .ql-stroke {
        stroke: #a1a1aa !important;
      }
      html.dark .ql-snow .ql-fill {
        fill: #a1a1aa !important;
      }
      html.dark .ql-snow .ql-picker {
        color: #a1a1aa !important;
      }

      /* Variant Manager Styles */
      .pf-attr-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        padding: 12px;
        background-color: rgba(0, 0, 0, 0.02);
        border: 1px solid #e5e7eb;
        border-radius: 12px;
      }
      html.dark .pf-attr-row {
        background-color: rgba(255, 255, 255, 0.02);
        border-color: #1e2945;
      }
      @media (min-width: 640px) {
        .pf-attr-row {
          display: grid;
          grid-template-columns: 220px 1fr 40px;
          gap: 16px;
          padding: 0;
          background-color: transparent;
          border: none;
          border-radius: 0;
        }
      }
      .v-sku { min-width: 130px !important; }
      .v-price { min-width: 120px !important; }
      .v-compare-price { min-width: 120px !important; }
      .v-stock { min-width: 90px !important; }
      .v-img-btn { width: 52px !important; height: 52px !important; border-radius: 10px !important; overflow: hidden !important; padding: 0px !important; }
      
      /* Chip Tag Input Styles */
      .pf-chip-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 6px 12px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        min-height: 44px;
        align-items: center;
      }
      html.dark .pf-chip-container {
        background: #161c32;
        border-color: #1e2945;
      }
      .pf-chip-container:focus-within {
        border-color: #C9A84C !important;
      }
      .pf-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background-color: #f3f4f6;
        color: #374151;
        font-size: 11px;
        font-weight: 700;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        user-select: none;
      }
      html.dark .pf-chip {
        background-color: #1e2945;
        color: #e4e4e7;
        border-color: #374151;
      }
      .pf-chip-remove {
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
        color: #9ca3af;
        transition: color 150ms;
      }
      .pf-chip-remove:hover {
        color: #ef4444;
      }
      .pf-chip-input {
        flex: 1;
        min-width: 120px;
        border: none !important;
        outline: none !important;
        padding: 0 !important;
        background: transparent !important;
        font-size: 12px !important;
        color: inherit !important;
        height: 28px !important;
      }
      
      html.dark .v-sku,
      html.dark .v-price,
      html.dark .v-compare-price,
      html.dark .v-stock,
      html.dark .v-sort,
      html.dark .v-allow-backorder {
        background-color: #161c32 !important;
        border-color: #374151 !important;
        color: #f3f4f6 !important;
      }
      html.dark .v-compare-price {
        color: #9ca3af !important;
      }
    </style>

    <div class="w-full flex flex-col animate-scale-up">
      <form id="product-form" class="flex-1 flex flex-col">
        
        <!-- Two Column Layout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 border-none p-0">
          
          <!-- LEFT COLUMN: core product configuration (col-span-8) -->
          <div class="lg:col-span-8 space-y-6 flex flex-col">
            
            <!-- Card 1: Thông tin sản phẩm -->
            <div id="pf-info-content" class="bg-white dark:bg-[#161c32] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider dark:border-gray-800 pb-3">Thông tin sản phẩm</h3>
              
              <!-- Name -->
              <div>
                <label class="form-label !text-xs !font-bold text-gray-500">Tên sản phẩm *</label>
                <input name="name" required class="form-input" value="${product?.name || ''}" placeholder="Ví dụ: Tên pha lê quà tặng..."/>
              </div>

              <!-- Description Rich Text (Quill.js) -->
              <div class="space-y-1.5">
                <label class="form-label !text-xs !font-bold text-gray-500">Mô tả chi tiết sản phẩm</label>
                <div id="pf-description-container" class="rounded-xl overflow-hidden">
                  <div id="pf-description-editor">
                    ${product?.description || ''}
                  </div>
                </div>
                <input type="hidden" name="description" id="pf-description" value="${product?.description ? escapeHtml(product.description) : ''}"/>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Print Detail -->
                <div>
                  <label class="form-label !text-xs !font-bold text-gray-500">Chi tiết hình in / thêu</label>
                  <input name="print_detail" class="form-input" value="${product?.print_detail || ''}" placeholder="Ví dụ: Khắc laze 3D nhiệt (để trống nếu không có)"/>
                </div>
                <!-- Care instructions -->
                <div>
                  <label class="form-label !text-xs !font-bold text-gray-500">Hướng dẫn bảo quản</label>
                  <input name="care_instructions" class="form-input" value="${product?.care_instructions || ''}" placeholder="Ví dụ: Lau chùi bằng khăn ẩm, tránh rơi vỡ..."/>
                </div>
              </div>

              <!-- Pricing & Inventory for Single Product (Hidden when has multiple variants) -->
              <div id="pf-single-product-container" class="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">Giá bán & Tồn kho</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-[#0f1322] p-4 rounded-xl">
                  <div>
                    <label class="form-label !text-xs !font-bold text-gray-500">Giá chưa sale (₫)</label>
                    <input id="pf-single-compare-price" type="text" class="form-input font-bold text-gray-900" placeholder="Ví dụ: 350.000" value="${product?.variants?.[0]?.compare_at_price ? Number(product.variants[0].compare_at_price).toLocaleString('vi-VN') : ''}" />
                  </div>
                  <div>
                    <label class="form-label !text-xs !font-bold text-gray-500">Giá sau khi sale (₫) *</label>
                    <input id="pf-single-price" type="text" required class="form-input font-bold text-gray-900" placeholder="Ví dụ: 280.000" value="${product?.base_price ? Number(product.base_price).toLocaleString('vi-VN') : ''}" />
                  </div>
                  <div>
                    <label class="form-label !text-xs !font-bold text-gray-500">Mã SKU *</label>
                    <input id="pf-single-sku" type="text" class="form-input font-mono" placeholder="Ví dụ: SKU-SLY" value="${product?.variants?.[0]?.sku || ''}" />
                  </div>
                  <div>
                    <label class="form-label !text-xs !font-bold text-gray-500">Số lượng tồn kho *</label>
                    <input id="pf-single-stock" type="number" class="form-input font-bold" placeholder="0" min="0" value="${product?.variants?.[0]?.stock_quantity ?? 0}" />
                  </div>
                  <div class="sm:col-span-2 pt-2 border-t border-gray-150 dark:border-gray-800">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" id="pf-single-allow-out-of-stock" class="w-4 h-4 rounded border-gray-200 text-[#5d58f0] focus:ring-0 accent-[#5d58f0]" ${product?.variants?.[0]?.allow_out_of_stock_order ? 'checked' : ''}>
                      <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Cho phép đặt hàng khi hết hàng</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Hidden base price input for compatibility -->
              <input type="hidden" id="pf-base-price" name="base_price" value="${product?.base_price || 0}" />
            </div>

            <!-- Card 2: Hình ảnh & Video sản phẩm -->
            <div class="bg-white dark:bg-[#161c32] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider dark:border-gray-800 pb-3">Hình ảnh & Video</h3>
              
              <!-- Video URL -->
              <div>
                <label class="form-label !text-xs !font-bold text-gray-500">Đường dẫn Video sản phẩm (YouTube/MP4 URL)</label>
                <input name="video_url" id="pf-video-url" class="form-input" value="${product?.video_url || ''}" placeholder="Nhập link video..."/>
              </div>

              <!-- Main Gallery Images & Video -->
              <div class="space-y-2">
                <label class="form-label mb-0 !text-xs !font-bold text-gray-500">Kho ảnh & video sản phẩm chung (3-10 ảnh/video)</label>
                <div class="bg-gray-50 dark:bg-[#0f1322] rounded-xl p-4">
                  <div id="image-grid-slots" class="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    <!-- Rendered dynamically by ProductFormImages.js -->
                  </div>
                </div>
                <div class="flex gap-2 items-center">
                  <span class="text-[10px] pl-[10px] font-semibold text-gray-400 tracking-wider block mb-3">Ảnh đầu tiên làm ảnh bìa chính, kéo thả để đổi thứ tự hiển thị</span>
                </div>
              </div>
            </div>

            <!-- Card 3: Biến thể & Tồn kho -->
            <div id="pf-variants-tab-content" class="bg-white dark:bg-[#161c32] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col min-h-0">
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 flex-shrink-0">
                <div class="flex items-center gap-2.5">
                  <input type="checkbox" id="pf-has-variants-toggle" class="w-4.5 h-4.5 rounded border-gray-200 text-[#5d58f0] focus:ring-0 accent-[#5d58f0] cursor-pointer" />
                  <label for="pf-has-variants-toggle" class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider select-none cursor-pointer">Sản phẩm này có nhiều biến thể</label>
                </div>
              </div>

              <!-- Case 2: Multiple Variants (Toggle is ON) -->
              <div id="pf-multiple-variants-container" style="display: none;" class="flex flex-col gap-6 w-full min-h-0">
                <!-- Top Box: Option Types -->
                <div class="w-full bg-gray-50 dark:bg-[#0f1322] p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex flex-col gap-4">
                  <span class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider block border-b border-gray-150 dark:border-gray-800 pb-2">Thuộc tính biến thể</span>
                  
                  <!-- Grid Header (Tên thuộc tính, Giá trị thuộc tính) -->
                  <div class="hidden sm:grid grid-cols-[220px_1fr_40px] gap-4 text-[10px] uppercase tracking-wider text-gray-400 font-bold px-1 select-none">
                    <div>Tên thuộc tính</div>
                    <div>Giá trị thuộc tính</div>
                    <div></div>
                  </div>

                  <div id="pf-attribute-inputs-container" class="space-y-4">
                    <!-- Dynamically rendered inputs for attributes -->
                  </div>
                  
                  <div class="flex flex-row items-center gap-3 pt-4 border-t border-gray-150 dark:border-gray-800 justify-start">
                    <button type="button" id="pf-add-attribute-btn" class="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all border-none cursor-pointer">
                      + Thêm thuộc tính
                    </button>
                    <button type="button" id="pf-generate-variants-btn" class="px-5 py-2.5 bg-[#5d58f0] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#4b46d5] transition-all border-none cursor-pointer">
                      Tạo biến thể
                    </button>
                  </div>
                </div>

                <!-- New Matrix Option Box: Chọn tổ hợp bán thực tế (Ma trận checkbox) -->
                <div id="pf-variant-matrix-wrapper" class="hidden bg-gray-50 dark:bg-[#0f1322] p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex flex-col gap-4">
                  <div class="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-2 flex-wrap gap-2">
                    <span class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider block">Chọn tổ hợp bán thực tế</span>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <button type="button" id="pf-matrix-select-all" class="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-[#161c32] dark:hover:bg-gray-800 text-[10px] font-bold rounded border border-gray-200 dark:border-gray-750 text-gray-650 dark:text-gray-400 cursor-pointer">Chọn tất cả</button>
                      <button type="button" id="pf-matrix-deselect-all" class="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-[#161c32] dark:hover:bg-gray-800 text-[10px] font-bold rounded border border-gray-200 dark:border-gray-750 text-gray-650 dark:text-gray-400 cursor-pointer">Bỏ chọn tất cả</button>
                      <button type="button" id="pf-matrix-reset" class="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-[#161c32] dark:hover:bg-gray-800 text-[10px] font-bold rounded border border-gray-200 dark:border-gray-750 text-gray-650 dark:text-gray-400 cursor-pointer">Reset</button>
                    </div>
                  </div>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Tick những tổ hợp sản phẩm có bán. Bỏ tick những tổ hợp không tồn tại hoặc không kinh doanh.
                  </p>
                  <div class="overflow-x-auto w-full max-w-full">
                    <div id="pf-variant-matrix-container" class="min-w-max p-1">
                      <!-- Rendered dynamically by ProductVariantsForm.js -->
                    </div>
                  </div>
                </div>

                <!-- Bottom Box: Variants Table -->
                <div class="w-full flex flex-col gap-3 min-w-0">
                  <div id="pf-variants-table-wrapper" class="hidden space-y-3 bg-gray-50 dark:bg-[#0f1322] p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex flex-col">
                    <div class="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-2">
                      <span class="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Danh sách phiên bản</span>
                      
                      <!-- Local Filter Bar -->
                      <div id="pf-var-filters-container" class="flex items-center gap-2 relative">
                        <div class="relative flex items-center w-36 sm:w-44">
                          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          </span>
                          <input id="pf-var-search" class="pl-7 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none w-full" placeholder="Tìm cỡ, màu...">
                        </div>

                        <div class="relative inline-block text-left" id="pf-filter-wrapper">
                          <button type="button" id="pf-var-filter-toggle" class="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition flex items-center justify-center relative text-xs font-bold border-none cursor-pointer" title="Bộ lọc nâng cao">
                            Lọc
                            <span id="pf-filter-badge" class="hidden absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full"></span>
                          </button>
                          <div id="pf-var-filter-popover" class="hidden absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-50">
                            <div class="flex items-center justify-between border-b border-gray-150 pb-2 mb-3">
                              <span class="text-xs font-bold text-gray-700 flex items-center gap-1.5 select-none">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                Bộ lọc
                              </span>
                              <button type="button" id="pf-clear-all-filters" class="text-[10px] text-red-500 hover:text-red-700 font-bold bg-transparent border-none cursor-pointer">
                                Xóa
                              </button>
                            </div>
                            <div id="pf-var-filters-list" class="space-y-3 max-h-56 overflow-y-auto pr-1">
                              <!-- Rendered dynamically -->
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Bulk Action Panel -->
                    <div id="pf-var-bulk-bar" class="hidden flex flex-wrap items-center justify-between bg-white border border-gray-150 p-3 rounded-lg text-xs gap-3">
                      <span class="font-bold text-gray-600">Đã chọn <span id="pf-bulk-count" class="font-extrabold text-[#C9A84C] text-sm">0</span> phiên bản</span>
                      <div class="flex items-center gap-2">
                        <select id="pf-bulk-action-select" class="form-input !text-xs !py-1 bg-white border border-gray-200 rounded-lg max-w-[180px] cursor-pointer">
                          <option value="">-- Chọn thao tác hàng loạt --</option>
                          <option value="price">Đổi giá bán</option>
                          <option value="compare_price">Đổi giá so sánh</option>
                          <option value="stock">Đổi tồn kho</option>
                          <option value="sku_prefix">Đặt tiền tố SKU</option>
                          <option value="image">Đặt hình ảnh chung</option>
                          <option value="enable">Kích hoạt tất cả</option>
                          <option value="disable">Tắt tất cả</option>
                        </select>
                        <button type="button" id="pf-bulk-clear-btn" class="text-gray-400 hover:text-gray-600 font-bold px-2 py-1 bg-transparent border-none cursor-pointer">Hủy</button>
                      </div>
                    </div>

                    <!-- Select all row -->
                    <div class="flex items-center gap-2 pb-1">
                      <input type="checkbox" id="pf-select-all-vars-checkbox" class="w-3.5 h-3.5 rounded border-gray-200 text-[#C9A84C] focus:ring-0 accent-[#C9A84C] cursor-pointer">
                      <span class="text-[10px] text-gray-400 font-semibold select-none">Chọn tất cả</span>
                    </div>

                    <!-- Variant Cards List -->
                    <div id="pf-variants-list" class="flex flex-col gap-2">
                      <!-- Rendered dynamically by ProductVariantsForm.js -->
                    </div>

                    <!-- Pagination -->
                    <div id="pf-variants-pagination" class="flex justify-center pt-2"></div>
                  </div>
                  
                  <!-- Placeholder -->
                  <div id="pf-variants-placeholder" class="bg-white dark:bg-[#161c32] p-8 rounded-xl text-center text-gray-400 text-xs font-semibold">
                    Chưa có phiên bản nào. Vui lòng nhập giá trị thuộc tính bên trên và bấm "Tạo biến thể".
                  </div>
                </div>
              </div>
            </div>

            <!-- Card 4: Khuyến mãi & Chiến dịch (Chỉ khi sửa sản phẩm) -->
            ${product ? `
            <div id="pf-promotions-content" class="bg-white dark:bg-[#161c32] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider dark:border-gray-800 pb-3">Chiến dịch Khuyến mãi</h3>
              <div class="w-full">
                <!-- Handled by ProductPromotions.js -->
              </div>
            </div>
            ` : ''}

            <!-- Card 5: Tối ưu SEO -->
            <div class="bg-white dark:bg-[#161c32] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider dark:border-gray-800 pb-3">Tối ưu SEO</h3>
              
              <!-- Meta Title -->
              <div>
                <label class="form-label !text-xs !font-bold text-gray-500">Tiêu đề trang</label>
                <input name="meta_title" class="form-input" value="${product?.meta_title || ''}" placeholder="Nhập tiêu đề trang hiển thị trên Google..."/>
              </div>

              <!-- Meta Description -->
              <div>
                <label class="form-label !text-xs !font-bold text-gray-500">Mô tả trang</label>
                <textarea name="meta_description" class="form-input h-20 resize-none" placeholder="Nhập mô tả ngắn hiển thị trên Google...">${product?.meta_description || ''}</textarea>
              </div>

              <!-- URL / Slug preview -->
              <div>
                <label class="form-label !text-xs !font-bold text-gray-500">Đường dẫn trang sản phẩm</label>
                <div class="flex items-center gap-1 bg-gray-55 dark:bg-[#0f1322] px-3 py-2 rounded-xl border border-transparent focus-within:border-gray-250 dark:focus-within:border-gray-700 transition">
                  <span class="text-xs text-gray-400 select-none whitespace-nowrap">https://demo-quatangtinhte.mbws.vn/products/</span>
                  <input name="slug" id="pf-slug" class="bg-transparent border-none p-0 text-xs text-gray-850 dark:text-gray-150 font-bold focus:ring-0 focus:outline-none w-full" value="${product?.slug || ''}" placeholder="everyday-cargo-shorts"/>
                  <button type="button" id="pf-gen-slug" title="Tự động tạo slug từ tên"
                    class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 rounded-lg text-[10px] font-bold text-gray-650 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700 cursor-pointer">
                    Tự động
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: categorization, status & submit actions (col-span-4) -->
          <div class="lg:col-span-4 space-y-6 flex flex-col">
            
            <!-- Card 1: Trạng thái hiển thị -->
            <div class="bg-white dark:bg-[#161c32] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider dark:border-gray-800 pb-3">Trạng thái & Hiển thị</h3>
              
              <div class="flex flex-col gap-4">
                <label class="flex items-center justify-between cursor-pointer select-none">
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-gray-800 dark:text-gray-250">Kích hoạt sản phẩm</span>
                    <span class="text-[10px] text-gray-400 mt-0.5">Cho phép hiển thị sản phẩm trên web chính.</span>
                  </div>
                  <input type="checkbox" name="is_active" class="w-4 h-4 rounded border-gray-200 text-emerald-500 focus:ring-0 accent-emerald-500" ${product?.is_active !== false ? 'checked' : ''}>
                </label>
                
                <label class="flex items-center justify-between cursor-pointer select-none border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-gray-800 dark:text-gray-250">Sản phẩm nổi bật</span>
                    <span class="text-[10px] text-gray-400 mt-0.5">Hiển thị tại trang chủ.</span>
                  </div>
                  <input type="checkbox" name="is_featured" class="w-4 h-4 rounded border-gray-200 text-[#C9A84C] focus:ring-0 accent-[#C9A84C]" ${product?.is_featured ? 'checked' : ''}>
                </label>

                <label class="flex items-center justify-between cursor-pointer select-none border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-gray-800 dark:text-gray-250">Cá nhân hóa (Upload ảnh/Khắc chữ)</span>
                    <span class="text-[10px] text-gray-400 mt-0.5">Cho phép khắc tên, gửi ảnh khi mua hàng.</span>
                  </div>
                  <input type="checkbox" name="is_customizable" class="w-4 h-4 rounded border-gray-200 text-[#C9A84C] focus:ring-0 accent-[#C9A84C]" ${product?.is_customizable !== false ? 'checked' : ''}>
                </label>
              </div>
            </div>

            <!-- Card 2: Phân loại danh mục (WordPress style checkbox tree) -->
            <div class="bg-white dark:bg-[#161c32] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider dark:border-gray-800 pb-3">Phân loại sản phẩm</h3>
              
              <div class="space-y-2.5">
                <label class="form-label !text-xs !font-bold text-gray-400 mb-1 block">Danh mục sản phẩm (1-3 danh mục) *</label>
                
                <!-- Search Input with reset button -->
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input type="text" id="pf-category-search" class="form-input !pl-8 !pr-8 !py-1.5 text-xs bg-white dark:bg-[#161c32] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="Tìm kiếm danh mục..." autocomplete="off">
                  <button type="button" id="pf-category-search-clear" class="absolute right-3 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer hidden text-sm font-bold">&times;</button>
                </div>

                <!-- Category tree view list (scrollable) -->
                <div id="pf-category-tree-container" class="max-h-[260px] overflow-y-auto border border-gray-150 dark:border-gray-800 rounded-xl p-3.5 bg-gray-50 dark:bg-[#0f1322] space-y-2 select-none">
                  <div class="text-center text-gray-400 text-xs py-4">Đang tải danh mục...</div>
                </div>

                <!-- Hidden inputs for active state selection & subcategory -->
                <input type="hidden" name="subcategory_id" id="pf-subcategory-id-input" value="${product?.subcategory_id || ''}">

                <!-- Selected Categories summary indicator -->
                <div id="pf-category-summary-section" class="flex items-center justify-between text-[11px] pt-1 select-none">
                  <span class="text-gray-500 dark:text-gray-400 font-bold" id="pf-category-selected-text">Đã chọn: Chưa chọn</span>
                  <button type="button" id="pf-category-clear-all" class="text-red-500 hover:text-red-700 font-black bg-transparent border-none cursor-pointer hidden">Xóa tất cả</button>
                </div>

                <!-- Add Category Inline Form Toggle -->
                <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button type="button" id="pf-add-category-toggle" class="text-xs text-[#C9A84C] hover:text-[#b0903b] font-bold flex items-center gap-1.5 bg-transparent border-none cursor-pointer focus:outline-none">
                    + Thêm danh mục mới
                  </button>
                </div>

                <!-- Add Category Inline Form Container (Initially Hidden) -->
                <div id="pf-add-category-inline-container" class="hidden bg-gray-50 dark:bg-[#0f1322] border border-gray-150 dark:border-gray-800 p-4 rounded-xl space-y-3 pt-3">
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tên danh mục mới</label>
                    <input type="text" id="pf-new-cat-name" class="form-input !py-1.5 !text-xs" placeholder="Tên danh mục..." autocomplete="off">
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Danh mục cha</label>
                    <select id="pf-new-cat-parent" class="form-input !py-1.5 !text-xs bg-white dark:bg-[#161c32]">
                      <option value="">-- Không có (Danh mục gốc) --</option>
                    </select>
                  </div>
                  <div class="flex items-center justify-end gap-2 pt-1.5">
                    <button type="button" id="pf-new-cat-cancel" class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-bold border-none cursor-pointer">
                      Hủy
                    </button>
                    <button type="button" id="pf-new-cat-submit" class="px-3 py-1.5 bg-[#C9A84C] text-white hover:bg-[#b0903b] rounded-lg text-[10px] font-bold border-none cursor-pointer">
                      Thêm danh mục
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Card 3: Nhãn sản phẩm (Tags) -->
            <div class="bg-white dark:bg-[#161c32] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider border-gray-100 dark:border-gray-800 pb-3">Nhãn sản phẩm</h3>
              
              <!-- Tag Input Box -->
              <div class="relative">
                <label class="form-label !text-xs !font-bold text-gray-450 mb-1.5 block">Nhập nhãn mới hoặc chọn gợi ý</label>
                <input type="text" id="pf-tag-input" class="form-input text-xs bg-white dark:bg-[#161c32] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-850 dark:text-gray-150 placeholder-gray-400 focus:border-[#C9A84C] dark:focus:border-[#C9A84C]" placeholder="Tìm hoặc thêm nhãn..." autocomplete="off" />
                
                <!-- Suggestions Dropdown -->
                <div id="pf-tags-dropdown" class="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#161c32] border border-gray-150 dark:border-gray-800 rounded-xl shadow-xl z-30 hidden overflow-hidden transition-all max-h-60 overflow-y-auto">
                  <!-- Rendered dynamically -->
                </div>
              </div>

              <!-- Selected Tags Chips List -->
              <div class="space-y-2">
                <span class="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Kéo thả để sắp xếp thứ tự nhãn</span>
                <div id="pf-tags-list" class="flex flex-wrap gap-2 min-h-8 p-3.5 bg-gray-55 dark:bg-[#0f1322] border border-gray-150 dark:border-gray-800 rounded-xl items-center">
                  <!-- Rendered dynamically -->
                </div>
              </div>
            </div>

            <!-- Submit Actions Card -->
            <div class="bg-white dark:bg-[#161c32] rounded-2xl p-6 shadow-sm space-y-3">
              <button type="submit" id="pf-submit" 
                class="w-full py-3 bg-[#5d58f0] text-white hover:bg-[#4b46d5] font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all border-none cursor-pointer">
                Lưu sản phẩm
              </button>
              <button type="button" id="pf-cancel" 
                class="w-full py-3 bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all border-none cursor-pointer">
                Quay lại danh sách
              </button>
            </div>

          </div>
        </div>

        <!-- Hidden submit elements for compatibility with legacy popup structures -->
        <button id="pf-close" class="hidden"></button>

        <datalist id="dl-pf-size"></datalist>
        <datalist id="dl-pf-material"></datalist>
      </form>
    </div>
  `;
}
