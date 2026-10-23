// =========================================================================
// LOGIKA BISNIS & SKORING 9 SUBTES IST - INTELLIGENZ STRUKTUR TEST
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * State Controller untuk Modul IST (9 Subtes)
 */
const istLogic = {
    id_peserta: "peserta-ist-001",
    fase: "MENU", // "MENU" | "CONTOH" | "UJIAN" | "SELESAI"
    
    // Subtes aktif saat ini (1 sampai 9)
    currentSubtestNo: 1,
    
    // Daftar subtes yang telah selesai dikerjakan (contoh: ['01'])
    completedSubtests: [],
    
    // Jawaban peserta pada fase contoh interaktif: { "01": "C", "02": "B" }
    jawabanContoh: {},
    
    // Jawaban peserta pada ujian utama: key = nomor soal (1..20), value = pilihan ("A"|"B"|"C"|"D"|"E")
    jawabanPeserta: {},
    
    // Indeks pagination soal ujian utama (0 s/d 19)
    currentSoalIndex: 0,
    
    // Timer fase contoh (30 detik)
    timerContohId: null,
    sisaWaktuContohDetik: 30,
    
    // Hidden Timer fase ujian utama (setTimeout + Heartbeat Wall-Clock)
    // SANGAT PENTING: Berjalan diam-diam di background tanpa countdown di UI peserta
    timerUjianTimeoutId: null,
    timerUjianIntervalId: null,
    timerPeringatan7MenitId: null,
    waktuTargetSelesai: null,
    isUjianTerkunci: false,
    waktuMulaiUjian: null,

    // Patokan offset angka awal nomor soal berurutan (Soal 1 s/d 176):
    // - Subtes 01 (20 soal): Soal 1 - 20 (Offset: 0)
    // - Subtes 02 (20 soal): Soal 21 - 40 (Offset: 20)
    // - Subtes 03 (20 soal): Soal 41 - 60 (Offset: 40)
    // - Subtes 04 (16 soal): Soal 61 - 76 (Offset: 60)
    // - Subtes 05 (20 soal): Soal 77 - 96 (Offset: 76)
    // - Subtes 06 (20 soal): Soal 97 - 116 (Offset: 96)
    // - Subtes 07 (20 soal): Soal 117 - 136 (Offset: 116)
    // - Subtes 08 (20 soal): Soal 137 - 156 (Offset: 136)
    // - Subtes 09 (20 soal): Soal 157 - 176 (Offset: 156)
    subtestOffsets: {
        1: 0,
        2: 20,
        3: 40,
        4: 60,
        5: 76,
        6: 96,
        7: 116,
        8: 136,
        9: 156
    },

    subtestCodes: {
        1: "SE",
        2: "WA",
        3: "AN",
        4: "GE",
        5: "RA",
        6: "ZR",
        7: "FA",
        8: "WU",
        9: "ME"
    },

    /**
     * Mengambil nilai offset nomor soal berdasarkan nomor subtes
     * @param {number|string} subtestNo
     * @returns {number} Offset angka awal
     */
    getSubtestOffset(subtestNo) {
        const no = Number(subtestNo) || 1;
        return this.subtestOffsets[no] !== undefined ? this.subtestOffsets[no] : 0;
    },

    /**
     * Mengambil kode subtes IST (misal: "SE", "WA", "ME")
     * @param {number|string} subtestNo
     * @returns {string} Kode subtes
     */
    getSubtestCode(subtestNo = this.currentSubtestNo) {
        const no = Number(subtestNo) || 1;
        const subData = this.getCurrentSubtestData ? this.getCurrentSubtestData() : null;
        if (subData && subData.kodeSubtes && Number(this.currentSubtestNo) === no) {
            return subData.kodeSubtes;
        }
        return this.subtestCodes[no] || "SE";
    },

    /**
     * Inisialisasi awal saat masuk ke modul IST
     */
    init() {
        console.log("[IST Logic] Inisialisasi Modul IST (9 Subtes)...");
        this.detectParticipantId();
        this.loadProgress();
        this.tampilkanMenu9Subtes();
    },

    /**
     * Memuat progres subtes yang sudah diselesaikan dari localStorage
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('altrak_ist_completed_subtests');
            if (saved) {
                this.completedSubtests = JSON.parse(saved);
            } else {
                this.completedSubtests = [];
            }
        } catch (e) {
            this.completedSubtests = [];
        }
    },

    /**
     * Menyimpan progres subtes ke localStorage
     */
    saveProgress() {
        try {
            localStorage.setItem('altrak_ist_completed_subtests', JSON.stringify(this.completedSubtests));
        } catch (e) {
            console.warn("Gagal menyimpan progres subtes:", e);
        }
    },

    /**
     * Mendeteksi ID peserta dari session jika ada
     */
    detectParticipantId() {
        try {
            const savedProfile = localStorage.getItem('altrak_candidate_profile');
            if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                if (parsed.email) {
                    this.id_peserta = parsed.email;
                } else if (parsed.name) {
                    this.id_peserta = parsed.name.toLowerCase().replace(/\s+/g, '_');
                }
            }
        } catch (e) {
            console.warn("[IST Logic] Gagal membaca session profil, memakai fallback:", e);
        }
    },

    /**
     * Mengambil data subtes yang sedang aktif saat ini (Soal 01, Soal 02, Soal 03, dst)
     */
    getCurrentSubtestData() {
        return (typeof IST_SUBTEST_DATA !== 'undefined' && IST_SUBTEST_DATA[this.currentSubtestNo]) 
            ? IST_SUBTEST_DATA[this.currentSubtestNo] 
            : istSubtes01;
    },

    // =====================================================================
    // 1. MENU UTAMA 9 SUBTES IST (HARUS URUT MULAI DARI SOAL 01)
    // =====================================================================

    /**
     * Menampilkan daftar 9 Subtes IST di layar
     */
    tampilkanMenu9Subtes() {
        this.fase = "MENU";
        if (this.timerContohId) {
            clearInterval(this.timerContohId);
            this.timerContohId = null;
        }
        if (this.timerUjianTimeoutId) {
            clearTimeout(this.timerUjianTimeoutId);
            this.timerUjianTimeoutId = null;
        }
        if (typeof stopProctoringCamera === 'function') {
            stopProctoringCamera();
        }
        istUI.renderMenu9Subtes(this.completedSubtests);
    },

    /**
     * Memilih subtes untuk dikerjakan (validasi urutan wajib dari nomor 01)
     * @param {number} subtestNo Nomor subtes (1 sampai 9)
     */
    pilihSubtes(subtestNo) {
        const currentCode = String(subtestNo).padStart(2, '0');
        // Kunci mutlak: Soal yang sudah selesai tidak boleh dibuka kembali
        if (this.completedSubtests.includes(currentCode)) {
            istUI.showModal({
                title: "Soal Sudah Selesai",
                message: `Soal ${currentCode} sudah selesai dikerjakan dan telah terkunci secara otomatis. Anda tidak dapat membuka kembali soal yang telah diselesaikan.`,
                type: "warning",
                iconHtml: '<i class="fa-solid fa-lock text-amber-500"></i>',
                okText: '<span>Mengerti</span>'
            });
            return;
        }

        // Aturan mutlak: Harus urut mulai dari Soal 01
        if (subtestNo === 1) {
            this.currentSubtestNo = 1;
            this.mulaiFasePanduan();
            return;
        }

        // Untuk subtes berikutnya (02..09), cek apakah subtes sebelumnya sudah selesai
        const prevCode = String(subtestNo - 1).padStart(2, '0');
        const isPrevCompleted = this.completedSubtests.includes(prevCode);

        if (!isPrevCompleted) {
            istUI.showModal({
                title: "Urutan Pengerjaan Wajib",
                message: `Rangkaian tes Inteligent 1 PT Altrak 1978 harus dikerjakan secara berurutan.\n\nHarap selesaikan Soal ${prevCode} terlebih dahulu untuk membuka akses Soal ${String(subtestNo).padStart(2, '0')}.`,
                type: "warning",
                iconHtml: '<i class="fa-solid fa-lock text-amber-400"></i>',
                okText: '<span>Mengerti</span>'
            });
            return;
        }

        // Jika subtes aktif dan terdaftar di data (Soal 02 s/d 09)
        if (subtestNo >= 2 && typeof IST_SUBTEST_DATA !== 'undefined' && IST_SUBTEST_DATA[subtestNo]) {
            this.currentSubtestNo = subtestNo;
            this.mulaiFasePanduan();
            return;
        }

        // Untuk subtes berikutnya yang belum aktif
        istUI.showModal({
            title: `Soal ${String(subtestNo).padStart(2, '0')}`,
            message: `Modul Soal ${String(subtestNo).padStart(2, '0')} akan dibuka secara berurutan setelah bagian sebelumnya selesai dikerjakan.`,
            type: "info",
            iconHtml: '<i class="fa-solid fa-lock text-slate-400"></i>',
            okText: '<span>Mengerti</span>'
        });
    },

    // =====================================================================
    // 1B. FASE PANDUAN RESMI SUBTES (MEMBACA INSTRUKSI DULU SEBELUM LATIHAN)
    // =====================================================================

    /**
     * Memulai fase panduan/instruksi resmi subtes sebelum masuk ke contoh soal
     */
    mulaiFasePanduan() {
        this.fase = "PANDUAN";
        this.isUjianTerkunci = false;
        if (this.timerContohId) {
            clearInterval(this.timerContohId);
            this.timerContohId = null;
        }
        if (this.timerUjianTimeoutId) {
            clearTimeout(this.timerUjianTimeoutId);
            this.timerUjianTimeoutId = null;
        }
        istUI.renderFasePanduan();
    },

    // =====================================================================
    // 2. FASE CONTOH SOAL (PESERTA KLIK SENDIRI & JAWABAN DIBERITAHUKAN)
    // =====================================================================

    /**
     * Memulai fase contoh soal (Percobaan 30 Detik)
     */
    mulaiFaseContoh() {
        this.fase = "CONTOH";
        this.isUjianTerkunci = false;
        this.jawabanContoh = {};

        // Pengawasan Kamera & Layar Penuh (Fullscreen): Khusus Soal 09 (Mengingat Kata)
        if (this.currentSubtestNo === 9) {
            if (typeof startProctoringCamera === 'function') {
                startProctoringCamera();
            }
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
        } else {
            if (typeof stopProctoringCamera === 'function') {
                stopProctoringCamera();
            }
        }

        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        this.sisaWaktuContohDetik = Math.round((subtestData.waktuContoh || 30000) / 1000); // 30 detik
        
        // Render tampilan contoh soal
        istUI.renderFaseContoh(this.sisaWaktuContohDetik);

        // Jalankan timer untuk fase contoh / hafalan
        if (this.timerContohId) clearInterval(this.timerContohId);
        this.timerContohId = setInterval(() => {
            this.sisaWaktuContohDetik--;
            istUI.updateWaktuContoh(this.sisaWaktuContohDetik);

            // TRIGGER SUBTES 09: Tepat saat timer menunjukkan sisa waktu 01:30 (tengah-tengah hafalan 3 menit)
            if (this.currentSubtestNo === 9 && this.sisaWaktuContohDetik === 90) {
                console.log("[IST Logic] Jepret foto pengawasan fase tengah hafalan Subtes 09 (01:30)...");
                const emailKandidat = localStorage.getItem('email_peserta') || (typeof state !== 'undefined' && state.user && state.user.email) || 'kandidat';
                if (typeof jepretDanUpload === 'function') {
                    jepretDanUpload(emailKandidat, 'IST', 'Subtes-9', 'Tengah');
                }
            }

            // Setelah waktu berlalu:
            if (this.sisaWaktuContohDetik <= 0) {
                clearInterval(this.timerContohId);
                this.timerContohId = null;

                const isHafalan = this.currentSubtestNo === 9 || (subtestData.contoh && subtestData.contoh.some(c => c.tipe === 'layar_hafalan'));

                // Auto-Next Subtes 09: Sembunyikan area hafalan dan langsung buka lembar ujian
                if (isHafalan) {
                    const cardHafalan = document.getElementById('card-hafalan-soal-09');
                    if (cardHafalan) cardHafalan.style.display = 'none';
                    const faseContohWrapper = document.getElementById('fase-contoh-wrapper');
                    if (faseContohWrapper) faseContohWrapper.style.display = 'none';

                    this.mulaiFaseUjian();
                    return;
                }

                let autoTimeout = null;
                const navigateToExam = () => {
                    if (autoTimeout) clearTimeout(autoTimeout);
                    this.mulaiFaseUjian();
                };
                
                istUI.showModal({
                    title: isHafalan ? "Waktu Menghafal Habis" : "Waktu Percobaan Selesai",
                    message: isHafalan 
                        ? `Waktu menghafal habis. Lanjut ke Ujian ${subtestName}.`
                        : `Waktu percobaan telah habis.\n\nSesi contoh sudah berakhir. Layar akan otomatis memindahkan Anda untuk lanjut ke ${subtestName.toLowerCase()}.`,
                    type: "info",
                    iconHtml: isHafalan ? '<i class="fa-solid fa-brain text-[#ffbe1a]"></i>' : '<i class="fa-solid fa-hourglass-end text-[#ffbe1a]"></i>',
                    okText: `<span>Lanjut ke Ujian ${subtestName}</span> <i class="fa-solid fa-arrow-right"></i>`,
                    onOk: navigateToExam
                });

                // Otomatis memindahkan layar ke soal utama setelah modal muncul (3 detik jika peserta tidak langsung klik)
                autoTimeout = setTimeout(() => {
                    istUI.closeModal();
                    navigateToExam();
                }, 3000);
            }
        }, 1000);
    },

    /**
     * Menyimpan pilihan peserta pada contoh soal saat diklik sendiri
     * @param {string} contohNo Nomor contoh ("01" atau "02")
     * @param {string} pilihanKey Kunci yang dipilih peserta ("A"|"B"|"C"|"D"|"E")
     */
    simpanJawabanContoh(contohNo, pilihanKey) {
        this.jawabanContoh[contohNo] = pilihanKey;
        istUI.updateStatusPilihanContoh(contohNo, pilihanKey);
    },

    /**
     * Berpindah ke ujian utama jika peserta sudah paham dan mengklik tombol lanjut
     */
    lanjutKeUjianUtama() {
        if (this.timerContohId) {
            clearInterval(this.timerContohId);
            this.timerContohId = null;
        }

        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;
        const isHafalan = this.currentSubtestNo === 9 || (subtestData.contoh && subtestData.contoh.some(c => c.tipe === 'layar_hafalan'));

        istUI.showModal({
            title: isHafalan ? "Mulai Ujian Hafalan" : "Sesi Percobaan Selesai",
            message: isHafalan 
                ? `Apakah Anda siap mengakhiri waktu menghafal dan lanjut ke Ujian ${subtestName}?`
                : `Anda telah mempelajari contoh soal.\n\nSesi contoh sudah berakhir. Silakan klik tombol di bawah untuk lanjut ke ${subtestName.toLowerCase()}.`,
            type: "info",
            iconHtml: isHafalan ? '<i class="fa-solid fa-brain text-[#ffbe1a]"></i>' : '<i class="fa-solid fa-circle-check text-emerald-400"></i>',
            okText: `<span>Lanjut ke ${subtestName}</span> <i class="fa-solid fa-arrow-right"></i>`,
            onOk: () => {
                this.mulaiFaseUjian();
            }
        });
    },

    // =====================================================================
    // 3. FASE UJIAN UTAMA (20 SOAL, TATA LETAK 2 BARIS, HIDDEN TIMER)
    // =====================================================================

    /**
     * Memulai fase ujian utama 20 soal
     */
    mulaiFaseUjian() {
        this.fase = "UJIAN";
        this.currentSoalIndex = 0;
        this.isUjianTerkunci = false;
        this.jawabanPeserta = {};
        this.waktuMulaiUjian = Date.now();

        // Pengawasan Kamera: Pertahankan floating camera saat mengerjakan soal Subtes 09
        if (this.currentSubtestNo === 9) {
            if (typeof startProctoringCamera === 'function') {
                startProctoringCamera();
            }
        } else {
            if (typeof stopProctoringCamera === 'function') {
                stopProctoringCamera();
            }
        }

        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        // 1. Bersihkan layar dan render antarmuka ujian
        istUI.bersihkanLayar();
        istUI.renderFaseUjian();

        // 2. HIDDEN TIMER: Waktu ujian dinamis (Soal 02: 360.000 ms, Soal 03: 420.000 ms)
        // SANGAT PENTING: Jangan tampilkan angka hitung mundur atau keterangan waktu di UI peserta!
        if (this.timerUjianTimeoutId) {
            clearTimeout(this.timerUjianTimeoutId);
            this.timerUjianTimeoutId = null;
        }
        if (this.timerUjianIntervalId) {
            clearInterval(this.timerUjianIntervalId);
            this.timerUjianIntervalId = null;
        }
        if (this.timerPeringatan7MenitId) {
            clearTimeout(this.timerPeringatan7MenitId);
            this.timerPeringatan7MenitId = null;
        }

        this.waktuTargetSelesai = Date.now() + subtestData.waktuUjian;

        this.timerUjianTimeoutId = setTimeout(() => {
            this.waktuUjianHabis();
        }, subtestData.waktuUjian);

        // Heartbeat interval anti-cheat: menjamin auto-submit berdasarkan waktu nyata (wall-clock)
        // Mencegah peserta menjeda timer dengan meminimalkan window atau membuka tab lain
        this.timerUjianIntervalId = setInterval(() => {
            if (this.fase === 'UJIAN' && !this.isUjianTerkunci && this.waktuTargetSelesai && Date.now() >= this.waktuTargetSelesai) {
                this.waktuUjianHabis();
            }
        }, 1000);

        // Peringatan Awal di 7 Menit (420.000 ms) di background jika durasi subtes > 7 menit
        if (subtestData.waktuUjian > 420000) {
            this.timerPeringatan7MenitId = setTimeout(() => {
                if (this.fase === 'UJIAN' && !this.isUjianTerkunci) {
                    const sisaMenit = Math.ceil((subtestData.waktuUjian - 420000) / 60000);
                    istUI.showModal({
                        title: "Peringatan Waktu (7 Menit)",
                        message: `Anda telah mengerjakan ${subtestName} selama 7 menit.\n\nSisa waktu pengerjaan Anda kurang lebih ${sisaMenit} menit lagi. Harap perhatikan alokasi waktu dan segera selesaikan nomor-nomor yang belum terjawab.`,
                        type: "warning",
                        iconHtml: '<i class="fa-solid fa-clock-rotate-left text-amber-500"></i>',
                        okText: '<span>Lanjutkan Pengerjaan</span> <i class="fa-solid fa-arrow-right"></i>'
                    });
                }
            }, 420000); // 7 Menit (420.000 ms)
        }

        // 3. PENGAMBILAN FOTO OTOMATIS BACKGROUND (IST 3 FASE: AWAL, TENGAH, AKHIR)
        const emailKandidat = localStorage.getItem('email_peserta') || (typeof state !== 'undefined' && state.user && state.user.email) || 'kandidat';
        const namaSubtesFoto = `Subtes-${this.currentSubtestNo}`;

        // a) Foto Awal: Saat subtes baru dimulai
        if (typeof jepretDanUpload === 'function') {
            jepretDanUpload(emailKandidat, 'IST', namaSubtesFoto, 'Awal');
        }

        // b) Foto Tengah: Saat waktu subtes berjalan setengah jalan (pertengahan timer)
        // Khusus Subtes 9: Foto tengah sudah diambil saat fase menghafal 3 menit, sehingga tidak dijepret ulang saat ujian agar total tetap 3 foto (Tengah Hafalan, Awal Ujian, Akhir Ujian).
        if (this.currentSubtestNo !== 9) {
            if (this.timerFotoTengahTimeoutId) {
                clearTimeout(this.timerFotoTengahTimeoutId);
                this.timerFotoTengahTimeoutId = null;
            }
            this.fotoAkhirTerkirim = false;
            const durasiTengah = Math.floor(subtestData.waktuUjian / 2);
            this.timerFotoTengahTimeoutId = setTimeout(() => {
                if (this.fase === 'UJIAN' && !this.isUjianTerkunci) {
                    if (typeof jepretDanUpload === 'function') {
                        jepretDanUpload(emailKandidat, 'IST', namaSubtesFoto, 'Tengah');
                    }
                }
            }, durasiTengah);
        }
    },

    /**
     * Handler saat waktu ujian habis secara background
     */
    async waktuUjianHabis() {
        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        console.warn(`[IST Logic] Waktu ${subtestName} habis di background!`);
        
        if (this.timerUjianTimeoutId) {
            clearTimeout(this.timerUjianTimeoutId);
            this.timerUjianTimeoutId = null;
        }
        if (this.timerUjianIntervalId) {
            clearInterval(this.timerUjianIntervalId);
            this.timerUjianIntervalId = null;
        }
        if (this.timerFotoTengahTimeoutId) {
            clearTimeout(this.timerFotoTengahTimeoutId);
            this.timerFotoTengahTimeoutId = null;
        }
        if (this.timerPeringatan7MenitId) {
            clearTimeout(this.timerPeringatan7MenitId);
            this.timerPeringatan7MenitId = null;
        }
        this.waktuTargetSelesai = null;
        this.isUjianTerkunci = true;

        if (typeof stopProctoringCamera === 'function') {
            stopProctoringCamera();
        }

        // c) Foto Akhir: Saat waktu subtes habis
        if (!this.fotoAkhirTerkirim) {
            this.fotoAkhirTerkirim = true;
            const emailKandidat = localStorage.getItem('email_peserta') || (typeof state !== 'undefined' && state.user && state.user.email) || 'kandidat';
            const namaSubtesFoto = `Subtes-${this.currentSubtestNo}`;
            if (typeof jepretDanUpload === 'function') {
                jepretDanUpload(emailKandidat, 'IST', namaSubtesFoto, 'Akhir');
            }
        }

        // Simpan data jawaban secara diam-diam di background
        const hasilSkor = await this.hitungSkorIST();

        // Tandai subtes selesai
        if (!this.completedSubtests.includes(subtestCode)) {
            this.completedSubtests.push(subtestCode);
            this.saveProgress();
        }

        // Tampilkan Custom Modal notifikasi waktu habis (identik modal Pauli), lalu langsung redirect ke Dashboard Soal IST
        // ATURAN MUTLAK: JANGAN tampilkan halaman ringkasan penutup!
        istUI.showModal({
            title: "Waktu Pengerjaan Selesai",
            message: `Waktu pengerjaan ${subtestName} telah habis.\n\nSeluruh lembar jawaban Anda telah dikunci dan berhasil tersimpan secara aman ke sistem database.`,
            type: "info",
            iconHtml: '<i class="fa-solid fa-clock text-blue-400"></i>',
            okText: '<span>Lanjut ke Dashboard Soal Inteligent 1</span> <i class="fa-solid fa-arrow-right"></i>',
            onOk: () => {
                this.tampilkanMenu9Subtes();
            }
        });
    },

    /**
     * Menyimpan pilihan jawaban peserta untuk soal aktif
     * @param {number} nomorSoal 
     * @param {string} pilihanKey ("A"|"B"|"C"|"D"|"E")
     */
    simpanJawaban(nomorSoal, pilihanKey) {
        if (this.isUjianTerkunci) return;

        const offset = this.getSubtestOffset(this.currentSubtestNo);
        let noLokal = nomorSoal;
        let noGlobal = nomorSoal;

        if (nomorSoal > offset && nomorSoal <= offset + 20) {
            noGlobal = nomorSoal;
            noLokal = nomorSoal - offset;
        } else if (nomorSoal >= 1 && nomorSoal <= 20) {
            noLokal = nomorSoal;
            noGlobal = offset + nomorSoal;
        }

        this.jawabanPeserta[noLokal] = pilihanKey;
        this.jawabanPeserta[noGlobal] = pilihanKey;
        istUI.updatePalette();
    },

    /**
     * Navigasi ke soal sebelumnya
     */
    soalSebelumnya() {
        if (this.currentSoalIndex > 0) {
            this.currentSoalIndex--;
            istUI.renderSoalAktif();
        }
    },

    /**
     * Navigasi ke soal selanjutnya
     */
    soalSelanjutnya() {
        const subtestData = this.getCurrentSubtestData();
        const totalSoal = subtestData.soal.length;
        if (this.currentSoalIndex < totalSoal - 1) {
            this.currentSoalIndex++;
            istUI.renderSoalAktif();
        } else {
            // Berada di soal nomor 20 (terakhir)
            this.konfirmasiSelesai();
        }
    },

    /**
     * Melompat ke nomor soal tertentu via palette navigasi
     * @param {number} targetIndex (0 s/d 19)
     */
    lompatKeSoal(targetIndex) {
        const subtestData = this.getCurrentSubtestData();
        if (targetIndex >= 0 && targetIndex < subtestData.soal.length) {
            this.currentSoalIndex = targetIndex;
            istUI.renderSoalAktif();
        }
    },

    /**
     * Konfirmasi peserta jika ingin mengakhiri tes sebelum waktu habis
     * Menggunakan Custom Modal (desain & gaya identik dengan modal Pauli)
     */
    konfirmasiSelesai() {
        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        const totalDijawab = Object.values(this.jawabanPeserta).filter(v => v !== undefined && v !== null && String(v).trim() !== '').length;
        const totalSoal = subtestData.soal.length;
        const belumDijawab = totalSoal - totalDijawab;

        let pesan = `Anda telah menjawab ${totalDijawab} dari ${totalSoal} soal.`;
        if (belumDijawab > 0) {
            pesan += `\n\nMasih terdapat ${belumDijawab} soal yang belum dijawab.`;
        }
        pesan += `\n\nApakah Anda yakin ingin menyelesaikan dan mengumpulkan hasil ${subtestName} sekarang?`;

        istUI.showModal({
            title: "Konfirmasi Pengumpulan",
            message: pesan,
            type: "warning",
            iconHtml: '<i class="fa-solid fa-triangle-exclamation text-amber-400"></i>',
            isConfirm: true,
            okText: '<span>Ya, Selesaikan</span> <i class="fa-solid fa-check"></i>',
            cancelText: '<i class="fa-solid fa-xmark"></i> <span>Batal</span>',
            onOk: () => {
                this.selesaikanSubtesAktif();
            }
        });
    },

    /**
     * Menyelesaikan subtes aktif:
     * - Menyimpan seluruh jawaban dan kalkulasi skor secara diam-diam di background (Supabase prep)
     * - Merekam progres subtes selesai
     * - Langsung mengalihkan (redirect) peserta ke Dashboard Soal IST tanpa halaman ringkasan
     */
    async selesaikanSubtesAktif() {
        if (this.timerUjianTimeoutId) {
            clearTimeout(this.timerUjianTimeoutId);
            this.timerUjianTimeoutId = null;
        }
        if (this.timerUjianIntervalId) {
            clearInterval(this.timerUjianIntervalId);
            this.timerUjianIntervalId = null;
        }
        if (this.timerFotoTengahTimeoutId) {
            clearTimeout(this.timerFotoTengahTimeoutId);
            this.timerFotoTengahTimeoutId = null;
        }
        if (this.timerPeringatan7MenitId) {
            clearTimeout(this.timerPeringatan7MenitId);
            this.timerPeringatan7MenitId = null;
        }
        this.waktuTargetSelesai = null;
        this.isUjianTerkunci = true;

        // c) Foto Akhir: Saat peserta mengklik selesai
        if (!this.fotoAkhirTerkirim) {
            this.fotoAkhirTerkirim = true;
            const emailKandidat = localStorage.getItem('email_peserta') || (typeof state !== 'undefined' && state.user && state.user.email) || 'kandidat';
            const namaSubtesFoto = `Subtes-${this.currentSubtestNo}`;
            if (typeof jepretDanUpload === 'function') {
                jepretDanUpload(emailKandidat, 'IST', namaSubtesFoto, 'Akhir');
            }
        }

        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        // Kirim jawaban mentah dan hitung skor via server Supabase RPC
        const hasilSkor = await this.hitungSkorIST();

        // Tandai subtes selesai di riwayat progres
        if (!this.completedSubtests.includes(subtestCode)) {
            this.completedSubtests.push(subtestCode);
            this.saveProgress();
        }

        // Jika Soal 09 selesai (atau seluruh 9 subtes telah tuntas), langsung selesaikan modul IST dan tampilkan pop-up
        if (subtestCode === '09' || this.completedSubtests.length >= 9) {
            if (typeof stopProctoringCamera === 'function') {
                stopProctoringCamera();
            }
            this.selesaiDanKembaliKeDashboard();
            return;
        }

        // Jika masih mengerjakan subtes perantara (Soal 01..08), kembali ke daftar 9 subtes
        this.tampilkanMenu9Subtes();
    },

    // Alias untuk kompatibilitas fungsi lama
    selesaikanSubtes01() {
        this.selesaikanSubtesAktif();
    },

    // =====================================================================
    // 4. LOGIKA PENILAIAN & PENYIMPANAN DATA (SUPABASE RPC)
    // =====================================================================

    /**
     * Mengirim jawaban mentah peserta ke fungsi Supabase RPC 'hitung_dan_simpan_ist'
     * Penilaian dan skoring dilakukan aman di sisi server database.
     * @returns {Promise<Object>} Respon dari Supabase RPC
     */
    async hitungSkorIST() {
        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        let hasilRpc = null;

        try {
            if (window.supabase && typeof window.supabase.rpc === 'function') {
                const { data, error } = await window.supabase.rpc('hitung_dan_simpan_ist', {
                    p_id_peserta: localStorage.getItem('id_peserta') || this.id_peserta,
                    p_subtes: istLogic.currentSubtestNo,
                    p_jawaban_peserta: istLogic.jawabanPeserta
                });

                if (error) {
                    console.warn(`[IST Logic] Gagal memanggil hitung_dan_simpan_ist untuk ${subtestName}:`, error);
                } else {
                    hasilRpc = data;
                }
            } else {
                console.warn('[IST Logic] window.supabase.rpc tidak tersedia. Memastikan koneksi database.');
            }
        } catch (err) {
            console.error('[IST Logic] Error saat memanggil hitung_dan_simpan_ist:', err);
        }

        // Simpan ke localStorage sebagai cache sinkronisasi / cadangan offline
        try {
            localStorage.setItem(`altrak_ist_jawaban_subtes_${subtestCode}`, JSON.stringify(this.jawabanPeserta));
        } catch (e) {
            console.error("Gagal menyimpan ke localStorage:", e);
        }

        return hasilRpc;
    },

    /**
     * Menyelesaikan Modul 1 secara keseluruhan dan kembali ke Dashboard Portal
     */
    async selesaiDanKembaliKeDashboard() {
        console.log("[IST Logic] Menyelesaikan modul IST dan kembali ke Dashboard...");

        if (typeof stopProctoringCamera === 'function') {
            stopProctoringCamera();
        }

        // Kumpulkan hasil data IST untuk disimpan ke Supabase
        const subtestList = this.completedSubtests || [];
        const violations = typeof tabSwitchViolations !== 'undefined' ? tabSwitchViolations : 0;
        const dataIST = {
            id_peserta: localStorage.getItem('id_peserta') || this.id_peserta,
            nama_peserta: localStorage.getItem('nama_peserta') || 'Peserta',
            subtest_selesai: subtestList,
            jawaban_peserta: this.jawabanPeserta || {},
            pelanggaran_tab_switch: violations,
            catatan_integritas: violations > 0
                ? `[⚠️ Terdeteksi ${violations}x perpindahan tab/jendela]`
                : 'Bersih (Tidak ada perpindahan tab)',
            waktu_selesai: new Date().toISOString()
        };

        // Sertakan rekaman foto pengawasan webcam ke dalam hasil_ist
        try {
            const fotoList = JSON.parse(localStorage.getItem('kandidat_foto_pengawasan') || '[]');
            if (fotoList && fotoList.length > 0) {
                dataIST.foto_pengawasan = fotoList;
            }
        } catch (eFoto) {}

        // Update hasil tes ke Supabase dengan teknik Safe Merge agar tidak menimpa skor subtes dari SQL
        try {
            const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
                ? supabaseClient
                : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

            const idPesertaAktif = localStorage.getItem('id_peserta') || this.id_peserta;
            if (idPesertaAktif) {
                // 1. Ambil data hasil_ist saat ini yang sudah berisi skor subtes dari fungsi SQL (jika ada)
                let existingIst = {};
                if (sb) {
                    try {
                        const { data: rowKandidat } = await sb
                            .from('kandidat_psikotes')
                            .select('hasil_ist')
                            .eq('id', idPesertaAktif)
                            .single();
                        if (rowKandidat && rowKandidat.hasil_ist && typeof rowKandidat.hasil_ist === 'object') {
                            existingIst = rowKandidat.hasil_ist;
                        }
                    } catch (eSel) {}
                }

                // Ambil cadangan jawaban lengkap dari memori dan localStorage per subtes (01 - 09)
                const istSubMapping = {
                    '01': 'SE', '02': 'WA', '03': 'AN', '04': 'GE',
                    '05': 'RA', '06': 'ZR', '07': 'FA', '08': 'WU', '09': 'ME'
                };
                const subtesObjects = {};
                const structuredAnswers = {};

                ['01','02','03','04','05','06','07','08','09'].forEach(sCode => {
                    const subCode = istSubMapping[sCode];
                    let subJawaban = {};
                    try {
                        subJawaban = JSON.parse(localStorage.getItem(`altrak_ist_jawaban_subtes_${sCode}`) || '{}');
                    } catch (eSub) {}
                    if (this.currentSubtestNo === parseInt(sCode, 10) && this.jawabanPeserta && Object.keys(this.jawabanPeserta).length > 0) {
                        subJawaban = { ...subJawaban, ...this.jawabanPeserta };
                    }
                    const existingSub = (existingIst && (existingIst[`subtes_${sCode}`] || existingIst[subCode])) || {};
                    subtesObjects[`subtes_${sCode}`] = {
                        ...existingSub,
                        jawaban_peserta: subJawaban,
                        jawaban: subJawaban
                    };
                    structuredAnswers[subCode] = subJawaban;
                    structuredAnswers[sCode] = subJawaban;
                });

                // 2. Selipkan catatan pelanggaran & integritas dengan spread operator (skor SQL tetap 100% utuh)
                const mergedIst = {
                    ...existingIst,
                    ...dataIST,
                    ...subtesObjects,
                    jawaban_peserta: {
                        ...(existingIst.jawaban_peserta || {}),
                        ...structuredAnswers
                    },
                    subtest_selesai: (subtestList && subtestList.length > 0) ? subtestList : (existingIst.subtest_selesai || []),
                    pelanggaran_tab_switch: violations,
                    catatan_integritas: violations > 0
                        ? `[⚠️ Terdeteksi ${violations}x perpindahan tab/jendela]`
                        : 'Bersih (Tidak ada perpindahan tab)',
                    foto_pengawasan: dataIST.foto_pengawasan || existingIst.foto_pengawasan || [],
                    waktu_selesai: new Date().toISOString()
                };

                // 3. Simpan data gabungan kembali via updateHasilTes (aman dengan RLS & offline queue)
                if (typeof updateHasilTes === 'function') {
                    await updateHasilTes('hasil_ist', mergedIst);
                } else if (typeof window !== 'undefined' && typeof window.updateHasilTes === 'function') {
                    await window.updateHasilTes('hasil_ist', mergedIst);
                } else if (sb) {
                    await sb
                        .from('kandidat_psikotes')
                        .update({ hasil_ist: mergedIst })
                        .eq('id', idPesertaAktif);
                }

                console.log('[IST Logic] Safe Merge berhasil: Seluruh 176 lembar jawaban dan integritas tersimpan di Supabase.');
            }
        } catch (err) {
            console.warn('[IST Logic] Catatan Safe Merge Supabase:', err);
        }

        // Tandai IST selesai di localStorage
        localStorage.setItem('ist_selesai', 'true');

        // Buka kartu modul 1 di dashboard dan aktifkan kartu modul 2 (PAPI Kostick)
        if (typeof unlockDashboardCard === 'function') {
            unlockDashboardCard(1);
        }
        if (typeof updateDashboardProgress === 'function') {
            updateDashboardProgress();
        }

        // Teks pop-up pemberitahuan resmi sesuai instruksi
        const pesanSelesai = "Selamat! Anda telah menyelesaikan Tes 1 (Inteligent 1). Kartu Tes 2: PAPI Kostick sekarang telah terbuka pada Dashboard Asesmen.";

        const navigasiKeDashboard = () => {
            if (typeof pindahFase === 'function') {
                pindahFase('view-dashboard');
            } else if (typeof showPage === 'function') {
                showPage('view-dashboard');
            }
        };

        if (typeof istUI !== 'undefined' && typeof istUI.showModal === 'function') {
            istUI.showModal({
                title: "Tes 1: Inteligent 1 Selesai",
                message: pesanSelesai,
                type: "success",
                iconHtml: '<i class="fa-solid fa-circle-check text-emerald-400"></i>',
                okText: '<span>Mengerti</span> <i class="fa-solid fa-arrow-right"></i>',
                onOk: navigasiKeDashboard
            });
        } else if (typeof customAlert === 'function') {
            customAlert("Tes 1: Inteligent 1 Selesai", pesanSelesai, "success", false, navigasiKeDashboard);
        } else {
            alert(pesanSelesai);
            navigasiKeDashboard();
        }
    }
};

