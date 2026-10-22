// =========================================================================
// SISTEM PENGAWASAN KAMERA WAJIB (MANDATORY) - PT ALTRAK 1978
// =========================================================================

// Variabel global stream kamera
let cameraStream = null;

/**
 * Menampilkan Custom Modal Popup Peringatan Kamera (Menggantikan alert bawaan)
 * @param {string} pesan Teks pesan peringatan
 */
function tampilkanModalKamera(pesan) {
    const modal = document.getElementById('kameraModal');
    const pesanEl = document.getElementById('kameraModalPesan');
    if (pesanEl && pesan) {
        pesanEl.innerHTML = pesan;
    }
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Menutup Custom Modal Popup Peringatan Kamera & coba inisialisasi kamera kembali
 */
function tutupModalKamera() {
    const modal = document.getElementById('kameraModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Picu ulang percobaan aktivasi kamera saat peserta menutup modal
    aktifkanKamera();
}

/**
 * Mengaktifkan kamera secara otomatis saat halaman dimuat atau via pemicu
 */
async function aktifkanKamera() {
    const btnMulai = document.getElementById('btnSubmitLogin');
    const peringatanKamera = document.getElementById('peringatan-kamera');
    const videoEl = document.getElementById('camera-stream');

    try {
        let stream = null;

        // Percobaan 1: Menggunakan ideal constraints
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });
        } catch (strictErr) {
            console.warn('[Kamera] Mode spesifik ditolak, mencoba fallback universal (video: true):', strictErr);
            // Percobaan 2 (Fallback Universal): Kompatibel dengan seluruh webcam laptop & PC desktop
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
        }

        cameraStream = stream;

        // Hubungkan stream ke elemen video latar
        if (videoEl) {
            videoEl.srcObject = cameraStream;
            try {
                await videoEl.play();
            } catch (playErr) {
                console.warn('[Kamera] Play video stream:', playErr);
            }
        }

        // Akses kamera BERHASIL: Hilangkan atribut disabled pada tombol mulai tes dan kosongkan pesan error
        if (btnMulai) {
            btnMulai.removeAttribute('disabled');
            btnMulai.disabled = false;
        }
        if (peringatanKamera) {
            peringatanKamera.innerHTML = '';
            peringatanKamera.style.display = 'none';
        }

        // Tutup modal peringatan kamera jika sedang terbuka
        const modal = document.getElementById('kameraModal');
        if (modal) {
            modal.style.display = 'none';
        }

        console.log('[Kamera] Akses kamera BERHASIL diaktifkan.');
    } catch (err) {
        console.error('[Kamera] Akses kamera DITOLAK atau GAGAL:', err);

        // Akses kamera DITOLAK/GAGAL: Pastikan tombol tetap disabled
        if (btnMulai) {
            btnMulai.setAttribute('disabled', 'true');
            btnMulai.disabled = true;
        }

        // Deteksi pesan penyebab error yang jelas
        let errorDetail = "Izin kamera belum aktif";
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorDetail = "Perangkat fisik kamera/webcam tidak terdeteksi pada PC/Laptop";
        } else if (err.name === 'NotReadableError') {
            errorDetail = "Kamera sedang digunakan oleh aplikasi lain (Zoom/Teams/dll)";
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorDetail = "Izin kamera ditolak di browser";
        }

        // Munculkan teks pemberitahuan peringatan wajib kamera di form login
        if (peringatanKamera) {
            peringatanKamera.innerHTML = `
                <div class="p-3 bg-red-50 border border-red-200 rounded-xl mt-2 text-center">
                    <p class="text-xs text-red-600 font-bold leading-relaxed">
                        <i class="fa-solid fa-triangle-exclamation mr-1"></i>
                        Akses kamera belum aktif (${errorDetail}).<br>
                        Anda WAJIB mengizinkan kamera untuk mengikuti tes.
                    </p>
                </div>
            `;
            peringatanKamera.style.display = 'block';
        }
    }
}

/**
 * Validasi ganda & pengambilan foto kandidat ke folder terstruktur di Supabase
 * @param {string} emailKandidat Email atau identifier peserta
 * @param {string} [namaFolderTes] Nama folder pengelompokan (contoh: 'IST', 'PAPI', 'DISC', 'PAULI')
 * @param {string} [namaSubtes] Nama atau label subtes (contoh: 'Subtes-1', 'Subtes-2', dll)
 * @param {string} [faseWaktu] Fase pengambilan foto ('Awal', 'Tengah', 'Akhir')
 */
