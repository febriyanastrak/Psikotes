// =========================================================================
// UI HELPERS & MODAL HANDLERS
// PT Altrak 1978 - Online Assessment System
// =========================================================================

/**
 * Menyaring string dari karakter berbahaya untuk mencegah serangan XSS
 * @param {any} text Input yang akan disanitasi
 * @returns {string} String aman untuk dirender
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


/**
 * Menampilkan custom alert modal untuk notifikasi atau konfirmasi
 * @param {string} title Judul pesan modal
 * @param {string} message Deskripsi isi pesan
 * @param {'info'|'success'|'error'} type Jenis icon & styling warna modal
 * @param {boolean} isConfirm Jika true, menampilkan tombol batal & konfirmasi
 * @param {Function|null} onOk Callback saat tombol OK ditekan
 * @param {Function|null} onCancel Callback saat tombol Batal ditekan
 */
function customAlert(title, message, type = 'info', isConfirm = false, onOk = null, onCancel = null) {
    const titleEl = document.getElementById('msgTitle');
    const bodyEl = document.getElementById('msgBody');
    const icon = document.getElementById('msgIcon');
    const btnOk = document.getElementById('msgBtnOk');
    const btnCancel = document.getElementById('msgBtnCancel');
    const modalMessage = document.getElementById('modal-message');

    if (!modalMessage) {
        // Fallback jika elemen modal tidak ada di halaman
        if (isConfirm) {
            const result = window.confirm(`${title}\n\n${message}`);
            if (result && onOk) onOk();
            else if (!result && onCancel) onCancel();
        } else {
            window.alert(`${title}\n\n${message}`);
            if (onOk) onOk();
        }
        return;
    }

    if (titleEl) titleEl.innerText = title;
    if (bodyEl) bodyEl.innerText = message;

    if (icon && btnOk) {
        if (type === 'error') {
            icon.className = "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl bg-red-500/10 text-red-400 border border-red-500/20";
            icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            btnOk.className = "w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition";
        } else if (type === 'success') {
            icon.className = "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl bg-green-500/10 text-green-400 border border-green-500/20";
            icon.innerHTML = '<i class="fa-solid fa-check"></i>';
            btnOk.className = "w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition";
        } else {
            icon.className = "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20";
            icon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
            btnOk.className = "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition";
        }
    }

    if (btnCancel && btnOk) {
        if (isConfirm) {
            btnCancel.classList.remove('hide-section');
            btnOk.innerText = "Ya, Lanjutkan";
        } else {
            btnCancel.classList.add('hide-section');
            btnOk.innerText = "Mengerti";
        }

        btnOk.onclick = () => { 
            modalMessage.classList.add('hide-section'); 
            modalMessage.style.display = 'none';
            if (onOk) onOk(); 
        };
        btnCancel.onclick = () => { 
            modalMessage.classList.add('hide-section'); 
            modalMessage.style.display = 'none';
            if (onCancel) onCancel(); 
        };
    }

    modalMessage.classList.remove('hide-section');
    modalMessage.style.display = 'flex';
}

/**
 * Berpindah tampilan antar bagian halaman (SPA router)
 * @param {string} pageId ID elemen section halaman tujuan
 */
function showPage(pageId) {
    if (typeof pindahFase === 'function') {
        pindahFase(pageId);
        return;
    }

    // Keamanan: halaman HRD hanya via autentikasi, tidak bisa diakses langsung
    if ((pageId === 'page-hrd' || pageId === 'view-hrd') && !isHrdAuthenticated) {
        customAlert("Akses Terlarang", "Halaman HRD hanya dapat diakses setelah login terverifikasi.", "error");
        showPage('view-login');
        return;
    }

    document.querySelectorAll('main > section').forEach(el => {
        el.classList.add('hide-section');
        el.style.setProperty('display', 'none', 'important');
    });

    const targetPage = document.getElementById(pageId)
        || document.getElementById(pageId.replace('page-', 'view-'))
        || document.getElementById(pageId.replace('view-', 'page-'));

    if (targetPage) {
        targetPage.classList.remove('hide-section');
        const displayType = (targetPage.id === 'view-dashboard' || targetPage.id === 'view-hrd') ? 'block' : 'flex';
        targetPage.style.setProperty('display', displayType, 'important');
    }
    window.scrollTo(0, 0);
}


