// =========================================================================
// DASHBOARD ANALITIK & LAPORAN HRD
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * Menampilkan daftar baris kandidat ke dalam tabel HRD
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
        tr.innerHTML = `
            <td class="p-3 font-mono font-bold text-altrak-yellow">#${row.id}</td>
            <td class="p-3 font-bold text-white">${row["Nama Lengkap"] || '-'}</td>
            <td class="p-3 text-xs text-slate-400">${row["Alamat Email"] || '-'}<br>${row["No WhatsApp"] || '-'}</td>
            <td class="p-3 text-xs text-slate-400">${row["Waktu Selesai"] || '-'}</td>
            <td class="p-3 text-center font-bold text-white">${row["Total Pauli"] || 0}</td>
            <td class="p-3 text-center"><span class="text-green-400 font-bold">${row["Jawaban Benar"] || 0}</span> / <span class="text-red-400 font-bold">${row["Jawaban Salah"] || 0}</span></td>
            <td class="p-3 text-center">
                <button onclick="viewCandidateChart(${index})" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow">
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
 */
async function loadHrdData() {
    if (!isHrdAuthenticated) {
        customAlert("Akses Terlarang", "Silakan login HRD terlebih dahulu.", "error");
        showPage('page-login');
        return;
    }

    const tbody = document.getElementById('hrdTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat data dari server...</td></tr>`;
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
            tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-red-400">Anda tidak memiliki akses. Silakan login kembali.</td></tr>`;
        }
    }
}

/**
 * Mengekspor seluruh data hasil tes kandidat ke file Excel (.csv)
 */
function exportHrdToExcel() {
    if (!cachedHrdData || cachedHrdData.length === 0) {
        customAlert("Kosong", "Tidak ada data untuk diexport.", "error");
        return;
    }

    let headers = ["ID", "Waktu Mulai", "Waktu Selesai", "Nama Lengkap", "Alamat Email", "No WhatsApp", "Total Pauli", "Jawaban Benar", "Jawaban Salah"];
    for (let i = 1; i <= 20; i++) headers.push(`Interval ${i}`);
    let csvLines = [headers.join(",")];

    cachedHrdData.forEach(row => {
        let intervals = (row["Garis Interval (3 Menit)"] || "").split(',').map(n => n.trim());
        while (intervals.length < 20) intervals.push("0");

        const escapeCsv = (str) => {
            if (str === null || str === undefined) return '""';
            return `"${String(str).replace(/"/g, '""')}"`;
        };

        let rowData = [
            row.id,
            escapeCsv(row["Waktu Mulai"]),
            escapeCsv(row["Waktu Selesai"]),
            escapeCsv(row["Nama Lengkap"]),
            escapeCsv(row["Alamat Email"]),
            escapeCsv(row["No WhatsApp"]),
            row["Total Pauli"] || 0,
            row["Jawaban Benar"] || 0,
            row["Jawaban Salah"] || 0,
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

    let jumlah = row["Total Pauli"] || 0;
    let benar = row["Jawaban Benar"] || 0;
    let salah = row["Jawaban Salah"] || 0;
    let rata = (jumlah / 20).toFixed(2);
    let tinggi = Math.max(...parsedData);

    let validDataTanpaNol = parsedData.filter(v => v > 0);
    let rendah = validDataTanpaNol.length > 0 ? Math.min(...validDataTanpaNol) : 0;

    const elJumlah = document.getElementById('rptJumlah');
    const elBenar = document.getElementById('rptBenar');
    const elSalah = document.getElementById('rptSalah');
    const elAvg = document.getElementById('rptAvg');
    const elTinggi = document.getElementById('rptTinggi');
    const elRendah = document.getElementById('rptRendah');

    if (elJumlah) elJumlah.innerText = jumlah;
    if (elBenar) elBenar.innerText = benar;
    if (elSalah) elSalah.innerText = salah;
    if (elAvg) elAvg.innerText = rata;
    if (elTinggi) elTinggi.innerText = tinggi;
    if (elRendah) elRendah.innerText = rendah;

    const lblTr = document.getElementById('rptIntervalLabels');
    const dataTr = document.getElementById('rptIntervalData');
    if (lblTr && dataTr) {
        lblTr.innerHTML = '';
        dataTr.innerHTML = '';
        parsedData.forEach((val, i) => {
            lblTr.innerHTML += `<th class="px-2 py-3 w-[5%] border-r border-slate-200 last:border-0">${i + 1}</th>`;
            dataTr.innerHTML += `<td class="px-2 py-3 border-r border-slate-200 last:border-0">${val}</td>`;
        });
    }

    const modalChart = document.getElementById('modal-hrd-chart');
    if (modalChart) modalChart.classList.remove('hide-section');

    let dynamicMin = 0;
    let dynamicMax = tinggi > 0 ? (Math.ceil((tinggi + 10) / 10) * 10) : 50;

    const canvas = document.getElementById('hrdPauliChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (hrdChartInstance) hrdChartInstance.destroy();

    hrdChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 20 }, (_, i) => i + 1),
            datasets: [{
                label: 'Jawaban per Interval',
                data: parsedData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#2563eb',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true
            }]
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
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleFont: { size: 13 },
                    bodyFont: { size: 14, weight: 'bold' },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        title: function (context) { return 'Interval ' + context[0].label; },
                        label: function (context) { return 'Menjawab: ' + context.raw + ' soal'; }
                    }
                }
            }
        }
    });
}
