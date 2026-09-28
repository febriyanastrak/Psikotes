// =========================================================================
// INISIALISASI UTAMA & EVENT LISTENERS GLOBAL (SECURITY HARDENED)
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * Menampilkan halaman konfirmasi akhir selesai seluruh rangkaian asesmen
 */
function tampilkanHalamanSelesai() {
    window._tesSelesai = true;
    if (typeof stopProctoringCamera === 'function') {
        stopProctoringCamera();
    }
    const namaEl = document.getElementById('selesai-nama');
    if (namaEl && state.user && state.user.name) {
        namaEl.textContent = 'Selamat, ' + state.user.name + ' — semoga sukses dalam proses seleksi!';
    }
    showPage('page-selesai');
    window.scrollTo(0, 0);
}

/**
 * Menangani pembukaan modul tes dari dashboard
 * @param {number} testNum Nomor modul tes (1: IST, 2: PAPI, 3: DISC, 4: Pauli)
 */
function handleStartModule(testNum) {
    if (testNum === 1) {
        const modal = document.getElementById('modal-module-ist');
        if (modal) modal.classList.remove('hide-section');
    } else if (testNum === 2) {
        const modal = document.getElementById('modal-module-papi');
        if (modal) modal.classList.remove('hide-section');
    } else if (testNum === 3) {
        const modal = document.getElementById('modal-module-disc');
        if (modal) modal.classList.remove('hide-section');
    } else if (testNum === 4) {
        showPauliTutorial();
    }
}

/**
 * Menyelesaikan modul instruksi (IST, PAPI, DISC) dan membuka kunci modul berikutnya
 * @param {number} testNum Nomor modul tes yang diselesaikan
 */
function completeModule(testNum) {
    const modalIds = {
        1: 'modal-module-ist',
        2: 'modal-module-papi',
        3: 'modal-module-disc'
    };

    const nextNames = {
        1: 'Tes 2: PAPI Kostick',
        2: 'Tes 3: DISC',
        3: 'Tes 4: Pauli'
    };

    const currentModalId = modalIds[testNum];
    if (currentModalId) {
        closeModal(currentModalId);
    }

    unlockDashboardCard(testNum);

    customAlert(
        "Modul Diselesaikan",
        `Selamat! Anda telah menyelesaikan instruksi Modul ${testNum}. Kartu ${nextNames[testNum]} sekarang telah terbuka pada Dashboard Asesmen.`,
        "success",
        false,
        () => {
            showPage('page-dashboard');
            window.scrollTo(0, 0);
        }
    );
}

/**
 * Menangani klik tombol modul yang masih terkunci
 * @param {number} testNum Nomor modul tes
 */
function handleLockedModule(testNum) {
    const modulNames = {
        1: "Tes 1: IST",
        2: "Tes 2: PAPI Kostick",
        3: "Tes 3: DISC",
        4: "Tes 4: Pauli"
    };
    const modulName = modulNames[testNum] || `Tes ${testNum}`;
    customAlert(
        "Modul Masih Terkunci",
        `Rangkaian asesmen PT Altrak 1978 harus dikerjakan secara berurutan:\n1. IST → 2. PAPI Kostick → 3. DISC → 4. Pauli.\n\nHarap selesaikan modul sebelumnya terlebih dahulu untuk membuka kunci ${modulName}.`,
        'info'
    );
}

/**
 * Membuka modal Pernyataan Persetujuan & Pakta Integritas dalam Bahasa Indonesia
 */
function openConsentModal() {
    const modal = document.getElementById('modal-consent');
    if (modal) {
        modal.classList.remove('hide-section');
    }
}

// =========================================================================
// EVENT LISTENERS GLOBAL & PENGAMANAN UJIAN
// =========================================================================

// Fungsi pembersih clipboard otomatis saat percobaan tangkapan layar (PrintScreen)
function clearUserClipboard() {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('').catch(() => {});
        }
    } catch (e) {}
}

// Keyboard input & Sistem Pengamanan Shortcut:
// - Angka 0-9 : Menjawab Pauli
// - Blokir PrintScreen, F12, Ctrl+P, Ctrl+S, Ctrl+U, dan Ctrl+Shift+I/J/C
document.addEventListener('keydown', (e) => {
    // 1. Shortcut internal otorisasi HRD (Ctrl + Shift + A)
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openHrdLoginModal();
        return;
    }

    // 2. Blokir tombol PrintScreen (Anti-Screenshot) & langsung bersihkan clipboard
    if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        clearUserClipboard();
        return;
    }

    // 3. Blokir tombol F12 (Inspect Element / Developer Tools)
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return;
    }

    // 4. Blokir shortcut cetak, simpan dokumen, dan inspect (Ctrl+P, Ctrl+S, Ctrl+U, Ctrl+Shift+I/J/C)
    if (e.ctrlKey || e.metaKey) {
        const k = (e.key || '').toLowerCase();
        if (k === 'p' || k === 's' || k === 'u') {
            e.preventDefault();
            return;
        }
        if (e.shiftKey && ['i', 'j', 'c'].includes(k)) {
            e.preventDefault();
            return;
        }
    }

    // 5. Input Pauli via keyboard (Angka 0 s.d 9)
    const pauliPage = document.getElementById('page-pauli');
    if (state.pauli && state.pauli.isActive && pauliPage && !pauliPage.classList.contains('hide-section')) {
        const modalMsg = document.getElementById('modal-message');
        if (modalMsg && !modalMsg.classList.contains('hide-section')) return;

        // Cek input angka 0-9
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            handlePauliInput(parseInt(e.key, 10));
        }
    }
});

