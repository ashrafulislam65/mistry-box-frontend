import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand-name">
            <span className="brand-icon">📦</span>Darazz Mystery Box
          </Link>
          <nav className="nav-links">
            <Link href="/">হোম</Link>
            <Link href="/contact">যোগাযোগ</Link>
          </nav>
        </div>
      </header>

      <section className="hero" style={{ padding: "60px 0 40px" }}>
        <div className="container">
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>আমাদের সাথে যোগাযোগ করুন</h1>
          <p>যেকোনো প্রশ্ন বা সাহায্যের জন্য নিচের যেকোনো মাধ্যমে যোগাযোগ করতে পারেন।</p>
        </div>
      </section>

      <section style={{ padding: "0 0 70px" }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">📞</div>
              <h3>কল করুন</h3>
              <p>সকাল ৯টা - রাত ৯টা</p>
              <a href="tel:+8801354207999" className="btn btn-outline">
                01354-207999
              </a>
            </div>

            <div className="contact-card">
              <div className="contact-icon">💬</div>
              <h3>হোয়াটসঅ্যাপ</h3>
              <p>দ্রুত রিপ্লাই পেতে মেসেজ করুন</p>
                            <a href="https://wa.me/8801354207999" target="_blank" rel="noreferrer" className="btn btn-outline">
                হোয়াটসঅ্যাপে মেসেজ
              </a>
            </div>

            <div className="contact-card">
              <div className="contact-icon">📘</div>
              <h3>ফেসবুক পেজ</h3>
              <p>আমাদের সর্বশেষ অফার দেখুন</p>
              <a href="https://www.facebook.com/share/1EcqWzUf34/" target="_blank" rel="noreferrer" className="btn btn-outline">
                পেজ ভিজিট করুন
              </a>
            </div>

            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <h3>ঠিকানা</h3>
              <p>ঢাকা, বাংলাদেশ</p>
              <span className="btn btn-outline" style={{ cursor: "default" }}>
                সারা বাংলাদেশে ডেলিভারি
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-bottom">
            © {new Date().getFullYear()} Darazz Mystery Box। সর্বস্বত্ব সংরক্ষিত।
          </div>
        </div>
      </footer>
    </main>
  );
}