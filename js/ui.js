// =========================================================================
// UI HELPERS & MODAL HANDLERS
// PT Altrak 1978 - Online Assessment System
// =========================================================================

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
            if (onOk) onOk(); 
        };
        btnCancel.onclick = () => { 
            modalMessage.classList.add('hide-section'); 
            if (onCancel) onCancel(); 
        };
    }

    modalMessage.classList.remove('hide-section');
}

/**
 * Berpindah tampilan antar bagian halaman (SPA router)
 * @param {string} pageId ID elemen section halaman tujuan
 */
function showPage(pageId) {
    if (pageId === 'page-hrd' && !isHrdAuthenticated) {
        customAlert("Akses Terlarang", "Halaman HRD hanya dapat diakses setelah login terverifikasi.", "error");
        showPage('page-login');
        return;
    }
    
    document.querySelectorAll('main > section').forEach(el => el.classList.add('hide-section'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hide-section');
    }
    window.scrollTo(0, 0);
}

/**
 * Menutup modal berdasarkan ID elemen
 * @param {string} id ID elemen modal
 */
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hide-section');
}

/**
 * Mengubah status kartu modul tes di dashboard (active, done, locked)
 * @param {number} num Nomor tes (1 s.d 4)
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
        active: ['Sedang berlangsung', 'tag-active'],
        done: ['Selesai', 'tag-done'],
        locked: ['Terkunci', 'tag-locked']
    };
    tag.classList.remove('tag-active', 'tag-done', 'tag-locked');
    tag.textContent = labels[stateName][0];
    tag.classList.add(labels[stateName][1]);
}

/**
 * Memperbarui progress bar keseluruhan pada dashboard
 */
function updateDashboardProgress() {
    const total = 4;
    const done = document.querySelectorAll('#page-dashboard .dash-card.is-done').length;
    const pct = (done / total) * 100;
    const fill = document.getElementById('dashProgressFill');
    const label = document.getElementById('dashProgressLabel');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = done + ' / ' + total + ' modul';
}

/**
 * Membuka kunci kartu tes berikutnya saat suatu tes selesai
 * @param {number} completedTestNum Nomor tes yang baru diselesaikan
 */
function unlockDashboardCard(completedTestNum) {
    const btnTadi = document.getElementById('btn-test-' + completedTestNum);
    if (btnTadi) {
        btnTadi.innerText = "Selesai";
        btnTadi.disabled = true;
        btnTadi.className = "dash-btn dash-btn-done";
    }
    setDashCardState(completedTestNum, 'done');

    const nextTestNum = completedTestNum + 1;
    const btnNext = document.getElementById('btn-test-' + nextTestNum);
    const cardNext = document.getElementById('card-' + nextTestNum);

    if (btnNext && cardNext) {
        setDashCardState(nextTestNum, 'active');
        btnNext.innerText = "Mulai Tes " + nextTestNum;
        btnNext.disabled = false;
        btnNext.className = "dash-btn dash-btn-active";
    }

    updateDashboardProgress();
}
