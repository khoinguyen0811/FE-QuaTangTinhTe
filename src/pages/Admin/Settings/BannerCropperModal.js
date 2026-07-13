/**
 * BannerCropperModal.js — Interactive multi-viewport banner cropper & live editor
 */
import { showToast } from '../shared/ui.js';

export class BannerCropperModal {
  constructor(options = {}) {
    this.onCropComplete = options.onCropComplete || (() => {});
    this.onClose = options.onClose || (() => {});
    
    this.modalEl = null;
    this.imageSrc = null;
    this.deviceMode = 'desktop'; // 'desktop' | 'tablet' | 'mobile'
    
    // Crop positioning state
    this.zoom = 1.0;
    this.pan = { x: 0, y: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.panStart = { x: 0, y: 0 };
    
    // Cached layout values
    this.imgWidth = 0;
    this.imgHeight = 0;
    this.frameWidth = 0;
    this.frameHeight = 0;
  }

  open(imageSrc, type = 'desktop', alignment = null) {
    this.imageSrc = imageSrc;
    this.deviceMode = type === 'mobile' ? 'mobile' : 'desktop';
    this.alignment = alignment;
    
    // Initialize offsets
    this.zoom = (alignment && alignment.zoom) ? parseFloat(alignment.zoom) : 1.0;
    this.pan = { x: 0, y: 0 };
    
    this._renderModal();
    this._bindEvents();
    this._loadAndPositionImage();
  }

  close() {
    if (this._onWindowMouseMove) {
      window.removeEventListener('mousemove', this._onWindowMouseMove);
      this._onWindowMouseMove = null;
    }
    if (this._onWindowMouseUp) {
      window.removeEventListener('mouseup', this._onWindowMouseUp);
      this._onWindowMouseUp = null;
    }
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.remove();
    }
    this.onClose();
  }

  _getMockNavbarHtml() {
    const isDesktop = this.deviceMode === 'desktop';
    const isTablet = this.deviceMode === 'tablet';
    
    if (isDesktop) {
      return `
        <!-- Desktop Mock Navbar -->
        <div class="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-b from-black/55 to-transparent text-white font-sans">
          <div class="flex items-center gap-6">
            <span class="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              MENU
            </span>
            <span class="text-[8px] text-white/50 font-bold border-b border-white/25 pb-0.5">Tìm kiếm...</span>
          </div>
          <div class="text-[12px] font-black tracking-[0.2em] uppercase">${window.APP_SETTINGS?.brand_name || 'Mắt Bão WS'}</div>
          <div class="flex items-center gap-5">
            <span class="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
              TÀI KHOẢN
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        </div>
      `;
    } else if (isTablet) {
      return `
        <!-- Tablet Mock Navbar -->
        <div class="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/50 to-transparent text-white font-sans">
          <div class="flex items-center gap-4">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <span class="text-[8px] text-white/40 font-bold border-b border-white/15 pb-0.5">Tìm kiếm...</span>
          </div>
          <div class="text-[11px] font-black tracking-widest uppercase">${window.APP_SETTINGS?.brand_name || 'Mắt Bão WS'}</div>
          <div class="flex gap-3 text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        </div>
      `;
    } else {
      return `
        <!-- Mobile Mock Navbar -->
        <div class="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/50 to-transparent text-white font-sans">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <div class="text-[10px] font-black tracking-wider uppercase">${window.APP_SETTINGS?.brand_name || 'Mắt Bão WS'}</div>
          <div class="flex gap-2 text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        </div>
      `;
    }
  }

