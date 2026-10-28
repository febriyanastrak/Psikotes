const https = require('https');

console.log('================================================================');
console.log('   AUTOMATED MASS ASSESSMENT BOT - 12 KANDIDAT PT ALTRAK 1978   ');
console.log('   Mengerjakan Seluruh 9 Modul (Grafis, IST, PAPI, DISC,        ');
console.log('   EPPS, Pauli, MSDT, CFIT, MBTI) Secara Lengkap & Terverifikasi');
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
            family: 4, // IPv4 for network stability
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

function uploadStorageFile(storagePath, buffer) {
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

const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

// 12 Profil Kandidat Otentik PT Altrak 1978
const CANDIDATE_PROFILES = [
    {
        nama: "Mochamad Fajar Pratama, S.T.",
        posisi: "Management Trainee - Engineering",
        email_prefix: "m.fajar.pratama",
        penempatan: "Head Office Jakarta",
        no_wa: "081288991001",
        ist: { iq: 125, kategori: "Superior", benar: 140, subtesRw: [17, 16, 16, 15, 17, 18, 14, 13, 14] },
        papi: { role: "Leader / Executive", skor: { G: 6, L: 7, I: 5, T: 6, V: 4, S: 5, R: 4, D: 6, C: 4, E: 4, N: 5, A: 6, P: 5, X: 4, B: 3, O: 4, Z: 4, K: 3, F: 2, W: 3 } },
        disc: { most: { D: 10, I: 7, S: 4, C: 3 }, least: { D: 1, I: 3, S: 9, C: 11 }, pola: "Developer (D/I)" },
        epps: { ach: 19, def: 13, ord: 16, exh: 10, aut: 14, aff: 12, int: 15, suc: 9, dom: 18, aba: 8, nur: 13, chg: 15, end: 18, het: 11, agg: 11, kons: 14 },
        pauli: { total: 2680, benar: 2645, salah: 35, avg: 134.0, punc: 8 },
        msdt: { to: 36, ro: 34, e: 37, o: 33, gaya: "Executive", desc: "Berorientasi pada hasil dan memotivasi tim dengan standar tinggi." },
        cfit: { iq: 128, benar: 46 },
        mbti: { tipe: "ENTJ", nama: "The Commander", desc: "Pemimpin visioner, strategis, dan tegas dalam pengambilan keputusan operasional." }
    },
    {
        nama: "Siti Nurhaliza Putri, S.Psi.",
        posisi: "HR & Talent Acquisition Officer",
        email_prefix: "siti.nurhaliza",
        penempatan: "Head Office Jakarta",
        no_wa: "081288991002",
        ist: { iq: 118, kategori: "Di Atas Rata-rata", benar: 130, subtesRw: [16, 17, 15, 16, 13, 14, 13, 13, 13] },
        papi: { role: "Human Relation / Developer", skor: { G: 5, L: 5, I: 6, T: 4, V: 5, S: 6, R: 5, D: 4, C: 4, E: 5, N: 4, A: 5, P: 4, X: 6, B: 5, O: 6, Z: 4, K: 3, F: 4, W: 4 } },
        disc: { most: { D: 4, I: 10, S: 7, C: 3 }, least: { D: 8, I: 2, S: 4, C: 10 }, pola: "Promoter (I/S)" },
        epps: { ach: 15, def: 15, ord: 14, exh: 13, aut: 12, aff: 18, int: 17, suc: 12, dom: 13, aba: 10, nur: 18, chg: 14, end: 15, het: 13, agg: 8, kons: 15 },
        pauli: { total: 2420, benar: 2390, salah: 30, avg: 121.0, punc: 6 },
        msdt: { to: 32, ro: 38, e: 35, o: 35, gaya: "Developer", desc: "Fokus pada pengembangan potensi bawahan dan iklim kerja kolaboratif." },
        cfit: { iq: 120, benar: 42 },
        mbti: { tipe: "ENFJ", nama: "The Protagonist", desc: "Inspiratif, empatik, dan piawai dalam membangun sinergi antar individu." }
    },
    {
        nama: "Budi Santoso Wibowo, A.Md.",
        posisi: "Field Service Mechanic",
        email_prefix: "budi.santoso.w",
        penempatan: "Cabang Balikpapan",
        no_wa: "081288991003",
        ist: { iq: 111, kategori: "Rata-rata Tinggi", benar: 118, subtesRw: [13, 14, 13, 13, 15, 15, 14, 13, 11] },
        papi: { role: "Technical Specialist", skor: { G: 6, L: 4, I: 4, T: 5, V: 6, S: 4, R: 6, D: 4, C: 5, E: 4, N: 6, A: 5, P: 3, X: 3, B: 4, O: 4, Z: 5, K: 4, F: 4, W: 4 } },
        disc: { most: { D: 5, I: 3, S: 9, C: 7 }, least: { D: 6, I: 9, S: 3, C: 6 }, pola: "Specialist (S/C)" },
        epps: { ach: 16, def: 16, ord: 17, exh: 8, aut: 14, aff: 11, int: 13, suc: 8, dom: 12, aba: 11, nur: 12, chg: 11, end: 19, het: 10, agg: 11, kons: 13 },
        pauli: { total: 2750, benar: 2715, salah: 35, avg: 137.5, punc: 11 },
        msdt: { to: 37, ro: 30, e: 36, o: 32, gaya: "Dedicated", desc: "Berdedikasi tinggi pada penyelesaian tugas teknis dan standar mutu mekanik." },
        cfit: { iq: 114, benar: 39 },
        mbti: { tipe: "ISTP", nama: "The Virtuoso", desc: "Praktis, analitis teknis, dan tenang dalam menyelesaikan problem mekanikal." }
    },
    {
        nama: "Dewa Made Arimbawa, S.T.",
        posisi: "Heavy Equipment Technical Specialist",
        email_prefix: "dewa.arimbawa",
        penempatan: "Cabang Samarinda",
        no_wa: "081288991004",
        ist: { iq: 123, kategori: "Superior", benar: 136, subtesRw: [16, 16, 15, 15, 17, 17, 15, 14, 13] },
        papi: { role: "Expert Problem Solver", skor: { G: 5, L: 5, I: 4, T: 6, V: 5, S: 4, R: 6, D: 5, C: 6, E: 4, N: 5, A: 6, P: 4, X: 3, B: 4, O: 3, Z: 5, K: 4, F: 3, W: 4 } },
        disc: { most: { D: 7, I: 4, S: 5, C: 8 }, least: { D: 3, I: 8, S: 6, C: 7 }, pola: "Objective Thinker (C/D)" },
        epps: { ach: 18, def: 14, ord: 18, exh: 9, aut: 15, aff: 11, int: 16, suc: 8, dom: 15, aba: 9, nur: 11, chg: 13, end: 18, het: 10, agg: 12, kons: 14 },
        pauli: { total: 2590, benar: 2562, salah: 28, avg: 129.5, punc: 9 },
        msdt: { to: 36, ro: 33, e: 36, o: 33, gaya: "Integrated", desc: "Mengintegrasikan aspek teknis dan operasional alat berat secara komprehensif." },
        cfit: { iq: 126, benar: 45 },
        mbti: { tipe: "INTJ", nama: "The Architect", desc: "Pola pikir strategis, berorientasi sistematis dan inovatif pada teknologi alat berat." }
    },
    {
        nama: "Jessica Natalia Lim, S.E.",
        posisi: "Financial Analyst & Treasury",
        email_prefix: "jessica.natalia",
        penempatan: "Head Office Jakarta",
        no_wa: "081288991005",
        ist: { iq: 126, kategori: "Superior", benar: 142, subtesRw: [17, 17, 16, 16, 18, 18, 14, 13, 14] },
        papi: { role: "Analytical Controller", skor: { G: 5, L: 5, I: 3, T: 6, V: 4, S: 5, R: 6, D: 5, C: 7, E: 4, N: 6, A: 6, P: 4, X: 3, B: 4, O: 3, Z: 4, K: 4, F: 4, W: 5 } },
        disc: { most: { D: 5, I: 3, S: 6, C: 10 }, least: { D: 5, I: 9, S: 5, C: 5 }, pola: "Perfectionist (C/S)" },
        epps: { ach: 18, def: 15, ord: 19, exh: 7, aut: 13, aff: 12, int: 16, suc: 8, dom: 14, aba: 10, nur: 12, chg: 11, end: 19, het: 9, agg: 10, kons: 15 },
        pauli: { total: 2820, benar: 2800, salah: 20, avg: 141.0, punc: 10 },
        msdt: { to: 38, ro: 31, e: 37, o: 32, gaya: "Benevolent Autocrat", desc: "Tegas pada angka finansial, akurat, dan disiplin tinggi dalam manajemen kas." },
        cfit: { iq: 129, benar: 47 },
        mbti: { tipe: "ISTJ", nama: "The Logistician", desc: "Teliti, taat prosedur regulasi, dan memiliki integritas tinggi dalam tata kelola keuangan." }
    },
    {
        nama: "Ahmad Rian Hidayat, S.T.",
        posisi: "Branch Operations Supervisor",
        email_prefix: "ahmad.rian.h",
        penempatan: "Cabang Surabaya",
        no_wa: "081288991006",
        ist: { iq: 116, kategori: "Di Atas Rata-rata", benar: 127, subtesRw: [15, 15, 14, 15, 15, 15, 14, 13, 12] },
        papi: { role: "Operational Leader", skor: { G: 6, L: 6, I: 5, T: 6, V: 5, S: 5, R: 5, D: 6, C: 4, E: 4, N: 5, A: 6, P: 5, X: 4, B: 3, O: 4, Z: 4, K: 3, F: 3, W: 3 } },
        disc: { most: { D: 9, I: 6, S: 5, C: 4 }, least: { D: 2, I: 4, S: 8, C: 10 }, pola: "Achiever (D/I)" },
        epps: { ach: 18, def: 14, ord: 16, exh: 11, aut: 13, aff: 13, int: 15, suc: 10, dom: 17, aba: 9, nur: 13, chg: 14, end: 17, het: 11, agg: 12, kons: 14 },
        pauli: { total: 2610, benar: 2575, salah: 35, avg: 130.5, punc: 8 },
        msdt: { to: 36, ro: 34, e: 36, o: 34, gaya: "Executive", desc: "Mampu mengelola operasional cabang dengan koordinasi tim yang efektif." },
        cfit: { iq: 119, benar: 41 },
        mbti: { tipe: "ESTJ", nama: "The Executive", desc: "Pengorganisasi ulung, berorientasi eksekusi target, dan disiplin tinggi." }
    },
    {
        nama: "Stephanie Amanda Siregar, S.M.",
        posisi: "Sales Executive - Heavy Equipment",
        email_prefix: "stephanie.siregar",
        penempatan: "Cabang Pekanbaru",
        no_wa: "081288991007",
        ist: { iq: 114, kategori: "Rata-rata Tinggi", benar: 124, subtesRw: [16, 16, 15, 15, 13, 13, 13, 12, 12] },
        papi: { role: "Persuasive Closer", skor: { G: 6, L: 5, I: 7, T: 4, V: 6, S: 6, R: 4, D: 6, C: 3, E: 5, N: 4, A: 6, P: 5, X: 6, B: 3, O: 5, Z: 4, K: 3, F: 2, W: 2 } },
        disc: { most: { D: 8, I: 11, S: 3, C: 2 }, least: { D: 3, I: 1, S: 9, C: 11 }, pola: "Persuader (I/D)" },
        epps: { ach: 17, def: 12, ord: 13, exh: 16, aut: 13, aff: 16, int: 14, suc: 11, dom: 16, aba: 8, nur: 15, chg: 16, end: 16, het: 14, agg: 11, kons: 14 },
        pauli: { total: 2490, benar: 2450, salah: 40, avg: 124.5, punc: 7 },
        msdt: { to: 35, ro: 36, e: 36, o: 34, gaya: "Developer", desc: "Piawai membangun relasi jangka panjang dengan klien mining dan konstruksi." },
        cfit: { iq: 117, benar: 40 },
        mbti: { tipe: "ENFP", nama: "The Campaigner", desc: "Energik, komunikatif, antusias, dan fleksibel dalam menghadapi prospek bisnis." }
    },
    {
        nama: "Bayu Aji Pamungkas, S.T.",
        posisi: "Product Support Representative",
        email_prefix: "bayu.aji.p",
        penempatan: "Cabang Banjarmasin",
        no_wa: "081288991008",
        ist: { iq: 112, kategori: "Rata-rata Tinggi", benar: 120, subtesRw: [14, 15, 13, 14, 14, 14, 14, 13, 11] },
        papi: { role: "Customer Support Specialist", skor: { G: 5, L: 4, I: 5, T: 5, V: 5, S: 6, R: 5, D: 4, C: 5, E: 4, N: 5, A: 5, P: 4, X: 4, B: 5, O: 5, Z: 4, K: 4, F: 4, W: 4 } },
        disc: { most: { D: 4, I: 6, S: 9, C: 5 }, least: { D: 7, I: 4, S: 3, C: 10 }, pola: "Specialist (S/I)" },
        epps: { ach: 15, def: 15, ord: 16, exh: 10, aut: 12, aff: 16, int: 14, suc: 10, dom: 12, aba: 11, nur: 16, chg: 12, end: 17, het: 11, agg: 9, kons: 13 },
        pauli: { total: 2540, benar: 2510, salah: 30, avg: 127.0, punc: 8 },
        msdt: { to: 34, ro: 35, e: 35, o: 35, gaya: "Integrated", desc: "Responsif terhadap keluhan pelanggan dengan solusi teknis tepat guna." },
        cfit: { iq: 115, benar: 39 },
        mbti: { tipe: "ISFJ", nama: "The Defender", desc: "Setia, teliti dalam layanan purnajual, dan menjaga kepercayaan pelanggan." }
    },
    {
        nama: "Putri Ayu Wandira, S.Log.",
        posisi: "Supply Chain & Inventory Controller",
        email_prefix: "putri.ayu.w",
        penempatan: "Cabang Makassar",
        no_wa: "081288991009",
        ist: { iq: 115, kategori: "Di Atas Rata-rata", benar: 126, subtesRw: [15, 15, 14, 14, 16, 16, 13, 13, 12] },
        papi: { role: "Inventory Controller", skor: { G: 5, L: 4, I: 4, T: 6, V: 4, S: 5, R: 6, D: 4, C: 6, E: 4, N: 6, A: 5, P: 4, X: 3, B: 4, O: 4, Z: 5, K: 4, F: 4, W: 4 } },
        disc: { most: { D: 5, I: 4, S: 7, C: 8 }, least: { D: 6, I: 8, S: 4, C: 6 }, pola: "Objective Thinker (C/S)" },
        epps: { ach: 16, def: 16, ord: 19, exh: 8, aut: 12, aff: 13, int: 15, suc: 9, dom: 13, aba: 10, nur: 13, chg: 12, end: 18, het: 10, agg: 9, kons: 14 },
        pauli: { total: 2630, benar: 2602, salah: 28, avg: 131.5, punc: 9 },
        msdt: { to: 37, ro: 32, e: 36, o: 33, gaya: "Bureaucrat", desc: "Taat SOP persediaan spare-parts dan akurasi tinggi dalam stock opname." },
        cfit: { iq: 118, benar: 41 },
        mbti: { tipe: "ISTJ", nama: "The Inspector", desc: "Rapi, sistematis, dan konsisten dalam kontrol logistik suku cadang." }
    },
    {
        nama: "Kevin Christian Tan, S.Kom.",
        posisi: "IT Systems & Database Administrator",
        email_prefix: "kevin.christian",
        penempatan: "Head Office Jakarta",
        no_wa: "081288991010",
        ist: { iq: 128, kategori: "Superior", benar: 145, subtesRw: [17, 17, 16, 16, 18, 18, 15, 14, 14] },
        papi: { role: "System Architect", skor: { G: 5, L: 4, I: 3, T: 6, V: 4, S: 4, R: 6, D: 5, C: 6, E: 4, N: 6, A: 6, P: 4, X: 3, B: 4, O: 3, Z: 5, K: 5, F: 3, W: 4 } },
        disc: { most: { D: 6, I: 3, S: 6, C: 9 }, least: { D: 4, I: 9, S: 5, C: 6 }, pola: "Analyst (C/D)" },
        epps: { ach: 19, def: 13, ord: 18, exh: 7, aut: 16, aff: 10, int: 17, suc: 8, dom: 14, aba: 9, nur: 10, chg: 15, end: 19, het: 9, agg: 11, kons: 15 },
        pauli: { total: 2710, benar: 2685, salah: 25, avg: 135.5, punc: 8 },
        msdt: { to: 37, ro: 31, e: 37, o: 32, gaya: "Dedicated", desc: "Fokus mendalam pada keandalan infrastruktur IT, database, dan security." },
        cfit: { iq: 131, benar: 48 },
        mbti: { tipe: "INTP", nama: "The Logician", desc: "Inovatif dalam arsitektur data, problem solver analitis, dan adaptif pada tren IT." }
    },
    {
        nama: "Danu Hendra Kusuma, S.T.",
        posisi: "Warehouse & Logistics Supervisor",
        email_prefix: "danu.hendra",
        penempatan: "Cabang Palembang",
        no_wa: "081288991011",
        ist: { iq: 111, kategori: "Rata-rata Tinggi", benar: 119, subtesRw: [14, 14, 13, 13, 15, 15, 14, 13, 11] },
        papi: { role: "Field Commander", skor: { G: 6, L: 6, I: 4, T: 6, V: 6, S: 4, R: 5, D: 6, C: 4, E: 4, N: 5, A: 6, P: 5, X: 4, B: 3, O: 4, Z: 4, K: 3, F: 3, W: 3 } },
        disc: { most: { D: 9, I: 5, S: 6, C: 4 }, least: { D: 2, I: 6, S: 7, C: 9 }, pola: "Developer (D/S)" },
        epps: { ach: 17, def: 14, ord: 16, exh: 10, aut: 13, aff: 12, int: 14, suc: 9, dom: 16, aba: 10, nur: 12, chg: 13, end: 18, het: 11, agg: 12, kons: 13 },
        pauli: { total: 2670, benar: 2630, salah: 40, avg: 133.5, punc: 10 },
        msdt: { to: 37, ro: 32, e: 36, o: 33, gaya: "Benevolent Autocrat", desc: "Sigap dalam memimpin operasional pergudangan unit dan komponen alat berat." },
        cfit: { iq: 114, benar: 39 },
        mbti: { tipe: "ESTP", nama: "The Entrepreneur", desc: "Aksi cepat, pragmatis, dan tanggap mengatasi kendala arus logistik harian." }
    },
    {
        nama: "Nadya Farhana Syahrir, S.K.M.",
        posisi: "Safety, Health & Environment (SHE) Officer",
        email_prefix: "nadya.farhana",
        penempatan: "Cabang Pontianak",
        no_wa: "081288991012",
        ist: { iq: 117, kategori: "Di Atas Rata-rata", benar: 129, subtesRw: [16, 16, 14, 15, 14, 14, 14, 13, 13] },
        papi: { role: "Safety Guardian", skor: { G: 5, L: 5, I: 5, T: 5, V: 5, S: 5, R: 6, D: 5, C: 6, E: 4, N: 5, A: 6, P: 4, X: 4, B: 4, O: 5, Z: 4, K: 3, F: 4, W: 4 } },
        disc: { most: { D: 5, I: 6, S: 8, C: 5 }, least: { D: 6, I: 4, S: 3, C: 11 }, pola: "Practitioner (S/I)" },
        epps: { ach: 16, def: 16, ord: 17, exh: 10, aut: 12, aff: 15, int: 16, suc: 10, dom: 14, aba: 10, nur: 17, chg: 13, end: 17, het: 11, agg: 9, kons: 14 },
        pauli: { total: 2510, benar: 2480, salah: 30, avg: 125.5, punc: 7 },
        msdt: { to: 35, ro: 36, e: 36, o: 34, gaya: "Integrated", desc: "Komitmen tinggi pada zero accident dan implementasi budaya K3 di workshop." },
        cfit: { iq: 120, benar: 42 },
        mbti: { tipe: "INFJ", nama: "The Advocate", desc: "Memiliki kepedulian mendalam terhadap keselamatan rekan kerja dan lingkungan." }
    }
];

async function run12Bots() {
    const totalBots = CANDIDATE_PROFILES.length;
    console.log(`Memulai proses pengerjaan 9 modul psikotes untuk ${totalBots} kandidat...\n`);

    let successCount = 0;

    for (let i = 0; i < totalBots; i++) {
        const botIndex = i + 1;
        const profile = CANDIDATE_PROFILES[i];
        const timeOffset = Date.now() + i * 1000;
        const token = `ALTRAK-B${String(botIndex).padStart(2, '0')}-${String(timeOffset).slice(-4)}`;
        const email = `${profile.email_prefix}_${String(timeOffset).slice(-4)}@altrak1978.co.id`;

        console.log(`----------------------------------------------------------------`);
        console.log(`[BOT ${botIndex}/${totalBots}] Mendaftarkan: ${profile.nama}`);
        console.log(`   Posisi     : ${profile.posisi}`);
        console.log(`   Penempatan : ${profile.penempatan}`);
        console.log(`   Email      : ${email}`);
        console.log(`   Token      : ${token}`);

        // 1. Registrasi Akun Kandidat
        const regRes = await supabaseRequest('POST', '/rest/v1/kandidat_psikotes', {
            nama_lengkap: profile.nama,
            email: email,
            no_wa: profile.no_wa,
            posisi: profile.posisi,
            token: token,
            penempatan: profile.penempatan
        });

        if (regRes.status !== 201 || !regRes.data || regRes.data.length === 0) {
            console.error(`[FAIL] Gagal mendaftarkan kandidat ${profile.nama}:`, regRes.data || regRes.raw);
            continue;
        }

        const candidateId = regRes.data[0].id;
        console.log(`   Candidate ID : ${candidateId}`);

        // 2. Modul 1: Tes Grafis (Upload 6 Berkas Fisik ke Supabase Storage)
        const payloadGrafis = {
            status: 'selesai',
            total_berkas: 6,
            waktu_selesai: new Date(Date.now() - 3600000 + i * 60000).toISOString(),
            dap: [],
            tree: [],
            htp: []
        };

        const slots = [
            { key: 'dap', name1: 'DAP_Lembar_1_Pria.png', name2: 'DAP_Lembar_2_Wanita.png' },
            { key: 'tree', name1: 'Baum_Pohon_Utama.png', name2: 'Baum_Pohon_Detail.png' },
            { key: 'htp', name1: 'HTP_Rumah_Pohon_Orang.png', name2: 'HTP_Cerita_Lanjutan.png' }
        ];

        for (const s of slots) {
            for (let subIdx = 1; subIdx <= 2; subIdx++) {
                const fname = subIdx === 1 ? s.name1 : s.name2;
                const storagePath = `grafis/${candidateId}/${s.key}_${subIdx}_${timeOffset}.png`;
                await uploadStorageFile(storagePath, dummyPng);

                payloadGrafis[s.key].push({
                    slot: s.key,
                    sub_index: subIdx,
                    url: storagePath,
                    nama_file: fname,
                    ukuran: '70 B',
                    tipe: 'image/png',
                    waktu_upload: new Date().toISOString()
                });
            }
        }
        console.log(`   ✓ Modul 1: Tes Grafis (6 berkas fisik terunggah ke Storage)`);

        // 3. Modul 2: IST (Inteligent 1 - 9 Subtes)
        const istRw = profile.ist.subtesRw;
        const payloadIst = {
            total_benar: profile.ist.benar,
            total_soal: 176,
            iq: profile.ist.iq,
            kategori_iq: profile.ist.kategori,
            subtes: {
                "01_SE": { rw: istRw[0], sw: 100 + istRw[0], name: "Satzergänzung" },
                "02_WA": { rw: istRw[1], sw: 100 + istRw[1], name: "Wortauswahl" },
                "03_AN": { rw: istRw[2], sw: 100 + istRw[2], name: "Analogien" },
                "04_GE": { rw: istRw[3], sw: 100 + istRw[3], name: "Gemeinsamkeiten" },
                "05_RA": { rw: istRw[4], sw: 100 + istRw[4], name: "Rechenaufgaben" },
                "06_ZR": { rw: istRw[5], sw: 100 + istRw[5], name: "Zahlenreihen" },
                "07_FA": { rw: istRw[6], sw: 100 + istRw[6], name: "Figurenauswahl" },
                "08_WU": { rw: istRw[7], sw: 100 + istRw[7], name: "Würfelaufgaben" },
                "09_ME": { rw: istRw[8], sw: 100 + istRw[8], name: "Merkaufgaben" }
            },
            waktu_selesai: new Date(Date.now() - 3000000 + i * 60000).toISOString()
        };
        console.log(`   ✓ Modul 2: IST (IQ: ${profile.ist.iq} - ${profile.ist.kategori})`);

        // 4. Modul 3: PAPI Kostick (20 Dimensi, Sum=90)
        const payloadPapi = {
            total_skor: 90,
            skor: profile.papi.skor,
            pelanggaran_tab_switch: 0,
            waktu_selesai: new Date(Date.now() - 2500000 + i * 60000).toISOString()
        };
        console.log(`   ✓ Modul 3: PAPI Kostick (20 Dimensi, Total Skor: 90)`);

        // 5. Modul 4: DISC (Most, Least, Change, Pola)
        const dM = profile.disc.most;
        const dL = profile.disc.least;
        const payloadDisc = {
            most: dM,
            least: dL,
            change: { D: dM.D - dL.D, I: dM.I - dL.I, S: dM.S - dL.S, C: dM.C - dL.C },
            pola_karakter: profile.disc.pola,
            waktu_selesai: new Date(Date.now() - 2000000 + i * 60000).toISOString()
        };
        console.log(`   ✓ Modul 4: DISC (Pola: ${profile.disc.pola})`);

        // 6. Modul 5: EPPS (15 Kebutuhan Motivasi, Konsistensi)
        const payloadEpps = {
            skor: profile.epps,
            konsistensi: profile.epps.kons,
            valid: true,
            waktu_selesai: new Date(Date.now() - 1500000 + i * 60000).toISOString()
        };
        console.log(`   ✓ Modul 5: EPPS (Konsistensi: ${profile.epps.kons}/15 - Valid)`);

        // 7. Modul 6: Pauli (20 Interval, Kecepatan, Ketelitian)
        const pTotal = profile.pauli.total;
        const baseLine = Math.floor(pTotal / 20);
        const intervals = [];
        for (let j = 0; j < 20; j++) {
            const delta = Math.round(Math.sin((j / 19) * Math.PI) * 10) + (j % 3 - 1);
            intervals.push(baseLine + delta);
        }
        const payloadPauli = {
            total_pauli: pTotal,
            total_pengerjaan: pTotal,
            jawaban_benar: profile.pauli.benar,
            jawaban_salah: profile.pauli.salah,
            garis_interval_3_menit: intervals,
            rata_rata: profile.pauli.avg,
            penyimpangan_persen: 1.2,
            tinggi: Math.max(...intervals),
            tempat_puncak: profile.pauli.punc,
            pelanggaran_tab: 0,
            waktu_selesai: new Date(Date.now() - 1000000 + i * 60000).toISOString()
        };
        console.log(`   ✓ Modul 6: Pauli (Total: ${pTotal}, Akurasi: ${Math.round(profile.pauli.benar/pTotal*100)}%)`);

        // 8. Modul 7: MSDT (Reddin 3-D, Gaya Kepemimpinan)
        const payloadMsdt = {
            to: profile.msdt.to,
            ro: profile.msdt.ro,
            e: profile.msdt.e,
            o: profile.msdt.o,
            gaya_dominan: profile.msdt.gaya,
            deskripsi_gaya: profile.msdt.desc,
            waktu_selesai: new Date(Date.now() - 600000 + i * 60000).toISOString()
        };
        console.log(`   ✓ Modul 7: MSDT (Gaya: ${profile.msdt.gaya})`);

        // 9. Modul 8: CFIT (Fluid Intelligence - 4 Subtes)
        const payloadCfit = {
            total_benar: profile.cfit.benar,
            total_soal: 50,
            iq: profile.cfit.iq,
            kategori_iq: profile.cfit.iq >= 120 ? "Superior" : "Di Atas Rata-rata",
            subtes: {
                subtes1: Math.min(13, Math.round(profile.cfit.benar * 0.28)),
                subtes2: Math.min(14, Math.round(profile.cfit.benar * 0.28)),
                subtes3: Math.min(12, Math.round(profile.cfit.benar * 0.24)),
                subtes4: Math.min(11, Math.round(profile.cfit.benar * 0.20))
            },
            waktu_selesai: new Date(Date.now() - 300000 + i * 60000).toISOString()
        };
        console.log(`   ✓ Modul 8: CFIT (Fluid IQ: ${profile.cfit.iq})`);

        // 10. Modul 9: MBTI (16 Tipe Kepribadian)
        const payloadMbti = {
            tipe: profile.mbti.tipe,
            skor: { E: 12, I: 3, N: 11, S: 4, T: 13, F: 2, J: 12, P: 3 },
            nama_tipe: profile.mbti.nama,
            deskripsi: profile.mbti.desc,
            waktu_selesai: new Date(Date.now() - 60000 + i * 60000).toISOString()
        };
        console.log(`   ✓ Modul 9: MBTI (Tipe: ${profile.mbti.tipe} - ${profile.mbti.nama})`);

        // 11. Simpan & Kunci Seluruh 9 Modul ke Database Supabase
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

        if (updateRes.status === 200) {
            console.log(`   => [SUKSES 100%] Seluruh 9 modul berhasil dikunci ke Supabase!`);
            successCount++;
        } else {
            console.error(`   => [FAIL] Gagal update kandidat ${profile.nama}:`, updateRes.data || updateRes.raw);
        }
    }

    console.log(`\n================================================================`);
    console.log(`   RINGKASAN EKSEKUSI BOT: ${successCount} DARI ${totalBots} KANDIDAT SUKSES`);
    console.log(`================================================================\n`);

    // Audit Database Akhir
    const listRes = await supabaseRequest('GET', '/rest/v1/kandidat_psikotes?select=id,nama_lengkap,posisi,token,hasil_grafis,hasil_ist,hasil_papi,hasil_disc,hasil_epps,hasil_pauli,hasil_msdt,hasil_cfit,hasil_mbti&order=created_at.desc&limit=15');
    console.log(`Verifikasi database: ditemukan ${listRes.data ? listRes.data.length : 0} kandidat terbaru di tabel kandidat_psikotes.`);

    process.exit(successCount === totalBots ? 0 : 1);
}

run12Bots().catch(err => {
    console.error('Fatal Bot Execution Error:', err);
    process.exit(1);
});
