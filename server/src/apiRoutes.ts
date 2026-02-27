export type ApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ApiVisibility = "public" | "protected";

export interface ApiRouteMeta {
  method: ApiMethod;
  path: string;
  description: string;
  visibility: ApiVisibility;
}

export const API_ROUTES: ApiRouteMeta[] = [
  // Public /api
  {
    method: "GET",
    path: "/api/products",
    description: "List all products with models",
    visibility: "public",
  },
  {
    method: "GET",
    path: "/api/products/:id",
    description: "Get a single product with models",
    visibility: "public",
  },
  {
    method: "GET",
    path: "/api/brands",
    description: "List brands",
    visibility: "public",
  },
  {
    method: "GET",
    path: "/api/categories",
    description: "List categories",
    visibility: "public",
  },
  {
    method: "GET",
    path: "/api/categories/:id",
    description: "Get a single category",
    visibility: "public",
  },
  {
    method: "GET",
    path: "/api/models",
    description: "List models",
    visibility: "public",
  },
  {
    method: "GET",
    path: "/api/models/:id",
    description: "Get a single model",
    visibility: "public",
  },
  {
    method: "POST",
    path: "/api/contact",
    description: "Submit contact message (name, email, subject, message)",
    visibility: "public",
  },
  {
    method: "POST",
    path: "/api/newsletter-subscriptions",
    description: "Subscribe email to newsletter",
    visibility: "public",
  },

  // Admin /api/admin
  {
    method: "POST",
    path: "/api/admin/login",
    description: "Admin login (returns 2-hour token)",
    visibility: "public",
  },
  {
    method: "POST",
    path: "/api/admin/forgot-password",
    description: "Request a short-lived admin password reset link by email or username",
    visibility: "public",
  },
  {
    method: "POST",
    path: "/api/admin/reset-password/verify",
    description: "Verify an admin password reset token",
    visibility: "public",
  },
  {
    method: "POST",
    path: "/api/admin/reset-password",
    description: "Reset admin password using a valid reset token",
    visibility: "public",
  },
  {
    method: "PATCH",
    path: "/api/admin/account",
    description: "Update admin username and/or password (requires current password and token)",
    visibility: "protected",
  },
  {
    method: "GET",
    path: "/api/admin/messages",
    description: "List contact messages",
    visibility: "protected",
  },
  {
    method: "DELETE",
    path: "/api/admin/messages/:id",
    description: "Delete a contact message by id",
    visibility: "protected",
  },
  {
    method: "GET",
    path: "/api/admin/newsletter-subscriptions",
    description: "List newsletter subscriptions",
    visibility: "protected",
  },
  {
    method: "DELETE",
    path: "/api/admin/newsletter-subscriptions/:id",
    description: "Delete a newsletter subscription (unsubscribe) by id",
    visibility: "protected",
  },
  {
    method: "GET",
    path: "/api/admin/apis",
    description: "List all API routes with method, path, access, and description",
    visibility: "protected",
  },
  {
    method: "POST",
    path: "/api/admin/products",
    description: "Create a product",
    visibility: "protected",
  },
  {
    method: "POST",
    path: "/api/admin/products/upload",
    description: "Create a product with image upload",
    visibility: "protected",
  },
  {
    method: "PATCH",
    path: "/api/admin/products/:id",
    description: "Update a product",
    visibility: "protected",
  },
  {
    method: "DELETE",
    path: "/api/admin/products/:id",
    description: "Delete a product",
    visibility: "protected",
  },
  {
    method: "POST",
    path: "/api/admin/brands",
    description: "Create brand",
    visibility: "protected",
  },
  {
    method: "PATCH",
    path: "/api/admin/brands/:id",
    description: "Update brand",
    visibility: "protected",
  },
  {
    method: "DELETE",
    path: "/api/admin/brands/:id",
    description: "Delete brand",
    visibility: "protected",
  },
  {
    method: "POST",
    path: "/api/admin/categories",
    description: "Create category",
    visibility: "protected",
  },
  {
    method: "PATCH",
    path: "/api/admin/categories/:id",
    description: "Update category",
    visibility: "protected",
  },
  {
    method: "DELETE",
    path: "/api/admin/categories/:id",
    description: "Delete category",
    visibility: "protected",
  },
  {
    method: "POST",
    path: "/api/admin/models",
    description: "Create model",
    visibility: "protected",
  },
  {
    method: "POST",
    path: "/api/admin/models/upload-image",
    description: "Upload a single model image (max 50KB). Returns { url }.",
    visibility: "protected",
  },
  {
    method: "PATCH",
    path: "/api/admin/models/:id",
    description: "Update model",
    visibility: "protected",
  },
  {
    method: "DELETE",
    path: "/api/admin/models/:id",
    description: "Delete model",
    visibility: "protected",
  },
];

