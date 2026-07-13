const NOINDEX_PATHS = [
  '/admin',
  '/cart',
  '/checkout',
  '/checkout/result',
  '/account',
  '/welcome',
  '/member',
  '/member-online',
  '/login',
  '/register'
];

const FACET_PARAMS = [
  'search',
  'q',
  'sort',
  'price_min',
  'price_max',
  'voucher'
];

export function canonicalPathForLocation(location = window.location) {
  const pathname = location.pathname || '/';
  const params = new URLSearchParams(location.search || '');

  if (pathname === '/products') {
    const canonicalParams = new URLSearchParams();
    const category = params.get('category_slug') || params.get('subcategory_slug');
    const page = params.get('page');

    if (category) {
      canonicalParams.set(params.get('category_slug') ? 'category_slug' : 'subcategory_slug', category);
    }
    if (page && page !== '1') {
      canonicalParams.set('page', page);
    }

    const query = canonicalParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return pathname || '/';
}

export function shouldNoindexLocation(settings = {}, location = window.location) {
  if (settings.search_engine_indexing === 0) return true;

  const pathname = location.pathname || '/';
  if (NOINDEX_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true;
  }

  const params = new URLSearchParams(location.search || '');
  return FACET_PARAMS.some((name) => params.has(name));
}

export function robotsForLocation(settings = {}, location = window.location) {
  return shouldNoindexLocation(settings, location) ? 'noindex, follow' : 'index, follow';
}
