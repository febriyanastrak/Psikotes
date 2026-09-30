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
    
    // Hidden Timer fase ujian utama (setTimeout)
    // SANGAT PENTING: Berjalan diam-diam di background tanpa countdown di UI peserta
    timerUjianTimeoutId: null,
    isUjianTerkunci: false,
    waktuMulaiUjian: null,

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
        istUI.renderMenu9Subtes(this.completedSubtests);
    },

    /**
     * Memilih subtes untuk dikerjakan (validasi urutan wajib dari nomor 01)
     * @param {number} subtestNo Nomor subtes (1 sampai 9)
     */
    pilihSubtes(subtestNo) {
        // Aturan mutlak: Harus urut mulai dari Soal 01
        if (subtestNo === 1) {
            this.currentSubtestNo = 1;
            this.mulaiFaseContoh();
            return;
        }

        // Untuk subtes berikutnya (02..09), cek apakah subtes sebelumnya sudah selesai
        const prevCode = String(subtestNo - 1).padStart(2, '0');
        const isPrevCompleted = this.completedSubtests.includes(prevCode);

        if (!isPrevCompleted) {
            istUI.showModal({
                title: "Urutan Pengerjaan Wajib",
                message: `Rangkaian tes IST PT Altrak 1978 harus dikerjakan secara berurutan.\n\nHarap selesaikan Soal ${prevCode} terlebih dahulu untuk membuka akses Soal ${String(subtestNo).padStart(2, '0')}.`,
                type: "warning",
                iconHtml: '<i class="fa-solid fa-lock text-amber-400"></i>',
                okText: '<span>Mengerti</span>'
            });
            return;
        }

        // Jika subtes aktif dan terdaftar di data (Soal 02 s/d 08)
        if (subtestNo >= 2 && typeof IST_SUBTEST_DATA !== 'undefined' && IST_SUBTEST_DATA[subtestNo]) {
            this.currentSubtestNo = subtestNo;
            this.mulaiFaseContoh();
            return;
        }

        // Untuk subtes berikutnya yang belum aktif (misal Soal 09)
        istUI.showModal({
            title: `Soal ${String(subtestNo).padStart(2, '0')}`,
            message: `Modul Soal ${String(subtestNo).padStart(2, '0')} akan dibuka secara berurutan setelah bagian sebelumnya selesai dikerjakan.`,
            type: "info",
            iconHtml: '<i class="fa-solid fa-lock text-slate-400"></i>',
            okText: '<span>Mengerti</span>'
        });
    },

    // =====================================================================
    // 2. FASE CONTOH SOAL (PESERTA KLIK SENDIRI & JAWABAN DIBERITAHUKAN)
    // =====================================================================

    /**
     * Memulai fase contoh soal (Percobaan 30 Detik)
     */
    mulaiFaseContoh() {
        this.fase = "CONTOH";
        this.jawabanContoh = {};

        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        this.sisaWaktuContohDetik = Math.round((subtestData.waktuContoh || 30000) / 1000); // 30 detik
        
        // Render tampilan contoh soal
        istUI.renderFaseContoh(this.sisaWaktuContohDetik);

        // Jalankan timer 30 detik untuk fase contoh
        if (this.timerContohId) clearInterval(this.timerContohId);
        
        this.timerContohId = setInterval(() => {
            this.sisaWaktuContohDetik--;
            istUI.updateWaktuContoh(this.sisaWaktuContohDetik);

            // Setelah 30 detik berlalu:
            // Tampilkan modal kustom profesional persis seperti tes Pauli dan Soal 01
            // Aturan: Teks menampilkan "lanjut ke soal 02" (atau "lanjut ke soal 03"), lalu otomatis memindahkan layar ke soal utama
            if (this.sisaWaktuContohDetik <= 0) {
                clearInterval(this.timerContohId);
                this.timerContohId = null;

                let autoTimeout = null;
                const navigateToExam = () => {
                    if (autoTimeout) clearTimeout(autoTimeout);
                    this.mulaiFaseUjian();
                };

                const isHafalan = this.currentSubtestNo === 9 || (subtestData.contoh && subtestData.contoh.some(c => c.tipe === 'layar_hafalan'));
                
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

        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        // 1. Bersihkan layar dan render antarmuka ujian
        istUI.bersihkanLayar();
        istUI.renderFaseUjian();

        // 2. HIDDEN TIMER: Waktu ujian dinamis (Soal 02: 360.000 ms, Soal 03: 420.000 ms)
        // SANGAT PENTING: Jangan tampilkan angka hitung mundur atau keterangan waktu di UI peserta!
        console.log(`[IST Logic] Hidden timer ujian ${subtestName} dimulai (${subtestData.waktuUjian} ms). Berjalan diam-diam di background.`);
        
        if (this.timerUjianTimeoutId) {
            clearTimeout(this.timerUjianTimeoutId);
        }

        this.timerUjianTimeoutId = setTimeout(() => {
            this.waktuUjianHabis();
        }, subtestData.waktuUjian);
    },

    /**
     * Handler saat waktu ujian habis secara background
     */
    waktuUjianHabis() {
        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        console.warn(`[IST Logic] Waktu ${subtestName} habis di background!`);
        
        if (this.timerUjianTimeoutId) {
            clearTimeout(this.timerUjianTimeoutId);
            this.timerUjianTimeoutId = null;
        }
        this.isUjianTerkunci = true;

        // Simpan data jawaban secara diam-diam di background
        const hasilSkor = this.hitungSkorIST();
        console.log(`[IST Logic] Data ${subtestName} tersimpan diam-diam (waktu habis):`, hasilSkor);

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
            okText: '<span>Lanjut ke Dashboard Soal IST</span> <i class="fa-solid fa-arrow-right"></i>',
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

        this.jawabanPeserta[nomorSoal] = pilihanKey;
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

        let pesan = `Anda telah menjawab ${totalDijawab} dari ${totalSoal} butir soal.`;
        if (belumDijawab > 0) {
            pesan += `\n\nMasih terdapat ${belumDijawab} butir soal yang belum dijawab.`;
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
    selesaikanSubtesAktif() {
        if (this.timerUjianTimeoutId) {
            clearTimeout(this.timerUjianTimeoutId);
            this.timerUjianTimeoutId = null;
        }
        this.isUjianTerkunci = true;

        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        // Simpan data jawaban dan hitung skor secara diam-diam di background
        const hasilSkor = this.hitungSkorIST();
        console.log(`[IST Logic] Data ${subtestName} berhasil disimpan diam-diam:`, hasilSkor);

        // Tandai subtes selesai di riwayat progres
        if (!this.completedSubtests.includes(subtestCode)) {
            this.completedSubtests.push(subtestCode);
            this.saveProgress();
        }

        // ATURAN MUTLAK: JANGAN tampilkan halaman ringkasan seperti "Soal Telah Ditutup"!
        // Langsung redirect/navigasi membawa peserta ke halaman "Dashboard Soal IST"
        this.tampilkanMenu9Subtes();
    },

    // Alias untuk kompatibilitas fungsi lama
    selesaikanSubtes01() {
        this.selesaikanSubtesAktif();
    },

    // =====================================================================
    // 4. LOGIKA PENILAIAN & PENYIMPANAN DATA (SUPABASE PREP)
    // =====================================================================

    /**
     * Menghitung skor IST subtes aktif di background dan menghasilkan objek JSON
     * disiapkan untuk tipe data JSONB Supabase
     * @returns {Object} JSON payload evaluasi subtes
     */
    hitungSkorIST() {
        const subtestData = this.getCurrentSubtestData();
        const subtestCode = String(this.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        let totalBenar = 0;
        let totalSalah = 0;
        let totalKosong = 0;

        const jawabanDetail = [];

        subtestData.soal.forEach((item) => {
            const no = item.no;
            const rawPilihan = this.jawabanPeserta[no];
            const pilihanUser = (rawPilihan !== undefined && rawPilihan !== null && String(rawPilihan).trim() !== '') ? String(rawPilihan).trim() : null;
            const kunci = item.jawabanBenar;
            const isIsian = item.tipe === 'isian' || !item.pilihan;

            if (!pilihanUser) {
                totalKosong++;
            } else if (isIsian) {
                if (pilihanUser.toLowerCase() === String(kunci).trim().toLowerCase()) {
                    totalBenar++;
                } else {
                    totalSalah++;
                }
            } else if (pilihanUser === kunci) {
                totalBenar++;
            } else {
                totalSalah++;
            }

            jawabanDetail.push({
                no: no,
                jawaban_peserta: pilihanUser
            });
        });

        const payloadSupabase = {
            id_peserta: this.id_peserta,
            subtes_id: subtestData.id,
            subtes_nama: subtestName,
            jawaban_detail: jawabanDetail,
            ringkasan_skor: {
                total_benar: totalBenar,
                total_salah: totalSalah,
                kosong: totalKosong
            },
            pelanggaran_tab_switch: typeof tabSwitchViolations !== 'undefined' ? tabSwitchViolations : 0,
            waktu_selesai: new Date().toISOString()
        };

        // CETAK (console.log) objek JSON tersebut di akhir tes sebagai simulasi
        console.log("=================================================");
        console.log(`[SIMULASI SUPABASE JSONB] HASIL PENILAIAN IST ${subtestName.toUpperCase()}:`);
        console.log(JSON.stringify(payloadSupabase, null, 2));
        console.log("=================================================");

        // Simpan ke localStorage sebagai cache sinkronisasi
        try {
            localStorage.setItem(`altrak_ist_subtes${subtestCode}_result`, JSON.stringify(payloadSupabase));
            localStorage.setItem(`altrak_ist_jawaban_subtes_${subtestCode}`, JSON.stringify(this.jawabanPeserta));
        } catch (e) {
            console.error("Gagal menyimpan ke localStorage:", e);
        }

        return payloadSupabase;
    },

    /**
     * Menyelesaikan Modul 1 secara keseluruhan dan kembali ke Dashboard Portal
     */
    selesaiDanKembaliKeDashboard() {
        console.log("[IST Logic] Menyelesaikan modul IST dan kembali ke Dashboard...");
        if (typeof completeModule === 'function') {
            completeModule(1);
        } else if (typeof showPage === 'function') {
            showPage('page-dashboard');
        } else {
            window.location.href = 'index.html';
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
    if (typeof showPage === 'function') {
        showPage('page-ist');
    }
    istLogic.init();
}

// Inisialisasi otomatis jika dokumen siap
// Pada index.html ber-login: istLogic menunggu tombol 'Mulai Tes 1 (IST)' ditekan
// Pada standalone ist.html: istLogic langsung menampilkan menu 9 subtes
document.addEventListener('DOMContentLoaded', () => {
    const isStandalonePage = !document.getElementById('page-login');
    if (isStandalonePage && document.getElementById('ist-app-container')) {
        istLogic.init();
    }
});

// =========================================================================
// FITUR PENGAMANAN & INTEGRITAS IST (STANDALONE FALLBACK JIKA DIBUKA DI IST.HTML)
// =========================================================================
if (typeof window !== 'undefined' && !window._appSecurityLoaded) {
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

    window.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
            clearUserClipboardFallback();
        }
    });

    // Peringatan saat peserta tidak sengaja ingin refresh atau menutup tab saat tes aktif
    window.addEventListener('beforeunload', (e) => {
        if ((istLogic.fase === 'UJIAN' || (istLogic.fase === 'CONTOH' && istLogic.currentSubtestNo === 9)) && !istLogic.isUjianTerkunci) {
            e.preventDefault();
            e.returnValue = 'Tes IST sedang berlangsung. Progres tes Anda akan hilang jika halaman ditutup atau di-refresh!';
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

    // Anti tab-switching fallback
    let istLastViolation = 0;
    if (typeof tabSwitchViolations === 'undefined') {
        window.tabSwitchViolations = 0;
    }

    function istHandleViolation(reason) {
        if ((istLogic.fase !== 'UJIAN' && !(istLogic.fase === 'CONTOH' && istLogic.currentSubtestNo === 9)) || istLogic.isUjianTerkunci) {
            return;
        }
        const now = Date.now();
        if (now - istLastViolation < 1500) return;
        istLastViolation = now;

        clearUserClipboardFallback();
        tabSwitchViolations++;

        if (tabSwitchViolations <= 3) {
            const sisa = 3 - tabSwitchViolations;
            const pesanSisa = sisa > 0
                ? `Sisa toleransi pelanggaran: ${sisa} kali lagi.`
                : `PERINGATAN TERAKHIR! Jika Anda berpindah tab atau aplikasi sekali lagi, tes Anda akan otomatis diakhiri dan dikumpulkan ke server!`;

            istUI.showModal({
                title: "⚠️ Peringatan Integritas Ujian",
                message: `Terdeteksi perpindahan ${reason}! (Pelanggaran ke-${tabSwitchViolations} dari batas maksimal 3 kali).\n\nSistem merekam seluruh aktivitas ini demi integritas seleksi PT Altrak 1978. ${pesanSisa}\n\nHarap tetap fokus pada jendela asesmen sampai waktu selesai.`,
                type: "warning",
                iconHtml: '<i class="fa-solid fa-triangle-exclamation text-amber-500"></i>',
                okText: '<span>Saya Mengerti & Kembali ke Tes</span>'
            });
        } else {
            istUI.showModal({
                title: "🚨 Tes Dihentikan Otomatis",
                message: `Batas toleransi pelanggaran terlampaui (lebih dari 3 kali berpindah tab/aplikasi).\n\nSesuai pakta integritas ujian PT Altrak 1978, rangkaian tes IST Anda dihentikan secara otomatis dan lembar jawaban langsung dikumpulkan ke sistem.`,
                type: "error",
                iconHtml: '<i class="fa-solid fa-ban text-red-500"></i>',
                okText: '<span>Tutup & Kembali ke Menu</span>',
                onOk: () => {
                    istLogic.selesaikanSubtesAktif();
                    istLogic.tampilkanMenu9Subtes();
                }
            });
            setTimeout(() => {
                if (!istLogic.isUjianTerkunci) {
                    istLogic.selesaikanSubtesAktif();
                    istLogic.tampilkanMenu9Subtes();
                }
            }, 1500);
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) istHandleViolation('tab atau jendela browser');
    });
    window.addEventListener('blur', () => {
        istHandleViolation('ke aplikasi lain');
    });
}

