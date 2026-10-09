// =========================================================================
// JEMBATAN NAVIGASI & KONEKSI DATABASE MODUL IST KE PORTAL
// PT Altrak 1978 - Portal Psikotes Terpadu
// =========================================================================

(function () {
    // 1. Sinkronisasi nama peserta dari localStorage ke badge header IST
    document.addEventListener('DOMContentLoaded', () => {
        const nama = localStorage.getItem('nama_peserta');
        if (nama) {
            const badgeEl = document.getElementById('ist-participant-name');
            if (badgeEl) badgeEl.textContent = nama;
        }

        // Tautkan tombol navigasi kembali di header ke dashboard tanpa reload jika ada fungsi pindahFase
        const navBackBtn = document.querySelector('button[onclick*="istLogic.tampilkanMenu9Subtes()"]');
        if (navBackBtn) {
            navBackBtn.setAttribute('onclick', "if(typeof istLogic !== 'undefined' && istLogic.fase !== 'MENU') { istLogic.tampilkanMenu9Subtes(); } else { sessionStorage.setItem('kembali_dari_ist', 'true'); if(typeof pindahFase === 'function') { pindahFase('view-dashboard'); } else { window.location.href='index.html'; } }");
        }

        pasangJembatanIST();
    });

    /**
     * Mengaitkan fungsi selesai IST ke pengiriman updateHasilTes dan pengalihan ke dashboard
     */
    function pasangJembatanIST() {
        if (typeof istLogic !== 'undefined' && istLogic) {
            // Kaitkan handler selesai IST
            istLogic.selesaiDanKembaliKeDashboard = async function () {
                console.log('[Portal Bridge IST] Mengakhiri modul IST, mengirim data ke Supabase...');

                // Kumpulkan seluruh data rekaman subtes IST
                const subtestList = istLogic.completedSubtests || [];
                const dataIST = {
                    id_peserta: localStorage.getItem('id_peserta') || 'kandidat',
                    nama_peserta: localStorage.getItem('nama_peserta') || 'Peserta',
                    subtest_selesai: subtestList,
                    jawaban_peserta: istLogic.jawabanPeserta || {},
                    waktu_selesai: new Date().toISOString()
                };

                // Update hasil_ist menggunakan teknik Safe Merge agar tidak menimpa skor subtes dari database
                try {
                    const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
                        ? supabaseClient
                        : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

                    const idPesertaAktif = localStorage.getItem('id_peserta') || 'kandidat';
                    const violations = typeof tabSwitchViolations !== 'undefined' ? tabSwitchViolations : 0;

                    if (sb && idPesertaAktif && idPesertaAktif !== 'kandidat') {
                        // 1. Ambil data hasil_ist yang ada saat ini dari Supabase
                        const { data: rowKandidat } = await sb
                            .from('kandidat_psikotes')
                            .select('hasil_ist')
                            .eq('id', idPesertaAktif)
                            .single();

                        const existingIst = (rowKandidat && rowKandidat.hasil_ist && typeof rowKandidat.hasil_ist === 'object')
                            ? rowKandidat.hasil_ist
                            : {};

                        // 2. Selipkan catatan pelanggaran tanpa menghapus satu pun subtes hasil SQL
                        const mergedIst = {
                            ...existingIst,
                            pelanggaran_tab_switch: violations,
                            catatan_integritas: violations > 0
                                ? `[⚠️ Terdeteksi ${violations}x perpindahan tab/jendela]`
                                : 'Bersih (Tidak ada perpindahan tab)'
                        };

                        // 3. Simpan kembali data gabungan
                        await sb
                            .from('kandidat_psikotes')
                            .update({ hasil_ist: mergedIst })
                            .eq('id', idPesertaAktif);

                        console.log('[Portal Bridge IST] Safe Merge sukses: Catatan integritas tersimpan di Supabase.');
                    }
                } catch (err) {
                    console.warn('[Portal Bridge IST] Catatan penyimpanan Supabase:', err);
                }

                // Setel bendera selesai di localStorage
                localStorage.setItem('ist_selesai', 'true');

                // Buka kunci modul tes berikutnya (PAPI Kostick)
                if (typeof unlockDashboardCard === 'function') {
                    unlockDashboardCard(1);
                }
                if (typeof updateDashboardProgress === 'function') {
                    updateDashboardProgress();
                }

                // Tandai bahwa perpindahan ini berasal dari penyelesaian IST
                sessionStorage.setItem('kembali_dari_ist', 'true');

                // Pop-up modal pemberitahuan resmi sesuai instruksi
                const pesanSelesai = "Selamat! Anda telah menyelesaikan Tes 1 (IST). Kartu Tes 2: PAPI Kostick sekarang telah terbuka pada Dashboard Asesmen.";

                const aksiKembali = () => {
                    if (typeof pindahFase === 'function') {
                        pindahFase('view-dashboard');
                    } else if (typeof showPage === 'function') {
                        showPage('view-dashboard');
                    } else {
                        window.location.href = 'index.html';
                    }
                };

                if (typeof istUI !== 'undefined' && typeof istUI.showModal === 'function') {
                    istUI.showModal({
                        title: "Tes 1: IST Selesai",
                        message: pesanSelesai,
                        type: "success",
                        iconHtml: '<i class="fa-solid fa-circle-check text-emerald-400"></i>',
                        okText: '<span>Mengerti</span> <i class="fa-solid fa-arrow-right"></i>',
                        onOk: aksiKembali
                    });
                } else if (typeof customAlert === 'function') {
                    customAlert("Tes 1: IST Selesai", pesanSelesai, "success", false, aksiKembali);
                } else {
                    alert(pesanSelesai);
                    aksiKembali();
                }
            };
        }
    }
})();
