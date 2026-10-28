const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');

// Check static buttons in index.html
const expected = [
    { id: 'btn-test-grafis', expectedText: 'Mulai Tes 1' },
    { id: 'btn-test-1', expectedText: 'Mulai Tes 2' },
    { id: 'btn-test-2', expectedText: 'Mulai Tes 3' },
    { id: 'btn-test-3', expectedText: 'Mulai Tes 4' },
    { id: 'btn-test-4', expectedText: 'Mulai Tes 5' },
    { id: 'btn-test-5', expectedText: 'Mulai Tes 6' },
    { id: 'btn-test-6', expectedText: 'Mulai Tes 7' },
    { id: 'btn-test-7', expectedText: 'Mulai Tes 8' },
    { id: 'btn-test-8', expectedText: 'Mulai Tes 9' }
];

console.log('--- AUDIT STATIC BUTTONS IN index.html ---');
let htmlPassed = 0;
expected.forEach(item => {
    const regex = new RegExp(`id="${item.id}"[^>]*>([^<]+)</button>`);
    const match = html.match(regex);
    if (match) {
        const actual = match[1].trim();
        const ok = actual === item.expectedText;
        console.log(`[${ok ? 'PASS' : 'FAIL'}] #${item.id}: '${actual}' (expected: '${item.expectedText}')`);
        if (ok) htmlPassed++;
    } else {
        console.log(`[FAIL] #${item.id} not found in index.html`);
    }
});

console.log('\n--- AUDIT ALL_ASSESSMENT_MODULES IN js/ui.js ---');
const uiCode = fs.readFileSync('js/ui.js', 'utf-8');
const expectedModules = [
    { id: 'grafis', expectedBtnText: 'Mulai Tes 1' },
    { id: 1, expectedBtnText: 'Mulai Tes 2' },
    { id: 2, expectedBtnText: 'Mulai Tes 3' },
    { id: 3, expectedBtnText: 'Mulai Tes 4' },
    { id: 4, expectedBtnText: 'Mulai Tes 5' },
    { id: 5, expectedBtnText: 'Mulai Tes 6' },
    { id: 6, expectedBtnText: 'Mulai Tes 7' },
    { id: 7, expectedBtnText: 'Mulai Tes 8' },
    { id: 8, expectedBtnText: 'Mulai Tes 9' }
];

let jsPassed = 0;
expectedModules.forEach(em => {
    const reg = new RegExp(`id:\\s*['"]?${em.id}['"]?[^}]+btnText:\\s*['"]([^'"]+)['"]`);
    const m = uiCode.match(reg);
    if (m) {
        const actual = m[1].trim();
        const ok = actual === em.expectedBtnText;
        console.log(`[${ok ? 'PASS' : 'FAIL'}] Module ${em.id}: '${actual}' (expected: '${em.expectedBtnText}')`);
        if (ok) jsPassed++;
    } else {
        console.log(`[FAIL] Module ${em.id} btnText not found`);
    }
});

console.log(`\nTOTAL: ${htmlPassed + jsPassed} / 18 PASSED`);
if (htmlPassed + jsPassed === 18) {
    console.log('ALL TESTS PASSED 100%!');
    process.exit(0);
} else {
    process.exit(1);
}
