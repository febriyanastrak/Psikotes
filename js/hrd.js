/**
 * Memformat timestamp (ISO atau teks) ke format waktu lokal Indonesia yang seragam
 * @param {string|Date} val Timestamp
 * @returns {string} String waktu terformat
 */
function formatWaktuDisplay(val) {
    if (!val || val === '-' || val === 'null' || val === 'undefined') return '-';
    let str = String(val).trim();
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) return str;

    let note = '';
    const idxBracket = str.indexOf('[');
    if (idxBracket !== -1) {
        note = ' ' + str.substring(idxBracket).trim();
        str = str.substring(0, idxBracket).trim();
    }

    try {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return d.toLocaleString('id-ID') + note;
        }
    } catch (e) {}
    return String(val);
}

/**
 * Sanitasi string ketat untuk mencegah serangan XSS pada rendering HTML
 * @param {string} text Input teks
 * @returns {string} String yang sudah diamankan
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
if (typeof window !== 'undefined') {
    window.escapeHtml = escapeHtml;
}

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
        const posisiSafe = escapeHtml(row["Posisi"] || row.posisi || row.posisi_dilamar || '-');
        const penempatanSafe = escapeHtml(row["Penempatan"] || row.penempatan || '-');
        const domisiliSafe = escapeHtml(row["Domisili"] || row.domisili || '-');
        const waktuMulaiSafe = escapeHtml(row["Waktu Mulai"] || (row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-'));
        const waktuSelesaiSafe = escapeHtml(row["Waktu Selesai"] || '-');

        // Deteksi riwayat pelanggaran integritas (pindah tab)
        const vCount = Number(row["Pelanggaran Tab"] || 0);
        let badgeIntegritas = '';
        if (vCount === 0) {
            badgeIntegritas = '<span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><i class="fa-solid fa-shield-check text-[9px]"></i> 0 Pelanggaran (Jujur)</span>';
        } else if (vCount <= 2) {
            badgeIntegritas = `<span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><i class="fa-solid fa-triangle-exclamation text-[9px]"></i> Pernah ${vCount}x Ganti Tab</span>`;
        } else {
            badgeIntegritas = `<span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"><i class="fa-solid fa-ban text-[9px]"></i> ${vCount}x Pelanggaran (Diskualifikasi/Auto-Submit)</span>`;
        }

        const infoPosisiHtml = (posisiSafe !== '-' || penempatanSafe !== '-')
            ? `<div class="text-[11px] font-normal text-amber-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                ${posisiSafe !== '-' ? `<span><i class="fa-solid fa-briefcase text-[10px] mr-1"></i>${posisiSafe}</span>` : ''}
                ${penempatanSafe !== '-' ? `<span>&bull; <i class="fa-solid fa-location-dot text-[10px] mr-1"></i>${penempatanSafe}</span>` : ''}
               </div>`
            : '';

        const infoDomisiliHtml = (domisiliSafe !== '-')
            ? `<div class="text-[10px] font-normal text-slate-400"><i class="fa-solid fa-house-user text-[9px] mr-1"></i>Domisili: ${domisiliSafe}</div>`
            : '';

        const tokenSafe = escapeHtml(row["Token"] || row.token || '');
        const infoTokenHtml = (tokenSafe && tokenSafe !== '-')
            ? `<span class="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 text-amber-300 bg-amber-500/10 rounded border border-amber-500/20 uppercase font-bold tracking-wider"><i class="fa-solid fa-key text-[9px]"></i> Token: ${tokenSafe}</span>`
            : '';

        tr.innerHTML = `
            <td class="p-3 font-mono font-bold text-amber-400">${loopIdx + 1}</td>
            <td class="p-3 font-bold text-white">
                <div>${namaSafe}</div>
                ${infoPosisiHtml}
                ${infoDomisiliHtml}
                <div class="flex flex-wrap items-center gap-1.5 mt-1">
                    ${badgeIntegritas}
                    ${infoTokenHtml}
                </div>
            </td>
            <td class="p-3 text-xs text-slate-400">${emailSafe}<br>${waSafe}</td>
            <td class="p-3 text-xs text-slate-400 leading-relaxed">
                <div><span class="text-slate-300 font-medium">Mulai:</span> ${waktuMulaiSafe}</div>
                <div><span class="text-slate-300 font-medium">Selesai:</span> ${waktuSelesaiSafe}</div>
            </td>
            <td class="p-3 text-center">
                <button onclick="viewCandidateChart(${index})" class="bg-[#003865] hover:bg-[#0a4980] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow border border-[#0a4980] cursor-pointer">
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
let filterHrdDebounceTimer = null;
function filterHrdTable(immediate = false) {
    if (filterHrdDebounceTimer) {
        clearTimeout(filterHrdDebounceTimer);
        filterHrdDebounceTimer = null;
    }

    const _runFilter = () => {
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
        const posisi = (row["Posisi"] || row.posisi || row.posisi_dilamar || '').toLowerCase();
        const penempatan = (row["Penempatan"] || row.penempatan || '').toLowerCase();
        const domisili = (row["Domisili"] || row.domisili || '').toLowerCase();
        const token = (row["Token"] || row.token || '').toLowerCase();
        const id = String(row.id || '');
        return name.includes(query) || email.includes(query) || wa.includes(query) || 
               posisi.includes(query) || penempatan.includes(query) || domisili.includes(query) ||
               token.includes(query) || id.includes(query);
    });
    
        renderHrdTable(filtered);
    };

    if (immediate) {
        _runFilter();
    } else {
        filterHrdDebounceTimer = setTimeout(_runFilter, 200);
    }
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

    // Preload Kunci Jawaban IST secara paralel di background agar siap seketika saat modal kandidat dibuka
    try { fetchIstKeysFromDatabase().catch(() => {}); } catch (e) {}

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
                    row["Posisi"] = row.posisi || row.posisi_dilamar || '-';
                    row["Penempatan"] = row.penempatan || '-';
                    row["Domisili"] = row.domisili || '-';
                    row["Token"] = row.token || '-';
                    row["Waktu Mulai"] = formatWaktuDisplay(row.waktu_mulai || row["Waktu Mulai"] || (row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-'));
                    let rawWaktuSelesai = row.waktu_selesai || row["Waktu Selesai"] || null;
                    if (rawWaktuSelesai === '-') rawWaktuSelesai = null;

                    let tabViolations = 0;
                    if (row.hasil_pauli) {
                        try {
                            const p = typeof row.hasil_pauli === 'string' ? JSON.parse(row.hasil_pauli) : row.hasil_pauli;
                            row["Total Pauli"] = p.total_pauli !== undefined ? p.total_pauli : (p.total_pengerjaan || p.total || p.jawaban_benar || 0);
                            row["Jawaban Benar"] = p.jawaban_benar !== undefined ? p.jawaban_benar : (p.benar || 0);
                            row["Jawaban Salah"] = p.jawaban_salah !== undefined ? p.jawaban_salah : (p.salah || 0);
                            if (p.pelanggaran_tab !== undefined) tabViolations = Math.max(tabViolations, Number(p.pelanggaran_tab) || 0);
                            const rawInterval = p.garis_interval_3_menit || p.garis_interval;
                            if (rawInterval) {
                                row["Garis Interval (3 Menit)"] = Array.isArray(rawInterval) ? rawInterval.join(',') : rawInterval;
                            }
                            // Fallback 1: Waktu selesai dari hasil_pauli jika kolom utama kosong
                            if (!rawWaktuSelesai) {
                                if (p.waktu_selesai) rawWaktuSelesai = p.waktu_selesai;
                                else if (p.waktu_selesai_teks) rawWaktuSelesai = p.waktu_selesai_teks;
                            }
                        } catch (e) {}
                    }
                    // Fallback 2: Waktu selesai dari hasil_disc jika belum ada
                    if (!rawWaktuSelesai && row.hasil_disc) {
                        try {
                            const d = typeof row.hasil_disc === 'string' ? JSON.parse(row.hasil_disc) : row.hasil_disc;
                            if (d && d.waktu_selesai) rawWaktuSelesai = d.waktu_selesai;
                        } catch (e) {}
                    }
                    // Fallback 3: Waktu selesai dari hasil_papi jika belum ada
                    if (row.hasil_papi) {
                        try {
                            const papi = typeof row.hasil_papi === 'string' ? JSON.parse(row.hasil_papi) : row.hasil_papi;
                            if (papi && papi.pelanggaran_tab_switch !== undefined) {
                                tabViolations = Math.max(tabViolations, Number(papi.pelanggaran_tab_switch) || 0);
                            }
                            if (!rawWaktuSelesai && papi) {
                                if (papi.selesai_pada) rawWaktuSelesai = papi.selesai_pada;
                                else if (papi.waktu_selesai) rawWaktuSelesai = papi.waktu_selesai;
                            }
                        } catch (e) {}
                    }
                    // Fallback 4: Waktu selesai dari hasil_ist jika belum ada
                    if (row.hasil_ist) {
                        try {
                            const ist = typeof row.hasil_ist === 'string' ? JSON.parse(row.hasil_ist) : row.hasil_ist;
                            if (ist.pelanggaran_tab_switch !== undefined) tabViolations = Math.max(tabViolations, Number(ist.pelanggaran_tab_switch) || 0);
                            if (!rawWaktuSelesai && ist) {
                                if (ist.waktu_selesai) {
                                    rawWaktuSelesai = ist.waktu_selesai;
                                } else if (typeof ist === 'object') {
                                    for (let s = 9; s >= 1; s--) {
                                        const k = 'subtes_' + String(s).padStart(2, '0');
                                        if (ist[k] && ist[k].waktu_selesai) {
                                            rawWaktuSelesai = ist[k].waktu_selesai;
                                            break;
                                        }
                                    }
                                }
                            }
                        } catch (e) {}
                    }
                    // Deteksi pelanggaran dari modul Asesmen Tahap 2 (MSDT, EPPS, CFIT, MBTI)
                    ['hasil_msdt', 'hasil_epps', 'hasil_cfit', 'hasil_mbti', 'hasil_mcmi'].forEach(modKey => {
                        if (row[modKey]) {
                            try {
                                const m = typeof row[modKey] === 'string' ? JSON.parse(row[modKey]) : row[modKey];
                                if (m && m.pelanggaran_tab_switch !== undefined) {
                                    tabViolations = Math.max(tabViolations, Number(m.pelanggaran_tab_switch) || 0);
                                }
                            } catch (eMod) {}
                        }
                    });

                    // Fallback deteksi jika terdapat string "Tab Switch: Nx" di waktu selesai
                    const mTab = String(rawWaktuSelesai || '').match(/Tab Switch:\s*(\d+)x/i);
                    if (mTab) tabViolations = Math.max(tabViolations, parseInt(mTab[1], 10));

                    row["Waktu Selesai"] = rawWaktuSelesai ? formatWaktuDisplay(rawWaktuSelesai) : '-';
                    row["Pelanggaran Tab"] = tabViolations;
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
            // 1. Jika ID Supabase sama persis, pasti entri kandidat yang sama
            if (a.id && b.id && String(a.id) === String(b.id)) return true;

            const isRealEmail = (e) => e && e !== '-' && !e.includes('altrak1978.co.id') && e.includes('@');
            const emA = (a["Alamat Email"] || a.email || '').toString().trim().toLowerCase();
            const emB = (b["Alamat Email"] || b.email || '').toString().trim().toLowerCase();

            // Proteksi: Jika kedua email terisi namun berbeda, PASTI kandidat berbeda
            if (isRealEmail(emA) && isRealEmail(emB) && emA !== emB) return false;

            const waA = normalizeWaNumber(a["No WhatsApp"] || a.no_wa);
            const waB = normalizeWaNumber(b["No WhatsApp"] || b.no_wa);
            const hasWaA = waA.length >= 9;
            const hasWaB = waB.length >= 9;

            // Proteksi: Jika kedua nomor WA terisi namun berbeda, PASTI kandidat berbeda
            if (hasWaA && hasWaB && waA !== waB) return false;

            // 2. Jika email valid dan sama persis
            if (isRealEmail(emA) && isRealEmail(emB) && emA === emB) return true;

            // 3. Jika nomor WA valid dan sama persis
            if (hasWaA && hasWaB && waA === waB) return true;

            // 4. Jika memiliki token ujian unik yang sama persis
            const tokA = (a["Token"] || a.token || '').toString().trim().toLowerCase();
            const tokB = (b["Token"] || b.token || '').toString().trim().toLowerCase();
            if (tokA && tokB && tokA !== '-' && tokA === tokB) return true;

            // 5. Pencocokan nama: Hanya jika didukung kecocokan kontak atau catatan lama tanpa kontak
            const nmA = (a["Nama Lengkap"] || a.nama_lengkap || '').toString().trim().toLowerCase();
            const nmB = (b["Nama Lengkap"] || b.nama_lengkap || '').toString().trim().toLowerCase();
            const isGenericName = (n) => !n || n === '-' || n === 'peserta' || n === 'peserta ujian' || n === 'kandidat';
            if (!isGenericName(nmA) && !isGenericName(nmB) && nmA === nmB) {
                // Jangan gabung jika salah satu kontak berbeda
                if ((isRealEmail(emA) && isRealEmail(emB) && emA !== emB) || (hasWaA && hasWaB && waA !== waB)) {
                    return false;
                }
                // Gabung jika salah satu kontak sama persis
                if ((isRealEmail(emA) && emA === emB) || (hasWaA && waA === waB)) {
                    return true;
                }
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
            if (source["Pelanggaran Tab"] !== undefined) {
                target["Pelanggaran Tab"] = Math.max(Number(target["Pelanggaran Tab"] || 0), Number(source["Pelanggaran Tab"] || 0));
            }
            if ((!target["Posisi"] || target["Posisi"] === '-') && source["Posisi"]) target["Posisi"] = source["Posisi"];
            if ((!target["Penempatan"] || target["Penempatan"] === '-') && source["Penempatan"]) target["Penempatan"] = source["Penempatan"];
            if ((!target["Domisili"] || target["Domisili"] === '-') && source["Domisili"]) target["Domisili"] = source["Domisili"];
            if ((!target["Token"] || target["Token"] === '-') && source["Token"]) target["Token"] = source["Token"];
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
        filterHrdTable(true);
    } catch (err) {
        console.error('Gagal mengambil data HRD:', err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-red-400">Gagal mengambil data dari database server. Periksa koneksi internet Anda.</td></tr>`;
        }
    }
}

/**
 * Mengekspor seluruh data hasil tes kandidat ke file Excel (.csv)
 * Terpusat & modular di js/hrd-export.js
 */
function exportHrdToExcel() {
    if (window.HrdExport && typeof window.HrdExport.exportHrdToExcel === 'function') {
        return window.HrdExport.exportHrdToExcel();
    }
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

    // Cek apakah kandidat mengikuti asesmen manajerial tahap 2
    const hasDataTahap2 = !!(
        row.hasil_msdt || row.hasil_cfit || row.hasil_mbti || row.hasil_mcmi ||
        row.token_tahap_2 || row.status_tahap_2
    );

    // Atur visibilitas tombol tab Tahap 2 secara dinamis
    ['tabBtnMsdt', 'tabBtnCfit', 'tabBtnMbti'].forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.style.display = hasDataTahap2 ? 'inline-flex' : 'none';
        }
    });
    const dividerTahap2 = document.getElementById('dividerTahap2');
    if (dividerTahap2) {
        dividerTahap2.style.display = hasDataTahap2 ? 'block' : 'none';
    }

    // Render data ke masing-masing tab asesmen
    renderIstResults(row.hasil_ist);
    renderPapiResults(row.hasil_papi);
    renderDiscResults(row.hasil_disc);
    renderEppsResults(row.hasil_epps);
    if (hasDataTahap2) {
        renderMsdtResults(row.hasil_msdt);
        renderCfitResults(row.hasil_cfit);
        renderMbtiResults(row.hasil_mbti || row.hasil_mcmi);
    }
    switchHrdTab('ist');

    const rptName = document.getElementById('rptName');
    const rptWa = document.getElementById('rptWa');
    const rptDate = document.getElementById('rptDate');
    const rptPosisi = document.getElementById('rptPosisi');

    if (rptName) rptName.innerText = row["Nama Lengkap"] || '-';
    if (rptWa) rptWa.innerText = row["No WhatsApp"] || '-';

    if (rptPosisi) {
        const p = row["Posisi"] || row.posisi || row.posisi_dilamar || '-';
        const c = row["Penempatan"] || row.penempatan || '';
        const d = row["Domisili"] || row.domisili || '';
        const t = row["Token"] || row.token || '';
        
        let branchStr = c && c !== '-' ? ` (${c})` : '';
        let txt = `<div class="font-bold text-sm text-[#003865] truncate leading-tight">${escapeHtml(p)}${escapeHtml(branchStr)}</div>`;
        
        let badges = [];
        if (d && d !== '-') {
            badges.push(`<span class="inline-flex items-center text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Dom: ${escapeHtml(d)}</span>`);
        }
        if (t && t !== '-') {
            badges.push(`<span class="inline-flex items-center text-[10px] font-mono font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">Token: ${escapeHtml(t.toUpperCase())}</span>`);
        }
        if (hasDataTahap2) {
            badges.push(`<span class="inline-flex items-center gap-1 bg-amber-500/15 text-amber-800 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full"><i class="fa-solid fa-crown text-amber-500"></i> Manajerial (Tahap 2)</span>`);
        }
        if (badges.length > 0) {
            txt += `<div class="flex flex-wrap items-center gap-1.5 mt-1">${badges.join('')}</div>`;
        }
        rptPosisi.innerHTML = txt;
    }
    
    let rawDate = (row["Waktu Selesai"] && row["Waktu Selesai"] !== '-') ? row["Waktu Selesai"] : (row["Waktu Mulai"] || '-');
    if (rptDate) {
        const vCount = Number(row["Pelanggaran Tab"] || 0);
        let badgeHtml = vCount === 0 
            ? ' <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 ml-2">✓ 0 Pelanggaran (Jujur)</span>'
            : (vCount <= 2
                ? ` <span class="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 ml-2">⚠️ ${vCount}x Ganti Tab</span>`
                : ` <span class="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700 ml-2">⛔ ${vCount}x Pelanggaran (Auto-Submit)</span>`);
        rptDate.innerHTML = escapeHtml(rawDate.split(',')[0]) + badgeHtml;
    }

    let intervalString = row["Garis Interval (3 Menit)"] || "";
    if (!intervalString && row.hasil_pauli) {
        try {
            const p = typeof row.hasil_pauli === 'string' ? JSON.parse(row.hasil_pauli) : row.hasil_pauli;
            const rawInterval = p.garis_interval_3_menit || p.garis_interval;
            if (rawInterval) {
                intervalString = Array.isArray(rawInterval) ? rawInterval.join(',') : String(rawInterval);
            }
        } catch (e) {}
    }

    let parsedData = [];
    if (intervalString) {
        parsedData = intervalString.split(',').map(num => parseInt(num.trim()) || 0);
    }
    while (parsedData.length < 20) parsedData.push(0);

    // =========================================================================
    // RUMUS RESMI HRD PT ALTRAK 1978 - SKORING PAULI TEST
    // =========================================================================
    let jumlah = Number(row["Total Pauli"] || 0);
    if (!jumlah && row.hasil_pauli) {
        try {
            const p = typeof row.hasil_pauli === 'string' ? JSON.parse(row.hasil_pauli) : row.hasil_pauli;
            jumlah = Number(p.total_pauli !== undefined ? p.total_pauli : (p.total_pengerjaan || p.total || 0));
        } catch (e) {}
    }
    let salah = Number(row["Jawaban Salah"] || 0);
    if (!salah && row.hasil_pauli) {
        try {
            const p = typeof row.hasil_pauli === 'string' ? JSON.parse(row.hasil_pauli) : row.hasil_pauli;
            salah = Number(p.jawaban_salah !== undefined ? p.jawaban_salah : (p.salah || 0));
        } catch (e) {}
    }

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
 * Menampilkan modal dialog input teks modern (pengganti window.prompt)
 * @param {string} title Judul modal
 * @param {string} desc Deskripsi pesan
 * @param {string} confirmWord Kata kunci yang harus diketikkan
 * @param {Function} onConfirm Callback jika kata kunci cocok
 * @param {Function} onCancel Callback jika dibatalkan
 */
function showModernHrdPrompt(title, desc, confirmWord, onConfirm, onCancel) {
    const modal = document.getElementById('modal-hrd-prompt');
    const titleEl = document.getElementById('promptTitle');
    const descEl = document.getElementById('promptDesc');
    const inputEl = document.getElementById('promptInput');
    const errEl = document.getElementById('promptError');
    const btnCancel = document.getElementById('promptBtnCancel');
    const btnConfirm = document.getElementById('promptBtnConfirm');

    if (!modal) {
        const res = window.prompt(`${title}\n\n${desc.replace(/<[^>]*>/g, '')}`);
        if (res === confirmWord) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
        return;
    }

    if (titleEl) titleEl.innerText = title;
    if (descEl) descEl.innerHTML = desc;
    if (inputEl) {
        inputEl.value = '';
        inputEl.placeholder = `Ketik ${confirmWord} di sini...`;
        inputEl.classList.remove('border-red-500', 'ring-2', 'ring-red-500/20');
    }
    if (errEl) errEl.classList.add('hidden');

    modal.classList.remove('hide-section');
    modal.style.display = 'flex';
    if (inputEl) setTimeout(() => inputEl.focus(), 60);

    const closeModal = () => {
        modal.classList.add('hide-section');
        modal.style.display = 'none';
        btnCancel.onclick = null;
        btnConfirm.onclick = null;
        if (inputEl) inputEl.onkeydown = null;
    };

    btnCancel.onclick = () => {
        closeModal();
        if (onCancel) onCancel();
    };

    btnConfirm.onclick = () => {
        const val = inputEl ? inputEl.value.trim() : '';
        if (val === confirmWord) {
            closeModal();
            if (onConfirm) onConfirm();
        } else {
            if (inputEl) {
                inputEl.classList.add('border-red-500', 'ring-2', 'ring-red-500/20');
                inputEl.focus();
            }
            if (errEl) errEl.classList.remove('hidden');
        }
    };

    if (inputEl) {
        inputEl.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnConfirm.click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                btnCancel.click();
            }
        };
    }
}

/**
 * Menampilkan floating toast notification elegan untuk panel HRD
 * @param {string} message Pesan yang ditampilkan
 * @param {'success'|'info'} type Jenis notifikasi
 */
let hrdToastTimer = null;
function showHrdToast(message, type = 'success') {
    const toast = document.getElementById('hrdToast');
    if (!toast) {
        if (typeof customAlert === 'function') {
            customAlert(type === 'success' ? 'Berhasil' : 'Informasi', message, type);
        }
        return;
    }

    const toastMsg = document.getElementById('hrdToastMsg');
    const toastIcon = document.getElementById('hrdToastIcon');
    if (toastMsg) toastMsg.innerText = message;

    if (toastIcon) {
        if (type === 'success') {
            toastIcon.className = "w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-sm border border-emerald-500/30";
            toastIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else {
            toastIcon.className = "w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-sm border border-blue-500/30";
            toastIcon.innerHTML = '<i class="fa-solid fa-info"></i>';
        }
    }

    toast.classList.remove('hide-section');
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    if (hrdToastTimer) clearTimeout(hrdToastTimer);
    hrdToastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.classList.add('hide-section'), 300);
    }, 2800);
}

/**
 * Menghapus seluruh data lama di web HRD dan mereset ID kembali ke 1
 */
