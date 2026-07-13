/**
 * router.js — Client-side SPA router for Đồng Hồ Anh Tuấn
 */
import { navigate } from './helpers.js';
import { trackPageView } from '../services/userTracker.js';
import { applyDefaultHead } from '../seo/head.js';
import { canonicalPathForLocation, robotsForLocation } from '../seo/urlMap.js';

const routes = [
  { path: '/', component: () => import('../pages/Home/index.js?v=1.0.94') },
  { path: '/admin/template', component: () => import('../pages/Home/index.js?v=1.0.94') },
  { path: '/products', component: () => import('../pages/ProductList/index.js?v=1.0.92') },
  { path: '/cart', component: () => import('../pages/Cart/index.js?v=1.0.93') },
  { path: '/checkout/result', component: () => import('../pages/Checkout/PaymentResult.js?v=1.0.0') },
  { path: '/checkout', component: () => import('../pages/Checkout/index.js?v=1.0.93') },
  { path: '/account', component: () => import('../pages/Account/index.js?v=1.0.92') },
  { path: '/welcome', component: () => import('../pages/Welcome/index.js?v=1.0.92') },
  { path: '/product/:slug', component: () => import('../pages/ProductDetail/index.js?v=1.0.92') },
  { path: '/policies/:slug', component: () => import('../pages/Policies/index.js?v=1.0.92') },
  { path: '/member/:tab', component: () => import('../pages/Member/index.js?v=1.0.92') },
  { path: '/member-online', component: () => import('../pages/Member/index.js?v=1.0.92'), params: { tab: 'online' } }
];

