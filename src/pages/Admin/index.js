import { renderLogin } from './Login/index.js';
import { renderSidebar } from './shared/AdminSidebar.js?v=1.0.6';
import { renderTopbar } from './shared/AdminTopbar.js?v=1.0.1';
import { renderDashboard } from './Dashboard/index.js?v=1.1.3';
import { renderProducts } from './Products/index.js?v=1.2.2';
import { renderVariants } from './Variants/index.js?v=1.0.99';
import { renderCategories } from './Categories/index.js?v=1.0.99';
import { renderOrders } from './Orders/index.js?v=1.0.99';
import { renderUsers } from './Users/index.js?v=1.0.99';
import { renderRoles } from './Roles/index.js?v=1.0.99';
import { renderAnalytics } from './Analytics/index.js?v=1.1.6';
import { renderReturns } from './Returns/index.js';
import { renderMembers } from './Members/index.js';
import { renderRanks } from './Ranks/index.js';
import { renderVouchers } from './Vouchers/index.js';
import { renderReviews } from './Reviews/index.js';
import { renderFlashSales } from './FlashSales/index.js';
import { renderSettings } from './Settings/index.js?v=1.0.94';
import { renderAPISettings } from './APISettings/index.js?v=1.0.81';
import { API_BASE, STORAGE_KEYS } from '../../services/config.js';
import { showToast, hasPermission, isSuperAdmin, isSystem, showUnsavedChangesModal } from './shared/ui.js';
import { applyAdminTheme } from './shared/theme.js?v=1.0.0';

applyAdminTheme();

const routePermissions = {
  dashboard: 'admin:read',
  products: 'products:read',
  variants: 'products:read',
  categories: 'categories:read',
  orders: 'orders:read',
  returns: 'returns:read',
  members: 'members:read',
  ranks: 'ranks:read',
  vouchers: 'vouchers:read',
  reviews: 'reviews:read',
  'flash-sales': 'flash_sales:read',
  users: 'users:read',
  roles: 'roles:manage',
  analytics: 'analytics:read',
  settings: 'settings:read',
  blogs: 'blogs:read',
  blog_categories: 'blogs:read',
  blog_tags: 'blogs:read',
  languages: 'languages:read',
  translations: 'languages:read',
};

const routeTitles = {
  dashboard: 'Dashboard',
  products: 'Products',
  variants: 'Product Variants',
  categories: 'Categories',
  orders: 'Orders',
  returns: 'Returns',
  members: 'Customers & Loyalty',
  ranks: 'VIP Ranks',
  vouchers: 'Vouchers & Gifts',
  reviews: 'Product Reviews',
  'flash-sales': 'Flash Sales',
  users: 'Staff & Roles',
  roles: 'Permissions',
  analytics: 'Analytics & Tracking',
  settings: 'Settings',
  'api-settings': 'API Config',
  system: 'System Settings',
  'system-model': 'Quản Lý Mô-đun',
  'system-ip-block': 'Chặn IP & Bảo Mật',
  blogs: 'Quản Lý Bài Viết',
  blog_categories: 'Danh Mục Bài Viết',
  blog_tags: 'Thẻ Bài Viết',
  languages: 'Quản Lý Ngôn Ngữ',
  translations: 'Quản Lý Bản Dịch',
};

const appState = {
  root: null,
  sidebarEl: null,
  topbarEl: null,
  contentEl: null,
  listenersBound: false,
  globalListenersBound: false,
};

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
}

function getCurrentRoute() {
  return window.location.hash.replace('#', '') || 'dashboard';
}

function clearAdminCookie() {
  const name = 'sly_admin_auth_token';
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
  document.cookie = `${name}=; path=/; Max-Age=-99999999; SameSite=Lax`;
  document.cookie = `${name}=; path=/; Max-Age=-99999999; SameSite=Lax; Secure`;
}

