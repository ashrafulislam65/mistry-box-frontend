import Link from "next/link";
import { Package } from "@/types";

export default function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <div className="package-card">
      {pkg.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pkg.imageUrl} alt={pkg.name} className="package-card-img" />
      ) : (
        <div className="package-card-img" />
      )}
      <h3 className="package-name">{pkg.name}</h3>
      <p className="package-desc">{pkg.description}</p>
      <div className="package-price">৳{pkg.price}</div>
      <Link href={`/package/${pkg.slug}`} className="btn btn-accent btn-block">
        Order Now
      </Link>
    </div>
  );
}