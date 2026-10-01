// =========================================================================
// ENGINE TES PAULI (KRAEPELIN)
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * Membuka halaman panduan & instruksi tes Pauli
 * Mengatur tampilan tombol berdasarkan status percobaan
 */
function showPauliTutorial() {
    showPage('page-pauli-tutorial');
    _updateTutorialButtons();
}

/**
 * Memperbarui tampilan tombol di halaman tutorial
 * Tes asli hanya dapat diakses setelah percobaan (latihan) selesai
 * @private
 */
function _updateTutorialButtons() {
    const btnTrial = document.getElementById('btn-start-trial');
    const btnReal = document.getElementById('btn-start-real');
    const trialInfo = document.getElementById('trial-required-info');

    if (trialCompleted) {
        // Percobaan sudah selesai -> Buka akses tes asli
        if (btnTrial) {
            btnTrial.innerHTML = '<i class="fa-solid fa-rotate-left mr-2"></i>Ulangi Latihan';
            btnTrial.disabled = false;
            btnTrial.className = 'w-full sm:w-1/2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer';
        }
        if (btnReal) {
            btnReal.disabled = false;
            btnReal.className = 'w-full sm:w-1/2 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-black py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer';
            btnReal.innerHTML = '<span>Mulai Tes Pauli</span> <i class="fa-solid fa-play ml-2"></i>';
        }
        if (trialInfo) {
            trialInfo.innerHTML = '<i class="fa-solid fa-circle-check text-green-600 flex-shrink-0 text-base"></i><span>Sesi latihan telah selesai. Sekarang tombol <strong>Mulai Tes Pauli</strong> telah aktif untuk memulai tes sebenarnya.</span>';
            trialInfo.className = 'w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-1 flex items-center gap-3 text-sm text-green-900';
        }
    } else {
        // Percobaan belum selesai -> Wajib latihan dahulu, kunci tombol tes asli
        if (btnTrial) {
            btnTrial.innerHTML = '<i class="fa-solid fa-flask mr-2"></i>Mulai Latihan (Percobaan)';
            btnTrial.disabled = false;
            btnTrial.className = 'w-full sm:w-1/2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer';
        }
        if (btnReal) {
            btnReal.disabled = true;
            btnReal.className = 'w-full sm:w-1/2 bg-slate-200 text-slate-400 font-bold py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 opacity-60';
            btnReal.innerHTML = '<i class="fa-solid fa-lock mr-2"></i><span>Mulai Tes Pauli (Wajib Latihan Dahulu)</span>';
        }
        if (trialInfo) {
            trialInfo.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-amber-500 flex-shrink-0 text-base"></i><span>Peserta <strong>wajib menyelesaikan sesi latihan (percobaan)</strong> terlebih dahulu. Tombol Tes Pauli terkunci dan tidak dapat dilewati secara langsung.</span>';
            trialInfo.className = 'w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-1 flex items-center gap-3 text-sm text-amber-900';
        }
    }
}

let proctoringStream = null;

/**
 * Kamera pengawas dinonaktifkan sepenuhnya (kamera dimatikan total)
 */
function startProctoringCamera() {
    stopProctoringCamera();
}

/**
 * Menghentikan stream kamera pengawas dan menyembunyikan kontainer kamera
 */
function stopProctoringCamera() {
    if (proctoringStream) {
        try {
            proctoringStream.getTracks().forEach(track => track.stop());
        } catch (e) {}
        proctoringStream = null;
    }
    const container = document.getElementById('proctoring-camera-container');
    if (container) {
        container.classList.add('hide-section');
        container.style.display = 'none';
        container.style.pointerEvents = 'none';
    }
    const video = document.getElementById('proctoringVideo');
    if (video) {
        video.srcObject = null;
        try { video.pause(); } catch (e) {}
    }
}

/**
 * Mengunci atau membuka keypad dan input angka Pauli
 * Digunakan saat waktu latihan habis agar peserta tidak dapat mengerjakan lagi
 * @param {boolean} isLocked True untuk mengunci, false untuk membuka
 */
function _lockPauliKeypad(isLocked) {
    if (typeof document === 'undefined') return;
    try {
        const keypad = (typeof document.querySelector === 'function')
            ? document.querySelector('.pauli-keypad')
            : (document.getElementById ? document.getElementById('pauliKeypad') : null);
        if (keypad && keypad.style) {
            keypad.style.pointerEvents = isLocked ? 'none' : 'auto';
            keypad.style.opacity = isLocked ? '0.4' : '1';
        }
        if (typeof document.querySelectorAll === 'function') {
            const buttons = document.querySelectorAll('.numpad-btn');
            if (buttons && buttons.forEach) {
                buttons.forEach(btn => {
                    btn.disabled = isLocked;
                });
            }
        }
    } catch (e) {}
}