function renderContent(route, container) {
  container.innerHTML = '';
  if (route.startsWith('orders/')) {
    const orderId = parseInt(route.split('/')[1], 10);
    import('./Orders/OrderDetail.js?v=1.0.84').then(mod => {
      mod.renderOrderDetail(container, orderId, () => {
        window.location.hash = '#orders';
      });
    });
    return;
  }

  if (route.startsWith('members/')) {
    const userId = parseInt(route.split('/')[1], 10);
    import('./Members/MemberDetail.js?v=1.0.85').then(mod => {
      mod.renderMemberDetail(container, userId, () => {
        window.location.hash = '#members';
      });
    });
    return;
  }

  if (route.startsWith('products/') && route !== 'products') {
    const parts = route.split('/');
    const productId = parts[1] === 'new' ? 'new' : parseInt(parts[1], 10);
    import('./Products/ProductDetail.js?v=1.3.0').then(mod => {
      mod.renderProductDetail(container, productId, () => {
        window.location.hash = '#products';
      });
    });
    return;
  }

  switch (route) {
    case 'dashboard': renderDashboard(container); break;
    case 'products': renderProducts(container); break;
    case 'variants': renderVariants(container); break;
    case 'categories': renderCategories(container); break;
    case 'orders': renderOrders(container); break;
    case 'returns': renderReturns(container); break;
    case 'members': renderMembers(container); break;
    case 'ranks': renderRanks(container); break;
    case 'vouchers': renderVouchers(container); break;
    case 'reviews': renderReviews(container); break;
    case 'flash-sales': renderFlashSales(container); break;
    case 'users': renderUsers(container); break;
    case 'roles': renderRoles(container); break;
    case 'analytics': renderAnalytics(container); break;
    case 'settings': renderSettings(container); break;
    case 'api-settings': renderAPISettings(container); break;
    case 'system':
      import('./System/index.js?v=' + Date.now()).then(mod => {
        mod.renderSystemSettings(container);
      });
      break;
    case 'system-model':
      import('./System/model.js?v=' + Date.now()).then(mod => {
        mod.renderSystemModelSettings(container);
      });
      break;
    case 'system-ip-block':
      import('./System/IpBlock.js?v=' + Date.now()).then(mod => {
        mod.renderIpBlockSettings(container);
      });
      break;
    case 'blogs':
    case 'blog_categories':
    case 'blog_tags':
      import('./Blogs/index.js?v=' + Date.now()).then(mod => {
        mod.renderBlogsPlaceholder(container, route);
      });
      break;
    case 'languages':
    case 'translations':
      import('./Languages/index.js?v=' + Date.now()).then(mod => {
        mod.renderLanguagesPlaceholder(container, route);
      });
      break;
    default: renderDashboard(container);
  }
}

function renderRoute() {
  if (!appState.sidebarEl || !appState.topbarEl || !appState.contentEl) return;

  // Clear previous route's global timers/listeners to prevent memory leaks
  if (window.adminCleanups) {
    while (window.adminCleanups.length > 0) {
      try {
        window.adminCleanups.shift()();
      } catch (e) {
        console.error('Error during admin route cleanup:', e);
      }
    }
  }
  window.adminCleanups = [];

  const route = getCurrentRoute();
  const baseRoute = route.split('/')[0];

  if ((route === 'system' || route === 'system-model' || route === 'system-ip-block') && !isSystem()) {
    showToast('Bạn không có quyền truy cập trang này.', 'error');
    window.location.hash = '#dashboard';
    return;
  }

  if (route === 'api-settings' && !isSuperAdmin()) {
    showToast('Bạn không có quyền truy cập trang này.', 'error');
    window.location.hash = '#dashboard';
    return;
  }

  // Check if module is disabled in system configurations
  if (window.APP_SETTINGS?.disabled_modules?.includes(baseRoute) && !isSystem()) {
    showToast('Chức năng này đã bị vô hiệu hóa bởi Quản trị viên hệ thống.', 'warning');
    window.location.hash = '#dashboard';
    return;
  }

  const requiredPermission = routePermissions[baseRoute];
  if (requiredPermission && !hasPermission(requiredPermission)) {
    const allowed = Object.entries(routePermissions).find(([r, p]) => hasPermission(p));
    if (allowed) {
      showToast('Bạn không có quyền truy cập trang này.', 'error');
      window.location.hash = '#' + allowed[0];
    } else {
      showToast('Tài khoản của bạn không có quyền truy cập trang quản trị.', 'error');
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
      clearAdminCookie();
      init();
    }
    return;
  }

  // Close mobile sidebar on route change
  const aside = document.getElementById('admin-sidebar-aside');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  if (aside && backdrop) {
    aside.classList.add('-translate-x-full');
    aside.classList.remove('translate-x-0');
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('hidden');
  }

  renderSidebar(appState.sidebarEl, baseRoute);
  const title = route.startsWith('orders/') 
    ? 'Order Details' 
    : route.startsWith('members/') 
      ? 'Customer Details' 
      : (route.startsWith('products/') && route !== 'products')
        ? (route === 'products/new' ? 'Add New Product' : 'Product Details & Analytics')
        : (routeTitles[baseRoute] || 'Dashboard');
  renderTopbar(appState.topbarEl, title);
  renderContent(route, appState.contentEl);
}


