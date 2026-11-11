// =========================================================================
// ANTARMUKA & RENDERING UI IST - INTELLIGENZ STRUKTUR TEST
// PT Altrak 1978 - Online Assessment System
// Aturan: Penamaan resmi hanya Soal 01 s/d Soal 09, waktu tersembunyi, layout 2 baris
// =========================================================================

const istUI = {
    /**
     * Mengambil elemen kontainer panggung utama IST
     */
    getContainer() {
        return document.getElementById('ist-app-container');
    },

    /**
     * Membersihkan layar panggung utama
     */
    bersihkanLayar() {
        const container = this.getContainer();
        if (container) {
            container.innerHTML = '';
        }
    },

    /**
     * Menampilkan Custom Modal Pop-up (Desain, Warna, & Gaya Identik Persis dengan Modal Pauli)
     * Menggantikan sepenuhnya fungsi bawaan browser window.alert() dan window.confirm()
     * @param {Object} options Konfigurasi modal
     */
    showModal({
        title = "Informasi",
        message = "",
        type = "info",
        iconHtml = null,
        isConfirm = false,
        okText = "OK",
        cancelText = "Batal",
        onOk = null,
        onCancel = null
    } = {}) {
        let modal = document.getElementById('modal-message');
        if (!modal) {
            // Suntikkan elemen modal dengan gaya persis modal Pauli jika belum ada di DOM
            modal = document.createElement('div');
            modal.id = 'modal-message';
            modal.className = 'hide-section fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md';
            modal.innerHTML = `
                <div class="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center animate-fade-in">
                    <div id="msgIcon" class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <i class="fa-solid fa-circle-info"></i>
                    </div>
                    <h3 id="msgTitle" class="text-xl font-black text-white mb-2 leading-tight">Informasi</h3>
                    <div id="msgBody" class="text-slate-300 mb-6 font-medium text-sm leading-relaxed text-center"></div>
                    <div id="msgBtnContainer" class="flex gap-3">
                        <button id="msgBtnCancel" class="hide-section w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-sm">Batal</button>
                        <button id="msgBtnOk" class="w-full bg-[#003865] hover:bg-[#0a4980] text-white font-black py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm">Mengerti</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const titleEl = document.getElementById('msgTitle');
        const bodyEl = document.getElementById('msgBody');
        const iconEl = document.getElementById('msgIcon');
        const btnOk = document.getElementById('msgBtnOk');
        const btnCancel = document.getElementById('msgBtnCancel');

        if (titleEl) titleEl.innerText = title;
        if (bodyEl) {
            if (message.includes('\n')) {
                bodyEl.innerHTML = message.split('\n\n').map(p => `<p class="mb-2.5 last:mb-0 leading-relaxed">${p.replace(/\n/g, '<br>')}</p>`).join('');
            } else {
                bodyEl.innerHTML = `<p class="leading-relaxed">${message}</p>`;
            }
        }

        if (iconEl) {
            if (type === 'error') {
                iconEl.className = "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl bg-red-500/10 text-red-400 border border-red-500/20";
                iconEl.innerHTML = iconHtml || '<i class="fa-solid fa-triangle-exclamation"></i>';
            } else if (type === 'warning') {
                iconEl.className = "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20";
                iconEl.innerHTML = iconHtml || '<i class="fa-solid fa-triangle-exclamation"></i>';
            } else if (type === 'success') {
                iconEl.className = "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                iconEl.innerHTML = iconHtml || '<i class="fa-solid fa-check"></i>';
            } else {
                iconEl.className = "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20";
                iconEl.innerHTML = iconHtml || '<i class="fa-solid fa-circle-info"></i>';
            }
        }

        if (btnOk && btnCancel) {
            btnOk.className = "w-full bg-[#003865] hover:bg-[#0a4980] text-white font-black py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm";
            btnCancel.className = "w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-sm";

            if (isConfirm) {
                btnCancel.classList.remove('hide-section');
                btnCancel.style.display = 'flex';
                let formattedCancel = cancelText.includes('<') ? cancelText : `<span>${cancelText}</span>`;
                if (formattedCancel.includes('fa-xmark') && !formattedCancel.includes('mr-')) {
                    formattedCancel = formattedCancel.replace('fa-xmark', 'fa-xmark mr-1.5');
                }
                btnCancel.innerHTML = formattedCancel;
                btnOk.innerHTML = okText.includes('<') ? okText : `<span>${okText}</span>`;
            } else {
                btnCancel.classList.add('hide-section');
                btnCancel.style.display = 'none';
                btnOk.innerHTML = okText.includes('<') ? okText : `<span>${okText}</span>`;
            }

            btnOk.onclick = () => {
                this.closeModal();
                if (typeof onOk === 'function') onOk();
            };

            btnCancel.onclick = () => {
                this.closeModal();
                if (typeof onCancel === 'function') onCancel();
            };
        }

        modal.classList.remove('hide-section');
        modal.style.display = 'flex';
    },

    /**
     * Menutup Custom Modal Pop-up
     */
    closeModal() {
        const modal = document.getElementById('modal-message');
        if (modal) {
            modal.classList.add('hide-section');
            modal.style.display = 'none';
        }
    },

    // =====================================================================
    // 1. RENDERING MENU UTAMA 9 BAGIAN SOAL (SOAL 01 S/D SOAL 09)
    // =====================================================================

    /**
     * Menampilkan daftar 9 Soal IST (Harus urut dari Soal 01, tanpa istilah Jerman, tanpa keterangan waktu)
     * @param {string[]} completedSubtests Array soal yang telah selesai dikerjakan (contoh: ['01'])
     */
    renderMenu9Subtes(completedSubtests = []) {
        const container = this.getContainer();
        if (!container) return;

        const totalSelesai = completedSubtests.length;
        const isAllCompleted = totalSelesai >= 9;

        let cardsHtml = '';
        IST_SUBTESTS_LIST.forEach((sub, idx) => {
            const subNoInt = parseInt(sub.no, 10);
            const isCompleted = completedSubtests.includes(sub.no);
            
            // Aturan mutlak: Soal 01 terbuka di awal.
            // Soal 02..09 terbuka hanya jika soal sebelumnya sudah selesai dikerjakan.
            const prevCode = String(subNoInt - 1).padStart(2, '0');
            const isUnlocked = subNoInt === 1 || completedSubtests.includes(prevCode);

            let statusBadge = '';
            let cardClass = '';
            let btnHtml = '';

            if (isCompleted) {
                statusBadge = `
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <i class="fa-solid fa-circle-check"></i> Selesai
                    </span>
                `;
                cardClass = "border-slate-200 bg-slate-50/60";
                btnHtml = `
                    <button type="button" disabled
                        class="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80">
                        <i class="fa-solid fa-lock text-slate-400"></i>
                        <span>Subtes ${sub.no} Selesai &amp; Terkunci</span>
                    </button>
                `;
            } else if (isUnlocked) {
                statusBadge = `
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#edf3f9] text-[#003865] border border-[#b9d0e7]">
                        <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Siap Dikerjakan
                    </span>
                `;
                cardClass = "border-[#003865] bg-white ring-2 ring-[#003865]/15 shadow-md";
                btnHtml = `
                    <button type="button" onclick="istLogic.pilihSubtes(${subNoInt})" 
                        class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
                        <span>Mulai Subtes ${sub.no}</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                `;
            } else {
                statusBadge = `
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200">
                        <i class="fa-solid fa-lock text-[11px]"></i> Terkunci
                    </span>
                `;
                cardClass = "border-slate-200 bg-slate-50/70 opacity-75";
                btnHtml = `
                    <button type="button" onclick="istLogic.pilihSubtes(${subNoInt})" 
                        class="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-not-allowed">
                        <i class="fa-solid fa-lock"></i>
                        <span>Selesaikan Subtes ${prevCode} Dahulu</span>
                    </button>
                `;
            }

            cardsHtml += `
                <div class="rounded-3xl border ${cardClass} p-5 md:p-6 transition-all flex flex-col justify-between">
                    <div>
                        <div class="flex items-start justify-between gap-3 mb-3">
                            <div class="w-11 h-11 rounded-2xl ${isUnlocked ? 'bg-[#003865] text-white shadow-sm' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-black text-sm">
                                ${sub.no}
                            </div>
                            ${statusBadge}
                        </div>

                        <!-- Penamaan Resmi: HANYA Menggunakan Teks Subtes 01 s/d Subtes 09 -->
                        <div class="mb-4">
                            <h3 class="font-extrabold text-slate-800 text-lg md:text-xl leading-snug">
                                Subtes ${sub.no}
                            </h3>
                        </div>

                        <!-- Keterangan Jumlah Soal & Rentang Nomor Urut (WAKTU DISEMBUNYIKAN SECARA TOTAL DARI TAMPILAN) -->
                        <div class="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-5 pb-3 border-b border-slate-100">
                            <span class="flex items-center gap-1.5">
                                <i class="fa-solid fa-list-check text-slate-400"></i>
                                ${sub.totalSoal} Soal (Nomor ${(istLogic.getSubtestOffset ? istLogic.getSubtestOffset(subNoInt) : 0) + 1} - ${(istLogic.getSubtestOffset ? istLogic.getSubtestOffset(subNoInt) : 0) + sub.totalSoal})
                            </span>
                        </div>
                    </div>

                    ${btnHtml}
                </div>
            `;
        });

        const html = `
            <div id="ist-menu-9-wrapper" class="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
                <!-- Header Daftar Soal IST -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#071f38] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#0b4578] relative overflow-hidden">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                        <div class="space-y-1.5">
                            <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-200 border border-white/15">
                                <i class="fa-solid fa-brain"></i>
                                <span>TES INTELIGENSI 1</span>
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-wide">Daftar Subtes</h2>
                            <p class="text-xs sm:text-sm text-blue-100/80 max-w-xl">
                                Pada tes ini terdapat 9 subtes (subtes 01 s/d subtes 09) yang wajib di kerjakan secara berurutan.
                            </p>
                        </div>

                        <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 text-center sm:text-right">
                            <div class="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Progres Pengerjaan</div>
                            <div class="text-2xl font-black text-[#ffbe1a] mt-0.5">${totalSelesai} / 9 Selesai</div>
                        </div>
                    </div>
                </div>

                <!-- Grid 9 Bagian Soal -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    ${cardsHtml}
                </div>

<!-- Tombol Navigasi / Failsafe Kembali ke Dashboard Utama -->
                <div class="pt-6 sm:pt-8 border-t border-slate-200">
                    ${isAllCompleted ? `
                        <div class="bg-gradient-to-br from-emerald-50 via-white to-blue-50 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
                            <div class="flex items-center gap-4 text-center sm:text-left">
                                <div class="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                                    <i class="fa-solid fa-circle-check"></i>
                                </div>
                                <div>
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1">
                                        <i class="fa-solid fa-trophy text-[11px] text-emerald-600"></i> Seluruh 9 Subtes Selesai
                                    </span>
                                    <h3 class="text-lg sm:text-xl font-black text-slate-800">Tes Inteligensi 1 Tuntas</h3>
                                    <p class="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                                        Seluruh jawaban telah tersimpan. Silakan kembali ke Dashboard untuk melanjutkan ke modul tes berikutnya.
                                    </p>
                                </div>
                            </div>
                            <button type="button" onclick="istLogic.selesaiDanKembaliKeDashboard()" 
                                class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-sm sm:text-base cursor-pointer shrink-0">
                                <i class="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
                                <span>Selesai &amp; Kembali ke Dashboard Utama</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    ` : `
                        <div class="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center text-sm shrink-0">
                                    <i class="fa-solid fa-lock"></i>
                                </div>
                                <div>
                                    <p class="text-xs sm:text-sm font-bold text-slate-700">Penyelesaian Tes</p>
                                    <p class="text-xs text-slate-500 font-medium">Anda harus menyelesaikan semua 9 subtes sebelum dapat melanjutkan ke modul berikutnya.</p>
                                </div>
                            </div>
                            <button type="button" disabled 
                                class="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80 shrink-0">
                                <i class="fa-solid fa-lock text-slate-400"></i>
                                <span>Selesaikan Seluruh 9 Subtes Dahulu (${totalSelesai} / 9 Selesai)</span>
                            </button>
                        </div>
                    `}
                </div>

            

            </div>
        `;

        container.innerHTML = html;
    },

    // =====================================================================
    // 1B. FASE PANDUAN RESMI SUBTES (DIBACA TELITI SEBELUM PERCOBAAN)
    // =====================================================================

    /**
     * Menampilkan panduan dan instruksi resmi subtes sebelum peserta masuk ke sesi percobaan
     */
    renderFasePanduan() {
        const container = this.getContainer();
        if (!container) return;

        const subtestData = istLogic.getCurrentSubtestData();
        const subtestCode = String(istLogic.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Subtes ${subtestCode}`;
        const kodeSubtes = subtestData.kodeSubtes 
            || (typeof IST_SUBTESTS_LIST !== 'undefined' && IST_SUBTESTS_LIST[istLogic.currentSubtestNo - 1] ? IST_SUBTESTS_LIST[istLogic.currentSubtestNo - 1].kodeSubtes : '')
            || (istLogic.getSubtestCode ? istLogic.getSubtestCode(istLogic.currentSubtestNo) : '');
        const judulLengkap = kodeSubtes ? `${kodeSubtes} - ${subtestName}` : subtestName;
        const totalSoal = subtestData.soal ? subtestData.soal.length : 20;

        const html = `
            <div id="fase-panduan-wrapper" class="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in pb-4">
                <!-- Header Card Panduan -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#071f38] px-6 py-6 text-white border-b border-[#0b4578]">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex items-center gap-3.5">
                            <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-[#ffbe1a] border border-white/15 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                <i class="fa-solid fa-book-open-reader"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#f5b300] text-[#051627] uppercase tracking-wider">PANDUAN &amp; INSTRUKSI</span>
                                    <span class="text-xs text-sky-200 font-bold">${judulLengkap}</span>
                                </div>
                                <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Panduan ${judulLengkap}</h2>
                                <p class="text-xs sm:text-sm text-blue-100/80 mt-0.5">
                                    Bacalah instruksi di bawah ini dengan teliti sebelum memulai sesi latihan percobaan.
                                </p>
                            </div>
                        </div>

                        <div class="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center shrink-0 self-start sm:self-auto">
                            <span class="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">Jumlah Soal</span>
                            <span class="text-lg font-black text-[#ffbe1a]">${totalSoal} Soal</span>
                        </div>
                    </div>
                </div>

                <!-- Konten Panduan Lengkap Standar Resmi IST -->
                <div class="p-6 sm:p-8 space-y-6">
                    ${this.generatePetunjukHtml(subtestData, istLogic.currentSubtestNo, subtestName)}

                    <!-- Kotak Informasi Pelaksanaan -->
                    <div class="rounded-2xl p-4 sm:p-5 bg-blue-50/70 border border-blue-200 flex items-start gap-3.5 shadow-xs">
                        <div class="w-8 h-8 rounded-xl bg-[#003865] text-white flex items-center justify-center shrink-0 mt-0.5">
                            <i class="fa-solid fa-circle-check text-sm text-[#ffbe1a]"></i>
                        </div>
                        <div class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            <p class="font-bold text-[#003865] mb-1">Alur Pengerjaan:</p>
                            <ol class="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                                <li>Setelah membaca panduan ini, Anda akan diarahkan ke <strong>Sesi Latihan (Percobaan)</strong> untuk mencoba menjawab contoh soal.</li>
                                <li>Durasi pengerjaan diatur secara otomatis oleh sistem PT Altrak 1978.</li>
                            </ol>
                        </div>
                    </div>

                    <!-- Tombol Aksi Bawah: Lanjut ke Contoh Soal & Kembali -->
                    <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center">
                        <button type="button" onclick="${istLogic.currentSubtestNo === 9 ? 'istLogic.mulaiFaseHafalan()' : 'istLogic.mulaiFaseContoh()'}"
                            class="w-full sm:w-2/3 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold py-3.5 sm:py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base">
                            <span>${istLogic.currentSubtestNo === 9 ? 'Mulai Sesi Menghafal' : 'Lanjut ke Latihan Contoh Soal'}</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                        <button type="button" onclick="istLogic.tampilkanMenu9Subtes()"
                            class="w-full sm:w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 sm:py-4 rounded-xl transition cursor-pointer text-sm text-center">
                            Daftar Subtes
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // =====================================================================
    // 2. FASE PERCOBAAN (CONTOH SOAL: WAKTU 30 DETIK & PESERTA KLIK SENDIRI)
    // =====================================================================

    
    // =====================================================================
    // 2A. FASE MENGHAFAL KATA (KHUSUS SUBTES 09 - WAKTU 4 MENIT)
    // =====================================================================

    /**
     * Menampilkan lembar hafalan kata Subtes 09 dengan desain minimalis resmi (kotak garis monokrom)
     * @param {number} sisaDetik Sisa waktu menghafal (180 detik)
     */
    renderFaseHafalan(sisaDetik) {
        const container = this.getContainer();
        if (!container) return;

        const subtestData = istLogic.getCurrentSubtestData();
        const subtestCode = String(istLogic.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Subtes ${subtestCode}`;

        const m = Math.floor(Math.max(0, sisaDetik) / 60);
        const s = Math.max(0, sisaDetik) % 60;
        const formattedTimer = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        const html = `
            <div id="fase-hafalan-wrapper" class="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in pb-4">
                <!-- Header Card Hafalan -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#071f38] px-6 py-5 text-white border-b border-[#0b4578]">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex items-center gap-3.5">
                            <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-[#ffbe1a] border border-white/15 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                <i class="fa-solid fa-brain"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#f5b300] text-[#051627] uppercase tracking-wider">FASE MENGHAFAL KATA</span>
                                    <span class="text-xs text-sky-200 font-bold">ME - ${subtestName}</span>
                                </div>
                                <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Lembar Hafalan Kata</h2>
                                <p class="text-xs sm:text-sm text-blue-100/80 mt-0.5">
                                    Hafalkan kelompok kata di bawah ini selama 4 menit tanpa mencatat.
                                </p>
                            </div>
                        </div>

                        <!-- Waktu Berjalan Fase Menghafal (4 Menit) -->
                        <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center shrink-0 self-start sm:self-auto">
                            <div class="w-8 h-8 rounded-full bg-[#f5b300] text-[#051627] flex items-center justify-center font-black text-sm">
                                <i class="fa-solid fa-brain"></i>
                            </div>
                            <div class="text-left">
                                <div class="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">Waktu Menghafal</div>
                                <div id="hafalan-timer-display" class="text-lg font-black text-[#ffbe1a]">
                                    ${formattedTimer}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Progress Bar Timer 4 Menit -->
                <div class="w-full bg-slate-100 h-1.5 overflow-hidden">
                    <div id="hafalan-progress-bar" class="h-full bg-gradient-to-r from-[#f5b300] to-[#ffbe1a] transition-all duration-1000 ease-linear" style="width: 100%;"></div>
                </div>

                <!-- Konten Hafalan -->
                <div class="p-6 md:p-8 space-y-6">
                    <!-- KOTAK PERINGATAN TEGAS PENGAWASAN KAMERA & PANDUAN POSISI TANGAN -->
                    <div class="p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-500 shadow-sm text-red-900">
                        <div class="flex items-start gap-3.5 mb-3.5">
                            <div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-lg shrink-0 mt-0.5 shadow-sm">
                                <i class="fa-solid fa-video"></i>
                            </div>
                            <div>
                                <h4 class="text-sm sm:text-base font-black text-red-800 uppercase tracking-wide flex items-center gap-2">
                                    <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
                                    PERHATIAN - WAKTU MENGHAFAL 4 MENIT
                                </h4>
                                <p class="text-xs text-red-700 font-semibold mt-0.5">
                                    Pengawasan webcam aktif • Posisi tangan wajib terlihat jelas
                                </p>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 bg-white/90 rounded-xl border border-red-200 shadow-xs">
                            <div class="shrink-0 text-center">
                                <img src="assets/ist/panduan-tangan-ist09.png" alt="Panduan Posisi Tangan Wajib" class="w-28 sm:w-36 h-auto rounded-lg shadow-sm border border-red-300 object-cover mx-auto" />
                                <span class="inline-flex items-center gap-1 mt-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-xs">
                                    <i class="fa-solid fa-circle-check text-emerald-600"></i> Contoh Pose Wajib
                                </span>
                            </div>
                            <div class="text-xs sm:text-sm text-red-950 space-y-2">
                                <p class="font-bold leading-relaxed">
                                    Sistem pengawasan kamera diaktifkan secara ketat pada sesi ini. Anda <span class="text-red-700 underline font-black">WAJIB mengangkat dan menaruh kedua tangan di atas</span> (sejajar kepala/telinga dengan telapak tangan terbuka menghadap kamera seperti contoh foto) agar terlihat jelas oleh pengawas selama 4 menit penuh.
                                </p>
                                <p class="font-medium text-red-900 leading-normal">
                                    Dilarang keras meletakkan tangan di bawah, mencatat kata-kata hafalan, atau memfoto layar. Sistem memantau postur Anda secara berkala. Pelanggaran akan otomatis menggugurkan hasil tes Anda.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- LEMBAR HAFALAN MINIMALIS RESMI (KOTAK GARIS MONOKROM SESUAI FOTO LEMBAR ASLI) -->
                    <div class="my-6 mx-auto max-w-2xl bg-white border-2 border-slate-900 rounded-xl p-6 sm:p-8 shadow-sm">
                        <div class="text-slate-900 text-xs sm:text-sm md:text-base space-y-4 font-bold leading-relaxed tracking-wide select-none" style="user-select: none; -webkit-user-select: none;">
                            <div class="flex items-center">
                                <span class="w-24 sm:w-32 tracking-wider shrink-0 text-slate-900 font-extrabold">BUNGA</span>
                                <span class="mx-2 sm:mx-3 text-slate-900 font-black">:</span>
                                <span class="font-semibold text-slate-800">Soka - Larat - Flamboyan - Yasmin - Dahlia</span>
                            </div>
                            <div class="flex items-center">
                                <span class="w-24 sm:w-32 tracking-wider shrink-0 text-slate-900 font-extrabold">PERKAKAS</span>
                                <span class="mx-2 sm:mx-3 text-slate-900 font-black">:</span>
                                <span class="font-semibold text-slate-800">Wajan - Jarum - Kikir - Cangkul - Palu</span>
                            </div>
                            <div class="flex items-center">
                                <span class="w-24 sm:w-32 tracking-wider shrink-0 text-slate-900 font-extrabold">BURUNG</span>
                                <span class="mx-2 sm:mx-3 text-slate-900 font-black">:</span>
                                <span class="font-semibold text-slate-800">Itik - Elang - Walet - Tekukur - Nuri</span>
                            </div>
                            <div class="flex items-center">
                                <span class="w-24 sm:w-32 tracking-wider shrink-0 text-slate-900 font-extrabold">KESENIAN</span>
                                <span class="mx-2 sm:mx-3 text-slate-900 font-black">:</span>
                                <span class="font-semibold text-slate-800">Quintet - Arca - Opera - Gamelan - Ukiran</span>
                            </div>
                            <div class="flex items-center">
                                <span class="w-24 sm:w-32 tracking-wider shrink-0 text-slate-900 font-extrabold">BINATANG</span>
                                <span class="mx-2 sm:mx-3 text-slate-900 font-black">:</span>
                                <span class="font-semibold text-slate-800">Musang - Rusa - Beruang - Zebra - Harimau</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tombol Navigasi Bawah -->
                    <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button type="button" onclick="istLogic.tampilkanMenu9Subtes()" 
                            class="text-xs font-bold text-slate-500 hover:text-[#003865] flex items-center gap-1.5 transition">
                            <i class="fa-solid fa-arrow-left"></i>
                            <span>Kembali ke Daftar Subtes</span>
                        </button>

                        <button type="button" onclick="istLogic.selesaiHafalanDanMulaiContoh()" 
                            class="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 text-sm cursor-pointer">
                            <span>Lanjut ke Contoh Soal</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /**
     * Memperbarui angka hitung mundur waktu menghafal 4 menit
     */
    updateWaktuHafalan(sisaDetik) {
        const timerDisplay = document.getElementById('hafalan-timer-display');
        const progressBar = document.getElementById('hafalan-progress-bar');
        
        if (timerDisplay) {
            const m = Math.floor(Math.max(0, sisaDetik) / 60);
            const s = Math.max(0, sisaDetik) % 60;
            timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        if (progressBar) {
            const subtestData = istLogic.getCurrentSubtestData ? istLogic.getCurrentSubtestData() : {};
            const totalDetik = Math.round((subtestData.waktuHafalan || 180000) / 1000);
            const persen = Math.max(0, (sisaDetik / totalDetik) * 100);
            progressBar.style.width = `${persen}%`;
        }
    },

    /**
     * Menampilkan 2 contoh soal secara simultan berderet ke bawah
     * Peserta mengklik sendiri pilihannya, dan kunci jawaban sudah diberitahukan dengan jelas
     * @param {number} sisaDetik Waktu belajar dalam detik (30 detik)
     */
    renderFaseContoh(sisaDetik) {
        const container = this.getContainer();
        if (!container) return;

        const subtestData = istLogic.getCurrentSubtestData();
        const subtestCode = String(istLogic.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Subtes ${subtestCode}`;
        const isHafalan = subtestData.id === 'soal_09' || (subtestData.contoh && subtestData.contoh.some(c => c.tipe === 'layar_hafalan'));

        let contohCardsHtml = '';
        subtestData.contoh.forEach((item, index) => {
            const hurufContoh = String.fromCharCode(65 + index);
            const contohNo = item.no;
            const rawJawaban = istLogic.jawabanContoh[contohNo];
            const jawabanTerpilih = (rawJawaban !== undefined && rawJawaban !== null) ? rawJawaban : '';
            if (!item.pilihan && item.tipe === 'pilihan_gambar') {
                item.pilihan = ["A", "B", "C", "D", "E"];
            }
            const isIsian = item.tipe === 'isian' || (!item.pilihan && item.tipe !== 'pilihan_gambar');

            // Logika Khusus Layar Hafalan Soal 09 (Tipe: layar_hafalan)
            // Aturan: SEMBUNYIKAN semua input jawaban (radio button maupun kolom teks).
            // Tampilkan konten hafalanTeks dalam bentuk list atau card berdesain rapi di tengah layar.
            if (item.tipe === 'layar_hafalan') {
                const listCards = (item.hafalanTeks || []).map((baris) => {
                    const colonIdx = baris.indexOf(':');
                    const kategori = colonIdx !== -1 ? baris.substring(0, colonIdx).trim() : '';
                    const kataList = colonIdx !== -1 ? baris.substring(colonIdx + 1).trim() : baris;

                    return `
                        <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#003865]/40 hover:shadow-sm transition-all">
                            <div class="shrink-0">
                                <span class="inline-block w-full sm:w-36 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#003865] to-[#0a4980] text-white font-black text-xs sm:text-sm tracking-wider text-center shadow-xs uppercase">
                                    ${kategori}
                                </span>
                            </div>
                            <div class="flex-grow">
                                <p class="text-base sm:text-lg font-bold text-slate-800 tracking-wide leading-relaxed">
                                    ${kataList}
                                </p>
                            </div>
                        </div>
                    `;
                }).join('');

                contohCardsHtml += `
                    <div id="card-hafalan-soal-09" class="bg-gradient-to-br from-slate-50 via-white to-sky-50/40 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm select-none" style="user-select: none; -webkit-user-select: none;">
                        <!-- Header Card Hafalan -->
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80">
                            <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#003865] text-white font-extrabold text-xs shadow-sm">
                                <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                                    <i class="fa-solid fa-brain text-[11px] text-[#ffbe1a]"></i>
                                </span>
                                <span>LEMBAR HAFALAN KATA</span>
                            </div>

                            <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                <i class="fa-solid fa-eye text-amber-600"></i> Fokus Menghafal • Dilarang Mencatat
                            </span>
                        </div>

                        <!-- KOTAK PERINGATAN TEGAS PENGAWASAN KAMERA & PANDUAN POSISI TANGAN -->
                        <div class="mb-6 p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-500 shadow-sm text-red-900">
                            <div class="flex items-start gap-3.5 mb-3.5">
                                <div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-lg shrink-0 mt-0.5 shadow-sm">
                                    <i class="fa-solid fa-video"></i>
                                </div>
                                <div>
                                    <h4 class="text-sm sm:text-base font-black text-red-800 uppercase tracking-wide flex items-center gap-2">
                                        <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
                                        PERHATIAN - WAKTU MENGHAFAL 4 MENIT
                                    </h4>
                                    <p class="text-xs text-red-700 font-semibold mt-0.5">
                                        Pengawasan webcam aktif • Posisi tangan wajib terlihat jelas
                                    </p>
                                </div>
                            </div>

                            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 bg-white/90 rounded-xl border border-red-200 shadow-xs">
                                <div class="shrink-0 text-center">
                                    <img src="assets/ist/panduan-tangan-ist09.png" alt="Panduan Posisi Tangan Wajib" class="w-28 sm:w-36 h-auto rounded-lg shadow-sm border border-red-300 object-cover mx-auto" />
                                    <span class="inline-flex items-center gap-1 mt-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-xs">
                                        <i class="fa-solid fa-circle-check text-emerald-600"></i> Contoh Pose Wajib
                                    </span>
                                </div>
                                <div class="text-xs sm:text-sm text-red-950 space-y-2">
                                    <p class="font-bold leading-relaxed">
                                        Sistem pengawasan kamera diaktifkan secara ketat pada sesi ini. Anda <span class="text-red-700 underline font-black">WAJIB mengangkat dan menaruh kedua tangan di atas</span> (sejajar kepala/telinga dengan telapak tangan terbuka menghadap kamera seperti contoh foto) agar terlihat jelas oleh pengawas selama 4 menit penuh.
                                    </p>
                                    <p class="font-medium text-red-900 leading-normal">
                                        Dilarang keras meletakkan tangan di bawah, mencatat kata-kata hafalan, atau memfoto layar. Sistem memantau postur Anda secara berkala. Pelanggaran akan otomatis menggugurkan hasil tes Anda.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Pertanyaan / Instruksi -->
                        <div class="mb-5 text-center sm:text-left">
                            <h3 class="text-slate-900 font-extrabold text-lg sm:text-xl leading-snug">
                                ${item.pertanyaan}
                            </h3>
                            <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                                Hafalkan kelima kelompok kata di bawah ini dengan sebaik-baiknya:
                            </p>
                        </div>

                        <!-- Daftar Kelompok Kata Hafalan (Card Tengah Berdesain Rapi) -->
                        <div class="space-y-3 mb-6">
                            ${listCards}
                        </div>

                        <!-- Kotak Informasi Waktu & Penjelasan -->
                        ${item.penjelasan ? `
                            <div class="rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5" style="background-color: #FFF8E1; border-left: 5px solid #d97706;">
                                <i class="fa-solid fa-lightbulb text-amber-600 text-xl shrink-0 mt-0.5"></i>
                                <div>
                                    <div class="font-black text-slate-900 mb-1 text-sm sm:text-base">Catatan Waktu:</div>
                                    <p class="text-slate-800 leading-relaxed font-semibold text-xs sm:text-sm">
                                        ${item.penjelasan}
                                    </p>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
                return;
            }

            // Logika Khusus Fase Percobaan Soal 07 (Tipe: gambar_panduan)
            // Aturan: JANGAN tampilkan input/radio button apapun pada fase ini.
            // Cukup render gambarSoal (gambar panduan utuh) dan letakkan kotak "Cara Mengerjakan" tepat di bawahnya.
            if (item.tipe === 'gambar_panduan') {
                contohCardsHtml += `
                    <div id="card-contoh-${contohNo}" class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:border-[#b9d0e7] transition-all">
                        <!-- Bagian Atas Card: Badge Panduan Contoh -->
                        <div class="flex items-center justify-between gap-3 mb-4">
                            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#003865] text-white font-extrabold text-xs shadow-sm">
                                <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                                    <i class="fa-solid fa-shapes text-[10px]"></i>
                                </span>
                                <span>Panduan Contoh Soal</span>
                            </div>

                            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <i class="fa-solid fa-circle-info text-[11px]"></i> Pelajari Pola Bentuk
                            </span>
                        </div>

                        <!-- Render Gambar Panduan Utuh -->
                        <div class="my-4 flex justify-center bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                            <img src="${encodeURI(item.gambarSoal)}" alt="Panduan Contoh ${subtestName}" class="max-w-full h-auto object-contain rounded-xl select-none" draggable="false">
                        </div>

                        <!-- Kotak Penjelasan Resmi Tepat di Bawah Gambar Panduan (Hanya Isi Penjelasan) -->
                        ${item.penjelasan ? `
                            <div class="rounded-r-2xl p-4 sm:p-5 mt-4 mb-2 shadow-xs" style="background-color: #FFF8E1; border-left: 5px solid #d97706;">
                                <p class="text-slate-800 leading-relaxed font-medium text-sm sm:text-base">
                                    ${item.penjelasan}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                `;
                return;
            }

            let contohInteractionHtml = '';

            if (isIsian) {
                // Kolom Isian untuk Fase Percobaan (Soal 04, 05, 06)
                // Catatan Aturan Poin 2: Render teks penjelasan persis di bawah form isian contoh agar peserta mengerti cara mengerjakannya
                const isAngka = subtestData.id === 'soal_05' || subtestData.id === 'soal_06';
                const inputMode = isAngka ? 'numeric' : 'text';
                const placeholderText = isAngka ? 'Ketik angka jawaban...' : 'Ketik perkataan jawaban...';

                contohInteractionHtml = `
                    <div class="space-y-2 mb-3">
                        <label for="input_contoh_${contohNo}" class="block text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                            <i class="fa-solid fa-pen-to-square text-[#003865]"></i>
                            <span>Silakan coba input jawaban pada kolom isian di bawah ini:</span>
                        </label>
                        <div class="relative w-full max-w-xl sm:max-w-2xl">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <i class="fa-solid ${isAngka ? 'fa-calculator' : 'fa-keyboard'} text-base text-slate-400"></i>
                            </div>
                            <input type="text" 
                                id="input_contoh_${contohNo}" 
                                value="${jawabanTerpilih || ''}" 
                                placeholder="${placeholderText}" 
                                inputmode="${inputMode}"
                                autocomplete="off"
                                spellcheck="false"
                                oninput="${isAngka ? "this.value = this.value.replace(/[^0-9]/g, ''); " : ""}istLogic.simpanJawabanContoh('${contohNo}', this.value)" 
                                class="ist-text-input pl-11">
                        </div>
                    </div>

                    
                `;
            } else {
                // Pilihan Ganda (A - E) untuk Soal 01, 02, 03, 07, 08
                const isPilihanGambar = item.tipe === 'pilihan_gambar' || subtestData.id === 'soal_08' || subtestData.id === 'soal_07';

                contohInteractionHtml = `
                    <div class="space-y-2.5 mb-4">
                        <p class="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                            <i class="fa-solid fa-hand-pointer text-[#003865]"></i>
                            <span>Silakan coba klik pilihan jawaban di bawah ini:</span>
                        </p>

                        <div class="${isPilihanGambar ? 'grid grid-cols-5 gap-2 sm:gap-3.5' : 'space-y-2.5'}">
                            ${item.pilihan.map((pilihanStr) => {
                                const optKey = pilihanStr.trim().charAt(0);
                                const optText = pilihanStr.replace(/^[A-E]\.\s*/, '');
                                const isSelected = jawabanTerpilih === optKey;
                                const isKey = optKey === item.jawabanBenar;

                                let borderCls = "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700";
                                let badgeCls = "bg-slate-100 text-slate-600 font-bold";

                                if (isSelected) {
                                    if (isKey) {
                                        borderCls = "border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-500/20 font-bold";
                                        badgeCls = "bg-emerald-600 text-white font-black";
                                    } else {
                                        borderCls = "border-amber-400 bg-amber-50 text-amber-950 font-bold";
                                        badgeCls = "bg-amber-500 text-white font-black";
                                    }
                                }

                                if (isPilihanGambar) {
                                    return `
                                        <div onclick="istLogic.simpanJawabanContoh('${contohNo}', '${optKey}'); istUI.renderFaseContoh(istLogic.sisaWaktuContohDetik);" 
                                            class="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border ${borderCls} cursor-pointer transition-all select-none shadow-xs hover:border-[#003865] hover:scale-[1.03]">
                                            <span class="w-8 h-8 rounded-xl ${badgeCls} flex items-center justify-center text-xs sm:text-sm font-black transition-colors">
                                                ${optKey}
                                            </span>
                                            ${isKey ? '<span class="text-[10px] font-bold text-emerald-700 mt-1"><i class="fa-solid fa-check"></i> Kunci</span>' : ''}
                                        </div>
                                    `;
                                }

                                return `
                                    <div onclick="istLogic.simpanJawabanContoh('${contohNo}', '${optKey}'); istUI.renderFaseContoh(istLogic.sisaWaktuContohDetik);" 
                                        class="flex items-center gap-3 p-3.5 rounded-xl border ${borderCls} cursor-pointer transition-all select-none shadow-sm">
                                        <span class="w-7 h-7 rounded-lg ${badgeCls} flex items-center justify-center text-xs shrink-0 transition-colors">
                                            ${optKey}
                                        </span>
                                        <span class="text-sm font-medium flex-grow">${optText}</span>
                                        ${isKey ? '<span class="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md"><i class="fa-solid fa-check mr-1"></i>Kunci Tepat</span>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    
                `;
            }

            contohCardsHtml += `
                <div id="card-contoh-${contohNo}" class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:border-[#b9d0e7] transition-all">
                    <!-- Bagian Atas Card: Badge Berlatar Gelap untuk Judul & Badge Berlatar Hijau Muda untuk Kunci Jawaban -->
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#003865] text-white font-extrabold text-xs shadow-sm">
                            <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">${hurufContoh}</span>
                            <span>${item.hurufContoh || ('Contoh ' + hurufContoh)}</span>
                        </div>

                        <!-- Kunci Jawaban Diberitahukan Secara Terbuka (Badge Hijau Muda) -->
                        <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <i class="fa-solid fa-key text-[11px]"></i> Kunci Jawaban: ${item.jawabanBenar}
                        </span>
                    </div>

                    <!-- Gambar Opsi Patokan Jika Ada (Contoh Soal 07 & 08) -->
                    ${item.gambarOpsi ? `
                        <div class="mb-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div class="text-xs sm:text-sm font-black text-[#003865] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-shapes text-amber-500 text-sm sm:text-base"></i>
                                <span>${subtestData.id === 'soal_08' ? 'Contoh pilihan jawaban (A, B, C, D, E):' : 'Contoh pilihan jawaban (A, B, C, D, E):'}</span>
                            </div>
                            <div class="flex justify-center items-center overflow-x-auto py-1">
                                <img src="${encodeURI(item.gambarOpsi)}" alt="Contoh pilihan jawaban" 
                                     class="w-full max-w-3xl h-auto ${subtestData.id === 'soal_07' ? 'max-h-[220px] sm:max-h-[260px]' : 'max-h-[150px] sm:max-h-[180px]'} object-contain select-none mx-auto transition-all" 
                                     draggable="false">
                            </div>
                        </div>
                    ` : ''}

                    <!-- Gambar Soal Contoh Jika Ada (Contoh Soal 08) -->
                    ${item.gambarSoal ? `
                        <div class="mb-4 bg-slate-50/90 p-3 sm:p-4 rounded-2xl border border-slate-200">
                            <div class="text-xs font-black text-[#003865] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <i class="fa-solid ${subtestData.id === 'soal_08' ? 'fa-cube' : 'fa-puzzle-piece'} text-[#003865]"></i>
                                <span>${subtestData.id === 'soal_08' ? 'Contoh soal :' : 'Contoh pilihan jawaban (gambar yang atas A, B, C, D, E) & Contoh soal (gambar yang bawah)  :'}</span>
                            </div>
                            <div class="flex justify-center items-center overflow-x-auto">
                                <img src="${encodeURI(item.gambarSoal)}" alt="Contoh pilihan jawaban (gambar yang atas A, B, C, D, E) & Contoh soal (gambar yang bawah) " 
                                     class="${subtestData.id === 'soal_07' ? 'w-full max-w-2xl max-h-[260px] sm:max-h-[320px]' : 'max-w-full max-h-[120px] sm:max-h-[140px]'} h-auto object-contain select-none transition-all" 
                                     draggable="false">
                            </div>
                        </div>
                    ` : ''}

                    <!-- Pertanyaan Contoh: Proporsional dan tidak terlalu tebal (disamakan seperti Soal 01, deret angka diberi spasi lega) -->
                    <p class="text-slate-800 font-bold text-base md:text-lg mb-3.5 leading-relaxed ${subtestData.id === 'soal_06' ? 'deret-angka-text' : ''}" ${subtestData.id === 'soal_06' ? 'style="word-spacing: 1.5rem;"' : ''}>
                        ${item.pertanyaan}
                    </p>

                    <!-- Interaksi Contoh (Isian untuk 04-06 atau Pilihan Ganda untuk 01-03, 08) -->
                    ${contohInteractionHtml}

                    <!-- KOTAK HIJAU: Status Feedback Pilihan Peserta (Diletakkan di Atas Kotak Kuning) -->
                    <div id="status-pilihan-contoh-${contohNo}" class="mt-3">
                        ${this.generateKeteranganContohHtml(item, jawabanTerpilih)}
                    </div>

                    <!-- KOTAK KUNING: Penjelasan Resmi (Diletakkan di Bawah Kotak Hijau) -->
                    ${item.penjelasan ? `
                        <div class="rounded-r-2xl p-4 sm:p-5 mt-3 shadow-xs" style="background-color: #FFF8E1; border-left: 5px solid #d97706;">
                            <p class="text-slate-800 leading-relaxed font-medium text-sm">
                                ${item.penjelasan}
                            </p>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        const html = `
            <div id="fase-contoh-wrapper" class="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">
                <!-- Header Fase Contoh -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#071f38] px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#0b4578]">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f5b300] text-[#051627] uppercase tracking-wider">${isHafalan ? 'Fase Menghafal' : 'Fase Percobaan'}</span>
                            <span class="text-xs text-sky-200 font-medium">${subtestName}</span>
                        </div>
                        <h2 class="text-xl md:text-2xl font-black text-white tracking-tight">${isHafalan ? 'Petunjuk & Layar Hafalan Kata' : 'Petunjuk & Latihan Contoh Soal'}</h2>
                    </div>

                    <!-- Waktu Berjalan Fase Percobaan (30 Detik / 4 Menit) -->
                    <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shrink-0 self-start sm:self-auto">
                        <div class="w-8 h-8 rounded-full bg-[#f5b300] text-[#051627] flex items-center justify-center font-black text-sm">
                            <i class="fa-solid ${isHafalan ? 'fa-brain' : 'fa-hourglass-half'}"></i>
                        </div>
                        <div class="text-left">
                            <div class="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">${isHafalan ? 'Waktu Menghafal' : 'Waktu Mempelajari'}</div>
                            <div id="contoh-timer-display" class="text-lg font-black text-[#ffbe1a]">
                                ${isHafalan 
                                    ? `${String(Math.floor(sisaDetik / 60)).padStart(2, '0')}:${String(sisaDetik % 60).padStart(2, '0')}` 
                                    : (sisaDetik >= 60 ? `${Math.floor(sisaDetik / 60)}:${String(sisaDetik % 60).padStart(2, '0')}` : `${sisaDetik} Detik`)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Progress Bar Timer 30 Detik -->
                <div class="w-full bg-slate-100 h-1.5 overflow-hidden">
                    <div id="contoh-progress-bar" class="h-full bg-gradient-to-r from-[#f5b300] to-[#ffbe1a] transition-all duration-1000 ease-linear" style="width: 100%;"></div>
                </div>

                <!-- Petunjuk & Daftar 2 Contoh Soal Berderet ke Bawah -->
                <div class="p-6 md:p-8 space-y-6">
                    ${this.generatePetunjukHtml(subtestData, istLogic.currentSubtestNo, subtestName)}

                    <div class="space-y-6">
                        ${contohCardsHtml}
                    </div>

                    <!-- Tombol Lanjut ke Soal Utama -->
                    <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button type="button" onclick="istLogic.tampilkanMenu9Subtes()" 
                            class="text-xs font-bold text-slate-500 hover:text-[#003865] flex items-center gap-1.5 transition">
                            <i class="fa-solid fa-arrow-left"></i>
                            <span>Kembali ke Daftar Subtes</span>
                        </button>

                        <button type="button" onclick="istLogic.lanjutKeUjianUtama()" 
                            class="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 text-sm cursor-pointer">
                            <span>${isHafalan ? 'Mulai Ujian ' + subtestName : 'Lanjut ke ' + subtestName}</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Anti-Cheat Subtes 09 (Hafalan / ME): Blokir contextmenu dan selectstart
        if (isHafalan) {
            const cardHafalan = document.getElementById('card-hafalan-soal-09') || container;
            if (cardHafalan) {
                cardHafalan.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    return false;
                });
                cardHafalan.addEventListener('selectstart', (e) => {
                    e.preventDefault();
                    return false;
                });
                cardHafalan.addEventListener('copy', (e) => {
                    e.preventDefault();
                    return false;
                });
            }
        }
    },

    /**
     * Menghasilkan komponen Petunjuk Pengerjaan yang rapi, menarik, dan terstruktur
     * agar peserta ujian membaca dan memahaminya dengan jelas (Soal 01 s/d Soal 07)
     */
    generatePetunjukHtml(subtestData, subtestNo, subtestName) {
        const configMap = {
            1: {
                formatLabel: "Pilihan Ganda (A - E)",
                formatIcon: "fa-list-ol",
                highlightedText: "Soal-soal <strong>01 - 20</strong> terdiri atas kalimat-kalimat. Pada setiap kalimat <strong>satu kata hilang</strong> dan disediakan <strong>5 (lima) kata pilihan</strong> sebagai penggantinya. Pilihlah kata yang tepat yang dapat menyempurnakan kalimat itu !."
            },
            2: {
                formatLabel: "Pilihan Ganda (A - E)",
                formatIcon: "fa-list-ol",
                highlightedText: "Ditentukan <strong>5 (lima) kata.</strong> Pada <strong>4 dari 5 kata</strong> tersebut terdapat suatu <strong>kesamaan.</strong> Carilah <strong>kata yang kelima yang</strong> tidak memiliki kesamaan dengan keempat kata itu."
            },
            3: {
                formatLabel: "Pilihan Ganda (A - E)",
                formatIcon: "fa-arrows-split-up-and-left",
                highlightedText: "Ditentukan <strong>3 (tiga) kata</strong>. Antara kata pertama dan kata kedua terdapat <strong>suatu hubungan tertentu</strong>. Antara kata ketiga dan salah satu di antara 5 kata pilihan harus pula terdapat <strong>hubungan yang sama itu</strong>. Carilah kata itu."
            },
            4: {
                formatLabel: "Kolom Isian (Ketik Kata)",
                formatIcon: "fa-keyboard",
                highlightedText: "Ditentukan <strong>dua kata</strong>. Carilah <strong>satu perkataan</strong> yang meliputi pengertian kedua kata tadi. <strong>silakan input perkataan itu</strong> langsung pada kolom yang disediakan."
            },
            5: {
                formatLabel: "Kolom Isian (Ketik Angka)",
                formatIcon: "fa-calculator",
                highlightedText: "Persoalan berikutnya ialah <strong>soal-soal hitungan</strong>. Cara menjawab angka berikutnya dengan menginput angka secara langsung pada kolom isian yang disediakan."
            },
            6: {
                formatLabel: "Kolom Isian (Ketik Angka)",
                formatIcon: "fa-arrow-trend-up",
                highlightedText: "Pada persoalan berikut akan <strong>diberikan deret angka</strong>. Setiap deret tersusun menurut <strong>suatu aturan yang tertentu</strong> dan dapat dilanjutkan menurut aturan itu. Carilah <strong>untuk setiap deret,</strong> angka berikutnya<strong> dan input jawaban</strong> saudara pada kolom yang disediakan."
            },
            7: {
                formatLabel: "Pilihan Ganda Gambar (A - E)",
                formatIcon: "fa-shapes",
                highlightedText: "Pada soal - soal berikut ini, Setiap soal memperlihatkan sesuatu <strong>bentuk tertentu yang terpotong menjadi beberapa bagian</strong>. Carilah di antara bentuk-bentuk yang ditentukan <strong>(A, B, C, D, E),</strong> bentuk yang dapat dibangun dengan cara <strong>menyusun potongan-potongan itu sedemikian rupa</strong>, sehingga tidak ada kelebihan sudut atau ruang di antaranya. Carilah bentuk - bentuk itu dan pililah jawaban yang sesuai."
            },
            8: {
                formatLabel: "Pilihan Ganda Kubus (A - E)",
                formatIcon: "fa-cube",
                highlightedText: "Ditentukan 5 buah <strong>kubus (A, B, C, D, E)</strong>. Pada tiap - tiap kubus terdapat enam tanda yang berlainan pada setiap sisinya. Tiga dari tanda itu dapat di lihat. Kubus - kubus yang di tentukan <strong>itu kubus (A, B, C, D, E)</strong> ialah kubus - kubus yang berbada, artinya kubus kubus itu dapat mempunyai tanda - tanda yang sama, akan tetapi susunanya berlainan. Setiap soal memperlihatkan salah satu kubus yang di tentukan di dalam kedudukan  yang berbeda. Carilah kubus yang di maksudkan itu dan jawablah. <strong> Kubus itu dapat di putar, dapat di gulingkan atau dapat di putar dan gulingkan dalam pikiran saudara</strong>, oleh karena itu mungkin akan terlihat suatu tanda yang baru. "
            },
            9: {
                formatLabel: (typeof istLogic !== 'undefined' && istLogic.fase === 'CONTOH') ? "Pilihan Ganda (A - E)" : "Tes Hafalan Kata",
                formatIcon: (typeof istLogic !== 'undefined' && istLogic.fase === 'CONTOH') ? "fa-list-ol" : "fa-brain",
                highlightedText: (typeof istLogic !== 'undefined' && istLogic.fase === 'CONTOH')
                    ? "Pada persoalan berikutnya, terdapat sejumlah pertanyaan mengenai kata-kata yang telah saudara hafalkan tadi. Pilihlah satu kategori yang tepat sesuai kata yang telah Anda hafalkan."
                    : "Anda akan diberikan waktu <strong>4 menit untuk menghafal</strong> kata-kata di bawah ini. Anda <strong>TIDAK DIPERKENANKAN mencatat</strong>, selama anda menghafal kata - kata, <strong>angkat tangan anda sejajar dengan kepala seperti gambar di layar ini</strong>, setelah 4 menit, halaman akan otomatis berpindah ke contoh soal."
            }
        };

        const config = configMap[subtestNo] || {
            formatLabel: "Petunjuk Soal",
            formatIcon: "fa-circle-info",
            highlightedText: subtestData.petunjuk || ""
        };

        const isSubtest9 = Number(subtestNo) === 9 || (subtestData && subtestData.id === 'soal_09');
        const showWarningPanduan9 = isSubtest9 && (typeof istLogic === 'undefined' || istLogic.fase === 'PANDUAN');

        return `
            <div class="bg-gradient-to-br from-[#f8fafc] via-[#edf3f9] to-[#e4eef7] border-2 border-[#b9d0e7] rounded-3xl p-5 sm:p-7 shadow-sm transition-all relative overflow-hidden">
                <!-- Aksen Garis Dekoratif Atas Altrak Navy-Gold -->
                <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#003865] via-[#0a4980] to-[#f5b300]"></div>

                <!-- Header Petunjuk -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-200/80">
                    <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-2xl bg-[#003865] text-[#ffbe1a] flex items-center justify-center text-xl shadow-md shrink-0">
                            <i class="fa-solid fa-book-open-reader"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#003865] text-white">PETUNJUK RESMI</span>
                                <span class="text-xs font-bold text-slate-500 hidden sm:inline">• Harap Dibaca Teliti</span>
                            </div>
                            <h3 class="text-base sm:text-lg font-black text-[#003865] mt-0.5 leading-tight">
                                Petunjuk Pengerjaan ${subtestName}
                            </h3>
                        </div>
                    </div>

                    <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200 text-xs font-bold text-slate-700 self-start sm:self-auto shadow-2xs">
                        <i class="fa-solid ${config.formatIcon} text-[#003865]"></i>
                        <span>${config.formatLabel}</span>
                    </div>
                </div>

                <!-- Deskripsi Inti / Kalimat Resmi Standar IST -->
                <div class="bg-white/95 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                    <p class="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
                        ${config.highlightedText}
                    </p>
                </div>


                ${showWarningPanduan9 ? `
                <!-- KOTAK PERINGATAN TEGAS PENGAWASAN KAMERA & PANDUAN POSISI TANGAN (IST 09) -->
                <div class="mt-4 p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-500 shadow-sm text-red-900">
                    <div class="flex items-start gap-3.5 mb-3.5">
                        <div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-lg shrink-0 mt-0.5 shadow-sm">
                            <i class="fa-solid fa-video"></i>
                        </div>
                        <div>
                            <h4 class="text-sm sm:text-base font-black text-red-800 uppercase tracking-wide flex items-center gap-2">
                                <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
                                PERHATIAN - WAKTU MENGHAFAL 4 MENIT
                            </h4>
                            <p class="text-xs text-red-700 font-semibold mt-0.5">
                                Pengawasan webcam aktif • Posisi tangan wajib terlihat jelas
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 bg-white/90 rounded-xl border border-red-200 shadow-xs">
                        <div class="shrink-0 text-center">
                            <img src="assets/ist/panduan-tangan-ist09.png" alt="Panduan Posisi Tangan Wajib" class="w-28 sm:w-36 h-auto rounded-lg shadow-sm border border-red-300 object-cover mx-auto" />
                            <span class="inline-flex items-center gap-1 mt-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-xs">
                                <i class="fa-solid fa-circle-check text-emerald-600"></i> Contoh Pose Wajib
                            </span>
                        </div>
                        <div class="text-xs sm:text-sm text-red-950 space-y-2">
                            <p class="font-bold leading-relaxed">
                                Sistem pengawasan kamera diaktifkan secara ketat pada sesi ini. Anda <span class="text-red-700 underline font-black">WAJIB mengangkat dan menaruh kedua tangan di atas</span> (sejajar kepala/telinga dengan telapak tangan terbuka menghadap kamera seperti contoh foto) agar terlihat jelas oleh pengawas selama 4 menit penuh.
                            </p>
                            <p class="font-medium text-red-900 leading-normal">
                                Dilarang keras meletakkan tangan di bawah, mencatat kata-kata hafalan, atau memfoto layar. Sistem memantau postur Anda secara berkala. Pelanggaran akan otomatis menggugurkan hasil tes Anda.
                            </p>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Menghasilkan teks keterangan penjelasan pada contoh
     */
    generateKeteranganContohHtml(item, jawabanTerpilih) {
        if (!item || item.tipe === 'gambar_panduan') return '';
        const valStr = (jawabanTerpilih !== undefined && jawabanTerpilih !== null) ? String(jawabanTerpilih).trim() : '';
        if (valStr === '') {
            return `
                <div class="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
                    <i class="fa-solid fa-circle-info text-blue-600 text-sm mt-0.5 shrink-0"></i>
                    <span>Kunci jawaban yang benar adalah <strong>${item.jawabanBenar}</strong>. Silakan coba ${item.tipe === 'isian' ? 'ketikkan' : 'klik pilihan'} <strong>${item.jawabanBenar}</strong> pada kotak di atas.</span>
                </div>
            `;
        }

        const isBenar = valStr.toLowerCase() === String(item.jawabanBenar).trim().toLowerCase();
        if (isBenar) {
            return `
                <div class="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-800">
                    <i class="fa-solid fa-circle-check text-emerald-600 text-sm mt-0.5 shrink-0"></i>
                    <div>
                        <span class="font-extrabold">Hebat! Jawaban Anda Tepat.</span> Jawaban yang benar untuk contoh ini memang adalah <strong>${item.jawabanBenar}</strong>.
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                    <i class="fa-solid fa-circle-exclamation text-amber-600 text-sm mt-0.5 shrink-0"></i>
                    <div>
                        Anda mengisikan <strong>${jawabanTerpilih}</strong>. Pada contoh ini, jawaban yang benar adalah <strong>${item.jawabanBenar}</strong>. Silakan coba ketik/pilih <strong>${item.jawabanBenar}</strong>.
                    </div>
                </div>
            `;
        }
    },

    /**
     * Memperbarui visual saat peserta mengklik atau mengetik pilihan pada contoh
     */
    updateStatusPilihanContoh(contohNo, pilihanKey) {
        const subtestData = istLogic.getCurrentSubtestData();
        const item = subtestData.contoh.find(c => c.no === contohNo);
        const statusEl = document.getElementById(`status-pilihan-contoh-${contohNo}`);
        if (statusEl && item) {
            statusEl.innerHTML = this.generateKeteranganContohHtml(item, pilihanKey);
        } else {
            this.renderFaseContoh(istLogic.sisaWaktuContohDetik);
        }
    },

    /**
     * Memperbarui angka hitung mundur waktu contoh 30 detik
     */
    updateWaktuContoh(sisaDetik) {
        const timerDisplay = document.getElementById('contoh-timer-display');
        const progressBar = document.getElementById('contoh-progress-bar');
        
        if (timerDisplay) {
            const isHafalan = istLogic.currentSubtestNo === 9;
            const m = Math.floor(Math.max(0, sisaDetik) / 60);
            const s = Math.max(0, sisaDetik) % 60;
            if (isHafalan || sisaDetik >= 60) {
                timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            } else {
                timerDisplay.textContent = `${sisaDetik} Detik`;
            }
        }
        if (progressBar) {
            const subtestData = istLogic.getCurrentSubtestData ? istLogic.getCurrentSubtestData() : istSubtes01;
            const totalDetik = Math.round((subtestData.waktuContoh || 30000) / 1000);
            const persen = Math.max(0, (sisaDetik / totalDetik) * 100);
            progressBar.style.width = `${persen}%`;
        }
    },

    // =====================================================================
    // 3. FASE UJIAN UTAMA (PAGINATION 1 PER 1, TATA LETAK 2 BARIS, WAKTU TERSEMBUNYI)
    // =====================================================================

    /**
     * Merender antarmuka ujian
     * Aturan:
     * - Nomor soal ditata persis menjadi 2 baris (8 kolom untuk 16 soal, 10 kolom untuk 20 soal)
     * - Ukuran kotak dan teks proporsional (tidak terlalu besar dan tidak terlalu kecil)
     * - Waktu tersembunyi total (tidak ada angka hitung mundur atau keterangan menit)
     * - Kolom isian untuk Soal 04, 05, 06 (tanpa radio button, tanpa penjelasan contoh)
     */
    renderFaseUjian() {
        const container = this.getContainer();
        if (!container) return;

        const subtestData = istLogic.getCurrentSubtestData ? istLogic.getCurrentSubtestData() : istSubtes01;
        const totalSoal = subtestData.soal ? subtestData.soal.length : 20;
        const subtestCode = String(istLogic.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Subtes ${subtestCode}`;
        const kodeSubtes = subtestData.kodeSubtes 
            || (typeof IST_SUBTESTS_LIST !== 'undefined' && IST_SUBTESTS_LIST[istLogic.currentSubtestNo - 1] ? IST_SUBTESTS_LIST[istLogic.currentSubtestNo - 1].kodeSubtes : '')
            || (istLogic.getSubtestCode ? istLogic.getSubtestCode(istLogic.currentSubtestNo) : '');
        const offset = (istLogic.getSubtestOffset && typeof istLogic.getSubtestOffset === 'function')
            ? istLogic.getSubtestOffset(istLogic.currentSubtestNo)
            : 0;
        const nomorAwal = offset + 1;
        const nomorAkhir = offset + totalSoal;

        let totalTerisi = 0;
        subtestData.soal.forEach((s, i) => {
            const noU = offset + (i + 1);
            const ans = istLogic.jawabanPeserta[noU] !== undefined ? istLogic.jawabanPeserta[noU] : istLogic.jawabanPeserta[s.no];
            if (ans !== undefined && ans !== null && String(ans).trim() !== '') {
                totalTerisi++;
            }
        });

        // Aturan: Tepat 2 baris sejajar (8 kolom untuk 16 soal, 10 kolom untuk 20 soal)
        const colsCount = totalSoal === 16 ? 8 : 10;

        const html = `
            <div id="fase-ujian-wrapper" class="w-full max-w-4xl mx-auto space-y-4 animate-fade-in pb-8">
                <!-- Bar Status & Navigasi Nomor Soal (Tata Letak 2 Baris Simetris & Proporsional) -->
                <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
                    <!-- Header Atas: Judul Soal dengan Kode Subtes (misal: "GE - Soal 04") & Status Pengerjaan (TANPA WAKTU) -->
                    <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div class="flex items-center gap-3">
                            <span class="w-9 h-9 rounded-2xl bg-[#003865] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                ${subtestCode}
                            </span>
                            <div>
                                <h2 class="text-lg sm:text-xl font-black text-[#003865] leading-tight">${kodeSubtes ? `${kodeSubtes} - ` : ''}${subtestName}</h2>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 sm:gap-2.5">
                            <!-- Badge Pelacak Progres (misal: "0 / 20 Terisi") -->
                            <span id="badge-terjawab" class="text-xs sm:text-sm font-bold text-[#003865] bg-[#edf3f9] px-3.5 py-1.5 rounded-full border border-[#b9d0e7]">
                                ${totalTerisi} / ${totalSoal} Terisi
                            </span>
                            <!-- Badge Status dengan Titik Hijau (misal: "Sedang Berjalan") -->
                            <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-emerald-700">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Sedang Berjalan</span>
                            </div>
                        </div>
                    </div>

                    <!-- Grid Navigasi Nomor: "NOMOR SOAL" berurutan (1 s/d 176) -->
                    <div>
                        <div class="flex items-center justify-between mb-2.5">
                            <span class="text-xs font-black uppercase tracking-wider text-slate-600">NOMOR SOAL (${nomorAwal} - ${nomorAkhir})</span>
                            <span class="text-[11px] text-slate-400 font-medium hidden sm:inline">Pilih nomor untuk melompat antar soal</span>
                        </div>

                        <div id="grid-palette-soal" class="w-full gap-1.5 sm:gap-2" style="display: grid; grid-template-columns: repeat(${colsCount}, minmax(0, 1fr));">
                            ${this.generatePaletteHtml()}
                        </div>
                    </div>
                </div>

                <!-- Card Soal Aktif (Card Putih Besar) -->
                <div id="kartu-soal-aktif" class="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 min-h-[350px] flex flex-col justify-between transition-all">
                    <!-- Konten soal dirender dinamis -->
                </div>

                <!-- Tombol Navigasi Bawah: Sebelumnya & Selanjutnya -->
                <div class="flex items-center justify-between gap-4 pt-1">
                    <button type="button" id="btn-soal-sebelumnya" onclick="istLogic.soalSebelumnya()"
                        class="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:pointer-events-none cursor-pointer">
                        <i class="fa-solid fa-arrow-left text-xs"></i>
                        <span>Sebelumnya</span>
                    </button>

                    <div class="text-xs text-slate-400 font-medium hidden sm:block">
                        Gunakan tombol di atas untuk mereview jawaban
                    </div>

                    <button type="button" id="btn-soal-selanjutnya" onclick="istLogic.soalSelanjutnya()"
                        class="px-6 py-2.5 rounded-xl bg-[#003865] hover:bg-[#0b4578] active:scale-[0.98] text-white font-bold text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer">
                        <span id="btn-next-label">Selanjutnya</span>
                        <i class="fa-solid fa-arrow-right text-xs"></i>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.renderSoalAktif();
    },

    /**
     * Menghasilkan HTML tombol nomor soal (tepat 2 baris sejajar)
     * Ukuran proporsional (h-8/h-9)
     */
    generatePaletteHtml() {
        const subtestData = istLogic.getCurrentSubtestData ? istLogic.getCurrentSubtestData() : istSubtes01;
        const kodeSubtes = subtestData.kodeSubtes || (istLogic.getSubtestCode ? istLogic.getSubtestCode(istLogic.currentSubtestNo) : "SE");
        const offset = (istLogic.getSubtestOffset && typeof istLogic.getSubtestOffset === 'function')
            ? istLogic.getSubtestOffset(istLogic.currentSubtestNo)
            : 0;

        return subtestData.soal.map((item, idx) => {
            const isAktif = idx === istLogic.currentSoalIndex;
            const noUrut = offset + (idx + 1);
            const userAns = istLogic.jawabanPeserta[noUrut] !== undefined 
                ? istLogic.jawabanPeserta[noUrut] 
                : istLogic.jawabanPeserta[item.no];
            const sudahTerisi = userAns !== undefined && userAns !== null && String(userAns).trim() !== '';

            let cls = "h-8 sm:h-9 w-full rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center cursor-pointer border ";

            if (isAktif) {
                // Jika nomor sedang aktif: biru gelap
                cls += "bg-[#003865] text-white border-[#003865] ring-2 ring-[#003865]/30 shadow-sm scale-[1.04] font-black";
            } else if (sudahTerisi) {
                cls += "bg-emerald-50 text-emerald-800 border-emerald-300 font-black hover:bg-emerald-100";
            } else {
                cls += "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300";
            }

            return `
                <button type="button" onclick="istLogic.lompatKeSoal(${idx})" class="${cls}" title="${kodeSubtes} - Soal No. ${noUrut}">
                    ${noUrut}
                </button>
            `;
        }).join('');
    },

    /**
     * Memperbarui visual palette nomor soal dan counter badge
     */
    updatePalette() {
        const gridPalette = document.getElementById('grid-palette-soal');
        if (gridPalette) {
            gridPalette.innerHTML = this.generatePaletteHtml();
        }

        const badgeTerjawab = document.getElementById('badge-terjawab');
        if (badgeTerjawab) {
            const subtestData = istLogic.getCurrentSubtestData ? istLogic.getCurrentSubtestData() : istSubtes01;
            const offset = (istLogic.getSubtestOffset && typeof istLogic.getSubtestOffset === 'function')
                ? istLogic.getSubtestOffset(istLogic.currentSubtestNo)
                : 0;
            let totalTerisi = 0;
            subtestData.soal.forEach((s, i) => {
                const noU = offset + (i + 1);
                const ans = istLogic.jawabanPeserta[noU] !== undefined ? istLogic.jawabanPeserta[noU] : istLogic.jawabanPeserta[s.no];
                if (ans !== undefined && ans !== null && String(ans).trim() !== '') {
                    totalTerisi++;
                }
            });
            badgeTerjawab.textContent = `${totalTerisi} / ${subtestData.soal.length} Terisi`;
        }
    },

    /**
     * Merender soal yang sedang aktif saat ini (Pagination 1 per 1)
     * - Kolom isian (<input type="text"> / <input type="number">) untuk Soal 04, 05, 06
     * - Radio button (A-E) untuk Soal 01, 02, 03
     * - Teks penjelasan contoh JANGAN dimunculkan di fase ujian ini (Poin 3)
     */
    renderSoalAktif() {
        const kartu = document.getElementById('kartu-soal-aktif');
        if (!kartu) return;

        const subtestData = istLogic.getCurrentSubtestData ? istLogic.getCurrentSubtestData() : istSubtes01;
        const subtestCode = String(istLogic.currentSubtestNo).padStart(2, '0');
        const subtestName = subtestData.nama || `Subtes ${subtestCode}`;

        const soal = subtestData.soal[istLogic.currentSoalIndex];
        if (!soal) return;

        const totalSoal = subtestData.soal.length;
        const offset = (istLogic.getSubtestOffset && typeof istLogic.getSubtestOffset === 'function')
            ? istLogic.getSubtestOffset(istLogic.currentSubtestNo)
            : 0;
        const kodeSubtes = subtestData.kodeSubtes || (istLogic.getSubtestCode ? istLogic.getSubtestCode(istLogic.currentSubtestNo) : "SE");
        const noUrut = offset + (istLogic.currentSoalIndex + 1);
        const labelNomorSoal = `Soal No. ${noUrut}`;

        const rawJawaban = istLogic.jawabanPeserta[noUrut] !== undefined 
            ? istLogic.jawabanPeserta[noUrut] 
            : istLogic.jawabanPeserta[soal.no];
        const isAnswered = rawJawaban !== undefined && rawJawaban !== null && String(rawJawaban).trim() !== '';
        const jawabanTerpilih = isAnswered ? String(rawJawaban).trim() : null;

        const isIsian = soal.tipe === 'isian' || !soal.pilihan;
        const isPilihanGambar = soal.tipe === 'pilihan_gambar';

        let contentInputHtml = '';

        if (isPilihanGambar) {
            // Komponen Khusus Pilihan Ganda Gambar (Soal 07)
            // Kembalikan format input menjadi Radio Button (A, B, C, D, E) berdesain modern
            contentInputHtml = `
                <fieldset class="mt-6 mb-3 space-y-2">
                    <legend class="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                        <i class="fa-solid fa-hand-pointer text-[#003865]"></i>
                        <span>PILIH BENTUK JAWABAN (A, B, C, D, ATAU E):</span>
                    </legend>

                    <div class="grid grid-cols-5 gap-2 sm:gap-3.5">
                        ${soal.pilihan.map((pilihanStr) => {
                            const optKey = pilihanStr.trim().charAt(0);
                            const isChecked = jawabanTerpilih === optKey;
                            const inputId = `radio_soal_${noUrut}_${optKey}`;

                            const cardBorderCls = isChecked
                                ? "border-[#003865] bg-[#edf3f9] text-[#003865] ring-2 ring-[#003865]/25 shadow-sm font-bold"
                                : "border-slate-200 bg-white hover:bg-slate-50/90 hover:border-slate-300 text-slate-700";

                            const badgeLetterCls = isChecked
                                ? "bg-[#003865] text-white font-black"
                                : "bg-slate-100 text-slate-600 font-bold";

                            return `
                                <label for="${inputId}" 
                                    class="radio-option-card flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border ${cardBorderCls} cursor-pointer transition-all select-none shadow-xs hover:border-[#003865] hover:scale-[1.03]">
                                    
                                    <div class="flex items-center gap-1.5 sm:gap-2">
                                        <input type="radio" 
                                            id="${inputId}" 
                                            name="ist_subtes_${subtestCode}_pilihan" 
                                            value="${optKey}" 
                                            ${isChecked ? 'checked' : ''} 
                                            ${istLogic.isUjianTerkunci ? 'disabled' : ''}
                                            onchange="istLogic.simpanJawaban(${noUrut}, '${optKey}'); istUI.renderSoalAktif();"
                                            class="w-4 h-4 text-[#003865] border-slate-300 focus:ring-[#003865] cursor-pointer accent-[#003865]">
                                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${badgeLetterCls} flex items-center justify-center text-xs sm:text-sm font-black shrink-0 transition-colors">
                                            ${optKey}
                                        </span>
                                    </div>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </fieldset>
            `;
        } else if (isIsian) {
            // Komponen Kolom Isian Khusus Soal 04, 05, 06 (Komponen Radio Button Ditiadakan)
            // Catatan: Teks penjelasan dari array contoh JANGAN ditampilkan di fase ujian utama ini (Poin 3)
            const isAngka = subtestData.id === 'soal_05' || subtestData.id === 'soal_06';
            const inputMode = isAngka ? 'numeric' : 'text';
            const placeholderText = isAngka ? 'Ketik angka jawaban...' : 'Ketik perkataan jawaban...';

            contentInputHtml = `
                <div class="mt-6 mb-4 space-y-2">
                    <label for="input_jawaban_aktif" class="block text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <i class="fa-solid fa-pen-to-square text-[#003865]"></i>
                        <span>KETIKKAN JAWABAN ANDA DI BAWAH INI:</span>
                    </label>
                    <div class="relative w-full max-w-xl sm:max-w-2xl">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <i class="fa-solid ${isAngka ? 'fa-calculator' : 'fa-keyboard'} text-sm text-slate-400"></i>
                        </div>
                        <input type="text" 
                            id="input_jawaban_aktif" 
                            name="ist_subtes_${subtestCode}_jawaban" 
                            value="${rawJawaban || ''}" 
                            placeholder="${placeholderText}" 
                            inputmode="${inputMode}"
                            autocomplete="off"
                            spellcheck="false"
                            ${istLogic.isUjianTerkunci ? 'disabled' : ''}
                            oninput="${isAngka ? "this.value = this.value.replace(/[^0-9]/g, ''); " : ""}istLogic.simpanJawaban(${noUrut}, this.value)"
                            class="ist-text-input pl-11">
                    </div>
                </div>
            `;
        } else {
            // Pilihan Ganda (A, B, C, D, E) untuk Soal 01, 02, 03 Menggunakan Radio Button
            contentInputHtml = `
                <fieldset class="space-y-3 mt-6">
                    <legend class="sr-only">Pilihan Jawaban Soal Nomor ${noUrut}</legend>
                    ${soal.pilihan.map((pilihanStr) => {
                        const optKey = pilihanStr.trim().charAt(0);
                        const optText = pilihanStr.replace(/^[A-E]\.\s*/, '');
                        const isChecked = jawabanTerpilih === optKey;
                        const inputId = `radio_soal_${noUrut}_${optKey}`;

                        const cardBorderCls = isChecked
                            ? "border-[#003865] bg-[#edf3f9] text-[#003865] ring-2 ring-[#003865]/20 font-bold"
                            : "border-slate-200 bg-white hover:bg-slate-50/90 hover:border-slate-300 text-slate-700";

                        const badgeLetterCls = isChecked
                            ? "bg-[#003865] text-white font-black"
                            : "bg-slate-100 text-slate-600 font-bold";

                        return `
                            <label for="${inputId}" 
                                class="radio-option-card flex items-center gap-3 py-3 px-4 rounded-xl border ${cardBorderCls} cursor-pointer transition-all select-none shadow-xs">
                                
                                <input type="radio" 
                                    id="${inputId}" 
                                    name="ist_subtes_${subtestCode}_pilihan" 
                                    value="${optKey}" 
                                    ${isChecked ? 'checked' : ''} 
                                    ${istLogic.isUjianTerkunci ? 'disabled' : ''}
                                    onchange="istLogic.simpanJawaban(${noUrut}, '${optKey}'); istUI.renderSoalAktif();"
                                    class="w-4 h-4 text-[#003865] border-slate-300 focus:ring-[#003865] cursor-pointer accent-[#003865]">

                                <span class="w-7 h-7 rounded-lg ${badgeLetterCls} flex items-center justify-center text-xs shrink-0 transition-colors">
                                    ${optKey}
                                </span>

                                <span class="text-sm sm:text-base leading-normal flex-grow">${optText}</span>
                            </label>
                        `;
                    }).join('')}
                </fieldset>
            `;
        }

        // Badge abu-abu "Belum Dijawab" (ubah menjadi hijau "Sudah Dijawab" jika input sudah terisi)
        const badgeStatusJawaban = isAnswered
            ? `<span class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                   <i class="fa-solid fa-circle-check text-xs"></i> Sudah Dijawab
               </span>`
            : `<span class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
                   Belum Dijawab
               </span>`;

        let soalHtml = '';

        if (isPilihanGambar) {
            soalHtml = `
                <div>
                    <!-- 1. STICKY MASTER IMAGE: PILIHAN A, B, C, D, E (Menempel di atas saat di-scroll) -->
                    <div class="sticky-patokan-card sticky top-16 z-30" style="position: sticky; top: 4.25rem; z-index: 30; background-color: #F8FAFC; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 10px; margin-bottom: 24px; border: 1px solid #E2E8F0; border-radius: 16px;">
                        <div class="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-200/80">
                            <span class="inline-flex items-center gap-1.5 text-xs font-black text-[#003865] uppercase tracking-wider">
                                <i class="fa-solid fa-shapes text-amber-500"></i>
                                <span>${subtestData.id === 'soal_08' ? 'Pilihan jawaban (A, B, C, D, E)' : 'Pilihan jawaban (A, B, C, D, E)'}</span>
                            </span>
                        </div>
                        <div class="flex justify-center items-center overflow-x-auto py-1">
                            <img src="${encodeURI(soal.gambarOpsi)}" alt="Pilihan Bentuk A-E" 
                                 class="sticky-patokan-img select-none transition-all w-full max-w-3xl mx-auto" 
                                 style="max-height: 175px; width: 100%; object-fit: contain;" 
                                 draggable="false" loading="eager">
                        </div>
                    </div>

                    <!-- 2. Header Bar: Nomor Urut Soal & Badge Status Jawaban -->
                    <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-[#003865] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                ${noUrut}
                            </span>
                            <span class="text-sm sm:text-base font-bold text-slate-700">${labelNomorSoal}</span>
                        </div>

                        ${badgeStatusJawaban}
                    </div>

                    <!-- 3. GAMBAR SOAL: Ditaruh di Bawah Seperti Semula -->
                    <div class="my-4 flex flex-col items-center justify-center bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                        <div class="text-xs font-bold text-slate-500 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                            <i class="fa-solid ${subtestData.id === 'soal_08' ? 'fa-cube' : 'fa-puzzle-piece'} text-[#003865]"></i>
                            <span>${subtestData.id === 'soal_08' ? 'Kubus Soal yang Ditanyakan:' : 'Potongan Bentuk yang Harus Disusun:'}</span>
                        </div>
                        <div class="flex justify-center items-center p-2.5 bg-white rounded-xl shadow-xs border border-slate-200/80">
                            <img src="${encodeURI(soal.gambarSoal)}" alt="Soal Nomor ${noUrut}" 
                                 class="max-w-full h-auto max-h-[140px] sm:max-h-[160px] object-contain select-none" 
                                 draggable="false" loading="eager">
                        </div>
                    </div>

                    <!-- 4. INPUT PILIHAN GANDA (RADIO BUTTON A, B, C, D, E BERDESAIN MODERN) -->
                    ${contentInputHtml}
                </div>

                <!-- Footer Bantuan -->
                <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>${subtestData.id === 'soal_08' ? 'Carilah kubus yang dimaksudkan (yang diputar/digulingkan) dari pilihan yang ada.' : 'Carilah di antara bentuk A, B, C, D, E bentuk yang dibangun dengan menyusun potongan itu.'}</span>
                    <span>${subtestName}</span>
                </div>
            `;
        } else {
            soalHtml = `
                <div>
                    <!-- Baris Atas: Nomor Urut (misal: "1 Soal 1 dari 20") dan Badge Status Jawaban -->
                    <div class="flex items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-100">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-[#003865] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                ${noUrut}
                            </span>
                            <span class="text-sm sm:text-base font-bold text-slate-700">${labelNomorSoal}</span>
                        </div>

                        ${badgeStatusJawaban}
                    </div>

                    <!-- Teks Pertanyaan Soal: Proporsional dan tidak terlalu tebal (disamakan seperti Soal 01, deret angka diberi spasi lega) -->
                    <div class="my-5">
                        <h3 class="text-base sm:text-xl font-bold text-slate-800 leading-relaxed ${subtestData.id === 'soal_06' ? 'deret-angka-text' : ''}" ${subtestData.id === 'soal_06' ? 'style="word-spacing: 1.5rem;"' : ''}>
                            ${soal.pertanyaan}
                        </h3>
                    </div>

                    <!-- Konten Jawaban: Radio Button untuk 01-03, Kolom Isian untuk 04-06 -->
                    ${contentInputHtml}
                </div>

                <!-- Footer Bantuan -->
                <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>${isIsian ? 'Ketikkan jawaban pada kolom isian di atas.' : 'Pilih salah satu radio button untuk menjawab.'}</span>
                    <span>${subtestName}</span>
                </div>
            `;
        }

        kartu.innerHTML = soalHtml;

        // Auto focus input isian jika ada
        if (isIsian) {
            const inputEl = document.getElementById('input_jawaban_aktif');
            if (inputEl) {
                inputEl.focus({ preventScroll: true });
            }
        }

        // Update tombol navigasi
        const btnPrev = document.getElementById('btn-soal-sebelumnya');
        const btnNext = document.getElementById('btn-soal-selanjutnya');
        const btnNextLabel = document.getElementById('btn-next-label');

        if (btnPrev) {
            btnPrev.disabled = istLogic.currentSoalIndex === 0;
        }

        if (btnNext && btnNextLabel) {
            const isLast = istLogic.currentSoalIndex === totalSoal - 1;
            if (isLast) {
                btnNextLabel.textContent = "Selesai";
                btnNext.classList.remove('bg-[#003865]', 'hover:bg-[#0b4578]');
                btnNext.classList.add('bg-emerald-700', 'hover:bg-emerald-800');
            } else {
                btnNextLabel.textContent = "Selanjutnya";
                btnNext.classList.remove('bg-emerald-700', 'hover:bg-emerald-800');
                btnNext.classList.add('bg-[#003865]', 'hover:bg-[#0b4578]');
            }
        }

        this.updatePalette();
    },

    // =====================================================================
    // 4. PENGUNCIAN LAYAR & SCREEN SELESAI
    // =====================================================================

    /**
     * Mengunci seluruh elemen interaktif saat waktu ujian habis
     */
    kunciLayar() {
        const radioCards = document.querySelectorAll('.radio-option-card');
        radioCards.forEach(card => {
            card.classList.add('pointer-events-none', 'opacity-60');
        });

        const inputs = document.querySelectorAll('#fase-ujian-wrapper input');
        inputs.forEach(inp => inp.disabled = true);

        const btnPrev = document.getElementById('btn-soal-sebelumnya');
        const btnNext = document.getElementById('btn-soal-selanjutnya');
        if (btnPrev) btnPrev.disabled = true;
        if (btnNext) btnNext.disabled = true;
    },

    /**
     * Merender layar penyelesaian Soal 01
     * PENTING: Jangan tampilkan benar/salah kepada peserta di layar!
     * @param {Object} skorJson Objek hasil kalkulasi
     */
    renderSelesai(skorJson) {
        const container = this.getContainer();
        if (!container) return;

        // Pusatkan kartu secara vertikal pada viewport layar
        const section = document.getElementById('view-ist');
        if (section) {
            section.classList.remove('justify-start');
            section.classList.add('justify-center');
            section.style.minHeight = 'calc(100vh - 4.5rem)';
        }

        const totalDijawab = Object.keys(istLogic.jawabanPeserta).length;
        const totalSoal = istSubtes01.soal.length;

        container.innerHTML = `
            <div class="ist-selesai-card w-full mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 sm:p-12 space-y-7 animate-fade-in my-6 sm:my-10" style="max-width: min(92vw, 48rem);">
                <div class="w-24 h-24 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-4xl font-black shadow-inner">
                    <i class="fa-solid fa-circle-check"></i>
                </div>

                <div>
                    <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#edf3f9] text-[#003865] uppercase tracking-wider">Subtes 01 Selesai</span>
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-800 mt-3">Subtes 01 Telah Ditutup</h2>
                    <p class="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed max-w-lg mx-auto">Seluruh jawaban Anda untuk 20 soal telah berhasil disimpan ke sistem asesmen.</p>
                </div>

                <!-- Ringkasan Peserta (Aman, Tanpa Menampilkan Kunci Jawaban / Benar-Salah) -->
                <div class="bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200 text-left space-y-3.5 text-xs sm:text-sm text-slate-700 max-w-lg mx-auto">
                    <div class="flex justify-between items-center border-b border-slate-200 pb-2.5">
                        <span class="text-slate-500">ID Peserta:</span>
                        <span class="font-bold text-[#003865]">${skorJson.id_peserta}</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-slate-200 pb-2.5">
                        <span class="text-slate-500">Subtes Diselesaikan:</span>
                        <span class="font-bold text-slate-800">Subtes 01</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-slate-200 pb-2.5">
                        <span class="text-slate-500">Jumlah Soal Terisi:</span>
                        <span class="font-bold text-slate-800">${totalDijawab} dari ${totalSoal} Soal</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-500">Status Modul:</span>
                        <span class="font-bold text-emerald-600 flex items-center gap-1.5"><i class="fa-solid fa-check"></i> Tersimpan</span>
                    </div>
                </div>

                <div class="pt-2 flex flex-col gap-3 max-w-lg mx-auto">
                    <!-- Tombol Kembali ke Daftar 9 Bagian Soal IST -->
                    <button type="button" onclick="istLogic.tampilkanMenu9Subtes()"
                        class="w-full py-4 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-list-ol"></i>
                        <span>Kembali ke Daftar Subtes</span>
                    </button>

                    <!-- Tombol Simpan & Selesaikan Modul IST ke Dashboard Utama -->
                    <button type="button" onclick="istLogic.selesaiDanKembaliKeDashboard()"
                        class="w-full py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-house"></i>
                        <span>Selesai &amp; Buka Tes 2 (PAPI Kostick)</span>
                    </button>
                </div>
            </div>
        `;
    }
};

// Pastikan istUI dapat diakses secara global di window
if (typeof window !== 'undefined') {
    window.istUI = istUI;
}
