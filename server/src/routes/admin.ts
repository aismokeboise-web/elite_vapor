import { Router, Request, Response } from "express";
import type { Multer } from "multer";
import prisma from "../prisma";

export function createAdminRouter(upload: Multer): Router {
  const router = Router();

  // Admin index – links to sections
  router.get("/", (_req: Request, res: Response) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Admin – Elite Vapor Gaming</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background:#0b0c10; color:#f5f5f5; }
    h1 { color:#66fcf1; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.5rem 0; }
    a { color:#66fcf1; }
  </style>
</head>
<body>
  <h1>Admin</h1>
  <ul>
    <li><a href="/admin/brands">Brands</a></li>
    <li><a href="/admin/categories">Categories</a></li>
    <li><a href="/admin/products">Products</a></li>
    <li><a href="/admin/models/images">Model images</a></li>
    <li><a href="/admin/messages">Contact messages</a></li>
    <li><a href="/admin/newsletter-subscriptions">Newsletter subscriptions</a></li>
  </ul>
</body>
</html>`);
});

// Create brand form
router.get("/brands/new", (_req: Request, res: Response) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Create Brand – Elite Vapor Gaming</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background:#0b0c10; color:#f5f5f5; }
    h1 { color:#66fcf1; }
    fieldset { border:1px solid #45a29e; border-radius:8px; padding:1rem 1.5rem; margin-bottom:2rem; background:#1f2833; }
    legend { padding:0 0.5rem; color:#66fcf1; }
    label { display:block; margin-top:0.5rem; font-size:0.9rem; }
    input, select { width:100%; padding:0.4rem 0.5rem; margin-top:0.2rem; border-radius:4px; border:1px solid #45a29e; background:#0b0c10; color:#f5f5f5; }
    button { margin-top:0.75rem; padding:0.5rem 1rem; border-radius:4px; border:none; background:#45a29e; color:#0b0c10; font-weight:600; cursor:pointer; }
    a { color:#66fcf1; }
    small { opacity:.7; }
    .form-error { color: #e74c3c; font-size: 0.9rem; margin-top: 0.25rem; display: none; }
    .form-error.visible { display: block; }
  </style>
</head>
<body>
  <h1>Create Brand</h1>
  <p><a href="/admin/brands">Back to brands list</a></p>
  <form id="brand-create-form">
    <fieldset>
      <legend>New Brand</legend>
      <label>Name <input name="name" required /></label>
      <label>
        Category
        <input type="text" id="brand-category-search" placeholder="Search category..." autocomplete="off" />
        <select name="categoryId" id="brand-category-select" aria-describedby="brand-category-error">
          <option value="">-- Select category --</option>
        </select>
        <p id="brand-category-error" class="form-error" role="alert"></p>
      </label>
      <button type="submit">Create Brand</button>
    </fieldset>
  </form>
  <script>
    (function() {
      var form = document.getElementById("brand-create-form");
      var catSearch = document.getElementById("brand-category-search");
      var catSelect = document.getElementById("brand-category-select");
      var catError = document.getElementById("brand-category-error");
      function showCatError(msg) { catError.textContent = msg || "Please select a category."; catError.classList.add("visible"); }
      function clearCatError() { catError.textContent = ""; catError.classList.remove("visible"); }
      catSelect.onchange = function() { clearCatError(); var o = this.options[this.selectedIndex]; if (o && o.value) catSearch.value = o.textContent; };
      catSearch.oninput = function() {
        var q = this.value.toLowerCase();
        Array.from(catSelect.options).forEach(function(opt) {
          if (opt.value === "") { opt.hidden = false; return; }
          opt.hidden = q && !(opt.textContent || "").toLowerCase().includes(q);
        });
      };
      async function loadCategories() {
        var r = await fetch("/api/categories");
        if (!r.ok) return;
        var list = await r.json();
        catSelect.innerHTML = '<option value="">-- Select category --</option>' +
          list.map(function(c) { return '<option value="' + c.id + '">' + (c.name || '') + '</option>'; }).join("");
      }
      form.onsubmit = async function(e) {
        e.preventDefault();
        clearCatError();
        var categoryId = catSelect.value || null;
        if (!categoryId) { showCatError("Please select a category."); return; }
        var body = { name: form.name.value, categoryId: categoryId };
        try {
          var r = await fetch("/api/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          if (!r.ok) throw new Error(await r.text());
          alert("Brand created");
          form.reset();
          catSearch.value = "";
          loadCategories();
        } catch (err) { alert("Failed: " + err.message); }
      };
      loadCategories();
    })();
  </script>
</body>
</html>`);
});

// Edit brand form
router.get("/brands/edit", (_req: Request, res: Response) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Edit Brand – Elite Vapor Gaming</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 2rem; background:#0b0c10; color:#f5f5f5; }
    h1 { color:#66fcf1; }
    fieldset { border:1px solid #45a29e; border-radius:8px; padding:1rem 1.5rem; margin-bottom:2rem; background:#1f2833; }
    legend { padding:0 0.5rem; color:#66fcf1; }
    label { display:block; margin-top:0.5rem; font-size:0.9rem; }
    input { width:100%; padding:0.4rem 0.5rem; margin-top:0.2rem; border-radius:4px; border:1px solid #45a29e; background:#0b0c10; color:#f5f5f5; }
    button { margin-top:0.75rem; padding:0.5rem 1rem; border-radius:4px; border:none; background:#45a29e; color:#0b0c10; font-weight:600; cursor:pointer; }
    button:hover { background:#66fcf1; }
    small { opacity:.7; }
    a { color:#66fcf1; }
  </style>
</head>
<body>
  <h1>Edit Brand</h1>
  <p><a href="/admin/brands">Back to brands list</a></p>
  <form id="brand-edit-form">
    <fieldset>
      <legend>Update Brand</legend>
      <label>Brand ID <small>(existing brand id)</small> <input name="id" required /></label>
      <label>Name <input name="name" required /></label>
      <label>
        Category
        <input type="text" id="brand-edit-category-search" placeholder="Search category..." autocomplete="off" />
        <select name="categoryId" id="brand-edit-category-select">
          <option value="">-- Select category --</option>
        </select>
      </label>
      <button type="submit">Update Brand</button>
    </fieldset>
  </form>
  <script>
    (function() {
      var form = document.getElementById("brand-edit-form");
      var catSearch = document.getElementById("brand-edit-category-search");
      var catSelect = document.getElementById("brand-edit-category-select");
      catSelect.onchange = function() { var o = this.options[this.selectedIndex]; if (o && o.value) catSearch.value = o.textContent; };
      catSearch.oninput = function() {
        var q = this.value.toLowerCase();
        Array.from(catSelect.options).forEach(function(opt) {
          if (opt.value === "") { opt.hidden = false; return; }
          opt.hidden = q && !(opt.textContent || "").toLowerCase().includes(q);
        });
      };
      async function loadCategories() {
        var r = await fetch("/api/categories");
        if (!r.ok) return;
        var list = await r.json();
        catSelect.innerHTML = '<option value="">-- Select category --</option>' +
          list.map(function(c) { return '<option value="' + c.id + '">' + (c.name || '') + '</option>'; }).join("");
      }
      form.onsubmit = async function(e) {
        e.preventDefault();
        var id = form.id.value;
        var categoryId = catSelect.value || null;
        var body = { name: form.name.value, categoryId: categoryId };
        try {
          var res = await fetch("/api/brands/" + encodeURIComponent(id), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          if (!res.ok) throw new Error(await res.text());
          alert("Brand updated");
          form.reset();
          catSearch.value = "";
          loadCategories();
        } catch (err) { alert("Failed: " + err.message); }
      };
      loadCategories();
    })();
  </script>
</body>
</html>`);
});

// Brands list
router.get("/brands", async (_req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany();
    const items = brands
      .map(
        (b: { name: string; id: string }) =>
          `<li><strong>${b.name}</strong> – id: <code>${b.id}</code></li>`
      )
      .join("");
    res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Brands – Elite Vapor Gaming</title>
</head>
<body>
  <h1>Brands</h1>
  <ul>${items || "<li>No brands yet</li>"}</ul>
  <p><a href="/admin">Back to admin</a></p>
</body>
</html>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load brands");
  }
});

// Categories list
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    const items = categories
      .map(
        (c: { name: string; id: string }) =>
          `<li><strong>${c.name}</strong> – id: <code>${c.id}</code></li>`
      )
      .join("");
    res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Categories – Elite Vapor Gaming</title>
</head>
<body>
  <h1>Categories</h1>
  <p><a href="/admin/categories/new">Create category</a></p>
  <ul>${items || "<li>No categories yet</li>"}</ul>
  <p><a href="/admin">Back to admin</a></p>
</body>
</html>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load categories");
  }
});

// Create category form
router.get("/categories/new", (_req: Request, res: Response) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Create Category – Elite Vapor Gaming</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background:#0b0c10; color:#f5f5f5; }
    h1 { color:#66fcf1; }
    fieldset { border:1px solid #45a29e; border-radius:8px; padding:1rem 1.5rem; margin-bottom:2rem; background:#1f2833; }
    legend { padding:0 0.5rem; color:#66fcf1; }
    label { display:block; margin-top:0.5rem; font-size:0.9rem; }
    input { width:100%; padding:0.4rem 0.5rem; margin-top:0.2rem; border-radius:4px; border:1px solid #45a29e; background:#0b0c10; color:#f5f5f5; }
    button { margin-top:0.75rem; padding:0.5rem 1rem; border-radius:4px; border:none; background:#45a29e; color:#0b0c10; font-weight:600; cursor:pointer; }
    a { color:#66fcf1; }
    small { opacity:.7; }
  </style>
</head>
<body>
  <h1>Create Category</h1>
  <p><a href="/admin/categories">Back to categories list</a></p>
  <form id="category-create-form">
    <fieldset>
      <legend>New Category</legend>
      <label>
        Name <small>(e.g. Devices)</small>
        <input name="name" required />
      </label>
      <button type="submit">Create Category</button>
    </fieldset>
  </form>
  <script>
    document.getElementById("category-create-form").addEventListener("submit", async function(e) {
      e.preventDefault();
      var form = e.target;
      var body = { name: form.name.value };
      try {
        var r = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!r.ok) throw new Error(await r.text());
        alert("Category created");
        form.reset();
      } catch (err) { alert("Failed: " + err.message); }
    });
  </script>
</body>
</html>`);
});

// Create product form – basic Product fields + modelIds
router.get("/products/new", (_req: Request, res: Response) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Create Product – Elite Vapor Gaming</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background:#0b0c10; color:#f5f5f5; }
    h1 { color:#66fcf1; }
    fieldset { border:1px solid #45a29e; border-radius:8px; padding:1rem 1.5rem; margin-bottom:2rem; background:#1f2833; }
    legend { padding:0 0.5rem; color:#66fcf1; }
    label { display:block; margin-top:0.5rem; font-size:0.9rem; }
    input, select, textarea { width:100%; padding:0.4rem 0.5rem; margin-top:0.2rem; border-radius:4px; border:1px solid #45a29e; background:#0b0c10; color:#f5f5f5; }
    .row { display:flex; gap:1rem; }
    .row > div { flex:1; }
    button { margin-top:0.75rem; padding:0.5rem 1rem; border-radius:4px; border:none; background:#45a29e; color:#0b0c10; font-weight:600; cursor:pointer; }
    a { color:#66fcf1; }
    small { opacity:.7; }
    .form-error { color: #e74c3c; font-size: 0.9rem; margin-top: 0.25rem; display: none; }
    .form-error.visible { display: block; }
  </style>
</head>
<body>
  <h1>Create Product</h1>
  <p><a href="/admin/products">Back to products list</a></p>
  <form id="product-create-form">
    <fieldset>
      <legend>New Product</legend>
      <label>Name <input name="name" required /></label>
      <div class="row">
        <div>
          <label>Size <small>(e.g. 60ml)</small> <input name="size" /></label>
        </div>
        <div>
          <label>Nicotine strength <input name="nicotineStrength" /></label>
        </div>
      </div>
      <label>
        Brand
        <input type="text" id="product-brand-search" placeholder="Search brand..." autocomplete="off" />
        <select name="brandId" id="product-brand-select" aria-describedby="product-brand-error">
          <option value="">-- Select brand --</option>
        </select>
        <p id="product-brand-error" class="form-error" role="alert"></p>
      </label>
      <label>
        Model IDs <small>(comma separated Model.id values)</small>
        <input name="modelIds" />
      </label>
      <button type="submit">Create Product</button>
    </fieldset>
  </form>
  <script>
    (function() {
      var form = document.getElementById("product-create-form");
      var brandSearch = document.getElementById("product-brand-search");
      var brandSelect = document.getElementById("product-brand-select");
      var brandError = document.getElementById("product-brand-error");

      function filterSelect(input, select) {
        var q = input.value.toLowerCase();
        Array.from(select.options).forEach(function(opt) {
          if (opt.value === "") { opt.hidden = false; return; }
          opt.hidden = q && !(opt.textContent || "").toLowerCase().includes(q);
        });
      }
      brandSearch.oninput = function() { filterSelect(brandSearch, brandSelect); };
      function showBrandError(msg) {
        brandError.textContent = msg || "Please select a brand.";
        brandError.classList.add("visible");
      }
      function clearBrandError() {
        brandError.textContent = "";
        brandError.classList.remove("visible");
      }
      brandSelect.onchange = function() {
        clearBrandError();
        var o = this.options[this.selectedIndex];
        if (o && o.value) brandSearch.value = o.textContent;
      };

      async function loadBrands() {
        var r = await fetch("/api/brands");
        if (!r.ok) return;
        var list = await r.json();
        brandSelect.innerHTML = '<option value="">-- Select brand --</option>' +
          list.map(function(b) { return '<option value="' + b.id + '">' + (b.name || '') + '</option>'; }).join("");
      }

      form.onsubmit = async function(e) {
        e.preventDefault();
        clearBrandError();
        var brandId = brandSelect.value || null;
        if (!brandId) {
          showBrandError("Please select a brand.");
          return;
        }
        var modelIds = (form.modelIds.value || "")
          .split(",")
          .map(function(s) { return s.trim(); })
          .filter(Boolean);
        var body = {
          name: form.name.value,
          size: form.size.value || null,
          nicotineStrength: form.nicotineStrength.value || null,
          brandId: brandId,
          modelIds: modelIds
        };
        try {
          var r = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          if (!r.ok) throw new Error(await r.text());
          alert("Product created");
          form.reset();
          brandSearch.value = "";
          loadBrands();
        } catch (err) { alert("Failed: " + err.message); }
      };

      loadBrands();
    })();
  </script>
</body>
</html>`);
});

// Products list
router.get("/products", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { brand: true },
    });
    const items = products
      .map((p) => {
        const modelCount = Array.isArray((p as any).modelIds) ? (p as any).modelIds.length : 0;
        return `<li>
  <strong>${p.name}</strong><br/>
  Brand: <strong>${p.brand?.name ?? "—"}</strong><br/>
  Nic: ${p.nicotineStrength ?? "—"} – Size: ${p.size ?? "—"} – Models: ${modelCount}<br/>
  id: <code>${p.id}</code>
</li>`;
      })
      .join("");
    res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Products – Elite Vapor Gaming</title>
</head>
<body>
  <h1>Products</h1>
  <p><a href="/admin/products/new">Create product</a></p>
  <ul>${items || "<li>No products yet</li>"}</ul>
  <p><a href="/admin">Back to admin</a></p>
</body>
</html>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load products");
  }
});

// Contact messages list
router.get("/messages", async (_req: Request, res: Response) => {
  try {
    const messages = await (prisma as any).message.findMany({
      orderBy: { createdAt: "desc" },
    });
    const items = messages
      .map(
        (m) => `<li>
  <strong>${m.name}</strong> &lt;${m.email}&gt;<br/>
  <em>${m.subject ?? "(no subject)"}</em><br/>
  <small>${m.createdAt.toISOString()}</small><br/>
  <pre style="white-space:pre-wrap;font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${(m.message ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</pre>
</li>`
      )
      .join("");

    res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Contact Messages – Elite Vapor Gaming</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background:#0b0c10; color:#f5f5f5; }
    h1 { color:#66fcf1; }
    ul { list-style:none; padding:0; }
    li { margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid #1f2833; }
    pre { margin-top:0.5rem; }
    a { color:#66fcf1; }
  </style>
</head>
<body>
  <h1>Contact messages</h1>
  <ul>${items || "<li>No messages yet</li>"}</ul>
  <p><a href="/admin">Back to admin</a></p>
</body>
</html>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load messages");
  }
});

// Newsletter subscriptions list
router.get("/newsletter-subscriptions", async (_req: Request, res: Response) => {
  try {
    const subs = await (prisma as any).newsletterSubscription.findMany({
      orderBy: { createdAt: "desc" },
    });
    const items = subs
      .map(
        (s) => `<li>
  <strong>${s.email}</strong><br/>
  <small>${s.createdAt.toISOString()}</small>
</li>`
      )
      .join("");

    res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Newsletter Subscriptions – Elite Vapor Gaming</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background:#0b0c10; color:#f5f5f5; }
    h1 { color:#66fcf1; }
    ul { list-style:none; padding:0; }
    li { margin-bottom:0.75rem; padding-bottom:0.5rem; border-bottom:1px solid #1f2833; }
    a { color:#66fcf1; }
  </style>
</head>
<body>
  <h1>Newsletter subscriptions</h1>
  <ul>${items || "<li>No subscriptions yet</li>"}</ul>
  <p><a href="/admin">Back to admin</a></p>
</body>
</html>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load newsletter subscriptions");
  }
});

// Model images upload form
router.get("/models/images", (req: Request, res: Response) => {
  const success = req.query.success === "1";
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Upload Model Images – Admin</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background:#0b0c10; color:#f5f5f5; }
    h1 { color:#66fcf1; }
    fieldset { border:1px solid #45a29e; border-radius:8px; padding:1rem 1.5rem; margin-bottom:2rem; background:#1f2833; max-width: 600px; }
    legend { padding:0 0.5rem; color:#66fcf1; }
    label { display:block; margin-top:0.75rem; font-size:0.9rem; }
    input[type="text"], select { width:100%; max-width:400px; padding:0.4rem 0.5rem; margin-top:0.2rem; border-radius:4px; border:1px solid #45a29e; background:#0b0c10; color:#f5f5f5; }
    input[type="file"] { margin-top:0.25rem; }
    button { margin-top:1rem; padding:0.5rem 1rem; border-radius:4px; border:none; background:#45a29e; color:#0b0c10; font-weight:600; cursor:pointer; }
    button:hover { background:#66fcf1; }
    a { color:#66fcf1; }
    .form-error { color: #e74c3c; font-size: 0.9rem; margin-top: 0.25rem; display: none; }
    .form-error.visible { display: block; }
    .img-preview { max-width: 120px; max-height: 90px; margin-top: 0.5rem; border-radius: 4px; border: 1px solid #45a29e; }
  </style>
</head>
<body>
  <h1>Upload Model Images</h1>
  <p><a href="/admin">Back to admin</a></p>
  ${success ? '<p style="color:#66fcf1;font-weight:600;">Images updated successfully.</p>' : ""}
  <form id="model-images-form" enctype="multipart/form-data" method="post" action="/admin/models/images">
    <fieldset>
      <legend>Select model and upload images</legend>
      <label>
        Search model
        <input type="text" id="model-search" placeholder="Type to search models..." autocomplete="off" />
      </label>
      <label>
        Model
        <select name="modelId" id="model-select" required aria-describedby="model-error">
          <option value="">-- Select a model --</option>
        </select>
        <p id="model-error" class="form-error" role="alert"></p>
      </label>
      <label>
        Image 1 <small>(primary)</small>
        <input type="file" name="image1" accept="image/*" id="img1" />
        <img id="preview1" class="img-preview" alt="" style="display:none" />
      </label>
      <label>
        Image 2
        <input type="file" name="image2" accept="image/*" id="img2" />
        <img id="preview2" class="img-preview" alt="" style="display:none" />
      </label>
      <label>
        Image 3
        <input type="file" name="image3" accept="image/*" id="img3" />
        <img id="preview3" class="img-preview" alt="" style="display:none" />
      </label>
      <button type="submit">Update model images</button>
    </fieldset>
  </form>
  <script>
    (function() {
      var form = document.getElementById("model-images-form");
      var modelSearch = document.getElementById("model-search");
      var modelSelect = document.getElementById("model-select");
      var modelError = document.getElementById("model-error");

      function filterSelect() {
        var q = modelSearch.value.toLowerCase();
        Array.from(modelSelect.options).forEach(function(opt) {
          if (opt.value === "") { opt.hidden = false; return; }
          opt.hidden = q && !(opt.textContent || "").toLowerCase().includes(q);
        });
      }
      modelSearch.oninput = filterSelect;
      modelSelect.onchange = function() {
        modelError.classList.remove("visible");
        var o = this.options[this.selectedIndex];
        if (o && o.value) modelSearch.value = o.textContent;
      };

      async function loadModels() {
        var r = await fetch("/api/models");
        if (!r.ok) return;
        var list = await r.json();
        modelSelect.innerHTML = '<option value="">-- Select a model --</option>' +
          list.map(function(m) { return '<option value="' + m.id + '">' + (m.name || m.id) + '</option>'; }).join("");
      }

      [1,2,3].forEach(function(i) {
        var inp = document.getElementById("img" + i);
        var prev = document.getElementById("preview" + i);
        inp.onchange = function() {
          if (inp.files && inp.files[0]) {
            var url = URL.createObjectURL(inp.files[0]);
            prev.src = url;
            prev.style.display = "block";
          } else {
            prev.style.display = "none";
          }
        };
      });

      form.onsubmit = function(e) {
        modelError.classList.remove("visible");
        if (!modelSelect.value) {
          e.preventDefault();
          modelError.textContent = "Please select a model.";
          modelError.classList.add("visible");
          return false;
        }
        if (!document.getElementById("img1").files || !document.getElementById("img1").files[0]) {
          e.preventDefault();
          alert("Please upload at least image 1.");
          return false;
        }
      };

      loadModels();
    })();
  </script>
</body>
</html>`);
});

// Model images upload handler (multipart)
router.post(
  "/models/images",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const modelId = (req.body as { modelId?: string }).modelId;
      if (!modelId || typeof modelId !== "string") {
        res.status(400).send("Model ID is required.");
        return;
      }

      type FileArray = { filename: string }[];
      const files = (req as Request & {
        files?: { image1?: FileArray; image2?: FileArray; image3?: FileArray };
      }).files;

      const imageUrls: string[] = [];
      if (files?.image1?.[0]) imageUrls.push("/uploads/" + files.image1[0].filename);
      if (files?.image2?.[0]) imageUrls.push("/uploads/" + files.image2[0].filename);
      if (files?.image3?.[0]) imageUrls.push("/uploads/" + files.image3[0].filename);

      if (imageUrls.length === 0) {
        res.status(400).send("At least one image is required.");
        return;
      }

      const existing = await prisma.model.findUnique({ where: { id: modelId } });
      if (!existing) {
        res.status(404).send("Model not found.");
        return;
      }

      await prisma.model.update({
        where: { id: modelId },
        data: { imageUrls },
      });

      res.redirect("/admin/models/images?success=1");
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to upload images.");
    }
  }
);

  return router;
}
