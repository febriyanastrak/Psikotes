// =========================================================================
// JEMBATAN NAVIGASI & EVALUASI DASHBOARD MODUL (PORTAL BRIDGE)
// PT Altrak 1978 - Portal Psikotes Terpadu
// Bersih tanpa teknik monkey-patching / penyadapan fungsi global
// =========================================================================

(function () {
    'use strict';

    /**
     * Menerapkan status penguncian berurutan pada kartu dashboard
     * Secara otomatis mendeteksi jika 9 subtes IST sudah selesai
     */
    /**
     * Menerapkan status kartu dashboard secara non-linear (bebas pilih)
     * Sinkron dengan status pengerjaan seluruh 8 modul di localStorage
     */
    function terapkanPenguncianDashboard() {
        let subtestsSelesai = [];
        try {
            subtestsSelesai = JSON.parse(localStorage.getItem('altrak_ist_completed_subtests') || '[]');
        } catch (e) {
            subtestsSelesai = [];
        }

        const isIstSelesai = localStorage.getItem('ist_selesai') === 'true' || 
            (Array.isArray(subtestsSelesai) && subtestsSelesai.length >= 9) ||
            (typeof istLogic !== 'undefined' && istLogic.completedSubtests && istLogic.completedSubtests.length >= 9);

        if (isIstSelesai) {
            localStorage.setItem('ist_selesai', 'true');
            localStorage.setItem('ist_terkirim_supabase', 'true');
        }

        if (typeof syncAllModuleCardStates === 'function') {
            syncAllModuleCardStates();
        } else if (typeof unlockDashboardCard === 'function') {
            unlockDashboardCard();
        }
    }

    /**
     * Sinkronisasi sesi peserta jika baru kembali dari modul IST
     */
    function sinkronisasiSesiDanAlurDashboard() {
        const idPeserta = localStorage.getItem('id_peserta');
        const namaPeserta = localStorage.getItem('nama_peserta');
        const kembaliDariIst = sessionStorage.getItem('kembali_dari_ist') === 'true';

        if (kembaliDariIst && idPeserta && namaPeserta) {
            sessionStorage.removeItem('kembali_dari_ist');

            if (typeof state !== 'undefined' && state.user) {
                state.user.name = namaPeserta;
            }

            const navName = document.getElementById('nav-user-name');
            if (navName) navName.textContent = namaPeserta.split(' ')[0];
            const navInfo = document.getElementById('nav-user-info');
            if (navInfo) navInfo.classList.remove('hide-section');

            if (typeof pindahFase === 'function') {
                pindahFase('view-dashboard');
            } else if (typeof showPage === 'function') {
                showPage('page-dashboard');
            }
        }

        terapkanPenguncianDashboard();
    }

    if (typeof window !== 'undefined') {
        window.terapkanPenguncianDashboard = terapkanPenguncianDashboard;
        window.addEventListener('DOMContentLoaded', () => {
            sinkronisasiSesiDanAlurDashboard();
        });
    }
})();
