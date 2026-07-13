const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");
const siteUrl = normalizeSiteUrl(process.env.SITE_URL || "https://quatangtinhte.vn");

const files = [
  "index.html",
  "collection.html",
  "product.html",
  "cart.html",
  "login.html",
  "register.html",
  "about.html",
  "contact.html",
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
writePleskHtaccess();
writeRobotsTxt();
writeSitemapXml();

console.log(`Static site copied to ${path.relative(root, outDir)}`);
console.log(`Plesk assets generated for ${siteUrl}`);

function normalizeSiteUrl(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) return "https://quatangtinhte.vn";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function applyBuildReplacements(content) {
  return content.replace(/https:\/\/quatangtinhte\.vn/g, siteUrl);
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

function writeSitemapXml() {
  const staticUrls = [
    ["/", "1.0", "daily"],
    ["/collection.html", "0.9", "daily"],
    ["/about.html", "0.6", "monthly"],
    ["/contact.html", "0.5", "monthly"],
  ];

  const productUrls = loadProductsData()
    .map(productSlug)
    .filter(Boolean)
    .map((slug) => [`/products/${encodeURIComponent(slug)}`, "0.8", "weekly"]);

  const entries = [...staticUrls, ...productUrls]
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
      "  RewriteRule ^products/([^/]+)/?$ product.html [L,QSA]",
      "  RewriteRule ^product/([^/]+)/?$ product.html [L,QSA]",
      "  RewriteRule ^products/?$ collection.html [L,QSA]",
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
