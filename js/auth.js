// =========================================================================
// SISTEM AUTENTIKASI PESERTA & OTORISASI HRD (SECURITY HARDENED)
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * Sanitasi string ketat untuk mencegah serangan XSS, SQLi, dan karakter berbahaya
 * @param {string} str Input teks
 * @returns {string} String yang sudah dibersihkan
 */
function sanitizeInput(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>/g, '') // Hapus tag HTML
        .replace(/[<>"`;\\]/g, '') // Hapus karakter injeksi XSS, pertahankan apostrof (') dan tanda hubung (-) untuk nama pelamar wajar
        .trim();
}

function getLockCookie() {
    try {
        const match = document.cookie.match(/(?:^|;\s*)_altrak_hrd_lock=([^;]*)/);
        return match ? parseInt(match[1], 10) : 0;
    } catch (e) { return 0; }
}

function setLockCookie(lockUntil) {
    try {
        const maxAge = Math.max(0, Math.floor((lockUntil - Date.now()) / 1000));
        document.cookie = `_altrak_hrd_lock=${lockUntil}; max-age=${maxAge}; path=/; SameSite=Lax`;
    } catch (e) {}
}

function clearLockCookie() {
    try {
        document.cookie = `_altrak_hrd_lock=; max-age=0; path=/; SameSite=Lax`;
    } catch (e) {}
}

/**
 * Memeriksa status penguncian brute-force HRD di localStorage & Cookie
 * @returns {{isLocked: boolean, remainingMinutes: number}}
 */
function checkHrdLockStatus() {
    try {
        if (localStorage.getItem('_altrak_hrd_email_fixed') !== 'v2') {
            localStorage.removeItem(HRD_LOCK_STORAGE_KEY);
            localStorage.removeItem(HRD_ATTEMPTS_STORAGE_KEY);
            clearLockCookie();
            localStorage.setItem('_altrak_hrd_email_fixed', 'v2');
        }

        const lockStorage = parseInt(localStorage.getItem(HRD_LOCK_STORAGE_KEY) || '0', 10);
        const lockCookie = getLockCookie();
        const lockUntil = Math.max(lockStorage, lockCookie);
        const now = Date.now();

        if (now < lockUntil) {
            const remainingMinutes = Math.ceil((lockUntil - now) / 60000);
            return { isLocked: true, remainingMinutes };
        }
        if (lockUntil > 0 && now >= lockUntil) {
            localStorage.removeItem(HRD_LOCK_STORAGE_KEY);
            localStorage.removeItem(HRD_ATTEMPTS_STORAGE_KEY);
            clearLockCookie();
        }
    } catch (e) {
        // Fallback jika storage diblokir
    }
    return { isLocked: false, remainingMinutes: 0 };
}

/**
 * Membersihkan semua status error validasi form login peserta
 */
function clearLoginValidationErrors() {
    const alertBox = document.getElementById('loginAlertBox');
    if (alertBox) alertBox.classList.add('hide-section');

    const fields = ['inputName', 'inputEmail', 'inputPhone', 'inputPosisi', 'inputDomisili', 'inputPenempatan', 'inputToken'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('border-red-500', 'bg-red-50/50', 'ring-2', 'ring-red-500/20');
            el.classList.add('border-[#b9d0e7]', 'bg-[#edf3f9]');
        }
    });

    const errorIds = ['errorName', 'errorEmail', 'errorPhone', 'errorPosisi', 'errorDomisili', 'errorPenempatan', 'errorToken', 'errorConsent'];
    errorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hide-section');
    });

    const consentContainer = document.getElementById('checkboxConsentContainer');
    if (consentContainer) {
        consentContainer.classList.remove('border-red-500', 'bg-red-50/40');
    }
}

/**
 * Menampilkan pesan error spesifik pada field input login
 * @param {string} inputId ID elemen input
 * @param {string} errorElementId ID elemen teks error
 * @param {string} message Pesan detail kesalahan
 */
function showLoginFieldError(inputId, errorElementId, message) {
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
        inputEl.classList.remove('border-[#b9d0e7]', 'bg-[#edf3f9]');
        inputEl.classList.add('border-red-500', 'bg-red-50/50', 'ring-2', 'ring-red-500/20');
        inputEl.focus();
    }

    const errBox = document.getElementById(errorElementId);
    if (errBox) {
        const span = errBox.querySelector('span') || errBox;
        span.textContent = message;
        errBox.classList.remove('hide-section');
    }

    const alertBox = document.getElementById('loginAlertBox');
    const alertMsg = document.getElementById('loginAlertMsg');
    if (alertBox && alertMsg) {
        alertMsg.textContent = message;
        alertBox.classList.remove('hide-section');
    }
}

