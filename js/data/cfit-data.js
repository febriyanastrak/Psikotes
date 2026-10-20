// =========================================================================
// BANK SOAL & DATA METRIK: CFIT (CULTURE FAIR INTELLIGENCE TEST) - SKALA 3
// PT Altrak 1978 - Leadership & Management Assessment System
// 4 Subtes Penalaran Abstrak Non-Verbal & Konversi Skor IQ Fluid
// =========================================================================

const CFIT_CONFIG = {
    namaTes: "CFIT (Culture Fair Intelligence Test - Skala 3)",
    deskripsi: "Mengukur kecerdasan murni (Fluid Intelligence) dan kemampuan penalaran abstrak tanpa bias budaya maupun bahasa.",
    subtes: [
        {
            no: 1,
            nama: "Subtes 1: Seriation (Pola Deret Garis & Bentuk)",
            waktuDetik: 180, // 3 Menit
            totalSoal: 13,
            opsiCount: 6,
            petunjuk: "Setiap soal memperlihatkan deret gambar yang memiliki urutan pola tertentu. Pilihlah satu gambar dari pilihan (A, B, C, D, E, F) yang paling tepat untuk mengisi kotak kosong/putus-putus selanjutnya."
        },
        {
            no: 2,
            nama: "Subtes 2: Classification (Klasifikasi Gambar Ganjil)",
            waktuDetik: 240, // 4 Menit
            totalSoal: 14,
            opsiCount: 5,
            isMultiSelect: true,
            maxSelect: 2,
            petunjuk: "Dari 5 buah kotak gambar yang disediakan (A, B, C, D, E), pilihlah 2 (dua) buah kotak yang memiliki kesamaan karakter/pola, yang berbeda dari 3 gambar lainnya."
        },
        {
            no: 3,
            nama: "Subtes 3: Matrices (Matriks Gambar 2x2 & 3x3)",
            waktuDetik: 180, // 3 Menit
            totalSoal: 13,
            opsiCount: 6,
            petunjuk: "Terdapat gambar dengan pola hubungan mendatar dan menurun. Lengkapilah bagian kotak garis putus-putus dengan memilih salah satu jawaban dari (A, B, C, D, E, F) yang paling konsisten."
        },
        {
            no: 4,
            nama: "Subtes 4: Conditions / Topology (Kesesuaian Titik & Garis)",
            waktuDetik: 150, // 2.5 Menit (2 Menit 30 Detik)
            totalSoal: 10,
            opsiCount: 5,
            petunjuk: "Perhatikanlah letak sebuah titik hitam pada gambar patokan di kotak sebelah kiri. Carilah satu gambar dari pilihan (A, B, C, D, E) yang memungkinkan titik diletakkan di dalam kondisi bidang dan ruang yang persis sama."
        }
    ]
};