/**
 * Memastikan tombol kumpulkan/selesai Pauli terpasang event listener dan tidak terkunci
 */
function _attachSubmitBtnHandler() {
    const submitBtn = document.getElementById('pauliSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        if (typeof submitBtn.removeAttribute === 'function') submitBtn.removeAttribute('disabled');
        submitBtn.style.pointerEvents = 'auto';
        submitBtn.style.cursor = 'pointer';
        submitBtn.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            finishPauliTest(false);
        };
    }
}

/**
 * Memulai mode uji coba latihan selama 30 detik untuk latihan peserta
 */
function startTrialPauliTest() {
    if (state.pauli.timerId) {
        clearInterval(state.pauli.timerId);
        state.pauli.timerId = null;
    }
    const trialDuration = (typeof TRIAL_DURATION_SECONDS !== 'undefined') 
        ? TRIAL_DURATION_SECONDS 
        : (Number(window.TRIAL_DURATION_SECONDS ?? 30));

    isTrialMode = true;
    closeModal('modal-message');
    showPage('page-pauli');

    state.pauli.numbers = [].concat(LEMBAR_PAULI_ASLI);
    state.pauli.index = 1;
    state.pauli.totalAnswered = 0;
    state.pauli.correct = 0;
    state.pauli.wrong = 0;
    state.pauli.timeLeft = trialDuration;
    state.pauli.startTimestamp = Date.now();
    state.pauli.isActive = true;
    isProcessing = false;
    lastPauliInputTime = 0;

    // Tampilkan label "Mode Latihan" di header
    const timerLabel = document.getElementById('pauliTimerLabel');
    if (timerLabel) timerLabel.innerText = 'Mode Latihan (Simulasi)';

    // Tombol saat latihan: menjelaskan tindakan dengan tepat (mengakhiri latihan & membuka konfirmasi lanjut tes asli)
    const submitBtn = document.getElementById('pauliSubmitBtn');
    const submitBtnText = document.getElementById('pauliSubmitBtnText');
    if (submitBtnText) submitBtnText.innerText = 'Selesai Latihan & Lanjut Tes Pauli';
    if (submitBtn) {
        submitBtn.disabled = false;
        if (typeof submitBtn.removeAttribute === 'function') submitBtn.removeAttribute('disabled');
        submitBtn.style.pointerEvents = 'auto';
        submitBtn.style.cursor = 'pointer';
        submitBtn.className = 'w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-md border-b-4 border-emerald-800 transition cursor-pointer flex items-center justify-center gap-2';
        submitBtn.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            finishPauliTest(false);
        };
    }

    _lockPauliKeypad(false);
    _resetPauliUI();
    renderPauliBoxes();
    runPauliTimer();
    stopProctoringCamera();
}

/**
 * Memulai tes Pauli sebenarnya (durasi 60 menit)
 * Wajib menyelesaikan sesi latihan terlebih dahulu sebelum tes asli dapat dibuka
 */
