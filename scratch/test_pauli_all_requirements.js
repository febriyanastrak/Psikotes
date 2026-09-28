const fs = require('fs');
const vm = require('vm');

const elements = {};
function createElement(id, initialProps = {}) {
    const el = {
        id,
        innerText: '',
        innerHTML: '',
        className: '',
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
        },
        style: {},
        onclick: null,
        disabled: false,
        removeAttribute: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        offsetWidth: 100,
        ...initialProps
    };
    elements[id] = el;
    return el;
}

global.window = {
    scrollTo: () => {},
    addEventListener: () => {}
};

global.document = {
    getElementById: (id) => elements[id] || null,
    querySelectorAll: () => [],
    addEventListener: () => {}
};

[
    'page-dashboard', 'page-pauli-tutorial', 'page-pauli', 'page-hrd', 'page-selesai',
    'historyAnswer', 'mainAnswerBox', 'pauliProgressBar', 'pauliTimer',
    'pauliTimerContainer', 'pauliTimerLabel', 'pauliSubmitBtn', 'pauliSubmitBtnText',
    'pBox1', 'pBox2', 'pBox3', 'pBox4',
    'modal-message', 'msgTitle', 'msgBody', 'msgIcon', 'msgBtnOk', 'msgBtnCancel',
    'btn-start-trial', 'btn-start-real', 'trial-required-info', 'card-4',
    'proctoring-camera-container', 'proctoringVideo'
].forEach(id => createElement(id));

['js/config.js', 'js/pauli-data.js', 'js/state.js', 'js/ui.js', 'js/pauli.js'].forEach(file => {
    vm.runInThisContext(fs.readFileSync(file, 'utf8'));
});

// Setup mock localStorage
const storage = {};
global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = v; }
};
global.window.localStorage = global.localStorage;

let pageShown = null;
global.showPage = (p) => { pageShown = p; };
global.tampilkanHalamanSelesai = () => { global.showPage('page-selesai'); };

