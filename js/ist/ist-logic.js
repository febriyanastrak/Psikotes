// =========================================================================
// LOGIKA SISTEM, TIMER TERSEMBUNYI, DAN STATE MANAGEMENT (IST LOGIC)
// PT ALTRAK 1978 - MODUL TES IST
// =========================================================================

const istLogic = {
    // State aplikasi
    fase: 'DASHBOARD', // 'DASHBOARD' | 'CONTOH' | 'UJIAN'
    currentSubtestId: 'soal_01',
    jawabanContoh: {},
    jawabanPeserta: {},
    completedSubtests: [],

    // Timer Handles (Berjalan di background via setTimeout)
    timerContohTimeout: null,
    timerUjianTimeout: null,

    // Kunci Penyimpanan LocalStorage
    STORAGE_KEY_COMPLETED: 'altrak_ist_completed_subtests',
    STORAGE_KEY_PREFIX_ANSWERS: 'altrak_ist_jawaban_',

    /**
     * Inisialisasi awal saat halaman dimuat
     */
    init() {
        this.muatStatusPenyimpanan();
        this.tampilkanDashboard();
    },

    /**
     * Memuat daftar subtes yang telah selesai dari localStorage
     */
    muatStatusPenyimpanan() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY_COMPLETED);
            if (saved) {
                this.completedSubtests = JSON.parse(saved);
            } else {
                this.completedSubtests = [];
            }
        } catch (e) {
            console.warn('Gagal memuat status subtes:', e);
            this.completedSubtests = [];
        }
    },

    /**
     * Menyimpan daftar subtes selesai ke localStorage
     */
    simpanStatusKeLocalStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY_COMPLETED, JSON.stringify(this.completedSubtests));
        } catch (e) {
            console.error('Gagal menyimpan status subtes:', e);
        }
    },

    /**
     * Menampilkan Dashboard Utama Soal IST
     */
    tampilkanDashboard() {
        this.bersihkanSemuaTimer();
        this.fase = 'DASHBOARD';
        istUI.renderDashboard(this.completedSubtests);
    },

    /**
     * Mengambil objek data soal sesuai subtes aktif saat ini (istSoal01 s/d istSoal06)
     */
    getCurrentSubtestData() {
        if (typeof IST_SUBTEST_MAP !== 'undefined') {
            if (IST_SUBTEST_MAP[this.currentSubtestId]) return IST_SUBTEST_MAP[this.currentSubtestId];
            const cleanNo = String(this.currentSubtestId || '').replace('soal_', '');
            if (IST_SUBTEST_MAP[cleanNo]) return IST_SUBTEST_MAP[cleanNo];
        }
        return istSoal01;
    },

    /**
     * Memulai subtes tertentu ('01' s/d '06', dst)
     * @param {string} subtestNo Nomor subtes ('01', '02', dst)
     */
    mulaiSoal(subtestNo) {
        const allowed = ["01", "02", "03", "04", "05", "06"];
        if (allowed.includes(subtestNo)) {
            this.currentSubtestId = `soal_${subtestNo}`;
            this.jawabanContoh = {};
            this.jawabanPeserta = {};
            this.mulaiFaseContoh();
        } else {
            istUI.showCustomModal({
                title: `Informasi Bagian ${subtestNo}`,
                message: `Bagian Soal ${subtestNo} akan terbuka secara berurutan setelah modul sebelumnya selesai diverifikasi.`,
                okText: "Mengerti"
            });
        }
    },

    /**
     * Membersihkan semua timer aktif yang berjalan di background
     */
    bersihkanSemuaTimer() {
        if (this.timerContohTimeout) {
            clearTimeout(this.timerContohTimeout);
            this.timerContohTimeout = null;
        }
        if (this.timerUjianTimeout) {
            clearTimeout(this.timerUjianTimeout);
            this.timerUjianTimeout = null;
        }
    },

    // =====================================================================
    // 1. ALUR FASE CONTOH (30 DETIK)
    // =====================================================================

    /**
     * Memulai Fase Contoh dengan hidden timer 30.000 ms (30 Detik)
     */
    mulaiFaseContoh() {
        this.bersihkanSemuaTimer();
        this.fase = 'CONTOH';

        const subtestData = this.getCurrentSubtestData();

        // Render tampilan contoh
        istUI.renderFaseContoh(subtestData, this.jawabanContoh);

        // Timer berjalan di background menggunakan setTimeout (Hidden Timer: Tidak ada hitung mundur di layar)
        const durasiContoh = subtestData.waktuContoh || 30000;
        this.timerContohTimeout = setTimeout(() => {
            this.onWaktuContohHabis();
        }, durasiContoh);
    },

    /**
     * Menyimpan pilihan radio button pada fase contoh
     * @param {string} contohNo Nomor contoh ('01', '02')
     * @param {string} optKey Pilihan huruf ('A', 'B', ...)
     */
    simpanJawabanContoh(contohNo, optKey) {
        this.jawabanContoh[contohNo] = optKey;
    },

    /**
     * Dipanggil otomatis saat waktu 30 detik pada fase contoh habis
     */
    onWaktuContohHabis() {
        this.bersihkanSemuaTimer();
        const subtestData = this.getCurrentSubtestData();

        // Munculkan Custom Modal HTML/CSS (JANGAN gunakan window.alert() bawaan browser)
        istUI.showCustomModal({
            title: "Waktu Mempelajari Contoh Selesai",
            message: `Waktu 30 detik untuk mempelajari petunjuk dan contoh ${subtestData.nama} telah selesai. Klik tombol di bawah untuk melanjutkan ke Ujian Utama ${subtestData.nama}.`,
            okText: `Lanjut ke ${subtestData.nama}`,
            onOk: () => {
                this.mulaiUjianUtama();
            }
        });
    },

    /**
     * Dipanggil jika peserta secara mandiri mengklik tombol "Lanjut ke Soal ..." sebelum 30 detik habis
     */
    konfirmasiLanjutKeUjian() {
        this.bersihkanSemuaTimer();
        this.mulaiUjianUtama();
    },

    // =====================================================================
    // 2. ALUR UJIAN UTAMA (6 ATAU 7 MENIT BACKGROUND TIMER)
    // =====================================================================

    // Current active question index (0 to 19)
    currentSoalIndex: 0,

    /**
     * Memulai Ujian Utama dengan hidden timer (360.000 ms untuk Soal 01 & 02; 420.000 ms untuk Soal 03)
     * Format 1 soal per layar (paginasi satu per satu) dengan palet navigasi 1-20
     */
    mulaiUjianUtama() {
        this.bersihkanSemuaTimer();
        this.fase = 'UJIAN';
        this.currentSoalIndex = 0;

        const subtestData = this.getCurrentSubtestData();

        // Render antarmuka ujian
        istUI.renderFaseUjian(subtestData, this.currentSoalIndex, this.jawabanPeserta);

        // Timer berjalan di background (Hidden Timer)
        const durasiUjian = subtestData.waktuUjian || 360000;
        this.timerUjianTimeout = setTimeout(() => {
            this.onWaktuUjianHabis();
        }, durasiUjian);
    },

    /**
     * Berpindah ke nomor soal tertentu via palet atau tombol
     */
    keSoal(index) {
        const subtestData = this.getCurrentSubtestData();
        if (index >= 0 && index < subtestData.soal.length) {
            this.currentSoalIndex = index;
            istUI.renderSoalAktif(subtestData, this.currentSoalIndex, this.jawabanPeserta);
        }
    },

    /**
     * Berpindah ke soal berikutnya
     */
    soalBerikutnya() {
        const subtestData = this.getCurrentSubtestData();
        if (this.currentSoalIndex < subtestData.soal.length - 1) {
            this.keSoal(this.currentSoalIndex + 1);
        } else {
            this.selesaiUjianManual();
        }
    },

    /**
     * Berpindah ke soal sebelumnya
     */
    soalSebelumnya() {
        if (this.currentSoalIndex > 0) {
            this.keSoal(this.currentSoalIndex - 1);
        }
    },

    /**
     * Mencatat pilihan jawaban peserta pada ujian utama
     * @param {number} nomorSoal Nomor soal (1 s/d 20)
     * @param {string} optKey Pilihan huruf ('A', 'B', 'C', 'D', 'E')
     */
    pilihJawaban(nomorSoal, optKey) {
        this.jawabanPeserta[nomorSoal] = optKey;
        const subtestData = this.getCurrentSubtestData();

        // Hitung total terisi
        const totalSoal = subtestData.soal.length;
        const totalTerisi = Object.values(this.jawabanPeserta).filter(v => v !== undefined && v !== null && String(v).trim() !== '').length;

        // Update visual badge dan palet
        istUI.updateCardSelection(nomorSoal, optKey, totalTerisi, totalSoal);
        istUI.updatePaletteVisual(subtestData, this.currentSoalIndex, this.jawabanPeserta);
    },

    /**
     * Mencatat ketikan jawaban isian peserta pada soal isian (Soal 04, 05, 06)
     * @param {number} nomorSoal Nomor soal
     * @param {string} teks Jawaban isian peserta
     */
    ketikJawaban(nomorSoal, teks) {
        const trimmed = String(teks || '').trim();
        if (trimmed === '') {
            delete this.jawabanPeserta[nomorSoal];
        } else {
            this.jawabanPeserta[nomorSoal] = trimmed;
        }

        const clearBtn = document.getElementById('btn-clear-isian');
        if (clearBtn) {
            if (trimmed !== '') {
                clearBtn.classList.remove('hidden');
                clearBtn.classList.add('flex');
            } else {
                clearBtn.classList.remove('flex');
                clearBtn.classList.add('hidden');
            }
        }

        const subtestData = this.getCurrentSubtestData();
        const totalSoal = subtestData.soal.length;
        const totalTerisi = Object.values(this.jawabanPeserta).filter(v => v !== undefined && v !== null && String(v).trim() !== '').length;

        istUI.updateCardSelection(nomorSoal, trimmed, totalTerisi, totalSoal);
        istUI.updatePaletteVisual(subtestData, this.currentSoalIndex, this.jawabanPeserta);
    },

    /**
     * Dipanggil otomatis saat waktu ujian utama habis di background
     */
    onWaktuUjianHabis() {
        this.bersihkanSemuaTimer();
        const subtestData = this.getCurrentSubtestData();

        // Kumpulkan dan simpan jawaban peserta secara lokal
        this.simpanJawabanLokal();

        // Munculkan custom modal pemberitahuan dan redirect kembali ke dashboard tanpa ringkasan nilai
        istUI.showCustomModal({
            title: `Waktu Ujian ${subtestData.nama} Selesai`,
            message: `Waktu pengerjaan untuk ${subtestData.nama} telah habis. Seluruh jawaban Anda telah tersimpan otomatis di sistem.`,
            okText: "Kembali ke Dashboard IST",
            onOk: () => {
                this.tampilkanDashboard();
            }
        });
    },

    /**
     * Dipanggil jika peserta mengklik tombol "Selesai" secara manual
     */
    selesaiUjianManual() {
        const subtestData = this.getCurrentSubtestData();
        const totalSoal = subtestData.soal.length;
        const totalTerisi = Object.values(this.jawabanPeserta).filter(v => v !== undefined && v !== null && String(v).trim() !== '').length;

        istUI.showCustomModal({
            title: `Konfirmasi Penyelesaian ${subtestData.nama}`,
            message: `Anda telah menjawab ${totalTerisi} dari ${totalSoal} butir pertanyaan. Apakah Anda yakin ingin menyelesaikan ${subtestData.nama} sekarang?`,
            cancelText: "Periksa Kembali",
            okText: "Ya, Selesaikan & Simpan",
            onOk: () => {
                this.bersihkanSemuaTimer();
                this.simpanJawabanLokal();
                this.tampilkanDashboard();
            }
        });
    },

    /**
     * Mengumpulkan jawaban peserta secara lokal (simpan di variabel/localStorage sementara)
     * dan menandai subtes selesai tanpa menampilkan ringkasan nilai kepada peserta
     */
    simpanJawabanLokal() {
        try {
            const subtestData = this.getCurrentSubtestData();

            // Simpan jawaban spesifik subtes
            const storageKey = `${this.STORAGE_KEY_PREFIX_ANSWERS}${this.currentSubtestId}`;
            const payload = {
                subtestId: this.currentSubtestId,
                subtestNama: subtestData.nama,
                waktuSelesai: new Date().toISOString(),
                jawaban: this.jawabanPeserta
            };
            localStorage.setItem(storageKey, JSON.stringify(payload));

            // Tandai subtes ini telah selesai dikerjakan
            if (!this.completedSubtests.includes(this.currentSubtestId)) {
                this.completedSubtests.push(this.currentSubtestId);
            }
            const cleanNo = this.currentSubtestId.replace('soal_', '');
            if (!this.completedSubtests.includes(cleanNo)) {
                this.completedSubtests.push(cleanNo);
            }
            this.simpanStatusKeLocalStorage();

            // Jika berjalan di portal utama SPA, buka kunci kartu modul 2 (PAPI Kostick) jika subtes 01 selesai
            if (typeof unlockDashboardCard === 'function') {
                try {
                    unlockDashboardCard(1);
                } catch (e) {}
            }
        } catch (e) {
            console.error('Gagal menyimpan jawaban ke localStorage:', e);
        }
    },

    /**
     * Kembali ke dashboard utama portal asesmen kandidat
     */
    kembaliKePortal() {
        this.bersihkanSemuaTimer();
        if (typeof showPage === 'function' && document.getElementById('page-dashboard')) {
            showPage('page-dashboard');
        } else {
            window.location.href = 'index.html';
        }
    }
};
