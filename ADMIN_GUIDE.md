# Panduan Penggunaan Portal Admin AURA

Selamat datang di portal administrasi AURA. Panduan ini menjelaskan cara mengelola katalog produk, memantau pesanan masuk secara real-time, memperbarui status transaksi, dan mengatur keamanan kredensial akun Anda.

---

## 1. Login Admin

Akses portal admin melalui browser Anda:
*   **URL Portal**: `[domain-anda]/admin/login`
*   **Kredensial Default**:
    *   **Username**: `admin`
    *   **Password**: `adminparfume123`

> [!WARNING]
> Demi keamanan, segera ganti username dan password default Anda pada tab **Pengaturan Akun** setelah berhasil masuk pertama kali.

---

## 2. Dashboard Ringkasan

Setelah masuk, Anda akan diarahkan ke Dashboard:
*   **Transaksi Hari Ini**: Menampilkan jumlah pesanan masuk pada hari ini.
*   **Total Pendapatan**: Akumulasi nominal rupiah dari pesanan yang berstatus **VERIFIED** dan **COMPLETED**.
*   **Perlu Verifikasi**: Jumlah pesanan QRIS yang telah mengunggah bukti bayar namun belum dikonfirmasi admin.
*   **Grafik Pendapatan**: Memvisualisasikan perkembangan omzet penjualan harian dalam 7 hari terakhir.
*   **Daftar Pesanan Terbaru**: Menampilkan 5 transaksi terakhir yang masuk ke sistem.

---

## 3. Kelola Produk (Katalog Parfum)

Kelola inventaris parfum AURA melalui menu **Kelola Produk** (`/admin/products`):

### Cara Menambah Produk Baru
1.  Klik tombol **"Tambah Produk Baru"** di sudut kanan atas.
2.  **Informasi Dasar**:
    *   **Nama Parfum**: Masukkan nama parfum (misal: *Velour Noir*).
    *   **Slug URL**: Terisi otomatis sesuai nama parfum untuk rute URL halaman detail.
    *   **Deskripsi**: Tulis deskripsi singkat aroma parfum (maks. 200 karakter).
3.  **URL Gambar & Upload**:
    *   Pilih berkas gambar JPG/PNG/WEBP lokal untuk diunggah langsung ke storage Supabase.
    *   *Alternatif*: Masukkan URL langsung ke kolom input link jika gambar sudah di-host di server lain.
4.  **Varian Ukuran & Harga**:
    *   Tentukan ukuran botol (misal: *18ml* atau *35ml*).
    *   Tentukan harga jual lengkap (misal: *25000*).
    *   Tentukan stok botol yang tersedia untuk ukuran tersebut.
    *   *Tips*: Anda dapat menambahkan lebih dari satu varian dengan menekan tombol **"Tambah Varian"**.
5.  Klik tombol **"Simpan Produk"** untuk merilis ke katalog publik.

---

## 4. Kelola Pesanan (Alur Transaksi)

Pantau transaksi masuk di menu **Kelola Pesanan** (`/admin/orders`). Halaman ini terhubung secara real-time ke database melalui Supabase Broadcast. Anda tidak perlu menyegarkan (refresh) halaman untuk melihat pesanan baru.

### A. Alur Transaksi QRIS (Pembayaran Non-Tunai)
1.  Customer melakukan checkout dengan metode **QRIS** dan mengunggah screenshot bukti transfer.
2.  Di dashboard admin, pesanan ini akan masuk dengan status **PENDING** dan memicu label **"Menunggu Verifikasi"**.
3.  Klik tombol **Lihat Detail** (ikon mata 👁) di baris pesanan tersebut.
4.  Periksa gambar di section **Bukti Pembayaran (QRIS)**.
5.  Setelah memvalidasi bahwa dana telah masuk ke rekening/akun QRIS Anda, klik tombol hitam **"Konfirmasi Order"** di kanan bawah.
    *   *Status berubah menjadi:* **VERIFIED** (Menunggu COD).
6.  Setelah melakukan serah terima produk fisik COD dengan customer di lokasi pertemuan, klik tombol **"Tandai Selesai"**.
    *   *Status berubah menjadi:* **COMPLETED** (Selesai).

### B. Alur Transaksi COD (Pembayaran Tunai saat Bertemu)
1.  Customer melakukan checkout dengan metode **COD (Bayar Saat Bertemu)**.
2.  Status awal pesanan adalah **PENDING** dengan keterangan **"Menunggu Konfirmasi COD"**.
3.  Buka detail pesanan, lalu klik tombol hijau **"💬 Chat Customer via WhatsApp"**.
4.  Tautan akan membuka aplikasi WhatsApp dengan pesan pre-filled otomatis untuk menanyakan kesiapan pertemuan, tempat, dan waktu COD.
5.  Setelah Anda sepakat dengan lokasi & waktu pertemuan di WhatsApp, klik tombol **"Konfirmasi Order"** di portal admin.
    *   *Status berubah menjadi:* **VERIFIED**.
6.  Setelah bertransaksi di lapangan (serah terima parfum dan pembayaran uang tunai), klik tombol **"Tandai Selesai"**.
    *   *Status berubah menjadi:* **COMPLETED**.

---

## 5. Pengaturan Akun

Ubah kredensial masuk Anda pada menu **Pengaturan** (`/admin/settings`):
*   **Ganti Username**: Masukkan username baru (minimal 4 karakter) dan verifikasi menggunakan password saat ini.
*   **Ganti Password**: Masukkan password saat ini, lalu masukkan password baru (minimal 8 karakter) sebanyak dua kali untuk konfirmasi.

---

## 6. Tips Operasional & Manajemen Storage

*   **Pembersihan Storage Supabase**: Gambar bukti pembayaran QRIS yang diunggah customer dapat memakan kuota penyimpanan storage Anda seiring waktu. 
*   **Cara Menghapus**: Pada pesanan berstatus **COMPLETED** (Selesai) yang menggunakan QRIS, Anda dapat membuka detail pesanan dan mengeklik tombol link:
    `🗑 Hapus Bukti Bayar dari Storage`
    Tindakan ini akan secara permanen menghapus file bukti transfer tersebut dari storage Supabase dan mengubah nilai URL-nya di database menjadi kosong (`null`), sehingga menghemat ruang penyimpanan hosting Anda tanpa membuang log transaksi pesanan itu sendiri.
