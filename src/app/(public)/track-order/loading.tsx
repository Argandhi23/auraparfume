import React from "react";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="h-4 w-24 bg-neutral-200 rounded-md animate-pulse mx-auto" />
          <div className="h-10 w-64 md:h-12 md:w-80 bg-neutral-300 rounded-lg animate-pulse mx-auto" />
          <div className="h-4 w-3/4 max-w-md bg-neutral-200 rounded-md animate-pulse mx-auto" />
        </div>

        {/* Search Input Box Skeleton */}
        <div className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <div className="h-12 bg-neutral-100 rounded-full animate-pulse flex-grow" />
            <div className="h-12 w-full sm:w-36 bg-neutral-300 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Feature Points Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 max-w-2xl mx-auto border-t border-neutral-100">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
              <div className="space-y-2 flex-grow">
                <div className="h-4 w-28 bg-neutral-300 rounded-md animate-pulse" />
                <div className="h-3 w-full bg-neutral-200 rounded-md animate-pulse" />
                <div className="h-3 w-5/6 bg-neutral-200 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
