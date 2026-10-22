// =========================================================================
// MODUL LOGIKA & TAMPILAN DISC ASSESSMENT (js/disc.js)
// PT Altrak 1978 - Online Assessment System
// =========================================================================

(function () {
    'use strict';

    // State jawaban peserta: { "1": { P: 3, K: 2 }, ... }
    let discAnswers = {};
    let isSubmittingDisc = false;

    // Background Timer DISC (15 Menit Hidden Timer + Overtime Warning Tersembunyi)
    let discTimerInterval = null;
    let discEndTime = null;
    let hasShownDiscOvertimeWarning = false;
    let lastDiscOvertimePromptTime = 0;

    // Pulihkan jawaban yang tersimpan di localStorage jika kandidat refresh
    try {
        const saved = localStorage.getItem('disc_answers');
        if (saved) {
            discAnswers = JSON.parse(saved);
        }
    } catch (e) {
        discAnswers = {};
    }

    /**
     * Memulai sesi tes DISC:
     * - Menutup modal informasi modul
     * - Berpindah tampilan ke section DISC
     * - Mengaktifkan kamera pengawas & ambil snapshot awal
     * - Merender 24 kartu soal
     * - Memulai background timer 15 menit di belakang layar
     */
    function startDiscTest() {
        if (typeof closeModal === 'function') {
            closeModal('modal-module-disc');
        }

        // Masuk mode Fullscreen jika belum aktif
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        // Pindah tampilan ke section view-disc
        if (typeof pindahFase === 'function') {
            pindahFase('view-disc');
        } else if (typeof showPage === 'function') {
            showPage('view-disc');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });

        // Pastikan kamera pengawas mengambang dimatikan saat tes DISC (hanya aktif di IST Soal 09)
        if (typeof stopProctoringCamera === 'function') {
            stopProctoringCamera();
        }

        // Ambil snapshot awal pelaksanaan tes DISC
        ambilSnapshotFoto('Awal');

        // Render kartu-kartu soal
        renderDiscUI();

        // Mulai background timer 15 menit (tersembunyi di belakang layar)
        startDiscBackgroundTimer();
    }

    /**
     * Mengambil foto proctoring dokumentasi DISC
     * @param {'Awal'|'Tengah'|'Akhir'} fase 
     */
    function ambilSnapshotFoto(fase) {
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
        window.jepretDanUpload(identifier, 'DISC', 'DISC-Assessment', fase);
    }

    /**
     * Menghitung berapa nomor yang sudah valid terisi (memiliki tepat 1 P dan 1 K)
     */
    function hitungNomorSelesai() {
        let count = 0;
        const questions = window.DISC_QUESTIONS || [];
        questions.forEach(q => {
            const ans = discAnswers[q.no];
            if (ans && ans.P && ans.K && ans.P !== ans.K) {
                count++;
            }
        });
        return count;
    }

    /**
     * Memperbarui visual indikator progres
     */
    function updateProgressTracker() {
        const total = (window.DISC_QUESTIONS || []).length || 24;
        const selesai = hitungNomorSelesai();
        const pct = Math.round((selesai / total) * 100);

        const fillEl = document.getElementById('discProgressFill');
        const textEl = document.getElementById('discProgressText');
        const badgeEl = document.getElementById('discProgressBadge');

        if (fillEl) fillEl.style.width = `${pct}%`;
        if (textEl) textEl.textContent = `${selesai} dari ${total} Soal Lengkap (${pct}%)`;
        if (badgeEl) {
            badgeEl.textContent = `${selesai} / ${total}`;
            if (selesai === total) {
                badgeEl.className = "text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm";
            } else {
                badgeEl.className = "text-xs font-black px-2.5 py-1 rounded-full bg-[#003865] text-white shadow-sm";
            }
        }
    }

    /**
     * Memulai timer 15 menit tersembunyi di background (tanpa visualisasi angka di layar).
     * Jika waktu habis (15 menit) dan 24 soal belum lengkap, berikan peringatan berkala tiap 60 detik.
     */
    function startDiscBackgroundTimer() {
        if (discTimerInterval) {
            clearInterval(discTimerInterval);
            discTimerInterval = null;
        }

        const endTimeStr = localStorage.getItem('disc_exam_end_time');
        discEndTime = endTimeStr ? parseInt(endTimeStr, 10) : null;
        if (!discEndTime || isNaN(discEndTime)) {
            discEndTime = Date.now() + 15 * 60 * 1000; // 15 Menit (900.000 ms)
            localStorage.setItem('disc_exam_end_time', String(discEndTime));
        }

        const checkBackgroundTimer = () => {
            if (isSubmittingDisc) return;
            const now = Date.now();
            const diffSeconds = Math.ceil((discEndTime - now) / 1000);

            if (diffSeconds <= 0) {
                // Batas 15 Menit Habis (Mode Overtime di Belakang Layar)
                const total = (window.DISC_QUESTIONS || []).length || 24;
                const selesai = hitungNomorSelesai();

                // Cek apakah seluruh 24 nomor sudah selesai
                if (selesai < total) {
                    // Peringatan berkala: pertama kali langsung muncul, lalu berulang setiap 60 detik
                    if (!hasShownDiscOvertimeWarning) {
                        hasShownDiscOvertimeWarning = true;
                        lastDiscOvertimePromptTime = now;
                        showDiscOvertimeWarning();
                    } else if (now - lastDiscOvertimePromptTime >= 60000) {
                        lastDiscOvertimePromptTime = now;
                        showDiscOvertimeWarning();
                    }
                } else {
                    // Semua soal sudah lengkap terisi
                    stopDiscBackgroundTimer();
                }
            }
        };

        checkBackgroundTimer();
        discTimerInterval = setInterval(checkBackgroundTimer, 1000);
    }

    /**
     * Menghentikan background timer DISC
     */
    function stopDiscBackgroundTimer() {
        if (discTimerInterval) {
            clearInterval(discTimerInterval);
            discTimerInterval = null;
        }
    }

    /**
     * Menampilkan modal peringatan waktu habis di background (Mode Overtime DISC)
     * Peserta tetap harus menyelesaikan seluruh 24 soal (tidak di-auto-submit).
     */
    function showDiscOvertimeWarning() {
        const total = (window.DISC_QUESTIONS || []).length || 24;
        const selesai = hitungNomorSelesai();
        const sisa = total - selesai;

        const pesan = `Batas waktu standar 15 menit telah habis!\n\nUntuk Tes DISC Assessment, seluruh ${total} soal WAJIB diselesaikan secara lengkap (masing-masing memiliki tepat 1 pilihan Paling [P] dan 1 pilihan Paling Tidak [K]) agar grafik profil kepribadian kerja Anda dapat dianalisis secara valid.\n\nMasih ada ${sisa} nomor yang belum lengkap. Silakan segera lengkapi seluruh nomor tersebut!`;

        if (typeof istUI !== 'undefined' && typeof istUI.showModal === 'function') {
            istUI.showModal({
                title: "WAKTU HABIS - SOAL WAJIB LENGKAP!",
                message: pesan,
                type: "warning",
                iconHtml: '<i class="fa-solid fa-triangle-exclamation text-rose-500"></i>',
                okText: '<span>Lengkapi Soal Sekarang</span> <i class="fa-solid fa-arrow-right"></i>',
                onOk: () => {
                    scrollKeNomorBelumLengkap();
                }
            });
        } else if (typeof customAlert === 'function') {
            customAlert("WAKTU HABIS - SOAL WAJIB LENGKAP!", pesan, "warning", false, () => {
                scrollKeNomorBelumLengkap();
            });
        } else {
            alert(pesan);
            scrollKeNomorBelumLengkap();
        }
    }

    /**
     * Mengarahkan pandangan layar (scroll) ke kartu soal pertama yang belum lengkap
     */
    function scrollKeNomorBelumLengkap() {
        const questions = window.DISC_QUESTIONS || [];
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const ans = discAnswers[q.no];
            if (!ans || !ans.P || !ans.K || ans.P === ans.K) {
                const card = document.getElementById(`disc-card-${q.no}`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                break;
            }
        }
    }

    /**
     * Menangani interaksi pemilihan opsi P atau K pada soal tertentu
     * Menerapkan VALIDASI KETAT: P dan K tidak boleh pada baris yang sama.
     * 
     * @param {number} no Nomor soal (1 - 24)
     * @param {'P'|'K'} tipe Pilihan ('P' = Paling, 'K' = Paling Tidak)
     * @param {number} statementIndex Indeks baris pernyataan (1 - 4)
     */
    function handleSelectOption(no, tipe, statementIndex) {
        if (!discAnswers[no]) {
            discAnswers[no] = {};
        }

        const lawanTipe = (tipe === 'P') ? 'K' : 'P';

        // Aturan: Jika baris pernyataan yang dipilih sama dengan baris lawan,
        // batalkan pilihan lawan secara otomatis
        if (discAnswers[no][lawanTipe] === statementIndex) {
            discAnswers[no][lawanTipe] = null;
            const lawanRadio = document.getElementById(`radio_disc_${no}_${lawanTipe}_${statementIndex}`);
            if (lawanRadio) lawanRadio.checked = false;
        }

        // Tetapkan pilihan baru
        discAnswers[no][tipe] = statementIndex;

        // Simpan sementara ke localStorage
        try {
            localStorage.setItem('disc_answers', JSON.stringify(discAnswers));
        } catch (e) {}

        // Perbarui highlight baris pada nomor soal tersebut
        updateQuestionCardHighlight(no);

        // Perbarui progress bar
        updateProgressTracker();
    }

    /**
     * Memperbarui styling status (highlight baris & status lengkap) pada kartu soal
     */
    function updateQuestionCardHighlight(no) {
        const card = document.getElementById(`disc-card-${no}`);
        const statusBadge = document.getElementById(`disc-status-badge-${no}`);
        const ans = discAnswers[no] || {};

        for (let idx = 1; idx <= 4; idx++) {
            const rowEl = document.getElementById(`disc-row-${no}-${idx}`);
            if (!rowEl) continue;

            const isP = ans.P === idx;
            const isK = ans.K === idx;

            // Reset background kelas
            rowEl.classList.remove('bg-blue-50/70', 'border-blue-300', 'bg-rose-50/70', 'border-rose-300', 'bg-slate-50/50');

            if (isP) {
                rowEl.classList.add('bg-blue-50/70', 'border-blue-300');
            } else if (isK) {
                rowEl.classList.add('bg-rose-50/70', 'border-rose-300');
            } else {
                rowEl.classList.add('bg-white');
            }
        }

        const isComplete = ans.P && ans.K && ans.P !== ans.K;
        if (statusBadge) {
            if (isComplete) {
                statusBadge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 border border-emerald-200";
                statusBadge.innerHTML = '<i class="fa-solid fa-check"></i> <span>Lengkap</span>';
            } else if (ans.P || ans.K) {
                statusBadge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1 border border-amber-200";
                statusBadge.innerHTML = '<i class="fa-solid fa-circle-half-stroke"></i> <span>Belum Lengkap</span>';
            } else {
                statusBadge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1 border border-slate-200";
                statusBadge.innerHTML = '<i class="fa-regular fa-circle"></i> <span>Belum Diisi</span>';
            }
        }

        if (card) {
            if (isComplete) {
                card.classList.add('border-emerald-300/80');
                card.classList.remove('border-slate-200');
            } else {
                card.classList.remove('border-emerald-300/80');
                card.classList.add('border-slate-200');
            }
        }
    }

    /**
     * Merender seluruh antarmuka ujian DISC ke dalam #disc-app-container
     */
    function renderDiscUI() {
        const container = document.getElementById('disc-app-container');
        if (!container) return;

        const questions = window.DISC_QUESTIONS || [];
        if (questions.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-slate-500 font-bold">Data soal DISC tidak ditemukan.</div>';
            return;
        }

        let html = `
            <!-- HEADER MODUL DISC -->
            <div class="bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 sm:p-8 mb-6 relative overflow-hidden">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div class="flex items-center gap-3.5">
                        <div class="w-12 h-12 rounded-2xl bg-[#003865] text-white flex items-center justify-center text-xl font-black shadow-md flex-shrink-0">
                            <i class="fa-solid fa-chart-pie"></i>
                        </div>
                        <div>
                            <div class="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#0a4980]">
                                <span>PT ALTRAK 1978</span> &bull; <span>MODUL 3</span>
                            </div>
                            <h2 class="text-xl sm:text-2xl font-black text-[#003865] leading-tight">Tes 3: DISC Assessment</h2>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 self-end md:self-auto">
                        <span id="discProgressBadge" class="text-xs font-black px-3 py-1.5 rounded-full bg-[#003865] text-white shadow-sm">
                            0 / 24
                        </span>
                    </div>
                </div>

                <!-- PETUNJUK PENGERJAAN RINGKAS -->
                <div class="mt-4 p-4 rounded-2xl bg-[#edf3f9] border border-[#b9d0e7] text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                    <div class="font-bold text-[#003865] flex items-center gap-2">
                        <i class="fa-solid fa-circle-info text-amber-500"></i>
                        <span>Petunjuk Pengerjaan:</span>
                    </div>
                    <ul class="list-disc list-inside space-y-1 text-slate-600 text-xs sm:text-sm pl-1">
                        <li>Setiap nomor memiliki 4 baris pernyataan yang mendeskripsikan sifat/perilaku.</li>
                        <li>Pilihlah <strong>tepat satu [P]</strong> untuk pernyataan yang <em>PALING</em> menggambarkan diri Anda.</li>
                        <li>Pilihlah <strong>tepat satu [K]</strong> untuk pernyataan yang <em>PALING TIDAK</em> menggambarkan diri Anda (Kecil/Kurang).</li>
                        <li><strong>Perhatian:</strong> Anda tidak diperkenankan memilih [P] dan [K] pada baris pernyataan yang sama.</li>
                    </ul>
                </div>

                <!-- STICKY PROGRESS TRACKER -->
                <div class="mt-5">
                    <div class="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                        <span id="discProgressText">0 dari 24 Soal Lengkap (0%)</span>
                        <span class="text-slate-400">Wajib diisi seluruhnya</span>
                    </div>
                    <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div id="discProgressFill" class="h-full bg-gradient-to-r from-[#003865] to-emerald-500 transition-all duration-300" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <!-- CONTAINER KARTU 24 SOAL -->
            <div class="space-y-5" id="discQuestionsWrapper">
        `;

        // Render masing-masing dari 24 nomor kartu
        questions.forEach(q => {
            const ans = discAnswers[q.no] || {};
            const isComplete = ans.P && ans.K && ans.P !== ans.K;

            html += `
                <div id="disc-card-${q.no}" class="bg-white rounded-2xl border ${isComplete ? 'border-emerald-300/80 shadow-md' : 'border-slate-200 shadow-sm'} p-4 sm:p-6 transition hover:shadow-md">
                    <!-- HEADER NOMOR SOAL -->
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <div class="flex items-center gap-2">
                            <span class="w-7 h-7 rounded-lg bg-[#003865] text-white text-xs font-black flex items-center justify-center shadow-sm">
                                ${q.no}
                            </span>
                            <span class="text-sm font-bold text-[#003865]">Soal Nomor ${q.no}</span>
                        </div>
                        <div id="disc-status-badge-${q.no}">
                            <!-- Diisi via updateQuestionCardHighlight -->
                        </div>
                    </div>

                    <!-- TABEL PERNYATAAN & PILIHAN P / K -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-[11px] font-black uppercase text-slate-500 border-b border-slate-100">
                                    <th class="py-2 px-3 text-slate-600">Pernyataan Gambaran Diri</th>
                                    <th class="py-2 px-2 text-center w-16 sm:w-20 text-blue-700 bg-blue-50/50 rounded-t-lg" title="Paling Menggambarkan Diri">
                                        <span class="block text-sm font-black text-blue-700">[P]</span>
                                        <span class="text-[9px] font-semibold text-blue-600 hidden sm:inline">Paling</span>
                                    </th>
                                    <th class="py-2 px-2 text-center w-16 sm:w-20 text-rose-700 bg-rose-50/50 rounded-t-lg" title="Paling Tidak Menggambarkan Diri">
                                        <span class="block text-sm font-black text-rose-700">[K]</span>
                                        <span class="text-[9px] font-semibold text-rose-600 hidden sm:inline">Kurang</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-xs sm:text-sm">
            `;

            q.statements.forEach((stmt, idx) => {
                const sNum = idx + 1; // 1, 2, 3, 4
                const isPChecked = ans.P === sNum;
                const isKChecked = ans.K === sNum;

                let rowBgClass = "bg-white";
                if (isPChecked) rowBgClass = "bg-blue-50/70 border-blue-300";
                else if (isKChecked) rowBgClass = "bg-rose-50/70 border-rose-300";

                html += `
                    <tr id="disc-row-${q.no}-${sNum}" class="${rowBgClass} transition hover:bg-slate-50/80">
                        <!-- TEKS PERNYATAAN -->
                        <td class="py-3 px-3 text-slate-800 font-medium leading-relaxed">
                            <label for="radio_disc_${q.no}_P_${sNum}" class="cursor-pointer block select-none">
                                ${stmt}
                            </label>
                        </td>

                        <!-- PILIHAN P (PALING) -->
                        <td class="py-2 px-2 text-center bg-blue-50/30">
                            <label class="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-100 cursor-pointer transition">
                                <input type="radio" 
                                    name="disc_q_${q.no}_P" 
                                    id="radio_disc_${q.no}_P_${sNum}"
                                    value="${sNum}"
                                    ${isPChecked ? 'checked' : ''}
                                    onchange="window.discHandleSelect(${q.no}, 'P', ${sNum})"
                                    class="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                            </label>
                        </td>

                        <!-- PILIHAN K (KURANG / PALING TIDAK) -->
                        <td class="py-2 px-2 text-center bg-rose-50/30">
                            <label class="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-rose-100 cursor-pointer transition">
                                <input type="radio" 
                                    name="disc_q_${q.no}_K" 
                                    id="radio_disc_${q.no}_K_${sNum}"
                                    value="${sNum}"
                                    ${isKChecked ? 'checked' : ''}
                                    onchange="window.discHandleSelect(${q.no}, 'K', ${sNum})"
                                    class="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                />
                            </label>
                        </td>
                    </tr>
                `;
            });

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });

        html += `
            </div>

            <!-- FOOTER TOMBOL SUBMIT -->
            <div class="mt-8 bg-white rounded-3xl border border-[#b9d0e7] shadow-xl p-6 text-center space-y-3">
                <p class="text-xs text-slate-500">
                    Pastikan seluruh 24 nomor soal telah memiliki masing-masing tepat 1 [P] dan 1 [K] sebelum mengumpulkan.
                </p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button type="button" 
                        id="btnSubmitDisc"
                        onclick="window.discSubmitTest()" 
                        class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span id="btnSubmitDiscText">Kumpulkan &amp; Selesai Tes DISC</span>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Inisialisasi highlight untuk seluruh kartu soal yang sudah terisi
        questions.forEach(q => {
            updateQuestionCardHighlight(q.no);
        });

        // Update progress tracker
        updateProgressTracker();
    }

    /**
     * Memvalidasi dan mengirimkan hasil pengerjaan 24 nomor tes DISC ke Supabase RPC
     */
    async function submitDiscTest() {
        if (isSubmittingDisc) return;

        const questions = window.DISC_QUESTIONS || [];
        const missingNumbers = [];

        // Validasi seluruh 24 nomor soal
        questions.forEach(q => {
            const ans = discAnswers[q.no];
            if (!ans || !ans.P || !ans.K || ans.P === ans.K) {
                missingNumbers.push(q.no);
            }
        });

        if (missingNumbers.length > 0) {
            const listText = missingNumbers.slice(0, 10).join(', ') + (missingNumbers.length > 10 ? '...' : '');
            if (typeof customAlert === 'function') {
                customAlert(
                    "Jawaban Belum Lengkap",
                    `Masih terdapat ${missingNumbers.length} nomor soal yang belum lengkap:\n\nNomor: ${listText}\n\nHarap lengkapi masing-masing nomor dengan tepat 1 [P] (Paling Sesuai) dan 1 [K] (Paling Tidak Sesuai).`,
                    "warning"
                );
            } else {
                alert(`Masih terdapat ${missingNumbers.length} soal belum lengkap (Nomor: ${listText}).`);
            }

            // Scroll ke nomor soal pertama yang belum lengkap
            const firstMissingCard = document.getElementById(`disc-card-${missingNumbers[0]}`);
            if (firstMissingCard) {
                firstMissingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Konfirmasi pengumpulan
        const doSubmit = async () => {
            isSubmittingDisc = true;

            const btn = document.getElementById('btnSubmitDisc');
            const btnText = document.getElementById('btnSubmitDiscText');
            if (btn) btn.disabled = true;
            if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengolah & Menyimpan Hasil...';

            // Ambil snapshot akhir pelaksanaan DISC
            ambilSnapshotFoto('Akhir');

            // Susun payload jawaban dengan format: { "1": {"P": 3, "K": 2}, ... }
            const payload = {};
            questions.forEach(q => {
                payload[String(q.no)] = {
                    P: Number(discAnswers[q.no].P),
                    K: Number(discAnswers[q.no].K)
                };
            });

            const idPeserta = typeof localStorage !== 'undefined' ? localStorage.getItem('id_peserta') : null;
            const sbClient = (typeof supabaseClient !== 'undefined' && supabaseClient)
                ? supabaseClient
                : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.rpc === 'function') ? window.supabase : null);

            let rpcSuccess = false;
            let discResultData = null;

            // 1. Eksekusi Supabase RPC hitung_dan_simpan_disc
            if (sbClient && sbClient.rpc && idPeserta) {
                try {
                    const { data, error } = await sbClient.rpc('hitung_dan_simpan_disc', {
                        p_id_peserta: idPeserta,
                        p_jawaban: payload
                    });

                    if (!error) {
                        rpcSuccess = true;
                        discResultData = data;
                    } else {
                        console.warn('[DISC RPC] Gagal RPC:', error.message || error);
                    }
                } catch (eRpc) {
                    console.warn('[DISC RPC Exception]:', eRpc);
                }
            }

            // 2. Cadangan pengamanan (Zero Data Loss): jika RPC bermasalah, simpan via updateHasilTes
            if (!rpcSuccess) {
                try {
                    const backupDisc = {
                        status: 'selesai',
                        modul: 'DISC Assessment',
                        jawaban: payload,
                        waktu_selesai: new Date().toISOString()
                    };
                    if (typeof updateHasilTes === 'function') {
                        await updateHasilTes('hasil_disc', backupDisc);
                    }
                    console.log('[DISC] Cadangan hasil_disc tersimpan ke Supabase.');
                } catch (eFallback) {
                    console.warn('[DISC Fallback Error]:', eFallback);
                }
            }

            // 3. Simpan status selesai ke localStorage & bersihkan timer
            stopDiscBackgroundTimer();
            localStorage.setItem('disc_selesai', 'true');
            try {
                localStorage.removeItem('disc_answers');
                localStorage.removeItem('disc_exam_end_time');
            } catch (eClear) {}

            // 4. Buka kunci modul 4 (EPPS) melalui completeModule(3)
            if (typeof completeModule === 'function') {
                completeModule(3);
            } else {
                if (typeof customAlert === 'function') {
                    customAlert(
                        "Tes DISC Selesai",
                        "Selamat! Tes 3 (DISC) telah berhasil diselesaikan. Modul 4 (Tes EPPS) sekarang telah terbuka.",
                        "success",
                        false,
                        () => {
                            if (typeof pindahFase === 'function') pindahFase('view-dashboard');
                        }
                    );
                }
            }
        };

        if (typeof customAlert === 'function') {
            customAlert(
                "Kumpulkan Jawaban DISC?",
                "Apakah Anda yakin ingin mengumpulkan seluruh 24 jawaban Tes DISC? Setelah dikumpulkan, jawaban tidak dapat diubah kembali.",
                "confirm",
                false,
                doSubmit
            );
        } else {
            if (confirm("Apakah Anda yakin ingin mengumpulkan seluruh 24 jawaban Tes DISC?")) {
                doSubmit();
            }
        }
    }

    // Ekspor fungsi ke global scope window
    if (typeof window !== 'undefined') {
        window.startDiscTest = startDiscTest;
        window.renderDiscUI = renderDiscUI;
        window.discHandleSelect = handleSelectOption;
        window.discSubmitTest = submitDiscTest;
        window.stopDiscBackgroundTimer = stopDiscBackgroundTimer;
    }
})();
