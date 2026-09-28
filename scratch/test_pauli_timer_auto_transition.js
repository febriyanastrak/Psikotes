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

console.log('=== TEST AUTO-TRANSITION ON TIMER EXPIRY ===\n');

// Test A: Trial mode 30s expiry automatically triggers startPauliTest()
console.log('--- Test A: Trial Mode Expiry (finishPauliTest(true)) ---');
startTrialPauliTest();
console.log('Before expiry -> isTrialMode:', isTrialMode, 'state.pauli.isActive:', state.pauli.isActive);
if (!isTrialMode) throw new Error('Expected isTrialMode to be true');

// Simulate 30s running out
finishPauliTest(true);

console.log('After trial expiry -> isTrialMode:', isTrialMode);
console.log('trialCompleted:', trialCompleted);
console.log('modal visible:', !elements['modal-message'].classList.contains('hide-section'));
console.log('modal title:', elements['msgTitle'].innerText);
console.log('modal button:', elements['msgBtnOk'].innerText);

if (elements['msgTitle'].innerText !== 'Waktu Percobaan Selesai') {
    throw new Error('Expected modal title to be Waktu Percobaan Selesai');
}
if (elements['msgBtnOk'].innerText !== 'Lanjut ke Tes Pauli') {
    throw new Error('Expected button to be Lanjut ke Tes Pauli');
}

// User clicks continue
elements['msgBtnOk'].onclick();

console.log('state.pauli.isActive after clicking continue:', state.pauli.isActive);
console.log('state.pauli.timeLeft (real test started):', state.pauli.timeLeft);
console.log('Submit button text:', elements['pauliSubmitBtnText'].innerText);

if (state.pauli.isActive !== true) throw new Error('Expected real Pauli test to be active');
if (state.pauli.timeLeft !== 3600) throw new Error('Expected 3600s for real test');
if (elements['pauliSubmitBtnText'].innerText !== 'Kumpulkan Hasil Tes') {
    throw new Error('Expected submit button text to be Kumpulkan Hasil Tes');
}
console.log('✅ Trial timer expiry shows modal notification and candidate clicks continue to start real Pauli test!\n');

// Test B: Real test timer expiry automatically triggers finish/submit to page-selesai
console.log('--- Test B: Real Test Expiry (finishPauliTest(true)) ---');
const storage = {};
global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = v; }
};
global.window.localStorage = global.localStorage;

let pageShown = null;
global.showPage = (p) => { pageShown = p; };
global.tampilkanHalamanSelesai = () => { global.showPage('page-selesai'); };

// Simulate answering 2 questions
handlePauliInput(2);
handlePauliInput(6);

// Simulate real test timer hitting 0
finishPauliTest(true);

console.log('After real test expiry -> state.pauli.isActive:', state.pauli.isActive);
console.log('pageShown:', pageShown);
const saved = JSON.parse(storage['hasil_psikotes_local'] || '[]');
console.log('Saved records in localStorage:', saved.length);

if (state.pauli.isActive !== false) throw new Error('Expected state.pauli.isActive to be false');
if (pageShown !== 'page-selesai') throw new Error('Expected pageShown to be page-selesai');
if (saved.length !== 1) throw new Error('Expected 1 saved record');

console.log('\n🎉 ALL AUTO-TRANSITIONS WORK FLAWLESSLY! When trial runs out, it directly enters the real test. When real test runs out, it directly submits to page-selesai!');
