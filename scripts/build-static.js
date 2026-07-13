const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");
const siteUrl = normalizeSiteUrl(process.env.SITE_URL || "https://quatangtinhte.vn");
const apiBase = normalizeBuildApiBase(process.env.API_BASE || "");

const files = [
  "index.html",
  "collection.html",
  "product.html",
  "cart.html",
  "login.html",
  "register.html",
  "about.html",
  "contact.html",
  "policy-purchase.html",
  "policy-shipping.html",
  "policy-payment.html",
  "policy-return.html",
  "policy-refund.html",
  "policy-privacy.html",
  "index.css",
  "static-client.js",
];

const directories = ["data", "public"];

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });

  if (/\.(html|js|css|txt|xml)$/i.test(relativePath)) {
    const content = fs.readFileSync(source, "utf8");
    fs.writeFileSync(target, applyBuildReplacements(content), "utf8");
    return;
  }

  fs.copyFileSync(source, target);
}

function copyDirectory(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, relativePath);
  fs.cpSync(source, target, {
    recursive: true,
    filter: (entry) => !entry.endsWith(path.join("public", "color_extractor.html")),
  });
}

fs.rmSync(outDir, { force: true, recursive: true });
fs.mkdirSync(outDir, { recursive: true });

files.forEach(copyFile);
directories.forEach(copyDirectory);
const products = loadProductsData();
const collectionGroups = categoryGroups(products);
writeProductPages(products);
writeCollectionPages(collectionGroups);
writeCollectionIndexPage(products);
writeHomePage(products, collectionGroups);
writePleskHtaccess();
writeRobotsTxt();
writeSitemapXml(products, collectionGroups);

console.log(`Static site copied to ${path.relative(root, outDir)}`);
console.log(`Plesk assets generated for ${siteUrl}`);
console.log(apiBase ? `API base locked to ${apiBase}` : "API base uses runtime default /backend/public");
console.log(`Pre-rendered ${products.filter(productSlug).length} product pages`);
console.log(`Pre-rendered ${collectionGroups.length} category pages`);
console.log(`Pre-rendered collection index with ${products.filter(productSlug).length} products`);
console.log(`Pre-rendered homepage product links`);

function normalizeSiteUrl(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) return "https://quatangtinhte.vn";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function applyBuildReplacements(content) {
  return content
    .replace(/https:\/\/quatangtinhte\.vn/g, siteUrl)
    .replace(/__API_BASE__/g, apiBase || "__API_BASE__");
}

