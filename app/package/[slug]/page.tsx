import { notFound } from "next/navigation";
import Link from "next/link";
import { getPackageBySlug } from "@/lib/api";
import OrderForm from "@/components/OrderForm";
import type { Metadata } from "next";



export const revalidate = 0;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await getPackageBySlug(slug);
    const pkg = res.data;
    if (!pkg) return {};

    const price = pkg.tiers?.[0]?.price || pkg.price;
    const title = `${pkg.name} — ৳${price} | মিস্ত্রি বক্স`;
    const description = pkg.description;
    const imageUrl = pkg.imageUrl || undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [{ url: imageUrl, width: 800, height: 600 }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function PackageDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    let pkg;
    try {
        const res = await getPackageBySlug(slug);
        pkg = res.data;
    } catch {
        return notFound();
    }

    if (!pkg) return notFound();

    return (
        <main>
            <header className="site-header">
                <div className="container header-inner">
                    <Link href="/" className="brand-name">
                        মিস্ত্রি বক্স
                    </Link>
                </div>
            </header>

            <div className="container detail-wrap">
                <div>
                    {pkg.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pkg.imageUrl} alt={pkg.name} className="detail-img" />
                    ) : (
                        <div className="detail-img" />
                    )}
                </div>

                <div>
                    {pkg.category && <span className="detail-category-tag">{pkg.category.name}</span>}
                    <h1 className="detail-title">{pkg.name}</h1>
                    <p className="package-desc" style={{ marginBottom: 20 }}>
                        {pkg.description}
                    </p>

                    {pkg.items?.length > 0 && (
                        <ul className="items-list">
                            {pkg.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    )}

                    <OrderForm pkg={pkg} />
                </div>
            </div>
        </main>
    );
}