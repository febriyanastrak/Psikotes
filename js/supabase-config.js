
// =========================================================================
// KONFIGURASI SUPABASE & SINKRONISASI DATA HASIL PSIKOTES
// PT Altrak 1978 - Portal Psikotes Terpadu
// =========================================================================

// URL dan Kunci Publik Supabase yang diberikan
const SUPABASE_URL = 'https://rvflmznbihunezzqhobm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Zmxtem5iaWh1bmV6enFob2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODM4OTcsImV4cCI6MjEwNTU1OTg5N30.tHXAXhKRvChZOqKjRq9S8AvvSo59PiYizpgDI9FmHcE';

// Inisialisasi Supabase Client jika library CDN sudah dimuat
let supabase = null;
try {
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) {
    console.warn('[Supabase Config] Peringatan inisialisasi Supabase:', e);
}
// Pastikan variabel supabase tersedia secara global di window
if (typeof window !== 'undefined') {
    window.SUPABASE_URL = SUPABASE_URL;
    window.SUPABASE_KEY = SUPABASE_KEY;
    window.supabase = supabase;
}

/**
 * Fungsi global untuk memperbarui hasil tes peserta ke database Supabase
 * Mengambil id_peserta dari localStorage dan memperbarui baris kandidat pada kolom yang diminta.
 * 
 * @param {string} kolomTes Nama kolom di tabel kandidat_psikotes ('hasil_ist', 'hasil_papi', 'hasil_disc', 'hasil_pauli')
 * @param {Object|any} dataJSON Rekaman data hasil jawaban atau skor tes
 * @returns {Promise<boolean>} True jika pembaruan berhasil dikirim ke server Supabase
 */
async function updateHasilTes(kolomTes, dataJSON) {
    console.log(`[Supabase] Memulai pembaruan kolom: ${kolomTes}...`);

    // 1. Ambil ID peserta dari penyimpanan lokal browser
    const idPeserta = localStorage.getItem('id_peserta');
    if (!idPeserta) {
        console.warn('[Supabase] ID peserta tidak ditemukan di localStorage. Menyimpan ke cache cadangan.');
        // Simpan cadangan data ke localStorage agar tidak ada data hilang
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

    // 3. Siapkan payload pembaruan untuk Supabase
    const payloadUpdate = {};
    payloadUpdate[kolomTes] = dataJSON;

    // 4. Jalankan perintah UPDATE ke tabel kandidat_psikotes berdasarkan id
    try {
        // Inisialisasi ulang client jika sebelumnya belum sempat terpasang
        if (!supabase && typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            window.supabase = supabase;
        }

        if (supabase) {
            const { data, error } = await supabase
                .from('kandidat_psikotes')
                .update(payloadUpdate)
                .eq('id', idPeserta);

            if (error) {
                console.warn(`[Supabase UPDATE Catatan] Status server untuk ${kolomTes}:`, error.message || error);
                return false;
            }

            console.log(`[Supabase UPDATE Berhasil] Kolom ${kolomTes} untuk ID ${idPeserta} berhasil diperbarui.`);
            return true;
        } else {
            console.warn('[Supabase] Library Supabase tidak aktif. Data tetap tersimpan aman di browser.');
            return false;
        }
    } catch (errServer) {
        console.warn(`[Supabase Jaringan] Gagal mengirim data ${kolomTes} ke server:`, errServer);
        return false;
    }
}

// Ekspor ke window agar dapat dipanggil dari skrip modul mana saja
if (typeof window !== 'undefined') {
    window.updateHasilTes = updateHasilTes;
}