function startPauliTest() {
    // Validasi ketat: peserta WAJIB mengerjakan sesi latihan (percobaan) terlebih dahulu
    if (!trialCompleted) {
        customAlert(
            "Wajib Latihan Dahulu",
            "Anda wajib menyelesaikan sesi latihan (percobaan) terlebih dahulu sebelum dapat memulai Tes Pauli yang sebenarnya. Tes tidak dapat dimulai langsung tanpa latihan.",
            "info",
            false,
            () => {
                showPauliTutorial();
            }
        );
        return;
    }

    // Bersihkan timer sebelumnya dengan aman
    if (state.pauli.timerId) {
        clearInterval(state.pauli.timerId);
        state.pauli.timerId = null;
    }
    isTrialMode = false;
    trialCompleted = true;
    isDataSubmitted = false;

    // Pastikan semua modal tertutup sebelum memulai tes
    closeModal('modal-message');
    showPage('page-pauli');

    const fullDuration = (typeof PAULI_DURATION_SECONDS !== 'undefined')
        ? PAULI_DURATION_SECONDS
        : (Number(window.PAULI_DURATION_SECONDS ?? 3600));

    state.pauli.numbers = [];

    // Perbanyak array digit angka Pauli agar tidak kehabisan soal (40.000 digit)
    for (let i = 0; i < 20; i++) {
        state.pauli.numbers = state.pauli.numbers.concat(LEMBAR_PAULI_ASLI);
    }

    // Pastikan seluruh jawaban sesi latihan tidak ikut dihitung di tes asli
    state.pauli.index = 1;
    state.pauli.totalAnswered = 0;
    state.pauli.correct = 0;
    state.pauli.wrong = 0;
    state.pauli.timeLeft = fullDuration;
    state.pauli.startTimestamp = Date.now();
    state.pauli.lastProcessedInterval = 0;
    state.pauli.intervalCounter = 0;
    state.pauli.garisArray = [];
    state.pauli.isActive = true;
    state.pauli._hasFinished = false;
    isProcessing = false;
    lastPauliInputTime = 0;

    // Reset counter skoring per-range
    state.pauli.range1Correct = 0;
    state.pauli.range1Wrong = 0;
    state.pauli.range2Correct = 0;
    state.pauli.range2Wrong = 0;
    state.pauli.range3Correct = 0;
    state.pauli.range3Wrong = 0;

    const timerLabel = document.getElementById('pauliTimerLabel');
    if (timerLabel) timerLabel.innerText = 'Sisa Waktu';

    const submitBtn = document.getElementById('pauliSubmitBtn');
    const submitBtnText = document.getElementById('pauliSubmitBtnText');
    if (submitBtnText) submitBtnText.innerText = 'Kumpulkan Hasil Tes';
    if (submitBtn) {
        submitBtn.disabled = false;
        if (typeof submitBtn.removeAttribute === 'function') submitBtn.removeAttribute('disabled');
        submitBtn.style.pointerEvents = 'auto';
        submitBtn.style.cursor = 'pointer';
        submitBtn.className = 'w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md border-b-4 border-red-800 transition cursor-pointer flex items-center justify-center gap-2';
        submitBtn.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            finishPauliTest(false);
        };
    }

    _lockPauliKeypad(false);
    _resetPauliUI();
    renderPauliBoxes();
    runPauliTimer();
    stopProctoringCamera();
}

/**
 * Mereset elemen UI Pauli ke kondisi awal
 * Menampilkan jumlah soal terjawab (0) tanpa membocorkan status benar/salah
 * @private
 */
function _resetPauliUI() {
    const histEl = document.getElementById('historyAnswer');
    if (histEl) histEl.innerText = "";

    const ansEl = document.getElementById('mainAnswerBox');
    if (ansEl) ansEl.innerText = "";

    const bar = document.getElementById('pauliProgressBar');
    if (bar) bar.style.width = '0%';

    const timerEl = document.getElementById('pauliTimer');
    if (timerEl) timerEl.innerText = isTrialMode ? '00:30' : '60:00';

    const timerContainer = document.getElementById('pauliTimerContainer');
    if (timerContainer) timerContainer.classList.remove('timer-urgent');
}

/**
 * Menampilkan digit angka pada kotak vertikal
 */
function renderPauliBoxes() {
    const p = state.pauli;
    const i = p.index;

    const b1 = document.getElementById('pBox1');
    const b2 = document.getElementById('pBox2');
    const b3 = document.getElementById('pBox3');
    const b4 = document.getElementById('pBox4');

    if (b1) b1.innerText = (i - 1 >= 0) ? p.numbers[i - 1] : "";
    if (b2) b2.innerText = p.numbers[i] !== undefined ? p.numbers[i] : "";
    if (b3) b3.innerText = p.numbers[i + 1] !== undefined ? p.numbers[i + 1] : "";
    if (b4) b4.innerText = p.numbers[i + 2] !== undefined ? p.numbers[i + 2] : "";
}

/**
 * Menangani penekanan angka (via keypad layar atau keyboard komputer)
 * @param {number|string} num Angka satuan yang dimasukkan peserta (0-9)
 */
