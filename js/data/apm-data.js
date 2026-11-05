// =========================================================================
// BANK SOAL & DATA METRIK: INTELEGENT 3
// PT Altrak 1978 - Leadership & Management Assessment System
// 2 Subtes Penalaran Logika Abstrak & Matriks Non-Verbal
// =========================================================================

const APM_CONFIG = {
    namaTes: "Intelegent 3",
    deskripsi: "Mengukur kapasitas penalaran logika analitik dan pemecahan masalah pola matriks non-verbal tingkat lanjut.",
    subtes: [
        {
            no: 1,
            nama: "Subtes 1 (Intelegent 3)",
            waktuDetik: 420, // 7 Menit (420.000 ms)
            totalSoal: 12,
            opsiCount: 8,
            pilihan: ["1", "2", "3", "4", "5", "6", "7", "8"],
            petunjuk: "Perhatikan pola gambar pada lembar soal. Terdapat satu bagian yang masih kosong. Pilihlah satu jawaban dari pilihan (1 sampai 8) yang paling tepat dan logis untuk melengkapi pola gambar tersebut."
        },
        {
            no: 2,
            nama: "Subtes 2 (Intelegent 3)",
            waktuDetik: 2700, // 45 Menit (2.700.000 ms)
            totalSoal: 36,
            opsiCount: 8,
            pilihan: ["1", "2", "3", "4", "5", "6", "7", "8"],
            petunjuk: "Perhatikan pola hubungan gambar pada lembar soal. Tentukan gambar yang paling tepat untuk mengisi bagian yang kosong dengan memilih satu dari 8 pilihan jawaban (1 sampai 8) yang tersedia."
        }
    ]
};

// =========================================================================
// BANK SOAL RESMI INTELEGENT 3 (48 SOAL) - ZERO KUNCI JAWABAN (AMAN)
// Kunci Jawaban Resmi disimpan aman di Database Server Supabase
// =========================================================================
const APM_QUESTIONS = {
    // SUBTES 1: 12 Soal (Opsi 1 - 8)
    subtes_1: Array.from({ length: 12 }, (_, i) => ({
        no: i + 1,
        gambarSoal: `assets/apm/subtes_1/subtes 1-${i + 1}.jpeg`,
        pilihan: ["1", "2", "3", "4", "5", "6", "7", "8"]
    })),

    // SUBTES 2: 36 Soal (Opsi 1 - 8)
    subtes_2: Array.from({ length: 36 }, (_, i) => ({
        no: i + 1,
        gambarSoal: `assets/apm/subtes_2/subtes 2-${i + 1}.jpeg`,
        pilihan: ["1", "2", "3", "4", "5", "6", "7", "8"]
    }))
};

// =========================================================================
// TABEL KONVERSI SKOR INTELEGENT 3 KE GRADE PERSENTIL & KATEGORI KAPASITAS INTELEKTUAL
// Berdasarkan Standar Norma Uji Raven Advanced Progressive Matrices (Set II)
// =========================================================================
const APM_NORMS = {
    konversiGrade(skorSet2) {
        const s = Number(skorSet2) || 0;
        if (s >= 33) return { grade: "I", persentil: "95%+", kategori: "Sangat Superior (Intelektual Unggul)" };
        if (s >= 29) return { grade: "II+", persentil: "90%", kategori: "Superior Tinggi" };
        if (s >= 25) return { grade: "II", persentil: "75%", kategori: "Superior / Di Atas Rata-rata" };
        if (s >= 20) return { grade: "III+", persentil: "50%+", kategori: "Rata-rata Tinggi (Rata-rata Atas)" };
        if (s >= 15) return { grade: "III", persentil: "50%", kategori: "Rata-rata (Rata-rata Intelektual)" };
        if (s >= 10) return { grade: "IV", persentil: "25%", kategori: "Di Bawah Rata-rata" };
        return { grade: "V", persentil: "< 10%", kategori: "Rendah / Butuh Bimbingan" };
    }
};

// Ekspos ke global window untuk modularitas
if (typeof window !== 'undefined') {
    window.APM_CONFIG = APM_CONFIG;
    window.APM_QUESTIONS = APM_QUESTIONS;
    window.APM_NORMS = APM_NORMS;
}

