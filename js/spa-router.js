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
        'view-hrd': 'view-hrd'
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
        const displayType = (finalTargetId === 'view-dashboard' || finalTargetId === 'view-hrd' || finalTargetId === 'view-disc') ? 'block' : 'flex';
        targetSection.style.setProperty('display', displayType, 'important');
        targetSection.classList.add(displayType === 'block' ? 'fase-aktif-block' : 'fase-aktif');
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
            try {
                localStorage.removeItem('kandidat_foto_pengawasan');
            } catch (e) {}
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
    if (event && event.preventDefault) {
        event.preventDefault();
    }

    // Bersihkan status error sebelumnya
    if (typeof clearLoginValidationErrors === 'function') {
        clearLoginValidationErrors();
    } else {
        const alertBox = document.getElementById('loginAlertBox');
        if (alertBox) alertBox.classList.add('hide-section');
        ['errorName', 'errorEmail', 'errorPhone', 'errorPosisi', 'errorDomisili', 'errorPenempatan', 'errorToken', 'errorConsent'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hide-section');
        });
    }

    // Helper untuk menampilkan error inline tanpa alert popup
    const triggerError = (inputId, errorId, message) => {
        if (typeof showLoginFieldError === 'function') {
            showLoginFieldError(inputId, errorId, message);
        } else {
            const errEl = document.getElementById(errorId);
            if (errEl) {
                const span = errEl.querySelector('span') || errEl;
                span.textContent = message;
                errEl.classList.remove('hide-section');
            }
            const alertBox = document.getElementById('loginAlertBox');
            const alertMsg = document.getElementById('loginAlertMsg');
            if (alertBox && alertMsg) {
                alertMsg.textContent = message;
                alertBox.classList.remove('hide-section');
            }
            const inputEl = document.getElementById(inputId);
            if (inputEl) {
                inputEl.classList.add('border-red-500', 'bg-red-50/50');
                inputEl.focus();
            }
        }
    };

    // Ambil data dari semua input formulir pendaftaran
    const nameInput = document.getElementById('inputName');
    const emailInput = document.getElementById('inputEmail');
    const phoneInput = document.getElementById('inputPhone');
    const posisiInput = document.getElementById('inputPosisi');
    const domisiliInput = document.getElementById('inputDomisili');
    const penempatanInput = document.getElementById('inputPenempatan');
    const tokenInput = document.getElementById('inputToken');
    const consentCheck = document.getElementById('checkboxConsent');

    const cleanName = (nameInput ? nameInput.value : '').trim();
    const cleanEmail = (emailInput ? emailInput.value : '').trim();
    const cleanPhone = (phoneInput ? phoneInput.value : '').trim();
    const cleanPosisi = (posisiInput ? posisiInput.value : '').trim();
    const cleanDomisili = (domisiliInput ? domisiliInput.value : '').trim();
    const cleanPenempatan = (penempatanInput ? penempatanInput.value : '').trim();
    const cleanToken = (tokenInput ? tokenInput.value : '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Validasi Nama Lengkap
    if (!cleanName || cleanName.length < 3) {
        triggerError('inputName', 'errorName', 'Harap masukkan Nama Lengkap minimal 3 karakter!');
        return;
    }

    // 2. Validasi Alamat Email
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        triggerError('inputEmail', 'errorEmail', 'Harap masukkan Alamat Email Aktif yang benar!');
        return;
    }

    // 3. Validasi Nomor WhatsApp
    if (!cleanPhone || cleanPhone.length < 9) {
        triggerError('inputPhone', 'errorPhone', 'Harap masukkan Nomor WhatsApp / HP yang valid!');
        return;
    }

    // 4. Validasi Posisi / Jabatan yang Dilamar
    if (!cleanPosisi || cleanPosisi.length < 2) {
        triggerError('inputPosisi', 'errorPosisi', 'Harap masukkan posisi atau jabatan yang Anda lamar!');
        return;
    }

    // 5. Validasi Lokasi Domisili
    if (!cleanDomisili || cleanDomisili.length < 2) {
        triggerError('inputDomisili', 'errorDomisili', 'Harap masukkan lokasi domisili tempat tinggal saat ini!');
        return;
    }

    // 6. Validasi Penempatan Kerja
    if (!cleanPenempatan || cleanPenempatan.length < 2) {
        triggerError('inputPenempatan', 'errorPenempatan', 'Harap pilih lokasi cabang penempatan kerja!');
        return;
    }

    // 7. Validasi Token Akses Ujian (5 Karakter Sekali Pakai)
    if (!cleanToken || cleanToken.length !== 5) {
        triggerError('inputToken', 'errorToken', 'Token akses ujian wajib 5 karakter huruf/angka (contoh: gk7g8)!');
        return;
    }

    // 8. Validasi Checkbox Pakta Integritas
    if (!consentCheck || !consentCheck.checked) {
        const consentContainer = document.getElementById('checkboxConsentContainer');
        if (consentContainer) {
            consentContainer.classList.add('border-red-500', 'bg-red-50/40');
        }
        triggerError('checkboxConsent', 'errorConsent', 'Anda harus menyetujui Pakta Integritas terlebih dahulu!');
        return;
    }

    // Ubah tampilan tombol ke mode loading
    const btnSubmit = document.getElementById('btnSubmitLogin');
    const btnText = document.getElementById('btnSubmitLoginText');
    const btnIcon = document.getElementById('btnSubmitLoginIcon');

    if (btnSubmit) btnSubmit.disabled = true;
    if (btnText) btnText.textContent = "Memvalidasi Token...";
    if (btnIcon) btnIcon.className = "fa-solid fa-circle-notch fa-spin";

    // Verifikasi Token Sekali Pakai ke Supabase Database via RPC
    const sbUrl = window.SUPABASE_URL || '';
    const sbKey = window.SUPABASE_KEY || '';

    let supabase = null;
    if (window.supabase && typeof window.supabase.from === 'function') {
        supabase = window.supabase;
    } else if (typeof supabaseClient !== 'undefined' && supabaseClient && typeof supabaseClient.from === 'function') {
        supabase = supabaseClient;
    } else if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(sbUrl, sbKey);
        window.supabase = supabase;
    }

    if (supabase && typeof supabase.rpc === 'function') {
        try {
            const { data: resKlaim, error: errKlaim } = await supabase.rpc('klaim_token_ujian', {
                p_token: cleanToken,
                p_nama: cleanName,
                p_phone: cleanPhone
            });

            if (!errKlaim && resKlaim && resKlaim.valid === false) {
                if (btnSubmit) btnSubmit.disabled = false;
                if (btnText) btnText.textContent = "Mulai Tes";
                if (btnIcon) btnIcon.className = "fa-solid fa-arrow-right-long";
                triggerError('inputToken', 'errorToken', resKlaim.pesan || 'Token ujian tidak valid atau sudah pernah digunakan.');
                if (typeof customAlert === 'function') {
                    customAlert("Akses Ditolak", resKlaim.pesan || "Token ujian tidak valid atau sudah pernah digunakan.", "error");
                }
                return;
            }
        } catch (eToken) {
            console.warn('[Token RPC]', eToken);
        }
    }

    if (btnText) btnText.textContent = "Menghubungkan ke Portal...";

    // Simpan ke state memori lokal & localStorage
    if (typeof state !== 'undefined') {
        state.user = {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            posisi: cleanPosisi,
            domisili: cleanDomisili,
            penempatan: cleanPenempatan,
            token: cleanToken,
            startTime: new Date().toLocaleTimeString('id-ID')
        };
    }

    localStorage.setItem('nama_peserta', cleanName);
    localStorage.setItem('email_peserta', cleanEmail);
    localStorage.setItem('phone_peserta', cleanPhone);
    localStorage.setItem('posisi_peserta', cleanPosisi);
    localStorage.setItem('domisili_peserta', cleanDomisili);
    localStorage.setItem('penempatan_peserta', cleanPenempatan);
    localStorage.setItem('token_peserta', cleanToken);

    // Bersihkan seluruh sesi tes sebelumnya dari browser
    const keysToClear = [
        'ist_selesai', 'papi_selesai', 'disc_selesai', 'pauli_selesai',
        'ist_terkirim_supabase', 'altrak_ist_completed_subtests',
        'papi_answers', 'papi_terkirim', 'papi_exam_end_time', 'papi_inst_end_time',
        'hasil_papi', 'hasil_disc', 'hasil_pauli', 'hasil_ist',
        'pauli_matrix', 'pauli_line', 'altrak_fase_aktif'
    ];
    keysToClear.forEach(k => localStorage.removeItem(k));
    try { sessionStorage.removeItem('altrak_fase_aktif'); } catch (e) {}

    // Reset visual kartu dashboard ke kondisi awal (Tes 1 aktif, 2-4 terkunci, 0/4)
    if (typeof resetDashboardState === 'function') {
        resetDashboardState();
    }

    let idPesertaBaru = null;

    // 2. Jalankan perintah INSERT ke Supabase (tabel kandidat_psikotes)
    try {
        if (supabase && typeof supabase.from === 'function') {
            // Cek apakah kandidat dengan No WA, Email, atau Nama ini sudah terdaftar sebelumnya
            let existingId = null;
            try {
                // 1. Cek berdasarkan Email
                if (cleanEmail && !cleanEmail.includes('altrak1978.co.id')) {
                    const { data: byEmail } = await supabase.from('kandidat_psikotes').select('id').eq('email', cleanEmail).limit(1);
                    if (byEmail && byEmail.length > 0 && byEmail[0].id) {
                        existingId = byEmail[0].id;
                    }
                }
                // 2. Cek berdasarkan No WA (uji format 08xxx dan 628xxx)
                if (!existingId && cleanPhone && cleanPhone.length >= 6) {
                    const waVars = [cleanPhone];
                    if (cleanPhone.startsWith('0')) {
                        waVars.push('62' + cleanPhone.slice(1));
                    } else if (cleanPhone.startsWith('62')) {
                        waVars.push('0' + cleanPhone.slice(2));
                    }
                    for (const w of waVars) {
                        const { data: byWa } = await supabase.from('kandidat_psikotes').select('id').eq('no_wa', w).limit(1);
                        if (byWa && byWa.length > 0 && byWa[0].id) {
                            existingId = byWa[0].id;
                            break;
                        }
                    }
                }
                // 3. Cek berdasarkan Nama Lengkap
                if (!existingId && cleanName && cleanName.length >= 3) {
                    const { data: byName } = await supabase.from('kandidat_psikotes').select('id').eq('nama_lengkap', cleanName).limit(1);
                    if (byName && byName.length > 0 && byName[0].id) {
                        existingId = byName[0].id;
                    }
                }
            } catch (errCheck) {}

            if (existingId) {
                idPesertaBaru = existingId;
                console.log('[Supabase SPA] Melanjutkan sesi kandidat terdaftar. ID:', idPesertaBaru);

                try {
                    await supabase.from('kandidat_psikotes').update({
                        nama_lengkap: cleanName,
                        email: cleanEmail,
                        no_wa: cleanPhone,
                        posisi_dilamar: cleanPosisi,
                        posisi: cleanPosisi,
                        domisili: cleanDomisili,
                        penempatan: cleanPenempatan,
                        token: cleanToken
                    }).eq('id', idPesertaBaru);
                } catch (eUpdate) {}
            } else {
                const { data, error } = await supabase
                    .from('kandidat_psikotes')
                    .insert([
                        {
                            nama_lengkap: cleanName,
                            email: cleanEmail,
                            no_wa: cleanPhone,
                            posisi_dilamar: cleanPosisi,
                            posisi: cleanPosisi,
                            domisili: cleanDomisili,
                            penempatan: cleanPenempatan,
                            token: cleanToken
                        }
                    ])
                    .select();

                if (!error && data && data.length > 0 && data[0].id) {
                    idPesertaBaru = data[0].id;
                    console.log('[Supabase SPA] Data kandidat baru berhasil didaftarkan ke Supabase. ID:', idPesertaBaru);
                } else if (error) {
                    console.warn('[Supabase SPA] Respon server (aman tersimpan di cadangan lokal):', error.message || error);
                }
            }
        }
    } catch (err) {
        console.warn('[Supabase SPA] Peringatan jaringan Supabase:', err);
    }

    // 3. Ambil ID peserta dari Supabase, jika belum ada buat UUID cadangan aman
    if (!idPesertaBaru) {
        idPesertaBaru = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'kandidat-' + Date.now();
    }

    // Simpan ID dan data peserta ke localStorage
    localStorage.setItem('id_peserta', String(idPesertaBaru));
    localStorage.setItem('nama_peserta', cleanName);
    localStorage.setItem('email_peserta', cleanEmail);
    localStorage.setItem('phone_peserta', cleanPhone);

    const savedPosisiProfile = localStorage.getItem('posisi_peserta') || 'Peserta Seleksi';
    const savedDomisiliProfile = localStorage.getItem('domisili_peserta') || '-';
    const savedPenempatanProfile = localStorage.getItem('penempatan_peserta') || '-';
    const savedTokenProfile = localStorage.getItem('token_peserta') || '-';

    const profilLengkap = {
        name: cleanName,
        id: idPesertaBaru,
        email: cleanEmail,
        phone: cleanPhone,
        position: savedPosisiProfile,
        posisi: savedPosisiProfile,
        domisili: savedDomisiliProfile,
        penempatan: savedPenempatanProfile,
        token: savedTokenProfile
    };
    localStorage.setItem('altrak_candidate_profile', JSON.stringify(profilLengkap));

    // Perbarui badge identitas pada navbar
    const navName = document.getElementById('nav-user-name');
    if (navName) navName.textContent = cleanName.split(' ')[0];
    const navInfo = document.getElementById('nav-user-info');
    if (navInfo) navInfo.classList.remove('hide-section');

    // 4. Validasi Akses Kamera: Pastikan kamera aktif sebelum masuk ke dashboard (tanpa jepret foto saat login)
    const streamAktif = (typeof cameraStream !== 'undefined' && cameraStream && cameraStream.active) ||
                        (typeof window.cameraStream !== 'undefined' && window.cameraStream && window.cameraStream.active);
    if (!streamAktif) {
        if (typeof tampilkanModalKamera === 'function') {
            tampilkanModalKamera("Akses kamera wajib diizinkan untuk memulai rangkaian tes asesmen PT Altrak 1978.");
        }
        if (btnSubmit) btnSubmit.disabled = false;
        if (btnText) btnText.textContent = "Mulai Tes";
        if (btnIcon) btnIcon.className = "fa-solid fa-arrow-right-long";
        return;
    }

    // Kembalikan tampilan tombol
    if (btnSubmit) btnSubmit.disabled = false;
    if (btnText) btnText.textContent = "Mulai Tes";
    if (btnIcon) btnIcon.className = "fa-solid fa-arrow-right-long";

    // 5. Jalankan pindahFase('view-dashboard')
    pindahFase('view-dashboard');
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

    // 2. Jika seluruh rangkaian tes sudah selesai: Kunci permanen di view-selesai
    if (savedId && savedName && (isPauliSelesai || activeFase === 'view-selesai')) {
        console.log('[SPA Router] Seluruh rangkaian asesmen telah selesai. Menampilkan halaman selesai.');
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
            // Dashboard Asesmen
            else if (activeFase === 'view-dashboard') {
                if (typeof terapkanPenguncianDashboard === 'function') {
                    terapkanPenguncianDashboard();
                }
                if (typeof updateDashboardProgress === 'function') {
                    updateDashboardProgress();
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

