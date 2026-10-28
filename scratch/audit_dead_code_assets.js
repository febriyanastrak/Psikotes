const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   FASE 1: AUDIT FILE, ASSETS, DAN DEAD CODE                    ');
console.log('================================================================\n');

const indexHtml = fs.readFileSync('index.html', 'utf-8');
const hrdHtml = fs.readFileSync('hrd.html', 'utf-8');
const combinedHtml = indexHtml + '\n' + hrdHtml;

// 1. Audit Script JS yang dimuat di HTML
console.log('1. AUDIT FILE JAVASCRIPT DI js/ DAN js/data/');
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js')).map(f => `js/${f}`);
const dataFiles = fs.readdirSync('js/data').filter(f => f.endsWith('.js')).map(f => `js/data/${f}`);
const allJsFiles = [...jsFiles, ...dataFiles];

const unreferencedJs = [];
allJsFiles.forEach(f => {
    const base = path.basename(f);
    if (!combinedHtml.includes(f) && !combinedHtml.includes(base)) {
        // Cek apakah di-require atau di-load dinamis oleh JS lain
        let referencedInJs = false;
        allJsFiles.forEach(other => {
            if (other !== f) {
                const content = fs.readFileSync(other, 'utf-8');
                if (content.includes(base)) referencedInJs = true;
            }
        });
        if (!referencedInJs) {
            unreferencedJs.push(f);
        }
    }
});

console.log(`Total file JS diperiksa: ${allJsFiles.length}`);
if (unreferencedJs.length > 0) {
    console.log(`Peringatan: Ditemukan ${unreferencedJs.length} file JS yang tidak direferensikan langsung di index/hrd HTML:`);
    unreferencedJs.forEach(f => console.log(`  - ${f}`));
} else {
    console.log('✓ Seluruh file JS terdaftar dan aktif direferensikan di index.html atau hrd.html.');
}

// 2. Audit File Assets
console.log('\n2. AUDIT ASSETS DI assets/');
let assetFiles = [];
if (fs.existsSync('assets')) {
    function walkDir(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walkDir(fullPath);
            } else {
                assetFiles.push(fullPath.replace(/\\/g, '/'));
            }
        });
    }
    walkDir('assets');
}

console.log(`Total aset diperiksa: ${assetFiles.length}`);
const unreferencedAssets = [];
const allJsContent = allJsFiles.map(f => fs.readFileSync(f, 'utf-8')).join('\n');
const allSource = combinedHtml + '\n' + allJsContent;

assetFiles.forEach(a => {
    const base = path.basename(a);
    if (!allSource.includes(a) && !allSource.includes(base)) {
        unreferencedAssets.push(a);
    }
});

if (unreferencedAssets.length > 0) {
    console.log(`Ditemukan ${unreferencedAssets.length} aset yang tidak dipanggil langsung:`);
    unreferencedAssets.slice(0, 10).forEach(a => console.log(`  - ${a}`));
    if (unreferencedAssets.length > 10) console.log(`  ... dan ${unreferencedAssets.length - 10} lainnya.`);
} else {
    console.log('✓ Seluruh aset di folder assets/ terintegrasi dengan kode aplikasi.');
}

// 3. Audit File di Scratch (File Uji & Analisis Sementara)
console.log('\n3. AUDIT DIREKTORI SCRATCH/ (ARTIFAK SEMENTARA)');
if (fs.existsSync('scratch')) {
    const scratchFiles = fs.readdirSync('scratch');
    console.log(`Ditemukan ${scratchFiles.length} file pengujian/verifikasi sementara di scratch/:`);
    scratchFiles.forEach(f => console.log(`  - scratch/${f}`));
    console.log('Catatan: File di scratch/ adalah skrip bot & pengujian internal, aman untuk diarsipkan saat rilis produksi.');
}
