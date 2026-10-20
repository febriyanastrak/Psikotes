// =========================================================================
// ROUTER SINGLE PAGE APPLICATION (SPA) & PENANGANAN LOGIN
// PT Altrak 1978 - Portal Psikotes Terpadu
// =========================================================================

/**
 * Fungsi global untuk berpindah antar section (fase) dalam SPA
 * Menyembunyikan section yang aktif dan menampilkan section tujuan secara instan tanpa reload halaman
 * 
 * @param {string} targetId ID section tujuan (misal: 'view-login', 'view-dashboard', 'view-ist', 'view-pauli')
 */
function pindahFase(targetId) {
    console.log('[SPA Router] Berpindah ke fase:', targetId);

    // Pemetaan ID alternatif untuk mendukung kompatibilitas ID lama
    const mapId = {
        'page-login': 'view-login',
        'login': 'view-login',
        'view-login': 'view-login',

        'page-dashboard': 'view-dashboard',
        'dashboard': 'view-dashboard',
        'view-dashboard': 'view-dashboard',

        'page-ist': 'view-ist',
        'ist': 'view-ist',
        'view-ist': 'view-ist',

        'page-pauli-tutorial': 'view-pauli-tutorial',
        'pauli-tutorial': 'view-pauli-tutorial',
        'view-pauli-tutorial': 'view-pauli-tutorial',

        'page-disc': 'view-disc',
        'disc': 'view-disc',
        'view-disc': 'view-disc',

        'page-pauli': 'view-pauli',
        'pauli': 'view-pauli',
        'view-pauli': 'view-pauli',

        'page-selesai': 'view-selesai',
        'selesai': 'view-selesai',
        'view-selesai': 'view-selesai',

        'page-hrd': 'view-hrd',
        'hrd': 'view-hrd',
        'view-hrd': 'view-hrd',

        'page-dashboard-tahap2': 'view-dashboard-tahap2',
        'dashboard-tahap2': 'view-dashboard-tahap2',
        'view-dashboard-tahap2': 'view-dashboard-tahap2',

        'page-msdt': 'view-msdt',
        'msdt': 'view-msdt',
        'view-msdt': 'view-msdt',

        'page-epps': 'view-epps',
        'epps': 'view-epps',
        'view-epps': 'view-epps',

        'page-cfit': 'view-cfit',
        'cfit': 'view-cfit',
        'view-cfit': 'view-cfit',

        'page-mbti': 'view-mbti',
        'mbti': 'view-mbti',
        'view-mbti': 'view-mbti'
    };

    const finalTargetId = mapId[targetId] || targetId;

    // 1. Sembunyikan semua section di dalam main
    const allSections = document.querySelectorAll('main > section');
    allSections.forEach(sec => {
        sec.style.setProperty('display', 'none', 'important');
        sec.classList.remove('fase-aktif', 'fase-aktif-block');
        sec.classList.add('hide-section');
    });

    // 2. Tampilkan section target
    const targetSection = document.getElementById(finalTargetId) || document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.remove('hide-section');
        const displayType = (finalTargetId === 'view-dashboard' || finalTargetId === 'view-hrd' || finalTargetId === 'view-disc' || finalTargetId === 'view-dashboard-tahap2') ? 'block' : 'flex';
        targetSection.style.setProperty('display', displayType, 'important');
        targetSection.classList.add(displayType === 'block' ? 'fase-aktif-block' : 'fase-aktif');

        // Sinkronisasi background canvas agar tidak bocor putih saat modul corporate-modern-bg aktif
        if (targetSection.classList.contains('corporate-modern-bg')) {
            document.body.style.backgroundColor = '#071f38';
            document.documentElement.style.backgroundColor = '#071f38';
        } else {
            document.body.style.backgroundColor = '';
            document.documentElement.style.backgroundColor = '';
        }
    } else {
        console.warn('[SPA Router] Section target tidak ditemukan:', finalTargetId);
    }

    // 3. Scroll ke posisi atas secara otomatis
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Simpan fase aktif ke localStorage & sessionStorage untuk Auto-Restore menyeluruh saat reload
    try {
        if (finalTargetId !== 'view-login' && finalTargetId !== 'view-selesai') {
            localStorage.setItem('altrak_fase_aktif', finalTargetId);
            sessionStorage.setItem('altrak_fase_aktif', finalTargetId);
        } else if (finalTargetId === 'view-selesai') {
            localStorage.setItem('altrak_fase_aktif', 'view-selesai');
            sessionStorage.setItem('altrak_fase_aktif', 'view-selesai');
        } else if (finalTargetId === 'view-login') {
            localStorage.removeItem('altrak_fase_aktif');
            sessionStorage.removeItem('altrak_fase_aktif');
        }
    } catch (eStorage) {}

    // 4. Jika menuju dashboard, perbarui status kartu dan progres secara otomatis
    if (finalTargetId === 'view-dashboard') {
        if (typeof stopProctoringCamera === 'function') {
            stopProctoringCamera();
        }
        if (typeof terapkanPenguncianDashboard === 'function') {
            terapkanPenguncianDashboard();
        }
        if (typeof updateDashboardProgress === 'function') {
            updateDashboardProgress();
        }
        if (typeof checkDashboardFullscreen === 'function') {
            setTimeout(checkDashboardFullscreen, 200);
        }
    }

    // 5. Jika menuju DISC atau halaman selesai, hentikan floating kamera secara otomatis
    if (finalTargetId === 'view-disc' || finalTargetId === 'view-selesai') {
        if (typeof stopProctoringCamera === 'function') {
            stopProctoringCamera();
        }
        if (finalTargetId === 'view-selesai') {
            window._tesSelesai = true;
            // Kembalikan layar ke mode normal (exitFullscreen) saat di halaman selesai
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
            try {
                localStorage.removeItem('kandidat_foto_pengawasan');
            } catch (e) {}
        }
    }

    // 6. Jika menuju Dashboard Tahap 2, hentikan kamera & perbarui progres modul kepemimpinan
    if (finalTargetId === 'view-dashboard-tahap2') {
        if (typeof stopProctoringCamera === 'function') {
            stopProctoringCamera();
        }
        if (typeof updateDashboardTahap2Progress === 'function') {
            updateDashboardTahap2Progress();
        }
    }
}

