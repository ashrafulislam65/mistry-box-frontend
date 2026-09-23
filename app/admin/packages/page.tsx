"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  adminGetPackages,
  adminGetCategories,
  adminCreatePackage,
  adminUpdatePackage,
  adminDeletePackage,
  isAdminLoggedIn,
} from "@/lib/api";
import { Package, Category } from "@/types";
import { showSuccess, showError, confirmDelete } from "@/lib/alerts";
import AdminSidebar from "@/components/AdminSidebar";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

interface TierForm {
  label: string;
  quantity: string;
  price: string;
}

const emptyForm = {
  categoryId: "",
  name: "",
  slug: "",
  price: "",
  deliveryCharge: "99",
  description: "",
  items: "",
  imageUrl: "",
  isActive: true,
  facebookPostUrl: "",
};

const emptyTiers: TierForm[] = [
  { label: "৬ প্যাক", quantity: "6", price: "" },
  { label: "৭ প্যাক", quantity: "7", price: "" },
  { label: "১০ প্যাক", quantity: "10", price: "" },
];

export default function AdminPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [tiers, setTiers] = useState<TierForm[]>(emptyTiers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pkgRes, catRes] = await Promise.all([adminGetPackages(), adminGetCategories()]);
      setPackages(pkgRes.data || []);
      setCategories(catRes.data || []);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(pkg: Package) {
    setEditingId(pkg.id);
    setForm({
      categoryId: pkg.categoryId,
      name: pkg.name,
      slug: pkg.slug,
      price: pkg.price,
      deliveryCharge: pkg.deliveryCharge,
      description: pkg.description,
      items: pkg.items.join(", "),
      imageUrl: pkg.imageUrl || "",
      isActive: pkg.isActive,
      facebookPostUrl: pkg.facebookPostUrl || "",
    });
    setTiers(
      pkg.tiers.length > 0
        ? pkg.tiers.map((t) => ({ label: t.label, quantity: String(t.quantity), price: t.price }))
        : emptyTiers
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setTiers(emptyTiers);
    setSaveError("");
  }

  function updateTier(index: number, field: keyof TierForm, value: string) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addTierRow() {
    setTiers((prev) => [...prev, { label: "", quantity: "", price: "" }]);
  }

  function removeTierRow(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaveError("");

    const validTiers = tiers
      .filter((t) => t.label.trim() && t.quantity && t.price)
      .map((t) => ({ label: t.label.trim(), quantity: Number(t.quantity), price: Number(t.price) }));

    if (validTiers.length === 0) {
      setSaveError("অন্তত একটি প্যাক/tier দিতে হবে (label, quantity, price সহ)।");
      return;
    }

    const payload = {
      categoryId: form.categoryId,
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      deliveryCharge: Number(form.deliveryCharge),
      description: form.description,
      items: form.items.split(",").map((i) => i.trim()).filter(Boolean),
      imageUrl: form.imageUrl || null,
      isActive: form.isActive,
      facebookPostUrl: form.facebookPostUrl || null,
      tiers: validTiers,
    };

    try {
      if (editingId) {
        await adminUpdatePackage(editingId, payload);
        showSuccess("প্যাকেজ আপডেট হয়েছে!");
      } else {
        await adminCreatePackage(payload);
        showSuccess("নতুন প্যাকেজ তৈরি হয়েছে!");
      }
      resetForm();
      loadData();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "সেভ করা যায়নি।");
      setSaveError(msg);
      showError("সেভ ব্যর্থ হয়েছে", msg);
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;
    try {
      await adminDeletePackage(id);
      showSuccess("ডিলিট হয়ে গেছে!");
      loadData();
    } catch (err: unknown) {
      showError("ডিলিট ব্যর্থ হয়েছে", getErrorMessage(err, "আবার চেষ্টা করুন।"));
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <h2 style={{ marginTop: 0 }}>{editingId ? "Edit Package" : "New Package"}</h2>

        <form className="order-form" onSubmit={handleSubmit} style={{ maxWidth: 620 }}>
          <div className="field">
            <label>Category</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="field">
            <label>Slug (URL-friendly, e.g. 59-taka-mistry-box)</label>
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>

          <div className="field">
            <label>Base Price (৳) — reference price, tier prices override this</label>
            <input
              type="number"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Delivery / COD Charge (৳)</label>
            <input
              type="number"
              required
              value={form.deliveryCharge}
              onChange={(e) => setForm({ ...form, deliveryCharge: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Items (comma separated)</label>
            <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} />
          </div>

          <div className="field">
            <label>Image URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>

          <div className="field">
            <label>Facebook Post URL (optional)</label>
            <input
              value={form.facebookPostUrl}
              onChange={(e) => setForm({ ...form, facebookPostUrl: e.target.value })}
            />
          </div>

          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                style={{ width: "auto", marginRight: 8 }}
              />
              Active (visible on the website)
            </label>
          </div>

          <div className="field">
            <label>Pack / Quantity Tiers</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tiers.map((tier, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    placeholder="লেবেল, যেমন ৬ প্যাক"
                    value={tier.label}
                    onChange={(e) => updateTier(i, "label", e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={tier.quantity}
                    onChange={(e) => updateTier(i, "quantity", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    placeholder="৳ Price"
                    value={tier.price}
                    onChange={(e) => updateTier(i, "price", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => removeTierRow(i)}
                    style={{ padding: "8px 12px" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline" onClick={addTierRow} style={{ marginTop: 10 }}>
              + Add Tier
            </button>
          </div>

          {saveError && <p className="form-msg-error">{saveError}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-accent">
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2 style={{ marginTop: 40 }}>All Packages</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Tiers</th>
                <th>Delivery</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td>{pkg.name}</td>
                  <td>{pkg.category?.name}</td>
                  <td>
                    {pkg.tiers.length === 0
                      ? "—"
                      : pkg.tiers.map((t) => `${t.label} (৳${t.price})`).join(", ")}
                  </td>
                  <td>৳{pkg.deliveryCharge}</td>
                  <td>{pkg.isActive ? "Yes" : "No"}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-outline" onClick={() => startEdit(pkg)}>
                      Edit
                    </button>
                    <button className="btn btn-outline" onClick={() => handleDelete(pkg.id, pkg.name)}>
                      Delete
                    </button>
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