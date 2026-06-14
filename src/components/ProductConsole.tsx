"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProduct, updateProduct, deleteProduct, uploadProductImage } from "@/lib/actions/product";
import { Plus, Trash2, X, Loader2, AlertCircle, UploadCloud, Link as LinkIcon } from "lucide-react";

interface ProductSize {
  id: string;
  size: string;
  priceAdd: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  sizes: ProductSize[];
  images: { id: string; url: string }[];
}

interface ProductConsoleProps {
  initialProducts: Product[];
}

interface FormVariant {
  size: string;
  price: number;
  stock: number;
}

function formatIDR(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductConsole({ initialProducts }: ProductConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<FormVariant[]>([
    { size: "18ml", price: 25000, stock: 10 }
  ]);

  // Helpers
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      );
    }
  };

  const handleAddVariantRow = () => {
    setVariants([...variants, { size: "", price: 0, stock: 0 }]);
  };

  const handleRemoveVariantRow = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (idx: number, field: keyof FormVariant, val: string | number) => {
    setVariants(
      variants.map((v, i) => {
        if (i === idx) {
          return { ...v, [field]: val };
        }
        return v;
      })
    );
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setProductImages([...productImages, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const handleRemoveImage = (idx: number) => {
    setProductImages(productImages.filter((_, i) => i !== idx));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true);
      setErrorMsg("");

      const res = await uploadProductImage(formData);
      setIsUploading(false);

      if (res.success && res.imageUrl) {
        setProductImages([...productImages, res.imageUrl]);
      } else {
        setErrorMsg(res.error || "Gagal mengunggah gambar.");
      }
    }
  };

  const handleOpenAddForm = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setDescription("");
    setProductImages([]);
    setVariants([{ size: "18ml", price: 25000, stock: 10 }]);
    setErrorMsg("");
    setIsFormOpen(true);
  };

  const handleEditClick = (p: Product) => {
    setEditId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description);
    setProductImages(p.images.map((img) => img.url));
    
    // Reconstruct variants
    if (p.sizes && p.sizes.length > 0) {
      setVariants(
        p.sizes.map((s, idx) => {
          return {
            size: s.size,
            price: p.price + s.priceAdd,
            stock: idx === 0 ? p.stock : 0,
          };
        })
      );
    } else {
      setVariants([{ size: "18ml", price: p.price, stock: p.stock }]);
    }
    setErrorMsg("");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (productImages.length === 0) {
      setErrorMsg("Harap sertakan minimal satu gambar produk.");
      return;
    }

    if (variants.length === 0) {
      setErrorMsg("Harap isi minimal satu varian ukuran.");
      return;
    }

    // Check sizes validity
    for (const v of variants) {
      if (!v.size.trim()) {
        setErrorMsg("Ukuran varian tidak boleh kosong.");
        return;
      }
      if (v.price <= 0) {
        setErrorMsg("Harga varian harus lebih besar dari 0.");
        return;
      }
    }

    // Sort variants by price to find smallest price
    const sorted = [...variants].sort((a, b) => a.price - b.price);
    const basePrice = sorted[0].price;
    const totalStock = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);

    const sizesPayload = variants.map((v) => ({
      size: v.size.trim(),
      priceAdd: v.price - basePrice,
    }));

    startTransition(async () => {
      let res;
      const payload = {
        name,
        slug,
        description,
        price: basePrice,
        stock: totalStock,
        sizes: sizesPayload,
        images: productImages,
      };

      if (editId) {
        res = await updateProduct(editId, payload);
      } else {
        res = await createProduct(payload);
      }

      if (res.success) {
        setIsFormOpen(false);
        setEditId(null);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Terjadi kesalahan.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini secara permanen?")) {
      startTransition(async () => {
        const res = await deleteProduct(id);
        if (res.success) {
          router.refresh();
        } else {
          setErrorMsg(res.error || "Gagal menghapus produk.");
        }
      });
    }
  };

  const getSizesPriceText = (p: Product) => {
    if (!p.sizes || p.sizes.length === 0) {
      return formatIDR(p.price);
    }
    return p.sizes
      .map((s) => {
        const finalPrice = p.price + s.priceAdd;
        return `${s.size} - Rp ${(finalPrice / 1000)}rb`;
      })
      .join(" | ");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black">Kelola Produk</h2>
          <p className="text-xs text-neutral-600 mt-1">Tambah, edit, dan hapus katalog parfum AURA.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenAddForm}
            className="bg-black hover:bg-neutral-800 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Produk Baru
          </button>
        )}
      </div>

      {/* Quick Guide */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-2 text-xs text-black">
        <h4 className="font-bold text-black flex items-center gap-1.5 text-sm">
          💡 Cara menambah produk:
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-black">
          <li>Klik tombol <strong>"Tambah Produk Baru"</strong> di atas.</li>
          <li>Isi nama, deskripsi (maks. 200 karakter), dan unggah atau masukkan URL foto produk.</li>
          <li>Tentukan varian ukuran (misal 18ml/35ml), harga jual lengkap, dan stok masing-masing.</li>
          <li>Klik <strong>"Simpan Produk"</strong> untuk menyimpan ke katalog.</li>
        </ol>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CRUD Form Inline Expand (under table) */}
      {isFormOpen && (
        <div className="bg-neutral-50 p-6 md:p-8 rounded-2xl border border-neutral-200 space-y-6 animate-scaleIn shadow-xs">
          <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
            <h3 className="text-lg font-bold text-black">
              {editId ? `Ubah Produk: ${name}` : "Tambahkan Produk Baru"}
            </h3>
            <button
              onClick={handleCloseForm}
              className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1 — Info Dasar */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-1">
                Langkah 1 — Informasi Dasar
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="prod-name" className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                      Nama Parfum
                    </label>
                    <input
                      id="prod-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Contoh: Velour Noir"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="prod-slug" className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                      Slug URL
                    </label>
                    <input
                      id="prod-slug"
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="velour-noir"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="prod-desc" className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                        Deskripsi Parfum
                      </label>
                      <span className="text-[9px] font-bold text-neutral-400">
                        {description.length}/200
                      </span>
                    </div>
                    <textarea
                      id="prod-desc"
                      required
                      rows={3}
                      maxLength={200}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Deskripsi singkat aroma parfum (maks. 200 karakter)..."
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Images Upload block */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                    Upload &amp; URL Gambar
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* File Upload Zone */}
                    <div className="relative border border-dashed border-neutral-300 hover:border-black rounded-xl p-4 text-center transition-colors bg-white flex flex-col justify-center items-center min-h-[120px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-neutral-950" />
                      ) : (
                        <>
                          <UploadCloud className="w-5 h-5 text-neutral-400 mb-1.5" />
                          <span className="text-[10px] font-semibold text-neutral-900">Unggah Berkas</span>
                          <span className="text-[8px] text-neutral-500 mt-0.5">JPG/PNG/WEBP</span>
                        </>
                      )}
                    </div>

                    {/* URL Input */}
                    <div className="border border-neutral-200 rounded-xl p-4 space-y-2 bg-white flex flex-col justify-between min-h-[120px]">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> Input URL
                        </span>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[9px] py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Tambah Link
                      </button>
                    </div>
                  </div>

                  {/* Loaded Images list preview */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-neutral-700 uppercase tracking-wider block">
                      Foto Terpilih ({productImages.length})
                    </span>
                    {productImages.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic bg-white border border-neutral-200 p-4 rounded-xl text-center">
                        Belum ada foto ditambahkan.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {productImages.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-white group">
                            <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover animate-scaleIn" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 — Varian & Harga */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-1">
                <h4 className="text-sm font-bold text-black uppercase tracking-wider">
                  Langkah 2 — Varian Ukuran &amp; Harga
                </h4>
                <button
                  type="button"
                  onClick={handleAddVariantRow}
                  className="bg-black hover:bg-neutral-800 text-white font-semibold py-1.5 px-4 rounded-lg text-xs cursor-pointer"
                >
                  + Tambah Varian
                </button>
              </div>

              <div className="overflow-x-auto bg-white border border-neutral-200 rounded-xl">
                <table className="w-full text-left text-xs divide-y divide-neutral-200">
                  <thead>
                    <tr className="text-neutral-700 font-bold uppercase text-[9px] tracking-wider bg-neutral-50">
                      <th className="py-3 px-4">Ukuran (ml)</th>
                      <th className="py-3 px-4">Harga Lengkap (Rp)</th>
                      <th className="py-3 px-4">Stok Varian</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/55 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            required
                            placeholder="Contoh: 18ml"
                            value={v.size}
                            onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                            className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 w-28 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            required
                            placeholder="Contoh: 25000"
                            value={v.price || ""}
                            onChange={(e) => handleVariantChange(idx, "price", Number(e.target.value))}
                            className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 w-36 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            required
                            placeholder="Stok"
                            value={v.stock || ""}
                            onChange={(e) => handleVariantChange(idx, "stock", Number(e.target.value))}
                            className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 w-24 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            disabled={variants.length <= 1}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex gap-4 justify-end border-t border-neutral-200 pt-6">
              <button
                type="button"
                onClick={handleCloseForm}
                className="py-3 px-6 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-black hover:bg-neutral-800 text-white font-semibold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 text-sm cursor-pointer shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                  </>
                ) : editId ? (
                  "Simpan Perubahan"
                ) : (
                  "Simpan Produk"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products list table */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <h3 className="text-lg font-bold text-black mb-4">Daftar Produk Parfum</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-neutral-200">
            <thead>
              <tr className="text-xs text-black uppercase font-bold">
                <th className="py-3 px-2">Gambar</th>
                <th className="py-3 px-2">Nama Produk</th>
                <th className="py-3 px-2">Varian &amp; Harga</th>
                <th className="py-3 px-2">Stok Total</th>
                <th className="py-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-black">
              {initialProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500 text-xs">
                    Belum ada produk parfum yang terdaftar.
                  </td>
                </tr>
              ) : (
                initialProducts.map((p) => {
                  const firstImg = p.imageUrl || p.images[0]?.url || "https://xtjkuouycmjrhgsslyqj.supabase.co/storage/v1/object/public/uploads/products/aura-bottle.png";
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                          <Image src={firstImg} alt={p.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-black">{p.name}</div>
                        <div className="text-[10px] text-neutral-600">{p.slug}</div>
                      </td>
                      <td className="py-3.5 px-2 text-xs font-semibold text-black">
                        {getSizesPriceText(p)}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={p.stock > 0 ? "text-black font-medium text-xs" : "text-neutral-400 line-through text-xs"}>
                          {p.stock} botol
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          disabled={isPending}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={isPending}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-600 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