function handlePauliInput(num) {
    // 1. Guard ketat: Jika waktu tes sudah habis (00:00) atau tes tidak aktif, tolak input sama sekali!
    if (!state.pauli || !state.pauli.isActive || state.pauli.timeLeft <= 0) {
        if (state.pauli && state.pauli.timeLeft <= 0 && isTrialMode) {
            finishPauliTest(true);
        }
        return;
    }

    const digit = parseInt(num, 10);
    if (isNaN(digit) || digit < 0 || digit > 9) return;

    // 2. Watchdog isProcessing: jika proses animasi sebelumnya macet > 200ms, paksa reset ke false
    if (isProcessing) {
        if (!window._lastPauliProcessTime || (Date.now() - window._lastPauliProcessTime > 200)) {
            isProcessing = false;
        } else {
            return;
        }
    }

    // 3. Periksa apakah modal peringatan aktif menutupi layar
    const modalMsg = document.getElementById('modal-message');
    if (modalMsg && !modalMsg.classList.contains('hide-section')) {
        return;
    }

    window._lastPauliProcessTime = Date.now();
    isProcessing = true;

    const p = state.pauli;
    if (!p.numbers || p.numbers.length < 10) {
        p.numbers = [].concat(LEMBAR_PAULI_ASLI);
        p.index = 1;
    }
    if (typeof p.index !== 'number' || p.index < 0) {
        p.index = 1;
    }

    const topNum = Number(p.numbers[p.index]);
    const botNum = Number(p.numbers[p.index + 1]);
    const correctUnit = (topNum + botNum) % 10;
    const isCorrect = (digit === correctUnit);

    if (isCorrect) {
        p.correct = (p.correct || 0) + 1;
    } else {
        p.wrong = (p.wrong || 0) + 1;
    }

    // Skoring per-range: catat benar/salah berdasarkan posisi dalam LEMBAR_PAULI_ASLI
    const pos = p.index % PAULI_SCORE.TOTAL_LEN;
    if (pos >= PAULI_SCORE.R1_START && pos < PAULI_SCORE.R1_END) {
        if (isCorrect) p.range1Correct = (p.range1Correct || 0) + 1; else p.range1Wrong = (p.range1Wrong || 0) + 1;
    }
    if (pos >= PAULI_SCORE.R2_START && pos < PAULI_SCORE.R2_END) {
        if (isCorrect) p.range2Correct = (p.range2Correct || 0) + 1; else p.range2Wrong = (p.range2Wrong || 0) + 1;
    }
    if (pos >= PAULI_SCORE.R3_START && pos < PAULI_SCORE.R3_END) {
        if (isCorrect) p.range3Correct = (p.range3Correct || 0) + 1; else p.range3Wrong = (p.range3Wrong || 0) + 1;
    }

    p.totalAnswered = (p.totalAnswered || 0) + 1;
    p.intervalCounter = (p.intervalCounter || 0) + 1;

    const mainBox = document.getElementById('mainAnswerBox');
    if (mainBox) {
        mainBox.innerText = digit;
        mainBox.classList.add('answered');
    }

    setTimeout(() => {
        try {
            const histBox = document.getElementById('historyAnswer');
            if (histBox) {
                histBox.innerText = digit;
                histBox.classList.remove('pop-anim');
                void histBox.offsetWidth; // Trigger reflow animasi CSS
                histBox.classList.add('pop-anim');
            }

            if (mainBox) {
                mainBox.innerText = "";
                mainBox.classList.remove('answered');
            }

            p.index++;
            if (p.index > p.numbers.length - 4) {
                p.numbers.push(...LEMBAR_PAULI_ASLI);
            }

            renderPauliBoxes();
        } catch (err) {
            console.error("Error in Pauli transition:", err);
        } finally {
            isProcessing = false;
        }
    }, 70);
}

/**
 * Menjalankan timer tes dan penghitungan garis interval tiap 3 menit
 */
