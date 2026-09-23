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

// Konfigurasi Tema Tailwind CSS
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    altrak: { yellow: '#ffcc00', dark: '#003087', card: '#f0f4ff' },
                    brand: { blue: '#003087', lightblue: '#0057cc', sky: '#e8f0fe', accent: '#ffcc00' }
                }
            }
        }
    };
}
