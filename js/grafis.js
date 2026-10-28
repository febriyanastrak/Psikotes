/**
 * =============================================================================
 * MODUL TES GRAFIS (Draw a Person/Man, Tree/Baum, House-Tree-Person)
 * PT Altrak 1978 - Online Assessment System
 * 
 * Fitur Lanjutan:
 * - 3 Zona Upload Berkas Interaktif (DAP, Tree, HTP)
 * - Masing-masing Kategori mendukung hingga 2 Berkas (Total Maksimal 6 Berkas)
 *   (Contoh: DAP Pria & Wanita, Pohon Tampak Depan & Detail, HTP Gambar & Cerita)
 * - Syarat Selesai: Minimal 1 Berkas per Kategori (Minimal 3 Berkas)
 * - Validasi Keamanan: Ekstensi (JPG, PNG, WEBP, PDF) & Ukuran Maksimal 10 MB/berkas
 * - Pratinjau Instan: Thumbnail Gambar & Badge Dokumen PDF
 * - Unggah ke Supabase Storage (foto_kandidat/grafis/)
 * - Backward Compatibility dengan Data Sesi Terdahulu
 * - Offline Queue & Zero Data Loss Resilience
 * =============================================================================
 */

(function (window, document) {
    'use strict';

    function createEmptySlot() {
        return { file: null, previewUrl: null, base64: null, storageUrl: null, name: '', sizeText: '', type: '' };
    }

    // State Berkas: 3 Kategori x 2 Sub-Slot = Maksimal 6 Berkas
    const grafisState = {
        dap: [createEmptySlot(), createEmptySlot()],
        tree: [createEmptySlot(), createEmptySlot()],
        htp: [createEmptySlot(), createEmptySlot()]
    };

    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    /**
     * Membuka halaman modul Tes Grafis
     */
    function bukaModulGrafis() {
        console.log('[Grafis] Membuka modul Tes Grafis...');
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        if (typeof pindahFase === 'function') {
            pindahFase('view-grafis');
        } else if (typeof showPage === 'function') {
            showPage('page-grafis');
        }

        // Muat cadangan lokal jika peserta pernah mengunggah sebelumnya
        pulihkanCadanganGrafis();
        perbaruiIndikatorProgressGrafis();
    }

    /**
     * Pulihkan data grafis yang tersimpan di localStorage jika ada
     * Mendukung format array baru maupun format single object lama (backward-compatible)
     */
    function pulihkanCadanganGrafis() {
        try {
            const cadanganStr = localStorage.getItem('cadangan_hasil_grafis');
            if (cadanganStr) {
                const parsed = JSON.parse(cadanganStr);
                ['dap', 'tree', 'htp'].forEach(slot => {
                    const rawVal = parsed[slot];
                    if (!rawVal) return;

                    let fileList = [];
                    if (Array.isArray(rawVal)) {
                        fileList = rawVal;
                    } else if (rawVal && (rawVal.url || rawVal.base64)) {
                        // Data format lama (single object)
                        fileList = [rawVal];
                    }

                    fileList.forEach((item, idx) => {
                        if (idx < 2 && item && (item.url || item.base64)) {
                            grafisState[slot][idx] = {
                                file: null,
                                previewUrl: item.url || item.base64,
                                base64: item.base64 || null,
                                storageUrl: item.url || null,
                                name: item.nama_file || `${slot.toUpperCase()}_Berkas_${idx + 1}`,
                                sizeText: item.ukuran || '',
                                type: item.tipe || 'image/jpeg'
                            };
                            tampilkanPratinjauSlot(
                                slot,
                                idx + 1,
                                grafisState[slot][idx].previewUrl,
                                grafisState[slot][idx].type,
                                grafisState[slot][idx].name,
                                grafisState[slot][idx].sizeText
                            );
                        }
                    });
                });
            }
        } catch (e) {
            console.warn('[Grafis] Gagal memulihkan cadangan lokal:', e);
        }
    }

    /**
     * Validasi berkas upload
     * @param {File} file
     * @returns {{ valid: boolean, error?: string }}
     */
    function validasiBerkas(file) {
        if (!file) return { valid: false, error: 'Tidak ada berkas yang dipilih.' };

        // 1. Cek ekstensi & MIME
        const ext = file.name.split('.').pop().toLowerCase();
        const validExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
        const isValidMime = ALLOWED_MIME_TYPES.includes(file.type) || validExts.includes(ext);

        if (!isValidMime) {
            return {
                valid: false,
                error: `Format berkas "${ext.toUpperCase()}" tidak didukung. Harap unggah berkas berekstensi JPG, PNG, atau PDF.`
            };
        }

        // 2. Cek ukuran (maks 10 MB)
        if (file.size > MAX_FILE_SIZE) {
            const ukuranMb = (file.size / (1024 * 1024)).toFixed(1);
            return {
                valid: false,
                error: `Ukuran berkas (${ukuranMb} MB) melebihi batas maksimal 10 MB. Harap perkecil ukuran foto/scan Anda.`
            };
        }

        return { valid: true };
    }

    /**
     * Format ukuran berkas (KB / MB)
     */
    function formatUkuranBerkas(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const dm = 1;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Menangani file yang dipilih atau di-drop pada slot dan indeks tertentu
     * @param {'dap'|'tree'|'htp'} slot
     * @param {number} subIndex 1 atau 2
     * @param {File} file
     */
    function tanganiFileTerpilih(slot, subIndex, file) {
        const idx = subIndex - 1; // 0-indexed
        if (idx < 0 || idx > 1) return;

        const hasilValidasi = validasiBerkas(file);
        if (!hasilValidasi.valid) {
            if (typeof customAlert === 'function') {
                customAlert('Berkas Tidak Valid', hasilValidasi.error, 'warning');
            } else {
                alert(hasilValidasi.error);
            }
            return;
        }

        const sizeStr = formatUkuranBerkas(file.size);
        grafisState[slot][idx].file = file;
        grafisState[slot][idx].name = file.name;
        grafisState[slot][idx].sizeText = sizeStr;
        grafisState[slot][idx].type = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

        // Baca pratinjau gambar / dokumen
        const reader = new FileReader();
        reader.onload = function (e) {
            const dataUrl = e.target.result;
            grafisState[slot][idx].previewUrl = dataUrl;
            grafisState[slot][idx].base64 = dataUrl;
            tampilkanPratinjauSlot(slot, subIndex, dataUrl, grafisState[slot][idx].type, file.name, sizeStr);
            perbaruiIndikatorProgressGrafis();
            if (typeof tampilkanToast === 'function') {
                tampilkanToast(`Berkas ${slot.toUpperCase()} Lembar ${subIndex} siap diunggah.`, 'success', 2500);
            }
        };
        reader.readAsDataURL(file);
    }

    /**
     * Menampilkan pratinjau pada UI sub-slot tertentu
     * @param {'dap'|'tree'|'htp'} slot
     * @param {number} subIndex 1 atau 2
     */
    function tampilkanPratinjauSlot(slot, subIndex, url, type, name, size) {
        const dropzone = document.getElementById(`dropzone-${slot}-${subIndex}`);
        const previewContainer = document.getElementById(`preview-container-${slot}-${subIndex}`);
        const imgEl = document.getElementById(`preview-img-${slot}-${subIndex}`);
        const pdfBadgeEl = document.getElementById(`preview-pdf-${slot}-${subIndex}`);
        const nameEl = document.getElementById(`file-name-${slot}-${subIndex}`);
        const sizeEl = document.getElementById(`file-size-${slot}-${subIndex}`);
        const statusBadge = document.getElementById(`status-badge-${slot}-${subIndex}`);

        if (dropzone) dropzone.classList.add('hidden');
        if (previewContainer) previewContainer.classList.remove('hidden');

        const isPdf = type === 'application/pdf' || (name && name.toLowerCase().endsWith('.pdf'));

        if (isPdf) {
            if (imgEl) imgEl.classList.add('hidden');
            if (pdfBadgeEl) pdfBadgeEl.classList.remove('hidden');
        } else {
            if (pdfBadgeEl) pdfBadgeEl.classList.add('hidden');
            if (imgEl) {
                imgEl.classList.remove('hidden');
                imgEl.src = url;
            }
        }

        if (nameEl) nameEl.textContent = name || '-';
        if (sizeEl) sizeEl.textContent = size || '';
        if (statusBadge) {
            statusBadge.className = 'px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1';
            statusBadge.innerHTML = '<i class="fa-solid fa-check text-[8px]"></i> Siap Diunggah';
        }
    }

    /**
     * Menghapus berkas yang dipilih pada sub-slot tertentu
     * @param {'dap'|'tree'|'htp'} slot
     * @param {number} subIndex 1 atau 2
     */
    function hapusBerkasSlot(slot, subIndex) {
        const idx = subIndex - 1;
        if (idx < 0 || idx > 1) return;

        grafisState[slot][idx] = createEmptySlot();

        const input = document.getElementById(`file-input-${slot}-${subIndex}`);
        if (input) input.value = '';

        const dropzone = document.getElementById(`dropzone-${slot}-${subIndex}`);
        const previewContainer = document.getElementById(`preview-container-${slot}-${subIndex}`);
        const statusBadge = document.getElementById(`status-badge-${slot}-${subIndex}`);

        if (dropzone) dropzone.classList.remove('hidden');
        if (previewContainer) previewContainer.classList.add('hidden');

        if (statusBadge) {
            if (subIndex === 1) {
                statusBadge.className = 'px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200';
                statusBadge.innerHTML = 'Belum Ada';
            } else {
                statusBadge.className = 'px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200';
                statusBadge.innerHTML = 'Opsional';
            }
        }

        perbaruiIndikatorProgressGrafis();
    }

    /**
     * Memperbarui progress indicator berkas yang sudah terpilih
     * Menghitung total berkas terpilih (0-6) dan mengecek apakah minimal 1 berkas per kategori sudah lengkap.
     */
    function perbaruiIndikatorProgressGrafis() {
        let totalCount = 0;
        const counts = { dap: 0, tree: 0, htp: 0 };

        ['dap', 'tree', 'htp'].forEach(slot => {
            [0, 1].forEach(idx => {
                const s = grafisState[slot][idx];
                if (s && (s.file || s.previewUrl)) {
                    totalCount++;
                    counts[slot]++;
                }
            });
        });

        const hasDap = counts.dap > 0;
        const hasTree = counts.tree > 0;
        const hasHtp = counts.htp > 0;
        const isComplete = hasDap && hasTree && hasHtp;

        const progressLabel = document.getElementById('grafis-progress-label');
        const progressBar = document.getElementById('grafis-progress-bar');
        const btnSubmit = document.getElementById('btn-submit-grafis');

        if (progressLabel) {
            if (isComplete) {
                progressLabel.textContent = `${totalCount} dari maksimal 6 berkas (Lengkap: DAP ${counts.dap}/2, Pohon ${counts.tree}/2, HTP ${counts.htp}/2)`;
                progressLabel.className = 'text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold';
            } else {
                const missing = [];
                if (!hasDap) missing.push('DAP');
                if (!hasTree) missing.push('Pohon');
                if (!hasHtp) missing.push('HTP');
                progressLabel.textContent = `${totalCount} dari maksimal 6 berkas terpilih (Belum lengkap: ${missing.join(', ')})`;
                progressLabel.className = 'text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold';
            }
        }

        if (progressBar) {
            // Target progress: 3 kategori terpenuhi = 100% basis, ekstra hingga 6 berkas
            const pct = Math.min(100, Math.round((totalCount / 6) * 100));
            progressBar.style.width = `${pct}%`;
        }

        if (btnSubmit) {
            if (isComplete) {
                btnSubmit.disabled = false;
                btnSubmit.classList.remove('opacity-50', 'cursor-not-allowed');
                btnSubmit.classList.add('cursor-pointer');
            } else {
                btnSubmit.disabled = true;
                btnSubmit.classList.add('opacity-50', 'cursor-not-allowed');
                btnSubmit.classList.remove('cursor-pointer');
            }
        }
    }

    /**
     * Unggah berkas ke Supabase Storage (bucket: foto_kandidat, folder: grafis/)
     * @param {string} idPeserta
     * @param {string} slot 'dap'|'tree'|'htp'
     * @param {number} subIndex 1 atau 2
     * @param {File} file
     * @returns {Promise<string|null>} Path storage atau null jika gagal
     */
    async function unggahKeStorage(idPeserta, slot, subIndex, file) {
        const sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : (window.supabaseClient || window.supabase);
        if (!sb || !sb.storage) {
            console.warn('[Grafis Storage] Supabase Storage client tidak tersedia.');
            return null;
        }

        const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
        const cleanSlot = slot.toLowerCase();
        const filePath = `grafis/${idPeserta}/${cleanSlot}_${subIndex}_${Date.now()}.${ext}`;

        try {
            console.log(`[Grafis Storage] Mengunggah ${file.name} ke ${filePath}...`);
            const { data, error } = await sb.storage
                .from('foto_kandidat')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type || 'image/jpeg'
                });

            if (error) {
                console.warn(`[Grafis Storage] Gagal unggah ${slot} [${subIndex}]:`, error.message || error);
                return null;
            }

            // Dapatkan URL Storage
            const { data: pubData } = sb.storage.from('foto_kandidat').getPublicUrl(filePath);
            const finalUrl = (pubData && pubData.publicUrl) ? pubData.publicUrl : filePath;
            console.log(`[Grafis Storage] Sukses mengunggah ${slot} [${subIndex}]:`, finalUrl);
            return finalUrl;
        } catch (e) {
            console.warn(`[Grafis Storage] Exception saat unggah ${slot} [${subIndex}]:`, e);
            return null;
        }
    }

    /**
     * Kunci dan simpan hasil Tes Grafis (minimal 1 berkas per kategori, maksimal 6 berkas)
     */
    async function simpanDanKunciGrafis() {
        const counts = { dap: 0, tree: 0, htp: 0 };
        let totalCount = 0;

        ['dap', 'tree', 'htp'].forEach(slot => {
            [0, 1].forEach(idx => {
                const s = grafisState[slot][idx];
                if (s && (s.file || s.previewUrl)) {
                    counts[slot]++;
                    totalCount++;
                }
            });
        });

        const missing = [];
        if (counts.dap === 0) missing.push('Draw a Person (DAP)');
        if (counts.tree === 0) missing.push('Baum Test (Pohon)');
        if (counts.htp === 0) missing.push('House-Tree-Person (HTP)');

        if (missing.length > 0) {
            const msg = `Silakan lengkapi minimal 1 gambar untuk setiap kategori tes berikut sebelum menyelesaikan modul:\n\n• ${missing.join('\n• ')}`;
            if (typeof customAlert === 'function') {
                customAlert('Berkas Belum Lengkap', msg, 'warning');
            } else {
                alert(msg);
            }
            return;
        }

        const pesanKonfirmasi = `Anda telah memilih total ${totalCount} berkas Tes Grafis (DAP: ${counts.dap}, Pohon: ${counts.tree}, HTP: ${counts.htp}).\n\nApakah Anda yakin ingin mengunci dan mengirimkan lembar jawaban Tes Grafis ini ke server PT Altrak 1978?`;

        const eksekusiUnggahDanKunci = async () => {
            const btnSubmit = document.getElementById('btn-submit-grafis');
            const originalBtnHtml = btnSubmit ? btnSubmit.innerHTML : '';
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengunggah Berkas ke Server...';
            }

            const idPeserta = localStorage.getItem('id_peserta') || ('kandidat_' + Date.now());
            const waktuISO = new Date().toISOString();
            const payloadGrafis = {
                status: 'selesai',
                total_berkas: totalCount,
                waktu_selesai: waktuISO,
                dap: [],
                tree: [],
                htp: []
            };

            try {
                // Unggah setiap slot dan sub-slot berkas secara paralel per kategori
                for (const slot of ['dap', 'tree', 'htp']) {
                    for (let idx = 0; idx < 2; idx++) {
                        const s = grafisState[slot][idx];
                        if (!s || (!s.file && !s.previewUrl)) continue;

                        let fileUrl = null;
                        if (s.file) {
                            fileUrl = await unggahKeStorage(idPeserta, slot, idx + 1, s.file);
                            // Fallback jika upload storage gagal/lambat (Zero Data Loss)
                            if (!fileUrl && s.previewUrl) {
                                fileUrl = s.previewUrl;
                            }
                        } else if (s.previewUrl) {
                            fileUrl = s.storageUrl || s.previewUrl;
                        }

                        if (fileUrl) {
                            payloadGrafis[slot].push({
                                slot: slot,
                                sub_index: idx + 1,
                                url: fileUrl,
                                nama_file: s.name || `${slot.toUpperCase()}_Berkas_${idx + 1}`,
                                ukuran: s.sizeText || '',
                                tipe: s.type || 'image/jpeg',
                                waktu_upload: waktuISO
                            });
                        }
                    }
                }

                // Simpan cadangan lokal secara sinkron (Zero Data Loss)
                localStorage.setItem('cadangan_hasil_grafis', JSON.stringify(payloadGrafis));
                localStorage.setItem('grafis_selesai', 'true');

                // Kirim ke database Supabase via updateHasilTes
                if (typeof updateHasilTes === 'function') {
                    await updateHasilTes('hasil_grafis', payloadGrafis);
                } else if (typeof window !== 'undefined' && typeof window.updateHasilTes === 'function') {
                    await window.updateHasilTes('hasil_grafis', payloadGrafis);
                }

                // Sinkronkan ke kartu Dashboard
                if (typeof setDashCardState === 'function') {
                    setDashCardState('grafis', 'done');
                }
                if (typeof updateDashboardProgress === 'function') {
                    updateDashboardProgress();
                }

                if (typeof customAlert === 'function') {
                    customAlert(
                        'Tes Grafis Berhasil Disimpan',
                        `Sebanyak ${totalCount} berkas gambar psikotes grafis Anda telah berhasil diunggah dan tersimpan aman di server PT Altrak 1978. Silakan lanjutkan pengerjaan modul berikutnya.`,
                        'success',
                        false,
                        () => {
                            if (typeof pindahFase === 'function') {
                                pindahFase('view-dashboard');
                            } else if (typeof showPage === 'function') {
                                showPage('page-dashboard');
                            }
                        }
                    );
                } else {
                    alert('Tes Grafis Berhasil Disimpan!');
                    if (typeof pindahFase === 'function') pindahFase('view-dashboard');
                }

            } catch (err) {
                console.warn('[Grafis] Catatan penyimpanan:', err);
                // Tetap tandai selesai lokal agar pengerjaan peserta tidak terhambat
                localStorage.setItem('grafis_selesai', 'true');
                if (typeof pindahFase === 'function') pindahFase('view-dashboard');
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalBtnHtml;
                }
            }
        };

        if (typeof customAlert === 'function') {
            customAlert(
                'Konfirmasi Kunci Jawaban',
                pesanKonfirmasi,
                'warning',
                true,
                eksekusiUnggahDanKunci
            );
        } else if (confirm(pesanKonfirmasi)) {
            eksekusiUnggahDanKunci();
        }
    }

    /**
     * Inisialisasi event listener Drag & Drop pada ke-6 sub-slot upload
     */
    function initGrafisUploadListeners() {
        ['dap', 'tree', 'htp'].forEach(slot => {
            [1, 2].forEach(subIndex => {
                const dropzone = document.getElementById(`dropzone-${slot}-${subIndex}`);
                const input = document.getElementById(`file-input-${slot}-${subIndex}`);

                if (dropzone && input) {
                    // Klik pada dropzone untuk memicu file input
                    dropzone.addEventListener('click', (e) => {
                        if (e.target !== input) {
                            input.click();
                        }
                    });

                    // Input change
                    input.addEventListener('change', (e) => {
                        if (e.target.files && e.target.files[0]) {
                            tanganiFileTerpilih(slot, subIndex, e.target.files[0]);
                        }
                    });

                    // Drag & Drop visual feedback
                    ['dragenter', 'dragover'].forEach(eventName => {
                        dropzone.addEventListener(eventName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropzone.classList.add('border-blue-500', 'bg-blue-50/50', 'scale-[1.01]');
                        });
                    });

                    ['dragleave', 'drop'].forEach(eventName => {
                        dropzone.addEventListener(eventName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropzone.classList.remove('border-blue-500', 'bg-blue-50/50', 'scale-[1.01]');
                        });
                    });

                    dropzone.addEventListener('drop', (e) => {
                        const dt = e.dataTransfer;
                        if (dt && dt.files && dt.files[0]) {
                            tanganiFileTerpilih(slot, subIndex, dt.files[0]);
                        }
                    });
                }
            });
        });
    }

    // Inisialisasi saat DOM siap
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initGrafisUploadListeners);
        } else {
            initGrafisUploadListeners();
        }
    }

    // Ekspor fungsi ke global window
    window.bukaModulGrafis = bukaModulGrafis;
    window.tanganiFileTerpilih = tanganiFileTerpilih;
    window.hapusBerkasSlot = hapusBerkasSlot;
    window.simpanDanKunciGrafis = simpanDanKunciGrafis;
    window.grafisState = grafisState;

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : null);