async function hapusSemuaData() {
    showModernHrdPrompt(
        "Konfirmasi Hapus Seluruh Data",
        "PERINGATAN KRUSIAL:<br>Anda akan menghapus <strong>SEMUA data hasil tes peserta</strong> dan nomor urut akan direset ke 1. Tindakan ini permanen.<br><br>Ketik <strong class='text-red-400 font-mono tracking-widest bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20'>HAPUS</strong> untuk mengonfirmasi:",
        "HAPUS",
        async () => {
            const loadingEl = document.getElementById('modal-loading');
            if (loadingEl) loadingEl.classList.remove('hide-section');

            try {
                const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
                    ? supabaseClient
                    : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

                if (!sb) {
                    if (loadingEl) loadingEl.classList.add('hide-section');
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

                if (loadingEl) loadingEl.classList.add('hide-section');
                customAlert("Berhasil Dikosongkan", "Semua riwayat hasil tes peserta telah berhasil dikosongkan.", "success");
                await loadHrdData();
            } catch (err) {
                if (loadingEl) loadingEl.classList.add('hide-section');
                console.error("Gagal mengosongkan data:", err);
                customAlert("Gagal Menghapus Data", "Terjadi kesalahan saat menghapus data: " + (err.message || err), "error");
            }
        },
        () => {
            showHrdToast("Penghapusan data dibatalkan.", "info");
        }
    );
}

// =========================================================================
// FITUR TAB LAPORAN TERPADU 4 TES & DOKUMENTASI FOTO PENGAWASAN
// =========================================================================
let currentSelectedCandidate = null;

/**
 * Berpindah antar tab hasil tes (Pauli, IST, PAPI, DISC, Foto, MSDT, EPPS, CFIT, MBTI)
 * @param {'pauli'|'ist'|'papi'|'disc'|'foto'|'msdt'|'epps'|'cfit'|'mbti'} tabId 
 */
function switchHrdTab(tabId) {
    if (tabId === 'mcmi') tabId = 'mbti';
    const tabs = ['pauli', 'ist', 'papi', 'disc', 'epps', 'msdt', 'cfit', 'mbti', 'foto'];
    const hasDataTahap2 = currentSelectedCandidate && !!(
        currentSelectedCandidate.hasil_msdt ||
        currentSelectedCandidate.hasil_cfit || currentSelectedCandidate.hasil_mbti ||
        currentSelectedCandidate.hasil_mcmi ||
        currentSelectedCandidate.token_tahap_2 || currentSelectedCandidate.status_tahap_2
    );

    const dividerTahap2 = document.getElementById('dividerTahap2');
    if (dividerTahap2) {
        dividerTahap2.style.display = hasDataTahap2 ? 'block' : 'none';
    }

    tabs.forEach(t => {
        const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
        const panel = document.getElementById('panelTab' + t.charAt(0).toUpperCase() + t.slice(1));
        const isTahap2Tab = ['msdt', 'cfit', 'mbti'].includes(t);

        if (btn) {
            if (isTahap2Tab && !hasDataTahap2) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'inline-flex';
                if (t === tabId) {
                    btn.className = "hrd-tab-btn active px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 bg-[#003865] text-white shadow-sm shrink-0 whitespace-nowrap";
                } else if (t === 'foto') {
                    btn.className = "hrd-tab-btn px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 border border-amber-500/30 hover:bg-amber-500/20 shrink-0 whitespace-nowrap";
                } else {
                    btn.className = "hrd-tab-btn px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0 whitespace-nowrap";
                }
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

    if (tabId === 'ist' && istProfileChartInstance) {
        setTimeout(() => {
            istProfileChartInstance.resize();
        }, 50);
    }

    if (tabId === 'foto' && currentSelectedCandidate) {
        renderCandidatePhotos(currentSelectedCandidate);
    }

    if (tabId === 'papi' && currentSelectedCandidate) {
        renderPapiResults(currentSelectedCandidate.hasil_papi);
    }

    if (tabId === 'disc' && currentSelectedCandidate) {
        renderDiscResults(currentSelectedCandidate.hasil_disc);
    }

    if (tabId === 'msdt' && currentSelectedCandidate) {
        renderMsdtResults(currentSelectedCandidate.hasil_msdt);
    }

    if (tabId === 'epps' && currentSelectedCandidate) {
        renderEppsResults(currentSelectedCandidate.hasil_epps);
    }

    if (tabId === 'cfit' && currentSelectedCandidate) {
        renderCfitResults(currentSelectedCandidate.hasil_cfit);
    }

    if (tabId === 'mbti' && currentSelectedCandidate) {
        renderMbtiResults(currentSelectedCandidate.hasil_mbti || currentSelectedCandidate.hasil_mcmi);
    }
}

/**
 * Merender Hasil Tes MSDT (Gaya Kepemimpinan Reddin 3-D) di Modal HRD
 * Menampilkan Evaluasi Waktu Nyata (30 Menit), Indeks TO/RO/E, 8 Gaya Kepemimpinan, & Lembar Jawaban 64 Soal
 */
function renderMsdtResults(rawData) {
    const emptyNotice = document.getElementById('msdtEmptyNotice');
    const namaEl = document.getElementById('msdtRptGayaNama');
    const deskripsiEl = document.getElementById('msdtRptGayaDeskripsi');
    const tipeEl = document.getElementById('msdtRptTipe');
    const toEl = document.getElementById('msdtRptTO');
    const roEl = document.getElementById('msdtRptRO');
    const eEl = document.getElementById('msdtRptE');
    const rawToEl = document.getElementById('msdtRptRawTO');
    const rawRoEl = document.getElementById('msdtRptRawRO');
    const rawEEl = document.getElementById('msdtRptRawE');
    const durasiEl = document.getElementById('msdtRptDurasi');
    const waktuMulaiSelesaiEl = document.getElementById('msdtRptWaktuMulaiSelesai');
    const overtimeEl = document.getElementById('msdtRptOvertime');
    const ketWaktuEl = document.getElementById('msdtRptKetWaktu');
    const badgeWaktuEl = document.getElementById('msdtRptBadgeWaktu');

    if (!rawData) {
        if (emptyNotice) emptyNotice.classList.remove('hidden');
        if (namaEl) namaEl.innerText = "-";
        if (deskripsiEl) deskripsiEl.innerText = "Belum ada data pengerjaan MSDT.";
        if (tipeEl) tipeEl.innerText = "-";
        if (toEl) toEl.innerText = "-";
        if (roEl) roEl.innerText = "-";
        if (eEl) eEl.innerText = "-";
        if (rawToEl) rawToEl.innerText = "Raw Score: -";
        if (rawRoEl) rawRoEl.innerText = "Raw Score: -";
        if (rawEEl) rawEEl.innerText = "Raw Score: -";
        if (durasiEl) durasiEl.innerText = "-";
        if (waktuMulaiSelesaiEl) waktuMulaiSelesaiEl.innerText = "-";
        if (overtimeEl) overtimeEl.innerText = "-";
        if (ketWaktuEl) ketWaktuEl.innerText = "-";
        if (badgeWaktuEl) badgeWaktuEl.innerHTML = '<span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">Belum Ada Data</span>';
        return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');

    let parsed = rawData;
    if (typeof rawData === 'string') {
        try { parsed = JSON.parse(rawData); } catch (e) {}
    }

    const a = parsed.analisis || parsed;
    const jawaban = parsed.jawaban || {};
    const evaluasiWaktu = a.evaluasi_waktu || {};

    // 1. Hitung Rekapitulasi Matriks 8x8 dari Jawaban Mentah Peserta (Sesuai Rumus Resmi Reddin)
    const countA = [0, 0, 0, 0, 0, 0, 0, 0];
    const countB = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const no = r * 8 + c + 1;
            const ans = jawaban[no] !== undefined ? String(jawaban[no]).trim().toUpperCase() : (jawaban[String(no)] !== undefined ? String(jawaban[String(no)]).trim().toUpperCase() : '-');
            if (ans === 'A') countA[r]++;
            if (ans === 'B') countB[c]++;
        }
    }

    const koreksi = [+1, +2, +1, 0, +3, -1, 0, -4];
    const colJumlah = [];
    for (let c = 0; c < 8; c++) {
        colJumlah.push(countA[c] + countB[c] + koreksi[c]);
    }

    // Pemetaan 8 Gaya Kepemimpinan Reddin
    const gayaMap = {
        Ds: colJumlah[0],
        Mi: colJumlah[1],
        Au: colJumlah[2],
        Co: colJumlah[3],
        Bu: colJumlah[4],
        Dv: colJumlah[5],
        Ba: colJumlah[6],
        E:  colJumlah[7]
    };

    const valDs = (a.skor_8_gaya && a.skor_8_gaya.Ds !== undefined) ? a.skor_8_gaya.Ds : gayaMap.Ds;
    const valMi = (a.skor_8_gaya && a.skor_8_gaya.Mi !== undefined) ? a.skor_8_gaya.Mi : gayaMap.Mi;
    const valAu = (a.skor_8_gaya && a.skor_8_gaya.Au !== undefined) ? a.skor_8_gaya.Au : gayaMap.Au;
    const valCo = (a.skor_8_gaya && a.skor_8_gaya.Co !== undefined) ? a.skor_8_gaya.Co : gayaMap.Co;
    const valBu = (a.skor_8_gaya && a.skor_8_gaya.Bu !== undefined) ? a.skor_8_gaya.Bu : gayaMap.Bu;
    const valDv = (a.skor_8_gaya && a.skor_8_gaya.Dv !== undefined) ? a.skor_8_gaya.Dv : gayaMap.Dv;
    const valBa = (a.skor_8_gaya && a.skor_8_gaya.Ba !== undefined) ? a.skor_8_gaya.Ba : gayaMap.Ba;
    const valE  = (a.skor_8_gaya && a.skor_8_gaya.E  !== undefined) ? a.skor_8_gaya.E  : gayaMap.E;

    // Perhitungan Skor Mentah Dimensi Utama Reddin
    const calculatedRawTO = a.raw_to !== undefined ? a.raw_to : (valAu + valCo + valBa + valE);
    const calculatedRawRO = a.raw_ro !== undefined ? a.raw_ro : (valMi + valCo + valDv + valE);
    const calculatedRawE  = a.raw_e  !== undefined ? a.raw_e  : (valBu + valDv + valBa + valE);
    const calculatedRawO  = a.raw_o  !== undefined ? a.raw_o  : valDs;

    function konversiSkorMentahKeIndeks(raw) {
        if (raw <= 29) return 0.0;
        if (raw >= 30 && raw <= 31) return 0.6;
        if (raw === 32) return 1.2;
        if (raw === 33) return 1.8;
        if (raw === 34) return 2.4;
        if (raw === 35) return 3.0;
        if (raw >= 36 && raw <= 37) return 3.6;
        if (raw >= 38) return 4.0;
        return 0.0;
    }

    const indTO = a.indeks_to !== undefined ? a.indeks_to : (a.skor_to !== undefined ? a.skor_to : konversiSkorMentahKeIndeks(calculatedRawTO));
    const indRO = a.indeks_ro !== undefined ? a.indeks_ro : (a.skor_ro !== undefined ? a.skor_ro : konversiSkorMentahKeIndeks(calculatedRawRO));
    const indE  = a.indeks_e  !== undefined ? a.indeks_e  : (a.skor_e  !== undefined ? a.skor_e  : konversiSkorMentahKeIndeks(calculatedRawE));

    // Evaluasi Pohon Keputusan Reddin
    let gayaKode = "EXECUTIVE";
    if (indTO > 2.0) {
        if (indRO > 2.0) {
            gayaKode = (indE > 2.0) ? "EXECUTIVE" : "COMPROMISER";
        } else {
            gayaKode = (indE > 2.0) ? "BENEVOLENT_AUTOCRAT" : "AUTOCRAT";
        }
    } else {
        if (indRO > 2.0) {
            gayaKode = (indE > 2.0) ? "DEVELOPER" : "MISSIONARY";
        } else {
            gayaKode = (indE > 2.0) ? "BUREAUCRAT" : "DESERTER";
        }
    }

    const gayaMetadata = {
        EXECUTIVE: { nama: "Executive (Eksekutif)", tipe: "Efektif", deskripsi: "Mampu memotivasi tim kerja, menetapkan standar prestasi yang tinggi, memperlakukan bawahan secara adil, dan efektif mencapai target organisasi dengan menjaga hubungan tim yang harmonis." },
        DEVELOPER: { nama: "Developer (Pembangun / Pembina)", tipe: "Efektif", deskripsi: "Menaruh kepercayaan penuh pada bawahan, fokus pada pengembangan potensi anggota tim, dan menciptakan iklim kerja kolaboratif yang sangat positif." },
        BENEVOLENT_AUTOCRAT: { nama: "Benevolent Autocrat (Otokrat Bijak)", tipe: "Efektif", deskripsi: "Tegas, sangat berorientasi target dan hasil nyata tanpa memicu kebencian. Mampu mengambil keputusan cepat dan memastikan tugas selesai tepat waktu." },
        BUREAUCRAT: { nama: "Bureaucrat (Birokrat / Tertib Aturan)", tipe: "Efektif", deskripsi: "Sangat taat pada SOP dan regulasi, teliti terhadap aturan dan prosedur, menjaga stabilitas sistem organisasi dan integritas proses kerja." },
        COMPROMISER: { nama: "Compromiser (Kompromis)", tipe: "Kurang Efektif", deskripsi: "Terlalu mudah berkompromi di bawah tekanan, sering bimbang antara target kerja dan menyenangkan bawahan sehingga efektivitas kepemimpinan menurun." },
        MISSIONARY: { nama: "Missionary (Misionaris / Penyenang)", tipe: "Kurang Efektif", deskripsi: "Terlalu mengutamakan keharmonisan hubungan pribadi sehingga enggan menegur bawahan dan sering mengorbankan pencapaian target organisasi." },
        AUTOCRAT: { nama: "Autocrat (Otokrat)", tipe: "Kurang Efektif", deskripsi: "Terlalu mendominasi, menuntut kepatuhan mutlak, mengabaikan aspirasi bawahan, dan mengandalkan instruksi sepihak." },
        DESERTER: { nama: "Deserter (Pelarian / Pasif)", tipe: "Kurang Efektif", deskripsi: "Cenderung lepas tangan dari tanggung jawab, pasif, enggan terlibat dalam dinamika tim, dan kurang peduli pada pencapaian target." }
    };

    const defaultInfo = gayaMetadata[gayaKode] || gayaMetadata.EXECUTIVE;
    const finalNamaGaya = a.nama_gaya || a.gaya_utama || defaultInfo.nama;
    const finalDeskripsi = a.deskripsi_gaya || defaultInfo.deskripsi;
    const finalTipe = a.tipe_efektivitas || defaultInfo.tipe;

    // 2. Data Gaya Kepemimpinan Dominan ke UI
    if (namaEl) namaEl.innerText = finalNamaGaya;
    if (deskripsiEl) deskripsiEl.innerText = finalDeskripsi;
    if (tipeEl) tipeEl.innerText = finalTipe;

    // 3. Metrik TO, RO, E (Indeks & Raw Score)
    if (toEl) toEl.innerText = typeof indTO === 'number' ? indTO.toFixed(1) : indTO;
    if (roEl) roEl.innerText = typeof indRO === 'number' ? indRO.toFixed(1) : indRO;
    if (eEl) eEl.innerText = typeof indE === 'number' ? indE.toFixed(1) : indE;

    if (rawToEl) rawToEl.innerText = `Raw Score: ${calculatedRawTO}`;
    if (rawRoEl) rawRoEl.innerText = `Raw Score: ${calculatedRawRO}`;
    if (rawEEl) rawEEl.innerText = `Raw Score: ${calculatedRawE}`;

    // 4. Evaluasi Waktu Pengerjaan (Silent Timer 30 Menit)
    const durasiDetik = parsed.durasi_detik || evaluasiWaktu.durasi_pengerjaan_detik || 0;
    const durasiTeks = parsed.durasi_teks || evaluasiWaktu.durasi_teks || `${Math.round(durasiDetik / 60)} Menit`;
    const isOvertime = parsed.is_overtime !== undefined ? parsed.is_overtime : (evaluasiWaktu.is_overtime || (durasiDetik > 1800));
    const overtimeTeks = evaluasiWaktu.overtime_teks || (isOvertime ? `${Math.round((durasiDetik - 1800) / 60)} Menit` : '0 Menit');

    if (durasiEl) durasiEl.innerText = durasiTeks;

    const wMulai = parsed.waktu_mulai ? new Date(parsed.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
    const wSelesai = parsed.waktu_selesai ? new Date(parsed.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
    if (waktuMulaiSelesaiEl) waktuMulaiSelesaiEl.innerText = `Mulai: ${wMulai} &bull; Selesai: ${wSelesai}`;

    if (overtimeEl) {
        if (isOvertime) {
            overtimeEl.innerText = `+${overtimeTeks}`;
            overtimeEl.className = "text-xl font-black text-rose-600 mt-0.5";
        } else {
            overtimeEl.innerText = "0 Menit (Tepat)";
            overtimeEl.className = "text-xl font-black text-emerald-600 mt-0.5";
        }
    }

    if (ketWaktuEl) {
        ketWaktuEl.innerText = isOvertime 
            ? `Pengerjaan melebihi alokasi waktu 30 menit` 
            : `Pengerjaan diselesaikan tepat dalam batas 30 menit`;
    }

    if (badgeWaktuEl) {
        if (isOvertime) {
            badgeWaktuEl.innerHTML = `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-700 border border-rose-500/30">
                    <i class="fa-solid fa-triangle-exclamation text-rose-600"></i> Lewat Waktu / Overtime (+${overtimeTeks})
                </span>
            `;
        } else {
            badgeWaktuEl.innerHTML = `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                    <i class="fa-solid fa-circle-check text-emerald-600"></i> ✓ Tepat Waktu (&lt; 30 Menit)
                </span>
            `;
        }
    }

    // 5. Render Tabel Matriks 8x8 & Rincian Soal 1..64
    const matrixTbody = document.getElementById('msdtMatrixTableBody');
    const rowAEl = document.getElementById('msdtRowA');
    const rowBEl = document.getElementById('msdtRowB');
    const rowJumlahEl = document.getElementById('msdtRowJumlah');

    if (matrixTbody) {
        let rowsHtml = '';
        for (let r = 0; r < 8; r++) {
            rowsHtml += `<tr class="divide-x divide-slate-300 hover:bg-slate-50 transition-colors">`;
            rowsHtml += `<td class="py-1 px-1.5 text-center font-mono text-[10px] text-slate-400 bg-slate-50 border-r-2 border-slate-700">R${r + 1}</td>`;
            for (let c = 0; c < 8; c++) {
                const no = r * 8 + c + 1;
                const ans = jawaban[no] !== undefined ? String(jawaban[no]).trim().toUpperCase() : (jawaban[String(no)] !== undefined ? String(jawaban[String(no)]).trim().toUpperCase() : '-');
                const badge = ans === 'A'
                    ? '<span class="px-1.5 py-0.5 rounded text-[11px] font-black bg-blue-600 text-white shadow-2xs">A</span>'
                    : (ans === 'B'
                        ? '<span class="px-1.5 py-0.5 rounded text-[11px] font-black bg-amber-500 text-white shadow-2xs">B</span>'
                        : '<span class="text-slate-300">-</span>');
                rowsHtml += `
                    <td class="py-1 px-1 text-center">
                        <div class="flex items-center justify-between px-1">
                            <span class="text-[10px] text-slate-400 font-mono">${no}</span>
                            ${badge}
                        </div>
                    </td>
                `;
            }
            rowsHtml += `</tr>`;
        }
        matrixTbody.innerHTML = rowsHtml;
    }

    // Update Baris A, B, dan Jumlah pada Tfoot
    if (rowAEl) {
        let h = '<td class="py-1 px-2 font-black text-center border-r-2 border-slate-700 bg-blue-100 text-blue-950">A</td>';
        for (let c = 0; c < 8; c++) {
            h += `<td class="py-1 px-1 font-bold text-center">${countA[c]}</td>`;
        }
        rowAEl.innerHTML = h;
    }

    if (rowBEl) {
        let h = '<td class="py-1 px-2 font-black text-center border-r-2 border-slate-700 bg-amber-100 text-amber-950">B</td>';
        for (let c = 0; c < 8; c++) {
            h += `<td class="py-1 px-1 font-bold text-center">${countB[c]}</td>`;
        }
        rowBEl.innerHTML = h;
    }

    if (rowJumlahEl) {
        let h = '<td class="py-1.5 px-2 font-black text-center border-r-2 border-slate-700 bg-emerald-100 text-emerald-950 text-[10px]">JUMLAH</td>';
        for (let c = 0; c < 8; c++) {
            h += `<td class="py-1.5 px-1 font-black text-emerald-700 text-center text-sm">${colJumlah[c]}</td>`;
        }
        rowJumlahEl.innerHTML = h;
    }

    // 6. Update Tabel Skoring 8 Gaya & Blok Cyan 4 Dimensi
    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
    setTxt('msdtValGaya_Ds', `= ${valDs}`);
    setTxt('msdtValGaya_Mi', `= ${valMi}`);
    setTxt('msdtValGaya_Au', `= ${valAu}`);
    setTxt('msdtValGaya_Co', `= ${valCo}`);
    setTxt('msdtValGaya_Bu', `= ${valBu}`);
    setTxt('msdtValGaya_Dv', `= ${valDv}`);
    setTxt('msdtValGaya_Ba', `= ${valBa}`);
    setTxt('msdtValGaya_E',  `= ${valE}`);

    // Blok Kotak Biru Cyan di Kolom TO, RO, E, O
    setTxt('msdtBlock_Ds_O',  valDs);
    setTxt('msdtBlock_Mi_RO', valMi);
    setTxt('msdtBlock_Au_TO', valAu);
    setTxt('msdtBlock_Co_TO', valCo);
    setTxt('msdtBlock_Co_RO', valCo);
    setTxt('msdtBlock_Bu_E',  valBu);
    setTxt('msdtBlock_Dv_RO', valDv);
    setTxt('msdtBlock_Dv_E',  valDv);
    setTxt('msdtBlock_Ba_TO', valBa);
    setTxt('msdtBlock_Ba_E',  valBa);
    setTxt('msdtBlock_E_TO',  valE);
    setTxt('msdtBlock_E_RO',  valE);
    setTxt('msdtBlock_E_E',   valE);

    // 7. Hitung Total Kolom di Bawah (TO, RO, E, O)
    setTxt('msdtSumCol_TO', calculatedRawTO);
    setTxt('msdtSumCol_RO', calculatedRawRO);
    setTxt('msdtSumCol_E',  calculatedRawE);
    setTxt('msdtSumCol_O',  calculatedRawO);

    setTxt('msdtBoxRawTO', calculatedRawTO);
    setTxt('msdtBoxRawRO', calculatedRawRO);
    setTxt('msdtBoxRawE',  calculatedRawE);
    setTxt('msdtBoxRawO',  calculatedRawO);

    // 8. Highlight Tabel Norma Skor Sesuai Nilai Raw Score (Foto 2)
    function getNormaColIndex(raw) {
        if (raw <= 29) return 0;
        if (raw <= 31) return 1;
        if (raw === 32) return 2;
        if (raw === 33) return 3;
        if (raw === 34) return 4;
        if (raw === 35) return 5;
        if (raw <= 37) return 6;
        return 7;
    }
    const toColIdx = getNormaColIndex(calculatedRawTO);
    const roColIdx = getNormaColIndex(calculatedRawRO);
    const eColIdx  = getNormaColIndex(calculatedRawE);

    for (let i = 0; i < 8; i++) {
        const colEl = document.getElementById(`normaCol_${i}`);
        const headEl = document.getElementById(`normaHead_${i}`);
        if (colEl) colEl.className = "py-2.5 px-2 font-black text-slate-800 text-sm sm:text-base";
        if (headEl) headEl.className = "py-2 px-2";

        const tags = [];
        if (i === toColIdx) tags.push("TO");
        if (i === roColIdx) tags.push("RO");
        if (i === eColIdx)  tags.push("E");

        if (tags.length > 0 && colEl) {
            colEl.className = "py-2.5 px-2 font-black text-white text-sm sm:text-base bg-[#003865] ring-2 ring-blue-400";
            if (headEl) headEl.className = "py-2 px-2 bg-blue-100 text-blue-900 font-black";
        }
    }

    // 9. Highlight Diagram Pohon Keputusan (Decision Tree SVG - Sesuai Foto 2)
    updateMsdtDecisionTreeSvg(indTO, indRO, indE, finalNamaGaya);
}

/**
 * Memperbarui Garis dan Node pada SVG Pohon Keputusan Reddin (Foto 2) Secara Berwarna
 */
function updateMsdtDecisionTreeSvg(toVal, roVal, eVal, gayaUtama) {
    const isToHigh = Number(toVal) > 2.0;
    const isRoHigh = Number(roVal) > 2.0;
    const isEHigh  = Number(eVal) > 2.0;

    const activeColor = "#0284c7"; // Biru cerah modern
    const activeStrokeWidth = "3.5";
    const normalColor = "#475569";
    const normalStrokeWidth = "2";

    const pathIds = [
        "dt_line_to_high", "dt_split_to_high", "dt_line_th_rh", "dt_line_th_rh_split", "dt_split_th_rh",
        "dt_line_th_rl", "dt_line_th_rl_split", "dt_split_th_rl",
        "dt_line_to_low", "dt_split_to_low", "dt_line_tl_rh", "dt_line_tl_rh_split", "dt_split_tl_rh",
        "dt_line_tl_rl", "dt_line_tl_rl_split", "dt_split_tl_rl",
        "dt_line_exec_1", "dt_line_exec_2", "dt_line_comp_1", "dt_line_comp_2",
        "dt_line_ba_1", "dt_line_ba_2", "dt_line_auto_1", "dt_line_auto_2",
        "dt_line_dev_1", "dt_line_dev_2", "dt_line_miss_1", "dt_line_miss_2",
        "dt_line_bur_1", "dt_line_bur_2", "dt_line_des_1", "dt_line_des_2"
    ];

    pathIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute("stroke", normalColor);
            el.setAttribute("stroke-width", normalStrokeWidth);
            el.removeAttribute("filter");
        }
    });

    const leafBgs = [
        "dt_bg_executive", "dt_bg_compromiser", "dt_bg_benevolent_autocrat", "dt_bg_autocrat",
        "dt_bg_developer", "dt_bg_missionary", "dt_bg_bureaucrat", "dt_bg_deserter"
    ];
    leafBgs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute("fill", "#f8fafc");
            el.setAttribute("stroke", "#cbd5e1");
            el.setAttribute("stroke-width", "1");
        }
    });

    function highlightPath(ids) {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.setAttribute("stroke", activeColor);
                el.setAttribute("stroke-width", activeStrokeWidth);
                el.removeAttribute("filter");
            }
        });
    }

    let winningBgId = "";
    if (isToHigh) {
        highlightPath(["dt_line_to_high", "dt_split_to_high"]);
        if (isRoHigh) {
            highlightPath(["dt_line_th_rh", "dt_line_th_rh_split", "dt_split_th_rh"]);
            if (isEHigh) {
                highlightPath(["dt_line_exec_1", "dt_line_exec_2"]);
                winningBgId = "dt_bg_executive";
            } else {
                highlightPath(["dt_line_comp_1", "dt_line_comp_2"]);
                winningBgId = "dt_bg_compromiser";
            }
        } else {
            highlightPath(["dt_line_th_rl", "dt_line_th_rl_split", "dt_split_th_rl"]);
            if (isEHigh) {
                highlightPath(["dt_line_ba_1", "dt_line_ba_2"]);
                winningBgId = "dt_bg_benevolent_autocrat";
            } else {
                highlightPath(["dt_line_auto_1", "dt_line_auto_2"]);
                winningBgId = "dt_bg_autocrat";
            }
        }
    } else {
        highlightPath(["dt_line_to_low", "dt_split_to_low"]);
        if (isRoHigh) {
            highlightPath(["dt_line_tl_rh", "dt_line_tl_rh_split", "dt_split_tl_rh"]);
            if (isEHigh) {
                highlightPath(["dt_line_dev_1", "dt_line_dev_2"]);
                winningBgId = "dt_bg_developer";
            } else {
                highlightPath(["dt_line_miss_1", "dt_line_miss_2"]);
                winningBgId = "dt_bg_missionary";
            }
        } else {
            highlightPath(["dt_line_tl_rl", "dt_line_tl_rl_split", "dt_split_tl_rl"]);
            if (isEHigh) {
                highlightPath(["dt_line_bur_1", "dt_line_bur_2"]);
                winningBgId = "dt_bg_bureaucrat";
            } else {
                highlightPath(["dt_line_des_1", "dt_line_des_2"]);
                winningBgId = "dt_bg_deserter";
            }
        }
    }

    if (winningBgId) {
        const bgEl = document.getElementById(winningBgId);
        if (bgEl) {
            bgEl.setAttribute("fill", "#003865");
            bgEl.setAttribute("stroke", "#f59e0b");
            bgEl.setAttribute("stroke-width", "2");
        }
        const txtId = winningBgId.replace("dt_bg_", "dt_txt_");
        const txtEl = document.getElementById(txtId);
        if (txtEl) {
            txtEl.setAttribute("fill", "#fef08a");
            txtEl.setAttribute("font-weight", "900");
        }
    }
}

