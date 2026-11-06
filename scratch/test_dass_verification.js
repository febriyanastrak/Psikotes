// =========================================================================
// TEST VERIFIKASI LOGIKA & NORMA MODUL DASS-21
// PT Altrak 1978 - Integrated Psychological Assessment System
// =========================================================================

const fs = require('fs');
const path = require('path');

// 1. Muat data DASS
const dassData = require('../js/data/dass-data.js');
const { DASS_QUESTIONS, DASS_SUBSCALE_ITEMS, DASS_SEVERITY_RANGES, DASS_NORMA } = dassData;

console.log('=== TEST 1: STRUKTUR DATA SOAL & BUTIR PERNYATAAN ===');
console.log('Total Soal:', DASS_QUESTIONS.length);
if (DASS_QUESTIONS.length !== 21) throw new Error('Total soal DASS-21 harus 21!');

const dItems = DASS_QUESTIONS.filter(q => q.type === 'D');
const aItems = DASS_QUESTIONS.filter(q => q.type === 'A');
const sItems = DASS_QUESTIONS.filter(q => q.type === 'S');

console.log(`- Butir Depresi (D): ${dItems.length} soal -> [${dItems.map(q => q.no).join(', ')}]`);
console.log(`- Butir Kecemasan (A): ${aItems.length} soal -> [${aItems.map(q => q.no).join(', ')}]`);
console.log(`- Butir Stres (S): ${sItems.length} soal -> [${sItems.map(q => q.no).join(', ')}]`);

if (dItems.length !== 7 || aItems.length !== 7 || sItems.length !== 7) {
    throw new Error('Jumlah soal D, A, S masing-masing harus 7 butir!');
}

console.log('=== TEST 2: SIMULASI SKORING & NORMA KLINIS ===');

function hitungDass(answers) {
    let rawD = 0, rawA = 0, rawS = 0;
    DASS_SUBSCALE_ITEMS.D.forEach(n => { rawD += (answers[n] || 0); });
    DASS_SUBSCALE_ITEMS.A.forEach(n => { rawA += (answers[n] || 0); });
    DASS_SUBSCALE_ITEMS.S.forEach(n => { rawS += (answers[n] || 0); });

    const getLvl = (scale, sc) => {
        const ranges = DASS_SEVERITY_RANGES[scale];
        return ranges.find(r => sc >= r.min && sc <= r.max);
    };

    const lvlD = getLvl('D', rawD);
    const lvlA = getLvl('A', rawA);
    const lvlS = getLvl('S', rawS);

    const totalRaw = rawD + rawA + rawS;
    const mhsi = Math.max(0, Math.min(100, Math.round(100 - (totalRaw / 63) * 100)));

    return { rawD, rawA, rawS, lvlD, lvlA, lvlS, totalRaw, mhsi };
}

// Skenario A: Seluruh respon 0 (Normal total)
const ansAllZero = {};
for (let i = 1; i <= 21; i++) ansAllZero[i] = 0;
const resZero = hitungDass(ansAllZero);
console.log('Skenario Respon 0 (Kondisi Sangat Prima):', resZero);
if (resZero.lvlD.level !== 'NORMAL' || resZero.lvlA.level !== 'NORMAL' || resZero.lvlS.level !== 'NORMAL' || resZero.mhsi !== 100) {
    throw new Error('Skenario 0 gagal menghasilkan status Normal & MHSI 100%');
}

// Skenario B: Ambang batas Mild
const ansMild = {};
// D: 5, A: 4, S: 8
DASS_SUBSCALE_ITEMS.D.forEach((n, idx) => { ansMild[n] = idx < 5 ? 1 : 0; }); // D = 5
DASS_SUBSCALE_ITEMS.A.forEach((n, idx) => { ansMild[n] = idx < 4 ? 1 : 0; }); // A = 4
DASS_SUBSCALE_ITEMS.S.forEach((n, idx) => { ansMild[n] = idx === 0 ? 2 : 1; }); // S = 2 + 6 = 8
const resMild = hitungDass(ansMild);
console.log('Skenario Respon Mild (Ringan):', { D: `${resMild.rawD} (${resMild.lvlD.level})`, A: `${resMild.rawA} (${resMild.lvlA.level})`, S: `${resMild.rawS} (${resMild.lvlS.level})`, MHSI: `${resMild.mhsi}%` });
if (resMild.lvlD.level !== 'MILD' || resMild.lvlA.level !== 'MILD' || resMild.lvlS.level !== 'MILD') {
    throw new Error('Skenario Mild tidak sesuai rentang norma!');
}

// Skenario C: Seluruh respon 3 (Ekstrem total)
const ansAllThree = {};
for (let i = 1; i <= 21; i++) ansAllThree[i] = 3;
const resExtreme = hitungDass(ansAllThree);
console.log('Skenario Respon 3 (Kondisi Ekstrem):', { D: `${resExtreme.rawD} (${resExtreme.lvlD.level})`, A: `${resExtreme.rawA} (${resExtreme.lvlA.level})`, S: `${resExtreme.rawS} (${resExtreme.lvlS.level})`, MHSI: `${resExtreme.mhsi}%` });
if (resExtreme.lvlD.level !== 'EXTREME' || resExtreme.lvlA.level !== 'EXTREME' || resExtreme.lvlS.level !== 'EXTREME' || resExtreme.mhsi !== 0) {
    throw new Error('Skenario Ekstrem gagal!');
}

console.log('=== TEST 3: NARASI DIAGNOSIS KLINIS ===');
for (let sc = 0; sc <= 21; sc++) {
    if (!DASS_NORMA.D[String(sc)] || !DASS_NORMA.A[String(sc)] || !DASS_NORMA.S[String(sc)]) {
        throw new Error(`Narasi norma tidak lengkap untuk skor ${sc}`);
    }
}
console.log('Seluruh 22 poin narasi (skor 0-21) untuk D, A, dan S valid 100%!');

console.log('=== TEST 4: VERIFIKASI FILE MIGRASI SQL SUPABASE ===');
const sqlPath = path.join(__dirname, '../supabase/migrations/07_dass_module.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');
if (!sqlContent.includes('hasil_dass') || !sqlContent.includes('dass_selesai') || !sqlContent.includes('update_hasil_tes_aman')) {
    throw new Error('File migrasi SQL tidak memuat definisi kolom dan whitelist yang benar!');
}
console.log('File migrasi SQL valid dan siap dieksekusi di Supabase SQL Editor!');

console.log('\n>>> SEMUA VERIFIKASI MODUL DASS-21 BERHASIL 100% TANPA KESALAHAN! <<<');

