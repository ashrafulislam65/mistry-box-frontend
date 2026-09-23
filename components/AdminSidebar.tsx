"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminLogout } from "@/lib/api";
import { confirmAction } from "@/lib/alerts";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Orders", icon: "📦" },
  { href: "/admin/packages", label: "Packages", icon: "🧰" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const confirmed = await confirmAction("লগ আউট করতে চান?", "আপনাকে আবার লগইন করতে হবে।", "হ্যাঁ, লগ আউট");
    if (!confirmed) return;
    await adminLogout();
    router.push("/admin/login");
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="brand-name">মিস্ত্রি বক্স</span>
        <span className="admin-sidebar-tag">Admin Panel</span>
      </div>

      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar-link ${isActive ? "admin-sidebar-link-active" : ""}`}
            >
              <span className="admin-sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button className="btn btn-outline admin-sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}