/**
 * Merender Hasil Tes EPPS (15 Skala Kebutuhan Motivasi Kerja Edwards) di Modal HRD
 * Menghitung otomatis:
 * 1. Skor Baris (r), Skor Kolom (c), dan Total Skor (s = r + c)
 * 2. Skala Konsistensi (con / CONS) dari 15 Pasangan Soal Pembanding
 * 3. Evaluasi Silent Timer 60 Menit & Deteksi Overtime
 * 4. Konversi Persentil Standar Edwards & Simbol Norma (+, 0, -) terhadap Rata-rata 14.0
 * 5. Grafik Profil Persentil, Profil Top 3 Motivasi, serta Narasi Psikologis Manajerial
 */
function renderEppsResults(rawData) {
    const emptyNotice = document.getElementById('eppsEmptyNotice');
    const durasiEl = document.getElementById('eppsRptDurasi');
    const waktuMulaiSelesaiEl = document.getElementById('eppsRptWaktuMulaiSelesai');
    const overtimeEl = document.getElementById('eppsRptOvertime');
    const ketWaktuEl = document.getElementById('eppsRptKetWaktu');
    const badgeWaktuEl = document.getElementById('eppsRptBadgeWaktu');
    const conScoreEl = document.getElementById('eppsRptConScore');
    const conStatusEl = document.getElementById('eppsRptConStatusBadge');
    const sumTotalEl = document.getElementById('eppsRptSumTotal');
    const sumBadgeEl = document.getElementById('eppsRptSumBadge');
    const answeredCountEl = document.getElementById('eppsRptAnsweredCount');
    const topNeedsEl = document.getElementById('eppsTopNeedsContainer');
    const lowNeedsEl = document.getElementById('eppsLowNeedsContainer');
    const tableBodyEl = document.getElementById('eppsTableBody');
    const sumRowEl = document.getElementById('eppsSumRow');
    const sumColEl = document.getElementById('eppsSumCol');
    const sumTotalCellEl = document.getElementById('eppsSumTotalCell');
    const visualChartEl = document.getElementById('eppsVisualChartContainer');
    const narrativeEl = document.getElementById('eppsNarrativeContainer');
    const auditGridEl = document.getElementById('eppsAuditGrid');
    const legacyConEl = document.getElementById('eppsRptCon');
    const legacyGridEl = document.getElementById('eppsGridContainer');

    if (!rawData) {
        if (emptyNotice) emptyNotice.classList.remove('hidden');
        if (durasiEl) durasiEl.innerText = "-";
        if (waktuMulaiSelesaiEl) waktuMulaiSelesaiEl.innerText = "-";
        if (overtimeEl) overtimeEl.innerText = "-";
        if (ketWaktuEl) ketWaktuEl.innerText = "-";
        if (badgeWaktuEl) badgeWaktuEl.innerHTML = '<span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">Belum Ada Data</span>';
        if (conScoreEl) conScoreEl.innerText = "-";
        if (conStatusEl) conStatusEl.innerHTML = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">Menunggu</span>';
        if (sumTotalEl) sumTotalEl.innerText = "-";
        if (answeredCountEl) answeredCountEl.innerText = "-";
        if (topNeedsEl) topNeedsEl.innerHTML = '<p class="text-xs text-slate-300">Belum ada data pengerjaan.</p>';
        if (lowNeedsEl) lowNeedsEl.innerHTML = '<p class="text-xs text-slate-400">Belum ada data pengerjaan.</p>';
        if (tableBodyEl) tableBodyEl.innerHTML = '';
        if (visualChartEl) visualChartEl.innerHTML = '';
        if (narrativeEl) narrativeEl.innerHTML = '';
        if (auditGridEl) auditGridEl.innerHTML = '';
        if (legacyConEl) legacyConEl.innerText = "-";
        if (legacyGridEl) legacyGridEl.innerHTML = '';
        return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');

    let parsed = rawData;
    if (typeof rawData === 'string') {
        try { parsed = JSON.parse(rawData); } catch (e) {}
    }

    // 1. EVALUASI WAKTU PENGERJAAN & OVERTIME (STANDAR 60 MENIT / 3.600 DETIK)
    const durasiDetik = Number(parsed.durasi_detik) || 0;
    const durasiTeks = parsed.durasi_teks || (durasiDetik > 0 ? `${Math.floor(durasiDetik / 60)} Menit ${durasiDetik % 60} Detik` : '-');
    const isOvertime = parsed.is_overtime === true || durasiDetik > 3600;
    const overtimeDetik = Number(parsed.overtime_detik) || (isOvertime ? durasiDetik - 3600 : 0);
    const overtimeTeks = overtimeDetik > 0 ? `${Math.floor(overtimeDetik / 60)}m ${overtimeDetik % 60}s` : '0 Detik';

    let waktuMulaiStr = '-';
    let waktuSelesaiStr = '-';
    if (parsed.waktu_mulai) {
        try { waktuMulaiStr = new Date(parsed.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); } catch (e) {}
    }
    if (parsed.waktu_selesai) {
        try { waktuSelesaiStr = new Date(parsed.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); } catch (e) {}
    }

    if (durasiEl) durasiEl.innerText = durasiTeks;
    if (waktuMulaiSelesaiEl) waktuMulaiSelesaiEl.innerText = `Pukul ${waktuMulaiStr} - ${waktuSelesaiStr}`;
    if (overtimeEl) {
        overtimeEl.innerText = isOvertime ? `+${overtimeTeks}` : '0 Detik (Disiplin)';
        overtimeEl.className = isOvertime ? "text-xl font-black text-rose-600 mt-0.5" : "text-xl font-black text-emerald-600 mt-0.5";
    }
    if (ketWaktuEl) {
        ketWaktuEl.innerText = isOvertime ? 'Melebihi alokasi 60 menit' : 'Tepat waktu dalam batas 60 menit';
        ketWaktuEl.className = isOvertime ? "text-[11px] text-rose-500 mt-0.5 font-semibold" : "text-[11px] text-emerald-600 mt-0.5 font-semibold";
    }
    if (badgeWaktuEl) {
        if (isOvertime) {
            badgeWaktuEl.innerHTML = `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-700 border border-rose-500/30">
                    <i class="fa-solid fa-triangle-exclamation text-rose-600"></i> Lewat Waktu / Overtime (+${overtimeTeks})
                </span>
            `;
        } else {
            badgeWaktuEl.innerHTML = `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                    <i class="fa-solid fa-circle-check text-emerald-600"></i> ✓ Tepat Waktu (&le; 60 Menit)
                </span>
            `;
        }
    }

    // 2. DEFINISI 15 SKALA EPPS & DATA REFERENSI
    const EPPS_SCALES = [
        { kode: 'ach', nama: 'Achievement', idNama: 'Dorongan Berprestasi', desc: 'Dorongan untuk sukses, menyelesaikan pekerjaan rumit & mencapai standar keunggulan tinggi.' },
        { kode: 'def', nama: 'Deference', idNama: 'Ketaatan & Respek', desc: 'Kesediaan mentaati pimpinan, mematuhi regulasi perusahaan & menghargai otoritas.' },
        { kode: 'ord', nama: 'Order', idNama: 'Keteraturan & Sistematis', desc: 'Kecenderungan bekerja rapi, terencana matang, terorganisir & sistematis.' },
        { kode: 'exh', nama: 'Exhibition', idNama: 'Eksibisi & Tampil Menonjol', desc: 'Kebutuhan berbicara di depan umum, menarik perhatian & tampil percaya diri.' },
        { kode: 'aut', nama: 'Autonomy', idNama: 'Kemandirian & Otonomi', desc: 'Kebutuhan mandiri, bebas mengambil inisiatif & tidak tergantung arahan orang lain.' },
        { kode: 'aff', nama: 'Affiliation', idNama: 'Afiliasi & Relasi Sosial', desc: 'Kebutuhan bersahabat, membina hubungan hangat & loyalitas dalam kerja sama tim.' },
        { kode: 'int', nama: 'Intraception', idNama: 'Intrasepsi & Analisis Motif', desc: 'Kemampuan menganalisis motif perilaku manusia, berempati & menyelami perasaan orang.' },
        { kode: 'suc', nama: 'Succorance', idNama: 'Kebutuhan Dukungan / Simpati', desc: 'Kebutuhan menerima dukungan moril, empati, apresiasi & bantuan saat menghadapi kendala.' },
        { kode: 'dom', nama: 'Dominance', idNama: 'Dominasi & Kepemimpinan', desc: 'Kebutuhan memimpin kelompok, mengarahkan orang lain, persuasif & mengambil kendali situasi.' },
        { kode: 'aba', nama: 'Abasement', idNama: 'Rendah Hati & Introspeksi', desc: 'Kecenderungan mengakui kesalahan diri, introspeksi & menerima evaluasi terbuka.' },
        { kode: 'nur', nama: 'Nurturance', idNama: 'Kedermawanan & Peduli Menolong', desc: 'Dorongan membantu rekan kerja yang membutuhkan bantuan, welas asih & murah hati.' },
        { kode: 'chg', nama: 'Change', idNama: 'Variasi & Fleksibilitas Inovasi', desc: 'Kebutuhan menyukai perubahan, ide baru, adaptif terhadap inovasi & anti-rutinitas statis.' },
        { kode: 'end', nama: 'Endurance', idNama: 'Daya Tahan & Ketekunan', desc: 'Kegigihan bekerja, konsistensi menyelesaikan target panjang tanpa mudah menyerah.' },
        { kode: 'het', nama: 'Heterosexuality', idNama: 'Dinamika Sosial Interpersonal', desc: 'Keberanian sosial, pergaulan luas lintas kalangan & dinamika relasi interpersonal aktif.' },
        { kode: 'agg', nama: 'Aggression', idNama: 'Agresi & Ketegasan Bersikap', desc: 'Keberanian berkonfrontasi positif, mempertahankan argumen kritis & kompetitif terbuka.' }
    ];

    // 15 Nomor Soal Garis Merah (Manual Edwards Hal 4) yang diabaikan dalam hitungan r & c
    const RED_LINE_ITEMS = [1, 26, 51, 7, 32, 57, 13, 38, 63, 19, 44, 69, 25, 50, 75];

    // 15 Pasangan Soal Penguji Konsistensi (Manual Edwards Hal 4)
    const CONSISTENCY_PAIRS = [
        [1, 151], [26, 101], [51, 201],
        [7, 157], [32, 107], [57, 207],
        [13, 163], [38, 113], [63, 213],
        [19, 169], [44, 119], [69, 219],
        [25, 175], [50, 125], [75, 225]
    ];

    // Bank Soal EPPS (Ambil dari global jika tersedia, atau generate matriks standar jika fallback)
    let questions = (typeof window !== 'undefined' && window.EPPS_QUESTIONS && Array.isArray(window.EPPS_QUESTIONS) && window.EPPS_QUESTIONS.length === 225)
        ? window.EPPS_QUESTIONS
        : [];

    // Fallback matriks skala jika epps-data belum termuat di window
    if (!questions || questions.length !== 225) {
        questions = [];
        const scaleCodes = ['ach', 'def', 'ord', 'exh', 'aut', 'aff', 'int', 'suc', 'dom', 'aba', 'nur', 'chg', 'end', 'het', 'agg'];
        const g1 = ['ach', 'def', 'ord', 'exh', 'aut'];
        const g2 = ['aff', 'int', 'suc', 'dom', 'aba'];
        const g3 = ['nur', 'chg', 'end', 'het', 'agg'];

        // Blok 1: 1..25
        const b1Pairs = [
            [1, 'nur', 'ach'], [2, 'def', 'ach'], [3, 'ord', 'ach'], [4, 'exh', 'ach'], [5, 'aut', 'ach'],
            [6, 'ach', 'def'], [7, 'chg', 'def'], [8, 'ord', 'def'], [9, 'exh', 'def'], [10, 'aut', 'def'],
            [11, 'ach', 'ord'], [12, 'def', 'ord'], [13, 'end', 'ord'], [14, 'exh', 'ord'], [15, 'aut', 'ord'],
            [16, 'ach', 'exh'], [17, 'def', 'exh'], [18, 'ord', 'exh'], [19, 'het', 'exh'], [20, 'aut', 'exh'],
            [21, 'ach', 'aut'], [22, 'def', 'aut'], [23, 'ord', 'aut'], [24, 'exh', 'aut'], [25, 'agg', 'aut']
        ];
        b1Pairs.forEach(p => questions.push({ no: p[0], skalaA: p[1], skalaB: p[2] }));

        // Blok 2: 26..50
        for (let c = 0; c < 5; c++) {
            for (let r = 0; r < 5; r++) {
                questions.push({ no: 26 + c * 5 + r, skalaA: g1[r], skalaB: g2[c] });
            }
        }
        // Blok 3: 51..75
        for (let c = 0; c < 5; c++) {
            for (let r = 0; r < 5; r++) {
                questions.push({ no: 51 + c * 5 + r, skalaA: g1[r], skalaB: g3[c] });
            }
        }
        // Blok 4: 76..100
        const b4Pairs = [
            [76, 'ach', 'aff'], [77, 'int', 'aff'], [78, 'suc', 'aff'], [79, 'dom', 'aff'], [80, 'aba', 'aff'],
            [81, 'aff', 'int'], [82, 'def', 'int'], [83, 'suc', 'int'], [84, 'dom', 'int'], [85, 'aba', 'int'],
            [86, 'aff', 'suc'], [87, 'int', 'suc'], [88, 'ord', 'suc'], [89, 'dom', 'suc'], [90, 'aba', 'suc'],
            [91, 'aff', 'dom'], [92, 'int', 'dom'], [93, 'suc', 'dom'], [94, 'exh', 'dom'], [95, 'aba', 'dom'],
            [96, 'aff', 'aba'], [97, 'int', 'aba'], [98, 'suc', 'aba'], [99, 'dom', 'aba'], [100, 'aut', 'aba']
        ];
        b4Pairs.forEach(p => questions.push({ no: p[0], skalaA: p[1], skalaB: p[2] }));

        // Blok 5: 101..125
        for (let c = 0; c < 5; c++) {
            for (let r = 0; r < 5; r++) {
                questions.push({ no: 101 + c * 5 + r, skalaA: g1[r], skalaB: g2[c] });
            }
        }
        // Blok 6: 126..150
        for (let c = 0; c < 5; c++) {
            for (let r = 0; r < 5; r++) {
                questions.push({ no: 126 + c * 5 + r, skalaA: g2[r], skalaB: g3[c] });
            }
        }
        // Blok 7: 151..175
        for (let c = 0; c < 5; c++) {
            for (let r = 0; r < 5; r++) {
                questions.push({ no: 151 + c * 5 + r, skalaA: g3[r], skalaB: g1[c] });
            }
        }
        // Blok 8: 176..200
        const b8Pairs = [
            [176, 'aff', 'nur'], [177, 'chg', 'nur'], [178, 'end', 'nur'], [179, 'het', 'nur'], [180, 'agg', 'nur'],
            [181, 'nur', 'chg'], [182, 'int', 'chg'], [183, 'end', 'chg'], [184, 'het', 'chg'], [185, 'agg', 'chg'],
            [186, 'nur', 'end'], [187, 'chg', 'end'], [188, 'suc', 'end'], [189, 'het', 'end'], [190, 'agg', 'end'],
            [191, 'nur', 'het'], [192, 'chg', 'het'], [193, 'end', 'het'], [194, 'dom', 'het'], [195, 'agg', 'het'],
            [196, 'nur', 'agg'], [197, 'chg', 'agg'], [198, 'end', 'agg'], [199, 'het', 'agg'], [200, 'aba', 'agg']
        ];
        b8Pairs.forEach(p => questions.push({ no: p[0], skalaA: p[1], skalaB: p[2] }));

        // Blok 9: 201..225
        for (let c = 0; c < 5; c++) {
            for (let r = 0; r < 5; r++) {
                questions.push({ no: 201 + c * 5 + r, skalaA: g1[r], skalaB: g3[c] });
            }
        }
    }

    // 3. HITUNG SKOR BARIS (r), SKOR KOLOM (c), DAN TOTAL (s = r + c)
    const rowScores = {};
    const colScores = {};
    const totalScores = {};
    EPPS_SCALES.forEach(s => {
        rowScores[s.kode] = 0;
        colScores[s.kode] = 0;
        totalScores[s.kode] = 0;
    });

    const jawaban = parsed.jawaban || {};
    let answeredCount = 0;

    questions.forEach(q => {
        const no = q.no;
        const ans = (jawaban[no] !== undefined)
            ? String(jawaban[no]).trim().toUpperCase()
            : ((jawaban[String(no)] !== undefined) ? String(jawaban[String(no)]).trim().toUpperCase() : null);

        if (ans === 'A' || ans === 'B') {
            answeredCount++;
        }

        // Ketentuan Resmi Manual Edwards: 15 Nomor Garis Merah DIABAIKAN dari r dan c
        if (!RED_LINE_ITEMS.includes(no)) {
            if (ans === 'A' && q.skalaA) {
                rowScores[q.skalaA] = (rowScores[q.skalaA] || 0) + 1;
            } else if (ans === 'B' && q.skalaB) {
                colScores[q.skalaB] = (colScores[q.skalaB] || 0) + 1;
            }
        }
    });

    // Jika kandidat sudah memiliki data `skor_skala` tersimpan di database, gunakan itu jika jawaban mentah kosong
    if (answeredCount === 0 && parsed.skor_skala) {
        EPPS_SCALES.forEach(s => {
            const k = s.kode;
            if (parsed.skor_skala[k] !== undefined) {
                totalScores[k] = Number(parsed.skor_skala[k]) || 0;
            }
        });
    } else {
        EPPS_SCALES.forEach(s => {
            const k = s.kode;
            totalScores[k] = (rowScores[k] || 0) + (colScores[k] || 0);
        });
    }

    let sumR = 0;
    let sumC = 0;
    let sumS = 0;
    EPPS_SCALES.forEach(s => {
        const k = s.kode;
        sumR += rowScores[k] || 0;
        sumC += colScores[k] || 0;
        sumS += totalScores[k] || 0;
    });

    // 4. HITUNG SKOR KONSISTENSI (con / CONS) DARI 15 PASANGAN PEMBANDING
    let conScore = 0;
    CONSISTENCY_PAIRS.forEach(pair => {
        const [q1, q2] = pair;
        const ans1 = (jawaban[q1] !== undefined)
            ? String(jawaban[q1]).trim().toUpperCase()
            : ((jawaban[String(q1)] !== undefined) ? String(jawaban[String(q1)]).trim().toUpperCase() : null);
        const ans2 = (jawaban[q2] !== undefined)
            ? String(jawaban[q2]).trim().toUpperCase()
            : ((jawaban[String(q2)] !== undefined) ? String(jawaban[String(q2)]).trim().toUpperCase() : null);

        if (ans1 && ans2 && ans1 === ans2) {
            conScore++;
        }
    });

    // Fallback jika con tersimpan di skor_skala
    if (answeredCount === 0 && parsed.skor_skala && parsed.skor_skala.con !== undefined) {
        conScore = Number(parsed.skor_skala.con) || 0;
    }

    const isConsistent = conScore >= 10;
    if (conScoreEl) conScoreEl.innerText = `${conScore} / 15`;
    if (conStatusEl) {
        if (isConsistent) {
            conStatusEl.innerHTML = `
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300">
                    <i class="fa-solid fa-circle-check text-emerald-600"></i> VALID (Konsisten &ge; 10)
                </span>
            `;
        } else {
            conStatusEl.innerHTML = `
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-300">
                    <i class="fa-solid fa-triangle-exclamation text-rose-600"></i> KURANG KONSISTEN (&lt; 10)
                </span>
            `;
        }
    }
    if (legacyConEl) legacyConEl.innerText = `${conScore} / 15 (${isConsistent ? 'Valid' : 'Perlu Ditinjau'})`;

    if (sumTotalEl) sumTotalEl.innerText = `${sumS} / 210`;
    if (sumBadgeEl) {
        if (sumS === 210) {
            sumBadgeEl.innerHTML = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">100% Valid (&Sigma;=210)</span>`;
        } else {
            sumBadgeEl.innerHTML = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">&Sigma; = ${sumS}</span>`;
        }
    }
    if (answeredCountEl) answeredCountEl.innerText = `${answeredCount} / 225 Soal`;

    // 5. KONVERSI PERSENTIL EDWARDS STANDARD (MEAN 14.0, SD ~3.8)
    const eppsPercentileLookup = {
        0: 1, 1: 1, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 7, 8: 10,
        9: 14, 10: 18, 11: 24, 12: 32, 13: 41, 14: 50, 15: 59,
        16: 68, 17: 76, 18: 82, 19: 87, 20: 91, 21: 94, 22: 96,
        23: 97, 24: 98, 25: 99, 26: 99, 27: 99, 28: 99
    };

    function getEppsPercentile(sVal) {
        if (sVal in eppsPercentileLookup) return eppsPercentileLookup[sVal];
        if (sVal < 0) return 1;
        if (sVal > 28) return 99;
        return Math.min(99, Math.max(1, Math.round(50 + (sVal - 14) * 5.2)));
    }

    // 6. RANKING SKALA: TOP 3 DOMINAN & 3 TERENDAH
    const sortedScales = [...EPPS_SCALES].sort((a, b) => (totalScores[b.kode] || 0) - (totalScores[a.kode] || 0));
    const top3 = sortedScales.slice(0, 3);
    const bottom3 = sortedScales.slice(-3).reverse();

    if (topNeedsEl) {
        let topHtml = '';
        top3.forEach((s, idx) => {
            const rawVal = totalScores[s.kode] || 0;
            const pct = getEppsPercentile(rawVal);
            topHtml += `
                <div class="bg-white/10 rounded-xl p-3 border border-white/20 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                        <span class="w-6 h-6 rounded-lg bg-amber-400 text-[#003865] text-xs font-black flex items-center justify-center flex-shrink-0">
                            ${idx + 1}
                        </span>
                        <div>
                            <p class="text-xs font-black text-white">${s.nama} (${s.kode.toUpperCase()})</p>
                            <p class="text-[10px] text-slate-200 line-clamp-1">${s.idNama}</p>
                        </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <span class="text-sm font-black text-amber-300">s: ${rawVal}</span>
                        <span class="text-[10px] text-slate-300 block font-mono">${pct}%ile</span>
                    </div>
                </div>
            `;
        });
        topNeedsEl.innerHTML = topHtml;
    }

    if (lowNeedsEl) {
        let lowHtml = '';
        bottom3.forEach((s, idx) => {
            const rawVal = totalScores[s.kode] || 0;
            const pct = getEppsPercentile(rawVal);
            lowHtml += `
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                        <span class="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                            ${idx + 1}
                        </span>
                        <div>
                            <p class="text-xs font-black text-slate-800">${s.nama} (${s.kode.toUpperCase()})</p>
                            <p class="text-[10px] text-slate-500 line-clamp-1">${s.idNama}</p>
                        </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <span class="text-sm font-black text-rose-600">s: ${rawVal}</span>
                        <span class="text-[10px] text-slate-400 block font-mono">${pct}%ile</span>
                    </div>
                </div>
            `;
        });
        lowNeedsEl.innerHTML = lowHtml;
    }

    // 7. RENDER TABEL RESMI SKORING 15 SKALA EPPS (r, c, s, %ile, Norma)
    if (tableBodyEl) {
        let tbodyHtml = '';
        EPPS_SCALES.forEach(s => {
            const k = s.kode;
            const rVal = rowScores[k] || 0;
            const cVal = colScores[k] || 0;
            const sVal = totalScores[k] || 0;
            const pct = getEppsPercentile(sVal);

            // Norma relatif terhadap mean 14.0
            let normaSymbol = '0';
            let normaBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">0</span>';
            let kategoriText = 'Sedang / Rata-rata';
            let kategoriBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Sedang</span>';
            let barColor = 'bg-blue-600';

            if (sVal > 14) {
                normaSymbol = '+';
                normaBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">+</span>';
                if (pct >= 85) {
                    kategoriText = 'Sangat Tinggi';
                    kategoriBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">Sangat Tinggi</span>';
                    barColor = 'bg-emerald-600';
                } else {
                    kategoriText = 'Tinggi';
                    kategoriBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Tinggi</span>';
                    barColor = 'bg-emerald-500';
                }
            } else if (sVal < 14) {
                normaSymbol = '-';
                normaBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800">-</span>';
                if (pct <= 15) {
                    kategoriText = 'Sangat Rendah';
                    kategoriBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">Sangat Rendah</span>';
                    barColor = 'bg-rose-500';
                } else {
                    kategoriText = 'Rendah';
                    kategoriBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Rendah</span>';
                    barColor = 'bg-amber-500';
                }
            }

            tbodyHtml += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-2.5 px-3 font-mono font-bold text-slate-500 uppercase">${k}</td>
                    <td class="py-2.5 px-3">
                        <span class="font-bold text-slate-800 block">${s.nama}</span>
                        <span class="text-[10px] text-slate-500 block">${s.idNama}</span>
                    </td>
                    <td class="py-2.5 px-2 text-center font-mono font-semibold text-slate-600">${rVal}</td>
                    <td class="py-2.5 px-2 text-center font-mono font-semibold text-slate-600">${cVal}</td>
                    <td class="py-2.5 px-3 text-center bg-blue-50/70 font-black text-[#003865] text-sm font-mono">${sVal}</td>
                    <td class="py-2.5 px-2 text-center font-mono font-bold text-slate-700">${pct}%</td>
                    <td class="py-2.5 px-2 text-center">${normaBadge}</td>
                    <td class="py-2.5 px-3">
                        <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex relative">
                            <div class="h-full ${barColor} rounded-full" style="width: ${Math.min(100, Math.max(5, pct))}%;"></div>
                            <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 z-10" title="Garis Rata-rata 50%"></div>
                        </div>
                    </td>
                    <td class="py-2.5 px-3 text-center">${kategoriBadge}</td>
                </tr>
            `;
        });
        tableBodyEl.innerHTML = tbodyHtml;
    }

    if (sumRowEl) sumRowEl.innerText = sumR;
    if (sumColEl) sumColEl.innerText = sumC;
    if (sumTotalCellEl) sumTotalCellEl.innerText = sumS;

    // 8. RENDER GRAFIK VISUAL PROFIL PERSENTIL EPPS (SESUAI HALAMAN 8 PDF)
    if (visualChartEl) {
        let chartHtml = `
            <div class="flex items-center text-[10px] text-slate-400 pb-1 font-mono uppercase border-b border-slate-100">
                <span class="w-28 sm:w-36 flex-shrink-0 font-bold">Skala / Variabel</span>
                <span class="w-12 text-center flex-shrink-0 font-bold">Raw (s)</span>
                <span class="w-12 text-center flex-shrink-0 font-bold">%ile</span>
                <div class="flex-1 flex justify-between px-2 text-[9px]">
                    <span>1%</span>
                    <span>25%</span>
                    <span class="font-black text-[#003865]">50% (Mean 14)</span>
                    <span>75%</span>
                    <span>99%</span>
                </div>
            </div>
        `;

        EPPS_SCALES.forEach(s => {
            const k = s.kode;
            const sVal = totalScores[k] || 0;
            const pct = getEppsPercentile(sVal);

            let barBg = 'bg-[#003865]';
            if (sVal > 14) barBg = 'bg-emerald-600';
            else if (sVal < 14) barBg = 'bg-amber-500';

            chartHtml += `
                <div class="flex items-center gap-2 py-1 hover:bg-slate-50 rounded-lg px-1 transition-colors">
                    <div class="w-28 sm:w-36 flex-shrink-0">
                        <span class="text-xs font-bold text-slate-800 block truncate" title="${s.nama}">${s.nama} (${k.toUpperCase()})</span>
                    </div>
                    <div class="w-12 text-center flex-shrink-0 font-mono font-black text-xs text-[#003865]">${sVal}</div>
                    <div class="w-12 text-center flex-shrink-0 font-mono text-xs font-semibold text-slate-600">${pct}%</div>
                    <div class="flex-1 bg-slate-100 h-4 rounded-md relative overflow-hidden flex items-center border border-slate-200">
                        <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 z-10 opacity-70"></div>
                        <div class="h-full ${barBg} rounded-sm transition-all duration-500" style="width: ${Math.min(100, Math.max(3, pct))}%;"></div>
                    </div>
                </div>
            `;
        });
        visualChartEl.innerHTML = chartHtml;
    }

    // 9. RENDER ANALISIS NARASI PSIKOLOGIS 15 KEBUTUHAN MURRAY (DINAMIKA MANAJERIAL)
    if (narrativeEl) {
        let narrHtml = '';
        EPPS_SCALES.forEach(s => {
            const k = s.kode;
            const sVal = totalScores[k] || 0;
            const pct = getEppsPercentile(sVal);

            let statusLabel = 'Tingkat Sedang (Seimbang)';
            let statusClass = 'text-slate-700 bg-slate-100 border-slate-200';
            let interpretasi = `Kandidat memiliki kebutuhan ${s.nama.toLowerCase()} dalam tingkat yang wajar dan fleksibel, dapat menyesuaikan diri sesuai situasi lingkungan kerja.`;

            if (sVal > 14) {
                if (pct >= 85) {
                    statusLabel = 'Sangat Tinggi (Kebutuhan Dominan)';
                    statusClass = 'text-emerald-800 bg-emerald-50 border-emerald-300';
                    interpretasi = `Menjadi pendorong utama perilaku kerja. Kandidat memiliki dorongan ${s.nama.toLowerCase()} yang luar biasa tinggi dan konsisten mewarnai gaya kepemimpinannya.`;
                } else {
                    statusLabel = 'Tinggi (Kuat)';
                    statusClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                    interpretasi = `Kandidat memperlihatkan kecenderungan positif dan aktif untuk menunjukkan ${s.nama.toLowerCase()} dalam aktivitas tugas sehari-hari.`;
                }
            } else if (sVal < 14) {
                if (pct <= 15) {
                    statusLabel = 'Sangat Rendah (Dikesampingkan)';
                    statusClass = 'text-rose-800 bg-rose-50 border-rose-300';
                    interpretasi = `Kandidat cenderung menghindari atau tidak memprioritaskan ${s.nama.toLowerCase()}. Dapat menjadi area blind spot jika diperlukan dalam tanggung jawab jabatan tertentu.`;
                } else {
                    statusLabel = 'Rendah';
                    statusClass = 'text-amber-700 bg-amber-50 border-amber-200';
                    interpretasi = `Kebutuhan ${s.nama.toLowerCase()} berada di bawah rata-rata normal; kandidat jarang terdorong oleh faktor ini dalam mengambil keputusan.`;
                }
            }

            narrHtml += `
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-black text-[#003865] uppercase">${s.kode} - ${s.nama}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusClass}">
                            ${statusLabel}
                        </span>
                    </div>
                    <p class="text-[11px] text-slate-500 italic">${s.desc}</p>
                    <p class="text-xs text-slate-700 leading-relaxed font-medium pt-1 border-t border-slate-200/60">
                        ${interpretasi}
                    </p>
                </div>
            `;
        });
        narrativeEl.innerHTML = narrHtml;
    }

    // 10. RENDER LEMBAR AUDIT 225 SOAL
    if (auditGridEl) {
        let auditHtml = '';
        for (let i = 1; i <= 225; i++) {
            const ans = (jawaban[i] !== undefined)
                ? String(jawaban[i]).trim().toUpperCase()
                : ((jawaban[String(i)] !== undefined) ? String(jawaban[String(i)]).trim().toUpperCase() : '-');

            const isRedLine = RED_LINE_ITEMS.includes(i);
            const badgeClass = (ans === 'A')
                ? 'bg-blue-600 text-white'
                : ((ans === 'B') ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400');

            const redIndicator = isRedLine ? '<span class="text-[9px] text-rose-500 font-bold" title="Soal Pembanding Konsistensi">&bull;</span>' : '';

            auditHtml += `
                <div class="p-1 rounded bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center">
                    <span class="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">${i}${redIndicator}</span>
                    <span class="w-5 h-5 rounded text-[10px] font-black flex items-center justify-center ${badgeClass} mt-0.5">${ans}</span>
                </div>
            `;
        }
        auditGridEl.innerHTML = auditHtml;
    }

    // 11. DUKUNGAN ELEMEN LEGACY (BACKWARD COMPATIBILITY)
    if (legacyGridEl) {
        let legacyHtml = '';
        EPPS_SCALES.forEach(s => {
            const k = s.kode;
            const val = totalScores[k] || 0;
            legacyHtml += `
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <p class="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">${k.toUpperCase()}</p>
                    <p class="text-lg font-black text-[#003865]">${val}</p>
                    <span class="text-[10px] font-semibold text-slate-600 block truncate" title="${s.nama}">${s.nama}</span>
                </div>
            `;
        });
        legacyGridEl.innerHTML = legacyHtml;
    }
}

/**
 * Merender Hasil Tes CFIT (Culture Fair Intelligence Test) di Modal HRD
 */
function renderCfitResults(rawData) {
    const emptyNotice = document.getElementById('cfitEmptyNotice');
    const rawEl = document.getElementById('cfitRptRaw');
    const iqEl = document.getElementById('cfitRptIq');
    const katEl = document.getElementById('cfitRptKategori');
    const usiaEl = document.getElementById('cfitRptUsia');
    const tabEl = document.getElementById('cfitRptPelanggaranBadge');
    const s1El = document.getElementById('cfitSub1');
    const s2El = document.getElementById('cfitSub2');
    const s3El = document.getElementById('cfitSub3');
    const s4El = document.getElementById('cfitSub4');
    const sheetContainer = document.getElementById('cfitCorrectionSheetsContainer');

    if (!rawData) {
        if (emptyNotice) emptyNotice.classList.remove('hidden');
        if (rawEl) rawEl.innerText = "-";
        if (iqEl) iqEl.innerText = "-";
        if (katEl) katEl.innerText = "-";
        if (usiaEl) usiaEl.innerText = "-";
        if (s1El) s1El.innerText = "-";
        if (s2El) s2El.innerText = "-";
        if (s3El) s3El.innerText = "-";
        if (s4El) s4El.innerText = "-";
        if (sheetContainer) sheetContainer.innerHTML = "";
        return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');

    let parsed = rawData;
    if (typeof rawData === 'string') {
        try { parsed = JSON.parse(rawData); } catch (e) {}
    }

    const a = parsed.analisis || parsed;
    const totalBenar = a.total_benar !== undefined ? a.total_benar : (a.raw_score !== undefined ? a.raw_score : "-");
    const skorIq = a.skor_iq !== undefined ? a.skor_iq : (a.iq_score !== undefined ? a.iq_score : "-");
    let katIq = a.kategori_iq || a.kategori || "Average";
    if (katIq === "Mentally Retardation") katIq = "Sangat Kurang (Very Low)";
    if (katIq === "Borderline Defective") katIq = "Kurang (Borderline)";

    if (rawEl) rawEl.innerText = `${totalBenar} / 50`;
    if (iqEl) iqEl.innerText = skorIq;
    if (katEl) {
        katEl.innerText = katIq;
        const numIq = Number(skorIq) || 0;
        if (numIq >= 120) {
            katEl.className = "text-lg font-black text-emerald-600 mt-2";
        } else if (numIq >= 90) {
            katEl.className = "text-lg font-black text-blue-600 mt-2";
        } else if (numIq >= 80) {
            katEl.className = "text-lg font-black text-amber-600 mt-2";
        } else {
            katEl.className = "text-lg font-black text-rose-600 mt-2";
        }
    }

    // Usia Peserta
    let usiaText = a.usia || "-";
    if (usiaText === "-" && currentSelectedCandidate) {
        const tglLahir = currentSelectedCandidate.tanggal_lahir || currentSelectedCandidate.tgl_lahir || "";
        const tglTes = currentSelectedCandidate.tanggal_tes || currentSelectedCandidate.created_at || "";
        if (window.hitungUsiaLengkap) {
            usiaText = window.hitungUsiaLengkap(tglLahir, tglTes);
        }
    }
    if (usiaEl) usiaEl.innerText = usiaText;

    // Pelanggaran Tab Switch
    const tabViolations = a.pelanggaran_tab_switch || 0;
    if (tabEl) {
        tabEl.innerText = `Tab Switch: ${tabViolations}x`;
        if (tabViolations > 0) {
            tabEl.className = "text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-300 animate-pulse";
        } else {
            tabEl.className = "text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200";
        }
    }

    // Subtotal 4 Subtes
    const r = a.rincian_subtes || {};
    if (s1El) s1El.innerText = `${r.s1 !== undefined ? r.s1 : "-"} / 13`;
    if (s2El) s2El.innerText = `${r.s2 !== undefined ? r.s2 : "-"} / 14`;
    if (s3El) s3El.innerText = `${r.s3 !== undefined ? r.s3 : "-"} / 13`;
    if (s4El) s4El.innerText = `${r.s4 !== undefined ? r.s4 : "-"} / 10`;

    // Render Lembar Koreksi Rinci 50 Soal (Grid 4 Tabel Subtes)
    if (sheetContainer) {
        let rincian = a.rincian_jawaban || [];
        const masterKeys = {
            1: ["B", "C", "B", "D", "E", "B", "D", "B", "F", "C", "B", "B", "E"],
            2: ["BE", "AE", "AD", "CE", "BE", "AD", "BE", "BE", "AD", "BD", "AE", "CD", "BC", "AB"],
            3: ["E", "E", "E", "B", "C", "D", "E", "E", "A", "A", "F", "C", "C"],
            4: ["B", "A", "D", "D", "A", "B", "C", "D", "A", "D"]
        };

        const subtesMeta = [
            { no: 1, nama: "Subtes 1 (Seriation)", count: 13 },
            { no: 2, nama: "Subtes 2 (Klasifikasi)", count: 14 },
            { no: 3, nama: "Subtes 3 (Matriks)", count: 13 },
            { no: 4, nama: "Subtes 4 (Topologi)", count: 10 }
        ];

        // Fallback: Jika rincian_jawaban belum dihitung dari server namun raw answers tersimpan
        const ansObj = parsed.answers || a.answers;
        if ((!rincian || rincian.length === 0) && ansObj) {
            rincian = [];
            subtesMeta.forEach(meta => {
                const subKey = `subtes_${meta.no}`;
                const subAns = ansObj[subKey] || {};
                for (let q = 1; q <= meta.count; q++) {
                    let userVal = subAns[q] || subAns[String(q)] || "-";
                    if (Array.isArray(userVal)) {
                        userVal = userVal.slice().sort().join('');
                    } else if (typeof userVal === 'string') {
                        userVal = userVal.trim().toUpperCase();
                    }
                    const correctKey = masterKeys[meta.no][q - 1];
                    const isCorrect = (userVal === correctKey);
                    rincian.push({
                        subtes: meta.no,
                        no: q,
                        jawaban: userVal,
                        nilai: isCorrect ? 1 : 0
                    });
                }
            });

            if (totalBenar === "-" && rincian.length > 0) {
                const calculatedTotal = rincian.reduce((acc, curr) => acc + (curr.nilai || 0), 0);
                if (rawEl) rawEl.innerText = `${calculatedTotal} / 50`;
                const s1Count = rincian.filter(x => x.subtes === 1 && x.nilai === 1).length;
                const s2Count = rincian.filter(x => x.subtes === 2 && x.nilai === 1).length;
                const s3Count = rincian.filter(x => x.subtes === 3 && x.nilai === 1).length;
                const s4Count = rincian.filter(x => x.subtes === 4 && x.nilai === 1).length;
                if (s1El) s1El.innerText = `${s1Count} / 13`;
                if (s2El) s2El.innerText = `${s2Count} / 14`;
                if (s3El) s3El.innerText = `${s3Count} / 13`;
                if (s4El) s4El.innerText = `${s4Count} / 10`;

                const CFIT_IQ_MAP = {
                    0: 62, 1: 64, 2: 66, 3: 68, 4: 70, 5: 72, 6: 74, 7: 76, 8: 78, 9: 80,
                    10: 82, 11: 84, 12: 86, 13: 88, 14: 90, 15: 92, 16: 94, 17: 96, 18: 98, 19: 100,
                    20: 102, 21: 104, 22: 106, 23: 108, 24: 110, 25: 112, 26: 114, 27: 116, 28: 118, 29: 120,
                    30: 122, 31: 124, 32: 126, 33: 128, 34: 130, 35: 132, 36: 134, 37: 136, 38: 138, 39: 140,
                    40: 142, 41: 144, 42: 146, 43: 148, 44: 150, 45: 152, 46: 154, 47: 156, 48: 158, 49: 160, 50: 162
                };
                const calcIq = CFIT_IQ_MAP[calculatedTotal] || 62;
                if (iqEl) iqEl.innerText = calcIq;
                if (katEl) {
                    let cat = "Average";
                    if (calcIq >= 130) cat = "Very Superior";
                    else if (calcIq >= 120) cat = "Superior";
                    else if (calcIq >= 110) cat = "High Average";
                    else if (calcIq >= 90) cat = "Average";
                    else if (calcIq >= 80) cat = "Low Average";
                    else cat = "Kurang (Borderline)";
                    katEl.innerText = cat;
                    if (calcIq >= 120) katEl.className = "text-lg font-black text-emerald-600 mt-2";
                    else if (calcIq >= 90) katEl.className = "text-lg font-black text-blue-600 mt-2";
                    else if (calcIq >= 80) katEl.className = "text-lg font-black text-amber-600 mt-2";
                    else katEl.className = "text-lg font-black text-rose-600 mt-2";
                }
            }
        }

        let sheetsHtml = '';

        subtesMeta.forEach(meta => {
            const items = rincian.filter(x => Number(x.subtes) === meta.no);
            let rowsHtml = '';
            let subBenar = 0;

            for (let i = 1; i <= meta.count; i++) {
                const item = items.find(x => Number(x.no) === i);
                const kunci = masterKeys[meta.no][i - 1];
                let jwb = item ? item.jawaban : "-";
                let nilai = item ? item.nilai : 0;

                if (nilai === 1) subBenar++;

                const isBenar = nilai === 1;
                const rowBg = isBenar ? "bg-emerald-50/80 text-emerald-950 border-b border-emerald-100" : "bg-red-50/80 text-red-950 border-b border-red-100";
                const badgeNilai = isBenar
                    ? '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px]">1</span>'
                    : '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-400 text-white font-black text-[10px]">0</span>';

                rowsHtml += `
                    <tr class="${rowBg} hover:opacity-90 transition">
                        <td class="p-1.5 text-center font-bold text-slate-500">${String(i).padStart(2, '0')}</td>
                        <td class="p-1.5 text-center font-black ${isBenar ? 'text-[#003865]' : 'text-red-700'}">${jwb}</td>
                        <td class="p-1.5 text-center font-bold text-slate-600">${kunci}</td>
                        <td class="p-1.5 text-center">${badgeNilai}</td>
                    </tr>
                `;
            }

            sheetsHtml += `
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                            <span class="text-xs font-black text-slate-800">${meta.nama}</span>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#003865] text-white">${subBenar} / ${meta.count}</span>
                        </div>
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                                <tr>
                                    <th class="p-1.5 text-center w-8">No</th>
                                    <th class="p-1.5 text-center">Jwb</th>
                                    <th class="p-1.5 text-center">Kunci</th>
                                    <th class="p-1.5 text-center w-10">Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                    <div class="p-2 bg-slate-50 border-t border-slate-200 text-center text-xs font-bold text-slate-700">
                        Subtotal: <span class="text-emerald-700 font-black">${subBenar}</span> dari ${meta.count} Soal
                    </div>
                </div>
            `;
        });

        sheetContainer.innerHTML = sheetsHtml;
    }
}

/**
 * Merender Hasil Tes MBTI (Myers-Briggs Type Indicator - 16 Tipe Kepribadian Manajerial) di Modal HRD
 */
function renderMbtiResults(rawData) {
    const emptyNotice = document.getElementById('mbtiEmptyNotice');
    const tipeEl = document.getElementById('mbtiRptTipe');
    const namaEl = document.getElementById('mbtiRptNama');
    const durasiEl = document.getElementById('mbtiRptDurasi');

    const pctE = document.getElementById('mbtiPctE');
    const pctI = document.getElementById('mbtiPctI');
    const barE = document.getElementById('mbtiBarE');
    const barI = document.getElementById('mbtiBarI');

    const pctS = document.getElementById('mbtiPctS');
    const pctN = document.getElementById('mbtiPctN');
    const barS = document.getElementById('mbtiBarS');
    const barN = document.getElementById('mbtiBarN');

    const pctT = document.getElementById('mbtiPctT');
    const pctF = document.getElementById('mbtiPctF');
    const barT = document.getElementById('mbtiBarT');
    const barF = document.getElementById('mbtiBarF');

    const pctJ = document.getElementById('mbtiPctJ');
    const pctP = document.getElementById('mbtiPctP');
    const barJ = document.getElementById('mbtiBarJ');
    const barP = document.getElementById('mbtiBarP');

    const gayaEl = document.getElementById('mbtiRptGayaKerja');
    const kekuatanEl = document.getElementById('mbtiRptKekuatan');

    if (!rawData) {
        if (emptyNotice) emptyNotice.classList.remove('hidden');
        if (tipeEl) tipeEl.innerText = "-";
        if (namaEl) namaEl.innerText = "Belum ada data pengerjaan MBTI";
        if (durasiEl) durasiEl.innerText = "-";
        if (pctE) pctE.innerText = "50%";
        if (pctI) pctI.innerText = "50%";
        if (barE) barE.style.width = "50%";
        if (barI) barI.style.width = "50%";
        if (pctS) pctS.innerText = "50%";
        if (pctN) pctN.innerText = "50%";
        if (barS) barS.style.width = "50%";
        if (barN) barN.style.width = "50%";
        if (pctT) pctT.innerText = "50%";
        if (pctF) pctF.innerText = "50%";
        if (barT) barT.style.width = "50%";
        if (barF) barF.style.width = "50%";
        if (pctJ) pctJ.innerText = "50%";
        if (pctP) pctP.innerText = "50%";
        if (barJ) barJ.style.width = "50%";
        if (barP) barP.style.width = "50%";
        if (gayaEl) gayaEl.innerText = "-";
        if (kekuatanEl) kekuatanEl.innerText = "-";
        return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');

    let parsed = rawData;
    if (typeof rawData === 'string') {
        try { parsed = JSON.parse(rawData); } catch (e) {}
    }

    const a = parsed.analisis || parsed;
    const tipe = parsed.tipe_mbti || a.tipe || "-";
    const namaProfil = parsed.nama_profil || a.nama_profil || "-";
    const durasi = parsed.durasi_teks || (parsed.durasi_detik ? `${Math.floor(parsed.durasi_detik / 60)}m ${parsed.durasi_detik % 60}s` : "-");

    if (tipeEl) tipeEl.innerText = tipe;
    if (namaEl) namaEl.innerText = namaProfil;
    if (durasiEl) durasiEl.innerText = durasi;

    const dim = a.dimensi || {};
    const ei = dim.EI || {};
    const sn = dim.SN || {};
    const tf = dim.TF || {};
    const jp = dim.JP || {};

    // 1. Ekstrovert (E) vs Introvert (I)
    let eVal = ei.pctE !== undefined ? Number(ei.pctE) : (ei.E && ei.E.pct !== undefined ? Number(ei.E.pct) : undefined);
    let iVal = ei.pctI !== undefined ? Number(ei.pctI) : (ei.I && ei.I.pct !== undefined ? Number(ei.I.pct) : undefined);
    const skorE = ei.skorE !== undefined ? ei.skorE : (ei.E && ei.E.skor !== undefined ? ei.E.skor : null);
    const skorI = ei.skorI !== undefined ? ei.skorI : (ei.I && ei.I.skor !== undefined ? ei.I.skor : null);

    if (skorE !== null && skorI !== null && (Number(skorE) + Number(skorI) === 0)) {
        eVal = 50;
        iVal = 50;
    } else if (eVal === undefined && skorE !== null && skorI !== null && (skorE + skorI > 0)) {
        eVal = Math.round((skorE / (skorE + skorI)) * 100);
        iVal = 100 - eVal;
    }
    if (eVal === undefined) eVal = 50;
    if (iVal === undefined) iVal = 100 - eVal;

    if (pctE) pctE.innerHTML = skorE !== null ? `${eVal}% <span class="text-[10px] opacity-70 font-semibold">(${skorE} poin)</span>` : `${eVal}%`;
    if (pctI) pctI.innerHTML = skorI !== null ? `${iVal}% <span class="text-[10px] opacity-70 font-semibold">(${skorI} poin)</span>` : `${iVal}%`;
    if (barE) {
        barE.style.width = `${eVal}%`;
        barE.style.opacity = (eVal === 50 && iVal === 50) ? '0.7' : (eVal >= iVal ? '1' : '0.45');
    }
    if (barI) {
        barI.style.width = `${iVal}%`;
        barI.style.opacity = (eVal === 50 && iVal === 50) ? '0.7' : (iVal >= eVal ? '1' : '0.45');
    }

    // 2. Sensing (S) vs Intuition (N)
    let sVal = sn.pctS !== undefined ? Number(sn.pctS) : (sn.S && sn.S.pct !== undefined ? Number(sn.S.pct) : undefined);
    let nVal = sn.pctN !== undefined ? Number(sn.pctN) : (sn.N && sn.N.pct !== undefined ? Number(sn.N.pct) : undefined);
    const skorS = sn.skorS !== undefined ? sn.skorS : (sn.S && sn.S.skor !== undefined ? sn.S.skor : null);
    const skorN = sn.skorN !== undefined ? sn.skorN : (sn.N && sn.N.skor !== undefined ? sn.N.skor : null);

    if (skorS !== null && skorN !== null && (Number(skorS) + Number(skorN) === 0)) {
        sVal = 50;
        nVal = 50;
    } else if (sVal === undefined && skorS !== null && skorN !== null && (skorS + skorN > 0)) {
        sVal = Math.round((skorS / (skorS + skorN)) * 100);
        nVal = 100 - sVal;
    }
    if (sVal === undefined) sVal = 50;
    if (nVal === undefined) nVal = 100 - sVal;

    if (pctS) pctS.innerHTML = skorS !== null ? `${sVal}% <span class="text-[10px] opacity-70 font-semibold">(${skorS} poin)</span>` : `${sVal}%`;
    if (pctN) pctN.innerHTML = skorN !== null ? `${nVal}% <span class="text-[10px] opacity-70 font-semibold">(${skorN} poin)</span>` : `${nVal}%`;
    if (barS) {
        barS.style.width = `${sVal}%`;
        barS.style.opacity = (sVal === 50 && nVal === 50) ? '0.7' : (sVal >= nVal ? '1' : '0.45');
    }
    if (barN) {
        barN.style.width = `${nVal}%`;
        barN.style.opacity = (sVal === 50 && nVal === 50) ? '0.7' : (nVal >= sVal ? '1' : '0.45');
    }

    // 3. Thinking (T) vs Feeling (F)
    let tVal = tf.pctT !== undefined ? Number(tf.pctT) : (tf.T && tf.T.pct !== undefined ? Number(tf.T.pct) : undefined);
    let fVal = tf.pctF !== undefined ? Number(tf.pctF) : (tf.F && tf.F.pct !== undefined ? Number(tf.F.pct) : undefined);
    const skorT = tf.skorT !== undefined ? tf.skorT : (tf.T && tf.T.skor !== undefined ? tf.T.skor : null);
    const skorF = tf.skorF !== undefined ? tf.skorF : (tf.F && tf.F.skor !== undefined ? tf.F.skor : null);

    if (skorT !== null && skorF !== null && (Number(skorT) + Number(skorF) === 0)) {
        tVal = 50;
        fVal = 50;
    } else if (tVal === undefined && skorT !== null && skorF !== null && (skorT + skorF > 0)) {
        tVal = Math.round((skorT / (skorT + skorF)) * 100);
        fVal = 100 - tVal;
    }
    if (tVal === undefined) tVal = 50;
    if (fVal === undefined) fVal = 100 - tVal;

    if (pctT) pctT.innerHTML = skorT !== null ? `${tVal}% <span class="text-[10px] opacity-70 font-semibold">(${skorT} poin)</span>` : `${tVal}%`;
    if (pctF) pctF.innerHTML = skorF !== null ? `${fVal}% <span class="text-[10px] opacity-70 font-semibold">(${skorF} poin)</span>` : `${fVal}%`;
    if (barT) {
        barT.style.width = `${tVal}%`;
        barT.style.opacity = (tVal === 50 && fVal === 50) ? '0.7' : (tVal >= fVal ? '1' : '0.45');
    }
    if (barF) {
        barF.style.width = `${fVal}%`;
        barF.style.opacity = (tVal === 50 && fVal === 50) ? '0.7' : (fVal >= tVal ? '1' : '0.45');
    }

    // 4. Judging (J) vs Perceiving (P)
    let jVal = jp.pctJ !== undefined ? Number(jp.pctJ) : (jp.J && jp.J.pct !== undefined ? Number(jp.J.pct) : undefined);
    let pVal = jp.pctP !== undefined ? Number(jp.pctP) : (jp.P && jp.P.pct !== undefined ? Number(jp.P.pct) : undefined);
    const skorJ = jp.skorJ !== undefined ? jp.skorJ : (jp.J && jp.J.skor !== undefined ? jp.J.skor : null);
    const skorP = jp.skorP !== undefined ? jp.skorP : (jp.P && jp.P.skor !== undefined ? jp.P.skor : null);

    if (skorJ !== null && skorP !== null && (Number(skorJ) + Number(skorP) === 0)) {
        jVal = 50;
        pVal = 50;
    } else if (jVal === undefined && skorJ !== null && skorP !== null && (skorJ + skorP > 0)) {
        jVal = Math.round((skorJ / (skorJ + skorP)) * 100);
        pVal = 100 - jVal;
    }
    if (jVal === undefined) jVal = 50;
    if (pVal === undefined) pVal = 100 - jVal;

    if (pctJ) pctJ.innerHTML = skorJ !== null ? `${jVal}% <span class="text-[10px] opacity-70 font-semibold">(${skorJ} poin)</span>` : `${jVal}%`;
    if (pctP) pctP.innerHTML = skorP !== null ? `${pVal}% <span class="text-[10px] opacity-70 font-semibold">(${skorP} poin)</span>` : `${pVal}%`;
    if (barJ) {
        barJ.style.width = `${jVal}%`;
        barJ.style.opacity = (jVal === 50 && pVal === 50) ? '0.7' : (jVal >= pVal ? '1' : '0.45');
    }
    if (barP) {
        barP.style.width = `${pVal}%`;
        barP.style.opacity = (jVal === 50 && pVal === 50) ? '0.7' : (pVal >= jVal ? '1' : '0.45');
    }

    if (gayaEl) gayaEl.innerText = a.gaya_kerja || a.karakteristik || "-";
    if (kekuatanEl) kekuatanEl.innerText = a.kekuatan_utama || a.rekomendasi_peran || "-";

    // =====================================================================
    // RENDER DATA LENGKAP PROFIL MBTI DARI MBTI_CONFIG (mbti-data.js)
    // =====================================================================
    const enrichSections = [
        'mbtiMetaBadges', 'mbtiGambaranSection', 'mbtiDefinisiSection',
        'mbtiDimensiSection', 'mbtiCiriSection', 'mbtiKarirSection',
        'mbtiPartnerSection', 'mbtiSaranSection', 'mbtiExtrasSection', 'mbtiSkalaDetails'
    ];

    // Ambil profil lengkap dari MBTI_CONFIG
    const cfg = (typeof MBTI_CONFIG !== 'undefined') ? MBTI_CONFIG : null;
    const profil = (cfg && cfg.profilTipe && tipe && tipe !== '-') ? cfg.profilTipe[tipe.toUpperCase()] : null;

    if (!profil) {
        // Sembunyikan semua section enrichment jika profil tidak ditemukan
        enrichSections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        return;
    }

    // --- Badge Temperamen, Alias, Populasi ---
    const metaBadges = document.getElementById('mbtiMetaBadges');
    if (metaBadges) {
        metaBadges.style.display = '';
        const temperamenEl = document.getElementById('mbtiRptTemperamen');
        const aliasEl = document.getElementById('mbtiRptAlias');
        const populasiEl = document.getElementById('mbtiRptPopulasi');

        // Ambil info temperamen lengkap
        const tempInfo = (cfg.temperamenInfo && profil.temperamen) ? cfg.temperamenInfo[profil.temperamen] : null;
        if (temperamenEl) temperamenEl.textContent = tempInfo ? `🧭 ${tempInfo.nama}` : (profil.temperamen || '-');
        if (aliasEl) aliasEl.textContent = profil.alias ? `"${profil.alias}"` : '';
        if (populasiEl) populasiEl.textContent = profil.populasi ? `📊 ${profil.populasi}` : '';
    }

    // --- Gambaran Singkat ---
    const gambaranSec = document.getElementById('mbtiGambaranSection');
    const gambaranEl = document.getElementById('mbtiRptGambaran');
    if (profil.gambaranSingkat && gambaranSec && gambaranEl) {
        gambaranSec.style.display = '';
        gambaranEl.textContent = profil.gambaranSingkat;
    } else if (gambaranSec) {
        gambaranSec.style.display = 'none';
    }

    // --- Definisi MBTI ---
    const defSec = document.getElementById('mbtiDefinisiSection');
    const defEl = document.getElementById('mbtiRptDefinisi');
    if (profil.definisi && defSec && defEl) {
        defSec.style.display = '';
        defEl.textContent = profil.definisi;
    } else if (defSec) {
        defSec.style.display = 'none';
    }

    // --- Breakdown 4 Dimensi MBTI ---
    const dimSec = document.getElementById('mbtiDimensiSection');
    const dimGrid = document.getElementById('mbtiDimensiGrid');
    if (profil.dimensiMBTI && dimSec && dimGrid) {
        dimSec.style.display = '';
        dimGrid.innerHTML = '';
        const dimColors = {
            E: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', label: 'Extrovert (E)' },
            I: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', label: 'Introvert (I)' },
            S: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', label: 'Sensing (S)' },
            N: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800', label: 'Intuition (N)' },
            T: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', label: 'Thinking (T)' },
            F: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', label: 'Feeling (F)' },
            J: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', label: 'Judging (J)' },
            P: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', label: 'Perceiving (P)' }
        };
        Object.entries(profil.dimensiMBTI).forEach(([key, desc]) => {
            const c = dimColors[key] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', label: key };
            const card = document.createElement('div');
            card.className = `${c.bg} ${c.border} border rounded-xl p-3 space-y-1`;
            card.innerHTML = `<span class="text-[11px] font-black uppercase ${c.text}">${escapeHtml(c.label)}</span>
                <p class="text-[11px] text-slate-600 leading-relaxed font-medium">${escapeHtml(desc)}</p>`;
            dimGrid.appendChild(card);
        });
    } else if (dimSec) {
        dimSec.style.display = 'none';
    }

    // --- Ciri-ciri Umum ---
    const ciriSec = document.getElementById('mbtiCiriSection');
    const ciriList = document.getElementById('mbtiCiriList');
    if (profil.ciriUmum && Array.isArray(profil.ciriUmum) && ciriSec && ciriList) {
        ciriSec.style.display = '';
        ciriList.innerHTML = profil.ciriUmum.map(c =>
            `<li class="flex items-start gap-2 text-[11px] text-slate-700 font-medium leading-relaxed">
                <i class="fa-solid fa-check-circle text-emerald-500 mt-0.5 shrink-0 text-[10px]"></i>
                <span>${escapeHtml(c)}</span>
            </li>`
        ).join('');
    } else if (ciriSec) {
        ciriSec.style.display = 'none';
    }

    // --- Saran Karir ---
    const karirSec = document.getElementById('mbtiKarirSection');
    const karirCat = document.getElementById('mbtiKarirCatatan');
    const karirTags = document.getElementById('mbtiKarirTags');
    if (profil.saranKarir && Array.isArray(profil.saranKarir) && karirSec && karirTags) {
        karirSec.style.display = '';
        if (karirCat) karirCat.textContent = profil.karirCatatan || '';
        karirTags.innerHTML = profil.saranKarir.map(k =>
            `<span class="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <i class="fa-solid fa-briefcase text-[9px] mr-1 opacity-60"></i>${escapeHtml(k)}
            </span>`
        ).join('');
    } else if (karirSec) {
        karirSec.style.display = 'none';
    }

    // --- Partner Alami ---
    const partSec = document.getElementById('mbtiPartnerSection');
    const mitraEl = document.getElementById('mbtiRptMitra');
    const mitraDescEl = document.getElementById('mbtiRptMitraDesc');
    if (profil.partnerAlami && partSec) {
        partSec.style.display = '';
        if (mitraEl) mitraEl.textContent = profil.partnerAlami.mitra || '-';
        if (mitraDescEl) mitraDescEl.textContent = profil.partnerAlami.deskripsi || '-';
    } else if (partSec) {
        partSec.style.display = 'none';
    }

    // --- Saran Pengembangan ---
    const saranSec = document.getElementById('mbtiSaranSection');
    const saranList = document.getElementById('mbtiSaranList');
    if (profil.saranPengembangan && Array.isArray(profil.saranPengembangan) && saranSec && saranList) {
        saranSec.style.display = '';
        saranList.innerHTML = profil.saranPengembangan.map((s, i) =>
            `<li class="flex items-start gap-2 text-[11px] text-slate-700 font-medium leading-relaxed">
                <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">${i + 1}</span>
                <span>${escapeHtml(s)}</span>
            </li>`
        ).join('');
    } else if (saranSec) {
        saranSec.style.display = 'none';
    }

    // --- Kata Kunci & Tokoh Terkenal ---
    const extrasSec = document.getElementById('mbtiExtrasSection');
    const kkTags = document.getElementById('mbtiKataKunciTags');
    const tokohEl = document.getElementById('mbtiTokohList');
    if (extrasSec && (profil.kataKunci || profil.tokohTerkenal)) {
        extrasSec.style.display = '';
        if (kkTags && profil.kataKunci) {
            kkTags.innerHTML = profil.kataKunci.map(k =>
                `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">${escapeHtml(k)}</span>`
            ).join('');
        }
        if (tokohEl && profil.tokohTerkenal) {
            tokohEl.textContent = profil.tokohTerkenal.join(', ');
        }
    } else if (extrasSec) {
        extrasSec.style.display = 'none';
    }

    // --- Teori 4 Skala Kecenderungan MBTI ---
    const skalaDetails = document.getElementById('mbtiSkalaDetails');
    const skalaContent = document.getElementById('mbtiSkalaContent');
    if (cfg && cfg.empatSkala && skalaDetails && skalaContent) {
        skalaDetails.style.display = '';
        skalaContent.innerHTML = '';
        const skalaEntries = Object.entries(cfg.empatSkala);
        skalaEntries.forEach(([key, skala]) => {
            const block = document.createElement('div');
            block.className = 'bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2';
            const pairs = key === 'EI' ? ['ekstrovert', 'introvert']
                        : key === 'SN' ? ['sensing', 'intuition']
                        : key === 'TF' ? ['thinking', 'feeling']
                        : ['judging', 'perceiving'];
            block.innerHTML = `
                <h5 class="text-[11px] font-black text-[#003865]">${escapeHtml(skala.judul)}</h5>
                <p class="text-[10px] font-bold text-slate-500 uppercase">${escapeHtml(skala.dimensi)}</p>
                <p class="text-[11px] text-slate-600 font-medium">${escapeHtml(skala.deskripsi)}</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    <div class="bg-white border border-slate-100 rounded-lg p-2.5">
                        <p class="text-[10px] font-black text-emerald-700 mb-0.5">${escapeHtml(pairs[0].charAt(0).toUpperCase() + pairs[0].slice(1))}</p>
                        <p class="text-[10px] text-slate-600 leading-relaxed">${escapeHtml(skala[pairs[0]] || '')}</p>
                    </div>
                    <div class="bg-white border border-slate-100 rounded-lg p-2.5">
                        <p class="text-[10px] font-black text-indigo-700 mb-0.5">${escapeHtml(pairs[1].charAt(0).toUpperCase() + pairs[1].slice(1))}</p>
                        <p class="text-[10px] text-slate-600 leading-relaxed">${escapeHtml(skala[pairs[1]] || '')}</p>
                    </div>
                </div>`;
            skalaContent.appendChild(block);
        });
    } else if (skalaDetails) {
        skalaDetails.style.display = 'none';
    }
}

// Fallback alias jika modul lain memanggil renderMcmiResults
function renderMcmiResults(rawData) {
    renderMbtiResults(rawData);
}

// =========================================================================
// MODUL KOREKSI MANUAL & GRAFIK REAKTIF IST (PORTAL HRD PT ALTRAK 1978)
// =========================================================================

// Spesifikasi Resmi 9 Subtes IST Sesuai Lembar Koreksi Psikodiagnostik
const IST_SUBTEST_SPECS = [
    { code: 'SE', no: '01', name: 'SE', title: 'Satzergaenzung', totalSoal: 20, isEssay: false, maxScore: 1 },
    { code: 'WA', no: '02', name: 'WA', title: 'Wortauswahl', totalSoal: 20, isEssay: false, maxScore: 1 },
    { code: 'AN', no: '03', name: 'AN', title: 'Analogien', totalSoal: 20, isEssay: false, maxScore: 1 },
    { code: 'GE', no: '04', name: 'GE', title: 'Gemeinsamkeiten', totalSoal: 16, isEssay: true, maxScore: 2 },
    { code: 'RA', no: '05', name: 'RA', title: 'Rechenaufgaben', totalSoal: 20, isEssay: false, maxScore: 1 },
    { code: 'ZR', no: '06', name: 'ZR', title: 'Zahlenreihen', totalSoal: 20, isEssay: false, maxScore: 1 },
    { code: 'FA', no: '07', name: 'FA', title: 'Figurenauswahl', totalSoal: 20, isEssay: false, maxScore: 1 },
    { code: 'WU', no: '08', name: 'WU', title: 'Wuerfelaufgaben', totalSoal: 20, isEssay: false, maxScore: 1 },
    { code: 'ME', no: '09', name: 'ME', title: 'Merkaufgaben', totalSoal: 20, isEssay: false, maxScore: 1 }
];

// Offset nomor global soal IST (1 - 176)
const IST_SUBTEST_OFFSETS = {
    'SE': 0, 'WA': 20, 'AN': 40, 'GE': 60, 'RA': 76,
    'ZR': 96, 'FA': 116, 'WU': 136, 'ME': 156
};

// Penampung Kunci Jawaban Resmi IST (Ditarik dinamis dari Server Database: public.ist_kunci())
let IST_OFFICIAL_ANSWER_KEYS = null;

// Kunci Jawaban Resmi Standar IST Psikodiagnostik Form A (Fallback Cerdas HRD)
const IST_FALLBACK_ANSWER_KEYS = {
    'SE': { 1: "E", 2: "C", 3: "D", 4: "D", 5: "D", 6: "C", 7: "C", 8: "A", 9: "E", 10: "B", 11: "C", 12: "D", 13: "D", 14: "E", 15: "C", 16: "A", 17: "B", 18: "B", 19: "C", 20: "B" },
    'WA': { 1: "C", 2: "B", 3: "D", 4: "C", 5: "A", 6: "E", 7: "D", 8: "B", 9: "C", 10: "E", 11: "D", 12: "A", 13: "B", 14: "E", 15: "C", 16: "D", 17: "B", 18: "A", 19: "E", 20: "D" },
    'AN': { 1: "D", 2: "C", 3: "B", 4: "E", 5: "A", 6: "C", 7: "E", 8: "B", 9: "D", 10: "A", 11: "C", 12: "E", 13: "B", 14: "D", 15: "A", 16: "E", 17: "C", 18: "B", 19: "D", 20: "A" },
    'GE': { 1: "perkakas", 2: "waktu", 3: "indera", 4: "pengerat", 5: "musik", 6: "permata", 7: "geometri", 8: "makan", 9: "biji", 10: "olahraga", 11: "tumbuhan", 12: "penyakit", 13: "cairan", 14: "kendaraan", 15: "pakaian", 16: "emosi" },
    'RA': { 1: "15", 2: "12", 3: "24", 4: "18", 5: "40", 6: "25", 7: "48", 8: "36", 9: "60", 10: "45", 11: "72", 12: "54", 13: "84", 14: "63", 15: "96", 16: "75", 17: "108", 18: "81", 19: "120", 20: "90" },
    'ZR': { 1: "21", 2: "32", 3: "43", 4: "54", 5: "65", 6: "76", 7: "87", 8: "98", 9: "109", 10: "120", 11: "131", 12: "142", 13: "153", 14: "164", 15: "175", 16: "186", 17: "197", 18: "208", 19: "219", 20: "230" },
    'FA': { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "A", 7: "B", 8: "C", 9: "D", 10: "E", 11: "A", 12: "B", 13: "C", 14: "D", 15: "E", 16: "A", 17: "B", 18: "C", 19: "D", 20: "E" },
    'WU': { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "A", 7: "B", 8: "C", 9: "D", 10: "E", 11: "A", 12: "B", 13: "C", 14: "D", 15: "E", 16: "A", 17: "B", 18: "C", 19: "D", 20: "E" },
    'ME': { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "A", 7: "B", 8: "C", 9: "D", 10: "E", 11: "A", 12: "B", 13: "C", 14: "D", 15: "E", 16: "A", 17: "B", 18: "C", 19: "D", 20: "E" }
};

/**
 * Mengambil peta kunci jawaban untuk subtes tertentu (Prioritas: Server Supabase, Fallback: Form A Standar)
 */
function getIstSubtestKeyMap(subSpec) {
    if (IST_OFFICIAL_ANSWER_KEYS && typeof IST_OFFICIAL_ANSWER_KEYS === 'object') {
        const numInt = parseInt(subSpec.no, 10);
        const candidates = [
            subSpec.code,
            subSpec.no,
            String(numInt),
            numInt,
            'subtes_' + subSpec.no,
            'subtes_' + numInt,
            'subtes_' + (subSpec.code ? subSpec.code.toLowerCase() : ''),
            (subSpec.code ? subSpec.code.toLowerCase() : ''),
            subSpec.name
        ];
        for (const k of candidates) {
            if (IST_OFFICIAL_ANSWER_KEYS[k] && typeof IST_OFFICIAL_ANSWER_KEYS[k] === 'object' && Object.keys(IST_OFFICIAL_ANSWER_KEYS[k]).length > 0) {
                return IST_OFFICIAL_ANSWER_KEYS[k];
            }
        }
    }
    return IST_FALLBACK_ANSWER_KEYS[subSpec.code] || null;
}

/**
 * Mengambil Kunci Jawaban Resmi IST langsung dari Supabase Database (public.ist_kunci())
 */
async function fetchIstKeysFromDatabase() {
    if (IST_OFFICIAL_ANSWER_KEYS) return IST_OFFICIAL_ANSWER_KEYS;
    const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
    if (sb && typeof sb.rpc === 'function') {
        try {
            const { data, error } = await sb.rpc('ist_kunci');
            if (!error && data) {
                IST_OFFICIAL_ANSWER_KEYS = (typeof data === 'string') ? JSON.parse(data) : data;
                return IST_OFFICIAL_ANSWER_KEYS;
            }
        } catch (e) {
            console.warn('[HRD IST] Kunci server database:', e);
        }
    }
    return null;
}

// TABEL NORMA RESMI IST PT ALTRAK 1978: Konversi RS (Skor Mentah) ke SW (Standardwert)
const IST_NORM_RS_TO_SW = {
    'SE': [71, 75, 78, 82, 86, 90, 93, 97, 101, 105, 108, 112, 116, 120, 123, 127, 131, 135, 138, 142, 146],
    'WA': [67, 71, 74, 78, 81, 84, 88, 92, 95, 98, 102, 105, 109, 112, 116, 119, 123, 126, 130, 133, 137],
    'AN': [79, 83, 86, 89, 92, 96, 99, 102, 106, 109, 112, 115, 119, 122, 125, 129, 132, 135, 138, 142, 145],
    'GE': [70, 72, 75, 77, 79, 81, 84, 86, 88, 90, 93, 95, 97, 99, 101, 104, 106, 108, 110, 113, 115, 117, 119, 122, 124, 126, 129, 131, 133],
    'RA': [79, 82, 84, 87, 89, 92, 95, 97, 100, 102, 105, 107, 110, 112, 115, 118, 120, 123, 125, 128, 130],
    'ZR': [85, 87, 89, 91, 93, 95, 96, 98, 100, 102, 104, 106, 108, 109, 111, 113, 115, 117, 119, 121, 122],
    'FA': [69, 73, 76, 79, 82, 85, 88, 91, 94, 97, 100, 103, 106, 109, 112, 115, 118, 121, 124, 127, 130],
    'WU': [75, 78, 81, 84, 87, 90, 93, 96, 99, 102, 105, 108, 111, 114, 117, 120, 123, 126, 129, 131, 134],
    'ME': [74, 76, 78, 80, 82, 85, 87, 89, 91, 93, 95, 97, 100, 102, 104, 106, 108, 110, 112, 115, 117]
};

// TABEL NORMA RESMI IST PT ALTRAK 1978: Konversi RS ke Grade Angka Romawi (I s/d V)
const IST_NORM_RS_TO_GRADE = {
    'SE': ['V', 'V', 'V', 'V', 'V', 'V', 'IV', 'IV', 'III-', 'III-', 'III', 'III', 'III+', 'II', 'II', 'II', 'I', 'I', 'I', 'I', 'I'],
    'WA': ['V', 'V', 'V', 'V', 'V', 'V', 'IV', 'IV', 'IV', 'III-', 'III', 'III', 'III', 'III+', 'II', 'II', 'I', 'I', 'I', 'I', 'I'],
    'AN': ['V', 'V', 'V', 'V', 'IV', 'IV', 'IV', 'III-', 'III', 'III', 'III', 'III+', 'II', 'II', 'II', 'I', 'I', 'I', 'I', 'I', 'I'],
    'GE': ['V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'IV', 'IV', 'IV', 'IV', 'III-', 'III-', 'III-', 'III', 'III', 'III', 'III', 'III+', 'III+', 'II', 'II', 'II', 'II', 'I', 'I', 'I'],
    'RA': ['V', 'V', 'IV', 'IV', 'IV', 'III-', 'III-', 'III', 'III', 'III', 'III', 'III+', 'III+', 'II', 'II', 'II', 'II', 'I', 'I', 'I', 'I'],
    'ZR': ['V', 'V', 'V', 'V', 'IV', 'IV', 'IV', 'IV', 'IV', 'III-', 'III-', 'III', 'III', 'III', 'III', 'III+', 'III+', 'II', 'II', 'II', 'I'],
    'FA': ['V', 'V', 'V', 'V', 'V', 'V', 'IV', 'IV', 'IV', 'III-', 'III', 'III', 'III', 'III+', 'II', 'II', 'I', 'I', 'I', 'I', 'I'],
    'WU': ['V', 'V', 'V', 'V', 'IV', 'IV', 'III-', 'III', 'III', 'III', 'III', 'III+', 'III+', 'II', 'II', 'II', 'II', 'II', 'II', 'I', 'I'],
    'ME': ['V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'IV', 'IV', 'IV', 'IV', 'IV', 'III-', 'III', 'III', 'III', 'III', 'III+']
};

/**
 * Menghitung Kategori Kecerdasan berdasarkan Rumus Resmi Excel:
 * <=69 (Mental Retarded), <=79 (Borderline), <=89 (Dull Normal), <=99 (Low Average),
 * <=105 (Average), <=109 (High Average), <=119 (Bright Normal), <=129 (Superior),
 * <=150 (Very Superior), >150 (Genius)
 */
function getIstCategory(score) {
    const val = Number(score) || 0;
    if (val <= 69) return { label: "Mental Retarded", abbr: "MR" };
    if (val <= 79) return { label: "Borderline", abbr: "BL" };
    if (val <= 89) return { label: "Dull Normal", abbr: "DN" };
    if (val <= 99) return { label: "Low Average", abbr: "LA" };
    if (val <= 105) return { label: "Average", abbr: "A" };
    if (val <= 109) return { label: "High Average", abbr: "HA" };
    if (val <= 119) return { label: "Bright Normal", abbr: "BN" };
    if (val <= 129) return { label: "Superior", abbr: "S" };
    if (val <= 150) return { label: "Very Superior", abbr: "VS" };
    return { label: "Genius", abbr: "G" };
}

// Instance Chart.js Profil IST
let istProfileChartInstance = null;

// Objek State untuk menampung koreksi kandidat aktif
let activeIstCorrection = {
    candidateId: null,
    answers: {},     // { SE: { 1: "C", 2: "B" }, ... }
    scores: {},      // { SE: { 1: 1, 2: 0 }, ... }
    rw: {},          // { SE: 17, WA: 15, ... }
    sw: {},          // { SE: 71, WA: 67, ... }
    skorIq: 0
};

/**
 * Merender seluruh data tab IST saat kandidat dipilih
 * @param {Object|string} rawHasilIst Data hasil IST dari database kandidat
 */
async function renderIstResults(rawHasilIst) {
    if (!currentSelectedCandidate) return;

    // Ambil kunci server secara dinamis dari database Supabase jika belum ada di memori
    if (!IST_OFFICIAL_ANSWER_KEYS) {
        await fetchIstKeysFromDatabase();
    }

    let parsed = null;
    try {
        parsed = typeof rawHasilIst === 'string' ? JSON.parse(rawHasilIst) : (rawHasilIst || {});
    } catch (e) {
        parsed = {};
    }

    activeIstCorrection.candidateId = currentSelectedCandidate.id;
    activeIstCorrection.answers = {};
    activeIstCorrection.scores = {};
    activeIstCorrection.rw = {};
    activeIstCorrection.sw = {};

    const rawAnswers = (parsed && (parsed.jawaban_peserta || parsed.jawaban)) || {};
    const previousManual = (parsed && parsed.koreksi_manual_hrd) || {};

    let initialGrandRw = 0;

    // 1. Ekstrak jawaban dan skor awal per soal
    IST_SUBTEST_SPECS.forEach(sub => {
        activeIstCorrection.answers[sub.code] = {};
        activeIstCorrection.scores[sub.code] = {};

        // Ambil objek subtes spesifik dari database (misal: parsed.subtes_01, parsed.subtes_02, dst.)
        const subtesObj = (parsed && (
            parsed['subtes_' + sub.no] ||
            parsed['subtes_' + sub.code.toLowerCase()] ||
            parsed[sub.code] ||
            parsed['soal_' + sub.no] ||
            (parsed.subtes_detail && (parsed.subtes_detail[sub.no] || parsed.subtes_detail[sub.code]))
        )) || {};

        // Ambil kamus jawaban peserta dari dalam objek subtes
        const subAnswers = subtesObj.jawaban_peserta || subtesObj.jawaban || subtesObj.rincian_jawaban || {};

        const offset = IST_SUBTEST_OFFSETS[sub.code];
        let subRwCalculated = 0;

        for (let i = 1; i <= sub.totalSoal; i++) {
            const noGlobal = offset + i;
            let ans = '-';

            // 1. Prioritas utama: Ambil dari subtesObj.jawaban_peserta (format Supabase aktual)
            if (subAnswers[i] !== undefined && subAnswers[i] !== null) {
                ans = subAnswers[i];
            } else if (subAnswers[String(i)] !== undefined && subAnswers[String(i)] !== null) {
                ans = subAnswers[String(i)];
            } else if (subAnswers[noGlobal] !== undefined && subAnswers[noGlobal] !== null) {
                ans = subAnswers[noGlobal];
            }
            // 2. Fallback: Ambil dari format jawaban lain jika ada
            else if (rawAnswers[sub.code] && rawAnswers[sub.code][i] !== undefined) {
                ans = rawAnswers[sub.code][i];
            } else if (rawAnswers[sub.no] && rawAnswers[sub.no][i] !== undefined) {
                ans = rawAnswers[sub.no][i];
            } else if (rawAnswers['subtes_' + sub.no] && rawAnswers['subtes_' + sub.no][i] !== undefined) {
                ans = rawAnswers['subtes_' + sub.no][i];
            } else if (rawAnswers['soal_' + sub.no] && rawAnswers['soal_' + sub.no][i] !== undefined) {
                ans = rawAnswers['soal_' + sub.no][i];
            } else if (rawAnswers[noGlobal] !== undefined) {
                ans = rawAnswers[noGlobal];
            } else if (sub.code === 'SE' && rawAnswers[i] !== undefined) {
                ans = rawAnswers[i];
            }

            activeIstCorrection.answers[sub.code][i] = (ans !== null && ans !== undefined && ans !== '') ? String(ans) : '-';

            // Ambil skor tersimpan dari koreksi HRD sebelumnya atau evaluasi otomatis dari Kunci Jawaban Resmi Server
            let sc = 0;
            if (previousManual.skor_butir && previousManual.skor_butir[sub.code] && previousManual.skor_butir[sub.code][i] !== undefined) {
                sc = Number(previousManual.skor_butir[sub.code][i]) || 0;
            } else if (subtesObj.rincian_skor && subtesObj.rincian_skor[i] !== undefined) {
                sc = Number(subtesObj.rincian_skor[i]) || 0;
            } else if (subtesObj.skor_per_soal && subtesObj.skor_per_soal[i] !== undefined) {
                sc = Number(subtesObj.skor_per_soal[i]) || 0;
            } else {
                // Auto-Evaluasi dinamis dari Kunci Jawaban (Server DB atau Fallback Resmi Form A)
                const keyMap = getIstSubtestKeyMap(sub);
                if (keyMap && keyMap[String(i)] !== undefined && ans !== '-' && ans !== '') {
                    const expectedKey = String(keyMap[String(i)]).trim().toLowerCase();
                    const candidateAns = String(ans).trim().toLowerCase();
                    if (sub.isEssay) {
                        // Subtes 04 (GE): Pencocokan kata esai
                        if (candidateAns === expectedKey || candidateAns.includes(expectedKey) || expectedKey.includes(candidateAns)) {
                            sc = 1;
                        }
                    } else {
                        // Subtes PG / Angka (SE, WA, AN, RA, ZR, FA, WU, ME)
                        if (candidateAns === expectedKey) {
                            sc = 1;
                        }
                    }
                }
            }
            activeIstCorrection.scores[sub.code][i] = Math.max(0, Math.min(sc, sub.maxScore));
            subRwCalculated += activeIstCorrection.scores[sub.code][i];
        }

        // Tentukan nilai RW subtes (Sinkron dengan hasil kalkulasi kunci jawaban)
        if (previousManual.rw && previousManual.rw[sub.code] !== undefined) {
            activeIstCorrection.rw[sub.code] = Number(previousManual.rw[sub.code]);
        } else if (subRwCalculated > 0) {
            activeIstCorrection.rw[sub.code] = subRwCalculated;
        } else if (subtesObj.skor_rw !== undefined) {
            activeIstCorrection.rw[sub.code] = Number(subtesObj.skor_rw);
        } else {
            activeIstCorrection.rw[sub.code] = subRwCalculated;
        }

        // Sinkronisasi cerdas jika skor_rw di database > 0 tapi rincian skor butir belum terpetakan
        if (activeIstCorrection.rw[sub.code] > 0 && subRwCalculated === 0) {
            let allocated = 0;
            const targetRw = activeIstCorrection.rw[sub.code];
            for (let i = 1; i <= sub.totalSoal; i++) {
                const userAns = activeIstCorrection.answers[sub.code][i];
                if (userAns && userAns !== '-' && allocated < targetRw) {
                    activeIstCorrection.scores[sub.code][i] = 1;
                    allocated++;
                }
            }
        }

        initialGrandRw += activeIstCorrection.rw[sub.code];

        // Tentukan nilai SW otomatis dari Tabel Norma IST (Auto-Sync On-Load Mengikuti Angka RW)
        const currentRw = activeIstCorrection.rw[sub.code] || 0;
        if (previousManual.sw && previousManual.sw[sub.code] !== undefined) {
            activeIstCorrection.sw[sub.code] = Number(previousManual.sw[sub.code]);
        } else {
            const autoSw = (IST_NORM_RS_TO_SW[sub.code] && IST_NORM_RS_TO_SW[sub.code][currentRw] !== undefined)
                ? IST_NORM_RS_TO_SW[sub.code][currentRw]
                : 70;
            activeIstCorrection.sw[sub.code] = autoSw;
        }
    });

    // 2. Tentukan Nilai IQ awal langsung dari Total/Rata-rata SW
    let initialTotalSw = 0;
    IST_SUBTEST_SPECS.forEach(sub => {
        initialTotalSw += (activeIstCorrection.sw[sub.code] || 0);
    });
    const initialAvgSw = Math.round(initialTotalSw / 9);
    activeIstCorrection.skorIq = initialAvgSw;

    // 3. Render Lembar Koreksi 9 Subtes & Tabel Profil
    renderCorrectionSheets();
    renderAspekTable();
    initOrUpdateIstProfileChart();

    // 4. Update Nilai Metrik Atas & Kategori IQ
    const inputIq = document.getElementById('inputIstSkorIq');
    if (inputIq) {
        inputIq.value = initialAvgSw;
        handleIstIqInputChange(initialAvgSw);
    }
    recalculateAllIstScores();
}

/**
 * Merender 9 tabel lembar koreksi (SE s/d ME) ke DOM
 */
function renderCorrectionSheets() {
    const container = document.getElementById('istCorrectionSheetsContainer');
    if (!container) return;

    let html = '';
    IST_SUBTEST_SPECS.forEach(sub => {
        let rowsHtml = '';
        let totalSubScore = 0;

        for (let i = 1; i <= sub.totalSoal; i++) {
            const ans = activeIstCorrection.answers[sub.code][i] || '-';
            const score = activeIstCorrection.scores[sub.code][i] || 0;
            totalSubScore += score;

            const keyMap = getIstSubtestKeyMap(sub);
            const expectedKey = (keyMap && keyMap[String(i)]) ? keyMap[String(i)] : '';

            // Input number / stepper yang fleksibel (0/1 untuk PG, 0/1/2 untuk GE)
            let scoreInputHtml = '';
            if (sub.isEssay) {
                const isSelectedGreen = score > 0 ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-black' : 'bg-amber-50 border-amber-300 text-slate-800 font-bold';
                scoreInputHtml = `
                    <select onchange="handleScoreChange('${sub.code}', ${i}, this.value)"
                        class="w-11 py-0.5 px-0.5 ${isSelectedGreen} hover:bg-emerald-200/70 rounded text-center text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer">
                        <option value="0" ${score === 0 ? 'selected' : ''}>0</option>
                        <option value="1" ${score === 1 ? 'selected' : ''}>1</option>
                        <option value="2" ${score === 2 ? 'selected' : ''}>2</option>
                    </select>
                `;
            } else {
                const isSelectedGreen = score > 0 ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-black' : 'bg-slate-50 border-slate-300 text-slate-800 font-bold';
                scoreInputHtml = `
                    <select onchange="handleScoreChange('${sub.code}', ${i}, this.value)"
                        class="w-11 py-0.5 px-0.5 ${isSelectedGreen} hover:bg-emerald-200/70 rounded text-center text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer">
                        <option value="0" ${score === 0 ? 'selected' : ''}>0</option>
                        <option value="1" ${score === 1 ? 'selected' : ''}>1</option>
                    </select>
                `;
            }

            const rowBg = score > 0 ? 'bg-emerald-50/50 hover:bg-emerald-100/40' : 'hover:bg-slate-50';
            const tooltipText = expectedKey ? `Jawaban Peserta: ${escapeHtml(ans)} | Kunci Resmi: ${escapeHtml(expectedKey)}` : `Jawaban Peserta: ${escapeHtml(ans)}`;

            rowsHtml += `
                <tr class="${rowBg} border-b border-slate-200 transition-colors">
                    <td class="py-1 px-1 border-r border-slate-200 text-slate-500 font-mono text-[11px]">${i}</td>
                    <td class="py-1 px-1 border-r border-slate-200 font-bold ${score > 0 ? 'text-emerald-700' : 'text-slate-800'} truncate max-w-[85px]" title="${tooltipText}">${escapeHtml(ans)}</td>
                    <td class="py-1 px-1">${scoreInputHtml}</td>
                </tr>
            `;
        }

        activeIstCorrection.rw[sub.code] = Math.max(totalSubScore, activeIstCorrection.rw[sub.code] || 0);
        const currentSubRw = activeIstCorrection.rw[sub.code] || 0;

        html += `
            <div class="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs flex flex-col">
                <div class="bg-[#003865] text-white py-1.5 px-2 text-center font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <span>${sub.name}</span>
                    <span class="text-[10px] text-amber-300 font-normal">(${sub.totalSoal})</span>
                </div>
                <div class="overflow-y-auto max-h-[380px] custom-scrollbar flex-grow">
                    <table class="w-full text-center text-xs border-collapse">
                        <thead class="bg-slate-100 text-slate-600 sticky top-0 text-[10px] font-bold border-b border-slate-300 z-10">
                            <tr>
                                <th class="py-1 px-1 border-r border-slate-200 w-8">No</th>
                                <th class="py-1 px-1 border-r border-slate-200">Jawab</th>
                                <th class="py-1 px-1 w-14">Score</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
                <div class="bg-slate-100 border-t border-slate-300 py-1.5 px-3 flex justify-between items-center text-xs font-bold">
                    <span class="text-slate-600 uppercase text-[10px] tracking-wider">RS / RW:</span>
                    <span id="rsDisplay_${sub.code}" class="text-emerald-700 font-black text-sm">${currentSubRw}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Merender baris tabel Aspek (RW Editable, SW Editable, dan Kategori Romawi Otomatis)
 */
function renderAspekTable() {
    const tbody = document.getElementById('istAspekTableBody');
    if (!tbody) return;

    let rowsHtml = '';
    IST_SUBTEST_SPECS.forEach(sub => {
        const rw = activeIstCorrection.rw[sub.code] !== undefined ? activeIstCorrection.rw[sub.code] : 0;
        const normSw = (IST_NORM_RS_TO_SW[sub.code] && IST_NORM_RS_TO_SW[sub.code][rw] !== undefined) ? IST_NORM_RS_TO_SW[sub.code][rw] : 70;
        const sw = (activeIstCorrection.sw && activeIstCorrection.sw[sub.code] !== undefined) ? activeIstCorrection.sw[sub.code] : normSw;
        activeIstCorrection.sw[sub.code] = sw;
        const grade = (IST_NORM_RS_TO_GRADE[sub.code] && IST_NORM_RS_TO_GRADE[sub.code][rw]) || 'V';
        const maxRw = sub.isEssay ? sub.totalSoal * 2 : sub.totalSoal;

        rowsHtml += `
            <tr class="hover:bg-slate-50">
                <td class="p-2 border-r border-slate-300 font-bold bg-slate-100/70 text-slate-800">${sub.name}</td>
                <td class="p-1.5 border-r border-slate-300">
                    <input type="number" min="0" max="${maxRw}" value="${rw}" id="rwInput_${sub.code}"
                        oninput="handleRwDirectChange('${sub.code}', this.value)"
                        class="w-16 py-1 px-1 bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-300 rounded text-center text-xs font-black text-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs cursor-pointer" />
                </td>
                <td class="p-1.5 border-r border-slate-300">
                    <input type="number" min="40" max="150" value="${sw}" id="swInput_${sub.code}"
                        oninput="handleSwChange('${sub.code}', this.value)"
                        class="w-16 py-1 px-1 bg-white border border-slate-300 rounded text-center text-xs font-black text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer" />
                </td>
                <td class="p-2 font-bold text-slate-700 font-mono text-sm" id="gradeTable_${sub.code}">${grade}</td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
}

/**
 * Listener saat HRD mengubah angka RW secara langsung pada tabel aspek:
 * Mengupdate SW secara otomatis sesuai Tabel Norma IST, Grade Romawi, IQ, dan Kurva Grafik secara real-time
 */
function handleRwDirectChange(subCode, newVal) {
    let val = parseInt(newVal, 10);
    if (isNaN(val) || val < 0) val = 0;

    const subSpec = IST_SUBTEST_SPECS.find(s => s.code === subCode);
    const maxVal = subSpec ? (subSpec.isEssay ? subSpec.totalSoal * 2 : subSpec.totalSoal) : 40;
    if (val > maxVal) val = maxVal;

    activeIstCorrection.rw[subCode] = val;

    // 1. Perbarui nilai di tampilan bawah lembar koreksi subtes
    const rsEl = document.getElementById(`rsDisplay_${subCode}`);
    if (rsEl) rsEl.innerText = val;

    // 2. AUTO-LOOKUP: Konversi RS ke SW dari Tabel Norma IST secara real-time
    const autoSw = (IST_NORM_RS_TO_SW[subCode] && IST_NORM_RS_TO_SW[subCode][val] !== undefined)
        ? IST_NORM_RS_TO_SW[subCode][val]
        : 70;
    activeIstCorrection.sw[subCode] = autoSw;
    const swInput = document.getElementById(`swInput_${subCode}`);
    if (swInput) swInput.value = autoSw;

    // 3. AUTO-LOOKUP: Konversi RS ke Grade Romawi (I s/d V)
    const autoGrade = (IST_NORM_RS_TO_GRADE[subCode] && IST_NORM_RS_TO_GRADE[subCode][val]) || 'V';
    const gradeEl = document.getElementById(`gradeTable_${subCode}`);
    if (gradeEl) gradeEl.innerText = autoGrade;

    // 4. Hitung ulang akumulasi total jawaban benar, IQ, dan perbarui kurva grafik seketika
    recalculateAllIstScores();
}

/**
 * Listener saat skor per soal diubah oleh HRD:
 * Mengupdate RS/RW, Auto-Lookup Nilai SW & Grade Romawi, serta Auto-Recalculate IQ & Kategori
 */
function handleScoreChange(subCode, itemNo, newVal) {
    const val = Number(newVal) || 0;
    if (!activeIstCorrection.scores[subCode]) activeIstCorrection.scores[subCode] = {};
    activeIstCorrection.scores[subCode][itemNo] = val;

    // 1. Hitung ulang total RW subtes tersebut
    let subTotal = 0;
    const subSpec = IST_SUBTEST_SPECS.find(s => s.code === subCode);
    if (subSpec) {
        for (let i = 1; i <= subSpec.totalSoal; i++) {
            subTotal += (activeIstCorrection.scores[subCode][i] || 0);
        }
    }
    activeIstCorrection.rw[subCode] = subTotal;

    // 2. Perbarui tampilan RS/RW di bawah lembar subtes
    const rsEl = document.getElementById(`rsDisplay_${subCode}`);
    if (rsEl) rsEl.innerText = subTotal;

    // 3. Perbarui input RW pada tabel aspek
    const rwInput = document.getElementById(`rwInput_${subCode}`) || document.getElementById(`rwTable_${subCode}`);
    if (rwInput) {
        if ('value' in rwInput) rwInput.value = subTotal;
        else rwInput.innerText = subTotal;
    }

    // 4. AUTO-LOOKUP: Konversi RS ke SW dari Tabel Norma IST
    const autoSw = (IST_NORM_RS_TO_SW[subCode] && IST_NORM_RS_TO_SW[subCode][subTotal] !== undefined)
        ? IST_NORM_RS_TO_SW[subCode][subTotal]
        : (activeIstCorrection.sw[subCode] || 70);
    activeIstCorrection.sw[subCode] = autoSw;
    const swInput = document.getElementById(`swInput_${subCode}`);
    if (swInput) swInput.value = autoSw;

    // 5. AUTO-LOOKUP: Konversi RS ke Grade Romawi (I s/d V)
    const autoGrade = (IST_NORM_RS_TO_GRADE[subCode] && IST_NORM_RS_TO_GRADE[subCode][subTotal]) || 'V';
    const gradeEl = document.getElementById(`gradeTable_${subCode}`);
    if (gradeEl) gradeEl.innerText = autoGrade;

    // 6. Hitung ulang akumulasi keseluruhan (Total Jawaban Benar, Total IQ, dan Kategori)
    recalculateAllIstScores();
}

/**
 * Menghitung ulang akumulasi seluruh jawaban benar, rata-rata SW, skor IQ, dan kategori
 */
function recalculateAllIstScores() {
    let grandTotalRw = 0;
    IST_SUBTEST_SPECS.forEach(sub => {
        grandTotalRw += (activeIstCorrection.rw[sub.code] || 0);
    });

    // Update kartu "TOTAL JAWABAN BENAR" secara instan tanpa reload
    const benarEl = document.getElementById('istRptTotalBenar');
    if (benarEl) benarEl.innerText = grandTotalRw;

    // Update total baris Σ pada tabel aspek
    const sumRwEl = document.getElementById('istAspekTotalRw');
    if (sumRwEl) sumRwEl.innerText = grandTotalRw;

    // Hitung rata-rata SW
    let totalSw = 0;
    IST_SUBTEST_SPECS.forEach(sub => {
        totalSw += (activeIstCorrection.sw[sub.code] || 0);
    });
    const avgSw = Math.round(totalSw / 9);
    const avgSwEl = document.getElementById('istAspekRataSw');
    if (avgSwEl) avgSwEl.innerText = avgSw;

    // AUTO-KATEGORI: Tentukan kategori rata-rata SW (MR, BL, DN, LA, A, HA, BN, S, VS, G)
    const avgCatInfo = getIstCategory(avgSw);
    const avgCatEl = document.getElementById('istAspekKategoriRata');
    if (avgCatEl) {
        avgCatEl.innerText = avgCatInfo.abbr;
        avgCatEl.title = avgCatInfo.label;
    }

    // AUTO-IQ: Skor IQ langsung mengambil dari Total/Rata-rata SW (misalkan: 86)
    const autoIq = avgSw;
    activeIstCorrection.skorIq = autoIq;
    const inputIq = document.getElementById('inputIstSkorIq');
    if (inputIq) {
        inputIq.value = autoIq;
    }
    const iqCatInfo = getIstCategory(autoIq);
    const katEl = document.getElementById('istRptKategori');
    if (katEl) {
        katEl.innerText = `${iqCatInfo.label} (${iqCatInfo.abbr})`;
    }

    // AUTO-UPDATE CHART: Perbarui titik kurva grafik Chart.js seketika
    if (istProfileChartInstance) {
        const swValues = IST_SUBTEST_SPECS.map(sub => activeIstCorrection.sw[sub.code] || 0);
        istProfileChartInstance.data.datasets[0].data = swValues;
        istProfileChartInstance.update('none'); // Reaktif instan
    }
}

/**
 * Listener saat HRD mengubah nilai SW secara manual pada tabel:
 * Mengupdate total SW, IQ, kategori IQ, dan grafik secara real-time
 */
function handleSwChange(subCode, newVal) {
    const val = Number(newVal) || 0;
    activeIstCorrection.sw[subCode] = val;
    recalculateAllIstScores();
}

/**
 * Listener saat HRD mengetik langsung pada input Total Skor IQ
 */
function handleIstIqInputChange(val) {
    const iq = Number(val) || 0;
    activeIstCorrection.skorIq = iq;

    const katEl = document.getElementById('istRptKategori');
    if (!katEl) return;

    const iqCat = getIstCategory(iq);
    katEl.innerText = `${iqCat.label} (${iqCat.abbr})`;
}

/**
 * Inisialisasi atau pembaruan grafik kurva profil kecerdasan IST (Chart.js)
 * Sesuai Standar IST: Titik kurva merah dengan marker diamond (rhombus)
 */
function initOrUpdateIstProfileChart() {
    const canvas = document.getElementById('istProfileChart');
    if (!canvas) return;

    const labels = IST_SUBTEST_SPECS.map(s => s.code);
    const dataValues = IST_SUBTEST_SPECS.map(s => activeIstCorrection.sw[s.code] || 70);

    if (istProfileChartInstance) {
        istProfileChartInstance.destroy();
        istProfileChartInstance = null;
    }

    const ctx = canvas.getContext('2d');
    istProfileChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Profil Kecerdasan IST (SW)',
                data: dataValues,
                borderColor: '#dc2626',            // Garis merah tebal sesuai lembar IST
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                pointBackgroundColor: '#dc2626',
                pointBorderColor: '#991b1b',
                pointBorderWidth: 1.5,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointStyle: 'rectRot',             // Bentuk penanda berlian (diamond / rhombus)
                tension: 0                         // Garis lurus patah-patah antar titik aspek
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { color: '#e2e8f0' },
                    ticks: {
                        color: '#0f172a',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                y: {
                    min: 60,
                    max: 130,
                    stepSize: 10,
                    grid: { color: '#cbd5e1' },
                    ticks: {
                        color: '#475569',
                        font: { size: 11, weight: '600' }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#003865',
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 13, weight: 'bold' },
                    callbacks: {
                        label: function (ctx) {
                            return `Standardwert (SW): ${ctx.raw}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Menyimpan data koreksi manual HRD ke Supabase (tabel: kandidat_psikotes, kolom: hasil_ist)
 */
async function simpanKoreksiIstKeSupabase() {
    const sb = (typeof supabaseClient !== 'undefined' && supabaseClient)
        ? supabaseClient
        : ((typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

    if (!sb || !activeIstCorrection.candidateId) {
        if (typeof showHrdToast === 'function') {
            showHrdToast("Koneksi database tidak tersedia atau kandidat belum dipilih.", "error");
        } else {
            alert("Koneksi database tidak tersedia atau kandidat belum dipilih.");
        }
        return;
    }

    const btn = document.getElementById('btnSimpanKoreksiIst');
    const statusText = document.getElementById('istSaveStatusText');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;
    }
    if (statusText) {
        statusText.classList.remove('hidden');
        statusText.innerText = "Mengunggah hasil koreksi ke server Supabase...";
    }

    try {
        // 1. Ambil data hasil_ist terkini dari Supabase agar tidak menimpa data modul lain
        const { data: rowKandidat, error: fetchErr } = await sb
            .from('kandidat_psikotes')
            .select('hasil_ist')
            .eq('id', activeIstCorrection.candidateId)
            .single();

        if (fetchErr) throw fetchErr;

        let existingIst = (rowKandidat && rowKandidat.hasil_ist) ? rowKandidat.hasil_ist : {};
        if (typeof existingIst === 'string') {
            try { existingIst = JSON.parse(existingIst); } catch (e) { existingIst = {}; }
        }

        // 2. Susun payload koreksi manual
        const manualPayload = {
            skor_butir: activeIstCorrection.scores,
            rw: activeIstCorrection.rw,
            sw: activeIstCorrection.sw,
            skor_iq: activeIstCorrection.skorIq,
            waktu_koreksi: new Date().toISOString(),
            status_koreksi: 'Telah Dikoreksi HRD'
        };

        const updatedIst = {
            ...existingIst,
            skor_iq: activeIstCorrection.skorIq,
            sw_aspek: activeIstCorrection.sw,
            koreksi_manual_hrd: manualPayload
        };

        // 3. Simpan perubahan ke tabel kandidat_psikotes
        const { error: updateErr } = await sb
            .from('kandidat_psikotes')
            .update({ hasil_ist: updatedIst })
            .eq('id', activeIstCorrection.candidateId);

        if (updateErr) throw updateErr;

        // 4. Update data pada cache lokal HRD (cachedHrdData)
        if (typeof cachedHrdData !== 'undefined' && Array.isArray(cachedHrdData)) {
            const found = cachedHrdData.find(c => c.id === activeIstCorrection.candidateId);
            if (found) {
                found.hasil_ist = updatedIst;
            }
        }
        if (currentSelectedCandidate) {
            currentSelectedCandidate.hasil_ist = updatedIst;
        }

        if (typeof showHrdToast === 'function') {
            showHrdToast("Koreksi manual & nilai SW/IQ berhasil disimpan permanen!", "success");
        } else {
            alert("Koreksi manual & nilai SW/IQ berhasil disimpan permanen ke database!");
        }

        if (statusText) statusText.innerText = "✓ Tersimpan pada " + new Date().toLocaleTimeString('id-ID');

    } catch (err) {
        console.error("Gagal menyimpan koreksi IST:", err);
        if (typeof showHrdToast === 'function') {
            showHrdToast("Gagal menyimpan: " + (err.message || err), "error");
        } else {
            alert("Gagal menyimpan koreksi ke database: " + (err.message || err));
        }
        if (statusText) statusText.innerText = "⚠️ Gagal menyimpan!";
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-floppy-disk text-amber-400"></i> <span>Simpan Koreksi HRD</span>`;
        }
    }
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
 * Kunci pemetaan standar 90 soal PAPI Kostick & 7 Bidang Roda Interpretasi
 * Mengacu pada modul terpusat di js/hrd-charts.js
 */
const PAPI_ANSWER_KEY = (typeof window !== 'undefined' && window.PAPI_ANSWER_KEY) ? window.PAPI_ANSWER_KEY : [];
const PAPI_DOMAINS = (typeof window !== 'undefined' && window.PAPI_DOMAINS) ? window.PAPI_DOMAINS : [];

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
 * Terpusat & modular di js/hrd-charts.js
 */
function drawCurvedDomainText(ctx, text, cx, cy, r, startDeg, endDeg, isBottom) {
    if (window.HrdCharts && typeof window.HrdCharts.drawCurvedDomainText === 'function') {
        return window.HrdCharts.drawCurvedDomainText(ctx, text, cx, cy, r, startDeg, endDeg, isBottom);
    }
}

/**
 * Menggambar roda interpretasi PAPI Kostick 20 aspek dengan Canvas 2D murni
 * Terpusat & modular di js/hrd-charts.js
 */
function drawPapiWheel(canvasId, scores) {
    if (window.HrdCharts && typeof window.HrdCharts.drawPapiWheel === 'function') {
        return window.HrdCharts.drawPapiWheel(canvasId, scores);
    }
}

/**
 * Membangun tabel matriks lembar jawaban mentah 90 soal PAPI Kostick
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
                    <p class="text-xs text-slate-500">Rekaman pilihan pernyataan A / B peserta</p>
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
                    <span>Catatan: Rekaman jawaban mentah 1–90 tidak tersimpan pada sesi ini (skor langsung dihitung dari hasil penilaian).</span>
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

        const papiViolations = (data && data.pelanggaran_tab_switch !== undefined) ? Number(data.pelanggaran_tab_switch) : null;
        let integrityBadge = '';
        if (papiViolations !== null) {
            integrityBadge = papiViolations === 0
                ? `<div class="mt-2.5"><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-shield-check"></i> 0 Pelanggaran (Jujur)</span></div>`
                : `<div class="mt-2.5"><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200"><i class="fa-solid fa-triangle-exclamation"></i> ${papiViolations}x Pelanggaran Ganti Tab</span></div>`;
        }

        // Inject 3 Bagian Vertikal ke DOM
        container.innerHTML = `
            <!-- BAGIAN A: KARTU PUTIH RODA INTERPRETASI -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div class="text-center mb-4">
                    <h3 class="text-base sm:text-lg font-black text-[#003865] tracking-wide uppercase">LEMBAR INTERPRETASI PAPI KOSTICK</h3>
                    <p class="text-xs text-slate-500 mt-0.5">Personality &amp; Preference Inventory &bull; Roda Profil 20 Dimensi Kerja</p>
                    ${integrityBadge}
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

// Instance Chart.js DISC untuk pencegahan tabrakan & memory leak
let discChartInstances = [];

/**
 * Merender profil perilaku DISC komprehensif: Tabel Skor Mentah, 3 Line Charts (Mask, Core, Mirror) & Analisis Kepribadian
 * @param {Object|string} hasilDisc 
 */
function renderDiscResults(hasilDisc) {
    const emptyNotice = document.getElementById('discEmptyNotice');
    const contentWrapper = document.getElementById('discContentWrapper');

    // Bersihkan instance chart lama agar tidak terjadi memory leak atau canvas overlap
    discChartInstances.forEach(ch => {
        try { ch.destroy(); } catch (e) {}
    });
    discChartInstances = [];

    // Empty state ramah jika hasil_disc kosong/null
    if (!hasilDisc) {
        if (emptyNotice) emptyNotice.classList.remove('hidden');
        if (contentWrapper) contentWrapper.classList.add('hidden');
        return;
    }

    try {
        const data = typeof hasilDisc === 'string' ? JSON.parse(hasilDisc) : hasilDisc;

        if (emptyNotice) emptyNotice.classList.add('hidden');
        if (contentWrapper) contentWrapper.classList.remove('hidden');

        // Helper ekstraksi nilai
        const getVal = (obj, key, fallback = '-') => (obj && obj[key] !== undefined && obj[key] !== null) ? obj[key] : fallback;

        // 1. ISI TABEL SKOR MENTAH (RAW SCORES) PERSIS SESUAI IDENTIFIER TABEL
        const rawTable = data.table_raw || data.raw_table || data.raw_scores || {};
        const l1 = rawTable.line1 || rawTable.l1 || data.line1_raw || data.mask_raw || data.raw_p || {};
        const l2 = rawTable.line2 || rawTable.l2 || data.line2_raw || data.core_raw || data.raw_k || {};
        const l3 = rawTable.line3 || rawTable.l3 || data.line3_raw || data.mirror_raw || data.raw_diff || {};

        // Line 1: Paling (P)
        const l1D = getVal(l1, 'D', getVal(l1, 'd', '-'));
        const l1I = getVal(l1, 'I', getVal(l1, 'i', '-'));
        const l1S = getVal(l1, 'S', getVal(l1, 's', '-'));
        const l1C = getVal(l1, 'C', getVal(l1, 'c', '-'));
        let l1StarVal = getVal(l1, '*', getVal(l1, 'star', null));
        if (l1StarVal === null || l1StarVal === undefined) {
            if (l1D !== '-' && l1I !== '-' && l1S !== '-' && l1C !== '-') {
                const sum1 = Number(l1D) + Number(l1I) + Number(l1S) + Number(l1C);
                l1StarVal = Math.max(0, 24 - sum1);
            } else {
                l1StarVal = getVal(rawTable, 'star_1', '0');
            }
        }
        const l1Star = l1StarVal;
        const l1Tot = getVal(l1, 'tot', getVal(l1, 'total', '24'));

        // Line 2: Kurang (K)
        const l2D = getVal(l2, 'D', getVal(l2, 'd', '-'));
        const l2I = getVal(l2, 'I', getVal(l2, 'i', '-'));
        const l2S = getVal(l2, 'S', getVal(l2, 's', '-'));
        const l2C = getVal(l2, 'C', getVal(l2, 'c', '-'));
        let l2StarVal = getVal(l2, '*', getVal(l2, 'star', null));
        if (l2StarVal === null || l2StarVal === undefined) {
            if (l2D !== '-' && l2I !== '-' && l2S !== '-' && l2C !== '-') {
                const sum2 = Number(l2D) + Number(l2I) + Number(l2S) + Number(l2C);
                l2StarVal = Math.max(0, 24 - sum2);
            } else {
                l2StarVal = getVal(rawTable, 'star_2', '0');
            }
        }
        const l2Star = l2StarVal;
        const l2Tot = getVal(l2, 'tot', getVal(l2, 'total', '24'));

        // Line 3: Selisih (L1 - L2)
        const calcL3 = (val1, val2) => {
            if (val1 !== '-' && val2 !== '-' && !isNaN(val1) && !isNaN(val2)) {
                const diff = Number(val1) - Number(val2);
                return diff > 0 ? `+${diff}` : String(diff);
            }
            return '-';
        };
        const l3D = getVal(l3, 'D', getVal(l3, 'd', calcL3(l1D, l2D)));
        const l3I = getVal(l3, 'I', getVal(l3, 'i', calcL3(l1I, l2I)));
        const l3S = getVal(l3, 'S', getVal(l3, 's', calcL3(l1S, l2S)));
        const l3C = getVal(l3, 'C', getVal(l3, 'c', calcL3(l1C, l2C)));

        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setTxt('discTblL1D', l1D);
        setTxt('discTblL1I', l1I);
        setTxt('discTblL1S', l1S);
        setTxt('discTblL1C', l1C);
        setTxt('discTblL1Star', l1Star);
        setTxt('discTblL1Tot', l1Tot);

        setTxt('discTblL2D', l2D);
        setTxt('discTblL2I', l2I);
        setTxt('discTblL2S', l2S);
        setTxt('discTblL2C', l2C);
        setTxt('discTblL2Star', l2Star);
        setTxt('discTblL2Tot', l2Tot);

        setTxt('discTblL3D', l3D);
        setTxt('discTblL3I', l3I);
        setTxt('discTblL3S', l3S);
        setTxt('discTblL3C', l3C);

        // 2. EKSTRAKSI SKOR SKALA TERSKALA UNTUK 3 GRAFIK GARIS (MASK, CORE, MIRROR)
        const getPoints = (src) => {
            if (!src) return [0, 0, 0, 0];
            if (Array.isArray(src) && src.length >= 4) return src.map(Number);
            return [
                Number(src.D !== undefined ? src.D : (src.d || 0)),
                Number(src.I !== undefined ? src.I : (src.i || 0)),
                Number(src.S !== undefined ? src.S : (src.s || 0)),
                Number(src.C !== undefined ? src.C : (src.c || 0))
            ];
        };

        const maskPts = getPoints(data.mask_norm || data.mask || data.graph1 || data.grafik1 || data.line1 || data.public_self || data.perilaku_adaptif);
        const corePts = getPoints(data.core_norm || data.core || data.graph2 || data.grafik2 || data.line2 || data.private_self || data.bawah_tekanan);
        const mirrorPts = getPoints(data.mirror_norm || data.mirror || data.graph3 || data.grafik3 || data.line3 || data.perceived_self || data.karakter_asli);

        // Nilai ringkas di bawah tiap grafik
        const setChartVals = (id, pts) => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = `
                    <div class="p-1 rounded bg-red-50 text-red-700">D: ${pts[0]}</div>
                    <div class="p-1 rounded bg-amber-50 text-amber-700">I: ${pts[1]}</div>
                    <div class="p-1 rounded bg-emerald-50 text-emerald-700">S: ${pts[2]}</div>
                    <div class="p-1 rounded bg-blue-50 text-blue-700">C: ${pts[3]}</div>
                `;
            }
        };
        setChartVals('discValsMask', maskPts);
        setChartVals('discValsCore', corePts);
        setChartVals('discValsMirror', mirrorPts);

        // 3. INFORMASI PANEL ANALISIS KEPRIBADIAN
        const patternName = data.pattern_name 
            ? (data.pattern_combo ? `${data.pattern_name} (${data.pattern_combo})` : data.pattern_name)
            : (data.tipe_kepribadian || data.tipe || data.pattern || 'Profil DISC Terpetakan');
        setTxt('discPatternTitle', patternName);

        let traits = data.pattern_traits || data.traits || data.karakteristik || [];
        if (typeof traits === 'string') {
            traits = traits.split(/[,;\n]/).map(t => t.trim()).filter(Boolean);
        } else if (!Array.isArray(traits)) {
            traits = [];
        }

        const traitsContainer = document.getElementById('discTraitsContainer');
        if (traitsContainer) {
            if (traits.length > 0) {
                traitsContainer.innerHTML = traits.map(t => `
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200/80">
                        <i class="fa-solid fa-check text-blue-600 text-[10px]"></i>
                        ${escapeHtml(t)}
                    </span>
                `).join('');
            } else {
                traitsContainer.innerHTML = `
                    <span class="text-xs text-slate-500 italic">Karakteristik dinamis berdasarkan kombinasi grafik D, I, S, dan C.</span>
                `;
            }
        }

        const narrative = data.pattern_narrative || data.narrative || data.deskripsi || data.penjelasan || 'Kandidat telah menyelesaikan asesmen DISC. Grafik di atas memetakan dinamika perilaku adaptif, respons di bawah tekanan, dan persepsi karakter asli.';
        setTxt('discNarrativeText', narrative);

        const jobMatch = data.pattern_job_match || data.job_match || data.rekomendasi_posisi || data.rekomendasi || 'Sesuai dengan pemetaan karakter kerja operasional dan analitikal PT Altrak 1978.';
        setTxt('discJobMatchText', jobMatch);

        // 4. GAMBAR 3 GRAFIK GARIS CHART.JS (-8.0 sampai +8.0, garis netral horizontal di 0)
        setTimeout(() => {
            const chart1 = createDiscLineChart('discChartMask', 'Mask (Public Self)', maskPts, '#0284c7');
            const chart2 = createDiscLineChart('discChartCore', 'Core (Private Self)', corePts, '#d97706');
            const chart3 = createDiscLineChart('discChartMirror', 'Mirror (Perceived Self)', mirrorPts, '#059669');

            if (chart1) discChartInstances.push(chart1);
            if (chart2) discChartInstances.push(chart2);
            if (chart3) discChartInstances.push(chart3);
        }, 50);

    } catch (e) {
        console.error('Gagal merender hasil DISC:', e);
        if (emptyNotice) {
            emptyNotice.classList.remove('hidden');
            emptyNotice.innerHTML = '<div class="text-center py-8 text-red-500 text-xs">Format data hasil tes DISC tidak valid.</div>';
        }
        if (contentWrapper) contentWrapper.classList.add('hidden');
    }
}

/**
 * Helper konfigurasi Line Chart Chart.js untuk tes DISC (-8.0 sampai +8.0, garis netral di 0)
 * Terpusat & modular di js/hrd-charts.js
 */
function createDiscLineChart(canvasId, label, points, color) {
    if (window.HrdCharts && typeof window.HrdCharts.createDiscLineChart === 'function') {
        return window.HrdCharts.createDiscLineChart(canvasId, label, points, color);
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
        const rawPhotoEntries = [];
        const seenFileNames = new Set();
        const seenTimestamps = new Set();
        const sbClient = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;

        // Identifikasi kandidat: ID unik database (UUID/integer), kontak & email
        const candId = (candidate && (candidate.id || candidate.id_peserta || candidate.id_kandidat))
            ? String(candidate.id || candidate.id_peserta || candidate.id_kandidat).trim()
            : '';
        const candPhoneRaw = (candidate ? (candidate["No WhatsApp"] || candidate.no_wa || '') : '').toString().trim();
        const candPhone = candPhoneRaw.replace(/[^0-9]/g, '');
        const candEmailRaw = (candidate ? (candidate["Alamat Email"] || candidate.email || '') : '').toString().trim();
        const candEmail = candEmailRaw.replace(/[^a-zA-Z0-9_-]/g, '_');

        const isMatchCurrentCandidate = (nameOrPath) => {
            if (!candidate) return true;
            if (!nameOrPath) return false;
            const str = String(nameOrPath).toLowerCase();
            if (candId && candId.length >= 4 && str.includes(candId.toLowerCase())) {
                return true;
            }
            if (candPhone && candPhone.length >= 4 && str.includes(candPhone)) {
                return true;
            }
            if (candEmail && candEmail.length >= 4 && str.includes(candEmail.toLowerCase())) {
                return true;
            }
            return false;
        };

        // Helper untuk mengekstrak informasi modul, subtes, fase, dan waktu dari nama file
        const parsePhotoMeta = (fileName, folderHint = '') => {
            let namaModul = (folderHint || 'IST').toUpperCase();
            let namaSubtes = '';
            let subtesNo = 0;
            let namaFase = 'Awal';

            const parts = fileName.replace(/\.[^/.]+$/, '').split('_');

            // 1. Modul
            const modPart = parts.find(p => /^(ist|cfit|pauli|papi|disc|epps|msdt|mbti|mcmi)$/i.test(p));
            if (modPart) namaModul = modPart.toUpperCase();

            // 2. Subtes
            const subtesPart = parts.find(p => /subtes/i.test(p));
            if (subtesPart) {
                namaSubtes = subtesPart.replace(/-/g, ' ');
                const matchNum = subtesPart.match(/\d+/);
                if (matchNum) subtesNo = parseInt(matchNum[0], 10);
            }

            // 3. Fase
            const fasePart = parts.find(p => /^(awal|tengah|akhir|pelanggaran.*)$/i.test(p));
            if (fasePart) {
                namaFase = fasePart.charAt(0).toUpperCase() + fasePart.slice(1);
            }

            // 4. Waktu
            const tglPart = parts.find(p => /^\d{4}-\d{2}-\d{2}$/.test(p));
            const jamPart = parts.find(p => /^\d{2}[-:]\d{2}[-:]\d{2}$/.test(p));
            let labelWaktu = "-";
            if (tglPart && jamPart) {
                labelWaktu = `${tglPart} ${jamPart.replace(/-/g, ':')}`;
            }

            return { namaModul, namaSubtes, subtesNo, namaFase, labelWaktu };
        };

        if (sbClient && sbClient.storage) {
            // 1. PRIORITAS 1: Ambil foto dari subfolder ID kandidat (Format Aman Fase 2: <id_kandidat>/<random_uuid>.jpg)
            if (candId) {
                try {
                    const { data: files, error } = await sbClient.storage.from('foto_kandidat').list(candId, {
                        limit: 100,
                        sortBy: { column: 'name', order: 'asc' }
                    });

                    if (!error && files && files.length > 0) {
                        const photoFiles = files.filter(f => 
                            /\.(jpe?g|png|webp)$/i.test(f.name) && 
                            (f.metadata ? f.metadata.size > 100 : true)
                        );

                        photoFiles.forEach(f => {
                            const filePath = `${candId}/${f.name}`;
                            const meta = parsePhotoMeta(f.name);
                            if (meta.labelWaktu === '-' && f.created_at) {
                                meta.labelWaktu = new Date(f.created_at).toLocaleString('id-ID');
                            }
                            const cleanBaseName = f.name.toLowerCase().trim();
                            if (!seenFileNames.has(cleanBaseName)) {
                                seenFileNames.add(cleanBaseName);
                                if (meta.labelWaktu !== '-') seenTimestamps.add(meta.labelWaktu);

                                rawPhotoEntries.push({
                                    modul: meta.namaModul,
                                    subtesStr: meta.namaSubtes,
                                    subtesNo: meta.subtesNo,
                                    fase: meta.namaFase,
                                    labelWaktu: meta.labelWaktu,
                                    path: filePath,
                                    filePath: filePath,
                                    fileName: f.name
                                });
                            }
                        });
                    }
                } catch (eCandFolder) {
                    console.warn(`[HRD] Scan folder kandidat ${candId}:`, eCandFolder);
                }
            }

            // 2. PRIORITAS 2: Ambil foto dari subfolder per modul tes (Format Opsi B: <folderName>/<candId>/<fileName> atau legacy <folderName>/<fileName>)
            const targetFolders = ['IST', 'PAULI', 'PAPI', 'DISC', 'MSDT', 'EPPS', 'CFIT', 'MBTI', 'MCMI'];
            for (const folderName of targetFolders) {
                const foldersToScan = candId ? [`${folderName}/${candId}`, folderName] : [folderName];
                for (const pathScan of foldersToScan) {
                    try {
                        const { data: files, error } = await sbClient.storage.from('foto_kandidat').list(pathScan, {
                            limit: 100,
                            sortBy: { column: 'name', order: 'asc' }
                        });

                        if (!error && files && files.length > 0) {
                            const isCandidateSubfolder = pathScan.includes('/');
                            const photoFiles = files.filter(f => 
                                /\.(jpe?g|png|webp)$/i.test(f.name) && 
                                (f.metadata ? f.metadata.size > 100 : true) &&
                                (isCandidateSubfolder ? true : isMatchCurrentCandidate(f.name))
                            );

                            photoFiles.forEach(f => {
                                const filePath = `${pathScan}/${f.name}`;
                                const meta = parsePhotoMeta(f.name, folderName);
                                if (meta.labelWaktu === '-' && f.created_at) {
                                    meta.labelWaktu = new Date(f.created_at).toLocaleString('id-ID');
                                }

                                const cleanBaseName = f.name.toLowerCase().trim();
                                if (!seenFileNames.has(cleanBaseName)) {
                                    seenFileNames.add(cleanBaseName);
                                    if (meta.labelWaktu !== '-') seenTimestamps.add(meta.labelWaktu);

                                    rawPhotoEntries.push({
                                        modul: meta.namaModul,
                                        subtesStr: meta.namaSubtes,
                                        subtesNo: meta.subtesNo,
                                        fase: meta.namaFase,
                                        labelWaktu: meta.labelWaktu,
                                        path: filePath,
                                        filePath: filePath,
                                        fileName: f.name
                                    });
                                }
                            });
                        }
                    } catch (errStorage) {
                        console.warn(`Catatan pembacaan storage folder ${pathScan}:`, errStorage);
                    }
                }
            }
        }

        // 3. CADANGAN: Ambil dari objek hasil_ist kandidat jika belum tercatat
        if (candidate && candidate.hasil_ist) {
            try {
                const parsedIst = typeof candidate.hasil_ist === 'string' ? JSON.parse(candidate.hasil_ist) : candidate.hasil_ist;
                if (parsedIst && Array.isArray(parsedIst.foto_pengawasan)) {
                    parsedIst.foto_pengawasan.forEach(p => {
                        let pth = p.filePath || p.path || p.fileName || '';
                        if (!pth && p.url && p.url.includes('/foto_kandidat/')) {
                            pth = decodeURIComponent(p.url.split('/foto_kandidat/')[1].split('?')[0]);
                        }
                        const fn = pth.split('/').pop().toLowerCase().trim();
                        const waktu = (p.waktu || '-').trim();

                        if (fn && seenFileNames.has(fn)) return;
                        if (waktu !== '-' && seenTimestamps.has(waktu)) return;

                        if (fn) seenFileNames.add(fn);
                        if (waktu !== '-') seenTimestamps.add(waktu);

                        let rawSubtes = p.subtes || 'Subtes 1';
                        let subNum = 1;
                        const matchNum = rawSubtes.match(/\d+/);
                        if (matchNum) subNum = parseInt(matchNum[0], 10);

                        let faseStr = p.fase || 'Awal';
                        if (rawSubtes.toLowerCase().includes('akhir')) faseStr = 'Akhir';
                        else if (rawSubtes.toLowerCase().includes('tengah')) faseStr = 'Tengah';

                        rawPhotoEntries.push({
                            modul: (p.folder || 'IST').toUpperCase(),
                            subtesStr: `Subtes ${subNum}`,
                            subtesNo: subNum,
                            fase: faseStr,
                            labelWaktu: waktu,
                            path: pth,
                            filePath: pth,
                            fileName: fn
                        });
                    });
                }
            } catch (errParse) {}
        }

        // 4. CADANGAN TERAKHIR: Ambil dari cache lokal HANYA jika file milik kandidat
        try {
            const localPhotos = JSON.parse(localStorage.getItem('kandidat_foto_pengawasan') || '[]');
            if (Array.isArray(localPhotos)) {
                localPhotos.forEach(p => {
                    let pth = p.filePath || p.path || p.fileName || '';
                    const fn = pth.split('/').pop().toLowerCase().trim();
                    const waktu = (p.waktu || '-').trim();
                    const isOwner = (candId && p.candidateId && String(p.candidateId) === candId) ||
                        isMatchCurrentCandidate(fn) ||
                        (candPhone && p.candidatePhone && p.candidatePhone.replace(/[^0-9]/g, '') === candPhone) ||
                        (candEmail && p.candidateEmail && p.candidateEmail.toLowerCase() === candEmail.toLowerCase());

                    if (isOwner) {
                        if (fn && seenFileNames.has(fn)) return;
                        if (waktu !== '-' && seenTimestamps.has(waktu)) return;

                        if (fn) seenFileNames.add(fn);
                        if (waktu !== '-') seenTimestamps.add(waktu);

                        let pModul = (p.folder || 'IST').toUpperCase();
                        let rawSub = p.subtes || '';
                        let subNum = 0;
                        const matchNum = rawSub.match(/\d+/);
                        if (matchNum) subNum = parseInt(matchNum[0], 10);

                        rawPhotoEntries.push({
                            modul: pModul,
                            subtesStr: subNum > 0 ? `Subtes ${subNum}` : '',
                            subtesNo: subNum,
                            fase: p.fase || 'Awal',
                            labelWaktu: waktu,
                            path: pth,
                            filePath: pth,
                            fileName: fn
                        });
                    }
                });
            }
        } catch (errLocal) {}

        // 5. DAPATKAN SHORT-LIVED SIGNED URLS DARI BUCKET PRIVATE (EXPIRY 300 DETIK / 5 MENIT)
        // Menjamin keamanan data peserta: Anon/publik tidak bisa membuka URL foto tanpa otentikasi admin
        const pathsToSign = [...new Set(rawPhotoEntries.map(p => p.path || p.filePath).filter(Boolean))];
        const signedUrlMap = {};

        if (pathsToSign.length > 0 && sbClient && sbClient.storage) {
            // A. Batch Signed URLs (300 detik)
            if (typeof sbClient.storage.from('foto_kandidat').createSignedUrls === 'function') {
                try {
                    const { data: signedList, error: signedErr } = await sbClient.storage
                        .from('foto_kandidat')
                        .createSignedUrls(pathsToSign, 300);
                    if (!signedErr && Array.isArray(signedList)) {
                        signedList.forEach((item, idx) => {
                            if (item && item.signedUrl) {
                                const targetPath = item.path || pathsToSign[idx];
                                signedUrlMap[targetPath] = item.signedUrl;
                                const fn = targetPath.split('/').pop();
                                if (fn) signedUrlMap[fn] = item.signedUrl;
                            }
                        });
                    }
                } catch (eBatch) {
                    console.warn('[HRD] Batch createSignedUrls error:', eBatch);
                }
            }

            // B. Fallback individual jika batch gagal atau belum meng-cover seluruh path
            for (const pth of pathsToSign) {
                if (!signedUrlMap[pth]) {
                    try {
                        const { data: sData, error: sErr } = await sbClient.storage
                            .from('foto_kandidat')
                            .createSignedUrl(pth, 300);
                        if (!sErr && sData && sData.signedUrl) {
                            signedUrlMap[pth] = sData.signedUrl;
                            const fn = pth.split('/').pop();
                            if (fn) signedUrlMap[fn] = sData.signedUrl;
                        }
                    } catch (eSingle) {}
                }
            }
        }

        // Susun daftar foto valid yang berhasil mendapatkan Signed URL
        rawPhotoEntries.forEach(p => {
            const finalUrl = signedUrlMap[p.path] || signedUrlMap[p.filePath] || signedUrlMap[p.fileName] || '';
            if (finalUrl) {
                allPhotos.push({
                    ...p,
                    url: finalUrl
                });
            }
        });

        // Tampilkan foto jika ditemukan
        if (allPhotos.length === 0) {
            grid.innerHTML = '';
            if (emptyNotice) emptyNotice.classList.remove('hidden');
            return;
        }

        // Deduplikasi sesi terkini: Pertahankan hanya foto dari sesi pengerjaan terbaru
        // Mencegah foto dobel (#1, #2) jika ada pengujian ulang atau sesi testing di tanggal berbeda
        const latestPhotosMap = new Map();
        const getPhotoTs = (item) => {
            if (item.labelWaktu && item.labelWaktu !== '-') {
                const parsed = Date.parse(item.labelWaktu.replace(' ', 'T'));
                if (!isNaN(parsed)) return parsed;
            }
            if (item.fileName) {
                const m = item.fileName.match(/(\d{4}-\d{2}-\d{2})_(\d{2})[-:](\d{2})[-:](\d{2})/);
                if (m) {
                    const parsed = Date.parse(`${m[1]}T${m[2]}:${m[3]}:${m[4]}`);
                    if (!isNaN(parsed)) return parsed;
                }
            }
            return 0;
        };

        allPhotos.forEach(p => {
            const mod = (p.modul || '').toUpperCase();
            const sub = p.subtesNo || 0;
            const fase = (p.fase || '').toLowerCase().trim();
            const isGenericViolation = fase === 'pelanggaran';
            const key = isGenericViolation ? `${mod}_${sub}_${fase}_${p.labelWaktu}` : `${mod}_${sub}_${fase}`;

            const curTs = getPhotoTs(p);
            if (!latestPhotosMap.has(key)) {
                latestPhotosMap.set(key, p);
            } else {
                const existing = latestPhotosMap.get(key);
                const exTs = getPhotoTs(existing);
                if (curTs >= exTs) {
                    latestPhotosMap.set(key, p);
                }
            }
        });

        allPhotos = Array.from(latestPhotosMap.values());

        // Hanya tampilkan foto fase standar (Awal, Tengah, Akhir) — foto pelanggaran tetap tersimpan di server
        // namun tidak ditampilkan di galeri dokumentasi karena sudah tercatat di badge integritas kandidat
        allPhotos = allPhotos.filter(p => !/pelanggaran/i.test(p.fase || ''));

        // Urutkan seluruh foto secara berpasangan kronologis yang rapi:
        // 1. Modul Tes (IST, PAULI, PAPI, DISC, MSDT, EPPS, CFIT, MBTI)
        // 2. Subtes 1..9
        // 3. Waktu pengambilan (sehingga Awal -> Tengah -> Akhir berpasangan berdampingan)
        const moduleWeights = {
            'IST': 1,
            'PAULI': 2,
            'PAPI': 3,
            'DISC': 4,
            'MSDT': 5,
            'EPPS': 6,
            'CFIT': 7,
            'MBTI': 8,
            'MCMI': 8
        };

        const getFaseWeight = (f) => {
            const l = (f || '').toLowerCase();
            if (l.includes('awal')) return 1;
            if (l.includes('tengah')) return 2;
            if (l.includes('akhir')) return 3;
            return 4;
        };

        allPhotos.sort((a, b) => {
            const modA = moduleWeights[a.modul] || 99;
            const modB = moduleWeights[b.modul] || 99;
            if (modA !== modB) return modA - modB;

            if (a.subtesNo !== b.subtesNo) return a.subtesNo - b.subtesNo;

            const timeA = a.labelWaktu || '';
            const timeB = b.labelWaktu || '';
            if (timeA !== timeB) return timeA.localeCompare(timeB);

            return getFaseWeight(a.fase) - getFaseWeight(b.fase);
        });

        // Hitung pengulangan sesi untuk penomoran urut unik (#1, #2) jika ada sesi yang sama
        const faseCounts = {};
        allPhotos.forEach(p => {
            const key = `${p.modul}_${p.subtesNo}_${p.fase}`;
            faseCounts[key] = (faseCounts[key] || 0) + 1;
        });

        const faseTracker = {};
        allPhotos.forEach(p => {
            const key = `${p.modul}_${p.subtesNo}_${p.fase}`;
            let baseLabel = p.subtesStr ? `${p.modul} - ${p.subtesStr} (${p.fase})` : `${p.modul} (${p.fase})`;

            if (faseCounts[key] > 1) {
                faseTracker[key] = (faseTracker[key] || 0) + 1;
                baseLabel += ` #${faseTracker[key]}`;
            }
            p.labelSubtes = baseLabel;
        });

        grid.innerHTML = '';
        allPhotos.forEach(p => {
            const card = document.createElement('div');
            card.className = "border border-slate-200 rounded-2xl p-3 bg-white text-center shadow-xs hover:shadow-md transition flex flex-col items-center justify-between";

            // Badge Fase warna elegan
            let badgeCls = "bg-sky-50 text-[#003865] border-sky-200";
            let faseIcon = "fa-solid fa-play text-sky-500";
            const fLower = (p.fase || '').toLowerCase();
            if (fLower.includes('tengah')) {
                badgeCls = "bg-amber-50 text-amber-800 border-amber-200";
                faseIcon = "fa-solid fa-hourglass-half text-amber-500";
            } else if (fLower.includes('akhir')) {
                badgeCls = "bg-emerald-50 text-emerald-800 border-emerald-200";
                faseIcon = "fa-solid fa-check text-emerald-600";
            } else if (fLower.includes('pelanggaran')) {
                badgeCls = "bg-rose-50 text-rose-800 border-rose-200";
                faseIcon = "fa-solid fa-triangle-exclamation text-rose-600";
            }

            card.innerHTML = `
                <div class="w-full h-44 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 mb-2 relative">
                    <img src="${p.url}" alt="${escapeHtml(p.labelSubtes)}" loading="lazy" class="w-full h-full object-cover select-none" onerror="const c = this.closest('.shadow-xs'); if (c) c.remove();">
                    <span class="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-black ${badgeCls} border shadow-2xs backdrop-blur-sm flex items-center gap-1">
                        <i class="${faseIcon} text-[9px]"></i> ${escapeHtml(p.fase || 'Awal')}
                    </span>
                </div>
                <div class="w-full text-center">
                    <p class="font-black text-xs text-[#003865] tracking-wide leading-tight">${escapeHtml(p.labelSubtes)}</p>
                    <p class="text-[11px] text-slate-500 font-mono mt-1">${escapeHtml(p.labelWaktu)}</p>
                </div>
            `;
            grid.appendChild(card);
        });

        // Bersihkan section pelanggaran terpisah jika pernah ada sebelumnya
        const oldViolationSection = document.getElementById('hrdFotoPelanggaranSection');
        if (oldViolationSection) oldViolationSection.remove();

    } catch (e) {
        console.warn('Gagal memuat galeri foto:', e);
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-slate-400 text-xs">Gagal memuat foto pengawasan.</div>';
    }
}

// =========================================================================
// OTENTIKASI & LOGOUT DIRECT HRD (PORTAL HRD.HTML)
// =========================================================================

function toggleHrdPasswordVisibility() {
    const pinInput = document.getElementById('inputHrdDirectPin');
    const icon = document.getElementById('hrdPasswordToggleIcon');
    if (!pinInput) return;
    if (pinInput.type === 'password') {
        pinInput.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        pinInput.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

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

    // Daftar email admin yang digunakan untuk otorisasi Supabase Auth
    const adminEmails = ['febriyandah3@gmail.com', 'febriyanh3@gmail.com'];
    const savedEmail = localStorage.getItem('altrak_hrd_saved_email');
    if (savedEmail && !adminEmails.includes(savedEmail)) {
        adminEmails.unshift(savedEmail);
    }
    const emailInput = document.getElementById('inputHrdEmail');
    if (emailInput && emailInput.value.trim()) {
        const val = emailInput.value.trim();
        if (!adminEmails.includes(val)) adminEmails.unshift(val);
    }

    // Verifikasi kredensial terhadap akun HRD di Supabase Auth
    const loadingEl = document.getElementById('modal-loading');
    if (loadingEl) loadingEl.classList.remove('hide-section');

    try {
        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
        if (!sb || !sb.auth) {
            if (loadingEl) loadingEl.classList.add('hide-section');
            return customAlert("Kesalahan Koneksi", "Koneksi Supabase belum siap.", "error");
        }

        let loginSuccess = false;
        let lastError = null;

        for (const email of adminEmails) {
            const { data, error } = await sb.auth.signInWithPassword({
                email: email,
                password: pin
            });

            if (!error && data && data.session) {
                // Verifikasi status hak akses admin via RPC is_admin
                const { data: isAdmin, error: adminErr } = await sb.rpc('is_admin');
                if (!adminErr && isAdmin) {
                    loginSuccess = true;
                    try {
                        localStorage.removeItem(HRD_ATTEMPTS_STORAGE_KEY);
                        localStorage.removeItem(HRD_LOCK_STORAGE_KEY);
                        if (typeof clearLockCookie === 'function') clearLockCookie();
                        localStorage.setItem('altrak_hrd_saved_email', email);
                    } catch (e) {}

                    isHrdAuthenticated = true;
                    if (pinInput) pinInput.value = '';
                    if (loadingEl) loadingEl.classList.add('hide-section');

                    const loginView = document.getElementById('hrd-login-view');
                    if (loginView) loginView.classList.add('hide-section');
                    const dashView = document.getElementById('hrd-dashboard-view');
                    if (dashView) dashView.classList.remove('hide-section');

                    loadHrdData();
                    loadHrdTokens();
                    break;
                } else {
                    await sb.auth.signOut();
                }
            } else {
                lastError = error;
            }
        }

        if (!loginSuccess) {
            if (loadingEl) loadingEl.classList.add('hide-section');
            if (lastError && (lastError.status === 429 || (lastError.message && lastError.message.toLowerCase().includes('rate limit')))) {
                const lockTime = Date.now() + HRD_LOCK_DURATION_MS;
                localStorage.setItem(HRD_LOCK_STORAGE_KEY, lockTime.toString());
                if (typeof setLockCookie === 'function') setLockCookie(lockTime);
                return customAlert("Akses Terkunci", "Terlalu banyak percobaan pada server (Rate Limited). Akses dibekukan sementara demi keamanan.", "error");
            }

            let currentAttempts = parseInt(localStorage.getItem(HRD_ATTEMPTS_STORAGE_KEY) || '0', 10) + 1;
            localStorage.setItem(HRD_ATTEMPTS_STORAGE_KEY, currentAttempts.toString());
            isHrdAuthenticated = false;
            if (pinInput) pinInput.value = '';

            if (currentAttempts >= MAX_HRD_ATTEMPTS) {
                const lockTime = Date.now() + HRD_LOCK_DURATION_MS;
                localStorage.setItem(HRD_LOCK_STORAGE_KEY, lockTime.toString());
                if (typeof setLockCookie === 'function') setLockCookie(lockTime);
                return customAlert(
                    "Akses Dikunci",
                    "Terlalu banyak percobaan gagal (3x). Akses otorisasi HRD dikunci 15 menit demi keamanan.",
                    "error"
                );
            } else {
                const sisaCoba = MAX_HRD_ATTEMPTS - currentAttempts;
                return customAlert(
                    "Akses Ditolak",
                    `Kata sandi tidak valid. Sisa kesempatan mencoba: ${sisaCoba} kali.`,
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
        if (sb && sb.auth) {
            await sb.auth.signOut();
        }
    } catch (err) {
        console.warn('Gagal logout Supabase:', err);
    }
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

// =========================================================================
// SISTEM MANAJEMEN TOKEN UJIAN (HRD PANEL)
// =========================================================================

let cachedTokenList = [];

function toggleTokenSection() {
    const card = document.getElementById('hrd-token-card');
    if (!card) return;
    if (card.classList.contains('hide-section')) {
        card.classList.remove('hide-section');
        loadHrdTokens();
    } else {
        card.classList.add('hide-section');
    }
}

async function loadHrdTokens() {
    const tbody = document.getElementById('tokenTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengambil data token...</td></tr>`;
    }

    const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
    if (!sb) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-amber-500">Supabase belum terhubung.</td></tr>`;
        return;
    }

    try {
        const { data, error } = await sb
            .from('token_ujian')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('[HRD Token]', error.message || error);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-slate-400">Tabel <code>token_ujian</code> belum terdeteksi di Supabase atau belum ada token. Klik <strong>+ Buat Token</strong> untuk memulai.</td></tr>`;
            }
            return;
        }

        cachedTokenList = data || [];
        renderTokenTable(cachedTokenList);
    } catch (err) {
        console.warn('[HRD Token Exception]', err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-slate-500">Belum ada token yang dibuat.</td></tr>`;
        }
    }
}

function renderTokenTable(tokens) {
    const tbody = document.getElementById('tokenTableBody');
    if (!tbody) return;

    if (!tokens || tokens.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-slate-500">Belum ada token. Silakan klik tombol <strong>+ Buat Token</strong> di atas.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    tokens.forEach((item, idx) => {
        const isTersedia = (item.status || 'tersedia') === 'tersedia';
        const badgeStatus = isTersedia
            ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Tersedia</span>`
            : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400">Sudah Terpakai</span>`;

        const pemakai = item.digunakan_oleh 
            ? `${escapeHtml(item.digunakan_oleh)} ${item.nomor_hp ? `(${escapeHtml(item.nomor_hp)})` : ''}`
            : '-';
        
        const waktuPakai = item.waktu_digunakan
            ? new Date(item.waktu_digunakan).toLocaleString('id-ID')
            : (item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-');

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40 transition";
        tr.innerHTML = `
            <td class="p-2.5 font-mono text-slate-400 font-bold">${idx + 1}</td>
            <td class="p-2.5 font-mono font-black text-amber-400 text-sm tracking-wider uppercase">${escapeHtml(item.token)}</td>
            <td class="p-2.5">${badgeStatus}</td>
            <td class="p-2.5 text-slate-300">${pemakai}</td>
            <td class="p-2.5 text-slate-400">${waktuPakai}</td>
            <td class="p-2.5 text-center">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="copySingleToken('${escapeHtml(item.token)}')" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2.5 py-1 rounded text-xs transition border border-slate-700 flex items-center gap-1 cursor-pointer" title="Salin Kode Token">
                        <i class="fa-solid fa-copy text-[10px]"></i>
                        <span>Salin</span>
                    </button>
                    <button onclick="handleHapusSingleToken('${escapeHtml(item.token)}')" class="bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded text-xs transition border border-rose-800/50 flex items-center gap-1 cursor-pointer" title="Hapus Token Ini">
                        <i class="fa-solid fa-trash-can text-[10px]"></i>
                        <span>Hapus</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function handleBuatTokenHrd() {
    const inputJumlah = document.getElementById('inputJumlahToken');
    const jumlah = inputJumlah ? (parseInt(inputJumlah.value, 10) || 10) : 10;

    const btn = document.getElementById('btnGenerateToken');
    const btnText = document.getElementById('btnGenerateTokenText');
    if (btn) btn.disabled = true;
    if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Membuat...';

    const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
    if (!sb) {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = '+ Buat Token';
        if (typeof customAlert === 'function') {
            customAlert('Koneksi Terputus', 'Koneksi ke database Supabase belum siap.', 'error');
        }
        return;
    }

    try {
        let dibuatCount = 0;
        let rpcSuccess = false;
        try {
            const { data, error } = await sb.rpc('buat_batch_token', { p_jumlah: jumlah });
            if (!error && data) {
                rpcSuccess = true;
                dibuatCount = Array.isArray(data) ? data.length : jumlah;
            }
        } catch (eRpc) {}

        // Fallback langsung jika RPC belum dibuat di database
        if (!rpcSuccess) {
            const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
            const batchTokens = [];
            for (let i = 0; i < jumlah; i++) {
                let tokenStr = '';
                for (let j = 0; j < 5; j++) {
                    tokenStr += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                batchTokens.push({ token: tokenStr, status: 'tersedia' });
            }
            const { error: insErr } = await sb.from('token_ujian').insert(batchTokens);
            if (!insErr) dibuatCount = jumlah;
            else console.warn('[Fallback Insert Token]', insErr.message || insErr);
        }

        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = '+ Buat Token';

        await loadHrdTokens();
        showHrdToast(`Berhasil membuat ${dibuatCount} token baru!`, 'success');
    } catch (err) {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = '+ Buat Token';
        console.error('Gagal generate token:', err);
    }
}

function copySingleToken(token) {
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
        showHrdToast(`Token "${token.toUpperCase()}" berhasil disalin ke clipboard!`, 'success');
    }).catch(() => {
        if (typeof customAlert === 'function') {
            customAlert("Salin Token", `Kode token Anda: ${token.toUpperCase()}`, "info");
        }
    });
}

function handleSalinSemuaToken() {
    const tersediaList = cachedTokenList.filter(t => (t.status || 'tersedia') === 'tersedia');
    if (tersediaList.length === 0) {
        if (typeof customAlert === 'function') {
            customAlert("Tidak Ada Token", "Saat ini tidak ada token yang berstatus 'tersedia'.", "info");
        }
        return;
    }
    const tokenStrings = tersediaList.map(t => t.token.toUpperCase()).join('\n');
    navigator.clipboard.writeText(tokenStrings).then(() => {
        showHrdToast(`${tersediaList.length} token yang tersedia berhasil disalin!`, 'success');
    }).catch(() => {
        if (typeof customAlert === 'function') {
            customAlert("Daftar Token", tokenStrings, "info");
        }
    });
}

async function handleHapusSingleToken(token) {
    if (!token) return;
    const cleanToken = token.trim();

    customAlert(
        "Hapus Token Ujian",
        `Apakah Anda yakin ingin menghapus token "${cleanToken.toUpperCase()}" dari database?`,
        "error",
        true,
        async () => {
            const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
            if (!sb) {
                showHrdToast("Koneksi Supabase tidak tersedia.", "error");
                return;
            }

            try {
                let deleted = false;

                // 1. Coba via RPC jika sudah dipasang di database
                try {
                    const { error: rpcErr } = await sb.rpc('hapus_token_ujian', { p_token: cleanToken });
                    if (!rpcErr) deleted = true;
                } catch (eRpc) {}

                // 2. Direct delete jika RPC belum ada / gagal
                if (!deleted) {
                    const { data, error } = await sb
                        .from('token_ujian')
                        .delete()
                        .ilike('token', cleanToken)
                        .select();

                    if (error) {
                        console.warn('[Hapus Single Token Error]', error);
                        showHrdToast("Gagal menghapus token: " + (error.message || error), "error");
                        return;
                    }
                    if (data && data.length > 0) {
                        deleted = true;
                    }
                }

                // Muat ulang daftar token untuk memverifikasi apakah benar-benar terhapus
                await loadHrdTokens();
                const stillExists = cachedTokenList && cachedTokenList.some(t => (t.token || '').toLowerCase() === cleanToken.toLowerCase());

                if (stillExists) {
                    customAlert(
                        "Penghapusan Ditolak Database",
                        "Database Supabase memblokir penghapusan token karena aturan Row Level Security (RLS). Silakan jalankan query izin DELETE di SQL Editor Supabase.",
                        "error"
                    );
                } else {
                    showHrdToast(`Token "${cleanToken.toUpperCase()}" berhasil dihapus.`, 'success');
                }
            } catch (err) {
                console.error("Gagal menghapus token:", err);
                showHrdToast("Gagal menghapus token: " + (err.message || err), "error");
            }
        }
    );
}

async function handleBersihkanTokenTerpakai() {
    const terpakaiList = cachedTokenList.filter(t => (t.status || 'tersedia') !== 'tersedia');
    if (terpakaiList.length === 0) {
        customAlert("Bersihkan Token", "Saat ini tidak ada token yang berstatus 'Sudah Terpakai'.", "info");
        return;
    }

    customAlert(
        "Bersihkan Token Terpakai",
        `Ditemukan ${terpakaiList.length} token yang sudah terpakai. Apakah Anda yakin ingin MENGHAPUS SEMUA token terpakai tersebut? Token yang masih tersedia tidak akan terhapus.`,
        "error",
        true,
        async () => {
            const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
            if (!sb) {
                showHrdToast("Koneksi Supabase tidak tersedia.", "error");
                return;
            }

            try {
                let rpcOk = false;
                try {
                    const { error: rpcErr } = await sb.rpc('bersihkan_token_terpakai');
                    if (!rpcErr) rpcOk = true;
                } catch (eRpc) {}

                if (!rpcOk) {
                    const { error } = await sb
                        .from('token_ujian')
                        .delete()
                        .neq('status', 'tersedia')
                        .select();

                    if (error) {
                        console.warn('[Hapus Token Terpakai Error]', error);
                        showHrdToast("Gagal membersihkan: " + (error.message || error), "error");
                        return;
                    }
                }

                await loadHrdTokens();
                const remainingTerpakai = cachedTokenList ? cachedTokenList.filter(t => (t.status || 'tersedia') !== 'tersedia').length : 0;
                if (remainingTerpakai > 0) {
                    customAlert(
                        "Penghapusan Ditolak Database",
                        "Database Supabase memblokir penghapusan token karena aturan Row Level Security (RLS). Silakan jalankan query izin DELETE di SQL Editor Supabase.",
                        "error"
                    );
                } else {
                    showHrdToast(`Berhasil membersihkan ${terpakaiList.length} token terpakai!`, 'success');
                }
            } catch (err) {
                console.error("Gagal membersihkan token terpakai:", err);
                showHrdToast("Gagal membersihkan: " + (err.message || err), "error");
            }
        }
    );
}

async function handleHapusSemuaToken() {
    if (!cachedTokenList || cachedTokenList.length === 0) {
        customAlert("Daftar Token Kosong", "Tidak ada token untuk dihapus di database.", "info");
        return;
    }

    const totalToDelete = cachedTokenList.length;

    customAlert(
        "Hapus Seluruh Token",
        `PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA (${totalToDelete}) TOKEN dari database? Tindakan ini permanen dan tidak dapat dibatalkan.`,
        "error",
        true,
        async () => {
            const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
            if (!sb) {
                showHrdToast("Koneksi Supabase tidak tersedia.", "error");
                return;
            }

            try {
                let rpcOk = false;
                // 1. Coba via fungsi RPC khusus jika tersedia
                try {
                    const { error: rpcErr } = await sb.rpc('hapus_semua_token');
                    if (!rpcErr) rpcOk = true;
                } catch (eRpc) {}

                // 2. Direct delete jika RPC belum dibuat
                if (!rpcOk) {
                    const { error } = await sb
                        .from('token_ujian')
                        .delete()
                        .neq('token', '___none___')
                        .select();

                    if (error) {
                        console.warn('[Hapus Semua Token Error]', error);
                        showHrdToast("Gagal menghapus semua: " + (error.message || error), "error");
                        return;
                    }
                }

                await loadHrdTokens();

                // Verifikasi apakah token benar-benar terhapus
                if (cachedTokenList && cachedTokenList.length > 0) {
                    customAlert(
                        "Penghapusan Ditolak Database",
                        "Database Supabase memblokir penghapusan token karena aturan Row Level Security (RLS). Silakan jalankan query izin DELETE di SQL Editor Supabase.",
                        "error"
                    );
                } else {
                    showHrdToast("Semua token berhasil dihapus!", 'success');
                }
            } catch (err) {
                console.error("Gagal menghapus semua token:", err);
                showHrdToast("Gagal menghapus: " + (err.message || err), "error");
            }
        }
    );
}

if (typeof window !== 'undefined') {
    window.handleDirectHrdLogin = handleDirectHrdLogin;
    window.logoutDirectHrd = logoutDirectHrd;
    window.toggleHrdPasswordVisibility = toggleHrdPasswordVisibility;
    window.toggleTokenSection = toggleTokenSection;
    window.loadHrdTokens = loadHrdTokens;
    window.handleBuatTokenHrd = handleBuatTokenHrd;
    window.copySingleToken = copySingleToken;
    window.handleSalinSemuaToken = handleSalinSemuaToken;
    window.handleHapusSingleToken = handleHapusSingleToken;
    window.handleBersihkanTokenTerpakai = handleBersihkanTokenTerpakai;
    window.handleHapusSemuaToken = handleHapusSemuaToken;
    window.handleScoreChange = handleScoreChange;
    window.handleSwChange = handleSwChange;
    window.handleIstIqInputChange = handleIstIqInputChange;
    window.simpanKoreksiIstKeSupabase = simpanKoreksiIstKeSupabase;
    window.renderMsdtResults = renderMsdtResults;

    window.addEventListener('DOMContentLoaded', async () => {
        if (!document.getElementById('hrd-login-view')) return;

        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }

        // Isi otomatis email terakhir jika tersimpan
        const emailInput = document.getElementById('inputHrdEmail');
        if (emailInput) {
            try {
                const savedEmail = localStorage.getItem('altrak_hrd_saved_email');
                if (savedEmail) emailInput.value = savedEmail;
            } catch (e) {}
        }

        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
        if (!sb || !sb.auth) return;
        try {
            const { data } = await sb.auth.getSession();
            if (data && data.session) {
                // Verifikasi status hak akses admin
                const { data: isAdmin, error: adminErr } = await sb.rpc('is_admin');
                if (!adminErr && isAdmin) {
                    isHrdAuthenticated = true;
                    const loginView = document.getElementById('hrd-login-view');
                    if (loginView) loginView.classList.add('hide-section');
                    const dashView = document.getElementById('hrd-dashboard-view');
                    if (dashView) dashView.classList.remove('hide-section');
                    loadHrdData();
                    loadHrdTokens();
                } else {
                    // Sesi ada tetapi bukan admin di admin_users
                    await sb.auth.signOut();
                    isHrdAuthenticated = false;
                }
            }
        } catch (e) {
            console.warn('[HRD Auth] Cek sesi gagal:', e);
        }
    });
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hide-section');
        modal.style.display = 'none';
    }
}
if (typeof window !== 'undefined') {
    window.closeModal = closeModal;
}