// Listener tambahan saat tombol PrintScreen dilepas (keyup) untuk menjamin clipboard bersih di Windows
window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        clearUserClipboard();
    }
});

// Peringatan saat peserta tidak sengaja ingin refresh atau menutup tab saat tes aktif
window.addEventListener('beforeunload', (e) => {
    if (state.pauli && state.pauli.isActive && !isTrialMode && !window._tesSelesai) {
        e.preventDefault();
        e.returnValue = 'Tes Pauli sedang berlangsung. Progres tes Anda akan hilang jika halaman ditutup atau di-refresh!';
        return e.returnValue;
    }
});

// Blokir klik kanan (context menu) pada seluruh area asesmen
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});

// Blokir aksi copy, cut, paste, dan dragstart selama asesmen
['copy', 'cut', 'paste', 'dragstart'].forEach((evtName) => {
    document.addEventListener(evtName, (e) => {
        if (state.pauli && state.pauli.isActive) {
            e.preventDefault();
        }
    });
});

// Nonaktifkan seleksi teks manual via event selectstart
document.addEventListener('selectstart', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return true;
    }
    e.preventDefault();
    return false;
});

// =========================================================================
// FITUR INTEGRITAS: ANTI-PINDAH TAB / APLIKASI (MAX 3 KALI PERINGATAN)
// =========================================================================
let lastViolationTimestamp = 0;

function handleIntegrityViolation(reason) {
    // Hanya berlaku saat tes Pauli asli sedang berlangsung
    if (!state.pauli || !state.pauli.isActive || isTrialMode || window._tesSelesai) {
        return;
    }

    const now = Date.now();
    // Debounce: cegah penambahan ganda jika event blur & visibilitychange terpicu beruntun dalam rentang 1.5 detik
    if (now - lastViolationTimestamp < 1500) {
        return;
    }
    lastViolationTimestamp = now;

    tabSwitchViolations++;

    if (tabSwitchViolations <= 3) {
        const sisa = 3 - tabSwitchViolations;
        const pesanSisa = sisa > 0
            ? `Sisa toleransi pelanggaran: ${sisa} kali lagi.`
            : `PERINGATAN TERAKHIR! Jika Anda berpindah tab atau aplikasi sekali lagi, tes Anda akan otomatis diakhiri dan dikumpulkan ke server!`;

        customAlert(
            "⚠️ Peringatan Integritas Ujian",
            `Terdeteksi perpindahan ${reason}! (Pelanggaran ke-${tabSwitchViolations} dari batas maksimal 3 kali).\n\nSistem merekam seluruh aktivitas ini demi integritas seleksi PT Altrak 1978. ${pesanSisa}\n\nHarap tetap fokus pada jendela asesmen sampai waktu selesai.`,
            "error"
        );
    } else {
        // Melanggar lebih dari 3 kali: otomatis selesaikan dan kumpulkan tes
        customAlert(
            "🚨 Tes Dihentikan Otomatis",
            `Batas toleransi pelanggaran terlampaui (lebih dari 3 kali berpindah tab/aplikasi).\n\nSesuai pakta integritas ujian PT Altrak 1978, rangkaian tes Pauli Anda dihentikan secara otomatis dan lembar jawaban langsung dikumpulkan ke sistem.`,
            "error",
            false,
            () => {
                prosesSimpanPauli(true);
            }
        );

        // Fallback otomatis jika modal tidak diklik
        setTimeout(() => {
            if (state.pauli && state.pauli.isActive) {
                prosesSimpanPauli(true);
            }
        }, 1200);
    }
}

// 1. Deteksi saat berpindah tab browser (visibilitychange)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        handleIntegrityViolation('tab atau jendela browser');
    }
});

// 2. Deteksi saat berpindah ke aplikasi lain / jendela kehilangan fokus (blur)
window.addEventListener('blur', () => {
    handleIntegrityViolation('ke aplikasi lain');
});

// Inisialisasi awal saat aplikasi selesai dimuat
window.addEventListener('DOMContentLoaded', () => {
    // Pastikan halaman login yang pertama kali tampil
    showPage('page-login');

    // Pasang listener pada tombol kumpulkan
    if (typeof _attachSubmitBtnHandler === 'function') {
        _attachSubmitBtnHandler();
    }

    // Bersihkan hash dari URL untuk proteksi navigasi
    try {
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }
    } catch (err) {}
});
