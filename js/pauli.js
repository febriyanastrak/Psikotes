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
 * Tombol Mulai Tes Asli dan Latihan sekarang dapat langsung diakses
 * @private
 */
function _updateTutorialButtons() {
    const btnTrial = document.getElementById('btn-start-trial');
    const btnReal = document.getElementById('btn-start-real');
    const trialInfo = document.getElementById('trial-required-info');

    if (trialCompleted) {
        // Uji coba SUDAH selesai — buka tombol tes asli
        if (btnTrial) {
            btnTrial.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Uji Coba Selesai';
            btnTrial.disabled = true;
            btnTrial.className = 'w-full sm:w-1/2 bg-green-500/20 text-green-700 border border-green-300 font-bold py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2';
        }
        if (btnReal) {
            btnReal.disabled = false;
            btnReal.className = 'w-full sm:w-1/2 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white font-black py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer';
            btnReal.innerHTML = '<span>Mulai Tes Asli</span> <i class="fa-solid fa-play"></i>';
        }
        if (trialInfo) {
            trialInfo.innerHTML = '<i class="fa-solid fa-circle-check text-green-500 flex-shrink-0 text-base"></i><span>Uji coba telah selesai. Tekan <strong>Mulai Tes Asli</strong> untuk memulai tes Pauli selama 60 menit.</span>';
            trialInfo.className = 'w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-1 flex items-center gap-3 text-sm text-green-900';
        }
    } else {
        // Uji coba BELUM selesai — kunci tombol tes asli
        if (btnTrial) {
            btnTrial.innerHTML = '<i class="fa-solid fa-flask mr-2"></i>Mulai Uji Coba';
            btnTrial.disabled = false;
            btnTrial.className = 'w-full sm:w-1/2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer';
        }
        if (btnReal) {
            btnReal.disabled = true;
            btnReal.className = 'w-full sm:w-1/2 bg-slate-300 text-slate-500 font-black py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 opacity-60';
            btnReal.innerHTML = '<i class="fa-solid fa-lock mr-2"></i><span>Mulai Tes Asli</span>';
        }
        if (trialInfo) {
            trialInfo.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-amber-500 flex-shrink-0 text-base"></i><span>Anda <strong>wajib menyelesaikan uji coba</strong> terlebih dahulu sebelum dapat memulai Tes Pauli yang sebenarnya.</span>';
            trialInfo.className = 'w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-1 flex items-center gap-3 text-sm text-amber-900';
        }
    }
}

/**
 * Memulai mode uji coba latihan (tanpa batas waktu 10 detik) untuk latihan peserta
 */
function startTrialPauliTest() {
    isTrialMode = true;
    showPage('page-pauli');
    state.pauli.numbers = [].concat(LEMBAR_PAULI_ASLI);
    state.pauli.index = 1;
    state.pauli.totalAnswered = 0;
    state.pauli.correct = 0;
    state.pauli.wrong = 0;
    state.pauli.timeLeft = 0;
    state.pauli.startTimestamp = Date.now();
    state.pauli.isActive = true;

    // Tampilkan label "Mode Latihan" di header
    const timerLabel = document.getElementById('pauliTimerLabel');
    if (timerLabel) timerLabel.innerText = 'Mode Latihan';

    const submitBtnText = document.getElementById('pauliSubmitBtnText');
    if (submitBtnText) submitBtnText.innerText = 'Selesai Latihan & Mulai Tes Asli';

    _resetPauliUI();
    renderPauliBoxes();
    runPauliTimer();
}

/**
 * Memulai tes Pauli sebenarnya (durasi 60 menit)
 * Dapat dijalankan langsung tanpa harus dipaksa menunggu 10 detik
 */
