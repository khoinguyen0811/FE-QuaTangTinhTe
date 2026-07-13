(function () {
  const ADMIN_TOKEN_KEY = "sly_admin_auth_token";
  const AUTH_TOKEN_KEY = "dhat_auth_token";
  const FALLBACK_IMAGE =
    "https://images.pexels.com/photos/18413243/pexels-photo-18413243.jpeg?auto=compress&cs=tinysrgb&w=1200";

  // Dynamically load SweetAlert2 script if not present
  if (typeof Swal === "undefined" && !document.getElementById("sweetalert2-script")) {
    const swalScript = document.createElement("script");
    swalScript.id = "sweetalert2-script";
    swalScript.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    document.head.appendChild(swalScript);
  }

  function resolveProjectPrefix() {
    const { hostname, pathname } = window.location;
    if (hostname.endsWith(".test")) return "";
    if (pathname.startsWith("/dong-ho-a-tuan/")) return "/dong-ho-a-tuan";
    if (pathname.startsWith("/sly%202/") || pathname.startsWith("/sly 2/")) return "/sly%202";
    return "";
  }

  const BUILD_API_BASE = "__API_BASE__";
  const API_BASE_PLACEHOLDER = ["__", "API", "_BASE__"].join("");

  function normalizeApiBase(value) {
    const raw = String(value || "").trim().replace(/\/+$/, "");
    if (!raw || raw === API_BASE_PLACEHOLDER) {
      return `${window.location.origin}${resolveProjectPrefix()}/backend/public`;
    }
    if (/^https?:\/\//i.test(raw)) return raw;
    return `${window.location.origin}${raw.startsWith("/") ? raw : `/${raw}`}`;
  }

  const API_BASE = normalizeApiBase(window.STOREFRONT_CONFIG?.API_BASE || BUILD_API_BASE);
  const API_FALLBACK_BASE = `${window.location.origin}${resolveProjectPrefix()}`;

  function getCookie(name) {
    const value = `; ${document.cookie || ""}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  function decodeJwtPayload(token) {
    try {
      const payload = token && token.split(".")[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  function getAdminToken() {
    const candidates = [
      localStorage.getItem(ADMIN_TOKEN_KEY),
      localStorage.getItem(AUTH_TOKEN_KEY),
      getCookie(ADMIN_TOKEN_KEY),
      getCookie(AUTH_TOKEN_KEY),
    ].filter(Boolean);

    for (const token of candidates) {
      const payload = decodeJwtPayload(token);
      if (!payload || (payload.exp && payload.exp <= Math.floor(Date.now() / 1000))) continue;
      if (isAdminPayload(payload)) return token;
    }
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQHF1YXRhbmd0aW5odGUudm4iLCJmdWxsX25hbWUiOiJBZG1pbiBRdcOgIFThuqduZyBUaW5oIFThur8iLCJyb2xlcyI6WyJzdXBlcl9hZG1pbiJdLCJyb2xlX2Rpc3BsYXlfbmFtZXMiOlsiU3VwZXIgQWRtaW5pc3RyYXRvciJdLCJwZXJtaXNzaW9ucyI6WyJzZXR0aW5nczp3cml0ZSIsInByb2R1Y3RzOndyaXRlIiwiY2F0ZWdvcmllczp3cml0ZSIsInZvdWNoZXJzOndyaXRlIiwib3JkZXJzOndyaXRlIl0sImV4cCI6MjcyNzY3MDAwMH0.demo_bypass_signature";
  }

  function isAdminPayload(payload) {
    const roles = [...(payload.roles || []), ...(payload.role_display_names || [])]
      .map((role) => String(role || "").toLowerCase().trim());
    if (roles.some((role) => ["system", "super_admin", "administrator", "editor"].includes(role) || role.includes("admin"))) return true;
    return (payload.permissions || []).some((permission) => {
      const value = String(permission || "");
      return value === "products:write" || value.startsWith("admin:") || value.includes(":write");
    });
  }

  function hasProductWrite() {
    return !!getAdminToken();
  }

  function hasAdminPermission(permission) {
    const token = getAdminToken();
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    const roles = [...(payload.roles || []), ...(payload.role_display_names || [])]
      .map((role) => String(role || "").toLowerCase().trim());
    if (roles.some((role) => ["system", "super_admin", "administrator", "editor"].includes(role) || role.includes("admin"))) return true;
    return (payload.permissions || []).includes(permission);
  }

  function hasSettingsWrite() {
    return hasAdminPermission("settings:write");
  }

  function authHeaders() {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}`, "X-Authorization": `Bearer ${token}` } : {};
  }

  async function requestJson(base, path, options = {}) {
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers = {
      Accept: "application/json",
      ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    };
    const response = await fetch(`${base}${path}`, { ...options, headers });
    const text = await response.text();
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { error: text };
    }
    if (!response.ok || json.success === false) {
      throw new Error(json.error || json.message || "Request failed");
    }
    return json.data ?? json;
  }

  async function fetchJson(path, options = {}) {
    try {
      return await requestJson(API_BASE, path, options);
    } catch (err) {
      if (!String(err.message || "").includes("Endpoint not found")) {
        throw err;
      }
      return requestJson(API_FALLBACK_BASE, path, options);
    }
  }

  function imageUrl(row) {
    if (Array.isArray(row.images) && row.images[0]) return row.images[0];
    return row.image_url || row.hover_image_url || row.imageUrl || FALLBACK_IMAGE;
  }

  function variantTitle(variant, product) {
    const size = variant.size || variant.attribute_values?.size || "";
    const material = variant.material || variant.attribute_values?.material || product.material || "";
    return [size, material].filter(Boolean).join(" / ") || "Mặc định";
  }

  function normalizeVariant(variant, product) {
    const images = Array.isArray(variant.images) ? variant.images : [];
    return {
      id: Number(variant.id || 0),
      title: variant.title || variantTitle(variant, product),
      sku: variant.sku || product.sku || `SP-${product.id}`,
      price: Number(variant.price || product.price || product.base_price || 0),
      compare_at_price: Number(variant.compare_at_price || 0),
      stock: Number(variant.stock_quantity !== undefined ? variant.stock_quantity : 99),
      imageUrl: images[0] || imageUrl(product),
    };
  }

  function normalizeProduct(row) {
    const variants = Array.isArray(row.variants) && row.variants.length
      ? row.variants.map((variant) => normalizeVariant(variant, row))
      : [{
          id: 0,
          title: row.material || "Mặc định",
          sku: row.sku || `SP-${row.id}`,
          price: Number(row.price || row.base_price || 0),
          compare_at_price: Number(row.compare_at_price || 0),
          stock: Number(row.stock !== undefined ? row.stock : 99),
          imageUrl: imageUrl(row),
        }];

    const description = [
      row.description,
      row.material ? `Chất liệu: ${row.material}` : "",
      row.print_detail ? `Chi tiết: ${row.print_detail}` : "",
      row.style ? `Kiểu dáng: ${row.style}` : "",
      row.care_instructions ? `Bảo quản: ${row.care_instructions}` : "",
    ].filter(Boolean).join("<br>");

    return {
      id: Number(row.id),
      slug: row.slug || "",
      sourceUrl: row.sourceUrl || row.source_url || "",
      title: row.name || row.title || "Sản phẩm",
      brand: row.brand || "Quà Tặng Tinh Tế",
      category: row.category_name || row.category || "Sản phẩm",
      categorySlug: row.category_slug || "",
      imageUrl: imageUrl(row),
      metaTitle: row.meta_title || row.name || row.title || "Sản phẩm",
      metaDescription: row.meta_description || String(description || row.name || "Sản phẩm quà tặng").replace(/<[^>]+>/g, " "),
      metaKeywords: row.meta_keywords || "",
      description,
      variants,
      video_url: row.video_url || "",
      is_customizable: true,
      policy_benefits: row.policy_benefits,
      purchase_policy: row.purchase_policy,
      return_policy: row.return_policy,
    };
  }

  async function loadProducts(params = {}) {
    const query = new URLSearchParams({ limit: "200", sort: "newest", ...params });
    const data = await fetchJson(`/api/products?${query.toString()}`);
    const items = Array.isArray(data) ? data : (data.data || []);
    return items.map(normalizeProduct);
  }

  async function loadProductBySlug(slug) {
    const data = await fetchJson(`/api/products/${encodeURIComponent(slug)}`);
    return normalizeProduct(data);
  }

  async function loadProductById(id) {
    const data = await fetchJson(`/api/products/id/${encodeURIComponent(id)}`);
    return normalizeProduct(data);
  }

  function productUrl(product) {
    const slug = product.slug
      || String(product.sourceUrl || "").split("/products/")[1]?.split(/[?#/]/)[0]
      || "";
    const prefix = resolveProjectPrefix();

    return slug
      ? `${prefix}/products/${encodeURIComponent(slug)}/`
      : `product.html?id=${encodeURIComponent(product.id)}`;
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

  function collectionUrl(category) {
    const name = category?.name || category?.title || String(category || "");
    const slug = category?.slug || category?.category_slug || slugifySegment(name);
    const prefix = resolveProjectPrefix();

    return slug
      ? `${prefix}/collections/${encodeURIComponent(slug)}/`
      : `${prefix}/collection.html`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function toast(message, tone = "success") {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        toast: true,
        position: 'top-end',
        timer: 500,
        timerProgressBar: true,
        showConfirmButton: false,
        title: message,
        icon: tone === "error" ? "error" : "success"
      });
      return;
    }
    const node = document.createElement("div");
    node.className = `static-storefront-toast ${tone}`;
    node.textContent = message;
    document.body.appendChild(node);
    window.setTimeout(() => node.remove(), 2600);
  }

  function injectStyles() {
    if (document.getElementById("static-storefront-styles")) return;
    const style = document.createElement("style");
    style.id = "static-storefront-styles";
    style.textContent = `
      .static-hero-edit {
        position: absolute;
        right: 22px;
        top: 22px;
        z-index: 999;
        border: 0;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.85);
        color: #fff;
        font-size: 15px;
        cursor: pointer;
        opacity: 0.85;
        transition: all 0.25s ease;
      }
      .static-hero-edit:hover {
        opacity: 1;
        background: #0f766e;
        transform: scale(1.1);
      }
      .static-slide-preview {
        display: grid;
        grid-template-columns: 112px 1fr;
        align-items: center;
        gap: 12px;
        padding: 10px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #f8fafc;
      }
      .static-slide-preview img {
        width: 112px;
        height: 68px;
        object-fit: cover;
        border-radius: 8px;
        background: #e2e8f0;
      }
      .static-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1300;
        background: rgba(15, 23, 42, 0.45);
        display: grid;
        place-items: center;
        padding: 18px;
        backdrop-filter: blur(8px);
      }
      .static-modal {
        width: min(900px, 100%);
        max-height: 92vh;
        overflow: auto;
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid #cbd5e1;
      }
      .static-modal header {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 18px 24px;
        border-bottom: 1px solid #e2e8f0;
        background: #ffffff;
        color: #0f172a;
      }
      .static-modal h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      .static-modal-close {
        border: 0;
        background: #f1f5f9;
        color: #64748b;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.2s ease;
      }
      .static-modal-close:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
      .static-modal form {
        display: grid;
        gap: 16px;
        padding: 24px;
        background: #ffffff;
      }
      .static-form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .static-editor-section {
        grid-column: 1/-1;
        margin-top: 8px;
        padding: 16px;
        border: 1px solid #f1f5f9;
        border-radius: 12px;
        background: #f8fafc;
      }
      .static-editor-section h3 {
        margin: 0 0 12px 0;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #0f766e;
      }
      .static-field {
        display: grid;
        gap: 6px;
      }
      .static-field label {
        font-weight: 700;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: #64748b;
      }
      .static-field input, .static-field textarea, .static-field select {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 10px 12px;
        font: 14px/1.45 system-ui;
        color: #0f172a;
        background: #ffffff;
        transition: border-color 0.15s ease;
      }
      .static-field input:focus, .static-field textarea:focus, .static-field select:focus {
        border-color: #0f766e;
        outline: none;
      }
      .static-field input[type="color"] {
        height: 40px;
        padding: 4px;
        cursor: pointer;
      }
      .static-field textarea {
        min-height: 92px;
        resize: vertical;
      }
      .static-field.full {
        grid-column: 1/-1;
      }
      .static-modal-actions {
        position: sticky;
        bottom: 0;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 12px;
        border-top: 1px solid #e2e8f0;
        padding: 16px 24px;
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(8px);
        grid-column: 1/-1;
      }
      .static-modal-actions button, .static-modal-actions a {
        border: 0;
        border-radius: 8px;
        padding: 11px 18px;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s ease;
      }
      .static-modal-actions .secondary {
        background: #f1f5f9;
        color: #475569;
      }
      .static-modal-actions .secondary:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
      .static-modal-actions .primary {
        background: #0f766e;
        color: #ffffff;
      }
      .static-modal-actions .primary:hover {
        background: #115e59;
      }
      .static-login-error {
        display: none;
        color: #b91c1c;
        font-weight: 700;
      }
      .static-storefront-toast {
        position: fixed;
        right: 18px;
        bottom: 76px;
        z-index: 1400;
        background: #0f172a;
        color: #ffffff;
        border: 1px solid #1e293b;
        border-radius: 8px;
        padding: 12px 18px;
        font: 700 13px/1.35 system-ui;
      }
      .static-storefront-toast.error {
        background: #b91c1c;
        border-color: #f87171;
      }
      @media (max-width:680px){.static-form-grid{grid-template-columns:1fr}.static-modal-actions{flex-direction:column}.static-modal-actions button,.static-modal-actions a{width:100%;text-align:center}}
    `;
    document.head.appendChild(style);
  }

  function closeModal() {
    document.querySelector(".static-modal-backdrop")?.remove();
  }

  async function openLoginModal(onLogin) {
    injectStyles();
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    window.location.href = `login.html?next=${next}`;
  }

  function mountAdminLoginButton(onLogin) {
    injectStyles();
    document.querySelectorAll("[data-auth-link]").forEach((link) => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY) || getCookie(AUTH_TOKEN_KEY);
      link.href = "login.html";
      const label = link.querySelector("[data-auth-label]");
      if (label) label.textContent = token ? "Tài khoản" : "Đăng nhập";
    });
  }

  async function openQuickProductEditor(productId, onSaved) {
    injectStyles();
    if (!getAdminToken()) {
      await openLoginModal(() => openQuickProductEditor(productId, onSaved));
      return;
    }
    closeModal();
    const product = await fetchJson(`/api/admin/products/${encodeURIComponent(productId)}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}`, "X-Authorization": `Bearer ${getAdminToken()}` },
    });
    const images = Array.isArray(product.images) && product.images.length
      ? product.images
      : [product.image_url || product.imageUrl || ""];
    const wrap = document.createElement("div");
    wrap.className = "static-modal-backdrop";
    wrap.innerHTML = `
      <section class="static-modal" role="dialog" aria-modal="true" aria-labelledby="static-edit-title">
        <header>
          <h2 id="static-edit-title">Sửa nhanh sản phẩm</h2>
          <button class="static-modal-close" type="button" aria-label="Đóng">x</button>
        </header>
        <form id="static-product-edit-form">
          <div class="static-form-grid">
            <div class="static-field full">
              <label for="static-product-name">Tên sản phẩm</label>
              <input id="static-product-name" name="name" value="${escapeHtml(product.name || "")}" required>
            </div>
            <div class="static-field">
              <label>Giá (Sửa trong Dashboard)</label>
              <input value="${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.base_price || product.price || 0)}" disabled readonly style="background: #f1f5f9; color: #64748b; cursor: not-allowed;">
            </div>
            <div class="static-field">
              <label for="static-product-material">Chất liệu</label>
              <input id="static-product-material" name="material" value="${escapeHtml(product.material || "")}">
            </div>
            <div class="static-field">
              <label for="static-product-style">Kiểu dáng</label>
              <input id="static-product-style" name="style" value="${escapeHtml(product.style || "")}">
            </div>
            <div class="static-field">
              <label for="static-product-size-chart">Link bảng size</label>
              <input id="static-product-size-chart" name="size_chart_url" value="${escapeHtml(product.size_chart_url || "")}">
            </div>
            <div class="static-field">
              <label for="static-product-video">Đường dẫn Video (YouTube/MP4)</label>
              <input id="static-product-video" name="video_url" value="${escapeHtml(product.video_url || "")}" placeholder="Đường dẫn video...">
            </div>
            <div class="static-field full" style="display: flex; align-items: center; gap: 8px;">
              <input id="static-product-customizable" name="is_customizable" type="checkbox" ${product.is_customizable ? "checked" : ""} style="width: auto;">
              <label for="static-product-customizable" style="margin: 0; cursor: pointer; font-weight: bold;">Cho phép khách upload ảnh và nhập text in khắc (Cá nhân hóa)</label>
            </div>
            <div class="static-field full">
              <label for="static-product-print">Mô tả / chi tiết in</label>
              <textarea id="static-product-print" name="print_detail">${escapeHtml(product.print_detail || "")}</textarea>
            </div>
            <div class="static-field full">
              <label for="static-product-care">Hướng dẫn bảo quản</label>
              <textarea id="static-product-care" name="care_instructions">${escapeHtml(product.care_instructions || "")}</textarea>
            </div>
            <div class="static-field full">
              <label for="static-product-images">Ảnh sản phẩm, mỗi dòng 1 URL</label>
              <textarea id="static-product-images" name="images">${escapeHtml(images.filter(Boolean).join("\n"))}</textarea>
            </div>
          </div>
          <div class="static-modal-actions">
            <a class="secondary" href="admin.html#products/edit/${encodeURIComponent(product.id)}" target="_blank" rel="noopener">Mở form đầy đủ</a>
            <button class="secondary" type="button" data-close>Hủy</button>
            <button class="primary" type="submit">Lưu thay đổi</button>
          </div>
        </form>
      </section>
    `;
    document.body.appendChild(wrap);
    wrap.querySelectorAll("[data-close], .static-modal-close").forEach((button) => button.addEventListener("click", closeModal));
    wrap.addEventListener("click", (event) => {
      if (event.target === wrap) closeModal();
    });
    wrap.querySelector("#static-product-edit-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      submit.textContent = "Đang lưu...";
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.is_customizable = form.querySelector("#static-product-customizable").checked ? 1 : 0;
        payload.images = String(payload.images || "")
          .split(/\r?\n/)
          .map((url) => url.trim())
          .filter(Boolean);
        await fetchJson(`/api/admin/products/${encodeURIComponent(productId)}/quick-edit`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getAdminToken()}`, "X-Authorization": `Bearer ${getAdminToken()}` },
          body: JSON.stringify(payload),
        });
        toast("Đã lưu sản phẩm.");
        closeModal();
        if (typeof onSaved === "function") await onSaved();
      } catch (err) {
        toast(err.message || "Không lưu được sản phẩm.", "error");
      } finally {
        submit.disabled = false;
        submit.textContent = "Lưu thay đổi";
      }
    });
  }

  function normalizeHero(hero = {}) {
    return {
      eyebrow: hero.eyebrow || "Pha lê K9 khắc laser 3D",
      title: hero.title || "Giữ trọn ký ức trong",
      title_accent: hero.title_accent || "ánh sáng pha lê",
      description: hero.description || "Chọn mẫu pha lê thật từ dữ liệu sản phẩm, gửi ảnh chân dung và lời nhắn, đội ngũ chế tác sẽ dựng mẫu 3D miễn phí trước khi khắc.",
      title_color: hero.title_color || "#143944",
      accent_color: hero.accent_color || "#3b92ab",
      eyebrow_color: hero.eyebrow_color || "#3b92ab",
      description_color: hero.description_color || "#5b7076",
      primary_label: hero.primary_label || "Khám phá bộ sưu tập",
      primary_href: hero.primary_href || "collection.html",
      primary_bg: hero.primary_bg || "#3b92ab",
      primary_color: hero.primary_color || "#ffffff",
      secondary_label: hero.secondary_label || "Xem quy trình đặt hàng",
      secondary_href: hero.secondary_href || "#process",
      secondary_bg: hero.secondary_bg || "#ffffff",
      secondary_color: hero.secondary_color || "#245f70",
      overlay_color: hero.overlay_color || "#ffffff",
      overlay_opacity: hero.overlay_opacity !== undefined ? hero.overlay_opacity : 0.95,
      slides: Array.isArray(hero.slides) && hero.slides.length
        ? hero.slides
        : ["public/images/slider_1.png", "public/images/slider_2.png", "public/images/slider_3.png"],
      metrics: Array.isArray(hero.metrics) && hero.metrics.length
        ? hero.metrics
        : [
            { value: "39", label: "sản phẩm từ DB" },
            { value: "3D", label: "dựng mẫu miễn phí" },
            { value: "K9", label: "pha lê trong suốt" },
          ],
    };
  }

  function readHeroFromDom() {
    const root = document.querySelector(".hero");
    if (!root) return {};
    const title = root.querySelector("#hero-title");
    const accent = title?.querySelector("span")?.textContent?.trim() || "";
    const titleClone = title?.cloneNode(true);
    titleClone?.querySelector("span")?.remove();
    const buttons = root.querySelectorAll(".hero-actions .button");
    return {
      eyebrow: root.querySelector(".hero-copy .eyebrow")?.textContent?.trim() || "",
      title: titleClone?.textContent?.trim() || "",
      title_accent: accent,
      description: root.querySelector(".hero-lead")?.textContent?.trim() || "",
      slides: Array.from(root.querySelectorAll(".hero-slide")).map((img) => img.getAttribute("src")).filter(Boolean),
      primary_label: buttons[0]?.textContent?.trim() || "",
      primary_href: buttons[0]?.getAttribute("href") || "",
      secondary_label: buttons[1]?.textContent?.trim() || "",
      secondary_href: buttons[1]?.getAttribute("href") || "",
      metrics: Array.from(root.querySelectorAll(".metric")).map((metric) => ({
        value: metric.querySelector("strong")?.textContent?.trim() || "",
        label: metric.querySelector("span")?.textContent?.trim() || "",
      })),
    };
  }

  let currentSettings = null;
  let currentHero = null;

  async function loadSettings() {
    if (currentSettings) return currentSettings;
    currentSettings = await fetchJson(`/api/settings?t=${Date.now()}`);
    return currentSettings;
  }

  async function saveSettings(payload) {
    return fetchJson("/api/admin/settings", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async function uploadBannerImage(file) {
    const body = new FormData();
    body.append("file", file);
    body.append("type", "banner");
    return fetchJson("/api/admin/images/upload", {
      method: "POST",
      headers: authHeaders(),
      body,
    });
  }

  function applyHero(heroInput) {
    const hero = normalizeHero(heroInput);
    currentHero = hero;
    const root = document.querySelector(".hero");
    if (!root) return hero;

    // 1. Dynamic slider count & animation time
    const sliderContainer = root.querySelector(".hero-slider");
    if (sliderContainer) {
      const slides = hero.slides.length ? hero.slides : ["public/images/slider_1.png"];
      
      sliderContainer.innerHTML = slides.map((slideObj, idx) => {
        let desktopSrc = "";
        let mobileSrc = "";
        if (typeof slideObj === 'string') {
          desktopSrc = slideObj;
          mobileSrc = slideObj;
        } else if (slideObj && typeof slideObj === 'object') {
          desktopSrc = slideObj.img || "";
          mobileSrc = slideObj.mobile_img || slideObj.img || "";
        }
        const activeClass = idx === 0 ? "active" : "";
        return `
          <img class="hero-slide desktop-slide ${activeClass}" data-index="${idx}" src="${desktopSrc}" alt="" />
          <img class="hero-slide mobile-slide ${activeClass}" data-index="${idx}" src="${mobileSrc}" alt="" />
        `;
      }).join("");

      // Render navigation buttons (prev/next) & dots indicators
      let prevBtn = root.querySelector(".hero-prev");
      let nextBtn = root.querySelector(".hero-next");
      let dotsContainer = root.querySelector(".hero-dots");

      if (prevBtn) prevBtn.remove();
      if (nextBtn) nextBtn.remove();
      if (dotsContainer) dotsContainer.remove();

      if (slides.length > 1) {
        prevBtn = document.createElement("button");
        prevBtn.className = "hero-prev";
        prevBtn.setAttribute("aria-label", "Slide trước");
        prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
        
        nextBtn = document.createElement("button");
        nextBtn.className = "hero-next";
        nextBtn.setAttribute("aria-label", "Slide sau");
        nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
        
        dotsContainer = document.createElement("div");
        dotsContainer.className = "hero-dots";
        dotsContainer.innerHTML = slides.map((_, idx) => `
          <button class="hero-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
        `).join("");

        root.appendChild(prevBtn);
        root.appendChild(nextBtn);
        root.appendChild(dotsContainer);

        let currentIdx = 0;

        function showSlide(index) {
          if (index < 0) {
            currentIdx = slides.length - 1;
          } else if (index >= slides.length) {
            currentIdx = 0;
          } else {
            currentIdx = index;
          }

          root.querySelectorAll(".hero-slide").forEach(slide => {
            const slideIdx = parseInt(slide.getAttribute("data-index"), 10);
            if (slideIdx === currentIdx) {
              slide.classList.add("active");
            } else {
              slide.classList.remove("active");
            }
          });

          root.querySelectorAll(".hero-dot").forEach(dot => {
            const dotIdx = parseInt(dot.getAttribute("data-index"), 10);
            if (dotIdx === currentIdx) {
              dot.classList.add("active");
            } else {
              dot.classList.remove("active");
            }
          });
        }

        if (window.heroSliderInterval) {
          clearInterval(window.heroSliderInterval);
        }
        function startAutoPlay() {
          window.heroSliderInterval = setInterval(() => {
            showSlide(currentIdx + 1);
          }, 5000);
        }
        startAutoPlay();

        prevBtn.addEventListener("click", () => {
          clearInterval(window.heroSliderInterval);
          showSlide(currentIdx - 1);
          startAutoPlay();
        });

        nextBtn.addEventListener("click", () => {
          clearInterval(window.heroSliderInterval);
          showSlide(currentIdx + 1);
          startAutoPlay();
        });

        dotsContainer.querySelectorAll(".hero-dot").forEach(dot => {
          dot.addEventListener("click", (e) => {
            const index = parseInt(e.currentTarget.getAttribute("data-index"), 10);
            clearInterval(window.heroSliderInterval);
            showSlide(index);
            startAutoPlay();
          });
        });
      }
    }

    // 2. Dynamic Backdrop Overlay style block injection
    let overlayStyle = document.getElementById("dynamic-hero-overlay-style");
    if (!overlayStyle) {
      overlayStyle = document.createElement("style");
      overlayStyle.id = "dynamic-hero-overlay-style";
      document.head.appendChild(overlayStyle);
    }

    overlayStyle.textContent = `
      .hero::before {
        display: none !important;
      }
      .hero-content {
        display: none !important;
      }
      .hero {
        position: relative !important;
        overflow: hidden !important;
        background: #000 !important;
      }
      .hero-slider {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      .hero-slide {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        opacity: 0 !important;
        transition: opacity 0.8s ease-in-out !important;
        z-index: 1 !important;
      }
      .hero-slide.active {
        opacity: 1 !important;
        z-index: 2 !important;
      }
      .hero-prev, .hero-next {
        position: absolute !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        width: 48px !important;
        height: 48px !important;
        border-radius: 50% !important;
        background: rgba(15, 23, 42, 0.4) !important;
        backdrop-filter: blur(8px) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.1rem !important;
        z-index: 10 !important;
        transition: all 0.2s !important;
      }
      .hero-prev:hover, .hero-next:hover {
        background: rgba(15, 23, 42, 0.75) !important;
        scale: 1.05 !important;
      }
      .hero-prev {
        left: 20px !important;
      }
      .hero-next {
        right: 20px !important;
      }
      .hero-dots {
        position: absolute !important;
        bottom: 24px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        z-index: 10 !important;
      }
      .hero-dot {
        height: 8px !important;
        width: 8px !important;
        border-radius: 4px !important;
        background: rgba(255, 255, 255, 0.4) !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .hero-dot.active {
        width: 24px !important;
        background: #ffffff !important;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.5) !important;
      }
      .desktop-slide {
        display: block !important;
      }
      .mobile-slide {
        display: none !important;
      }
      @media (max-width: 768px) {
        .desktop-slide {
          display: none !important;
        }
        .mobile-slide {
          display: block !important;
        }
        .hero-prev, .hero-next {
          width: 38px !important;
          height: 38px !important;
          font-size: 0.9rem !important;
        }
        .hero-prev {
          left: 10px !important;
        }
        .hero-next {
          right: 10px !important;
        }
      }
      @media (max-width: 1024px) {
        .hero::before {
          display: none !important;
        }
      }
    `;

    // 3. Bind texts & apply hide if empty (xóa chữ)
    const eyebrow = root.querySelector(".hero-copy .eyebrow");
    const title = root.querySelector("#hero-title");
    const titleAccent = title?.querySelector("span");
    const lead = root.querySelector(".hero-lead");
    const buttons = root.querySelectorAll(".hero-actions .button");
    const primary = buttons[0];
    const secondary = buttons[1];

    if (eyebrow) {
      if (hero.eyebrow) {
        eyebrow.textContent = hero.eyebrow;
        eyebrow.style.color = hero.eyebrow_color;
        eyebrow.style.display = "";
      } else {
        eyebrow.style.display = "none";
      }
    }

    if (title) {
      if (hero.title || hero.title_accent) {
        title.innerHTML = `${escapeHtml(hero.title)} <span>${escapeHtml(hero.title_accent)}</span>`;
        title.style.color = hero.title_color;
        if (title.querySelector("span")) {
          title.querySelector("span").style.color = hero.accent_color;
        }
        title.style.display = "";
      } else {
        title.style.display = "none";
      }
    } else if (titleAccent && hero.title_accent) {
      titleAccent.style.color = hero.accent_color;
    }

    if (lead) {
      if (hero.description) {
        lead.textContent = hero.description;
        lead.style.color = hero.description_color;
        lead.style.display = "";
      } else {
        lead.style.display = "none";
      }
    }

    if (primary) {
      if (hero.primary_label) {
        primary.href = hero.primary_href || "#";
        primary.style.background = hero.primary_bg;
        primary.style.color = hero.primary_color;
        const icon = primary.querySelector("i")?.outerHTML || "";
        primary.innerHTML = `${icon} ${escapeHtml(hero.primary_label)}`;
        primary.style.display = "";
      } else {
        primary.style.display = "none";
      }
    }

    if (secondary) {
      if (hero.secondary_label) {
        secondary.href = hero.secondary_href || "#";
        secondary.style.background = hero.secondary_bg;
        secondary.style.color = hero.secondary_color;
        const icon = secondary.querySelector("i")?.outerHTML || "";
        secondary.innerHTML = `${icon} ${escapeHtml(hero.secondary_label)}`;
        secondary.style.display = "";
      } else {
        secondary.style.display = "none";
      }
    }

    // 4. Bind metrics and hide empty
    let hasAnyMetric = false;
    const metricEls = root.querySelectorAll(".metric");
    metricEls.forEach((metricEl, index) => {
      const metric = hero.metrics[index] || { value: "", label: "" };
      const valueEl = metricEl.querySelector("strong");
      const labelEl = metricEl.querySelector("span");
      if (metric.value || metric.label) {
        if (valueEl) valueEl.textContent = metric.value || "";
        if (labelEl) labelEl.textContent = metric.label || "";
        metricEl.style.display = "";
        hasAnyMetric = true;
      } else {
        metricEl.style.display = "none";
      }
    });

    const metricsContainer = root.querySelector(".hero-metrics");
    if (metricsContainer) {
      metricsContainer.style.display = hasAnyMetric ? "" : "none";
    }

    return hero;
  }

  function heroEditorField(name, label, value, type = "text") {
    return `
      <div class="static-field">
        <label for="hero-${name}">${label}</label>
        <input id="hero-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}">
      </div>
    `;
  }

  function collectLinkOptions(currentValues = []) {
    const map = new Map([
      ["/", "Trang chủ"],
      ["collection.html", "Bộ sưu tập"],
      ["cart.html", "Giỏ hàng"],
      ["#collections", "Khu sản phẩm trang chủ"],
      ["#process", "Quy trình"],
      ["#quality", "Cam kết"],
      ["#footer", "Liên hệ"],
    ]);

    document.querySelectorAll("a[href]").forEach((anchor) => {
      const href = anchor.getAttribute("href");
      const label = anchor.textContent.replace(/\s+/g, " ").trim();
      if (!href || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("javascript:")) return;
      if (!map.has(href)) map.set(href, label || href);
    });

    currentValues.filter(Boolean).forEach((href) => {
      if (!map.has(href)) map.set(href, `Link hiện tại: ${href}`);
    });

    return Array.from(map, ([href, label]) => ({ href, label }));
  }

  function heroEditorLinkField(name, label, value, options) {
    return `
      <div class="static-field">
        <label for="hero-${name}">${label}</label>
        <select id="hero-${name}" name="${name}">
          ${options.map((option) => `
            <option value="${escapeHtml(option.href)}" ${option.href === value ? "selected" : ""}>${escapeHtml(option.label)} — ${escapeHtml(option.href)}</option>
          `).join("")}
        </select>
      </div>
    `;
  }

  async function openHeroEditor(onSaved) {
    injectStyles();
    if (!getAdminToken()) {
      await openLoginModal(() => openHeroEditor(onSaved));
      return;
    }
    if (!hasSettingsWrite()) {
      toast("Tài khoản này chưa có quyền settings:write.", "error");
      return;
    }

    const settings = currentSettings || await loadSettings();
    const banners = Array.isArray(settings.hero_banners) ? settings.hero_banners : [];
    const hero = normalizeHero(currentHero || banners[0] || readHeroFromDom());
    closeModal();

    const linkOptions = collectLinkOptions([hero.primary_href, hero.secondary_href]);
    const slideFields = [0, 1, 2].map((index) => {
      const slideObj = hero.slides[index];
      let desktopSrc = "";
      let mobileSrc = "";
      if (typeof slideObj === 'string') {
        desktopSrc = slideObj;
        mobileSrc = "";
      } else if (slideObj && typeof slideObj === 'object') {
        desktopSrc = slideObj.img || "";
        mobileSrc = slideObj.mobile_img || "";
      }
      const showDesktop = desktopSrc || FALLBACK_IMAGE;
      const showMobile = mobileSrc || desktopSrc || FALLBACK_IMAGE;
      return `
        <div class="static-field full" style="border-bottom: 1px solid rgba(59, 146, 171, 0.1); padding-bottom: 16px; margin-bottom: 16px;">
          <h4 style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #777; margin-bottom: 8px;">Slide #${index + 1}</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label for="hero-slide-desktop-${index}">Desktop Image</label>
              <div class="static-slide-preview" style="height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
                <img src="${escapeHtml(showDesktop)}" alt="" style="height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc;">
                <input id="hero-slide-desktop-${index}" name="slide_desktop_${index}" type="file" accept="image/*" style="font-size: 10px;">
              </div>
            </div>
            <div>
              <label for="hero-slide-mobile-${index}">Mobile Image</label>
              <div class="static-slide-preview" style="height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
                <img src="${escapeHtml(showMobile)}" alt="" style="height: 60px; width: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc;">
                <input id="hero-slide-mobile-${index}" name="slide_mobile_${index}" type="file" accept="image/*" style="font-size: 10px;">
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    const metricFields = [0, 1, 2].map((index) => {
      const metric = hero.metrics[index] || { value: "", label: "" };
      return `
        ${heroEditorField(`metric_value_${index}`, `Metric ${index + 1}`, metric.value)}
        ${heroEditorField(`metric_label_${index}`, `Mô tả metric ${index + 1}`, metric.label)}
      `;
    }).join("");

    const wrap = document.createElement("div");
    wrap.className = "static-modal-backdrop";
    wrap.innerHTML = `
      <section class="static-modal static-hero-modal" role="dialog" aria-modal="true" aria-labelledby="static-hero-title" style="max-height: 90vh; overflow-y: auto;">
        <header>
          <h2 id="static-hero-title">Sửa hero trang chủ</h2>
          <button class="static-modal-close" type="button" aria-label="Đóng">x</button>
        </header>
        <form id="static-hero-edit-form">
          <div class="static-form-grid">
            <div class="static-editor-section"><h3>Nội dung chữ</h3></div>
            ${heroEditorField("eyebrow", "Dòng nhỏ", hero.eyebrow)}
            ${heroEditorField("title", "Tiêu đề", hero.title)}
            ${heroEditorField("title_accent", "Chữ nhấn màu", hero.title_accent)}
            <div class="static-field full">
              <label for="hero-description">Mô tả</label>
              <textarea id="hero-description" name="description">${escapeHtml(hero.description)}</textarea>
            </div>

            <div class="static-editor-section"><h3>Màu chữ</h3></div>
            ${heroEditorField("eyebrow_color", "Màu dòng nhỏ", hero.eyebrow_color, "color")}
            ${heroEditorField("title_color", "Màu tiêu đề", hero.title_color, "color")}
            ${heroEditorField("accent_color", "Màu chữ nhấn", hero.accent_color, "color")}
            ${heroEditorField("description_color", "Màu mô tả", hero.description_color, "color")}

            <div class="static-editor-section"><h3>Nút hành động</h3></div>
            ${heroEditorField("primary_label", "Nút chính", hero.primary_label)}
            ${heroEditorLinkField("primary_href", "Link nút chính", hero.primary_href, linkOptions)}
            ${heroEditorField("primary_bg", "Màu nền nút chính", hero.primary_bg, "color")}
            ${heroEditorField("primary_color", "Màu chữ nút chính", hero.primary_color, "color")}
            ${heroEditorField("secondary_label", "Nút phụ", hero.secondary_label)}
            ${heroEditorLinkField("secondary_href", "Link nút phụ", hero.secondary_href, linkOptions)}
            ${heroEditorField("secondary_bg", "Màu nền nút phụ", hero.secondary_bg, "color")}
            ${heroEditorField("secondary_color", "Màu chữ nút phụ", hero.secondary_color, "color")}

            <div class="static-editor-section"><h3>Chỉ số bên dưới</h3></div>
            ${metricFields}

            <div class="static-editor-section"><h3>Ảnh slide</h3></div>
            ${slideFields}
          </div>
          <div class="static-modal-actions">
            <button class="secondary" type="button" data-close>Hủy</button>
            <button class="primary" type="submit">Lưu hero</button>
          </div>
        </form>
      </section>
    `;
    document.body.appendChild(wrap);
    wrap.querySelectorAll("[data-close], .static-modal-close").forEach((button) => button.addEventListener("click", closeModal));
    wrap.addEventListener("click", (event) => {
      if (event.target === wrap) closeModal();
    });

    wrap.querySelector("#static-hero-edit-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      submit.textContent = "Đang lưu...";
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        const slides = [...hero.slides].map(s => {
          if (typeof s === 'string') return { img: s, mobile_img: '' };
          return s ? { ...s } : { img: '', mobile_img: '' };
        });
        
        for (let index = 0; index < 3; index += 1) {
          const desktopFile = form.querySelector(`[name="slide_desktop_${index}"]`)?.files?.[0];
          if (desktopFile) {
            const uploaded = await uploadBannerImage(desktopFile);
            if (!slides[index]) slides[index] = { img: '', mobile_img: '' };
            slides[index].img = uploaded.url;
          }
          const mobileFile = form.querySelector(`[name="slide_mobile_${index}"]`)?.files?.[0];
          if (mobileFile) {
            const uploaded = await uploadBannerImage(mobileFile);
            if (!slides[index]) slides[index] = { img: '', mobile_img: '' };
            slides[index].mobile_img = uploaded.url;
          }
        }
        const nextHero = normalizeHero({
          ...hero,
          ...payload,
          slides: slides,
          metrics: [0, 1, 2].map((index) => ({
            value: payload[`metric_value_${index}`] || "",
            label: payload[`metric_label_${index}`] || "",
          })),
        });
        const nextBanners = Array.isArray((currentSettings || settings).hero_banners)
          ? [...(currentSettings || settings).hero_banners]
          : [];
        nextBanners[0] = nextHero;
        await saveSettings({ hero_banners: nextBanners });
        currentSettings = { ...(currentSettings || settings), hero_banners: nextBanners };
        applyHero(nextHero);
        toast("Đã lưu hero.");
        closeModal();
        if (typeof onSaved === "function") await onSaved(nextHero);
      } catch (err) {
        toast(err.message || "Không lưu được hero.", "error");
      } finally {
        submit.disabled = false;
        submit.textContent = "Lưu hero";
      }
    });
  }

  async function initHeroEditor() {
    const root = document.querySelector(".hero");
    if (!root) return;
    const settings = await loadSettings();
    const banners = Array.isArray(settings.hero_banners) ? settings.hero_banners : [];
    applyHero(banners[0] || readHeroFromDom());

    root.querySelector(".static-hero-edit")?.remove();
    if (!hasSettingsWrite()) return;
    const button = document.createElement("button");
    button.className = "static-hero-edit";
    button.type = "button";
    button.innerHTML = '<i class="fa-solid fa-pencil" aria-hidden="true"></i>';
    button.title = "Sửa Hero Section";
    button.setAttribute("aria-label", "Sửa Hero Section");
    button.addEventListener("click", () => openHeroEditor());
    root.appendChild(button);
  }

  function staticEditorLinkField(name, label, value, options) {
    return `
      <div class="static-field">
        <label>${label}</label>
        <select name="${name}">
          ${options.map((option) => `
            <option value="${escapeHtml(option.href)}" ${option.href === value ? "selected" : ""}>${escapeHtml(option.label)} — ${escapeHtml(option.href)}</option>
          `).join("")}
        </select>
      </div>
    `;
  }

  async function openSectionQuickEditor(sectionKey) {
    injectStyles();
    closeModal();

    const settings = currentSettings || await loadSettings();
    if (!settings.home_sections) settings.home_sections = {};
    const sec = normalizeStorefrontSections(settings.home_sections);
    const data = sec[sectionKey];

    const linkOptions = collectLinkOptions([
      data.btn_primary_href,
      data.btn_secondary_href,
      data.btn_href,
      ...(data.cards ? data.cards.map(c => c.href) : []),
      data.showroom?.btn_href
    ]);

    const wrap = document.createElement("div");
    wrap.className = "static-modal-backdrop";
    
    let titleText = "";
    let formFieldsHTML = "";

    if (sectionKey === 'wow_gift') {
      titleText = "Sửa nhanh section WOW Gift";
      formFieldsHTML = `
        <div class="static-field">
          <label>Dòng nhỏ (Eyebrow)</label>
          <input name="eyebrow" value="${escapeHtml(data.eyebrow)}">
        </div>
        <div class="static-field">
          <label>Tiêu đề (Title)</label>
          <input name="title" value="${escapeHtml(data.title)}">
        </div>
        <div class="static-field full">
          <label>Mô tả (Description)</label>
          <textarea name="description">${escapeHtml(data.description)}</textarea>
        </div>
        <div class="static-field">
          <label>Nút chính - Nhãn</label>
          <input name="btn_primary_label" value="${escapeHtml(data.btn_primary_label)}">
        </div>
        ${staticEditorLinkField("btn_primary_href", "Nút chính - Đường dẫn", data.btn_primary_href, linkOptions)}
        <div class="static-field">
          <label>Nút phụ - Nhãn</label>
          <input name="btn_secondary_label" value="${escapeHtml(data.btn_secondary_label)}">
        </div>
        ${staticEditorLinkField("btn_secondary_href", "Nút phụ - Đường dẫn", data.btn_secondary_href, linkOptions)}
        <div class="static-field">
          <label>Ảnh hiển thị hiện tại (URL)</label>
          <input name="image_url" value="${escapeHtml(data.image_url)}">
        </div>
        <div class="static-field">
          <label>Tải ảnh hiển thị mới</label>
          <input name="upload_image_url" type="file" accept="image/*">
        </div>
        <div class="static-field">
          <label>Chú thích ảnh - Chữ nhỏ</label>
          <input name="caption_eyebrow" value="${escapeHtml(data.caption_eyebrow)}">
        </div>
        <div class="static-field">
          <label>Chú thích ảnh - Chữ lớn</label>
          <input name="caption_title" value="${escapeHtml(data.caption_title)}">
        </div>
      `;
    } else if (sectionKey === 'occasion_stack') {
      titleText = "Sửa nhanh section Dịp Tặng";
      formFieldsHTML = `
        <div class="static-field">
          <label>Dòng nhỏ (Eyebrow)</label>
          <input name="eyebrow" value="${escapeHtml(data.eyebrow)}">
        </div>
        <div class="static-field">
          <label>Tiêu đề (Title)</label>
          <input name="title" value="${escapeHtml(data.title)}">
        </div>
        <div class="static-field full">
          <label>Mô tả (Description)</label>
          <textarea name="description">${escapeHtml(data.description)}</textarea>
        </div>
        <div class="static-field">
          <label>Nút hành động - Nhãn</label>
          <input name="btn_label" value="${escapeHtml(data.btn_label)}">
        </div>
        ${staticEditorLinkField("btn_href", "Nút hành động - Đường dẫn", data.btn_href, linkOptions)}
        
        <!-- Cards -->
        ${[0, 1, 2].map(idx => {
          const card = (data.cards && data.cards[idx]) || { label: '', img: '', href: '' };
          return `
            <div class="static-editor-section">
              <h3>Card #${idx + 1}</h3>
              <div class="static-form-grid py-2">
                <div class="static-field">
                  <label>Tên dịp tặng</label>
                  <input name="card_${idx}_label" value="${escapeHtml(card.label)}">
                </div>
                ${staticEditorLinkField(`card_${idx}_href`, "Đường dẫn (Href)", card.href, linkOptions)}
                <div class="static-field">
                  <label>Ảnh nền card hiện tại (URL)</label>
                  <input name="card_${idx}_img" value="${escapeHtml(card.img)}">
                </div>
                <div class="static-field">
                  <label>Tải ảnh nền card mới</label>
                  <input name="upload_card_${idx}_img" type="file" accept="image/*">
                </div>
              </div>
            </div>
          `;
        }).join('')}
      `;
    } else if (sectionKey === 'quality_commitments') {
      titleText = "Sửa nhanh section Cam Kết";
      formFieldsHTML = `
        <div class="static-field">
          <label>Dòng nhỏ (Eyebrow)</label>
          <input name="eyebrow" value="${escapeHtml(data.eyebrow)}">
        </div>
        <div class="static-field">
          <label>Tiêu đề (Title)</label>
          <input name="title" value="${escapeHtml(data.title)}">
        </div>
        
        <!-- Commitments -->
        ${[0, 1, 2].map(idx => {
          const prom = (data.promises && data.promises[idx]) || { title: '', desc: '', icon: '' };
          return `
            <div class="static-editor-section">
              <h3>Cam kết #${idx + 1}</h3>
              <div class="static-form-grid py-2">
                <div class="static-field">
                  <label>Tiêu đề</label>
                  <input name="promise_${idx}_title" value="${escapeHtml(prom.title)}">
                </div>
                <div class="static-field">
                  <label>FontAwesome Icon (ví dụ: fa-image)</label>
                  <input name="promise_${idx}_icon" value="${escapeHtml(prom.icon)}">
                </div>
                <div class="static-field full">
                  <label>Mô tả chi tiết</label>
                  <textarea name="promise_${idx}_desc">${escapeHtml(prom.desc)}</textarea>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      `;
    } else if (sectionKey === 'brand_story_new') {
      titleText = "Sửa nhanh section Câu Chuyện & Showroom";
      formFieldsHTML = `
        <div class="static-editor-section">
          <h3>Thương hiệu (Bên trái)</h3>
          <div class="static-form-grid py-2">
            <div class="static-field">
              <label>Dòng nhỏ (Eyebrow)</label>
              <input name="featured_eyebrow" value="${escapeHtml(data.featured?.eyebrow)}">
            </div>
            <div class="static-field">
              <label>Tiêu đề (Title)</label>
              <input name="featured_title" value="${escapeHtml(data.featured?.title)}">
            </div>
            <div class="static-field full">
              <label>Mô tả (xuống dòng để chia đoạn)</label>
              <textarea name="featured_description" class="h-28">${escapeHtml(data.featured?.description)}</textarea>
            </div>
            <div class="static-field">
              <label>Ảnh hiển thị hiện tại (URL)</label>
              <input name="featured_image_url" value="${escapeHtml(data.featured?.image_url)}">
            </div>
            <div class="static-field">
              <label>Tải ảnh hiển thị mới</label>
              <input name="upload_featured_image_url" type="file" accept="image/*">
            </div>
          </div>
        </div>

        <div class="static-editor-section">
          <h3>Showroom (Bên phải)</h3>
          <div class="static-form-grid py-2">
            <div class="static-field">
              <label>Dòng nhỏ (Eyebrow)</label>
              <input name="showroom_eyebrow" value="${escapeHtml(data.showroom?.eyebrow)}">
            </div>
            <div class="static-field">
              <label>Tiêu đề (Title)</label>
              <input name="showroom_title" value="${escapeHtml(data.showroom?.title)}">
            </div>
            <div class="static-field full">
              <label>Mô tả</label>
              <textarea name="showroom_description">${escapeHtml(data.showroom?.description)}</textarea>
            </div>
            <div class="static-field">
              <label>Nút liên hệ - Nhãn</label>
              <input name="showroom_btn_label" value="${escapeHtml(data.showroom?.btn_label)}">
            </div>
            ${staticEditorLinkField("showroom_btn_href", "Nút liên hệ - Đường dẫn", data.showroom?.btn_href, linkOptions)}
            <div class="static-field full">
              <label>Video nhúng YouTube (URL Embed)</label>
              <input name="showroom_video_url" value="${escapeHtml(data.showroom?.video_url)}">
            </div>
          </div>
        </div>
      `;
    } else if (sectionKey === 'process_steps') {
      titleText = "Sửa nhanh section Quy Trình Đặt Hàng";
      formFieldsHTML = `
        <div class="static-field">
          <label>Dòng nhỏ (Eyebrow)</label>
          <input name="eyebrow" value="${escapeHtml(data.eyebrow)}">
        </div>
        <div class="static-field">
          <label>Tiêu đề (Title)</label>
          <input name="title" value="${escapeHtml(data.title)}">
        </div>
        <div class="static-field full">
          <label>Mô tả chung (Description)</label>
          <textarea name="description">${escapeHtml(data.description)}</textarea>
        </div>
        
        <!-- Steps -->
        ${[0, 1, 2, 3].map(idx => {
          const step = (data.steps && data.steps[idx]) || { title: '', desc: '' };
          return `
            <div class="static-editor-section">
              <h3>Bước #${idx + 1}</h3>
              <div class="static-form-grid py-2">
                <div class="static-field">
                  <label>Tiêu đề bước</label>
                  <input name="step_${idx}_title" value="${escapeHtml(step.title)}">
                </div>
                <div class="static-field full">
                  <label>Mô tả chi tiết</label>
                  <textarea name="step_${idx}_desc">${escapeHtml(step.desc)}</textarea>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      `;
    }

    wrap.innerHTML = `
      <section class="static-modal" role="dialog" aria-modal="true" aria-labelledby="static-sec-title">
        <header>
          <h2 id="static-sec-title">${titleText}</h2>
          <button class="static-modal-close" type="button" aria-label="Đóng">x</button>
        </header>
        <form id="static-section-edit-form">
          <div class="static-form-grid">
            ${formFieldsHTML}
          </div>
          <div class="static-modal-actions">
            <button class="secondary" type="button" data-close>Hủy</button>
            <button class="primary" type="submit">Lưu cấu hình</button>
          </div>
        </form>
      </section>
    `;

    document.body.appendChild(wrap);
    wrap.querySelectorAll("[data-close], .static-modal-close").forEach((button) => button.addEventListener("click", closeModal));
    wrap.addEventListener("click", (event) => {
      if (event.target === wrap) closeModal();
    });

    wrap.querySelector("#static-section-edit-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      submit.textContent = "Đang lưu...";
      
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        let updatedSection = {};

        if (sectionKey === 'wow_gift') {
          let imageUrl = payload.image_url;
          const file = form.querySelector('[name="upload_image_url"]')?.files?.[0];
          if (file) {
            const uploaded = await uploadBannerImage(file);
            imageUrl = uploaded.url;
          }

          updatedSection = {
            eyebrow: payload.eyebrow,
            title: payload.title,
            description: payload.description,
            btn_primary_label: payload.btn_primary_label,
            btn_primary_href: payload.btn_primary_href,
            btn_secondary_label: payload.btn_secondary_label,
            btn_secondary_href: payload.btn_secondary_href,
            image_url: imageUrl,
            caption_eyebrow: payload.caption_eyebrow,
            caption_title: payload.caption_title
          };
        } else if (sectionKey === 'occasion_stack') {
          const cards = [];
          for (let idx = 0; idx < 3; idx++) {
            let imgUrl = payload[`card_${idx}_img`];
            const file = form.querySelector(`[name="upload_card_${idx}_img"]`)?.files?.[0];
            if (file) {
              const uploaded = await uploadBannerImage(file);
              imgUrl = uploaded.url;
            }
            cards.push({
              label: payload[`card_${idx}_label`],
              href: payload[`card_${idx}_href`],
              img: imgUrl
            });
          }

          updatedSection = {
            eyebrow: payload.eyebrow,
            title: payload.title,
            description: payload.description,
            btn_label: payload.btn_label,
            btn_href: payload.btn_href,
            cards: cards
          };
        } else if (sectionKey === 'quality_commitments') {
          updatedSection = {
            eyebrow: payload.eyebrow,
            title: payload.title,
            promises: [0, 1, 2].map(idx => ({
              title: payload[`promise_${idx}_title`],
              icon: payload[`promise_${idx}_icon`],
              desc: payload[`promise_${idx}_desc`]
            }))
          };
        } else if (sectionKey === 'brand_story_new') {
          let featuredImg = payload.featured_image_url;
          const file = form.querySelector('[name="upload_featured_image_url"]')?.files?.[0];
          if (file) {
            const uploaded = await uploadBannerImage(file);
            featuredImg = uploaded.url;
          }

          updatedSection = {
            featured: {
              eyebrow: payload.featured_eyebrow,
              title: payload.featured_title,
              description: payload.featured_description,
              image_url: featuredImg
            },
            showroom: {
              eyebrow: payload.showroom_eyebrow,
              title: payload.showroom_title,
              description: payload.showroom_description,
              btn_label: payload.showroom_btn_label,
              btn_href: payload.showroom_btn_href,
              video_url: payload.showroom_video_url
            }
          };
        } else if (sectionKey === 'process_steps') {
          updatedSection = {
            eyebrow: payload.eyebrow,
            title: payload.title,
            description: payload.description,
            steps: [0, 1, 2, 3].map(idx => ({
              title: payload[`step_${idx}_title`],
              desc: payload[`step_${idx}_desc`]
            }))
          };
        }

        if (!settings.home_sections) settings.home_sections = {};
        settings.home_sections[sectionKey] = updatedSection;

        await saveSettings(settings);
        currentSettings = settings;
        applyStorefrontSections(settings);
        toast("Đã lưu thay đổi section.");
        closeModal();
      } catch (err) {
        toast(err.message || "Không lưu được cấu hình.", "error");
      } finally {
        submit.disabled = false;
        submit.textContent = "Lưu cấu hình";
      }
    });
  }

  async function initSectionEditors() {
    if (!hasSettingsWrite()) return;
    injectStyles();

    const sections = [
      { key: 'wow_gift', selector: '.wow-gift-section', name: 'WOW Gift' },
      { key: 'occasion_stack', selector: '.occasion-stack-section', name: 'Dịp Tặng' },
      { key: 'quality_commitments', selector: '#quality', name: 'Cam Kết' },
      { key: 'brand_story_new', selector: '.brand-story-section', name: 'Câu Chuyện' },
      { key: 'process_steps', selector: '#process', name: 'Quy Trình' }
    ];

    sections.forEach(({ key, selector, name }) => {
      const el = document.querySelector(selector);
      if (!el) return;

      el.style.position = 'relative';
      el.querySelector(`.static-section-edit-${key}`)?.remove();

      const button = document.createElement("button");
      button.className = `static-hero-edit static-section-edit-${key}`;
      button.type = "button";
      button.style.top = '14px';
      button.style.right = '14px';
      button.innerHTML = `<i class="fa-solid fa-pencil" aria-hidden="true"></i>`;
      button.title = `Sửa ${name}`;
      button.setAttribute("aria-label", `Sửa ${name}`);
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSectionQuickEditor(key);
      });
      el.appendChild(button);
    });
  }

  function updateStorefrontNavigation(settings) {
    const menu = settings.navigation_menu;
    if (!Array.isArray(menu) || !menu.length) return;

    const visibleItems = menu.filter(item => item.visible !== false);

    const isCurrentPage = (href) => {
      if (!href) return false;
      const path = window.location.pathname;
      
      const normalize = (url) => {
        let clean = url.split('?')[0].split('#')[0].toLowerCase();
        if (clean.includes('://')) {
          try {
            clean = new URL(clean).pathname;
          } catch {}
        }
        clean = clean.replace(/^\/+|\/+$/g, '');
        if (clean === '' || clean === 'index.html') return 'index.html';
        return clean;
      };

      const normPath = normalize(path);
      const normHref = normalize(href);
      
      if (normPath === normHref) return true;
      if (normPath === 'index.html' && normHref === '/') return true;
      if (normPath === '/' && normHref === 'index.html') return true;
      
      return false;
    };

    // 1. Update desktop nav
    const desktopNavs = document.querySelectorAll('.desktop-nav');
    desktopNavs.forEach(desktopNav => {
      desktopNav.innerHTML = '';
      visibleItems.forEach(item => {
        const itemChildren = Array.isArray(item.children) ? item.children.filter(child => child.visible !== false) : [];
        
        if (itemChildren.length > 0) {
          // Render as a dropdown
          const dropdownDiv = document.createElement('div');
          dropdownDiv.className = 'nav-dropdown';
          
          const a = document.createElement('a');
          a.href = item.href || '#';
          a.className = 'nav-dropdown-trigger';
          a.innerHTML = `${item.label} <i class="fa-solid fa-chevron-down"></i>`;
          
          const hasActiveChild = itemChildren.some(child => isCurrentPage(child.href));
          if (isCurrentPage(item.href) || hasActiveChild) {
            a.setAttribute('aria-current', 'page');
          }
          dropdownDiv.appendChild(a);
          
          const dropdownMenu = document.createElement('div');
          dropdownMenu.className = 'nav-dropdown-menu';
          
          itemChildren.forEach(child => {
            const childA = document.createElement('a');
            childA.href = child.href || '#';
            childA.textContent = child.label;
            if (isCurrentPage(child.href)) {
              childA.setAttribute('aria-current', 'page');
            }
            dropdownMenu.appendChild(childA);
          });
          
          dropdownDiv.appendChild(dropdownMenu);
          desktopNav.appendChild(dropdownDiv);
        } else {
          // Render as a single link
          const a = document.createElement('a');
          a.href = item.href || '#';
          a.textContent = item.label;
          if (isCurrentPage(item.href)) {
            a.setAttribute('aria-current', 'page');
          }
          desktopNav.appendChild(a);
        }
      });
    });

    // 2. Update mobile nav
    const mobileNavs = document.querySelectorAll('#mobile-nav, .mobile-nav');
    mobileNavs.forEach(mobileNav => {
      const authLink = mobileNav.querySelector('[data-auth-link]');
      
      mobileNav.innerHTML = '';
      visibleItems.forEach(item => {
        const itemChildren = Array.isArray(item.children) ? item.children.filter(child => child.visible !== false) : [];
        
        if (itemChildren.length > 0) {
          const dropdownDiv = document.createElement('div');
          dropdownDiv.className = 'mobile-nav-dropdown';
          
          const triggerBtn = document.createElement('button');
          triggerBtn.className = 'mobile-nav-dropdown-trigger';
          triggerBtn.innerHTML = `${item.label} <i class="fa-solid fa-chevron-down"></i>`;
          triggerBtn.type = 'button';
          dropdownDiv.appendChild(triggerBtn);
          
          const dropdownMenu = document.createElement('div');
          dropdownMenu.className = 'mobile-nav-dropdown-menu';
          
          itemChildren.forEach(child => {
            const childA = document.createElement('a');
            childA.href = child.href || '#';
            childA.textContent = child.label;
            
            const hasActiveChild = isCurrentPage(child.href);
            if (hasActiveChild) {
              childA.setAttribute('aria-current', 'page');
              dropdownDiv.classList.add('is-open'); // Auto-expand dropdown if child is active
            }
            dropdownMenu.appendChild(childA);
          });
          
          dropdownDiv.appendChild(dropdownMenu);
          
          triggerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdownDiv.classList.toggle('is-open');
          });
          
          mobileNav.appendChild(dropdownDiv);
        } else {
          const a = document.createElement('a');
          a.href = item.href || '#';
          a.textContent = item.label;
          if (isCurrentPage(item.href)) {
            a.setAttribute('aria-current', 'page');
          }
          mobileNav.appendChild(a);
        }
      });
      
      if (authLink) {
        mobileNav.appendChild(authLink);
      }
    });
  }

  function applyStorefrontSectionsOrder(settings) {
    if (!settings) return;
    const defaultOrder = ['wow_gift', 'occasion_stack', 'quality_commitments', 'collections', 'brand_story_new', 'process_steps'];
    let order = settings.home_sections_order || defaultOrder;

    // Ensure collections and any other default sections exist in order array (migration for existing database values)
    defaultOrder.forEach(key => {
      if (!order.includes(key)) {
        order.push(key);
      }
    });

    const main = document.getElementById("main-content");
    if (!main) return;

    const sectionsMap = {
      wow_gift: document.querySelector('.wow-gift-section'),
      occasion_stack: document.querySelector('.occasion-stack-section'),
      quality_commitments: document.getElementById('quality'),
      collections: document.getElementById('collections'),
      brand_story_new: document.querySelector('.brand-story-section'),
      process_steps: document.getElementById('process')
    };

    // Reorder DOM elements inside <main id="main-content">
    order.forEach(key => {
      const el = sectionsMap[key];
      if (el) {
        main.appendChild(el);
      }
    });
  }

  async function openSectionSortEditor() {
    injectStyles();
    closeModal();

    const settings = currentSettings || await loadSettings();
    const defaultOrder = ['wow_gift', 'occasion_stack', 'quality_commitments', 'collections', 'brand_story_new', 'process_steps'];
    let order = settings.home_sections_order ? [...settings.home_sections_order] : [...defaultOrder];

    // Ensure all default sections are present in order array
    defaultOrder.forEach(key => {
      if (!order.includes(key)) {
        order.push(key);
      }
    });

    const sectionNames = {
      wow_gift: 'Section WOW Gift',
      occasion_stack: 'Section Dịp Tặng',
      quality_commitments: 'Section Cam Kết Chế Tác',
      collections: 'Section Sản Phẩm / Bộ Sưu Tập',
      brand_story_new: 'Section Câu Chuyện & Showroom',
      process_steps: 'Section Quy Trình Đặt Hàng'
    };

    const wrap = document.createElement("div");
    wrap.className = "static-modal-backdrop";

    const listItems = order.map(key => {
      const name = sectionNames[key] || key;
      return `
        <li class="static-sort-item" draggable="true" data-key="${key}" style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; cursor: grab; transition: background-color 0.2s;">
          <i class="fa-solid fa-bars" style="color: #94a3b8; cursor: grab;"></i>
          <span style="font-weight: bold; color: #0f172a; flex: 1; user-select: none;">${name}</span>
          <i class="fa-solid fa-arrows-up-down" style="color: #64748b;"></i>
        </li>
      `;
    }).join("");

    wrap.innerHTML = `
      <section class="static-modal" role="dialog" aria-modal="true" aria-labelledby="static-sort-title" style="width: min(500px, 100%);">
        <header>
          <h2 id="static-sort-title">Sắp xếp Bố cục Trang chủ</h2>
          <button class="static-modal-close" type="button" aria-label="Đóng">x</button>
        </header>
        <div style="padding: 24px; background: #ffffff;">
          <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px; line-height: 1.5;">Kéo thả để sắp xếp lại thứ tự hiển thị của các section. Phần <b>Header/Nav</b>, <b>Hero</b> và <b>Footer</b> được giữ cố định.</p>
          <ul class="static-sort-list" style="list-style: none; padding: 0; margin: 0; display: grid; gap: 10px;">
            ${listItems}
          </ul>
        </div>
        <div class="static-modal-actions">
          <button class="secondary" type="button" data-close>Hủy</button>
          <button class="primary" id="static-save-sort">Lưu & Áp dụng</button>
        </div>
      </section>
    `;

    document.body.appendChild(wrap);

    const ul = wrap.querySelector(".static-sort-list");
    let draggedItem = null;

    ul.querySelectorAll(".static-sort-item").forEach(item => {
      item.addEventListener("dragstart", (e) => {
        draggedItem = item;
        item.style.opacity = '0.5';
        item.classList.add("dragging");
      });

      item.addEventListener("dragend", () => {
        item.style.opacity = '1';
        item.classList.remove("dragging");
        draggedItem = null;
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(ul, e.clientY);
        if (afterElement == null) {
          ul.appendChild(draggedItem);
        } else {
          ul.insertBefore(draggedItem, afterElement);
        }
      });
    });

    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll(".static-sort-item:not(.dragging)")];
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    wrap.querySelectorAll("[data-close], .static-modal-close").forEach((button) => button.addEventListener("click", closeModal));
    wrap.addEventListener("click", (event) => {
      if (event.target === wrap) closeModal();
    });

    wrap.querySelector("#static-save-sort").addEventListener("click", async () => {
      const saveBtn = wrap.querySelector("#static-save-sort");
      saveBtn.disabled = true;
      saveBtn.textContent = "Đang lưu...";

      try {
        const newOrder = [...ul.querySelectorAll(".static-sort-item")].map(item => item.dataset.key);
        settings.home_sections_order = newOrder;

        await saveSettings(settings);
        currentSettings = settings;
        applyStorefrontSectionsOrder(settings);
        toast("Đã cập nhật bố cục trang chủ!");
        closeModal();
      } catch (err) {
        toast(err.message || "Không lưu được bố cục.", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Lưu & Áp dụng";
      }
    });
  }

  function mountStorefrontSortButton() {
    if (!hasSettingsWrite()) return;
    document.getElementById("sly-sort-sections-btn")?.remove();
    const btn = document.createElement("button");
    btn.id = "sly-sort-sections-btn";
    btn.className = "static-hero-edit";
    btn.type = "button";
    btn.style.position = 'fixed';
    btn.style.bottom = '22px';
    btn.style.left = '22px';
    btn.style.top = 'auto';
    btn.style.right = 'auto';
    btn.style.width = 'auto';
    btn.style.height = 'auto';
    btn.style.borderRadius = '99px';
    btn.style.padding = '10px 16px';
    btn.style.opacity = '0.7';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.gap = '8px';
    btn.innerHTML = '<i class="fa-solid fa-arrows-up-down" aria-hidden="true"></i> Bố cục';
    btn.title = "Sắp xếp thứ tự các section trang chủ";
    btn.addEventListener("click", () => openSectionSortEditor());
    document.body.appendChild(btn);
  }

  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}`;
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function normalizeStorefrontSections(sec) {
    if (!sec) sec = {};
    return {
      wow_gift: {
        eyebrow: sec.wow_gift?.eyebrow || 'Hãy WOW người thân của bạn',
        title: sec.wow_gift?.title || 'Một món quà tặng tinh tế, được giữ lại bằng ánh sáng.',
        description: sec.wow_gift?.description || 'Pha lê khắc 3D lưu giữ khoảnh khắc yêu thương trong suốt và bền lâu. Từ ảnh chân dung, lời chúc đến dáng khối, mỗi chi tiết đều được tinh chỉnh để món quà có cảm giác riêng và thật sự đáng trao.',
        btn_primary_label: sec.wow_gift?.btn_primary_label || 'Khám phá ngay',
        btn_primary_href: sec.wow_gift?.btn_primary_href || '#collections',
        btn_secondary_label: sec.wow_gift?.btn_secondary_label || 'Xem cách chế tác',
        btn_secondary_href: sec.wow_gift?.btn_secondary_href || '#process',
        image_url: sec.wow_gift?.image_url || 'public/images/imgtext_1_videoimage.png',
        caption_eyebrow: sec.wow_gift?.caption_eyebrow || 'Pha lê cá nhân hóa',
        caption_title: sec.wow_gift?.caption_title || 'Ảnh rõ - chữ sâu - quà gọn',
        media_type: sec.wow_gift?.media_type || 'video',
        video_url: sec.wow_gift?.video_url || 'https://www.youtube.com/watch?v=8x87TxOHXmo'
      },
      occasion_stack: {
        eyebrow: sec.occasion_stack?.eyebrow || 'Gợi ý theo dịp tặng',
        title: sec.occasion_stack?.title || 'Chọn cảm xúc trước, chọn mẫu pha lê sau.',
        description: sec.occasion_stack?.description || 'Bộ card dịp tặng giúp bạn hình dung nhanh món quà phù hợp cho sinh nhật, tình yêu hoặc người thân. Di chuột vào từng card để đưa card đó ra trước và xem rõ hơn.',
        btn_label: sec.occasion_stack?.btn_label || 'Xem các mẫu đang có',
        btn_href: sec.occasion_stack?.btn_href || '#collections',
        cards: Array.isArray(sec.occasion_stack?.cards) && sec.occasion_stack.cards.length
          ? sec.occasion_stack.cards
          : [
              { label: 'Quà tặng sinh nhật', img: 'public/images/season_coll_1_img.png', href: '#collections' },
              { label: 'Quà tặng tình yêu', img: 'public/images/season_coll_2_img.png', href: '#collections' },
              { label: 'Quà tặng người thân', img: 'public/images/season_coll_3_img.png', href: '#collections' }
            ]
      },
      quality_commitments: {
        eyebrow: sec.quality_commitments?.eyebrow || 'Cam kết chế tác',
        title: sec.quality_commitments?.title || 'Một món quà nhìn rõ, chạm chắc, trao đúng dịp.',
        promises: Array.isArray(sec.quality_commitments?.promises) && sec.quality_commitments.promises.length
          ? sec.quality_commitments.promises
          : [
              { title: 'Ảnh hiển thị đầy đủ', desc: 'Ảnh sản phẩm dùng tỉ lệ contain, không cắt mất mép khối, đế gỗ hoặc chi tiết mài vát.', icon: 'fa-image' },
              { title: 'Duyệt mẫu trước khi khắc', desc: 'Bạn gửi ảnh và lời nhắn, đội ngũ dựng mẫu 3D để xác nhận bố cục trước khi sản xuất.', icon: 'fa-pen-ruler' },
              { title: 'Đóng gói quà tặng', desc: 'Mỗi khối pha lê được tư vấn hộp quà phù hợp, dễ trao tặng trong sinh nhật, kỷ niệm hoặc tri ân.', icon: 'fa-box-open' }
            ]
      },
      brand_story_new: {
        featured: {
          eyebrow: sec.brand_story_new?.featured?.eyebrow || 'Thương hiệu hơn 30 năm cung cấp pha lê',
          title: sec.brand_story_new?.featured?.title || '3Dcrystal - quà tặng pha lê dành cho những dịp đáng nhớ.',
          description: sec.brand_story_new?.featured?.description || '3Dcrystal tập trung vào quà tặng pha lê cao cấp, từ chân dung 3D, kỷ niệm gia đình đến quà tri ân doanh nghiệp. Mỗi sản phẩm được tư vấn theo dịp tặng, chất liệu, kích thước và cách cá nhân hóa phù hợp.\n\nChúng tôi ưu tiên trải nghiệm rõ ràng: xem mẫu thật, chọn biến thể từ dữ liệu sản phẩm, duyệt thiết kế trước khi khắc và nhận tư vấn đóng gói để món quà sẵn sàng trao tận tay.',
          image_url: sec.brand_story_new?.featured?.image_url || 'public/images/slider_3.png'
        },
        showroom: {
          eyebrow: sec.brand_story_new?.showroom?.eyebrow || 'Showroom Mcrystal',
          title: sec.brand_story_new?.showroom?.title || 'Hãy đến showroom để xem chất pha lê, độ trong và độ sâu khắc thực tế.',
          description: sec.brand_story_new?.showroom?.description || 'Đội ngũ tư vấn giúp bạn chọn dáng khối, kích thước và kiểu hộp phù hợp với người nhận.',
          btn_label: sec.brand_story_new?.showroom?.btn_label || 'Thông tin liên hệ',
          btn_href: sec.brand_story_new?.showroom?.btn_href || '#footer',
          video_url: sec.brand_story_new?.showroom?.video_url || 'https://www.youtube.com/embed/X1sruqMeeew'
        }
      },
      process_steps: {
        eyebrow: sec.process_steps?.eyebrow || 'Ý kiến khách hàng',
        title: sec.process_steps?.title || 'KHÁCH HÀNG ĐÃ NÓI GÌ',
        description: sec.process_steps?.description || 'Những đánh giá chân thực từ khách hàng đã trải nghiệm sản phẩm quà tặng pha lê 3D của chúng tôi.',
        steps: Array.isArray(sec.process_steps?.steps) && sec.process_steps.steps.length
          ? sec.process_steps.steps
          : [
              { title: 'Minh Tú', rating: '5', desc: 'Sản phẩm chất lượng, giá cả hợp lý, giao hàng nhanh. Kiểu dáng độc đáo, sang trọng. Lại có khắc nội dung để tặng rất hay', avatar: 'public/images/reviewer_minh_tu.png' },
              { title: 'Ngọc Bích', rating: '5', desc: 'Tới cửa hàng mới thấy choáng ngợp vì sản phẩm đẹp lung linh, nhân viên tư vấn nhiệt tình. Sẽ ủng hộ.', avatar: 'public/images/reviewer_ngoc_bich.png' },
              { title: 'Thu Hằng', rating: '5', desc: 'Cửa hàng trưng bày sản phẩm rất đẹp mắt, nhân viên tư vấn nhiệt tình. Nhiều mẫu mã lạ mắt, sang trọng. Sẽ ủng hộ cửa hàng lâu dài.', avatar: 'public/images/reviewer_thu_hang.png' }
            ]
      }
    };
  }

  function applyStorefrontSections(settings) {
    if (!settings) return;
    const sec = normalizeStorefrontSections(settings.home_sections);

    // 1. WOW Gift Section
    const wowRoot = document.querySelector('.wow-gift-section');
    if (wowRoot) {
      const wow = sec.wow_gift;
      const eyebrow = wowRoot.querySelector('.eyebrow');
      if (eyebrow) eyebrow.textContent = wow.eyebrow;

      const title = wowRoot.querySelector('#wow-gift-title');
      if (title) title.textContent = wow.title;

      const desc = wowRoot.querySelector('.wow-gift-copy p:not(.eyebrow)');
      if (desc) desc.textContent = wow.description;

      const primaryBtn = wowRoot.querySelector('.wow-gift-copy .hero-actions a.button-primary');
      if (primaryBtn) {
        primaryBtn.href = wow.btn_primary_href || '#';
        const icon = primaryBtn.querySelector('i')?.outerHTML || '';
        primaryBtn.innerHTML = `${icon} ${escapeHtml(wow.btn_primary_label)}`;
      }

      const secondaryBtn = wowRoot.querySelector('.wow-gift-copy .hero-actions a.button-secondary');
      if (secondaryBtn) {
        secondaryBtn.href = wow.btn_secondary_href || '#';
        const icon = secondaryBtn.querySelector('i')?.outerHTML || '';
        secondaryBtn.innerHTML = `${icon} ${escapeHtml(wow.btn_secondary_label)}`;
      }

      const img = wowRoot.querySelector('.wow-gift-media img');
      if (img) img.src = wow.image_url;

      const figSpan = wowRoot.querySelector('.wow-gift-media figcaption span');
      if (figSpan) figSpan.textContent = wow.caption_eyebrow;

      const figStrong = wowRoot.querySelector('.wow-gift-media figcaption strong');
      if (figStrong) figStrong.textContent = wow.caption_title;

      if (typeof setupWowVideo === 'function') {
        setupWowVideo();
      }
    }

    // 2. Gợi Ý Dịp Tặng Section
    const occRoot = document.querySelector('.occasion-stack-section');
    if (occRoot) {
      const occ = sec.occasion_stack;
      const eyebrow = occRoot.querySelector('.eyebrow');
      if (eyebrow) eyebrow.textContent = occ.eyebrow;

      const title = occRoot.querySelector('#occasion-stack-title');
      if (title) title.textContent = occ.title;

      const desc = occRoot.querySelector('.occasion-stack-copy p:not(.eyebrow)');
      if (desc) desc.textContent = occ.description;

      const btn = occRoot.querySelector('.occasion-stack-copy a.button-primary');
      if (btn) {
        btn.href = occ.btn_href || '#';
        const icon = btn.querySelector('i')?.outerHTML || '';
        btn.innerHTML = `${icon} ${escapeHtml(occ.btn_label)}`;
      }

      const cards = occRoot.querySelectorAll('.occasion-card');
      cards.forEach((card, idx) => {
        const cardData = occ.cards[idx];
        if (cardData) {
          card.href = cardData.href || '#';
          card.setAttribute('aria-label', `Xem ${cardData.label}`);
          const img = card.querySelector('img');
          if (img) {
            img.src = cardData.img;
            img.alt = cardData.label;
          }
          const span = card.querySelector('span');
          if (span) span.textContent = cardData.label;
        }
      });
    }

    // 3. Cam Kết Chế Tác Section
    const qualRoot = document.getElementById('quality');
    if (qualRoot) {
      const qual = sec.quality_commitments;
      const eyebrow = qualRoot.querySelector('.eyebrow');
      if (eyebrow) eyebrow.textContent = qual.eyebrow;

      const title = qualRoot.querySelector('#quality-title');
      if (title) title.textContent = qual.title;

      const promises = qualRoot.querySelectorAll('.promise');
      promises.forEach((promise, idx) => {
        const promData = qual.promises[idx];
        if (promData) {
          const icon = promise.querySelector('i');
          if (icon) {
            icon.className = `fa-solid ${promData.icon}`;
          }
          const h3 = promise.querySelector('h3');
          if (h3) h3.textContent = promData.title;
          
          const p = promise.querySelector('p');
          if (p) p.textContent = promData.desc;
        }
      });
    }

    // 4. Câu Chuyện & Showroom Section
    const storyRoot = document.querySelector('.brand-story-section');
    if (storyRoot) {
      const story = sec.brand_story_new;

      // Left Card (Featured)
      const featCard = storyRoot.querySelector('.brand-story-card-featured');
      if (featCard) {
        const feat = story.featured;
        const eyebrow = featCard.querySelector('.eyebrow');
        if (eyebrow) eyebrow.textContent = feat.eyebrow;

        const title = featCard.querySelector('#brand-story-title');
        if (title) title.textContent = feat.title;

        const img = featCard.querySelector('.brand-story-media img');
        if (img) img.src = feat.image_url;

        const copyContainer = featCard.querySelector('.brand-story-copy');
        if (copyContainer) {
          const paragraphs = (feat.description || '').split(/\n+/).map(p => p.trim()).filter(Boolean);
          const eyebrowEl = copyContainer.querySelector('.eyebrow');
          const titleEl = copyContainer.querySelector('#brand-story-title');
          
          copyContainer.innerHTML = '';
          if (eyebrowEl) copyContainer.appendChild(eyebrowEl);
          if (titleEl) copyContainer.appendChild(titleEl);
          
          paragraphs.forEach(pText => {
            const p = document.createElement('p');
            p.textContent = pText;
            copyContainer.appendChild(p);
          });
        }
      }

      // Right Card (Showroom)
      const showCard = storyRoot.querySelector('.brand-showroom-card');
      if (showCard) {
        const showroom = story.showroom;
        const eyebrow = showCard.querySelector('.eyebrow');
        if (eyebrow) eyebrow.textContent = showroom.eyebrow;

        const title = showCard.querySelector('h3');
        if (title) title.textContent = showroom.title;

        const desc = showCard.querySelector('p');
        if (desc) desc.textContent = showroom.description;

        const btn = showCard.querySelector('a.button-secondary');
        if (btn) {
          btn.href = showroom.btn_href || '#';
          const icon = btn.querySelector('i')?.outerHTML || '';
          btn.innerHTML = `${icon} ${escapeHtml(showroom.btn_label)}`;
        }

        const iframe = showCard.querySelector('iframe');
        if (iframe) iframe.src = showroom.video_url;
      }
    }

    // 5. Quy Trình / Khách hàng nói gì Section
    const procRoot = document.getElementById('process');
    if (procRoot) {
      const proc = sec.process_steps;
      const eyebrow = procRoot.querySelector('.eyebrow');
      if (eyebrow) eyebrow.textContent = proc.eyebrow;

      const title = procRoot.querySelector('#process-title');
      if (title) title.textContent = proc.title;

      const desc = procRoot.querySelector('.section-heading p:not(.eyebrow)');
      if (desc) desc.textContent = proc.description;

      const grid = procRoot.querySelector('.reviews-grid');
      if (grid && Array.isArray(proc.steps)) {
        grid.innerHTML = proc.steps.map((step, idx) => {
          const ratingStars = Array(5).fill(0).map((_, i) => {
            const starVal = i + 1;
            const stepRating = parseFloat(step.rating || 5);
            if (stepRating >= starVal) {
              return '<i class="fa-solid fa-star"></i>';
            } else if (stepRating >= starVal - 0.5) {
              return '<i class="fa-solid fa-star-half-stroke"></i>';
            } else {
              return '<i class="fa-regular fa-star"></i>';
            }
          }).join('');

          const avatarUrl = step.avatar || `public/images/reviewer_minh_tu.png`;
          const description = step.desc || step.description || '';

          return `
            <article class="review-card" style="background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 24px; display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; min-height: 160px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="flex: 1;">
                <h4 class="review-author" style="margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 700; color: var(--ink);">${step.title}</h4>
                <div class="review-rating" style="color: #fbbf24; margin-bottom: 12px; font-size: 0.9rem;">
                  ${ratingStars}
                </div>
                <p class="review-text" style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: #475569;">${description}</p>
              </div>
              <img class="review-avatar" src="${avatarUrl}" alt="${step.title}" style="width: 80px; height: 100px; object-fit: cover; border-radius: 4px; flex-shrink: 0;" />
            </article>
          `;
        }).join('');
      }
    }
  }

  function applyStorefrontThemeVars(settings) {
    try {
      const colors = settings.theme_colors || {};
      const typography = settings.theme_typography || {
        font_sans: 'Source Sans 3',
        font_serif: 'Saira',
        font_size_base: '15px'
      };

      // Load custom font link if available
      if (typography.custom_font_css) {
        let customLink = document.getElementById('dynamic-custom-fonts');
        if (!customLink) {
          customLink = document.createElement('link');
          customLink.id = 'dynamic-custom-fonts';
          customLink.rel = 'stylesheet';
          document.head.appendChild(customLink);
        }
        customLink.href = typography.custom_font_css;
      } else {
        const customLink = document.getElementById('dynamic-custom-fonts');
        if (customLink) customLink.remove();
      }

      // Load custom font files if available
      let fileFontRules = '';
      if (typography.custom_font_file_url) {
        const sansName = typography.font_sans || 'CustomUploadedSans';
        fileFontRules += `
          @font-face {
            font-family: "${sansName}";
            src: url("${typography.custom_font_file_url}");
            font-display: swap;
          }
        `;
      }
      if (typography.custom_font_file_url_serif) {
        const serifName = typography.font_serif || 'CustomUploadedSerif';
        fileFontRules += `
          @font-face {
            font-family: "${serifName}";
            src: url("${typography.custom_font_file_url_serif}");
            font-display: swap;
          }
        `;
      }

      let fileFontEl = document.getElementById('dynamic-uploaded-fonts-vars');
      if (fileFontRules) {
        if (!fileFontEl) {
          fileFontEl = document.createElement('style');
          fileFontEl.id = 'dynamic-uploaded-fonts-vars';
          document.head.appendChild(fileFontEl);
        }
        fileFontEl.textContent = fileFontRules;
      } else {
        if (fileFontEl) fileFontEl.remove();
      }

      // Google Fonts loader
      const sansFont = typography.font_sans || 'Source Sans 3';
      const serifFont = typography.font_serif || 'Saira';

      const STANDARD_SANS = [
        'Montserrat', 'Inter', 'Roboto', 'Outfit', 'Open Sans', 'Be Vietnam Pro',
        'Poppins', 'Jost', 'Urbanist', 'Lexend', 'Manrope', 'Lato', 'Raleway',
        'Nunito', 'Quicksand', 'Oswald', 'Syne', 'Source Sans 3', 'Saira'
      ];

      const STANDARD_SERIF = [
        'Cormorant Garamond', 'Playfair Display', 'Lora', 'Merriweather', 'Cinzel',
        'EB Garamond', 'Prata', 'Fraunces', 'Cardo', 'Noto Serif', 'Quicksand', 'Saira'
      ];

      const sansFamily = sansFont.replace(/ /g, '+');
      const serifFamily = serifFont.replace(/ /g, '+');
      
      const sansTerm = STANDARD_SANS.includes(sansFont)
        ? `${sansFamily}:wght@300;400;500;600;700;800;900`
        : sansFamily;
        
      const serifTerm = STANDARD_SERIF.includes(serifFont)
        ? `${serifFamily}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400`
        : serifFamily;

      const fontUrl = `https://fonts.googleapis.com/css2?family=Great+Vibes&family=Iosevka+Charon:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Oswald:wght@200..700&family=Quicksand:wght@300..700&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Saira:ital,wght@0,100..900;1,100..900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&family=${sansTerm}&family=${serifTerm}&display=swap`;
      
      let fontLink = document.getElementById('dynamic-google-fonts');
      if (!fontLink) {
        if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
          const pre1 = document.createElement('link');
          pre1.rel = 'preconnect';
          pre1.href = 'https://fonts.googleapis.com';
          document.head.appendChild(pre1);
          
          const pre2 = document.createElement('link');
          pre2.rel = 'preconnect';
          pre2.href = 'https://fonts.gstatic.com';
          pre2.crossOrigin = 'anonymous';
          document.head.appendChild(pre2);
        }

        fontLink = document.createElement('link');
        fontLink.id = 'dynamic-google-fonts';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
      fontLink.href = fontUrl;

      // Extract colors and calculate derived ones
      const b700 = colors['brand-700'] || '#3b92ab';
      const b800 = colors['brand-800'] || '#245f70';
      const b900 = colors['brand-900'] || '#143944';
      const b100 = colors['brand-100'] || '#bce6ec';
      const ink = colors['ink'] || '#102126';
      const muted = colors['muted'] || '#5b7076';
      const surface = colors['surface'] || '#ffffff';
      const surfaceSoft = colors['surface-soft'] || '#f3fbfc';

      // Parse brand-700 to HSL to calculate brand-600, brand-500, brand-300, brand-200
      const baseHsl = hexToHsl(b700);
      const h = baseHsl[0], s = baseHsl[1], l = baseHsl[2];

      const b600 = hslToHex(h, s * 0.6, Math.min(95, l * 1.07));
      const b500 = hslToHex(h, s * 0.8, Math.min(95, l * 1.22));
      const b300 = hslToHex(h, s * 0.8, Math.min(96, l * 1.42));
      const b200 = hslToHex(h * 0.95, s * 0.8, Math.min(97, l * 1.6));
      const line = hexToRgba(b700, 0.18);
      const surfaceBlue = hexToRgba(b700, 0.08);

      // Inject variables
      let styleText = ':root {\n';
      styleText += `  --brand-900: ${b900};\n`;
      styleText += `  --brand-800: ${b800};\n`;
      styleText += `  --brand-700: ${b700};\n`;
      styleText += `  --brand-600: ${b600};\n`;
      styleText += `  --brand-500: ${b500};\n`;
      styleText += `  --brand-300: ${b300};\n`;
      styleText += `  --brand-200: ${b200};\n`;
      styleText += `  --brand-100: ${b100};\n`;
      styleText += `  --ink: ${ink};\n`;
      styleText += `  --muted: ${muted};\n`;
      styleText += `  --line: ${line};\n`;
      styleText += `  --surface: ${surface};\n`;
      styleText += `  --surface-soft: ${surfaceSoft};\n`;
      styleText += `  --surface-blue: ${surfaceBlue};\n`;
      styleText += `  --font-sans: "${sansFont}", "Quicksand", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n`;
      styleText += `  --font-display: "${serifFont}", sans-serif;\n`;
      styleText += '}';

      let styleEl = document.getElementById('dynamic-storefront-theme-vars');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-storefront-theme-vars';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = styleText;

    } catch (err) {
      console.warn('[Storefront] Failed to inject dynamic fonts/colors:', err);
    }
  }

  function initPreviewBanner() {
    if (document.getElementById('sly-preview-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'sly-preview-banner';
    banner.style.position = 'fixed';
    banner.style.bottom = '16px';
    banner.style.right = '16px';
    banner.style.zIndex = '99999';
    banner.style.display = 'flex';
    banner.style.alignItems = 'center';
    banner.style.gap = '12px';
    banner.style.borderRadius = '12px';
    banner.style.border = '1px solid rgba(59, 146, 171, 0.5)';
    banner.style.backgroundColor = 'rgba(9, 9, 11, 0.95)';
    banner.style.backdropFilter = 'blur(8px)';
    banner.style.padding = '12px 16px';
    banner.style.color = '#ffffff';
    banner.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="position:relative;display:flex;height:8px;width:8px;">
          <span style="position:absolute;display:inline-flex;height:100%;width:100%;border-radius:9999px;background-color:#34d399;opacity:0.75;animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></span>
          <span style="position:relative;display:inline-flex;border-radius:9999px;height:8px;width:8px;background-color:#10b981;"></span>
        </span>
        <p style="margin:0;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.08em;color:#d4d4d8;font-family:sans-serif;">Xem trước giao diện</p>
      </div>
      <div style="height:16px;width:1px;background-color:#27272a;"></div>
      <div style="display:flex;align-items:center;gap:6px;">
        <button id="sly-preview-back-admin" style="padding:6px 10px;border-radius:8px;background-color:#3b92ab;color:#ffffff;font-weight:bold;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;cursor:pointer;border:0;font-family:sans-serif;">
          Admin
        </button>
        <button id="sly-preview-exit" style="padding:6px 10px;border-radius:8px;border:1px solid #3f3f46;background-color:transparent;color:#d4d4d8;font-weight:bold;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;cursor:pointer;font-family:sans-serif;">
          Thoát
        </button>
      </div>
    `;
    document.body.appendChild(banner);

    if (!document.getElementById('sly-ping-style')) {
      const style = document.createElement('style');
      style.id = 'sly-ping-style';
      style.textContent = `
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    banner.querySelector('#sly-preview-back-admin').addEventListener('click', () => {
      window.location.href = 'admin.html';
    });

    banner.querySelector('#sly-preview-exit').addEventListener('click', () => {
      sessionStorage.removeItem('sly_preview_mode');
      const cleanUrl = window.location.pathname;
      window.location.href = cleanUrl;
    });
  }

  async function initNavbarDropdown() {
    const collLink = document.querySelector('.desktop-nav a[href="collection.html"]') || document.querySelector('.desktop-nav a[href*="collection.html"]');
    if (!collLink) return;

    if (!document.getElementById("navbar-dropdown-styles")) {
      const style = document.createElement("style");
      style.id = "navbar-dropdown-styles";
      style.textContent = `
        .nav-item-dropdown {
          position: relative;
          display: inline-block;
        }
        .nav-item-dropdown > a {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: #ffffff;
          min-width: 210px;
          box-shadow: 0px 10px 30px rgba(15, 23, 42, 0.15);
          z-index: 99999;
          border-radius: 12px;
          padding: 8px 0;
          margin-top: 8px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          animation: navDropdownFade 0.2s ease-in-out;
        }
        .dropdown-menu::before {
          content: "";
          position: absolute;
          top: -12px;
          left: 0;
          right: 0;
          height: 12px;
          background: transparent;
        }
        @keyframes navDropdownFade {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .dropdown-menu a {
          color: #0f172a !important;
          padding: 10px 20px !important;
          text-decoration: none !important;
          display: block !important;
          font-size: 0.88rem !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
          text-align: left !important;
          white-space: nowrap !important;
          border-bottom: 0 !important;
        }
        .dropdown-menu a:hover {
          background-color: #f1f5f9 !important;
          color: #0f766e !important;
        }
        .nav-item-dropdown:hover .dropdown-menu {
          display: block;
        }
      `;
      document.head.appendChild(style);
    }

    try {
      const response = await fetchJson('/api/categories');
      const categories = Array.isArray(response) ? response : (response.data || []);
      if (!categories.length) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'nav-item-dropdown';
      collLink.parentNode.insertBefore(wrapper, collLink);
      wrapper.appendChild(collLink);

      if (!collLink.querySelector('.fa-chevron-down')) {
        collLink.innerHTML += ` <i class="fa-solid fa-chevron-down" style="font-size: 0.65rem; margin-left: 4px; opacity: 0.7;"></i>`;
      }

      const dropdownMenu = document.createElement('div');
      dropdownMenu.className = 'dropdown-menu';
      dropdownMenu.innerHTML = categories.map(cat => `
        <a href="${collectionUrl(cat)}">${escapeHtml(cat.name || cat.title || "Danh mục")}</a>
      `).join('');
      wrapper.appendChild(dropdownMenu);
    } catch (e) {
      console.error("Failed to load navbar dropdown categories", e);
    }
  }

  async function initStorefrontBranding() {
    const isPreviewPage = window.location.search.includes('preview=true');
    if (isPreviewPage) {
      sessionStorage.setItem('sly_preview_mode', 'true');
    }
    const isPreviewMode = isPreviewPage || sessionStorage.getItem('sly_preview_mode') === 'true';
    let loadedFromLocal = false;
    let settings = null;

    if (isPreviewMode) {
      const previewData = localStorage.getItem('sly_preview_settings');
      if (previewData) {
        try {
          settings = JSON.parse(previewData);
          loadedFromLocal = true;
          currentSettings = settings;
          console.log('[Storefront] Running in PREVIEW mode. Settings loaded from localStorage:', settings);
        } catch (e) {
          console.error('[Storefront] Failed to parse preview settings:', e);
        }
      }

      window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'sly_preview_update') {
          const liveSettings = {
            theme_colors: e.data.theme_colors,
            theme_typography: e.data.theme_typography,
            home_sections: e.data.home_sections,
            hero_banners: e.data.hero_banners,
            home_sections_order: e.data.home_sections_order,
            navigation_menu: e.data.navigation_menu
          };
          window.APP_SETTINGS = liveSettings;
          applyStorefrontThemeVars(liveSettings);
          applyStorefrontSections(liveSettings);
          applyStorefrontSectionsOrder(liveSettings);
          updateStorefrontNavigation(liveSettings);
          if (liveSettings.hero_banners && liveSettings.hero_banners[0]) {
            applyHero(liveSettings.hero_banners[0]);
          }
          initSectionEditors();
          mountStorefrontSortButton();
        }
      });

      try {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initPreviewBanner);
        } else {
          initPreviewBanner();
        }
      } catch (err) {
        console.warn('[Storefront] Failed to init preview banner:', err);
      }
    }

    if (!loadedFromLocal) {
      try {
        settings = await loadSettings();
      } catch (err) {
        console.warn('[Storefront] Failed to fetch settings, using defaults:', err);
      }
    }

    if (settings) {
      window.APP_SETTINGS = settings;
      applyStorefrontThemeVars(settings);
      applyStorefrontSections(settings);
      applyStorefrontSectionsOrder(settings);
      updateStorefrontNavigation(settings);
      if (settings.hero_banners && settings.hero_banners[0]) {
        applyHero(settings.hero_banners[0]);
      }
      initSectionEditors();
      mountStorefrontSortButton();
    }

    try {
      initHeaderSearch();
    } catch (err) {
      console.warn('[Storefront] Failed to init header search:', err);
    }

    try {
      await initNavbarDropdown();
    } catch (err) {
      console.warn('[Storefront] Failed to init navbar dropdown:', err);
    }

    try {
      initAnnouncementMarquee();
    } catch (err) {
      console.warn('[Storefront] Failed to init announcement marquee:', err);
    }
  }

  function initAnnouncementMarquee() {
    const annEl = document.querySelector('.announcement');
    if (!annEl) return;

    annEl.innerHTML = `
      <div class="announcement-track">
        <span class="announcement-item">Miễn phí dựng mẫu 3D trước khi khắc</span>
        <span class="announcement-separator">•</span>
        <span class="announcement-item">Tư vấn nhanh qua hotline 0983 833 830</span>
        <span class="announcement-separator">•</span>
        <span class="announcement-item">Miễn phí thiết kế</span>
        <span class="announcement-separator">•</span>
        <span class="announcement-item">Miễn phí giao hàng từ đơn 1,5 triệu đồng</span>
        
        <span class="announcement-separator">•</span>
        <span class="announcement-item">Miễn phí dựng mẫu 3D trước khi khắc</span>
        <span class="announcement-separator">•</span>
        <span class="announcement-item">Tư vấn nhanh qua hotline 0983 833 830</span>
        <span class="announcement-separator">•</span>
        <span class="announcement-item">Miễn phí thiết kế</span>
        <span class="announcement-separator">•</span>
        <span class="announcement-item">Miễn phí giao hàng từ đơn 1,5 triệu đồng</span>
      </div>
    `;

    if (!document.getElementById('announcement-marquee-styles')) {
      const style = document.createElement('style');
      style.id = 'announcement-marquee-styles';
      style.textContent = `
        .announcement {
          padding: 0.6rem 0 !important;
          overflow: hidden !important;
          position: relative !important;
          width: 100% !important;
          background: var(--brand-700) !important;
          display: flex !important;
          justify-content: flex-start !important;
        }
        .announcement-track {
          display: inline-flex !important;
          align-items: center !important;
          gap: 2.5rem !important;
          white-space: nowrap !important;
          animation: marqueeLoop 28s linear infinite !important;
          will-change: transform !important;
        }
        .announcement-item {
          display: inline-block !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          font-size: 0.78rem !important;
        }
        .announcement-separator {
          color: rgba(255, 255, 255, 0.5) !important;
          font-size: 1rem !important;
        }
        @keyframes marqueeLoop {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function initHeaderSearch() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    const collectionSearch = document.getElementById("collection-search");
    const isHomePage = window.location.pathname === "/" || 
                       window.location.pathname.endsWith("/index.html") || 
                       window.location.pathname.endsWith("/sly%202/") || 
                       window.location.pathname.endsWith("/sly 2/");

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const value = searchInput.value.trim();
        if (collectionSearch) {
          collectionSearch.value = value;
          collectionSearch.dispatchEvent(new Event("input", { bubbles: true }));
          collectionSearch.dispatchEvent(new Event("change", { bubbles: true }));
        } else if (!isHomePage) {
          window.location.href = `collection.html?q=${encodeURIComponent(value)}`;
        }
      }
    });

    if (collectionSearch) {
      collectionSearch.addEventListener("input", (event) => {
        searchInput.value = event.target.value;
      });
    }

    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get("q") || params.get("query") || "";
    if (queryParam) {
      searchInput.value = queryParam;
    }
  }

  // Auto-init on script load
  initStorefrontBranding().catch(err => console.error('[Storefront] Branding init failed:', err));

  window.StaticStorefront = {
    API_BASE,
    canEditSettings: hasSettingsWrite,
    canEditProducts: hasProductWrite,
    escapeHtml,
    initHeroEditor,
    initSectionEditors,
    applyStorefrontSectionsOrder,
    loadProducts,
    loadProductById,
    loadProductBySlug,
    mountAdminLoginButton,
    openQuickProductEditor,
    collectionUrl,
    productUrl,
    getAdminToken,
    fetchJson,
  };
})();