function bindGlobalListeners() {
  if (appState.globalListenersBound) return;
  appState.globalListenersBound = true;

  document.addEventListener('admin:logout', () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
    clearAdminCookie();
    init();
  });

  document.addEventListener('admin:login', () => {
    init();
  });
}

function hasActiveDirtyFormsOnPage() {
  const draftKeys = Object.keys(localStorage).filter(k => k.startsWith('sly_draft_'));
  const isDirty = draftKeys.length > 0 || window.adminFormIsDirty;
  if (!isDirty) return false;

  // Check if there are active form/setting inputs on the page
  const forms = Array.from(document.querySelectorAll('form')).filter(f => f.id !== 'login-form');
  const settingsTab = document.querySelector('#tab-content');
  
  // If there are no forms and no settings tab present, then the form/edit view is gone (e.g. closed), so it's not dirty anymore!
  if (forms.length === 0 && !settingsTab && draftKeys.length === 0) {
    window.adminFormIsDirty = false;
    return false;
  }
  
  return true;
}

function saveGenericFormDraft(form) {
  if (!form || !form.id || form.id === 'login-form' || form.id === 'product-form') return;
  
  const state = {};
  form.querySelectorAll('input, select, textarea').forEach(el => {
    if (!el.name || el.type === 'password' || el.type === 'file') return;
    
    // Ignore search inputs or filter fields
    const isSearchOrFilter = el.closest('[id*="search"], [class*="search"], [id*="filter"], [class*="filter"]') || 
                             el.id.includes('search') || el.className.includes('search') ||
                             el.id.includes('filter') || el.className.includes('filter');
    
    if (isSearchOrFilter) return;

    if (el.type === 'checkbox') {
      state[el.name] = el.checked;
    } else if (el.type === 'radio') {
      if (el.checked) {
        state[el.name] = el.value;
      }
    } else {
      state[el.name] = el.value;
    }
  });

  localStorage.setItem('sly_draft_form_' + form.id, JSON.stringify(state));
}