// Hubungkan fungsi lama ke pindahFase agar seluruh pemanggilan lama otomatis berjalan
if (typeof window !== 'undefined') {
    window.pindahFase = pindahFase;
    window.showPage = pindahFase;
}

/**
 * Menangani pengiriman formulir login dalam SPA sesuai ketentuan:
 * - Validasi checkbox Pakta Integritas
 * - INSERT data ke Supabase (tabel kandidat_psikotes)
 * - Simpan ID peserta ke localStorage
 * - Pindah ke view-dashboard
 * 
 * @param {Event} event Objek event submit form
 */
async function handleLoginSPA(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    if (typeof window.handleCandidateLogin === 'function') {
        return window.handleCandidateLogin(event);
    }
    console.warn('[SPA Router] Modul auth belum siap.');
}

if (typeof window !== 'undefined') {
    window.handleLoginSPA = handleLoginSPA;
}

// Inisialisasi awal saat dokumen siap: pulihkan fase aktif (Auto-Restore) atau buka view-login
// Inisialisasi awal saat dokumen siap: pulihkan fase aktif (Auto-Restore Seluruh Modul) atau buka view-login
document.addEventListener('DOMContentLoaded', () => {
    const savedId = localStorage.getItem('id_peserta');
    const savedName = localStorage.getItem('nama_peserta');
    let activeFase = null;
    try {
        activeFase = localStorage.getItem('altrak_fase_aktif') || sessionStorage.getItem('altrak_fase_aktif');
    } catch (e) {}

    const isPauliSelesai = localStorage.getItem('pauli_selesai') === 'true';

    // 1. Pulihkan badge navbar dan identitas peserta jika sudah login
    if (savedName) {
        const navName = document.getElementById('nav-user-name');
        if (navName) navName.textContent = savedName.split(' ')[0];
        const navInfo = document.getElementById('nav-user-info');
        if (navInfo) navInfo.classList.remove('hide-section');
        if (typeof state !== 'undefined' && state.user) {
            state.user.name = savedName;
            state.user.email = localStorage.getItem('email_peserta') || '';
            state.user.phone = localStorage.getItem('phone_peserta') || '';
        }
    }

    const isTahap2Aktif = localStorage.getItem('altrak_tahap2_aktif') === 'true';
    const isFaseTahap2 = activeFase && (activeFase.includes('tahap2') || activeFase.includes('msdt') || activeFase.includes('epps') || activeFase.includes('cfit') || activeFase.includes('mbti'));

    // 2. Jika seluruh rangkaian tes reguler sudah selesai dan bukan sesi aktif Tahap 2: Kunci di view-selesai
    if (savedId && savedName && (isPauliSelesai || activeFase === 'view-selesai') && (!isTahap2Aktif || !isFaseTahap2)) {
        console.log('[SPA Router] Seluruh rangkaian asesmen tahap 1 telah selesai. Menampilkan halaman selesai.');
        pindahFase('view-selesai');
        setTimeout(() => {
            if (typeof tampilkanHalamanSelesai === 'function') {
                tampilkanHalamanSelesai();
            }
        }, 100);
        return;
    }

    // 3. Solusi Auto-Restore Menyeluruh: Pulihkan sesi ujian yang sedang berjalan pada modul mana pun
    if (savedId && savedName && activeFase && activeFase !== 'view-login') {
        console.log('[SPA Router] Auto-Restore Menyeluruh aktif: Mengembalikan kandidat ke fase terakhir:', activeFase);
        pindahFase(activeFase);

        // Pulihkan konten spesifik per modul tes
        setTimeout(() => {
            // Modul 1: IST
            if (activeFase === 'view-ist') {
                if (typeof startISTTest === 'function') {
                    startISTTest();
                } else if (typeof istLogic !== 'undefined' && typeof istLogic.init === 'function') {
                    istLogic.init();
                }
            }
            // Modul 2: PAPI Kostick
            else if (activeFase === 'view-papi') {
                if (typeof startPapiTest === 'function') {
                    startPapiTest();
                }
            }
            // Modul 3: DISC Assessment
            else if (activeFase === 'view-disc') {
                if (typeof startDiscTest === 'function') {
                    startDiscTest();
                } else if (typeof renderDiscUI === 'function') {
                    renderDiscUI();
                }
            }
            // Modul 4: Pauli (Kraepelin)
            else if (activeFase === 'view-pauli') {
                if (typeof startPauliTest === 'function') {
                    startPauliTest();
                }
            }
            else if (activeFase === 'view-pauli-tutorial') {
                pindahFase('view-pauli-tutorial');
            }
            // Dashboard Asesmen Reguler
            else if (activeFase === 'view-dashboard') {
                if (typeof terapkanPenguncianDashboard === 'function') {
                    terapkanPenguncianDashboard();
                }
                if (typeof updateDashboardProgress === 'function') {
                    updateDashboardProgress();
                }
            }
            // Dashboard Asesmen Kepemimpinan Tahap 2
            else if (activeFase === 'view-dashboard-tahap2') {
                if (typeof bukaDashboardTahap2 === 'function') {
                    bukaDashboardTahap2();
                }
            }
            // Modul Tahap 2: MSDT
            else if (activeFase === 'view-msdt') {
                if (typeof startMsdtTest === 'function') {
                    startMsdtTest();
                }
            }
            // Modul Tahap 2: EPPS
            else if (activeFase === 'view-epps') {
                if (typeof startEppsTest === 'function') {
                    startEppsTest();
                }
            }
            // Modul Tahap 2: CFIT
            else if (activeFase === 'view-cfit') {
                if (typeof startCfitTest === 'function') {
                    startCfitTest();
                }
            }
            // Modul Tahap 2: MBTI
            else if (activeFase === 'view-mbti') {
                if (typeof startMbtiTest === 'function') {
                    startMbtiTest();
                }
            }
        }, 150);
        return;
    }

    // 4. Tampilan default awal jika belum login: view-login
    const allSections = document.querySelectorAll('main > section');
    allSections.forEach(sec => {
        sec.style.setProperty('display', 'none', 'important');
        sec.classList.add('hide-section');
    });

    const viewLogin = document.getElementById('view-login') || document.getElementById('page-login');
    if (viewLogin) {
        viewLogin.style.setProperty('display', 'flex', 'important');
        viewLogin.classList.remove('hide-section');
        viewLogin.classList.add('fase-aktif');
    }
});

