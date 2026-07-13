# SEO & Frontend Audit

Ngày: 2026-07-13

Mục tiêu: đưa storefront về trạng thái SEO-first, clean, dễ maintain, và sẵn sàng phát triển builder kéo thả kiểu UX Builder/WP mà không làm code phình tiếp.

## Tài Liệu Tham Chiếu

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Structured Data: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google Faceted Navigation: https://developers.google.com/crawling/docs/faceted-navigation

## Kiến Trúc Hiện Tại

Repo đang có 3 bề mặt frontend song song:

- `frontend/*.html`: storefront static đang được serve ngoài public. `frontend/scripts/build-static.js` chỉ copy HTML/CSS/JS sang `dist`, không bundle `src`.
- `frontend/static-client.js`: lớp runtime lớn cho static storefront, vừa load API, vừa quick edit, vừa preview, vừa builder nhẹ. File này đã thành "god file".
- `frontend/src`: SPA/module mới cho admin và storefront, đang được chuẩn hóa dần để thành source of truth cho public storefront sau migration.

Backend Laravel trong `backend/` đã có API sản phẩm, danh mục, cài đặt, admin. Hướng tốt nhất là biến backend thành nguồn data sạch cho static generation/SSR của storefront, còn admin/builder là app riêng.

## Đánh Giá P0

### 1. Source of truth bị tách đôi

Public site đang chạy từ `frontend/index.html`, `collection.html`, `product.html`, `static-client.js`, trong khi `frontend/src` cũng có router, pages, services. Nếu sửa tính năng trong `src` chưa chắc ảnh hưởng production.

Quyết định source of truth trong giai đoạn migration:

- Production build hiện tại vẫn là `frontend/*.html` và `frontend/static-client.js`, vì `frontend/scripts/build-static.js` chỉ copy các file này sang `dist`.
- Source mới để phát triển storefront là `frontend/src`, đặc biệt các module `app`, `seo`, `services`, `pages`.
- `frontend/static-client.js` chỉ giữ tạm để hotfix production trong giai đoạn migrate, không thêm builder/SEO module mới.
- Admin/builder tiếp tục là SPA riêng, noindex, không trộn state quản trị vào HTML public.
- Khi route mới đã có render/pre-render tương đương, redirect URL legacy về canonical rồi mới xóa code cũ.

### 2. Encoding tiếng Việt đã đo lại

Đã quét lại `frontend/src` và toàn bộ `frontend` với mẫu bắt mojibake thật như `Ã¡`, `áº`, `á»`, `Ä‘`, `Æ°`, `â€`. Kết quả hiện tại: chưa phát hiện chuỗi mojibake trong các file JS/HTML/CSS/MD/JSON thuộc frontend, ngoài các chữ tiếng Việt hợp lệ như `MÃ`, `ĐÃ`, `BÃO`.

Quy tắc giữ sạch:

- Tất cả file text lưu UTF-8.
- Không copy text tiếng Việt qua tool làm mất encoding.
- Khi sửa title, meta description, heading, alt text phải xem lại bằng browser hoặc `Get-Content -Encoding UTF8`.
- Audit encoding nên chạy lại trước khi publish SEO lớn.

### 3. `frontend/src/main.js` đã hết blocker cú pháp chính

Đã xử lý bước nền để `src` có thể dùng làm hướng migration:

- Tách `applyDynamicThemeVars` sang `src/app/theme.js`.
- Chỉ còn một `async function boot()`.
- Gắn head manager chung từ `src/seo/head.js`.
- Gắn URL canonical/robots map từ `src/seo/urlMap.js`.

Việc còn lại:

- Tách preview mode, tracker, cart drawer, lazy image, compare bar thành initializer riêng.
- Chuyển import có `?v=` sang build hash của bundler khi bắt đầu dùng bundler thật.

### 4. SEO phụ thuộc quá nhiều vào client-side JavaScript

Đã chuẩn hóa bước client-side cho Home, Product listing, Product detail và Policy qua `src/seo/head.js`. Các page public này không nên tự set `document.title` trực tiếp nữa.

