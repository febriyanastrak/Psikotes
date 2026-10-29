const fs = require('fs');

// Test all CFIT generated loops
const cfitLoops = [
    { subtest: 1, count: 13, prefix: 'subtes 1-' },
    { subtest: 2, count: 14, prefix: 'subtes 2-' },
    { subtest: 3, count: 13, prefix: 'subtes 3-' },
    { subtest: 4, count: 10, prefix: 'subtes 4-' }
];

const missingCFIT = [];
for (const sub of cfitLoops) {
    for (let i = 1; i <= sub.count; i++) {
        const file1 = `assets/cfit/subtes_${sub.subtest}/${sub.prefix}${i}.png`;
        const file2 = `assets/cfit/subtes_${sub.subtest}/${sub.prefix} ${i}.png`;
        const exists = fs.existsSync(file1) || fs.existsSync(file2);
        if (!exists) {
            missingCFIT.push({ subtest: sub.subtest, question: i, file1, file2 });
        }
    }
}

console.log('CFIT Generated Assets missing count:', missingCFIT.length);
if (missingCFIT.length) console.log('Details:', missingCFIT);

// Also check logo & avatar assets
const otherAssets = [
    'assets/logo/logo altrak.jpeg',
    'assets/logo/logo%20altrak.jpeg'
];
for (const a of otherAssets) {
    console.log(a, 'exists?', fs.existsSync(decodeURIComponent(a)));
}