function runPauliTimer() {
    updateTimeDisplay();
    clearInterval(state.pauli.timerId);

    const trialDuration = (typeof TRIAL_DURATION_SECONDS !== 'undefined')
        ? TRIAL_DURATION_SECONDS
        : (Number(window.TRIAL_DURATION_SECONDS ?? 30));

    const fullDuration = (typeof PAULI_DURATION_SECONDS !== 'undefined')
        ? PAULI_DURATION_SECONDS
        : (Number(window.PAULI_DURATION_SECONDS ?? 3600));

    const intervalDuration = (typeof GARIS_INTERVAL_SECONDS !== 'undefined')
        ? GARIS_INTERVAL_SECONDS
        : (Number(window.GARIS_INTERVAL_SECONDS ?? 180));

    state.pauli.timerId = setInterval(() => {
        if (!state.pauli.isActive || !state.pauli.startTimestamp) return;

        const now = Date.now();
        const elapsedSeconds = Math.floor((now - state.pauli.startTimestamp) / 1000);

        if (isTrialMode) {
            state.pauli.timeLeft = Math.max(0, trialDuration - elapsedSeconds);
            updateTimeDisplay();

            if (state.pauli.timeLeft <= 0) {
                state.pauli.isActive = false;
                clearInterval(state.pauli.timerId);
                state.pauli.timerId = null;
                finishPauliTest(true);
            }
            return;
        }

        const currentIntervalIndex = Math.floor(elapsedSeconds / intervalDuration);

        // Sinkronisasi perpindahan garis interval 3 menit (Hanya jika tes asli)
        while (state.pauli.lastProcessedInterval < currentIntervalIndex && state.pauli.garisArray.length < 19) {
            state.pauli.garisArray.push(state.pauli.intervalCounter);
            state.pauli.intervalCounter = 0;
            state.pauli.lastProcessedInterval++;
        }

        state.pauli.timeLeft = Math.max(0, fullDuration - elapsedSeconds);
        updateTimeDisplay();

        if (state.pauli.timeLeft <= 0) {
            state.pauli.isActive = false;
            clearInterval(state.pauli.timerId);
            state.pauli.timerId = null;
            finishPauliTest(true);
        }
    }, 500);
}

/**
 * Memperbarui tampilan waktu tersisa (menit:detik) & progress bar
 */
function updateTimeDisplay() {
    const t = state.pauli.timeLeft;
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');

    const timerEl = document.getElementById('pauliTimer');
    if (timerEl) timerEl.innerText = `${m}:${s}`;

    const timerContainer = document.getElementById('pauliTimerContainer');
    if (timerContainer) {
        const urgentThreshold = isTrialMode ? 10 : 60;
        if (t <= urgentThreshold) {
            timerContainer.classList.add('timer-urgent');
        } else {
            timerContainer.classList.remove('timer-urgent');
        }
    }

    const totalDuration = isTrialMode 
        ? Number(window.TRIAL_DURATION_SECONDS ?? 30) 
        : Number(window.PAULI_DURATION_SECONDS ?? 3600);
    const elapsedPct = ((totalDuration - t) / totalDuration) * 100;
    const bar = document.getElementById('pauliProgressBar');
    if (bar) bar.style.width = Math.min(100, Math.max(0, elapsedPct)) + '%';
}

/**
 * Menyelesaikan tes Pauli (baik karena waktu habis atau dikumpulkan manual)
 * @param {boolean} isTimeUp True jika waktu tes habis otomatis
 */
function finishPauliTest(isTimeUp = false) {
    // Mode Uji Coba Latihan:
    // Jika durasi 30 detik latihan habis atau peserta klik tombol selesai latihan:
    // Kunci keypad agar tidak bisa mengerjakan lagi, lalu tampilkan pemberitahuan
    // bahwa waktu percobaan selesai dan sediakan alur konfirmasi lanjut ke tes Pauli asli
    if (isTrialMode) {
        state.pauli.isActive = false;
        state.pauli.timeLeft = 0;
        if (state.pauli.timerId) {
            clearInterval(state.pauli.timerId);
            state.pauli.timerId = null;
        }
        isTrialMode = false;
        trialCompleted = true;
        isProcessing = false;

        // Kunci keypad dan timer agar peserta benar-benar tidak bisa mengerjakan percobaan lagi
        _lockPauliKeypad(true);

        // Perbarui tombol di halaman tutorial agar terbuka jika peserta kembali ke halaman instruksi
        _updateTutorialButtons();

        // Perbarui juga tombol di halaman tes agar siap untuk lanjut ke tes asli
        const submitBtn = document.getElementById('pauliSubmitBtn');
        const submitBtnText = document.getElementById('pauliSubmitBtnText');
        if (submitBtnText) submitBtnText.innerText = 'Lanjut ke Tes Pauli';
        if (submitBtn) {
            submitBtn.disabled = false;
            if (typeof submitBtn.removeAttribute === 'function') submitBtn.removeAttribute('disabled');
            submitBtn.style.pointerEvents = 'auto';
            submitBtn.style.cursor = 'pointer';
            submitBtn.className = 'w-full bg-[#003865] hover:bg-[#0a4980] text-white font-black py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer';
            submitBtn.onclick = function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                closeModal('modal-message');
                startPauliTest();
            };
        }

        const answeredCount = state.pauli.totalAnswered || 0;
        const modalTitle = isTimeUp ? "Waktu Percobaan Selesai" : "Sesi Latihan Selesai";
        customAlert(
            modalTitle,
            `Sesi latihan (percobaan) telah selesai. Anda berhasil mencoba ${answeredCount} soal penjumlahan.\n\nSesi latihan sudah berhenti dan Anda sudah tidak dapat mengerjakan latihan lagi. Harap klik tombol di bawah untuk lanjut ke Tes Pauli yang sebenarnya (Durasi 60 Menit).`,
            "info",
            false,
            () => {
                closeModal('modal-message');
                startPauliTest();
            }
        );

        // Kustomisasi tombol OK agar menampilkan teks "Lanjut ke Tes Pauli"
        const btnOk = document.getElementById('msgBtnOk');
        if (btnOk) {
            btnOk.innerText = "Lanjut ke Tes Pauli";
            btnOk.className = "w-full bg-[#003865] hover:bg-[#0a4980] text-white font-black py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer";
        }
        return;
    }

    // MODE TES PAULI ASLI:
    // Kasus 1: Waktu habis secara otomatis (60 menit) -> langsung kumpulkan tanpa menunggu konfirmasi
    if (isTimeUp) {
        isProcessing = false;
        prosesSimpanPauli(true);
        return;
    }

    // Kasus 2: Pengumpulan manual oleh peserta -> WAJIB tampilkan konfirmasi
    // untuk mencegah tes berakhir karena ketukan atau klik yang tidak sengaja!
    customAlert(
        "Konfirmasi Pengumpulan",
        "Waktu ujian masih berjalan. Apakah Anda yakin ingin mengakhiri dan mengumpulkan hasil Tes Pauli sekarang?",
        "info",
        true, // isConfirm = true (menampilkan tombol Batal dan Ya, Lanjutkan)
        () => {
            // Peserta mengonfirmasi pengumpulan
            isProcessing = false;
            prosesSimpanPauli(false);
        },
        () => {
            // Peserta membatalkan -> tetap lanjutkan tes
            isProcessing = false;
        }
    );
}