  _renderModal() {
    const modal = document.createElement('div');
    modal.id = 'banner-cropper-modal';
    modal.className = 'fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans select-none';
    modal.setAttribute('data-lenis-prevent', 'true');
    
    // Aspect ratios definitions
    // Desktop: 16:9, Tablet: 4:3, Mobile: 9:16
    modal.innerHTML = `
      <style>
        #cropper-workspace {
          background-image: radial-gradient(#2d2d2d 1px, transparent 1px);
          background-size: 16px 16px;
        }
        /* Crop Workspace Frame Constraints */
        .crop-frame-desktop {
          width: 640px;
          height: 360px;
        }
        .crop-frame-tablet {
          width: 480px;
          height: 360px;
        }
        .crop-frame-mobile {
          width: 270px;
          height: 480px;
        }
        @media (max-width: 768px) {
          .crop-frame-desktop {
            width: 320px;
            height: 180px;
          }
          .crop-frame-tablet {
            width: 240px;
            height: 180px;
          }
          .crop-frame-mobile {
            width: 180px;
            height: 320px;
          }
        }
        .active-viewport-btn {
          background-color: #C9A84C !important;
          color: white !important;
          border-color: #C9A84C !important;
        }
      </style>
      
      <div class="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-fade-in">
        
        <!-- Left Side: Workspace & Mockup Overlay -->
        <div class="flex-1 bg-zinc-900 flex flex-col items-center justify-center p-4 relative" id="cropper-workspace">
          
          <!-- Crop Frame -->
          <div id="crop-frame" class="crop-frame-${this.deviceMode} relative overflow-hidden bg-black shadow-2xl border-2 border-white/20 transition-all duration-300">
            
            <!-- Target Image -->
            <img id="cropper-image" src="${this.imageSrc}" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none max-h-none pointer-events-none origin-center" style="transform: translate3d(-50%, -50%, 0) scale(1);" />
            
            <!-- Real-time SLY Storefront Mockup Overlay -->
            <div id="mock-overlay" class="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between">
              <!-- Mock Announcement Bar -->
              <div class="w-full bg-black/90 text-white text-center py-1 text-[7px] md:text-[9px] font-black uppercase tracking-wider">
                FREESHIP TOÀN QUỐC · MỌI ĐƠN HÀNG · FREESHIP TOÀN QUỐC
              </div>
              
              <!-- Mock Navbar Container -->
              <div id="mock-navbar-container" class="w-full">
                ${this._getMockNavbarHtml()}
              </div>
              
              <!-- Mock Content Spacer -->
              <div class="flex-1"></div>
              
              <!-- Mock Voucher (Bottom Left) -->
              <div class="p-3">
                <div class="bg-white/95 text-zinc-950 px-2 py-1.5 rounded-lg border border-dashed border-amber-500/50 shadow-md inline-flex items-center gap-1.5 text-[6px] md:text-[8px] font-bold max-w-[120px]">
                  <div class="border-r border-dashed border-zinc-200 pr-1.5">
                    <span class="block font-black leading-none">GIẢM 50K</span>
                  </div>
                  <div>
                    <span class="block tracking-wider font-mono">WELCOME</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Hint -->
          <div class="absolute bottom-4 text-white/50 text-[10px] pointer-events-none">
            Nhấp giữ chuột trái và kéo ảnh để di chuyển · Dùng thanh trượt bên phải để phóng to
          </div>
        </div>
        
        <!-- Right Side: Control & Config Panel -->
        <div class="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-150 flex flex-col p-6 justify-between bg-gray-50/50">
          
          <div class="space-y-6">
            <!-- Header Title -->
            <div>
              <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider">Cắt & Căn Chỉnh Banner</h4>
              <p class="text-xs text-gray-500 mt-1">Thiết lập tỉ lệ màn hình, thu phóng và điều chỉnh góc ảnh tối ưu nhất cho thiết bị hiển thị.</p>
            </div>
            
            <!-- Viewport Info -->
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Khung thiết bị (Viewport)</label>
              <div class="text-xs font-black text-zinc-800 uppercase tracking-widest bg-zinc-100 px-3.5 py-2.5 rounded-lg border border-zinc-200/50 flex items-center gap-2">
                ${this.deviceMode === 'mobile' ? `
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  MOBILE (9:16)
                ` : `
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  LAPTOP (16:9)
                `}
              </div>
            </div>
            
            <!-- Zoom Slider -->
            <div class="space-y-2">
              <div class="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Thu phóng (Zoom)</span>
                <span id="zoom-value" class="text-zinc-700">100%</span>
              </div>
              <input type="range" id="zoom-slider" min="1.0" max="3.0" step="0.05" value="1.0" class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]" />
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="space-y-2.5 pt-4 border-t border-gray-200">
            <button id="crop-submit-btn" class="w-full bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-xs py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Lưu Canh Chỉnh
            </button>
            <button id="crop-cancel-btn" class="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-semibold text-xs py-2.5 rounded-lg transition-all duration-200">
              Hủy bỏ
            </button>
          </div>
          
        </div>
        
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modalEl = modal;
    
    // Set active button
    this._updateViewportButtons();
  }

  _updateViewportButtons() {
    // Buttons removed, no-op
  }

  _bindEvents() {
    const workspace = this.modalEl.querySelector('#cropper-workspace');
    const image = this.modalEl.querySelector('#cropper-image');
    const zoomSlider = this.modalEl.querySelector('#zoom-slider');
    
    // Viewport selection removed from UI
    
    // Zoom range slider
    zoomSlider.addEventListener('input', (e) => {
      this.zoom = parseFloat(e.target.value);
      this.modalEl.querySelector('#zoom-value').textContent = Math.round(this.zoom * 100) + '%';
      this._applyConstraintsAndTransform();
    });
    
    // Drag-Pan handlers on the workspace (pointer down anywhere in workspace to drag image)
    const onStart = (clientX, clientY) => {
      this.isDragging = true;
      this.dragStart = { x: clientX, y: clientY };
      this.panStart = { x: this.pan.x, y: this.pan.y };
      image.style.transition = 'none'; // Disable transition during drag for smoothness
    };

    const onMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const dx = clientX - this.dragStart.x;
      const dy = clientY - this.dragStart.y;
      
      this.pan.x = this.panStart.x + dx;
      this.pan.y = this.panStart.y + dy;
      
      this._applyConstraintsAndTransform();
    };

    const onEnd = () => {
      this.isDragging = false;
      image.style.transition = 'transform 0.1s ease-out';
    };

    workspace.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onStart(e.clientX, e.clientY);
    });

    this._onWindowMouseMove = (e) => {
      if (!this.isDragging) return;
      onMove(e.clientX, e.clientY);
    };
    this._onWindowMouseUp = () => {
      onEnd();
    };

    window.addEventListener('mousemove', this._onWindowMouseMove);
    window.addEventListener('mouseup', this._onWindowMouseUp);

    window.adminCleanups = window.adminCleanups || [];
    window.adminCleanups.push(() => {
      if (this._onWindowMouseMove) window.removeEventListener('mousemove', this._onWindowMouseMove);
      if (this._onWindowMouseUp) window.removeEventListener('mouseup', this._onWindowMouseUp);
    });
    
    // Touch support
    workspace.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    workspace.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    workspace.addEventListener('touchend', () => {
      onEnd();
    });
    
    // Save Alignment & Submit
    this.modalEl.querySelector('#crop-submit-btn').addEventListener('click', () => {
      this._saveAlignment();
    });
    
    // Cancel & Close
    this.modalEl.querySelector('#crop-cancel-btn').addEventListener('click', () => {
      this.close();
    });
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });
  }

  _loadAndPositionImage() {
    const image = this.modalEl.querySelector('#cropper-image');
    const frame = this.modalEl.querySelector('#crop-frame');
    
    const imgObj = new Image();
    imgObj.src = this.imageSrc;
    imgObj.onload = () => {
      // Calculate initial layout fitting
      this.frameWidth = frame.clientWidth;
      this.frameHeight = frame.clientHeight;
      
      const frameRatio = this.frameWidth / this.frameHeight;
      const imgRatio = imgObj.naturalWidth / imgObj.naturalHeight;
      
      if (frameRatio > imgRatio) {
        // Image width fits frame width, height overflows
        this.imgWidth = this.frameWidth;
        this.imgHeight = this.frameWidth / imgRatio;
      } else {
        // Image height fits frame height, width overflows
        this.imgHeight = this.frameHeight;
        this.imgWidth = this.frameHeight * imgRatio;
      }
      
      // Apply style size
      image.style.width = `${this.imgWidth}px`;
      image.style.height = `${this.imgHeight}px`;
      
      // Restore alignment values or reset to center
      if (this.alignment) {
        this.zoom = this.alignment.zoom !== undefined ? parseFloat(this.alignment.zoom) : 1.0;
        this.pan.x = this.alignment.panX !== undefined ? (parseFloat(this.alignment.panX) / 100) * this.frameWidth : 0;
        this.pan.y = this.alignment.panY !== undefined ? (parseFloat(this.alignment.panY) / 100) * this.frameHeight : 0;
      } else {
        this.pan = { x: 0, y: 0 };
        this.zoom = 1.0;
      }
      
      const slider = this.modalEl.querySelector('#zoom-slider');
      slider.value = this.zoom;
      this.modalEl.querySelector('#zoom-value').textContent = Math.round(this.zoom * 100) + '%';
      
      this._applyConstraintsAndTransform();
    };
  }

  _applyConstraintsAndTransform() {
    const image = this.modalEl.querySelector('#cropper-image');
    if (!image) return;
    
    // Bounds limit: Image must always fully cover the crop frame.
    // Calculate maximum translations.
    // At center, initial left = (frameWidth - imgWidth * zoom) / 2
    // If we translate by pan.x, we must ensure left <= 0 and right >= frameWidth.
    const maxX = Math.max(0, (this.imgWidth * this.zoom - this.frameWidth) / 2);
    const maxY = Math.max(0, (this.imgHeight * this.zoom - this.frameHeight) / 2);
    
    this.pan.x = Math.max(-maxX, Math.min(maxX, this.pan.x));
    this.pan.y = Math.max(-maxY, Math.min(maxY, this.pan.y));
    
    // We position the image using absolute centering translate (-50%, -50%) plus our pan translate offsets.
    image.style.transform = `translate3d(calc(-50% + ${this.pan.x}px), calc(-50% + ${this.pan.y}px), 0) scale(${this.zoom})`;
  }

  _saveAlignment() {
    const panX_pct = this.frameWidth > 0 ? (this.pan.x / this.frameWidth) * 100 : 0;
    const panY_pct = this.frameHeight > 0 ? (this.pan.y / this.frameHeight) * 100 : 0;

    this.onCropComplete({
      zoom: this.zoom,
      panX: parseFloat(panX_pct.toFixed(4)),
      panY: parseFloat(panY_pct.toFixed(4))
    });
    this.close();
  }
}
