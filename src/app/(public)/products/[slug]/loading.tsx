import React from "react";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Product Details Split Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column: Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square w-full bg-neutral-100 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Column: Info Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-4 w-28 bg-neutral-200 rounded-md animate-pulse" />
              <div className="h-10 w-3/4 bg-neutral-300 rounded-lg animate-pulse" />
              <div className="h-7 w-32 bg-neutral-300 rounded-md animate-pulse pt-2" />
            </div>

            <hr className="border-neutral-100" />

            {/* Description */}
            <div className="space-y-3">
              <div className="h-3 w-32 bg-neutral-200 rounded-md animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-neutral-200 rounded-md animate-pulse" />
                <div className="h-4 w-full bg-neutral-200 rounded-md animate-pulse" />
                <div className="h-4 w-4/5 bg-neutral-200 rounded-md animate-pulse" />
              </div>
            </div>

            <hr className="border-neutral-100" />

            {/* Sizes / Interaction Skeleton */}
            <div className="space-y-4">
              <div className="h-3 w-20 bg-neutral-200 rounded-md animate-pulse" />
              <div className="flex gap-3">
                <div className="h-10 w-20 bg-neutral-100 rounded-full animate-pulse" />
                <div className="h-10 w-20 bg-neutral-100 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Quantity and CTA */}
            <div className="space-y-4 pt-4">
              <div className="h-12 w-full bg-neutral-300 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
