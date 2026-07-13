import { absoluteUrl } from './head.js';

function stripHtml(value = '') {
  return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function firstImage(product = {}) {
  const images = [
    product.image_url,
    product.image,
    product.thumbnail,
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(Boolean);
  return images[0] || '';
}

export function organizationSchema(settings = {}) {
  const name = settings.brand_name || 'Thương hiệu';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: absoluteUrl('/', settings),
    logo: settings.logo_url ? absoluteUrl(settings.logo_url, settings) : undefined
  };
}

export function websiteSchema(settings = {}) {
  const name = settings.brand_name || 'Thương hiệu';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: absoluteUrl('/', settings),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/products', settings)}?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function breadcrumbSchema(items = [], settings = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url || item.path || '/', settings)
    }))
  };
}

export function itemListSchema(items = [], settings = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(item.url || `/product/${item.slug || item.id}`, settings),
      name: item.name || item.title
    }))
  };
}

export function productSchema(product = {}, settings = {}) {
  const name = product.name || product.title || '';
  const image = firstImage(product);
  const price = product.base_price || product.price || product.sale_price || product.original_price || '';
  const description = stripHtml(
    product.meta_description
    || product.short_description
    || product.description
    || name
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image ? [absoluteUrl(image, settings)] : undefined,
    sku: product.sku || undefined,
    brand: product.brand?.name || product.brand_name
      ? {
          '@type': 'Brand',
          name: product.brand?.name || product.brand_name
        }
      : undefined,
    offers: price
      ? {
          '@type': 'Offer',
          priceCurrency: 'VND',
          price: String(price),
          availability: Number(product.stock_quantity || 0) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: absoluteUrl(`/product/${product.slug || product.id}`, settings)
        }
      : undefined
  };
}