function restoreGenericFormDraft(form) {
  if (!form || !form.id || form.id === 'login-form' || form.id === 'product-form') return;
  
  const draftStr = localStorage.getItem('sly_draft_form_' + form.id);
  if (!draftStr) return;
  
  try {
    const state = JSON.parse(draftStr);
    let restoredCount = 0;
    
    form.querySelectorAll('input, select, textarea').forEach(el => {
      if (!el.name || el.type === 'password' || el.type === 'file') return;
      if (state[el.name] === undefined) return;
      
      if (el.type === 'checkbox') {
        el.checked = !!state[el.name];
        restoredCount++;
      } else if (el.type === 'radio') {
        el.checked = (el.value === state[el.name]);
        if (el.checked) restoredCount++;
      } else {
        el.value = state[el.name];
        restoredCount++;
      }
      
      // Trigger input and change events programmatically
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    if (restoredCount > 0) {
      window.adminFormIsDirty = true;
      setTimeout(() => {
        showToast('Đã tự động khôi phục bản nháp chưa lưu của biểu mẫu này!', 'success');
      }, 150);
    }
  } catch (e) {
    console.error('Failed to restore draft for form ' + form.id, e);
  }
}

function initDirtyFormTracker() {
  window.adminFormIsDirty = false;

  // Listen for user input on any form field or settings field
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (!target) return;
    
    // Ignore search inputs or filter fields
    const isSearchOrFilter = target.closest('[id*="search"], [class*="search"], [id*="filter"], [class*="filter"]') || 
                             target.id.includes('search') || target.className.includes('search') ||
                             target.id.includes('filter') || target.className.includes('filter');
    
    if (isSearchOrFilter) return;

    // Check if it's inside a form or settings tab content
    const inForm = target.closest('form');
    const inSettingsTab = target.closest('#tab-content');

    if ((inForm && inForm.id !== 'login-form') || inSettingsTab) {
      window.adminFormIsDirty = true;
      if (inForm) {
        saveGenericFormDraft(inForm);
      }
    }
  });

  document.addEventListener('change', (e) => {
    const target = e.target;
    if (!target) return;

    const isSearchOrFilter = target.closest('[id*="search"], [class*="search"], [id*="filter"], [class*="filter"]') || 
                             target.id.includes('search') || target.className.includes('search') ||
                             target.id.includes('filter') || target.className.includes('filter');

    if (isSearchOrFilter) return;

    const inForm = target.closest('form');
    const inSettingsTab = target.closest('#tab-content');

    if ((inForm && inForm.id !== 'login-form') || inSettingsTab) {
      window.adminFormIsDirty = true;
      if (inForm) {
        saveGenericFormDraft(inForm);
      }
    }
  });

  // If a form is submitted, reset the dirty flag
  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id !== 'login-form') {
      window.adminFormIsDirty = false;
      if (e.target.id) {
        localStorage.removeItem('sly_draft_form_' + e.target.id);
      }
    }
  });

  // Global capturing listener to intercept Escape key / F4 when form is dirty
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Escape' || e.key === 'F4') && window.adminFormIsDirty) {
      if (document.getElementById('pf-unsaved-changes-modal')) return;
      const activeForm = Array.from(document.querySelectorAll('form')).find(f => f.id !== 'login-form');
      if (activeForm) {
        e.stopPropagation();
        e.preventDefault();

        showUnsavedChangesModal({
          onSave: () => {
            const submitBtn = activeForm.querySelector('button[type="submit"]') || activeForm.querySelector('[id*="submit"]') || activeForm.querySelector('[id*="save"]');
            if (submitBtn) {
              submitBtn.click();
            } else {
              activeForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          },
          onDiscard: () => {
            if (activeForm.id) {
              localStorage.removeItem('sly_draft_form_' + activeForm.id);
            }
            window.adminFormIsDirty = false;
            // Find and click the close or cancel button on this modal
            const closeBtn = activeForm.closest('div')?.querySelector('[id*="close"], [id*="cancel"]');
            if (closeBtn) {
              closeBtn.click();
            } else {
              // fallback: remove parent overlay
              activeForm.closest('.fixed')?.remove();
            }
          },
          onCancel: () => {}
        });
      }
    }
  }, true);

  // Global capturing listener to intercept close clicks / backdrop clicks when form is dirty
  document.addEventListener('click', (e) => {
    if (!window.adminFormIsDirty) return;
    if (e.target.closest('#pf-unsaved-changes-modal')) return;

    // Check if target is a close/cancel button or backdrop click
    const isCloseBtn = e.target.closest('[id*="close"], [id*="cancel"], [class*="close"], [class*="cancel"]');
    const isBackdrop = e.target.classList.contains('fixed') && (e.target.classList.contains('bg-black/50') || e.target.classList.contains('bg-black/60'));

    if (isCloseBtn || isBackdrop) {
      const activeForm = Array.from(document.querySelectorAll('form')).find(f => f.id !== 'login-form');
      if (activeForm) {
        e.stopPropagation();
        e.preventDefault();

        const targetElement = e.target;

        showUnsavedChangesModal({
          onSave: () => {
            const submitBtn = activeForm.querySelector('button[type="submit"]') || activeForm.querySelector('[id*="submit"]') || activeForm.querySelector('[id*="save"]');
            if (submitBtn) {
              submitBtn.click();
            } else {
              activeForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          },
          onDiscard: () => {
            if (activeForm.id) {
              localStorage.removeItem('sly_draft_form_' + activeForm.id);
            }
            window.adminFormIsDirty = false;
            targetElement.click(); // Re-trigger the click event which will now bypass this capturing handler
          },
          onCancel: () => {}
        });
      }
    }
  }, true);
}

let lastHash = window.location.hash;