/**
 * Entry point global untuk memulai modul IST dari Dashboard (1 Web Terpadu)
 */
function startISTTest() {
    console.log("[IST Logic] Masuk ke Tes 1: IST dari Dashboard...");
    if (typeof closeModal === 'function') {
        closeModal('modal-module-ist');
    }
    if (typeof pindahFase === 'function') {
        pindahFase('view-ist');
    } else if (typeof showPage === 'function') {
        showPage('view-ist');
    }
    if (typeof istLogic !== 'undefined' && typeof istLogic.init === 'function') {
        istLogic.init();
    }
}

// Pastikan istLogic dan startISTTest dapat diakses secara global di window
if (typeof window !== 'undefined') {
    window.istLogic = istLogic;
    window.startISTTest = startISTTest;
}

// Inisialisasi otomatis jika dokumen siap
// Pada portal ber-login: istLogic menunggu tombol 'Mulai Tes 1 (IST)' ditekan
document.addEventListener('DOMContentLoaded', () => {
    const isStandalonePage = !document.getElementById('page-login') && !document.getElementById('view-login');
    if (isStandalonePage && document.getElementById('ist-app-container')) {
        istLogic.init();
    }
});

// =========================================================================
// FITUR PENGAMANAN & INTEGRITAS IST (ANTI-SCREENSHOT & ANTI PINDAH TAB)
// =========================================================================
if (typeof window !== 'undefined') {
    function clearUserClipboardFallback() {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText('').catch(() => {});
            }
        } catch (e) {}
    }

    // Blokir PrintScreen, F12, Ctrl+P, Ctrl+S, Ctrl+U, Ctrl+Shift+I/J/C
    document.addEventListener('keydown', (e) => {
        if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
            e.preventDefault();
            clearUserClipboardFallback();
            return;
        }
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            const k = (e.key || '').toLowerCase();
            if (['p', 's', 'u'].includes(k)) {
                e.preventDefault();
                return;
            }
            if (e.shiftKey && ['i', 'j', 'c'].includes(k)) {
                e.preventDefault();
                return;
            }
        }
    });

    // Helper Sensor Layar Khusus Subtes 09 (Anti-Capture & Anti-Cheat Overlay)
    function sensorLayarHafalan(isAktif) {
        // Sensor HANYA berlaku saat fase hafalan Subtes 09 (fase CONTOH) aktif
        const isHafalanAktif = typeof istLogic !== 'undefined' && 
                               Number(istLogic.currentSubtestNo) === 9 && 
                               istLogic.fase === 'CONTOH' && 
                               !istLogic.isUjianTerkunci &&
                               localStorage.getItem('ist_selesai') !== 'true';

        if (isAktif && !isHafalanAktif) {
            isAktif = false;
        }

        const cardHafalan = document.getElementById('card-hafalan-soal-09');
        const istContainer = document.getElementById('ist-app-container');
        let overlay = document.getElementById('ist-sensor-overlay-09');

        if (isAktif) {
            if (cardHafalan) {
                cardHafalan.style.filter = 'blur(25px)';
                cardHafalan.style.opacity = '0';
                cardHafalan.style.userSelect = 'none';
                cardHafalan.style.pointerEvents = 'none';
            }
            if (istContainer) {
                istContainer.style.filter = 'blur(20px)';
            }
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'ist-sensor-overlay-09';
                // z-40 agar berada tepat di bawah modal-message (z-50) sehingga modal tetap terlihat jelas dan tombol dapat diklik
                overlay.className = 'fixed inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-white text-center select-none pointer-events-none';
                overlay.innerHTML = `
                    <div class="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mb-4 border border-amber-500/30">
                        <i class="fa-solid fa-eye-slash"></i>
                    </div>
                    <h3 class="text-xl font-black text-white mb-2 uppercase tracking-wide">Materi Hafalan Disensor Sementara</h3>
                    <p class="text-sm text-slate-300 max-w-md leading-relaxed">
                        Layar hafalan otomatis disensor saat meninggalkan jendela atau berpindah tab demi menjaga integritas ujian seleksi PT Altrak 1978.
                    </p>
                `;
                document.body.appendChild(overlay);
            } else {
                overlay.style.display = 'flex';
            }
        } else {
            if (cardHafalan) {
                cardHafalan.style.filter = 'none';
                cardHafalan.style.opacity = '1';
                cardHafalan.style.userSelect = 'none';
                cardHafalan.style.pointerEvents = 'auto';
            }
            if (istContainer) {
                istContainer.style.filter = 'none';
            }
            if (overlay) {
                overlay.style.display = 'none';
            }
        }
    }
    window.sensorLayarHafalan = sensorLayarHafalan;

    // Pastikan sensor kembali terbuka saat tombol "Saya Mengerti & Kembali ke Tes" pada modal diklik
    document.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'msgBtnOk' || e.target.closest('#msgBtnOk'))) {
            const isSubtes09 = typeof istLogic !== 'undefined' && Number(istLogic.currentSubtestNo) === 9;
            if (isSubtes09) {
                // Pulihkan kembali ke layar penuh jika keluar saat sesi hafalan
                if (istLogic.fase === 'CONTOH' && !document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                }
                setTimeout(() => {
                    sensorLayarHafalan(false);
                }, 50);
            }
        }
    });

    // Deteksi jika peserta keluar dari mode Layar Penuh (Fullscreen) selama sesi hafalan Subtes 09
    document.addEventListener('fullscreenchange', () => {
        const isSubtes09Hafalan = typeof istLogic !== 'undefined' && 
                                  Number(istLogic.currentSubtestNo) === 9 && 
                                  istLogic.fase === 'CONTOH';
        if (isSubtes09Hafalan && !document.fullscreenElement) {
            sensorLayarHafalan(true);
            pemicuPeringatanIntegritas09('mode layar penuh (Fullscreen)');
        }
    });

    // Deteksi kursor mouse keluar dari jendela browser (ke taskbar, aplikasi lain, atau monitor kedua)
    document.addEventListener('mouseleave', () => {
        const isSubtes09Hafalan = typeof istLogic !== 'undefined' && 
                                  Number(istLogic.currentSubtestNo) === 9 && 
                                  istLogic.fase === 'CONTOH';
        if (isSubtes09Hafalan) {
            sensorLayarHafalan(true);
            pemicuPeringatanIntegritas09('kursor keluar dari jendela asesmen');
        }
    });

    // Cegah dan tangkal Screenshot (PrintScreen, Win+Shift+S, Snipping Tool, Ctrl+P) terutama di sesi hafalan Subtes 09
    window.addEventListener('keydown', (e) => {
        const isSubtes09 = typeof istLogic !== 'undefined' && Number(istLogic.currentSubtestNo) === 9 &&
                           istLogic.fase === 'CONTOH' && !istLogic.isUjianTerkunci &&
                           localStorage.getItem('ist_selesai') !== 'true';

        const isCaptureKey = (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) ||
                             (e.shiftKey && (e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) ||
                             ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')) ||
                             (e.altKey && (e.key === 'PrintScreen' || e.keyCode === 44));

        if (isCaptureKey) {
            e.preventDefault();
            e.stopPropagation();
            clearUserClipboardFallback();

            if (isSubtes09) {
                sensorLayarHafalan(true);
                pemicuPeringatanIntegritas09('tangkapan layar (screenshot / capture)');
            }
            return false;
        }

        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            return false;
        }
    }, true);

    window.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44 || e.key === 'Meta' || e.key === 'Control') {
            clearUserClipboardFallback();
        }
    });

    // Peringatan saat peserta tidak sengaja ingin refresh atau menutup tab saat tes aktif
    window.addEventListener('beforeunload', (e) => {
        if ((istLogic.fase === 'UJIAN' || (istLogic.fase === 'CONTOH' && istLogic.currentSubtestNo === 9)) && !istLogic.isUjianTerkunci) {
            e.preventDefault();
            e.returnValue = 'Tes Inteligent 1 sedang berlangsung. Progres tes Anda akan hilang jika halaman ditutup atau di-refresh!';
            return e.returnValue;
        }
    });

    // Blokir klik kanan
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // Blokir copy, cut, paste, dragstart
    ['copy', 'cut', 'paste', 'dragstart'].forEach((evt) => {
        document.addEventListener(evt, (e) => {
            if (istLogic.fase === 'UJIAN' || istLogic.fase === 'CONTOH') {
                e.preventDefault();
            }
        });
    });

    // Debounce dan pemicu peringatan integritas khusus Subtes 09 (Hafalan & Ujian)
    let istLastViolationTime = 0;
    function pemicuPeringatanIntegritas09(reason) {
        const now = Date.now();
        if (now - istLastViolationTime < 1500) return;
        istLastViolationTime = now;

        if (typeof window.handleIntegrityViolation === 'function') {
            window.handleIntegrityViolation(reason);
        } else if (typeof istUI !== 'undefined' && istUI.showModal) {
            if (typeof tabSwitchViolations === 'undefined') window.tabSwitchViolations = 0;
            tabSwitchViolations++;

            if (tabSwitchViolations > 3 && istLogic.fase === 'CONTOH') {
                sensorLayarHafalan(false);
                const cardHafalan = document.getElementById('card-hafalan-soal-09');
                if (cardHafalan) cardHafalan.style.display = 'none';
                if (istLogic.timerContohId) {
                    clearInterval(istLogic.timerContohId);
                    istLogic.timerContohId = null;
                }
                tabSwitchViolations = 0;
                istUI.showModal({
                    title: "🚨 Waktu Menghafal Dihentikan!",
                    message: `Batas toleransi pelanggaran terlampaui saat sesi menghafal.\n\nSesuai pakta integritas ujian PT Altrak 1978, lembar hafalan kata langsung ditutup dan Anda langsung diarahkan untuk mengerjakan 20 soal ujian Subtes 09.`,
                    type: "error",
                    iconHtml: '<i class="fa-solid fa-ban text-red-500"></i>',
                    okText: '<span>Mulai Ujian Soal 09</span>',
                    onOk: () => {
                        istLogic.mulaiFaseUjian();
                    }
                });
                return;
            }

            const sisa = Math.max(0, 3 - tabSwitchViolations);
            const pesanSisa = sisa > 0
                ? `Sisa toleransi pelanggaran: ${sisa} kali lagi.`
                : `PERINGATAN TERAKHIR! Jika Anda berpindah tab atau aplikasi sekali lagi, tes Anda akan otomatis diakhiri dan dikumpulkan ke server!`;
            istUI.showModal({
                title: "⚠️ Peringatan Integritas Ujian",
                message: `Terdeteksi perpindahan ${reason}! (Pelanggaran ke-${tabSwitchViolations} dari batas maksimal 3 kali).\n\nSistem merekam seluruh aktivitas ini demi integritas seleksi PT Altrak 1978. ${pesanSisa}\n\nHarap tetap fokus pada jendela asesmen sampai waktu selesai.`,
                type: "warning",
                iconHtml: '<i class="fa-solid fa-triangle-exclamation text-amber-500"></i>',
                okText: '<span>Saya Mengerti & Kembali ke Tes</span>',
                onOk: () => {
                    sensorLayarHafalan(false);
                }
            });
        }
    }

    // Event deteksi saat berpindah tab browser (visibilitychange)
    document.addEventListener('visibilitychange', () => {
        const isSubtes09 = typeof istLogic !== 'undefined' && Number(istLogic.currentSubtestNo) === 9 &&
                           istLogic.fase === 'CONTOH' && !istLogic.isUjianTerkunci &&
                           localStorage.getItem('ist_selesai') !== 'true';

        if (document.hidden) {
            if (isSubtes09) {
                sensorLayarHafalan(true);
                clearUserClipboardFallback();
                pemicuPeringatanIntegritas09('tab atau jendela browser');
            }
        } else {
            // Saat peserta kembali ke tab asesmen:
            // Sesuai Solusi 1, sensor TIDAK dimatikan otomatis oleh event tab/focus agar layar tidak berkedip atau terbuka sendiri.
            // Sensor hanya bisa dibuka jika tombol pop-up [Saya Mengerti & Kembali ke Tes] diklik oleh peserta.
            if (istLogic.waktuTargetSelesai && Date.now() >= istLogic.waktuTargetSelesai && !istLogic.isUjianTerkunci) {
                istLogic.waktuUjianHabis();
            }
        }
    });

    // Event deteksi saat jendela kehilangan fokus / pindah aplikasi (blur)
    window.addEventListener('blur', () => {
        const isSubtes09 = typeof istLogic !== 'undefined' && Number(istLogic.currentSubtestNo) === 9 &&
                           istLogic.fase === 'CONTOH' && !istLogic.isUjianTerkunci &&
                           localStorage.getItem('ist_selesai') !== 'true';
        if (isSubtes09) {
            sensorLayarHafalan(true);
            clearUserClipboardFallback();
            pemicuPeringatanIntegritas09('ke aplikasi lain');
        }
    });

    // Event saat jendela browser kembali aktif (focus)
    window.addEventListener('focus', () => {
        // Sesuai Solusi 1, event focus TIDAK mematikan sensor secara otomatis.
        // Sensor hanya bisa dibuka jika tombol pop-up [Saya Mengerti & Kembali ke Tes] diklik oleh peserta.
        if (istLogic.waktuTargetSelesai && Date.now() >= istLogic.waktuTargetSelesai && !istLogic.isUjianTerkunci) {
            istLogic.waktuUjianHabis();
        }
    });
}

