// =========================================================================
// STATE MANAGEMENT & VARIABEL GLOBAL APLIKASI
// PT Altrak 1978 - Online Assessment System
// =========================================================================

let isProcessing = false;
let isTrialMode = false;
let hrdChartInstance = null;
let isDataSubmitted = false;
let isHrdAuthenticated = false;
let cachedHrdData = [];
let trialCompleted = false;

// Pelacakan keamanan & anti-kecurangan
let tabSwitchViolations = 0;
let lastPauliInputTime = 0;
let rapidInputViolations = 0;

// Rate limiting persisten untuk proteksi login HRD (Disimpan di localStorage)
const HRD_LOCK_STORAGE_KEY = '_altrak_sec_hrd_lock';
const HRD_ATTEMPTS_STORAGE_KEY = '_altrak_sec_hrd_attempts';
const MAX_HRD_ATTEMPTS = 3;
const HRD_LOCK_DURATION_MS = 15 * 60 * 1000; // 15 menit

// =========================================================================
// SISTEM INTEGRITAS & CHECKSUM LOCALSTORAGE (ANTI-TAMPERING PESERTA)
// =========================================================================
(function() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const CRITICAL_KEYS = ['ist_selesai', 'pauli_selesai', 'papi_selesai', 'disc_selesai', 'epps_selesai'];
    // Gunakan salt tetap stabil yang tidak berubah pada pergantian hari 00:00 UTC (07:00 WIB)
    const SECRET_SALT = 'Altrak_Assessment_2026_Enterprise_SecureHash_Permanent';

    function calcChecksum(k, v) {
        const raw = `${k}:${v}:${SECRET_SALT}`;
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            hash = ((hash << 5) - hash) + raw.charCodeAt(i);
            hash |= 0;
        }
        return 'sig_' + Math.abs(hash).toString(36);
    }

    const _origSetItem = localStorage.setItem.bind(localStorage);
    const _origGetItem = localStorage.getItem.bind(localStorage);
    const _origRemoveItem = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = function(k, v) {
        _origSetItem(k, v);
        if (CRITICAL_KEYS.includes(k)) {
            _origSetItem('_sig_' + k, calcChecksum(k, String(v)));
        }
    };

    localStorage.getItem = function(k) {
        const val = _origGetItem(k);
        if (val === null) return null;
        if (CRITICAL_KEYS.includes(k)) {
            const expected = calcChecksum(k, val);
            const actual = _origGetItem('_sig_' + k);
            if (actual && actual !== expected) {
                console.warn(`[Security Alert] Integritas data '${k}' tidak valid (diduga dimodifikasi). Reset status.`);
                _origRemoveItem(k);
                _origRemoveItem('_sig_' + k);
                return null;
            } else if (!actual && val) {
                // Auto-migrasi: Jika signature belum ada dari sesi sebelumnya, buatkan signature aman
                _origSetItem('_sig_' + k, expected);
            }
        }
    
        return val;
    };
})();

let logoClickCount = 0;
let logoClickTimer = null;

let state = {
    user: { 
        name: "", 
        email: "", 
        phone: "", 
        startTime: "" 
    },
    // Urutan modul asesmen: 1: Inteligent 1, 2: PAPI Kostick, 3: DISC, 4: EPPS, 5: Pauli
    modules: {
        1: { id: 1, name: "Inteligent 1", fullName: "Inteligent 1", isCompleted: false },
        2: { id: 2, name: "PAPI Kostick", fullName: "Personality & Preference Inventory", isCompleted: false },
        3: { id: 3, name: "DISC", fullName: "Dominance, Influence, Steadiness, Conscientiousness", isCompleted: false },
        4: { id: 4, name: "EPPS", fullName: "Edwards Personal Preference Schedule", isCompleted: false },
        5: { id: 5, name: "Pauli", fullName: "Tes Kraepelin - Pauli", isCompleted: false }
    },
    currentActiveModule: 1,
    pauli: {
        numbers: [],
        index: 1,
        totalAnswered: 0,
        correct: 0,
        wrong: 0,
        timeLeft: typeof PAULI_DURATION_SECONDS !== 'undefined' ? PAULI_DURATION_SECONDS : 3600,
        startTimestamp: null,
        lastProcessedInterval: 0,
        intervalCounter: 0,
        garisArray: [],
        timerId: null,
        isActive: false,
        // Skoring per-range: dihitung berdasarkan posisi dalam LEMBAR_PAULI_ASLI
        range1Correct: 0,
        range1Wrong: 0,
        range2Correct: 0,
        range2Wrong: 0,
        range3Correct: 0,
        range3Wrong: 0
    }
};

