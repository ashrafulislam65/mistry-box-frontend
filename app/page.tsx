import { getProduct } from "@/lib/api";
import OrderForm from "@/components/OrderForm";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CONTACT_PHONE = "01354-207999";
const CONTACT_PHONE_TEL = "+8801354207999";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mistry-box-frontend.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await getProduct();
    const pkg = res.data;
    if (!pkg) return {};

    const price = pkg.tiers?.[0]?.price || pkg.price;
    const title = `${pkg.name} — ৳${price} | Darazz Mystery Box`;
    const imageUrl = pkg.imageUrl || undefined;

    return {
      title,
      description: pkg.description,
      alternates: {
        canonical: SITE_URL,
      },
      openGraph: {
        title,
        description: pkg.description,
        url: SITE_URL,
        siteName: "Darazz Mystery Box",
        locale: "bn_BD",
        type: "website",
        images: imageUrl
          ? [{ url: imageUrl, width: 1200, height: 630, alt: pkg.name }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: pkg.description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const { data: pkg } = await getProduct();

  if (!pkg) {
    return (
      <main className="site-shell">
        <div className="container" style={{ padding: 60, textAlign: "center" }}>
          <p>এই মুহূর্তে কোনো প্রোডাক্ট নেই। অনুগ্রহ করে পরে আবার দেখুন।</p>
        </div>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <span className="brand-name">
            <span className="brand-icon">📦</span>Darazz Mystery Box
          </span>
          <nav className="nav-links">
            <a href={`tel:${CONTACT_PHONE_TEL}`}>📞 {CONTACT_PHONE}</a>
            <Link href="/contact">যোগাযোগ</Link>
          </nav>
        </div>
      </header>

      {/* Product */}
      <div className="container" style={{ paddingTop: 32, maxWidth: 640 }}>
        {pkg.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pkg.imageUrl} alt={pkg.name} className="product-hero-img" />
        ) : (
          <div className="product-hero-img" style={{ background: "var(--bg-alt)", aspectRatio: "4/3" }} />
        )}

        <h1 className="product-title">{pkg.name}</h1>

        <OrderForm pkg={pkg} />
      </div>

      {/* Policies */}
      <section className="policy-page-section">
        <div className="container">
          <h2 className="section-heading">নীতিমালা</h2>
          <p className="section-subheading">অর্ডার করার আগে অনুগ্রহ করে নিচের নীতিমালাগুলো পড়ে নিন।</p>

          <div className="policy-block">
            <h3 style={{ textAlign: "center", marginBottom: 16 }}>অর্ডার নীতিমালা</h3>

            <div className="policy-block-card">
              <h4>পেমেন্ট পদ্ধতি</h4>
              <p>সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।</p>
            </div>

            <div className="policy-block-card">
              <h4>ন্যূনতম অর্ডার</h4>
              <p>অর্ডার করতে অবশ্যই উপলব্ধ প্যাকেজগুলোর (৬ / ৭ / ১০ প্যাক) যেকোনো একটি নির্বাচন করতে হবে।</p>
            </div>

            <div className="policy-block-card">
              <h4>ডেলিভারি চার্জ</h4>
              <p>মোট অর্ডারের সাথে নির্ধারিত ডেলিভারি চার্জ যোগ করা হবে।</p>
            </div>

            <div className="policy-block-card">
              <h4>ডেলিভারি প্রক্রিয়া</h4>
              <p>
                অর্ডারকৃত পণ্য সিল করা মিস্ট্রি বক্স হিসেবে ডেলিভারি করা হবে। বক্স খোলার আগে পণ্য চেক করার সুযোগ নেই,
                কারণ বক্সের ভিতরে কী থাকবে তা সম্পূর্ণ আপনার ভাগ্যের উপর নির্ভর করে।
              </p>
            </div>

            <div className="policy-block-card">
              <h4>অর্ডার নিশ্চিতকরণ</h4>
              <p>ডেলিভারির আগে আমাদের টিম আপনার অর্ডার নিশ্চিত করতে কল করতে পারে (📞 {CONTACT_PHONE})।</p>
            </div>

            <h3 style={{ textAlign: "center", margin: "32px 0 16px" }}>রিটার্ন নীতিমালা</h3>

            <div className="policy-block-card">
              <h4>রিটার্ন করার নিয়ম</h4>
              <p>
                • পার্সেল খোলার সময় অবশ্যই আনবক্সিং ভিডিও করতে হবে।
                <br />
                • ডেলিভারির ২৪ ঘণ্টার মধ্যে সমস্যার ক্ষেত্রে সাপোর্টে যোগাযোগ করতে হবে।
                <br />
                • অনুমোদনের পর রিটার্ন পিকআপ হতে ২-৩ দিন সময় লাগতে পারে।
                <br />
                • রিটার্নকৃত পার্সেল গ্রহণের পর রিফান্ড প্রসেস করা হবে।
              </p>
            </div>

            <div className="policy-note-box">
              <strong>নোট:</strong> মিস্ট্রি বক্স সম্পূর্ণ সিল করা অবস্থায় পাঠানো হয়। বক্সের ভিতরে কী থাকবে তা
              সম্পূর্ণ আপনার ভাগ্যের উপর নির্ভর করে।
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="brand-name">
                <span className="brand-icon">📦</span>Darazz Mystery Box
              </span>
              <p>আপনার ঘর ও কাজের জন্য দরকারি টুলস, রেডি বক্সে — সরাসরি আপনার দরজায়।</p>
            </div>
            <div className="footer-contact">
              <strong>যোগাযোগ</strong>
              <a href={`tel:${CONTACT_PHONE_TEL}`}>📞 {CONTACT_PHONE}</a>
              <a href="https://www.facebook.com/share/1EcqWzUf34/" target="_blank" rel="noreferrer">
                📘 Facebook Page
              </a>
            </div>
          </div>
          <div className="footer-bottom">© {new Date().getFullYear()} Darazz Mystery Box। সর্বস্বত্ব সংরক্ষিত।</div>
        </div>
      </footer>
    </main>
  );
}