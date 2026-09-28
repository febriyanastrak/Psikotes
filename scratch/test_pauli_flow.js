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

async function runTest() {
    console.log('Testing Pauli Flow...');

    // Step 1: Start Trial
    console.log('\n--- Test Step 1: startTrialPauliTest() ---');
    startTrialPauliTest();
    console.log('isTrialMode:', isTrialMode);
    console.log('state.pauli.isActive:', state.pauli.isActive);
    console.log('state.pauli.timeLeft (trial):', state.pauli.timeLeft);
    console.log('submitBtnText:', elements['pauliSubmitBtnText'].innerText);

    if (!isTrialMode) throw new Error('Expected isTrialMode to be true');
    if (elements['pauliSubmitBtnText'].innerText !== 'Selesai Latihan & Lanjut Tes Pauli') {
        throw new Error('Expected button text to be Selesai Latihan & Lanjut Tes Pauli');
    }

    // Answer 3 questions in trial
    handlePauliInput(2);
    await new Promise(r => setTimeout(r, 80));
    handlePauliInput(6);
    await new Promise(r => setTimeout(r, 80));
    console.log('Trial totalAnswered:', state.pauli.totalAnswered);
    if (state.pauli.totalAnswered !== 2) throw new Error('Expected 2 answered in trial');

    // Step 2: User clicks "Selesai Latihan & Lanjut Tes Pauli"
    console.log('\n--- Test Step 2: Clicking "Selesai Latihan & Lanjut Tes Pauli" ---');
    elements['pauliSubmitBtn'].onclick();

    console.log('Trial completed status:', trialCompleted);
    console.log('Modal visible:', !elements['modal-message'].classList.contains('hide-section'));
    console.log('Modal title:', elements['msgTitle'].innerText);
    console.log('Modal button:', elements['msgBtnOk'].innerText);

    if (trialCompleted !== true) throw new Error('Expected trialCompleted to be true');
    if (elements['msgBtnOk'].innerText !== 'Lanjut ke Tes Pauli') {
        throw new Error('Expected modal button to be Lanjut ke Tes Pauli');
    }

    // Candidate clicks "Lanjut ke Tes Pauli"
    elements['msgBtnOk'].onclick();

    console.log('isTrialMode after click:', isTrialMode);
    console.log('state.pauli.isActive:', state.pauli.isActive);
    console.log('state.pauli.timeLeft (real test):', state.pauli.timeLeft);
    console.log('state.pauli.totalAnswered in real test (isolation check):', state.pauli.totalAnswered);
    console.log('submitBtnText:', elements['pauliSubmitBtnText'].innerText);

    if (isTrialMode !== false) throw new Error('Expected isTrialMode to be false');
    if (state.pauli.isActive !== true) throw new Error('Expected state.pauli.isActive to be true');
    if (state.pauli.timeLeft !== 3600) throw new Error('Expected state.pauli.timeLeft to be 3600');
    if (state.pauli.totalAnswered !== 0) throw new Error('Expected trial answers NOT to leak into real test');
    if (elements['pauliSubmitBtnText'].innerText !== 'Kumpulkan Hasil Tes') {
        throw new Error('Expected submitBtnText to be Kumpulkan Hasil Tes');
    }

    // Clean up timer
    clearInterval(state.pauli.timerId);

    // Step 3: Test answers and score counter in real test
    console.log('\n--- Test Step 3: Answers & Score Counter in Real Test ---');
    handlePauliInput(7);
    await new Promise(r => setTimeout(r, 80));
    console.log('Real test totalAnswered:', state.pauli.totalAnswered);
    if (state.pauli.totalAnswered !== 1) throw new Error('Expected 1 answered');

    // Step 4: Test confirmation on manual submit
    console.log('\n--- Test Step 4: Manual Submit Confirmation ---');
    const storage = {};
    global.localStorage = {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = v; }
    };
    global.window.localStorage = global.localStorage;

    let pageShown = null;
    global.showPage = (p) => { pageShown = p; };
    global.tampilkanHalamanSelesai = () => { global.showPage('page-selesai'); };

    // Participant clicks "Kumpulkan Hasil Tes"
    elements['pauliSubmitBtn'].onclick();

    console.log('Confirmation modal title:', elements['msgTitle'].innerText);
    console.log('Modal cancel visible:', !elements['msgBtnCancel'].classList.contains('hide-section'));

    if (elements['msgTitle'].innerText !== 'Konfirmasi Pengumpulan') {
        throw new Error('Expected confirmation modal on manual submit');
    }

    // Test clicking Cancel -> test remains active
    console.log('Testing Cancel button...');
    elements['msgBtnCancel'].onclick();
    console.log('state.pauli.isActive after cancel:', state.pauli.isActive);
    if (state.pauli.isActive !== true) throw new Error('Expected test to remain active after cancel');
    if (pageShown !== null) throw new Error('Expected page NOT to change on cancel');

    // Participant clicks submit again and confirms
    console.log('Clicking submit again and confirming...');
    elements['pauliSubmitBtn'].onclick();
    elements['msgBtnOk'].onclick(); // Click "Ya, Lanjutkan"

    console.log('state.pauli.isActive after confirm:', state.pauli.isActive);
    console.log('timerId after submit:', state.pauli.timerId);
    console.log('page shown after submit:', pageShown);

    const savedLocal = JSON.parse(storage['hasil_psikotes_local'] || '[]');
    console.log('saved records in localStorage:', savedLocal.length);
    if (savedLocal.length > 0) {
        console.log('saved record details:', JSON.stringify(savedLocal[0], null, 2));
    }

    if (state.pauli.isActive !== false) throw new Error('Expected state.pauli.isActive to be false');
    if (pageShown !== 'page-selesai') throw new Error('Expected pageShown to be page-selesai');
    if (savedLocal.length !== 1) throw new Error('Expected exactly 1 saved record');

    // Step 5: Test duplicate submit prevention
    console.log('\n--- Test Step 5: Duplicate Submit Prevention ---');
    prosesSimpanPauli(false);
    prosesSimpanPauli(true);
    const savedLocalAfterDup = JSON.parse(storage['hasil_psikotes_local'] || '[]');
    console.log('records after duplicate attempts:', savedLocalAfterDup.length);
    if (savedLocalAfterDup.length !== 1) throw new Error('Expected duplicate submissions to be prevented');

    console.log('\n✅ All tests passed successfully!');
    process.exit(0);
}

runTest().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
