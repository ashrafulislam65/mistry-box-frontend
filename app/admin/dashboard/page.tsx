"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  adminGetOrders,
  adminGetOrderStats,
  adminUpdateOrderStatus,
  adminExportOrdersUrl,
  isAdminLoggedIn,
} from "@/lib/api";
import { Order, OrderStats, OrderStatus } from "@/types";
import { showSuccess, showError } from "@/lib/alerts";
import AdminSidebar from "@/components/AdminSidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "ON_HOLD", "CONFIRMED", "DELIVERED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#b8860b",
  ON_HOLD: "#8b5cf6",
  CONFIRMED: "#4d84b8",
  DELIVERED: "#2f7d4f",
  CANCELLED: "#c0392b",
};

const STATUS_LABELS_BN: Record<string, string> = {
  PENDING: "পেন্ডিং",
  ON_HOLD: "হোল্ডে আছে",
  CONFIRMED: "কনফার্মড",
  DELIVERED: "ডেলিভারড",
  CANCELLED: "বাতিল",
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetOrders({
        status: statusFilter || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setOrders(res.data || []);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, from, to, router]);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminGetOrderStats();
      setStats(res.data || null);
    } catch {
      // silently skip, orders table এখনো কাজ করবে
    }
  }, []);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
      return;
    }
    loadOrders();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStatusChange(id: string, status: OrderStatus) {
    try {
      await adminUpdateOrderStatus(id, status);
      showSuccess("স্ট্যাটাস আপডেট হয়েছে!");
      loadOrders();
      loadStats();
    } catch (err: unknown) {
      showError("আপডেট ব্যর্থ হয়েছে", getErrorMessage(err, "আবার চেষ্টা করুন।"));
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mb_admin_token") : null;
      const url = adminExportOrdersUrl({ from: from || undefined, to: to || undefined, status: statusFilter || undefined });
      const res = await fetch(url, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `orders_${from || "today"}_to_${to || "today"}.xlsx`;
      link.click();
    } catch {
      showError("Export ব্যর্থ হয়েছে", "আবার চেষ্টা করুন।");
    } finally {
      setExporting(false);
    }
  }

  const chartData = (stats?.last7Days || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
  }));

  const pieData = stats
    ? Object.entries(stats.byStatus)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({ name: STATUS_LABELS_BN[status] || status, value: count, status }))
    : [];

  // Growth chart: cumulative revenue over the last 7 days — ব্যবসা কতটা বাড়ছে সেটা বোঝায়
  const growthData = (() => {
    let running = 0;
    return (stats?.last7Days || []).map((d) => {
      running += d.revenue;
      return {
        label: new Date(d.date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
        cumulativeRevenue: running,
      };
    });
  })();

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">মোট অর্ডার</span>
              <span className="stat-value">{stats.totalOrders}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">মোট আয়</span>
              <span className="stat-value">৳{stats.totalRevenue}</span>
            </div>
            <div className="stat-card stat-pending">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.byStatus.PENDING || 0}</span>
            </div>
            <div className="stat-card stat-onhold">
              <span className="stat-label">On Hold</span>
              <span className="stat-value">{stats.byStatus.ON_HOLD || 0}</span>
            </div>
            <div className="stat-card stat-confirmed">
              <span className="stat-label">Confirmed</span>
              <span className="stat-value">{stats.byStatus.CONFIRMED || 0}</span>
            </div>
            <div className="stat-card stat-delivered">
              <span className="stat-label">Delivered</span>
              <span className="stat-value">{stats.byStatus.DELIVERED || 0}</span>
            </div>
            <div className="stat-card stat-cancelled">
              <span className="stat-label">Cancelled</span>
              <span className="stat-value">{stats.byStatus.CANCELLED || 0}</span>
            </div>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">গত ৭ দিনের অর্ডার প্রবণতা</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="count" fill="#d9552b" radius={[4, 4, 0, 0]} name="অর্ডার সংখ্যা" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats && pieData.length > 0 && (
          <div className="chart-row">
            <div className="chart-card chart-card-half">
              <h3 className="chart-title">স্ট্যাটাস অনুযায়ী অর্ডার (%)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={(entry) => `${entry.name} ${((entry.percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#999"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card chart-card-half">
              <h3 className="chart-title">ব্যবসার প্রবৃদ্ধি (৭ দিন, ক্রমবর্ধমান আয়)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                    formatter={(value: number) => [`৳${value}`, "মোট আয়"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeRevenue"
                    stroke="#d9552b"
                    strokeWidth={2.5}
                    dot={{ fill: "#d9552b", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <h2 style={{ marginTop: 30 }}>Orders</h2>

        <div className="toolbar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="btn btn-outline" onClick={loadOrders}>
            Filter
          </button>
          <button className="btn btn-accent" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export to Excel"}
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>কোনো অর্ডার পাওয়া যায়নি।</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Package</th>
                <th>Pack</th>
                <th>Total</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{new Date(order.createdAt).toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })}</td>
                  <td>
                    {order.customerName}
                    <br />
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{order.address}</span>
                  </td>
                  <td>{order.phone}</td>
                  <td>{order.package?.name}</td>
                  <td>{order.tierLabel || order.quantity}</td>
                  <td>৳{order.totalPrice}</td>
                  <td>{order.source}</td>
                  <td>
                    <select
                      className="status-badge"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}