function startPauliTest() {
    // KEAMANAN: Wajib selesaikan uji coba dulu sebelum tes asli
    if (!trialCompleted) {
        customAlert(
            "Uji Coba Wajib",
            "Anda harus menyelesaikan sesi uji coba terlebih dahulu sebelum dapat memulai Tes Pauli yang sebenarnya.",
            "error"
        );
        return;
    }

    isTrialMode = false;
    showPage('page-pauli');
    state.pauli.numbers = [];

    // Perbanyak array digit angka Pauli agar tidak kehabisan soal
    for (let i = 0; i < 20; i++) {
        state.pauli.numbers = state.pauli.numbers.concat(LEMBAR_PAULI_ASLI);
    }

    state.pauli.index = 1;
    state.pauli.totalAnswered = 0;
    state.pauli.correct = 0;
    state.pauli.wrong = 0;
    state.pauli.timeLeft = PAULI_DURATION_SECONDS;
    state.pauli.startTimestamp = Date.now();
    state.pauli.lastProcessedInterval = 0;
    state.pauli.intervalCounter = 0;
    state.pauli.garisArray = [];
    state.pauli.isActive = true;
    // Reset counter skoring per-range
    state.pauli.range1Correct = 0;
    state.pauli.range1Wrong = 0;
    state.pauli.range2Correct = 0;
    state.pauli.range2Wrong = 0;
    state.pauli.range3Correct = 0;
    state.pauli.range3Wrong = 0;

    const timerLabel = document.getElementById('pauliTimerLabel');
    if (timerLabel) timerLabel.innerText = 'Sisa Waktu';

    const submitBtnText = document.getElementById('pauliSubmitBtnText');
    if (submitBtnText) submitBtnText.innerText = 'Kumpulkan Hasil Tes';

    _resetPauliUI();
    renderPauliBoxes();
    runPauliTimer();
}

/**
 * Mereset elemen UI Pauli ke kondisi awal
 * @private
 */