Vấn đề còn lại: static `product.html` và SPA vẫn cần JS để có metadata/schema đầy đủ ở runtime. Google có thể render JS, nhưng SEO tốt hơn là critical HTML/head/schema phải có sẵn ở initial response.

Target:

- Home, category/listing, product detail, policy, blog phải có HTML crawlable ngay từ response đầu.
- Title, description, canonical, Open Graph, Product/ItemList/Breadcrumb schema sinh server-side hoặc static-build.
- Client JS chỉ hydrate interaction.

### 5. Không nên dùng hidden SEO text

Đã bỏ section `sr-only` ở `frontend/src/pages/Home/index.js` vốn ghi rõ nội dung ẩn dành cho crawler. Nội dung SEO của Home hiện đi qua head manager, Organization schema và WebSite schema.

`sr-only` vẫn được phép dùng cho accessibility, ví dụ H1 hỗ trợ screen reader ở hero toàn ảnh. Không dùng `sr-only` để nhồi keyword hoặc đưa nội dung chỉ cho crawler.

Rule:

- Không thêm hidden keyword/text cho ranking.
- `sr-only` chỉ dùng cho accessibility label, skip link, heading hỗ trợ screen reader.

### 6. Canonical/URL map chưa thống nhất

Đang tồn tại:

- `/products` trong SPA
- `collection.html` static
- `/product/:slug` trong SPA
- `product.html?slug=...` hoặc `product.html?id=...` trong static
- hardcoded canonical `https://quatangtinhte.vn/...`

Target URL SEO:

- Home: `/`
- Listing: `/products` hoặc `/collections/{category-slug}` nhưng chọn 1 hệ.
- Product: `/product/{slug}`.
- Policy: `/policies/{slug}`.
- Admin: `/admin/*` noindex, không nằm sitemap.

Tất cả URL cũ cần 301 về canonical mới.

### 7. Faceted/filter URL cần kiểm soát crawl

Listing có filter search, category, price, sort, page. Nếu mọi biến thể query đều index, site ecommerce dễ tạo crawl trap.

Rule đề xuất:

- Index category landing pages có nội dung riêng.
- `search`, `sort`, `price_min`, `price_max`, filter tạm thời: `noindex, follow` hoặc dùng URL fragment/client state nếu không cần index.
- Pagination có canonical hợp lý và internal link rõ.
- Sitemap chỉ gồm URL canonical có giá trị.

## Đánh Giá P1

### 1. Inline HTML/CSS/JS quá nhiều

Có nhiều `innerHTML`, `style=`, `onclick`, `onmouseover`, `document.querySelector` trải rộng trong `frontend/*.html`, `static-client.js`, và `frontend/src`. Điều này làm khó test, khó sanitize, dễ XSS, và khó kéo thả block.

Hướng sửa:

- UI primitive dùng `createElement`/template helper có escape mặc định.
- Data từ API không được chèn vào `innerHTML` nếu chưa sanitize.
- Style chuyển về token/class/module CSS.

### 2. File quá lớn và domain logic trộn UI

Một số file lớn đang khó maintain:

- `frontend/static-client.js` > 100KB.
- `frontend/product.html` > 70KB.
- `frontend/src/pages/Admin/Settings/ColorsTab.js`, `SectionsTab.js`, `ProductVariantsForm.js` rất lớn.
- `frontend/src/pages/Admin/shared/ui.js` gom modal, toast, pagination, format, auth, draft, export, image helpers trong cùng file.

Target:

- Page file chỉ orchestrate.
- Component file dưới 250-350 lines nếu có thể.
- Service/model/schema riêng.
- Shared UI tách theo primitive: `modal.js`, `toast.js`, `pagination.js`, `format.js`, `formDraft.js`.

### 3. Manual cache busting `?v=...`

Import đang có nhiều `?v=1.0.xx`. Nên để bundler/hash asset xử lý.

Target:

- Dùng Vite/Rollup build cho `src`.
- Output hashed assets.
- Không sửa version query bằng tay.

### 4. Schema data cần được quản lý tập trung

Hiện có Organization/WebSite/ItemList/Product schema ở nhiều nơi. Nên gom về `src/seo/schema.js`:

- `organizationSchema(settings)`
- `websiteSchema(settings)`
- `breadcrumbSchema(items)`
- `productSchema(product, settings)`
- `itemListSchema(products, url)`

Structured data phải khớp nội dung thấy được trên trang.

### 5. Image SEO/performance

Cần chuẩn hóa:

- Ảnh meaningful có `alt` rõ.
- Ảnh decorative `alt=""`.
- Có `width`/`height` hoặc aspect-ratio ổn định.
- Hero/LCP image preload/fetchpriority.
- Product image dùng CDN/local optimized, không fallback remote Pexels trong production.

## Kiến Trúc SEO Mục Tiêu

### Public rendering

Ưu tiên theo thứ tự:

1. Static generation: build HTML cho home, categories, products, policies từ backend API.
2. SSR Laravel/Node nếu cần dynamic cao.
3. SPA chỉ dùng cho admin/builder và interaction sau khi HTML đã có.

### Page contract

Mỗi public page cần có:

- `route`: path canonical.
- `load(params)`: lấy data.
- `seo(data)`: title, description, canonical, robots, og, schema.
- `render(data)`: HTML semantic.
- `hydrate(root, data)`: optional interaction.

### Sitemap/robots

Cần sinh:

- `/sitemap.xml`: home, listing canonical, product active, category active, policy/blog.
- `/robots.txt`: allow public assets, disallow admin/private/search/filter crawl nếu cần.
- Admin, cart, checkout, login/register: `noindex, follow` hoặc noindex phù hợp.

## Roadmap Refactor

### Phase 0: Đóng băng và đo lại

- Không thêm feature mới vào `static-client.js` trừ khi hotfix.
- Chạy audit encoding UTF-8 cho HTML/JS.
- Lập danh sách route canonical và redirect cũ -> mới.
- Chốt public source of truth.

Trạng thái ngày 2026-07-13:

- Đã thêm `src/seo/head.js`, `src/seo/schema.js`, `src/seo/urlMap.js`.
- Đã tách `src/app/theme.js`.
- Đã gắn head manager vào app boot, router, product listing, product detail.
- Đã quét lại encoding frontend, chưa phát hiện mojibake thật.
- Đã bỏ hidden crawler text ở Home và thêm SEO metadata/schema cho Home, Policy.
- Đã thêm noindex cho các route auth/member phụ trong URL map.
- Source of truth giai đoạn migration đã chốt trong `docs/FRONTEND_CODE_FLOW.md`.

### Phase 1: SEO shell

- Tạo `src/seo/head.js`, `src/seo/schema.js`, `src/seo/routes.js`.
- Tạo `src/app/http.js` và service layer dùng chung.
- Dùng một head manager duy nhất, cấm page tự set `document.title` trực tiếp.
- Tạo HTML static/pre-render cho home/product/listing tối thiểu.

### Phase 2: Tách storefront component

- Tách product card, listing toolbar, product gallery, price, variant picker.
- Tách content blocks: hero, section heading, product grid, media/text, testimonial, FAQ, CTA.
- Mỗi block có schema data riêng và render storefront riêng.

### Phase 3: Builder drag-drop

- Tạo block registry và page document schema.
- Editor thao tác trên JSON layout, không sửa trực tiếp DOM production.
- Có draft/publish/revision.
- Preview render dùng cùng renderer với storefront.

### Phase 4: Migration

- Port nội dung từ `frontend/*.html` sang page document/block schema.
- Port quick edit từ `static-client.js` sang builder/admin.
- Xóa dần inline scripts khi route mới đã thay thế.

## Definition of Done cho SEO page

- Initial HTML có main content crawlable.
- Chỉ có 1 H1, heading order hợp lý.
- Title và description unique.
- Canonical đúng route chuẩn.
- Open Graph khớp page.
- Structured data hợp lệ và khớp nội dung visible.
- Ảnh có alt/size/aspect-ratio phù hợp.
- Internal link dùng anchor có nghĩa.
- Không có hidden SEO text.
- URL filter không tạo crawl trap.
- Page pass build, syntax check, và render mobile/desktop.