/**
 * Memproses penyimpanan data akhir tes Pauli dan menampilkan halaman penyelesaian
 * Mengakhiri sesi dan mengirim hasil hanya SATU KALI (mencegah pengiriman ganda)
 * @param {boolean} isTimeUp Status apakah waktu habis
 */
function prosesSimpanPauli(isTimeUp = false) {
    // Pencegahan mutlak pengiriman ganda (Idempotency Guard)
    if (state.pauli._hasFinished || isDataSubmitted) {
        return;
    }
    state.pauli._hasFinished = true;

    // 1. Matikan status aktif dan timer segera
    state.pauli.isActive = false;
    if (state.pauli.timerId) {
        clearInterval(state.pauli.timerId);
        state.pauli.timerId = null;
    }
    _lockPauliKeypad(true);
    stopProctoringCamera();

    // 2. Finalisasi array interval garis
    state.pauli.garisArray.push(state.pauli.intervalCounter);
    while (state.pauli.garisArray.length < 20) {
        state.pauli.garisArray.push(0);
    }

    // 3. Hitung skoring akhir berdasarkan range yang tepat
    const finalIndex = state.pauli.index || 1;
    let scoredCorrect, scoredWrong;

    if (finalIndex < PAULI_SCORE.R2_END) {
        // Peserta mengerjakan < 1000 angka dari posisi [5,5,6,9,4]
        // Gunakan RANGE 1: [9,5,7,9,6,2,...,7,7,4,6,5,8,8,2] (posisi 0-619)
        scoredCorrect = state.pauli.range1Correct;
        scoredWrong = state.pauli.range1Wrong;
    } else {
        // Peserta mengerjakan >= 1000 angka dari posisi [5,5,6,9,4]
        // Gunakan RANGE 2: [5,5,6,9,4,...+1000] (posisi 660-1659)
        scoredCorrect = state.pauli.range2Correct;
        scoredWrong = state.pauli.range2Wrong;

        if (finalIndex >= PAULI_SCORE.R3_END) {
            // Peserta menyelesaikan SEMUA angka tabel → tambah RANGE 3
            // [3,8,5,7,4,...,6,8,9,3,6,6,5] (posisi 1839-1940)
            scoredCorrect += (state.pauli.range3Correct || 0);
            scoredWrong += (state.pauli.range3Wrong || 0);
        }
    }

    // Fallback jika belum masuk skoring range khusus
    if (typeof scoredCorrect !== 'number' || isNaN(scoredCorrect)) {
        scoredCorrect = Number(state.pauli.correct || 0);
    }
    if (typeof scoredWrong !== 'number' || isNaN(scoredWrong)) {
        scoredWrong = Number(state.pauli.wrong || 0);
    }

    // Validasi anti-tamper: total skor benar + salah tidak boleh melebihi total soal
    if (scoredCorrect + scoredWrong > state.pauli.totalAnswered) {
        scoredCorrect = Math.min(scoredCorrect, state.pauli.totalAnswered);
        scoredWrong = Math.max(0, state.pauli.totalAnswered - scoredCorrect);
    }

    // Simpan scored values ke state agar konsisten
    state.pauli.scoredCorrect = scoredCorrect;
    state.pauli.scoredWrong = scoredWrong;

    // 4. Susun payload data hasil tes peserta
    const now = new Date();
    const waktuSelesaiRapi = now.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    // Catat pelanggaran integritas jika ada perpindahan tab selama ujian
    const integrityNote = (typeof tabSwitchViolations !== 'undefined' && tabSwitchViolations > 0)
        ? ` [⚠️ Tab Switch: ${tabSwitchViolations}x]`
        : '';
    const finalWaktuSelesai = waktuSelesaiRapi + integrityNote;

    // Ambil data profil peserta dengan fallback aman jika state belum terisi
    const navUserEl = document.getElementById('nav-user-name');
    const navUserName = navUserEl && navUserEl.innerText && navUserEl.innerText !== 'Peserta' ? navUserEl.innerText : '';

    const candidateName = (state.user && state.user.name && state.user.name.trim())
        ? state.user.name
        : (navUserName || 'Peserta Ujian');

    const candidateEmail = (state.user && state.user.email && state.user.email.trim())
        ? state.user.email
        : 'peserta@altrak1978.co.id';

    const candidatePhone = (state.user && state.user.phone && state.user.phone.trim())
        ? state.user.phone
        : '-';

    const candidateStartTime = (state.user && state.user.startTime && state.user.startTime.trim())
        ? state.user.startTime
        : waktuSelesaiRapi;

    const payload = {
        "Waktu Mulai": candidateStartTime,
        "Waktu Selesai": finalWaktuSelesai,
        "Nama Lengkap": candidateName,
        "Alamat Email": candidateEmail,
        "No WhatsApp": candidatePhone,
        "Total Pauli": Number(state.pauli.totalAnswered || 0),
        "Jawaban Benar": Number(state.pauli.scoredCorrect || 0),
        "Jawaban Salah": Number(state.pauli.scoredWrong || 0),
        "Garis Interval (3 Menit)": (state.pauli.garisArray && state.pauli.garisArray.length)
            ? state.pauli.garisArray.join(', ')
            : '0'
    };

    // 5. Simpan cadangan ke localStorage secara sinkron (Zero Data Loss)
    try {
        const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
        if (storage) {
            const localList = JSON.parse(storage.getItem('hasil_psikotes_local') || '[]');
            localList.unshift(payload);
            storage.setItem('hasil_psikotes_local', JSON.stringify(localList));
        }
    } catch (e) {
        console.warn('Gagal menyimpan cadangan lokal:', e);
    }

    // 6. Simpan langsung ke memori cachedHrdData jika ada
    if (typeof cachedHrdData !== 'undefined' && Array.isArray(cachedHrdData)) {
        cachedHrdData.unshift(payload);
    }

    // 7. Pauli adalah Tes ke-4 (Modul Terakhir) -> Tandai selesai di dashboard
    if (typeof unlockDashboardCard === 'function') {
        unlockDashboardCard(4);
    }

    // 8. Tutup semua modal pesan / loading yang mungkin terbuka
    if (typeof closeModal === 'function') {
        closeModal('modal-message');
        closeModal('modal-loading');
    }

    // 9. Pastikan state user.name terisi untuk teks sambutan halaman selesai
    if (state.user && !state.user.name && candidateName) {
        state.user.name = candidateName;
    }

    // Tandai asesmen telah selesai secara global
    if (typeof window !== 'undefined') {
        window._tesSelesai = true;
    }

    // 10. Beralih LANGSUNG ke Halaman Selesai Asesmen seketika!
    if (typeof tampilkanHalamanSelesai === 'function') {
        tampilkanHalamanSelesai();
    } else if (typeof showPage === 'function') {
        showPage('page-selesai');
    }

    // 11. Kirim sinkronisasi ke server Supabase secara background (asinkron) tanpa memblokir UI
    sendToSupabase(payload);
}

