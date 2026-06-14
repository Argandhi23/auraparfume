"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface ProductFiltersProps {
  currentSort: string;
  currentSearch: string;
}

export default function ProductFilters({
  currentSort,
  currentSearch,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = useState(currentSearch);

  // Helper to construct new search params
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery("search", searchVal);
  };

  const sortOptions = [
    { name: "Terbaru", value: "" },
    { name: "Harga: Rendah ke Tinggi", value: "price-asc" },
    { name: "Harga: Tinggi ke Rendah", value: "price-desc" },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Sort row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Cari produk wewangian..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-apple-border/50 text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
          />
          <button
            type="submit"
            className="absolute left-0 top-0 bottom-0 px-4 text-apple-gray hover:text-brand flex items-center justify-center min-w-[44px] cursor-pointer"
            aria-label="Cari"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <label htmlFor="sort" className="text-xs font-semibold text-apple-gray uppercase tracking-wider">
            Urutkan
          </label>
          <select
            id="sort"
            value={currentSort}
            onChange={(e) => updateQuery("sort", e.target.value)}
            className="text-base md:text-sm py-2.5 px-4 pr-8 rounded-full border border-apple-border/50 bg-white focus:outline-none focus:ring-1 focus:ring-brand min-h-[40px] cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isPending && (
        <div className="flex justify-end">
          <span className="text-xs text-brand flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Memuat...
          </span>
        </div>
      )}
    </div>
  );
}
