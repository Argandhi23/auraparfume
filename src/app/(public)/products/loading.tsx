import React from "react";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Title */}
        <div className="space-y-3">
          <div className="h-4 w-24 bg-neutral-200 rounded-md animate-pulse" />
          <div className="h-10 w-64 md:h-14 md:w-96 bg-neutral-300 rounded-lg animate-pulse" />
          <div className="space-y-1.5 max-w-lg">
            <div className="h-4 w-full bg-neutral-200 rounded-md animate-pulse" />
            <div className="h-4 w-5/6 bg-neutral-200 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Filters Panel Skeleton */}
        <div className="h-20 bg-neutral-50 border border-neutral-100 rounded-2xl animate-pulse" />

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <div className="relative aspect-square w-full bg-neutral-100 rounded-2xl animate-pulse" />
              <div className="flex justify-between items-start pt-2">
                <div className="space-y-2 w-2/3">
                  <div className="h-3 w-16 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="h-5 w-full bg-neutral-300 rounded-md animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-neutral-300 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
