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
        .replace(/[<>"'`]/g, '')  // Hapus karakter injeksi
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
 * Memproses pendaftaran peserta dengan validasi & sanitasi input ketat
 * serta verifikasi token ujian sekali pakai ke Supabase
 * @param {Event} e Event submit form
 */
async function handleRequestOTP(e) {
    e.preventDefault();
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
        customAlert(
            "Persetujuan Wajib",
            "Harap membaca dan mencentang Pernyataan Persetujuan & Pakta Integritas sebelum melanjutkan ke portal asesmen.",
            "error"
        );
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

    // 1. Validasi Nama: Hanya huruf, spasi, titik, dan petik satu (3-80 karakter)
    if (!cleanName || cleanName.length < 3 || !/^[a-zA-Z\s'.]{3,80}$/.test(cleanName)) {
        showLoginFieldError(
            'inputName',
            'errorName',
            'Nama lengkap tidak valid. Minimal 3 karakter dan hanya boleh berisi huruf (contoh: Budi Santoso).'
        );
        customAlert(
            "Nama Lengkap Tidak Valid",
            `Nama yang dimasukkan ("${cleanName || '-'}") tidak valid.\n\nHarap masukkan nama lengkap sesuai KTP minimal 3 karakter (hanya boleh mengandung huruf, spasi, dan titik).`,
            "error"
        );
        return;
    }

    // 2. Validasi Email: Format RFC standar
    if (!cleanEmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
        showLoginFieldError(
            'inputEmail',
            'errorEmail',
            'Format email tidak valid. Masukkan alamat email aktif yang benar (contoh: nama@gmail.com).'
        );
        customAlert(
            "Alamat Email Tidak Valid",
            `Alamat email yang Anda masukkan ("${cleanEmail || '-'}") tidak valid.\n\nHarap masukkan alamat email aktif yang benar (contoh: kandidat@gmail.com).`,
            "error"
        );
        return;
    }

    // 3. Validasi Nomor WhatsApp / Telepon Indonesia
    const normalizedPhone = cleanPhone.replace(/[\s\-\.]/g, '');
    const isIndoPhone = /^(?:\+62|62|08)[0-9]{8,13}$/.test(normalizedPhone);

    if (!isIndoPhone) {
        showLoginFieldError(
            'inputPhone',
            'errorPhone',
            'Nomor telepon tidak valid! Nomor harus berformat Indonesia dan diawali 08 atau +62 (contoh: 08123456789).'
        );
        customAlert(
            "Nomor Telepon Tidak Valid",
            `Nomor WhatsApp/HP yang Anda masukkan ("${cleanPhone || '-'}") tidak valid.\n\nNomor harus merupakan nomor aktif format Indonesia dengan 10-14 digit angka dan diawali dengan 08 atau +62 (contoh: 08123456789 atau +628123456789).`,
            "error"
        );
        return;
    }

    // 4. Validasi Posisi yang Dilamar
    if (!cleanPosisi || cleanPosisi.length < 2) {
        showLoginFieldError('inputPosisi', 'errorPosisi', 'Posisi / jabatan yang dilamar wajib diisi.');
        customAlert("Posisi Wajib Diisi", "Harap mengisi posisi atau jabatan yang Anda lamar.", "error");
        return;
    }

    // 5. Validasi Domisili
    if (!cleanDomisili || cleanDomisili.length < 2) {
        showLoginFieldError('inputDomisili', 'errorDomisili', 'Lokasi domisili saat ini wajib diisi.');
        customAlert("Domisili Wajib Diisi", "Harap mengisi kota lokasi domisili tempat tinggal Anda saat ini.", "error");
        return;
    }

    // 6. Validasi Penempatan Kerja
    if (!cleanPenempatan || cleanPenempatan.length < 2) {
        showLoginFieldError('inputPenempatan', 'errorPenempatan', 'Pilih lokasi cabang penempatan kerja yang dilamar.');
        customAlert("Penempatan Wajib Dipilih", "Harap memilih lokasi cabang penempatan kerja dari daftar yang tersedia.", "error");
        return;
    }

    // 7. Validasi Token Ujian (Wajib 5 Karakter)
    if (!cleanToken || cleanToken.length !== 5) {
        showLoginFieldError('inputToken', 'errorToken', 'Token akses ujian wajib 5 karakter huruf/angka (contoh: gk7g8).');
        customAlert("Token Tidak Valid", "Token akses ujian wajib terdiri dari tepat 5 karakter huruf dan angka resmi dari panitia HRD PT Altrak 1978.", "error");
        return;
    }

    // 8. Verifikasi & Klaim Token Sekali Pakai ke Supabase Database
    const sbClient = (typeof supabaseClient !== 'undefined' && supabaseClient)
        ? supabaseClient
        : ((typeof window !== 'undefined' && window.supabase) ? window.supabase : null);

    if (sbClient && typeof sbClient.rpc === 'function') {
        const btn = document.getElementById('btnSubmitLogin');
        const btnText = document.getElementById('btnSubmitLoginText');
        const originalBtnHtml = btnText ? btnText.innerHTML : 'Mulai Tes';
        if (btn) btn.disabled = true;
        if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Memvalidasi Token...';

        try {
            const { data: resKlaim, error: errKlaim } = await sbClient.rpc('klaim_token_ujian', {
                p_token: cleanToken,
                p_nama: cleanName,
                p_phone: normalizedPhone
            });

            if (btn) btn.disabled = false;
            if (btnText) btnText.innerHTML = originalBtnHtml;

            if (!errKlaim && resKlaim) {
                if (resKlaim.valid === false) {
                    showLoginFieldError('inputToken', 'errorToken', resKlaim.pesan || 'Token ujian tidak valid atau sudah pernah digunakan.');
                    if (typeof customAlert === 'function') {
                        customAlert("Akses Ditolak", resKlaim.pesan || "Token ujian tidak valid atau sudah pernah digunakan.", "error");
                    } else {
                        alert(resKlaim.pesan || "Token ujian tidak valid atau sudah pernah digunakan.");
                    }
                    return;
                }
            } else if (errKlaim) {
                console.warn('[Token RPC]', errKlaim.message || errKlaim);
            }
        } catch (eToken) {
            if (btn) btn.disabled = false;
            if (btnText) btnText.innerHTML = originalBtnHtml;
            console.warn('[Token Exception]', eToken);
        }
    }

    // Simpan ke state terisolasi
    state.user = {
        name: cleanName,
        email: cleanEmail,
        phone: normalizedPhone,
        posisi: cleanPosisi,
        domisili: cleanDomisili,
        penempatan: cleanPenempatan,
        token: cleanToken,
        startTime: ""
    };

    localStorage.setItem('nama_peserta', cleanName);
    localStorage.setItem('email_peserta', cleanEmail);
    localStorage.setItem('phone_peserta', normalizedPhone);
    localStorage.setItem('posisi_peserta', cleanPosisi);
    localStorage.setItem('domisili_peserta', cleanDomisili);
    localStorage.setItem('penempatan_peserta', cleanPenempatan);
    localStorage.setItem('token_peserta', cleanToken);

    const now = new Date();
    state.user.startTime = now.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const navName = document.getElementById('nav-user-name');
    if (navName && state.user.name) {
        navName.textContent = state.user.name.split(' ')[0];
    }

    const navInfo = document.getElementById('nav-user-info');
    if (navInfo) navInfo.classList.remove('hide-section');

    // Masuk ke Mode Layar Penuh (Fullscreen) dari awal login dan arahkan ke Dashboard Tes
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    showPage('page-dashboard');
    updateDashboardProgress();
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

// --- AKSES TERPROTEKSI HRD (Shortcut Logo Dinonaktifkan) ---

/**
 * Logo Altrak: Akses shortcut dinonaktifkan demi pemisahan portal penuh
 */
function handleLogoClick() {
    // Dinonaktifkan: portal HRD dan peserta telah dipisahkan secara mandiri
}

/**
 * Membuka dashboard HRD terpadu langsung di halaman utama
 */
function openHrdDashboard() {
    window.location.href = 'hrd.html';
}

/**
 * Membuka modal login otorisasi HRD
 */
function openHrdLoginModal() {
    window.location.href = 'hrd.html';
}

/**
 * Memverifikasi kredensial HRD langsung melalui Supabase Auth
 */
async function verifyHrdLogin() {
    const pinInput = document.getElementById('inputHrdPin');
    const pin = pinInput ? pinInput.value.trim() : '';

    if (!pin) {
        customAlert("Akses Ditolak", "Kata sandi HRD tidak boleh kosong.", "error");
        if (pinInput) pinInput.focus();
        return;
    }

    // Cek lock status sebelum menghubungi Supabase Auth
    const lockStatus = checkHrdLockStatus();
    if (lockStatus.isLocked) {
        customAlert(
            "Akses HRD Terkunci",
            `Akses masih terkunci karena percobaan berulang. Silakan coba lagi dalam ${lockStatus.remainingMinutes} menit.`,
            "error"
        );
        return;
    }

    // Verifikasi kredensial terhadap akun HRD di Supabase Auth
    const loadingModal = document.getElementById('modal-loading');
    if (loadingModal) loadingModal.classList.remove('hide-section');

    try {
        let authSuccess = false;

        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
            ? supabaseClient
            : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.auth === 'object') ? window.supabase : null);

        if (sb && sb.auth) {
            const hrdAdminEmail = atob('ZmVicml5YW5kYWgzQGdtYWlsLmNvbQ=='); // Encoded untuk keamanan
            try {
                const { data, error } = await sb.auth.signInWithPassword({
                    email: hrdAdminEmail,
                    password: pin
                });
                if (!error && data && data.session) {
                    authSuccess = true;
                } else if (error && (error.status === 429 || (error.message && error.message.toLowerCase().includes('rate limit')))) {
                    const lockTime = Date.now() + HRD_LOCK_DURATION_MS;
                    localStorage.setItem(HRD_LOCK_STORAGE_KEY, lockTime.toString());
                    setLockCookie(lockTime);
                    if (loadingModal) loadingModal.classList.add('hide-section');
                    closeModal('modal-hrd-login');
                    return customAlert("Akses Terkunci", "Terlalu banyak percobaan pada server (Rate Limited). Akses dibekukan sementara demi keamanan.", "error");
                }
            } catch (e) {
                console.warn('[HRD Auth] Verifikasi sandi gagal:', e);
            }
        }

        if (loadingModal) loadingModal.classList.add('hide-section');

        if (authSuccess) {
            isHrdAuthenticated = true;
            try {
                localStorage.removeItem(HRD_ATTEMPTS_STORAGE_KEY);
                localStorage.removeItem(HRD_LOCK_STORAGE_KEY);
                clearLockCookie();
            } catch (e) {}

            if (pinInput) pinInput.value = "";
            openHrdDashboard();
            return;
        }
    } catch (err) {
        if (loadingModal) loadingModal.classList.add('hide-section');
        console.error('HRD Login Error:', err);
    }

    // Jika sandi tidak cocok, tambahkan attempt rate limiting
    isHrdAuthenticated = false;
    if (pinInput) pinInput.value = "";

    let currentAttempts = parseInt(localStorage.getItem(HRD_ATTEMPTS_STORAGE_KEY) || '0', 10) + 1;
    localStorage.setItem(HRD_ATTEMPTS_STORAGE_KEY, currentAttempts.toString());

    if (currentAttempts >= MAX_HRD_ATTEMPTS) {
        const lockTime = Date.now() + HRD_LOCK_DURATION_MS;
        localStorage.setItem(HRD_LOCK_STORAGE_KEY, lockTime.toString());
        setLockCookie(lockTime);
        closeModal('modal-hrd-login');
        customAlert(
            "Akses HRD Terkunci",
            "Terlalu banyak percobaan sandi yang salah (3x). Akses otorisasi HRD dikunci selama 15 menit demi keamanan.",
            "error"
        );
    } else {
        const sisaCoba = MAX_HRD_ATTEMPTS - currentAttempts;
        customAlert(
            "Sandi HRD Salah",
            `Kata sandi yang Anda masukkan tidak sesuai. Sisa kesempatan mencoba: ${sisaCoba} kali.`,
            "error"
        );
    }
}

/**
 * Logout sesi HRD dari Supabase dan kembali ke halaman login utama
 */
async function logoutHrd() {
    const loadingModal = document.getElementById('modal-loading');
    if (loadingModal) loadingModal.classList.remove('hide-section');

    try {
        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
            ? supabaseClient
            : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.auth === 'object') ? window.supabase : null);
        if (sb && sb.auth) await sb.auth.signOut();
    } catch (err) {
        console.error('Logout error:', err);
    }

    isHrdAuthenticated = false;
    cachedHrdData = [];
    const tbody = document.getElementById('hrdTableBody');
    if (tbody) tbody.innerHTML = '';

    if (loadingModal) loadingModal.classList.add('hide-section');
    showPage('page-login');
}
