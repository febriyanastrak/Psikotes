# Panduan Keamanan & Arsitektur Sistem (Security Architecture Guide)
### Portal Psikotes PT Altrak 1978

Dokumen ini merangkum seluruh arsitektur keamanan, mitigasi celah, dan pedoman operasional sistem asesmen online PT Altrak 1978 setelah melalui 7 fase *Security Hardening*.

---

## I. Arsitektur Keamanan Sistem (Defense in Depth)

Sistem menerapkan model pertahanan berlapis (*Defense in Depth*) yang menjamin integritas data, kerahasiaan soal & kunci jawaban, serta kepatuhan privasi data kandidat:

```
+-------------------------------------------------------------------------+
|                           KANDIDAT (BROWSER)                           |
|  - Zero Kunci Jawaban di File Klien (Hanya Soal & Pilihan)              |
|  - Sesi Peserta Diotentikasi via session_secret Unik                    |
|  - Pengawasan Webcam Otomatis (Proctoring Snapshot)                    |
+-------------------------------------------------------------------------+
                                    |
                                    v [HTTPS / TLS 1.3]
+-------------------------------------------------------------------------+
|                     SERVER & SECURITY HEADERS (EDGE)                    |
|  - Node.js Local Server (server.js) dengan Guard path.sep               |
|  - Content Security Policy (CSP), X-Frame-Options, HSTS, nosniff       |
|  - Konfigurasi Cloud Hosting: _headers & vercel.json                    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                        SUPABASE DATABASE & STORAGE                      |
|  - Row Level Security (RLS) Aktif pada Seluruh Tabel Publik             |
|  - Bucket foto_kandidat PRIVAT (Akses via Short-Lived Signed URLs)      |
|  - RPC Otorisasi Aman: daftar_kandidat, update_hasil_tes_aman           |
|  - Kunci Jawaban & Skoring Server-Side: ist_kunci, hitung_dan_simpan_*  |
|  - Role Administrator Berbasis Tabel admin_users & is_admin()           |
+-------------------------------------------------------------------------+
```

---

## II. Rincian Implementasi 7 Fase Hardening

| Fase | Komponen | Mitigasi yang Diterapkan | Status |
| :--- | :--- | :--- | :---: |
| **Fase 1** | **Supabase Database & RLS** | RLS diaktifkan pada `kandidat_psikotes`, `token_ujian`, `admin_users`, dan `cfit_master_kunci`. Izin eksekusi fungsi kunci (`ist_kunci`, `papi_kunci`, dll.) dan fungsi hapus dicabut dari `anon`/`PUBLIC`. | **SELESAI** |
| **Fase 2** | **Foto Webcam & Privasi** | Bucket `foto_kandidat` diset privat (`public = false`). Anon hanya boleh `INSERT`. File foto dinamai UUID tanpa PII. Tampilan foto di HRD menggunakan Signed URLs (expired 300 detik). | **SELESAI** |
| **Fase 3** | **Identitas & Update Skor** | Pendaftaran peserta menggunakan RPC atomic `daftar_kandidat` dengan UUID baru & `session_secret`. Perbaikan sanitasi nama pelamar. Penyimpanan skor wajib validasi `session_secret` via `update_hasil_tes_aman`. | **SELESAI** |
| **Fase 4** | **Portal Login HRD** | Kredensial hardcoded `atob` dibersihkan. Form login HRD menggunakan email & kata sandi dinamis dengan verifikasi berlapis `is_admin()`. | **SELESAI** |
| **Fase 5** | **Kunci Jawaban Tahap 2** | Evaluasi CFIT tersambung langsung ke fungsi server `hitung_dan_simpan_cfit`. Fallback evaluasi skor di dashboard HRD mencegah tampilan kosong (`"-"`). | **SELESAI** |
| **Fase 6** | **Server & Security Headers** | Pencegahan *path traversal* pada `server.js` menggunakan `ROOT_DIR + path.sep`. Pemblokiran file sensitif. Penyediaan header CSP, HSTS, `_headers`, dan `vercel.json`. | **SELESAI** |
| **Fase 7** | **Kebersihan & Operasional** | Pembuatan berkas `.gitignore` lengkap dan panduan pemeliharaan resmi `README_SECURITY.md`. | **SELESAI** |

---

## III. Panduan Operasional Administrator HRD

### 1. Menambah Administrator HRD Baru
Untuk memberikan hak akses Administrator kepada staf HRD baru:
1. Daftarkan email staf di **Supabase Dashboard > Authentication > Users > Add User**.
2. Jalankan query berikut di **Supabase SQL Editor**:
```sql
INSERT INTO public.admin_users (user_id, email, role)
SELECT id, email, 'hrd_admin'
FROM auth.users 
WHERE lower(email) = 'email_staf_hrd@altrak1978.co.id'
ON CONFLICT (user_id) DO NOTHING;
```

### 2. Mencabut Hak Akses Administrator
Jika seorang staf tidak lagi berwenang mengakses portal HRD:
```sql
DELETE FROM public.admin_users 
WHERE lower(email) = 'email_staf_hrd@altrak1978.co.id';
```

### 3. Menjalankan Audit Keamanan Berkala
Gunakan skrip verifikasi yang telah disediakan di [`supabase/verify.sql`](file:///d:/kerjaan/supabase/verify.sql) untuk memastikan:
- RLS tetap aktif di seluruh tabel.
- Policy Storage tetap privat.
- Tidak ada fungsi administratif yang bocor ke peran `anon`.

---

## IV. Menjalankan Server Aplikasi Secara Lokal

Untuk menjalankan portal di komputer lokal:
```bash
# Menggunakan Node.js bawaan
node server.js

# Atau membuka browser otomatis
node server.js --open
```

Portal Peserta: `http://localhost:3000/index.html`  
Portal HRD: `http://localhost:3000/hrd.html`
