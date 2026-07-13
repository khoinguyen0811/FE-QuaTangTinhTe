# Frontend Code Flow & Builder Architecture

Mục tiêu: biến frontend thành hệ thống có luồng code rõ ràng, dễ thêm tính năng, dễ review, và sẵn sàng cho visual builder kéo thả layout/item giống UX Builder nhưng vẫn SEO-first.

## Nguyên Tắc Bắt Buộc

- Public storefront ưu tiên HTML crawlable, semantic, nhanh.
- Admin/builder ưu tiên DX, state rõ, thao tác an toàn.
- Không trộn admin quick-edit vào runtime storefront nếu không cần.
- Không thêm file "god file" mới.
- Không thêm hidden text để SEO.
- Không chèn data API vào `innerHTML` nếu chưa escape/sanitize.
- Không set title/meta lung tung trong page; dùng SEO manager.
- Không cache-bust bằng `?v=` thủ công trong source mới.

## Bề Mặt Ứng Dụng

Chia frontend thành 3 surface:

### 1. Storefront public

Dành cho user và crawler:

- Home
- Product listing/category
- Product detail
- Policy/blog/content
- Cart/checkout, nhưng noindex

Surface này cần pre-render/SSR/static generation.

### 2. Admin app

Dành cho quản trị:

- Dashboard
- Catalog
- Orders
- Settings
- Builder

Surface này có thể là SPA, noindex, không cần SEO.

### 3. Builder preview

Dành cho xem trước:

- Dùng chung renderer với storefront.
- Đọc draft JSON từ admin.
- Không chèn logic admin vào HTML public.

## Source Of Truth Giai Đoạn Migration

Hiện repo có legacy static storefront và `frontend/src` cùng tồn tại. Quy tắc dưới đây dùng cho tới khi public storefront được pre-render/SSR từ source mới.

### Production hiện tại

- File được build public hiện tại: `frontend/index.html`, `collection.html`, `product.html`, `cart.html`, `login.html`, `register.html`, `about.html`, `contact.html`, `index.css`, `static-client.js`.
- Build script hiện tại: `frontend/scripts/build-static.js`.
- `frontend/dist` là output copy, không sửa trực tiếp.

### Source mới

- Code mới cho storefront viết trong `frontend/src`.
- Theme runtime nằm ở `frontend/src/app/theme.js`.
- SEO head, canonical, robots, schema nằm trong `frontend/src/seo`.
- Service/model/page mới phải đi theo flow: API -> service -> normalizer -> page load -> seo -> render -> hydrate.

### Luật sửa legacy

- `frontend/static-client.js` chỉ nhận hotfix production, không thêm builder module mới.
- Nếu buộc phải hotfix legacy, sau đó phải port logic tương ứng về `frontend/src` hoặc ghi rõ vì sao không cần port.
- Không nhân đôi SEO logic giữa legacy và `src`; logic chuẩn nằm ở `src/seo`.
- Không thêm dữ liệu sản phẩm/danh mục hardcode vào HTML public. Backend API là nguồn dữ liệu nội dung/catalog.
- Không sửa `frontend/dist` bằng tay.

### Luật thêm tính năng storefront

1. Chốt data contract với backend hoặc service hiện có.
2. Viết normalizer/model trong source mới.
3. Viết page/component render semantic HTML.
4. Viết `seo()` hoặc gọi head manager qua `src/seo`.
5. Chỉ tạo adapter sang static legacy nếu cần giữ production chạy trong giai đoạn migrate.
6. Khi route mới đã ổn, redirect route legacy về canonical rồi xóa code cũ.

## Folder Target

