// =========================================================================
// JEMBATAN NAVIGASI & KONEKSI DATABASE MODUL PAULI & DASHBOARD
// PT Altrak 1978 - Portal Psikotes Terpadu
// =========================================================================

(function () {
    // Jalankan saat dokumen pauli.html selesai dimuat
    window.addEventListener('DOMContentLoaded', () => {
        pasangPenyadapShowPage();
        sinkronisasiSesiDanAlurDashboard();
        pasangPenyadapLogin();
        pasangPenyadapModulPapiDanDisc();
        pasangPenyadapSelesaiPauli();
    });

    /**
     * Menyadap fungsi showPage agar setiap kali masuk ke Dashboard,
     * status penyelesaian tes (termasuk 9 subtes IST) langsung dievaluasi & dibuka kuncinya
     */
    function pasangPenyadapShowPage() {
        if (typeof window.showPage === 'function') {
            const fungsiAsliShowPage = window.showPage;
            window.showPage = function (pageId) {
                fungsiAsliShowPage(pageId);
                if (pageId === 'page-dashboard') {
                    setTimeout(() => {
                        terapkanPenguncianDashboard();
                    }, 50);
                }
            };
        }
    }

    /**
     * 1. SINKRONISASI SESI PESERTA & STATUS PENGUNCIAN BERURUTAN PADA DASHBOARD
     */
    function sinkronisasiSesiDanAlurDashboard() {
        const idPeserta = localStorage.getItem('id_peserta');
        const namaPeserta = localStorage.getItem('nama_peserta');
        const kembaliDariIst = sessionStorage.getItem('kembali_dari_ist') === 'true';

        // Jika peserta baru kembali dari IST di ist.html atau session aktif
        if (kembaliDariIst && idPeserta && namaPeserta) {
            sessionStorage.removeItem('kembali_dari_ist');

            if (typeof state !== 'undefined' && state.user) {
                state.user.name = namaPeserta;
            }

            const navName = document.getElementById('nav-user-name');
            if (navName) navName.textContent = namaPeserta.split(' ')[0];
            const navInfo = document.getElementById('nav-user-info');
            if (navInfo) navInfo.classList.remove('hide-section');

            if (typeof showPage === 'function') {
                showPage('page-dashboard');
            }
        }

        // Terapkan evaluasi penguncian kartu dashboard
        terapkanPenguncianDashboard();
    }

    /**
     * Menerapkan status penguncian berurutan pada kartu dashboard
     * Secara otomatis mendeteksi jika 9 subtes IST sudah selesai
     */
    function terapkanPenguncianDashboard() {
        // Cek data subtes IST yang tersimpan
        let subtestsSelesai = [];
        try {
            subtestsSelesai = JSON.parse(localStorage.getItem('altrak_ist_completed_subtests') || '[]');
        } catch (e) {
            subtestsSelesai = [];
        }

        // Jika 9 subtes IST sudah selesai ATAU bendera ist_selesai sudah bernilai true
        const isIstSelesai = localStorage.getItem('ist_selesai') === 'true' || 
            (Array.isArray(subtestsSelesai) && subtestsSelesai.length >= 9) ||
            (typeof istLogic !== 'undefined' && istLogic.completedSubtests && istLogic.completedSubtests.length >= 9);

        if (isIstSelesai) {
            localStorage.setItem('ist_selesai', 'true');
            if (typeof unlockDashboardCard === 'function') {
                unlockDashboardCard(1); // Buka kunci Tes 2: PAPI Kostick
            }

            // Kirim update hasil IST ke Supabase jika belum terkirim
            if (!localStorage.getItem('ist_terkirim_supabase')) {
                const dataIST = {
                    id_peserta: localStorage.getItem('id_peserta') || 'kandidat',
                    nama_peserta: localStorage.getItem('nama_peserta') || 'Peserta',
                    subtest_selesai: subtestsSelesai,
                    waktu_selesai: new Date().toISOString()
                };
                if (typeof updateHasilTes === 'function') {
                    updateHasilTes('hasil_ist', dataIST).then(sukses => {
                        if (sukses) localStorage.setItem('ist_terkirim_supabase', 'true');
                    });
                }
            }
        }

        const papiSelesai = localStorage.getItem('papi_selesai') === 'true';
        const discSelesai = localStorage.getItem('disc_selesai') === 'true';
        const pauliSelesai = localStorage.getItem('pauli_selesai') === 'true';

        if (papiSelesai && typeof unlockDashboardCard === 'function') {
            unlockDashboardCard(2); // Buka kunci Tes 3: DISC
        }
        if (discSelesai && typeof unlockDashboardCard === 'function') {
            unlockDashboardCard(3); // Buka kunci Tes 4: Pauli
        }
        if (pauliSelesai && typeof unlockDashboardCard === 'function') {
            unlockDashboardCard(4); // Selesai Keseluruhan
        }
    }

    /**
     * 2. PENYADAP FORMULIR LOGIN DI PAULI.HTML (INSERT KE SUPABASE)
     */
    function pasangPenyadapLogin() {
        if (typeof window.handleRequestOTP === 'function') {
            const origOTP = window.handleRequestOTP;

            window.handleRequestOTP = async function (e) {
                // Jalankan validasi asli bawaan form pauli
                origOTP(e);

                // Jika validasi form berhasil dan user state terisi
                if (typeof state !== 'undefined' && state.user && state.user.name) {
                    const rawName = state.user.name.trim();

                    // Bersihkan flag tes lama untuk sesi baru
                    localStorage.removeItem('ist_selesai');
                    localStorage.removeItem('papi_selesai');
                    localStorage.removeItem('disc_selesai');
                    localStorage.removeItem('pauli_selesai');
                    localStorage.removeItem('ist_terkirim_supabase');
                    localStorage.removeItem('altrak_ist_completed_subtests');

                    // Lakukan pendaftaran / INSERT ke Supabase
                    let idPesertaBaru = null;
                    try {
                        const sbUrl = window.SUPABASE_URL || 'https://rvflmznbihunezzqhobm.supabase.co';
                        const sbKey = window.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Zmxtem5iaWh1bmV6enFob2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODM4OTcsImV4cCI6MjEwNTU1OTg5N30.tHXAXhKRvChZOqKjRq9S8AvvSo59PiYizpgDI9FmHcE';

                        let supabase = null;
                        if (window.supabase && typeof window.supabase.from === 'function') {
                            supabase = window.supabase;
                        } else if (typeof supabaseClient !== 'undefined' && supabaseClient && typeof supabaseClient.from === 'function') {
                            supabase = supabaseClient;
                        } else if (window.supabase && typeof window.supabase.createClient === 'function') {
                            supabase = window.supabase.createClient(sbUrl, sbKey);
                            window.supabase = supabase;
                        }

                        if (supabase && typeof supabase.from === 'function') {
                            const { data, error } = await supabase
                                .from('kandidat_psikotes')
                                .insert([
                                    {
                                        nama_lengkap: rawName,
                                        email: (state.user && state.user.email) || '',
                                        no_wa: (state.user && (state.user.phone || state.user.no_wa)) || '',
                                        posisi_dilamar: 'Peserta Seleksi'
                                    }
                                ])
                                .select();

                            if (!error && data && data.length > 0 && data[0].id) {
                                idPesertaBaru = data[0].id;
                                console.log('[Portal Login] Kandidat berhasil tersimpan di Supabase dengan ID:', idPesertaBaru);
                            } else if (error) {
                                console.warn('[Portal Login] Catatan Supabase RLS/Insert:', error.message || error);
                            }
                        }
                    } catch (err) {
                        console.warn('[Portal Login] Catatan koneksi Supabase:', err);
                    }

                    if (!idPesertaBaru) {
                        idPesertaBaru = (typeof crypto !== 'undefined' && crypto.randomUUID)
                            ? crypto.randomUUID()
                            : 'kandidat-' + Date.now();
                    }

                    localStorage.setItem('id_peserta', String(idPesertaBaru));
                    localStorage.setItem('nama_peserta', rawName);

                    const profil = {
                        name: rawName,
                        id: idPesertaBaru,
                        email: state.user.email || 'peserta@altrak1978.co.id',
                        position: 'Peserta Seleksi'
                    };
                    localStorage.setItem('altrak_candidate_profile', JSON.stringify(profil));
                }
            };
        }
    }

    /**
     * 3. PENYADAP PENYELESAIAN MODUL PAPI (MODUL 2) & DISC (MODUL 3)
     */
    function pasangPenyadapModulPapiDanDisc() {
        if (typeof window.completeModule === 'function') {
            const fungsiAsliComplete = window.completeModule;

            window.completeModule = async function (testNum) {
                const idPeserta = localStorage.getItem('id_peserta') || 'kandidat';
                const namaPeserta = localStorage.getItem('nama_peserta') || (state.user && state.user.name) || 'Peserta';

                if (testNum === 2) {
                    console.log('[Portal Bridge] Tes 2 (PAPI) selesai, menyimpan ke Supabase...');
                    const dataPapi = {
                        id_peserta: idPeserta,
                        nama_peserta: namaPeserta,
                        status: 'selesai',
                        modul: 'PAPI Kostick',
                        waktu_selesai: new Date().toISOString()
                    };

                    if (typeof updateHasilTes === 'function') {
                        await updateHasilTes('hasil_papi', dataPapi);
                    }
                    localStorage.setItem('papi_selesai', 'true');

                } else if (testNum === 3) {
                    console.log('[Portal Bridge] Tes 3 (DISC) selesai, menyimpan ke Supabase...');
                    const dataDisc = {
                        id_peserta: idPeserta,
                        nama_peserta: namaPeserta,
                        status: 'selesai',
                        modul: 'DISC Assessment',
                        waktu_selesai: new Date().toISOString()
                    };

                    if (typeof updateHasilTes === 'function') {
                        await updateHasilTes('hasil_disc', dataDisc);
                    }
                    localStorage.setItem('disc_selesai', 'true');
                }

                // Jalankan fungsi alur bawaan aplikasi
                fungsiAsliComplete(testNum);
            };
        }
    }

    /**
     * 4. PENYADAP PENYELESAIAN TES PAULI (MODUL 4)
     */
    function pasangPenyadapSelesaiPauli() {
        if (typeof window.tampilkanHalamanSelesai === 'function') {
            const origTampilkan = window.tampilkanHalamanSelesai;

            window.tampilkanHalamanSelesai = async function () {
                origTampilkan();

                console.log('[Portal Bridge] Tes 4 (Pauli) selesai, menyimpan ke Supabase...');

                const pauliState = (typeof state !== 'undefined' && state.pauli) ? state.pauli : {};
                const userState = (typeof state !== 'undefined' && state.user) ? state.user : {};

                const dataPauli = {
                    id_peserta: localStorage.getItem('id_peserta') || 'kandidat',
                    nama_peserta: localStorage.getItem('nama_peserta') || userState.name || 'Peserta',
                    total_pauli: Number(pauliState.totalAnswered || 0),
                    jawaban_benar: Number(pauliState.scoredCorrect || 0),
                    jawaban_salah: Number(pauliState.scoredWrong || 0),
                    garis_interval_3_menit: (pauliState.garisArray && pauliState.garisArray.length)
                        ? pauliState.garisArray.join(', ')
                        : '0',
                    waktu_selesai: new Date().toISOString()
                };

                if (typeof updateHasilTes === 'function') {
                    await updateHasilTes('hasil_pauli', dataPauli);
                }
                localStorage.setItem('pauli_selesai', 'true');
            };
        }
    }
})();
