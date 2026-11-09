// =========================================================================
// MODUL LOGIKA & TAMPILAN: INTELEGENT 3
// PT Altrak 1978 - Leadership & Management Assessment System
// 2 Subtes Penalaran Logika Abstrak & Matriks Non-Verbal
// Standar Keamanan: Webcam Proctoring, Anti Tab-Switch, Safe Merge Supabase
// ATURAN MUTLAK: Layar Peserta HANYA menampilkan nama "Intelegent 3"
// =========================================================================

(function () {
    'use strict';

    // State Intelegent 3
    const apmState = {
        fase: "MENU", // "MENU" | "PANDUAN" | "UJIAN" | "SELESAI"
        currentSubtesNo: 1, // 1 atau 2
        currentSoalIdx: 0,  // Indeks soal aktif (0-indexed)
        completedSubtests: [], // ['01', '02']

        // Jawaban peserta pada ujian utama
        // subtes_1: { 1: "3", 2: "7" }, subtes_2: { 1: "8" }
        answers: {
            subtes_1: {},
            subtes_2: {}
        },

        // Status ragu-ragu
        flagged: {
            subtes_1: {},
            subtes_2: {}
        },

        // Timer
        timerUjianId: null,
        sisaWaktuDetik: 0,
        targetTimestamp: null,

        // Tracking Foto Pengawasan Kamera Midpoint (Tengah)
        fotoTengahDone: { 1: false, 2: false },

        // Keamanan Anti-Cheat
        pelanggaranTab: 0,
        toleransiTab: 3,
        isLocked: false
    };

    // Auto-Restore Progress saat refresh (ZERO RESET & ZERO WHITE SCREEN)
    function initApm() {
        try {
            const savedCompleted = localStorage.getItem('altrak_apm_completed_subtests');
            if (savedCompleted) {
                apmState.completedSubtests = JSON.parse(savedCompleted);
            }

            const ans1 = localStorage.getItem('altrak_apm_answers_subtes_01');
            if (ans1) apmState.answers.subtes_1 = JSON.parse(ans1);

            const ans2 = localStorage.getItem('altrak_apm_answers_subtes_02');
            if (ans2) apmState.answers.subtes_2 = JSON.parse(ans2);

            const flag1 = localStorage.getItem('altrak_apm_flagged_subtes_01');
            if (flag1) apmState.flagged.subtes_1 = JSON.parse(flag1);

            const flag2 = localStorage.getItem('altrak_apm_flagged_subtes_02');
            if (flag2) apmState.flagged.subtes_2 = JSON.parse(flag2);

            const savedViolations = localStorage.getItem('altrak_apm_pelanggaran_tab');
            if (savedViolations) apmState.pelanggaranTab = parseInt(savedViolations, 10) || 0;
        } catch (e) {
            console.warn('[Intelegent 3] Gagal me-restore state lokal:', e);
        }

        // 1. Jika seluruh ujian Intelegent 3 sudah selesai
        if (localStorage.getItem('apm_selesai') === 'true' ||
           (apmState.completedSubtests.includes('01') && apmState.completedSubtests.includes('02'))) {
            apmState.fase = "MENU";
            renderMenu2Subtes();
            return;
        }

        // 2. AUTO-RESTORE STATUS SESI SEBELUM REFRESH (KEMBALI KE SOAL AKTIF & TIMER)
        const savedFase = localStorage.getItem('altrak_apm_fase');
        const savedSubtes = parseInt(localStorage.getItem('altrak_apm_current_subtes'), 10);
        const savedSoalIdx = parseInt(localStorage.getItem('altrak_apm_current_soal_idx'), 10) || 0;
        const savedEndTime = parseInt(localStorage.getItem('altrak_apm_subtes_end_time'), 10);

        if (savedFase === 'UJIAN' && (savedSubtes === 1 || savedSubtes === 2)) {
            const now = Date.now();
            if (savedEndTime && savedEndTime > now) {
                console.log(`[Intelegent 3] Auto-Restore: Melanjutkan Subtes ${savedSubtes} Soal #${savedSoalIdx + 1} dengan sisa waktu berjalan...`);
                apmState.fase = "UJIAN";
                apmState.currentSubtesNo = savedSubtes;
                apmState.currentSoalIdx = savedSoalIdx;
                apmState.targetTimestamp = savedEndTime;
                apmState.sisaWaktuDetik = Math.max(0, Math.round((savedEndTime - now) / 1000));

                // Langsung render halaman soal aktif
                renderHalamanUjian();

                // Mulai timer hitung mundur
                bersihkanTimer();
                const subtesData = (window.APM_CONFIG && window.APM_CONFIG.subtes && window.APM_CONFIG.subtes[savedSubtes - 1]) || {};
                apmState.timerUjianId = setInterval(() => {
                    const sisa = Math.max(0, Math.round((apmState.targetTimestamp - Date.now()) / 1000));
                    apmState.sisaWaktuDetik = sisa;
                    updateDisplayTimer(sisa, subtesData.waktuDetik || 420);

                    const separuhWaktu = Math.floor((subtesData.waktuDetik || 420) / 2);
                    if (!apmState.fotoTengahDone[savedSubtes] && sisa <= separuhWaktu) {
                        apmState.fotoTengahDone[savedSubtes] = true;
                        ambilFotoPengawasan(savedSubtes, 'Tengah');
                    }

                    if (sisa <= 0) {
                        bersihkanTimer();
                        alertModal(
                            "Waktu Pengerjaan Intelegent 3 Selesai",
                            `Waktu pengerjaan untuk Subtes ${savedSubtes} telah habis. Lembar jawaban Anda telah otomatis dikunci dan tersimpan ke sistem.`,
                            () => {
                                selesaiSubtes(savedSubtes, true);
                            }
                        );
                    }
                }, 1000);

                preloadNextImages(savedSubtes, savedSoalIdx, 3);
                return;
            } else if (savedEndTime && savedEndTime <= now) {
                console.log(`[Intelegent 3] Waktu Subtes ${savedSubtes} telah habis saat refresh. Otomatis menyelesaikan subtes.`);
                selesaiSubtes(savedSubtes, true);
                return;
            }
        } else if (savedFase === 'PANDUAN' && (savedSubtes === 1 || savedSubtes === 2)) {
            apmState.fase = "PANDUAN";
            apmState.currentSubtesNo = savedSubtes;
            renderPanduanSubtes(savedSubtes);
            return;
        }

        // Tampilkan Menu 2 Subtes jika tidak sedang dalam sesi aktif
        renderMenu2Subtes();
    }

    function simpanStateLokal(subtesNo) {
        try {
            const no = subtesNo || apmState.currentSubtesNo || 1;
            const code = String(no).padStart(2, '0');
            const keySub = `subtes_${no}`;
            localStorage.setItem(`altrak_apm_answers_subtes_${code}`, JSON.stringify(apmState.answers[keySub] || {}));
            localStorage.setItem(`altrak_apm_flagged_subtes_${code}`, JSON.stringify(apmState.flagged[keySub] || {}));
            localStorage.setItem('altrak_apm_completed_subtests', JSON.stringify(apmState.completedSubtests));
            localStorage.setItem('altrak_apm_fase', apmState.fase);
            localStorage.setItem('altrak_apm_current_subtes', String(apmState.currentSubtesNo));
            localStorage.setItem('altrak_apm_current_soal_idx', String(apmState.currentSoalIdx));
            if (apmState.targetTimestamp) {
                localStorage.setItem('altrak_apm_subtes_end_time', String(apmState.targetTimestamp));
            }
        } catch (e) {}
    }

    /**
     * Memulai modul Intelegent 3 dari Dashboard Asesmen
     */
    function startApmTest() {
        console.log("[Intelegent 3] Masuk ke modul Intelegent 3...");
        const viewApm = document.getElementById('view-apm');
        if (viewApm) {
            viewApm.classList.remove('hide-section');
            viewApm.style.display = 'flex';
        }
        if (typeof pindahFase === 'function') {
            pindahFase('view-apm');
        } else if (typeof showPage === 'function') {
            showPage('view-apm');
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        initApm();
    }

    // =========================================================================
    // 1. MENU UTAMA 2 SUBTES INTELEGENT 3
    // =========================================================================
    function renderMenu2Subtes() {
        apmState.fase = "MENU";
        bersihkanTimer();
        try {
            localStorage.setItem('altrak_apm_fase', 'MENU');
            localStorage.removeItem('altrak_apm_subtes_end_time');
            localStorage.removeItem('altrak_apm_current_soal_idx');
        } catch (e) {}

        const container = document.getElementById('apm-app-container');
        if (!container) return;

        const subtesList = (window.APM_CONFIG && window.APM_CONFIG.subtes) || [];
        const totalSelesai = apmState.completedSubtests.length;

        let cardsHtml = '';
        subtesList.forEach((sub) => {
            const noInt = sub.no;
            const noStr = String(noInt).padStart(2, '0');
            const isCompleted = apmState.completedSubtests.includes(noStr);
            const isPrevCompleted = noInt === 1 || apmState.completedSubtests.includes(String(noInt - 1).padStart(2, '0'));
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
                    <button type="button" onclick="window.apmEngine.pilihSubtes(${noInt})" class="w-full py-3.5 bg-gradient-to-r from-[#003865] via-blue-700 to-[#003865] hover:from-[#002747] hover:to-[#083c6b] text-white font-black rounded-xl text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer">
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
                            <span class="text-[11px] font-black uppercase tracking-wider text-slate-400">BAGIAN ${noStr} / 02</span>
                            ${badgeHtml}
                        </div>
                        <h3 class="text-base sm:text-lg font-black text-slate-900 mb-4">${sub.nama}</h3>
                    </div>
                    <div class="pt-4 border-t border-slate-100">
                        <div class="grid grid-cols-2 gap-2 text-xs mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div>
                                <span class="text-slate-400 block text-[10px] uppercase font-bold">Jumlah Soal</span>
                                <span class="font-bold text-slate-800">${sub.totalSoal} Soal</span>
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
                <!-- Header Banner Menu -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#0a4980] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-400/20 relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 rounded-2xl bg-white/10 text-amber-400 border border-white/20 flex items-center justify-center text-3xl font-black shadow-inner shrink-0">
                                <i class="fa-solid fa-cubes"></i>
                            </div>
                            <div>
                                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest mb-1.5">
                                    <i class="fa-solid fa-crown text-amber-400"></i> Asesmen Kemampuan Analitik
                                </div>
                                <h1 class="text-xl sm:text-3xl font-black text-white leading-tight">
                                    Inteligensi 3
                                </h1>
                                <p class="text-xs sm:text-sm text-slate-200 mt-1">
                                    Tes terdiri dari <strong>2 bagian subtes</strong> yang wajib dikerjakan secara berurutan.
                                </p>
                            </div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center sm:text-right shrink-0">
                            <div class="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Progres Pengerjaan</div>
                            <div class="text-2xl font-black text-[#ffbe1a] mt-0.5">${totalSelesai} / 2 Selesai</div>
                        </div>
                    </div>
                </div>

                <!-- Grid 2 Kartu Subtes -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    ${cardsHtml}
                </div>
            </div>
        `;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function pilihSubtes(subtesNo) {
        apmState.currentSubtesNo = Number(subtesNo);
        apmState.fase = "PANDUAN";
        simpanStateLokal(apmState.currentSubtesNo);
        renderPanduanSubtes(apmState.currentSubtesNo);
    }

    // =========================================================================
    // 2. HALAMAN PANDUAN SUBTES (TANPA CONTOH SOAL -> LANGSUNG UJIAN)
    // =========================================================================
    function renderPanduanSubtes(subtesNo) {
        apmState.fase = "PANDUAN";
        bersihkanTimer();

        const container = document.getElementById('apm-app-container');
        if (!container) return;

        const subtesData = (window.APM_CONFIG && window.APM_CONFIG.subtes && window.APM_CONFIG.subtes[subtesNo - 1]) || {};
        const menit = Math.floor((subtesData.waktuDetik || 420) / 60);

        container.innerHTML = `
            <div class="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in pb-12">
                <!-- Header Card Panduan -->
                <div class="bg-gradient-to-r from-[#003865] via-[#0a4980] to-[#003865] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-400/30">
                    <div class="flex items-center justify-between gap-3 mb-2">
                        <span class="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300">
                            PANDUAN RESMI
                        </span>
                        <span class="text-xs font-bold text-slate-200">Bagian 0${subtesNo} / 02</span>
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">${subtesData.nama || 'Subtes ' + subtesNo}</h2>
                    <p class="text-xs sm:text-sm text-slate-200 mt-2">Harap baca petunjuk pengerjaan di bawah ini dengan seksama sebelum memulai.</p>
                </div>

                <!-- Isi Petunjuk Pengerjaan (Lega & Berestetika Tinggi) -->
                <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md flex flex-col gap-6 sm:gap-7 text-slate-700">
                    <!-- Box 1: Petunjuk Cara Menjawab -->
                    <div class="p-5 sm:p-6 rounded-2xl bg-blue-50/60 border border-blue-200/80 shadow-xs">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-9 h-9 rounded-xl bg-[#003865] text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                                <i class="fa-solid fa-circle-info"></i>
                            </div>
                            <h4 class="font-bold text-[#003865] text-sm sm:text-base">Petunjuk Cara Menjawab:</h4>
                        </div>
                        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mb-3.5">
                            ${subtesData.petunjuk || 'Perhatikan pola gambar yang tersedia, lalu pilihlah satu jawaban yang paling tepat dari pilihan 1 sampai 8.'}
                        </p>
                        <div class="flex flex-col gap-2.5 pt-1 text-xs sm:text-sm text-slate-700">
                            <div class="flex items-start gap-2.5">
                                <i class="fa-solid fa-circle-check text-emerald-600 mt-0.5 shrink-0 text-sm"></i>
                                <span>Setiap soal memiliki <strong>8 pilihan jawaban (1 s/d 8)</strong>. Pilihlah <strong>satu angka jawaban</strong> yang menurut Anda paling tepat melengkapi pola.</span>
                            </div>
                            <div class="flex items-start gap-2.5">
                                <i class="fa-solid fa-circle-check text-emerald-600 mt-0.5 shrink-0 text-sm"></i>
                                <span>Anda dapat berpindah antar soal dengan mengklik nomor soal pada papan navigasi.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Box 2: Ringkasan Alokasi Waktu & Jumlah Soal (Bento Cards) -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <!-- Bento 1: Total Soal -->
                        <div class="bg-gradient-to-br from-slate-50 to-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#003865]/30 hover:shadow-md transition-all flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#003865] flex items-center justify-center text-xl shrink-0 shadow-xs">
                                <i class="fa-solid fa-list-ol"></i>
                            </div>
                            <div>
                                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Soal</span>
                                <div class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">${subtesData.totalSoal || 0} <span class="text-sm font-semibold text-slate-500">Soal</span></div>
                            </div>
                        </div>

                        <!-- Bento 2: Waktu Ujian -->
                        <div class="bg-gradient-to-br from-amber-50/40 to-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs hover:border-amber-400/50 hover:shadow-md transition-all flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-200 text-amber-600 flex items-center justify-center text-xl shrink-0 shadow-xs">
                                <i class="fa-regular fa-clock"></i>
                            </div>
                            <div>
                                <span class="text-[11px] font-bold text-amber-700 uppercase tracking-widest block mb-1">Waktu Pengerjaan</span>
                                <div class="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight leading-none">${menit} <span class="text-sm font-semibold text-amber-700/80">Menit</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Box 3: Peringatan Integritas & Pengawasan Kamera (Security Badge) -->
                    <div class="p-5 rounded-2xl bg-slate-50/80 border-l-4 border-l-amber-500 border border-slate-200/80 flex items-start gap-4 shadow-xs">
                        <div class="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center text-base shrink-0 mt-0.5 shadow-xs">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div class="space-y-1 text-slate-700">
                            <h5 class="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                                Ketentuan Pengawasan Digital
                            </h5>
                            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                Kamera webcam dan sistem integritas browser aktif selama ujian berlangsung. Dilarang berpindah jendela atau tab. Waktu akan berjalan otomatis segera setelah tombol di bawah ditekan.
                            </p>
                        </div>
                    </div>

                    <!-- Box 4: Tombol Aksi Langsung Ujian -->
                    <div class="pt-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                        <button type="button" onclick="window.apmEngine.renderMenu2Subtes()" class="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer">
                            <i class="fa-solid fa-arrow-left"></i>
                            <span>Kembali ke Menu</span>
                        </button>
                        <button type="button" onclick="window.apmEngine.mulaiUjianUtama(${subtesNo})" class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer">
                            <span>Mulai Ujian Subtes ${subtesNo}</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // =========================================================================
    // 3. FASE UJIAN UTAMA (WAKTU BERJALAN & KAMERA AKTIF)
    // =========================================================================
    function mulaiUjianUtama(subtesNo) {
        apmState.fase = "UJIAN";
        apmState.currentSubtesNo = Number(subtesNo);
        apmState.currentSoalIdx = 0;
        apmState.fotoTengahDone[subtesNo] = false;

        const subtesData = (window.APM_CONFIG && window.APM_CONFIG.subtes && window.APM_CONFIG.subtes[subtesNo - 1]) || {};
        apmState.sisaWaktuDetik = subtesData.waktuDetik || 420;
        apmState.targetTimestamp = Date.now() + (apmState.sisaWaktuDetik * 1000);
        simpanStateLokal(subtesNo);

        // Fullscreen
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        // Jepret Foto Awal
        ambilFotoPengawasan(subtesNo, 'Awal');

        // Render Tampilan Ujian
        renderHalamanUjian();

        // Mulai Timer Ujian
        bersihkanTimer();
        apmState.timerUjianId = setInterval(() => {
            const sisa = Math.max(0, Math.round((apmState.targetTimestamp - Date.now()) / 1000));
            apmState.sisaWaktuDetik = sisa;
            updateDisplayTimer(sisa, subtesData.waktuDetik || 420);

            // Jepret Foto Tengah pada 50% waktu
            const separuhWaktu = Math.floor((subtesData.waktuDetik || 420) / 2);
            if (!apmState.fotoTengahDone[subtesNo] && sisa <= separuhWaktu) {
                apmState.fotoTengahDone[subtesNo] = true;
                ambilFotoPengawasan(subtesNo, 'Tengah');
            }

            // Waktu Habis
            if (sisa <= 0) {
                bersihkanTimer();
                alertModal(
                    "Waktu Pengerjaan Intelegent 3 Selesai",
                    `Waktu pengerjaan untuk Subtes ${subtesNo} telah habis. Lembar jawaban Anda telah otomatis dikunci dan tersimpan ke sistem.`,
                    () => {
                        selesaiSubtes(subtesNo, true);
                    }
                );
            }
        }, 1000);

        // Preload gambar soal berikutnya
        preloadNextImages(subtesNo, 0, 4);
    }

    function renderHalamanUjian() {
        const container = document.getElementById('apm-app-container');
        if (!container) return;

        const subtesNo = apmState.currentSubtesNo;
        const subtesData = (window.APM_CONFIG && window.APM_CONFIG.subtes && window.APM_CONFIG.subtes[subtesNo - 1]) || {};
        const questionsList = (window.APM_QUESTIONS && window.APM_QUESTIONS[`subtes_${subtesNo}`]) || [];
        const totalSoal = questionsList.length;
        const currentQ = questionsList[apmState.currentSoalIdx] || { no: 1, gambarSoal: '', pilihan: ["1","2","3","4","5","6","7","8"] };
        const keySub = `subtes_${subtesNo}`;
        const jawabanTerpilih = apmState.answers[keySub][currentQ.no] || '';
        const isRagu = !!apmState.flagged[keySub][currentQ.no];

        // Hitung total terjawab
        const totalTerjawab = Object.keys(apmState.answers[keySub]).filter(k => apmState.answers[keySub][k]).length;
        const isLastSoal = apmState.currentSoalIdx === totalSoal - 1;

        // 1. Grid 8 Pilihan Jawaban (Tanpa Duplikasi Angka: Langsung "Pilihan 1" s/d "Pilihan 8")
        let optionsHtml = '';
        const opsiList = currentQ.pilihan || ["1","2","3","4","5","6","7","8"];
        opsiList.forEach(opsi => {
            const isSelected = String(jawabanTerpilih) === String(opsi);
            const cardBorderCls = isSelected
                ? "border-2 border-[#003865] bg-[#edf3f9] text-[#003865] ring-2 ring-[#003865]/25 shadow-md font-black scale-[1.02]"
                : "border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-[#003865] text-slate-800 font-bold shadow-xs";

            optionsHtml += `
                <button type="button" onclick="window.apmEngine.pilihJawaban('${opsi}')"
                    class="flex items-center justify-center p-3.5 sm:p-4 rounded-2xl ${cardBorderCls} cursor-pointer transition-all select-none text-center">
                    <div class="flex items-center gap-2">
                        <span class="text-base sm:text-lg font-black">${opsi}</span>
                        ${isSelected ? '<i class="fa-solid fa-check text-sm text-[#003865] font-black"></i>' : ''}
                    </div>
                </button>
            `;
        });

        // 2. Palet Nomor Navigasi di Atas (Persis Desain CFIT / IST)
        const colsCount = subtesNo === 1 ? 6 : 12;
        let paletHtml = '';
        questionsList.forEach((q, idx) => {
            const isAct = idx === apmState.currentSoalIdx;
            const hasAns = !!apmState.answers[keySub][q.no];
            const isQFlag = !!apmState.flagged[keySub][q.no];

            let btnCls = "h-8 sm:h-9 w-full rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all border cursor-pointer ";
            if (isAct) {
                btnCls += "bg-[#003865] text-white border-[#003865] ring-2 ring-[#ffbe1a] shadow-sm font-black scale-[1.04]";
            } else if (isQFlag) {
                btnCls += "bg-amber-100 text-amber-900 border-amber-400 font-bold hover:bg-amber-200";
            } else if (hasAns) {
                btnCls += "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold hover:bg-emerald-100";
            } else {
                btnCls += "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300";
            }

            paletHtml += `
                <button type="button" onclick="window.apmEngine.lompatKeSoal(${idx})" class="${btnCls}" title="Soal Nomor ${q.no}">
                    ${q.no}
                </button>
            `;
        });

        // Hitung sisa waktu untuk display awal
        const sisa = Math.max(0, Math.round((apmState.targetTimestamp - Date.now()) / 1000));
        const m = Math.floor(sisa / 60);
        const s = sisa % 60;
        const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        container.innerHTML = `
            <div class="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-[#b9d0e7] overflow-hidden animate-fade-in pb-5">
                <!-- TOP HEADER BAR: Nama Subtes, Sisa Waktu & Status (Persis Gaya CFIT) -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#0a4980] px-5 sm:px-6 py-3.5 text-white flex items-center justify-between gap-3 border-b border-blue-400/20">
                    <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-xl bg-[#ffbe1a] text-[#051627] flex items-center justify-center font-black text-xs shadow">
                            ${subtesNo}
                        </span>
                        <div>
                            <span class="text-[10px] uppercase font-bold text-sky-200 block">SUBTES ${subtesNo} OF 2</span>
                            <h3 class="text-sm sm:text-base font-black text-white leading-tight">${subtesData.nama || 'Subtes ' + subtesNo}</h3>
                        </div>
                    </div>

                    <!-- Badge Status Pengerjaan (Persis Gaya CFIT: Titik Hijau Berkedip, Waktu Berjalan di Belakang Layar) -->
                    <div class="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-200 shadow-inner">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Sedang Berjalan</span>
                    </div>
                </div>

                <!-- PALET NOMOR SOAL DI ATAS (SEBELUM LEMBAR SOAL, PERSIS GAYA CFIT) -->
                <div class="bg-slate-50/90 border-b border-slate-200 px-5 sm:px-6 py-3">
                    <div class="flex items-center justify-between mb-2.5">
                        <span class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <i class="fa-solid fa-table-cells text-[#003865] text-sm"></i>
                            <span>PALET NOMOR SOAL:</span>
                        </span>
                        <div class="flex items-center gap-3">
                            <div class="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Terisi</span>
                                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Ragu</span>
                                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Belum</span>
                            </div>
                            <span class="text-xs font-bold text-[#003865] bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                                ${totalTerjawab} / ${totalSoal} Terjawab
                            </span>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(${colsCount}, minmax(0, 1fr)); gap: 6px;">
                        ${paletHtml}
                    </div>
                </div>

                <!-- KONTEN LEMBAR SOAL AKTIF -->
                <div class="p-4 sm:p-6 space-y-4">
                    <!-- Status Bar Nomor Soal & Tombol Ragu-ragu -->
                    <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                        <span class="text-sm sm:text-base font-black uppercase tracking-wider text-[#003865] flex items-center gap-2">
                            <span class="w-8 h-8 rounded-xl bg-[#003865] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                                ${currentQ.no}
                            </span>
                            <span>SOAL NOMOR ${currentQ.no} DARI ${totalSoal}</span>
                        </span>
                        <div class="flex items-center gap-2">
                            ${jawabanTerpilih 
                                ? `<span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full"><i class="fa-solid fa-circle-check mr-1 text-emerald-600"></i>Sudah Dijawab: [${jawabanTerpilih}]</span>`
                                : `<span class="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">Belum Dijawab</span>`
                            }
                            <button type="button" onclick="window.apmEngine.toggleRaguRagu()"
                                class="px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer
                                ${isRagu 
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'}">
                                <i class="fa-solid fa-flag ${isRagu ? 'text-amber-600' : 'text-slate-400'}"></i>
                                <span class="hidden sm:inline">${isRagu ? 'Ditandai Ragu' : 'Ragu-ragu'}</span>
                            </button>
                        </div>
                    </div>

                    <!-- KOTAK GAMBAR SOAL YANG RAPI, BERSIH & TAJAM -->
                    <div class="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs flex items-center justify-center min-h-[320px]">
                        <img src="${currentQ.gambarSoal}" alt="Soal ${currentQ.no}"
                            class="max-h-[500px] sm:max-h-[550px] w-auto max-w-full object-contain rounded-xl pointer-events-none"
                            loading="eager" />
                    </div>

                    <!-- Petunjuk Opsi -->
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                        <i class="fa-solid fa-hand-pointer text-amber-500"></i>
                        <span>Pilih 1 dari 8 opsi jawaban di bawah ini:</span>
                    </div>

                    <!-- GRID 8 PILIHAN JAWABAN (TANPA DUPLIKASI ANGKA) -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        ${optionsHtml}
                    </div>

                    <!-- Navigasi Bawah (Sebelumnya, Selesai/Selanjutnya) -->
                    <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button type="button" onclick="window.apmEngine.soalSebelumnya()"
                            ${apmState.currentSoalIdx === 0 ? 'disabled' : ''}
                            class="px-4 sm:px-6 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer">
                            <i class="fa-solid fa-arrow-left"></i>
                            <span class="hidden sm:inline">Soal Sebelumnya</span>
                            <span class="sm:hidden">Kembali</span>
                        </button>

                        ${isLastSoal
                            ? `
                            <button type="button" onclick="window.apmEngine.konfirmasiSelesaiSubtes()"
                                class="px-5 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer">
                                <span>Kumpulkan Subtes ${subtesNo}</span>
                                <i class="fa-solid fa-check-circle"></i>
                            </button>
                            `
                            : `
                            <button type="button" onclick="window.apmEngine.soalSelanjutnya()"
                                class="px-5 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer">
                                <span>Soal Selanjutnya</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                            `
                        }
                    </div>
                </div>
            </div>
        `;

        updateDisplayTimer(sisa, subtesData.waktuDetik || 420);
    }

    function updateDisplayTimer(sisaDetik, totalDetik) {
        const el = document.getElementById('apm-timer-display');
        if (!el) return;
        const m = Math.floor(sisaDetik / 60);
        const s = sisaDetik % 60;
        el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        if (sisaDetik <= 60 && el.parentElement) {
            el.parentElement.className = "bg-red-500/20 border border-red-500/50 px-4 py-2 rounded-xl flex items-center gap-2 text-red-200 font-mono text-base font-black shadow-inner animate-pulse";
            el.className = "font-mono text-base sm:text-lg font-black text-red-300 tracking-wider";
        }
    }

    // =========================================================================
    // 4. LOGIKA JAWABAN & NAVIGASI
    // =========================================================================
    function pilihJawaban(opsi) {
        const subtesNo = apmState.currentSubtesNo;
        const questionsList = (window.APM_QUESTIONS && window.APM_QUESTIONS[`subtes_${subtesNo}`]) || [];
        const currentQ = questionsList[apmState.currentSoalIdx];
        if (!currentQ) return;

        const keySub = `subtes_${subtesNo}`;
        apmState.answers[keySub][currentQ.no] = String(opsi);

        // Hapus tanda ragu jika sudah dijawab
        if (apmState.flagged[keySub][currentQ.no]) {
            delete apmState.flagged[keySub][currentQ.no];
        }

        simpanStateLokal(subtesNo);
        renderHalamanUjian();

        // Preload gambar berikutnya
        preloadNextImages(subtesNo, apmState.currentSoalIdx, 3);
    }

    function toggleRaguRagu() {
        const subtesNo = apmState.currentSubtesNo;
        const questionsList = (window.APM_QUESTIONS && window.APM_QUESTIONS[`subtes_${subtesNo}`]) || [];
        const currentQ = questionsList[apmState.currentSoalIdx];
        if (!currentQ) return;

        const keySub = `subtes_${subtesNo}`;
        if (apmState.flagged[keySub][currentQ.no]) {
            delete apmState.flagged[keySub][currentQ.no];
        } else {
            apmState.flagged[keySub][currentQ.no] = true;
        }

        simpanStateLokal(subtesNo);
        renderHalamanUjian();
    }

    function soalSebelumnya() {
        if (apmState.currentSoalIdx > 0) {
            apmState.currentSoalIdx--;
            simpanStateLokal(apmState.currentSubtesNo);
            renderHalamanUjian();
            window.scrollTo({ top: 120, behavior: 'smooth' });
        }
    }

    function soalSelanjutnya() {
        const subtesNo = apmState.currentSubtesNo;
        const questionsList = (window.APM_QUESTIONS && window.APM_QUESTIONS[`subtes_${subtesNo}`]) || [];
        if (apmState.currentSoalIdx < questionsList.length - 1) {
            apmState.currentSoalIdx++;
            simpanStateLokal(apmState.currentSubtesNo);
            renderHalamanUjian();
            window.scrollTo({ top: 120, behavior: 'smooth' });
            preloadNextImages(subtesNo, apmState.currentSoalIdx, 3);
        }
    }

    function lompatKeSoal(idx) {
        const subtesNo = apmState.currentSubtesNo;
        const questionsList = (window.APM_QUESTIONS && window.APM_QUESTIONS[`subtes_${subtesNo}`]) || [];
        if (idx >= 0 && idx < questionsList.length) {
            apmState.currentSoalIdx = idx;
            simpanStateLokal(apmState.currentSubtesNo);
            renderHalamanUjian();
            window.scrollTo({ top: 120, behavior: 'smooth' });
            preloadNextImages(subtesNo, idx, 3);
        }
    }

    // Optimasi Performa: Preload Gambar
    function preloadNextImages(subtesNo, startIdx, count = 3) {
        const questionsList = (window.APM_QUESTIONS && window.APM_QUESTIONS[`subtes_${subtesNo}`]) || [];
        for (let i = startIdx + 1; i <= startIdx + count && i < questionsList.length; i++) {
            const src = questionsList[i].gambarSoal;
            if (src) {
                const img = new Image();
                img.src = src;
            }
        }
    }

    // =========================================================================
    // 5. SELESAI SUBTES & SIMPAN KE DATABASE SUPABASE
    // =========================================================================
    function konfirmasiSelesaiSubtes() {
        const subtesNo = apmState.currentSubtesNo;
        const questionsList = (window.APM_QUESTIONS && window.APM_QUESTIONS[`subtes_${subtesNo}`]) || [];
        const totalSoal = questionsList.length;
        const keySub = `subtes_${subtesNo}`;
        const totalTerjawab = Object.keys(apmState.answers[keySub]).filter(k => apmState.answers[keySub][k]).length;
        const sisa = totalSoal - totalTerjawab;

        let msg = `Anda telah menjawab ${totalTerjawab} dari ${totalSoal} soal.`;
        if (sisa > 0) {
            msg += ` Masih terdapat ${sisa} soal yang belum Anda isi.`;
        }
        msg += `\n\nApakah Anda yakin ingin menyelesaikan Subtes ${subtesNo} sekarang?`;

        alertModal(
            `Konfirmasi Selesai Subtes ${subtesNo}`,
            msg,
            () => {
                selesaiSubtes(subtesNo, false);
            }
        );
    }

    async function selesaiSubtes(subtesNo, isTimeout = false) {
        bersihkanTimer();
        const noStr = String(subtesNo).padStart(2, '0');

        if (!apmState.completedSubtests.includes(noStr)) {
            apmState.completedSubtests.push(noStr);
        }
        try {
            localStorage.removeItem('altrak_apm_subtes_end_time');
            localStorage.removeItem('altrak_apm_current_soal_idx');
            localStorage.setItem('altrak_apm_fase', 'MENU');
        } catch (e) {}
        simpanStateLokal(subtesNo);

        // Ambil Foto Pengawasan Akhir
        ambilFotoPengawasan(subtesNo, 'Akhir');

        // Jika Subtes 1 selesai, tawarkan lanjut ke Subtes 2
        if (subtesNo === 1) {
            alertModal(
                "Subtes 1 Selesai",
                "Subtes 1 telah berhasil dikumpulkan. Anda sekarang dapat melanjutkan ke Subtes 2 (Intelegent 3).",
                () => {
                    pilihSubtes(2);
                }
            );
            return;
        }

        // Jika Subtes 2 selesai (atau seluruh 2 subtes selesai), kumpulkan dan simpan ke Supabase
        await simpanHasilApmKeDatabase();
    }

    async function simpanHasilApmKeDatabase() {
        console.log("[Intelegent 3] Menyimpan & mengevaluasi jawaban secara aman via Server Supabase RPC...");
        const idPeserta = (typeof state !== 'undefined' && state.user && state.user.id)
            || localStorage.getItem('id_peserta')
            || localStorage.getItem('email_peserta')
            || '';

        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
            ? supabaseClient
            : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.rpc === 'function') ? window.supabase : null);

        let rpcSuccess = false;
        let res = null;

        // Tampilkan overlay indikator proses penyimpanan aman
        let loadingEl = document.getElementById('apm-submit-loading');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'apm-submit-loading';
            loadingEl.className = 'fixed inset-0 z-50 bg-[#001e38]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white';
            loadingEl.innerHTML = `
                <div class="p-6 bg-[#002747] border border-[#ffbe1a]/40 rounded-3xl shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm mx-4">
                    <i class="fa-solid fa-spinner fa-spin text-4xl text-[#ffbe1a]"></i>
                    <div>
                        <h4 class="text-base font-bold text-white mb-1">Menyimpan Intelegent 3</h4>
                        <p class="text-xs text-slate-300">Memproses verifikasi lembar jawaban Anda ke database server PT Altrak 1978...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(loadingEl);
        }

        // 1. Eksekusi Server-Side Supabase RPC (Kunci Jawaban 100% di Server Database)
        if (sb && typeof sb.rpc === 'function' && idPeserta) {
            try {
                res = await sb.rpc('hitung_dan_simpan_apm', {
                    p_id_peserta: String(idPeserta),
                    p_jawaban: {
                        subtes_1: apmState.answers.subtes_1 || {},
                        subtes_2: apmState.answers.subtes_2 || {}
                    },
                    p_pelanggaran_tab: apmState.pelanggaranTab || 0,
                    p_durasi_detik: 0
                });

                if (!res.error) {
                    rpcSuccess = true;
                    console.log("[Intelegent 3] Evaluasi Server Supabase RPC berhasil!");
                } else {
                    console.warn("[Intelegent 3] Error Supabase RPC:", res.error.message || res.error);
                }
            } catch (errRpc) {
                console.warn("[Intelegent 3] Exception saat memanggil RPC:", errRpc);
            }
        }

        // 2. Standardisasi Payload & Fallback Aman (Zero Client Leak - Tidak Ada Kunci di Client)
        let finalApmPayload = {
            modul: 'Intelegent 3',
            status: 'selesai',
            answers: apmState.answers,
            jawaban: apmState.answers,
            raw_answers: apmState.answers,
            pelanggaran_tab_switch: apmState.pelanggaranTab || 0,
            waktu_submit: new Date().toISOString()
        };

        if (rpcSuccess && res && res.data && res.data.data) {
            finalApmPayload = {
                ...finalApmPayload,
                ...res.data.data
            };
        } else if (rpcSuccess && res && res.data && typeof res.data === 'object' && res.data.total_skor_mentah !== undefined) {
            finalApmPayload = {
                ...finalApmPayload,
                ...res.data
            };
        } else {
            // Jika koneksi sempat terputus, simpan jawaban mentah via updateHasilTes
            // CATATAN KEAMANAN: Kunci jawaban tetap TIDAK disimpan di client browser!
            try {
                if (typeof updateHasilTes === 'function') {
                    await updateHasilTes('hasil_apm', finalApmPayload);
                } else if (typeof window.updateHasilTes === 'function') {
                    await window.updateHasilTes('hasil_apm', finalApmPayload);
                } else if (sb && idPeserta) {
                    await sb.from('kandidat_psikotes').update({ hasil_apm: finalApmPayload }).eq('id', idPeserta);
                }
            } catch (errDb) {
                console.warn('[Intelegent 3] Fallback penyimpanan mentah:', errDb);
            }
        }

        // Hapus elemen loading
        if (loadingEl && loadingEl.parentNode) {
            loadingEl.parentNode.removeChild(loadingEl);
        }

        // Kunci status selesai di session & bersihkan draft ujian
        try {
            localStorage.setItem('apm_selesai', 'true');
            localStorage.removeItem('altrak_apm_answers_subtes_01');
            localStorage.removeItem('altrak_apm_answers_subtes_02');
            localStorage.removeItem('altrak_apm_flagged_subtes_01');
            localStorage.removeItem('altrak_apm_flagged_subtes_02');
            localStorage.removeItem('altrak_apm_completed_subtests');
            localStorage.removeItem('altrak_apm_subtes_end_time');
            localStorage.removeItem('altrak_apm_pelanggaran_tab');
        } catch (e) {}

        if (typeof unlockDashboardCard === 'function') {
            unlockDashboardCard(9);
        }
        if (typeof updateDashboardProgress === 'function') {
            updateDashboardProgress();
        }

        // Tampilkan modal selesai tanpa membocorkan skor/kunci ke peserta
        alertModal(
            "Tes: Intelegent 3 Selesai",
            "Selamat! Anda telah menyelesaikan seluruh bagian Tes: Intelegent 3. Seluruh lembar jawaban Anda telah tersimpan secara aman di database PT Altrak 1978.",
            () => {
                kembaliKePortalDashboard();
            }
        );
    }

    function kembaliKePortalDashboard() {
        bersihkanTimer();
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
        if (typeof pindahFase === 'function') {
            pindahFase('view-dashboard');
        } else if (typeof showPage === 'function') {
            showPage('view-dashboard');
        }
    }

    function ambilFotoPengawasan(subtesNo, fase) {
        let identifier = '';
        try {
            if (typeof state !== 'undefined' && state.user && state.user.email) {
                identifier = state.user.email;
            } else {
                identifier = localStorage.getItem('email_peserta') || localStorage.getItem('id_peserta') || 'kandidat';
            }
        } catch (e) {
            identifier = 'kandidat';
        }

        try {
            if (typeof window.jepretDanUpload === 'function') {
                window.jepretDanUpload(identifier, 'APM', `Subtes-${subtesNo}`, fase);
            }
        } catch (e) {
            console.warn("[Intelegent 3] Log kamera:", e);
        }
    }

    function bersihkanTimer() {
        if (apmState.timerUjianId) {
            clearInterval(apmState.timerUjianId);
            apmState.timerUjianId = null;
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

    // Ekspor API Intelegent 3
    window.apmEngine = {
        init: initApm,
        start: startApmTest,
        renderMenu2Subtes,
        pilihSubtes,
        renderPanduanSubtes,
        mulaiUjianUtama,
        pilihJawaban,
        toggleRaguRagu,
        soalSebelumnya,
        soalSelanjutnya,
        lompatKeSoal,
        konfirmasiSelesaiSubtes,
        selesaiSubtes
    };

    window.startApmTest = startApmTest;
})();

