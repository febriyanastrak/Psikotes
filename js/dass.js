// =========================================================================
// MODUL LOGIKA & TAMPILAN DASS-21 (DEPRESSION ANXIETY STRESS SCALE)
// PT Altrak 1978 - Integrated Psychological Assessment System
// Modul Tes ke-11: Evaluasi Kesehatan Mental, Regulasi Emosi, & Daya Tahan Stres
// Berdasarkan Standar Resmi Lovibond & Lovibond (1995) & 'DASS-21 (1).xlsx'
// Desain: Format Tabel Baris (Side-by-Side), Skala Murni Angka 0 - 3 di Samping Soal
// =========================================================================

(function () {
    'use strict';

    // State jawaban peserta: { "1": 0, "2": 2, ... "21": 3 }
    let dassAnswers = {};
    let isSubmittingDass = false;
    let dassStartTime = null;
    let dassHasStarted = false;

    // Flag snapshot kamera pengawasan DASS-21 (Awal, Tengah, Akhir)
    let fotoDassAwalTaken = false;
    let fotoDassTengahTaken = false;
    let fotoDassAkhirTaken = false;

    // Pelacakan Pelanggaran Keamanan & Tab Switch
    let dassTabViolations = 0;
    const dassViolationLogs = [];

    /**
     * Pengawasan Kamera Otomatis (Proctoring Snapshot) DASS-21
     * Mengambil snapshot kandidat dan mengunggah ke Supabase Storage foto_kandidat/DASS/
     * @param {'Awal'|'Tengah'|'Akhir'} fase 
     * @param {string} subtesLabel 
     */
    function ambilFotoDass(fase = 'Awal', subtesLabel = 'DASS-21-MentalHealth') {
        if (typeof window.jepretDanUpload !== 'function') return;
        let identifier = '';
        try {
            if (typeof state !== 'undefined' && state.user) {
                identifier = state.user.phone || state.user.email || '';
            }
            if (!identifier && typeof localStorage !== 'undefined') {
                identifier = localStorage.getItem('phone_peserta') || localStorage.getItem('email_peserta') || '';
            }
        } catch (e) {
            console.warn('[DASS-21] Gagal membaca user identity:', e);
        }
        try {
            window.jepretDanUpload(identifier, 'DASS', subtesLabel, fase);
        } catch (errCam) {
            console.warn('[DASS Camera]', errCam);
        }
    }

    // Pulihkan jawaban & waktu mulai jika kandidat me-refresh halaman
    try {
        const savedAns = localStorage.getItem('dass_answers');
        if (savedAns) {
            dassAnswers = JSON.parse(savedAns);
        }
        const savedStart = localStorage.getItem('dass_start_time');
        const savedStarted = localStorage.getItem('dass_has_started');
        if (savedStart && savedStarted === 'true') {
            dassStartTime = savedStart;
            dassHasStarted = true;
        }
    } catch (e) {
        dassAnswers = {};
    }

    /**
     * Format durasi detik ke teks naratif (contoh: "3 Menit 45 Detik")
     */
    function formatDurasiWaktu(totalDetik) {
        if (!totalDetik || totalDetik <= 0) return "0 Menit 0 Detik";
        const m = Math.floor(totalDetik / 60);
        const s = totalDetik % 60;
        if (m === 0) return `${s} Detik`;
        return `${m} Menit ${s} Detik`;
    }

    /**
     * Mengambil daftar soal DASS-21 dari global window atau data module
     */
    function getDassQuestions() {
        if (window.DASS_QUESTIONS && Array.isArray(window.DASS_QUESTIONS) && window.DASS_QUESTIONS.length > 0) {
            return window.DASS_QUESTIONS;
        }
        return [];
    }

    /**
     * Hitung jumlah butir yang sudah dijawab
     */
    function hitungDassTerjawab() {
        return Object.keys(dassAnswers).filter(k => dassAnswers[k] !== undefined && dassAnswers[k] !== null && !isNaN(dassAnswers[k])).length;
    }

    /**
     * Inisialisasi pengawasan keamanan tab browser (anti kecurangan)
     */
    function initSecurityMonitoring() {
        const handleVisibilityChange = () => {
            if (!dassHasStarted || isSubmittingDass) return;
            if (document.hidden) {
                dassTabViolations++;
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    tipe: 'TAB_BLUR',
                    deskripsi: `Kandidat berpindah tab atau meminimalkan browser (Pelanggaran ke-${dassTabViolations})`
                };
                dassViolationLogs.push(logEntry);

                // Ambil foto peringatan keamanan
                ambilFotoDass('Tengah', `DASS-Violation-Tab-${dassTabViolations}`);

                if (typeof customAlert === 'function') {
                    customAlert(
                        "Peringatan Integritas Ujian",
                        `Anda terdeteksi berpindah tab/jendela (${dassTabViolations}x). Aktivitas ini dicatat dalam laporan evaluasi HRD PT Altrak 1978. Harap tetap fokus pada lembar asesmen.`,
                        "warning"
                    );
                }
            }
        };

        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Pantau jika stream kamera terputus
        if (window.cameraStream) {
            try {
                const tracks = window.cameraStream.getVideoTracks();
                if (tracks && tracks.length > 0) {
                    tracks.forEach(track => {
                        track.addEventListener('ended', () => {
                            if (!isSubmittingDass && dassHasStarted) {
                                if (typeof tampilkanModalKamera === 'function') {
                                    tampilkanModalKamera("Kamera terputus di tengah Asesmen DASS-21. Harap aktifkan kembali webcam untuk melanjutkan evaluasi klinis.");
                                }
                            }
                        });
                    });
                }
            } catch (err) {
                console.warn('[DASS Proctoring]', err);
            }
        }
    }

    /**
     * Memulai sesi tes DASS-21 dari dashboard
     */
    function startDassTest() {
        console.log('[DASS-21] Membuka modul DASS-21...');

        if (typeof pindahFase === 'function') {
            pindahFase('view-dass');
        } else if (typeof showPage === 'function') {
            showPage('view-dass');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });

        if (!dassHasStarted) {
            dassHasStarted = true;
            dassStartTime = new Date().toISOString();
            try {
                localStorage.setItem('dass_start_time', dassStartTime);
                localStorage.setItem('dass_has_started', 'true');
            } catch (e) {}

            // Ambil foto pengawasan awal
            if (!fotoDassAwalTaken) {
                fotoDassAwalTaken = true;
                setTimeout(() => { ambilFotoDass('Awal', 'DASS-Awal'); }, 1200);
            }
        }

        initSecurityMonitoring();
        renderDassExamUI();
    }

    /**
     * Merender Antarmuka Ujian DASS-21 Format Tabel Baris (Side-by-Side) Persis Spreadsheet
     * Skala Pilihan Murni Angka 0, 1, 2, 3 di Samping Pernyataan (Tanpa Teks Panjang & Tanpa Jam Countdown)
     */
    function renderDassExamUI() {
        const container = document.getElementById('dass-app-container');
        if (!container) return;

        const questions = getDassQuestions();
        const answeredCount = hitungDassTerjawab();
        const total = questions.length || 21;
        const progressPct = Math.round((answeredCount / total) * 100);
        const isComplete = answeredCount === total;

        // Generator Baris Tabel 21 Soal (Side-by-Side: No | Pernyataan | 4 Tombol Angka 0 1 2 3)
        const tableRowsHtml = questions.map((q, idx) => {
            const currentVal = dassAnswers[q.no];
            const isAnswered = currentVal !== undefined && currentVal !== null && !isNaN(currentVal);
            const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';

            // 4 Tombol Angka Murni: [ 0 ] [ 1 ] [ 2 ] [ 3 ]
            const numberButtonsHtml = [0, 1, 2, 3].map(num => {
                const isSelected = isAnswered && currentVal === num;
                const activeBtnClass = isSelected
                    ? "bg-[#003865] text-white border-[#003865] ring-2 ring-[#ffbe1a] shadow-md scale-105 font-black"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-[#003865] font-bold";

                return `
                    <button type="button"
                        onclick="window.dassSelectAnswer(${q.no}, ${num})"
                        class="h-10 sm:h-11 rounded-xl border-2 text-sm sm:text-base transition-all duration-150 flex items-center justify-center cursor-pointer shadow-2xs ${activeBtnClass}">
                        ${num}
                    </button>
                `;
            }).join('');

            return `
                <div id="dass-row-${q.no}" 
                    class="dass-table-row p-4 sm:px-6 sm:py-3.5 transition-colors duration-150 border-b border-slate-200/80 hover:bg-blue-50/40 scroll-mt-36 ${rowBg} ${isAnswered ? 'border-l-4 border-l-[#003865]' : 'border-l-4 border-l-transparent'}">
                    
                    <div class="flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-3 sm:gap-4">
                        <!-- Kolom 1: Nomor Soal (Kiri) -->
                        <div class="flex items-center justify-between sm:justify-center sm:col-span-1">
                            <span class="w-8 h-8 rounded-xl ${isAnswered ? 'bg-[#003865] text-white shadow-xs' : 'bg-slate-100 text-slate-700 border border-slate-200'} font-black text-xs flex items-center justify-center shrink-0">
                                ${q.no}
                            </span>
                            <span class="sm:hidden text-[10px] font-black uppercase tracking-wider ${isAnswered ? 'text-emerald-700' : 'text-slate-400'}">
                                ${isAnswered ? `Skor: ${currentVal} ✓` : 'Belum Diisi'}
                            </span>
                        </div>

                        <!-- Kolom 2: Teks Pernyataan (Tengah) -->
                        <div class="sm:col-span-8 sm:pr-4">
                            <p class="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                                ${q.statement}
                            </p>
                        </div>

                        <!-- Kolom 3: SKOR (0-3) Side-by-Side (Kanan) -->
                        <div class="sm:col-span-3">
                            <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
                                ${numberButtonsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Generator Matriks Navigasi 21 Nomor Soal
        const matrixPills = questions.map(q => {
            const isAns = dassAnswers[q.no] !== undefined && dassAnswers[q.no] !== null && !isNaN(dassAnswers[q.no]);
            const cls = isAns
                ? "bg-[#003865] text-white font-black shadow-xs ring-1 ring-blue-400/30"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200";
            return `
                <button type="button" 
                    onclick="window.dassScrollToQuestion(${q.no})"
                    class="w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${cls}">
                    ${q.no}
                </button>
            `;
        }).join('');

        container.innerHTML = `
            <div class="space-y-6 pb-20">
                <!-- TOP STICKY HEADER & STATUS BAR (TANPA COUNTDOWN JAM) -->
                <div class="sticky top-2 z-40 bg-[#071f38]/95 backdrop-blur-md rounded-3xl border border-blue-400/20 p-4 sm:p-5 text-white shadow-2xl space-y-3">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 rounded-2xl bg-white/10 text-rose-400 border border-white/20 flex items-center justify-center text-xl font-black shadow-inner shrink-0">
                                <i class="fa-solid fa-heart-pulse"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                        Tes 11 Asesmen Psikotes
                                    </span>
                                    <span class="text-xs text-sky-200 font-bold hidden sm:inline">DASS-21 Scale</span>
                                </div>
                            </div>
                        </div>

                        <!-- Status Terjawab & Pengawasan Kamera -->
                        <div class="flex items-center gap-2.5 self-end sm:self-center">
                            <div class="px-3.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5">
                                <i class="fa-solid fa-camera"></i>
                                <span class="hidden sm:inline">Pengawasan Aktif</span>
                            </div>

                            <div class="px-3.5 py-1.5 rounded-xl ${isComplete ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} text-xs font-black flex items-center gap-1.5 transition">
                                <i class="fa-solid fa-check"></i>
                                <span id="dassAnsweredBadge">${answeredCount} / ${total} Terjawab</span>
                            </div>
                        </div>
                    </div>

                    <!-- Progress Bar Garis -->
                    <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div id="dassProgressBar" class="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-full transition-all duration-300 rounded-full" style="width: ${progressPct}%"></div>
                    </div>
                </div>

                <!-- PALET MATRIKS 21 NOMOR SOAL -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] p-5 shadow-sm space-y-3">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-table-cells text-[#003865]"></i>
                            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                                Matriks Navigasi Soal (21 Butir)
                            </span>
                        </div>
                        <span class="text-[11px] text-slate-500">
                            Pilihlah skala <strong>0, 1, 2, atau 3</strong> di samping masing-masing pernyataan. Seluruh butir wajib diisi.
                        </span>
                    </div>

                    <div class="flex flex-wrap gap-2 pt-1">
                        ${matrixPills}
                    </div>
                </div>

                <!-- TABEL UTAMA SIDE-BY-SIDE (PERSIS FORMAT SPREADSHEET / EXCEL) -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] shadow-lg overflow-hidden">
                    <!-- Header Tabel Persis Spreadsheet -->
                    <div class="hidden sm:grid grid-cols-12 items-center bg-[#071f38] text-white py-3.5 px-6 font-black text-xs uppercase tracking-wider border-b border-[#0a4980]">
                        <div class="col-span-1 text-center">NO</div>
                        <div class="col-span-8">STATEMENT (PERNYATAAN)</div>
                        <div class="col-span-3 text-center">
                            <span class="block text-[#ffbe1a]">SKOR (0 - 3)</span>
                            <div class="grid grid-cols-4 gap-2 mt-1.5 px-1 text-xs text-slate-200 font-black">
                                <span>0</span>
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                            </div>
                        </div>
                    </div>

                    <!-- 21 Baris Pernyataan Soal & Pilihan Skala Samping -->
                    <div class="divide-y divide-slate-100">
                        ${tableRowsHtml}
                    </div>
                </div>

                <!-- FOOTER AKSI PENGUMPULAN LEMBAR JAWABAN (WAJIB LENGKAP 100%) -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="space-y-1 text-center sm:text-left">
                        <span class="text-xs font-bold text-slate-500 block">Status Kelengkapan:</span>
                        <div class="text-base sm:text-lg font-black text-[#003865] flex items-center justify-center sm:justify-start gap-2">
                            <span id="dassFooterCount">${answeredCount} dari ${total} Pernyataan Selesai</span>
                            ${isComplete ? '<span class="text-emerald-700 text-xs font-black bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Lengkap 100% ✓</span>' : '<span class="text-amber-700 text-xs font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">Belum Lengkap</span>'}
                        </div>
                    </div>

                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <button type="button"
                            id="btnSubmitDass"
                            onclick="window.dassSubmitTest()"
                            class="w-full sm:w-auto px-8 py-4 ${isComplete ? 'bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white shadow-xl hover:shadow-2xl cursor-pointer' : 'bg-slate-200 hover:bg-slate-300 text-slate-600 border border-slate-300 cursor-pointer'} font-black text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2.5">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <span id="btnSubmitDassText">${isComplete ? 'Kumpulkan Jawaban DASS-21' : `Lengkapi Seluruh Soal (${answeredCount}/${total})`}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Memilih jawaban untuk nomor soal tertentu via klik tombol angka 0, 1, 2, atau 3
     */
    function dassSelectAnswer(questionNo, value) {
        if (isSubmittingDass) return;

        const valNum = Number(value);
        if (isNaN(valNum) || valNum < 0 || valNum > 3) return;

        dassAnswers[questionNo] = valNum;

        // Auto-save ke localStorage
        try {
            localStorage.setItem('dass_answers', JSON.stringify(dassAnswers));
        } catch (e) {}

        // Midpoint Snapshot Kamera Pengawasan jika sudah mencapai separuh soal (>= 11 nomor)
        const answeredCount = hitungDassTerjawab();
        if (answeredCount >= 11 && !fotoDassTengahTaken) {
            fotoDassTengahTaken = true;
            ambilFotoDass('Tengah', 'DASS-Midpoint-Q11');
        }

        // Perbarui tampilan UI
        renderDassExamUI();

        // Auto-scroll halus ke baris soal berikutnya yang belum terjawab
        autoScrollNextUnanswered();
    }

    /**
     * Auto-scroll halus ke kartu baris soal berikutnya yang belum dijawab
     */
    function autoScrollNextUnanswered() {
        const questions = getDassQuestions();
        const nextUnanswered = questions.find(q => dassAnswers[q.no] === undefined || dassAnswers[q.no] === null || isNaN(dassAnswers[q.no]));
        if (nextUnanswered) {
            setTimeout(() => {
                const targetRow = document.getElementById(`dass-row-${nextUnanswered.no}`);
                if (targetRow) {
                    targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 80);
        }
    }

    /**
     * Scroll halus langsung ke baris soal yang dituju dari palet matriks
     */
    function dassScrollToQuestion(questionNo) {
        const targetRow = document.getElementById(`dass-row-${questionNo}`);
        if (targetRow) {
            targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Evaluasi dan kalkulasi skor DASS-21 berdasarkan 3 dimensi (D, A, S)
     */
    function hitungSkorDass(answers = dassAnswers) {
        const subscales = (window.DASS_SUBSCALE_ITEMS) || {
            D: [3, 5, 10, 13, 16, 17, 21],
            A: [2, 4, 7, 9, 15, 19, 20],
            S: [1, 6, 8, 11, 12, 14, 18]
        };

        const severityRanges = (window.DASS_SEVERITY_RANGES) || {
            D: [
                { level: 'NORMAL', min: 0, max: 4, label: 'Normal' },
                { level: 'MILD', min: 5, max: 6, label: 'Ringan (Mild)' },
                { level: 'MODERATE', min: 7, max: 10, label: 'Sedang (Moderate)' },
                { level: 'SEVERE', min: 11, max: 13, label: 'Berat (Severe)' },
                { level: 'EXTREME', min: 14, max: 21, label: 'Sangat Berat (Extreme)' }
            ],
            A: [
                { level: 'NORMAL', min: 0, max: 3, label: 'Normal' },
                { level: 'MILD', min: 4, max: 5, label: 'Ringan (Mild)' },
                { level: 'MODERATE', min: 6, max: 7, label: 'Sedang (Moderate)' },
                { level: 'SEVERE', min: 8, max: 9, label: 'Berat (Severe)' },
                { level: 'EXTREME', min: 10, max: 21, label: 'Sangat Berat (Extreme)' }
            ],
            S: [
                { level: 'NORMAL', min: 0, max: 7, label: 'Normal' },
                { level: 'MILD', min: 8, max: 9, label: 'Ringan (Mild)' },
                { level: 'MODERATE', min: 10, max: 12, label: 'Sedang (Moderate)' },
                { level: 'SEVERE', min: 13, max: 16, label: 'Berat (Severe)' },
                { level: 'EXTREME', min: 17, max: 21, label: 'Sangat Berat (Extreme)' }
            ]
        };

        // Hitung total skor per dimensi
        let rawD = 0, rawA = 0, rawS = 0;
        const detailsD = [], detailsA = [], detailsS = [];

        subscales.D.forEach(no => {
            const val = Number(answers[no] || 0);
            rawD += val;
            detailsD.push({ no, score: val });
        });

        subscales.A.forEach(no => {
            const val = Number(answers[no] || 0);
            rawA += val;
            detailsA.push({ no, score: val });
        });

        subscales.S.forEach(no => {
            const val = Number(answers[no] || 0);
            rawS += val;
            detailsS.push({ no, score: val });
        });

        // Tentukan tingkat keparahan (Severity Level)
        const getLevel = (scaleKey, score) => {
            const ranges = severityRanges[scaleKey] || [];
            const found = ranges.find(r => score >= r.min && score <= r.max);
            return found || { level: 'NORMAL', label: 'Normal', color: '#10b981' };
        };

        const levelD = getLevel('D', rawD);
        const levelA = getLevel('A', rawA);
        const levelS = getLevel('S', rawS);

        // Ambil teks narasi diagnosis klinis resmi dari DASS_NORMA
        let narasiD = "", narasiA = "", narasiS = "";
        if (window.DASS_NORMA) {
            narasiD = (window.DASS_NORMA.D && window.DASS_NORMA.D[String(rawD)]) ? window.DASS_NORMA.D[String(rawD)].desc : "";
            narasiA = (window.DASS_NORMA.A && window.DASS_NORMA.A[String(rawA)]) ? window.DASS_NORMA.A[String(rawA)].desc : "";
            narasiS = (window.DASS_NORMA.S && window.DASS_NORMA.S[String(rawS)]) ? window.DASS_NORMA.S[String(rawS)].desc : "";
        }

        // Hitung Mental Health Stability Index (MHSI) skala 0-100%
        // Skor raw 0 = 100% (Sangat Stabil), Skor raw 63 = 0% (Stres/Kecemasan Ekstrem)
        const totalRaw = rawD + rawA + rawS;
        const stabilityIndex = Math.max(0, Math.min(100, Math.round(100 - (totalRaw / 63) * 100)));

        // Rekomendasi Penempatan Kerja PT Altrak 1978
        let rekomendasiKerja = "";
        let kategoriKebugaran = "";
        if (levelD.level === 'NORMAL' && levelA.level === 'NORMAL' && levelS.level === 'NORMAL') {
            kategoriKebugaran = "Sangat Prima & Resilien (Fit to Work)";
            rekomendasiKerja = "Kandidat memiliki stabilitas psikologis dan regulasi emosi yang sangat matang. Sangat cocok untuk posisi dengan target tinggi, beban kerja dinamis, kepemimpinan, dan tantangan lapangan operasional.";
        } else if (levelD.level === 'NORMAL' && (levelA.level === 'MILD' || levelS.level === 'MILD')) {
            kategoriKebugaran = "Stabil dengan Kewaspadaan Ringan (Fit with Monitoring)";
            rekomendasiKerja = "Kandidat berada dalam kondisi psikologis yang adaptif dengan potensi stres kerja ringan. Direkomendasikan untuk lingkungan kerja kolaboratif dengan pengawasan wajar.";
        } else if (levelD.level === 'MODERATE' || levelA.level === 'MODERATE' || levelS.level === 'MODERATE') {
            kategoriKebugaran = "Memerlukan Penyesuaian Beban Kerja (Conditional)";
            rekomendasiKerja = "Terdapat indikator ketegangan mental tingkat sedang. Disarankan penempatan pada ritme kerja yang terstruktur dan pendampingan mentor berkala.";
        } else {
            kategoriKebugaran = "Perlu Evaluasi Klinis Lanjutan (Need Support)";
            rekomendasiKerja = "Indikator klinis menunjukkan tekanan emosional yang tinggi. Disarankan konsultasi lanjutan dengan psikolog profesional sebelum penugasan kritis.";
        }

        return {
            skor_mentah: {
                depresi: rawD,
                kecemasan: rawA,
                stres: rawS,
                total: totalRaw
            },
            klasifikasi: {
                depresi: levelD,
                kecemasan: levelA,
                stres: levelS
            },
            narasi: {
                depresi: narasiD,
                kecemasan: narasiA,
                stres: narasiS
            },
            indeks_stabilitas: stabilityIndex,
            kategori_kebugaran: kategoriKebugaran,
            rekomendasi_kerja: rekomendasiKerja,
            rincian_jawaban: {
                depresi: detailsD,
                kecemasan: detailsA,
                stres: detailsS
            }
        };
    }

    /**
     * Konfirmasi & eksekusi pengumpulan jawaban DASS-21
     * WAJIB LENGKAP: Peserta dilarang submit jika masih ada nomor yang belum diisi.
     */
    async function dassSubmitTest() {
        if (isSubmittingDass) return;

        const questions = getDassQuestions();
        const answeredCount = hitungDassTerjawab();
        const total = questions.length || 21;

        // VALIDASI KETAT: Seluruh 21 butir wajib dijawab sebelum submit
        if (answeredCount < total) {
            const belumDijawab = [];
            questions.forEach(q => {
                if (dassAnswers[q.no] === undefined || dassAnswers[q.no] === null || isNaN(dassAnswers[q.no])) {
                    belumDijawab.push(q.no);
                }
            });

            const pesanPeringatan = `Seluruh 21 butir pernyataan DASS-21 wajib diisi sebelum dikumpulkan.\n\nAnda baru menjawab ${answeredCount} dari ${total} pernyataan.\nNomor yang belum dijawab: [${belumDijawab.join(', ')}].\n\nSilakan lengkapi semua nomor yang masih kosong terlebih dahulu.`;
            
            if (typeof customAlert === 'function') {
                customAlert(
                    "Pernyataan Belum Lengkap",
                    pesanPeringatan,
                    "warning",
                    false,
                    () => {
                        if (belumDijawab.length > 0) {
                            dassScrollToQuestion(belumDijawab[0]);
                        }
                    }
                );
            } else {
                alert(pesanPeringatan);
                if (belumDijawab.length > 0) {
                    dassScrollToQuestion(belumDijawab[0]);
                }
            }
            return;
        }

        const pesanKonfirmasi = `Anda telah melengkapi seluruh 21 butir pernyataan DASS-21. Apakah Anda yakin ingin mengumpulkan lembar jawaban sekarang?`;
        if (typeof customAlert === 'function') {
            customAlert(
                "Konfirmasi Pengumpulan Jawaban",
                pesanKonfirmasi,
                "warning",
                true,
                () => { finalizeDassSubmission(false); }
            );
        } else if (confirm(pesanKonfirmasi)) {
            finalizeDassSubmission(false);
        }
    }

    /**
     * Finalisasi pengumpulan dan pengiriman data ke backend Supabase
     */
    async function finalizeDassSubmission(isTimeout = false) {
        isSubmittingDass = true;

        const btn = document.getElementById('btnSubmitDass');
        const btnText = document.getElementById('btnSubmitDassText');
        if (btn) btn.disabled = true;
        if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengolah & Menyimpan Hasil...';

        const analisis = hitungSkorDass();
        const now = new Date();
        const startObj = dassStartTime ? new Date(dassStartTime) : now;
        const diffDetik = Math.max(1, Math.round((now - startObj) / 1000));

        // Ambil foto webcam akhir saat submit
        ambilFotoDass('Akhir', 'DASS-Selesai');

        const payload = {
            status: 'selesai',
            modul: 'DASS-21 (Depression Anxiety Stress Scale)',
            waktu_mulai: dassStartTime,
            waktu_selesai: now.toISOString(),
            durasi_detik: diffDetik,
            durasi_format: formatDurasiWaktu(diffDetik),
            answers: dassAnswers,
            skor: analisis.skor_mentah,
            klasifikasi: {
                depresi: analisis.klasifikasi.depresi.label,
                depresi_level: analisis.klasifikasi.depresi.level,
                kecemasan: analisis.klasifikasi.kecemasan.label,
                kecemasan_level: analisis.klasifikasi.kecemasan.level,
                stres: analisis.klasifikasi.stres.label,
                stres_level: analisis.klasifikasi.stres.level
            },
            narasi: analisis.narasi,
            indeks_stabilitas: analisis.indeks_stabilitas,
            kategori_kebugaran: analisis.kategori_kebugaran,
            rekomendasi_kerja: analisis.rekomendasi_kerja,
            pelanggaran_tab: dassTabViolations,
            log_pelanggaran: dassViolationLogs,
            is_timeout: isTimeout
        };

        // Simpan ke Supabase via updateHasilTes aman
        if (typeof updateHasilTes === 'function') {
            try {
                await updateHasilTes('hasil_dass', payload);
            } catch (e) {
                console.warn('[DASS Save Warning]', e);
            }
        }

        // Tandai status selesai di localStorage
        try {
            localStorage.setItem('dass_selesai', 'true');
            localStorage.removeItem('dass_has_started');
        } catch (e) {}

        // Buka / update dashboard card
        if (typeof unlockDashboardCard === 'function') {
            unlockDashboardCard(10);
            unlockDashboardCard('dass');
        }

        if (typeof syncAllModuleCardStates === 'function') {
            syncAllModuleCardStates();
        }
        if (typeof updateDashboardProgress === 'function') {
            updateDashboardProgress();
        }

        // Tampilkan pesan sukses dan alihkan kembali ke dashboard
        const pesanSukses = "Terima kasih! Lembar Asesmen DASS-21 berhasil dikumpulkan dan tersimpan aman di sistem.";
        if (typeof customAlert === 'function') {
            customAlert(
                "Asesmen DASS-21 Selesai",
                pesanSukses,
                "success",
                false,
                () => {
                    if (typeof pindahFase === 'function') {
                        pindahFase('view-dashboard');
                    }
                }
            );
        } else {
            alert(pesanSukses);
            if (typeof pindahFase === 'function') {
                pindahFase('view-dashboard');
            }
        }
    }

    /**
     * Helper untuk mereset data modul DASS-21 jika ingin dites ulang
     */
    function resetDassTest() {
        try {
            localStorage.removeItem('dass_selesai');
            localStorage.removeItem('dass_answers');
            localStorage.removeItem('dass_start_time');
            localStorage.removeItem('dass_has_started');
        } catch (e) {}
        dassAnswers = {};
        dassHasStarted = false;
        dassStartTime = null;
        isSubmittingDass = false;
        if (typeof syncAllModuleCardStates === 'function') syncAllModuleCardStates();
        if (typeof updateDashboardProgress === 'function') updateDashboardProgress();
        console.log('[DASS-21] Sesi berhasil direset. Silakan buka kembali modul.');
        if (typeof location !== 'undefined') location.reload();
    }

    // Daftarkan fungsi ke window global
    if (typeof window !== 'undefined') {
        window.startDassTest = startDassTest;
        window.dassSelectAnswer = dassSelectAnswer;
        window.dassScrollToQuestion = dassScrollToQuestion;
        window.dassSubmitTest = dassSubmitTest;
        window.hitungSkorDass = hitungSkorDass;
        window.renderDassExamUI = renderDassExamUI;
        window.resetDassTest = resetDassTest;
    }
})();
