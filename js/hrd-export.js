// =========================================================================
// MODUL EKSPOR LAPORAN HRD KE CSV / EXCEL
// PT Altrak 1978 - Assessment Management Portal
// Pemisahan modular dari hrd.js untuk menjaga kebersihan arsitektur
// =========================================================================

(function () {
    'use strict';

    /**
     * Mengekspor seluruh data hasil tes kandidat ke file Excel (.csv) dengan sanitasi CSV Injection
     */
    function exportHrdToExcel() {
        const dataList = (typeof cachedHrdData !== 'undefined' && Array.isArray(cachedHrdData)) ? cachedHrdData : [];
        if (!dataList || dataList.length === 0) {
            if (typeof customAlert === 'function') {
                customAlert("Data Kosong", "Tidak ada data kandidat untuk diekspor.", "error");
            } else {
                alert("Tidak ada data kandidat untuk diekspor.");
            }
            return;
        }

        let headers = [
            "ID", "Waktu Mulai", "Waktu Selesai", "Nama Lengkap", "Alamat Email", "No WhatsApp", "Posisi Dilamar", "Penempatan", "Domisili", "Token Ujian", "Integritas Ujian",
            "Total Pauli", "Jawaban Salah", "Rata-Rata", "% Salah", "% Penyimpangan", "Total Simpangan (Interval 3-18)", "Tinggi", "Tempat Puncak"
        ];
        for (let i = 1; i <= 20; i++) headers.push(`Interval ${i}`);
        headers.push("Token Tahap 2", "Status Tahap 2", "Gaya Kepemimpinan MSDT", "Skor IQ CFIT", "Profil EPPS", "Tipe Kepribadian MBTI");
        let csvLines = [headers.join(",")];

        dataList.forEach(row => {
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

            // Parse data Tahap 2 jika ada
            let msdtGaya = "-";
            if (row.hasil_msdt) {
                try {
                    const m = typeof row.hasil_msdt === 'string' ? JSON.parse(row.hasil_msdt) : row.hasil_msdt;
                    msdtGaya = (m.analisis && m.analisis.nama_gaya) ? m.analisis.nama_gaya : "-";
                } catch (e) {}
            }
            let cfitIq = "-";
            if (row.hasil_cfit) {
                try {
                    const c = typeof row.hasil_cfit === 'string' ? JSON.parse(row.hasil_cfit) : row.hasil_cfit;
                    cfitIq = (c.analisis && c.analisis.skor_iq) ? `${c.analisis.skor_iq} (${c.analisis.kategori_iq || ''})` : "-";
                } catch (e) {}
            }
            let eppsProfil = "-";
            if (row.hasil_epps) {
                try {
                    const ep = typeof row.hasil_epps === 'string' ? JSON.parse(row.hasil_epps) : row.hasil_epps;
                    if (ep.skala_dominan) {
                        eppsProfil = ep.skala_dominan;
                    } else if (ep.jawaban && typeof ep.jawaban === 'object') {
                        const totalJawab = Object.keys(ep.jawaban).length;
                        eppsProfil = `Selesai (${totalJawab} Soal)`;
                    } else if (ep.status) {
                        eppsProfil = ep.status;
                    }
                } catch (e) {}
            }
            let mbtiTipe = "-";
            const rawMbti = row.hasil_mbti || row.hasil_mcmi;
            if (rawMbti) {
                try {
                    const mb = typeof rawMbti === 'string' ? JSON.parse(rawMbti) : rawMbti;
                    mbtiTipe = mb.tipe_mbti ? `${mb.tipe_mbti} - ${mb.nama_profil || ''}` : ((mb.analisis && mb.analisis.tipe) ? `${mb.analisis.tipe} - ${mb.analisis.nama_profil || ''}` : "-");
                } catch (e) {}
            }

            let rowData = [
                row.id,
                sanitizeForCsv(row["Waktu Mulai"]),
                sanitizeForCsv(row["Waktu Selesai"]),
                sanitizeForCsv(row["Nama Lengkap"]),
                sanitizeForCsv(row["Alamat Email"]),
                sanitizeForCsv(row["No WhatsApp"]),
                sanitizeForCsv(row["Posisi"] || row.posisi || row.posisi_dilamar || '-'),
                sanitizeForCsv(row["Penempatan"] || row.penempatan || '-'),
                sanitizeForCsv(row["Domisili"] || row.domisili || '-'),
                sanitizeForCsv(row["Token"] || row.token || '-'),
                sanitizeForCsv(Number(row["Pelanggaran Tab"] || 0) === 0 ? "Bersih (0 Pelanggaran)" : `Pernah ${row["Pelanggaran Tab"]}x Ganti Tab`),
                jumlah,
                salah,
                `"${rRata.toFixed(1)}"`,
                `"${pSalah.toFixed(1)} %"`,
                `"${pDev.toFixed(1)} %"`,
                `"${totDev.toFixed(1)}"`,
                tTinggi,
                `"${tPuncak}"`,
                ...intervals.slice(0, 20),
                sanitizeForCsv(row.token_tahap_2 || '-'),
                sanitizeForCsv(row.status_tahap_2 || '-'),
                sanitizeForCsv(msdtGaya),
                sanitizeForCsv(cfitIq),
                sanitizeForCsv(eppsProfil),
                sanitizeForCsv(mbtiTipe)
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

    if (typeof window !== 'undefined') {
        window.exportHrdToExcel = exportHrdToExcel;
        window.HrdExport = {
            exportHrdToExcel
        };
    }
})();
