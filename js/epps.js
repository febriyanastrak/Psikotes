// =========================================================================
// MODUL LOGIKA & TAMPILAN EPPS (EDWARDS PERSONAL PREFERENCE SCHEDULE)
// PT Altrak 1978 - Leadership & Executive Assessment System
// Modul Ujian Khusus Manajerial & Kepemimpinan (Tahap 2)
// 225 Soal Forced-Choice & 15 Skala Kebutuhan Motivasi Murray
// Standar Alokasi Waktu: 60 Menit (Termasuk Pedoman & Contoh)
// =========================================================================

(function () {
    'use strict';

    let eppsAnswers = {};
    let isSubmittingEpps = false;
    let currentEppsPage = 1;
    let eppsStartTime = null;
    let eppsHasStarted = false;
    const ITEMS_PER_PAGE = 25; // 9 Halaman untuk 225 soal agar performa browser sangat cepat & mulus

    // Pulihkan jawaban yang tersimpan di localStorage jika kandidat refresh
    try {
        const saved = localStorage.getItem('epps_answers');
        if (saved) {
            eppsAnswers = JSON.parse(saved);
        }
        const savedStart = localStorage.getItem('epps_start_time');
        if (savedStart) {
            eppsStartTime = savedStart;
            eppsHasStarted = true;
        }
    } catch (e) {
        eppsAnswers = {};
    }

    // --- FITUR DOKUMENTASI FOTO PENGAWASAN KAMERA EPPS ---
    let fotoEppsAwalTaken = false;
    let fotoEppsTengahTaken = false;
    let fotoEppsAkhirTaken = false;

    /**
     * Pengawasan Kamera Otomatis (Proctoring Snapshot) EPPS
     * Mengambil snapshot kandidat dan mengunggah ke Supabase Storage foto_kandidat/EPPS/
     * @param {'Awal'|'Tengah'|'Akhir'} fase 
     * @param {string} subtesLabel 
     */
    function ambilFotoEpps(fase = 'Awal', subtesLabel = 'EPPS-Personality') {
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
        try {
            window.jepretDanUpload(identifier, 'EPPS', subtesLabel, fase);
        } catch (errCam) {
            console.warn('[EPPS Camera]', errCam);
        }
    }

    /**
     * Format durasi detik ke teks ramah baca (contoh: "48 Menit 30 Detik")
     */
    function formatDurasiWaktu(totalDetik) {
        if (!totalDetik || totalDetik <= 0) return "0 Menit 0 Detik";
        const m = Math.floor(totalDetik / 60);
        const s = totalDetik % 60;
        if (m === 0) return `${s} Detik`;
        return `${m} Menit ${s} Detik`;
    }

    /**
     * Mengambil daftar soal EPPS dari data resmi
     */
    function getEppsQuestions() {
        if (window.EPPS_QUESTIONS && Array.isArray(window.EPPS_QUESTIONS) && window.EPPS_QUESTIONS.length > 0) {
            return window.EPPS_QUESTIONS;
        }
        return [];
    }

    /**
     * Memulai sesi tes EPPS (Modul 4 Tahap 1)
     */
    function startEppsTest() {
        if (typeof closeModal === 'function') {
            closeModal('modal-module-epps');
        }
        if (typeof pindahFase === 'function') {
            pindahFase('view-epps');
        } else if (typeof showPage === 'function') {
            showPage('view-epps');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });

        // Selalu tampilkan Layar Pedoman & Contoh terlebih dahulu (Fase 1: Pedoman Resmi)
        // Pemisahan tegas antara Fase Pedoman dan Fase Lembar Ujian (persis IST & PAPI)
        renderEppsPedomanUI();
    }

    /**
     * Memulai pengerjaan nyata setelah membaca pedoman:
     * Menjalankan Silent Background Timer 60 Menit (3600 Detik)
     */
    function eppsMulaiMengerjakan() {
        eppsHasStarted = true;
        if (!eppsStartTime) {
            eppsStartTime = new Date().toISOString();
            try {
                localStorage.setItem('epps_start_time', eppsStartTime);
            } catch (e) {}
        }

        // Ambil foto pengawasan webcam saat mulai pengerjaan
        if (!fotoEppsAwalTaken) {
            fotoEppsAwalTaken = true;
            ambilFotoEpps('Awal', 'EPPS-Start');
        }

        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        renderEppsUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Merender Layar Pedoman & Contoh Soal EPPS (Halaman Pembuka)
     */
    function renderEppsPedomanUI() {
        const container = document.getElementById('epps-app-container');
        if (!container) return;

        const config = window.EPPS_CONFIG || {};
        const ped = config.pedoman || {};
        const answeredCount = hitungEppsTerjawab();

        container.innerHTML = `
            <div class="space-y-6">
                <!-- HEADER BANNER PEDOMAN EPPS -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#0a4980] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-400/20 relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center text-3xl font-black border border-white/20 shadow-inner">
                                <i class="fa-solid fa-layer-group"></i>
                            </div>
                            <div>
                                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-widest mb-1.5">
                                    <i class="fa-solid fa-crown text-amber-400"></i> Asesmen Kepemimpinan Tahap 2
                                </div>
                                <h1 class="text-xl sm:text-3xl font-black text-white leading-tight">
                                    Edwards Personal Preference Schedule (EPPS)
                                </h1>
                                <p class="text-xs sm:text-sm text-slate-200 mt-1">
                                    Pedoman Pelaksanaan &amp; Pengenalan Format 225 Pasangan Pilihan Kebutuhan Kerja
                                </p>
                            </div>
                        </div>
                        <div>
                            <button type="button" onclick="bukaDashboardTahap2()"
                                class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer">
                                <i class="fa-solid fa-arrow-left"></i>
                                <span>Dashboard Tahap 2</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- KARTU KUTIPAN RESMI PETUNJUK (SESUAI DOKUMEN RESMI) -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 sm:p-9 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#003865] flex items-center justify-center text-lg font-bold border border-blue-200">
                            <i class="fa-solid fa-book-open"></i>
                        </div>
                        <div>
                            <h2 class="text-lg sm:text-xl font-black text-[#003865]">Petunjuk &amp; Pedoman Pengerjaan EPPS</h2>
                            <p class="text-xs text-slate-500">Bacalah instruksi di bawah ini dengan seksama sebelum memulai ujian</p>
                        </div>
                    </div>

                    <!-- KOTAK HIGHLIGHT KHUSUS KUTIPAN RESMI HALAMAN 3 -->
                    <div class="p-6 bg-gradient-to-br from-amber-50/80 via-blue-50/40 to-slate-50 rounded-2xl border-2 border-amber-300 text-slate-700 text-sm leading-relaxed space-y-4 shadow-sm relative overflow-hidden">
                        <div class="absolute -top-3 -right-3 w-28 h-28 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
                        <div class="flex items-center gap-2 pb-2 border-b border-amber-200/80">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider shadow-xs">
                                <i class="fa-solid fa-bookmark mr-1"></i> Kutipan Resmi Halaman 3 Buku Pedoman EPPS
                            </span>
                            <span class="text-[11px] text-slate-500 font-semibold italic">Pedoman Standar Psikodiagnostik</span>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="p-2.5 rounded-xl bg-[#003865] text-amber-400 text-base shadow flex-shrink-0 mt-0.5">
                                <i class="fa-solid fa-quote-left"></i>
                            </span>
                            <div class="space-y-3.5 text-slate-800 font-medium">
                                <div class="bg-amber-100/90 p-4 rounded-xl border border-amber-300 text-amber-950 font-bold leading-relaxed shadow-xs">
                                    <span class="bg-amber-300/80 px-1 py-0.5 rounded">Setiap pilihan Anda hendaknya didasarkan atas kemiripan dengan gambaran atau perasaan Anda sekarang. Dan tidak didasarkan atas hal-hal yang Anda anggap wajar.</span>
                                </div>
                                <p class="leading-relaxed text-slate-700">
                                    Ini adalah tes kepribadian, tidak ada jawaban yang benar atau salah. Jawablah yang paling mengambarkan perasaan anda.
                                </p>
                                <div class="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 font-black flex items-center gap-2.5">
                                    <i class="fa-solid fa-triangle-exclamation text-rose-600 text-lg flex-shrink-0"></i>
                                    <span>Tetapkan pilihan Anda setelah membaca pernyataan yang berpasangan ini, dan <span class="underline decoration-rose-500 decoration-2">JANGAN ADA YANG ANDA LEWATI TANPA MEMILIH</span>.</span>
                                </div>
                                <p class="text-xs text-slate-600 leading-relaxed">
                                    Pasangan-pasangan pernyataan pada lembar tes serupa dengan contoh yang telah diberikan di bawah ini. Bacalah setiap pasangan dan pilihlah pernyataan yang <strong>"lebih menggambarkan diri Anda"</strong> dengan cara memilih huruf <strong>A</strong> atau <strong>B</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- KOTAK CONTOH SIMULASI SOAL -->
                    <div class="border-2 border-dashed border-[#003865]/30 rounded-2xl p-5 sm:p-6 bg-slate-50/70 space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black uppercase tracking-wider text-[#003865] bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
                                <i class="fa-solid fa-lightbulb text-amber-500 mr-1"></i> Contoh Soal Pasangan
                            </span>
                            <span class="text-xs text-slate-500 font-semibold">Simulasi Pilihan A vs B</span>
                        </div>

                        <!-- CONTOH 1 -->
                        <div class="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-black text-slate-500">Contoh 1:</span>
                                <span id="contoh-epps-1-status" class="text-[11px] font-semibold text-slate-400">Klik A atau B untuk mencoba</span>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div id="contoh-epps-1-A" onclick="window.pilihContohEpps(1, 'A')" class="p-3.5 rounded-xl border-2 border-[#003865] bg-blue-50/60 shadow-sm flex items-start gap-2.5 cursor-pointer transition-all hover:shadow-md">
                                    <span id="contoh-epps-1-badge-A" class="w-6 h-6 rounded-lg bg-[#003865] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">A</span>
                                    <p class="text-xs sm:text-sm text-slate-800 font-medium">Saya suka berbicara tentang diri saya dengan orang lain.</p>
                                </div>
                                <div id="contoh-epps-1-B" onclick="window.pilihContohEpps(1, 'B')" class="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer transition-all hover:bg-slate-50 hover:shadow-md">
                                    <span id="contoh-epps-1-badge-B" class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200">B</span>
                                    <p class="text-xs sm:text-sm text-slate-700 font-medium">Saya suka bekerja untuk suatu tujuan yang telah saya tentukan bagi diri saya.</p>
                                </div>
                            </div>
                            <p class="text-[11px] text-slate-500 italic pl-1">
                                &bull; Manakah yang lebih menggambarkan Anda? Jika lebih mirip pernyataan A maka pilihlah A, dan jika lebih mirip pernyataan B maka pilihlah B.
                            </p>
                        </div>

                        <!-- CONTOH 2 -->
                        <div class="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-black text-slate-500">Contoh 2:</span>
                                <span id="contoh-epps-2-status" class="text-[11px] font-semibold text-slate-400">Klik A atau B untuk mencoba</span>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div id="contoh-epps-2-A" onclick="window.pilihContohEpps(2, 'A')" class="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer transition-all hover:bg-slate-50 hover:shadow-md">
                                    <span id="contoh-epps-2-badge-A" class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200">A</span>
                                    <p class="text-xs sm:text-sm text-slate-700 font-medium">Saya bersusah hati, bila gagal dalam sesuatu.</p>
                                </div>
                                <div id="contoh-epps-2-B" onclick="window.pilihContohEpps(2, 'B')" class="p-3.5 rounded-xl border-2 border-[#003865] bg-blue-50/60 shadow-sm flex items-start gap-2.5 cursor-pointer transition-all hover:shadow-md">
                                    <span id="contoh-epps-2-badge-B" class="w-6 h-6 rounded-lg bg-[#003865] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">B</span>
                                    <p class="text-xs sm:text-sm text-slate-800 font-medium">Saya merasa gugup bila harus bicara di depan orang banyak.</p>
                                </div>
                            </div>
                            <p class="text-[11px] text-slate-500 italic pl-1">
                                &bull; Pilihlah salah satu yang paling mendekati perasaan Anda saat ini secara spontan.
                            </p>
                        </div>
                    </div>

                    <!-- ATURAN WAKTU & KEAMANAN -->
                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-clock text-[#003865] text-base"></i>
                            <span>Alokasi Waktu: <strong>60 Menit</strong> (Berjalan Otomatis di Background)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved text-emerald-600 text-base"></i>
                            <span>Pengawasan Kamera Aktif &bull; Validasi Anti-Skip 225 Nomor</span>
                        </div>
                    </div>

                    <!-- TOMBOL MULAI UJIAN NYATA -->
                    <div class="pt-4 text-center">
                        <button type="button" onclick="window.eppsMulaiMengerjakan()"
                            class="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#003865] via-[#0b4578] to-[#0a4980] hover:from-[#071f38] hover:to-[#083c6b] text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 mx-auto cursor-pointer">
                            <i class="fa-solid fa-play text-amber-400"></i>
                            <span>${answeredCount > 0 ? `Lanjutkan Mengerjakan EPPS (${answeredCount}/225 Soal)` : 'Saya Paham & Mulai Mengerjakan EPPS (225 Soal)'}</span>
                            <i class="fa-solid fa-arrow-right text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Menghitung total soal terjawab
     */
    function hitungEppsTerjawab() {
        const questions = getEppsQuestions();
        let count = 0;
        questions.forEach(q => {
            if (eppsAnswers[q.no] === 'A' || eppsAnswers[q.no] === 'B') {
                count++;
            }
        });
        return count;
    }

    /**
     * Menangani pemilihan opsi A atau B
     */
    function eppsHandleSelect(no, choice) {
        if (isSubmittingEpps) return;

        eppsAnswers[no] = choice;

        try {
            localStorage.setItem('epps_answers', JSON.stringify(eppsAnswers));
        } catch (e) {}

        updateEppsCardHighlight(no, choice);
        updateEppsProgressBar();
    }

    /**
     * Memperbarui visual kartu soal yang aktif
     */
    function updateEppsCardHighlight(no, choice) {
        const card = document.getElementById(`epps-card-${no}`);
        const optA = document.getElementById(`epps-opt-${no}-A`);
        const optB = document.getElementById(`epps-opt-${no}-B`);
        const badge = document.getElementById(`epps-status-badge-${no}`);

        if (card) {
            card.classList.remove('border-slate-200');
            card.classList.add('border-[#003865]', 'ring-1', 'ring-[#003865]/20');
        }

        if (optA && optB) {
            if (choice === 'A') {
                optA.className = "flex items-start gap-3 p-4 rounded-2xl border-2 border-[#003865] bg-blue-50/60 shadow-sm cursor-pointer transition-all";
                optB.className = "flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-all";
            } else if (choice === 'B') {
                optA.className = "flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-all";
                optB.className = "flex items-start gap-3 p-4 rounded-2xl border-2 border-[#003865] bg-blue-50/60 shadow-sm cursor-pointer transition-all";
            }
        }

        if (badge) {
            badge.className = "text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 flex items-center gap-1";
            badge.innerHTML = `<i class="fa-solid fa-check text-xs"></i> Pilihan [${choice}]`;
        }
    }

    /**
     * Memperbarui progress bar pengerjaan EPPS
     */
    function updateEppsProgressBar() {
        const answeredCount = hitungEppsTerjawab();
        const questions = getEppsQuestions();
        const total = questions.length || 225;
        const pct = Math.round((answeredCount / total) * 100);

        const countEl = document.getElementById('epps-progress-count');
        const pctEl = document.getElementById('epps-progress-pct');
        const fillEl = document.getElementById('epps-progress-fill');

        if (countEl) countEl.innerText = `${answeredCount} / ${total} Soal Terjawab`;
        if (pctEl) pctEl.innerText = `${pct}%`;
        if (fillEl) fillEl.style.width = `${pct}%`;
    }

    /**
     * Berpindah halaman pagination EPPS (1..9)
     */
    function gantiHalamanEpps(targetPage) {
        const questions = getEppsQuestions();
        const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE) || 9;

        if (targetPage < 1 || targetPage > totalPages) return;
        currentEppsPage = targetPage;

        // Ambil foto pengawasan webcam saat mencapai pertengahan ujian (halaman 5)
        if (targetPage >= 5 && !fotoEppsTengahTaken) {
            fotoEppsTengahTaken = true;
            ambilFotoEpps('Tengah', 'EPPS-Pertengahan');
        }

        renderEppsUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Melompat langsung ke nomor soal tertentu (digunakan saat validasi anti-skip)
     */
    function lompatKeNomorEpps(questionNo) {
        const targetPage = Math.ceil(questionNo / ITEMS_PER_PAGE);
        currentEppsPage = targetPage;
        renderEppsUI();

        setTimeout(() => {
            const el = document.getElementById(`epps-card-${questionNo}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-amber-400');
                setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
            }
        }, 300);
    }

    /**
     * Merender Lembar Soal EPPS (Dengan Paginasi 25 Soal per Halaman)
     */
    function renderEppsUI() {
        const container = document.getElementById('epps-app-container');
        if (!container) return;

        const questions = getEppsQuestions();
        const total = questions.length;
        const answeredCount = hitungEppsTerjawab();
        const pct = Math.round((answeredCount / total) * 100);

        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        const startIndex = (currentEppsPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, total);
        const pageQuestions = questions.slice(startIndex, endIndex);

        let html = `
            <!-- HEADER MODUL EPPS -->
            <div class="mb-6 bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 sm:p-8 relative overflow-hidden">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003865] to-[#0a4980] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-[#003865]/20">
                            <i class="fa-solid fa-layer-group"></i>
                        </div>
                        <div>
                            <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-blue-50 text-[#003865] border border-blue-200 uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-crown text-amber-500"></i> Asesmen Kepemimpinan Tahap 2
                            </div>
                            <h2 class="text-xl sm:text-2xl font-black text-[#003865]">
                                Edwards Personal Preference Schedule (EPPS)
                            </h2>
                            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Lembar Jawaban 225 Pasangan Kebutuhan Kerja (Halaman ${currentEppsPage} dari ${totalPages})
                            </p>
                        </div>
                    </div>

                </div>

                <!-- PROGRESS BAR TERJAWAB -->
                <div class="mt-5 pt-2">
                    <div class="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                        <span id="epps-progress-count" class="text-[#003865] font-black">${answeredCount} / ${total} Soal Terjawab</span>
                        <span id="epps-progress-pct" class="text-emerald-600 font-black">${pct}%</span>
                    </div>
                    <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div id="epps-progress-fill" class="h-full bg-gradient-to-r from-[#003865] via-blue-600 to-emerald-500 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                    </div>
                </div>

                <!-- PAGINATION BAR ATAS -->
                <div class="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xs font-bold text-slate-500">Pilih Halaman Soal:</span>
                    <div class="flex flex-wrap items-center gap-1.5">
        `;

        for (let p = 1; p <= totalPages; p++) {
            const isCur = p === currentEppsPage;
            html += `
                <button type="button" onclick="window.gantiHalamanEpps(${p})"
                    class="w-8 h-8 rounded-lg text-xs font-bold transition ${isCur ? 'bg-[#003865] text-white shadow' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}">
                    ${p}
                </button>
            `;
        }

        html += `
                    </div>
                </div>
            </div>

            <!-- DAFTAR SOAL HALAMAN INI -->
            <div class="space-y-4" id="epps-question-list">
        `;

        pageQuestions.forEach(q => {
            const ans = eppsAnswers[q.no] || null;
            const isCardActive = ans !== null;

            html += `
                <div id="epps-card-${q.no}" class="bg-white rounded-3xl border ${isCardActive ? 'border-[#003865] ring-1 ring-[#003865]/20' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all p-5 sm:p-6">
                    <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-[#003865] text-white text-xs font-black flex items-center justify-center shadow-sm">
                                ${q.no}
                            </span>
                            <span class="text-sm font-bold text-[#003865]">Nomor ${q.no} dari ${total}</span>
                        </div>
                        <div id="epps-status-badge-${q.no}">
                            ${ans ? `
                                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                                    <i class="fa-solid fa-check text-xs"></i> Pilihan [${ans}]
                                </span>
                            ` : `
                                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                                    Belum Dijawab
                                </span>
                            `}
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <!-- OPSI A -->
                        <div id="epps-opt-${q.no}-A" 
                            onclick="window.eppsHandleSelect(${q.no}, 'A')"
                            class="flex items-start gap-3 p-4 rounded-2xl border ${ans === 'A' ? 'border-2 border-[#003865] bg-blue-50/60 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'} cursor-pointer transition-all">
                            <div class="w-7 h-7 rounded-xl ${ans === 'A' ? 'bg-[#003865] text-white' : 'bg-slate-100 text-slate-600'} font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200">
                                A
                            </div>
                            <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed select-none">
                                ${q.a}
                            </p>
                        </div>

                        <!-- OPSI B -->
                        <div id="epps-opt-${q.no}-B" 
                            onclick="window.eppsHandleSelect(${q.no}, 'B')"
                            class="flex items-start gap-3 p-4 rounded-2xl border ${ans === 'B' ? 'border-2 border-[#003865] bg-blue-50/60 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'} cursor-pointer transition-all">
                            <div class="w-7 h-7 rounded-xl ${ans === 'B' ? 'bg-[#003865] text-white' : 'bg-slate-100 text-slate-600'} font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200">
                                B
                            </div>
                            <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed select-none">
                                ${q.b}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
            </div>

            <!-- FOOTER NAVIGASI HALAMAN & TOMBOL SUBMIT -->
            <div class="mt-8 bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                    <button type="button" 
                        ${currentEppsPage <= 1 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'onclick="window.gantiHalamanEpps(' + (currentEppsPage - 1) + ')" class="hover:bg-slate-100 cursor-pointer"'}
                        class="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs transition flex items-center gap-2">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Sebelumnya</span>
                    </button>
                    <span class="text-xs font-bold text-slate-600 px-3">
                        Halaman ${currentEppsPage} / ${totalPages}
                    </span>
                    <button type="button" 
                        ${currentEppsPage >= totalPages ? 'disabled class="opacity-40 cursor-not-allowed"' : 'onclick="window.gantiHalamanEpps(' + (currentEppsPage + 1) + ')" class="hover:bg-slate-100 cursor-pointer"'}
                        class="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs transition flex items-center gap-2">
                        <span>Selanjutnya</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                <div class="flex items-center gap-3 w-full sm:w-auto">
                    <button type="button" 
                        id="btnSubmitEpps"
                        onclick="window.eppsSubmitTest()" 
                        class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-black text-xs rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span id="btnSubmitEppsText">Kumpulkan Jawaban EPPS (225 Soal)</span>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Memproses pengumpulan jawaban EPPS
     * Mengirim HANYA jawaban mentah 225 nomor ke database Supabase
     */
    async function eppsSubmitTest() {
        if (isSubmittingEpps) return;

        const questions = getEppsQuestions();
        const answeredCount = hitungEppsTerjawab();
        const total = questions.length || 225;

        // Validasi Anti-Skip ketat: Wajib 225 nomor terisi lengkap
        if (answeredCount < total) {
            let firstMissing = null;
            for (let i = 0; i < questions.length; i++) {
                if (!eppsAnswers[questions[i].no]) {
                    firstMissing = questions[i].no;
                    break;
                }
            }

            if (typeof customAlert === 'function') {
                customAlert(
                    "Jawaban Belum Lengkap",
                    `Anda baru menjawab ${answeredCount} dari ${total} soal EPPS. Harap lengkapi semua nomor, mulai dari nomor ${firstMissing}.`,
                    "warning"
                );
            } else {
                alert(`Jawaban belum lengkap (${answeredCount}/${total}). Periksa nomor ${firstMissing}.`);
            }

            if (firstMissing) {
                lompatKeNomorEpps(firstMissing);
            }
            return;
        }

        const doSubmit = async () => {
            isSubmittingEpps = true;

            const btn = document.getElementById('btnSubmitEpps');
            const btnText = document.getElementById('btnSubmitEppsText');
            if (btn) btn.disabled = true;
            if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengolah & Menyimpan Hasil...';

            const waktuSelesaiISO = new Date().toISOString();
            const waktuMulaiISO = eppsStartTime || localStorage.getItem('epps_start_time') || waktuSelesaiISO;
            const diffDetik = Math.max(1, Math.round((new Date(waktuSelesaiISO) - new Date(waktuMulaiISO)) / 1000));

            // Ambil foto pengawasan webcam saat pengumpulan akhir
            if (!fotoEppsAkhirTaken) {
                fotoEppsAkhirTaken = true;
                ambilFotoEpps('Akhir', 'EPPS-Selesai');
            }

            // Hitung skor 15 skala Edwards (r, c, s) & skor konsistensi (con) untuk data paket utuh
            const redLineItems = [1, 26, 51, 7, 32, 57, 13, 38, 63, 19, 44, 69, 25, 50, 75];
            const consistencyPairs = [
                [1, 151], [26, 101], [51, 201],
                [7, 157], [32, 107], [57, 207],
                [13, 163], [38, 113], [63, 213],
                [19, 169], [44, 119], [69, 219],
                [25, 175], [50, 125], [75, 225]
            ];
            const eppsScaleCodes = ['ach', 'def', 'ord', 'exh', 'aut', 'aff', 'int', 'suc', 'dom', 'aba', 'nur', 'chg', 'end', 'het', 'agg'];
            const rScores = {};
            const cScores = {};
            const sScores = {};
            eppsScaleCodes.forEach(k => { rScores[k] = 0; cScores[k] = 0; sScores[k] = 0; });

            const qList = (typeof EPPS_QUESTIONS !== 'undefined' && Array.isArray(EPPS_QUESTIONS)) ? EPPS_QUESTIONS : [];
            qList.forEach(q => {
                const ans = (eppsAnswers[q.no] || eppsAnswers[String(q.no)] || '').toString().trim().toUpperCase();
                if (!redLineItems.includes(q.no)) {
                    if (ans === 'A' && q.skalaA && rScores[q.skalaA] !== undefined) {
                        rScores[q.skalaA]++;
                    } else if (ans === 'B' && q.skalaB && cScores[q.skalaB] !== undefined) {
                        cScores[q.skalaB]++;
                    }
                }
            });
            eppsScaleCodes.forEach(k => {
                sScores[k] = (rScores[k] || 0) + (cScores[k] || 0);
            });

            let conScore = 0;
            consistencyPairs.forEach(pair => {
                const a1 = (eppsAnswers[pair[0]] || eppsAnswers[String(pair[0])] || '').toString().trim().toUpperCase();
                const a2 = (eppsAnswers[pair[1]] || eppsAnswers[String(pair[1])] || '').toString().trim().toUpperCase();
                if (a1 && a2 && a1 === a2) {
                    conScore++;
                }
            });

            // Simpan paket data lengkap (Ringkasan Skor + 225 Jawaban Mentah Peserta)
            const payload = {
                status: 'selesai',
                modul: 'EPPS (Edwards Personal Preference Schedule)',
                waktu_mulai: waktuMulaiISO,
                waktu_selesai: waktuSelesaiISO,
                durasi_detik: diffDetik,
                durasi_teks: formatDurasiWaktu(diffDetik),
                is_overtime: diffDetik > 3600,
                overtime_detik: Math.max(0, diffDetik - 3600),
                pelanggaran_tab_switch: typeof tabSwitchViolations !== 'undefined' ? tabSwitchViolations : 0,
                jawaban: eppsAnswers,
                answers: eppsAnswers,
                jawaban_peserta: eppsAnswers,
                skor_skala: sScores,
                skor_baris: rScores,
                skor_kolom: cScores,
                skor_konsistensi: conScore,
                total_skor: 210
            };

            // Simpan ke Supabase via updateHasilTes
            if (typeof updateHasilTes === 'function') {
                try {
                    await updateHasilTes('hasil_epps', payload);
                } catch (e) {
                    console.warn('[EPPS Save Warning]', e);
                }
            } else if (typeof window !== 'undefined' && typeof window.updateHasilTes === 'function') {
                try {
                    await window.updateHasilTes('hasil_epps', payload);
                } catch (e) {
                    console.warn('[EPPS Save Warning]', e);
                }
            }

            // Simpan ke LocalStorage sebagai backup aman
            try {
                localStorage.setItem('epps_selesai', 'true');
                localStorage.setItem('epps_payload', JSON.stringify(payload));
            } catch (e) {}

            // Buka kunci modul 5 (Pauli) melalui completeModule(4)
            if (typeof completeModule === 'function') {
                completeModule(4);
            } else if (typeof unlockDashboardCard === 'function') {
                unlockDashboardCard(4);
            }

            const pesanWaktu = diffDetik > 3600 
                ? `Waktu pengerjaan: ${formatDurasiWaktu(diffDetik)} (Tercatat Overtime di Portal HRD)` 
                : `Waktu pengerjaan: ${formatDurasiWaktu(diffDetik)} (Tepat Waktu)`;

            if (typeof customAlert === 'function') {
                customAlert(
                    "Tes EPPS Berhasil Disimpan",
                    `Seluruh 225 jawaban pilihan motivasi kerja Anda telah tersimpan aman di database server PT Altrak 1978. ${pesanWaktu}. Kartu Tes 5: Pauli sekarang telah terbuka pada Dashboard Asesmen.`,
                    "success",
                    false,
                    () => {
                        if (typeof pindahFase === 'function') {
                            pindahFase('view-dashboard');
                        } else if (typeof showPage === 'function') {
                            showPage('page-dashboard');
                        }
                    }
                );
            } else {
                alert(`Tes EPPS Berhasil Disimpan! ${pesanWaktu}.`);
                if (typeof pindahFase === 'function') {
                    pindahFase('view-dashboard');
                } else if (typeof showPage === 'function') {
                    showPage('page-dashboard');
                }
            }
        };

        if (typeof customAlert === 'function') {
            customAlert(
                "Kumpulkan Jawaban EPPS?",
                `Anda telah melengkapi seluruh 225 soal motivasi kerja EPPS. Apakah Anda yakin ingin mengumpulkan lembar jawaban sekarang?`,
                "warning",
                true,
                () => { doSubmit(); }
            );
        } else {
            if (confirm(`Kumpulkan jawaban EPPS (225 soal)?`)) {
                doSubmit();
            }
        }
    }


    /**
     * Menangani simulasi klik pilihan A vs B pada contoh 1 & 2 petunjuk EPPS
     */
    function pilihContohEpps(contohNo, choice) {
        const elA = document.getElementById(`contoh-epps-${contohNo}-A`);
        const elB = document.getElementById(`contoh-epps-${contohNo}-B`);
        const badgeA = document.getElementById(`contoh-epps-${contohNo}-badge-A`);
        const badgeB = document.getElementById(`contoh-epps-${contohNo}-badge-B`);
        const statusText = document.getElementById(`contoh-epps-${contohNo}-status`);

        if (!elA || !elB) return;

        if (choice === 'A') {
            elA.className = "p-3.5 rounded-xl border-2 border-[#003865] bg-blue-50/60 shadow-sm flex items-start gap-2.5 cursor-pointer transition-all";
            elB.className = "p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer transition-all hover:bg-slate-50";
            if (badgeA) badgeA.className = "w-6 h-6 rounded-lg bg-[#003865] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5";
            if (badgeB) badgeB.className = "w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200";
        } else {
            elA.className = "p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer transition-all hover:bg-slate-50";
            elB.className = "p-3.5 rounded-xl border-2 border-[#003865] bg-blue-50/60 shadow-sm flex items-start gap-2.5 cursor-pointer transition-all";
            if (badgeA) badgeA.className = "w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200";
            if (badgeB) badgeB.className = "w-6 h-6 rounded-lg bg-[#003865] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5";
        }

        if (statusText) {
            statusText.innerHTML = `<span class="inline-flex items-center gap-1 font-bold text-[#003865] bg-blue-100/80 px-2 py-0.5 rounded text-[10px]"><i class="fa-solid fa-check text-emerald-600"></i> Pilihan Anda: [${choice}] (Simulasi Berhasil)</span>`;
        }
    }

    if (typeof window !== 'undefined') {
        window.startEppsTest = startEppsTest;
        window.bukaModulEPPS = startEppsTest;
        window.renderEppsPedomanUI = renderEppsPedomanUI;
        window.renderEppsUI = renderEppsUI;
        window.eppsMulaiMengerjakan = eppsMulaiMengerjakan;
        window.eppsHandleSelect = eppsHandleSelect;
        window.eppsSubmitTest = eppsSubmitTest;
        window.gantiHalamanEpps = gantiHalamanEpps;
        window.lompatKeNomorEpps = lompatKeNomorEpps;
        window.pilihContohEpps = pilihContohEpps;
    }
})();
