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

let logoClickCount = 0;
let logoClickTimer = null;

let state = {
    user: { 
        name: "", 
        email: "", 
        phone: "", 
        startTime: "" 
    },
    // Urutan modul asesmen: 1: IST, 2: PAPI Kostick, 3: DISC, 4: Pauli
    modules: {
        1: { id: 1, name: "IST", fullName: "Intelligenz Struktur Test", isCompleted: false },
        2: { id: 2, name: "PAPI Kostick", fullName: "Personality & Preference Inventory", isCompleted: false },
        3: { id: 3, name: "DISC", fullName: "Dominance, Influence, Steadiness, Conscientiousness", isCompleted: false },
        4: { id: 4, name: "Pauli", fullName: "Tes Kraepelin - Pauli", isCompleted: false }
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