/**
 * Memproses pendaftaran peserta secara terpusat (Unified Candidate Authentication)
 * Mencakup validasi & sanitasi input ketat, verifikasi token via RPC,
 * pembersihan sesi lama, registrasi kandidat ke Supabase, dan pengalihan ke Dashboard
 * @param {Event} e Event submit form
 */
async function handleUnifiedCandidateLogin(e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    clearLoginValidationErrors();

    const consentCheck = document.getElementById('checkboxConsent');
    if (consentCheck && !consentCheck.checked) {
        showLoginFieldError(
            'checkboxConsent',
            'errorConsent',
            'Pernyataan Persetujuan & Pakta Integritas wajib dicentang sebelum melanjutkan.'
        );
        const consentContainer = document.getElementById('checkboxConsentContainer');
        if (consentContainer) {
            consentContainer.classList.add('border-red-500', 'bg-red-50/40');
        }
        if (typeof customAlert === 'function') {
            customAlert(
                "Persetujuan Wajib",
                "Harap membaca dan mencentang Pernyataan Persetujuan & Pakta Integritas sebelum melanjutkan ke portal asesmen.",
                "error"
            );
        }
        return;
    }

    const rawName = document.getElementById('inputName') ? document.getElementById('inputName').value : '';
    const rawEmail = document.getElementById('inputEmail') ? document.getElementById('inputEmail').value : '';
    const rawPhone = document.getElementById('inputPhone') ? document.getElementById('inputPhone').value : '';
    const rawPosisi = document.getElementById('inputPosisi') ? document.getElementById('inputPosisi').value : '';
    const rawDomisili = document.getElementById('inputDomisili') ? document.getElementById('inputDomisili').value : '';
    const rawPenempatan = document.getElementById('inputPenempatan') ? document.getElementById('inputPenempatan').value : '';
    const rawToken = document.getElementById('inputToken') ? document.getElementById('inputToken').value : '';

    const cleanName = sanitizeInput(rawName);
    const cleanEmail = sanitizeInput(rawEmail);
    const cleanPhone = sanitizeInput(rawPhone);
    const cleanPosisi = sanitizeInput(rawPosisi);
    const cleanDomisili = sanitizeInput(rawDomisili);
    const cleanPenempatan = sanitizeInput(rawPenempatan);
    const cleanToken = sanitizeInput(rawToken).toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Validasi Nama: Minimal 3 karakter
    if (!cleanName || cleanName.length < 3) {
        showLoginFieldError(
            'inputName',
            'errorName',
            'Nama lengkap tidak valid. Minimal 3 karakter dan hanya boleh berisi huruf (contoh: Budi Santoso).'
        );
        if (typeof customAlert === 'function') {
            customAlert(
                "Nama Lengkap Tidak Valid",
                `Nama yang dimasukkan ("${cleanName || '-'}") tidak valid.\n\nHarap masukkan nama lengkap sesuai KTP minimal 3 karakter.`,
                "error"
            );
        }
        return;
    }

    // 2. Validasi Email
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        showLoginFieldError(
            'inputEmail',
            'errorEmail',
            'Format email tidak valid. Masukkan alamat email aktif yang benar (contoh: nama@gmail.com).'
        );
        if (typeof customAlert === 'function') {
            customAlert(
                "Alamat Email Tidak Valid",
                `Alamat email yang Anda masukkan ("${cleanEmail || '-'}") tidak valid.\n\nHarap masukkan alamat email aktif yang benar.`,
                "error"
            );
        }
        return;
    }

    // 3. Validasi Nomor WhatsApp / Telepon Indonesia
    const normalizedPhone = cleanPhone.replace(/[\s\-\.]/g, '');
    const isIndoPhone = /^(?:\+62|62|08)[0-9]{8,13}$/.test(normalizedPhone);
    if (!isIndoPhone && normalizedPhone.length < 9) {
        showLoginFieldError(
            'inputPhone',
            'errorPhone',
            'Nomor telepon tidak valid! Nomor harus berformat Indonesia dan diawali 08 atau +62 (contoh: 08123456789).'
        );
        if (typeof customAlert === 'function') {
            customAlert(
                "Nomor Telepon Tidak Valid",
                `Nomor WhatsApp/HP yang Anda masukkan ("${cleanPhone || '-'}") tidak valid.\n\nNomor harus merupakan nomor aktif format Indonesia dengan 10-14 digit angka.`,
                "error"
            );
        }
        return;
    }

    // 4. Validasi Posisi yang Dilamar
    if (!cleanPosisi || cleanPosisi.length < 2) {
        showLoginFieldError('inputPosisi', 'errorPosisi', 'Posisi / jabatan yang dilamar wajib diisi.');
        if (typeof customAlert === 'function') {
            customAlert("Posisi Wajib Diisi", "Harap mengisi posisi atau jabatan yang Anda lamar.", "error");
        }
        return;
    }

    // 5. Validasi Domisili
    if (!cleanDomisili || cleanDomisili.length < 2) {
        showLoginFieldError('inputDomisili', 'errorDomisili', 'Lokasi domisili saat ini wajib diisi.');
        if (typeof customAlert === 'function') {
            customAlert("Domisili Wajib Diisi", "Harap mengisi kota lokasi domisili tempat tinggal Anda saat ini.", "error");
        }
        return;
    }

    // 6. Validasi Penempatan Kerja
    if (!cleanPenempatan || cleanPenempatan.length < 2) {
        showLoginFieldError('inputPenempatan', 'errorPenempatan', 'Pilih lokasi cabang penempatan kerja yang dilamar.');
        if (typeof customAlert === 'function') {
            customAlert("Penempatan Wajib Dipilih", "Harap memilih lokasi cabang penempatan kerja dari daftar yang tersedia.", "error");
        }
        return;
    }

    // 7. Validasi Token Ujian (Wajib 5 Karakter)
    if (!cleanToken || cleanToken.length !== 5) {
        showLoginFieldError('inputToken', 'errorToken', 'Token akses ujian wajib 5 karakter huruf/angka (contoh: gk7g8).');
        if (typeof customAlert === 'function') {
            customAlert("Token Tidak Valid", "Token akses ujian wajib terdiri dari tepat 5 karakter huruf dan angka resmi dari panitia HRD PT Altrak 1978.", "error");
        }
        return;
    }

    // 8. Verifikasi & Klaim Token Sekali Pakai ke Supabase Database (Fails-Closed Security)
    const sbClient = (typeof supabaseClient !== 'undefined' && supabaseClient)
        ? supabaseClient
        : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

    const btn = document.getElementById('btnSubmitLogin');
    const btnText = document.getElementById('btnSubmitLoginText');
    const originalBtnHtml = btnText ? btnText.innerHTML : 'Mulai Tes';
    if (btn) btn.disabled = true;
    if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Memvalidasi Token...';

    if (!sbClient || typeof sbClient.rpc !== 'function') {
        if (btn) btn.disabled = false;
        if (btnText) btnText.innerHTML = originalBtnHtml;
        showLoginFieldError('inputToken', 'errorToken', 'Koneksi ke database server tidak tersedia. Harap periksa jaringan internet Anda.');
        if (typeof customAlert === 'function') {
            customAlert("Koneksi Terputus", "Koneksi ke server ujian tidak tersedia. Harap periksa jaringan internet Anda.", "error");
        }
        return;
    }

    let idPesertaBaru = null;
    let sessionSecretBaru = null;

    try {
        // PRIORITAS 1: Gunakan RPC daftar_kandidat secara atomic (Security Hardening Fase 3)
        // Memvalidasi token, menandai terpakai, dan membuat baris baru dengan UUID & session_secret
        const { data: resDaftar, error: errDaftar } = await sbClient.rpc('daftar_kandidat', {
            p_token: cleanToken,
            p_nama: cleanName,
            p_email: cleanEmail,
            p_phone: normalizedPhone,
            p_posisi: cleanPosisi,
            p_domisili: cleanDomisili,
            p_penempatan: cleanPenempatan
        });

        if (!errDaftar && resDaftar) {
            if (resDaftar.success === false) {
                if (btn) btn.disabled = false;
                if (btnText) btnText.innerHTML = originalBtnHtml;
                const pesanTolak = resDaftar.pesan || 'Token ujian tidak valid atau sudah pernah digunakan.';
                showLoginFieldError('inputToken', 'errorToken', pesanTolak);
                if (typeof customAlert === 'function') {
                    customAlert("Akses Ditolak", pesanTolak, "error");
                } else {
                    alert(pesanTolak);
                }
                return;
            } else if (resDaftar.success === true && resDaftar.id) {
                idPesertaBaru = resDaftar.id;
                sessionSecretBaru = resDaftar.session_secret;
            }
        } else {
            // FALLBACK: Jika RPC daftar_kandidat belum tersedia, gunakan klaim_token_ujian
            console.warn('[daftar_kandidat RPC Fallback]', errDaftar ? (errDaftar.message || errDaftar) : 'No response');
            const { data: resKlaim, error: errKlaim } = await sbClient.rpc('klaim_token_ujian', {
                p_token: cleanToken,
                p_nama: cleanName,
                p_phone: normalizedPhone
            });

            if (errKlaim) {
                if (btn) btn.disabled = false;
                if (btnText) btnText.innerHTML = originalBtnHtml;
                const pesanErr = 'Gagal memverifikasi token ke server (' + (errKlaim.message || 'Error Server') + '). Harap hubungi panitia HRD.';
                showLoginFieldError('inputToken', 'errorToken', pesanErr);
                if (typeof customAlert === 'function') {
                    customAlert("Verifikasi Gagal", pesanErr, "error");
                }
                return;
            }

            if (resKlaim && (resKlaim.valid === false || resKlaim.success === false)) {
                if (btn) btn.disabled = false;
                if (btnText) btnText.innerHTML = originalBtnHtml;
                const pesanTolak = resKlaim.pesan || 'Token ujian tidak valid atau sudah pernah digunakan.';
                showLoginFieldError('inputToken', 'errorToken', pesanTolak);
                if (typeof customAlert === 'function') {
                    customAlert("Akses Ditolak", pesanTolak, "error");
                } else {
                    alert(pesanTolak);
                }
                return;
            }

            // Buat baris baru secara mandiri (SELALU INSERT BARIS BARU, JANGAN PERNAH MENIMPA DATA LAMA)
            const genId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : null;
            const genSecret = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).substring(2, 15);
            try {
                const { data: insData, error: insErr } = await sbClient
                    .from('kandidat_psikotes')
                    .insert([{
                        id: genId,
                        nama_lengkap: cleanName,
                        email: cleanEmail,
                        no_wa: normalizedPhone,
                        posisi_dilamar: cleanPosisi,
                        posisi: cleanPosisi,
                        domisili: cleanDomisili,
                        penempatan: cleanPenempatan,
                        token: cleanToken,
                        session_secret: genSecret
                    }])
                    .select();

                if (!insErr && insData && insData.length > 0 && insData[0].id) {
                    idPesertaBaru = insData[0].id;
                    sessionSecretBaru = insData[0].session_secret || genSecret;
                } else {
                    idPesertaBaru = genId;
                    sessionSecretBaru = genSecret;
                }
            } catch (eIns) {
                console.warn('[Insert Candidate Fallback]', eIns);
                idPesertaBaru = genId;
                sessionSecretBaru = genSecret;
            }
        }
    } catch (eAuth) {
        console.warn('[Candidate Auth Exception]', eAuth);
        if (btn) btn.disabled = false;
        if (btnText) btnText.innerHTML = originalBtnHtml;
        showLoginFieldError('inputToken', 'errorToken', 'Terjadi kesalahan sistem saat mendaftarkan sesi ujian. Harap periksa koneksi Anda dan coba lagi.');
        if (typeof customAlert === 'function') {
            customAlert("Kesalahan Validasi", "Terjadi kesalahan sistem saat memvalidasi token ujian. Harap periksa koneksi dan coba lagi.", "error");
        }
        return;
    }

    if (!idPesertaBaru) {
        idPesertaBaru = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'kandidat-' + Date.now();
    }
    if (!sessionSecretBaru) {
        sessionSecretBaru = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID().replace(/-/g, '')
            : Math.random().toString(36).substring(2, 15);
    }

    if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Menghubungkan ke Portal...';

    // Simpan ke state terisolasi
    if (typeof state !== 'undefined') {
        state.user = {
            id: idPesertaBaru,
            name: cleanName,
            email: cleanEmail,
            phone: normalizedPhone,
            posisi: cleanPosisi,
            domisili: cleanDomisili,
            penempatan: cleanPenempatan,
            token: cleanToken,
            session_secret: sessionSecretBaru,
            startTime: new Date().toLocaleTimeString('id-ID')
        };
    }

    localStorage.setItem('id_peserta', String(idPesertaBaru));
    localStorage.setItem('session_secret', String(sessionSecretBaru));
    localStorage.setItem('nama_peserta', cleanName);
    localStorage.setItem('email_peserta', cleanEmail);
    localStorage.setItem('phone_peserta', normalizedPhone);
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

    const profil = {
        name: cleanName,
        id: idPesertaBaru,
        email: cleanEmail,
        position: cleanPosisi
    };
    localStorage.setItem('altrak_candidate_profile', JSON.stringify(profil));

    const navName = document.getElementById('nav-user-name');
    if (navName && cleanName) {
        navName.textContent = cleanName.split(' ')[0];
    }

    const navInfo = document.getElementById('nav-user-info');
    if (navInfo) navInfo.classList.remove('hide-section');

    // 4. Validasi Akses Kamera jika fitur proctoring aktif
    const streamAktif = (typeof cameraStream !== 'undefined' && cameraStream && cameraStream.active) ||
                        (typeof window.cameraStream !== 'undefined' && window.cameraStream && window.cameraStream.active);
    if (!streamAktif && typeof tampilkanModalKamera === 'function') {
        tampilkanModalKamera("Akses kamera wajib diizinkan untuk memulai rangkaian tes asesmen PT Altrak 1978.");
        if (btn) btn.disabled = false;
        if (btnText) btnText.innerHTML = originalBtnHtml;
        return;
    }

    if (btn) btn.disabled = false;
    if (btnText) btnText.innerHTML = originalBtnHtml;

    // Masuk ke Mode Layar Penuh (Fullscreen) dari awal login dan arahkan ke Dashboard Tes
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }

    if (typeof pindahFase === 'function') {
        pindahFase('view-dashboard');
    } else if (typeof showPage === 'function') {
        showPage('page-dashboard');
    }

    if (typeof updateDashboardProgress === 'function') {
        updateDashboardProgress();
    }
}

