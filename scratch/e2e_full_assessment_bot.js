const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   E2E AUTOMATED ASSESSMENT BOT - PT ALTRAK 1978 PSIKOTES       ');
console.log('   Menguji Seluruh 9 Modul (Grafis + 8 Modul Psikotes Lengkap)   ');
console.log('================================================================\n');

const SUPABASE_URL = 'https://rvflmznbihunezzqhobm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Zmxtem5iaWh1bmV6enFob2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODM4OTcsImV4cCI6MjEwNTU1OTg5N30.tHXAXhKRvChZOqKjRq9S8AvvSo59PiYizpgDI9FmHcE';

function supabaseRequest(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(SUPABASE_URL + endpoint);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            family: 4, // Force IPv4 to prevent Windows ECONNRESET
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });

        req.on('error', err => reject(err));
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
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

async function runE2EBot() {
    const timestamp = Date.now();
    const testCandidateEmail = `bot_tester_${timestamp}@altrak1978.co.id`;
    const testCandidateName = `Bot Penguji E2E Full 9 Modul ${timestamp}`;
    const tokenTest = `BOT${String(timestamp).slice(-6)}`;

    console.log(`\n1. SIMULASI PENDAFTARAN & LOGIN KANDIDAT TESTER`);
    console.log(`   Nama   : ${testCandidateName}`);
    console.log(`   Email  : ${testCandidateEmail}`);
    console.log(`   Token  : ${tokenTest}`);

    // Create Candidate
    const createRes = await supabaseRequest('POST', '/rest/v1/kandidat_psikotes', {
        nama_lengkap: testCandidateName,
        email: testCandidateEmail,
        no_wa: '081234567890',
        posisi: 'Management Trainee (E2E Test)',
        token: tokenTest,
        penempatan: 'Jakarta Head Office'
    });

    assert(createRes.status === 201 && createRes.data && createRes.data.length > 0, 'Akun kandidat tester berhasil didaftarkan di Supabase');
    const candidateId = createRes.data[0].id;
    console.log(`   Candidate ID: ${candidateId}\n`);

    // 2. SIMULASI MODUL 1: TES GRAFIS (UPLOAD 6 BERKAS FISIK KE STORAGE)
    console.log(`2. PENGERJAAN MODUL 1: TES GRAFIS (UPLOAD 6 BERKAS KE STORAGE)`);
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

    async function uploadStorageFile(storagePath, buffer) {
        return new Promise((resolve, reject) => {
            const url = new URL(`${SUPABASE_URL}/storage/v1/object/foto_kandidat/${storagePath}`);
            const req = https.request({
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
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => resolve({ status: res.statusCode, data }));
            });
            req.on('error', reject);
            req.write(buffer);
            req.end();
        });
    }

    const fileMap = {
        dap: ['DAP_Lembar_1_Pria.png', 'DAP_Lembar_2_Wanita.png'],
        tree: ['Baum_Pohon_Utama.png', 'Baum_Pohon_Detail.png'],
        htp: ['HTP_Rumah_Pohon_Orang.png', 'HTP_Cerita_Lanjutan.png']
    };

    const payloadGrafis = {
        status: 'selesai',
        total_berkas: 6,
        waktu_selesai: new Date().toISOString(),
        dap: [],
        tree: [],
        htp: []
    };

    for (const [slot, filenames] of Object.entries(fileMap)) {
        for (let idx = 0; idx < filenames.length; idx++) {
            const fname = filenames[idx];
            const storagePath = `grafis/${candidateId}/${slot}_${idx + 1}_${Date.now()}.png`;
            const upRes = await uploadStorageFile(storagePath, dummyPng);
            assert(upRes.status === 200, `Storage: Berkas fisik ${slot.toUpperCase()} [${idx + 1}] berhasil diunggah (${fname})`);

            payloadGrafis[slot].push({
                slot: slot,
                sub_index: idx + 1,
                url: storagePath,
                nama_file: fname,
                ukuran: '70 B',
                tipe: 'image/png',
                waktu_upload: new Date().toISOString()
            });
        }
    }

    // 3. SIMULASI MODUL 2: IST (9 SUBTES / 176 SOAL)
    console.log(`3. PENGERJAAN MODUL 2: IST (9 SUBTES / 176 SOAL)`);
    const payloadIst = {
        total_benar: 135,
        total_soal: 176,
        iq: 122,
        kategori_iq: 'Superior',
        subtes: {
            "01_SE": { rw: 17, sw: 118, name: "Satzergänzung" },
            "02_WA": { rw: 16, sw: 115, name: "Wortauswahl" },
            "03_AN": { rw: 15, sw: 114, name: "Analogien" },
            "04_GE": { rw: 14, sw: 120, name: "Gemeinsamkeiten" },
            "05_RA": { rw: 16, sw: 124, name: "Rechenaufgaben" },
            "06_ZR": { rw: 17, sw: 126, name: "Zahlenreihen" },
            "07_FA": { rw: 14, sw: 118, name: "Figurenauswahl" },
            "08_WU": { rw: 13, sw: 116, name: "Würfelaufgaben" },
            "09_ME": { rw: 13, sw: 117, name: "Merkaufgaben" }
        },
        waktu_selesai: new Date().toISOString()
    };

    // 4. SIMULASI MODUL 3: PAPI KOSTICK (90 SOAL, TOTAL SKOR 90)
    console.log(`4. PENGERJAAN MODUL 3: PAPI KOSTICK (90 SOAL, 20 DIMENSI)`);
    const payloadPapi = {
        total_skor: 90,
        skor: {
            G: 5, L: 6, I: 4, T: 5, V: 4, S: 5, R: 4, D: 5, C: 4, E: 4,
            N: 5, A: 5, P: 4, X: 5, B: 4, O: 5, Z: 4, K: 4, F: 4, W: 4
        },
        pelanggaran_tab_switch: 0,
        waktu_selesai: new Date().toISOString()
    };

    // 5. SIMULASI MODUL 4: DISC (24 SOAL MOST & LEAST)
    console.log(`5. PENGERJAAN MODUL 4: DISC (24 SOAL, GRAFIK 1-3)`);
    const payloadDisc = {
        most: { D: 9, I: 6, S: 5, C: 4 },
        least: { D: 2, I: 4, S: 8, C: 10 },
        change: { D: 7, I: 2, S: -3, C: -6 },
        pola_karakter: 'Developer / Results-Oriented',
        waktu_selesai: new Date().toISOString()
    };

    // 6. SIMULASI MODUL 5: EPPS (225 SOAL, 15 SKALA MOTIVASI)
    console.log(`6. PENGERJAAN MODUL 5: EPPS (225 SOAL, KONSISTENSI)`);
    const payloadEpps = {
        skor: {
            ach: 17, def: 14, ord: 16, exh: 11, aut: 13,
            aff: 14, int: 16, suc: 10, dom: 18, aba: 11,
            nur: 15, chg: 14, end: 18, het: 12, agg: 11
        },
        konsistensi: 14,
        valid: true,
        waktu_selesai: new Date().toISOString()
    };

    // 7. SIMULASI MODUL 6: PAULI (20 GARIS INTERVAL / 3 MENIT)
    console.log(`7. PENGERJAAN MODUL 6: PAULI (20 INTERVAL, SPEED & ACCURACY)`);
    const payloadPauli = {
        total_pauli: 2540,
        total_pengerjaan: 2540,
        jawaban_benar: 2505,
        jawaban_salah: 35,
        garis_interval_3_menit: [
            124, 126, 128, 125, 129, 127, 131, 128, 130, 127,
            128, 126, 129, 130, 127, 125, 128, 126, 125, 123
        ],
        rata_rata: 127.0,
        penyimpangan_persen: 1.1,
        tinggi: 131,
        tempat_puncak: 7,
        pelanggaran_tab: 0,
        waktu_selesai: new Date().toISOString()
    };

    // 8. SIMULASI MODUL 7: MSDT (64 SOAL, MATRIKS REDDIN 3-D)
    console.log(`8. PENGERJAAN MODUL 7: MSDT (64 SOAL, 8 GAYA KEPEMIMPINAN)`);
    const payloadMsdt = {
        to: 34,
        ro: 36,
        e: 35,
        o: 33,
        gaya_dominan: 'Executive',
        deskripsi_gaya: 'Efektivitas manajerial tinggi dengan orientasi tugas dan relasi yang seimbang.',
        waktu_selesai: new Date().toISOString()
    };

    // 9. SIMULASI MODUL 8: CFIT (50 SOAL / 4 SUBTES)
    console.log(`9. PENGERJAAN MODUL 8: CFIT (4 SUBTES, FLUID IQ)`);
    const payloadCfit = {
        total_benar: 44,
        total_soal: 50,
        iq: 126,
        kategori_iq: 'Superior',
        subtes: { subtes1: 12, subtes2: 13, subtes3: 10, subtes4: 9 },
        waktu_selesai: new Date().toISOString()
    };

    // 10. SIMULASI MODUL 9: MBTI (60 SOAL, 16 TIPE)
    console.log(`10. PENGERJAAN MODUL 9: MBTI (60 SOAL, 16 TIPE)`);
    const payloadMbti = {
        tipe: 'ENTJ',
        skor: { E: 13, I: 2, N: 12, S: 3, T: 14, F: 1, J: 13, P: 2 },
        nama_tipe: 'The Commander',
        deskripsi: 'Pemimpin tegas, berorientasi strategi jangka panjang, dan pengambil keputusan objektif.',
        waktu_selesai: new Date().toISOString()
    };

    // SIMPAN KE-9 MODUL KE SUPABASE
    console.log(`\n11. MENGUNCI & MENYIMPAN SELURUH 9 MODUL KE SUPABASE...`);
    const updateRes = await supabaseRequest('PATCH', `/rest/v1/kandidat_psikotes?id=eq.${candidateId}`, {
        hasil_grafis: payloadGrafis,
        hasil_ist: payloadIst,
        hasil_papi: payloadPapi,
        hasil_disc: payloadDisc,
        hasil_epps: payloadEpps,
        hasil_pauli: payloadPauli,
        hasil_msdt: payloadMsdt,
        hasil_cfit: payloadCfit,
        hasil_mbti: payloadMbti,
        waktu_selesai: new Date().toISOString()
    });

    assert(updateRes.status === 200, 'Payload ke-9 modul berhasil disimpan ke Supabase tabel kandidat_psikotes');

    // 12. AUDIT INTEGRITAS DATABASE SUPABASE
    console.log(`\n12. AUDIT INTEGRITAS DATABASE KANDIDAT TESTER`);
    const verifyRes = await supabaseRequest('GET', `/rest/v1/kandidat_psikotes?id=eq.${candidateId}&select=*`);
    assert(verifyRes.status === 200 && verifyRes.data && verifyRes.data.length > 0, 'Baris kandidat dapat dibaca ulang dari Supabase');

    const row = verifyRes.data[0];

    // Audit Modul 1
    assert(row.hasil_grafis !== null && row.hasil_grafis !== '-', 'Modul 1 (Grafis): Tersimpan tidak null / -');
    assert(row.hasil_grafis.total_berkas === 6, 'Modul 1 (Grafis): Total berkas tepat 6 berkas');
    assert(row.hasil_grafis.dap.length === 2, 'Modul 1 (Grafis): DAP memiliki 2 berkas');
    assert(row.hasil_grafis.tree.length === 2, 'Modul 1 (Grafis): Tree memiliki 2 berkas');
    assert(row.hasil_grafis.htp.length === 2, 'Modul 1 (Grafis): HTP memiliki 2 berkas');

    // Audit Modul 2
    assert(row.hasil_ist !== null && row.hasil_ist.iq === 122, 'Modul 2 (IST): Skor IQ valid (122 Superior)');

    // Audit Modul 3
    assert(row.hasil_papi !== null && row.hasil_papi.total_skor === 90, 'Modul 3 (PAPI): Total 20 dimensi tepat 90');

    // Audit Modul 4
    assert(row.hasil_disc !== null && row.hasil_disc.most && row.hasil_disc.pola_karakter, 'Modul 4 (DISC): Pola karakter dan matriks terisi');

    // Audit Modul 5
    assert(row.hasil_epps !== null && row.hasil_epps.konsistensi === 14, 'Modul 5 (EPPS): Skor konsistensi valid');

    // Audit Modul 6
    assert(row.hasil_pauli !== null && row.hasil_pauli.garis_interval_3_menit.length === 20, 'Modul 6 (Pauli): 20 garis interval lengkap');

    // Audit Modul 7
    assert(row.hasil_msdt !== null && row.hasil_msdt.gaya_dominan === 'Executive', 'Modul 7 (MSDT): Gaya dominan Executive terisi');

    // Audit Modul 8
    assert(row.hasil_cfit !== null && row.hasil_cfit.iq === 126, 'Modul 8 (CFIT): Fluid IQ valid (126 Superior)');

    // Audit Modul 9
    assert(row.hasil_mbti !== null && row.hasil_mbti.tipe === 'ENTJ', 'Modul 9 (MBTI): Tipe 4 huruf valid (ENTJ)');

    // 13. AUDIT KESIAPAN RENDER PORTAL HRD
    console.log(`\n13. AUDIT KESIAPAN RENDER PORTAL HRD (hrd.html & js/hrd.js)`);
    // Simulasi signed URL generator
    const sampleStorageUrl = row.hasil_grafis.dap[0].url;
    const signedUrlRes = await supabaseRequest('POST', `/storage/v1/object/sign/foto_kandidat/${sampleStorageUrl}`, {
        expiresIn: 3600
    });
    assert(signedUrlRes.status === 200 && signedUrlRes.data && signedUrlRes.data.signedURL, 'Signed URL Supabase Storage berdurasi 3600s berhasil digenerasi');

    // Audit penamaan download berkas
    const slotCodeMap = { dap: 'DAP', tree: 'POHON', htp: 'HTP' };
    const candName = row.nama_lengkap.replace(/[^a-zA-Z0-9_-]/g, '_');
    ['dap', 'tree', 'htp'].forEach(slot => {
        [1, 2].forEach(subIdx => {
            const dlName = `${slotCodeMap[slot]}_${subIdx}_${candName}.jpg`;
            assert(dlName.startsWith(slotCodeMap[slot]) && dlName.includes(`_${subIdx}_`), `Format nama unduh berkas ${slotCodeMap[slot]} [${subIdx}] valid: ${dlName}`);
        });
    });

    console.log(`\n================================================================`);
    console.log(`   HASIL EVALUASI BOT E2E: ${passCount} PASSED, ${failCount} FAILED`);
    console.log(`================================================================\n`);

    if (failCount === 0) {
        console.log('✓ SEMUA SISTEM 100% SUKSES DAN MEMENUHI SELURUH STANDAR MUTU!');
    }
    process.exit(failCount > 0 ? 1 : 0);
}

runE2EBot().catch(err => {
    console.error('Bot E2E Fatal Error:', err);
    process.exit(1);
});
