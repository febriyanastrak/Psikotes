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
        tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-slate-500">Tidak ada data kandidat yang cocok.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    dataList.forEach((item) => {
        const row = item.row;
        const index = item.originalIndex;
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/50 transition";
        
        const idSafe = escapeHtml(row.id || '');
        const namaSafe = escapeHtml(row["Nama Lengkap"] || '-');
        const emailSafe = escapeHtml(row["Alamat Email"] || '-');
        const waSafe = escapeHtml(row["No WhatsApp"] || '-');
        const waktuSafe = escapeHtml(row["Waktu Selesai"] || '-');
        const totalSafe = escapeHtml(row["Total Pauli"] || 0);
        const salahSafe = escapeHtml(row["Jawaban Salah"] || 0);

        tr.innerHTML = `
            <td class="p-3 font-mono font-bold text-amber-400">#${idSafe}</td>
            <td class="p-3 font-bold text-white">${namaSafe}</td>
            <td class="p-3 text-xs text-slate-400">${emailSafe}<br>${waSafe}</td>
            <td class="p-3 text-xs text-slate-400">${waktuSafe}</td>
            <td class="p-3 text-center font-bold text-white">${totalSafe}</td>
            <td class="p-3 text-center"><span class="text-red-400 font-bold">${salahSafe}</span></td>
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
    if (!supabaseClient) {
        customAlert("Koneksi Terputus", "Koneksi ke database Supabase tidak tersedia.", "error");
        return;
    }

    if (!isHrdAuthenticated) {
        showPage('page-login');
        return;
    }

    const tbody = document.getElementById('hrdTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengambil data dari server...</td></tr>`;
    }

    try {
        const { data, error } = await supabaseClient
            .from('hasil_psikotes_kandidat')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        cachedHrdData = data || [];
        const searchInput = document.getElementById('hrdSearchInput');
        if (searchInput) searchInput.value = '';
        filterHrdTable();
    } catch (err) {
        console.error('Gagal mengambil data HRD:', err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-red-400">Gagal mengambil data dari database server. Periksa koneksi internet Anda.</td></tr>`;
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
        "Total Pauli", "Jawaban Salah", "Rata-Rata", "% Salah", "% Penyimpangan", "Tinggi", "Tempat Puncak"
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
        lblTr.innerHTML = '';
        dataTr.innerHTML = '';
        if (meanTr) meanTr.innerHTML = '';
        lblTr.innerHTML += '<th class="px-2 py-2.5 w-[8%] border-r border-slate-200 bg-slate-100 text-slate-600 font-bold">WAKTU</th>';
        dataTr.innerHTML += '<td class="px-2 py-2.5 border-r border-slate-200 text-left font-black text-[#003865] bg-white">JUMLAH</td>';
        if (meanTr) meanTr.innerHTML += '<td class="px-2 py-2.5 border-r border-slate-200 text-left font-black text-amber-700 bg-amber-50/50">MEAN</td>';
        parsedData.forEach((val, i) => {
            const isMax = val === tinggi && tinggi > 0;
            lblTr.innerHTML += `<th class="px-2 py-2.5 w-[5%] border-r border-slate-200 last:border-0 bg-slate-100 text-slate-600 font-bold">${i + 1}</th>`;
            dataTr.innerHTML += `<td class="px-2 py-2.5 border-r border-slate-200 last:border-0 bg-white ${isMax ? 'text-emerald-700 font-black bg-emerald-50/60' : 'text-slate-800'}">${val}</td>`;
            if (meanTr) meanTr.innerHTML += `<td class="px-2 py-2.5 border-r border-slate-200 last:border-0 text-amber-700 bg-amber-50/30 font-semibold">${rataRata.toFixed(1)}</td>`;
        });
    }

    // =========================================================================
    // RENDER GRAFIK CHART.JS DENGAN GARIS RATA-RATA
    // =========================================================================
    const modalChart = document.getElementById('modal-hrd-chart');
    if (modalChart) modalChart.classList.remove('hide-section');

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


