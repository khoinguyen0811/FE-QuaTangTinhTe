import { navigate } from '../../../utils/helpers.js';
import { profileOrderActionMethods } from './ProfileOrderActions.js?v=1.0.83';
import { cancelOrder } from '../../../services/orderService.js';
import { API_BASE } from '../../../services/config.js';

export class ProfileOrders {
  constructor(page) {
    this.page = page;

    this.page.cancelOrder = this.cancelOrder.bind(this);
    this.page.reorderItems = this.reorderItems.bind(this);
    this.page.openReviewForm = this.openReviewForm.bind(this);
    this.page.openOrderDetails = this.openOrderDetails.bind(this);
    this.page.openReturnRequestForm = this.openReturnRequestForm.bind(this);
  }

  getImgSrc(img) {
    if (!img) return 'https://images.pexels.com/photos/236915/pexels-photo-236915.jpeg?auto=compress&cs=tinysrgb&w=400';
    if (img.startsWith('http')) return img;
    if (img.startsWith('../backend/public/')) {
      return img.replace('../backend/public', API_BASE);
    }
    if (img.startsWith('/backend/public/')) {
      return img.replace('/backend/public', API_BASE);
    }
    if (img.startsWith('backend/public/')) {
      return img.replace('backend/public', API_BASE);
    }
    return `./image/product/${img}`;
  }

