// =========================================================================
// KONFIGURASI SUPABASE & APLIKASI
// PT Altrak 1978 - Online Assessment System
// =========================================================================

const SUPABASE_URL = (typeof window !== 'undefined' && window.SUPABASE_URL) ? window.SUPABASE_URL : 'https://rvflmznbihunezzqhobm.supabase.co';
const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.SUPABASE_KEY) ? window.SUPABASE_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Zmxtem5iaWh1bmV6enFob2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODM4OTcsImV4cCI6MjEwNTU1OTg5N30.tHXAXhKRvChZOqKjRq9S8AvvSo59PiYizpgDI9FmHcE';

// Inisialisasi client Supabase
const supabaseClient = (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function')
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

if (typeof window !== 'undefined' && supabaseClient) {
    window.supabaseClient = supabaseClient;
    window.supabase = supabaseClient;
}

// Konstanta Waktu Tes Pauli
const PAULI_DURATION_SECONDS = 3600; // 60 menit durasi tes asli
const GARIS_INTERVAL_SECONDS = 180;  // 3 menit pergantian garis instruksi
const TRIAL_DURATION_SECONDS = 30;   // 30 detik durasi simulasi latihan

if (typeof window !== 'undefined') {
    window.PAULI_DURATION_SECONDS = PAULI_DURATION_SECONDS;
    window.GARIS_INTERVAL_SECONDS = GARIS_INTERVAL_SECONDS;
    window.TRIAL_DURATION_SECONDS = TRIAL_DURATION_SECONDS;
}

// Konfigurasi Tema Tailwind CSS (Palet Biru Korporat PT Altrak 1978)
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    altrak: {
                        navy: '#003865',
                        'navy-dark': '#071f38',
                        'navy-deep': '#051627',
                        'navy-medium': '#0b4578',
                        'navy-soft': '#125794',
                        yellow: '#f5b300',
                        gold: '#ffbe1a',
                        card: '#ffffff',
                        surface: '#edf3f9',
                        border: '#b9d0e7'
                    },
                    brand: {
                        blue: '#003865',
                        lightblue: '#0b4578',
                        sky: '#edf3f9',
                    }
                }
            }
        }
    };
}

// Ekspor SUPABASE_URL & KEY ke window untuk dependensi lain (seperti camera.js)
if (typeof window !== 'undefined') {
    window.SUPABASE_URL = SUPABASE_URL;
    window.SUPABASE_KEY = SUPABASE_ANON_KEY;
}

// =========================================================================
// NETWORK RESILIENCE: Toast Notification, Retry, & Offline Queue
// =========================================================================

/**
 * Menampilkan notifikasi toast kecil di pojok kanan bawah layar.
 * Otomatis hilang setelah durasi tertentu.
 * @param {string} pesan - Teks notifikasi
 * @param {'info'|'success'|'warning'|'error'} tipe - Jenis notifikasi
 * @param {number} durasi - Durasi tampil dalam milidetik (default 4000)
 */
function tampilkanToast(pesan, tipe = 'info', durasi = 4000) {
    if (typeof document === 'undefined') return;

    // Buat container jika belum ada
    let container = document.getElementById('toast-container-network');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container-network';
        container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
        document.body.appendChild(container);
    }

    const warna = {
        info: 'background:#003865;color:#fff;',
        success: 'background:#16a34a;color:#fff;',
        warning: 'background:#f59e0b;color:#1a1a1a;',
        error: 'background:#dc2626;color:#fff;'
    };
    const ikon = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };

    const toast = document.createElement('div');
    toast.style.cssText = `${warna[tipe] || warna.info}padding:12px 18px;border-radius:10px;font-size:14px;font-family:Inter,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,0.25);opacity:0;transform:translateY(12px);transition:opacity 0.3s,transform 0.3s;pointer-events:auto;max-width:340px;word-wrap:break-word;`;
    toast.textContent = `${ikon[tipe] || ''} ${pesan}`;
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // Animate out & remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 350);
    }, durasi);
}

/**
 * Mendapatkan Supabase client yang aktif
 * @returns {object|null}
 */
function _getSupabaseClient() {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) return supabaseClient;
    if (typeof window !== 'undefined' && window.supabaseClient) return window.supabaseClient;
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') return window.supabase;
    return null;
}

/**
 * Mengirim data ke Supabase (satu kali percobaan).
 * @returns {Promise<boolean>}
 */
