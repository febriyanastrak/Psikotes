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

let logoClickCount = 0;
let logoClickTimer = null;

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
        isActive: false
    }
};
