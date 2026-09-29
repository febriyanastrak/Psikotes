// =========================================================================
// LOGIKA TAMPILAN DAN MANIPULASI DOM (IST UI)
// PT ALTRAK 1978 - MODUL TES IST
// =========================================================================

const istUI = {
    /**
     * Mengambil elemen container utama IST
     */
    getContainer() {
        return document.getElementById('ist-app-container');
    },

    /**
     * Merender Dashboard Modul Tes IST (Daftar Soal 01 s/d Soal 09)
     * @param {Array} completedList Daftar ID soal yang telah diselesaikan (misal: ['soal_01'])
     */
    renderDashboard(completedList = []) {
        const container = this.getContainer();
        if (!container) return;

        const uniqueCompleted = [...new Set(completedList.map(id => String(id).replace('soal_', '')))];

        const subtestsHtml = IST_DAFTAR_SUBTES.map((sub, idx) => {
            const isCompleted = completedList.includes(sub.no) || completedList.includes(`soal_${sub.no}`);
            const isAvailable = ["01", "02", "03", "04", "05", "06"].includes(sub.no); // Soal 01 s/d 06 aktif

            let statusBadge = '';
            let actionBtn = '';
            let cardBorder = 'border-slate-200';

            if (isCompleted) {
                statusBadge = `
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <i class="fa-solid fa-circle-check"></i> Selesai
                    </span>
                `;
                actionBtn = `
                    <button type="button" onclick="istLogic.mulaiSoal('${sub.no}')" 
                        class="w-full py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-rotate-right"></i>
                        <span>Buka Kembali ${sub.nama}</span>
                    </button>
                `;
                cardBorder = 'border-emerald-200';
            } else if (isAvailable) {
                statusBadge = `
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Siap Dikerjakan
                    </span>
                `;
                actionBtn = `
                    <button type="button" onclick="istLogic.mulaiSoal('${sub.no}')" 
                        class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
                        <span>Mulai ${sub.nama}</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                `;
                cardBorder = 'border-[#003865] ring-2 ring-[#003865]/10';
            } else {
                statusBadge = `
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200">
                        <i class="fa-solid fa-lock text-[11px]"></i> Terkunci
                    </span>
                `;
                actionBtn = `
                    <button type="button" disabled 
                        class="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                        <i class="fa-solid fa-lock text-xs"></i>
                        <span>Menunggu Bagian Sebelumnya</span>
                    </button>
                `;
            }

            return `
                <div class="bg-white rounded-3xl p-6 border ${cardBorder} shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="w-9 h-9 rounded-2xl bg-[#003865] text-white flex items-center justify-center font-black text-sm shadow-xs">
                                ${sub.no}
                            </span>
                            ${statusBadge}
                        </div>
                        <h3 class="text-lg font-black text-slate-800 tracking-tight mb-1">${sub.nama}</h3>
                        <p class="text-xs text-slate-500 font-medium mb-4">${sub.jumlahSoal} Butir Pertanyaan</p>
                    </div>
                    <div class="pt-2">
                        ${actionBtn}
                    </div>
                </div>
            `;
        }).join('');

        const html = `
            <div class="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
                <!-- Banner Header Dashboard IST -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#071f38] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#0a4980] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#f5b300] text-[#051627] uppercase tracking-wider mb-2">
                            <span>Sistem Asesmen Psikotes</span>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">Dashboard Soal IST</h2>
                        <p class="text-slate-300 text-sm mt-1 max-w-xl leading-relaxed">
                            Rangkaian tes Intelligence Structure Test (IST) PT Altrak 1978. Silakan selesaikan setiap bagian soal secara berurutan.
                        </p>
                    </div>
                    <div class="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 text-center shrink-0">
                        <div class="text-xs text-slate-300 uppercase tracking-wider font-semibold">Status Pengerjaan</div>
                        <div class="text-xl font-black text-[#ffbe1a] mt-0.5">${uniqueCompleted.length} / 9 Bagian Selesai</div>
                    </div>
                </div>

                <!-- Grid Daftar 9 Subtes IST -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${subtestsHtml}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Merender Fase Contoh Soal (Waktu 30 Detik di background)
     * Menampilkan contoh soal beserta teks 'Cara Mengerjakan' di bawah pilihan ganda
     * @param {Object} dataSoal Objek data soal (istSoal01)
     */
    renderFaseContoh(dataSoal, jawabanContoh = {}) {
        const container = this.getContainer();
        if (!container) return;

        const contohCardsHtml = dataSoal.contoh.map((item, idx) => {
            const nomorContohStr = item.no || (idx === 0 ? '01' : '02');
            const contohNo = item.no;
            const isIsian = item.tipe === 'isian';
            const userVal = (jawabanContoh && jawabanContoh[contohNo]) || '';

            let formInputHtml = '';
            if (isIsian) {
                const isAngka = dataSoal.id === 'soal_05' || dataSoal.id === 'soal_06';
                formInputHtml = `
                    <div class="pt-2 max-w-2xl space-y-2.5">
                        <label for="contoh_input_${contohNo}" class="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600">
                            ${isAngka ? 'Coba Ketik Angka Jawaban:' : 'Coba Ketik Kata Jawaban:'}
                        </label>
                        <div class="relative flex items-center">
                            <div class="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-400">
                                <i class="${isAngka ? 'fa-solid fa-calculator' : 'fa-solid fa-pen-fancy'} text-base sm:text-lg"></i>
                            </div>
                            <input type="text" 
                                inputmode="${isAngka ? 'numeric' : 'text'}"
                                id="contoh_input_${contohNo}"
                                name="contoh_${contohNo}" 
                                value="${userVal}" 
                                oninput="${isAngka ? "this.value = this.value.replace(/[^0-9]/g, ''); " : ""}istLogic.simpanJawabanContoh('${contohNo}', this.value)"
                                placeholder="${isAngka ? 'Ketikkan angka jawaban di sini...' : 'Ketikkan perkataan jawaban di sini...'}" 
                                autocomplete="off"
                                class="w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-5 bg-white border-2 border-slate-300 focus:border-[#003865] rounded-2xl text-lg sm:text-xl font-black text-[#003865] placeholder:text-slate-400 placeholder:font-normal placeholder:text-base focus:outline-none focus:ring-4 focus:ring-[#003865]/10 transition shadow-2xs">
                        </div>
                    </div>
                `;
            } else if (Array.isArray(item.pilihan)) {
                const pilihanHtml = item.pilihan.map((pilihanStr) => {
                    const optKey = pilihanStr.trim().charAt(0);
                    const optText = pilihanStr.replace(/^[A-E]\.\s*/, '');
                    const isKey = optKey === item.jawabanBenar;

                    return `
                        <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition select-none ${isKey ? 'bg-emerald-50/60 border-emerald-300' : ''}">
                            <input type="radio" name="contoh_${contohNo}" value="${optKey}" 
                                onchange="istLogic.simpanJawabanContoh('${contohNo}', '${optKey}')" 
                                class="w-4 h-4 text-[#003865] focus:ring-[#003865]" ${isKey ? 'checked' : ''}>
                            <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                ${optKey}
                            </span>
                            <span class="text-sm font-medium text-slate-700">${optText}</span>
                            ${isKey ? '<span class="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Kunci Benar</span>' : ''}
                        </label>
                    `;
                }).join('');

                formInputHtml = `<div class="space-y-2">${pilihanHtml}</div>`;
            }

            return `
                <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                    <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003865] text-white font-extrabold text-xs">
                            <span>Contoh ${nomorContohStr}</span>
                        </div>
                        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                            Kunci Jawaban: ${item.jawabanBenar}
                        </span>
                    </div>

                    <!-- Pertanyaan Contoh -->
                    <p class="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                        ${item.pertanyaan}
                    </p>

                    <!-- Pilihan Ganda / Kolom Isian -->
                    ${formInputHtml}

                    <!-- Teks Cara Mengerjakan (Sesuai Aturan: Diletakkan tepat di bawah pilihan jawaban / form isian) -->
                    ${item.penjelasan ? `
                        <div class="rounded-2xl p-4 sm:p-4.5 bg-amber-50 border-l-4 border-amber-500 text-amber-950 text-xs sm:text-sm leading-relaxed shadow-xs">
                            <div class="font-extrabold text-amber-900 mb-1 flex items-center gap-2">
                                <i class="fa-solid fa-lightbulb text-amber-500"></i>
                                <span>Cara Mengerjakan:</span>
                            </div>
                            <p class="font-medium text-amber-900">${item.penjelasan}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        const html = `
            <div class="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
                <!-- Header Card Fase Contoh -->
                <div class="bg-gradient-to-r from-[#051627] via-[#003865] to-[#071f38] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-[#0a4980] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#f5b300] text-[#051627] uppercase tracking-wider mb-2">
                            <span>Fase Percobaan (30 Detik)</span>
                        </div>
                        <h2 class="text-2xl font-black text-white tracking-tight">${dataSoal.nama} - Petunjuk & Contoh Soal</h2>
                        <p class="text-slate-300 text-xs sm:text-sm mt-1">
                            Pelajari petunjuk pengerjaan dan contoh di bawah ini sebelum ujian utama dimulai.
                        </p>
                    </div>
                    <div class="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs font-semibold text-amber-300 flex items-center gap-2">
                        <i class="fa-solid fa-hourglass-half"></i>
                        <span>Waktu berjalan otomatis</span>
                    </div>
                </div>

                <!-- Petunjuk Pengerjaan Card -->
                <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
                    <div class="flex items-start gap-3.5">
                        <div class="w-10 h-10 rounded-2xl bg-[#003865] text-white flex items-center justify-center text-lg shrink-0 mt-0.5 shadow-xs">
                            <i class="fa-solid fa-bullhorn"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-sm font-black uppercase tracking-wider text-[#003865] mb-1">Petunjuk Pengerjaan:</h3>
                            <p class="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                                ${dataSoal.petunjuk}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Daftar Contoh Soal (Ke Bawah / Vertikal) -->
                <div class="space-y-6">
                    ${contohCardsHtml}
                </div>

                <!-- Action Bar Bawah -->
                <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button type="button" onclick="istLogic.tampilkanDashboard()" 
                        class="text-xs font-bold text-slate-500 hover:text-[#003865] flex items-center gap-2 transition cursor-pointer">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Kembali ke Dashboard IST</span>
                    </button>

                    <button type="button" onclick="istLogic.konfirmasiLanjutKeUjian()" 
                        class="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2.5 text-sm cursor-pointer">
                        <span>Lanjut ke ${dataSoal.nama}</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Merender Ujian Utama (Satu Per Satu / Pagination 1 Soal per Tampilan)
     * WAKTU TERSEMBUNYI TOTAL (Tidak ada tampilan hitung mundur di layar)
     * @param {Object} dataSoal Objek data soal (istSoal01)
     * @param {number} currentIndex Index soal yang sedang aktif (0 s/d 19)
     * @param {Object} jawabanPeserta Mapping jawaban peserta { 1: "A", 2: "C", ... }
     */
    renderFaseUjian(dataSoal, currentIndex = 0, jawabanPeserta = {}) {
        const container = this.getContainer();
        if (!container) return;

        const totalSoal = dataSoal.soal.length;
        const totalTerisi = Object.values(jawabanPeserta).filter(v => v !== undefined && v !== null && String(v).trim() !== '').length;

        const gridColsClass = totalSoal === 16 ? 'grid-cols-8' : 'grid-cols-10';

        // Render Palette Nomor Soal
        const paletteButtonsHtml = dataSoal.soal.map((s, idx) => {
            const no = s.no;
            const isCurrent = idx === currentIndex;
            const isAnswered = jawabanPeserta[no] !== undefined && jawabanPeserta[no] !== null && String(jawabanPeserta[no]).trim() !== '';

            let cls = 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200';
            if (isCurrent) {
                cls = 'bg-[#003865] text-white font-black shadow-md border-2 border-[#003865] ring-2 ring-[#003865]/20';
            } else if (isAnswered) {
                cls = 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold';
            }

            return `
                <button type="button" 
                    id="palette-btn-${no}"
                    onclick="istLogic.keSoal(${idx})" 
                    class="w-full h-8 sm:h-9 rounded-xl text-xs flex items-center justify-center transition cursor-pointer select-none ${cls}"
                    title="Soal ${no}">
                    ${no}
                </button>
            `;
        }).join('');

        const subtestNumber = dataSoal.id ? dataSoal.id.replace('soal_', '') : '01';

        const html = `
            <div class="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
                <!-- Baris Kontrol Atas (Tanpa Waktu / Hidden Timer) -->
                <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <span class="w-10 h-10 rounded-2xl bg-[#003865] text-white flex items-center justify-center font-black text-sm shadow-xs">
                            ${subtestNumber}
                        </span>
                        <div>
                            <h2 class="text-lg sm:text-xl font-black text-[#003865] leading-tight">${dataSoal.nama}</h2>
                            <p class="text-xs text-slate-500 font-medium">Intelligence Structure Test &bull; Total ${totalSoal} Soal</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <!-- Indikator Progres Jawaban -->
                        <span id="ujian-counter-badge" class="text-xs sm:text-sm font-bold text-[#003865] bg-[#edf3f9] px-4 py-2 rounded-full border border-[#b9d0e7]">
                            ${totalTerisi} / ${totalSoal} Terjawab
                        </span>
                    </div>
                </div>

                <!-- Palette Navigasi Nomor Soal (2 Baris Simetris) -->
                <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-2.5">
                    <div class="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                        <span class="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                            <i class="fa-solid fa-list-ol text-[#003865]"></i> Nomor Soal:
                        </span>
                        <div class="flex items-center gap-3 text-[11px]">
                            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Terjawab</span>
                            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#003865] inline-block"></span> Aktif</span>
                            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Belum</span>
                        </div>
                    </div>
                    <div id="palette-container" class="grid ${gridColsClass} gap-1.5 sm:gap-2">
                        ${paletteButtonsHtml}
                    </div>
                </div>

                <!-- Container Kartu Soal Tunggal (Satu per Satu) -->
                <div id="container-soal-aktif">
                    ${this.generateCardSoalAktifHtml(dataSoal, currentIndex, jawabanPeserta)}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Menghasilkan HTML kartu soal aktif tunggal (1 Soal)
     */
    generateCardSoalAktifHtml(dataSoal, currentIndex, jawabanPeserta) {
        const totalSoal = dataSoal.soal.length;
        const soal = dataSoal.soal[currentIndex];
        const no = soal.no;
        const currentAnswer = jawabanPeserta[no];
        const isAnswered = currentAnswer !== undefined && currentAnswer !== null && String(currentAnswer).trim() !== '';

        let answerContentHtml = '';

        if (soal.tipe === 'isian') {
            const isAngka = dataSoal.id === 'soal_05' || dataSoal.id === 'soal_06';
            const val = currentAnswer !== undefined && currentAnswer !== null ? String(currentAnswer) : '';

            answerContentHtml = `
                <div class="pt-2 max-w-xl space-y-3">
                    <label for="input-jawaban-isian" class="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600">
                        ${isAngka ? 'Jawaban Anda (Angka):' : 'Jawaban Anda (Satu Kata):'}
                    </label>

                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-400">
                            <i class="${isAngka ? 'fa-solid fa-calculator' : 'fa-solid fa-pen-fancy'} text-base sm:text-lg"></i>
                        </div>
                        <input type="text" 
                            inputmode="${isAngka ? 'numeric' : 'text'}"
                            id="input-jawaban-isian"
                            name="soal_input_active" 
                            value="${val}" 
                            oninput="${isAngka ? "this.value = this.value.replace(/[^0-9]/g, ''); " : ""}istLogic.ketikJawaban(${no}, this.value)"
                            placeholder="${isAngka ? 'Ketikkan angka jawaban Anda di sini...' : 'Ketikkan perkataan jawaban Anda di sini...'}" 
                            autocomplete="off"
                            class="w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-12 bg-white border-2 border-slate-300 focus:border-[#003865] rounded-2xl text-lg sm:text-xl font-black text-[#003865] placeholder:text-slate-400 placeholder:font-normal placeholder:text-base focus:outline-none focus:ring-4 focus:ring-[#003865]/10 transition shadow-2xs">
                        
                        <button type="button" 
                            id="btn-clear-isian"
                            onclick="const inp = document.getElementById('input-jawaban-isian'); if(inp){ inp.value=''; istLogic.ketikJawaban(${no}, ''); inp.focus(); }"
                            title="Hapus jawaban"
                            class="${val ? 'flex' : 'hidden'} absolute inset-y-0 right-0 pr-4 items-center text-slate-400 hover:text-rose-500 transition cursor-pointer">
                            <span class="w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-50 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-xmark"></i>
                            </span>
                        </button>
                    </div>

                    <p class="text-xs text-slate-400 font-medium">
                        ${isAngka ? '* Masukkan angka saja tanpa satuan (contoh: 75)' : '* Masukkan satu kata yang mencakup pengertian kedua kata di atas'}
                    </p>
                </div>
            `;
        } else if (Array.isArray(soal.pilihan)) {
            // Render opsi radio button A, B, C, D, E untuk 1 soal ini
            const radioOptionsHtml = soal.pilihan.map((pilihanStr) => {
                const optKey = pilihanStr.trim().charAt(0);
                const optText = pilihanStr.replace(/^[A-E]\.\s*/, '');
                const isSelected = currentAnswer === optKey;

                return `
                    <label class="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border ${isSelected ? 'border-[#003865] bg-[#edf3f9] text-[#003865] font-bold shadow-xs' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium'} cursor-pointer transition select-none">
                        <input type="radio" 
                            name="soal_input_active" 
                            value="${optKey}" 
                            ${isSelected ? 'checked' : ''}
                            onchange="istLogic.pilihJawaban(${no}, '${optKey}')" 
                            class="w-4 h-4 text-[#003865] focus:ring-[#003865] cursor-pointer">
                        <span class="w-7 h-7 rounded-xl ${isSelected ? 'bg-[#003865] text-white' : 'bg-slate-100 text-slate-600'} font-black text-xs flex items-center justify-center shrink-0">
                            ${optKey}
                        </span>
                        <span class="text-sm sm:text-base leading-snug">${optText}</span>
                    </label>
                `;
            }).join('');

            answerContentHtml = `<div class="space-y-2.5 pt-1">${radioOptionsHtml}</div>`;
        }

        return `
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <!-- Baris Atas Kartu: Nomor Urut & Badge Status -->
                <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div class="flex items-center gap-2.5">
                        <span class="w-8 h-8 rounded-xl bg-[#003865] text-white flex items-center justify-center font-black text-sm shadow-xs">
                            ${no}
                        </span>
                        <span class="text-sm sm:text-base font-extrabold text-slate-700">Soal ${no} dari ${totalSoal}</span>
                    </div>
                    <span id="badge-status-aktif" class="text-xs font-bold px-3 py-1 rounded-full ${isAnswered ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}">
                        ${isAnswered ? '<i class="fa-solid fa-check mr-1"></i>Sudah Dijawab' : 'Belum Dijawab'}
                    </span>
                </div>

                <!-- Teks Pertanyaan Soal (Proporsional & Tidak Terlalu Tebal) -->
                <div>
                    <h3 class="text-base sm:text-lg md:text-xl font-bold text-slate-800 leading-relaxed">
                        ${soal.pertanyaan}
                    </h3>
                </div>

                <!-- Konten Jawaban: Kolom Isian atau Opsi Radio Button -->
                ${answerContentHtml}

                <!-- Tombol Navigasi Bawah (Sebelumnya & Selanjutnya / Selesai) -->
                <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button type="button" 
                        onclick="istLogic.soalSebelumnya()" 
                        ${currentIndex === 0 ? 'disabled' : ''}
                        class="px-5 py-3 rounded-2xl border border-slate-200 ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50' : 'hover:bg-slate-50 text-slate-700 hover:border-slate-300 font-bold cursor-pointer'} text-xs sm:text-sm flex items-center gap-2 transition">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Sebelumnya</span>
                    </button>

                    ${currentIndex === totalSoal - 1 ? `
                        <button type="button" 
                            onclick="istLogic.selesaiUjianManual()" 
                            class="px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer">
                            <span>Selesai &amp; Kumpulkan</span>
                            <i class="fa-solid fa-check-double"></i>
                        </button>
                    ` : `
                        <button type="button" 
                            onclick="istLogic.soalBerikutnya()" 
                            class="px-7 py-3 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer">
                            <span>Selanjutnya</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    /**
     * Merender ulang kartu soal aktif saat berpindah nomor
     */
    renderSoalAktif(dataSoal, currentIndex, jawabanPeserta) {
        const container = document.getElementById('container-soal-aktif');
        if (container) {
            container.innerHTML = this.generateCardSoalAktifHtml(dataSoal, currentIndex, jawabanPeserta);
        }
        this.updatePaletteVisual(dataSoal, currentIndex, jawabanPeserta);
    },

    /**
     * Memperbarui visual palette nomor soal (aktif, terjawab, belum)
     */
    updatePaletteVisual(dataSoal, currentIndex, jawabanPeserta) {
        dataSoal.soal.forEach((s, idx) => {
            const no = s.no;
            const btn = document.getElementById(`palette-btn-${no}`);
            if (!btn) return;

            const isCurrent = idx === currentIndex;
            const isAnswered = jawabanPeserta[no] !== undefined && jawabanPeserta[no] !== null && String(jawabanPeserta[no]).trim() !== '';

            let cls = 'w-full h-8 sm:h-9 rounded-xl text-xs flex items-center justify-center transition cursor-pointer select-none ';
            if (isCurrent) {
                cls += 'bg-[#003865] text-white font-black shadow-md border-2 border-[#003865] ring-2 ring-[#003865]/20';
            } else if (isAnswered) {
                cls += 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold';
            } else {
                cls += 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200';
            }
            btn.className = cls;
        });
    },

    /**
     * Memperbarui visual status terjawab pada suatu kartu soal
     */
    updateCardSelection(nomorSoal, optKey, totalTerisi, totalSoal) {
        // Update badge total
        const counterBadge = document.getElementById('ujian-counter-badge');
        if (counterBadge) {
            counterBadge.textContent = `${totalTerisi} / ${totalSoal} Terjawab`;
        }

        // Update status badge kartu
        const badgeStatus = document.getElementById('badge-status-aktif');
        if (badgeStatus) {
            const hasAnswer = optKey !== undefined && optKey !== null && String(optKey).trim() !== '';
            if (hasAnswer) {
                badgeStatus.className = "text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200";
                badgeStatus.innerHTML = '<i class="fa-solid fa-check mr-1"></i>Sudah Dijawab';
            } else {
                badgeStatus.className = "text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-400";
                badgeStatus.textContent = 'Belum Dijawab';
            }
        }
    },

    /**
     * Menampilkan Custom Modal HTML/CSS (Pengganti window.alert bawaan)
     * @param {Object} config { title, message, okText, onOk, cancelText, onCancel }
     */
    showCustomModal(config = {}) {
        const modalContainer = document.getElementById('ist-custom-modal');
        if (!modalContainer) return;

        const title = config.title || 'Pemberitahuan';
        const message = config.message || '';
        const okText = config.okText || 'Lanjut ke Soal 01';
        const cancelText = config.cancelText || null;

        let buttonsHtml = '';
        if (cancelText) {
            buttonsHtml += `
                <button type="button" id="ist-modal-cancel-btn" 
                    class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer">
                    ${cancelText}
                </button>
            `;
        }
        buttonsHtml += `
            <button type="button" id="ist-modal-ok-btn" 
                class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold text-xs shadow-md transition cursor-pointer">
                ${okText}
            </button>
        `;

        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
                <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 text-center space-y-4">
                    <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-[#003865] border border-amber-500/20 flex items-center justify-center mx-auto text-2xl">
                        <i class="fa-solid fa-circle-info text-amber-500"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-slate-800">${title}</h3>
                        <p class="text-sm text-slate-600 mt-2 leading-relaxed">${message}</p>
                    </div>
                    <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        ${buttonsHtml}
                    </div>
                </div>
            </div>
        `;

        modalContainer.classList.remove('hidden');

        // Pasang event listener
        const okBtn = document.getElementById('ist-modal-ok-btn');
        if (okBtn) {
            okBtn.onclick = () => {
                this.hideCustomModal();
                if (typeof config.onOk === 'function') config.onOk();
            };
        }

        const cancelBtn = document.getElementById('ist-modal-cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.hideCustomModal();
                if (typeof config.onCancel === 'function') config.onCancel();
            };
        }
    },

    /**
     * Menyembunyikan Custom Modal
     */
    hideCustomModal() {
        const modalContainer = document.getElementById('ist-custom-modal');
        if (modalContainer) {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
        }
    }
};