async function _kirimKeSupabase(sbActive, idPeserta, sessionSecret, kolomTes, dataJSON) {
    // Jalur 1: RPC aman
    if (sessionSecret) {
        try {
            const { data: rpcRes, error: rpcErr } = await sbActive.rpc('update_hasil_tes_aman', {
                p_kandidat_id: String(idPeserta),
                p_session_secret: String(sessionSecret),
                p_kolom: kolomTes,
                p_payload: dataJSON
            });
            if (!rpcErr && rpcRes && rpcRes.success) {
                console.log(`[Supabase RPC Berhasil] Kolom ${kolomTes} untuk ID ${idPeserta}.`);
                return true;
            }
            if (rpcErr) console.warn('[Supabase RPC Error]', rpcErr.message || rpcErr);
        } catch (eRpc) {
            console.warn('[Supabase RPC Exception]', eRpc);
        }
    }

    // Jalur 2: Update langsung
    const payloadUpdate = {};
    payloadUpdate[kolomTes] = dataJSON;
    if (kolomTes === 'hasil_pauli' || kolomTes === 'status_tahap_2') {
        payloadUpdate['waktu_selesai'] = new Date().toISOString();
    }

    let query = sbActive.from('kandidat_psikotes').update(payloadUpdate).eq('id', idPeserta);
    if (sessionSecret) query = query.eq('session_secret', sessionSecret);

    const { error } = await query;
    if (error) {
        console.warn(`[Supabase UPDATE Error] ${kolomTes}:`, error.message || error);
        return false;
    }
    console.log(`[Supabase UPDATE Berhasil] Kolom ${kolomTes} untuk ID ${idPeserta}.`);
    return true;
}

// =========================================================================
// OFFLINE QUEUE: Simpan & kirim ulang otomatis saat koneksi pulih
// =========================================================================

const OFFLINE_QUEUE_KEY = '_offlineQueue_hasilTes';

function _getOfflineQueue() {
    try {
        return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    } catch { return []; }
}

function _saveOfflineQueue(queue) {
    try {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.warn('[OfflineQueue] Gagal menyimpan antrian:', e);
    }
}

function _tambahKeAntrian(kolomTes, dataJSON, idPeserta, sessionSecret) {
    const queue = _getOfflineQueue();
    // Hindari duplikasi: timpa entri lama untuk kolom yang sama
    const idx = queue.findIndex(item => item.kolomTes === kolomTes && item.idPeserta === idPeserta);
    const entry = { kolomTes, dataJSON, idPeserta, sessionSecret, waktu: new Date().toISOString() };
    if (idx >= 0) {
        queue[idx] = entry;
    } else {
        queue.push(entry);
    }
    _saveOfflineQueue(queue);
    console.log(`[OfflineQueue] Data ${kolomTes} ditambahkan ke antrian offline (${queue.length} item).`);
}

/**
 * Proses semua item dalam antrian offline.
 * Dipanggil otomatis saat koneksi pulih (event 'online').
 */
async function prosesAntrianOffline() {
    const queue = _getOfflineQueue();
    if (queue.length === 0) return;

    const sbActive = _getSupabaseClient();
    if (!sbActive) return;

    console.log(`[OfflineQueue] Memproses ${queue.length} item tertunda...`);
    tampilkanToast(`Mengirim ${queue.length} data tertunda...`, 'info', 3000);

    const gagal = [];
    for (const item of queue) {
        try {
            const berhasil = await _kirimKeSupabase(sbActive, item.idPeserta, item.sessionSecret, item.kolomTes, item.dataJSON);
            if (!berhasil) gagal.push(item);
        } catch {
            gagal.push(item);
        }
    }

    _saveOfflineQueue(gagal);

    if (gagal.length === 0) {
        console.log('[OfflineQueue] Semua data tertunda berhasil dikirim!');
        tampilkanToast('Semua data tertunda berhasil dikirim!', 'success', 4000);
    } else {
        console.warn(`[OfflineQueue] ${gagal.length} item masih gagal, akan dicoba lagi nanti.`);
        tampilkanToast(`${gagal.length} data masih tertunda, akan dicoba lagi.`, 'warning', 5000);
    }
}

// Listener: otomatis kirim antrian saat koneksi pulih
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[Network] Koneksi internet pulih.');
        tampilkanToast('Koneksi internet pulih!', 'success', 3000);
        setTimeout(prosesAntrianOffline, 1500); // Tunggu sebentar agar koneksi stabil
    });

    window.addEventListener('offline', () => {
        console.log('[Network] Koneksi internet terputus.');
        tampilkanToast('Koneksi internet terputus. Data akan disimpan lokal dan dikirim otomatis saat koneksi pulih.', 'warning', 6000);
    });
}

