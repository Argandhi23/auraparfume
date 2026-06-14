"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { id: string; url: string }[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const fallbackImg = "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800";
  const mainImage = images[activeIdx]?.url || fallbackImg;

  return (
    <div className="space-y-4">
      {/* Large Main Image Display */}
      <div className="relative aspect-square w-full bg-apple-bg overflow-hidden rounded-2xl border border-apple-border/20">
        <Image
          src={mainImage}
          alt={`${name} main view`}
          fill
          priority
          className="object-cover transition-all duration-500 hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={img.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative aspect-square w-20 flex-shrink-0 bg-apple-bg rounded-lg overflow-hidden border transition-all duration-300 ${
                  isActive ? "border-brand ring-1 ring-brand" : "border-apple-border/30 hover:border-apple-gray"
                }`}
                aria-label={`Lihat gambar ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={`${name} view ${idx + 1}`}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
