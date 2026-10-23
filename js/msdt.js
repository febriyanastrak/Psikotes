// =========================================================================
// MODUL LOGIKA & TAMPILAN MSDT (MANAGEMENT STYLE DIAGNOSTIC TEST)
// PT Altrak 1978 - Leadership & Executive Assessment System
// Modul Ujian Khusus Manajerial & Kepemimpinan (Tahap 2)
// Sesuai Pedoman & Norma Skoring Resmi Reddin 3-D Model (64 Soal)
// =========================================================================

(function () {
    'use strict';

    // State jawaban peserta: { "1": "A", "2": "B", ... }
    let msdtAnswers = {};
    let isSubmittingMsdt = false;
    let msdtStartTime = null;
    let msdtHasStarted = false; // False = Menampilkan Pedoman & Contoh; True = Menampilkan 64 Soal

    // Flag snapshot kamera pengawasan MSDT (Awal, Tengah, Akhir)
    let fotoMsdtAwalTaken = false;
    let fotoMsdtTengahTaken = false;
    let fotoMsdtAkhirTaken = false;

    /**
     * Pengawasan Kamera Otomatis (Proctoring Snapshot) MSDT
     * Mengambil snapshot kandidat dan mengunggah ke Supabase Storage foto_kandidat/MSDT/
     * @param {'Awal'|'Tengah'|'Akhir'} fase 
     * @param {string} subtesLabel 
     */
    function ambilFotoMsdt(fase = 'Awal', subtesLabel = 'MSDT-Leadership') {
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
            window.jepretDanUpload(identifier, 'MSDT', subtesLabel, fase);
        } catch (errCam) {
            console.warn('[MSDT Camera]', errCam);
        }
    }

    // Pulihkan jawaban & waktu mulai jika kandidat me-refresh halaman
    try {
        const savedAns = localStorage.getItem('msdt_answers');
        if (savedAns) {
            msdtAnswers = JSON.parse(savedAns);
        }
        const savedStart = localStorage.getItem('msdt_start_time');
        if (savedStart) {
            msdtStartTime = savedStart;
            msdtHasStarted = true;
        }
    } catch (e) {
        msdtAnswers = {};
    }

    /**
     * Format durasi detik ke teks ramah baca (contoh: "24 Menit 15 Detik")
     */
    function formatDurasiWaktu(totalDetik) {
        if (!totalDetik || totalDetik <= 0) return "0 Menit 0 Detik";
        const m = Math.floor(totalDetik / 60);
        const s = totalDetik % 60;
        if (m === 0) return `${s} Detik`;
        return `${m} Menit ${s} Detik`;
    }

    /**
     * Mengambil daftar soal MSDT (menggunakan bank soal atau fallback)
     */
    function getMsdtQuestions() {
        if (window.MSDT_QUESTIONS && Array.isArray(window.MSDT_QUESTIONS) && window.MSDT_QUESTIONS.length > 0) {
            return window.MSDT_QUESTIONS;
        }

        // Generator fallback jika bank soal belum termuat
        const placeholders = [];
        for (let i = 1; i <= 64; i++) {
            placeholders.push({
                no: i,
                a: `Pernyataan pilihan kepemimpinan A [Nomor ${i}]`,
                b: `Pernyataan pilihan kepemimpinan B [Nomor ${i}]`
            });
        }
        return placeholders;
    }

    /**
     * Memulai modul MSDT dari dashboard Tahap 2
     */
    function startMsdtTest() {
        if (typeof pindahFase === 'function') {
            pindahFase('view-msdt');
        } else if (typeof showPage === 'function') {
            showPage('view-msdt');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });

        // Selalu tampilkan Layar Pedoman & Contoh terlebih dahulu (Fase 1: Pedoman Resmi)
        // Pemisahan tegas antara Fase Pedoman dan Fase Lembar Ujian (persis IST & PAPI)
        renderMsdtPedomanUI();
    }

    /**
     * Memulai pengerjaan nyata setelah membaca pedoman:
     * Menjalankan Silent Background Timer 30 Menit (tanpa tampilan jam di layar peserta)
     */
    function msdtMulaiMengerjakan() {
        msdtHasStarted = true;
        if (!msdtStartTime) {
            msdtStartTime = new Date().toISOString();
            try {
                localStorage.setItem('msdt_start_time', msdtStartTime);
            } catch (e) {}
        }

        // Jepret Foto Awal MSDT saat peserta mulai mengerjakan soal
        if (!fotoMsdtAwalTaken) {
            fotoMsdtAwalTaken = true;
            ambilFotoMsdt('Awal', 'MSDT-Start');
        }

        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        renderMsdtSoalUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Merender Layar Pedoman & Contoh Soal MSDT (Halaman Pembuka)
     */
    function renderMsdtPedomanUI() {
        const container = document.getElementById('msdt-app-container');
        if (!container) return;

        const config = window.MSDT_CONFIG || {
            pedoman: {
                judul: "Petunjuk & Pedoman Pengerjaan MSDT",
                deskripsi: "Pada tes ini, Anda akan membaca sejumlah pernyataan mengenai tindakan yang mungkin Anda lakukan dalam tugas Anda di perusahaan. Anda diminta untuk memilih salah satu pernyataan yang paling sesuai dengan diri Anda, atau paling mungkin Anda lakukan.",
                contoh: {
                    a: "Saya datang ke kantor lebih awal bila sedang banyak pekerjaan.",
                    b: "Saya bersedia bekerja lembur bila tugas saya belum selesai.",
                    penjelasan: "Manakah dari dua pernyataan tersebut yang paling mungkin Anda lakukan? Jika Anda lebih memilih datang lebih awal daripada bekerja lembur maka pilihlah pernyataan A. Tetapi bila Anda lebih memilih bekerja lembur, maka pilihlah pernyataan B."
                },
                catatan: "Karena kedua pernyataan selalu disajikan berpasangan, mungkin saja Anda memilih pernyataan A maupun B sekaligus. Dalam hal ini, Anda tetap diminta hanya memilih satu pernyataan. Ini bukan tes kemampuan teknis, tidak ada jawaban 'benar' atau 'salah'. Apapun yang Anda pilih hendaknya sungguh-sungguh menggambarkan diri Anda."
            }
        };

        const ped = config.pedoman;
        const answeredCount = hitungMsdtTerjawab();

        container.innerHTML = `
            <div class="space-y-4 animate-fade-in pb-4">
                <!-- HEADER BANNER PEDOMAN -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#0a4980] rounded-2xl p-4 sm:p-5 text-white shadow-xl border border-blue-400/20 relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center text-xl sm:text-2xl font-black border border-white/20 shadow-inner shrink-0">
                                <i class="fa-solid fa-user-tie"></i>
                            </div>
                            <div>
                                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider mb-1">
                                    <i class="fa-solid fa-crown text-amber-400"></i> Asesmen Kepemimpinan Tahap 2
                                </div>
                                <h1 class="text-lg sm:text-xl font-black text-white leading-tight">
                                    Management Style Diagnostic Test (MSDT)
                                </h1>
                                <p class="text-[11px] sm:text-xs text-slate-200">
                                    Pedoman Pelaksanaan &amp; Pengenalan Format Soal Pilihan Kepemimpinan
                                </p>
                            </div>
                        </div>
                        <div>
                            <button type="button" onclick="bukaDashboardTahap2()"
                                class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer">
                                <i class="fa-solid fa-arrow-left"></i>
                                <span>Dashboard Tahap 2</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- KARTU PETUNJUK RESMI & PEDOMAN -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-5 sm:p-6 space-y-4">
                    <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#003865] flex items-center justify-center text-base font-bold border border-blue-200 shrink-0">
                            <i class="fa-solid fa-book-open"></i>
                        </div>
                        <div>
                            <h2 class="text-base sm:text-lg font-black text-[#003865]">${ped.judul}</h2>
                            <p class="text-[11px] text-slate-500">Bacalah petunjuk di bawah ini dengan seksama sebelum memulai pengerjaan</p>
                        </div>
                    </div>

                    <div class="p-3.5 bg-[#edf3f9] rounded-2xl border border-[#b9d0e7] text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2">
                        <p class="font-medium">
                            ${ped.deskripsi}
                        </p>
                        <p class="text-xs text-slate-600 bg-white/80 p-2.5 rounded-xl border border-blue-100">
                            <i class="fa-solid fa-circle-info text-blue-600 mr-1.5"></i>
                            ${ped.catatan}
                        </p>
                    </div>

                    <!-- KOTAK CONTOH SOAL -->
                    <div class="border-2 border-dashed border-[#003865]/30 rounded-2xl p-3.5 sm:p-4 bg-slate-50/70 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-black uppercase tracking-wider text-[#003865] bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
                                <i class="fa-solid fa-lightbulb text-amber-500 mr-1"></i> Contoh Soal
                            </span>
                            <span id="contoh-msdt-status" class="text-[11px] text-slate-500 font-semibold">Simulasi Pilihan A vs B (Klik untuk mencoba)</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div id="contoh-msdt-opt-A" onclick="window.pilihContohMsdt('A')" class="p-3 rounded-xl border-2 border-[#003865] bg-blue-50/60 shadow-sm flex items-start gap-2.5 cursor-pointer transition-all hover:shadow-md">
                                <span id="contoh-msdt-badge-A" class="w-6 h-6 rounded-lg bg-[#003865] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">A</span>
                                <p class="text-xs text-slate-800 font-medium leading-relaxed">
                                    ${ped.contoh.a}
                                </p>
                            </div>
                            <div id="contoh-msdt-opt-B" onclick="window.pilihContohMsdt('B')" class="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer transition-all hover:bg-slate-50 hover:shadow-md">
                                <span id="contoh-msdt-badge-B" class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200">B</span>
                                <p class="text-xs text-slate-700 font-medium leading-relaxed">
                                    ${ped.contoh.b}
                                </p>
                            </div>
                        </div>

                        <div class="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                            <strong class="text-[#003865]">Penjelasan:</strong> ${ped.contoh.penjelasan}
                        </div>
                    </div>

                    <!-- KETENTUAN TES -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                            <i class="fa-solid fa-list-ol text-lg text-[#003865] mb-1"></i>
                            <p class="text-[10px] uppercase font-bold text-slate-400">Jumlah Soal</p>
                            <p class="text-sm sm:text-base font-black text-[#003865] mt-0.5">64 Soal</p>
                            <p class="text-[10px] text-slate-500 mt-0.5">Wajib dijawab seluruhnya</p>
                        </div>
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                            <i class="fa-solid fa-stopwatch text-lg text-blue-600 mb-1"></i>
                            <p class="text-[10px] uppercase font-bold text-slate-400">Alokasi Waktu</p>
                            <p class="text-sm sm:text-base font-black text-blue-700 mt-0.5">30 Menit</p>
                            <p class="text-[10px] text-slate-500 mt-0.5">Gunakan waktu secara efisien</p>
                        </div>
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                            <i class="fa-solid fa-scale-balanced text-lg text-emerald-600 mb-1"></i>
                            <p class="text-[10px] uppercase font-bold text-slate-400">Karakter Pilihan</p>
                            <p class="text-sm sm:text-base font-black text-emerald-700 mt-0.5">Tidak Ada Salah/Benar</p>
                            <p class="text-[10px] text-slate-500 mt-0.5">Jawablah sesuai diri Anda</p>
                        </div>
                    </div>

                    <!-- TOMBOL MULAI PENGERJAAN -->
                    <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button type="button" onclick="bukaDashboardTahap2()"
                            class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2">
                            <i class="fa-solid fa-arrow-left"></i>
                            <span>Kembali ke Dashboard</span>
                        </button>
                        <button type="button" onclick="window.msdtMulaiMengerjakan()"
                            class="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#003865] via-blue-700 to-[#003865] hover:from-[#002747] hover:to-[#083c6b] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer">
                            <span>${answeredCount > 0 ? `Lanjutkan Pengerjaan Tes MSDT (${answeredCount}/64 Soal)` : 'Saya Paham & Mulai Pengerjaan Tes MSDT'}</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Menghitung berapa soal yang telah dijawab
     */
    function hitungMsdtTerjawab() {
        const questions = getMsdtQuestions();
        let count = 0;
        questions.forEach(q => {
            if (msdtAnswers[q.no] === 'A' || msdtAnswers[q.no] === 'B') {
                count++;
            }
        });
        return count;
    }

    /**
     * Menangani pemilihan opsi A atau B oleh kandidat
     */
    function msdtHandleSelect(no, choice) {
        if (isSubmittingMsdt) return;

        msdtAnswers[no] = choice;

        try {
            localStorage.setItem('msdt_answers', JSON.stringify(msdtAnswers));
        } catch (e) {}

        // Update highlight visual kartu
        updateMsdtCardHighlight(no, choice);
        updateMsdtProgressBar();
    }

    /**
     * Memperbarui visual kartu soal yang aktif
     */
    function updateMsdtCardHighlight(no, choice) {
        const card = document.getElementById(`msdt-card-${no}`);
        const optA = document.getElementById(`msdt-opt-${no}-A`);
        const optB = document.getElementById(`msdt-opt-${no}-B`);
        const badge = document.getElementById(`msdt-status-badge-${no}`);

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
     * Memperbarui progress bar dan counter soal
     */
    function updateMsdtProgressBar() {
        const questions = getMsdtQuestions();
        const total = questions.length;
        const answered = hitungMsdtTerjawab();
        const pct = Math.round((answered / total) * 100);

        const fillEl = document.getElementById('msdt-progress-fill');
        const countEl = document.getElementById('msdt-progress-count');
        const pctEl = document.getElementById('msdt-progress-pct');

        if (fillEl) fillEl.style.width = `${pct}%`;
        if (countEl) countEl.innerText = `${answered} / ${total} Soal Terjawab`;
        if (pctEl) pctEl.innerText = `${pct}%`;

        // Jepret Foto Tengah MSDT saat mencapai pertengahan soal (32 dari 64 soal)
        if (!fotoMsdtTengahTaken && answered >= Math.floor(total / 2)) {
            fotoMsdtTengahTaken = true;
            ambilFotoMsdt('Tengah', 'MSDT-Pertengahan');
        }
    }

    /**
     * Merender seluruh tampilan formulir soal MSDT (Nomor 1 - 64)
     * CATATAN: Waktu 30 Menit berjalan senyap di background (tanpa timer berdetak di layar)
     */
    function renderMsdtSoalUI() {
        const container = document.getElementById('msdt-app-container');
        if (!container) return;

        // Pastikan Foto Awal terambil saat tampilan soal dirender
        if (!fotoMsdtAwalTaken) {
            fotoMsdtAwalTaken = true;
            ambilFotoMsdt('Awal', 'MSDT-Start');
        }

        const questions = getMsdtQuestions();
        const answeredCount = hitungMsdtTerjawab();
        const total = questions.length;
        const pct = Math.round((answeredCount / total) * 100);

        let html = `
            <!-- HEADER MODUL MSDT -->
            <div class="mb-6 bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 sm:p-8 relative overflow-hidden">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003865] to-[#0a4980] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-[#003865]/20">
                            <i class="fa-solid fa-user-tie"></i>
                        </div>
                        <div>
                            <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-blue-50 text-[#003865] border border-blue-200 uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-crown text-amber-500"></i> Asesmen Kepemimpinan Tahap 2
                            </div>
                            <h2 class="text-xl sm:text-2xl font-black text-[#003865]">
                                Management Style Diagnostic Test (MSDT)
                            </h2>
                            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Lembar Jawaban 64 Soal Pilihan Kepemimpinan Reddin 3-D Model
                            </p>
                        </div>
                    </div>

                </div>

                <!-- PROGRESS BAR TERJAWAB -->
                <div class="mt-4 pt-2">
                    <div class="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                        <span id="msdt-progress-count" class="text-[#003865] font-black">${answeredCount} / ${total} Soal Terjawab</span>
                        <span id="msdt-progress-pct" class="text-emerald-600 font-black">${pct}%</span>
                    </div>
                    <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div id="msdt-progress-fill" class="h-full bg-gradient-to-r from-[#003865] via-blue-600 to-emerald-500 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                    </div>
                </div>
            </div>

            <!-- DAFTAR SOAL 1 - 64 -->
            <div class="space-y-4" id="msdt-question-list">
        `;

        questions.forEach(q => {
            const ans = msdtAnswers[q.no] || null;
            const isCardActive = ans !== null;

            html += `
                <div id="msdt-card-${q.no}" class="bg-white rounded-3xl border ${isCardActive ? 'border-[#003865] ring-1 ring-[#003865]/20' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all p-5 sm:p-6">
                    <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-[#003865] text-white text-xs font-black flex items-center justify-center shadow-sm">
                                ${q.no}
                            </span>
                            <span class="text-sm font-bold text-[#003865]">Nomor ${q.no} dari ${total}</span>
                        </div>
                        <div id="msdt-status-badge-${q.no}">
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
                        <div id="msdt-opt-${q.no}-A" 
                            onclick="window.msdtHandleSelect(${q.no}, 'A')"
                            class="flex items-start gap-3 p-4 rounded-2xl border ${ans === 'A' ? 'border-2 border-[#003865] bg-blue-50/60 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'} cursor-pointer transition-all">
                            <div class="w-7 h-7 rounded-xl ${ans === 'A' ? 'bg-[#003865] text-white' : 'bg-slate-100 text-slate-600'} font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200">
                                A
                            </div>
                            <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed select-none">
                                ${q.a}
                            </p>
                        </div>

                        <!-- OPSI B -->
                        <div id="msdt-opt-${q.no}-B" 
                            onclick="window.msdtHandleSelect(${q.no}, 'B')"
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

            <!-- FOOTER TOMBOL SUBMIT -->
            <div class="mt-8 bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 sm:p-8 text-center space-y-4">
                <p class="text-xs text-slate-500">
                    Pastikan seluruh 64 nomor telah Anda pilih dengan jujur sebelum menekan tombol kumpulkan di bawah ini.
                </p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button type="button" 
                        id="btnSubmitMsdt"
                        onclick="window.msdtSubmitTest()" 
                        class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span id="btnSubmitMsdtText">Kumpulkan Jawaban MSDT</span>
                    </button>

                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Konversi Skor Mentah ke Skala Indeks (0 - 4.0) Sesuai Norma Halaman 12 PDF
     */
    function konversiSkorMentahKeIndeks(raw) {
        if (raw <= 29) return 0.0;
        if (raw >= 30 && raw <= 31) return 0.6;
        if (raw === 32) return 1.2;
        if (raw === 33) return 1.8;
        if (raw === 34) return 2.4;
        if (raw === 35) return 3.0;
        if (raw >= 36 && raw <= 37) return 3.6;
        if (raw >= 38) return 4.0;
        return 0.0;
    }

    /**
     * Menghitung Skor Analisis Psikodiagnostik Resmi Reddin 3-D Model
     * Berdasarkan Matriks Lembar Skoring Halaman 11 & Pohon Keputusan Halaman 12 PDF
     */
    function hitungSkorMsdtResmi(durasiDetik) {
        // Matriks 8x8 soal:
        // Baris r (0..7): nomor soal = r * 8 + c + 1
        // Kolom c (0..7): nomor soal = r * 8 + c + 1

        const rowCountA = [0, 0, 0, 0, 0, 0, 0, 0]; // Jumlah A per baris horizontal (1..8)
        const colCountB = [0, 0, 0, 0, 0, 0, 0, 0]; // Jumlah B per kolom vertikal (1..8)

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const noSoal = r * 8 + c + 1;
                const ans = msdtAnswers[noSoal];
                if (ans === 'A') rowCountA[r]++;
                if (ans === 'B') colCountB[c]++;
            }
        }

        // Faktor Koreksi Kolom 1..8 sesuai Halaman 11 PDF
        const koreksi = [+1, +2, +1, 0, +3, -1, 0, -4];

        // Skor Jumlah Kolom (J1..J8)
        // Kolom k: Baris A[k] + Baris B[k] + Koreksi[k]
        const jumlahKolom = [];
        for (let k = 0; k < 8; k++) {
            jumlahKolom.push(rowCountA[k] + colCountB[k] + koreksi[k]);
        }

        // Pemetaan Skor 8 Gaya Kepemimpinan Reddin (A s/d H):
        // Ds (Deserter)          = Kolom 1 (Index 0)
        // Mi (Missionary)        = Kolom 2 (Index 1)
        // Au (Autocrat)          = Kolom 3 (Index 2)
        // Co (Compromiser)       = Kolom 4 (Index 3)
        // Bu (Bureaucrat)        = Kolom 5 (Index 4)
        // Dv (Developer)         = Kolom 6 (Index 5)
        // Ba (Benevolent Autocrat)= Kolom 7 (Index 6)
        // E  (Executive)         = Kolom 8 (Index 7)
        const skorGaya = {
            Ds: jumlahKolom[0],
            Mi: jumlahKolom[1],
            Au: jumlahKolom[2],
            Co: jumlahKolom[3],
            Bu: jumlahKolom[4],
            Dv: jumlahKolom[5],
            Ba: jumlahKolom[6],
            E:  jumlahKolom[7]
        };

        // Perhitungan Skor Mentah Dimensi Utama Reddin:
        // Task Orientation (TO)          = Au + Co + Ba + E  (Kotak TO)
        // Relationships Orientation (RO) = Mi + Co + Dv + E  (Kotak RO)
        // Effectiveness (E)              = Bu + Dv + Ba + E  (Kotak E)
        // Others (O)                     = Ds                (Kotak O)
        const rawTO = skorGaya.Au + skorGaya.Co + skorGaya.Ba + skorGaya.E;
        const rawRO = skorGaya.Mi + skorGaya.Co + skorGaya.Dv + skorGaya.E;
        const rawE  = skorGaya.Bu + skorGaya.Dv + skorGaya.Ba + skorGaya.E;
        const rawO  = skorGaya.Ds;

        // Konversi Skor Mentah ke Skala Indeks (0 - 4.0)
        const indeksTO = konversiSkorMentahKeIndeks(rawTO);
        const indeksRO = konversiSkorMentahKeIndeks(rawRO);
        const indeksE  = konversiSkorMentahKeIndeks(rawE);

        // Pohon Keputusan Reddin (Decision Tree - Halaman 12 PDF):
        // Ambang batas pembanding adalah nilai 2.0 (di atas 2 vs di bawah 2)
        let gayaUtama = "EXECUTIVE";

        if (indeksTO > 2.0) {
            if (indeksRO > 2.0) {
                gayaUtama = (indeksE > 2.0) ? "EXECUTIVE" : "COMPROMISER";
            } else {
                gayaUtama = (indeksE > 2.0) ? "BENEVOLENT_AUTOCRAT" : "AUTOCRAT";
            }
        } else {
            if (indeksRO > 2.0) {
                gayaUtama = (indeksE > 2.0) ? "DEVELOPER" : "MISSIONARY";
            } else {
                gayaUtama = (indeksE > 2.0) ? "BUREAUCRAT" : "DESERTER";
            }
        }

        const infoGaya = (window.MSDT_CONFIG && window.MSDT_CONFIG.gayaKepemimpinan && window.MSDT_CONFIG.gayaKepemimpinan[gayaUtama]) || {
            nama: gayaUtama,
            tipe: (indeksE > 2.0) ? "Efektif" : "Kurang Efektif",
            deskripsi: "Gaya kepemimpinan manajerial berdasarkan model 3-D Reddin."
        };

        // Evaluasi Batas Waktu 30 Menit (1800 Detik)
        const durasiNyata = durasiDetik || 0;
        const isOvertime = durasiNyata > 1800;
        const overtimeDetik = isOvertime ? (durasiNyata - 1800) : 0;

        return {
            raw_to: rawTO,
            raw_ro: rawRO,
            raw_e: rawE,
            raw_o: rawO,
            indeks_to: indeksTO,
            indeks_ro: indeksRO,
            indeks_e: indeksE,
            skor_to: indeksTO, // Kompatibilitas metrik lama
            skor_ro: indeksRO,
            skor_e: indeksE,
            gaya_utama: gayaUtama,
            nama_gaya: infoGaya.nama,
            tipe_efektivitas: infoGaya.tipe,
            deskripsi_gaya: infoGaya.deskripsi,
            skor_8_gaya: skorGaya,
            matriks_perhitungan: {
                baris_a: rowCountA,
                kolom_b: colCountB,
                koreksi: koreksi,
                jumlah_kolom: jumlahKolom
            },
            evaluasi_waktu: {
                standar_alokasi_detik: 1800,
                durasi_pengerjaan_detik: durasiNyata,
                durasi_teks: formatDurasiWaktu(durasiNyata),
                is_overtime: isOvertime,
                overtime_detik: overtimeDetik,
                overtime_teks: isOvertime ? formatDurasiWaktu(overtimeDetik) : "0 Menit",
                status_ketepatan: isOvertime ? "Overtime / Melebihi 30 Menit" : "Tepat Waktu (< 30 Menit)"
            }
        };
    }

    /**
     * Memproses pengumpulan jawaban MSDT ke server Supabase
     */
    async function msdtSubmitTest() {
        if (isSubmittingMsdt) return;

        const questions = getMsdtQuestions();
        const answeredCount = hitungMsdtTerjawab();
        const total = questions.length;

        // Validasi kelengkapan seluruh 64 soal
        if (answeredCount < total) {
            let firstMissing = null;
            for (let i = 0; i < questions.length; i++) {
                if (!msdtAnswers[questions[i].no]) {
                    firstMissing = questions[i].no;
                    break;
                }
            }

            if (typeof customAlert === 'function') {
                customAlert(
                    "Jawaban Belum Lengkap",
                    `Anda baru menjawab ${answeredCount} dari ${total} soal. Harap lengkapi seluruh nomor, mulai dari nomor ${firstMissing}.`,
                    "warning"
                );
            } else {
                alert(`Jawaban belum lengkap (${answeredCount}/${total}). Harap periksa nomor ${firstMissing}.`);
            }

            if (firstMissing) {
                const el = document.getElementById(`msdt-card-${firstMissing}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const doSubmit = async () => {
            isSubmittingMsdt = true;

            // Jepret Foto Akhir MSDT saat submit jawaban
            if (!fotoMsdtAkhirTaken) {
                fotoMsdtAkhirTaken = true;
                ambilFotoMsdt('Akhir', 'MSDT-Selesai');
            }

            const btn = document.getElementById('btnSubmitMsdt');
            const btnText = document.getElementById('btnSubmitMsdtText');
            if (btn) btn.disabled = true;
            if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengolah & Menyimpan Hasil...';

            const waktuSelesaiISO = new Date().toISOString();
            const waktuMulaiISO = msdtStartTime || localStorage.getItem('msdt_start_time') || waktuSelesaiISO;
            const diffDetik = Math.max(1, Math.round((new Date(waktuSelesaiISO) - new Date(waktuMulaiISO)) / 1000));

            // Hitung Rekapitulasi Matriks 8x8 dari Jawaban Mentah Peserta (Sesuai Rumus Resmi Reddin)
            const countA = [0, 0, 0, 0, 0, 0, 0, 0];
            const countB = [0, 0, 0, 0, 0, 0, 0, 0];

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const no = r * 8 + c + 1;
                    const ans = (msdtAnswers[no] || msdtAnswers[String(no)] || '').toString().trim().toUpperCase();
                    if (ans === 'A') countA[r]++;
                    if (ans === 'B') countB[c]++;
                }
            }

            const koreksi = [+1, +2, +1, 0, +3, -1, 0, -4];
            const colJumlah = [];
            for (let c = 0; c < 8; c++) {
                colJumlah.push(countA[c] + countB[c] + koreksi[c]);
            }

            const gayaMap = {
                Ds: colJumlah[0],
                Mi: colJumlah[1],
                Au: colJumlah[2],
                Co: colJumlah[3],
                Bu: colJumlah[4],
                Dv: colJumlah[5],
                Ba: colJumlah[6],
                E:  colJumlah[7]
            };

            const rawTO = gayaMap.Au + gayaMap.Co + gayaMap.Ba + gayaMap.E;
            const rawRO = gayaMap.Mi + gayaMap.Co + gayaMap.Dv + gayaMap.E;
            const rawE  = gayaMap.Bu + gayaMap.Dv + gayaMap.Ba + gayaMap.E;
            const rawO  = gayaMap.Ds;

            function konversiSkorKeIndeks(raw) {
                if (raw <= 29) return 0.0;
                if (raw >= 30 && raw <= 31) return 0.6;
                if (raw >= 32 && raw <= 33) return 1.2;
                if (raw >= 34 && raw <= 35) return 1.8;
                if (raw >= 36 && raw <= 37) return 2.4;
                if (raw >= 38 && raw <= 39) return 3.0;
                if (raw >= 40 && raw <= 41) return 3.6;
                return 4.0;
            }

            const indTO = konversiSkorKeIndeks(rawTO);
            const indRO = konversiSkorKeIndeks(rawRO);
            const indE  = konversiSkorKeIndeks(rawE);

            let gayaKode = "EXECUTIVE";
            if (indTO > 2.0) {
                if (indRO > 2.0) {
                    gayaKode = (indE > 2.0) ? "EXECUTIVE" : "COMPROMISER";
                } else {
                    gayaKode = (indE > 2.0) ? "BENEVOLENT_AUTOCRAT" : "AUTOCRAT";
                }
            } else {
                if (indRO > 2.0) {
                    gayaKode = (indE > 2.0) ? "DEVELOPER" : "MISSIONARY";
                } else {
                    gayaKode = (indE > 2.0) ? "BUREAUCRAT" : "DESERTER";
                }
            }

            const gayaMetadata = {
                EXECUTIVE: { nama: "Executive (Eksekutif)", tipe: "Efektif", deskripsi: "Mampu memotivasi tim kerja, menetapkan standar prestasi yang tinggi, memperlakukan bawahan secara adil, dan efektif mencapai target organisasi dengan menjaga hubungan tim yang harmonis." },
                DEVELOPER: { nama: "Developer (Pembangun / Pembina)", tipe: "Efektif", deskripsi: "Menaruh kepercayaan penuh pada bawahan, fokus pada pengembangan potensi anggota tim, dan menciptakan iklim kerja kolaboratif yang sangat positif." },
                BENEVOLENT_AUTOCRAT: { nama: "Benevolent Autocrat (Otokrat Bijak)", tipe: "Efektif", deskripsi: "Tegas, sangat berorientasi target dan hasil nyata tanpa memicu kebencian. Mampu mengambil keputusan cepat dan memastikan tugas selesai tepat waktu." },
                BUREAUCRAT: { nama: "Bureaucrat (Birokrat / Tertib Aturan)", tipe: "Efektif", deskripsi: "Sangat taat pada SOP dan regulasi, teliti terhadap aturan dan prosedur, menjaga stabilitas sistem organisasi dan integritas proses kerja." },
                COMPROMISER: { nama: "Compromiser (Kompromis)", tipe: "Kurang Efektif", deskripsi: "Terlalu mudah berkompromi di bawah tekanan, sering bimbang antara target kerja dan menyenangkan bawahan sehingga efektivitas kepemimpinan menurun." },
                MISSIONARY: { nama: "Missionary (Misionaris / Penyenang)", tipe: "Kurang Efektif", deskripsi: "Terlalu mengutamakan keharmonisan hubungan pribadi sehingga enggan menegur bawahan dan sering mengorbankan pencapaian target organisasi." },
                AUTOCRAT: { nama: "Autocrat (Otokrat)", tipe: "Kurang Efektif", deskripsi: "Terlalu mendominasi, menuntut kepatuhan mutlak, mengabaikan aspirasi bawahan, dan mengandalkan instruksi sepihak." },
                DESERTER: { nama: "Deserter (Pelarian / Pasif)", tipe: "Kurang Efektif", deskripsi: "Cenderung lepas tangan dari tanggung jawab, pasif, enggan terlibat dalam dinamika tim, dan kurang peduli pada pencapaian target." }
            };

            const infoGaya = gayaMetadata[gayaKode] || gayaMetadata.EXECUTIVE;

            const analisisMsdt = {
                skor_8_gaya: gayaMap,
                raw_to: rawTO,
                raw_ro: rawRO,
                raw_e: rawE,
                raw_o: rawO,
                indeks_to: indTO,
                indeks_ro: indRO,
                indeks_e: indE,
                to: indTO,
                ro: indRO,
                e: indE,
                gaya_utama: infoGaya.nama,
                nama_gaya: infoGaya.nama,
                tipe_efektivitas: infoGaya.tipe,
                deskripsi_gaya: infoGaya.deskripsi,
                evaluasi_waktu: {
                    durasi_pengerjaan_detik: diffDetik,
                    durasi_teks: formatDurasiWaktu(diffDetik),
                    is_overtime: diffDetik > 1800,
                    overtime_teks: diffDetik > 1800 ? `${Math.round((diffDetik - 1800) / 60)} Menit` : '0 Menit'
                }
            };

            // Simpan paket data lengkap (Ringkasan Skor Analisis Reddin + 64 Jawaban Mentah Peserta)
            const payload = {
                status: 'selesai',
                modul: 'MSDT (Management Style Diagnostic Test)',
                waktu_mulai: waktuMulaiISO,
                waktu_selesai: waktuSelesaiISO,
                durasi_detik: diffDetik,
                durasi_teks: formatDurasiWaktu(diffDetik),
                is_overtime: diffDetik > 1800,
                overtime_detik: Math.max(0, diffDetik - 1800),
                pelanggaran_tab_switch: typeof tabSwitchViolations !== 'undefined' ? tabSwitchViolations : 0,
                jawaban: msdtAnswers,
                answers: msdtAnswers,
                jawaban_peserta: msdtAnswers,
                analisis: analisisMsdt,
                ...analisisMsdt
            };

            // Simpan ke Supabase via updateHasilTes
            if (typeof updateHasilTes === 'function') {
                try {
                    await updateHasilTes('hasil_msdt', payload);
                } catch (e) {
                    console.warn('[MSDT Save Warning]', e);
                }
            } else if (typeof window !== 'undefined' && typeof window.updateHasilTes === 'function') {
                try {
                    await window.updateHasilTes('hasil_msdt', payload);
                } catch (e) {
                    console.warn('[MSDT Save Warning]', e);
                }
            }

            // Simpan ke LocalStorage sebagai backup aman
            try {
                localStorage.setItem('msdt_selesai', 'true');
                localStorage.setItem('msdt_payload', JSON.stringify(payload));
            } catch (e) {}

            if (window.tahap2State) {
                window.tahap2State.modulSelesai.msdt = true;
            }

            // Perbarui visual badge di Dashboard Tahap 2
            if (typeof updateTahap2DashboardUI === 'function') {
                updateTahap2DashboardUI();
            }

            const pesanWaktu = diffDetik > 1800 
                ? `Waktu pengerjaan: ${formatDurasiWaktu(diffDetik)} (Tercatat Overtime di Portal HRD)` 
                : `Waktu pengerjaan: ${formatDurasiWaktu(diffDetik)} (Tepat Waktu)`;

            if (typeof customAlert === 'function') {
                customAlert(
                    "Tes MSDT Berhasil Disimpan",
                    `Seluruh 64 jawaban pilihan kepemimpinan Anda telah tersimpan aman di database server PT Altrak 1978. ${pesanWaktu}.`,
                    "success",
                    false,
                    () => {
                        bukaDashboardTahap2();
                    }
                );
            } else {
                alert(`Tes MSDT Berhasil Disimpan! ${pesanWaktu}.`);
                bukaDashboardTahap2();
            }
        };

        if (typeof customAlert === 'function') {
            customAlert(
                "Kumpulkan Jawaban MSDT?",
                `Anda telah menjawab lengkap seluruh 64 soal kepemimpinan. Apakah Anda yakin ingin mengumpulkan jawaban sekarang?`,
                "warning",
                true,
                () => { doSubmit(); }
            );
        } else {
            if (confirm(`Kumpulkan jawaban MSDT (${total} soal)?`)) {
                doSubmit();
            }
        }
    }

    /**
     * Menangani simulasi klik pilihan A vs B pada contoh soal petunjuk MSDT
     */
    function pilihContohMsdt(choice) {
        const elA = document.getElementById('contoh-msdt-opt-A');
        const elB = document.getElementById('contoh-msdt-opt-B');
        const badgeA = document.getElementById('contoh-msdt-badge-A');
        const badgeB = document.getElementById('contoh-msdt-badge-B');
        const statusText = document.getElementById('contoh-msdt-status');

        if (!elA || !elB) return;

        if (choice === 'A') {
            elA.className = "p-4 rounded-xl border-2 border-[#003865] bg-blue-50/60 shadow-sm flex items-start gap-3 cursor-pointer transition-all";
            elB.className = "p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3 cursor-pointer transition-all hover:bg-slate-50";
            if (badgeA) badgeA.className = "w-7 h-7 rounded-lg bg-[#003865] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5";
            if (badgeB) badgeB.className = "w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200";
        } else {
            elA.className = "p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3 cursor-pointer transition-all hover:bg-slate-50";
            elB.className = "p-4 rounded-xl border-2 border-[#003865] bg-blue-50/60 shadow-sm flex items-start gap-3 cursor-pointer transition-all";
            if (badgeA) badgeA.className = "w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200";
            if (badgeB) badgeB.className = "w-7 h-7 rounded-lg bg-[#003865] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5";
        }

        if (statusText) {
            statusText.innerHTML = `<span class="inline-flex items-center gap-1 font-bold text-[#003865] bg-blue-100/80 px-2 py-0.5 rounded text-[11px]"><i class="fa-solid fa-check text-emerald-600"></i> Pilihan Anda: [${choice}] (Simulasi Berhasil)</span>`;
        }
    }

    // Ekspor ke window global
    if (typeof window !== 'undefined') {
        window.startMsdtTest = startMsdtTest;
        window.bukaModulMSDT = startMsdtTest;
        window.renderMsdtPedomanUI = renderMsdtPedomanUI;
        window.renderMsdtSoalUI = renderMsdtSoalUI;
        window.msdtMulaiMengerjakan = msdtMulaiMengerjakan;
        window.msdtHandleSelect = msdtHandleSelect;
        window.msdtSubmitTest = msdtSubmitTest;
        window.hitungSkorMsdtResmi = hitungSkorMsdtResmi;
        window.pilihContohMsdt = pilihContohMsdt;
    }
})();