```txt
frontend/
  src/
    app/
      boot.js
      router.js
      surface.js
      theme.js
    core/
      apiClient.js
      events.js
      storage.js
      sanitize.js
      format.js
    seo/
      head.js
      schema.js
      sitemap.js
      urlMap.js
    ui/
      button.js
      modal.js
      toast.js
      pagination.js
      formField.js
      table.js
      tabs.js
    features/
      catalog/
        productService.js
        productModel.js
        productCard.js
        productGallery.js
        variantPicker.js
      cart/
      checkout/
      account/
      settings/
      builder/
        blockRegistry.js
        pageDocument.js
        editorState.js
        dragDrop.js
        previewRenderer.js
        blocks/
          hero.block.js
          sectionHeading.block.js
          productGrid.block.js
          mediaText.block.js
          faq.block.js
          testimonial.block.js
          cta.block.js
    pages/
      storefront/
        home.page.js
        productList.page.js
        productDetail.page.js
        policy.page.js
      admin/
        dashboard.page.js
        products.page.js
        settings.page.js
        builder.page.js
```

## Page Contract

Mỗi public page export một object theo contract:

```js
export const productDetailPage = {
  route: '/product/:slug',
  async load({ params, api }) {},
  seo({ data, url, settings }) {},
  render({ data, settings }) {},
  hydrate({ root, data, router }) {},
};
```

Rule:

- `load` chỉ lấy data, không render.
- `seo` chỉ trả object metadata/schema, không chạm DOM.
- `render` tạo HTML/Element từ data đã có.
- `hydrate` gắn event sau khi HTML đã tồn tại.
- Page không gọi `document.title` trực tiếp.

## Component Contract

Component mới nên theo mẫu:

```js
export function createProductCard(product, options = {}) {
  const el = document.createElement('article');
  el.className = 'product-card';
  el.append(/* children */);
  return el;
}
```

Nếu component cần event:

```js
export function mountVariantPicker(root, state, callbacks) {
  const cleanupFns = [];
  // bind events
  return () => cleanupFns.forEach((fn) => fn());
}
```

Rule:

- Component nhỏ, không fetch data trực tiếp trừ khi là smart component được đặt tên rõ.
- Data vào component là plain object đã normalize.
- Event ra ngoài qua callback hoặc custom event có tên rõ.
- Component phải có empty/loading/error state nếu có data async.

## Data Flow

Chuẩn:

```txt
API response -> service -> model normalizer -> page load -> view model -> render -> hydrate
```

Không chuẩn:

```txt
DOM event -> fetch raw -> mutate global -> innerHTML string random -> querySelector lại
```

Service layer:

- Mỗi endpoint có function riêng.
- Response normalize về format frontend dùng.
- Không để page biết chi tiết envelope `{ success, data, meta }` quá nhiều.

## SEO Flow

```txt
route match -> load data -> build seo object -> write head/static head -> render HTML -> hydrate
```

SEO object:

```js
{
  title: 'Tên sản phẩm | Brand',
  description: 'Mô tả ngắn...',
  canonical: 'https://domain.com/product/slug',
  robots: 'index, follow',
  openGraph: {
    title: '',
    description: '',
    image: '',
    type: 'product'
  },
  schemas: []
}
```

Head manager là nơi duy nhất được:

- Tạo/cập nhật `<title>`.
- Tạo/cập nhật meta description, canonical, robots, OG.
- Gắn JSON-LD.

## Builder Data Model

Builder không lưu HTML tùy tiện. Builder lưu JSON document:

```js
{
  id: 'home',
  type: 'page',
  locale: 'vi',
  slug: '/',
  seo: {
    title: '',
    description: '',
    canonicalPath: '/'
  },
  layout: {
    maxWidth: 'site',
    spacing: 'normal'
  },
  blocks: []
}
```

Block node:

```js
{
  id: 'blk_123',
  type: 'hero',
  version: 1,
  props: {},
  slots: {
    default: []
  },
  style: {
    spacing: {},
    background: {},
    visibility: {}
  }
}
```

## Block Registry Contract

Mỗi block phải khai báo:

```js
export const heroBlock = {
  type: 'hero',
  version: 1,
  label: 'Hero',
  group: 'Marketing',
  icon: 'image',
  defaults: {},
  fields: [],
  allowedChildren: [],
  seoRole: 'primary-content',
  renderStorefront(ctx) {},
  renderEditor(ctx) {},
  validate(props) {},
  migrate(oldProps, fromVersion) {}
};
```

Rule:

- `renderStorefront` không phụ thuộc admin state.
- `renderEditor` có toolbar/handles riêng.
- `fields` là schema điều khiển form editor.
- Block có version để migrate về sau.
- Block nào render heading phải khai báo heading level strategy.

## Drag-drop Rules

Nên dùng một drag engine ổn định thay vì tự viết hoàn toàn. Với vanilla JS có thể bắt đầu bằng SortableJS; nếu sau này chuyển React thì dùng `dnd-kit`.

Quy tắc:

- Kéo thả chỉ thay đổi `PageDocument.blocks`, không patch DOM làm source of truth.
- Mỗi thao tác tạo command: `moveBlock`, `insertBlock`, `deleteBlock`, `duplicateBlock`, `updateBlockProps`.
- Command có undo/redo.
- Sau command, preview render lại từ document.
- Editor cần có drop zone rõ, keyboard alternative, và state selected block.

## Draft/Publish Flow

```txt
Edit draft -> autosave local/session -> save draft API -> preview -> validate -> publish -> generate static/clear cache
```

Trạng thái:

- `draft`: admin đang sửa.
- `published`: user/crawler thấy.
- `revision`: bản đã publish trước đó.

Không publish nếu:

- SEO title/description rỗng ở page indexable.
- Có block thiếu content bắt buộc.
- Product/category link trỏ tới item inactive.
- Ảnh hero thiếu alt nếu meaningful.
- JSON-LD invalid.

## Admin UI Flow

Admin page pattern:

```txt
render shell -> load data -> render state -> bind events -> cleanup on route leave
```

Mỗi admin feature nên có:

- `api.js`: gọi endpoint.
- `model.js`: normalize/validate local.
- `view.js`: render UI.
- `controller.js` hoặc page file: bind events và state.

Shared UI:

- `ui/modal.js`
- `ui/toast.js`
- `ui/table.js`
- `ui/pagination.js`
- `ui/formField.js`
- `core/format.js`
- `core/auth.js`

`frontend/src/pages/Admin/shared/ui.js` nên được tách dần theo các nhóm trên.

## Quy Tắc Sửa Code Hằng Ngày

Trước khi code:

- Xác định surface: storefront, admin, builder preview.
- Xác định file source of truth.
- Nếu đang dùng static legacy, ghi rõ đây là hotfix hay migration.

Khi code:

- Sửa nhỏ, theo module.
- Không thêm logic mới vào file đã quá lớn nếu có thể tách.
- Tên function theo action rõ: `loadProducts`, `renderProductGrid`, `bindProductFilters`.
- Không dùng global `window.*` cho state mới, trừ khi tạo adapter migration có comment rõ.
- Không viết CSS inline cho UI lặp lại.

Sau khi code:

- Chạy syntax/build nếu có.
- Check route desktop/mobile.
- Check title/meta/canonical/schema với page public.
- Check console không error.
- Check noindex cho admin/cart/checkout/login nếu phù hợp.

## Migration Từ Legacy

Nguyên tắc:

- `frontend/static-client.js`: chỉ hotfix, không thêm module builder mới.
- Mỗi feature builder viết trong `src/features/builder`.
- Mỗi block mới phải render được storefront và editor.
- Khi port một section từ static HTML, tạo block schema trước, sau đó mới port UI.
- Xóa code legacy chỉ khi route mới đã có test/render tương đương.

Thứ tự migrate nên làm:

1. SEO head manager và URL map.
2. Product card/listing.
3. Product detail.
4. Home sections thành block.
5. Settings sections -> builder page document.
6. Static-client quick edit -> builder editor.

## Review Checklist

- File mới có đúng surface/folder không?
- Page có contract `load/seo/render/hydrate` không?
- Có duplicate logic với legacy không?
- Có chèn raw API data vào HTML không?
- Có title/meta/canonical/schema đúng không?
- Có hidden SEO text không?
- Có inline style/event lặp lại không?
- Có cleanup event listeners khi modal/route unmount không?
- Có empty/loading/error state không?
- Có test hoặc manual verification note không?