function matchRoute(pathname) {
  for (const route of routes) {
    if (route.path === pathname) {
      return { route, params: route.params || {} };
    }
    // Dynamic segments like :slug
    const routeParts = route.path.split('/');
    const pathParts = pathname.split('/');
    if (routeParts.length !== pathParts.length) continue;
    const params = {};
    let matched = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (routeParts[i] !== pathParts[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params: { ...(route.params || {}), ...params } };
  }
  return null;
}

let _mainNavbar = null;
let _mainFooter = null;

export async function initRouter() {
  // Lazy-load persistent layout components
  const [{ MainNavbar }, { MainFooter }] = await Promise.all([
    import('../components/MainNavbar.js?v=1.0.96'),
    import('../components/MainFooter.js?v=1.0.92'),
  ]);
  _mainNavbar = new MainNavbar();
  _mainFooter = new MainFooter();

  window.addEventListener('popstate', handleRoute);
  await handleRoute();
}

let routeSeq = 0;

async function handleRoute() {
  routeSeq++;
  const localSeq = routeSeq;

  const pathname = window.location.pathname;

  // Toggle page-account class on body for layout customizations
  if (pathname === '/account') {
    document.body.classList.add('page-account');
  } else {
    document.body.classList.remove('page-account');
  }

  // Toggle page-home class on body for layout customizations
  if (pathname === '/' || pathname === '/admin/template') {
    document.body.classList.add('page-home');
  } else {
    document.body.classList.remove('page-home');
  }

  // Redirect /admin to admin panel (except preview template route)
  if ((pathname.startsWith('/admin') && pathname !== '/admin/template') || pathname.startsWith('/dong-ho-a-tuan/admin')) {
    const prefix = pathname.startsWith('/dong-ho-a-tuan/') ? '/dong-ho-a-tuan' : '';
    window.location.href = `${prefix}/admin/`;
    return;
  }

  const match = matchRoute(pathname);
  const app = document.getElementById('app');
  if (!app) return;

  // Show loading skeleton
  app.innerHTML = `
    <div style="max-width:1280px; margin:0 auto; padding: 100px 24px 40px 24px;" class="space-y-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-6 mb-8">
        <div class="skeleton-shimmer h-4 w-32" style="height: 16px; width: 128px;"></div>
        <div class="flex gap-4">
          <div class="skeleton-shimmer h-6 w-24" style="height: 24px; width: 96px;"></div>
          <div class="skeleton-shimmer h-6 w-32" style="height: 24px; width: 128px;"></div>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="skeleton-shimmer aspect-[3/4]" style="aspect-ratio: 3/4; width: 100%;"></div>
        <div class="skeleton-shimmer aspect-[3/4]" style="aspect-ratio: 3/4; width: 100%;"></div>
        <div class="skeleton-shimmer aspect-[3/4]" style="aspect-ratio: 3/4; width: 100%;"></div>
        <div class="skeleton-shimmer aspect-[3/4]" style="aspect-ratio: 3/4; width: 100%;"></div>
      </div>
    </div>`;

  if (!match) {
    renderNotFound(app);
    return;
  }

  const isEcommerce = window.APP_SETTINGS?.is_ecommerce !== 0;
  if (!isEcommerce && (pathname === '/cart' || pathname === '/checkout' || pathname === '/checkout/result')) {
    navigate('/');
    return;
  }

  try {
    const mod = await match.route.component();
    if (localSeq !== routeSeq) return; // Bỏ qua nếu đã có lệnh chuyển trang mới hơn

    const PageClass = mod.default || mod[Object.keys(mod)[0]];

    app.innerHTML = '';

    // Navbar
    const navEl = _mainNavbar.render();
    app.appendChild(navEl);

    // Page content wrapper
    const pageWrapper = document.createElement('div');
    pageWrapper.className = 'page-enter';
    pageWrapper.id = 'page-content';
    app.appendChild(pageWrapper);

    applyDefaultHead({
      canonicalPath: canonicalPathForLocation(),
      robots: robotsForLocation(window.APP_SETTINGS || {})
    }, window.APP_SETTINGS || {});

    // Mount page
    const page = new PageClass(match.params);
    const pageEl = await page.render();
    if (localSeq !== routeSeq) return; // Bỏ qua nếu đã có lệnh chuyển trang mới hơn

    if (pageEl) pageWrapper.appendChild(pageEl);

    // Footer (skip on homepage)
    if (match.route.path !== '/') {
      const footerEl = _mainFooter.render();
      app.appendChild(footerEl);
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Re-init navbar cart count
    _mainNavbar.updateCartCount();

    // Track user page view (for logged-in users)
    trackPageView(pathname);

    // Dispatch page-rendered event to activate reveals and lazy loading
    window.dispatchEvent(new CustomEvent('page-rendered'));
  } catch (err) {
    if (localSeq !== routeSeq) return; // Bỏ qua nếu đã có lệnh chuyển trang mới hơn
    console.error('[Router] Error rendering page:', err);
    renderError(app, err);
  }
}

function renderNotFound(app) {
  app.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:16px;font-family:Montserrat,sans-serif;">
      <h1 style="font-size:72px;font-weight:800;color:var(--color-accent-gold);margin:0;">404</h1>
      <p style="font-size:18px;color:#1a1a1a;margin:0;">Trang không tồn tại.</p>
      <a href="/" onclick="event.preventDefault();history.pushState({},'','/');window.dispatchEvent(new PopStateEvent('popstate'));"
         style="margin-top:8px;padding:12px 32px;border:2px solid #1a1a1a;font-weight:600;letter-spacing:1.2px;text-decoration:none;color:#1a1a1a;transition:all .2s;"
         onmouseover="this.style.background='#1a1a1a';this.style.color='#fff'"
         onmouseout="this.style.background='';this.style.color='#1a1a1a'">
        VỀ TRANG CHỦ
      </a>
    </div>`;
}

function renderError(app, err) {
  app.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:16px;font-family:Montserrat,sans-serif;">
      <h2 style="font-size:24px;font-weight:700;color:#c0392b;">Đã xảy ra lỗi</h2>
      <p style="color:#888;max-width:400px;text-align:center;">${err.message || 'Vui lòng thử lại sau.'}</p>
      <button onclick="window.location.reload()"
        style="padding:12px 32px;background:#1a1a1a;color:#fff;border:none;font-weight:600;letter-spacing:1.2px;cursor:pointer;">
        THỬ LẠI
      </button>
    </div>`;
}

export { navigate };