/**
 * Mengirim rekaman hasil psikotes kandidat ke tabel Supabase secara asynchronous di background
 * @param {Object} payload Data rekaman jawaban peserta
 * @param {Function|null} callback Callback opsional
 */
async function sendToSupabase(payload = null, callback = null) {
    if (isDataSubmitted) {
        if (callback) callback();
        return;
    }

    if (!payload) {
        const now = new Date();
        const waktuSelesaiRapi = now.toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        const navUserEl = document.getElementById('nav-user-name');
        const navUserName = navUserEl && navUserEl.innerText && navUserEl.innerText !== 'Peserta' ? navUserEl.innerText : '';
        payload = {
            id: Date.now(),
            "Waktu Mulai": (state.user && state.user.startTime) ? state.user.startTime : waktuSelesaiRapi,
            "Waktu Selesai": waktuSelesaiRapi,
            "Nama Lengkap": (state.user && state.user.name) ? state.user.name : (navUserName || 'Peserta Ujian'),
            "Alamat Email": (state.user && state.user.email) ? state.user.email : 'peserta@altrak1978.co.id',
            "No WhatsApp": (state.user && state.user.phone) ? state.user.phone : '-',
            "Total Pauli": Number(state.pauli.totalAnswered || 0),
            "Jawaban Benar": Number(state.pauli.scoredCorrect || 0),
            "Jawaban Salah": Number(state.pauli.scoredWrong || 0),
            "Garis Interval (3 Menit)": (state.pauli.garisArray && state.pauli.garisArray.length)
                ? state.pauli.garisArray.join(', ')
                : '0'
        };
    }

    // Upayakan pengiriman ke database server Supabase
    try {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const { data, error } = await supabaseClient
                .from('hasil_psikotes_kandidat')
                .insert([payload]);

            if (error) {
                console.warn('Supabase Insert Note (tersimpan aman di cadangan lokal):', error);
            }
        }
    } catch (err) {
        console.warn('Supabase Network Note (tersimpan aman di cadangan lokal):', err);
    } finally {
        isDataSubmitted = true;
        if (callback) callback();
    }
}

