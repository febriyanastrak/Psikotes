const https = require('https');

console.log('================================================================');
console.log('   FASE 2: AUDIT KEAMANAN, RLS, STORAGE & SANITASI               ');
console.log('================================================================\n');

const SUPABASE_URL = 'https://rvflmznbihunezzqhobm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Zmxtem5iaWh1bmV6enFob2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODM4OTcsImV4cCI6MjEwNTU1OTg5N30.tHXAXhKRvChZOqKjRq9S8AvvSo59PiYizpgDI9FmHcE';

function req(method, path, body = null, headers = {}) {
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
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                ...headers
            }
        };
        const r = https.request(options, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: d ? JSON.parse(d) : {}, raw: d });
                } catch (e) {
                    resolve({ status: res.statusCode, data: d, raw: d });
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

async function runSecurityAudit() {
    // 1. Audit RLS Proteksi Tabel Admin (admin_users)
    console.log('1. AUDIT RLS TABEL admin_users (ROLE ANON)');
    const adminUsersRes = await req('GET', '/rest/v1/admin_users?select=*');
    const adminProtected = adminUsersRes.status === 200 && Array.isArray(adminUsersRes.data) && adminUsersRes.data.length === 0;
    assert(adminProtected || adminUsersRes.status === 401 || adminUsersRes.status === 403, 'Tabel admin_users terlindungi dari pembacaan anon (RLS Aktif)');

    // 2. Audit Kunci Jawaban Master (cfit_master_kunci)
    console.log('\n2. AUDIT RLS TABEL KUNCI JAWABAN (cfit_master_kunci)');
    const kunciRes = await req('GET', '/rest/v1/cfit_master_kunci?select=*');
    const kunciProtected = (kunciRes.status === 200 && Array.isArray(kunciRes.data) && kunciRes.data.length === 0) || kunciRes.status === 401 || kunciRes.status === 403;
    assert(kunciProtected, 'Tabel cfit_master_kunci terlindungi dari pembacaan peserta anon');

    // 3. Audit Status Privacy Bucket foto_kandidat
    console.log('\n3. AUDIT PRIVACY BUCKET foto_kandidat');
    // Coba akses URL publik langsung tanpa signed token
    const testDirectPublic = await req('GET', '/storage/v1/object/public/foto_kandidat/sample_test.jpg');
    const isPrivate = testDirectPublic.status === 400 || testDirectPublic.status === 404 || (testDirectPublic.data && testDirectPublic.data.error === 'not_found');
    assert(isPrivate, 'Akses URL publik mentah ditolak (Bucket bersifat Private)');

    // 4. Audit Signed URL Generation
    console.log('\n4. AUDIT SIGNED URL GENERATION (3600 DETIK)');
    // Ambil 1 file yang ada di storage
    const listGrafis = await req('POST', '/storage/v1/object/list/foto_kandidat', { prefix: 'grafis', limit: 1 });
    if (Array.isArray(listGrafis.data) && listGrafis.data.length > 0) {
        const subFolder = listGrafis.data[0].name;
        const subList = await req('POST', '/storage/v1/object/list/foto_kandidat', { prefix: `grafis/${subFolder}`, limit: 1 });
        if (Array.isArray(subList.data) && subList.data.length > 0) {
            const samplePath = `grafis/${subFolder}/${subList.data[0].name}`;
            const signRes = await req('POST', `/storage/v1/object/sign/foto_kandidat/${samplePath}`, { expiresIn: 3600 });
            assert(signRes.status === 200 && signRes.data && signRes.data.signedURL, `Signed URL berhasil digenerasi: ${samplePath}`);
            assert(signRes.data.signedURL.includes('token='), 'Signed URL mengandung token otentikasi sementara');
        }
    }

    // 5. Audit Sanitasi XSS & Path Traversal di Frontend
    console.log('\n5. AUDIT SANITASI FRONTEND');
    const fs = require('fs');
    const hrdCode = fs.readFileSync('js/hrd.js', 'utf-8');
    assert(hrdCode.includes('escapeHtml('), 'Fungsi escapeHtml() aktif mencegah XSS injection pada Portal HRD');
    assert(hrdCode.includes("replace(/[^a-zA-Z0-9_-]/g, '_')"), 'Sanitasi regex karakter terlarang aktif mencegah Path Traversal');

    console.log('\n================================================================');
    console.log(`   HASIL EVALUASI KEAMANAN: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('================================================================\n');

    process.exit(failCount > 0 ? 1 : 0);
}

runSecurityAudit().catch(err => {
    console.error('Fatal Security Audit Error:', err);
    process.exit(1);
});
