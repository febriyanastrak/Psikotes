# Constraints - PT Altrak 1978 Online Assessment System

Last reviewed: 2026-10-28

## Floor (Always Enforced)
- No questions or test data deleted in `js/data/*-data.js` or `assets/`.
- No broken candidate sessions or silent catch blocks in scoring and submission pipelines.
- Zero suppressions or bypasses for security/integrity checks.
- All 8 assessment modules must output valid, schema-compliant JSON payloads.
- Zero `NULL` or placeholder `-` in candidate results stored in Supabase (`kandidat_psikotes`).

## Enforced Assessment Dimensions
| Modul | Indikator Kunci | Kolom Supabase | Target Kelengkapan |
|---|---|---|---|
| **1. IST** | Subtes 01-09 (176 Soal), RW, SW, Skor IQ, Kategori IQ | `hasil_ist` | 100% (Semua subtes terhitung) |
| **2. PAPI Kostick** | 90 Soal, 20 Dimensi Kepribadian (Sum = 90), Diagram Wheel | `hasil_papi` | 100% (Total skor tepat 90) |
| **3. DISC** | 24 Soal (Most/Least), Matriks Raw 1-3, Grafik 1-3, Pola Karakter | `hasil_disc` | 100% (Auto-healing aktif) |
| **4. EPPS** | 225 Soal, 15 Skala Kebutuhan, Skor Konsistensi (0-15) | `hasil_epps` | 100% (Status valid/konsisten) |
| **5. Pauli** | 20 Garis Interval (3 Menit), Total Pengerjaan, Benar, Salah | `hasil_pauli` | 100% (20 interval lengkap) |
| **6. MSDT** | 64 Soal, Matriks 8x8, Indeks TO/RO/E, 8 Gaya Kepemimpinan | `hasil_msdt` | 100% (Gaya dominan terdefinisi) |
| **7. CFIT** | Subtes 1-4 (50 Soal), Raw Score, Fluid IQ Score, Kategori | `hasil_cfit` | 100% (Skor IQ terhitung) |
| **8. MBTI** | 60 Soal, Dimensi EI/SN/TF/JP, 16 Tipe Kepribadian | `hasil_mbti` | 100% (Tipe 4 huruf valid) |

## Quality Verification Commands
- Fast Check: `node -c js/*.js js/data/*.js`
- Automated E2E Bot: `node scratch/e2e_assessment_bot.js`
- HRD Portal Verification: `http://localhost:3000/hrd.html`
