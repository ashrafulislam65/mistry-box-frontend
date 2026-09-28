import { ApiResponse, Package, Order, OrderStatus, OrderStats, SiteSettings, PaginatedResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mb_admin_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getStoredToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Something went wrong");
  }
  return json;
}

// ---- Public ----

export function getProduct() {
  return request<Package>("/product");
}

export function getSettings() {
  return request<SiteSettings>("/settings");
}

export interface CreateOrderPayload {
  packageId: string;
  packageTierId: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  source?: string;
}

export function createOrder(payload: CreateOrderPayload) {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Admin auth ----

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");

  if (typeof window !== "undefined" && json.token) {
    localStorage.setItem("mb_admin_token", json.token);
  }
  return json as ApiResponse<{ id: string; name: string; email: string; role: string }>;
}

export function adminLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("mb_admin_token");
  }
  return request("/admin/auth/logout", { method: "POST" });
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("mb_admin_token");
}

export function adminChangePassword(payload: { currentPassword: string; newPassword: string }) {
  return request<null>("/admin/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Admin orders ----

export function adminGetOrders(params?: {
  status?: OrderStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  return request<Order[]>(`/admin/orders${query ? `?${query}` : ""}`) as Promise<PaginatedResponse<Order[]>>;
}

export function adminGetOrderStats() {
  return request<OrderStats>("/admin/orders/stats");
}

export function adminUpdateOrderStatus(id: string, status: OrderStatus) {
  return request<Order>(`/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function adminExportOrdersUrl(params?: { from?: string; to?: string; status?: OrderStatus }) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const query = search.toString();
  return `${API_URL}/admin/orders/export${query ? `?${query}` : ""}`;
}

// ---- Admin product (single) ----

export function adminGetProduct() {
  return request<Package>("/admin/product");
}

export interface ProductFormPayload {
  name: string;
  slug: string;
  price: number;
  deliveryCharge: number;
  description: string;
  items: string[];
  imageUrl: string | null;
  isActive: boolean;
  facebookPostUrl: string | null;
  tiers: { label: string; quantity: number; price: number }[];
}

export function adminUpdateProduct(payload: ProductFormPayload) {
  return request<Package>("/admin/product", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ---- Image upload ----

export async function adminUploadImage(file: File): Promise<string> {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/admin/upload`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Upload failed");
  return json.data.url as string;
}

// ---- Site settings ----

export function adminUpdateSettings(payload: {
  bannerImageUrl: string | null;
  bannerTag: string;
  bannerTitle: string;
  bannerSubtitle: string;
}) {
  return request<SiteSettings>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}