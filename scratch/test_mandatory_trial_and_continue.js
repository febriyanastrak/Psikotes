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
        removeAttribute: function(attr) { if (attr === 'disabled') this.disabled = false; },
        setAttribute: function(attr, val) { if (attr === 'disabled') this.disabled = true; },
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
    'pauliScore', 'historyAnswer', 'mainAnswerBox', 'pauliProgressBar', 'pauliTimer',
    'pauliTimerContainer', 'pauliTimerLabel', 'pauliSubmitBtn', 'pauliSubmitBtnText',
    'pBox1', 'pBox2', 'pBox3', 'pBox4',
    'modal-message', 'msgTitle', 'msgBody', 'msgIcon', 'msgBtnOk', 'msgBtnCancel',
    'btn-start-trial', 'btn-start-real', 'trial-required-info', 'card-4',
    'proctoring-camera-container', 'proctoringVideo'
].forEach(id => createElement(id));

['js/config.js', 'js/pauli-data.js', 'js/state.js', 'js/ui.js', 'js/pauli.js'].forEach(file => {
    vm.runInThisContext(fs.readFileSync(file, 'utf8'));
});

async function run() {
    console.log('=== TEST MANDATORY TRIAL & MANUAL CONTINUE BUTTON ===\n');

    // Step 1: Tutorial page check before trial
    console.log('--- Step 1: Tutorial Page Initial Check ---');
    showPauliTutorial();
    console.log('trialCompleted:', trialCompleted);
    console.log('btnReal disabled:', elements['btn-start-real'].disabled);
    console.log('btnReal innerHTML:', elements['btn-start-real'].innerHTML);

    if (elements['btn-start-real'].disabled !== true) {
        throw new Error('Expected btn-start-real to be disabled before trial');
    }

    // Try calling startPauliTest directly before trial
    console.log('Attempting to start real test directly without trial...');
    startPauliTest();
    console.log('modal title after bypass attempt:', elements['msgTitle'].innerText);
    if (!elements['msgTitle'].innerText.includes('Wajib Latihan Dahulu')) {
        throw new Error('Expected startPauliTest to be blocked before trial');
    }
    console.log('✅ Real test is strictly locked before trial is completed!\n');

    // Step 2: Start Trial Mode
    console.log('--- Step 2: Starting Trial Mode (30 Seconds) ---');
    startTrialPauliTest();
    console.log('isTrialMode:', isTrialMode);
    console.log('state.pauli.isActive:', state.pauli.isActive);
    console.log('state.pauli.timeLeft:', state.pauli.timeLeft);
    if (!isTrialMode) throw new Error('Expected isTrialMode to be true');

    // Candidate answers a question
    handlePauliInput(2);
    await new Promise(r => setTimeout(r, 100));
    console.log('totalAnswered in trial:', state.pauli.totalAnswered);

    // Step 3: Trial time expires (30 seconds)
    console.log('\n--- Step 3: Trial Mode Time Expires (finishPauliTest(true)) ---');
    finishPauliTest(true);

    console.log('modal-message visible:', !elements['modal-message'].classList.contains('hide-section'));
    console.log('msgTitle:', elements['msgTitle'].innerText);
    console.log('msgBody:', elements['msgBody'].innerText);
    console.log('msgBtnOk text:', elements['msgBtnOk'].innerText);
    console.log('trialCompleted:', trialCompleted);

    if (elements['msgTitle'].innerText !== 'Waktu Percobaan Selesai') {
        throw new Error('Expected modal title to be Waktu Percobaan Selesai');
    }
    if (elements['msgBtnOk'].innerText !== 'Lanjut ke Tes Pauli') {
        throw new Error('Expected modal button to be Lanjut ke Tes Pauli');
    }
    if (trialCompleted !== true) {
        throw new Error('Expected trialCompleted to be true');
    }
    console.log('✅ Notification modal displayed with "Lanjut ke Tes Pauli" button!\n');

    // Step 4: Candidate clicks "Lanjut ke Tes Pauli"
    console.log('--- Step 4: Candidate Clicks "Lanjut ke Tes Pauli" ---');
    // Click OK on modal
    elements['msgBtnOk'].onclick();

    // Wait 70ms for setTimeout to startPauliTest
    await new Promise(r => setTimeout(r, 100));

    console.log('isTrialMode after clicking continue:', isTrialMode);
    console.log('state.pauli.isActive:', state.pauli.isActive);
    console.log('state.pauli.timeLeft (real test):', state.pauli.timeLeft);
    console.log('submitBtnText:', elements['pauliSubmitBtnText'].innerText);

    if (isTrialMode !== false) throw new Error('Expected isTrialMode to be false');
    if (state.pauli.isActive !== true) throw new Error('Expected real Pauli test to be active');
    if (state.pauli.timeLeft !== 3600) throw new Error('Expected 3600s for real test');
    console.log('✅ Real Pauli test started successfully upon clicking "Lanjut ke Tes Pauli"!\n');

    // Step 5: Test Tutorial Buttons when returning to tutorial
    console.log('--- Step 5: Tutorial Page After Trial Completed ---');
    showPauliTutorial();
    console.log('btnReal disabled now:', elements['btn-start-real'].disabled);
    console.log('btnReal innerHTML now:', elements['btn-start-real'].innerHTML);
    if (elements['btn-start-real'].disabled !== false) {
        throw new Error('Expected btn-start-real to be enabled after trial is completed');
    }
    console.log('✅ Button Mulai Tes Pauli is now unlocked in tutorial!\n');

    console.log('🎉 ALL REQUIREMENTS FULLY VERIFIED AND PASSED!');
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
