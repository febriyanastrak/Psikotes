const fs = require('fs');
const path = require('path');

console.log('=== VERIFIKASI MULTI-UPLOAD TES GRAFIS (MAKS 2/TES, TOTAL 6 BERKAS) ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`[PASS] ${message}`);
        passCount++;
    } else {
        console.error(`[FAIL] ${message}`);
        failCount++;
    }
}

// 1. Audit DOM index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
assert(indexHtml.includes('id="dropzone-dap-1"'), 'index.html memiliki #dropzone-dap-1');
assert(indexHtml.includes('id="dropzone-dap-2"'), 'index.html memiliki #dropzone-dap-2');
assert(indexHtml.includes('id="dropzone-tree-1"'), 'index.html memiliki #dropzone-tree-1');
assert(indexHtml.includes('id="dropzone-tree-2"'), 'index.html memiliki #dropzone-tree-2');
assert(indexHtml.includes('id="dropzone-htp-1"'), 'index.html memiliki #dropzone-htp-1');
assert(indexHtml.includes('id="dropzone-htp-2"'), 'index.html memiliki #dropzone-htp-2');

assert(indexHtml.includes('id="file-input-dap-1"'), 'index.html memiliki #file-input-dap-1');
assert(indexHtml.includes('id="file-input-dap-2"'), 'index.html memiliki #file-input-dap-2');
assert(indexHtml.includes('id="file-input-tree-1"'), 'index.html memiliki #file-input-tree-1');
assert(indexHtml.includes('id="file-input-tree-2"'), 'index.html memiliki #file-input-tree-2');
assert(indexHtml.includes('id="file-input-htp-1"'), 'index.html memiliki #file-input-htp-1');
assert(indexHtml.includes('id="file-input-htp-2"'), 'index.html memiliki #file-input-htp-2');

assert(indexHtml.includes('id="preview-container-dap-1"'), 'index.html memiliki #preview-container-dap-1');
assert(indexHtml.includes('id="preview-container-dap-2"'), 'index.html memiliki #preview-container-dap-2');
assert(indexHtml.includes('id="status-badge-dap-1"'), 'index.html memiliki #status-badge-dap-1');
assert(indexHtml.includes('id="status-badge-dap-2"'), 'index.html memiliki #status-badge-dap-2');
assert(indexHtml.includes('hapusBerkasSlot(\'dap\', 1)'), 'index.html memiliki hapusBerkasSlot(\'dap\', 1)');
assert(indexHtml.includes('hapusBerkasSlot(\'dap\', 2)'), 'index.html memiliki hapusBerkasSlot(\'dap\', 2)');

// 2. Audit js/grafis.js
const grafisJs = fs.readFileSync(path.join(__dirname, '../js/grafis.js'), 'utf8');
assert(grafisJs.includes('dap: [createEmptySlot(), createEmptySlot()]'), 'js/grafis.js menginisialisasi 2 sub-slot per kategori');
assert(grafisJs.includes('function tanganiFileTerpilih(slot, subIndex, file)'), 'js/grafis.js tanganiFileTerpilih menerima slot dan subIndex');
assert(grafisJs.includes('function hapusBerkasSlot(slot, subIndex)'), 'js/grafis.js hapusBerkasSlot menerima slot dan subIndex');
assert(grafisJs.includes('isComplete = hasDap && hasTree && hasHtp'), 'js/grafis.js memvalidasi kelengkapan minimal 1 berkas per kategori');
assert(grafisJs.includes('total_berkas: totalCount'), 'js/grafis.js menghitung total_berkas hingga 6');

// 3. Audit hrd.html
const hrdHtml = fs.readFileSync(path.join(__dirname, '../hrd.html'), 'utf8');
assert(hrdHtml.includes('id="panelTabGrafis"'), 'hrd.html memiliki #panelTabGrafis');
assert(hrdHtml.includes('id="grafisRptTotal"'), 'hrd.html memiliki #grafisRptTotal');
assert(hrdHtml.includes('id="grafisRptPosisi"'), 'hrd.html memiliki #grafisRptPosisi');
assert(hrdHtml.includes('id="grafisRptWaktu"'), 'hrd.html memiliki #grafisRptWaktu');
assert(hrdHtml.includes('id="hrdGrafisGridContainer"'), 'hrd.html memiliki #hrdGrafisGridContainer');

// 4. Audit js/hrd.js
const hrdJs = fs.readFileSync(path.join(__dirname, '../js/hrd.js'), 'utf8');
assert(hrdJs.includes('function extractFilesFromCategory'), 'js/hrd.js memiliki helper extractFilesFromCategory');
assert(hrdJs.includes('bukaLightboxGrafis(\'${slot.key}\', ${subIdx})'), 'js/hrd.js memanggil bukaLightboxGrafis dengan slot dan subIdx');
assert(hrdJs.includes('unduhBerkasGrafis(\'${slot.key}\', ${subIdx})'), 'js/hrd.js memanggil unduhBerkasGrafis dengan slot dan subIdx');
assert(hrdJs.includes('downloadFileName = `${prefix}_${subIndex}_${cleanCandName}.${ext}`'), 'js/hrd.js menghasilkan penamaan download DAP_1, DAP_2, dsb.');

// 5. Audit css/style.css print rules
const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
assert(styleCss.includes('.grafis-test-block'), 'css/style.css memiliki styling .grafis-test-block');
assert(styleCss.includes('#grafisPrintPage_dap'), 'css/style.css memiliki #grafisPrintPage_dap page break');
assert(styleCss.includes('#grafisPrintPage_tree'), 'css/style.css memiliki #grafisPrintPage_tree page break');
assert(styleCss.includes('max-height: 110mm !important;'), 'css/style.css membatasi max-height gambar grafis saat dicetak');
assert(styleCss.includes('object-fit: contain !important;'), 'css/style.css menjaga proporsi gambar grafis saat dicetak');
assert(styleCss.includes('.grafis-print-notes'), 'css/style.css memiliki styling kolom catatan observasi');

console.log(`\nHASIL: ${passCount} PASSED, ${failCount} FAILED`);
process.exit(failCount > 0 ? 1 : 0);