function onHashChange(e) {
  const isDirty = hasActiveDirtyFormsOnPage();
  
  if (isDirty) {
    const currentRoute = getCurrentRoute();
    const lastRoute = lastHash.replace('#', '');
    
    // Only prompt if they are navigating to a different main route
    if (currentRoute !== lastRoute) {
      const targetHash = window.location.hash;

      // Revert hash temporarily to keep page active
      window.removeEventListener('hashchange', onHashChange);
      window.location.hash = lastHash;
      setTimeout(() => {
        window.addEventListener('hashchange', onHashChange);
      }, 50);

      showUnsavedChangesModal({
        onSave: () => {
          const form = document.querySelector('#admin-content form') || document.getElementById('product-form');
          if (form) {
            window.pendingNavigationTarget = targetHash;
            const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('#pf-submit') || form.querySelector('[id*="submit"]') || form.querySelector('[id*="save"]');
            if (submitBtn) {
              submitBtn.click();
            } else {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          } else {
            // For settings with no form but a save all button
            const saveSettingsBtn = document.getElementById('save-all-settings');
            if (saveSettingsBtn) {
              window.pendingNavigationTarget = targetHash;
              saveSettingsBtn.click();
            } else {
              // Fallback
              window.adminFormIsDirty = false;
              window.location.hash = targetHash;
            }
          }
        },
        onDiscard: () => {
          const draftKeys = Object.keys(localStorage).filter(k => k.startsWith('sly_draft_'));
          draftKeys.forEach(k => localStorage.removeItem(k));
          window.adminFormIsDirty = false;
          window.location.hash = targetHash;
        },
        onCancel: () => {
          // Stay on current page, hash is already reverted
        }
      });
      return;
    }
  }
  
  lastHash = window.location.hash;
  renderRoute();
}

function initFormDraftObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const forms = node.tagName === 'FORM' ? [node] : Array.from(node.querySelectorAll('form'));
        forms.forEach(form => {
          restoreGenericFormDraft(form);
        });
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Also check existing forms immediately
  document.querySelectorAll('form').forEach(form => {
    restoreGenericFormDraft(form);
  });
}

function bindListeners() {
  if (appState.listenersBound) return;
  appState.listenersBound = true;

  initDirtyFormTracker();
  initFormDraftObserver();
  window.addEventListener('hashchange', onHashChange);
  
  window.addEventListener('beforeunload', (e) => {
    if (hasActiveDirtyFormsOnPage()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

function mountAdminApp(root) {
  root.innerHTML = `
    <div class="flex h-screen overflow-hidden">
      <div id="admin-sidebar" class="flex-shrink-0"></div>
      <div class="flex flex-col flex-1 overflow-hidden">
        <div id="admin-topbar"></div>
        <main id="admin-content" class="flex-1 overflow-y-auto bg-transparent p-4 lg:p-6"></main>
      </div>
    </div>
  `;

  appState.root = root;
  appState.sidebarEl = root.querySelector('#admin-sidebar');
  appState.topbarEl = root.querySelector('#admin-topbar');
  appState.contentEl = root.querySelector('#admin-content');

  bindListeners();
  renderRoute();
}

async function verifyToken(token) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Authorization': `Bearer ${token}`
      },
    });
    return {
      valid: res.ok || res.status === 200,
      status: res.status
    };
  } catch {
    return { valid: false, status: 0 };
  }
}

async function init() {
  const root = document.getElementById('admin-root');
  if (!root) return;

  bindGlobalListeners();

  const token = getToken();
  if (!token) {
    renderLogin(root);
    return;
  }

  const { valid, status } = await verifyToken(token);
  if (!valid) {
    if (status === 401 || status === 403) {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
      clearAdminCookie();
      renderLogin(root);
      if (status === 403) {
        showToast('Tài khoản của bạn không có quyền truy cập trang quản trị.', 'error');
      } else {
        showToast('Phiên đăng nhập đã hết hạn hoặc không hợp lệ.', 'warning');
      }
    } else {
      // Network or transient server error (status 0 or 500+)
      showToast('Không thể kết nối tới máy chủ. Đang hiển thị ứng dụng ngoại tuyến.', 'warning');
      mountAdminApp(root);
    }
    return;
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `sly_admin_auth_token=${token}; path=/; max-age=604800; SameSite=Lax${secure}`;
  
  // Fetch settings before mounting
  try {
    const res = await fetch(`${API_BASE}/api/settings?t=${Date.now()}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        window.APP_SETTINGS = json.data;
      }
    }
  } catch (err) {
    console.error('Failed to load settings on admin init:', err);
  }

  mountAdminApp(root);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
