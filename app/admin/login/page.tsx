"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { showSuccess, showError } from "@/lib/alerts";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminLogin(email, password);
      await showSuccess("লগইন সফল হয়েছে!");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Login failed");
      setError(msg);
      showError("লগইন ব্যর্থ হয়েছে", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="brand-name" style={{ marginBottom: 8 }}>
          <span className="brand-icon">📦</span>Darazz Mystery Box Admin
        </span>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="form-msg-error">{error}</p>}

        <button type="submit" className="btn btn-accent btn-block" disabled={loading}>
          {loading ? "লগইন হচ্ছে..." : "Login"}
        </button>
      </form>
    </div>
  );
}