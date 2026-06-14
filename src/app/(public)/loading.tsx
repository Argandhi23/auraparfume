import React from "react";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION SKELETON */}
      <section className="relative min-h-[90vh] md:min-h-[95vh] flex items-center pt-24 px-6 md:px-12 overflow-hidden border-b border-neutral-100">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Text Column */}
          <div className="space-y-8 max-w-xl">
            <div className="space-y-3">
              {/* Brand label */}
              <div className="h-4 w-24 bg-neutral-200 rounded-md animate-pulse" />
              {/* Heading */}
              <div className="space-y-2">
                <div className="h-12 w-3/4 bg-neutral-300 rounded-lg animate-pulse" />
                <div className="h-12 w-2/3 bg-neutral-300 rounded-lg animate-pulse" />
                <div className="h-12 w-1/2 bg-neutral-300 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-neutral-200 rounded-md animate-pulse" />
              <div className="h-4 w-5/6 bg-neutral-200 rounded-md animate-pulse" />
              <div className="h-4. w-4/5 bg-neutral-200 rounded-md animate-pulse" />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <div className="h-12 w-40 bg-neutral-300 rounded-full animate-pulse" />
              <div className="h-10 w-32 bg-neutral-200 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Right Image Column */}
          <div className="relative h-[450px] md:h-[650px] w-full flex items-center justify-center">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-neutral-100/80 blur-3xl" />
            <div className="w-[80%] h-[80%] bg-neutral-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>

      {/* 2. BEST SELLERS GRID SKELETON */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-neutral-200 rounded-md animate-pulse" />
            <div className="h-8 w-48 bg-neutral-300 rounded-lg animate-pulse" />
          </div>
          <div className="h-5 w-36 bg-neutral-200 rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
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
      </section>
    </div>
  );
}
