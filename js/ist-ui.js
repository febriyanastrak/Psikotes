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
                btnCancel.innerHTML = cancelText.includes('<') ? cancelText : `<span>${cancelText}</span>`;
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
                cardClass = "border-emerald-200 bg-white hover:shadow-md";
                btnHtml = `
                    <button type="button" onclick="istLogic.pilihSubtes(${subNoInt})" 
                        class="w-full py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-rotate-right"></i>
                        <span>Buka Kembali Soal ${sub.no}</span>
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
                        <span>Mulai Soal ${sub.no}</span>
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
                        <span>Selesaikan Soal ${prevCode} Dahulu</span>
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

                        <!-- Penamaan Resmi: HANYA Menggunakan Teks Soal 01 s/d Soal 09 Sesuai Aturan Mutlak -->
                        <div class="mb-4">
                            <h3 class="font-extrabold text-slate-800 text-lg md:text-xl leading-snug">
                                Soal ${sub.no}
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
                                <span>TES IST</span>
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-wide">Daftar Bagian Soal</h2>
                            <p class="text-xs sm:text-sm text-blue-100/80 max-w-xl">
                                Ujian terdiri dari 9 bagian soal (Soal 01 s/d Soal 09) yang <strong>wajib dikerjakan secara berurutan</strong> dimulai dari Soal 01.
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

                <!-- Tombol Kembali ke Dashboard Utama -->
                <div class="pt-4 text-center">
                    <button type="button" onclick="if(typeof pindahFase === 'function') pindahFase('view-dashboard'); else if(typeof showPage === 'function') showPage('view-dashboard');"
                        class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#003865] bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm transition hover:border-[#b9d0e7]">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Kembali ke Dashboard Utama</span>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    // =====================================================================
    // 2. FASE PERCOBAAN (CONTOH SOAL: WAKTU 30 DETIK & PESERTA KLIK SENDIRI)
    // =====================================================================

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
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;
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
                    <div id="card-hafalan-soal-09" class="bg-gradient-to-br from-slate-50 via-white to-sky-50/40 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
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
                            <img src="${item.gambarSoal}" alt="Panduan Contoh ${subtestName}" class="max-w-full h-auto object-contain rounded-xl select-none" draggable="false">
                        </div>

                        <!-- Kotak Cara Mengerjakan (dari properti penjelasan) tepat di bawah gambar panduan -->
                        ${item.penjelasan ? `
                            <div class="rounded-r-2xl p-4 sm:p-5 mt-4 mb-2 shadow-xs" style="background-color: #FFF8E1; border-left: 5px solid #d97706;">
                                <div class="font-black text-slate-900 mb-1.5 flex items-center gap-2 text-sm sm:text-base">
                                    <i class="fa-solid fa-lightbulb text-amber-500 text-lg"></i>
                                    <span>Cara Mengerjakan:</span>
                                </div>
                                <p class="text-slate-800 leading-relaxed font-medium pl-6 text-sm sm:text-base">
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
                            <span>Silakan coba ketikkan jawaban pada kolom isian di bawah ini:</span>
                        </label>
                        <div class="relative max-w-md">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <i class="fa-solid ${isAngka ? 'fa-calculator' : 'fa-keyboard'} text-sm text-slate-400"></i>
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

                    <!-- KOTAK PENJELASAN: Tepat di bawah form input, alert box warna krem muda (#FFF8E1) & border tebal oranye di sisi kiri -->
                    ${item.penjelasan ? `
                        <div class="rounded-r-2xl p-4 sm:p-5 mt-4 mb-3 shadow-xs" style="background-color: #FFF8E1; border-left: 5px solid #d97706;">
                            <div class="font-black text-slate-900 mb-1.5 flex items-center gap-2 text-sm sm:text-base">
                                <i class="fa-solid fa-lightbulb text-amber-500 text-lg"></i>
                                <span>Cara Mengerjakan:</span>
                            </div>
                            <p class="text-slate-800 leading-relaxed font-medium pl-6 text-sm">
                                ${item.penjelasan}
                            </p>
                        </div>
                    ` : ''}
                `;
            } else {
                // Pilihan Ganda (A - E) untuk Soal 01, 02, 03, 07, 08
                const isPilihanGambar = item.tipe === 'pilihan_gambar' || subtestData.id === 'soal_08' || subtestData.id === 'soal_07';

                contohInteractionHtml = `
                    <!-- Cara Mengerjakan / Penjelasan Resmi -->
                    ${item.penjelasan ? `
                        <div class="rounded-r-2xl p-4 sm:p-5 mb-4 shadow-xs" style="background-color: #FFF8E1; border-left: 5px solid #d97706;">
                            <div class="font-black text-slate-900 mb-1.5 flex items-center gap-2 text-sm sm:text-base">
                                <i class="fa-solid fa-lightbulb text-amber-500 text-lg"></i>
                                <span>Cara Mengerjakan:</span>
                            </div>
                            <p class="text-slate-800 leading-relaxed font-medium pl-6 text-sm">
                                ${item.penjelasan}
                            </p>
                        </div>
                    ` : ''}

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
                                            class="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl border ${borderCls} cursor-pointer transition-all select-none shadow-xs hover:border-[#003865]">
                                            <span class="w-8 h-8 rounded-xl ${badgeCls} flex items-center justify-center text-xs sm:text-sm font-black mb-1 transition-colors">
                                                ${optKey}
                                            </span>
                                            <span class="text-xs font-bold text-slate-700 text-center">${optText || ('Bentuk ' + optKey)}</span>
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
                            <span>Contoh ${hurufContoh}</span>
                        </div>

                        <!-- Kunci Jawaban Diberitahukan Secara Terbuka (Badge Hijau Muda) -->
                        <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <i class="fa-solid fa-key text-[11px]"></i> Kunci Jawaban: ${item.jawabanBenar}
                        </span>
                    </div>

                    <!-- Gambar Opsi Patokan Jika Ada (Contoh Soal 08) -->
                    ${item.gambarOpsi ? `
                        <div class="mb-4 bg-slate-50/90 p-3 sm:p-4 rounded-2xl border border-slate-200">
                            <div class="text-xs font-black text-[#003865] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <i class="fa-solid fa-shapes text-amber-500"></i>
                                <span>${subtestData.id === 'soal_08' ? 'Pilihan Kubus Patokan (A, B, C, D, E):' : 'Pilihan Bentuk Patokan (A, B, C, D, E):'}</span>
                            </div>
                            <div class="flex justify-center items-center overflow-x-auto">
                                <img src="${item.gambarOpsi}" alt="Pilihan Patokan" class="max-w-full h-auto max-h-[105px] sm:max-h-[120px] object-contain select-none" draggable="false">
                            </div>
                        </div>
                    ` : ''}

                    <!-- Gambar Soal Contoh Jika Ada (Contoh Soal 08) -->
                    ${item.gambarSoal ? `
                        <div class="mb-4 bg-slate-50/90 p-3 sm:p-4 rounded-2xl border border-slate-200">
                            <div class="text-xs font-black text-[#003865] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <i class="fa-solid ${subtestData.id === 'soal_08' ? 'fa-cube' : 'fa-puzzle-piece'} text-[#003865]"></i>
                                <span>${subtestData.id === 'soal_08' ? 'Contoh Soal Kubus (Kedudukan Kubus):' : 'Contoh Soal Bentuk:'}</span>
                            </div>
                            <div class="flex justify-center items-center overflow-x-auto">
                                <img src="${item.gambarSoal}" alt="Contoh Soal" class="max-w-full h-auto max-h-[120px] sm:max-h-[140px] object-contain select-none" draggable="false">
                            </div>
                        </div>
                    ` : ''}

                    <!-- Pertanyaan Contoh: Proporsional dan tidak terlalu tebal (disamakan seperti Soal 01, deret angka diberi spasi lega) -->
                    <p class="text-slate-800 font-bold text-base md:text-lg mb-3.5 leading-relaxed ${subtestData.id === 'soal_06' ? 'deret-angka-text' : ''}" ${subtestData.id === 'soal_06' ? 'style="word-spacing: 1.5rem;"' : ''}>
                        ${item.pertanyaan}
                    </p>

                    <!-- Interaksi Contoh (Isian untuk 04-06 atau Pilihan Ganda untuk 01-03, 08) -->
                    ${contohInteractionHtml}

                    <!-- Status Pilihan Peserta -->
                    <div id="status-pilihan-contoh-${contohNo}" class="mt-3">
                        ${this.generateKeteranganContohHtml(item, jawabanTerpilih)}
                    </div>
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

                    <!-- Waktu Berjalan Fase Percobaan (30 Detik / 3 Menit) -->
                    <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shrink-0 self-start sm:self-auto">
                        <div class="w-8 h-8 rounded-full bg-[#f5b300] text-[#051627] flex items-center justify-center font-black text-sm">
                            <i class="fa-solid ${isHafalan ? 'fa-brain' : 'fa-hourglass-half'}"></i>
                        </div>
                        <div class="text-left">
                            <div class="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">${isHafalan ? 'Waktu Menghafal' : 'Waktu Mempelajari'}</div>
                            <div id="contoh-timer-display" class="text-lg font-black text-[#ffbe1a]">
                                ${sisaDetik >= 60 ? `${Math.floor(sisaDetik / 60)}:${String(sisaDetik % 60).padStart(2, '0')}` : `${sisaDetik} Detik`}
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
                            <span>Kembali ke Daftar Bagian Soal</span>
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
                highlightedText: "Soal-soal <strong>01 – 20</strong> terdiri atas kalimat-kalimat rumpang. Pada setiap kalimat terdapat <strong>satu kata yang hilang</strong> dan disediakan <strong>5 (lima) kata pilihan</strong> sebagai penggantinya. Pilihlah kata yang paling tepat untuk menyempurnakan kalimat tersebut.",
                steps: [
                    { no: "1", title: "Cermati Kalimat", desc: "Baca kalimat rumpang secara utuh dan pahami maksud maknanya." },
                    { no: "2", title: "Bandingkan 5 Pilihan", desc: "Cermati kelima kata pilihan pengganti (A, B, C, D, E) yang disediakan." },
                    { no: "3", title: "Pilih Kata Tepat", desc: "Klik pada satu kata yang paling tepat menyempurnakan kalimat itu." }
                ],
                tips: "Gunakan waktu 30 detik untuk mencoba Contoh A dan B di bawah ini sebelum memasuki ujian utama."
            },
            2: {
                formatLabel: "Pilihan Ganda (A - E)",
                formatIcon: "fa-list-ol",
                highlightedText: "Ditentukan <strong>5 (lima) kata</strong> pada setiap butir soal. Pada <strong>4 dari 5 kata</strong> tersebut terdapat suatu <strong>kesamaan sifat atau kategori</strong>. Carilah <strong>kata kelima yang berbeda</strong> atau tidak memiliki kesamaan dengan keempat kata lainnya.",
                steps: [
                    { no: "1", title: "Amati 5 Kata", desc: "Baca kelima pilihan kata yang disajikan pada soal dengan teliti." },
                    { no: "2", title: "Temukan Kesamaan 4 Kata", desc: "Cari hubungan atau kategori yang menyatukan 4 kata di antaranya." },
                    { no: "3", title: "Pilih Kata Ganjil", desc: "Pilih 1 kata yang berdiri sendiri dan tidak termasuk ke dalam kategori itu." }
                ],
                tips: "Perhatikan penjelasan pada Contoh A dan B di bawah untuk melihat pola kata yang dikecualikan."
            },
            3: {
                formatLabel: "Pilihan Ganda (A - E)",
                formatIcon: "fa-arrows-split-up-and-left",
                highlightedText: "Ditentukan <strong>3 (tiga) kata</strong>. Antara kata pertama dan kata kedua terdapat <strong>suatu hubungan logika tertentu</strong>. Antara kata ketiga dan salah satu di antara 5 pilihan kata harus terdapat <strong>hubungan yang sama persis</strong>. Carilah kata pengganti tanda tanya (?) tersebut.",
                steps: [
                    { no: "1", title: "Analisis Pasangan Pertama", desc: "Temukan rumus hubungan logika antara kata pertama dan kata kedua." },
                    { no: "2", title: "Terapkan ke Kata Ketiga", desc: "Gunakan aturan hubungan yang sama persis untuk dipasangkan dengan kata ketiga." },
                    { no: "3", title: "Pilih Pasangan Tepat", desc: "Pilih kata (A, B, C, D, E) yang menggenapi hubungan analogi tersebut." }
                ],
                tips: "Pahami analogi pada Contoh A (hutan : pohon = tembok : ?) dan Contoh B di bawah."
            },
            4: {
                formatLabel: "Kolom Isian (Ketik Kata)",
                formatIcon: "fa-keyboard",
                highlightedText: "Ditentukan <strong>dua perkataan</strong> pada setiap butir soal. Carilah <strong>satu perkataan payung / kategori umum</strong> yang dapat mencakup dan meliputi pengertian kedua kata tadi. <strong>Ketikkan perkataan itu</strong> langsung pada kolom yang disediakan.",
                steps: [
                    { no: "1", title: "Amati Sepasang Kata", desc: "Cermati kedua kata yang ditampilkan (contoh: ayam – itik)." },
                    { no: "2", title: "Cari Kategori Payung", desc: "Tentukan satu perkataan umum yang membawahi keduanya (contoh: burung)." },
                    { no: "3", title: "Ketikkan Jawaban", desc: "Ketik perkataan jawaban pada kolom isian (tidak ada tombol radio A-E)." }
                ],
                tips: "Gunakan satu kata umum yang tepat. Coba ketikkan jawaban pada kotak latihan contoh di bawah."
            },
            5: {
                formatLabel: "Kolom Isian (Ketik Angka)",
                formatIcon: "fa-calculator",
                highlightedText: "Persoalan berikutnya adalah <strong>soal-soal hitungan matematika</strong>. Hitunglah persoalan yang diberikan dan <strong>ketikkan angka jawaban akhir</strong> secara langsung pada kolom isian yang telah disediakan.",
                steps: [
                    { no: "1", title: "Pahami Cerita Hitungan", desc: "Cermati persoalan matematika dan tentukan operasi hitung yang diperlukan." },
                    { no: "2", title: "Kalkulasi Mandiri", desc: "Hitung dengan teliti tanpa menggunakan alat bantu seperti kalkulator." },
                    { no: "3", title: "Ketikkan Angka", desc: "Ketikkan hanya angka hasil akhir pada kolom jawaban (contoh: 75)." }
                ],
                tips: "Hanya ketikkan angka jawaban. Coba ketikkan angka pada contoh hitungan di bawah."
            },
            6: {
                formatLabel: "Kolom Isian (Ketik Angka)",
                formatIcon: "fa-arrow-trend-up",
                highlightedText: "Diberikan suatu <strong>barisan deret angka</strong>. Setiap deret tersusun menurut <strong>suatu aturan atau pola matematika tertentu</strong> dan dapat dilanjutkan. Carilah <strong>angka kelanjutan berikutnya</strong> dari deret tersebut dan <strong>ketikkan angka jawaban</strong> pada kolom yang disediakan.",
                steps: [
                    { no: "1", title: "Analisis Pola Deret", desc: "Amati lompatan antar angka (apakah ditambah, dikurang, dikali, atau berselang-seling)." },
                    { no: "2", title: "Hitung Angka Lanjutan", desc: "Terapkan aturan pola tersebut untuk menentukan angka pengganti tanda tanya (?)." },
                    { no: "3", title: "Ketikkan Angka", desc: "Ketikkan angka kelanjutan tersebut langsung pada kolom jawaban." }
                ],
                tips: "Pola dapat berupa operasi bertingkat atau berselang-seling. Coba pelajari contoh deret di bawah."
            },
            7: {
                formatLabel: "Pilihan Ganda Gambar (A - E)",
                formatIcon: "fa-shapes",
                highlightedText: "Setiap soal memperlihatkan suatu <strong>bentuk tertentu yang terpotong menjadi beberapa bagian</strong>. Carilah di antara bentuk-bentuk patokan yang ditentukan <strong>(A, B, C, D, E)</strong> bentuk yang dibangun dengan cara <strong>menyusun potongan-potongan itu secara utuh</strong>.",
                steps: [
                    { no: "1", title: "Amati Potongan Gambar", desc: "Lihat potongan-potongan bentuk pada gambar soal dengan seksama." },
                    { no: "2", title: "Bayangkan Susunannya", desc: "Gabungkan potongan dalam pikiran (potongan boleh diputar tetapi tidak boleh dibalik)." },
                    { no: "3", title: "Cocokkan Patokan (A-E)", desc: "Pilih bentuk patokan A, B, C, D, atau E yang terbentuk dari potongan itu." }
                ],
                tips: "Pada ujian utama, gambar master patokan (A - E) akan selalu menempel (sticky) di bagian atas layar."
            },
            8: {
                formatLabel: "Pilihan Ganda Kubus (A - E)",
                formatIcon: "fa-cube",
                highlightedText: "Ditentukan 5 buah <strong>kubus patokan (A, B, C, D, E)</strong>. Pada tiap kubus terdapat enam tanda yang berlainan pada setiap sisinya. Tentukan kubus patokan manakah yang <strong>kedudukannya sama persis</strong> dengan kubus soal.",
                steps: [
                    { no: "1", title: "Amati Kubus Soal", desc: "Cermati tiga sisi tampak dan tanda-tanda pada kubus soal." },
                    { no: "2", title: "Putar atau Gulingkan", desc: "Bayangkan kubus patokan diputar atau digulingkan ke berbagai arah." },
                    { no: "3", title: "Pilih Kubus Patokan", desc: "Pilih kubus A, B, C, D, atau E yang identik dengan kubus soal." }
                ],
                tips: "Gambar patokan kubus (A - E) akan selalu menempel (sticky) di bagian atas layar selama ujian."
            },
            9: {
                formatLabel: "Tes Hafalan Kata",
                formatIcon: "fa-brain",
                highlightedText: "Anda akan diberikan waktu <strong>3 menit untuk menghafal</strong> kata-kata di bawah ini. Anda <strong>TIDAK DIPERKENANKAN mencatat</strong>. Setelah 3 menit, halaman akan otomatis berpindah ke soal ujian.",
                steps: [
                    { no: "1", title: "Fokus Menghafal", desc: "Cermati 5 kelompok kategori kata (Bunga, Perkakas, Burung, Kesenian, Binatang)." },
                    { no: "2", title: "Ingat Kata & Awalan", desc: "Hafalkan kata-kata dalam kelompok dan huruf permulaannya tanpa mencatat." },
                    { no: "3", title: "Kerjakan Ujian", desc: "Pada ujian utama, tentukan kategori kata berdasarkan huruf permulaan yang ditanyakan." }
                ],
                tips: "Waktu menghafal 3 Menit. Fokuskan perhatian Anda pada layar dan jangan mencatat."
            }
        };

        const config = configMap[subtestNo] || {
            formatLabel: "Petunjuk Soal",
            formatIcon: "fa-circle-info",
            highlightedText: subtestData.petunjuk || "",
            steps: [
                { no: "1", title: "Pahami Petunjuk", desc: "Baca seluruh arahan pengerjaan dengan cermat." },
                { no: "2", title: "Pelajari Contoh", desc: "Perhatikan contoh soal dan kunci jawaban yang disajikan." },
                { no: "3", title: "Kerjakan Ujian", desc: "Jawab setiap butir soal sesuai waktu yang ditentukan." }
            ],
            tips: "Gunakan sesi percobaan ini sebaik mungkin untuk memahami cara menjawab."
        };

        const stepsHtml = config.steps.map(step => `
            <div class="bg-white/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-start gap-3 transition-all hover:border-[#b9d0e7] hover:shadow-xs">
                <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-[#003865] to-[#0a4980] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                    ${step.no}
                </div>
                <div class="min-w-0">
                    <h4 class="text-xs sm:text-sm font-black text-slate-800 leading-tight">${step.title}</h4>
                    <p class="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed mt-1">${step.desc}</p>
                </div>
            </div>
        `).join('');

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
                <div class="bg-white/95 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs mb-4">
                    <p class="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
                        ${config.highlightedText}
                    </p>
                </div>

                <!-- 3 Langkah Kunci Pengerjaan -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
                    ${stepsHtml}
                </div>

                <!-- Banner Catatan Pengingat / Tips Bawah -->
                <div class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs sm:text-[13px] font-semibold">
                    <i class="fa-solid fa-lightbulb text-amber-500 text-sm sm:text-base shrink-0"></i>
                    <span class="leading-snug">${config.tips}</span>
                </div>
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
            if (sisaDetik >= 60) {
                const m = Math.floor(sisaDetik / 60);
                const s = sisaDetik % 60;
                timerDisplay.textContent = `${m}:${String(s).padStart(2, '0')}`;
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
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;
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
                    <!-- Header Atas: Judul Soal (misal: "06 Soal 06") & Status Pengerjaan (TANPA WAKTU) -->
                    <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div class="flex items-center gap-3">
                            <span class="w-9 h-9 rounded-2xl bg-[#003865] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                ${subtestCode}
                            </span>
                            <div>
                                <h2 class="text-lg sm:text-xl font-black text-[#003865] leading-tight">${subtestCode} ${subtestName}</h2>
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
                <button type="button" onclick="istLogic.lompatKeSoal(${idx})" class="${cls}" title="Nomor ${noUrut}">
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
        const subtestName = subtestData.nama || `Soal ${subtestCode}`;

        const soal = subtestData.soal[istLogic.currentSoalIndex];
        if (!soal) return;

        const totalSoal = subtestData.soal.length;
        const offset = (istLogic.getSubtestOffset && typeof istLogic.getSubtestOffset === 'function')
            ? istLogic.getSubtestOffset(istLogic.currentSubtestNo)
            : 0;
        const noUrut = offset + (istLogic.currentSoalIndex + 1);

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
                                    class="radio-option-card flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl border ${cardBorderCls} cursor-pointer transition-all select-none shadow-xs hover:border-[#003865]">
                                    
                                    <div class="flex items-center gap-1.5 sm:gap-2 mb-1.5">
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

                                    <span class="text-[11px] sm:text-xs font-semibold text-center text-slate-600">Bentuk ${optKey}</span>
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
                    <div class="relative max-w-md">
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
                    <div class="sticky-patokan-card sticky top-0 z-50" style="position: sticky; top: 0; z-index: 50; background-color: #F8FAFC; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 10px; margin-bottom: 24px; border: 1px solid #E2E8F0; border-radius: 16px;">
                        <div class="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-200/80">
                            <span class="inline-flex items-center gap-1.5 text-xs font-black text-[#003865] uppercase tracking-wider">
                                <i class="fa-solid fa-shapes text-amber-500"></i>
                                <span>${subtestData.id === 'soal_08' ? 'Pilihan Kubus Patokan (A, B, C, D, E)' : 'Pilihan Bentuk Patokan (A, B, C, D, E)'}</span>
                            </span>
                        </div>
                        <div class="flex justify-center items-center overflow-x-auto">
                            <img src="${soal.gambarOpsi}" alt="Pilihan Bentuk A-E" 
                                 class="sticky-patokan-img select-none transition-all" 
                                 style="max-height: 100px; width: 100%; object-fit: contain;"
                                 draggable="false" loading="eager">
                        </div>
                    </div>

                    <!-- 2. Header Bar: Nomor Urut Soal & Badge Status Jawaban -->
                    <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-[#003865] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                ${noUrut}
                            </span>
                            <span class="text-sm sm:text-base font-bold text-slate-700">Soal ${noUrut}</span>
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
                            <img src="${soal.gambarSoal}" alt="Soal Nomor ${noUrut}" 
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
                            <span class="text-sm sm:text-base font-bold text-slate-700">Soal ${noUrut}</span>
                        </div>

                        ${badgeStatusJawaban}
                    </div>

                    <!-- Teks Pertanyaan Soal: Proporsional dan tidak terlalu tebal (disamakan seperti Soal 01, deret angka diberi spasi lega) -->
                    <div class="my-5">
                        <h3 class="text-base sm:text-lg font-bold text-slate-800 leading-relaxed ${subtestData.id === 'soal_06' ? 'deret-angka-text' : ''}" ${subtestData.id === 'soal_06' ? 'style="word-spacing: 1.5rem;"' : ''}>
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

        const totalDijawab = Object.keys(istLogic.jawabanPeserta).length;
        const totalSoal = istSubtes01.soal.length;

        container.innerHTML = `
            <div class="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 space-y-6 animate-fade-in">
                <div class="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
                    <i class="fa-solid fa-circle-check"></i>
                </div>

                <div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#edf3f9] text-[#003865] uppercase tracking-wider">Soal 01 Selesai</span>
                    <h2 class="text-2xl font-black text-slate-800 mt-2">Soal 01 Telah Ditutup</h2>
                    <p class="text-sm text-slate-500 mt-2">Seluruh jawaban Anda untuk 20 butir soal telah berhasil disimpan ke sistem asesmen.</p>
                </div>

                <!-- Ringkasan Peserta (Aman, Tanpa Menampilkan Kunci Jawaban / Benar-Salah) -->
                <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3">
                    <div class="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                        <span class="text-slate-500">ID Peserta:</span>
                        <span class="font-bold text-[#003865]">${skorJson.id_peserta}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                        <span class="text-slate-500">Bagian Diselesaikan:</span>
                        <span class="font-bold text-slate-800">Soal 01</span>
                    </div>
                    <div class="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                        <span class="text-slate-500">Jumlah Soal Terisi:</span>
                        <span class="font-bold text-slate-800">${totalDijawab} dari ${totalSoal} Soal</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-500">Status Modul:</span>
                        <span class="font-bold text-emerald-600">Tersimpan</span>
                    </div>
                </div>

                <div class="pt-2 flex flex-col gap-3">
                    <!-- Tombol Kembali ke Daftar 9 Bagian Soal IST -->
                    <button type="button" onclick="istLogic.tampilkanMenu9Subtes()"
                        class="w-full py-3.5 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-list-ol"></i>
                        <span>Kembali ke Daftar Bagian Soal</span>
                    </button>

                    <!-- Tombol Simpan & Selesaikan Modul IST ke Dashboard Utama -->
                    <button type="button" onclick="istLogic.selesaiDanKembaliKeDashboard()"
                        class="w-full py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer">
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
