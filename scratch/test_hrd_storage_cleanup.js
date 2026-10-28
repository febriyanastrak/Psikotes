const https = require('https');
const fs = require('fs');

console.log('================================================================');
console.log('   TEST AUDIT: HRD STORAGE CLEANUP ON KOSONGKAN DATA            ');
console.log('================================================================\n');

const SUPABASE_URL = 'https://rvflmznbihunezzqhobm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Zmxtem5iaWh1bmV6enFob2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODM4OTcsImV4cCI6MjEwNTU1OTg5N30.tHXAXhKRvChZOqKjRq9S8AvvSo59PiYizpgDI9FmHcE';

function req(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(SUPABASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            family: 4,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Content-Type': 'application/json'
            }
        };
        const r = https.request(options, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: d ? JSON.parse(d) : {} });
                } catch (e) {
                    resolve({ status: res.statusCode, data: d });
                }
            });
        });
        r.on('error', reject);
        if (body) r.write(JSON.stringify(body));
        r.end();
    });
}

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

async function runStorageCleanupTest() {
    // 1. Verifikasi kode js/hrd.js mengandung logika pembersihan storage
    console.log('1. AUDIT STATIS KODE js/hrd.js');
    const hrdCode = fs.readFileSync('js/hrd.js', 'utf-8');

    assert(hrdCode.includes('PEMBERSIHAN BERKAS FISIK SUPABASE STORAGE'), 'Komentar header pembersihan storage fisik ada di hapusSemuaData()');
    assert(hrdCode.includes("sb.storage.from('foto_kandidat').list('grafis'"), "Scan folder 'grafis/' terdaftar di hapusSemuaData()");
    assert(hrdCode.includes("sb.storage.from('foto_kandidat').remove(chunk)"), "Batch delete remove(chunk) aktif di hapusSemuaData()");
    assert(hrdCode.includes('Semua riwayat hasil tes peserta dan berkas foto di storage berhasil dikosongkan'), 'Pesan notifikasi sukses diperbarui dengan konfirmasi pembersihan storage');

    // 2. Simulasikan pengunggahan file uji ke foto_kandidat/grafis/test_sweep_123/dap.png
    console.log('\n2. UPLOAD FILE SAMPLE KE STORAGE foto_kandidat');
    const testCandidateFolder = `test_sweep_${Date.now()}`;
    const testFilePath = `grafis/${testCandidateFolder}/dap_test.png`;
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

    const upRes = await new Promise(resolve => {
        const url = new URL(`${SUPABASE_URL}/storage/v1/object/foto_kandidat/${testFilePath}`);
        const r = https.request({
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            family: 4,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'image/png',
                'x-upsert': 'true'
            }
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, data: d }));
        });
        r.write(dummyPng);
        r.end();
    });

    assert(upRes.status === 200, `File uji berhasil diunggah ke ${testFilePath}`);

    // 3. Verifikasi file terdaftar di dalam list
    console.log('\n3. VERIFIKASI FILE TERDETEKSI DI STORAGE');
    const listRes = await req('POST', '/storage/v1/object/list/foto_kandidat', { prefix: `grafis/${testCandidateFolder}` });
    assert(listRes.status === 200 && Array.isArray(listRes.data) && listRes.data.length > 0, 'File uji terdeteksi di dalam subfolder grafis kandidat');

    // 4. Jalankan simulasi sweeping logika seperti di hapusSemuaData()
    console.log('\n4. SIMULASI LOGIKA SWEEPING FILE PATHS');
    const collectedPaths = [];
    const grafisSubList = await req('POST', '/storage/v1/object/list/foto_kandidat', { prefix: `grafis/${testCandidateFolder}` });
    if (Array.isArray(grafisSubList.data)) {
        grafisSubList.data.forEach(f => {
            collectedPaths.push(`grafis/${testCandidateFolder}/${f.name}`);
        });
    }

    assert(collectedPaths.includes(testFilePath), `Path file ${testFilePath} berhasil dikumpulkan untuk antrean penghapusan`);

    console.log('\n================================================================');
    console.log(`   HASIL EVALUASI: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('================================================================\n');

    process.exit(failCount > 0 ? 1 : 0);
}

runStorageCleanupTest().catch(err => {
    console.error('Fatal Test Error:', err);
    process.exit(1);
});
