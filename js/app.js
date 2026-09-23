// =========================================================================
// INISIALISASI UTAMA & EVENT LISTENERS GLOBAL
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * Menampilkan halaman konfirmasi akhir selesai tes
 */
function tampilkanHalamanSelesai() {
    window._tesSelesai = true;
    const namaEl = document.getElementById('selesai-nama');
    if (namaEl && state.user.name) {
        namaEl.textContent = 'Selamat, ' + state.user.name + ' — semoga sukses dalam proses rekrutmen!';
    }
    showPage('page-selesai');
}

/**
 * Menangani klik tombol modul IST, PAPI, DISC yang belum tersedia
 * @param {number} testNum Nomor modul tes
 */
function handleLockedModule(testNum) {
    const modulNames = {
        2: "Tes 2: IST",
        3: "Tes 3: PAPI Kostick",
        4: "Tes 4: DISC"
    };
    const modulName = modulNames[testNum] || `Tes ${testNum}`;
    customAlert(
        modulName,
        `Modul ${modulName} saat ini sedang disiapkan oleh Tim Rekrutmen PT Altrak 1978.\n\nHasil pengerjaan Tes Pauli Anda telah aman tersimpan di database HRD. Silakan tunggu instruksi dari pengawas untuk melanjutkan ke tahap berikutnya.`,
        'info',
        false,
        () => {
            unlockDashboardCard(testNum);
        }
    );
}

/**
 * Menangani pengumpulan akhir seluruh proses asesmen
 */
function handleFinalSubmit() {
    customAlert(
        "Akhiri Sesi",
        "Seluruh proses asesmen telah selesai. Klik konfirmasi untuk menutup sesi dan menampilkan halaman konfirmasi akhir.",
        "info",
        true,
        () => {
            window._tesSelesai = true;
            tampilkanHalamanSelesai();
        }
    );
}

// =========================================================================
// EVENT LISTENERS GLOBAL
// =========================================================================

// Shortcut Keyboard:
// Ctrl + Shift + A (bukan H yang mudah ditebak) : Membuka Modal Login HRD
// Angka 0 s.d 9 : Input jawaban Tes Pauli secara cepat
document.addEventListener('keydown', (e) => {
    // Shortcut HRD yang lebih aman (Ctrl+Shift+A bukan Ctrl+Shift+H)
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openHrdLoginModal();
        return;
    }

    const pauliPage = document.getElementById('page-pauli');
    if (state.pauli.isActive && pauliPage && !pauliPage.classList.contains('hide-section')) {
        const modalMsg = document.getElementById('modal-message');
        if (modalMsg && !modalMsg.classList.contains('hide-section')) return;

        if (e.key >= '0' && e.key <= '9') {
            handlePauliInput(parseInt(e.key));
        }
    }
});

// Peringatan saat peserta tidak sengaja ingin reload atau tutup browser saat tes berlangsung
window.addEventListener('beforeunload', (e) => {
    if (state.pauli.isActive && !window._tesSelesai) {
        e.preventDefault();
        e.returnValue = 'Tes sedang berlangsung. Progres tes Anda akan hilang jika halaman ditutup atau di-refresh!';
        return e.returnValue;
    }
});

// Blokir klik kanan untuk mempersulit inspeksi elemen
document.addEventListener('contextmenu', (e) => {
    const pauliPage = document.getElementById('page-pauli');
    if (pauliPage && !pauliPage.classList.contains('hide-section') && state.pauli.isActive) {
        e.preventDefault();
    }
});

// Inisialisasi saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    // Pastikan halaman login yang pertama kali tampil
    showPage('page-login');
    
    // Hapus semua referensi URL hash agar tidak bisa dimanfaatkan
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
    }
});
