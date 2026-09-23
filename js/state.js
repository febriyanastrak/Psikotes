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

// Rate limiting untuk OTP
let otpAttempts = 0;
let otpLockUntil = 0;
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCK_MINUTES = 10;

let logoClickCount = 0;
let logoClickTimer = null;
let hrdClickCount = 0;
let hrdClickTimer = null;

let state = {
    otp: "",
    user: { 
        name: "", 
        email: "", 
        phone: "", 
        startTime: "" 
    },
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
        range1Correct: 0,   // posisi 0-619   [9,5,7,9,6,2..7,7,4,6,5,8,8,2]
        range1Wrong: 0,
        range2Correct: 0,   // posisi 660-1659 [5,5,6,9,4..+1000 angka]
        range2Wrong: 0,
        range3Correct: 0,   // posisi 1839-1940 [3,8,5,7,4..6,8,9,3,6,6,5]
        range3Wrong: 0
    }
};
