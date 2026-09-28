"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSettings, adminUpdateSettings, adminUploadImage, adminChangePassword, isAdminLoggedIn } from "@/lib/api";
import { showSuccess, showError } from "@/lib/alerts";
import AdminSidebar from "@/components/AdminSidebar";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    bannerImageUrl: "",
    bannerTag: "",
    bannerTitle: "",
    bannerSubtitle: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
      return;
    }
    (async () => {
      try {
        const res = await getSettings();
        if (res.data) {
          setForm({
            bannerImageUrl: res.data.bannerImageUrl || "",
            bannerTag: res.data.bannerTag,
            bannerTitle: res.data.bannerTitle,
            bannerSubtitle: res.data.bannerSubtitle,
          });
        }
      } catch (err: unknown) {
        showError("লোড ব্যর্থ হয়েছে", getErrorMessage(err, "আবার চেষ্টা করুন।"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminUploadImage(file);
      setForm((prev) => ({ ...prev, bannerImageUrl: url }));
      showSuccess("ছবি আপলোড হয়েছে!");
    } catch (err: unknown) {
      showError("আপলোড ব্যর্থ হয়েছে", getErrorMessage(err, "আবার চেষ্টা করুন।"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateSettings({
        bannerImageUrl: form.bannerImageUrl || null,
        bannerTag: form.bannerTag,
        bannerTitle: form.bannerTitle,
        bannerSubtitle: form.bannerSubtitle,
      });
      showSuccess("সেটিংস সেভ হয়েছে!");
    } catch (err: unknown) {
      showError("সেভ ব্যর্থ হয়েছে", getErrorMessage(err, "আবার চেষ্টা করুন।"));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showError("পাসওয়ার্ড মিলছে না", "নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড এক হতে হবে।");
      return;
    }
    setPwSaving(true);
    try {
      await adminChangePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showSuccess("পাসওয়ার্ড পরিবর্তন হয়েছে!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      showError("ব্যর্থ হয়েছে", getErrorMessage(err, "আবার চেষ্টা করুন।"));
    } finally {
      setPwSaving(false);
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
        <h2 style={{ marginTop: 0 }}>Homepage Banner Settings</h2>

        <form className="order-form" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
          <div className="field">
            <label>Banner ছবি আপলোড করুন</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageFileChange}
              disabled={uploading}
            />
            {uploading && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>আপলোড হচ্ছে...</p>}
            {form.bannerImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.bannerImageUrl}
                alt="Banner preview"
                style={{
                  marginTop: 10,
                  width: "100%",
                  maxWidth: 320,
                  aspectRatio: "16/7",
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              />
            )}
          </div>

          <div className="field">
            <label>Tag (ছোট ব্যাজ টেক্সট)</label>
            <input value={form.bannerTag} onChange={(e) => setForm({ ...form, bannerTag: e.target.value })} />
          </div>

          <div className="field">
            <label>Title</label>
            <input value={form.bannerTitle} onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })} />
          </div>

          <div className="field">
            <label>Subtitle</label>
            <textarea
              rows={2}
              value={form.bannerSubtitle}
              onChange={(e) => setForm({ ...form, bannerSubtitle: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-accent" disabled={saving}>
            {saving ? "সেভ হচ্ছে..." : "Save Settings"}
          </button>
        </form>

        <h2 style={{ marginTop: 40 }}>Change Password</h2>
        <form className="order-form" onSubmit={handlePasswordChange} style={{ maxWidth: 420 }}>
          <div className="field">
            <label>বর্তমান পাসওয়ার্ড</label>
            <input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            />
          </div>
          <div className="field">
            <label>নতুন পাসওয়ার্ড</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            />
          </div>
          <div className="field">
            <label>নতুন পাসওয়ার্ড আবার লিখুন</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-accent" disabled={pwSaving}>
            {pwSaving ? "পরিবর্তন হচ্ছে..." : "Change Password"}
          </button>
        </form>
      </main>
    </div>
  );
}