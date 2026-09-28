"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import { createOrder } from "@/lib/api";
import { Package, PackageTier } from "@/types";
import { showError, showOrderSuccess } from "@/lib/alerts";

const COUNTDOWN_SECONDS = 15 * 60;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// বাংলাদেশি মোবাইল নম্বর: 01[3-9]XXXXXXXX (মোট ১১ ডিজিট)
const BD_PHONE_REGEX = /^01[3-9][0-9]{8}$/;
const NAME_REGEX = /^[\u0980-\u09FFa-zA-Z][\u0980-\u09FFa-zA-Z\s.'-]{2,49}$/;

function validateName(value: string): string {
  if (!value.trim()) return "নাম দিতে হবে।";
  if (!NAME_REGEX.test(value.trim())) return "সঠিক নাম দিন (শুধু অক্ষর, সংখ্যা/চিহ্ন নয়)।";
  return "";
}

function validatePhone(value: string): string {
  const cleaned = value.trim().replace(/[\s-]/g, "");
  if (!cleaned) return "মোবাইল নম্বর দিতে হবে।";
  if (!BD_PHONE_REGEX.test(cleaned)) return "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন 01XXXXXXXXX)।";
  return "";
}

function validateAddress(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "ঠিকানা দিতে হবে।";
  if (trimmed.length < 10) return "ঠিকানা আরেকটু বিস্তারিত লিখুন (কমপক্ষে ১০ ক্যারেক্টার)।";
  const distinctChars = new Set(trimmed.replace(/\s/g, "").toLowerCase()).size;
  if (distinctChars < 4) return "সঠিক ঠিকানা লিখুন।";
  return "";
}

export default function OrderForm({ pkg }: { pkg: Package }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [selectedTierId, setSelectedTierId] = useState<string>(pkg.tiers[0]?.id || "");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [fieldErrors, setFieldErrors] = useState({ name: "", phone: "", address: "" });
  const [touched, setTouched] = useState({ name: false, phone: false, address: false });

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const selectedTier: PackageTier | undefined = useMemo(
    () => pkg.tiers.find((t) => t.id === selectedTierId),
    [pkg.tiers, selectedTierId]
  );

  const subtotal = selectedTier ? Number(selectedTier.price) : 0;
  const deliveryCharge = Number(pkg.deliveryCharge);
  const total = subtotal + deliveryCharge;

  function handleBlur(field: "name" | "phone" | "address") {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === "name" ? customerName : field === "phone" ? phone : address;
    const validator = field === "name" ? validateName : field === "phone" ? validatePhone : validateAddress;
    setFieldErrors((prev) => ({ ...prev, [field]: validator(value) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nameErr = validateName(customerName);
    const phoneErr = validatePhone(phone);
    const addressErr = validateAddress(address);

    setFieldErrors({ name: nameErr, phone: phoneErr, address: addressErr });
    setTouched({ name: true, phone: true, address: true });

    if (nameErr || phoneErr || addressErr) {
      setStatus("error");
      setErrorMsg("অনুগ্রহ করে ফর্মের ভুলগুলো ঠিক করুন।");
      return;
    }

    if (!selectedTierId || !selectedTier) {
      setStatus("error");
      setErrorMsg("অনুগ্রহ করে একটি প্যাক নির্বাচন করুন।");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get("utm_source") || "website";
      const cleanName = customerName.trim();

      await createOrder({
        packageId: pkg.id,
        packageTierId: selectedTierId,
        customerName: cleanName,
        phone: phone.trim().replace(/[\s-]/g, ""),
        address: address.trim(),
        note,
        source,
      });

      setStatus("success");
      await showOrderSuccess({
        name: escapeHtml(cleanName),
        packLabel: escapeHtml(selectedTier.label),
        total,
      });
    } catch (err: unknown) {
      setStatus("error");
      const msg = getErrorMessage(err, "অর্ডার সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।");
      setErrorMsg(msg);
      showError("অর্ডার ব্যর্থ হয়েছে", msg);
    }
  }

  if (status === "success") {
    return (
      <div className="order-form">
        <p className="form-msg-success">
          ধন্যবাদ, {customerName}! আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="countdown-box">
        <p className="countdown-label">সীমিত সময়ের জন্য অফার!</p>
        <div className="countdown-timer">{formatTime(secondsLeft)}</div>
      </div>

      {pkg.tiers.length > 0 && (
        <div className="tier-grid">
          {pkg.tiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              className={`tier-option ${selectedTierId === tier.id ? "tier-option-active" : ""}`}
              onClick={() => setSelectedTierId(tier.id)}
            >
              <span className="tier-label">{tier.label}</span>
              <span className="tier-price">৳{tier.price}</span>
            </button>
          ))}
        </div>
      )}

      {selectedTier && (
        <div className="price-summary">
          <div className="price-row">
            <span>নির্বাচিত প্যাকেজ</span>
            <strong>{selectedTier.label}</strong>
          </div>
          <div className="price-row">
            <span>পণ্যের মূল্য</span>
            <span>৳{subtotal}</span>
          </div>
          <div className="price-row">
            <span>ক্যাশ অন ডেলিভারি চার্জ</span>
            <span>৳{deliveryCharge}</span>
          </div>
          <div className="price-row price-row-total">
            <span>মোট</span>
            <strong>৳{total}</strong>
          </div>
        </div>
      )}

      <form className="order-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="customerName">নাম</label>
          <input
            id="customerName"
            className={touched.name && fieldErrors.name ? "input-invalid" : ""}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="আপনার নাম"
          />
          {touched.name && fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor="address">ডেলিভারি ঠিকানা</label>
          <input
            id="address"
            className={touched.address && fieldErrors.address ? "input-invalid" : ""}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => handleBlur("address")}
            placeholder="বাড়ি/রোড/এলাকা, শহর"
          />
          {touched.address && fieldErrors.address && <p className="field-error">{fieldErrors.address}</p>}
        </div>

        <div className="field">
          <label htmlFor="phone">মোবাইল নম্বর</label>
          <input
            id="phone"
            className={touched.phone && fieldErrors.phone ? "input-invalid" : ""}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => handleBlur("phone")}
            placeholder="01XXXXXXXXX"
            inputMode="numeric"
          />
          {touched.phone && fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
        </div>

        <div className="field">
          <label htmlFor="note">নোট (ঐচ্ছিক)</label>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন"
          />
        </div>

        {status === "error" && <p className="form-msg-error">{errorMsg}</p>}

        <button type="submit" className="btn btn-accent btn-block" disabled={status === "loading" || !selectedTierId}>
          {status === "loading" ? "অর্ডার হচ্ছে..." : `🔥 অর্ডার করতে চাই — ৳${total}`}
        </button>

        <p className="order-policy-note">
          অর্ডার করার আগে অনুগ্রহ করে নিচের অর্ডার পলিসি ভালোভাবে পড়ে নিন।
        </p>
      </form>
    </>
  );
}