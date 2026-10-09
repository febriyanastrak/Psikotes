// =========================================================================
// DELEGASI KONFIGURASI SUPABASE (SINGLE SOURCE OF TRUTH)
// PT Altrak 1978 - Online Assessment Portal
// Catatan: Seluruh konfigurasi Supabase & fungsi updateHasilTes 
// kini terpusat di js/config.js untuk mencegah inkonsistensi & duplikasi data.
// =========================================================================

if (typeof window !== 'undefined') {
    // Pastikan variabel mengacu ke sumber tunggal
    window.SUPABASE_URL = window.SUPABASE_URL || '';
    window.SUPABASE_KEY = window.SUPABASE_KEY || '';
}