// =========================================================================
// FUNGSI UTAMA: updateHasilTes (dengan Retry & Offline Fallback)
// =========================================================================

/**
 * Fungsi global untuk memperbarui hasil tes peserta ke database Supabase.
 * Dilengkapi dengan:
 * - Retry otomatis (3x percobaan dengan exponential backoff)
 * - Simpan ke antrian offline jika semua retry gagal
 * - Notifikasi visual (toast) untuk status pengiriman
 * 
 * @param {string} kolomTes Nama kolom di tabel kandidat_psikotes ('hasil_ist', 'hasil_papi', 'hasil_disc', 'hasil_pauli')
 * @param {Object|any} dataJSON Rekaman data hasil jawaban atau skor tes
 * @returns {Promise<boolean>} True jika pembaruan berhasil dikirim ke server Supabase
 */
async function updateHasilTes(kolomTes, dataJSON) {
    console.log(`[Supabase] Memulai pembaruan aman kolom: ${kolomTes}...`);

    // 1. Ambil ID peserta dan session_secret dari penyimpanan lokal browser
    const idPeserta = localStorage.getItem('id_peserta');
    const sessionSecret = localStorage.getItem('session_secret') || '';
    if (!idPeserta) {
        console.warn('[Supabase] ID peserta tidak ditemukan di localStorage. Menyimpan ke cache cadangan.');
        localStorage.setItem(`cadangan_${kolomTes}`, JSON.stringify(dataJSON));
        return false;
    }

    // 2. Simpan cadangan lokal terlebih dahulu (Prinsip Zero Data Loss)
    try {
        localStorage.setItem(`cadangan_${kolomTes}`, JSON.stringify(dataJSON));
        localStorage.setItem(`waktu_simpan_${kolomTes}`, new Date().toISOString());
    } catch (errLokal) {
        console.warn('[Supabase] Gagal menyimpan cadangan lokal:', errLokal);
    }

    // 3. Cek apakah sedang offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[Network] Sedang offline. Data masuk antrian offline.');
        _tambahKeAntrian(kolomTes, dataJSON, idPeserta, sessionSecret);
        tampilkanToast('Sedang offline. Data tersimpan aman dan akan dikirim otomatis saat koneksi pulih.', 'warning', 5000);
        return false;
    }

    const sbActive = _getSupabaseClient();
    if (!sbActive) {
        console.warn('[Supabase] Library Supabase tidak aktif. Data tetap tersimpan aman di browser.');
        _tambahKeAntrian(kolomTes, dataJSON, idPeserta, sessionSecret);
        return false;
    }

    // 4. Retry otomatis dengan exponential backoff (3 percobaan)
    const MAX_RETRY = 3;
    for (let percobaan = 1; percobaan <= MAX_RETRY; percobaan++) {
        try {
            const berhasil = await _kirimKeSupabase(sbActive, idPeserta, sessionSecret, kolomTes, dataJSON);
            if (berhasil) {
                if (percobaan > 1) {
                    tampilkanToast(`Data ${kolomTes} berhasil dikirim (percobaan ke-${percobaan}).`, 'success', 3000);
                }
                return true;
            }
        } catch (err) {
            console.warn(`[Retry ${percobaan}/${MAX_RETRY}] Gagal mengirim ${kolomTes}:`, err);
        }

        // Jeda sebelum retry berikutnya (exponential backoff: 1s, 2s, 4s)
        if (percobaan < MAX_RETRY) {
            const jedaMs = Math.pow(2, percobaan - 1) * 1000;
            console.log(`[Retry] Menunggu ${jedaMs}ms sebelum percobaan ke-${percobaan + 1}...`);
            await new Promise(resolve => setTimeout(resolve, jedaMs));
        }
    }

    // 5. Semua retry gagal → masukkan ke antrian offline
    console.warn(`[Supabase] Semua ${MAX_RETRY} percobaan gagal untuk ${kolomTes}. Masuk antrian offline.`);
    _tambahKeAntrian(kolomTes, dataJSON, idPeserta, sessionSecret);
    tampilkanToast('Gagal mengirim data. Data tersimpan aman dan akan dikirim otomatis saat koneksi stabil.', 'error', 6000);
    return false;
}

// Ekspor ke window agar dapat dipanggil dari skrip modul mana saja
if (typeof window !== 'undefined') {
    window.updateHasilTes = updateHasilTes;
    window.prosesAntrianOffline = prosesAntrianOffline;
    window.tampilkanToast = tampilkanToast;
}


