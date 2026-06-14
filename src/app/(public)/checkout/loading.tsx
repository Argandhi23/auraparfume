import React from "react";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Link Skeleton */}
        <div className="h-4 w-28 bg-neutral-200 rounded-md animate-pulse mb-8" />

        {/* Title */}
        <div className="h-10 w-48 md:h-12 md:w-64 bg-neutral-300 rounded-lg animate-pulse mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Form Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Customer Info */}
            <div className="space-y-4">
              <div className="h-5 w-40 bg-neutral-300 rounded-md animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-3.5 w-24 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="h-12 w-full bg-neutral-100 rounded-lg animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-32 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="h-12 w-full bg-neutral-100 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-28 bg-neutral-200 rounded-md animate-pulse" />
                <div className="h-24 w-full bg-neutral-100 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-44 bg-neutral-200 rounded-md animate-pulse" />
                <div className="h-12 w-full bg-neutral-100 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-4">
              <div className="h-5 w-36 bg-neutral-300 rounded-md animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-20 w-full bg-neutral-50 border border-neutral-100 rounded-xl animate-pulse" />
                <div className="h-20 w-full bg-neutral-50 border border-neutral-100 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="h-6 w-36 bg-neutral-300 rounded-md animate-pulse" />
            <hr className="border-neutral-100" />

            {/* Item list skeleton */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center gap-4">
                  <div className="space-y-1.5 flex-grow">
                    <div className="h-4 w-32 bg-neutral-300 rounded-md animate-pulse" />
                    <div className="h-3 w-16 bg-neutral-200 rounded-md animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-neutral-300 rounded-md animate-pulse flex-shrink-0" />
                </div>
              ))}
            </div>

            <hr className="border-neutral-100" />

            <div className="flex justify-between">
              <div className="h-5 w-16 bg-neutral-300 rounded-md animate-pulse" />
              <div className="h-5 w-24 bg-neutral-300 rounded-md animate-pulse" />
            </div>

            <div className="h-12 w-full bg-neutral-300 rounded-full animate-pulse pt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
