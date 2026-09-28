"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  adminGetProduct,
  adminUpdateProduct,
  adminUploadImage,
  isAdminLoggedIn,
} from "@/lib/api";
import { showSuccess, showError } from "@/lib/alerts";
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

const emptyTiers: TierForm[] = [
  { label: "৬ প্যাক", quantity: "6", price: "" },
  { label: "৭ প্যাক", quantity: "7", price: "" },
  { label: "১০ প্যাক", quantity: "10", price: "" },
];

export default function AdminProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: "",
    deliveryCharge: "99",
    description: "",
    items: "",
    imageUrl: "",
    isActive: true,
    facebookPostUrl: "",
  });
  const [tiers, setTiers] = useState<TierForm[]>(emptyTiers);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
      return;
    }
    (async () => {
      try {
        const res = await adminGetProduct();
        const pkg = res.data;
        if (pkg) {
          setForm({
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
          if (pkg.tiers.length > 0) {
            setTiers(pkg.tiers.map((t) => ({ label: t.label, quantity: String(t.quantity), price: t.price })));
          }
        }
      } catch (err: unknown) {
        showError("লোড ব্যর্থ হয়েছে", getErrorMessage(err, "আবার চেষ্টা করুন।"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateTier(index: number, field: keyof TierForm, value: string) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addTierRow() {
    setTiers((prev) => [...prev, { label: "", quantity: "", price: "" }]);
  }

  function removeTierRow(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminUploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      showSuccess("ছবি আপলোড হয়েছে!");
    } catch (err: unknown) {
      showError("আপলোড ব্যর্থ হয়েছে", getErrorMessage(err, "আবার চেষ্টা করুন।"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaveError("");

    const validTiers = tiers
      .filter((t) => t.label.trim() && t.quantity && t.price)
      .map((t) => ({ label: t.label.trim(), quantity: Number(t.quantity), price: Number(t.price) }));

    if (validTiers.length === 0) {
      setSaveError("অন্তত একটি প্যাক/tier দিতে হবে।");
      return;
    }

    setSaving(true);
    try {
      await adminUpdateProduct({
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
      });
      showSuccess("প্রোডাক্ট সেভ হয়েছে!");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "সেভ করা যায়নি।");
      setSaveError(msg);
      showError("সেভ ব্যর্থ হয়েছে", msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <h2 style={{ marginTop: 0 }}>Product Settings</h2>

        <form className="order-form" onSubmit={handleSubmit} style={{ maxWidth: 620 }}>
          <div className="field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="field">
            <label>Slug</label>
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>

          <div className="field">
            <label>Base Price (৳)</label>
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
            <label>Image URL (অথবা নিচে থেকে ফাইল আপলোড করুন)</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>

          <div className="field">
            <label>অথবা ফাইল আপলোড করুন</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageFileChange}
              disabled={uploading}
            />
            {uploading && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>আপলোড হচ্ছে...</p>}
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imageUrl}
                alt="Preview"
                style={{ marginTop: 10, width: 120, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }}
              />
            )}
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
              Active
            </label>
          </div>

          <div className="field">
            <label>Pack / Quantity Tiers</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tiers.map((tier, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    placeholder="লেবেল"
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
                  <button type="button" className="btn btn-outline" onClick={() => removeTierRow(i)}>
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

          <button type="submit" className="btn btn-accent" disabled={saving}>
            {saving ? "সেভ হচ্ছে..." : "Save Product"}
          </button>
        </form>
      </main>
    </div>
  );
}