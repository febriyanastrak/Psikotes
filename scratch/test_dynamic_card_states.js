const fs = require('fs');

// Mock browser environment
const localStorageStore = {};
global.localStorage = {
    getItem: (k) => localStorageStore[k] || null,
    setItem: (k, v) => { localStorageStore[k] = String(v); },
    removeItem: (k) => { delete localStorageStore[k]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

const elements = {};
function createMockElement(id) {
    return {
        id,
        innerText: '',
        textContent: '',
        innerHTML: '',
        className: '',
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
        },
        disabled: false,
        style: {},
        onclick: null,
        querySelector(selector) {
            return createMockElement('sub-' + selector);
        }
    };
}

global.document = {
    getElementById(id) {
        if (!elements[id]) {
            elements[id] = createMockElement(id);
        }
        return elements[id];
    }
};

global.window = {};

// Load js/ui.js code
const uiCode = fs.readFileSync('js/ui.js', 'utf-8');
eval(uiCode);

console.log('--- TEST SCENARIO 1: ALL MODULES ACTIVE (FRESH STATE) ---');
syncAllModuleCardStates();

const moduleChecklist = [
    { card: 'card-grafis', btn: 'btn-test-grafis', expected: 'Mulai Tes 1' },
    { card: 'card-1', btn: 'btn-test-1', expected: 'Mulai Tes 2' },
    { card: 'card-2', btn: 'btn-test-2', expected: 'Mulai Tes 3' },
    { card: 'card-3', btn: 'btn-test-3', expected: 'Mulai Tes 4' },
    { card: 'card-4', btn: 'btn-test-4', expected: 'Mulai Tes 5' },
    { card: 'card-5', btn: 'btn-test-5', expected: 'Mulai Tes 6' },
    { card: 'card-6', btn: 'btn-test-6', expected: 'Mulai Tes 7' },
    { card: 'card-7', btn: 'btn-test-7', expected: 'Mulai Tes 8' },
    { card: 'card-8', btn: 'btn-test-8', expected: 'Mulai Tes 9' }
];

let activePassed = 0;
moduleChecklist.forEach(m => {
    const btn = document.getElementById(m.btn);
    const ok = btn.innerText === m.expected && !btn.disabled;
    console.log(`[${ok ? 'PASS' : 'FAIL'}] ${m.btn}: '${btn.innerText}', disabled: ${btn.disabled}`);
    if (ok) activePassed++;
});

console.log('\n--- TEST SCENARIO 2: SOME MODULES COMPLETED (MSDT & GRAFIS DONE) ---');
localStorage.setItem('grafis_selesai', 'true');
localStorage.setItem('msdt_selesai', 'true');
syncAllModuleCardStates();

const grafisBtn = document.getElementById('btn-test-grafis');
const msdtBtn = document.getElementById('btn-test-6');
const istBtn = document.getElementById('btn-test-1');

const gOk = grafisBtn.innerText === 'Selesai ✓' && grafisBtn.disabled === true;
console.log(`[${gOk ? 'PASS' : 'FAIL'}] Grafis Done Check: '${grafisBtn.innerText}', disabled: ${grafisBtn.disabled}`);

const mOk = msdtBtn.innerText === 'Selesai ✓' && msdtBtn.disabled === true;
console.log(`[${mOk ? 'PASS' : 'FAIL'}] MSDT Done Check: '${msdtBtn.innerText}', disabled: ${msdtBtn.disabled}`);

const iOk = istBtn.innerText === 'Mulai Tes 2' && istBtn.disabled === false;
console.log(`[${iOk ? 'PASS' : 'FAIL'}] IST Active Check: '${istBtn.innerText}', disabled: ${istBtn.disabled}`);

const total = activePassed + (gOk ? 1 : 0) + (mOk ? 1 : 0) + (iOk ? 1 : 0);
console.log(`\nSIMULATION RESULT: ${total} / 12 CHECKS PASSED`);
if (total === 12) {
    console.log('DOM & LOGIC SIMULATION 100% SUCCESSFUL!');
    process.exit(0);
} else {
    process.exit(1);
}
