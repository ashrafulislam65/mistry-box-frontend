"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="pagination">
      <button className="btn btn-outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← আগের
      </button>
      {pages.map((p, i) => (
        <span key={p}>
          {i > 0 && pages[i - 1] !== p - 1 && <span className="pagination-dots">…</span>}
          <button
            className={`pagination-page ${p === page ? "pagination-page-active" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        </span>
      ))}
      <button className="btn btn-outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        পরের →
      </button>
    </div>
  );
}