/**
 * Menutup modal berdasarkan ID elemen
 * @param {string} id ID elemen modal
 */
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('hide-section');
        el.style.display = '';
    }
}

/**
 * Konfigurasi 8 Modul Asesmen Psikotes PT Altrak 1978 (Sistem Non-Linear / Bebas Pilih)
 */
const ALL_ASSESSMENT_MODULES = [
    { id: 1, key: 'ist', name: 'Inteligent 1 (IST)', flag: 'ist_selesai', btnText: 'Mulai Tes 1' },
    { id: 2, key: 'papi', name: 'PAPI Kostick', flag: 'papi_selesai', btnText: 'Mulai Tes 2' },
    { id: 3, key: 'disc', name: 'DISC Assessment', flag: 'disc_selesai', btnText: 'Mulai Tes 3' },
    { id: 4, key: 'epps', name: 'EPPS', flag: 'epps_selesai', btnText: 'Mulai Tes 4' },
    { id: 5, key: 'pauli', name: 'Pauli (Tes Koran)', flag: 'pauli_selesai', btnText: 'Mulai Tes 5' },
    { id: 6, key: 'msdt', name: 'MSDT (Gaya Kepemimpinan)', flag: 'msdt_selesai', btnText: 'Mulai Tes 6' },
    { id: 7, key: 'cfit', name: 'Inteligent 2 (CFIT)', flag: 'cfit_selesai', btnText: 'Mulai Tes 7' },
    { id: 8, key: 'mbti', name: 'MBTI (Kepribadian)', flag: 'mbti_selesai', btnText: 'Mulai Tes 8' }
];

/**
 * Mengecek apakah modul tertentu sudah selesai dikerjakan
 * @param {number} num Nomor modul (1 s.d 8)
 * @returns {boolean}
 */
function isModuleCompleted(num) {
    if (typeof localStorage === 'undefined') return false;
    if (num === 1) {
        let subtestsSelesai = [];
        try {
            subtestsSelesai = JSON.parse(localStorage.getItem('altrak_ist_completed_subtests') || '[]');
        } catch (e) { subtestsSelesai = []; }
        return localStorage.getItem('ist_selesai') === 'true' || 
               (Array.isArray(subtestsSelesai) && subtestsSelesai.length >= 9) ||
               (typeof istLogic !== 'undefined' && istLogic.completedSubtests && istLogic.completedSubtests.length >= 9);
    }
    if (num === 2) return localStorage.getItem('papi_selesai') === 'true';
    if (num === 3) return localStorage.getItem('disc_selesai') === 'true';
    if (num === 4) return localStorage.getItem('epps_selesai') === 'true';
    if (num === 5) return localStorage.getItem('pauli_selesai') === 'true';
    if (num === 6) return localStorage.getItem('msdt_selesai') === 'true';
    if (num === 7) return localStorage.getItem('cfit_selesai') === 'true';
    if (num === 8) return localStorage.getItem('mbti_selesai') === 'true' || localStorage.getItem('mcmi_selesai') === 'true';
    return false;
}

/**
 * Mengubah status visual kartu modul tes di dashboard (active, done, locked)
 * @param {number} num Nomor tes (1 s.d 8)
 * @param {'active'|'done'|'locked'} stateName Status baru kartu
 */
function setDashCardState(num, stateName) {
    const card = document.getElementById('card-' + num);
    if (!card) return;
    card.classList.remove('is-active', 'is-done', 'is-locked');
    card.classList.add('is-' + stateName);

    const tag = card.querySelector('.dash-tag');
    if (!tag) return;
    const labels = {
        active: ['Siap Dikerjakan', 'tag-active'],
        done: ['Selesai ✓', 'tag-done'],
        locked: ['Terkunci', 'tag-locked']
    };
    tag.classList.remove('tag-active', 'tag-done', 'tag-locked');
    tag.textContent = (labels[stateName] || labels.active)[0];
    tag.classList.add((labels[stateName] || labels.active)[1]);
}

/**
 * Memperbarui progress bar keseluruhan pada dashboard (skala 8 modul)
 */
