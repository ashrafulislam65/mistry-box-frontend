import { getCategories } from "@/lib/api";
import PackageCard from "@/components/PackageCard";

export const revalidate = 0;

export default async function HomePage() {
  const { data: categories } = await getCategories();

  return (
    <main>
      <header className="site-header">
        <div className="container header-inner">
          <span className="brand-name">মিস্ত্রি বক্স</span>
          <nav className="nav-links">
            <span>ক্যাটাগরি</span>
            <span>যোগাযোগ</span>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h1>ঘরের কাজে যা লাগে, একটা বক্সেই সব</h1>
          <p>
            ছোট মেরামত থেকে শুরু করে বড় হোম-ইম্প্রুভমেন্ট — প্রয়োজন অনুযায়ী বাছাই করা মিস্ত্রি বক্স অর্ডার করুন,
            পৌঁছে যাবে আপনার দরজায়।
          </p>
        </div>
      </section>

      {(categories || []).map((category) => (
        <section key={category.id} className="category-section">
          <div className="container">
            <div className="category-heading">
              <h2>{category.name}</h2>
            </div>
            {category.description && <p className="category-desc">{category.description}</p>}

            {category.packages.length === 0 ? (
              <p className="package-desc">এই মুহূর্তে কোনো প্যাকেজ নেই।</p>
            ) : (
              <div className="package-grid">
                {category.packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}