// Hubungkan semua alias ke fungsi terpusat pada lingkup window tanpa tabrakan leksikal
if (typeof window !== 'undefined') {
    window.handleCandidateLogin = handleUnifiedCandidateLogin;
    window.handleLoginSPA = handleUnifiedCandidateLogin;
    window.handleRequestOTP = handleUnifiedCandidateLogin;
}

// Pasang listener realtime input untuk membersihkan error saat peserta mengetik ulang
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        ['inputName', 'inputEmail', 'inputPhone', 'inputPosisi', 'inputDomisili', 'inputPenempatan', 'inputToken'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    el.classList.remove('border-red-500', 'bg-red-50/50', 'ring-2', 'ring-red-500/20');
                    el.classList.add('border-[#b9d0e7]', 'bg-[#edf3f9]');
                    const errMap = { 
                        inputName: 'errorName', 
                        inputEmail: 'errorEmail', 
                        inputPhone: 'errorPhone',
                        inputPosisi: 'errorPosisi',
                        inputDomisili: 'errorDomisili',
                        inputPenempatan: 'errorPenempatan',
                        inputToken: 'errorToken'
                    };
                    const errEl = document.getElementById(errMap[id]);
                    if (errEl) errEl.classList.add('hide-section');
                    const alertBox = document.getElementById('loginAlertBox');
                    if (alertBox) alertBox.classList.add('hide-section');
                });
            }
        });
        const consent = document.getElementById('checkboxConsent');
        if (consent) {
            consent.addEventListener('change', () => {
                const errEl = document.getElementById('errorConsent');
                if (errEl) errEl.classList.add('hide-section');
                const container = document.getElementById('checkboxConsentContainer');
                if (container) container.classList.remove('border-red-500', 'bg-red-50/40');
            });
        }
    });
}

// --- AKSES PORTAL HRD ---

/**
 * Mengarahkan akses ke Portal HRD mandiri
 */
function openHrdDashboard() {
    window.location.href = 'hrd.html';
}

if (typeof window !== 'undefined') {
    window.openHrdDashboard = openHrdDashboard;
}
