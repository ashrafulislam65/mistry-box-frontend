import { ApiResponse, Category, Package, Order, OrderStatus } from "@/types";

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

export function getCategories() {
  return request<Category[]>("/categories");
}

export function getPackages(categorySlug?: string) {
  const query = categorySlug ? `?category=${categorySlug}` : "";
  return request<Package[]>(`/packages${query}`);
}

export function getPackageBySlug(slug: string) {
  return request<Package>(`/packages/${slug}`);
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

// ---- Admin orders ----

export function adminGetOrders(params?: { status?: OrderStatus; from?: string; to?: string }) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const query = search.toString();
  return request<Order[]>(`/admin/orders${query ? `?${query}` : ""}`);
}
export function adminGetOrderStats() {
  return request<import("@/types").OrderStats>("/admin/orders/stats");
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

// ---- Admin categories ----

export function adminGetCategories() {
  return request<Category[]>("/admin/categories");
}

// ---- Admin packages ----

export function adminGetPackages() {
  return request<Package[]>("/admin/packages");
}

export interface PackageFormPayload {
  categoryId: string;
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

export function adminCreatePackage(payload: PackageFormPayload) {
  return request<Package>("/admin/packages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdatePackage(id: string, payload: PackageFormPayload) {
  return request<Package>(`/admin/packages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function adminDeletePackage(id: string) {
  return request(`/admin/packages/${id}`, { method: "DELETE" });
}