  render() {
    const tabs = [
      { id: 'all', label: 'Tất cả' },
      { id: 'pending', label: 'Chờ xác nhận' },
      { id: 'shipping', label: 'Đang giao' },
      { id: 'completed', label: 'Đã giao' },
      { id: 'cancelled', label: 'Đã hủy' }
    ];

    const packageIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-950" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
        <path d="M12 12l8 -4.5" />
        <path d="M12 12l0 9" />
        <path d="M12 12l-8 -4.5" />
        <path d="M16 5.25l-8 4.5" />
      </svg>
    `;

    return `
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
        <h2 class="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
          ${packageIcon}
          <span>Đơn hàng của tôi</span>
        </h2>
      </div>

      <div class="flex gap-2 border-b border-zinc-100 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap pb-1" id="orders-tabs-container">
        ${tabs.map(t => `
          <button data-filter="${t.id}"
            class="pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 focus:outline-none transition ${this.page._orderFilter === t.id ? 'border-zinc-950 text-zinc-950 font-black' : 'border-transparent text-zinc-400'}">
            ${t.label}
          </button>
        `).join('')}
      </div>

      <div class="relative mb-6">
        <input type="text" id="order-search-input" placeholder="Tìm theo mã đơn hoặc tên sản phẩm..." value="${this.page._orderSearchQuery || ''}"
          class="w-full h-11 pl-10 pr-4 border border-zinc-200 rounded-xl text-sm font-medium outline-none transition focus:border-zinc-950 bg-white" />
        <span class="absolute left-3.5 top-3 text-zinc-400 text-sm">⌕</span>
      </div>

      <div id="orders-list-wrapper">
        ${this.renderOrdersListHtml()}
      </div>
    `;
  }

  renderOrdersListHtml() {
    let filtered = this.page._orders || [];

    if (this.page._orderFilter !== 'all') {
      if (this.page._orderFilter === 'pending') {
        filtered = filtered.filter(o => o.status === 'pending');
      } else if (this.page._orderFilter === 'shipping') {
        filtered = filtered.filter(o => o.status === 'shipping' || o.status === 'delivering');
      } else if (this.page._orderFilter === 'completed') {
        filtered = filtered.filter(o => o.status === 'completed');
      } else if (this.page._orderFilter === 'cancelled') {
        filtered = filtered.filter(o => o.status === 'cancelled');
      }
    }

    if (this.page._orderSearchQuery) {
      const q = this.page._orderSearchQuery.trim().toLowerCase();
      filtered = filtered.filter(o => {
        const orderIdStr = String(o.id).toLowerCase();
        const fullCode = `#ord-${orderIdStr}`;
        const prefixCode = `ord-${orderIdStr}`;
        const hashId = `#${orderIdStr}`;

        const idMatch = orderIdStr.includes(q) ||
                        fullCode.includes(q) ||
                        prefixCode.includes(q) ||
                        hashId.includes(q);
        const itemMatch = o.items && o.items.some(i => i.product_name.toLowerCase().includes(q));
        return idMatch || itemMatch;
      });
    }

    const shoppingBagIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-zinc-400 mx-auto mb-4" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304z" />
        <path d="M9 11v-5a3 3 0 0 1 6 0v5" />
      </svg>
    `;

    const totalOrders = filtered.length;
    const totalPages = Math.ceil(totalOrders / this.page._orderPerPage);

    if (this.page._orderPage > totalPages && totalPages > 0) {
      this.page._orderPage = totalPages;
    }
    if (this.page._orderPage < 1) {
      this.page._orderPage = 1;
    }

    const startIndex = (this.page._orderPage - 1) * this.page._orderPerPage;
    const endIndex = startIndex + this.page._orderPerPage;
    const paginatedOrders = filtered.slice(startIndex, endIndex);

    let paginationHtml = '';
    if (totalPages > 1) {
      paginationHtml = `
        <div class="flex items-center justify-center gap-1.5 pt-6 mt-6 border-t border-zinc-100 flex-wrap">
          <button data-page="${this.page._orderPage - 1}" ${this.page._orderPage === 1 ? 'disabled' : ''}
            class="h-9 px-3 border border-zinc-200 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-650 hover:border-zinc-950 hover:text-zinc-950 transition disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-650 disabled:cursor-not-allowed">
            Trước
          </button>
      `;

      for (let i = 1; i <= totalPages; i++) {
        const isCurrent = this.page._orderPage === i;
        const isNear = Math.abs(i - this.page._orderPage) <= 1;
        const isEdge = i === 1 || i === totalPages;

        if (isEdge || isNear) {
          paginationHtml += `
            <button data-page="${i}"
              class="w-9 h-9 border rounded-lg text-xs font-black uppercase tracking-wider transition ${isCurrent ? 'bg-zinc-950 border-zinc-950 text-white' : 'border-zinc-200 text-zinc-600 hover:border-zinc-950 hover:text-zinc-950'}">
              ${i}
            </button>
          `;
        } else if (i === 2 && this.page._orderPage > 3) {
          paginationHtml += `<span class="px-1 text-zinc-400 text-xs self-center">...</span>`;
        } else if (i === totalPages - 1 && this.page._orderPage < totalPages - 2) {
          paginationHtml += `<span class="px-1 text-zinc-400 text-xs self-center">...</span>`;
        }
      }

      paginationHtml += `
          <button data-page="${this.page._orderPage + 1}" ${this.page._orderPage === totalPages ? 'disabled' : ''}
            class="h-9 px-3 border border-zinc-200 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-650 hover:border-zinc-950 hover:text-zinc-950 transition disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-650 disabled:cursor-not-allowed">
            Sau
          </button>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        ${paginatedOrders.length === 0 ? `
          <div class="text-center py-16">
            ${shoppingBagIcon}
            <p class="text-sm font-bold text-zinc-400 mb-6">Chưa có đơn nào? Đi dạo shop nhé!</p>
            <button id="btn-shop-now-orders" class="h-11 px-8 bg-zinc-950 text-white rounded-xl text-xs font-black tracking-widest uppercase hover:bg-amber-500 transition">
              Mua sắm ngay
            </button>
          </div>
        ` : paginatedOrders.map(order => this.orderCardHTML(order)).join('')}
      </div>

      ${paginationHtml}
    `;
  }

  bindEvents(container) {
    const searchInput = container.querySelector('#order-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.page._orderSearchQuery = e.target.value;
        this.page._orderPage = 1;
        clearTimeout(this._searchTimer);
        this._searchTimer = setTimeout(() => {
          this.updateOrdersList(container);
        }, 150);
      });
    }

    container.querySelectorAll('#orders-tabs-container [data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.page._orderFilter = filter;
        this.page._orderPage = 1;

        container.querySelectorAll('#orders-tabs-container [data-filter]').forEach(t => {
          if (t.dataset.filter === filter) {
            t.className = 'pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 focus:outline-none transition border-zinc-950 text-zinc-950 font-black';
          } else {
            t.className = 'pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 focus:outline-none transition border-transparent text-zinc-400';
          }
        });

        this.updateOrdersList(container);
      });
    });

    this.bindDynamicEvents(container);
  }

  bindDynamicEvents(container) {
    const listWrapper = container.querySelector('#orders-list-wrapper');
    if (!listWrapper) return;

    const shopNowBtn = listWrapper.querySelector('#btn-shop-now-orders');
    if (shopNowBtn) {
      shopNowBtn.addEventListener('click', () => navigate('/products'));
    }

    listWrapper.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page, 10);
        if (!isNaN(page)) {
          this.page._orderPage = page;
          this.updateOrdersList(container);
        }
      });
    });
  }

  updateOrdersList(container) {
    const listWrapper = container.querySelector('#orders-list-wrapper');
    if (listWrapper) {
      listWrapper.innerHTML = this.renderOrdersListHtml();
      this.bindDynamicEvents(container);
    }
  }

  async cancelOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      await cancelOrder(orderId);
      alert('Đã hủy đơn hàng thành công.');
      await this.page._loadData();
      this.page._renderDashboard(this.page._wrap);
    } catch (err) {
      alert(err.message || 'Lỗi hủy đơn hàng.');
    }
  }

  reorderItems(orderId) {
    const order = this.page._orders.find(o => Number(o.id) === Number(orderId));
    if (!order || !order.items) return;
    try {
      const cart = JSON.parse(localStorage.getItem('dhat_cart') || '[]');
      order.items.forEach(item => {
        cart.push({
          id: item.product_id,
          name: item.product_name,
          price: parseFloat(item.product_price),
          qty: item.quantity,
          image: this.getImgSrc(item.product_images?.[0])
        });
      });
      localStorage.setItem('dhat_cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cart-updated'));
      alert('Đã thêm sản phẩm vào giỏ hàng.');
      navigate('/cart');
    } catch (err) {
      alert('Lỗi mua lại sản phẩm.');
    }
  }
}

Object.assign(ProfileOrders.prototype, profileOrderActionMethods);
