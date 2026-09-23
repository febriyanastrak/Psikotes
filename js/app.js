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
 * Simulasi penyelesaian modul tes berikutnya (IST, PAPI Kostick, DISC)
 * @param {number} testNum Nomor modul tes
 */
function simulateTestCompletion(testNum) {
    const modulNames = {
        2: "Tes 2: IST",
        3: "Tes 3: PAPI Kostick",
        4: "Tes 4: DISC"
    };
    const modulName = modulNames[testNum] || `Tes ${testNum}`;
    customAlert(
        modulName,
        `Modul ${modulName} saat ini sedang disiapkan oleh Tim Rekrutmen PT Altrak 1978 untuk tahap evaluasi berikutnya.\n\nHasil pengerjaan Tes Pauli Anda telah aman tersimpan di database HRD. Klik tombol di bawah untuk melanjutkan ke tahap berikutnya atau menunggu instruksi dari pengawas.`,
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

// Listener Hash URL untuk deteksi #hrd atau ?hrd=true
window.addEventListener('hashchange', checkUrlHash);
window.addEventListener('DOMContentLoaded', checkUrlHash);

// Shortcut Keyboard:
// 1. Ctrl + Shift + H : Membuka Modal Login HRD
// 2. Angka 0 s.d 9     : Input jawaban Tes Pauli secara cepat
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'H' || e.key === 'h')) {
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

// Peringatan konfirmasi saat peserta tidak sengaja ingin reload atau tutup browser saat tes berlangsung
window.addEventListener('beforeunload', (e) => {
    if (state.pauli.isActive && !window._tesSelesai) {
        e.preventDefault();
        e.returnValue = 'Tes sedang berlangsung. Progres tes Anda akan hilang jika halaman ditutup atau di-refresh!';
        return e.returnValue;
    }
});
