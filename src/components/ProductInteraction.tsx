"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { ShoppingBag, Check } from "lucide-react";

interface SizeOption {
  id: string;
  size: string;
  priceAdd: number;
}

interface ProductInteractionProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number; // base price
    image: string;
    stock: number;
  };
  sizes: SizeOption[];
}

function formatIDR(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductInteraction({ product, sizes }: ProductInteractionProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.size || "18ml");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Find price add for selected size
  const selectedOption = sizes.find((s) => s.size === selectedSize);
  const priceAdd = selectedOption ? selectedOption.priceAdd : 0;
  const currentPrice = product.price + priceAdd;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    
    // Add to cart with final calculated price for the selected size
    addToCart(
      {
        ...product,
        price: currentPrice,
      },
      selectedSize,
      quantity
    );
    
    // Trigger visual success animation
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    if (!selectedSize) return;

    const cartItemId = `${product.id}-${selectedSize}`;
    const buyNowCart = [{
      id: cartItemId,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      size: selectedSize,
      quantity: quantity,
      image: product.image
    }];

    localStorage.setItem("parfume_cart", JSON.stringify(buyNowCart));
    window.dispatchEvent(new Event("cart-updated"));
    router.push("/checkout");
  };

  const handleQtyChange = (val: number) => {
    if (val < 1) return;
    if (val > product.stock) return;
    setQuantity(val);
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Price Display */}
      <div className="-mt-2">
        <p className="text-3xl font-bold text-apple-text">
          {formatIDR(currentPrice)}
        </p>
      </div>

      {/* Sizes Selection */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-apple-gray">
            Pilihan Ukuran
          </span>
          <div className="flex flex-wrap gap-3">
            {sizes.map((s) => {
              const isSelected = selectedSize === s.size;
              const sizePrice = product.price + s.priceAdd;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSize(s.size)}
                  className={`text-xs md:text-sm py-3 px-5 rounded-full border transition-all duration-300 font-semibold flex flex-col items-center gap-0.5 min-w-[80px] cursor-pointer ${
                    isSelected
                      ? "border-brand bg-brand text-white shadow-xs"
                      : "border-apple-border/50 bg-white text-apple-text hover:border-apple-text"
                  }`}
                >
                  <span>{s.size}</span>
                  <span className={`text-[9px] font-medium ${isSelected ? "text-white/80" : "text-apple-gray"}`}>
                    {formatIDR(sizePrice)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Stock */}
      <div className="flex items-center gap-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-apple-gray block">
            Jumlah
          </span>
          <div className="flex items-center border border-apple-border/50 rounded-full overflow-hidden bg-white">
            <button
              onClick={() => handleQtyChange(quantity - 1)}
              disabled={quantity <= 1}
              className="px-4 py-3 hover:bg-apple-bg text-apple-text disabled:opacity-40 transition-colors min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <span className="w-10 text-center text-sm font-semibold text-apple-text">
              {quantity}
            </span>
            <button
              onClick={() => handleQtyChange(quantity + 1)}
              disabled={quantity >= product.stock}
              className="px-4 py-3 hover:bg-apple-bg text-apple-text disabled:opacity-40 transition-colors min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div className="self-end pb-1.5">
          <span className={`text-xs font-semibold uppercase tracking-wider ${product.stock > 0 ? "text-neutral-900" : "text-neutral-400 line-through"}`}>
            {product.stock > 0 ? `Tersedia: ${product.stock} botol` : "Stok Habis"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`flex-1 py-4 rounded-full flex items-center justify-center gap-3 font-semibold transition-all duration-300 border border-black cursor-pointer ${
            added
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-neutral-50"
          } disabled:opacity-40 disabled:pointer-events-none`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Berhasil Ditambahkan
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Tambah ke Keranjang
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={product.stock <= 0}
          className="flex-1 bg-black hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
        >
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
