const fs = require('fs');
const vm = require('vm');

// Setup mock DOM environment
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

const windowListeners = {};
global.window = {
    scrollTo: () => {},
    addEventListener: (event, handler, options) => {
        if (!windowListeners[event]) windowListeners[event] = [];
        windowListeners[event].push({ handler, options });
    }
};

global.document = {
    getElementById: (id) => elements[id] || null,
    querySelectorAll: () => [],
    addEventListener: (event, handler) => {
        if (!windowListeners[event]) windowListeners[event] = [];
        windowListeners[event].push({ handler });
    }
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

// Load application scripts
['js/config.js', 'js/pauli-data.js', 'js/state.js', 'js/ui.js', 'js/pauli.js'].forEach(file => {
    vm.runInThisContext(fs.readFileSync(file, 'utf8'));
});

async function runTests() {
    console.log('=== STARTING PAULI INPUT & CAMERA TEST ===\n');

    // 1. Verify Camera is disabled on start
    console.log('--- Test 1: startPauliTest() & Camera Status ---');
    trialCompleted = true; // Trial required before real test
    startPauliTest();
    
    const camContainer = elements['proctoring-camera-container'];
    console.log('Camera container display:', camContainer.style.display);
    console.log('Camera container classes:', Array.from(camContainer.classList.classes));
    if (camContainer.style.display !== 'none') {
        throw new Error('Expected camera container display to be none');
    }
    if (proctoringStream !== null) {
        throw new Error('Expected proctoringStream to be null');
    }
    console.log('✅ Camera is completely off and hidden!\n');

    // 2. Check Initial Numbers in Boxes
    console.log('--- Test 2: Check Initial Boxes ---');
    console.log('pBox1:', elements['pBox1'].innerText);
    console.log('pBox2 (top active):', elements['pBox2'].innerText);
    console.log('pBox3 (bottom active):', elements['pBox3'].innerText);
    console.log('pBox4:', elements['pBox4'].innerText);

    const b2 = parseInt(elements['pBox2'].innerText, 10);
    const b3 = parseInt(elements['pBox3'].innerText, 10);
    const expectedUnit = (b2 + b3) % 10;
    console.log(`Sum: ${b2} + ${b3} = ${b2 + b3}, Expected unit: ${expectedUnit}`);

    // 3. Test handlePauliInput(expectedUnit)
    console.log('\n--- Test 3: Inputting correct answer via handlePauliInput ---');
    handlePauliInput(expectedUnit);
    console.log('mainAnswerBox immediately after input:', elements['mainAnswerBox'].innerText);
    if (elements['mainAnswerBox'].innerText != expectedUnit) {
        throw new Error(`Expected mainAnswerBox to be ${expectedUnit}`);
    }

    // Wait 100ms for transition
    await new Promise(r => setTimeout(r, 100));

    console.log('mainAnswerBox after transition:', elements['mainAnswerBox'].innerText);
    console.log('historyAnswer after transition:', elements['historyAnswer'].innerText);
    console.log('totalAnswered:', state.pauli.totalAnswered);
    console.log('correct:', state.pauli.correct);
    console.log('isProcessing after transition:', isProcessing);

    if (elements['historyAnswer'].innerText != expectedUnit) {
        throw new Error(`Expected historyAnswer to be ${expectedUnit}`);
    }
    if (state.pauli.totalAnswered !== 1) {
        throw new Error('Expected totalAnswered to be 1');
    }
    if (state.pauli.correct !== 1) {
        throw new Error('Expected correct to be 1');
    }
    if (isProcessing !== false) {
        throw new Error('Expected isProcessing to be false');
    }
    console.log('✅ First input successfully handled!\n');

    // 4. Test Keyboard / Numpad Keydown Listener
    console.log('--- Test 4: Keyboard & Numpad Keydown Listener ---');
    const nextB2 = parseInt(elements['pBox2'].innerText, 10);
    const nextB3 = parseInt(elements['pBox3'].innerText, 10);
    const nextUnit = (nextB2 + nextB3) % 10;
    console.log(`Next boxes: ${nextB2} and ${nextB3}, sum unit: ${nextUnit}`);

    // Trigger keydown with Numpad code
    const keydownListeners = windowListeners['keydown'] || [];
    console.log(`Found ${keydownListeners.length} keydown listeners.`);
    
    let defaultPrevented = false;
    let propStopped = false;
    const fakeEvent = {
        key: nextUnit.toString(),
        code: `Numpad${nextUnit}`,
        preventDefault: () => { defaultPrevented = true; },
        stopPropagation: () => { propStopped = true; }
    };

    for (const listenerObj of keydownListeners) {
        listenerObj.handler(fakeEvent);
    }

    console.log('mainAnswerBox immediately after Numpad keydown:', elements['mainAnswerBox'].innerText);
    if (elements['mainAnswerBox'].innerText != nextUnit) {
        throw new Error(`Expected mainAnswerBox to be ${nextUnit} from keydown`);
    }

    await new Promise(r => setTimeout(r, 100));
    console.log('historyAnswer after second transition:', elements['historyAnswer'].innerText);
    console.log('totalAnswered:', state.pauli.totalAnswered);
    console.log('correct:', state.pauli.correct);
    if (state.pauli.totalAnswered !== 2) {
        throw new Error('Expected totalAnswered to be 2');
    }
    console.log('✅ Numpad keyboard input successfully handled!\n');

    // 5. Test Watchdog Auto-Reset
    console.log('--- Test 5: Watchdog Auto-Reset if isProcessing got stuck ---');
    isProcessing = true;
    window._lastPauliProcessTime = Date.now() - 500; // 500ms ago

    // Now input should still be accepted because watchdog resets isProcessing
    handlePauliInput(0);
    console.log('mainAnswerBox after watchdog recovery input:', elements['mainAnswerBox'].innerText);
    if (String(elements['mainAnswerBox'].innerText) !== '0') {
        throw new Error('Expected watchdog to allow input');
    }
    await new Promise(r => setTimeout(r, 100));
    console.log('✅ Watchdog successfully prevented input freeze!\n');

    // 6. Test Submit
    console.log('--- Test 6: Submit Pauli Test ---');
    const storage = {};
    global.localStorage = {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = v; }
    };
    global.window.localStorage = global.localStorage;
    let pageShown = null;
    global.showPage = (p) => { pageShown = p; };
    global.tampilkanHalamanSelesai = () => { global.showPage('page-selesai'); };

    elements['pauliSubmitBtn'].onclick();
    // Konfirmasi modal pengumpulan manual
    if (elements['msgBtnOk'] && typeof elements['msgBtnOk'].onclick === 'function') {
        elements['msgBtnOk'].onclick();
    }
    console.log('state.pauli.isActive after submit:', state.pauli.isActive);
    console.log('page shown after submit:', pageShown);
    const saved = JSON.parse(storage['hasil_psikotes_local'] || '[]');
    console.log('Records saved to localStorage:', saved.length);
    if (saved.length > 0) {
        console.log('Saved payload summary:', {
            totalPauli: saved[0]['Total Pauli'],
            correct: saved[0]['Jawaban Benar'],
            wrong: saved[0]['Jawaban Salah']
        });
    }

    if (state.pauli.isActive !== false) throw new Error('Expected state.pauli.isActive to be false');
    if (pageShown !== 'page-selesai') throw new Error('Expected pageShown to be page-selesai');
    if (saved.length !== 1) throw new Error('Expected 1 saved record');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Camera is off, input is fully functional and responsive via keypad & keyboard, and submit works instantly!');
}

runTests().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
