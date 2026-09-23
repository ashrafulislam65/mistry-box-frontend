"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import { createOrder } from "@/lib/api";
import { Package, PackageTier } from "@/types";
import { showError } from "@/lib/alerts";

const COUNTDOWN_SECONDS = 15 * 60; // ১৫ মিনিট urgency timer, শুধু visual — অর্ডার ব্লক করে না

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedTierId) {
      setStatus("error");
      setErrorMsg("অনুগ্রহ করে একটি প্যাক নির্বাচন করুন।");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get("utm_source") || "website";

      await createOrder({
        packageId: pkg.id,
        packageTierId: selectedTierId,
        customerName,
        phone,
        address,
        note,
        source,
      });
      setStatus("success");
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
      {/* Urgency countdown */}
      <div className="countdown-box">
        <p className="countdown-label">সীমিত সময়ের জন্য অফার!</p>
        <div className="countdown-timer">{formatTime(secondsLeft)}</div>
      </div>

      {/* Pack tier selector */}
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

      {/* Price breakdown */}
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

      <form className="order-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="customerName">নাম</label>
          <input
            id="customerName"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="আপনার নাম"
          />
        </div>

        <div className="field">
          <label htmlFor="address">ডেলিভারি ঠিকানা</label>
          <input
            id="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="বাড়ি/রোড/এলাকা, শহর"
          />
        </div>

        <div className="field">
          <label htmlFor="phone">মোবাইল নম্বর</label>
          <input
            id="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
          />
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

      {/* Order policy section */}
      <div className="policy-section">
        <h2 className="policy-title">অর্ডার নীতিমালা</h2>
        <div className="policy-grid">
          <div className="policy-card">
            <h4>পেমেন্ট পদ্ধতি</h4>
            <p>সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।</p>
          </div>
          <div className="policy-card">
            <h4>প্যাক নির্বাচন</h4>
            <p>অর্ডার করতে অবশ্যই উপলব্ধ প্যাকেজগুলোর একটি নির্বাচন করতে হবে।</p>
          </div>
          <div className="policy-card">
            <h4>ডেলিভারি চার্জ</h4>
            <p>মোট অর্ডারের সাথে নির্ধারিত ডেলিভারি চার্জ যোগ করা হবে।</p>
          </div>
        </div>
      </div>
    </>
  );
}