// =========================================================================
// DATA CONTOH & LATIHAN INTERAKTIF PER SUBTES (DENGAN PENJELASAN)
// =========================================================================
const CFIT_EXAMPLES = {
    subtes_1: [
        {
            no: 1,
            gambarSoal: "assets/cfit/subtes_1/contoh subtes 1-1.png",
            pertanyaan: "Bila posisi gambar kita miringkan mengikuti pola, maka jawaban yang tepat untuk melengkapi kotak garis putus-putus adalah?",
            pilihan: ["A", "B", "C", "D", "E", "F"],
            kunci: "C",
            penjelasan: "Garis ranting berputar searah jarum jam dengan sudut miring 45 derajat bertahap. Kelanjutan logis yang tepat adalah bentuk C."
        },
        {
            no: 2,
            gambarSoal: "assets/cfit/subtes_1/contoh subtes 1-2.png",
            pertanyaan: "Bila gambar kita beri warna hitam mengikuti pola, maka jawaban yang tepat untuk melengkapi kotak garis putus-putus adalah?",
            pilihan: ["A", "B", "C", "D", "E", "F"],
            kunci: "E",
            penjelasan: "Bagian hitam bertambah ke bawah secara teratur. Pola berikutnya adalah bentuk E."
        },
        {
            no: 3,
            gambarSoal: "assets/cfit/subtes_1/contoh subtes 1-3.png",
            pertanyaan: "Bila gambar kita tambahkan bulatan kecil mengikuti pola, maka jawaban yang tepat untuk melengkapi kotak garis putus-putus adalah?",
            pilihan: ["A", "B", "C", "D", "E", "F"],
            kunci: "E",
            penjelasan: "Jumlah bulatan kecil bertambah secara konsisten (1, 2, 3, dan selanjutnya 4). Pola yang benar adalah E."
        }
    ],
    subtes_2: [
        {
            no: 1,
            gambarSoal: "assets/cfit/subtes_2/contoh subtes 2-1.png",
            pertanyaan: "Pilih 2 (dua) kotak yang memiliki kesamaan karakter dari 5 (lima) kotak yang tersedia (A, B, C, D, E):",
            pilihan: ["A", "B", "C", "D", "E"],
            kunci: ["A", "D"],
            penjelasan: "Kotak B, C, E memiliki orientasi miring/sudut, sedangkan A dan D berbentuk bangun datar berdiri tegak sempurna dengan sisi simetris. Maka jawaban yang benar adalah A dan D."
        },
        {
            no: 2,
            gambarSoal: "assets/cfit/subtes_2/contoh subtes 2-2.png",
            pertanyaan: "Pilih 2 (dua) kotak yang memiliki kesamaan karakter dari 5 (lima) kotak yang tersedia (A, B, C, D, E):",
            pilihan: ["A", "B", "C", "D", "E"],
            kunci: ["C", "E"],
            penjelasan: "Kotak A, B, D berisi lingkaran putih polos, sedangkan kotak C dan E memiliki arsiran/warna hitam di dalamnya. Maka pilihan yang tepat adalah C dan E."
        }
    ],
    subtes_3: [
        {
            no: 1,
            gambarSoal: "assets/cfit/subtes_3/contoh subtes 3-1.png",
            pertanyaan: "Berdasarkan pola yang tersedia, maka jawaban yang tepat untuk melengkapi kotak garis putus-putus adalah?",
            pilihan: ["A", "B", "C", "D", "E", "F"],
            kunci: "B",
            penjelasan: "Pola matriks 2x2 menunjukkan garis tebal bergeser secara simetris. Kotak kosong dilengkapi oleh bentuk B."
        },
        {
            no: 2,
            gambarSoal: "assets/cfit/subtes_3/contoh subtes 3-2.png",
            pertanyaan: "Berdasarkan pola yang tersedia, maka jawaban yang tepat untuk melengkapi kotak garis putus-putus adalah?",
            pilihan: ["A", "B", "C", "D", "E", "F"],
            kunci: "C",
            penjelasan: "Gambar burung di baris bawah berhadapan secara simetri cermin dengan baris atas. Bentuk yang tepat adalah C."
        },
        {
            no: 3,
            gambarSoal: "assets/cfit/subtes_3/contoh subtes 3-3.png",
            pertanyaan: "Berdasarkan pola yang tersedia, maka jawaban yang tepat untuk melengkapi kotak garis putus-putus adalah?",
            pilihan: ["A", "B", "C", "D", "E", "F"],
            kunci: "D",
            penjelasan: "Kombinasi jumlah lingkaran dan arsiran bertambah sesuai aturan kolom. Bentuk yang benar adalah D."
        }
    ],
    subtes_4: [
        {
            no: 1,
            gambarSoal: "assets/cfit/subtes_4/contoh subtes 4-1.png",
            pertanyaan: "Pilih satu gambar (A, B, C, D, E) yang memungkinkan sebuah titik diletakkan di dalam kondisi ruang yang sama dengan gambar soal:",
            pilihan: ["A", "B", "C", "D", "E"],
            kunci: "C",
            penjelasan: "Pada gambar patokan, titik terletak di dalam persegi dan juga di dalam lingkaran. Pilihan C adalah satu-satunya yang memungkinkan titik berada di dalam persegi sekaligus lingkaran."
        },
        {
            no: 2,
            gambarSoal: "assets/cfit/subtes_4/contoh subtes 4-1-2.png",
            pertanyaan: "Pilih satu gambar (A, B, C, D, E) yang memiliki kesesuaian posisi peletakan titik:",
            pilihan: ["A", "B", "C", "D", "E"],
            kunci: "E",
            penjelasan: "Titik harus berada di dalam segitiga tetapi di luar persegi panjang. Gambar E memenuhi kondisi tersebut."
        },
        {
            no: 3,
            gambarSoal: "assets/cfit/subtes_4/contoh subtes 4-3.png",
            pertanyaan: "Pilih satu gambar (A, B, C, D, E) yang memungkinkan titik berada di dalam kondisi ruang yang persis sama:",
            pilihan: ["A", "B", "C", "D", "E"],
            kunci: "B",
            penjelasan: "Titik berada di bawah garis lengkung dan di dalam sudut segitiga. Pilihan B memberikan ruang yang sesuai."
        }
    ]
};