// Integrasi data hasil tes Pauli ke dashboard HRD secara otomatis
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (typeof window.loadHrdData === 'function') {
            const origLoadHrd = window.loadHrdData;
            window.loadHrdData = async function() {
                await origLoadHrd();
                try {
                    const localItems = JSON.parse(localStorage.getItem('hasil_psikotes_local') || '[]');
                    if (localItems.length > 0 && typeof cachedHrdData !== 'undefined' && Array.isArray(cachedHrdData)) {
                        localItems.forEach(item => {
                            const exists = cachedHrdData.some(c => c.id === item.id || (c["Nama Lengkap"] === item["Nama Lengkap"] && c["Waktu Selesai"] === item["Waktu Selesai"]));
                            if (!exists) cachedHrdData.unshift(item);
                        });
                        if (typeof filterHrdTable === 'function') filterHrdTable();
                    }
                } catch (e) {}
            };
        }
    });

    // Listener Keyboard Global khusus Pauli: Menjamin angka 0-9 dari baris atas maupun keypad numpad selalu terbaca
    window.addEventListener('keydown', (e) => {
        const pauliPage = document.getElementById('view-pauli') || document.getElementById('page-pauli');
        if (!pauliPage || pauliPage.classList.contains('hide-section') || window._tesSelesai) {
            return;
        }

        // Tolak keyboard jika tes tidak aktif atau waktu sudah habis (00:00)
        if (!state.pauli || !state.pauli.isActive || state.pauli.timeLeft <= 0) {
            return;
        }

        // Cek jika modal pesan sedang terbuka
        const modalMsg = document.getElementById('modal-message');
        if (modalMsg && !modalMsg.classList.contains('hide-section')) {
            return;
        }

        let num = null;
        if (/^[0-9]$/.test(e.key)) {
            num = parseInt(e.key, 10);
        } else if (/^Numpad[0-9]$/.test(e.code)) {
            num = parseInt(e.code.replace('Numpad', ''), 10);
        } else if (/^Digit[0-9]$/.test(e.code)) {
            num = parseInt(e.code.replace('Digit', ''), 10);
        }

        if (num !== null && !isNaN(num) && num >= 0 && num <= 9) {
            e.preventDefault();
            e.stopPropagation();
            handlePauliInput(num);
        }
    }, true);
}