async function jepretDanUpload(emailKandidat, namaFolderTes = 'IST', namaSubtes = 'Subtes-1', faseWaktu = 'Awal') {
    // Validasi Ganda di baris paling atas: Jika stream kosong/null, tolak via Custom Modal Popup
    if (!cameraStream || !cameraStream.active) {
        // Tampilkan Custom Modal Popup menggantikan alert bawaan browser
        tampilkanModalKamera("Akses kamera ditolak atau tidak aktif! Anda WAJIB mengizinkan akses kamera untuk mengikuti tes psikotes ini.");
        
        const peringatanKamera = document.getElementById('peringatan-kamera');
        if (peringatanKamera) {
            peringatanKamera.style.display = 'block';
        }
        return false;
    }

    try {
        const videoEl = document.getElementById('camera-stream');
        const canvasEl = document.getElementById('camera-canvas') || document.createElement('canvas');

        if (!videoEl || videoEl.videoWidth === 0) {
            console.warn('[Kamera] Video element belum siap.');
            return true;
        }

        canvasEl.width = videoEl.videoWidth || 640;
        canvasEl.height = videoEl.videoHeight || 480;
        const ctx = canvasEl.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

        const dataUrl = canvasEl.toDataURL('image/jpeg', 0.85);
        // Cegah QuotaExceededError (5MB): Jangan simpan Base64 gambar besar ke localStorage.
        try { localStorage.removeItem('kandidat_snapshot_login'); } catch (e) {}

        // Jika Supabase storage tersedia, upload snapshot ke folder di bucket foto_kandidat
        let sbClient = (window.supabase && typeof window.supabase.storage !== 'undefined')
            ? window.supabase
            : (typeof supabase !== 'undefined' && supabase && typeof supabase.storage !== 'undefined' ? supabase : null);

        if (!sbClient || !sbClient.storage) {
            const sbUrl = window.SUPABASE_URL || '';
            const sbKey = window.SUPABASE_KEY || '';
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                try {
                    sbClient = window.supabase.createClient(sbUrl, sbKey);
                    window.supabase = sbClient;
                } catch (initErr) {
                    console.warn('[Kamera] Inisialisasi fallback Supabase:', initErr);
                }
            } else if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.storage) {
                sbClient = supabaseClient;
            }
        }

        if (sbClient && sbClient.storage) {
            // Konversi aman dataUrl (base64) ke Blob tanpa fetch (mencegah pelanggaran CSP)
            let blob;
            try {
                const byteCharacters = atob(dataUrl.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: 'image/jpeg' });
            } catch (convErr) {
                console.warn('[Kamera] Gagal konversi base64 ke blob:', convErr);
                return true;
            }
            const folder = (namaFolderTes || 'IST').trim();
            const subtes = (namaSubtes || 'Subtes-1').trim().replace(/\s+/g, '-');
            const fase = (faseWaktu || 'Awal').trim();

            // 1. Identifikasi Candidate ID (UUID atau ID unik peserta) - Hindari nomor telepon / email
            let candidateId = '';
            try {
                if (typeof localStorage !== 'undefined') {
                    candidateId = (localStorage.getItem('id_peserta') || '').toString().trim();
                }
                if (!candidateId && typeof state !== 'undefined' && state.user && state.user.id) {
                    candidateId = state.user.id.toString().trim();
                }
            } catch (eId) {}

            // Fallback: Jika ID belum tersimpan, buat UUID acak agar privasi tetap terjaga
            if (!candidateId) {
                candidateId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
                    ? crypto.randomUUID()
                    : 'kandidat-' + Math.random().toString(36).substring(2, 12);
                try {
                    if (typeof localStorage !== 'undefined' && !localStorage.getItem('id_peserta')) {
                        localStorage.setItem('id_peserta', candidateId);
                    }
                } catch (eSet) {}
            }

            const safeCandidateId = candidateId.replace(/[^a-zA-Z0-9_-]/g, '_');

            // 2. Buat random UUID untuk nama file foto agar unik dan mencegah enumeration
            const randomSuffix = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : (Date.now().toString(36) + Math.random().toString(36).substring(2, 8));

            // Format tanggal & waktu: YYYY-MM-DD_HH-mm-ss
            const d = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const waktuStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;

            // Format nama file: {folder}_{subtes}_{fase}_{waktuStr}_{randomUUID}.jpg
            // Simpan di subfolder per ID kandidat di dalam folder tes: {folder}/{safeCandidateId}/{fileName}
            const fileName = `${folder}_${subtes}_${fase}_${waktuStr}_${randomSuffix}.jpg`;
            const filePath = `${folder}/${safeCandidateId}/${fileName}`;

            // Simpan jejak metadata foto (hanya path & info tes, TANPA public URL & TANPA PII telepon/email)
            try {
                let fotoList = JSON.parse(localStorage.getItem('kandidat_foto_pengawasan') || '[]');
                fotoList.push({
                    candidateId: safeCandidateId,
                    folder,
                    subtes: (namaSubtes || 'Subtes 1').replace(/-/g, ' '),
                    fase,
                    waktu: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
                    fileName,
                    filePath,
                    path: filePath
                });
                localStorage.setItem('kandidat_foto_pengawasan', JSON.stringify(fotoList));
            } catch (eStorage) {}

            sbClient.storage.from('foto_kandidat').upload(filePath, blob, {
                contentType: 'image/jpeg'
            }).then(({ data, error }) => {
                if (error) {
                    console.warn(`[Kamera] Respon upload Supabase (${filePath}):`, error.message || error);
                } else {
                    console.log(`[Kamera] Foto berhasil terkirim ke path ${filePath}:`, data);
                }
            }).catch(e => console.warn('[Kamera] Upload snapshot background:', e));
        }

        return true;
    } catch (e) {
        console.warn('[Kamera] Gagal jepret:', e);
        return true;
    }
}

