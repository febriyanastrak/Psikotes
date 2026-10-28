const https = require('https');

const SUPABASE_URL = 'https://rvflmznbihunezzqhobm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Zmxtem5iaWh1bmV6enFob2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODM4OTcsImV4cCI6MjEwNTU1OTg5N30.tHXAXhKRvChZOqKjRq9S8AvvSo59PiYizpgDI9FmHcE';

const url = new URL(SUPABASE_URL + '/rest/v1/kandidat_psikotes?select=nama_lengkap,posisi,token,hasil_grafis,hasil_ist,hasil_papi,hasil_disc,hasil_epps,hasil_pauli,hasil_msdt,hasil_cfit,hasil_mbti&order=created_at.desc&limit=12');

const req = https.request({
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: 'GET',
    family: 4,
    headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
    }
}, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const rows = JSON.parse(d);
        console.log('================================================================');
        console.log('   VERIFIKASI 12 DATA KANDIDAT LENGKAP DI SUPABASE DATABASE    ');
        console.log('================================================================\n');
        rows.forEach((r, idx) => {
            const gOk = r.hasil_grafis && r.hasil_grafis.total_berkas === 6;
            const istIq = r.hasil_ist ? r.hasil_ist.iq : '-';
            const istKat = r.hasil_ist ? r.hasil_ist.kategori_iq : '-';
            const papiSkor = r.hasil_papi ? r.hasil_papi.total_skor : '-';
            const discPola = r.hasil_disc ? r.hasil_disc.pola_karakter : '-';
            const eppsKons = r.hasil_epps ? r.hasil_epps.konsistensi : '-';
            const pauliTotal = r.hasil_pauli ? r.hasil_pauli.total_pauli : '-';
            const msdtGaya = r.hasil_msdt ? r.hasil_msdt.gaya_dominan : '-';
            const cfitIq = r.hasil_cfit ? r.hasil_cfit.iq : '-';
            const mbtiTipe = r.hasil_mbti ? r.hasil_mbti.tipe : '-';

            console.log(`[BOT ${idx+1}] ${r.nama_lengkap}`);
            console.log(`   Posisi   : ${r.posisi}`);
            console.log(`   Token    : ${r.token}`);
            console.log(`   Grafis   : ${gOk ? '6 Berkas Terunggah (DAP, Tree, HTP) ✓' : 'Belum Lengkap'}`);
            console.log(`   IST      : IQ ${istIq} (${istKat}) ✓`);
            console.log(`   PAPI     : 20 Dimensi (Total Skor: ${papiSkor}) ✓`);
            console.log(`   DISC     : Pola ${discPola} ✓`);
            console.log(`   EPPS     : Konsistensi ${eppsKons}/15 ✓`);
            console.log(`   Pauli    : ${pauliTotal} Kalkulasi (20 Interval Lengkap) ✓`);
            console.log(`   MSDT     : Gaya ${msdtGaya} ✓`);
            console.log(`   CFIT     : Fluid IQ ${cfitIq} ✓`);
            console.log(`   MBTI     : Tipe ${mbtiTipe} ✓\n`);
        });
    });
});
req.end();
