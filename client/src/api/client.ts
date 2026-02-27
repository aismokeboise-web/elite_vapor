const API_BASE = "/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function buildError(res: Response): Promise<ApiError> {
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  const status = res.status;
  const serverMessage =
    (body && typeof body === "object" && (body.error || body.message)) || res.statusText;

  let friendly = serverMessage || "Request failed";

  if (status === 404) {
    friendly = "Requested resource was not found (404).";
  } else if (status === 400) {
    friendly = serverMessage || "Bad request – please check your input.";
  } else if (status >= 500) {
    friendly = "Couldn't connect to server right now. Try again later.";
  }

  return new ApiError(status, friendly, body);
}

/** Return a user-friendly message for display (admin or client). Use for 500/network errors. */
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status >= 500) {
    return "Couldn't connect to server right now. Try again later.";
  }
  if (error instanceof Error && /fetch|network|failed to fetch/i.test(error.message)) {
    return "Couldn't connect to server right now. Try again later.";
  }
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw await buildError(res);
  }
  return res.json();
}

async function requestJson<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });
  if (!res.ok) {
    throw await buildError(res);
  }
  return res.json();
}

export type AdminApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type AdminApiVisibility = "public" | "protected";

export interface AdminApiRoute {
  method: AdminApiMethod;
  path: string;
  description: string;
  visibility: AdminApiVisibility;
}

export async function fetchProducts() {
  return request<ApiProductWithModels[]>("/products");
}

export async function fetchProduct(id: string) {
  return request<ApiProductWithModels>(`/products/${id}`);
}

export async function fetchBrands() {
  return request<ApiBrand[]>("/brands");
}

export async function fetchCategories() {
  return request<ApiCategory[]>("/categories");
}

export async function fetchModels() {
  return request<ApiModel[]>("/models");
}

/** Request with admin Bearer token (for protected GET endpoints) */
async function requestWithAuth<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await buildError(res);
  return res.json();
}

/** POST/PATCH with admin token and JSON body */
async function requestWithAuthJson<T>(path: string, token: string, method: "POST" | "PATCH", body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await buildError(res);
  return res.json();
}

/** DELETE with admin token */
async function requestWithAuthDelete(path: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await buildError(res);
}

export interface ApiMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface ApiNewsletterSubscription {
  id: string;
  email: string;
  createdAt: string;
}

export async function fetchAdminMessages(token: string) {
  return requestWithAuth<ApiMessage[]>("/admin/messages", token);
}

export async function fetchAdminNewsletterSubscriptions(token: string) {
  return requestWithAuth<ApiNewsletterSubscription[]>("/admin/newsletter-subscriptions", token);
}

export async function fetchAdminApis(token: string) {
  return requestWithAuth<AdminApiRoute[]>("/admin/apis", token);
}

export async function deleteAdminMessage(token: string, id: string | number) {
  return requestWithAuthDelete(`/admin/messages/${id}`, token);
}

export async function updateAdminMessageReadStatus(
  token: string,
  id: string | number,
  isRead: boolean
) {
  return requestWithAuthJson<{ success: boolean; id: number; isRead: boolean }>(
    `/admin/messages/${id}/read-status`,
    token,
    "PATCH",
    { isRead }
  );
}

export async function deleteAdminNewsletterSubscription(token: string, id: string | number) {
  return requestWithAuthDelete(`/admin/newsletter-subscriptions/${id}`, token);
}

// --- Admin write APIs (require token) ---

export async function createBrand(token: string, data: { name: string; categoryId?: string | null }) {
  return requestWithAuthJson<ApiBrand>("/admin/brands", token, "POST", data);
}
export async function updateBrand(token: string, id: string, data: { name?: string; categoryId?: string | null }) {
  return requestWithAuthJson<ApiBrand>(`/admin/brands/${id}`, token, "PATCH", data);
}
export async function deleteBrand(token: string, id: string) {
  return requestWithAuthDelete(`/admin/brands/${id}`, token);
}

export async function createCategory(token: string, data: { name: string }) {
  return requestWithAuthJson<ApiCategory>("/admin/categories", token, "POST", data);
}
export async function updateCategory(token: string, id: string, data: { name?: string }) {
  return requestWithAuthJson<ApiCategory>(`/admin/categories/${id}`, token, "PATCH", data);
}
export async function deleteCategory(token: string, id: string) {
  return requestWithAuthDelete(`/admin/categories/${id}`, token);
}