function makeProctoringCameraDraggable(container) {
    if (!container || container.dataset.draggableInitialized === 'true') return;
    container.dataset.draggableInitialized = 'true';

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    container.style.touchAction = 'none';

    const onPointerDown = (e) => {
        // Hanya respons terhadap tombol utama (left click / touch)
        if (e.button !== undefined && e.button !== 0) return;

        isDragging = true;
        container.style.cursor = 'grabbing';
        container.style.transition = 'none';

        // Konversi koordinat bottom/right CSS default ke koordinat absolut left/top pada layar
        const rect = container.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        container.style.bottom = 'auto';
        container.style.right = 'auto';
        container.style.left = `${initialLeft}px`;
        container.style.top = `${initialTop}px`;

        startX = e.clientX;
        startY = e.clientY;

        try {
            container.setPointerCapture(e.pointerId);
        } catch (err) {}

        e.preventDefault();
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        // Batasi di dalam batas layar (viewport) agar kamera tidak keluar jendela browser (HP, Tab, Desktop)
        const pad = 8;
        const maxLeft = Math.max(pad, window.innerWidth - container.offsetWidth - pad);
        const maxTop = Math.max(pad, window.innerHeight - container.offsetHeight - pad);

        newLeft = Math.max(pad, Math.min(newLeft, maxLeft));
        newTop = Math.max(pad, Math.min(newTop, maxTop));

        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`;

        e.preventDefault();
    };

    const onPointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        container.style.cursor = 'grab';
        try {
            container.releasePointerCapture(e.pointerId);
        } catch (err) {}
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    // Antisipasi resize layar (misal rotasi HP atau ubah ukuran browser)
    window.addEventListener('resize', () => {
        if (container.style.left && container.style.display !== 'none') {
            const rect = container.getBoundingClientRect();
            const pad = 8;
            const maxLeft = Math.max(pad, window.innerWidth - container.offsetWidth - pad);
            const maxTop = Math.max(pad, window.innerHeight - container.offsetHeight - pad);
            if (rect.left > maxLeft) container.style.left = `${maxLeft}px`;
            if (rect.top > maxTop) container.style.top = `${maxTop}px`;
        }
    });
}

function startProctoringCamera() {
    // Kunci Ketat: Floating live camera HANYA diizinkan menyala pada IST Subtes 09 (Mengingat Kata)
    const isSubtes09 = typeof istLogic !== 'undefined' && 
                       Number(istLogic.currentSubtestNo) === 9 && 
                       (istLogic.fase === 'CONTOH' || istLogic.fase === 'UJIAN') &&
                       !istLogic.isUjianTerkunci;

    if (!isSubtes09) {
        stopProctoringCamera();
        return;
    }

    const container = document.getElementById('proctoring-camera-container');
    const video = document.getElementById('proctoringVideo');
    const fallback = document.getElementById('cameraStatusFallback');

    if (container) {
        container.classList.remove('hide-section');
        container.style.setProperty('display', 'block', 'important');
        container.style.setProperty('pointer-events', 'auto', 'important');
        makeProctoringCameraDraggable(container);
    }
    if (video && typeof cameraStream !== 'undefined' && cameraStream && cameraStream.active) {
        video.srcObject = cameraStream;
        video.play().catch(e => console.warn('[Proctoring] Play video:', e));
        if (fallback) fallback.style.display = 'none';
    }
}

function stopProctoringCamera() {
    const container = document.getElementById('proctoring-camera-container');
    const video = document.getElementById('proctoringVideo');

    if (container) {
        container.classList.add('hide-section');
        container.style.setProperty('display', 'none', 'important');
        container.style.setProperty('pointer-events', 'none', 'important');
    }
    if (video) {
        video.srcObject = null;
        try { video.pause(); } catch (e) {}
    }
}

// Jalankan fungsi aktifkanKamera() secara otomatis saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
    aktifkanKamera();
    const container = document.getElementById('proctoring-camera-container');
    if (container) makeProctoringCameraDraggable(container);
});

// Daftarkan fungsi ke window
window.aktifkanKamera = aktifkanKamera;
window.jepretDanUpload = jepretDanUpload;
window.tampilkanModalKamera = tampilkanModalKamera;
window.tutupModalKamera = tutupModalKamera;
window.startProctoringCamera = startProctoringCamera;
window.stopProctoringCamera = stopProctoringCamera;
window.makeProctoringCameraDraggable = makeProctoringCameraDraggable;

