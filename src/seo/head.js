const MANAGED_SCHEMA_ATTR = 'data-sly-managed-schema';

function ensureMeta(selector, attrs) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement('meta');
    document.head.appendChild(node);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      node.removeAttribute(key);
    } else {
      node.setAttribute(key, String(value));
    }
  });

  return node;
}

function ensureLink(rel, href) {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    node?.remove();
    return null;
  }

  if (!node) {
    node = document.createElement('link');
    node.rel = rel;
    document.head.appendChild(node);
  }
  node.href = href;
  return node;
}

function normalizeSiteUrl(settings = {}) {
  const configured = settings.site_url || settings.website_url || settings.project_domain || '';
  if (!configured) return window.location.origin;
  if (/^https?:\/\//i.test(configured)) return configured.replace(/\/+$/, '');
  return `https://${configured.replace(/^\/+|\/+$/g, '')}`;
}

export function absoluteUrl(pathOrUrl = '/', settings = window.APP_SETTINGS || {}) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const siteUrl = normalizeSiteUrl(settings);
  try {
    return new URL(String(pathOrUrl || '/'), `${siteUrl}/`).href;
  } catch {
    const path = String(pathOrUrl || '/');
    return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

export function defaultSeo(settings = window.APP_SETTINGS || {}, location = window.location) {
  const brand = settings.brand_name || 'Thương hiệu';
  const description = settings.website_description
    || settings.meta_description
    || settings.description
    || `${brand} — Only Sell Online`;

  return {
    title: `${brand} — Only Sell Online`,
    description,
    canonicalPath: location.pathname || '/',
    robots: settings.search_engine_indexing === 0 ? 'noindex, follow' : 'index, follow',
    openGraph: {
      title: `${brand} — Only Sell Online`,
      description,
      image: settings.og_image_url || settings.logo_url || settings.favicon_url || '',
      type: 'website'
    },
    schemas: []
  };
}

export function applyHeadMetadata(metadata = {}, settings = window.APP_SETTINGS || {}) {
  const title = metadata.title || defaultSeo(settings).title;
  const description = metadata.description || '';
  const canonical = metadata.canonical || absoluteUrl(metadata.canonicalPath || window.location.pathname || '/', settings);
  const robots = metadata.robots || 'index, follow';
  const openGraph = metadata.openGraph || {};

  document.title = title;

  if (description) {
    ensureMeta('meta[name="description"]', { name: 'description', content: description });
  }
  ensureMeta('meta[name="robots"]', { name: 'robots', content: robots });
  ensureLink('canonical', canonical);

  ensureMeta('meta[property="og:title"]', { property: 'og:title', content: openGraph.title || title });
  if (description || openGraph.description) {
    ensureMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: openGraph.description || description
    });
  }
  ensureMeta('meta[property="og:type"]', { property: 'og:type', content: openGraph.type || 'website' });
  ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
  if (openGraph.image) {
    ensureMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: absoluteUrl(openGraph.image, settings)
    });
  }

  document.head.querySelectorAll(`script[${MANAGED_SCHEMA_ATTR}]`).forEach((script) => script.remove());
  (metadata.schemas || []).filter(Boolean).forEach((schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(MANAGED_SCHEMA_ATTR, 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

export function applyDefaultHead(overrides = {}, settings = window.APP_SETTINGS || {}, location = window.location) {
  applyHeadMetadata({
    ...defaultSeo(settings, location),
    ...overrides,
    openGraph: {
      ...defaultSeo(settings, location).openGraph,
      ...(overrides.openGraph || {})
    }
  }, settings);
}

export function applyFavicon(faviconUrl) {
  if (!faviconUrl) return;
  let faviconLink = document.querySelector("link[rel~='icon']");
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }
  faviconLink.href = faviconUrl;
}
