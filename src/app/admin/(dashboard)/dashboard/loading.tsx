import React from "react";

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-200 rounded-md animate-pulse" />
          <div className="h-4 w-64 bg-neutral-100 rounded-md animate-pulse" />
        </div>
        <div className="h-8 w-20 bg-neutral-100 rounded-full animate-pulse" />
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
            <div className="space-y-2 flex-grow">
              <div className="h-3.5 w-24 bg-neutral-200 rounded-md animate-pulse" />
              <div className="h-8 w-16 bg-neutral-300 rounded-md animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Recent Orders & Sales Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Placeholder */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-neutral-100 shadow-xs space-y-6">
          <div className="h-6 w-36 bg-neutral-300 rounded-md animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-neutral-50">
                <div className="space-y-1.5 flex-grow">
                  <div className="h-4 w-40 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="h-3 w-24 bg-neutral-100 rounded-md animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-neutral-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Chart Box Placeholder */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-neutral-300 rounded-md animate-pulse" />
            <div className="h-4 w-48 bg-neutral-100 rounded-md animate-pulse" />
          </div>
          <div className="h-40 w-full bg-neutral-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
