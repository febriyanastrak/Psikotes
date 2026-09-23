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
 * Memperbarui tampilan tombol di halaman tutorial sesuai status trialCompleted
 * @private
 */
function _updateTutorialButtons() {
    const btnTrial  = document.getElementById('btn-start-trial');
    const btnReal   = document.getElementById('btn-start-real');
    const trialInfo = document.getElementById('trial-required-info');

    if (!btnTrial || !btnReal) return;

    if (trialCompleted) {
        // Percobaan sudah selesai — aktifkan tombol tes asli
        btnTrial.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Percobaan Selesai';
        btnTrial.disabled = true;
        btnTrial.className = 'w-full sm:w-1/2 bg-green-500/20 text-green-700 border border-green-300 font-bold py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2';
        btnReal.disabled = false;
        btnReal.className = 'w-full sm:w-1/2 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white font-black py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2';
        if (trialInfo) trialInfo.classList.add('hide-section');
    } else {
        // Percobaan BELUM selesai — kunci tombol tes asli
        btnTrial.innerHTML = '<i class="fa-solid fa-stopwatch mr-2"></i>Coba 10 Detik';
        btnTrial.disabled = false;
        btnTrial.className = 'w-full sm:w-1/2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2';
        btnReal.disabled = true;
        btnReal.className = 'w-full sm:w-1/2 bg-slate-300 text-slate-500 font-black py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 opacity-60';
        if (trialInfo) trialInfo.classList.remove('hide-section');
    }
}

/**
 * Memulai mode uji coba (simulasi 10 detik) untuk latihan peserta
 */
function startTrialPauliTest() {
    isTrialMode = true;
    showPage('page-pauli');
    state.pauli.numbers = [].concat(LEMBAR_PAULI_ASLI);
    state.pauli.index = 1;
    state.pauli.totalAnswered = 0;
    state.pauli.correct = 0;
    state.pauli.wrong = 0;
    state.pauli.timeLeft = 10;
    state.pauli.startTimestamp = Date.now();
    state.pauli.isActive = true;

    // Tampilkan label "UJI COBA" di header
    const timerLabel = document.getElementById('pauliTimerLabel');
    if (timerLabel) timerLabel.innerText = 'Uji Coba';

    _resetPauliUI();
    renderPauliBoxes();
    runPauliTimer();
}

/**
 * Memulai tes Pauli sebenarnya (durasi 60 menit)
 * HANYA bisa dijalankan setelah trialCompleted = true
 */
function startPauliTest() {
    // KEAMANAN: Paksa harus selesaikan percobaan dulu
    if (!trialCompleted) {
        customAlert(
            "Percobaan Belum Selesai",
            "Anda harus menyelesaikan sesi uji coba 10 detik terlebih dahulu sebelum memulai tes asli.",
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

    const timerLabel = document.getElementById('pauliTimerLabel');
    if (timerLabel) timerLabel.innerText = 'Sisa Waktu';

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
    if (bar) bar.style.width = '0%';

    const timerEl = document.getElementById('pauliTimer');
    if (timerEl) timerEl.innerText = isTrialMode ? '00:10' : '60:00';
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

    isProcessing = true;

    const p = state.pauli;
    const topNum = p.numbers[p.index];
    const botNum = p.numbers[p.index + 1];
    const correctUnit = (topNum + botNum) % 10;

    if (num === correctUnit) {
        p.correct++;
    } else {
        p.wrong++;
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
        const currentIntervalIndex = Math.floor(elapsedSeconds / GARIS_INTERVAL_SECONDS);

        // Sinkronisasi perpindahan garis interval 3 menit (Hanya jika bukan trial)
        if (!isTrialMode) {
            while (state.pauli.lastProcessedInterval < currentIntervalIndex && state.pauli.garisArray.length < 19) {
                state.pauli.garisArray.push(state.pauli.intervalCounter);
                state.pauli.intervalCounter = 0;
                state.pauli.lastProcessedInterval++;
            }
        }

        const totalDuration = isTrialMode ? 10 : PAULI_DURATION_SECONDS;
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
    const t = state.pauli.timeLeft;
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');

    const timerEl = document.getElementById('pauliTimer');
    if (timerEl) timerEl.innerText = `${m}:${s}`;

    // Warna timer berubah saat waktu menipis
    const timerContainer = document.getElementById('pauliTimerContainer');
    if (timerContainer) {
        if (t <= 60 && !isTrialMode) {
            timerContainer.classList.add('timer-urgent');
        } else {
            timerContainer.classList.remove('timer-urgent');
        }
    }

    const totalDuration = isTrialMode ? 10 : PAULI_DURATION_SECONDS;
    const elapsedPct = ((totalDuration - t) / totalDuration) * 100;
    const bar = document.getElementById('pauliProgressBar');
    if (bar) bar.style.width = Math.min(100, Math.max(0, elapsedPct)) + '%';
}

/**
 * Menyelesaikan tes Pauli (baik karena waktu habis atau dikumpulkan manual)
 * @param {boolean} isTimeUp True jika waktu tes habis otomatis
 */
function finishPauliTest(isTimeUp = false) {
    // Mode Uji Coba (Trial 10 detik)
    if (isTrialMode) {
        isTrialMode = false;
        trialCompleted = true; // TANDAI percobaan sudah selesai
        state.pauli.isActive = false;
        clearInterval(state.pauli.timerId);
        customAlert(
            "✅ Uji Coba Selesai!",
            "Bagus! Anda telah menyelesaikan sesi uji coba 10 detik. Sekarang tombol 'Mulai Tes Asli' telah terbuka. Klik 'Mengerti' untuk kembali ke panduan.",
            "success",
            false,
            () => showPauliTutorial()
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
                    "Jawaban Benar": state.pauli.correct,
                    "Jawaban Salah": state.pauli.wrong,
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