// =========================================================================
// BANK SOAL CFIT RESMI (50 SOAL) - ZERO KUNCI JAWABAN (AMAN)
// Kunci Jawaban Resmi disimpan aman di Database Server Supabase
// =========================================================================
const CFIT_QUESTIONS = {
    // SUBTES 1: 13 Soal (Opsi A - F)
    subtes_1: [
        { no: 1, gambarSoal: "assets/cfit/subtes_1/subtes 1 -1 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 2, gambarSoal: "assets/cfit/subtes_1/subtes 1-2.png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 3, gambarSoal: "assets/cfit/subtes_1/subtes 1 -3 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 4, gambarSoal: "assets/cfit/subtes_1/subtes 1 -4 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 5, gambarSoal: "assets/cfit/subtes_1/subtes 1 -5 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 6, gambarSoal: "assets/cfit/subtes_1/subtes 1 -6 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 7, gambarSoal: "assets/cfit/subtes_1/subtes 1 -7 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 8, gambarSoal: "assets/cfit/subtes_1/subtes 1 -8 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 9, gambarSoal: "assets/cfit/subtes_1/subtes 1 -9 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 10, gambarSoal: "assets/cfit/subtes_1/subtes 1 -10 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 11, gambarSoal: "assets/cfit/subtes_1/subtes 1 -11 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 12, gambarSoal: "assets/cfit/subtes_1/subtes 1 -12 .png", pilihan: ["A", "B", "C", "D", "E", "F"] },
        { no: 13, gambarSoal: "assets/cfit/subtes_1/subtes 1 -13 .png", pilihan: ["A", "B", "C", "D", "E", "F"] }
    ],

    // SUBTES 2: 14 Soal (Opsi A - E, Pilih 2)
    subtes_2: Array.from({ length: 14 }, (_, i) => ({
        no: i + 1,
        gambarSoal: `assets/cfit/subtes_2/subtes 2-${i + 1}.png`,
        pilihan: ["A", "B", "C", "D", "E"],
        isMultiSelect: true,
        maxSelect: 2
    })),

    // SUBTES 3: 13 Soal (Opsi A - F)
    subtes_3: Array.from({ length: 13 }, (_, i) => ({
        no: i + 1,
        gambarSoal: `assets/cfit/subtes_3/subtes 3-${i + 1}.png`,
        pilihan: ["A", "B", "C", "D", "E", "F"]
    })),

    // SUBTES 4: 10 Soal (Opsi A - E)
    subtes_4: Array.from({ length: 10 }, (_, i) => ({
        no: i + 1,
        gambarSoal: `assets/cfit/subtes_4/subtes 4-${i + 1}.png`,
        pilihan: ["A", "B", "C", "D", "E"]
    }))
};

/**
 * Menghitung selisih usia (DATEDIF: y, ym, md)
 * Format output: "X tahun Y bulan Z hari"
 */
function hitungUsiaLengkap(tglLahirStr, tglTesStr) {
    if (!tglLahirStr || !tglTesStr) return "-";
    try {
        const dLahir = new Date(tglLahirStr);
        const dTes = new Date(tglTesStr);
        if (isNaN(dLahir.getTime()) || isNaN(dTes.getTime())) return "-";

        let th = dTes.getFullYear() - dLahir.getFullYear();
        let bln = dTes.getMonth() - dLahir.getMonth();
        let hr = dTes.getDate() - dLahir.getDate();

        if (hr < 0) {
            bln--;
            const prevMonthDays = new Date(dTes.getFullYear(), dTes.getMonth(), 0).getDate();
            hr += prevMonthDays;
        }
        if (bln < 0) {
            th--;
            bln += 12;
        }
        return `${th} tahun ${bln} bulan ${hr} hari`;
    } catch (e) {
        return "-";
    }
}

if (typeof window !== 'undefined') {
    window.CFIT_CONFIG = CFIT_CONFIG;
    window.CFIT_EXAMPLES = CFIT_EXAMPLES;
    window.CFIT_QUESTIONS = CFIT_QUESTIONS;
    window.hitungUsiaLengkap = hitungUsiaLengkap;
}