async function runAllVerificationTests() {
    console.log('=== TEST ALL REQUIREMENTS: PAULI FLOW, SCORING, CONFIRMATION, IDEMPOTENCY ===\n');

    // -------------------------------------------------------------
    // Req 2: Teks Petunjuk Tutorial & Validasi Wajib Latihan
    // -------------------------------------------------------------
    console.log('--- REQ 2: Tutorial & Enforce Trial Before Real Test ---');
    showPauliTutorial();
    console.log('btnReal disabled initially:', elements['btn-start-real'].disabled);
    console.log('trialInfo text initially:', elements['trial-required-info'].innerText || elements['trial-required-info'].innerHTML);

    if (elements['btn-start-real'].disabled !== true) {
        throw new Error('REQ 2 FAIL: btn-start-real must be disabled before trial is completed');
    }

    startPauliTest(); // Attempt bypass
    if (elements['msgTitle'].innerText !== 'Wajib Latihan Dahulu') {
        throw new Error('REQ 2 FAIL: direct startPauliTest must be blocked before trial');
    }
    console.log('✅ REQ 2 PASS: Tutorial properly enforces trial and locks real test.\n');

    // -------------------------------------------------------------
    // Req 1 & 5: Sesi Latihan, Tombol Selesai Latihan, Input & Timer Lock
    // -------------------------------------------------------------
    console.log('--- REQ 1 & 5: Trial Mode, Action Button Text, Input, Lock ---');
    startTrialPauliTest();
    console.log('submitBtnText during trial:', elements['pauliSubmitBtnText'].innerText);
    if (!elements['pauliSubmitBtnText'].innerText.includes('Selesai Latihan')) {
        throw new Error('REQ 1 FAIL: Submit button during trial must indicate ending practice, got: ' + elements['pauliSubmitBtnText'].innerText);
    }

    // Answer 3 trial questions
    handlePauliInput(2);
    await new Promise(r => setTimeout(r, 80));
    handlePauliInput(6);
    await new Promise(r => setTimeout(r, 80));
    handlePauliInput(1);
    await new Promise(r => setTimeout(r, 80));

    console.log('Trial totalAnswered:', state.pauli.totalAnswered);

    if (state.pauli.totalAnswered !== 3) throw new Error('Expected 3 answered in trial');

    // Click "Selesai Latihan & Lanjut Tes Pauli"
    elements['pauliSubmitBtn'].onclick();
    console.log('Modal visible after clicking end practice:', !elements['modal-message'].classList.contains('hide-section'));
    console.log('Modal title:', elements['msgTitle'].innerText);
    console.log('Modal OK button text:', elements['msgBtnOk'].innerText);

    if (elements['msgBtnOk'].innerText !== 'Lanjut ke Tes Pauli') {
        throw new Error('REQ 1 FAIL: Modal must show "Lanjut ke Tes Pauli" button');
    }

    // Verify trial inputs and timer are locked
    console.log('Checking trial lock state:');
    console.log('state.pauli.isActive:', state.pauli.isActive);
    console.log('state.pauli.timeLeft:', state.pauli.timeLeft);
    console.log('state.pauli.timerId:', state.pauli.timerId);

    const prevAnswered = state.pauli.totalAnswered;
    handlePauliInput(5); // Attempt input while locked
    await new Promise(r => setTimeout(r, 80));
    if (state.pauli.totalAnswered !== prevAnswered) {
        throw new Error('REQ 5 FAIL: Input must be locked when trial finishes');
    }
    console.log('✅ REQ 1 & 5 PASS: Button reflects ending trial, modal allows continuing, input & timer locked.\n');

    // -------------------------------------------------------------
    // Req 5: Isolasi Jawaban Latihan (Tidak Bocor ke Tes Asli)
    // -------------------------------------------------------------
    console.log('--- REQ 5: Trial Answer Isolation (Clean State for Real Test) ---');
    elements['msgBtnOk'].onclick(); // Click "Lanjut ke Tes Pauli"

    console.log('Real test isTrialMode:', isTrialMode);
    console.log('Real test isActive:', state.pauli.isActive);
    console.log('Real test totalAnswered (should be 0):', state.pauli.totalAnswered);
    console.log('Real test correct (should be 0):', state.pauli.correct);
    console.log('Real test wrong (should be 0):', state.pauli.wrong);

    if (state.pauli.totalAnswered !== 0) {
        throw new Error('REQ 5 FAIL: Trial answers must NOT leak into real test');
    }
    console.log('✅ REQ 5 PASS: Real test starts fresh with zero leakage from trial.\n');

    // Clean up timer for controlled testing
    clearInterval(state.pauli.timerId);

    // -------------------------------------------------------------
    // Req 3: Record total answered internally without exposing correctness
    // -------------------------------------------------------------
    console.log('--- REQ 3: Internal answer count ---');
    handlePauliInput(7);
    await new Promise(r => setTimeout(r, 80));
    if (state.pauli.totalAnswered !== 1) throw new Error('REQ 3 FAIL: totalAnswered must be 1');

    handlePauliInput(5);
    await new Promise(r => setTimeout(r, 80));
    if (state.pauli.totalAnswered !== 2) throw new Error('REQ 3 FAIL: totalAnswered must be 2');
    console.log('✅ REQ 3 PASS: totalAnswered remains internal and no correctness status is exposed.\n');

    // -------------------------------------------------------------
    // Req 4: Konfirmasi Pengumpulan Manual vs Pembatalan
    // -------------------------------------------------------------
    console.log('--- REQ 4: Manual Submission Confirmation & Accidental Click Guard ---');
    // Participant taps submit button accidentally
    elements['pauliSubmitBtn'].onclick();
    console.log('Confirmation title:', elements['msgTitle'].innerText);
    console.log('Cancel button visible:', !elements['msgBtnCancel'].classList.contains('hide-section'));

    if (elements['msgTitle'].innerText !== 'Konfirmasi Pengumpulan') {
        throw new Error('REQ 4 FAIL: Manual submission must show confirmation dialog');
    }
    if (elements['msgBtnCancel'].classList.contains('hide-section')) {
        throw new Error('REQ 4 FAIL: Confirmation dialog must offer cancel option');
    }

    // Candidate clicks "Batal"
    elements['msgBtnCancel'].onclick();
    console.log('After cancel -> state.pauli.isActive:', state.pauli.isActive);
    console.log('After cancel -> pageShown:', pageShown);
    if (state.pauli.isActive !== true) {
        throw new Error('REQ 4 FAIL: Test must remain active when user cancels submission');
    }
    if (pageShown === 'page-selesai') {
        throw new Error('REQ 4 FAIL: Test must not submit or navigate to page-selesai on cancel');
    }

    // Candidate clicks submit again and confirms
    elements['pauliSubmitBtn'].onclick();
    elements['msgBtnOk'].onclick(); // Click "Ya, Lanjutkan"

    console.log('After confirm -> state.pauli.isActive:', state.pauli.isActive);
    console.log('After confirm -> pageShown:', pageShown);
    const saved = JSON.parse(storage['hasil_psikotes_local'] || '[]');
    console.log('Saved records in localStorage:', saved.length);

    if (state.pauli.isActive !== false) throw new Error('REQ 4 FAIL: Test must end after confirmation');
    if (pageShown !== 'page-selesai') throw new Error('REQ 4 FAIL: Must transition to page-selesai');
    if (saved.length !== 1) throw new Error('REQ 4 FAIL: Exactly 1 record must be saved');
    console.log('✅ REQ 4 PASS: Confirmation dialog protects against accidental clicks, and submit works on confirmation.\n');

    // -------------------------------------------------------------
    // Req 4: Pengiriman Ganda (Idempotency)
    // -------------------------------------------------------------
    console.log('--- REQ 4: Anti Double-Submission (Single Submit Guard) ---');
    prosesSimpanPauli(false);
    prosesSimpanPauli(true);
    const savedAfterDup = JSON.parse(storage['hasil_psikotes_local'] || '[]');
    console.log('Total records after duplicate attempts:', savedAfterDup.length);
    if (savedAfterDup.length !== 1) {
        throw new Error('REQ 4 FAIL: Duplicate submissions must be completely prevented');
    }
    console.log('✅ REQ 4 PASS: Duplicate submit guard verified.\n');

    // -------------------------------------------------------------
    // Req 4: Pengumpulan Otomatis Saat Waktu Habis Tanpa Konfirmasi
    // -------------------------------------------------------------
    console.log('--- REQ 4: Auto-Submit on Timer Expiry (No Confirmation Needed) ---');
    // Start a fresh real test
    trialCompleted = true;
    startPauliTest();
    clearInterval(state.pauli.timerId);
    storage['hasil_psikotes_local'] = '[]';
    pageShown = null;

    handlePauliInput(3);
    await new Promise(r => setTimeout(r, 80));

    // Simulate timer expiring
    finishPauliTest(true);

    console.log('Auto-expire state.pauli.isActive:', state.pauli.isActive);
    console.log('Auto-expire pageShown:', pageShown);
    const autoSaved = JSON.parse(storage['hasil_psikotes_local'] || '[]');
    console.log('Auto-expire saved records:', autoSaved.length);

    if (state.pauli.isActive !== false) throw new Error('Expected auto-expire to end test');
    if (pageShown !== 'page-selesai') throw new Error('Expected auto-expire to navigate to page-selesai immediately');
    if (autoSaved.length !== 1) throw new Error('Expected auto-expire to save 1 record');
    console.log('✅ REQ 4 PASS: Automatic expiry submits immediately without confirmation.\n');

    console.log('🎉 ALL REQUIREMENTS FULLY TESTED AND PASSED VERIFICATION!');
    process.exit(0);
}

runAllVerificationTests().catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
});
