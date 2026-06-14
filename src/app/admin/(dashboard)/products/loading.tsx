import React from "react";

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-200 rounded-md animate-pulse" />
          <div className="h-4 w-60 bg-neutral-100 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-neutral-300 rounded-full animate-pulse" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-12 w-full md:max-w-md bg-neutral-100 rounded-full animate-pulse" />

      {/* Table Skeleton */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-xs space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100 pb-3">
                <th className="py-3 px-2 w-16"><div className="h-4 w-10 bg-neutral-200 rounded-md" /></th>
                <th className="py-3 px-2 w-48"><div className="h-4 w-24 bg-neutral-200 rounded-md" /></th>
                <th className="py-3 px-2 w-28"><div className="h-4 w-16 bg-neutral-200 rounded-md" /></th>
                <th className="py-3 px-2 w-24"><div className="h-4 w-12 bg-neutral-200 rounded-md" /></th>
                <th className="py-3 px-2 w-24"><div className="h-4 w-12 bg-neutral-200 rounded-md" /></th>
                <th className="py-3 px-2 w-24 text-right"><div className="h-4 w-16 bg-neutral-200 rounded-md ml-auto" /></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-neutral-50 last:border-0">
                  <td className="py-4 px-2">
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg animate-pulse" />
                  </td>
                  <td className="py-4 px-2 space-y-2">
                    <div className="h-5 w-40 bg-neutral-300 rounded-md animate-pulse" />
                    <div className="h-3 w-56 bg-neutral-100 rounded-md animate-pulse" />
                  </td>
                  <td className="py-4 px-2">
                    <div className="h-4 w-20 bg-neutral-200 rounded-md animate-pulse" />
                  </td>
                  <td className="py-4 px-2">
                    <div className="h-5 w-16 bg-neutral-300 rounded-md animate-pulse" />
                  </td>
                  <td className="py-4 px-2">
                    <div className="h-5 w-12 bg-neutral-200 rounded-md animate-pulse" />
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex justify-end gap-2 ml-auto">
                      <div className="w-8 h-8 bg-neutral-100 rounded-lg animate-pulse" />
                      <div className="w-8 h-8 bg-neutral-100 rounded-lg animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
