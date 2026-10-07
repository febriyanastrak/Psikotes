// =========================================================================
// DASHBOARD ANALITIK & LAPORAN HRD (SECURITY HARDENED)
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * Menampilkan daftar baris kandidat ke dalam tabel HRD
 * Semua data yang dirender disanitasi ketat untuk mencegah Stored XSS
 * @param {Array<{row: Object, originalIndex: number}>} dataList Daftar data kandidat
 */
function renderHrdTable(dataList) {
    const tbody = document.getElementById('hrdTableBody');
    if (!tbody) return;

    if (!dataList || dataList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-slate-500">Tidak ada data kandidat yang cocok.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    dataList.forEach((item, loopIdx) => {
        const row = item.row;
        const index = item.originalIndex;
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/50 transition";
        
        const namaSafe = escapeHtml(row["Nama Lengkap"] || '-');
        const emailSafe = escapeHtml(row["Alamat Email"] || '-');
        const waSafe = escapeHtml(row["No WhatsApp"] || '-');
        const waktuMulaiSafe = escapeHtml(row["Waktu Mulai"] || (row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-'));
        const waktuSelesaiSafe = escapeHtml(row["Waktu Selesai"] || '-');

        tr.innerHTML = `
            <td class="p-3 font-mono font-bold text-amber-400">${loopIdx + 1}</td>
            <td class="p-3 font-bold text-white">${namaSafe}</td>
            <td class="p-3 text-xs text-slate-400">${emailSafe}<br>${waSafe}</td>
            <td class="p-3 text-xs text-slate-400 leading-relaxed">
                <div><span class="text-slate-300 font-medium">Mulai:</span> ${waktuMulaiSafe}</div>
                <div><span class="text-slate-300 font-medium">Selesai:</span> ${waktuSelesaiSafe}</div>
            </td>
            <td class="p-3 text-center">
                <button onclick="viewCandidateChart(${index})" class="bg-[#003865] hover:bg-[#0a4980] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow border border-[#0a4980]">
                    <i class="fa-solid fa-chart-line mr-1"></i> Buka Laporan
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Memfilter baris tabel HRD berdasarkan kata kunci pencarian (nama, email, nomor WA, atau ID)
 */
function filterHrdTable() {
    const searchInput = document.getElementById('hrdSearchInput');
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const mapped = cachedHrdData.map((row, index) => ({ row, originalIndex: index }));
    
    if (!query) {
        renderHrdTable(mapped);
        return;
    }
    
    const filtered = mapped.filter(({ row }) => {
        const name = (row["Nama Lengkap"] || '').toLowerCase();
        const email = (row["Alamat Email"] || '').toLowerCase();
        const wa = (row["No WhatsApp"] || '').toLowerCase();
        const id = String(row.id || '');
        return name.includes(query) || email.includes(query) || wa.includes(query) || id.includes(query);
    });
    
    renderHrdTable(filtered);
}

/**
 * Mengambil data hasil tes seluruh kandidat dari Supabase
 * Dilindungi verifikasi sesi Supabase Auth aktif
 */
async function loadHrdData() {
    const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
        ? supabaseClient
        : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

    if (!sb) {
        customAlert("Koneksi Terputus", "Koneksi ke database Supabase tidak tersedia.", "error");
        return;
    }

    if (!isHrdAuthenticated) {
        showPage('page-login');
        return;
    }

    const tbody = document.getElementById('hrdTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengambil data dari server...</td></tr>`;
    }

    try {
        let combinedData = [];

        // 1. Ambil data kandidat asesmen terpadu (kandidat_psikotes)
        try {
            let qKandidat = sb.from('kandidat_psikotes').select('*');
            try {
                qKandidat = qKandidat.order('created_at', { ascending: false });
            } catch (e) {}
            const resKandidat = await qKandidat;

            if (!resKandidat.error && resKandidat.data && resKandidat.data.length > 0) {
                resKandidat.data.forEach(item => {
                    const row = { ...item };
                    row["Nama Lengkap"] = row.nama_lengkap || row["Nama Lengkap"] || '-';
                    row["Alamat Email"] = row.email || row["Alamat Email"] || '-';
                    row["No WhatsApp"] = row.no_wa || row["No WhatsApp"] || '-';
                    row["Waktu Mulai"] = row.waktu_mulai || row["Waktu Mulai"] || (row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-');
                    row["Waktu Selesai"] = row.waktu_selesai || row["Waktu Selesai"] || '-';

                    if (row.hasil_pauli) {
                        try {
                            const p = typeof row.hasil_pauli === 'string' ? JSON.parse(row.hasil_pauli) : row.hasil_pauli;
                            row["Total Pauli"] = p.total_pengerjaan || p.total || p.jawaban_benar || 0;
                            row["Jawaban Salah"] = p.jawaban_salah || p.salah || 0;
                            if (p.garis_interval) {
                                row["Garis Interval (3 Menit)"] = Array.isArray(p.garis_interval) ? p.garis_interval.join(',') : p.garis_interval;
                            }
                        } catch (e) {}
                    }
                    combinedData.push(row);
                });
            }
        } catch (errKandidat) {
            console.warn('Tabel kandidat_psikotes:', errKandidat);
        }

        // Helper normalisasi nomor WhatsApp untuk pencocokan akurat (08xxx dan 628xxx)
        const normalizeWaNumber = (phone) => {
            if (!phone) return '';
            let digits = String(phone).replace(/[^0-9]/g, '');
            if (digits.startsWith('62')) digits = '0' + digits.slice(2);
            return digits;
        };

        // Helper mencocokkan apakah dua catatan adalah kandidat yang sama
        const isCandidateMatch = (a, b) => {
            if (!a || !b) return false;
            if (a.id && b.id && String(a.id) === String(b.id)) return true;

            const isRealEmail = (e) => e && e !== '-' && !e.includes('altrak1978.co.id') && e.includes('@');
            const emA = (a["Alamat Email"] || a.email || '').toString().trim().toLowerCase();
            const emB = (b["Alamat Email"] || b.email || '').toString().trim().toLowerCase();
            if (isRealEmail(emA) && isRealEmail(emB) && emA === emB) return true;

            const waA = normalizeWaNumber(a["No WhatsApp"] || a.no_wa);
            const waB = normalizeWaNumber(b["No WhatsApp"] || b.no_wa);
            if (waA && waB && waA.length >= 8 && waB.length >= 8) {
                if (waA === waB || waA.slice(-8) === waB.slice(-8)) return true;
            }

            const nmA = (a["Nama Lengkap"] || a.nama_lengkap || '').toString().trim().toLowerCase();
            const nmB = (b["Nama Lengkap"] || b.nama_lengkap || '').toString().trim().toLowerCase();
            const isGenericName = (n) => !n || n === '-' || n === 'peserta' || n === 'peserta ujian';
            if (!isGenericName(nmA) && !isGenericName(nmB) && nmA === nmB) {
                if (isRealEmail(emA) && isRealEmail(emB) && emA !== emB) return false;
                return true;
            }

            return false;
        };

        // Helper menggabungkan seluruh data tes ke satu baris kandidat tunggal
        const mergeCandidateRecords = (target, source) => {
            if ((!target["Nama Lengkap"] || target["Nama Lengkap"] === '-' || target["Nama Lengkap"].toLowerCase().includes('peserta')) && source["Nama Lengkap"]) {
                target["Nama Lengkap"] = source["Nama Lengkap"];
            }
            if ((!target["Alamat Email"] || target["Alamat Email"].includes('altrak1978.co.id')) && source["Alamat Email"] && !source["Alamat Email"].includes('altrak1978.co.id')) {
                target["Alamat Email"] = source["Alamat Email"];
                target.email = source["Alamat Email"];
            }
            if ((!target["No WhatsApp"] || target["No WhatsApp"] === '-') && source["No WhatsApp"] && source["No WhatsApp"] !== '-') {
                target["No WhatsApp"] = source["No WhatsApp"];
                target.no_wa = source["No WhatsApp"];
            }
            if (!target.hasil_ist && source.hasil_ist) target.hasil_ist = source.hasil_ist;
            if (!target.hasil_pauli && source.hasil_pauli) target.hasil_pauli = source.hasil_pauli;

            const pauliTotal = Number(source["Total Pauli"] || 0);
            if ((!target["Total Pauli"] || Number(target["Total Pauli"]) === 0) && pauliTotal > 0) {
                target["Total Pauli"] = pauliTotal;
                target["Jawaban Benar"] = Number(source["Jawaban Benar"] || 0);
                target["Jawaban Salah"] = Number(source["Jawaban Salah"] || 0);
            }
            if (!target["Garis Interval (3 Menit)"] && source["Garis Interval (3 Menit)"]) {
                target["Garis Interval (3 Menit)"] = source["Garis Interval (3 Menit)"];
            }
            if ((!target["Waktu Selesai"] || target["Waktu Selesai"] === '-') && source["Waktu Selesai"] && source["Waktu Selesai"] !== '-') {
                target["Waktu Selesai"] = source["Waktu Selesai"];
            }
        };

        // 2. Ambil dari tabel lama (hasil_psikotes_kandidat) jika ada dan satukan ke data kandidat yang cocok
        try {
            const resOld = await sb
                .from('hasil_psikotes_kandidat')
                .select('*')
                .order('id', { ascending: false });

            if (!resOld.error && resOld.data && resOld.data.length > 0) {
                resOld.data.forEach(item => {
                    const existing = combinedData.find(c => isCandidateMatch(c, item));
                    if (existing) {
                        mergeCandidateRecords(existing, item);
                    } else {
                        combinedData.push(item);
                    }
                });
            }
        } catch (errOld) {}

        // 3. Deduplikasi ketat: Setiap kandidat hanya muncul TEPAT 1 KALI di tabel HRD
        const uniqueData = [];
        combinedData.forEach(row => {
            const existing = uniqueData.find(u => isCandidateMatch(u, row));
            if (existing) {
                mergeCandidateRecords(existing, row);
            } else {
                uniqueData.push(row);
            }
        });

        cachedHrdData = uniqueData;
        const searchInput = document.getElementById('hrdSearchInput');
        if (searchInput) searchInput.value = '';
        filterHrdTable();
    } catch (err) {
        console.error('Gagal mengambil data HRD:', err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-red-400">Gagal mengambil data dari database server. Periksa koneksi internet Anda.</td></tr>`;
        }
    }
}

/**
 * Mengekspor seluruh data hasil tes kandidat ke file Excel (.csv) dengan sanitasi CSV Injection
 */
function exportHrdToExcel() {
    if (!cachedHrdData || cachedHrdData.length === 0) {
        customAlert("Data Kosong", "Tidak ada data kandidat untuk diekspor.", "error");
        return;
    }

    let headers = [
        "ID", "Waktu Mulai", "Waktu Selesai", "Nama Lengkap", "Alamat Email", "No WhatsApp",
        "Total Pauli", "Jawaban Salah", "Rata-Rata", "% Salah", "% Penyimpangan", "Total Simpangan (Interval 3-18)", "Tinggi", "Tempat Puncak"
    ];
    for (let i = 1; i <= 20; i++) headers.push(`Interval ${i}`);
    let csvLines = [headers.join(",")];

    cachedHrdData.forEach(row => {
        let intervals = (row["Garis Interval (3 Menit)"] || "").split(',').map(n => n.trim());
        while (intervals.length < 20) intervals.push("0");
        let parsedNums = intervals.map(n => parseInt(n) || 0);

        let jumlah = Number(row["Total Pauli"] || 0);
        let salah = Number(row["Jawaban Salah"] || 0);
        let rRata = (jumlah / 20);

        let pSalah = 0;
        if (jumlah > 0) {
            if (jumlah <= 1000) pSalah = (salah / jumlah) * 100;
            else if (jumlah <= 4000) pSalah = (salah / 400) * 100;
            else pSalah = (salah / 500) * 100;
        }

        let totDev = 0;
        if (parsedNums.length >= 18 && parsedNums.some(v => v > 0)) {
            for (let i = 2; i < 18; i++) totDev += Math.abs(parsedNums[i] - rRata);
        }
        let pDev = rRata > 0 ? ((totDev / 16) * (100 / rRata)) : 0;
        let tTinggi = Math.max(...parsedNums);
        let tPuncak = tTinggi > 0 ? (parsedNums.indexOf(tTinggi) + 1) : "-";

        // Cegah formula injection pada CSV (Formula injection protection)
        const sanitizeForCsv = (val) => {
            if (val === null || val === undefined) return '""';
            let str = String(val).replace(/"/g, '""');
            if (/^[=+@-]/.test(str)) {
                str = "'" + str; // Prefix tanda kutip tunggal jika diawali simbol formula
            }
            return `"${str}"`;
        };

        let rowData = [
            row.id,
            sanitizeForCsv(row["Waktu Mulai"]),
            sanitizeForCsv(row["Waktu Selesai"]),
            sanitizeForCsv(row["Nama Lengkap"]),
            sanitizeForCsv(row["Alamat Email"]),
            sanitizeForCsv(row["No WhatsApp"]),
            jumlah,
            salah,
            `"${rRata.toFixed(1)}"`,
            `"${pSalah.toFixed(1)} %"`,
            `"${pDev.toFixed(1)} %"`,
            `"${totDev.toFixed(1)}"`,
            tTinggi,
            `"${tPuncak}"`,
            ...intervals.slice(0, 20)
        ];
        csvLines.push(rowData.join(","));
    });

    const blob = new Blob(["\uFEFF" + csvLines.join("\r\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Psikotes_Altrak_1978_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Membuka modal grafik kurva performa kerja kandidat per interval 3 menit
 * Menggunakan rumus resmi HRD PT Altrak 1978:
 * - Rata-rata = Total Pengerjaan / 20
 * - % Salah = berdasarkan rentang total (0-1000, 1001-4000, >4000)
 * - % Penyimpangan = (Total / 16) * (100 / Rata-rata) %
 * @param {number} index Index kandidat pada cachedHrdData
 */
function viewCandidateChart(index) {
    const row = cachedHrdData[index];
    if (!row) return;

    currentSelectedCandidate = row;

    // Render data ke masing-masing tab asesmen (urutan: IST, PAPI, DISC, Pauli)
    renderIstResults(row.hasil_ist);
    renderPapiResults(row.hasil_papi);
    renderDiscResults(row.hasil_disc);
    switchHrdTab('ist');

    const rptName = document.getElementById('rptName');
    const rptWa = document.getElementById('rptWa');
    const rptDate = document.getElementById('rptDate');

    if (rptName) rptName.innerText = row["Nama Lengkap"] || '-';
    if (rptWa) rptWa.innerText = row["No WhatsApp"] || '-';
    
    let rawDate = row["Waktu Selesai"] || '-';
    if (rptDate) rptDate.innerText = rawDate.split(',')[0];

    let intervalString = row["Garis Interval (3 Menit)"] || "";
    let parsedData = [];
    if (intervalString) {
        parsedData = intervalString.split(',').map(num => parseInt(num.trim()) || 0);
    }
    while (parsedData.length < 20) parsedData.push(0);

    // =========================================================================
    // RUMUS RESMI HRD PT ALTRAK 1978 - SKORING PAULI TEST
    // =========================================================================
    let jumlah = Number(row["Total Pauli"] || 0);
    let salah = Number(row["Jawaban Salah"] || 0);

    // 1. Rata-rata = Total Pengerjaan / 20
    let rataRata = jumlah / 20;

    // 2. Persentase Salah (%) — berdasarkan rentang total pengerjaan
    let pctSalah = 0;
    if (jumlah > 0) {
        if (jumlah <= 1000) {
            pctSalah = (salah / jumlah) * 100;
        } else if (jumlah <= 4000) {
            pctSalah = (salah / 400) * 100;
        } else {
            pctSalah = (salah / 500) * 100;
        }
    }

    // 3. Persentase Penyimpangan (%)
    // Berdasarkan pedoman psikodiagnostik Pauli & lembar penilaian HRD resmi:
    // - Rata-rata Simpangan = Total Simpangan (16 kolom kurun waktu standar 3-18) / 16
    // - % Penyimpangan = (Rata-rata Simpangan / Rata-rata Prestasi) * 100%
    //                  = (Total Simpangan / 16) * (100 / Rata-rata)
    // Rentang norma: <= 2.5% (Stabil), 2.6 - 4.0% (Normal), >= 4.1% (Fluktuatif)
    let totalPenyimpangan = 0;
    const hasIntervals = parsedData && parsedData.some(val => val > 0);
    if (hasIntervals) {
        if (parsedData.length >= 18) {
            for (let i = 2; i < 18; i++) {
                totalPenyimpangan += Math.abs(parsedData[i] - rataRata);
            }
        } else {
            parsedData.forEach(val => {
                totalPenyimpangan += Math.abs(val - rataRata);
            });
        }
    }

    let pctPenyimpangan = 0;
    if (rataRata > 0) {
        if (hasIntervals && totalPenyimpangan > 0) {
            pctPenyimpangan = (totalPenyimpangan / 16) * (100 / rataRata);
        } else {
            // Fallback rumus literal jika data interval tidak tersedia
            pctPenyimpangan = (jumlah / 16) * (100 / rataRata);
        }
    }

    const totalPenyimpanganDisplay = document.getElementById('rptTotalPenyimpangan');
    if (totalPenyimpanganDisplay) {
        totalPenyimpanganDisplay.innerText = hasIntervals
            ? totalPenyimpangan.toFixed(1)
            : 'Data interval tidak tersedia';
    }

    // 4. Tinggi (nilai interval tertinggi)
    let tinggi = Math.max(...parsedData);

    // 5. Tempat Puncak (posisi interval dengan nilai tertinggi, 1-indexed)
    let tempatPuncak = '-';
    if (tinggi > 0) {
        let puncakIndices = [];
        parsedData.forEach((val, i) => {
            if (val === tinggi) puncakIndices.push(i + 1);
        });
        tempatPuncak = puncakIndices.join(', ');
    }

    // =========================================================================
    // RENDER METRIK SKORING KE UI
    // =========================================================================
    const elJumlah = document.getElementById('rptJumlah');
    const elSalah = document.getElementById('rptSalah');
    const elAvg = document.getElementById('rptAvg');
    const elPctSalah = document.getElementById('rptPctSalah');
    const elPctPenyimpangan = document.getElementById('rptPctPenyimpangan');
    const elTinggi = document.getElementById('rptTinggi');
    const elTempatPuncak = document.getElementById('rptTempatPuncak');

    if (elJumlah) elJumlah.innerText = jumlah.toLocaleString('id-ID');
    if (elSalah) elSalah.innerText = salah;
    if (elAvg) elAvg.innerText = rataRata.toFixed(1);
    if (elPctSalah) elPctSalah.innerText = pctSalah.toFixed(1) + ' %';
    if (elPctPenyimpangan) elPctPenyimpangan.innerText = pctPenyimpangan.toFixed(1) + ' %';
    if (elTinggi) elTinggi.innerText = tinggi;
    if (elTempatPuncak) elTempatPuncak.innerText = tempatPuncak;

    // =========================================================================
    // EVALUASI OTOMATIS BERDASARKAN TABEL NORMA SKORING HRD
    // =========================================================================
    function getEvalClass(val, goodUp, normalLow, normalHigh) {
        if (val >= goodUp) return { label: '↑ Baik', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
        if (val >= normalLow && val < goodUp) return { label: 'Normal', cls: 'text-blue-600 bg-blue-50 border-blue-200' };
        return { label: '↓ Kurang', cls: 'text-red-600 bg-red-50 border-red-200' };
    }
    function getEvalClassInverse(val, goodDown, normalHigh) {
        if (val <= goodDown) return { label: '↓ Baik', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
        if (val <= normalHigh) return { label: 'Normal', cls: 'text-blue-600 bg-blue-50 border-blue-200' };
        return { label: '↑ Kurang', cls: 'text-red-600 bg-red-50 border-red-200' };
    }

    const evalJumlah = getEvalClass(jumlah, 3000, 2350, 3000);
    const evalRata = getEvalClass(rataRata, 167.5, 117.5, 167.5);
    const evalSalah = getEvalClassInverse(pctSalah, 0.5, 1.5);
    const evalPenyimpangan = getEvalClassInverse(pctPenyimpangan, 2.5, 4.0);
    const evalTinggi = getEvalClass(tinggi, 58, 36, 58);

    // Evaluasi tempat puncak (13-18 normal, 19 baik, 12↓ dan 20 kurang)
    let evalPuncak = { label: '-', cls: 'text-slate-500 bg-slate-50 border-slate-200' };
    if (tinggi > 0) {
        const firstPeak = parsedData.indexOf(tinggi) + 1;
        if (firstPeak === 19) evalPuncak = { label: '↑ Baik', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
        else if (firstPeak >= 13 && firstPeak <= 18) evalPuncak = { label: 'Normal', cls: 'text-blue-600 bg-blue-50 border-blue-200' };
        else evalPuncak = { label: '↓ Kurang', cls: 'text-red-600 bg-red-50 border-red-200' };
    }

    // Render badge evaluasi
    const badges = [
        { id: 'evalJumlah', data: evalJumlah },
        { id: 'evalRata', data: evalRata },
        { id: 'evalSalah', data: evalSalah },
        { id: 'evalPenyimpangan', data: evalPenyimpangan },
        { id: 'evalTinggi', data: evalTinggi },
        { id: 'evalPuncak', data: evalPuncak },
    ];
    badges.forEach(b => {
        const el = document.getElementById(b.id);
        if (el) {
            el.innerText = b.data.label;
            el.className = `inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${b.data.cls}`;
        }
    });

    // =========================================================================
    // RENDER TABEL INTERVAL (20 Kolom) + GARIS RATA-RATA (MEAN)
    // =========================================================================
    const lblTr = document.getElementById('rptIntervalLabels');
    const dataTr = document.getElementById('rptIntervalData');
    const meanTr = document.getElementById('rptIntervalMean');
    if (lblTr && dataTr) {
        let lblHtml = '<th class="px-2 py-2.5 w-[8%] border-r border-slate-200 bg-slate-100 text-slate-600 font-bold">WAKTU</th>';
        let dataHtml = '<td class="px-2 py-2.5 border-r border-slate-200 text-left font-black text-[#003865] bg-white">JUMLAH</td>';
        let meanHtml = '<td class="px-2 py-2.5 border-r border-slate-200 text-left font-black text-amber-700 bg-amber-50/50">MEAN</td>';

        parsedData.forEach((val, i) => {
            const isMax = val === tinggi && tinggi > 0;
            lblHtml += `<th class="px-2 py-2.5 w-[5%] border-r border-slate-200 last:border-0 bg-slate-100 text-slate-600 font-bold">${i + 1}</th>`;
            dataHtml += `<td class="px-2 py-2.5 border-r border-slate-200 last:border-0 bg-white ${isMax ? 'text-emerald-700 font-black bg-emerald-50/60' : 'text-slate-800'}">${val}</td>`;
            if (meanTr) meanHtml += `<td class="px-2 py-2.5 border-r border-slate-200 last:border-0 text-amber-700 bg-amber-50/30 font-semibold">${rataRata.toFixed(1)}</td>`;
        });

        lblTr.innerHTML = lblHtml;
        dataTr.innerHTML = dataHtml;
        if (meanTr) meanTr.innerHTML = meanHtml;
    }

    // =========================================================================
    // RENDER GRAFIK CHART.JS DENGAN GARIS RATA-RATA
    // =========================================================================
    const modalChart = document.getElementById('modal-hrd-chart');
    if (modalChart) {
        modalChart.classList.remove('hide-section');
        modalChart.style.display = 'flex';
    }

    let dynamicMin = 0;
    let dynamicMax = tinggi > 0 ? (Math.ceil((tinggi + 10) / 10) * 10) : 50;

    const canvas = document.getElementById('hrdPauliChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (hrdChartInstance) hrdChartInstance.destroy();

    // Menggunakan warna korporat PT Altrak 1978 (#003865) pada kurva grafik
    hrdChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 20 }, (_, i) => i + 1),
            datasets: [
                {
                    label: 'Jawaban per Interval',
                    data: parsedData,
                    borderColor: '#003865',
                    backgroundColor: 'rgba(0, 56, 101, 0.08)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#003865',
                    pointBorderWidth: 2.5,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Rata-rata (' + rataRata.toFixed(1) + ')',
                    data: Array(20).fill(rataRata),
                    borderColor: '#f5b300',
                    borderWidth: 2,
                    borderDash: [8, 4],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 0 },
            scales: {
                x: {
                    grid: { color: '#f1f5f9', tickLength: 0 },
                    ticks: { color: '#64748b', font: { family: 'sans-serif' } },
                    border: { display: false }
                },
                y: {
                    min: dynamicMin,
                    max: dynamicMax,
                    grid: { color: '#e2e8f0', tickLength: 0 },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'sans-serif' },
                        stepSize: 10
                    },
                    border: { display: false }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        font: { size: 11, weight: 'bold' }
                    }
                },
                tooltip: {
                    backgroundColor: '#003865',
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 14, weight: 'bold' },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        title: function (context) { return 'Interval ' + context[0].label; },
                        label: function (context) {
                            if (context.datasetIndex === 1) return 'Rata-rata: ' + rataRata.toFixed(1);
                            return 'Menjawab: ' + context.raw + ' soal';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Menghapus seluruh data lama di web HRD dan mereset ID kembali ke 1
 */
async function hapusSemuaData() {
    customAlert(
        "Konfirmasi Hapus Data",
        "Apakah Anda yakin ingin menghapus SEMUA data hasil tes peserta?\nSemua riwayat akan dikosongkan dan nomor urut ID akan direset kembali ke 1.",
        "error",
        true,
        async () => {
            try {
                const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
                    ? supabaseClient
                    : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

                if (!sb) {
                    customAlert("Koneksi Terputus", "Koneksi ke database Supabase tidak tersedia.", "error");
                    return;
                }

                // 1. Jalankan pemanggilan fungsi RPC bawaan
                try {
                    await sb.rpc('hapus_semua_data');
                } catch (eRpc) {
                    console.warn("Catatan RPC hapus_semua_data:", eRpc);
                }

                // 2. Tambahan: Hapus data langsung dengan filter WHERE agar lolos dari proteksi database server
                try {
                    await sb
                        .from('kandidat_psikotes')
                        .delete()
                        .not('id', 'is', null);
                } catch (e1) {
                    console.warn("Hapus kandidat_psikotes:", e1);
                }

                // Hapus data dari tabel lama hasil_psikotes_kandidat jika ada
                try {
                    await sb
                        .from('hasil_psikotes_kandidat')
                        .delete()
                        .not('id', 'is', null);
                } catch (e2) {
                    console.warn("Hapus hasil_psikotes_kandidat:", e2);
                }

                localStorage.removeItem('hasil_psikotes_local');
                cachedHrdData = [];

                customAlert("Berhasil Dikosongkan", "Semua riwayat hasil tes peserta telah berhasil dikosongkan.", "success");
                await loadHrdData();
            } catch (err) {
                console.error("Gagal mengosongkan data:", err);
                customAlert("Gagal Menghapus Data", "Terjadi kesalahan saat menghapus data: " + (err.message || err), "error");
            }
        }
    );
}

// =========================================================================
// FITUR TAB LAPORAN TERPADU 4 TES & DOKUMENTASI FOTO PENGAWASAN
// =========================================================================
let currentSelectedCandidate = null;

/**
 * Berpindah antar tab hasil tes (Pauli, IST, PAPI, DISC, Foto)
 * @param {'pauli'|'ist'|'papi'|'disc'|'foto'} tabId 
 */
function switchHrdTab(tabId) {
    const tabs = ['pauli', 'ist', 'papi', 'disc', 'foto'];
    tabs.forEach(t => {
        const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
        const panel = document.getElementById('panelTab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) {
            if (t === tabId) {
                btn.className = "hrd-tab-btn active px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-[#003865] text-white shadow-sm";
            } else {
                btn.className = "hrd-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200";
            }
        }
        if (panel) {
            if (t === tabId) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        }
    });

    if (tabId === 'pauli' && hrdChartInstance) {
        setTimeout(() => {
            hrdChartInstance.resize();
        }, 50);
    }

    if (tabId === 'foto' && currentSelectedCandidate) {
        renderCandidatePhotos(currentSelectedCandidate);
    }

    if (tabId === 'papi' && currentSelectedCandidate) {
        renderPapiResults(currentSelectedCandidate.hasil_papi);
    }
}

/**
 * Merender rincian nilai 9 Subtes IST, Skor IQ, dan Kategori Kecerdasan
 * @param {Object|string} hasilIst 
 */
function renderIstResults(hasilIst) {
    const iqEl = document.getElementById('istRptIq');
    const katEl = document.getElementById('istRptKategori');
    const benarEl = document.getElementById('istRptTotalBenar');
    const subtesEl = document.getElementById('istRptSubtesSelesai');
    const tbody = document.getElementById('istSubtesTableBody');

    if (!hasilIst) {
        if (iqEl) iqEl.innerText = "-";
        if (katEl) katEl.innerText = "Belum Ada Nilai";
        if (benarEl) benarEl.innerText = "0";
        if (subtesEl) subtesEl.innerText = "0 / 9";
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-slate-400">Data hasil tes IST belum tersedia untuk peserta ini.</td></tr>`;
        return;
    }

    let parsed = null;
    try {
        parsed = typeof hasilIst === 'string' ? JSON.parse(hasilIst) : hasilIst;
    } catch (e) {
        console.warn("Format data hasil IST tidak valid:", e);
    }

    if (!parsed) {
        if (iqEl) iqEl.innerText = "-";
        if (katEl) katEl.innerText = "Format Data Rusak";
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-red-400">Format data hasil tes IST tidak valid.</td></tr>`;
        return;
    }

    const subtestsMeta = [
        { code: '01', name: 'SE (Satzergaenzung)', aspect: 'Melengkapi Kalimat (Berpikir Konkrit)', total: 20 },
        { code: '02', name: 'WA (Wortauswahl)', aspect: 'Mencari Hubungan Kata (Fleksibilitas)', total: 20 },
        { code: '03', name: 'AN (Analogien)', aspect: 'Analogi Verbal (Daya Nalar)', total: 20 },
        { code: '04', name: 'GE (Gemeinsamkeiten)', aspect: 'Persamaan Kata (Abstraksi Konseptual)', total: 16 },
        { code: '05', name: 'RA (Rechenaufgaben)', aspect: 'Hitungan Praktis (Daya Hitung)', total: 20 },
        { code: '06', name: 'ZR (Zahlenreihen)', aspect: 'Deret Angka (Logika Numerik)', total: 20 },
        { code: '07', name: 'FA (Figurenauswahl)', aspect: 'Memilih Bentuk (Imajinasi Spasial 2D)', total: 20 },
        { code: '08', name: 'WU (Wuerfelaufgaben)', aspect: 'Analisis Balok/Kubus (Spasial 3D)', total: 20 },
        { code: '09', name: 'ME (Merkaufgaben)', aspect: 'Daya Ingat & Hafalan Kata', total: 20 }
    ];

    let totalBenarAkumulasi = 0;
    let subtesSelesaiCount = 0;
    let rowsHtml = '';

    subtestsMeta.forEach(meta => {
        let subtesData = null;
        if (parsed.subtes_detail && parsed.subtes_detail[meta.code]) {
            subtesData = parsed.subtes_detail[meta.code];
        } else if (parsed[`subtes_${meta.code}`] || parsed[`soal_${meta.code}`]) {
            subtesData = parsed[`subtes_${meta.code}`] || parsed[`soal_${meta.code}`];
        } else if (Array.isArray(parsed)) {
            subtesData = parsed.find(s => s.subtes_id === `subtes_${meta.code}` || s.subtes_id === `soal_${meta.code}`);
        }

        let benar = 0;
        let salah = 0;
        let kosong = meta.total;
        let rw = 0;

        if (subtesData) {
            subtesSelesaiCount++;
            if (subtesData.ringkasan_skor) {
                benar = subtesData.ringkasan_skor.total_benar || 0;
                salah = subtesData.ringkasan_skor.total_salah || 0;
                kosong = subtesData.ringkasan_skor.kosong !== undefined ? subtesData.ringkasan_skor.kosong : (meta.total - benar - salah);
            } else if (subtesData.skor_rw !== undefined) {
                benar = subtesData.skor_rw;
                salah = meta.total - benar;
                kosong = 0;
            }
            rw = benar;
            totalBenarAkumulasi += benar;
        }

        const pct = Math.round((benar / meta.total) * 100);

        rowsHtml += `
            <tr class="hover:bg-slate-50/60 transition">
                <td class="py-3 px-4 font-bold text-slate-800">${escapeHtml(meta.name)}</td>
                <td class="py-3 px-4 text-xs text-slate-500">${escapeHtml(meta.aspect)}</td>
                <td class="py-3 px-4 text-center font-bold text-emerald-600">${benar}</td>
                <td class="py-3 px-4 text-center font-bold text-red-500">${salah}</td>
                <td class="py-3 px-4 text-center text-slate-400">${kosong}</td>
                <td class="py-3 px-4 text-center font-black text-[#003865]">${rw}</td>
                <td class="py-3 px-4 text-center font-bold text-blue-600">${pct}%</td>
            </tr>
        `;
    });

    if (tbody) tbody.innerHTML = rowsHtml;
    if (benarEl) benarEl.innerText = totalBenarAkumulasi;
    if (subtesEl) subtesEl.innerText = `${subtesSelesaiCount} / 9`;

    let calculatedIq = parsed.skor_iq || (90 + Math.round((totalBenarAkumulasi / 176) * 40));
    if (totalBenarAkumulasi === 0) calculatedIq = 0;

    let kategoriIq = "Belum Ada Nilai";
    if (calculatedIq >= 130) kategoriIq = "Sangat Cerdas (Very Superior)";
    else if (calculatedIq >= 120) kategoriIq = "Cerdas (Superior)";
    else if (calculatedIq >= 110) kategoriIq = "Di Atas Rata-rata (High Average)";
    else if (calculatedIq >= 90) kategoriIq = "Rata-rata (Average)";
    else if (calculatedIq >= 80) kategoriIq = "Di Bawah Rata-rata (Low Average)";
    else if (calculatedIq > 0) kategoriIq = "Batas Keterbatasan (Borderline)";

    if (iqEl) iqEl.innerText = calculatedIq > 0 ? calculatedIq : "-";
    if (katEl) katEl.innerText = kategoriIq;
}

// =========================================================================
// MODUL INTERPRETASI PAPI KOSTICK (RODA 20 ASPEK & TABEL EVALUASI)
// =========================================================================

/**
 * Narasi interpretasi 4 tingkat skor untuk 20 aspek PAPI Kostick
 * Bahasa Indonesia netral, objektif menggambarkan kecenderungan kerja tanpa diagnosis
 */
const PAPI_NARRATIVES = {
    N: {
        rendah: "Cenderung fleksibel terhadap penyelesaian tugas, nyaman mendelegasikan atau beralih ke tugas lain sebelum tugas sebelumnya tuntas secara mandiri.",
        sedang: "Memiliki dorongan yang wajar untuk menuntaskan pekerjaan sesuai jadwal dan prioritas yang telah ditentukan.",
        tinggi: "Memiliki komitmen kuat untuk menuntaskan setiap pekerjaan yang dimulai sebelum berpindah ke aktivitas lainnya.",
        sangat_tinggi: "Sangat fokus dan gigih menyelesaikan tugas hingga tuntas, enggan berhenti sebelum pekerjaan selesai secara menyeluruh."
    },
    G: {
        rendah: "Bekerja dengan ritme santai dan terukur, lebih mengutamakan efisiensi tenaga daripada jam kerja yang panjang.",
        sedang: "Menunjukkan etos kerja yang stabil dan memadai untuk memenuhi tuntutan tugas sehari-hari.",
        tinggi: "Memiliki dorongan kerja yang intens, bersedia meluangkan waktu dan tenaga ekstra demi kelancaran pekerjaan.",
        sangat_tinggi: "Menampilkan dedikasi kerja yang sangat tinggi dan intensitas tenaga maksimal dalam menyelesaikan beban kerja berat."
    },
    A: {
        rendah: "Puas dengan pencapaian yang realistis dan stabil, tidak terlalu terdorong untuk bersaing secara agresif.",
        sedang: "Menunjukkan motivasi pencapaian target yang seimbang dengan kemampuan dan standar yang berlaku.",
        tinggi: "Memiliki ambisi untuk mencapai target kerja tinggi dan menunjukkan hasil kerja yang menonjol.",
        sangat_tinggi: "Sangat berorientasi pada target tinggi dan terus mencari tantangan baru untuk membuktikan pencapaian prestasi."
    },
    L: {
        rendah: "Lebih nyaman berperan sebagai anggota tim pelaksana daripada mengambil kendali kepemimpinan formal.",
        sedang: "Mampu memimpin kelompok pada situasi tertentu saat dibutuhkan atau ditugaskan.",
        tinggi: "Secara alami mengambil inisiatif untuk memimpin, mengarahkan, dan mengoordinasikan aktivitas kelompok.",
        sangat_tinggi: "Sangat percaya diri dalam peran memimpin dan secara aktif berusaha memegang kendali kepemimpinan dalam berbagai situasi."
    },
    P: {
        rendah: "Cenderung membiarkan orang lain bekerja mandiri tanpa banyak intervensi atau pengawasan ketat.",
        sedang: "Memberikan arahan dan pengawasan secukupnya sesuai dengan tanggung jawab yang diembannya.",
        tinggi: "Memiliki dorongan yang kuat untuk mengendalikan proses kerja dan memastikan orang lain mengikuti arahannya.",
        sangat_tinggi: "Sangat dominan dalam mengatur, mengarahkan, dan mengawasi setiap langkah kerja orang lain di sekitarnya."
    },
    I: {
        rendah: "Berhati-hati dan membutuhkan banyak pertimbangan serta data sebelum berani menetapkan keputusan.",
        sedang: "Mengambil keputusan dengan waktu pertimbangan yang wajar berdasarkan informasi yang tersedia.",
        tinggi: "Cepat dan tanggap dalam menentukan pilihan atau mengambil keputusan dalam situasi kerja.",
        sangat_tinggi: "Sangat spontan dan berani mengambil keputusan secara instan, bahkan dalam kondisi dengan informasi terbatas."
    },
    T: {
        rendah: "Bekerja dengan ritme yang tenang, terukur, dan tidak terburu-buru demi menjaga kecermatan.",
        sedang: "Memiliki tempo kerja yang adaptif, dapat menyesuaikan kecepatan sesuai tenggat waktu yang ada.",
        tinggi: "Bekerja dengan tempo cepat, dinamis, dan cekatan dalam menyelesaikan berbagai tugas rutin.",
        sangat_tinggi: "Menampilkan ritme kerja yang sangat cepat dan mobilitas tinggi dalam menyelesaikan banyak hal secara simultan."
    },
    V: {
        rendah: "Cenderung menyukai aktivitas kerja yang menetap di meja dan tidak membutuhkan banyak aktivitas fisik.",
        sedang: "Memiliki stamina dan energi fisik yang memadai untuk aktivitas kerja rutin harian.",
        tinggi: "Memiliki vitalitas dan energi fisik yang tinggi, menyukai aktivitas kerja yang dinamis dan aktif bergerak.",
        sangat_tinggi: "Menampilkan stamina kerja yang melimpah dan sangat antusias dalam aktivitas yang menuntut energi fisik besar."
    },
    X: {
        rendah: "Lebih nyaman bekerja di balik layar tanpa perlu menjadi pusat perhatian atau sorotan orang lain.",
        sedang: "Menerima pengakuan secara wajar tanpa secara khusus berusaha mencari perhatian publik.",
        tinggi: "Menyukai pengakuan publik dan senang tampil menonjol atau berbicara di hadapan banyak orang.",
        sangat_tinggi: "Sangat termotivasi untuk menjadi pusat perhatian dan mencari pengakuan luas atas eksistensi dan kinerjanya."
    },
    S: {
        rendah: "Cenderung tertutup dan selektif dalam berinteraksi, lebih nyaman bekerja mandiri daripada bergaul luas.",
        sedang: "Mampu membina komunikasi sosial yang cukup baik dengan rekan kerja sesuai kebutuhan kerja.",
        tinggi: "Mudah bergaul, ramah, dan menikmati interaksi sosial dengan berbagai kalangan di lingkungan kerja.",
        sangat_tinggi: "Sangat ekstrovert, aktif memperluas jejaring sosial, dan senantiasa menikmati keramaian interaksi antarindividu."
    },
    B: {
        rendah: "Mandiri dalam bertindak, tidak merasa harus selalu tergabung atau terikat dalam kelompok tertentu.",
        sedang: "Dapat bekerja sama dalam kelompok secara baik tanpa kehilangan kemandirian pribadi.",
        tinggi: "Menghargai kebersamaan dan merasa lebih nyaman serta termotivasi saat menjadi bagian dari tim yang solid.",
        sangat_tinggi: "Sangat mengutamakan keterikatan kelompok dan mengandalkan dukungan kelompok dalam menjalankan aktivitas kerja."
    },
    O: {
        rendah: "Menjaga batas profesional yang tegas dalam hubungan kerja, tidak mengedepankan kelekatan emosional.",
        sedang: "Menjalin relasi kerja yang hangat dan menyenangkan dengan tetap menjaga batas-batas profesional.",
        tinggi: "Menghargai hubungan personal yang dekat, hangat, dan penuh empati dengan rekan kerja di sekitarnya.",
        sangat_tinggi: "Sangat mendambakan hubungan persahabatan yang erat dan peka terhadap penerimaan emosional dari orang lain."
    },
    R: {
        rendah: "Praktis dan pragmatis, lebih tertarik pada aplikasi langsung di lapangan daripada konsep atau teori abstrak.",
        sedang: "Mampu memadukan konsep teoritis dengan pertimbangan praktis secara seimbang.",
        tinggi: "Tertarik menganalisis konsep, gagasan mendasar, dan landasan teoritis dalam memecahkan masalah.",
        sangat_tinggi: "Sangat analitis, gemar mendalami teori, pemikiran filosofis, dan konsep-konsep abstrak sebelum bertindak."
    },
    D: {
        rendah: "Lebih berorientasi pada gambaran besar (big picture) dan menyerahkan penanganan detail teknis kepada pihak lain.",
        sedang: "Memperhatikan rincian kerja yang penting secara proporsional sesuai kebutuhan tugas.",
        tinggi: "Teliti, cermat, dan memiliki ketertarikan tinggi terhadap keakuratan data serta detail-detail kecil.",
        sangat_tinggi: "Sangat perfeksionis terhadap rincian dan data kecil, memastikan setiap komponen tersusun tanpa kekeliruan."
    },
    C: {
        rendah: "Fleksibel dan spontan dalam bekerja, kurang menyukai prosedur atau penataan yang kaku dan repetitif.",
        sedang: "Menjaga keteraturan dan sistem kerja yang memadai demi kelancaran operasional harian.",
        tinggi: "Sistematis, terencana, dan menyukai tempat kerja serta berkas yang tertata rapi sesuai susunan standar.",
        sangat_tinggi: "Sangat metodis, terstruktur rapi, dan mematuhi tata letak serta alur penataan secara disiplin dan konsisten."
    },
    Z: {
        rendah: "Menyukai stabilitas, rutinitas, dan kepastian lingkungan kerja yang mapan tanpa banyak pergantian.",
        sedang: "Mampu beradaptasi dengan perubahan yang wajar sambil tetap menjaga kestabilan alur kerja.",
        tinggi: "Menyukai variasi, perubahan suasana, dan tantangan hal-hal baru dalam aktivitas kerja sehari-hari.",
        sangat_tinggi: "Sangat dinamis, cepat jenuh pada rutinitas, dan secara aktif mencari transformasi serta variasi tugas baru."
    },
    E: {
        rendah: "Ekspresif, terbuka dalam memperlihatkan perasaan, dan dapat terpengaruh oleh suasana emosional saat bekerja.",
        sedang: "Mampu mengelola reaksi emosional secara wajar dalam menghadapi dinamika tekanan kerja.",
        tinggi: "Tenang, sabar, dan mampu mengendalikan emosi serta menjaga ketenangan dalam situasi tegang.",
        sangat_tinggi: "Sangat dingin dan terkendali, jarang memperlihatkan reaksi emosional bahkan dalam situasi yang sangat menekan."
    },
    K: {
        rendah: "Cenderung diplomatis, menghindari konflik, dan mengedepankan kompromi dalam menyelesaikan perbedaan pendapat.",
        sedang: "Mampu bersikap tegas pada saat diperlukan dengan tetap menjaga etika komunikasi yang santun.",
        tinggi: "Lugas, berani mempertahankan pendirian, dan tidak ragu menunjukkan ketegasan saat menghadapi perbedaan.",
        sangat_tinggi: "Sangat asertif dan dominan dalam adu argumen, gigih memperjuangkan prinsipnya tanpa mudah mengalah."
    },
    F: {
        rendah: "Mandiri dalam bersikap, kritis terhadap figur otoritas, dan lebih menyukai kebebasan dalam menentukan langkah.",
        sedang: "Loyal dan menghormati pimpinan dengan tetap mampu menyampaikan masukan secara profesional.",
        tinggi: "Sangat mendukung arahan pimpinan, loyal pada figur otoritas, dan berusaha menjaga hubungan baik dengan atasan.",
        sangat_tinggi: "Sangat taat dan mengutamakan keselarasan penuh dengan keinginan serta pandangan pihak yang memegang wewenang."
    },
    W: {
        rendah: "Lebih menyukai otonomi kerja, mandiri, dan merasa lebih produktif jika tidak terlalu diawasi secara ketat.",
        sedang: "Bekerja secara selaras dengan SOP yang ada dengan tingkat pengawasan operasional yang wajar.",
        tinggi: "Menyukai panduan SOP yang jelas, instruksi tertulis yang terperinci, dan kepatuhan pada regulasi organisasi.",
        sangat_tinggi: "Sangat mengandalkan pedoman resmi, arahan terstruktur, dan membutuhkan pengawasan berkala demi kepastian kerja."
    }
};

/**
 * Kunci pemetaan standar 90 butir soal PAPI Kostick untuk adapter jawaban
 */
const PAPI_ANSWER_KEY = [
    { no: 1, a: 'G', b: 'E' }, { no: 2, a: 'A', b: 'N' }, { no: 3, a: 'P', b: 'A' }, { no: 4, a: 'X', b: 'P' }, { no: 5, a: 'B', b: 'X' },
    { no: 6, a: 'O', b: 'B' }, { no: 7, a: 'Z', b: 'O' }, { no: 8, a: 'K', b: 'Z' }, { no: 9, a: 'F', b: 'K' }, { no: 10, a: 'W', b: 'F' },
    { no: 11, a: 'G', b: 'C' }, { no: 12, a: 'L', b: 'E' }, { no: 13, a: 'P', b: 'N' }, { no: 14, a: 'X', b: 'A' }, { no: 15, a: 'B', b: 'P' },
    { no: 16, a: 'O', b: 'X' }, { no: 17, a: 'Z', b: 'B' }, { no: 18, a: 'K', b: 'O' }, { no: 19, a: 'F', b: 'Z' }, { no: 20, a: 'W', b: 'K' },
    { no: 21, a: 'G', b: 'D' }, { no: 22, a: 'L', b: 'C' }, { no: 23, a: 'E', b: 'I' }, { no: 24, a: 'T', b: 'S' }, { no: 25, a: 'S', b: 'A' },
    { no: 26, a: 'O', b: 'P' }, { no: 27, a: 'Z', b: 'X' }, { no: 28, a: 'K', b: 'B' }, { no: 29, a: 'F', b: 'O' }, { no: 30, a: 'W', b: 'Z' },
    { no: 31, a: 'G', b: 'R' }, { no: 32, a: 'L', b: 'D' }, { no: 33, a: 'I', b: 'C' }, { no: 34, a: 'T', b: 'E' }, { no: 35, a: 'B', b: 'N' },
    { no: 36, a: 'O', b: 'A' }, { no: 37, a: 'Z', b: 'P' }, { no: 38, a: 'K', b: 'X' }, { no: 39, a: 'F', b: 'B' }, { no: 40, a: 'W', b: 'O' },
    { no: 41, a: 'G', b: 'S' }, { no: 42, a: 'L', b: 'R' }, { no: 43, a: 'I', b: 'D' }, { no: 44, a: 'T', b: 'C' }, { no: 45, a: 'V', b: 'E' },
    { no: 46, a: 'O', b: 'N' }, { no: 47, a: 'Z', b: 'A' }, { no: 48, a: 'K', b: 'P' }, { no: 49, a: 'F', b: 'X' }, { no: 50, a: 'W', b: 'B' },
    { no: 51, a: 'G', b: 'V' }, { no: 52, a: 'L', b: 'S' }, { no: 53, a: 'I', b: 'R' }, { no: 54, a: 'T', b: 'D' }, { no: 55, a: 'V', b: 'C' },
    { no: 56, a: 'S', b: 'E' }, { no: 57, a: 'Z', b: 'N' }, { no: 58, a: 'K', b: 'A' }, { no: 59, a: 'F', b: 'P' }, { no: 60, a: 'W', b: 'X' },
    { no: 61, a: 'G', b: 'T' }, { no: 62, a: 'L', b: 'V' }, { no: 63, a: 'S', b: 'I' }, { no: 64, a: 'T', b: 'R' }, { no: 65, a: 'V', b: 'D' },
    { no: 66, a: 'S', b: 'C' }, { no: 67, a: 'R', b: 'E' }, { no: 68, a: 'K', b: 'N' }, { no: 69, a: 'F', b: 'A' }, { no: 70, a: 'W', b: 'P' },
    { no: 71, a: 'G', b: 'I' }, { no: 72, a: 'L', b: 'T' }, { no: 73, a: 'V', b: 'I' }, { no: 74, a: 'T', b: 'S' }, { no: 75, a: 'V', b: 'R' },
    { no: 76, a: 'S', b: 'D' }, { no: 77, a: 'R', b: 'C' }, { no: 78, a: 'D', b: 'E' }, { no: 79, a: 'F', b: 'N' }, { no: 80, a: 'W', b: 'A' },
    { no: 81, a: 'G', b: 'L' }, { no: 82, a: 'L', b: 'I' }, { no: 83, a: 'I', b: 'T' }, { no: 84, a: 'T', b: 'V' }, { no: 85, a: 'S', b: 'V' },
    { no: 86, a: 'S', b: 'R' }, { no: 87, a: 'R', b: 'D' }, { no: 88, a: 'D', b: 'C' }, { no: 89, a: 'C', b: 'E' }, { no: 90, a: 'W', b: 'N' }
];

/**
 * Konfigurasi 7 Bidang PAPI Kostick (Busur Lingkaran & Warna)
 */
const PAPI_DOMAINS = [
    {
        id: 'work_direction',
        name: 'WORK DIRECTION',
        namaId: 'Arah Kerja',
        color: '#2b5c92',
        startDeg: -117,
        endDeg: -63,
        isBottom: false,
        aspects: ['N', 'G', 'A']
    },
    {
        id: 'leadership',
        name: 'LEADERSHIP',
        namaId: 'Kepemimpinan',
        color: '#3b82f6',
        startDeg: -63,
        endDeg: -9,
        isBottom: false,
        aspects: ['L', 'P', 'I']
    },
    {
        id: 'activity',
        name: 'ACTIVITY',
        namaId: 'Aktivitas',
        color: '#10b981',
        startDeg: -9,
        endDeg: 27,
        isBottom: false,
        aspects: ['T', 'V']
    },
    {
        id: 'social_nature',
        name: 'SOCIAL NATURE',
        namaId: 'Pergaulan',
        color: '#48bb78',
        startDeg: 27,
        endDeg: 99,
        isBottom: true,
        aspects: ['X', 'S', 'B', 'O']
    },
    {
        id: 'work_style',
        name: 'WORK STYLE',
        namaId: 'Gaya Kerja',
        color: '#c53030',
        startDeg: 99,
        endDeg: 153,
        isBottom: true,
        aspects: ['R', 'D', 'C']
    },
    {
        id: 'temperament',
        name: 'TEMPERAMENT',
        namaId: 'Sifat',
        color: '#dd6b20',
        startDeg: 153,
        endDeg: 207,
        isBottom: false,
        aspects: ['Z', 'E', 'K']
    },
    {
        id: 'followership',
        name: 'FOLLOWERSHIP',
        namaId: 'Ketaatan',
        color: '#434190',
        startDeg: 207,
        endDeg: 243,
        isBottom: false,
        aspects: ['F', 'W']
    }
];

/**
 * Daftar 20 Aspek berurutan searah jarum jam (idx 0 s/d 19)
 * sudut(idx) = -90 + (idx - 1) * 18
 */
const PAPI_ASPECT_LIST = [
    { code: 'N', domainId: 'work_direction', nameId: 'Kebutuhan menyelesaikan tugas', descLines: ['Need to', 'finish a task'] },
    { code: 'G', domainId: 'work_direction', nameId: 'Peranan sebagai pekerja keras', descLines: ['Role of hard', 'intense worker'] },
    { code: 'A', domainId: 'work_direction', nameId: 'Hasrat untuk berprestasi', descLines: ['Need to', 'achieve'] },
    { code: 'L', domainId: 'leadership', nameId: 'Peran sebagai pimpinan', descLines: ['Leadership', 'role'] },
    { code: 'P', domainId: 'leadership', nameId: 'Pengendalian orang lain', descLines: ['Need to', 'control others'] },
    { code: 'I', domainId: 'leadership', nameId: 'Mudah dalam mengambil keputusan', descLines: ['Ease in', 'decision making'] },
    { code: 'T', domainId: 'activity', nameId: 'Tipe selalu sibuk (Tempo kerja)', descLines: ['Pace'] },
    { code: 'V', domainId: 'activity', nameId: 'Tipe yang bersemangat', descLines: ['Vigorous', 'type'] },
    { code: 'X', domainId: 'social_nature', nameId: 'Kebutuhan untuk mendapatkan perhatian', descLines: ['Need to be', 'noticed'] },
    { code: 'S', domainId: 'social_nature', nameId: 'Pergaulan luas', descLines: ['Social', 'extension'] },
    { code: 'B', domainId: 'social_nature', nameId: 'Kebutuhan berkelompok', descLines: ['Need to', 'belong to groups'] },
    { code: 'O', domainId: 'social_nature', nameId: 'Kebutuhan untuk dekat dan menyayangi', descLines: ['Need for closeness', 'and affection'] },
    { code: 'R', domainId: 'work_style', nameId: 'Tipe teoritikal', descLines: ['Theoretical', 'type'] },
    { code: 'D', domainId: 'work_style', nameId: 'Suka pekerjaan yang terperinci', descLines: ['Interest in', 'working with details'] },
    { code: 'C', domainId: 'work_style', nameId: 'Tipe teratur', descLines: ['Organized', 'type'] },
    { code: 'Z', domainId: 'temperament', nameId: 'Hasrat untuk berubah', descLines: ['Need for', 'change'] },
    { code: 'E', domainId: 'temperament', nameId: 'Pengendalian emosi', descLines: ['Emotional', 'restraint'] },
    { code: 'K', domainId: 'temperament', nameId: 'Kebutuhan bersikap tegas / agresif', descLines: ['Need to be', 'forceful'] },
    { code: 'F', domainId: 'followership', nameId: 'Dukungan terhadap atasan', descLines: ['Need to', 'support authority'] },
    { code: 'W', domainId: 'followership', nameId: 'Kebutuhan taat pada aturan dan pengawasan', descLines: ['Need for rules', 'and supervision'] }
];

/**
 * Menggambar teks melengkung per huruf pada busur kanvas
 */
function drawCurvedDomainText(ctx, text, cx, cy, r, startDeg, endDeg, isBottom) {
    ctx.save();
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const midDeg = (startDeg + endDeg) / 2;
    const midRad = (midDeg * Math.PI) / 180;

    let totalWidth = 0;
    const charWidths = [];
    for (let i = 0; i < text.length; i++) {
        const w = ctx.measureText(text[i]).width + 1.2;
        charWidths.push(w);
        totalWidth += w;
    }

    const totalAngle = totalWidth / r;

    if (!isBottom) {
        let currentAngle = midRad - totalAngle / 2;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const w = charWidths[i];
            const charAngle = currentAngle + (w / 2) / r;
            currentAngle += w / r;

            const x = cx + r * Math.cos(charAngle);
            const y = cy + r * Math.sin(charAngle);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(charAngle + Math.PI / 2);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
    } else {
        // Balik arah penulisan untuk teks di setengah bawah (SOCIAL NATURE, WORK STYLE)
        let currentAngle = midRad + totalAngle / 2;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const w = charWidths[i];
            const charAngle = currentAngle - (w / 2) / r;
            currentAngle -= w / r;

            const x = cx + r * Math.cos(charAngle);
            const y = cy + r * Math.sin(charAngle);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(charAngle - Math.PI / 2);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
    }
    ctx.restore();
}

/**
 * Menggambar roda interpretasi PAPI Kostick 20 aspek dengan Canvas 2D murni
 * @param {string} canvasId ID elemen canvas (1300x1300)
 * @param {Object} scores Objek skor { N, G, A, L, P, I, T, V, X, S, B, O, R, D, C, Z, E, K, F, W }
 */
function drawPapiWheel(canvasId, scores) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transformasi dan bersihkan kanvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Skala logis 650x650 (2x scaling dari kanvas fisik 1300x1300 agar sangat tajam)
    ctx.scale(2, 2);
    const cx = 325;
    const cy = 325;

    const r0 = 50;
    const r9 = 165;
    const rAspectInner = 180;
    const rAspectOuter = 212;
    const rDescInner = 212;
    const rDescOuter = 250;
    const rDomainInner = 250;
    const rDomainOuter = 285;

    // 1. LAPISAN 5: Busur Nama Bidang (r ≈ 250 - 285)
    PAPI_DOMAINS.forEach(dom => {
        const aStart = ((dom.startDeg + 0.5) * Math.PI) / 180;
        const aEnd = ((dom.endDeg - 0.5) * Math.PI) / 180;

        ctx.beginPath();
        ctx.arc(cx, cy, rDomainOuter, aStart, aEnd, false);
        ctx.arc(cx, cy, rDomainInner, aEnd, aStart, true);
        ctx.closePath();
        ctx.fillStyle = dom.color;
        ctx.fill();

        // Teks nama bidang melengkung
        drawCurvedDomainText(ctx, dom.name, cx, cy, (rDomainInner + rDomainOuter) / 2, dom.startDeg, dom.endDeg, dom.isBottom);
    });

    // 2. LAPISAN 4: Kotak Deskripsi (r ≈ 212 - 250) & LAPISAN 3: Kotak Huruf Aspek (r ≈ 180 - 212)
    PAPI_ASPECT_LIST.forEach((asp, idx) => {
        const deg = -90 + (idx - 1) * 18;
        const dom = PAPI_DOMAINS.find(d => d.id === asp.domainId) || PAPI_DOMAINS[0];
        const aStart = ((deg - 9 + 0.4) * Math.PI) / 180;
        const aEnd = ((deg + 9 - 0.4) * Math.PI) / 180;
        const ang = (deg * Math.PI) / 180;

        // Kotak Deskripsi (r ≈ 212 - 250)
        ctx.beginPath();
        ctx.arc(cx, cy, rDescOuter, aStart, aEnd, false);
        ctx.arc(cx, cy, rDescInner, aEnd, aStart, true);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = dom.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Teks deskripsi di dalam kotak
        const rDescMid = (rDescInner + rDescOuter) / 2;
        const xDesc = cx + rDescMid * Math.cos(ang);
        const yDesc = cy + rDescMid * Math.sin(ang);

        ctx.save();
        ctx.translate(xDesc, yDesc);
        if (Math.sin(ang) <= 0) {
            ctx.rotate(ang + Math.PI / 2);
        } else {
            ctx.rotate(ang - Math.PI / 2);
        }
        ctx.font = 'bold 7px Arial, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (asp.descLines.length === 2) {
            ctx.fillText(asp.descLines[0], 0, -5);
            ctx.fillText(asp.descLines[1], 0, 5);
        } else {
            ctx.fillText(asp.descLines[0], 0, 0);
        }
        ctx.restore();

        // Kotak Huruf Aspek (r ≈ 180 - 212)
        ctx.beginPath();
        ctx.arc(cx, cy, rAspectOuter, aStart, aEnd, false);
        ctx.arc(cx, cy, rAspectInner, aEnd, aStart, true);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = dom.color;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Huruf Aspek
        const rLetterMid = (rAspectInner + rAspectOuter) / 2;
        const xLetter = cx + rLetterMid * Math.cos(ang);
        const yLetter = cy + rLetterMid * Math.sin(ang);

        ctx.save();
        ctx.translate(xLetter, yLetter);
        if (Math.sin(ang) <= 0) {
            ctx.rotate(ang + Math.PI / 2);
        } else {
            ctx.rotate(ang - Math.PI / 2);
        }
        ctx.font = 'bold 18px "Times New Roman", Georgia, serif';
        ctx.fillStyle = dom.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(asp.code, 0, 1);
        ctx.restore();
    });

    // 3. LAPISAN 2: Area Skala (r0 = 50 s/d r9 = 165)
    const rStep = (r9 - r0) / 9;
    // Lingkaran konsentris tipis untuk skor 0 sampai 9
    for (let s = 0; s <= 9; s++) {
        ctx.beginPath();
        ctx.arc(cx, cy, r0 + s * rStep, 0, Math.PI * 2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.6;
        ctx.stroke();
    }

    // Jari-jari putus-putus warna bidang dan angka 0-9
    PAPI_ASPECT_LIST.forEach((asp, idx) => {
        const deg = -90 + (idx - 1) * 18;
        const dom = PAPI_DOMAINS.find(d => d.id === asp.domainId) || PAPI_DOMAINS[0];
        const ang = (deg * Math.PI) / 180;

        // Garis putus-putus
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([2, 3]);
        ctx.moveTo(cx + r0 * Math.cos(ang), cy + r0 * Math.sin(ang));
        ctx.lineTo(cx + r9 * Math.cos(ang), cy + r9 * Math.sin(ang));
        ctx.strokeStyle = dom.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Angka 0 - 9 di sepanjang jari-jari
        for (let s = 0; s <= 9; s++) {
            const rNum = r0 + s * rStep;
            const xNum = cx + rNum * Math.cos(ang);
            const yNum = cy + rNum * Math.sin(ang);

            ctx.save();
            ctx.translate(xNum, yNum);
            if (Math.sin(ang) <= 0) {
                ctx.rotate(ang + Math.PI / 2);
            } else {
                ctx.rotate(ang - Math.PI / 2);
            }
            // Bulatan kecil putih agar angka terbaca jelas
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 8px Arial, sans-serif';
            ctx.fillStyle = dom.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(s), 0, 0);
            ctx.restore();
        }
    });

    // 4. LAPISAN 1: Lubang Tengah Putih (r ≈ 0-45)
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. POLIGON HASIL: Garis Hitam Tebal 2.5px & Bulatan Putih Berborder Hitam
    const points = [];
    PAPI_ASPECT_LIST.forEach((asp, idx) => {
        const deg = -90 + (idx - 1) * 18;
        const ang = (deg * Math.PI) / 180;
        const rawScore = scores[asp.code];
        const score = Math.max(0, Math.min(9, Math.round(Number(rawScore) || 0)));
        const rPt = r0 + (score / 9) * (r9 - r0);
        points.push({
            x: cx + rPt * Math.cos(ang),
            y: cy + rPt * Math.sin(ang)
        });
    });

    // Garis penghubung 20 titik berurutan
    ctx.beginPath();
    points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#111827';
    ctx.stroke();

    // Titik lingkaran putih berborder hitam tebal (r ≈ 5.5 - 6)
    points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#111827';
        ctx.stroke();
    });

    ctx.restore();
}

/**
 * Membangun tabel matriks lembar jawaban mentah 90 butir soal PAPI Kostick
 * Format 10 baris x 9 kolom (81-90, 71-80, ..., 1-10) sesuai lembar pemeriksaan resmi
 * @param {Object} answersObj Objek pasangan nomor dan jawaban { "1": "A", "2": "B", ... }
 */
function buildPapiAnswerMatrixHtml(answersObj) {
    const colBases = [80, 70, 60, 50, 40, 30, 20, 10, 0];
    let rowsHtml = '';
    let totalA = 0;
    let totalB = 0;
    let totalTerjawab = 0;

    for (let r = 1; r <= 10; r++) {
        let rowCells = '';
        colBases.forEach(base => {
            const num = base + r;
            let ans = '-';
            if (answersObj && (answersObj[num] !== undefined || answersObj[String(num)] !== undefined)) {
                ans = String(answersObj[num] !== undefined ? answersObj[num] : answersObj[String(num)]).trim().toUpperCase();
                if (ans === 'A') totalA++;
                else if (ans === 'B') totalB++;
                if (ans === 'A' || ans === 'B') totalTerjawab++;
            }
            rowCells += `
                <td style="background-color:#dc2626;color:#ffffff;font-weight:bold;text-align:center;padding:5px 6px;border:1px solid #1e293b;width:34px;font-size:12px;font-family:monospace;">
                    ${num}
                </td>
                <td style="background-color:#ffffff;color:#0f172a;font-weight:900;text-align:center;padding:5px 8px;border:1px solid #1e293b;width:36px;font-size:13px;font-family:sans-serif;">
                    ${escapeHtml(ans)}
                </td>
            `;
        });
        rowsHtml += `<tr>${rowCells}</tr>`;
    }

    const hasData = totalTerjawab > 0;

    return `
        <!-- TABEL PEMERIKSAAN LEMBAR JAWABAN KLIEN (1 - 90) -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div>
                    <h3 class="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-table-cells text-rose-600"></i> Tabel Pemeriksaan Lembar Jawaban Klien (1 - 90)
                    </h3>
                    <p class="text-xs text-slate-500">Rekaman pilihan butir pernyataan A / B peserta</p>
                </div>
                <div class="flex flex-wrap items-center gap-2.5 text-xs">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        Total Terjawab: <strong class="text-blue-700 font-black">${totalTerjawab} / 90</strong>
                    </span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
                        Pilihan A: ${totalA}
                    </span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        Pilihan B: ${totalB}
                    </span>
                </div>
            </div>

            ${!hasData ? `
                <div class="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-circle-info text-amber-600"></i>
                    <span>Catatan: Rekaman butir mentah 1–90 tidak tersimpan pada sesi ini (skor langsung dihitung dari hasil penilaian).</span>
                </div>
            ` : ''}

            <div class="overflow-x-auto pb-2">
                <table class="border-collapse mx-auto shadow-sm" style="border:2px solid #0f172a;min-width:630px;">
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Merender 20 aspek hasil tes PAPI Kostick (Roda Canvas & Tabel Narasi)
 * @param {Object|string} hasilPapi 
 */
function renderPapiResults(hasilPapi) {
    const container = document.getElementById('papiResultsContainer');
    if (!container) return;

    if (!hasilPapi) {
        container.innerHTML = '<div class="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">Data PAPI belum tersedia untuk peserta ini.</div>';
        return;
    }

    try {
        let data = typeof hasilPapi === 'string' ? JSON.parse(hasilPapi) : hasilPapi;
        let rawScores = data.scores || data.skor_dimensi || data.dimensi || data.skor || data;

        // Cek jika data berupa kumpulan jawaban { "1": "A", "2": "B", ... }
        let answersObj = data.jawaban || data.p_jawaban || null;
        if (!answersObj && typeof rawScores === 'object' && rawScores !== null) {
            if (rawScores["1"] || rawScores[1]) {
                answersObj = rawScores;
            }
        }

        const scores = {};
        const aspectKeys = ['N', 'G', 'A', 'L', 'P', 'I', 'T', 'V', 'X', 'S', 'B', 'O', 'R', 'D', 'C', 'Z', 'E', 'K', 'F', 'W'];
        aspectKeys.forEach(k => { scores[k] = 0; });

        let scoresFound = false;
        aspectKeys.forEach(k => {
            if (rawScores && rawScores[k] !== undefined && rawScores[k] !== null && typeof rawScores[k] !== 'object') {
                scores[k] = Math.max(0, Math.min(9, Math.round(Number(rawScores[k]) || 0)));
                scoresFound = true;
            }
        });

        // Adapter jika skor belum dihitung namun terdapat 90 jawaban
        if (!scoresFound && answersObj && typeof answersObj === 'object') {
            PAPI_ANSWER_KEY.forEach(item => {
                const ans = (answersObj[item.no] || answersObj[String(item.no)] || '').toString().trim().toUpperCase();
                if (ans === 'A' && item.a && scores[item.a] !== undefined) {
                    scores[item.a]++;
                    scoresFound = true;
                } else if (ans === 'B' && item.b && scores[item.b] !== undefined) {
                    scores[item.b]++;
                    scoresFound = true;
                }
            });
        }

        if (!scoresFound) {
            container.innerHTML = '<div class="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">Data PAPI belum tersedia untuk peserta ini.</div>';
            return;
        }

        // Hitung total 20 skor
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const isValidTotal = (totalScore === 90);

        let validationNotice = '';
        if (!isValidTotal) {
            validationNotice = `
                <div class="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold">
                    <i class="fa-solid fa-triangle-exclamation text-amber-600"></i>
                    <span>Data skor tidak valid (Total: ${totalScore}, seharusnya 90), periksa proses penilaian</span>
                </div>
            `;
        }

        // Bangun HTML Matriks Lembar Jawaban 1 - 90
        const answerMatrixHtml = buildPapiAnswerMatrixHtml(answersObj);

        // Susun Tabel 20 Aspek (Dikelompokkan 7 Bidang)
        let tableRowsHtml = '';
        PAPI_DOMAINS.forEach(dom => {
            dom.aspects.forEach((aspCode, aspIdx) => {
                const aspInfo = PAPI_ASPECT_LIST.find(a => a.code === aspCode);
                const scoreVal = scores[aspCode] || 0;

                // Kategori Skor: 0-3 Rendah, 4-5 Sedang, 6-7 Tinggi, 8-9 Sangat Tinggi
                let katKey = 'rendah';
                let pillClass = 'bg-blue-100 text-blue-800 border-blue-200';
                let katText = 'Rendah';

                if (scoreVal >= 8) {
                    katKey = 'sangat_tinggi';
                    pillClass = 'bg-purple-100 text-purple-800 border-purple-200';
                    katText = 'S. Tinggi';
                } else if (scoreVal >= 6) {
                    katKey = 'tinggi';
                    pillClass = 'bg-amber-100 text-amber-800 border-amber-200';
                    katText = 'Tinggi';
                } else if (scoreVal >= 4) {
                    katKey = 'sedang';
                    pillClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                    katText = 'Sedang';
                }

                const narrative = (PAPI_NARRATIVES[aspCode] && PAPI_NARRATIVES[aspCode][katKey])
                    ? PAPI_NARRATIVES[aspCode][katKey]
                    : 'Kecenderungan perilaku kerja pada dimensi ini berada pada kategori ' + katText.toLowerCase() + '.';

                const descEn = (aspInfo && aspInfo.descLines) ? aspInfo.descLines.join(' ') : '';
                const namaAspek = aspInfo ? aspInfo.nameId : aspCode;

                tableRowsHtml += `
                    <tr class="hover:bg-slate-50/80 transition">
                        ${aspIdx === 0 ? `
                            <td rowspan="${dom.aspects.length}" class="p-3 border-r border-slate-200 align-top font-bold text-slate-800 bg-slate-50/70">
                                <div class="flex items-center gap-1.5">
                                    <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${dom.color};"></span>
                                    <span>${escapeHtml(dom.namaId)}</span>
                                </div>
                                <span class="text-[10px] text-slate-400 block font-normal mt-0.5">${escapeHtml(dom.name)}</span>
                            </td>
                        ` : ''}
                        <td class="p-3 border-r border-slate-200">
                            <span class="font-bold text-slate-800">${escapeHtml(namaAspek)}</span>
                            <span class="text-[10px] text-slate-400 italic block mt-0.5">${escapeHtml(descEn)}</span>
                        </td>
                        <td class="p-3 border-r border-slate-200 text-center font-black text-sm text-[#003865]">${aspCode}</td>
                        <td class="p-3 border-r border-slate-200 text-center whitespace-nowrap">
                            <span class="inline-block px-2.5 py-1 rounded-full text-[11px] font-black border ${pillClass}">
                                ${scoreVal} &bull; ${katText}
                            </span>
                        </td>
                        <td class="p-3 text-slate-600 leading-relaxed text-xs">${escapeHtml(narrative)}</td>
                    </tr>
                `;
            });
        });

        // Inject 3 Bagian Vertikal ke DOM
        container.innerHTML = `
            <!-- BAGIAN A: KARTU PUTIH RODA INTERPRETASI -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div class="text-center mb-4">
                    <h3 class="text-base sm:text-lg font-black text-[#003865] tracking-wide uppercase">LEMBAR INTERPRETASI PAPI KOSTICK</h3>
                    <p class="text-xs text-slate-500 mt-0.5">Personality &amp; Preference Inventory &bull; Roda Profil 20 Dimensi Kerja</p>
                    ${validationNotice}
                </div>
                <div class="flex justify-center items-center py-2">
                    <canvas id="papiWheelCanvas" width="1300" height="1300" style="width:100%;max-width:650px;height:auto;display:block;margin:0 auto"></canvas>
                </div>
            </div>

            <!-- BAGIAN B: MATRIKS LEMBAR JAWABAN KLIEN (1 - 90) -->
            ${answerMatrixHtml}

            <!-- BAGIAN C: TABEL RINCIAN 20 ASPEK & NARASI -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div>
                        <h3 class="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                            <i class="fa-solid fa-list-check text-blue-600"></i> Rincian 20 Aspek &amp; Interpretasi Naratif
                        </h3>
                        <p class="text-xs text-slate-500">Evaluasi kecenderungan perilaku dan peran kerja kandidat</p>
                    </div>
                    <div class="text-right">
                        <span class="text-xs ${isValidTotal ? 'text-slate-600 font-bold' : 'text-amber-700 font-black'}">
                            Total skor: ${totalScore} (seharusnya 90)
                        </span>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left border-collapse border border-slate-200">
                        <thead>
                            <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                                <th class="p-3 border-r border-slate-200 w-36">Bidang</th>
                                <th class="p-3 border-r border-slate-200">Aspek &amp; Deskripsi</th>
                                <th class="p-3 border-r border-slate-200 text-center w-16">Kode</th>
                                <th class="p-3 border-r border-slate-200 text-center w-28">Skor (0-9)</th>
                                <th class="p-3">Interpretasi Naratif</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 text-slate-700">
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                </div>

                <div class="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs flex items-center gap-2.5">
                    <i class="fa-solid fa-circle-info text-blue-600 flex-shrink-0 text-sm"></i>
                    <span><strong>Catatan:</strong> Interpretasi ini merupakan alat bantu, bukan keputusan akhir, dan perlu dikonfirmasi melalui wawancara.</span>
                </div>
            </div>
        `;

        // Panggil drawPapiWheel SETELAH HTML di-inject ke DOM
        drawPapiWheel('papiWheelCanvas', scores);

    } catch (e) {
        console.error('Gagal merender hasil PAPI:', e);
        container.innerHTML = '<div class="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">Format data PAPI tidak valid.</div>';
    }
}

/**
 * Merender profil perilaku DISC
 * @param {Object|string} hasilDisc 
 */
function renderDiscResults(hasilDisc) {
    const container = document.getElementById('discResultsContainer');
    if (!container) return;
    if (!hasilDisc) {
        container.innerHTML = '<div class="col-span-full text-center py-8 text-slate-400">Data hasil tes DISC belum tersedia untuk peserta ini.</div>';
        return;
    }
    try {
        const data = typeof hasilDisc === 'string' ? JSON.parse(hasilDisc) : hasilDisc;
        const dVal = data.D !== undefined ? data.D : (data.scores ? data.scores.D : 0);
        const iVal = data.I !== undefined ? data.I : (data.scores ? data.scores.I : 0);
        const sVal = data.S !== undefined ? data.S : (data.scores ? data.scores.S : 0);
        const cVal = data.C !== undefined ? data.C : (data.scores ? data.scores.C : 0);

        container.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p class="text-xs uppercase font-bold text-red-600">Dominance (D)</p>
                <p class="text-2xl font-black text-red-700 mt-1">${dVal}</p>
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p class="text-xs uppercase font-bold text-amber-600">Influence (I)</p>
                <p class="text-2xl font-black text-amber-700 mt-1">${iVal}</p>
            </div>
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p class="text-xs uppercase font-bold text-emerald-600">Steadiness (S)</p>
                <p class="text-2xl font-black text-emerald-700 mt-1">${sVal}</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p class="text-xs uppercase font-bold text-blue-600">Compliance (C)</p>
                <p class="text-2xl font-black text-blue-700 mt-1">${cVal}</p>
            </div>
        `;
    } catch (e) {
        container.innerHTML = '<div class="col-span-full text-center py-8 text-slate-400">Format data DISC tidak valid.</div>';
    }
}

/**
 * Merender dokumentasi foto pengawasan kamera dari Supabase Storage & data kandidat (Persis Gambar 2)
 * @param {Object} candidate 
 */
async function renderCandidatePhotos(candidate) {
    const grid = document.getElementById('hrdFotoGridContainer');
    const emptyNotice = document.getElementById('hrdFotoEmptyNotice');
    const tglEl = document.getElementById('fotoRptTanggal');
    const namaEl = document.getElementById('fotoRptNama');
    const kontakEl = document.getElementById('fotoRptKontak');

    if (candidate) {
        if (tglEl) tglEl.innerText = candidate["Waktu Selesai"] || (candidate.created_at ? new Date(candidate.created_at).toLocaleString('id-ID') : '-');
        if (namaEl) namaEl.innerText = candidate["Nama Lengkap"] || candidate.nama_lengkap || '-';
        if (kontakEl) kontakEl.innerText = candidate["No WhatsApp"] || candidate.no_wa || candidate["Alamat Email"] || candidate.email || '-';
    }

    if (!grid) return;

    grid.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat dokumentasi foto dari server...</div>';
    if (emptyNotice) emptyNotice.classList.add('hidden');

    try {
        const sbUrl = window.SUPABASE_URL || 'https://rvflmznbihunezzqhobm.supabase.co';
        let allPhotos = [];

        // Identifikasi kontak & email kandidat yang sedang dibuka untuk memfilter foto miliknya
        const candPhoneRaw = (candidate ? (candidate["No WhatsApp"] || candidate.no_wa || '') : '').toString().trim();
        const candPhone = candPhoneRaw.replace(/[^0-9]/g, '');
        const candEmailRaw = (candidate ? (candidate["Alamat Email"] || candidate.email || '') : '').toString().trim();
        const candEmail = candEmailRaw.replace(/[^a-zA-Z0-9_-]/g, '_');

        const isMatchCurrentCandidate = (nameOrPath) => {
            if (!candidate) return true;
            if (!nameOrPath) return false;
            const str = String(nameOrPath).toLowerCase();
            // Cek kecocokan nomor telepon/WhatsApp kandidat (minimal 4 digit)
            if (candPhone && candPhone.length >= 4 && str.includes(candPhone)) {
                return true;
            }
            // Cek kecocokan email kandidat
            if (candEmail && candEmail.length >= 4 && str.includes(candEmail.toLowerCase())) {
                return true;
            }
            return false;
        };

        // 1. Ambil foto yang tersimpan langsung pada objek hasil_ist kandidat di database
        if (candidate && candidate.hasil_ist) {
            try {
                const parsedIst = typeof candidate.hasil_ist === 'string' ? JSON.parse(candidate.hasil_ist) : candidate.hasil_ist;
                if (parsedIst && Array.isArray(parsedIst.foto_pengawasan)) {
                    parsedIst.foto_pengawasan.forEach(p => {
                        allPhotos.push({
                            labelSubtes: p.subtes || 'IST Subtes',
                            labelWaktu: p.waktu || '-',
                            url: p.url || `${sbUrl}/storage/v1/object/public/foto_kandidat/${p.filePath || p.fileName}`
                        });
                    });
                }
            } catch (errParse) {}
        }

        // 2. Ambil dari cache lokal HANYA jika foto tersebut milik kandidat ini
        try {
            const localPhotos = JSON.parse(localStorage.getItem('kandidat_foto_pengawasan') || '[]');
            if (Array.isArray(localPhotos)) {
                localPhotos.forEach(p => {
                    const fn = (p.fileName || p.filePath || '').toLowerCase();
                    const pPhone = (p.candidatePhone || '').replace(/[^0-9]/g, '');
                    const pEmail = (p.candidateEmail || '').toLowerCase();
                    const isOwner = isMatchCurrentCandidate(fn) ||
                        (candPhone && pPhone && pPhone === candPhone) ||
                        (candEmail && pEmail && pEmail === candEmail.toLowerCase());

                    if (isOwner) {
                        const url = p.url || `${sbUrl}/storage/v1/object/public/foto_kandidat/${p.filePath || p.fileName}`;
                        if (!allPhotos.some(item => item.url === url)) {
                            allPhotos.push({
                                labelSubtes: p.subtes || 'IST Subtes',
                                labelWaktu: p.waktu || '-',
                                url: url
                            });
                        }
                    }
                });
            }
        } catch (errLocal) {}

        // 3. Ambil daftar file dari folder Supabase Storage bucket foto_kandidat (terpisah: IST, PAULI, PAPI, DISC) khusus kandidat ini
        const sbClient = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
        if (sbClient && sbClient.storage) {
            const targetFolders = ['IST', 'PAULI', 'PAPI', 'DISC'];
            for (const folderName of targetFolders) {
                try {
                    const { data: files, error } = await sbClient.storage.from('foto_kandidat').list(folderName, {
                        limit: 100,
                        sortBy: { column: 'name', order: 'asc' }
                    });

                    if (!error && files && files.length > 0) {
                        const photoFiles = files.filter(f => 
                            /\.(jpe?g|png|webp)$/i.test(f.name) && 
                            (f.metadata ? f.metadata.size > 100 : true) &&
                            isMatchCurrentCandidate(f.name)
                        );
                        photoFiles.forEach(f => {
                            const publicUrl = `${sbUrl}/storage/v1/object/public/foto_kandidat/${folderName}/${encodeURIComponent(f.name)}`;
                            if (!allPhotos.some(item => item.url === publicUrl)) {
                                let labelSubtes = folderName;
                                let labelWaktu = "-";

                                const parts = f.name.replace(/\.[^/.]+$/, '').split('_');
                                const subtesPart = parts.find(p => /(subtes|pauli|papi|disc)/i.test(p));
                                if (subtesPart) {
                                    labelSubtes = subtesPart.replace(/-/g, ' ');
                                }
                                const fasePart = parts.find(p => /^(awal|tengah|akhir)$/i.test(p));
                                if (fasePart) {
                                    labelSubtes += ` (${fasePart})`;
                                }

                                const tglPart = parts.find(p => /^\d{4}-\d{2}-\d{2}$/.test(p));
                                const jamPart = parts.find(p => /^\d{2}-\d{2}-\d{2}$/.test(p));
                                if (tglPart && jamPart) {
                                    labelWaktu = `${tglPart} ${jamPart.replace(/-/g, ':')}`;
                                } else if (f.created_at) {
                                    const dt = new Date(f.created_at);
                                    labelWaktu = dt.toLocaleString('id-ID');
                                }

                                allPhotos.push({
                                    labelSubtes: labelSubtes,
                                    labelWaktu: labelWaktu,
                                    url: publicUrl
                                });
                            }
                        });
                    }
                } catch (errStorage) {
                    console.warn(`Catatan pembacaan storage folder ${folderName}:`, errStorage);
                }
            }
        }

        // Tampilkan foto jika ditemukan
        if (allPhotos.length === 0) {
            grid.innerHTML = '';
            if (emptyNotice) emptyNotice.classList.remove('hidden');
            return;
        }

        grid.innerHTML = '';
        allPhotos.forEach(p => {
            const card = document.createElement('div');
            card.className = "border border-slate-200 rounded-lg p-2.5 bg-white text-center shadow-sm hover:shadow-md transition flex flex-col items-center";
            card.innerHTML = `
                <div class="w-full h-44 bg-slate-900 rounded overflow-hidden flex items-center justify-center border border-slate-200 mb-2">
                    <img src="${p.url}" alt="${escapeHtml(p.labelSubtes)}" loading="lazy" class="w-full h-full object-cover" onerror="const c = this.closest('.shadow-sm'); if (c) c.remove();"
 >
                </div>
                <p class="font-bold text-xs text-slate-800 tracking-wide">${escapeHtml(p.labelSubtes)}</p>
                <p class="text-[11px] text-slate-500 font-mono mt-0.5">${escapeHtml(p.labelWaktu)}</p>
            `;
            grid.appendChild(card);
        });

    } catch (e) {
        console.warn('Gagal memuat galeri foto:', e);
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-slate-400 text-xs">Gagal memuat foto pengawasan.</div>';
    }
}

// =========================================================================
// OTENTIKASI & LOGOUT DIRECT HRD (PORTAL HRD.HTML)
// =========================================================================

async function handleDirectHrdLogin(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    // Cek status kunci persisten
    const lockStatus = checkHrdLockStatus();
    if (lockStatus.isLocked) {
        customAlert(
            "Akses Dikunci",
            `Akses masih terkunci karena percobaan berulang. Silakan coba lagi dalam ${lockStatus.remainingMinutes} menit.`,
            "error"
        );
        return;
    }

    const pinInput = document.getElementById('inputHrdDirectPin');
    const pin = pinInput ? pinInput.value.trim() : '';
    if (!pin) return customAlert("Akses Ditolak", "Kata sandi HRD tidak boleh kosong.", "error");

    // Verifikasi kredensial terhadap akun HRD di Supabase Auth
    const loadingEl = document.getElementById('modal-loading');
    if (loadingEl) loadingEl.classList.remove('hide-section');

    try {
        let authSuccess = false;
        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
        if (sb && sb.auth) {
            const hrdEmails = [
                'febriandah3@gmail.com',
                'febriyandah3@gmail.com',
                'febriyanh3@gmail.com',
                'hrd@altrak1978.co.id'
            ];
            for (const email of hrdEmails) {
                try {
                    const { data, error } = await sb.auth.signInWithPassword({
                        email: email,
                        password: pin
                    });
                    if (!error && data && data.session) {
                        authSuccess = true;
                        break;
                    }
                } catch (e) {}
            }
        }

        if (loadingEl) loadingEl.classList.add('hide-section');

        if (authSuccess) {
            try {
                localStorage.removeItem(HRD_ATTEMPTS_STORAGE_KEY);
                localStorage.removeItem(HRD_LOCK_STORAGE_KEY);
            } catch (e) {}
            isHrdAuthenticated = true;
            if (pinInput) pinInput.value = '';
            const loginView = document.getElementById('hrd-login-view');
            if (loginView) loginView.classList.add('hide-section');
            const dashView = document.getElementById('hrd-dashboard-view');
            if (dashView) dashView.classList.remove('hide-section');
            loadHrdData();
        } else {
            let currentAttempts = parseInt(localStorage.getItem(HRD_ATTEMPTS_STORAGE_KEY) || '0', 10) + 1;
            localStorage.setItem(HRD_ATTEMPTS_STORAGE_KEY, currentAttempts.toString());

            isHrdAuthenticated = false;
            if (pinInput) pinInput.value = '';

            if (currentAttempts >= MAX_HRD_ATTEMPTS) {
                const lockTime = Date.now() + HRD_LOCK_DURATION_MS;
                localStorage.setItem(HRD_LOCK_STORAGE_KEY, lockTime.toString());
                customAlert(
                    "Akses Dikunci",
                    "Terlalu banyak percobaan (3x). Akses otorisasi HRD dikunci 15 menit demi keamanan.",
                    "error"
                );
            } else {
                const sisaCoba = MAX_HRD_ATTEMPTS - currentAttempts;
                customAlert(
                    "Akses Ditolak",
                    `Sandi HRD tidak sesuai. Sisa kesempatan mencoba: ${sisaCoba} kali.`,
                    "error"
                );
            }
        }
    } catch (err) {
        if (loadingEl) loadingEl.classList.add('hide-section');
        console.error(err);
        customAlert("Kesalahan Koneksi", "Gagal menghubungi server Supabase.", "error");
    }
}

async function logoutDirectHrd() {
    const loadingEl = document.getElementById('modal-loading');
    if (loadingEl) loadingEl.classList.remove('hide-section');
    try {
        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
        if (sb && sb.auth) await sb.auth.signOut();
    } catch (err) {}
    isHrdAuthenticated = false;
    cachedHrdData = [];
    const pinInput = document.getElementById('inputHrdDirectPin');
    if (pinInput) pinInput.value = "";
    if (loadingEl) loadingEl.classList.add('hide-section');
    const dashView = document.getElementById('hrd-dashboard-view');
    if (dashView) dashView.classList.add('hide-section');
    const loginView = document.getElementById('hrd-login-view');
    if (loginView) loginView.classList.remove('hide-section');
}

// Inisialisasi otomatis jika dibuka di halaman hrd.html
if (typeof window !== 'undefined') {
    window.handleDirectHrdLogin = handleDirectHrdLogin;
    window.logoutDirectHrd = logoutDirectHrd;

    window.addEventListener('DOMContentLoaded', async () => {
        if (!document.getElementById('hrd-login-view')) return; // Hanya jalankan jika di halaman hrd.html

        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }

        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
        if (!sb || !sb.auth) return;
        try {
            const { data } = await sb.auth.getSession();
            if (data && data.session) {
                isHrdAuthenticated = true;
                const loginView = document.getElementById('hrd-login-view');
                if (loginView) loginView.classList.add('hide-section');
                const dashView = document.getElementById('hrd-dashboard-view');
                if (dashView) dashView.classList.remove('hide-section');
                loadHrdData();
            }
        } catch (e) {}
    });
}