function _resetPauliUI() {
    const scoreEl = document.getElementById('pauliScore');
    if (scoreEl) scoreEl.innerText = "0";

    const histEl = document.getElementById('historyAnswer');
    if (histEl) histEl.innerText = "";

    const ansEl = document.getElementById('mainAnswerBox');
    if (ansEl) ansEl.innerText = "";

    const bar = document.getElementById('pauliProgressBar');
    if (bar) bar.style.width = isTrialMode ? '100%' : '0%';

    const timerEl = document.getElementById('pauliTimer');
    if (timerEl) timerEl.innerText = isTrialMode ? '00:00' : '60:00';
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
 * @param {number} num Angka satuan yang dimasukkan peserta (0-9)
 */
function handlePauliInput(num) {
    if (!state.pauli.isActive || isProcessing) return;
    const modalMsg = document.getElementById('modal-message');
    if (modalMsg && !modalMsg.classList.contains('hide-section')) return;

    // Proteksi anti-bot/script injection: manusia butuh waktu minimal untuk menghitung & menekan tombol
    const now = Date.now();
    if (lastPauliInputTime && (now - lastPauliInputTime < 80)) {
        return; // Abaikan ketikan yang tidak wajar
    }
    lastPauliInputTime = now;

    isProcessing = true;

    const p = state.pauli;
    const topNum = p.numbers[p.index];
    const botNum = p.numbers[p.index + 1];
    const correctUnit = (topNum + botNum) % 10;
    const isCorrect = (num === correctUnit);

    if (isCorrect) {
        p.correct++;
    } else {
        p.wrong++;
    }

    // Skoring per-range: catat benar/salah berdasarkan posisi dalam LEMBAR_PAULI_ASLI
    const pos = p.index % PAULI_SCORE.TOTAL_LEN;
    if (pos >= PAULI_SCORE.R1_START && pos < PAULI_SCORE.R1_END) {
        if (isCorrect) p.range1Correct++; else p.range1Wrong++;
    }
    if (pos >= PAULI_SCORE.R2_START && pos < PAULI_SCORE.R2_END) {
        if (isCorrect) p.range2Correct++; else p.range2Wrong++;
    }
    if (pos >= PAULI_SCORE.R3_START && pos < PAULI_SCORE.R3_END) {
        if (isCorrect) p.range3Correct++; else p.range3Wrong++;
    }

    p.totalAnswered++;
    p.intervalCounter++;

    const scoreEl = document.getElementById('pauliScore');
    if (scoreEl) scoreEl.innerText = p.totalAnswered;

    const mainBox = document.getElementById('mainAnswerBox');
    if (mainBox) {
        mainBox.innerText = num;
        mainBox.classList.add('answered');
    }

    setTimeout(() => {
        const histBox = document.getElementById('historyAnswer');
        if (histBox) {
            histBox.innerText = num;
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
        isProcessing = false;
    }, 120);
}

/**
 * Menjalankan timer tes dan penghitungan garis interval tiap 3 menit
 */
function runPauliTimer() {
    updateTimeDisplay();
    clearInterval(state.pauli.timerId);

    state.pauli.timerId = setInterval(() => {
        if (!state.pauli.isActive || !state.pauli.startTimestamp) return;

        const now = Date.now();
        const elapsedSeconds = Math.floor((now - state.pauli.startTimestamp) / 1000);

        if (isTrialMode) {
            // Mode Latihan: Tidak ada batas waktu 10 detik. Tampilkan waktu berlatih bebas.
            const m = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
            const s = (elapsedSeconds % 60).toString().padStart(2, '0');
            const timerEl = document.getElementById('pauliTimer');
            if (timerEl) timerEl.innerText = `${m}:${s}`;
            const bar = document.getElementById('pauliProgressBar');
            if (bar) bar.style.width = '100%';
            return;
        }

        const currentIntervalIndex = Math.floor(elapsedSeconds / GARIS_INTERVAL_SECONDS);

        // Sinkronisasi perpindahan garis interval 3 menit (Hanya jika tes asli)
        while (state.pauli.lastProcessedInterval < currentIntervalIndex && state.pauli.garisArray.length < 19) {
            state.pauli.garisArray.push(state.pauli.intervalCounter);
            state.pauli.intervalCounter = 0;
            state.pauli.lastProcessedInterval++;
        }

        const totalDuration = PAULI_DURATION_SECONDS;
        state.pauli.timeLeft = Math.max(0, totalDuration - elapsedSeconds);
        updateTimeDisplay();

        if (state.pauli.timeLeft <= 0) {
            clearInterval(state.pauli.timerId);
            finishPauliTest(true);
        }
    }, 500);
}

/**
 * Memperbarui tampilan waktu tersisa (menit:detik) & progress bar
 */
function updateTimeDisplay() {
    if (isTrialMode) {
        const timerContainer = document.getElementById('pauliTimerContainer');
        if (timerContainer) timerContainer.classList.remove('timer-urgent');
        return;
    }

    const t = state.pauli.timeLeft;
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');

    const timerEl = document.getElementById('pauliTimer');
    if (timerEl) timerEl.innerText = `${m}:${s}`;

    // Warna timer berubah saat waktu menipis (< 60 detik)
    const timerContainer = document.getElementById('pauliTimerContainer');
    if (timerContainer) {
        if (t <= 60) {
            timerContainer.classList.add('timer-urgent');
        } else {
            timerContainer.classList.remove('timer-urgent');
        }
    }

    const totalDuration = PAULI_DURATION_SECONDS;
    const elapsedPct = ((totalDuration - t) / totalDuration) * 100;
    const bar = document.getElementById('pauliProgressBar');
    if (bar) bar.style.width = Math.min(100, Math.max(0, elapsedPct)) + '%';
}

/**
 * Menyelesaikan tes Pauli (baik karena waktu habis atau dikumpulkan manual)
 * @param {boolean} isTimeUp True jika waktu tes habis otomatis
 */
function finishPauliTest(isTimeUp = false) {
    // Mode Uji Coba Latihan (Fleksibel, tanpa 10 detik paksaan)
    if (isTrialMode) {
        clearInterval(state.pauli.timerId);
        customAlert(
            "Selesai Sesi Latihan",
            `Anda telah mencoba ${state.pauli.totalAnswered} penjumlahan dalam latihan simulasi.\n\nApakah Anda sudah siap untuk langsung memulai Tes Pauli yang sebenarnya (Durasi 60 Menit)?`,
            "info",
            true,
            () => {
                isTrialMode = false;
                trialCompleted = true;
                startPauliTest();
            },
            () => {
                isTrialMode = false;
                trialCompleted = true;
                state.pauli.isActive = false;
                showPauliTutorial();
            }
        );
        return;
    }

    // Peserta klik kumpulkan manual sebelum waktu 60 menit habis
    if (!isTimeUp) {
        customAlert(
            "Konfirmasi Selesai",
            "Waktu Anda masih tersisa. Yakin ingin mengakhiri dan mengumpulkan tes ini sekarang?",
            "info",
            true,
            () => prosesSimpanPauli(false),
            () => { }
        );
        return;
    }

    // Waktu asli 60 menit otomatis habis
    prosesSimpanPauli(true);
}

/**
 * Memproses penyimpanan data akhir tes Pauli dan mengirim ke database Supabase
 * @param {boolean} isTimeUp Status apakah waktu habis
 */
function prosesSimpanPauli(isTimeUp) {
    state.pauli.isActive = false;
    clearInterval(state.pauli.timerId);

    state.pauli.garisArray.push(state.pauli.intervalCounter);
    while (state.pauli.garisArray.length < 20) {
        state.pauli.garisArray.push(0);
    }

    // Hitung skoring akhir berdasarkan range yang tepat
    // Range ditentukan dari seberapa jauh peserta mengerjakan
    const finalIndex = state.pauli.index;
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
            scoredCorrect += state.pauli.range3Correct;
            scoredWrong += state.pauli.range3Wrong;
        }
    }

    // Simpan scored values ke state agar bisa diakses sendToSupabase
    state.pauli.scoredCorrect = scoredCorrect;
    state.pauli.scoredWrong = scoredWrong;

    sendToSupabase(() => {
        unlockDashboardCard(1);

        let judulPesan = isTimeUp ? "Waktu Habis!" : "Tes Pauli Selesai";
        customAlert(
            judulPesan,
            "Jawaban Tes Pauli Anda telah berhasil disimpan. Silakan klik tombol di bawah untuk melanjutkan ke modul tes berikutnya.",
            "success",
            false,
            () => {
                showPage('page-dashboard');
                window.scrollTo(0, 0);
            }
        );
    });
}

