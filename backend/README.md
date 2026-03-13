# Backend API (Products, Models, Admin & Privileges)

This `backend` project is a standalone Node.js + TypeScript + Express + Prisma API.
It models **products** and their **models/variants**, plus **admins**, **subadmins**, and **privileges** that control which subadmins can perform write operations.

The existing `client` and `server` folders are **not** modified by this backend.

## Setup

- Copy `.env.example` to `.env` and set:
  - `DATABASE_URL` – PostgreSQL connection URL for this backend (separate from the existing `server` DB).
  - `JWT_SECRET` – secret string used to sign JWT tokens.
- Install dependencies:

```bash
cd backend
npm install
```

- Run Prisma migrations and generate the client:

```bash
npx prisma migrate dev --name init
npm run prisma:generate
```

- Start the dev server:

```bash
npm run dev
```

By default the API listens on `http://localhost:5000`.

## Data model (overview)

Relevant Prisma models:

- **Category**
  - `id` (string, required)
  - `name` (string, required)
  - `iconPath` (string, optional) – path to the category icon, typically under `/uploads/...`.
- **Brand**
  - Belongs to a `Category` and can have many `Product`s.
- **Product**
  - High-level product record that can have many `Model` variants.
- **Model**
  - Concrete product variant (e.g. different price, flavors, flags, images) belonging to a `Product`.
- **Admin**
  - Full-privilege administrator.
- **Subadmin**
  - Created by an `Admin`, can be deactivated, and has privileges limited by entries in `Privilege`.
- **Privilege**
  - Ties a `Subadmin` to a specific `resource` (e.g. `"model"`) and defines allowed operations (`canCreate`, `canUpdate`, `canDelete`).

## Authentication & Authorization

All protected write endpoints use **JWT** in the `Authorization` header:

```http
Authorization: Bearer <token>
```

- **Admin tokens** have role `"admin"` and automatically grant **all privileges**.
- **Subadmin tokens** have role `"subadmin"` and are restricted via the `Privilege` table.
- The backend verifies tokens and:
  - Ensures subadmins are still active.
  - Checks privileges for the requested `resource` + `operation` for subadmins.

### Token payload (conceptual)

```json
{
  "id": "<admin-or-subadmin-id>",
  "role": "admin" | "subadmin"
}
```

The backend issues tokens using `JWT_SECRET`.

---

## Auth & Admin/Subadmin Management

Base path: `/api`

### POST `/api/admin/register`

**Purpose**: Create the very first admin. Allowed **only when there are no admins** in the database.

**Body (JSON)**:

- `username` (string, required)
- `email` (string, required)
- `password` (string, required)

**Response (201)**:

- `{ "token": "<admin-jwt>" }`

Use this token for admin-only operations.

### POST `/api/admin/login`

**Purpose**: Log in as an admin.

**Body (JSON)**:

- `username` (string, required)
- `password` (string, required)

**Response (200)**:

- `{ "token": "<admin-jwt>" }`

### POST `/api/subadmin/login`

**Purpose**: Log in as a subadmin (must already exist and be active).

**Body (JSON)**:

- `username` (string, required)
- `password` (string, required)

**Response (200)**:

- `{ "token": "<subadmin-jwt>" }`

### POST `/api/admin/subadmins`

**Purpose**: Create a new subadmin and optionally configure initial privileges.  
**Auth**: Admin token required.

**Headers**:

- `Authorization: Bearer <admin-token>`

**Body (JSON)**:

- `username` (string, required)
- `email` (string, required)
- `password` (string, required)
- `privileges` (array, optional) – list of privilege objects:
  - `resource` (string, required) – e.g. `"model"`.
  - `canCreate` (boolean, optional; default `false`)
  - `canUpdate` (boolean, optional; default `false`)
  - `canDelete` (boolean, optional; default `false`)

**Response (201)**:

- `{ "id": "<subadmin-id>" }`

### PUT `/api/admin/subadmins/:id/privileges`

**Purpose**: Replace or upsert the privileges for a given subadmin.  
**Auth**: Admin token required.

**Headers**:

- `Authorization: Bearer <admin-token>`

**Body (JSON)**:

- `privileges` (array, required) – same shape as above:
  - Each item:
    - `resource` (string, required)
    - `canCreate` (boolean, optional)
    - `canUpdate` (boolean, optional)
    - `canDelete` (boolean, optional)

**Response (200)**:

- `{ "ok": true }`

### DELETE `/api/admin/subadmins/:id`

**Purpose**: Deactivate a subadmin (soft-delete).  
**Auth**: Admin token required.

**Headers**:

- `Authorization: Bearer <admin-token>`

**Response (200)**:

- `{ "ok": true }`

Subadmins marked inactive cannot log in and cannot perform operations.

---

## Category API

Base path: `/api/categories`

### GET `/api/categories`

**Purpose**: List all categories.  
**Auth**: Public.

**Response (200)**: Array of category objects.

### GET `/api/categories/:id`

**Purpose**: Get a single category.  
**Auth**: Public.

**Path params**:

- `id` (string, required) – category ID.

**Response (200)**:

- Category object, or `404` if not found.

### POST `/api/categories`

**Purpose**: Create a new category.  
**Auth**: Admin or subadmin with `Privilege.resource = "category"` and `canCreate = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`
 - `Content-Type: multipart/form-data`

**Body (form fields)**:

- `name` (text, **required**)
- `icon` (file, optional) – SVG icon file. If omitted, `iconPath` will be `null`.

**Response (201)**:

- Created category object.

### PUT `/api/categories/:id`

**Purpose**: Update a category.  
**Auth**: Admin or subadmin with `Privilege.resource = "category"` and `canUpdate = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Path params**:

- `id` (string, required) – category ID.

**Body (form fields)** – all fields optional:

- `name` (text, optional)
- `icon` (file, optional) – SVG icon file. When provided, replaces the existing icon. When omitted, the existing `iconPath` is left unchanged.

**Response (200)**:

- Updated category object, or `404` if not found.

### DELETE `/api/categories/:id`

**Purpose**: Delete a category.  
**Auth**: Admin or subadmin with `Privilege.resource = "category"` and `canDelete = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Path params**:

- `id` (string, required) – category ID.

**Response (204)**:

- No content on success, or `404` if not found.

---

## Brand API

Base path: `/api/brands`

### GET `/api/brands`

**Purpose**: List all brands (including their category).  
**Auth**: Public.

**Response (200)**: Array of brand objects with embedded `category`.

### GET `/api/brands/:id`

**Purpose**: Get a single brand.  
**Auth**: Public.

**Path params**:

- `id` (string, required) – brand ID.

**Response (200)**:

- Brand object with `category`, or `404` if not found.

### POST `/api/brands`

**Purpose**: Create a new brand.  
**Auth**: Admin or subadmin with `Privilege.resource = "brand"` and `canCreate = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Body (JSON)**:

- `name` (string, **required**)
- `categoryId` (string, **required**) – owning category.

**Response (201)**:

- Created brand object.

### PUT `/api/brands/:id`

**Purpose**: Update a brand.  
**Auth**: Admin or subadmin with `Privilege.resource = "brand"` and `canUpdate = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Path params**:

- `id` (string, required) – brand ID.

**Body (JSON)** – all fields optional:

- `name` (string, optional)
- `categoryId` (string, optional)

**Response (200)**:

- Updated brand object, or `404` if not found.

### DELETE `/api/brands/:id`

**Purpose**: Delete a brand.  
**Auth**: Admin or subadmin with `Privilege.resource = "brand"` and `canDelete = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Path params**:

- `id` (string, required) – brand ID.

**Response (204)**:

- No content on success, or `404` if not found.

---

## Product API

Base path: `/api/products`

### GET `/api/products`

**Purpose**: List all products with their brand, category and models.  
**Auth**: Public.

**Response (200)**: Array of product objects including `brand.category` and `models`.

### GET `/api/products/:id`

**Purpose**: Get a single product with its brand, category and models.  
**Auth**: Public.

**Path params**:

- `id` (string, required) – product ID.

**Response (200)**:

- Product object, or `404` if not found.

### POST `/api/products`

**Purpose**: Create a new high-level product record.  
**Auth**: Admin or subadmin with `Privilege.resource = "product"` and `canCreate = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Body (JSON)**:

- `name` (string, **required**)
- `brandId` (string, **required**)
- `size` (string, optional)
- `nicotineStrength` (string, optional)

**Response (201)**:

- Created product object.

> Note: create one or more models for this product separately via `/api/models`, using the returned `product.id` as `productId`.

### PUT `/api/products/:id`

**Purpose**: Update a product.  
**Auth**: Admin or subadmin with `Privilege.resource = "product"` and `canUpdate = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Path params**:

- `id` (string, required) – product ID.

**Body (JSON)** – all fields optional:

- `name` (string, optional)
- `brandId` (string, optional)
- `size` (string, optional)
- `nicotineStrength` (string, optional)

**Response (200)**:

- Updated product object, or `404` if not found.

### DELETE `/api/products/:id`

**Purpose**: Delete a product.  
**Auth**: Admin or subadmin with `Privilege.resource = "product"` and `canDelete = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Path params**:

- `id` (string, required) – product ID.

**Response (204)**:

- No content on success, or `404` if not found.

---

## Model CRUD API

Base path: `/api/models`

### GET `/api/models`

**Purpose**: List all models.  
**Auth**: Public (no token required).

**Response (200)**: Array of model objects.

### GET `/api/models/:id`

**Purpose**: Get a single model by ID.  
**Auth**: Public.

**Path params**:

- `id` (string, required) – model ID.

**Response (200)**:

- Model object, or `404` if not found.

### POST `/api/models`

**Purpose**: Create a new model (product variant).  
**Auth**: Admin or subadmin with `Privilege.resource = "model"` and `canCreate = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Body (JSON)**:

- `name` (string, **required**)
- `productId` (string, **required**) – ID of the parent product.
- `price` (number or string, **required**) – price of the model.
- `description` (string, optional)
- `flavors` (array of strings **or** comma-separated string, optional)
- `is_clearance` (boolean, optional; default `false`)
- `is_deal` (boolean, optional; default `false`)
- `deal_text` (string, optional; default `"Exclusive Deals Available"`)
- `is_best_seller` (boolean, optional; default `false`)
- `is_new` (boolean, optional; default `false`)
- `imageUrls` (array of strings **or** comma-separated string, optional) – URLs/paths to images.

**Response (201)**:

- Created model object.

### PUT `/api/models/:id`

**Purpose**: Update an existing model.  
**Auth**: Admin or subadmin with `Privilege.resource = "model"` and `canUpdate = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Path params**:

- `id` (string, required) – model ID.

**Body (JSON)** – all fields are optional; only provided ones are updated:

- `name` (string, optional)
- `productId` (string, optional)
- `price` (number or string, optional)
- `description` (string, optional)
- `flavors` (array of strings or comma-separated string, optional)
- `is_clearance` (boolean, optional)
- `is_deal` (boolean, optional)
- `deal_text` (string, optional)
- `is_best_seller` (boolean, optional)
- `is_new` (boolean, optional)
- `imageUrls` (array of strings or comma-separated string, optional)

**Response (200)**:

- Updated model object, or `404` if not found.

### DELETE `/api/models/:id`

**Purpose**: Delete a model.  
**Auth**: Admin or subadmin with `Privilege.resource = "model"` and `canDelete = true`.

**Headers**:

- `Authorization: Bearer <admin-or-subadmin-token>`

**Path params**:

- `id` (string, required) – model ID.

**Response (204)**:

- No content on success, or `404` if not found.

---

## Category Icons

- The backend serves files under `/uploads` as static assets.
- To use category icons:
  - Upload or place icon files under `backend/uploads/...`.
  - `Category.iconPath` will contain the relative path (e.g. `/uploads/category-icons/vapes.png`) when an icon has been uploaded, or `null` if there is no icon.
  - Clients (frontends) should provide their own visual fallback when `iconPath` is `null`.

