// =========================================================================
// MODUL LOGIKA & TAMPILAN PAPI KOSTICK (js/papi.js)
// PT Altrak 1978 - Portal Psikotes Terpadu
// =========================================================================

(function() {
    'use strict';

    // A. DATA STATE & VARIABEL
    let currentPapiIndex = 0; // Index 0 sampai 89
    let papiAnswers = {};     // Format: { "1": "A", "2": "B", ... }
    let contohTerjawab = false;
    let contohPilihan = null;

    // Pulihkan jawaban yang tersimpan di localStorage jika kandidat refresh
    try {
        const savedAnswers = localStorage.getItem('papi_answers');
        if (savedAnswers) {
            papiAnswers = JSON.parse(savedAnswers);
        }
    } catch (e) {
        papiAnswers = {};
    }

    // --- SISTEM PENGATUR WAKTU PAPI KOSTICK (5 Menit Latihan, 25 Menit Ujian) ---
    let instructionsTimerInterval = null;
    let examTimerInterval = null;

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function getInstructionsRemainingTimeFormatted() {
        const endTimeStr = localStorage.getItem('papi_inst_end_time');
        const endTime = endTimeStr ? parseInt(endTimeStr, 10) : null;
        if (!endTime || isNaN(endTime)) return "05:00";
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        return formatTime(remaining);
    }

    function startInstructionsTimer() {
        stopInstructionsTimer();
        let endTimeStr = localStorage.getItem('papi_inst_end_time');
        let endTime = endTimeStr ? parseInt(endTimeStr, 10) : null;
        if (!endTime || isNaN(endTime) || endTime <= Date.now()) {
            endTime = Date.now() + 5 * 60 * 1000; // 5 Menit
            localStorage.setItem('papi_inst_end_time', String(endTime));
        }

        const updateDisplay = () => {
            const el = document.getElementById('papi-instructions-timer');
            const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
            if (el) {
                el.textContent = formatTime(remaining);
                if (remaining <= 60) {
                    el.classList.add('text-amber-300');
                }
            }
            if (remaining <= 0) {
                stopInstructionsTimer();
                localStorage.removeItem('papi_inst_end_time');
                if (typeof istUI !== 'undefined' && typeof istUI.showModal === 'function') {
                    istUI.showModal({
                        title: "Waktu Percobaan Selesai",
                        message: "Batas waktu mencoba petunjuk (5 menit) telah berakhir. Anda akan diarahkan langsung ke pengerjaan 90 soal.",
                        type: "info",
                        iconHtml: '<i class="fa-solid fa-clock text-blue-500"></i>',
                        okText: "Mulai Soal Sekarang",
                        onOk: () => {
                            if (typeof window.papiStartQuestions === 'function') {
                                window.papiStartQuestions();
                            }
                        }
                    });
                } else {
                    if (typeof window.papiStartQuestions === 'function') {
                        window.papiStartQuestions();
                    }
                }
            }
        };

        updateDisplay();
        instructionsTimerInterval = setInterval(updateDisplay, 1000);
    }

    function stopInstructionsTimer() {
        if (instructionsTimerInterval) {
            clearInterval(instructionsTimerInterval);
            instructionsTimerInterval = null;
        }
    }

    function getExamRemainingTimeFormatted() {
        const endTimeStr = localStorage.getItem('papi_exam_end_time');
        const endTime = endTimeStr ? parseInt(endTimeStr, 10) : null;
        if (!endTime || isNaN(endTime)) return "25:00";
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        return formatTime(remaining);
    }

    function startExamTimer() {
        if (examTimerInterval) return;

        let endTimeStr = localStorage.getItem('papi_exam_end_time');
        let endTime = endTimeStr ? parseInt(endTimeStr, 10) : null;
        if (!endTime || isNaN(endTime) || endTime <= Date.now()) {
            endTime = Date.now() + 25 * 60 * 1000; // 25 Menit
            localStorage.setItem('papi_exam_end_time', String(endTime));
        }

        const updateDisplay = () => {
            const el = document.getElementById('papi-exam-timer');
            const container = document.getElementById('papi-exam-timer-container');
            const iconWrap = document.getElementById('papi-exam-timer-icon-wrap');
            const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

            if (el) {
                el.textContent = formatTime(remaining);
            }
            if (remaining <= 180 && container && iconWrap) {
                container.className = "bg-rose-50 border border-rose-300 px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-sm animate-pulse";
                iconWrap.className = "w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center text-sm font-bold shadow-sm";
                if (el) el.className = "text-base sm:text-lg font-black text-rose-600 font-mono tracking-wider";
            }

            if (remaining <= 0) {
                stopExamTimer();
                localStorage.removeItem('papi_exam_end_time');
                handlePapiTimeUp();
            }
        };

        updateDisplay();
        examTimerInterval = setInterval(updateDisplay, 1000);
    }

    function stopExamTimer() {
        if (examTimerInterval) {
            clearInterval(examTimerInterval);
            examTimerInterval = null;
        }
    }

    function handlePapiTimeUp() {
        stopExamTimer();
        localStorage.removeItem('papi_exam_end_time');
        const totalTerjawab = Object.keys(papiAnswers).length;
        const pesan = `Batas waktu 25 menit telah habis! Seluruh ${totalTerjawab} dari 90 soal yang telah Anda jawab akan otomatis disimpan dan dikumpulkan.`;

        if (typeof istUI !== 'undefined' && typeof istUI.showModal === 'function') {
            istUI.showModal({
                title: "Waktu Tes Telah Habis",
                message: pesan,
                type: "warning",
                iconHtml: '<i class="fa-solid fa-hourglass-end text-rose-500"></i>',
                okText: '<span>Simpan & Selesai</span> <i class="fa-solid fa-check"></i>',
                onOk: () => {
                    if (typeof window.eksekusiPengirimanPapi === 'function') {
                        window.eksekusiPengirimanPapi(true);
                    }
                }
            });
        } else {
            alert(pesan);
            if (typeof window.eksekusiPengirimanPapi === 'function') {
                window.eksekusiPengirimanPapi(true);
            }
        }
    }

    function papiBackToDashboard() {
        stopInstructionsTimer();
        stopExamTimer();
        if (typeof pindahFase === 'function') {
            pindahFase('view-dashboard');
        } else if (typeof showPage === 'function') {
            showPage('page-dashboard');
        }
    }

    /**
     * Memulai alur pengerjaan tes PAPI Kostick
     */
    function startPapiTest() {
        if (typeof closeModal === 'function') {
            closeModal('modal-module-papi');
        }
        if (typeof pindahFase === 'function') {
            pindahFase('view-papi');
        } else if (typeof showPage === 'function') {
            showPage('view-papi');
        }

        try {
            const savedAnswers = localStorage.getItem('papi_answers');
            papiAnswers = savedAnswers ? JSON.parse(savedAnswers) : {};
        } catch (e) {
            papiAnswers = {};
        }

        const totalTerjawab = Object.keys(papiAnswers).length;
        if (totalTerjawab > 0 && totalTerjawab < 90) {
            stopInstructionsTimer();
            startExamTimer();
            renderPapiQuestion(currentPapiIndex);
        } else {
            renderPapiInstructions();
        }
    }

    /**
     * TAHAP 1: Layar Petunjuk & Latihan Contoh Soal Interaktif
     */
    function renderPapiInstructions() {
        startInstructionsTimer();

        const container = document.getElementById('papi-app-container');
        if (!container) return;

        const instructions = window.PAPI_INSTRUCTIONS || {
            judul: "Tes Kepribadian PAPI Kostick",
            deskripsi: [
                "Pada tes ini terdapat 90 pasang pernyataan.",
                "Anda diminta untuk memilih SATU pernyataan dari setiap pasangan yang paling menggambarkan diri Anda, atau yang paling sesuai dengan cara kerja dan kepribadian Anda.",
                "Terkadang Anda merasa kedua pernyataan sama-sama cocok, atau sebaliknya kedua pernyataan sama-sama tidak sesuai dengan diri Anda. Meskipun demikian, Anda TETAP HARUS MEMILIH SATU di antara keduanya yang paling mendekati diri Anda.",
                "Tidak ada jawaban yang 'Benar' atau 'Salah' dalam tes ini. Bekerjalah dengan jujur, spontan, dan teliti agar profil kepribadian kerja Anda tergambar secara akurat."
            ]
        };

        const examples = window.PAPI_EXAMPLES || [
            {
                no: 1,
                a: "Saya seorang pekerja keras.",
                b: "Saya bukan seorang pemurung.",
                penjelasan_a: "Jika Anda memilih (A), berarti Anda menilai diri Anda lebih condong sebagai orang yang bekerja keras daripada bukan seorang pemurung.",
                penjelasan_b: "Jika Anda memilih (B), berarti Anda menilai diri Anda lebih condong sebagai orang yang bersemangat/tidak murung daripada seorang pekerja keras."
            },
            {
                no: 2,
                a: "Saya suka membantu orang lain mengambil keputusan.",
                b: "Saya ingin menjadi sangat sukses.",
                penjelasan_a: "Jika Anda memilih (A), berarti Anda lebih menyukai peran membimbing rekan kerja dalam memutuskan sesuatu.",
                penjelasan_b: "Jika Anda memilih (B), berarti dorongan terbesar Anda saat ini adalah mencapai kesuksesan pribadi yang tinggi."
            }
        ];

        const ex1 = examples[0] || {};
        const ex2 = examples[1] || {};

        let htmlDeskripsi = '';
        instructions.deskripsi.forEach(function(item) {
            htmlDeskripsi += `
                <li class="flex items-start gap-2.5 text-slate-700 text-sm leading-relaxed">
                    <i class="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0 text-xs"></i>
                    <span>${item}</span>
                </li>`;
        });

        container.innerHTML = `
            <div class="bg-white rounded-3xl border border-[#b9d0e7] shadow-xl overflow-hidden my-6">
                <!-- Header Card & Timer Percobaan 5 Menit -->
                <div class="bg-gradient-to-r from-[#071f38] via-[#003865] to-[#0a4980] p-6 sm:p-8 text-white relative">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-2xl bg-blue-400/20 text-blue-200 border border-blue-400/30 flex items-center justify-center text-2xl font-black shadow-inner">
                                <i class="fa-solid fa-compass"></i>
                            </div>
                            <div>
                                <span class="text-xs uppercase font-bold tracking-widest text-blue-200">Modul 2</span>
                                <h2 class="text-2xl sm:text-3xl font-black">${instructions.judul}</h2>
                                <p class="text-xs text-blue-100/80 mt-1">Personality and Preference Inventory &bull; PT Altrak 1978</p>
                            </div>
                        </div>

                        <!-- Badge Timer Percobaan (5 Menit) -->
                        <div class="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-3 self-start sm:self-auto shadow-inner">
                            <div class="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-base">
                                <i class="fa-solid fa-stopwatch animate-pulse"></i>
                            </div>
                            <div>
                                <span class="text-[10px] uppercase font-bold text-blue-200 tracking-wider block">Waktu Percobaan</span>
                                <span id="papi-instructions-timer" class="text-xl font-black text-white font-mono tracking-wider">${getInstructionsRemainingTimeFormatted()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Konten Petunjuk -->
                <div class="p-6 sm:p-8 space-y-6">
                    <div class="bg-[#edf3f9] p-5 sm:p-6 rounded-2xl border border-[#b9d0e7]">
                        <h3 class="font-black text-[#003865] text-base mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-circle-info text-amber-500"></i>
                            Petunjuk Pengerjaan Tes
                        </h3>
                        <ul class="space-y-2.5">
                            ${htmlDeskripsi}
                        </ul>
                    </div>

                    <!-- Kotak Contoh Latihan Interaktif (2 Contoh Soal) -->
                    <div class="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-6">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black uppercase tracking-wider text-[#003865] flex items-center gap-1.5">
                                <i class="fa-solid fa-vial-circle-check text-blue-600"></i>
                                Contoh Latihan Soal Interaktif (2 Contoh)
                            </span>
                            <span class="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                                Coba Klik Opsi A atau B
                            </span>
                        </div>
                        <p class="text-xs text-slate-600">
                            Silakan coba klik salah satu pilihan pada contoh di bawah ini untuk memahami cara menjawab dan melihat simulasi penjelasan:
                        </p>

                        <!-- CONTOH 1 -->
                        <div class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="bg-[#003865] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md">Contoh 1</span>
                                <span class="text-xs text-slate-500">Pilihlah salah satu yang paling mendekati diri Anda:</span>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button type="button" id="btn-example-1-a" onclick="window.papiHandleExample(1, 'A')"
                                    class="p-4 rounded-xl border-2 text-left transition flex items-start gap-3 bg-white border-slate-200 hover:border-blue-400 cursor-pointer">
                                    <span class="w-8 h-8 rounded-lg bg-slate-100 text-[#003865] font-black flex items-center justify-center flex-shrink-0 text-sm">A</span>
                                    <div class="text-sm font-semibold text-slate-800 leading-snug pt-1">${ex1.a}</div>
                                </button>
                                <button type="button" id="btn-example-1-b" onclick="window.papiHandleExample(1, 'B')"
                                    class="p-4 rounded-xl border-2 text-left transition flex items-start gap-3 bg-white border-slate-200 hover:border-blue-400 cursor-pointer">
                                    <span class="w-8 h-8 rounded-lg bg-slate-100 text-[#003865] font-black flex items-center justify-center flex-shrink-0 text-sm">B</span>
                                    <div class="text-sm font-semibold text-slate-800 leading-snug pt-1">${ex1.b}</div>
                                </button>
                            </div>
                            <!-- Penjelasan Contoh 1 -->
                            <div id="papi-example-1-explanation" class="hidden mt-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#003865]">
                                <div class="font-bold flex items-center gap-1.5 mb-1 text-sm">
                                    <i class="fa-solid fa-lightbulb text-amber-500"></i>
                                    <span>Penjelasan Contoh 1:</span>
                                </div>
                                <p id="papi-example-1-feedback-text" class="leading-relaxed text-slate-700"></p>
                            </div>
                        </div>

                        <!-- CONTOH 2 -->
                        <div class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="bg-[#003865] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md">Contoh 2</span>
                                <span class="text-xs text-slate-500">Pilihlah salah satu yang paling mendekati diri Anda:</span>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button type="button" id="btn-example-2-a" onclick="window.papiHandleExample(2, 'A')"
                                    class="p-4 rounded-xl border-2 text-left transition flex items-start gap-3 bg-white border-slate-200 hover:border-blue-400 cursor-pointer">
                                    <span class="w-8 h-8 rounded-lg bg-slate-100 text-[#003865] font-black flex items-center justify-center flex-shrink-0 text-sm">A</span>
                                    <div class="text-sm font-semibold text-slate-800 leading-snug pt-1">${ex2.a}</div>
                                </button>
                                <button type="button" id="btn-example-2-b" onclick="window.papiHandleExample(2, 'B')"
                                    class="p-4 rounded-xl border-2 text-left transition flex items-start gap-3 bg-white border-slate-200 hover:border-blue-400 cursor-pointer">
                                    <span class="w-8 h-8 rounded-lg bg-slate-100 text-[#003865] font-black flex items-center justify-center flex-shrink-0 text-sm">B</span>
                                    <div class="text-sm font-semibold text-slate-800 leading-snug pt-1">${ex2.b}</div>
                                </button>
                            </div>
                            <!-- Penjelasan Contoh 2 -->
                            <div id="papi-example-2-explanation" class="hidden mt-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#003865]">
                                <div class="font-bold flex items-center gap-1.5 mb-1 text-sm">
                                    <i class="fa-solid fa-lightbulb text-amber-500"></i>
                                    <span>Penjelasan Contoh 2:</span>
                                </div>
                                <p id="papi-example-2-feedback-text" class="leading-relaxed text-slate-700"></p>
                            </div>
                        </div>
                    </div>

                    <!-- Tombol Aksi -->
                    <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
                        <button type="button" id="btn-start-papi-test" disabled onclick="window.papiStartQuestions()"
                            class="w-full sm:w-2/3 py-4 rounded-xl font-extrabold text-sm sm:text-base text-white shadow-lg transition flex items-center justify-center gap-2 bg-slate-300 opacity-60 cursor-not-allowed">
                            <i class="fa-solid fa-play"></i>
                            <span id="btn-start-papi-text">Silakan coba latihan contoh soal di atas dahulu</span>
                        </button>
                        <button type="button" onclick="window.papiBackToDashboard()"
                            class="w-full sm:w-1/3 py-4 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer">
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Interaksi klik pada contoh latihan soal (Mendukung Contoh 1 dan Contoh 2)
     */
    function handleExampleChoice(arg1, arg2) {
        let exNo = 1;
        let choice = 'A';
        if (typeof arg2 !== 'undefined') {
            exNo = Number(arg1) || 1;
            choice = arg2;
        } else {
            choice = arg1;
            exNo = 1;
        }

        contohTerjawab = true;
        contohPilihan = choice;

        const examples = window.PAPI_EXAMPLES || [];
        const ex = examples[exNo - 1] || {};

        const btnA = document.getElementById(`btn-example-${exNo}-a`) || document.getElementById('btn-example-a');
        const btnB = document.getElementById(`btn-example-${exNo}-b`) || document.getElementById('btn-example-b');
        const expBox = document.getElementById(`papi-example-${exNo}-explanation`) || document.getElementById('papi-example-explanation');
        const expText = document.getElementById(`papi-example-${exNo}-feedback-text`) || document.getElementById('papi-example-feedback-text');
        const startBtn = document.getElementById('btn-start-papi-test');
        const startBtnText = document.getElementById('btn-start-papi-text');

        if (btnA && btnB) {
            btnA.className = "p-4 rounded-xl border-2 text-left transition flex items-start gap-3 bg-white border-slate-200 hover:border-blue-400 cursor-pointer";
            btnB.className = "p-4 rounded-xl border-2 text-left transition flex items-start gap-3 bg-white border-slate-200 hover:border-blue-400 cursor-pointer";

            if (choice === 'A') {
                btnA.className = "p-4 rounded-xl border-2 text-left transition flex items-start gap-3 bg-blue-50/80 border-[#003865] ring-2 ring-[#003865]/20 cursor-pointer";
                if (expText) expText.innerHTML = `<strong>Anda memilih (A):</strong> ${ex.penjelasan_a || 'Menilai diri Anda lebih condong pada opsi A.'}`;
            } else {
                btnB.className = "p-4 rounded-xl border-2 text-left transition flex items-start gap-3 bg-blue-50/80 border-[#003865] ring-2 ring-[#003865]/20 cursor-pointer";
                if (expText) expText.innerHTML = `<strong>Anda memilih (B):</strong> ${ex.penjelasan_b || 'Menilai diri Anda lebih condong pada opsi B.'}`;
            }
        }

        if (expBox) {
            expBox.classList.remove('hidden');
        }

        // Aktifkan tombol mulai jika salah satu contoh sudah dicoba
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.className = "w-full sm:w-2/3 py-4 rounded-xl font-extrabold text-sm sm:text-base text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b]";
            if (startBtnText) {
                startBtnText.textContent = "Saya Paham & Mulai Ujian PAPI Kostick (90 Soal)";
            }
        }
    }

    /**
     * TAHAP 2: Layar Ujian 90 Soal Utama
     */
    function renderPapiQuestion(index) {
        const questions = window.PAPI_QUESTIONS || [];
        if (!questions || questions.length === 0) {
            alert('Bank soal PAPI Kostick belum dimuat!');
            return;
        }

        if (index < 0) index = 0;
        if (index >= questions.length) index = questions.length - 1;
        currentPapiIndex = index;

        const soal = questions[index];
        const noSoal = soal.no || (index + 1);
        const totalSoal = questions.length; // 90
        const totalTerjawab = Object.keys(papiAnswers).length;
        const progressPct = Math.round((totalTerjawab / totalSoal) * 100);

        const currentAnswer = papiAnswers[noSoal] || null;

        const container = document.getElementById('papi-app-container');
        if (!container) return;

        // Render palet nomor 1 sampai 90
        let paletHtml = '';
        for (let i = 1; i <= totalSoal; i++) {
            const isAnswered = !!papiAnswers[i];
            const isCurrent = (i - 1 === index);

            let btnClass = "w-9 h-9 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ";
            if (isCurrent) {
                btnClass += "bg-[#003865] text-white ring-2 ring-blue-400 font-black shadow-md scale-105";
            } else if (isAnswered) {
                btnClass += "bg-emerald-500 text-white hover:bg-emerald-600 font-bold shadow-sm";
            } else {
                btnClass += "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200";
            }

            paletHtml += `<button type="button" onclick="window.papiJumpToQuestion(${i - 1})" class="${btnClass}">${i}</button>`;
        }

        const isChoiceA = (currentAnswer === 'A');
        const isChoiceB = (currentAnswer === 'B');

        const cardAClass = isChoiceA
            ? "p-5 sm:p-6 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer bg-blue-50/90 border-[#003865] ring-2 ring-[#003865]/30 shadow-md text-left"
            : "p-5 sm:p-6 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer bg-white border-slate-200 hover:border-blue-400 hover:shadow-md text-left";

        const cardBClass = isChoiceB
            ? "p-5 sm:p-6 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer bg-blue-50/90 border-[#003865] ring-2 ring-[#003865]/30 shadow-md text-left"
            : "p-5 sm:p-6 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer bg-white border-slate-200 hover:border-blue-400 hover:shadow-md text-left";

        const badgeAClass = isChoiceA ? "bg-[#003865] text-white" : "bg-slate-100 text-slate-700";
        const badgeBClass = isChoiceB ? "bg-[#003865] text-white" : "bg-slate-100 text-slate-700";

        const iconA = isChoiceA
            ? `<i class="fa-solid fa-circle-check text-blue-600 text-xl ml-auto"></i>`
            : `<div class="w-5 h-5 rounded-full border-2 border-slate-300 ml-auto flex-shrink-0"></div>`;

        const iconB = isChoiceB
            ? `<i class="fa-solid fa-circle-check text-blue-600 text-xl ml-auto"></i>`
            : `<div class="w-5 h-5 rounded-full border-2 border-slate-300 ml-auto flex-shrink-0"></div>`;

        const isLastQuestion = (index === totalSoal - 1);
        const allCompleted = (totalTerjawab === totalSoal);

        container.innerHTML = `
            <div class="space-y-6 my-6">
                <!-- Bar Atas: Status Soal, Timer 25 Menit & Progres -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] p-5 sm:p-6 shadow-sm">
                    <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div class="flex items-center gap-2.5">
                            <span class="w-9 h-9 rounded-xl bg-blue-500/10 text-[#003865] flex items-center justify-center font-black text-sm">
                                <i class="fa-solid fa-compass"></i>
                            </span>
                            <div>
                                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tes 2: PAPI Kostick</span>
                                <h3 class="text-base sm:text-lg font-black text-[#003865]">Soal ${noSoal} <span class="text-slate-400 font-normal">dari ${totalSoal}</span></h3>
                            </div>
                        </div>

                        <!-- Timer Ujian 25 Menit -->
                        <div id="papi-exam-timer-container" class="bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-sm">
                            <div id="papi-exam-timer-icon-wrap" class="w-8 h-8 rounded-lg bg-[#003865] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                <i class="fa-solid fa-hourglass-half animate-pulse"></i>
                            </div>
                            <div>
                                <span id="papi-exam-timer-label" class="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Sisa Waktu</span>
                                <span id="papi-exam-timer" class="text-base sm:text-lg font-black text-[#003865] font-mono tracking-wider">${getExamRemainingTimeFormatted()}</span>
                            </div>
                        </div>

                        <div class="text-right">
                            <span class="text-xs font-black text-[#003865]">${totalTerjawab} / ${totalSoal} Terjawab</span>
                            <span class="text-xs text-slate-500 block">(${progressPct}%)</span>
                        </div>
                    </div>
                    <!-- Progress Track -->
                    <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div class="bg-gradient-to-r from-blue-600 to-[#003865] h-2.5 rounded-full transition-all duration-300" style="width: ${progressPct}%;"></div>
                    </div>
                </div>

                <!-- Palet Nomor 1 s/d 90 (Posisi di Atas) -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] p-5 sm:p-6 shadow-sm">
                    <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                        <h4 class="font-black text-[#003865] text-sm flex items-center gap-2">
                            <i class="fa-solid fa-table-cells text-blue-600"></i>
                            Palet Nomor Soal (1 - ${totalSoal})
                        </h4>
                        <!-- Legenda Warna -->
                        <div class="flex items-center gap-3 text-xs text-slate-600">
                            <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></span> Belum</span>
                            <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-emerald-500"></span> Terjawab</span>
                            <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-[#003865]"></span> Aktif</span>
                        </div>
                    </div>
                    <div class="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        ${paletHtml}
                    </div>
                </div>

                <!-- Soal & Pilihan Pernyataan (Posisi di Bawah) -->
                <div class="bg-white rounded-3xl border border-[#b9d0e7] p-6 sm:p-8 shadow-xl">
                    <div class="text-center mb-6">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#edf3f9] text-[#003865] border border-[#b9d0e7]">
                            <i class="fa-solid fa-hand-pointer text-amber-500"></i>
                            Pilihlah SATU pernyataan yang paling menggambarkan diri Anda:
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Kartu Pernyataan A -->
                        <div onclick="window.papiSelectAnswer(${noSoal}, 'A')" class="${cardAClass}">
                            <div class="w-10 h-10 rounded-xl font-black text-base flex items-center justify-center flex-shrink-0 ${badgeAClass} shadow-sm">
                                A
                            </div>
                            <div class="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed pt-1">
                                ${soal.a}
                            </div>
                            ${iconA}
                        </div>

                        <!-- Kartu Pernyataan B -->
                        <div onclick="window.papiSelectAnswer(${noSoal}, 'B')" class="${cardBClass}">
                            <div class="w-10 h-10 rounded-xl font-black text-base flex items-center justify-center flex-shrink-0 ${badgeBClass} shadow-sm">
                                B
                            </div>
                            <div class="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed pt-1">
                                ${soal.b}
                            </div>
                            ${iconB}
                        </div>
                    </div>

                    <!-- Tombol Navigasi Bawah -->
                    <div class="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <button type="button" onclick="window.papiPrevQuestion()" ${index === 0 ? 'disabled' : ''}
                            class="px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 cursor-pointer ${index === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                            <i class="fa-solid fa-arrow-left"></i>
                            <span>Sebelumnya</span>
                        </button>

                        <div class="flex items-center gap-2.5">
                            ${(isLastQuestion || allCompleted) ? `
                                <button type="button" onclick="window.submitPapiTest()"
                                    class="px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg transition flex items-center gap-2 cursor-pointer">
                                    <i class="fa-solid fa-check-circle"></i>
                                    <span>Selesaikan Tes</span>
                                </button>
                            ` : ''}

                            ${!isLastQuestion ? `
                                <button type="button" onclick="window.papiNextQuestion()"
                                    class="px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#003865] hover:bg-[#083c6b] transition flex items-center gap-2 cursor-pointer shadow-md">
                                    <span>Selanjutnya</span>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Memilih jawaban A atau B pada nomor tertentu
     */
    function selectAnswer(noSoal, choice) {
        papiAnswers[noSoal] = choice;
        try {
            localStorage.setItem('papi_answers', JSON.stringify(papiAnswers));
        } catch (e) {}

        const questions = window.PAPI_QUESTIONS || [];
        const nextIdx = currentPapiIndex + 1;

        renderPapiQuestion(currentPapiIndex);

        // Pindah otomatis ke soal berikutnya setelah delay halus
        if (nextIdx < questions.length) {
            setTimeout(function() {
                renderPapiQuestion(nextIdx);
            }, 250);
        }
    }

    /**
     * Navigasi antar soal
     */
    function prevQuestion() {
        if (currentPapiIndex > 0) {
            renderPapiQuestion(currentPapiIndex - 1);
        }
    }

    function nextQuestion() {
        const questions = window.PAPI_QUESTIONS || [];
        if (currentPapiIndex < questions.length - 1) {
            renderPapiQuestion(currentPapiIndex + 1);
        }
    }

    function jumpToQuestion(idx) {
        renderPapiQuestion(idx);
    }

    /**
     * TAHAP 3: Pengiriman Hasil ke Supabase
     */
    async function submitPapiTest() {
        const questions = window.PAPI_QUESTIONS || [];
        const totalSoal = questions.length || 90;
        const totalTerjawab = Object.keys(papiAnswers).length;

        // 1. Validasi apakah seluruh 90 soal sudah dijawab
        if (totalTerjawab < totalSoal) {
            const sisa = totalSoal - totalTerjawab;
            const pesanBelum = `Masih ada ${sisa} soal yang belum dijawab. Harap lengkapi seluruh 90 soal sebelum mengumpulkan.`;
            if (typeof istUI !== 'undefined' && typeof istUI.showModal === 'function') {
                istUI.showModal({
                    title: "Soal Belum Lengkap",
                    message: pesanBelum,
                    type: "warning",
                    iconHtml: '<i class="fa-solid fa-triangle-exclamation text-amber-400"></i>',
                    okText: '<span>Saya Mengerti</span>'
                });
            } else if (typeof customAlert === 'function') {
                customAlert("Soal Belum Lengkap", pesanBelum, "error");
            } else {
                alert(pesanBelum);
            }
            return;
        }

        // 2. Konfirmasi dengan Custom Modal PT Altrak 1978 (Bukan Pop-up Browser)
        const pesanKonfirmasi = "Apakah Anda yakin ingin menyelesaikan Tes PAPI Kostick?\n\nSeluruh lembar jawaban Anda akan dikumpulkan dan disimpan ke server.";

        if (typeof istUI !== 'undefined' && typeof istUI.showModal === 'function') {
            istUI.showModal({
                title: "Konfirmasi Pengumpulan",
                message: pesanKonfirmasi,
                type: "warning",
                iconHtml: '<i class="fa-solid fa-circle-question text-amber-400"></i>',
                isConfirm: true,
                okText: '<span>Ya, Selesaikan</span> <i class="fa-solid fa-check"></i>',
                cancelText: '<i class="fa-solid fa-xmark"></i> <span>Batal</span>',
                onOk: () => {
                    eksekusiPengirimanPapi(false);
                }
            });
        } else if (typeof customAlert === 'function') {
            customAlert("Konfirmasi Selesai", pesanKonfirmasi, "info", true, () => {
                eksekusiPengirimanPapi(false);
            });
        } else {
            eksekusiPengirimanPapi(false);
        }
    }

    /**
     * Eksekusi penyimpanan data PAPI ke Supabase dan pembersihan timer
     */
    async function eksekusiPengirimanPapi(isAutoSubmit = false) {
        // Hentikan dan bersihkan seluruh timer PAPI
        stopExamTimer();
        stopInstructionsTimer();
        localStorage.removeItem('papi_exam_end_time');
        localStorage.removeItem('papi_inst_end_time');

        // Tampilkan Loading State
        const container = document.getElementById('papi-app-container');
        if (container) {
            container.innerHTML = `
                <div class="bg-white rounded-3xl border border-[#b9d0e7] p-8 sm:p-12 text-center shadow-xl my-10 max-w-lg mx-auto">
                    <div class="w-16 h-16 rounded-full bg-blue-50 text-[#003865] flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                    </div>
                    <h3 class="text-xl font-black text-[#003865] mb-2">${isAutoSubmit ? 'Waktu Habis! Menyimpan Hasil...' : 'Menyimpan Hasil Tes PAPI Kostick...'}</h3>
                    <p class="text-xs text-slate-500">Mohon tunggu sebentar, data asesmen Anda sedang disinkronisasikan ke server.</p>
                </div>
            `;
        }

        // Kirim ke Supabase
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const candidateId = user.id || localStorage.getItem('id_peserta') || localStorage.getItem('current_peserta_id');

            let sb = window.supabase;
            if (!sb && typeof supabase !== 'undefined') sb = supabase;
            if (sb && typeof sb.from !== 'function' && typeof sb.createClient === 'function' && window.SUPABASE_URL && window.SUPABASE_KEY) {
                sb = sb.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
            }

            // Panggil RPC Supabase sesuai spesifikasi
            if (sb && typeof sb.rpc === 'function') {
                try {
                    const { data, error } = await sb.rpc('hitung_dan_simpan_papi', {
                        p_id_peserta: candidateId,
                        p_jawaban: papiAnswers
                    });
                    console.log('[PAPI] Supabase RPC hitung_dan_simpan_papi:', data, error);
                } catch (rpcErr) {
                    console.warn('[PAPI] Panggilan RPC gagal (dicadangkan):', rpcErr);
                }
            }

            // Simpan juga ke kolom hasil_papi lewat fungsi updateHasilTes
            if (typeof updateHasilTes === 'function') {
                await updateHasilTes('hasil_papi', {
                    jawaban: papiAnswers,
                    selesai_pada: new Date().toISOString()
                });
            }

            localStorage.setItem('papi_terkirim', 'true');
            localStorage.setItem('hasil_papi', JSON.stringify(papiAnswers));
            localStorage.removeItem('papi_answers');
            papiAnswers = {};

        } catch (err) {
            console.error('[PAPI] Gagal mengirim data ke server:', err);
        }

        // Panggil completeModule(2) untuk membuka modul berikutnya (DISC)
        if (typeof completeModule === 'function') {
            completeModule(2);
        } else if (typeof unlockDashboardCard === 'function') {
            unlockDashboardCard(2);
            if (typeof pindahFase === 'function') {
                pindahFase('view-dashboard');
            }
        }
    }

    // Ekspor fungsi global ke window
    window.startPapiTest = startPapiTest;
    window.renderPapiInstructions = renderPapiInstructions;
    window.renderPapiQuestion = renderPapiQuestion;
    window.papiHandleExample = handleExampleChoice;
    window.papiStartQuestions = function() {
        stopInstructionsTimer();
        localStorage.removeItem('papi_inst_end_time');
        startExamTimer();
        renderPapiQuestion(0);
    };
    window.papiSelectAnswer = selectAnswer;
    window.papiPrevQuestion = prevQuestion;
    window.papiNextQuestion = nextQuestion;
    window.papiJumpToQuestion = jumpToQuestion;
    window.submitPapiTest = submitPapiTest;
    window.eksekusiPengirimanPapi = eksekusiPengirimanPapi;
    window.papiBackToDashboard = papiBackToDashboard;

})();
