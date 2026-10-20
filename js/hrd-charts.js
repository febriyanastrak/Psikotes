// =========================================================================
// MODUL VISUALISASI GRAFIK & KANVAS (HRD CHARTS & WHEEL)
// PT Altrak 1978 - Assessment Management Portal
// Pemisahan modular dari hrd.js untuk kalkulasi & render visualisasi
// =========================================================================

(function () {
    'use strict';

    /**
     * Kunci pemetaan standar 90 soal PAPI Kostick untuk adapter jawaban
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
     * Helper konfigurasi Line Chart Chart.js untuk tes DISC (-8.0 sampai +8.0, garis netral di 0)
     */
    function createDiscLineChart(canvasId, label, points, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') return null;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['D', 'I', 'S', 'C'],
                datasets: [{
                    label: label,
                    data: points,
                    borderColor: color,
                    backgroundColor: color,
                    borderWidth: 3,
                    tension: 0.1,
                    fill: false,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: color,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: -8,
                        max: 8,
                        ticks: {
                            stepSize: 2,
                            font: { size: 10, weight: 'bold' }
                        },
                        grid: {
                            color: (context) => {
                                if (context.tick && context.tick.value === 0) {
                                    return 'rgba(239, 68, 68, 0.85)'; // Garis netral 0 berwarna merah tegas
                                }
                                return 'rgba(226, 232, 240, 0.8)';
                            },
                            lineWidth: (context) => {
                                if (context.tick && context.tick.value === 0) {
                                    return 2;
                                }
                                return 1;
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 12, weight: 'bold' },
                            color: '#003865'
                        },
                        grid: {
                            display: true,
                            color: 'rgba(241, 245, 249, 1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            }
        });
    }

    if (typeof window !== 'undefined') {
        window.PAPI_ANSWER_KEY = PAPI_ANSWER_KEY;
        window.PAPI_DOMAINS = PAPI_DOMAINS;
        window.PAPI_ASPECT_LIST = PAPI_ASPECT_LIST;
        window.drawCurvedDomainText = drawCurvedDomainText;
        window.drawPapiWheel = drawPapiWheel;
        window.createDiscLineChart = createDiscLineChart;
        window.HrdCharts = {
            drawCurvedDomainText,
            drawPapiWheel,
            createDiscLineChart
        };
    }
})();
