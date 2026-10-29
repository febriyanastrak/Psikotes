// =========================================================================
// MODUL LOGIKA & TAMPILAN MBTI (MYERS-BRIGGS TYPE INDICATOR)
// PT Altrak 1978 - Leadership & Executive Assessment System
// Modul Tes Kepribadian Tahap 2 (Menggantikan MCMI)
// 60 Soal Forced-Choice Berpasangan & Pemetaan 16 Tipe Kepribadian
// Standar Alokasi Waktu: 20 Menit (Silent Background Timer)
// =========================================================================

(function () {
    'use strict';

    let mbtiAnswers = {};
    let isSubmittingMbti = false;
    let currentMbtiPage = 1;
    let mbtiStartTime = null;
    let mbtiHasStarted = false; // False = Menampilkan Panduan & Contoh; True = Menampilkan 60 Soal
    let fotoMbtiAwalTaken = false;
    let mbtiTimerInterval = null;
    let mbtiReminderShown = false;

    const MBTI_DURATION_SECONDS = 20 * 60; // 20 Menit (1.200 Detik)
    const ITEMS_PER_PAGE = 15; // 4 Halaman untuk 60 soal (15 nomor per halaman)

    // State simulasi interaktif contoh soal di layar panduan
    let contohMbtiSelected = null;

    // Pulihkan jawaban yang tersimpan di localStorage jika kandidat me-refresh halaman
    try {
        const saved = localStorage.getItem('mbti_answers');
        if (saved) {
            mbtiAnswers = JSON.parse(saved);
        }
        const savedStart = localStorage.getItem('mbti_start_time');
        const savedHasStarted = localStorage.getItem('mbti_has_started');
        if (savedStart && savedHasStarted === 'true') {
            mbtiStartTime = savedStart;
            mbtiHasStarted = true;
        }
    } catch (e) {
        mbtiAnswers = {};
    }

    /**
     * Mengambil foto pengawasan snapshot webcam jika tersedia
     */
    function ambilFotoMbti(fase = 'Awal', subtesLabel = 'MBTI-Personality') {
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
            console.warn('[MBTI] Gagal membaca user identity:', e);
        }
        try {
            window.jepretDanUpload(identifier, 'MBTI', subtesLabel, fase);
        } catch (errCam) {
            console.warn('[MBTI Camera]', errCam);
        }
    }

    /**
     * Format durasi detik ke teks ramah baca
     */
    function formatDurasiWaktu(totalDetik) {
        if (!totalDetik || isNaN(totalDetik) || totalDetik <= 0) return "0 Menit";
        const menit = Math.floor(totalDetik / 60);
        const detik = totalDetik % 60;
        if (menit > 0 && detik > 0) return `${menit} Menit ${detik} Detik`;
        if (menit > 0) return `${menit} Menit`;
        return `${detik} Detik`;
    }

    /**
     * Mengambil daftar 60 pertanyaan MBTI
     */
    function getMbtiQuestions() {
        if (window.MBTI_QUESTIONS && Array.isArray(window.MBTI_QUESTIONS) && window.MBTI_QUESTIONS.length > 0) {
            return window.MBTI_QUESTIONS;
        }
        return [];
    }

    /**
     * Memulai sesi tes MBTI dari Dashboard Tahap 2
     * Jika belum pernah klik mulai -> Tampilkan Layar Panduan Resmi
     * Jika sudah pernah mulai -> Lanjutkan ke lembar 60 soal
     */
    function startMbtiTest() {
        console.log('[MBTI] Membuka modul MBTI...');

        if (typeof pindahFase === 'function') {
            pindahFase('view-mbti');
        } else if (typeof showPage === 'function') {
            showPage('view-mbti');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });

        if (!mbtiHasStarted) {
            renderMbtiPedomanUI();
        } else {
            initSilentMbtiTimer();
            renderMbtiUI();
        }
    }

    /**
     * Merender Layar Panduan & Petunjuk Resmi MBTI (Halaman Pembuka)
     */
    function renderMbtiPedomanUI() {
        const container = document.getElementById('mbti-app-container');
        if (!container) return;

        const answeredCount = hitungMbtiTerjawab();

        container.innerHTML = `
            <div class="space-y-5 animate-fade-in pb-8">
                <!-- HEADER BANNER PANDUAN -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#0a4980] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-blue-400/20 relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center text-2xl sm:text-3xl font-black border border-white/20 shadow-inner shrink-0">
                                <i class="fa-solid fa-compass"></i>
                            </div>
                            <div>
                                <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider mb-1.5">
                                    <i class="fa-solid fa-crown text-amber-400"></i> Asesmen Kepemimpinan Tahap 2
                                </div>
                                <h1 class="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                                    Myers-Briggs Type Indicator (MBTI)
                                </h1>
                                <p class="text-xs sm:text-sm text-slate-200 mt-0.5">
                                    Pedoman Pelaksanaan &amp; Pengenalan Format 60 Soal Pilihan Kepribadian
                                </p>
                            </div>
                        </div>
                        <div>
                            <button type="button" onclick="if(typeof bukaDashboardTahap2==='function'){bukaDashboardTahap2();}else if(typeof pindahFase==='function'){pindahFase('view-dashboard-tahap2');}"
                                class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer shadow-sm">
                                <i class="fa-solid fa-arrow-left"></i>
                                <span>Kembali ke Dashboard</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- KARTU PETUNJUK RESMI & PEDOMAN -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-5 sm:p-7 space-y-5">
                    <div class="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#003865] flex items-center justify-center text-lg font-bold border border-blue-200 shrink-0">
                            <i class="fa-solid fa-book-open-reader"></i>
                        </div>
                        <div>
                            <h2 class="text-base sm:text-lg font-black text-[#003865]">Petunjuk &amp; Pedoman Pengerjaan Tes MBTI</h2>
                            <p class="text-xs text-slate-500">Bacalah instruksi di bawah ini dengan seksama sebelum Anda memulai pengerjaan</p>
                        </div>
                    </div>

                    <div class="p-4 bg-[#edf3f9] rounded-2xl border border-[#b9d0e7] text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3">
                        <div class="flex items-start gap-3">
                            <span class="w-6 h-6 rounded-lg bg-[#003865] text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                            <p>
                                Pada tes ini, Anda akan dihadapkan pada <strong>60 pernyataan berpasangan (Pilihan A dan Pilihan B)</strong>. Pernyataan tersebut menggambarkan kecenderungan cara pandang, reaksi emosional, pengambilan keputusan, dan gaya kerja sehari-hari.
                            </p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="w-6 h-6 rounded-lg bg-[#003865] text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                            <p>
                                <strong>Tidak ada pilihan jawaban yang "BENAR" atau "SALAH".</strong> Pilihlah pernyataan yang <strong>paling spontan dan jujur menggambarkan diri Anda yang sebenarnya</strong>, bukan apa yang Anda anggap ideal atau disukai orang lain.
                            </p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="w-6 h-6 rounded-lg bg-[#003865] text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                            <p>
                                <strong>Estimasi Waktu Pengerjaan:</strong> Disarankan selesai dalam kurun waktu <strong>15 hingga 20 menit</strong>. Jawablah dengan tempo wajar dan jangan berpikir terlalu lama pada satu nomor tertentu.
                            </p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="w-6 h-6 rounded-lg bg-[#003865] text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">4</span>
                            <p>
                                <strong>Anti-Skip:</strong> Seluruh 60 nomor <strong>wajib terisi lengkap</strong> sebelum Anda dapat mengumpulkan lembar jawaban. Soal dibagi ke dalam 4 halaman (15 nomor per halaman).
                            </p>
                        </div>
                    </div>

                    <!-- KOTAK SIMULASI CONTOH SOAL (INTERAKTIF) -->
                    <div class="border-2 border-dashed border-[#003865]/30 rounded-2xl p-4 sm:p-5 bg-slate-50 space-y-3">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span class="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#003865] bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
                                <i class="fa-solid fa-lightbulb text-amber-500"></i>
                                <span>Simulasi Contoh Soal (Klik untuk Mencoba)</span>
                            </span>
                            <span id="mbti-contoh-status" class="text-xs text-slate-500 font-semibold">
                                Silakan coba pilih opsi A atau B di bawah:
                            </span>
                        </div>

                        <p class="text-xs sm:text-sm text-slate-700 font-medium">
                            Manakah dari dua situasi di bawah ini yang lebih mencerminkan kecenderungan alamiah Anda dalam bekerja?
                        </p>

                        <div class="flex flex-col sm:flex-row gap-3 pt-1">
                            <button type="button" 
                                id="mbti-contoh-btn-A"
                                onclick="window.handleSelectContohMbti('A')"
                                class="flex-1 p-3.5 rounded-2xl font-medium text-xs sm:text-sm flex items-start gap-3 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 cursor-pointer transition">
                                <span class="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">A</span>
                                <span class="text-left leading-relaxed flex-1">Saya lebih bersemangat saat berdiskusi aktif dan bertukar ide bersama tim.</span>
                            </button>

                            <button type="button" 
                                id="mbti-contoh-btn-B"
                                onclick="window.handleSelectContohMbti('B')"
                                class="flex-1 p-3.5 rounded-2xl font-medium text-xs sm:text-sm flex items-start gap-3 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 cursor-pointer transition">
                                <span class="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">B</span>
                                <span class="text-left leading-relaxed flex-1">Saya lebih fokus saat menganalisis pekerjaan dan merancang strategi secara mandiri.</span>
                            </button>
                        </div>
                    </div>

                    <!-- PAKTA KEAMANAN & PENGAWASAN UJIAN -->
                    <div class="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs space-y-1.5">
                        <div class="font-extrabold flex items-center gap-1.5 text-amber-950">
                            <i class="fa-solid fa-shield-halved text-amber-600"></i>
                            <span>Protokol Integritas &amp; Pengawasan Sistem PT Altrak 1978:</span>
                        </div>
                        <ul class="list-disc list-inside space-y-1 text-slate-700 pl-1 leading-relaxed">
                            <li>Kamera pengawasan webcam aktif secara berkala demi menjamin keaslian identitas peserta.</li>
                            <li>Sistem otomatis mendeteksi perpindahan tab atau jendela aplikasi lain (anti tab-switch).</li>
                            <li>Setelah Anda mengklik tombol di bawah, sistem otomatis beralih ke mode layar penuh (<em>fullscreen</em>).</li>
                        </ul>
                    </div>

                    <!-- TOMBOL MULAI PENGERJAAN -->
                    <div class="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                        <div class="text-xs text-slate-500 font-semibold flex items-center gap-2">
                            <i class="fa-solid fa-clock text-indigo-600"></i>
                            <span>Waktu pengerjaan disarankan 20 Menit &bull; 60 Soal Forced-Choice</span>
                        </div>
                        <button type="button" 
                            onclick="window.mulaiKerjakanMbti()"
                            class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2.5 cursor-pointer">
                            <span>Mulai Pengerjaan Tes MBTI</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Menangani simulasi interaktif contoh soal pada layar panduan
     */
    function handleSelectContohMbti(choice) {
        contohMbtiSelected = choice;
        const btnA = document.getElementById('mbti-contoh-btn-A');
        const btnB = document.getElementById('mbti-contoh-btn-B');
        const status = document.getElementById('mbti-contoh-status');

        if (btnA && btnB) {
            if (choice === 'A') {
                btnA.className = "flex-1 p-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-start gap-3 bg-[#003865] text-white shadow-md border-2 border-[#002747] cursor-pointer transition";
                btnA.querySelector('span').className = "w-7 h-7 rounded-xl bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shrink-0 shadow-xs";
                btnB.className = "flex-1 p-3.5 rounded-2xl font-medium text-xs sm:text-sm flex items-start gap-3 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 cursor-pointer transition";
                btnB.querySelector('span').className = "w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0";
            } else if (choice === 'B') {
                btnA.className = "flex-1 p-3.5 rounded-2xl font-medium text-xs sm:text-sm flex items-start gap-3 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 cursor-pointer transition";
                btnA.querySelector('span').className = "w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0";
                btnB.className = "flex-1 p-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-start gap-3 bg-[#003865] text-white shadow-md border-2 border-[#002747] cursor-pointer transition";
                btnB.querySelector('span').className = "w-7 h-7 rounded-xl bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shrink-0 shadow-xs";
            }
        }

        if (status) {
            status.innerHTML = `<span class="text-emerald-700 font-bold"><i class="fa-solid fa-circle-check mr-1"></i> Anda memilih opsi ${choice}. Format soal tes asli persis seperti ini.</span>`;
        }
    }

    /**
     * Memulai lembar pengerjaan 60 soal MBTI setelah membaca panduan
     */
    function mulaiKerjakanMbti() {
        console.log('[MBTI] Kandidat menekan Mulai Pengerjaan...');
        mbtiHasStarted = true;
        try {
            localStorage.setItem('mbti_has_started', 'true');
        } catch (e) {
            console.warn('[MBTI] Gagal menyimpan flag started:', e);
        }

        if (!mbtiStartTime) {
            mbtiStartTime = new Date().toISOString();
            try {
                localStorage.setItem('mbti_start_time', mbtiStartTime);
            } catch (e) {
                console.warn('[MBTI] Gagal menyimpan start time:', e);
            }
        }

        if (!fotoMbtiAwalTaken) {
            fotoMbtiAwalTaken = true;
            ambilFotoMbti('Awal', 'MBTI-Start');
        }

        // Paksa Layar Penuh (Force Fullscreen) saat mulai
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        // Aktifkan silent background timer 20 menit
        initSilentMbtiTimer();

        window.scrollTo({ top: 0, behavior: 'instant' });
        renderMbtiUI();
    }

    /**
     * Silent Background Timer (Berjalan diam-diam di background tanpa countdown jam di layar)
     * Batas waktu: 20 Menit (1.200 detik). Otomatis auto-submit jika waktu habis.
     */
    function initSilentMbtiTimer() {
        if (mbtiTimerInterval) clearInterval(mbtiTimerInterval);

        const checkTime = () => {
            if (isSubmittingMbti) {
                if (mbtiTimerInterval) clearInterval(mbtiTimerInterval);
                return;
            }

            const now = new Date();
            const startObj = mbtiStartTime ? new Date(mbtiStartTime) : now;
            const elapsed = Math.floor((now - startObj) / 1000);
            const remaining = MBTI_DURATION_SECONDS - elapsed;

            // Pengingat halus di menit ke-15 (sisa 5 menit)
            if (elapsed >= 15 * 60 && !mbtiReminderShown && remaining > 60) {
                mbtiReminderShown = true;
                showGentleTimeReminder();
            }

            // Jika waktu 20 menit habis: Eksekusi auto-submit di background
            if (remaining <= 0) {
                if (mbtiTimerInterval) clearInterval(mbtiTimerInterval);
                handleMbtiTimeOutAutoSubmit();
            }
        };

        // Periksa setiap 1 detik
        checkTime();
        mbtiTimerInterval = setInterval(checkTime, 1000);
    }

    /**
     * Notifikasi pengingat halus waktu pengerjaan (muncul 6 detik lalu hilang otomatis)
     */
    function showGentleTimeReminder() {
        try {
            const existing = document.getElementById('mbti-time-reminder');
            if (existing) existing.remove();

            const notif = document.createElement('div');
            notif.id = 'mbti-time-reminder';
            notif.className = 'fixed top-5 right-5 z-50 bg-[#003865] text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3 text-xs max-w-sm transition-all duration-300';
            notif.innerHTML = `
                <div class="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 font-black flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-bell text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="font-bold text-amber-300">Pengingat Waktu Asesmen</p>
                    <p class="text-slate-200 text-[11px] leading-tight">Waktu pengerjaan tersisa sekitar 5 menit. Harap lengkapi pernyataan yang belum terisi.</p>
                </div>
            `;
            document.body.appendChild(notif);
            setTimeout(() => {
                if (notif && notif.parentNode) {
                    notif.classList.add('opacity-0', '-translate-y-2');
                    setTimeout(() => notif.remove(), 500);
                }
            }, 6000);
        } catch (e) {
            console.warn('[MBTI] Notifikasi waktu error:', e);
        }
    }

    /**
     * Menangani auto-submit saat batas waktu 20 menit habis di background
     */
    async function handleMbtiTimeOutAutoSubmit() {
        if (isSubmittingMbti) return;
        isSubmittingMbti = true;

        console.log('[MBTI] Batas waktu 20 menit habis. Melakukan auto-submit...');

        if (mbtiTimerInterval) clearInterval(mbtiTimerInterval);

        // Ambil foto snapshot webcam akhir
        ambilFotoMbti('Akhir', 'MBTI-TimeOut-20Min');

        const questions = getMbtiQuestions();
        const answeredCount = hitungMbtiTerjawab();
        const total = questions.length || 60;
        const analisis = hitungSkorMbti();
        const now = new Date();

        const payload = {
            status: 'selesai',
            modul: 'MBTI (Myers-Briggs Type Indicator)',
            tipe_mbti: analisis.tipe,
            nama_profil: analisis.nama_profil,
            jawaban: mbtiAnswers,
            analisis: analisis,
            durasi_detik: MBTI_DURATION_SECONDS,
            durasi_teks: "20 Menit (Waktu Habis)",
            catatan_pengerjaan: `Selesai otomatis: batas waktu 20 menit berakhir (${answeredCount}/${total} soal terjawab)`,
            pelanggaran_tab_switch: typeof tabSwitchViolations !== 'undefined' ? tabSwitchViolations : 0,
            waktu_selesai: now.toISOString()
        };

        if (typeof updateHasilTes === 'function') {
            try {
                await updateHasilTes('hasil_mbti', payload);
            } catch (e) {
                console.warn('[MBTI Auto-Submit Warning]', e);
            }
            try {
                await updateHasilTes('hasil_mcmi', payload);
            } catch (e) {}
        }

        // Tandai modul selesai di localStorage
        localStorage.setItem('mbti_selesai', 'true');
        localStorage.setItem('mcmi_selesai', 'true');
        localStorage.removeItem('mbti_has_started');
        localStorage.setItem('cadangan_hasil_mbti', JSON.stringify(payload));

        if (window.tahap2State && window.tahap2State.modulSelesai) {
            window.tahap2State.modulSelesai.mbti = true;
        }

        const pesanWaktuHabis = `Waktu pengerjaan 20 menit untuk modul MBTI telah berakhir. Seluruh lembar jawaban (${answeredCount} dari ${total} soal) telah berhasil diamankan dan tersimpan rapi di server HRD PT Altrak 1978.`;

        if (typeof customAlert === 'function') {
            customAlert(
                "Waktu Asesmen Telah Selesai",
                pesanWaktuHabis,
                "info",
                false,
                () => {
                    if (typeof bukaDashboardTahap2 === 'function') {
                        bukaDashboardTahap2();
                    } else if (typeof pindahFase === 'function') {
                        pindahFase('view-dashboard-tahap2');
                    }
                }
            );
        } else {
            alert(pesanWaktuHabis);
            if (typeof bukaDashboardTahap2 === 'function') {
                bukaDashboardTahap2();
            }
        }
    }

    /**
     * Menghitung total nomor terjawab
     */
    function hitungMbtiTerjawab() {
        const questions = getMbtiQuestions();
        let count = 0;
        questions.forEach(q => {
            const raw = mbtiAnswers[q.no] !== undefined ? mbtiAnswers[q.no] : mbtiAnswers[String(q.no)];
            const val = raw ? String(raw).trim().toUpperCase() : '';
            if (val === 'A' || val === 'B') {
                count++;
            }
        });
        return count;
    }

    /**
     * Menangani pemilihan A atau B
     * Dilengkapi Instant Auto-Save ke localStorage setiap kali diklik
     */
    function mbtiHandleSelect(no, choice) {
        if (isSubmittingMbti) return;

        mbtiAnswers[no] = choice;

        try {
            localStorage.setItem('mbti_answers', JSON.stringify(mbtiAnswers));
        } catch (e) {}

        updateMbtiCardHighlight(no, choice);
        updateMbtiProgressBar();

        // Jepret foto di pertengahan pengerjaan (nomor 30)
        if (no === 30) {
            ambilFotoMbti('Tengah', 'MBTI-Pertengahan');
        }
    }

    /**
     * Memperbarui visual kartu soal yang aktif (Identik dengan format kartu EPPS)
     */
    function updateMbtiCardHighlight(no, choice) {
        const card = document.getElementById(`mbti-card-${no}`);
        const optA = document.getElementById(`mbti-opt-${no}-A`);
        const optB = document.getElementById(`mbti-opt-${no}-B`);
        const badge = document.getElementById(`mbti-status-badge-${no}`);

        if (card) {
            card.classList.remove('border-slate-200');
            card.classList.add('border-[#003865]', 'ring-1', 'ring-[#003865]/20');
        }

        if (optA && optB) {
            const badgeA = optA.querySelector('.badge-letter');
            const badgeB = optB.querySelector('.badge-letter');

            if (choice === 'A') {
                optA.className = "flex items-start gap-3 p-4 rounded-2xl border-2 border-[#003865] bg-blue-50/60 shadow-sm cursor-pointer transition-all";
                optB.className = "flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-all";
                if (badgeA) badgeA.className = "badge-letter w-7 h-7 rounded-xl bg-[#003865] text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#003865]";
                if (badgeB) badgeB.className = "badge-letter w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200";
            } else if (choice === 'B') {
                optA.className = "flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-all";
                optB.className = "flex items-start gap-3 p-4 rounded-2xl border-2 border-[#003865] bg-blue-50/60 shadow-sm cursor-pointer transition-all";
                if (badgeA) badgeA.className = "badge-letter w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200";
                if (badgeB) badgeB.className = "badge-letter w-7 h-7 rounded-xl bg-[#003865] text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#003865]";
            }
        }

        if (badge) {
            badge.innerHTML = `
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                    <i class="fa-solid fa-check text-xs"></i> Pilihan [${choice}]
                </span>
            `;
        }
    }

    /**
     * Memperbarui progress bar
     */
    function updateMbtiProgressBar() {
        const questions = getMbtiQuestions();
        const total = questions.length || 60;
        const answered = hitungMbtiTerjawab();
        const pct = Math.round((answered / total) * 100);

        const fillEl = document.getElementById('mbti-progress-fill');
        const countEl = document.getElementById('mbti-progress-count');
        const pctEl = document.getElementById('mbti-progress-pct');

        if (fillEl) fillEl.style.width = `${pct}%`;
        if (countEl) countEl.innerHTML = `<i class="fa-solid fa-list-check text-indigo-600 mr-1.5"></i> ${answered} / ${total} Soal Terjawab`;
        if (pctEl) pctEl.innerText = `${pct}%`;
    }

    /**
     * Berpindah halaman paginasi (1..4)
     */
    function gantiHalamanMbti(page) {
        const questions = getMbtiQuestions();
        const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE) || 4;
        if (page < 1 || page > totalPages) return;

        currentMbtiPage = page;
        renderMbtiUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Melompat langsung ke nomor soal tertentu (digunakan saat validasi anti-skip)
     */
    function lompatKeNomorMbti(questionNo) {
        const targetPage = Math.ceil(questionNo / ITEMS_PER_PAGE);
        currentMbtiPage = targetPage;
        renderMbtiUI();

        setTimeout(() => {
            const el = document.getElementById(`mbti-card-${questionNo}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-amber-400');
                setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
            }
        }, 300);
    }

    /**
     * Merender seluruh tampilan formulir lembar soal MBTI (Tampilan & Navigasi Halaman Persis EPPS)
     */
    function renderMbtiUI() {
        const container = document.getElementById('mbti-app-container');
        if (!container) return;

        const questions = getMbtiQuestions();
        const total = questions.length || 60;
        const answeredCount = hitungMbtiTerjawab();
        const pct = Math.round((answeredCount / total) * 100);
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 4;

        const startIdx = (currentMbtiPage - 1) * ITEMS_PER_PAGE;
        const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, total);
        const pageQuestions = questions.slice(startIdx, endIdx);

        let questionsHtml = '';
        pageQuestions.forEach(q => {
            const currentAns = mbtiAnswers[q.no] || null;
            const isAnswered = currentAns !== null;
            const isA = currentAns === 'A';
            const isB = currentAns === 'B';

            questionsHtml += `
                <div id="mbti-card-${q.no}" class="bg-white rounded-3xl border ${isAnswered ? 'border-[#003865] ring-1 ring-[#003865]/20' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all p-5 sm:p-6">
                    <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-[#003865] text-white text-xs font-black flex items-center justify-center shadow-sm">
                                ${q.no}
                            </span>
                            <span class="text-sm font-bold text-[#003865]">Nomor ${q.no} dari ${total}</span>
                        </div>
                        <div id="mbti-status-badge-${q.no}">
                            ${isAnswered ? `
                                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                                    <i class="fa-solid fa-check text-xs"></i> Pilihan [${currentAns}]
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
                        <div id="mbti-opt-${q.no}-A" 
                            onclick="window.mbtiHandleSelect(${q.no}, 'A')"
                            class="flex items-start gap-3 p-4 rounded-2xl border ${isA ? 'border-2 border-[#003865] bg-blue-50/60 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'} cursor-pointer transition-all">
                            <div class="badge-letter w-7 h-7 rounded-xl ${isA ? 'bg-[#003865] text-white' : 'bg-slate-100 text-slate-600'} font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border ${isA ? 'border-[#003865]' : 'border-slate-200'}">
                                A
                            </div>
                            <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed select-none">
                                ${q.pernyataanA}
                            </p>
                        </div>

                        <!-- OPSI B -->
                        <div id="mbti-opt-${q.no}-B" 
                            onclick="window.mbtiHandleSelect(${q.no}, 'B')"
                            class="flex items-start gap-3 p-4 rounded-2xl border ${isB ? 'border-2 border-[#003865] bg-blue-50/60 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'} cursor-pointer transition-all">
                            <div class="badge-letter w-7 h-7 rounded-xl ${isB ? 'bg-[#003865] text-white' : 'bg-slate-100 text-slate-600'} font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border ${isB ? 'border-[#003865]' : 'border-slate-200'}">
                                B
                            </div>
                            <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed select-none">
                                ${q.pernyataanB}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });

        // Buat deretan tombol navigasi halaman atas ala EPPS
        let pageButtonsHtml = '';
        for (let p = 1; p <= totalPages; p++) {
            const isCur = p === currentMbtiPage;
            pageButtonsHtml += `
                <button type="button" onclick="window.gantiHalamanMbti(${p})"
                    class="w-9 h-9 rounded-xl text-xs font-black transition flex items-center justify-center cursor-pointer ${isCur ? 'bg-[#003865] text-white shadow-md border-2 border-[#002747]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}">
                    ${p}
                </button>
            `;
        }

        let html = `
            <div class="space-y-6 animate-fade-in pb-12">
                <!-- HEADER UJIAN MBTI (ALA EPPS) -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 sm:p-8 relative overflow-hidden">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003865] to-[#0a4980] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-[#003865]/20 shrink-0">
                                <i class="fa-solid fa-compass"></i>
                            </div>
                            <div>
                                <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-blue-50 text-[#003865] border border-blue-200 uppercase tracking-wider mb-1">
                                    <i class="fa-solid fa-crown text-amber-500"></i> Asesmen Kepemimpinan Tahap 2
                                </div>
                                <h2 class="text-xl sm:text-2xl font-black text-[#003865]">
                                    Myers-Briggs Type Indicator (MBTI)
                                </h2>
                                <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                                    Lembar Jawaban 60 Pernyataan Forced-Choice (Halaman ${currentMbtiPage} dari ${totalPages})
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- PROGRESS BAR KEMAJUAN SOAL -->
                    <div class="mt-5 pt-2">
                        <div class="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                            <span id="mbti-progress-count" class="text-[#003865] font-black flex items-center gap-1.5">
                                <i class="fa-solid fa-list-check text-indigo-600"></i>
                                <span>${answeredCount} / ${total} Soal Terjawab</span>
                            </span>
                            <span id="mbti-progress-pct" class="text-emerald-600 font-black">${pct}%</span>
                        </div>
                        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div id="mbti-progress-fill" class="h-full bg-gradient-to-r from-[#003865] via-blue-600 to-emerald-500 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                        </div>
                    </div>

                    <!-- PAGINATION BAR ATAS (PERSIS EPPS: KANDIDAT BISA BALIK & MELOMPAT HALAMAN) -->
                    <div class="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <span class="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <i class="fa-solid fa-list-ol text-[#003865]"></i>
                            <span>Pilih Halaman Soal:</span>
                        </span>
                        <div class="flex flex-wrap items-center gap-1.5">
                            ${pageButtonsHtml}
                        </div>
                    </div>
                </div>

                <!-- DAFTAR KARTU SOAL HALAMAN INI (GRID 2 KOLOM PERSIS EPPS) -->
                <div class="space-y-4" id="mbti-question-list">
                    ${questionsHtml}
                </div>

                <!-- FOOTER NAVIGASI HALAMAN & TOMBOL SUBMIT (PERSIS EPPS) -->
                <div class="mt-8 bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-2">
                        <button type="button" 
                            ${currentMbtiPage <= 1 ? 'disabled class="opacity-40 cursor-not-allowed px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center gap-2"' : 'onclick="window.gantiHalamanMbti(' + (currentMbtiPage - 1) + ')" class="hover:bg-slate-100 cursor-pointer px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center gap-2 transition"'}
                            >
                            <i class="fa-solid fa-arrow-left"></i>
                            <span>Sebelumnya</span>
                        </button>
                        <span class="text-xs font-bold text-slate-600 px-3">
                            Halaman ${currentMbtiPage} / ${totalPages}
                        </span>
                        <button type="button" 
                            ${currentMbtiPage >= totalPages ? 'disabled class="opacity-40 cursor-not-allowed px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center gap-2"' : 'onclick="window.gantiHalamanMbti(' + (currentMbtiPage + 1) + ')" class="hover:bg-slate-100 cursor-pointer px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center gap-2 transition"'}
                            >
                            <span>Selanjutnya</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>

                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <button type="button" 
                            id="btnSubmitMbti"
                            onclick="window.mbtiSubmitTest()" 
                            class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-black text-xs rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <span id="btnSubmitMbtiText">Kumpulkan Jawaban MBTI (60 Soal)</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Menghitung skor 4 dimensi MBTI dan menentukan Tipe Kepribadian (16 Tipe)
     * Menggunakan rumus baku sesuai spreadsheet Software MBTI.xlsx
     */
    function hitungSkorMbti() {
        const questions = getMbtiQuestions();

        let countE = 0, countI = 0;
        let countS = 0, countN = 0;
        let countT = 0, countF = 0;
        let countJ = 0, countP = 0;

        questions.forEach(q => {
            const rawAns = mbtiAnswers[q.no] !== undefined ? mbtiAnswers[q.no] : mbtiAnswers[String(q.no)];
            const ans = rawAns ? String(rawAns).trim().toUpperCase() : null;
            const trait = (ans === 'A') ? q.skorA : (ans === 'B' ? q.skorB : null);
            if (!trait) return;

            if (trait === 'E') countE++;
            else if (trait === 'I') countI++;
            else if (trait === 'S') countS++;
            else if (trait === 'N') countN++;
            else if (trait === 'T') countT++;
            else if (trait === 'F') countF++;
            else if (trait === 'J') countJ++;
            else if (trait === 'P') countP++;
        });

        // 4 Dimensi Kepribadian
        const kodeEI = countI > countE ? 'I' : 'E';
        const kodeSN = countS > countN ? 'S' : 'N';
        const kodeTF = countT > countF ? 'T' : 'F';
        const kodeJP = countJ > countP ? 'J' : 'P';

        const tipeFinal = `${kodeEI}${kodeSN}${kodeTF}${kodeJP}`;

        // Persentase Skor (Aman dari 0% vs 100% jika belum ada poin terhitung)
        const totalEI = countE + countI;
        const totalSN = countS + countN;
        const totalTF = countT + countF;
        const totalJP = countJ + countP;

        const pctE = totalEI > 0 ? Math.round((countE / totalEI) * 100) : 50;
        const pctI = 100 - pctE;
        const pctS = totalSN > 0 ? Math.round((countS / totalSN) * 100) : 50;
        const pctN = 100 - pctS;
        const pctT = totalTF > 0 ? Math.round((countT / totalTF) * 100) : 50;
        const pctF = 100 - pctT;
        const pctJ = totalJP > 0 ? Math.round((countJ / totalJP) * 100) : 50;
        const pctP = 100 - pctJ;

        const profil = (window.MBTI_CONFIG && window.MBTI_CONFIG.profilTipe && window.MBTI_CONFIG.profilTipe[tipeFinal]) || {
            nama: tipeFinal,
            karakter: 'Tipe kepribadian profesional dengan kecenderungan kerja unik.',
            gayaKerja: 'Menjalankan tugas dengan pendekatan khas profilnya.',
            kekuatan: 'Kekuatan analitis dan dedikasi pada pekerjaan.'
        };

        return {
            tipe: tipeFinal,
            nama_profil: profil.nama,
            karakteristik: profil.karakter,
            gaya_kerja: profil.gayaKerja,
            kekuatan_utama: profil.kekuatan,
            dimensi: {
                EI: { kode: kodeEI, skorE: countE, skorI: countI, pctE, pctI },
                SN: { kode: kodeSN, skorS: countS, skorN: countN, pctS, pctN },
                TF: { kode: kodeTF, skorT: countT, skorF: countF, pctT, pctF },
                JP: { kode: kodeJP, skorJ: countJ, skorP: countP, pctJ, pctP }
            }
        };
    }

    /**
     * Memproses pengumpulan jawaban MBTI secara manual oleh peserta
     */
    async function mbtiSubmitTest() {
        if (isSubmittingMbti) return;

        const questions = getMbtiQuestions();
        const answeredCount = hitungMbtiTerjawab();
        const total = questions.length || 60;

        // Validasi Anti-Skip: Seluruh 60 nomor wajib terisi lengkap
        if (answeredCount < total) {
            let firstMissing = null;
            for (let i = 0; i < questions.length; i++) {
                if (!mbtiAnswers[questions[i].no]) {
                    firstMissing = questions[i].no;
                    break;
                }
            }

            if (typeof customAlert === 'function') {
                customAlert(
                    "Jawaban Belum Lengkap",
                    `Anda baru menjawab ${answeredCount} dari ${total} pernyataan MBTI. Harap lengkapi semua nomor, mulai dari nomor ${firstMissing}.`,
                    "warning"
                );
            } else {
                alert(`Jawaban belum lengkap (${answeredCount}/${total}). Periksa nomor ${firstMissing}.`);
            }

            if (firstMissing) {
                lompatKeNomorMbti(firstMissing);
            }
            return;
        }

        const doSubmit = async () => {
            isSubmittingMbti = true;

            // Hentikan silent background timer
            if (mbtiTimerInterval) clearInterval(mbtiTimerInterval);

            const btn = document.getElementById('btnSubmitMbti');
            const btnText = document.getElementById('btnSubmitMbtiText');
            if (btn) btn.disabled = true;
            if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengolah & Menyimpan Hasil...';

            const analisis = hitungSkorMbti();
            const now = new Date();
            const startObj = mbtiStartTime ? new Date(mbtiStartTime) : now;
            const diffDetik = Math.max(1, Math.round((now - startObj) / 1000));

            // Ambil foto webcam akhir saat submit
            ambilFotoMbti('Akhir', 'MBTI-Selesai');

            const payload = {
                status: 'selesai',
                modul: 'MBTI (Myers-Briggs Type Indicator)',
                tipe_mbti: analisis.tipe,
                nama_profil: analisis.nama_profil,
                jawaban: mbtiAnswers,
                analisis: analisis,
                durasi_detik: diffDetik,
                durasi_teks: formatDurasiWaktu(diffDetik),
                pelanggaran_tab_switch: typeof tabSwitchViolations !== 'undefined' ? tabSwitchViolations : 0,
                waktu_selesai: now.toISOString()
            };

            // Simpan ke Supabase via updateHasilTes
            // Simpan ke hasil_mbti dan fallback hasil_mcmi demi kompatibilitas ganda
            if (typeof updateHasilTes === 'function') {
                try {
                    await updateHasilTes('hasil_mbti', payload);
                } catch (e) {
                    console.warn('[MBTI Save Warning]', e);
                }
                try {
                    await updateHasilTes('hasil_mcmi', payload);
                } catch (e) {}
            }

            // Simpan status selesai ke localStorage dan bersihkan session active
            localStorage.setItem('mbti_selesai', 'true');
            localStorage.setItem('mcmi_selesai', 'true');
            localStorage.removeItem('mbti_has_started');
            localStorage.setItem('cadangan_hasil_mbti', JSON.stringify(payload));

            if (window.tahap2State && window.tahap2State.modulSelesai) {
                window.tahap2State.modulSelesai.mbti = true;
            }

            if (typeof customAlert === 'function') {
                customAlert(
                    "Tes MBTI Berhasil Disimpan",
                    `Profil Tipe Kepribadian Anda (${analisis.tipe} - ${analisis.nama_profil}) telah berhasil disimpan ke database asesmen PT Altrak 1978.`,
                    "success",
                    false,
                    () => {
                        if (typeof bukaDashboardTahap2 === 'function') {
                            bukaDashboardTahap2();
                        } else if (typeof pindahFase === 'function') {
                            pindahFase('view-dashboard-tahap2');
                        }
                    }
                );
            } else {
                alert(`Tes MBTI Berhasil Disimpan: ${analisis.tipe}`);
                if (typeof bukaDashboardTahap2 === 'function') {
                    bukaDashboardTahap2();
                }
            }
        };

        if (typeof customAlert === 'function') {
            customAlert(
                "Kumpulkan Jawaban MBTI?",
                `Anda telah melengkapi seluruh 60 pernyataan MBTI. Apakah Anda yakin ingin mengumpulkan lembar jawaban sekarang?`,
                "warning",
                true,
                () => { doSubmit(); }
            );
        } else {
            if (confirm("Kumpulkan jawaban MBTI (60 soal)?")) {
                doSubmit();
            }
        }
    }

    // Daftarkan fungsi ke window global
    if (typeof window !== 'undefined') {
        window.startMbtiTest = startMbtiTest;
        window.bukaModulMBTI = startMbtiTest;
        window.renderMbtiPedomanUI = renderMbtiPedomanUI;
        window.mulaiKerjakanMbti = mulaiKerjakanMbti;
        window.handleSelectContohMbti = handleSelectContohMbti;
        window.renderMbtiUI = renderMbtiUI;
        window.mbtiHandleSelect = mbtiHandleSelect;
        window.mbtiSubmitTest = mbtiSubmitTest;
        window.gantiHalamanMbti = gantiHalamanMbti;
    }
})();
