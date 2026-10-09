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
    if (kolomTes === 'hasil_pauli') {
        payloadUpdate['waktu_selesai'] = new Date().toISOString();
    }

    // 4. Jalankan perintah UPDATE ke tabel kandidat_psikotes berdasarkan id
    try {
        const sbActive = (typeof supabaseClient !== 'undefined' && supabaseClient)
            ? supabaseClient
            : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

        if (sbActive) {
            const { data, error } = await sbActive
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


