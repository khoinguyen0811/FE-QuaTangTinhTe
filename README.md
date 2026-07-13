# FE Quà Tặng Tinh Tế

Frontend tĩnh cho storefront/admin demo. Repo này ưu tiên deploy Plesk theo dạng static site: build ra thư mục `dist`, sau đó upload toàn bộ nội dung trong `dist` lên document root/subdomain.

## Yêu cầu

- Node.js chỉ cần ở máy dev/CI để chạy build.
- Server Plesk chỉ cần Apache/Nginx phục vụ static file.
- Không cần Node runtime trên Plesk.

## Build

```bash
npm install
npm run build
```

Build mặc định dùng domain:

```txt
https://quatangtinhte.vn
```

Nếu deploy staging/demo, truyền domain thật:

```bash
SITE_URL=https://demo-quatangtinhte.mbws.vn npm run build
```

Trên PowerShell:

```powershell
$env:SITE_URL="https://demo-quatangtinhte.mbws.vn"; npm.cmd run build
```

## Output Plesk

`npm run build` sẽ tạo:

- `dist/.htaccess`: rewrite clean URL, security headers, cache headers.
- `dist/robots.txt`: rule index/noindex cơ bản.
- `dist/sitemap.xml`: home, collection, about, contact và product URL dạng `/products/{slug}`.
- Các file HTML/CSS/JS/public/data cần upload.

## Deploy Plesk

1. Chạy build với `SITE_URL` đúng domain.
2. Upload toàn bộ nội dung bên trong `frontend/dist` lên document root của domain/subdomain trong Plesk.
3. Đảm bảo file `.htaccess` được upload.
4. Kiểm tra các URL:
   - `/`
   - `/collection.html`
   - `/products/<slug-san-pham>`
   - `/robots.txt`
   - `/sitemap.xml`

## Ghi chú SEO

- Product clean URL `/products/{slug}` được Plesk rewrite nội bộ về `product.html`.
- `product.html` tự đọc slug từ path hoặc query `?slug=`.
- Cart/login/register không nằm trong sitemap và được robots noindex/follow trong HTML.
- Khi đổi domain, luôn build lại với `SITE_URL` đúng để canonical, Open Graph và sitemap khớp domain.