function normalizeBuildApiBase(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(value = "", max = 160) {
  const text = stripHtml(value);
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function formatVnd(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(number);
}

function loadProductsData() {
  const file = path.join(root, "data", "products.js");
  if (!fs.existsSync(file)) return [];

  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox, {
    filename: "data/products.js",
    timeout: 1000,
  });

  return Array.isArray(sandbox.window.PRODUCTS_DATA)
    ? sandbox.window.PRODUCTS_DATA
    : [];
}

function productSlug(product) {
  if (product.slug) return product.slug;
  const source = String(product.sourceUrl || "");
  if (source.includes("/products/")) {
    return source.split("/products/")[1].split(/[?#/]/)[0];
  }
  return "";
}

function slugifySegment(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function productCategory(product) {
  return product.category || product.category_name || "Sản phẩm";
}

function categorySlug(product) {
  return slugifySegment(product.categorySlug || product.category_slug || productCategory(product));
}

function collectionPath(slug) {
  return `/collections/${encodeURIComponent(slug)}/`;
}

function categoryLinkHtml(product) {
  const category = productCategory(product);
  const slug = categorySlug(product);
  if (!slug) return `<span>${escapeHtml(category)}</span>`;

  return `<a href="${escapeHtml(collectionPath(slug))}" style="color: inherit; text-decoration: none;">${escapeHtml(category)}</a>`;
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function insertJsonLd(html, id, schema) {
  const script = `\t\t<script id="${id}" type="application/ld+json">${JSON.stringify(schema)}</script>\n`;
  const existing = new RegExp(`\\s*<script\\s+id="${id}"[\\s\\S]*?<\\/script>\\s*`, "i");
  if (existing.test(html)) return html.replace(existing, `\n${script}`);
  return html.replace(/<\/head>/i, `${script}\t</head>`);
}

function productBreadcrumbSchema(product, canonical) {
  const slug = categorySlug(product);
  const categoryUrl = slug ? `${siteUrl}${collectionPath(slug)}` : `${siteUrl}/collection.html`;

  return breadcrumbSchema([
    { name: "Trang chủ", url: `${siteUrl}/` },
    { name: "Bộ sưu tập", url: `${siteUrl}/collection.html` },
    { name: productCategory(product), url: categoryUrl },
    { name: product.title, url: canonical },
  ]);
}

function collectionBreadcrumbSchema(group, canonical) {
  const items = [
    { name: "Trang chủ", url: `${siteUrl}/` },
    { name: "Bộ sưu tập", url: `${siteUrl}/collection.html` },
  ];

  if (group) {
    items.push({ name: group.name, url: canonical });
  }

  return breadcrumbSchema(items);
}

function categoryGroups(products = []) {
  const groups = new Map();

  products.forEach((product) => {
    const name = productCategory(product);
    const slug = categorySlug(product);
    if (!slug) return;

    if (!groups.has(slug)) {
      groups.set(slug, {
        slug,
        name,
        products: [],
      });
    }

    groups.get(slug).products.push(product);
  });

  return [...groups.values()]
    .filter((group) => group.products.some(productSlug))
    .sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }));
}

function productImage(product) {
  if (product.imageUrl) return product.imageUrl;
  if (product.image_url) return product.image_url;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  return "public/images/slider_1.png";
}

function productPrices(product) {
  return (Array.isArray(product.variants) ? product.variants : [])
    .map((variant) => Number(variant.price || 0))
    .filter((price) => Number.isFinite(price) && price > 0);
}

function productDescriptionHtml(product) {
  const raw = product.description || product.metaDescription || product.title || "";
  return String(raw)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function productSchema(product, slug, canonical) {
  const prices = productPrices(product);
  const lowPrice = prices.length ? Math.min(...prices) : undefined;
  const highPrice = prices.length ? Math.max(...prices) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.metaTitle || product.title,
    image: [productImage(product)],
    description: product.metaDescription || truncate(product.description || product.title),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    sku: product.variants?.[0]?.sku || slug,
    offers: prices.length
      ? {
          "@type": prices.length > 1 ? "AggregateOffer" : "Offer",
          priceCurrency: "VND",
          lowPrice,
          highPrice,
          price: prices.length === 1 ? lowPrice : undefined,
          offerCount: prices.length,
          availability: "https://schema.org/InStock",
          url: canonical,
        }
      : undefined,
  };
}

function replaceOrInsertMetaProperty(html, property, content) {
  const escapedContent = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]*"\\s*\\/?>`, "i");
  const meta = `<meta property="${property}" content="${escapedContent}" />`;
  if (pattern.test(html)) return html.replace(pattern, meta);
  return html.replace(/(<meta\s+property="og:type"[^>]*>\s*)/i, `$1\n\t\t${meta}\n\t\t`);
}

function buildProductInitialHtml(product, slug) {
  const image = productImage(product);
  const prices = productPrices(product);
  const priceLine = prices.length
    ? prices.length === 1
      ? formatVnd(prices[0])
      : `${formatVnd(Math.min(...prices))} - ${formatVnd(Math.max(...prices))}`
    : "Liên hệ";
  const variants = (Array.isArray(product.variants) ? product.variants : []).slice(0, 6);

  return `
				<div id="product-container" class="product-detail" aria-live="polite" data-prerendered="true" data-product-slug="${escapeHtml(slug)}">
					<section class="detail-gallery" aria-label="Ảnh sản phẩm">
						<div id="media-viewport">
							<img src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}" width="900" height="900" fetchpriority="high" />
						</div>
					</section>
					<section class="detail-info" aria-labelledby="product-title">
						<div class="product-summary">
							<p class="eyebrow">${escapeHtml(product.category || "Sản phẩm pha lê")}</p>
							<h1 id="product-title">${escapeHtml(product.title)}</h1>
							<p class="product-meta-line">
								<span>${escapeHtml(product.brand || "Quà Tặng Tinh Tế")}</span>
								<span>${escapeHtml(product.variants?.[0]?.sku || slug)}</span>
							</p>
							<div class="price-display-wrapper">
								<strong class="detail-price">${escapeHtml(priceLine)}</strong>
							</div>
							<p class="stock-status"><span class="stock-dot"></span>Còn hàng</p>
						</div>
						${variants.length ? `
						<div class="variant-list" aria-label="Biến thể sản phẩm">
							${variants.map((variant) => `
							<div class="variant-group">
								<p class="variant-label">${escapeHtml(variant.title || variant.sku || "Tùy chọn")} <strong>${formatVnd(variant.price)}</strong></p>
							</div>`).join("")}
						</div>` : ""}
						<div class="product-description">
							${productDescriptionHtml(product)}
						</div>
					</section>
				</div>`;
}

function buildProductBreadcrumbHtml(product) {
  const category = productCategory(product);
  const slug = categorySlug(product);
  const categoryHref = slug ? collectionPath(slug) : "/collection.html";

  return `<nav class="breadcrumb" aria-label="Breadcrumb" style="font-family: 'Quicksand', sans-serif; font-size: 0.88rem; font-weight: 600; margin-bottom: 24px; color: #64748b; display: flex; align-items: center; gap: 8px;">
					<a href="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-house" style="font-size: 0.8rem;"></i> Trang chủ</a>
					<span>/</span>
					<a href="/collection.html" style="text-decoration: none; color: inherit;">Sản phẩm</a>
					<span>/</span>
					<span id="breadcrumb-category" style="color: inherit; display: flex; align-items: center; gap: 8px;"><a href="${escapeHtml(categoryHref)}" style="text-decoration: none; color: inherit;">${escapeHtml(category)}</a> <span>/</span> <span style="color: var(--brand-700); font-weight: 700;">${escapeHtml(product.title)}</span></span>
				</nav>`;
}

function buildCollectionBreadcrumbHtml(group) {
  const current = group
    ? `<a href="/collection.html" style="text-decoration: none; color: inherit;">Bộ sưu tập</a>
					<span>/</span>
					<span style="color: var(--brand-700); font-weight: 700;">${escapeHtml(group.name)}</span>`
    : `<span style="color: var(--brand-700); font-weight: 700;">Bộ sưu tập</span>`;

  return `<nav class="breadcrumb" aria-label="Breadcrumb" style="font-family: 'Quicksand', sans-serif; font-size: 0.88rem; font-weight: 600; margin-bottom: 24px; color: #64748b; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<a href="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 4px;">
						<i class="fa-solid fa-house" aria-hidden="true" style="font-size: 0.8rem;"></i>
						Trang chủ
					</a>
					<span>/</span>
					${current}
				</nav>`;
}

function buildCollectionProductCard(product) {
  const slug = productSlug(product);
  if (!slug) return "";

  const detailUrl = `/products/${encodeURIComponent(slug)}/`;
  const image = productImage(product);
  const prices = productPrices(product);
  const priceLine = prices.length
    ? prices.length === 1
      ? formatVnd(prices[0])
      : `${formatVnd(Math.min(...prices))} - ${formatVnd(Math.max(...prices))}`
    : "Liên hệ";
  const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;

  return `
							<article class="product-card">
								<a class="product-media" href="${escapeHtml(detailUrl)}" aria-label="Xem chi tiết ${escapeHtml(product.title)}">
									<img src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}" loading="lazy" referrerpolicy="no-referrer" />
								</a>
								<div class="product-body">
									<div class="product-meta">
										<span>${escapeHtml(product.brand || "Quà Tặng Tinh Tế")}</span>
										${categoryLinkHtml(product)}
										<span>${variantCount} lựa chọn</span>
									</div>
									<h3><a href="${escapeHtml(detailUrl)}">${escapeHtml(product.title)}</a></h3>
									<div class="price-line">
										<span>Giá từ</span>
										<strong>${escapeHtml(priceLine)}</strong>
									</div>
								</div>
							</article>`;
}

function buildHomeProductCard(product) {
  const slug = productSlug(product);
  if (!slug) return "";

  const detailUrl = `/products/${encodeURIComponent(slug)}/`;
  const image = productImage(product);
  const prices = productPrices(product);
  const priceLine = prices.length
    ? prices.length === 1
      ? formatVnd(prices[0])
      : `${formatVnd(Math.min(...prices))} - ${formatVnd(Math.max(...prices))}`
    : "Liên hệ";
  const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;

  return `
									<article class="product-card" style="position: relative;">
										<a class="product-media" href="${escapeHtml(detailUrl)}" aria-label="Xem chi tiết ${escapeHtml(product.title)}">
											<img src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}" loading="lazy" referrerpolicy="no-referrer" />
										</a>
										<div class="product-body">
											<div class="product-meta">
												<span>${escapeHtml(product.brand || "Quà Tặng Tinh Tế")}</span>
												${categoryLinkHtml(product)}
												<span>${variantCount} lựa chọn</span>
											</div>
											<h3><a href="${escapeHtml(detailUrl)}">${escapeHtml(product.title)}</a></h3>
											<div class="price-line">
												<span>Giá từ</span>
												<strong>${escapeHtml(priceLine)}</strong>
											</div>
											<div class="card-actions">
												<button class="button button-primary product-buy-now" type="button" data-product-id="${escapeHtml(product.id)}">
													<i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
													Mua ngay
												</button>
												<button class="button button-secondary product-add-cart" type="button" data-product-id="${escapeHtml(product.id)}" aria-label="Thêm ${escapeHtml(product.title)} vào giỏ hàng">
													<i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
												</button>
											</div>
										</div>
									</article>`;
}

function writeProductPages(products = []) {
  const templatePath = path.join(outDir, "product.html");
  if (!fs.existsSync(templatePath)) return;

  const template = fs.readFileSync(templatePath, "utf8");
  products.forEach((product) => {
    const slug = productSlug(product);
    if (!slug) return;

    const canonical = `${siteUrl}/products/${encodeURIComponent(slug)}/`;
    const title = `${product.metaTitle || product.title} - Quà Tặng Tinh Tế`;
    const description = product.metaDescription || truncate(product.description || product.title);
    const image = productImage(product);
    const schema = productSchema(product, slug, canonical);
    const breadcrumb = productBreadcrumbSchema(product, canonical);
    let html = template
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
      .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);

    html = replaceOrInsertMetaProperty(html, "og:title", product.title);
    html = replaceOrInsertMetaProperty(html, "og:description", description);
    html = replaceOrInsertMetaProperty(html, "og:image", image);
    html = replaceOrInsertMetaProperty(html, "og:url", canonical);
    html = html.replace(
      /<span id="breadcrumb-category"([^>]*)>[\s\S]*?<\/span>/i,
      `<span id="breadcrumb-category"$1>${categoryLinkHtml(product)} / ${escapeHtml(product.title)}</span>`
    );
    html = html.replace(
      /<nav class="breadcrumb"[\s\S]*?<\/nav>/i,
      buildProductBreadcrumbHtml(product)
    );
    html = html.replace(
      /<div id="product-container" class="product-detail" aria-live="polite">\s*<div class="empty-state">Đang tải chi tiết sản phẩm\.\.\.<\/div>\s*<\/div>/i,
      buildProductInitialHtml(product, slug)
    );
    html = insertJsonLd(html, "static-product-schema", schema);
    html = insertJsonLd(html, "static-product-breadcrumb-schema", breadcrumb);

    const targetDir = path.join(outDir, "products", slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
  });
}

function homeItemListSchema(products = []) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products
      .map((product) => ({ product, slug: productSlug(product) }))
      .filter((entry) => entry.slug)
      .slice(0, 12)
      .map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/products/${encodeURIComponent(entry.slug)}/`,
        name: entry.product.title,
      })),
  };
}

function collectionSchema(group, canonical) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${group.name} - Quà Tặng Tinh Tế`,
    url: canonical,
    description: group.description || `Bộ sưu tập ${group.name} gồm ${group.products.length} mẫu quà tặng pha lê khắc 3D.`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: group.products
        .map((product) => ({ product, slug: productSlug(product) }))
        .filter((entry) => entry.slug)
        .slice(0, 24)
        .map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/products/${encodeURIComponent(entry.slug)}/`,
          name: entry.product.title,
        })),
    },
  };
}

function writeCollectionPages(groups = []) {
  const templatePath = path.join(outDir, "collection.html");
  if (!fs.existsSync(templatePath)) return;

  const template = fs.readFileSync(templatePath, "utf8");

  groups.forEach((group) => {
    const canonical = `${siteUrl}/collections/${encodeURIComponent(group.slug)}/`;
    const title = `${group.name} - Quà Tặng Tinh Tế`;
    const description = truncate(
      `Khám phá ${group.products.length} mẫu ${group.name} trong bộ sưu tập pha lê khắc 3D, có nhiều kích thước và mức giá để chọn quà tặng phù hợp.`,
      155
    );
    const cardsHtml = group.products.map(buildCollectionProductCard).filter(Boolean).join("");
    const schema = collectionSchema(group, canonical);
    const breadcrumb = collectionBreadcrumbSchema(group, canonical);

    let html = template
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
      .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);

    html = replaceOrInsertMetaProperty(html, "og:title", title);
    html = replaceOrInsertMetaProperty(html, "og:description", description);
    html = replaceOrInsertMetaProperty(html, "og:url", canonical);
    html = replaceOrInsertMetaProperty(html, "og:image", productImage(group.products[0]));
    html = html.replace(
      /<script\s+type="application\/ld\+json">\s*[\s\S]*?<\/script>/i,
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    );
    html = insertJsonLd(html, "static-collection-breadcrumb-schema", breadcrumb);
    html = html.replace(
      /<nav class="breadcrumb"[\s\S]*?<\/nav>/i,
      buildCollectionBreadcrumbHtml(group)
    );
    html = html.replace(
      /<header class="collection-hero">([\s\S]*?)<h1>[\s\S]*?<\/h1>/i,
      `<header class="collection-hero">$1<h1>${escapeHtml(group.name)}</h1>`
    );
    html = html.replace(
      /<h2 id="collection-title">[\s\S]*?<\/h2>/i,
      `<h2 id="collection-title">${escapeHtml(group.name)}</h2>`
    );
    html = html.replace(
      /<p id="collection-result-count" class="collection-count">[\s\S]*?<\/p>/i,
      `<p id="collection-result-count" class="collection-count">${group.products.length} sản phẩm</p>`
    );
    html = html.replace(
      /<div id="collection-product-grid" class="product-grid collection-product-grid" aria-live="polite">\s*<\/div>/i,
      `<div id="collection-product-grid" class="product-grid collection-product-grid" aria-live="polite" data-prerendered="true" data-category-slug="${escapeHtml(group.slug)}">
						${cardsHtml}
					</div>`
    );

    const targetDir = path.join(outDir, "collections", group.slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
  });
}

function writeCollectionIndexPage(products = []) {
  const templatePath = path.join(outDir, "collection.html");
  if (!fs.existsSync(templatePath)) return;

  const visibleProducts = products.filter(productSlug);
  const canonical = `${siteUrl}/collection.html`;
  const title = "Bộ sưu tập pha lê khắc 3D - Quà Tặng Tinh Tế";
  const description = truncate(
    `Khám phá ${visibleProducts.length} mẫu quà tặng pha lê khắc 3D theo danh mục, mức giá và kiểu dáng để chọn món quà phù hợp.`,
    155
  );
  const schema = collectionSchema(
    {
      name: "Bộ sưu tập pha lê khắc 3D",
      description,
      products: visibleProducts,
    },
    canonical
  );
  const breadcrumb = collectionBreadcrumbSchema(null, canonical);
  const cardsHtml = visibleProducts.map(buildCollectionProductCard).filter(Boolean).join("");

  let html = fs.readFileSync(templatePath, "utf8")
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);

  html = replaceOrInsertMetaProperty(html, "og:title", title);
  html = replaceOrInsertMetaProperty(html, "og:description", description);
  html = replaceOrInsertMetaProperty(html, "og:url", canonical);
  html = replaceOrInsertMetaProperty(html, "og:image", productImage(visibleProducts[0] || {}));
  html = html.replace(
    /<script\s+type="application\/ld\+json">\s*[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
  );
  html = insertJsonLd(html, "static-collection-breadcrumb-schema", breadcrumb);
  html = html.replace(
    /<nav class="breadcrumb"[\s\S]*?<\/nav>/i,
    buildCollectionBreadcrumbHtml(null)
  );
  html = html.replace(
    /<h2 id="collection-title">[\s\S]*?<\/h2>/i,
    `<h2 id="collection-title">Tất cả sản phẩm pha lê</h2>`
  );
  html = html.replace(
    /<p id="collection-result-count" class="collection-count">[\s\S]*?<\/p>/i,
    `<p id="collection-result-count" class="collection-count">${visibleProducts.length} sản phẩm</p>`
  );
  html = html.replace(
    /<div id="collection-product-grid" class="product-grid collection-product-grid" aria-live="polite">\s*<\/div>/i,
    `<div id="collection-product-grid" class="product-grid collection-product-grid" aria-live="polite" data-prerendered="true">
						${cardsHtml}
					</div>`
  );

  fs.writeFileSync(templatePath, html, "utf8");
}

function buildHomeCategoryMenu(groups = []) {
  const allLink = `
								<a class="filter-option" href="/collection.html" role="option" aria-selected="true" data-category="Tất cả">
									<span>Tất cả</span>
									<i class="fa-solid fa-check" aria-hidden="true"></i>
								</a>`;
  const categoryLinks = groups.map((group) => `
								<a class="filter-option" href="${escapeHtml(collectionPath(group.slug))}" role="option" aria-selected="false" data-category="${escapeHtml(group.name)}">
									<span>${escapeHtml(group.name)}</span>
									<i class="fa-solid fa-check" aria-hidden="true"></i>
								</a>`).join("");

  return `${allLink}${categoryLinks}`;
}

function writeHomePage(products = [], groups = []) {
  const templatePath = path.join(outDir, "index.html");
  if (!fs.existsSync(templatePath)) return;

  const visibleProducts = products.filter(productSlug);
  const firstGroupSize = Math.min(8, Math.ceil(visibleProducts.length / 2));
  const newProducts = visibleProducts.slice(0, firstGroupSize);
  const recommendedProducts = visibleProducts.slice(firstGroupSize);
  const itemListSchema = homeItemListSchema(visibleProducts);

  let html = fs.readFileSync(templatePath, "utf8");
  html = html.replace(
    /<p id="product-count">[\s\S]*?<\/p>/i,
    `<p id="product-count">${visibleProducts.length} sản phẩm</p>`
  );
  html = html.replace(
    /<span id="new-products-count" class="collection-count"\s*>[\s\S]*?<\/span\s*>/i,
    `<span id="new-products-count" class="collection-count">${newProducts.length} mẫu</span>`
  );
  html = html.replace(
    /<span id="recommended-products-count" class="collection-count"\s*>[\s\S]*?<\/span\s*>/i,
    `<span id="recommended-products-count" class="collection-count">${recommendedProducts.length} mẫu</span>`
  );
  html = html.replace(
    /(<div\s+id="category-filter-menu"[\s\S]*?>)\s*<\/div>/i,
    `$1${buildHomeCategoryMenu(groups)}
							</div>`
  );
  html = html.replace(
    /<div\s+id="new-product-grid"\s+class="product-grid product-grid-compact"\s*>\s*<\/div>/i,
    `<div
								id="new-product-grid"
								class="product-grid product-grid-compact"
								data-prerendered="true"
							>
								${newProducts.map(buildHomeProductCard).filter(Boolean).join("")}
							</div>`
  );
  html = html.replace(
    /<div\s+id="recommended-product-grid"\s+class="product-grid product-grid-compact"\s*>\s*<\/div>/i,
    `<div
								id="recommended-product-grid"
								class="product-grid product-grid-compact"
								data-prerendered="true"
							>
								${recommendedProducts.map(buildHomeProductCard).filter(Boolean).join("")}
							</div>`
  );
  html = html.replace(
    /<\/head>/i,
    `\t\t<script id="home-item-list-schema" type="application/ld+json">${JSON.stringify(itemListSchema)}</script>\n\t</head>`
  );

  fs.writeFileSync(templatePath, html, "utf8");
}

function urlEntry(loc, priority = "0.7", changefreq = "weekly") {
  return [
    "  <url>",
    `    <loc>${xmlEscape(`${siteUrl}${loc}`)}</loc>`,
    `    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function writeSitemapXml(products = [], groups = categoryGroups(products)) {
  const staticUrls = [
    ["/", "1.0", "daily"],
    ["/collection.html", "0.9", "daily"],
    ["/about.html", "0.6", "monthly"],
    ["/contact.html", "0.5", "monthly"],
    ["/policy-purchase.html", "0.4", "monthly"],
    ["/policy-shipping.html", "0.4", "monthly"],
    ["/policy-payment.html", "0.4", "monthly"],
    ["/policy-return.html", "0.4", "monthly"],
    ["/policy-refund.html", "0.4", "monthly"],
    ["/policy-privacy.html", "0.4", "monthly"],
  ];

  const collectionUrls = groups
    .filter((group) => group.slug)
    .map((group) => [collectionPath(group.slug), "0.85", "daily"]);

  const productUrls = products
    .map(productSlug)
    .filter(Boolean)
    .map((slug) => [`/products/${encodeURIComponent(slug)}/`, "0.8", "weekly"]);

  const entries = [...staticUrls, ...collectionUrls, ...productUrls]
    .map(([loc, priority, changefreq]) => urlEntry(loc, priority, changefreq))
    .join("\n");

  fs.writeFileSync(
    path.join(outDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    "utf8"
  );
}

function writeRobotsTxt() {
  fs.writeFileSync(
    path.join(outDir, "robots.txt"),
    [
      "User-agent: *",
      "Allow: /",
      "Allow: /public/",
      "Disallow: /admin.html",
      "Disallow: /cart.html",
      "Disallow: /login.html",
      "Disallow: /register.html",
      "Disallow: /backend/",
      "Disallow: /api/",
      "",
      `Sitemap: ${siteUrl}/sitemap.xml`,
      "",
    ].join("\n"),
    "utf8"
  );
}

function writePleskHtaccess() {
  fs.writeFileSync(
    path.join(outDir, ".htaccess"),
    [
      "Options -Indexes",
      "DirectoryIndex index.html",
      "",
      "<IfModule mod_rewrite.c>",
      "  RewriteEngine On",
      "  RewriteBase /",
      "",
      "  RewriteCond %{THE_REQUEST} \\s/+index\\.html[\\s?] [NC]",
      "  RewriteRule ^index\\.html$ / [R=301,L]",
      "",
      "  RewriteCond %{REQUEST_FILENAME} -f [OR]",
      "  RewriteCond %{REQUEST_FILENAME} -d",
      "  RewriteRule ^ - [L]",
      "",
      "  RewriteRule ^products/([^/]+)/?$ product.html [L,QSA]",
      "  RewriteRule ^product/([^/]+)/?$ product.html [L,QSA]",
      "  RewriteRule ^products/?$ collection.html [L,QSA]",
      "  RewriteRule ^collections/([^/]+)/?$ collection.html [L,QSA]",
      "  RewriteRule ^collection/?$ collection.html [L,QSA]",
      "",
      "  RewriteCond %{REQUEST_FILENAME} !-d",
      "  RewriteCond %{REQUEST_FILENAME}.html -f",
      "  RewriteRule ^(.+?)/?$ $1.html [L]",
      "</IfModule>",
      "",
      "<IfModule mod_headers.c>",
      "  Header always set X-Content-Type-Options \"nosniff\"",
      "  Header always set Referrer-Policy \"strict-origin-when-cross-origin\"",
      "  Header always set X-Frame-Options \"SAMEORIGIN\"",
      "  <FilesMatch \"\\.(html|xml|txt)$\">",
      "    Header set Cache-Control \"no-cache, must-revalidate\"",
      "  </FilesMatch>",
      "  <FilesMatch \"\\.(css|js)$\">",
      "    Header set Cache-Control \"public, max-age=3600, must-revalidate\"",
      "  </FilesMatch>",
      "  <FilesMatch \"\\.(png|jpe?g|webp|gif|svg|ico|woff2?)$\">",
      "    Header set Cache-Control \"public, max-age=604800\"",
      "  </FilesMatch>",
      "</IfModule>",
      "",
    ].join("\n"),
    "utf8"
  );
}
