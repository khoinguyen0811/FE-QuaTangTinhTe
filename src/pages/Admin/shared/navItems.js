export const NAV_ITEMS = [
  {
    title: 'HOME',
    items: [
      {
        id: 'dashboard', label: 'Dashboard', hash: '#dashboard',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
        permission: 'admin:read',
      },
      {
        id: 'analytics', label: 'Thống Kê (Analytics)', hash: '#analytics',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
        permission: 'analytics:read',
      }
    ]
  },
  {
    title: 'ECOMMERCE',
    items: [
      {
        id: 'products_group', label: 'Sản Phẩm',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
        children: [
          { id: 'products', label: 'Danh Sách Sản Phẩm', hash: '#products', permission: 'products:read', badge: 'lowstock' },
          { id: 'variants', label: 'Biến Thể', hash: '#variants', permission: 'products:read' },
          { id: 'categories', label: 'Danh Mục', hash: '#categories', permission: 'categories:read' },
        ]
      },
      {
        id: 'orders_group', label: 'Đơn Hàng',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
        children: [
          { id: 'orders', label: 'Danh Sách Đơn Hàng', hash: '#orders', permission: 'orders:read', badge: 'pending' },
          { id: 'returns', label: 'Trả Hàng', hash: '#returns', permission: 'returns:read' },
        ]
      },
      {
        id: 'members', label: 'Khách Hàng & Loyalty', hash: '#members',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        permission: 'members:read',
      },
      {
        id: 'vouchers_group', label: 'Khuyến Mãi',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
        children: [
          { id: 'vouchers', label: 'Khuyến Mãi', hash: '#vouchers', permission: 'vouchers:read' },
          { id: 'flash-sales', label: 'Flash Sales', hash: '#flash-sales', permission: 'flash_sales:read' },
          { id: 'reviews', label: 'Đánh Giá Sản Phẩm', hash: '#reviews', permission: 'reviews:read' },
        ]
      }
    ]
  },
  {
    title: 'NỘI DUNG',
    items: [
      {
        id: 'blogs_group', label: 'Bài Viết & Tin Tức',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a2.5 2.5 0 0 1 2.5-2.5H20v14H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>`,
        children: [
          { id: 'blogs', label: 'Quản Lý Bài Viết', hash: '#blogs', permission: 'blogs:read' },
          { id: 'blog_categories', label: 'Danh Mục Bài Viết', hash: '#blog_categories', permission: 'blogs:read' },
          { id: 'blog_tags', label: 'Thẻ Bài Viết', hash: '#blog_tags', permission: 'blogs:read' },
        ]
      },
      {
        id: 'languages_group', label: 'Đa Ngôn Ngữ',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
        children: [
          { id: 'languages', label: 'Quản Lý Ngôn Ngữ', hash: '#languages', permission: 'languages:read' },
          { id: 'translations', label: 'Quản Lý Bản Dịch', hash: '#languages', permission: 'languages:read' },
        ]
      }
    ]
  },
  {
    title: 'HỆ THỐNG',
    items: [
      {
        id: 'users', label: 'Nhân Viên & Phân Quyền', hash: '#users',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        permission: 'users:read',
      },
      {
        id: 'settings', label: 'Cài Đặt Giao Diện', hash: '#settings',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        permission: 'settings:read',
      },
      {
        id: 'api-settings', label: 'Cấu Hình Cloud & API', hash: '#api-settings',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
        roleRequired: 'super_admin',
      },
      {
        id: 'system_group', label: 'Cấu Hình Hệ Thống',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
        roleRequired: 'system',
        children: [
          { id: 'system', label: 'Cấu Hình Chung', hash: '#system', roleRequired: 'system' },
          { id: 'system-model', label: 'Quản Lý Mô-đun', hash: '#system-model', roleRequired: 'system' },
          { id: 'system-ip-block', label: 'Chặn IP & Bảo Mật', hash: '#system-ip-block', roleRequired: 'system' },
        ]
      }
    ]
  }
];
