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
        const displayType = (finalTargetId === 'view-dashboard' || finalTargetId === 'view-hrd') ? 'block' : 'flex';
        targetSection.style.setProperty('display', displayType, 'important');
        targetSection.classList.add(displayType === 'block' ? 'fase-aktif-block' : 'fase-aktif');
    } else {
        console.warn('[SPA Router] Section target tidak ditemukan:', finalTargetId);
    }

    // 3. Scroll ke posisi atas secara otomatis
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 4. Jika menuju dashboard, perbarui status kartu dan progres secara otomatis
    if (finalTargetId === 'view-dashboard') {
        if (typeof terapkanPenguncianDashboard === 'function') {
            terapkanPenguncianDashboard();
        }
        if (typeof updateDashboardProgress === 'function') {
            updateDashboardProgress();
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

    // 1. Validasi checkbox persetujuan Pakta Integritas
    const consentCheck = document.getElementById('checkboxConsent');
    if (!consentCheck || !consentCheck.checked) {
        alert("Anda harus menyetujui Pakta Integritas terlebih dahulu!");
        return;
    }

    // Ambil data dari 3 input formulir
    const nameInput = document.getElementById('inputName');
    const emailInput = document.getElementById('inputEmail');
    const phoneInput = document.getElementById('inputPhone');

    const cleanName = (nameInput ? nameInput.value : '').trim();
    const cleanEmail = (emailInput ? emailInput.value : '').trim();
    const cleanPhone = (phoneInput ? phoneInput.value : '').trim();

    if (!cleanName || cleanName.length < 3) {
        alert("Harap masukkan Nama Lengkap minimal 3 karakter!");
        return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
        alert("Harap masukkan Alamat Email Aktif yang benar!");
        return;
    }

    if (!cleanPhone || cleanPhone.length < 9) {
        alert("Harap masukkan Nomor WhatsApp / HP yang valid!");
        return;
    }

    // Ubah tampilan tombol ke mode loading
    const btnSubmit = document.getElementById('btnSubmitLogin');
    const btnText = document.getElementById('btnSubmitLoginText');
    const btnIcon = document.getElementById('btnSubmitLoginIcon');

    if (btnSubmit) btnSubmit.disabled = true;
    if (btnText) btnText.textContent = "Menghubungkan ke Portal...";
    if (btnIcon) btnIcon.className = "fa-solid fa-circle-notch fa-spin";

    // Simpan ke state memori lokal
    if (typeof state !== 'undefined') {
        state.user = {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            startTime: new Date().toLocaleTimeString('id-ID')
        };
    }

    // Bersihkan sesi tes sebelumnya
    localStorage.removeItem('ist_selesai');
    localStorage.removeItem('papi_selesai');
    localStorage.removeItem('disc_selesai');
    localStorage.removeItem('pauli_selesai');
    localStorage.removeItem('ist_terkirim_supabase');
    localStorage.removeItem('altrak_ist_completed_subtests');

    let idPesertaBaru = null;

    // 2. Jalankan perintah INSERT ke Supabase (tabel kandidat_psikotes)
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
                        nama_lengkap: cleanName,
                        email: cleanEmail,
                        no_wa: cleanPhone,
                        posisi_dilamar: 'Peserta Seleksi'
                    }
                ])
                .select();

            if (!error && data && data.length > 0 && data[0].id) {
                idPesertaBaru = data[0].id;
                console.log('[Supabase SPA] Data kandidat berhasil di-insert ke Supabase. ID:', idPesertaBaru);
            } else if (error) {
                console.warn('[Supabase SPA] Respon server (aman tersimpan di cadangan lokal):', error.message || error);
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

    const profilLengkap = {
        name: cleanName,
        id: idPesertaBaru,
        email: cleanEmail,
        phone: cleanPhone,
        position: 'Peserta Seleksi'
    };
    localStorage.setItem('altrak_candidate_profile', JSON.stringify(profilLengkap));

    // Perbarui badge identitas pada navbar
    const navName = document.getElementById('nav-user-name');
    if (navName) navName.textContent = cleanName.split(' ')[0];
    const navInfo = document.getElementById('nav-user-info');
    if (navInfo) navInfo.classList.remove('hide-section');

    // Kembalikan tampilan tombol
    if (btnSubmit) btnSubmit.disabled = false;
    if (btnText) btnText.textContent = "Masuk ke Portal Tes";
    if (btnIcon) btnIcon.className = "fa-solid fa-arrow-right-long";

    // 4. Jalankan pindahFase('view-dashboard')
    pindahFase('view-dashboard');
}

// Inisialisasi awal saat dokumen siap: pastikan view-login yang tampil
document.addEventListener('DOMContentLoaded', () => {
    // Sembunyikan semua section dan tampilkan view-login secara default
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
