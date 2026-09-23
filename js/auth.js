// =========================================================================
// SISTEM AUTENTIKASI PESERTA & OTORISASI HRD
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * Memproses permintaan pendaftaran peserta & men-generate simulasi kode OTP
 * @param {Event} e Event submit form
 */
function handleRequestOTP(e) {
    e.preventDefault();
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();

    state.user = { name, email, phone, startTime: "" };
    // Generate kode token 6 digit acak
    state.otp = Math.floor(100000 + Math.random() * 900000).toString();

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
function verifyOTP() {
    const input = document.getElementById('inputOtp').value;
    if (input === state.otp) {
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
        customAlert("Akses Ditolak", "Kode OTP yang Anda masukkan salah.", "error");
    }
}

// --- AKSES RAHASIA HRD (SECRET SHORTCUT & EASTER EGG) ---

/**
 * Easter Egg: Klik logo Altrak sebanyak 3 kali dalam 1 detik untuk memunculkan modal login HRD
 */
function handleLogoClick() {
    logoClickCount++;
    clearTimeout(logoClickTimer);
    if (logoClickCount >= 3) {
        logoClickCount = 0;
        openHrdLoginModal();
    } else {
        logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1000);
    }
}

/**
 * Memeriksa parameter URL atau hash (#hrd atau ?hrd=true) untuk akses cepat HRD
 */
function checkUrlHash() {
    if (window.location.hash === '#hrd' || window.location.search.includes('hrd=true')) {
        openHrdLoginModal();
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
async function verifyHrdLogin() {
    const pinInput = document.getElementById('inputHrdPin');
    const pin = pinInput ? pinInput.value : '';
    if (!pin) return customAlert("Akses Ditolak", "Sandi tidak boleh kosong.", "error");

    const loadingModal = document.getElementById('modal-loading');
    if (loadingModal) loadingModal.classList.remove('hide-section');

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: 'hrd@altrak1978.co.id',
            password: pin
        });

        if (loadingModal) loadingModal.classList.add('hide-section');

        if (error || !data || !data.session) {
            isHrdAuthenticated = false;
            customAlert("Akses Ditolak", "Sandi HRD salah atau akun belum didaftarkan di sistem.", "error");
        } else {
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
        await supabaseClient.auth.signOut();
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