/**
 * Mengirim rekaman hasil psikotes kandidat ke tabel Supabase
 * @param {Function|null} callback Callback saat berhasil menyimpan
 */
async function sendToSupabase(callback = null) {
    if (isDataSubmitted) {
        if (callback) callback();
        return;
    }

    if (!supabaseClient) {
        customAlert("Gagal Menyimpan", "Koneksi database tidak tersedia.", "error");
        return;
    }

    const modalLoading = document.getElementById('modal-loading');
    if (modalLoading) modalLoading.classList.remove('hide-section');

    const now = new Date();
    const waktuSelesaiRapi = now.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    try {
        const { data, error } = await supabaseClient
            .from('hasil_psikotes_kandidat')
            .insert([
                {
                    "Waktu Mulai": state.user.startTime,
                    "Waktu Selesai": waktuSelesaiRapi,
                    "Nama Lengkap": state.user.name,
                    "Alamat Email": state.user.email,
                    "No WhatsApp": state.user.phone,
                    "Total Pauli": state.pauli.totalAnswered,
                    "Jawaban Benar": state.pauli.scoredCorrect,
                    "Jawaban Salah": state.pauli.scoredWrong,
                    "Garis Interval (3 Menit)": state.pauli.garisArray.join(', ')
                }
            ]);

        if (modalLoading) modalLoading.classList.add('hide-section');

        if (error) {
            console.error('Supabase Error:', error);
            customAlert("Gagal Menyimpan", "Terjadi kesalahan saat mengirim data ke database.", "error");
        } else {
            isDataSubmitted = true;
            if (callback) callback();
        }
    } catch (err) {
        if (modalLoading) modalLoading.classList.add('hide-section');
        console.error('Network Error:', err);
        customAlert("Koneksi Gagal", "Gagal terhubung ke database Supabase.", "error");
    }
}
