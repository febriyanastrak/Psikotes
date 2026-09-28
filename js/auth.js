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

/**
 * Memeriksa status penguncian brute-force HRD di localStorage
 * @returns {{isLocked: boolean, remainingMinutes: number}}
 */
function checkHrdLockStatus() {
    try {
        const lockUntil = parseInt(localStorage.getItem(HRD_LOCK_STORAGE_KEY) || '0', 10);
        const now = Date.now();
        if (now < lockUntil) {
            const remainingMinutes = Math.ceil((lockUntil - now) / 60000);
            return { isLocked: true, remainingMinutes };
        }
        // Jika masa kunci telah berlalu, reset hitungan percobaan
        if (lockUntil > 0 && now >= lockUntil) {
            localStorage.removeItem(HRD_LOCK_STORAGE_KEY);
            localStorage.removeItem(HRD_ATTEMPTS_STORAGE_KEY);
        }
    } catch (e) {
        // Fallback jika localStorage diblokir
    }
    return { isLocked: false, remainingMinutes: 0 };
}

/**
 * Membersihkan semua status error validasi form login peserta
 */
function clearLoginValidationErrors() {
    const alertBox = document.getElementById('loginAlertBox');
    if (alertBox) alertBox.classList.add('hide-section');

    const fields = ['inputName', 'inputEmail', 'inputPhone'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('border-red-500', 'bg-red-50/50', 'ring-2', 'ring-red-500/20');
            el.classList.add('border-[#b9d0e7]', 'bg-[#edf3f9]');
        }
    });

    const errorIds = ['errorName', 'errorEmail', 'errorPhone', 'errorConsent'];
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
 * @param {Event} e Event submit form
 */
function handleRequestOTP(e) {
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

    const cleanName = sanitizeInput(rawName);
    const cleanEmail = sanitizeInput(rawEmail);
    const cleanPhone = sanitizeInput(rawPhone);

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
    // Normalisasi: hilangkan spasi, strip, atau titik jika diketik peserta
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

    // Simpan ke state terisolasi
    state.user = {
        name: cleanName,
        email: cleanEmail,
        phone: normalizedPhone,
        startTime: ""
    };

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

    // Arahkan ke Dashboard Tes
    showPage('page-dashboard');
    updateDashboardProgress();
}

// Pasang listener realtime input untuk membersihkan error saat peserta mengetik ulang
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        ['inputName', 'inputEmail', 'inputPhone'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    el.classList.remove('border-red-500', 'bg-red-50/50', 'ring-2', 'ring-red-500/20');
                    el.classList.add('border-[#b9d0e7]', 'bg-[#edf3f9]');
                    const errMap = { inputName: 'errorName', inputEmail: 'errorEmail', inputPhone: 'errorPhone' };
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

// --- AKSES TERPROTEKSI HRD (3x Klik Logo Altrak / Shortcut) ---

/**
 * Logo Altrak: tiga klik berurutan membuka modal otorisasi HRD
 */
function handleLogoClick() {
    logoClickCount++;
    if (logoClickTimer) clearTimeout(logoClickTimer);

    if (logoClickCount < 3) {
        logoClickTimer = setTimeout(() => {
            logoClickCount = 0;
            logoClickTimer = null;
        }, 1500);
        return;
    }

    logoClickCount = 0;
    logoClickTimer = null;

    if (isHrdAuthenticated) {
        showPage('page-hrd');
        loadHrdData();
        return;
    }
    openHrdLoginModal();
}

/**
 * Membuka modal login otorisasi HRD
 */
function openHrdLoginModal() {
    const pinInput = document.getElementById('inputHrdPin');
    if (pinInput) pinInput.value = "";

    const modalHrd = document.getElementById('modal-hrd-login');
    if (modalHrd) {
        modalHrd.classList.remove('hide-section');
        if (pinInput) {
            setTimeout(() => pinInput.focus(), 150);
        }
    } else {
        window.location.href = 'hrd.html';
    }
}

/**
 * Memverifikasi sandi HRD melalui Supabase Auth
 */
async function verifyHrdLogin() {
    const pinInput = document.getElementById('inputHrdPin');
    const pin = pinInput ? pinInput.value.trim() : '';
    if (!pin) {
        customAlert("Akses Ditolak", "Kata sandi HRD tidak boleh kosong.", "error");
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
        if (supabaseClient && supabaseClient.auth) {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: 'hrd@altrak1978.co.id',
                password: pin
            });

            if (loadingModal) loadingModal.classList.add('hide-section');

            if (!error && data && data.session) {
                isHrdAuthenticated = true;
                try {
                    localStorage.removeItem(HRD_ATTEMPTS_STORAGE_KEY);
                    localStorage.removeItem(HRD_LOCK_STORAGE_KEY);
                } catch (e) {}

                if (pinInput) pinInput.value = "";
                closeModal('modal-hrd-login');
                showPage('page-hrd');
                loadHrdData();
                return;
            }
        } else {
            if (loadingModal) loadingModal.classList.add('hide-section');
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
        if (supabaseClient) await supabaseClient.auth.signOut();
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