function updateDashboardProgress() {
    const total = ALL_ASSESSMENT_MODULES.length; // 8 modul
    let done = 0;
    ALL_ASSESSMENT_MODULES.forEach(m => {
        if (isModuleCompleted(m.id)) done++;
    });

    const pct = Math.round((done / total) * 100);
    const fill = document.getElementById('dashProgressFill');
    const label = document.getElementById('dashProgressLabel');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = `${done} / ${total} modul`;

    const btnFinal = document.getElementById('btnSelesaikanSemuaTes');
    if (btnFinal) {
        if (done >= total) {
            btnFinal.innerHTML = '<i class="fa-solid fa-circle-check text-base"></i> Selesaikan & Kunci Seluruh Hasil (100% Selesai)';
        } else {
            btnFinal.innerHTML = `<i class="fa-solid fa-circle-check text-base"></i> Selesaikan & Kunci Lembar Jawaban (${done}/${total} Selesai)`;
        }
    }
    return done;
}

/**
 * Menyinkronkan seluruh 8 kartu modul di dashboard
 * Modul yang belum selesai berstatus aktif (bebas dipilih)
 * Modul yang sudah selesai berstatus selesai (terkunci dengan tanda centang)
 */
function syncAllModuleCardStates() {
    ALL_ASSESSMENT_MODULES.forEach(m => {
        const completed = isModuleCompleted(m.id);
        const card = document.getElementById('card-' + m.id);
        const btn = document.getElementById('btn-test-' + m.id);

        if (completed) {
            setDashCardState(m.id, 'done');
            if (btn) {
                btn.innerText = "Selesai ✓";
                btn.disabled = true;
                btn.className = "dash-btn dash-btn-done";
            }
        } else {
            setDashCardState(m.id, 'active');
            if (btn) {
                btn.innerText = m.btnText || `Mulai Tes ${m.id}`;
                btn.disabled = false;
                btn.className = "dash-btn dash-btn-active";
                btn.onclick = function() { handleStartModule(m.id); };
            }
        }
    });

    updateDashboardProgress();
}

/**
 * Menandai modul selesai dan menyinkronkan dashboard
 * @param {number} completedTestNum Nomor tes yang baru diselesaikan
 */
function unlockDashboardCard(completedTestNum) {
    if (completedTestNum) {
        setDashCardState(completedTestNum, 'done');
        const btnTadi = document.getElementById('btn-test-' + completedTestNum);
        if (btnTadi) {
            btnTadi.innerText = "Selesai ✓";
            btnTadi.disabled = true;
            btnTadi.className = "dash-btn dash-btn-done";
        }
    }
    syncAllModuleCardStates();
}

/**
 * Konfirmasi selesai seluruh rangkaian asesmen
 */
function konfirmasiSelesaiSeluruhAsesmen() {
    const total = ALL_ASSESSMENT_MODULES.length;
    let doneList = [];
    let unDoneList = [];

    ALL_ASSESSMENT_MODULES.forEach(m => {
        if (isModuleCompleted(m.id)) doneList.push(m.name);
        else unDoneList.push(m.name);
    });

    if (unDoneList.length > 0) {
        const pesan = `Anda telah menyelesaikan ${doneList.length} dari ${total} modul asesmen.\n\nModul yang belum diselesaikan:\n- ${unDoneList.join('\n- ')}\n\nApakah Anda yakin ingin mengakhiri sesi dan mengunci seluruh lembar jawaban sekarang?`;
        if (typeof customAlert === 'function') {
            customAlert("Konfirmasi Akhiri Asesmen", pesan, "warning", true, () => {
                tampilkanHalamanSelesai();
            });
        } else if (confirm(pesan)) {
            tampilkanHalamanSelesai();
        }
    } else {
        if (typeof customAlert === 'function') {
            customAlert("Selamat!", "Seluruh 8 modul psikotes PT Altrak 1978 telah berhasil Anda selesaikan secara sempurna.", "success", false, () => {
                tampilkanHalamanSelesai();
            });
        } else {
            alert("Seluruh modul telah selesai!");
            tampilkanHalamanSelesai();
        }
    }
}

/**
 * Mereset dashboard
 */
function resetDashboardState() {
    syncAllModuleCardStates();
}

if (typeof window !== 'undefined') {
    window.ALL_ASSESSMENT_MODULES = ALL_ASSESSMENT_MODULES;
    window.isModuleCompleted = isModuleCompleted;
    window.syncAllModuleCardStates = syncAllModuleCardStates;
    window.unlockDashboardCard = unlockDashboardCard;
    window.updateDashboardProgress = updateDashboardProgress;
    window.resetDashboardState = resetDashboardState;
    window.konfirmasiSelesaiSeluruhAsesmen = konfirmasiSelesaiSeluruhAsesmen;
}

