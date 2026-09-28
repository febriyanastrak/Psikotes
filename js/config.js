// =========================================================================
// KONFIGURASI SUPABASE & APLIKASI
// PT Altrak 1978 - Online Assessment System
// =========================================================================

const SUPABASE_URL = 'https://rvflmznbihunezzqhobm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7BSuCbbyMdmtjL--NWiqNQ_-16Ja2gZ';

// Inisialisasi client Supabase
const supabaseClient = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

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
                        accent: '#f5b300'
                    }
                }
            }
        }
    };
}

