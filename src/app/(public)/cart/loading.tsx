import React from "react";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="h-10 w-64 md:h-12 md:w-80 bg-neutral-300 rounded-lg animate-pulse mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Cart Items List Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex gap-4 md:gap-6 py-6 border-b border-neutral-100 items-center"
              >
                {/* Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-100 rounded-xl animate-pulse flex-shrink-0" />

                {/* Info */}
                <div className="flex-grow space-y-2">
                  <div className="h-3 w-12 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="h-5 w-1/2 bg-neutral-300 rounded-md animate-pulse" />
                  <div className="h-4 w-20 bg-neutral-200 rounded-md animate-pulse" />
                </div>

                {/* Price and Qty */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="h-5 w-24 bg-neutral-300 rounded-md animate-pulse" />
                  <div className="h-8 w-24 bg-neutral-100 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box Skeleton */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="h-6 w-32 bg-neutral-300 rounded-md animate-pulse" />
            <hr className="border-neutral-100" />
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-neutral-200 rounded-md animate-pulse" />
                <div className="h-4 w-24 bg-neutral-300 rounded-md animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-neutral-200 rounded-md animate-pulse" />
                <div className="h-4 w-16 bg-neutral-300 rounded-md animate-pulse" />
              </div>
            </div>

            <hr className="border-neutral-100" />

            <div className="flex justify-between">
              <div className="h-5 w-16 bg-neutral-300 rounded-md animate-pulse" />
              <div className="h-5 w-28 bg-neutral-300 rounded-md animate-pulse" />
            </div>

            <div className="h-12 w-full bg-neutral-300 rounded-full animate-pulse pt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