export interface ProductCreatePayload {
  name: string;
  size?: string | null;
  nicotineStrength?: string | null;
  brandId?: string | null;
  modelIds?: string[];
}
export async function createProduct(token: string, data: ProductCreatePayload) {
  return requestWithAuthJson<ApiProductWithModels>("/admin/products", token, "POST", data);
}
export async function updateProduct(token: string, id: string, data: Partial<ProductCreatePayload>) {
  return requestWithAuthJson<ApiProductWithModels>(`/admin/products/${id}`, token, "PATCH", data);
}
export async function deleteProduct(token: string, id: string) {
  return requestWithAuthDelete(`/admin/products/${id}`, token);
}

export interface ModelCreatePayload {
  name: string;
  price?: number | null;
  description?: string | null;
  flavors?: string[];
  is_clearance?: boolean;
  is_deal?: boolean;
  deal_text?: string | null;
  is_best_seller?: boolean;
  is_new?: boolean;
  imageUrls?: string[];
}
export async function createModel(token: string, data: ModelCreatePayload) {
  return requestWithAuthJson<ApiModel>("/admin/models", token, "POST", data);
}
export async function updateModel(token: string, id: string, data: Partial<ModelCreatePayload>) {
  return requestWithAuthJson<ApiModel>(`/admin/models/${id}`, token, "PATCH", data);
}
export async function deleteModel(token: string, id: string) {
  return requestWithAuthDelete(`/admin/models/${id}`, token);
}

/** Upload a single model image (max 50KB). Select one image at a time. Returns the URL for the uploaded image. */
export async function uploadModelImage(token: string, file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_BASE}/admin/models/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw await buildError(res);
  return res.json();
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function submitContactMessage(payload: ContactMessagePayload) {
  return requestJson<{ success: true } | { success: false; error: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function subscribeToNewsletter(email: string) {
  return requestJson<{ success: true } | { success: false; error: string }>("/newsletter-subscriptions", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export interface AdminLoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export async function loginAdmin(payload: AdminLoginPayload) {
  return requestJson<{ success: true; token: string; expiresAt: number } | { success: false; error: string }>(
    "/admin/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export interface ForgotPasswordRequest {
  identifier: string;
}

export interface ResetPasswordVerifyRequest {
  token: string;
}

export interface ResetPasswordVerifyResponse {
  success: boolean;
  valid: boolean;
  username?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UpdateAdminAccountRequest {
  currentPassword: string;
  newPassword?: string;
  newUsername?: string;
}

export async function requestAdminPasswordReset(body: ForgotPasswordRequest) {
  return requestJson<{ success: boolean }>("/admin/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function verifyAdminResetToken(
  body: ResetPasswordVerifyRequest
): Promise<ResetPasswordVerifyResponse> {
  return requestJson<ResetPasswordVerifyResponse>("/admin/reset-password/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function resetAdminPassword(body: ResetPasswordRequest) {
  return requestJson<{ success: boolean }>("/admin/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminAccount(token: string, body: UpdateAdminAccountRequest) {
  return requestWithAuthJson<{ success: boolean; token?: string; expiresAt?: number }>(
    "/admin/account",
    token,
    "PATCH",
    body
  );
}

export interface AdminAccountProfile {
  username: string;
  email: string;
}

export async function fetchAdminAccount(token: string): Promise<AdminAccountProfile> {
  return requestWithAuth<AdminAccountProfile>("/admin/account", token);
}

export interface ApiBrand {
  id: string;
  name: string;
  categoryId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Raw API types from server (Prisma Decimal serializes as string) */
export interface ApiModel {
  id: string;
  name: string;
  price: number | string | null;
  description: string | null;
  flavors: string[];
  is_clearance: boolean;
  is_deal: boolean;
  deal_text: string | null;
  is_best_seller: boolean;
  is_new: boolean;
  imageUrls: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProductWithModels {
  id: string;
  name: string;
  size: string | null;
  nicotineStrength: string | null;
  modelIds: string[];
  brandId: string | null;
  createdAt?: string;
  updatedAt?: string;
  brand: {
    id: string;
    name: string;
    categoryId: string | null;
    category: { id: string; name: string } | null;
  } | null;
  models: ApiModel[];
}
