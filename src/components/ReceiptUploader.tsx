"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadReceipt } from "@/lib/actions/order";
import { UploadCloud, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface ReceiptUploaderProps {
  orderId: string;
}

export default function ReceiptUploader({ orderId }: ReceiptUploaderProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setErrorMsg("");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
        setPreviewUrl(URL.createObjectURL(droppedFile));
        setErrorMsg("");
      } else {
        setErrorMsg("Harap unggah file gambar (JPG, PNG, atau WEBP).");
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setErrorMsg("");
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const response = await uploadReceipt(orderId, formData);
      if (response.success) {
        router.refresh(); // Reload the server component page to show verified status
      } else {
        setErrorMsg(response.error || "Gagal mengunggah bukti transfer.");
      }
    });
  };

  return (
    <form onSubmit={handleUploadSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-4 bg-neutral-50 border border-neutral-300 text-black text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all duration-300 min-h-60 ${
          dragActive
            ? "border-brand bg-brand/5 scale-[0.99]"
            : "border-apple-border/50 bg-white hover:border-brand"
        }`}
      >
        <input
          type="file"
          id="receipt-file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isPending}
        />

        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative w-36 h-36 mx-auto rounded-lg overflow-hidden border border-apple-border/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview Bukti" className="object-cover w-full h-full" />
            </div>
            <div className="text-xs text-apple-gray">
              <span className="font-semibold text-apple-text">{file?.name}</span> (
              {file && (file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
              }}
              className="text-xs text-neutral-500 hover:text-black font-semibold hover:underline cursor-pointer"
              disabled={isPending}
            >
              Ganti File
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-apple-bg flex items-center justify-center text-apple-gray mx-auto">
              <UploadCloud className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-apple-text">
                Tarik & lepas screenshot / foto bukti transfer di sini
              </p>
              <p className="text-xs text-apple-gray mt-1">atau klik untuk menelusuri file</p>
            </div>
            <p className="text-[10px] text-apple-gray">Format: JPG, PNG, WEBP (Maks 5MB)</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!file || isPending}
        className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none text-sm shadow-xs"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Mengunggah...
          </>
        ) : (
          <>
            Kirim Bukti Transfer
          </>
        )}
      </button>
    </form>
  );
}
