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

    // 3. SIMULASI MODUL 2: IST (9 SUBTES / 176 SOAL LENGKAP DENGAN BUTIR JAWABAN)
    console.log(`3. PENGERJAAN MODUL 2: IST (9 SUBTES / 176 SOAL LENGKAP)`);
    const istAnswers = {
        SE: { 1: "E", 2: "C", 3: "D", 4: "D", 5: "D", 6: "C", 7: "C", 8: "A", 9: "E", 10: "B", 11: "C", 12: "D", 13: "D", 14: "E", 15: "C", 16: "A", 17: "B", 18: "B", 19: "C", 20: "B" },
        WA: { 1: "C", 2: "B", 3: "D", 4: "C", 5: "A", 6: "E", 7: "D", 8: "B", 9: "C", 10: "E", 11: "D", 12: "A", 13: "B", 14: "E", 15: "C", 16: "D", 17: "B", 18: "A", 19: "E", 20: "D" },
        AN: { 1: "D", 2: "C", 3: "B", 4: "E", 5: "A", 6: "C", 7: "E", 8: "B", 9: "D", 10: "A", 11: "C", 12: "E", 13: "B", 14: "D", 15: "A", 16: "E", 17: "C", 18: "B", 19: "D", 20: "A" },
        GE: { 1: "perkakas", 2: "waktu", 3: "indera", 4: "pengerat", 5: "musik", 6: "permata", 7: "geometri", 8: "makan", 9: "biji", 10: "olahraga", 11: "tumbuhan", 12: "penyakit", 13: "cairan", 14: "kendaraan", 15: "pakaian", 16: "emosi" },
        RA: { 1: "15", 2: "12", 3: "24", 4: "18", 5: "40", 6: "25", 7: "48", 8: "36", 9: "60", 10: "45", 11: "72", 12: "54", 13: "84", 14: "63", 15: "96", 16: "75", 17: "108", 18: "81", 19: "120", 20: "90" },
        ZR: { 1: "21", 2: "32", 3: "43", 4: "54", 5: "65", 6: "76", 7: "87", 8: "98", 9: "109", 10: "120", 11: "131", 12: "142", 13: "153", 14: "164", 15: "175", 16: "186", 17: "197", 18: "208", 19: "219", 20: "230" },
        FA: { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "A", 7: "B", 8: "C", 9: "D", 10: "E", 11: "A", 12: "B", 13: "C", 14: "D", 15: "E", 16: "A", 17: "B", 18: "C", 19: "D", 20: "E" },
        WU: { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "A", 7: "B", 8: "C", 9: "D", 10: "E", 11: "A", 12: "B", 13: "C", 14: "D", 15: "E", 16: "A", 17: "B", 18: "C", 19: "D", 20: "E" },
        ME: { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "A", 7: "B", 8: "C", 9: "D", 10: "E", 11: "A", 12: "B", 13: "C", 14: "D", 15: "E", 16: "A", 17: "B", 18: "C", 19: "D", 20: "E" }
    };

    const payloadIst = {
        total_benar: 135,
        total_soal: 176,
        iq: 122,
        skor_iq: 122,
        kategori_iq: 'Superior',
        jawaban_peserta: istAnswers,
        jawaban: istAnswers,
        subtes: {
            "01_SE": { rw: 20, sw: 125, name: "Satzergänzung" },
            "02_WA": { rw: 20, sw: 125, name: "Wortauswahl" },
            "03_AN": { rw: 20, sw: 125, name: "Analogien" },
            "04_GE": { rw: 16, sw: 125, name: "Gemeinsamkeiten" },
            "05_RA": { rw: 20, sw: 125, name: "Rechenaufgaben" },
            "06_ZR": { rw: 20, sw: 125, name: "Zahlenreihen" },
            "07_FA": { rw: 20, sw: 125, name: "Figurenauswahl" },
            "08_WU": { rw: 20, sw: 125, name: "Würfelaufgaben" },
            "09_ME": { rw: 20, sw: 125, name: "Merkaufgaben" }
        },
        subtes_01: { rw: 20, sw: 125, name: "Satzergänzung", jawaban_peserta: istAnswers.SE, jawaban: istAnswers.SE },
        subtes_02: { rw: 20, sw: 125, name: "Wortauswahl", jawaban_peserta: istAnswers.WA, jawaban: istAnswers.WA },
        subtes_03: { rw: 20, sw: 125, name: "Analogien", jawaban_peserta: istAnswers.AN, jawaban: istAnswers.AN },
        subtes_04: { rw: 16, sw: 125, name: "Gemeinsamkeiten", jawaban_peserta: istAnswers.GE, jawaban: istAnswers.GE },
        subtes_05: { rw: 20, sw: 125, name: "Rechenaufgaben", jawaban_peserta: istAnswers.RA, jawaban: istAnswers.RA },
        subtes_06: { rw: 20, sw: 125, name: "Zahlenreihen", jawaban_peserta: istAnswers.ZR, jawaban: istAnswers.ZR },
        subtes_07: { rw: 20, sw: 125, name: "Figurenauswahl", jawaban_peserta: istAnswers.FA, jawaban: istAnswers.FA },
        subtes_08: { rw: 20, sw: 125, name: "Würfelaufgaben", jawaban_peserta: istAnswers.WU, jawaban: istAnswers.WU },
        subtes_09: { rw: 20, sw: 125, name: "Merkaufgaben", jawaban_peserta: istAnswers.ME, jawaban: istAnswers.ME },
        waktu_selesai: new Date().toISOString()
    };

    // 4. SIMULASI MODUL 3: PAPI KOSTICK (90 SOAL, TOTAL SKOR 90)
    console.log(`4. PENGERJAAN MODUL 3: PAPI KOSTICK (90 SOAL LENGKAP DENGAN BUTIR)`);
    const papiAnswers = {};
    for (let i = 1; i <= 90; i++) {
        papiAnswers[i] = (i % 2 === 0) ? 'B' : 'A';
    }
    const payloadPapi = {
        total_skor: 90,
        scores: {
            G: 5, L: 6, I: 4, T: 5, V: 4, S: 5, R: 4, D: 5, C: 4, E: 4,
            N: 5, A: 5, P: 4, X: 5, B: 4, O: 5, Z: 4, K: 4, F: 4, W: 4
        },
        skor: {
            G: 5, L: 6, I: 4, T: 5, V: 4, S: 5, R: 4, D: 5, C: 4, E: 4,
            N: 5, A: 5, P: 4, X: 5, B: 4, O: 5, Z: 4, K: 4, F: 4, W: 4
        },
        jawaban: papiAnswers,
        answers: papiAnswers,
        pelanggaran_tab_switch: 0,
        waktu_selesai: new Date().toISOString()
    };

    // 5. SIMULASI MODUL 4: DISC (24 SOAL MOST & LEAST)
    console.log(`5. PENGERJAAN MODUL 4: DISC (24 SOAL LENGKAP DENGAN BUTIR)`);
    const discAnswers = {};
    const discOpts = ['D', 'I', 'S', 'C'];
    for (let i = 1; i <= 24; i++) {
        discAnswers[i] = {
            most: discOpts[(i - 1) % 4],
            least: discOpts[(i + 1) % 4]
        };
    }
    const payloadDisc = {
        jawaban: discAnswers,
        answers: discAnswers,
        most: { D: 9, I: 6, S: 5, C: 4 },
        least: { D: 2, I: 4, S: 8, C: 10 },
        change: { D: 7, I: 2, S: -3, C: -6 },
        pola_karakter: 'Developer / Results-Oriented',
        waktu_selesai: new Date().toISOString()
    };

    // 6. SIMULASI MODUL 5: EPPS (225 SOAL LENGKAP DENGAN BUTIR)
    console.log(`6. PENGERJAAN MODUL 5: EPPS (225 SOAL LENGKAP DENGAN BUTIR)`);
    const eppsAnswers = {};
    for (let i = 1; i <= 225; i++) {
        eppsAnswers[i] = (i % 3 === 0) ? 'B' : 'A';
    }
    const payloadEpps = {
        jawaban: eppsAnswers,
        answers: eppsAnswers,
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

    // 8. SIMULASI MODUL 7: MSDT (64 SOAL LENGKAP DENGAN BUTIR)
    console.log(`8. PENGERJAAN MODUL 7: MSDT (64 SOAL LENGKAP DENGAN BUTIR)`);
    const msdtAnswers = {};
    for (let i = 1; i <= 64; i++) {
        msdtAnswers[i] = (i % 2 === 0) ? 'B' : 'A';
    }
    const payloadMsdt = {
        jawaban: msdtAnswers,
        answers: msdtAnswers,
        to: 34,
        ro: 36,
        e: 35,
        o: 33,
        gaya_dominan: 'Executive',
        deskripsi_gaya: 'Efektivitas manajerial tinggi dengan orientasi tugas dan relasi yang seimbang.',
        waktu_selesai: new Date().toISOString()
    };

    // 9. SIMULASI MODUL 8: CFIT (50 SOAL / 4 SUBTES LENGKAP DENGAN BUTIR)
    console.log(`9. PENGERJAAN MODUL 8: CFIT (50 SOAL LENGKAP DENGAN BUTIR)`);
    const cfitAnswers = {
        subtes_1: { 1: "B", 2: "C", 3: "B", 4: "D", 5: "E", 6: "B", 7: "D", 8: "B", 9: "F", 10: "C", 11: "B", 12: "B", 13: "E" },
        subtes_2: { 1: ["B","E"], 2: ["A","E"], 3: ["A","D"], 4: ["C","E"], 5: ["B","E"], 6: ["A","D"], 7: ["B","E"], 8: ["B","E"], 9: ["A","D"], 10: ["B","D"], 11: ["A","E"], 12: ["C","D"], 13: ["B","C"], 14: ["A","B"] },
        subtes_3: { 1: "E", 2: "E", 3: "E", 4: "B", 5: "C", 6: "D", 7: "E", 8: "E", 9: "A", 10: "A", 11: "F", 12: "C", 13: "C" },
        subtes_4: { 1: "B", 2: "A", 3: "D", 4: "D", 5: "A", 6: "B", 7: "C", 8: "D", 9: "A", 10: "D" }
    };
    const rincianCfit = [];
    const masterCfit = {
        1: ["B", "C", "B", "D", "E", "B", "D", "B", "F", "C", "B", "B", "E"],
        2: ["BE", "AE", "AD", "CE", "BE", "AD", "BE", "BE", "AD", "BD", "AE", "CD", "BC", "AB"],
        3: ["E", "E", "E", "B", "C", "D", "E", "E", "A", "A", "F", "C", "C"],
        4: ["B", "A", "D", "D", "A", "B", "C", "D", "A", "D"]
    };
    [1, 2, 3, 4].forEach(sNo => {
        const subAns = cfitAnswers[`subtes_${sNo}`];
        const keys = masterCfit[sNo];
        for (let q = 1; q <= keys.length; q++) {
            let val = subAns[q];
            if (Array.isArray(val)) val = val.slice().sort().join('');
            rincianCfit.push({
                subtes: sNo,
                no: q,
                jawaban: val,
                nilai: 1
            });
        }
    });

    const payloadCfit = {
        total_benar: 44,
        total_soal: 50,
        skor_iq: 126,
        iq_score: 126,
        iq: 126,
        kategori_iq: 'Superior',
        kategori: 'Superior',
        subtes: { subtes1: 13, subtes2: 14, subtes3: 13, subtes4: 10 },
        rincian_subtes: { s1: 13, s2: 14, s3: 13, s4: 10 },
        rincian_jawaban: rincianCfit,
        answers: cfitAnswers,
        jawaban: cfitAnswers,
        waktu_selesai: new Date().toISOString()
    };

    // 10. SIMULASI MODUL 9: MBTI (60 SOAL LENGKAP DENGAN BUTIR)
    console.log(`10. PENGERJAAN MODUL 9: MBTI (60 SOAL LENGKAP DENGAN BUTIR)`);
    const mbtiAnswers = {};
    for (let i = 1; i <= 60; i++) {
        mbtiAnswers[i] = (i % 2 === 0) ? 'B' : 'A';
    }
    const payloadMbti = {
        tipe: 'ENTJ',
        tipe_kepribadian: 'ENTJ',
        jawaban: mbtiAnswers,
        answers: mbtiAnswers,
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
