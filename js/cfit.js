// =========================================================================
// MODUL LOGIKA & TAMPILAN CFIT (CULTURE FAIR INTELLIGENCE TEST) - SKALA 3
// PT Altrak 1978 - Leadership & Management Assessment System
// 4 Subtes Penalaran Abstrak Berbatas Waktu & Evaluasi Kecerdasan Fluid
// =========================================================================

(function () {
    'use strict';

    // State CFIT
    const cfitState = {
        fase: "MENU", // "MENU" | "PANDUAN" | "CONTOH" | "UJIAN" | "SELESAI"
        currentSubtesNo: 1, // 1 s/d 4
        currentSoalIdx: 0,  // Indeks soal aktif dalam subtes
        completedSubtests: [], // ['01', '02', ...]

        // Jawaban peserta pada ujian utama
        // subtes_1: { 1: "B", 2: "C" }, subtes_2: { 1: ["B","E"] }
        answers: {
            subtes_1: {},
            subtes_2: {},
            subtes_3: {},
            subtes_4: {}
        },

        // Jawaban latihan contoh
        contohAnswers: {},
        contohSubmitted: {},

        // Timer
        timerUjianId: null,
        sisaWaktuDetik: 0,
        targetTimestamp: null,

        // Tracking Foto Pengawasan Kamera Midpoint (Tengah)
        fotoTengahDone: {},

        // Keamanan Anti-Cheat
        pelanggaranTab: 0,
        toleransiTab: 3,
        isLocked: false
    };

    // Kunci Jawaban Resmi CFIT tersimpan aman di Database Server Supabase (tabel cfit_master_kunci)
    // Penilaian dan kalkulasi skor IQ dievaluasi melalui Supabase RPC hitung_skor_cfit (Server-Side)

    // Inisialisasi awal saat halaman dibuka atau di-refresh (AUTO-RESTORE)
    function initCfit() {
        console.log("[CFIT Engine] Menginisialisasi Modul CFIT...");

        // 1. Pulihkan pelanggaran tab jika ada
        try {
            const savedViolations = localStorage.getItem('cfit_pelanggaran_tab');
            if (savedViolations) {
                cfitState.pelanggaranTab = parseInt(savedViolations, 10) || 0;
            }
        } catch (e) {}

        // 2. Pulihkan subtes yang sudah selesai jika ada di session
        try {
            const savedDone = localStorage.getItem('cfit_completed_subtests');
            if (savedDone) {
                cfitState.completedSubtests = JSON.parse(savedDone);
            }
        } catch (e) {}

        // 3. Pulihkan jawaban sementara (draft answers) jika ada
        try {
            const savedAnswers = localStorage.getItem('cfit_draft_answers');
            if (savedAnswers) {
                const parsed = JSON.parse(savedAnswers);
                cfitState.answers = {
                    subtes_1: { ...(parsed.subtes_1 || {}) },
                    subtes_2: { ...(parsed.subtes_2 || {}) },
                    subtes_3: { ...(parsed.subtes_3 || {}) },
                    subtes_4: { ...(parsed.subtes_4 || {}) }
                };
            }
        } catch (e) {}

        pasangDeteksiPindahTab();

        // 4. Periksa apakah seluruh CFIT sudah selesai
        if (localStorage.getItem('cfit_selesai') === 'true' || cfitState.completedSubtests.length >= 4) {
            cfitState.fase = "SELESAI";
            renderLayarSelesai();
            return;
        }

        // 5. AUTO-RESTORE STATUS SESI SEBELUM REFRESH (ZERO RESET)
        const savedFase = localStorage.getItem('cfit_fase');
        const savedSubtes = parseInt(localStorage.getItem('cfit_current_subtes'), 10);
        const savedSoalIdx = parseInt(localStorage.getItem('cfit_current_soal_idx'), 10) || 0;
        const savedEndTime = parseInt(localStorage.getItem('cfit_subtes_end_time'), 10);

        if (savedFase === 'UJIAN' && savedSubtes >= 1 && savedSubtes <= 4) {
            const now = Date.now();
            if (savedEndTime && savedEndTime > now) {
                // SISA WAKTU MASIH ADA: LANGSUNG LANJUTKAN UJIAN AKTIF TANPA RESET!
                console.log(`[CFIT Engine] Melanjutkan ujian Subtes ${savedSubtes} Soal #${savedSoalIdx + 1} dengan sisa waktu tersimpan...`);
                cfitState.fase = "UJIAN";
                cfitState.currentSubtesNo = savedSubtes;
                cfitState.currentSoalIdx = savedSoalIdx;
                cfitState.targetTimestamp = savedEndTime;
                cfitState.sisaWaktuDetik = Math.max(0, Math.ceil((savedEndTime - now) / 1000));
                cfitState.isLocked = false;

                // Fullscreen Enforce persis seperti IST & PAPI
                if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                }

                jalankanTimerUjian(savedSubtes);
                renderSoalAktif();
                return;
            } else if (savedEndTime && savedEndTime <= now) {
                // WAKTU TELAH HABIS SAAT REFRESH
                cfitState.currentSubtesNo = savedSubtes;
                handleWaktuHabisSubtes(savedSubtes);
                return;
            }
        } else if (savedFase === 'CONTOH' && savedSubtes >= 1 && savedSubtes <= 4) {
            const savedContohIdx = parseInt(localStorage.getItem('cfit_current_contoh_idx'), 10) || 0;
            cfitState.fase = "CONTOH";
            cfitState.currentSubtesNo = savedSubtes;
            renderContohSubtes(savedSubtes, savedContohIdx);
            return;
        } else if (savedFase === 'PANDUAN' && savedSubtes >= 1 && savedSubtes <= 4) {
            cfitState.fase = "PANDUAN";
            cfitState.currentSubtesNo = savedSubtes;
            renderPanduanSubtes(savedSubtes);
            return;
        }

        // Default awal: Buka Menu 4 Subtes
        cfitState.fase = "MENU";
        cfitState.currentSubtesNo = 1;
        cfitState.currentSoalIdx = 0;
        renderMenu4Subtes();
    }

    /**
     * Memulai sesi tes CFIT dari luar (Dashboard Tahap 2)
     */
    function startCfitTest() {
        if (typeof pindahFase === 'function') {
            pindahFase('view-cfit');
        } else if (typeof showPage === 'function') {
            showPage('view-cfit');
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        initCfit();
    }

    // =========================================================================
    // 1. MENU UTAMA 4 SUBTES CFIT (PERSIS GAYA IST)
    // =========================================================================
    function renderMenu4Subtes() {
        cfitState.fase = "MENU";
        bersihkanTimer();

        const container = document.getElementById('cfit-app-container');
        if (!container) return;

        const subtesList = (window.CFIT_CONFIG && window.CFIT_CONFIG.subtes) || [];
        const totalSelesai = cfitState.completedSubtests.length;

        let cardsHtml = '';
        subtesList.forEach((sub, idx) => {
            const noInt = sub.no;
            const noStr = String(noInt).padStart(2, '0');
            const isCompleted = cfitState.completedSubtests.includes(noStr);
            const isPrevCompleted = noInt === 1 || cfitState.completedSubtests.includes(String(noInt - 1).padStart(2, '0'));
            const isAccessible = !isCompleted && isPrevCompleted;

            let badgeHtml = '';
            let btnHtml = '';

            if (isCompleted) {
                badgeHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5"><i class="fa-solid fa-check-circle"></i> Selesai</span>`;
                btnHtml = `
                    <button type="button" disabled class="w-full py-3.5 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
                        <i class="fa-solid fa-lock"></i> <span>Terkunci (Sudah Dikerjakan)</span>
                    </button>`;
            } else if (isAccessible) {
                badgeHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#003865] border border-blue-200 flex items-center gap-1.5 animate-pulse"><i class="fa-solid fa-circle-play text-amber-500"></i> Siap Dikerjakan</span>`;
                btnHtml = `
                    <button type="button" onclick="window.cfitEngine.pilihSubtes(${noInt})" class="w-full py-3.5 bg-gradient-to-r from-[#003865] via-blue-700 to-[#003865] hover:from-[#002747] hover:to-[#083c6b] text-white font-black rounded-xl text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-play"></i> <span>Mulai Subtes ${noInt}</span>
                    </button>`;
            } else {
                badgeHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1.5"><i class="fa-solid fa-lock text-slate-400"></i> Terkunci</span>`;
                btnHtml = `
                    <button type="button" disabled class="w-full py-3.5 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
                        <i class="fa-solid fa-lock"></i> <span>Selesaikan Subtes ${noInt - 1} Dahulu</span>
                    </button>`;
            }

            const menit = Math.floor(sub.waktuDetik / 60);
            const detik = sub.waktuDetik % 60;
            const waktuStr = detik > 0 ? `${menit} Menit ${detik} Detik` : `${menit} Menit`;

            cardsHtml += `
                <div class="bg-white rounded-3xl border ${isAccessible ? 'border-[#003865] shadow-lg ring-1 ring-[#003865]/20' : 'border-[#b9d0e7] shadow-sm'} p-6 flex flex-col justify-between transition-all">
                    <div>
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="text-[11px] font-black uppercase tracking-wider text-slate-400">BAGIAN ${noStr} / 04</span>
                            ${badgeHtml}
                        </div>
                        <h3 class="text-base sm:text-lg font-black text-slate-900 mb-2">${sub.nama}</h3>
                        <p class="text-xs text-slate-600 leading-relaxed mb-4">${sub.petunjuk}</p>
                    </div>
                    <div class="pt-4 border-t border-slate-100">
                        <div class="grid grid-cols-2 gap-2 text-xs mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div>
                                <span class="text-slate-400 block text-[10px] uppercase font-bold">Jumlah Soal</span>
                                <span class="font-bold text-slate-800">${sub.totalSoal} soal </span>
                            </div>
                            <div>
                                <span class="text-slate-400 block text-[10px] uppercase font-bold">Waktu</span>
                                <span class="font-bold text-amber-600">${waktuStr}</span>
                            </div>
                        </div>
                        ${btnHtml}
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
                <!-- Header Banner Menu (Gaya MSDT) -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#0a4980] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-400/20 relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 rounded-2xl bg-white/10 text-amber-400 border border-white/20 flex items-center justify-center text-3xl font-black shadow-inner shrink-0">
                                <i class="fa-solid fa-shapes"></i>
                            </div>
                            <div>
                                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest mb-1.5">
                                    <i class="fa-solid fa-crown text-amber-400"></i> Asesmen Kepemimpinan Tahap 2
                                </div>
                                <h1 class="text-xl sm:text-3xl font-black text-white leading-tight">
                                    Culture Fair Intelligence Test (CFIT)
                                </h1>
                                <p class="text-xs sm:text-sm text-slate-200 mt-1">
                                    Pengukuran Fluid Intelligence &amp; Penalaran Abstrak (4 Subtes Berurutan)
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center shrink-0">
                                <span class="text-[10px] uppercase font-bold tracking-wider text-sky-200 block">Progres Tes</span>
                                <span class="text-base font-black text-amber-300">${totalSelesai} / 4 Subtes</span>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Grid 4 Subtes -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    ${cardsHtml}
                </div>


                ${totalSelesai >= 4 ? `
                <div class="flex justify-end items-center pt-2">
                    <button type="button" onclick="window.cfitEngine.selesaiSeluruhCfit()" class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer">
                        <i class="fa-solid fa-flag-checkered"></i> <span>Kirim &amp; Selesaikan Modul CFIT</span>
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Memilih subtes dari menu
     */
    function pilihSubtes(noInt) {
        const noStr = String(noInt).padStart(2, '0');
        if (cfitState.completedSubtests.includes(noStr)) {
            alertModal("Subtes Sudah Selesai", `Subtes ${noInt} sudah selesai dikerjakan dan telah terkunci demi integritas ujian.`);
            return;
        }
        if (noInt > 1 && !cfitState.completedSubtests.includes(String(noInt - 1).padStart(2, '0'))) {
            alertModal("Urutan Wajib", `Harap selesaikan Subtes ${noInt - 1} terlebih dahulu sebelum membuka Subtes ${noInt}.`);
            return;
        }

        cfitState.currentSubtesNo = noInt;
        cfitState.currentSoalIdx = 0;
        try {
            localStorage.setItem('cfit_fase', 'PANDUAN');
            localStorage.setItem('cfit_current_subtes', String(noInt));
        } catch (e) {}
        renderPanduanSubtes(noInt);
    }

    // =========================================================================
    // 2. FASE PANDUAN SUBTES RESMI (GAYA MSDT)
    // =========================================================================
    function renderPanduanSubtes(noInt) {
        cfitState.fase = "PANDUAN";
        cfitState.currentSubtesNo = noInt;
        bersihkanTimer();
        try {
            localStorage.setItem('cfit_fase', 'PANDUAN');
            localStorage.setItem('cfit_current_subtes', String(noInt));
        } catch (e) {}

        const container = document.getElementById('cfit-app-container');
        if (!container) return;

        const config = window.CFIT_CONFIG && window.CFIT_CONFIG.subtes && window.CFIT_CONFIG.subtes[noInt - 1];
        if (!config) return;

        const menit = Math.floor(config.waktuDetik / 60);
        const detik = config.waktuDetik % 60;
        const waktuStr = detik > 0 ? `${menit} Menit ${detik} Detik` : `${menit} Menit`;

        container.innerHTML = `
            <div class="space-y-4 animate-fade-in pb-4">
                <!-- HEADER BANNER PEDOMAN (GAYA MSDT) -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#0a4980] rounded-2xl p-4 sm:p-5 text-white shadow-xl border border-blue-400/20 relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center text-xl sm:text-2xl font-black border border-white/20 shadow-inner shrink-0">
                                <i class="fa-solid fa-shapes"></i>
                            </div>
                            <div>
                                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider mb-1">
                                    <i class="fa-solid fa-crown text-amber-400"></i> Asesmen Kepemimpinan Tahap 2 &bull; Subtes ${noInt} dari 4
                                </div>
                                <h1 class="text-lg sm:text-xl font-black text-white leading-tight">
                                    ${config.nama}
                                </h1>
                                <p class="text-[11px] sm:text-xs text-slate-200">
                                    Pedoman Pelaksanaan &amp; Petunjuk Mengerjakan Subtes
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-center">
                                <span class="text-[9px] uppercase font-bold text-sky-200 block">Waktu Ujian</span>
                                <span class="text-sm font-black text-amber-300">${waktuStr}</span>
                            </div>
                            <button type="button" onclick="window.cfitEngine.renderMenu4Subtes()"
                                class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer">
                                <i class="fa-solid fa-arrow-left"></i>
                                <span>Menu Subtes</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- KARTU PETUNJUK RESMI & PEDOMAN (GAYA MSDT) -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-5 sm:p-6 space-y-4">
                    <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#003865] flex items-center justify-center text-base font-bold border border-blue-200 shrink-0">
                            <i class="fa-solid fa-book-open"></i>
                        </div>
                        <div>
                            <h2 class="text-base sm:text-lg font-black text-[#003865]">Petunjuk Mengerjakan Subtes ${noInt}</h2>
                            <p class="text-[11px] text-slate-500">Bacalah petunjuk di bawah ini dengan seksama sebelum memulai latihan contoh soal</p>
                        </div>
                    </div>

                    <div class="p-3.5 bg-[#edf3f9] rounded-2xl border border-[#b9d0e7] text-slate-700 text-xs sm:text-sm leading-relaxed space-y-1">
                        <h4 class="font-black text-[#003865] text-xs sm:text-sm flex items-center gap-1.5">
                            <i class="fa-solid fa-circle-info text-amber-500"></i> Penjelasan Soal:
                        </h4>
                        <p class="font-medium text-slate-800">${config.petunjuk}</p>
                    </div>

                    <!-- KETENTUAN TES (3 KOTAK METRIK PERSIS GAYA MSDT) -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                            <i class="fa-solid fa-list-ol text-lg text-[#003865] mb-1"></i>
                            <p class="text-[10px] uppercase font-bold text-slate-400">Jumlah Soal</p>
                            <p class="text-sm sm:text-base font-black text-[#003865] mt-0.5">${config.totalSoal} Soal</p>
                            <p class="text-[10px] text-slate-500 mt-0.5">Wajib dikerjakan berurutan</p>
                        </div>
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                            <i class="fa-solid fa-stopwatch text-lg text-blue-600 mb-1"></i>
                            <p class="text-[10px] uppercase font-bold text-slate-400">Alokasi Waktu</p>
                            <p class="text-sm sm:text-base font-black text-blue-700 mt-0.5">${waktuStr}</p>
                            <p class="text-[10px] text-slate-500 mt-0.5">Berjalan otomatis di latar</p>
                        </div>
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                            <i class="fa-solid fa-circle-check text-lg text-emerald-600 mb-1"></i>
                            <p class="text-[10px] uppercase font-bold text-slate-400">Karakter Pilihan</p>
                            <p class="text-sm sm:text-base font-black text-emerald-700 mt-0.5">${noInt === 2 ? 'Wajib 2 Kotak' : 'Pilih 1 Jawaban'}</p>
                            <p class="text-[10px] text-slate-500 mt-0.5">${noInt === 2 ? 'Tepat 2 pilihan per nomor' : 'Pilihan A, B, C, D, E, F'}</p>
                        </div>
                    </div>

                    ${noInt === 2 ? `
                        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                            <i class="fa-solid fa-triangle-exclamation text-amber-600 text-sm shrink-0"></i>
                            <span>PENTING KHUSUS SUBTES 2: Anda WAJIB memilih tepat 2 (DUA) kotak jawaban pada setiap nomor soal!</span>
                        </div>
                    ` : ''}

                    <!-- TOMBOL MULAI PENGERJAAN (PERSIS GAYA MSDT) -->
                    <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button type="button" onclick="window.cfitEngine.renderMenu4Subtes()"
                            class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2">
                            <i class="fa-solid fa-arrow-left"></i>
                            <span>Kembali ke Menu</span>
                        </button>
                        <button type="button" onclick="window.cfitEngine.renderContohSubtes(${noInt}, 0)"
                            class="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#003865] via-blue-700 to-[#003865] hover:from-[#002747] hover:to-[#083c6b] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <span>Lanjut ke Latihan Contoh Soal</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 3. FASE CONTOH & LATIHAN INTERAKTIF PER SUBTES
    // =========================================================================
    function renderContohSubtes(subtesNo, contohIdx = 0) {
        cfitState.fase = "CONTOH";
        cfitState.currentSubtesNo = subtesNo;
        bersihkanTimer();
        try {
            localStorage.setItem('cfit_fase', 'CONTOH');
            localStorage.setItem('cfit_current_subtes', String(subtesNo));
            localStorage.setItem('cfit_current_contoh_idx', String(contohIdx));
        } catch (e) {}

        const container = document.getElementById('cfit-app-container');
        if (!container) return;

        const contohList = (window.CFIT_EXAMPLES && window.CFIT_EXAMPLES[`subtes_${subtesNo}`]) || [];
        if (contohList.length === 0 || contohIdx >= contohList.length) {
            // Jika semua contoh selesai, konfirmasi siap ujian utama
            konfirmasiMulaiUjianUtama(subtesNo);
            return;
        }

        const contoh = contohList[contohIdx];
        const subtesKey = `subtes_${subtesNo}`;
        const keyStorage = `${subtesNo}_${contoh.no}`;

        // Defaultkan pilihan ke kunci jawaban secara otomatis jika belum diisi (persis seperti IST yang langsung mendemonstrasikan kunci)
        if (cfitState.contohAnswers[keyStorage] === undefined) {
            cfitState.contohAnswers[keyStorage] = subtesNo === 2 ? [...contoh.kunci] : contoh.kunci;
        }
        const userChoice = cfitState.contohAnswers[keyStorage];
        const kunciText = Array.isArray(contoh.kunci) ? contoh.kunci.join(' & ') : contoh.kunci;

        // Cek kecocokan pilihan saat ini dengan kunci
        const isCorrect = subtesNo === 2
            ? (Array.isArray(userChoice) && userChoice.length === 2 && contoh.kunci.every(k => userChoice.includes(k)))
            : (userChoice === contoh.kunci);

        // Opsi Buttons disusun MODEL KARTU GRID PERSIS IST
        const optColsCount = (subtesNo === 1 || subtesNo === 3) ? 'grid-cols-6' : 'grid-cols-5';
        let opsiButtonsHtml = '';
        contoh.pilihan.forEach(opt => {
            const isSelected = subtesNo === 2
                ? (Array.isArray(userChoice) && userChoice.includes(opt))
                : (userChoice === opt);
            const isKey = subtesNo === 2
                ? (Array.isArray(contoh.kunci) && contoh.kunci.includes(opt))
                : (contoh.kunci === opt);

            let cardBorderCls = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700';
            let badgeLetterCls = 'bg-slate-100 text-slate-600 font-bold';

            if (isSelected) {
                if (isKey) {
                    cardBorderCls = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-500/20 font-bold scale-[1.02]';
                    badgeLetterCls = 'bg-emerald-600 text-white font-black';
                } else {
                    cardBorderCls = 'border-amber-400 bg-amber-50 text-amber-950 shadow-sm scale-[1.02] font-bold';
                    badgeLetterCls = 'bg-amber-500 text-white font-black';
                }
            }

            opsiButtonsHtml += `
                <button type="button" onclick="window.cfitEngine.pilihJawabanContoh(${subtesNo}, ${contoh.no}, '${opt}', ${contohIdx})"
                    class="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 ${cardBorderCls} cursor-pointer transition-all select-none shadow-xs hover:border-[#003865]">
                    <div class="flex items-center gap-1.5 mb-1">
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${badgeLetterCls} flex items-center justify-center text-xs sm:text-sm font-black shrink-0 transition-colors">
                            ${opt}
                        </span>
                        ${isSelected ? (isKey ? '<i class="fa-solid fa-check text-xs text-emerald-600"></i>' : '<i class="fa-solid fa-xmark text-xs text-amber-500"></i>') : ''}
                    </div>
                    <span class="text-[11px] sm:text-xs font-semibold text-center ${isSelected ? (isKey ? 'text-emerald-900 font-black' : 'text-amber-900 font-black') : 'text-slate-600'}">Pilihan ${opt}</span>
                </button>
            `;
        });

        container.innerHTML = `
            <div class="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-[#b9d0e7] overflow-hidden animate-fade-in pb-5">
                <!-- Header Contoh (Gaya MSDT) -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#0a4980] px-5 sm:px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-400/20">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-amber-400 text-[#051627] flex items-center justify-center font-black text-xs shadow">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div>
                            <span class="text-[10px] font-black uppercase text-amber-300 tracking-wider">LATIHAN PERCOBAAN &bull; SUBTES ${subtesNo}</span>
                            <h3 class="text-base sm:text-lg font-black text-white">Contoh Soal #${contoh.no} dari ${contohList.length} Contoh</h3>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                            <i class="fa-solid fa-key text-[10px] text-amber-300"></i> Kunci Jawaban: ${kunciText}
                        </span>
                        <span class="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20 text-sky-200">
                            Tidak Diberi Nilai Ujian
                        </span>
                    </div>
                </div>

                <div class="p-4 sm:p-6 space-y-4">
                    <!-- 1. KOTAK GAMBAR BERUKURAN PROPORSIONAL & JELAS -->
                    <div class="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
                        <div class="text-xs font-black uppercase tracking-wider text-[#003865] flex items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-shapes text-amber-500"></i>
                                <span>${subtesNo === 1 ? 'POLA DERET BENTUK & KOTAK CONTOH:' : subtesNo === 2 ? 'KATEGORI KELOMPOK GAMBAR CONTOH:' : subtesNo === 3 ? 'MATRIKS BENTUK YANG HARUS DILENGKAPI:' : 'HUBUNGAN POLA DAN POSISI TITIK:'}</span>
                            </div>
                            <span class="text-[11px] text-slate-400 font-semibold hidden sm:inline">Perhatikan gambar secara saksama</span>
                        </div>
                        <div class="flex justify-center items-center p-3 sm:p-4 bg-[#fafcff] rounded-xl border border-slate-100 overflow-x-auto min-h-[140px] sm:min-h-[170px]">
                            <img src="${encodeURI(contoh.gambarSoal)}" alt="Contoh Soal ${contoh.no}" class="w-full max-w-[740px] h-auto object-contain mx-auto select-none rounded" style="max-height: 230px; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" draggable="false" onerror="this.onerror=null; this.src='assets/logo/logo%20altrak.jpeg';">
                        </div>
                    </div>

                    <!-- 2. TEKS PERTANYAAN CONTOH PROPORSIONAL & TEGAS -->
                    <div class="p-3 sm:p-3.5 rounded-xl bg-blue-50/70 border border-[#b9d0e7] shadow-2xs">
                        <div class="flex items-start gap-2.5">
                            <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#003865] text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                <i class="fa-solid fa-circle-question text-xs"></i>
                            </div>
                            <p class="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 leading-snug">
                                ${contoh.pertanyaan}
                            </p>
                        </div>
                    </div>

                    <!-- 3. KOTAK CARA MENGERJAKAN (BERAKSEN EMAS PERSIS SCREENSHOT IST) -->
                    <div class="rounded-r-2xl p-4 sm:p-5 my-3 shadow-xs" style="background-color: #FFF8E1; border-left: 5px solid #d97706;">
                        <div class="font-black text-slate-900 mb-1.5 flex items-center justify-between flex-wrap gap-2 text-sm sm:text-base">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-lightbulb text-amber-500 text-lg"></i>
                                <span>Cara Mengerjakan:</span>
                            </div>
                            <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <i class="fa-solid fa-key text-[10px]"></i> Kunci Jawaban: ${kunciText}
                            </span>
                        </div>
                        <p class="text-slate-800 leading-relaxed font-medium pl-6 text-xs sm:text-sm">
                            ${contoh.penjelasan}
                        </p>
                    </div>

                    <!-- 4. PILIHAN JAWABAN (KARTU GRID PERSIS IST) -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <label class="block text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                <i class="fa-solid fa-hand-pointer text-[#003865]"></i>
                                <span>PILIH JAWABAN (${contoh.pilihan.join(', ')}):</span>
                            </label>
                            <span class="text-[11px] text-slate-400 font-semibold">
                                ${subtesNo === 2 ? 'Pilih tepat 2 kotak' : 'Pilih 1 jawaban'}
                            </span>
                        </div>
                        <div class="grid ${optColsCount} gap-2 sm:gap-3">
                            ${opsiButtonsHtml}
                        </div>
                    </div>

                    <!-- Status Keterangan Jawaban Persis IST -->
                    <div class="rounded-xl p-3 border text-xs sm:text-sm flex items-start gap-2.5 ${isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'}">
                        <i class="fa-solid ${isCorrect ? 'fa-circle-check text-emerald-600' : 'fa-circle-exclamation text-amber-600'} text-base shrink-0 mt-0.5"></i>
                        <div>
                            ${isCorrect 
                                ? `<span class="font-extrabold">Hebat! Jawaban Anda Tepat.</span> Pilihan Anda sudah sesuai dengan pola penjelasan di atas.` 
                                : `<span class="font-extrabold">Pilihan belum tepat.</span> Jawaban yang benar untuk contoh ini adalah <strong>[${kunciText}]</strong>.`}
                        </div>
                    </div>

                    <!-- 5. TOMBOL AKSI CONTOH (LANGSUNG LANJUT KE CONTOH BERIKUTNYA / MULAI UJIAN UTAMA) -->
                    <div class="pt-3 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-100">
                        <button type="button" onclick="window.cfitEngine.renderPanduanSubtes(${subtesNo})" class="px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5">
                            <i class="fa-solid fa-arrow-left mr-1"></i> Panduan
                        </button>
                        <button type="button" onclick="window.cfitEngine.renderContohSubtes(${subtesNo}, ${contohIdx + 1})" class="px-8 py-3.5 bg-gradient-to-r from-[#003865] via-blue-700 to-[#003865] hover:from-[#002747] hover:to-[#083c6b] text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer rounded-xl">
                            <span>${contohIdx + 1 < contohList.length ? 'Contoh Berikutnya' : `Mulai Ujian Utama Subtes ${subtesNo}`}</span> <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Memilih jawaban latihan contoh
     */
    function pilihJawabanContoh(subtesNo, contohNo, opt, contohIdx) {
        const key = `${subtesNo}_${contohNo}`;
        if (subtesNo === 2) {
            let current = cfitState.contohAnswers[key] || [];
            if (!Array.isArray(current)) current = [];
            if (current.includes(opt)) {
                current = current.filter(x => x !== opt);
            } else {
                if (current.length >= 2) {
                    current.shift(); // Ganti pilihan tertua
                }
                current.push(opt);
            }
            cfitState.contohAnswers[key] = current.sort();
        } else {
            cfitState.contohAnswers[key] = opt;
        }
        renderContohSubtes(subtesNo, contohIdx);
    }

    function submitCekContoh(subtesNo, contohNo, contohIdx) {
        const key = `${subtesNo}_${contohNo}`;
        const ans = cfitState.contohAnswers[key];
        if (!ans || (subtesNo === 2 && (!Array.isArray(ans) || ans.length < 2))) {
            alertModal("Pilihan Belum Lengkap", subtesNo === 2 ? "Harap pilih tepat 2 (dua) kotak terlebih dahulu." : "Silakan pilih salah satu jawaban terlebih dahulu.");
            return;
        }
        cfitState.contohSubmitted[key] = true;
        renderContohSubtes(subtesNo, contohIdx);
    }

    function konfirmasiMulaiUjianUtama(subtesNo) {
        cfitState.fase = "CONTOH";
        cfitState.currentSubtesNo = subtesNo;
        try {
            localStorage.setItem('cfit_fase', 'CONTOH');
            localStorage.setItem('cfit_current_subtes', String(subtesNo));
            localStorage.setItem('cfit_current_contoh_idx', '99');
        } catch (e) {}

        const config = window.CFIT_CONFIG && window.CFIT_CONFIG.subtes && window.CFIT_CONFIG.subtes[subtesNo - 1];
        const container = document.getElementById('cfit-app-container');
        if (!container) return;

        container.innerHTML = `
            <div class="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 space-y-6 animate-fade-in">
                <div class="w-20 h-20 rounded-full bg-blue-50 text-[#003865] border-2 border-blue-200 flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
                    <i class="fa-solid fa-hourglass-start"></i>
                </div>
                <div>
                    <span class="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-[#003865] uppercase tracking-wider">LATIHAN SELESAI</span>
                    <h2 class="text-2xl font-black text-slate-800 mt-2">Mulai Ujian Utama Subtes ${subtesNo}</h2>
                    <p class="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        Sesi latihan telah selesai. Waktu ujian akan langsung berjalan mundur saat Anda mengklik tombol di bawah.
                    </p>
                </div>
                <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-left text-xs space-y-1.5 text-amber-900">
                    <p class="font-bold flex items-center gap-1.5"><i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Ketentuan Ujian:</p>
                    <p>&bull; Waktu: <strong>${Math.floor(config.waktuDetik / 60)} Menit ${config.waktuDetik % 60 ? (config.waktuDetik % 60) + ' Detik' : ''}</strong>.</p>
                    <p>&bull; Dilarang berpindah tab browser atau membuka aplikasi lain.</p>
                    <p>&bull; Foto pengawasan kamera akan diaktifkan secara otomatis.</p>
                </div>
                <div class="pt-2 flex flex-col gap-3">
                    <button type="button" onclick="window.cfitEngine.mulaiUjianUtama(${subtesNo})" class="w-full py-3.5 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-play"></i> <span>Mulai Ujian Sekarang</span>
                    </button>
                    <button type="button" onclick="window.cfitEngine.renderContohSubtes(${subtesNo}, 0)" class="w-full py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer">
                        <span>Ulangi Latihan Contoh</span>
                    </button>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 4. FASE UJIAN UTAMA (1 SOAL PER TAMPILAN & OPSI MENYAMPING)
    // =========================================================================
    function mulaiUjianUtama(subtesNo) {
        cfitState.fase = "UJIAN";
        cfitState.currentSubtesNo = subtesNo;
        cfitState.currentSoalIdx = 0;
        cfitState.isLocked = false;

        const config = window.CFIT_CONFIG && window.CFIT_CONFIG.subtes && window.CFIT_CONFIG.subtes[subtesNo - 1];
        cfitState.sisaWaktuDetik = config ? config.waktuDetik : 180;
        cfitState.targetTimestamp = Date.now() + (cfitState.sisaWaktuDetik * 1000);

        // Simpan status ujian aktif ke localStorage agar jika refresh tetap di soal ini
        try {
            localStorage.setItem('cfit_fase', 'UJIAN');
            localStorage.setItem('cfit_current_subtes', String(subtesNo));
            localStorage.setItem('cfit_current_soal_idx', '0');
            localStorage.setItem('cfit_subtes_end_time', String(cfitState.targetTimestamp));
        } catch (e) {}

        // Enforce Fullscreen persis seperti IST & PAPI
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        // Jepret Kamera Pengawasan Fase Awal
        ambilFotoPengawasan(subtesNo, 'Awal');

        // Jalankan Timer Ujian
        jalankanTimerUjian(subtesNo);

        // Render Soal Pertama
        renderSoalAktif();
    }

    function jalankanTimerUjian(subtesNo) {
        bersihkanTimer();

        const config = window.CFIT_CONFIG && window.CFIT_CONFIG.subtes && window.CFIT_CONFIG.subtes[subtesNo - 1];
        const totalDuration = config ? config.waktuDetik : 180;
        const midPoint = Math.floor(totalDuration / 2);

        cfitState.timerUjianId = setInterval(() => {
            const now = Date.now();
            const sisaMs = cfitState.targetTimestamp - now;
            cfitState.sisaWaktuDetik = Math.max(0, Math.ceil(sisaMs / 1000));

            updateTimerDisplay();

            // Jepret foto Tengah tepat di titik 50% waktu subtes (sekali per subtes)
            if (!cfitState.fotoTengahDone[subtesNo] && cfitState.sisaWaktuDetik <= midPoint) {
                cfitState.fotoTengahDone[subtesNo] = true;
                ambilFotoPengawasan(subtesNo, 'Tengah');
            }

            if (cfitState.sisaWaktuDetik <= 0) {
                bersihkanTimer();
                handleWaktuHabisSubtes(subtesNo);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerEl = document.getElementById('cfit-exam-timer');
        if (!timerEl) return;

        const m = Math.floor(cfitState.sisaWaktuDetik / 60);
        const s = cfitState.sisaWaktuDetik % 60;
        const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        timerEl.innerText = str;
        if (cfitState.sisaWaktuDetik <= 30) {
            timerEl.parentElement.className = "px-3.5 py-1.5 rounded-xl font-mono font-black text-xs bg-red-500/20 text-red-300 border border-red-500/40 flex items-center shadow-inner animate-pulse";
        }
    }

    function renderSoalAktif() {
        const subtesNo = cfitState.currentSubtesNo;
        const subtesKey = `subtes_${subtesNo}`;
        const questions = (window.CFIT_QUESTIONS && window.CFIT_QUESTIONS[subtesKey]) || [];
        const config = window.CFIT_CONFIG && window.CFIT_CONFIG.subtes && window.CFIT_CONFIG.subtes[subtesNo - 1];
        const container = document.getElementById('cfit-app-container');

        if (!container || questions.length === 0) return;

        const totalSoal = questions.length;
        const idx = Math.min(Math.max(0, cfitState.currentSoalIdx), totalSoal - 1);
        cfitState.currentSoalIdx = idx;

        const q = questions[idx];
        const userAns = cfitState.answers[subtesKey][q.no] || (subtesNo === 2 ? [] : null);

        // 1. OPSI MODEL KARTU GRID (PERSIS GAYA IST SUBTES 07/08)
        const optColsCount = (subtesNo === 1 || subtesNo === 3) ? 'grid-cols-6' : 'grid-cols-5';
        let opsiButtonsHtml = '';
        q.pilihan.forEach(opt => {
            const isSelected = subtesNo === 2
                ? (Array.isArray(userAns) && userAns.includes(opt))
                : (userAns === opt);

            const cardBorderCls = isSelected
                ? "border-[#003865] bg-[#edf3f9] text-[#003865] ring-2 ring-[#003865]/25 shadow-sm font-bold scale-[1.02]"
                : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700";

            const badgeLetterCls = isSelected
                ? "bg-[#003865] text-white font-black"
                : "bg-slate-100 text-slate-600 font-bold";

            opsiButtonsHtml += `
                <button type="button" onclick="window.cfitEngine.pilihJawabanUjian(${q.no}, '${opt}')"
                    class="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 ${cardBorderCls} cursor-pointer transition-all select-none shadow-xs hover:border-[#003865]">
                    <div class="flex items-center gap-1.5 mb-1">
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${badgeLetterCls} flex items-center justify-center text-xs sm:text-sm font-black shrink-0 transition-colors">
                            ${opt}
                        </span>
                        ${isSelected ? '<i class="fa-solid fa-check text-xs text-amber-500"></i>' : ''}
                    </div>
                    <span class="text-[11px] sm:text-xs font-semibold text-center ${isSelected ? 'text-[#003865] font-black' : 'text-slate-600'}">Pilihan ${opt}</span>
                </button>
            `;
        });

        // 2. PALET NOMOR NAVIGASI DI ATAS (GRID SIMETRIS 2 BARIS PERSIS IST)
        const colsCount = subtesNo === 4 ? 5 : 7;
        let paletHtml = '';
        let totalTerisi = 0;
        questions.forEach((item, qIdx) => {
            const isAnswered = subtesNo === 2
                ? (Array.isArray(cfitState.answers[subtesKey][item.no]) && cfitState.answers[subtesKey][item.no].length === 2)
                : (cfitState.answers[subtesKey][item.no] !== undefined && cfitState.answers[subtesKey][item.no] !== null && cfitState.answers[subtesKey][item.no] !== '');

            if (isAnswered) totalTerisi++;
            const isCurrent = qIdx === idx;

            let btnCls = "h-8 sm:h-9 w-full rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all border cursor-pointer ";
            if (isCurrent) {
                btnCls += "bg-[#003865] text-white border-[#003865] ring-2 ring-[#003865]/30 shadow-sm scale-[1.04] font-black";
            } else if (isAnswered) {
                btnCls += "bg-emerald-50 text-emerald-800 border-emerald-300 font-black hover:bg-emerald-100";
            } else {
                btnCls += "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300";
            }

            paletHtml += `
                <button type="button" onclick="window.cfitEngine.lompatKeSoal(${qIdx})" class="${btnCls}" title="Soal Nomor ${item.no}">
                    ${item.no}
                </button>
            `;
        });

        // 3. BADGE STATUS JAWABAN SUBTES
        let badgeStatusSubtes = '';
        if (subtesNo === 2) {
            const selCount = Array.isArray(userAns) ? userAns.length : 0;
            if (selCount === 2) {
                badgeStatusSubtes = `<span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full"><i class="fa-solid fa-circle-check mr-1 text-emerald-600"></i>2 Kotak Terpilih: [${userAns.join(', ')}]</span>`;
            } else if (selCount === 1) {
                badgeStatusSubtes = `<span class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full"><i class="fa-solid fa-circle-info mr-1 text-amber-600"></i>Pilih 1 Kotak Lagi (${selCount}/2)</span>`;
            } else {
                badgeStatusSubtes = `<span class="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full"><i class="fa-solid fa-circle-exclamation mr-1 text-amber-600"></i>Wajib Pilih Tepat 2 Kotak</span>`;
            }
        } else {
            badgeStatusSubtes = userAns 
                ? `<span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full"><i class="fa-solid fa-circle-check mr-1 text-emerald-600"></i>Sudah Dijawab: [${userAns}]</span>`
                : `<span class="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">Belum Dijawab</span>`;
        }

        const m = Math.floor(cfitState.sisaWaktuDetik / 60);
        const s = cfitState.sisaWaktuDetik % 60;
        const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        container.innerHTML = `
            <div class="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-[#b9d0e7] overflow-hidden animate-fade-in pb-5">
                <!-- TOP HEADER BAR: Nama Subtes, Sisa Waktu, & Progres (Gaya MSDT) -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#0a4980] px-5 sm:px-6 py-3.5 text-white flex items-center justify-between gap-3 border-b border-blue-400/20">
                    <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-xl bg-amber-400 text-[#051627] flex items-center justify-center font-black text-xs shadow">
                            ${subtesNo}
                        </span>
                        <div>
                            <span class="text-[10px] uppercase font-bold text-sky-200 block">SUBTES ${subtesNo} OF 4</span>
                            <h3 class="text-sm sm:text-base font-black text-white leading-tight">${config ? config.nama.split(':')[1] || config.nama : `Subtes ${subtesNo}`}</h3>
                        </div>
                    </div>

                    <!-- Visual Timer Hitung Mundur -->
                    <div class="px-3.5 py-1.5 rounded-xl font-mono font-black text-xs bg-[#003865] text-white border border-blue-400/30 flex items-center shadow-inner">
                        <i class="fa-solid fa-stopwatch mr-1.5 text-amber-400"></i>
                        <span id="cfit-exam-timer">${timeStr}</span>
                    </div>
                </div>

                <!-- PALET NOMOR SOAL DI ATAS (GRID 2 BARIS SIMETRIS PERSIS IST) -->
                <div class="bg-slate-50/90 border-b border-slate-200 px-5 sm:px-6 py-2.5">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <i class="fa-solid fa-table-cells text-[#003865] text-sm"></i>
                            <span>PALET NOMOR SOAL:</span>
                        </span>
                        <span class="text-xs font-bold text-[#003865] bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                            ${totalTerisi} / ${totalSoal} Terjawab
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(${colsCount}, minmax(0, 1fr)); gap: 6px;">
                        ${paletHtml}
                    </div>
                </div>

                <!-- KONTEN LEMBAR SOAL AKTIF (ZERO SCROLL ERGONOMIS) -->
                <div class="p-4 sm:p-6 space-y-3.5">
                    <!-- Bar Status Nomor Soal & Badge Jawaban -->
                    <div class="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                        <span class="text-sm sm:text-base font-black uppercase tracking-wider text-[#003865] flex items-center gap-2">
                            <span class="w-8 h-8 rounded-xl bg-[#003865] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                                ${q.no}
                            </span>
                            <span>SOAL NOMOR ${q.no} DARI ${totalSoal}</span>
                        </span>
                        <div>
                            ${badgeStatusSubtes}
                        </div>
                    </div>

                    <!-- KOTAK GAMBAR SOAL BERUKURAN PROPORSIONAL & JELAS -->
                    <div class="bg-white rounded-2xl border border-slate-200 p-3 sm:p-3.5 shadow-2xs">
                        <div class="text-xs font-black uppercase tracking-wider text-[#003865] flex items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-shapes text-amber-500"></i>
                                <span>${subtesNo === 1 ? 'POLA DERET BENTUK GEOMETRI:' : subtesNo === 2 ? 'KLASIFIKASI KELOMPOK GAMBAR:' : subtesNo === 3 ? 'MATRIKS BENTUK YANG HARUS DILENGKAPI:' : 'HUBUNGAN POLA DAN POSISI TITIK:'}</span>
                            </div>
                            <span class="text-[11px] text-slate-400 font-semibold hidden sm:inline">Perhatikan gambar secara saksama</span>
                        </div>
                        <div class="flex justify-center items-center p-3 sm:p-4 bg-[#fafcff] rounded-xl border border-slate-100 overflow-x-auto min-h-[150px] sm:min-h-[180px]">
                            <img src="${encodeURI(q.gambarSoal)}" alt="Soal ${q.no}" class="w-full max-w-[740px] h-auto object-contain mx-auto rounded select-none" style="max-height: 230px; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" draggable="false" onerror="this.onerror=null; this.src='assets/logo/logo%20altrak.jpeg';">
                        </div>
                    </div>

                    <!-- PILIHAN JAWABAN (KARTU GRID PERSIS IST) -->
                    <div class="space-y-1.5 pt-1">
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <i class="fa-solid fa-hand-pointer text-[#003865]"></i>
                                <span>PILIH JAWABAN (${q.pilihan.join(', ')}):</span>
                            </label>
                            <span class="text-[11px] font-bold text-slate-500">
                                ${subtesNo === 2 ? 'Wajib pilih 2 kotak' : 'Pilih 1 jawaban'}
                            </span>
                        </div>
                        <div class="grid ${optColsCount} gap-2 sm:gap-3">
                            ${opsiButtonsHtml}
                        </div>
                    </div>

                    <!-- NAVIGASI SEBELUMNYA / SELANJUTNYA -->
                    <div class="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
                        <button type="button" onclick="window.cfitEngine.soalSebelumnya()" ${idx === 0 ? 'disabled class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-300 font-bold text-xs cursor-not-allowed"' : 'class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs"'}>
                            <i class="fa-solid fa-arrow-left mr-1.5"></i> Sebelumnya
                        </button>

                        <div class="text-xs font-bold text-slate-400">
                            ${idx + 1} / ${totalSoal}
                        </div>

                        ${idx < totalSoal - 1 ? `
                            <button type="button" onclick="window.cfitEngine.soalSelanjutnya()" class="px-6 py-2.5 bg-[#003865] hover:bg-[#0a4980] text-white font-black text-xs transition cursor-pointer shadow-sm rounded-xl">
                                <span>Selanjutnya</span> <i class="fa-solid fa-arrow-right ml-1.5"></i>
                            </button>
                        ` : `
                            <button type="button" onclick="window.cfitEngine.konfirmasiSelesaiSubtes(${subtesNo})" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-md rounded-xl">
                                <i class="fa-solid fa-check mr-1.5"></i> <span>Selesai Subtes ${subtesNo}</span>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Memilih jawaban soal ujian
     */
    function pilihJawabanUjian(qNo, opt) {
        if (cfitState.isLocked) return;
        const subtesNo = cfitState.currentSubtesNo;
        const subtesKey = `subtes_${subtesNo}`;

        if (subtesNo === 2) {
            let current = cfitState.answers[subtesKey][qNo] || [];
            if (!Array.isArray(current)) current = [];
            if (current.includes(opt)) {
                current = current.filter(x => x !== opt);
            } else {
                if (current.length >= 2) {
                    current.shift(); // Geser pilihan
                }
                current.push(opt);
            }
            cfitState.answers[subtesKey][qNo] = current.sort();
        } else {
            cfitState.answers[subtesKey][qNo] = opt;
        }

        // Simpan sementara di local storage untuk perlindungan jika refresh
        try {
            localStorage.setItem('cfit_draft_answers', JSON.stringify(cfitState.answers));
            localStorage.setItem('cfit_current_soal_idx', String(cfitState.currentSoalIdx));
        } catch (e) {}

        renderSoalAktif();
    }

    function soalSebelumnya() {
        if (cfitState.currentSoalIdx > 0) {
            cfitState.currentSoalIdx--;
            try {
                localStorage.setItem('cfit_current_soal_idx', String(cfitState.currentSoalIdx));
            } catch (e) {}
            renderSoalAktif();
        }
    }

    function soalSelanjutnya() {
        const subtesKey = `subtes_${cfitState.currentSubtesNo}`;
        const questions = (window.CFIT_QUESTIONS && window.CFIT_QUESTIONS[subtesKey]) || [];
        if (cfitState.currentSoalIdx < questions.length - 1) {
            cfitState.currentSoalIdx++;
            try {
                localStorage.setItem('cfit_current_soal_idx', String(cfitState.currentSoalIdx));
            } catch (e) {}
            renderSoalAktif();
        }
    }

    function lompatKeSoal(targetIdx) {
        cfitState.currentSoalIdx = targetIdx;
        try {
            localStorage.setItem('cfit_current_soal_idx', String(cfitState.currentSoalIdx));
        } catch (e) {}
        renderSoalAktif();
    }

    // =========================================================================
    // 5. PENANGANAN WAKTU HABIS & PINDAH SUBTES
    // =========================================================================
    function handleWaktuHabisSubtes(subtesNo) {
        cfitState.isLocked = true;
        kunciSubtesSelesai(subtesNo);

        alertModal(
            `Waktu Subtes ${subtesNo} Habis`,
            `Waktu pengerjaan Subtes ${subtesNo} telah selesai. Sistem secara otomatis mengunci lembar jawaban dan memindahkan Anda ke tahap berikutnya.`,
            () => {
                if (subtesNo < 4) {
                    pilihSubtes(subtesNo + 1);
                } else {
                    selesaiSeluruhCfit();
                }
            }
        );
    }

    function konfirmasiSelesaiSubtes(subtesNo) {
        const subtesKey = `subtes_${subtesNo}`;
        const questions = (window.CFIT_QUESTIONS && window.CFIT_QUESTIONS[subtesKey]) || [];
        const ansObj = cfitState.answers[subtesKey] || {};
        let totalTerisi = 0;
        if (subtesNo === 2) {
            totalTerisi = Object.values(ansObj).filter(v => Array.isArray(v) && v.length === 2).length;
        } else {
            totalTerisi = Object.values(ansObj).filter(v => v !== undefined && v !== null && v !== '').length;
        }
        const totalSoal = questions.length;

        const eksekusiSelesai = () => {
            cfitState.isLocked = true;
            kunciSubtesSelesai(subtesNo);

            if (subtesNo < 4) {
                pilihSubtes(subtesNo + 1);
            } else {
                selesaiSeluruhCfit();
            }
        };

        if (totalTerisi < totalSoal) {
            const pesan = `Anda baru menjawab ${totalTerisi} dari ${totalSoal} soal.\n\nApakah Anda yakin ingin menyelesaikan Subtes ${subtesNo} sekarang? Jawaban yang dikunci tidak dapat diubah kembali.`;
            if (typeof customAlert === 'function') {
                customAlert(
                    `Selesaikan Subtes ${subtesNo}?`,
                    pesan,
                    'warning',
                    true,
                    () => { eksekusiSelesai(); }
                );
            } else if (confirm(pesan)) {
                eksekusiSelesai();
            }
        } else {
            const pesan = `Anda telah melengkapi seluruh ${totalSoal} soal Subtes ${subtesNo}. Apakah Anda yakin ingin mengunci lembar jawaban dan melanjutkan?`;
            if (typeof customAlert === 'function') {
                customAlert(
                    `Kunci Jawaban Subtes ${subtesNo}?`,
                    pesan,
                    'info',
                    true,
                    () => { eksekusiSelesai(); }
                );
            } else if (confirm(pesan)) {
                eksekusiSelesai();
            }
        }
    }

    function kunciSubtesSelesai(subtesNo) {
        const noStr = String(subtesNo).padStart(2, '0');
        if (!cfitState.completedSubtests.includes(noStr)) {
            cfitState.completedSubtests.push(noStr);
        }

        // Jepret foto fase Akhir subtes
        ambilFotoPengawasan(subtesNo, 'Akhir');

        try {
            localStorage.setItem('cfit_completed_subtests', JSON.stringify(cfitState.completedSubtests));
            localStorage.removeItem('cfit_subtes_end_time');
            localStorage.setItem('cfit_fase', 'MENU');
            localStorage.setItem('cfit_current_soal_idx', '0');
        } catch (e) {}
    }

    // =========================================================================
    // 6. PENILAIAN AKHIR & PENYIMPANAN DATA AMAN KE DATABASE
    // =========================================================================
    async function selesaiSeluruhCfit() {
        cfitState.fase = "SELESAI";
        bersihkanTimer();

        // Jepret Foto Akhir Pengawasan Seluruh CFIT
        ambilFotoPengawasan(4, 'Akhir');

        // Kirim jawaban ke database Supabase untuk dinilai secara aman di sisi server via RPC
        await simpanHasilCfitKeDatabase();

        // Kunci status selesai di Tahap 2 & bersihkan session draft
        try {
            localStorage.setItem('cfit_selesai', 'true');
            localStorage.removeItem('cfit_subtes_end_time');
            localStorage.removeItem('cfit_fase');
            localStorage.removeItem('cfit_current_subtes');
            localStorage.removeItem('cfit_current_soal_idx');
            localStorage.removeItem('cfit_current_contoh_idx');
            if (window.tahap2State && window.tahap2State.modulSelesai) {
                window.tahap2State.modulSelesai.cfit = true;
            }
        } catch (e) {}

        // Tampilkan Layar Selesai (tanpa membocorkan kunci/skor ke layar peserta)
        renderLayarSelesai();
    }

    /**
     * Mengirimkan jawaban peserta ke fungsi Supabase RPC 'hitung_skor_cfit'
     * Evaluasi kecocokan kunci jawaban, kalkulasi skor mentah (RS), konversi norma IQ,
     * dan klasifikasi kategori kecerdasan dilakukan aman 100% di sisi database server.
     */
    async function simpanHasilCfitKeDatabase() {
        console.log("[CFIT Engine] Menyimpan & mengevaluasi jawaban CFIT via Server Supabase RPC...");
        const idPeserta = (typeof state !== 'undefined' && state.user && state.user.id)
            || localStorage.getItem('id_peserta')
            || localStorage.getItem('email_peserta')
            || '';

        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
            ? supabaseClient
            : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.rpc === 'function') ? window.supabase : null);

        let rpcSuccess = false;

        if (sb && typeof sb.rpc === 'function' && idPeserta) {
            try {
                // 1. Coba nama fungsi resmi di Supabase: hitung_dan_simpan_cfit
                let res = await sb.rpc('hitung_dan_simpan_cfit', {
                    p_id_peserta: String(idPeserta),
                    p_jawaban: cfitState.answers
                });

                // 2. Fallback jika nama fungsi terdaftar sebagai hitung_skor_cfit
                if (res.error) {
                    const fallbackRes = await sb.rpc('hitung_skor_cfit', {
                        p_id_peserta: String(idPeserta),
                        p_jawaban: cfitState.answers,
                        p_pelanggaran_tab: cfitState.pelanggaranTab || 0
                    });
                    if (!fallbackRes.error) {
                        res = fallbackRes;
                    }
                }

                if (!res.error) {
                    rpcSuccess = true;
                    console.log("[CFIT Engine] Penilaian server berhasil:", res.data);
                } else {
                    console.warn("[CFIT Engine] Error Supabase RPC CFIT:", res.error.message || res.error);
                }
            } catch (errRpc) {
                console.warn("[CFIT Engine] Exception saat memanggil RPC:", errRpc);
            }
        }

        // Cadangan offline / Fallback (Zero Data Loss) jika jaringan server terganggu
        if (!rpcSuccess) {
            const backupPayload = {
                status: 'selesai',
                modul: 'CFIT (Culture Fair Intelligence Test - Skala 3)',
                answers: cfitState.answers,
                pelanggaran_tab_switch: cfitState.pelanggaranTab || 0,
                waktu_submit: new Date().toISOString()
            };
            try {
                if (typeof window.updateHasilTes === 'function') {
                    await window.updateHasilTes('hasil_cfit', backupPayload);
                } else {
                    localStorage.setItem('cadangan_hasil_cfit', JSON.stringify(backupPayload));
                }
            } catch (eFallback) {
                console.warn("[CFIT Engine] Gagal menyimpan cadangan:", eFallback);
                localStorage.setItem('cadangan_hasil_cfit', JSON.stringify(backupPayload));
            }
        }
    }

    function renderLayarSelesai(hasil) {
        const container = document.getElementById('cfit-app-container');
        if (!container) return;

        container.innerHTML = `
            <div class="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-[#b9d0e7] overflow-hidden text-center p-8 space-y-6 animate-fade-in">
                <div class="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">MODUL SELESAI</span>
                    <h2 class="text-2xl font-black text-slate-800 mt-2">Tes CFIT Telah Selesai</h2>
                    <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                        Seluruh jawaban 4 subtes Anda telah berhasil disimpan dan dikirim ke server asesmen PT Altrak 1978.
                    </p>
                </div>
                <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs text-slate-700">
                    <div class="flex justify-between border-b border-slate-200 pb-2">
                        <span class="text-slate-500">Jumlah Subtes Selesai:</span>
                        <span class="font-bold text-[#003865]">4 dari 4 Subtes</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-200 pb-2">
                        <span class="text-slate-500">Status Penyimpanan:</span>
                        <span class="font-bold text-emerald-600 flex items-center gap-1"><i class="fa-solid fa-check"></i> Tersimpan di Database</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500">Pengawasan Kamera:</span>
                        <span class="font-bold text-slate-800">3 Foto Terekam</span>
                    </div>
                </div>
                <div class="pt-2">
                    <button type="button" onclick="if(typeof bukaDashboardTahap2==='function'){bukaDashboardTahap2();}else if(typeof pindahFase==='function'){pindahFase('view-dashboard-tahap2');}else{window.location.reload();}" class="w-full py-4 bg-gradient-to-r from-[#003865] via-blue-700 to-[#003865] hover:from-[#002747] hover:to-[#083c6b] text-white font-black rounded-xl shadow-lg hover:shadow-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Kembali ke Dashboard Asesmen Tahap 2</span>
                    </button>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 7. KEAMANAN & KAMERA PENGAWASAN
    // =========================================================================
    let lastTabSwitchTime = 0;
    function pasangDeteksiPindahTab() {
        const handler = () => {
            if (cfitState.fase !== "UJIAN") return;
            if (document.visibilityState === 'hidden') {
                const now = Date.now();
                if (now - lastTabSwitchTime < 1500) return; // Debounce 1.5 detik
                lastTabSwitchTime = now;

                cfitState.pelanggaranTab++;
                const count = cfitState.pelanggaranTab;
                try {
                    localStorage.setItem('cfit_pelanggaran_tab', String(count));
                } catch (e) {}

                // Ambil foto pengawasan bukti pelanggaran tab
                ambilFotoPengawasan(cfitState.currentSubtesNo, `Pelanggaran-${count}`);

                let msg = `Peringatan ke-${count}! Anda terdeteksi meninggalkan tab/jendela ujian. Harap tetap berada di halaman tes demi integritas asesmen PT Altrak 1978.`;
                if (count >= cfitState.toleransiTab) {
                    msg = `PERINGATAN TERAKHIR (${count}x)! Toleransi perpindahan tab telah terlampaui. Sesi tes CFIT Anda dihentikan dan jawaban dikirimkan secara otomatis ke server demi integritas tes.`;
                    alertModal(`Pelanggaran Integritas (${count}x)`, msg, () => {
                        selesaiSeluruhCfit();
                    });
                    return;
                }

                alertModal(`Peringatan Integritas (${count}x)`, msg);
            }
        };

        document.removeEventListener('visibilitychange', handler);
        document.addEventListener('visibilitychange', handler);
    }

    function ambilFotoPengawasan(subtesNo, fase = 'Awal') {
        if (typeof window.jepretDanUpload !== 'function') return;
        let identifier = '';
        try {
            if (typeof state !== 'undefined' && state.user) {
                identifier = state.user.phone || state.user.email || '';
            }
            if (!identifier && typeof localStorage !== 'undefined') {
                identifier = localStorage.getItem('phone_peserta') || localStorage.getItem('email_peserta') || '';
            }
        } catch (e) {}
        if (!identifier) identifier = 'kandidat';

        try {
            window.jepretDanUpload(identifier, 'CFIT', `Subtes-${subtesNo}`, fase);
        } catch (e) {
            console.warn("[CFIT Engine] Error kamera:", e);
        }
    }

    function bersihkanTimer() {
        if (cfitState.timerUjianId) {
            clearInterval(cfitState.timerUjianId);
            cfitState.timerUjianId = null;
        }
    }

    function alertModal(title, msg, onOk) {
        if (typeof customAlert === 'function') {
            customAlert(title, msg, 'warning', false, onOk);
        } else if (window.istUI && typeof window.istUI.showModal === 'function') {
            window.istUI.showModal({
                title,
                message: msg,
                type: 'warning',
                onOk
            });
        } else {
            alert(`${title}\n\n${msg}`);
            if (typeof onOk === 'function') onOk();
        }
    }

    // Ekspor API CFIT
    window.cfitEngine = {
        init: initCfit,
        start: startCfitTest,
        renderMenu4Subtes,
        pilihSubtes,
        renderPanduanSubtes,
        renderContohSubtes,
        pilihJawabanContoh,
        submitCekContoh,
        mulaiUjianUtama,
        pilihJawabanUjian,
        soalSebelumnya,
        soalSelanjutnya,
        lompatKeSoal,
        konfirmasiSelesaiSubtes,
        selesaiSeluruhCfit
    };

    window.startCfitTest = startCfitTest;
})();
