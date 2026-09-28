export interface PackageTier {
  id: string;
  packageId: string;
  label: string;
  quantity: number;
  price: string;
  sortOrder: number;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  price: string;
  deliveryCharge: string;
  description: string;
  items: string[];
  imageUrl: string | null;
  isActive: boolean;
  facebookPostUrl: string | null;
  tiers: PackageTier[];
}

export type OrderStatus = "PENDING" | "ON_HOLD" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export interface Order {
  id: string;
  packageId: string;
  packageTierId: string | null;
  tierLabel: string | null;
  customerName: string;
  phone: string;
  address: string;
  quantity: number;
  subtotal: string;
  deliveryCharge: string;
  totalPrice: string;
  status: OrderStatus;
  note: string | null;
  source: string | null;
  createdAt: string;
  package: Package;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  byStatus: Record<OrderStatus, number>;
  last7Days: { date: string; count: number; revenue: number }[];
}

export interface SiteSettings {
  id: string;
  bannerImageUrl: string | null;
  bannerTag: string;
  bannerTitle: string;
  bannerSubtitle: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}