// =========================================================================
// SISTEM AUTENTIKASI PESERTA & OTORISASI HRD
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * Memproses permintaan pendaftaran peserta & men-generate simulasi kode OTP
 * Dilengkapi rate limiting untuk mencegah brute force
 * @param {Event} e Event submit form
 */
function handleRequestOTP(e) {
    e.preventDefault();

    // Cek rate limiting
    const now = Date.now();
    if (otpAttempts >= MAX_OTP_ATTEMPTS && now < otpLockUntil) {
        const menisTersisa = Math.ceil((otpLockUntil - now) / 60000);
        customAlert("Terlalu Banyak Percobaan", `Terlalu banyak permintaan OTP. Coba lagi dalam ${menisTersisa} menit.`, "error");
        return;
    }
    if (now >= otpLockUntil) {
        otpAttempts = 0; // Reset setelah masa kunci berakhir
    }

    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();

    // Sanitasi input dasar
    if (name.length < 3 || name.length > 100) {
        customAlert("Input Tidak Valid", "Nama harus antara 3 hingga 100 karakter.", "error");
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        customAlert("Input Tidak Valid", "Format email tidak valid.", "error");
        return;
    }
    if (!/^[0-9+\-\s]{8,20}$/.test(phone)) {
        customAlert("Input Tidak Valid", "Nomor telepon tidak valid (8-20 digit).", "error");
        return;
    }

    state.user = { name, email, phone, startTime: "" };
    // Generate kode token 6 digit acak
    state.otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpAttempts++;
    if (otpAttempts >= MAX_OTP_ATTEMPTS) {
        otpLockUntil = Date.now() + (OTP_LOCK_MINUTES * 60 * 1000);
    }

    const otpArea = document.getElementById('otpArea');
    if (otpArea) otpArea.classList.remove('hide-section');

    const displayOtp = document.getElementById('displayOtpCode');
    if (displayOtp) displayOtp.innerText = state.otp;

    const modalOtp = document.getElementById('modal-otp');
    if (modalOtp) modalOtp.classList.remove('hide-section');
}

/**
 * Memverifikasi input OTP peserta dan membuka akses ke Dashboard Tes
 */
let otpVerifyAttempts = 0;
const MAX_VERIFY_ATTEMPTS = 5;

function verifyOTP() {
    if (otpVerifyAttempts >= MAX_VERIFY_ATTEMPTS) {
        customAlert("Akses Diblokir", "Terlalu banyak percobaan kode OTP yang salah. Silakan muat ulang halaman untuk memulai kembali.", "error");
        return;
    }

    const input = document.getElementById('inputOtp').value.trim();
    if (!input) {
        customAlert("Input Kosong", "Masukkan kode OTP terlebih dahulu.", "error");
        return;
    }

    if (input === state.otp) {
        otpVerifyAttempts = 0;
        const now = new Date();
        state.user.startTime = now.toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const navName = document.getElementById('nav-user-name');
        if (navName && state.user.name) {
            navName.innerText = state.user.name.split(' ')[0];
        }

        const navInfo = document.getElementById('nav-user-info');
        if (navInfo) navInfo.classList.remove('hide-section');

        showPage('page-dashboard');
        updateDashboardProgress();
    } else {
        otpVerifyAttempts++;
        const sisaCoba = MAX_VERIFY_ATTEMPTS - otpVerifyAttempts;
        if (sisaCoba > 0) {
            customAlert("Kode Salah", `Kode OTP yang Anda masukkan salah. Sisa percobaan: ${sisaCoba}`, "error");
        } else {
            customAlert("Akses Diblokir", "Terlalu banyak percobaan salah. Silakan muat ulang halaman.", "error");
        }
    }
}

// --- AKSES AMAN HRD (Tersembunyi, tidak via URL) ---

/**
 * Logo Altrak: klik 5 kali dalam 2 detik untuk memunculkan modal login HRD
 * (Lebih aman dari sebelumnya yang hanya 3 kali dalam 1 detik)
 */
function handleLogoClick() {
    logoClickCount++;
    clearTimeout(logoClickTimer);
    if (logoClickCount >= 5) {
        logoClickCount = 0;
        openHrdLoginModal();
    } else {
        logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 2000);
    }
}

/**
 * Membuka modal login otorisasi HRD
 */
function openHrdLoginModal() {
    const pinInput = document.getElementById('inputHrdPin');
    if (pinInput) pinInput.value = "";

    const modalHrd = document.getElementById('modal-hrd-login');
    if (modalHrd) modalHrd.classList.remove('hide-section');
}

/**
 * Memverifikasi sandi HRD menggunakan autentikasi Supabase
 */
let hrdLoginAttempts = 0;
const MAX_HRD_ATTEMPTS = 3;
let hrdLockUntil = 0;

async function verifyHrdLogin() {
    // Cek rate limiting HRD
    const now = Date.now();
    if (hrdLoginAttempts >= MAX_HRD_ATTEMPTS && now < hrdLockUntil) {
        const menisTersisa = Math.ceil((hrdLockUntil - now) / 60000);
        customAlert("Akses Dikunci", `Terlalu banyak percobaan login. Coba lagi dalam ${menisTersisa} menit.`, "error");
        return;
    }
    if (now >= hrdLockUntil) {
        hrdLoginAttempts = 0;
    }

    const pinInput = document.getElementById('inputHrdPin');
    const pin = pinInput ? pinInput.value : '';
    if (!pin) return customAlert("Akses Ditolak", "Sandi tidak boleh kosong.", "error");

    const loadingModal = document.getElementById('modal-loading');
    if (loadingModal) loadingModal.classList.remove('hide-section');

    try {
        if (!supabaseClient) throw new Error('Koneksi database tidak tersedia.');
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: 'hrd@altrak1978.co.id',
            password: pin
        });

        if (loadingModal) loadingModal.classList.add('hide-section');

        if (error || !data || !data.session) {
            hrdLoginAttempts++;
            if (hrdLoginAttempts >= MAX_HRD_ATTEMPTS) {
                hrdLockUntil = Date.now() + (15 * 60 * 1000); // Kunci 15 menit
            }
            const sisaCoba = MAX_HRD_ATTEMPTS - hrdLoginAttempts;
            isHrdAuthenticated = false;
            if (pinInput) pinInput.value = "";
            if (sisaCoba > 0) {
                customAlert("Akses Ditolak", `Sandi HRD salah. Sisa percobaan: ${sisaCoba}`, "error");
            } else {
                customAlert("Akses Dikunci", "Terlalu banyak percobaan salah. Akses HRD dikunci 15 menit.", "error");
                closeModal('modal-hrd-login');
            }
        } else {
            hrdLoginAttempts = 0;
            isHrdAuthenticated = true;
            if (pinInput) pinInput.value = "";
            closeModal('modal-hrd-login');
            showPage('page-hrd');
            loadHrdData();
        }
    } catch (err) {
        if (loadingModal) loadingModal.classList.add('hide-section');
        console.error('HRD Login Error:', err);
        customAlert("Kesalahan Koneksi", "Terjadi kesalahan saat memverifikasi sandi HRD.", "error");
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
