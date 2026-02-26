import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { getUpload, getModelImageUpload } from "./middleware/upload";
import { adminGuard } from "./middleware/adminGuard";
import brandsRouter, { brandsWriteRouter } from "./routes/brands";
import categoriesRouter, { categoriesWriteRouter } from "./routes/categories";
import modelsRouter, { createModelsWriteRouter } from "./routes/models";
import contactRouter from "./routes/contact";
import adminAuthRouter from "./routes/adminAuth";
import { createProductsReadRouter, createProductsWriteRouter } from "./routes/products";
import { createAdminRouter } from "./routes/admin";

const app = express();

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.use(express.json());

const upload = getUpload(uploadsDir);
const modelImageUpload = getModelImageUpload(uploadsDir);

app.get("/", (_req: Request, res: Response) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>API Index – Elite Vapor</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 2rem; background:#020617; color:#e5e7eb; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; color:#22d3ee; }
    h2 { margin-top: 1.5rem; margin-bottom: 0.5rem; color:#a5b4fc; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    th, td { padding: 0.4rem 0.5rem; border-bottom: 1px solid #1f2937; font-size: 0.9rem; text-align: left; }
    th { background:#020617; color:#9ca3af; position: sticky; top:0; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    .tag { display:inline-block; padding:0.1rem 0.45rem; border-radius:999px; font-size:0.75rem; font-weight:600; }
    .GET { background:#05966933; color:#bbf7d0; border:1px solid #05966966; }
    .POST { background:#2563eb33; color:#bfdbfe; border:1px solid #2563eb66; }
    .PATCH { background:#d9770633; color:#fed7aa; border:1px solid #d9770666; }
    .DELETE { background:#dc262633; color:#fecaca; border:1px solid #dc262666; }
    a { color:#38bdf8; text-decoration:none; }
    a:hover { text-decoration:underline; }
    .section { margin-bottom: 1.75rem; }
  </style>
</head>
<body>
  <h1>API routes</h1>
  <p>Server is running. Below is a list of useful routes you can call from the client or inspect in the browser.</p>

  <div class="section">
  <h2>/api – Public API</h2>
  <table>
    <thead>
      <tr><th>Method</th><th>Path</th><th>Description</th><th>Access</th></tr>
    </thead>
    <tbody>
      <tr><td><span class="tag GET">GET</span></td><td><code>/api/products</code></td><td>List all products with models</td><td>Public</td></tr>
      <tr><td><span class="tag GET">GET</span></td><td><code>/api/products/:id</code></td><td>Get a single product with models</td><td>Public</td></tr>
      <tr><td><span class="tag GET">GET</span></td><td><code>/api/brands</code></td><td>List brands</td><td>Public</td></tr>
      <tr><td><span class="tag GET">GET</span></td><td><code>/api/categories</code></td><td>List categories</td><td>Public</td></tr>
      <tr><td><span class="tag GET">GET</span></td><td><code>/api/categories/:id</code></td><td>Get a single category</td><td>Public</td></tr>
      <tr><td><span class="tag GET">GET</span></td><td><code>/api/models</code></td><td>List models</td><td>Public</td></tr>
      <tr><td><span class="tag GET">GET</span></td><td><code>/api/models/:id</code></td><td>Get a single model</td><td>Public</td></tr>

      <tr><td><span class="tag POST">POST</span></td><td><code>/api/contact</code></td><td>Submit contact message (name, email, subject, message)</td><td>Public</td></tr>
      <tr><td><span class="tag POST">POST</span></td><td><code>/api/newsletter-subscriptions</code></td><td>Subscribe email to newsletter</td><td>Public</td></tr>
    </tbody>
  </table>
</div>

  <div class="section">
  <h2>/api/admin – Protected API (admin token)</h2>
  <table>
    <thead>
      <tr><th>Method</th><th>Path</th><th>Description</th><th>Access</th></tr>
    </thead>
    <tbody>
      <tr><td><span class="tag POST">POST</span></td><td><code>/api/admin/login</code></td><td>Admin login (returns 2-hour token)</td><td>Public</td></tr>
      <tr><td><span class="tag GET">GET</span></td><td><code>/api/admin/messages</code></td><td>List contact messages</td><td>Protected</td></tr>
      <tr><td><span class="tag GET">GET</span></td><td><code>/api/admin/newsletter-subscriptions</code></td><td>List newsletter subscriptions</td><td>Protected</td></tr>
      <tr><td><span class="tag POST">POST</span></td><td><code>/api/admin/products</code></td><td>Create a product</td><td>Protected</td></tr>
      <tr><td><span class="tag POST">POST</span></td><td><code>/api/admin/products/upload</code></td><td>Create a product with image upload</td><td>Protected</td></tr>
      <tr><td><span class="tag PATCH">PATCH</span></td><td><code>/api/admin/products/:id</code></td><td>Update a product</td><td>Protected</td></tr>
      <tr><td><span class="tag DELETE">DELETE</span></td><td><code>/api/admin/products/:id</code></td><td>Delete a product</td><td>Protected</td></tr>
      <tr><td><span class="tag POST">POST</span></td><td><code>/api/admin/brands</code></td><td>Create brand</td><td>Protected</td></tr>
      <tr><td><span class="tag PATCH">PATCH</span></td><td><code>/api/admin/brands/:id</code></td><td>Update brand</td><td>Protected</td></tr>
      <tr><td><span class="tag DELETE">DELETE</span></td><td><code>/api/admin/brands/:id</code></td><td>Delete brand</td><td>Protected</td></tr>
      <tr><td><span class="tag POST">POST</span></td><td><code>/api/admin/categories</code></td><td>Create category</td><td>Protected</td></tr>
      <tr><td><span class="tag PATCH">PATCH</span></td><td><code>/api/admin/categories/:id</code></td><td>Update category</td><td>Protected</td></tr>
      <tr><td><span class="tag DELETE">DELETE</span></td><td><code>/api/admin/categories/:id</code></td><td>Delete category</td><td>Protected</td></tr>
      <tr><td><span class="tag POST">POST</span></td><td><code>/api/admin/models</code></td><td>Create model</td><td>Protected</td></tr>
      <tr><td><span class="tag PATCH">PATCH</span></td><td><code>/api/admin/models/:id</code></td><td>Update model</td><td>Protected</td></tr>
      <tr><td><span class="tag DELETE">DELETE</span></td><td><code>/api/admin/models/:id</code></td><td>Delete model</td><td>Protected</td></tr>
    </tbody>
  </table>
</div>

  <div class="section">
    <h2>/admin – Admin UI</h2>
    <table>
      <thead>
        <tr><th>Method</th><th>Path</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><span class="tag GET">GET</span></td><td><code>/admin</code></td><td>Admin index</td></tr>
        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/brands</code></td><td>Brands list</td></tr>
        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/brands/new</code></td><td>Create brand form</td></tr>
        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/brands/edit</code></td><td>Edit brand form</td></tr>

        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/categories</code></td><td>Categories list</td></tr>
        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/categories/new</code></td><td>Create category form</td></tr>

        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/products</code></td><td>Products list</td></tr>
        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/products/new</code></td><td>Create product form</td></tr>

        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/models/images</code></td><td>Upload model images form</td></tr>

        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/messages</code></td><td>Contact messages list</td></tr>
        <tr><td><span class="tag GET">GET</span></td><td><code>/admin/newsletter-subscriptions</code></td><td>Newsletter subscriptions list</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Static & uploads</h2>
    <table>
      <thead>
        <tr><th>Method</th><th>Path</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><span class="tag GET">GET</span></td><td><code>/uploads/&lt;file&gt;</code></td><td>Uploaded model images</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>`);
});

// Public API: GET only for products/brands/categories/models + public POST contact & newsletter
const publicApiRouter = express.Router();
publicApiRouter.use("/products", createProductsReadRouter());
publicApiRouter.use("/brands", brandsRouter);
publicApiRouter.use("/categories", categoriesRouter);
publicApiRouter.use("/models", modelsRouter);
publicApiRouter.use("/", contactRouter);
app.use("/api", publicApiRouter);

// Protected API: all modifying routes under /api/admin (admin token required except POST /login)
const adminApiRouter = express.Router();
adminApiRouter.use("/", adminAuthRouter);
adminApiRouter.use("/products", createProductsWriteRouter(upload));
adminApiRouter.use("/brands", brandsWriteRouter);
adminApiRouter.use("/categories", categoriesWriteRouter);
adminApiRouter.use("/models", createModelsWriteRouter(modelImageUpload));
app.use("/api/admin", adminGuard, adminApiRouter);

app.use("/admin", createAdminRouter(upload));

export default app;
