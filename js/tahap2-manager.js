// =========================================================================
// PENGELOLA ASESMEN KEPEMIMPINAN TAHAP 2 (TAHAP2-MANAGER.JS)
// PT Altrak 1978 - Executive & Leadership Assessment System
// Modul: CFIT, EPPS, MSDT, MBTI
// =========================================================================

const tahap2State = {
    isTahap2Active: false,
    tokenTahap2: "",
    modulSelesai: {
        cfit: false,
        msdt: false,
        mbti: false,
        epps: false
    }
};

/**
 * Mengarahkan ke Dashboard Utama (Unifikasi Modul Tahap 2)
 */
function bukaModalTokenTahap2() {
    bukaDashboardTahap2();
}

/**
 * Menampilkan Dashboard Asesmen Kepemimpinan Tahap 2
 */
function bukaDashboardTahap2() {
    console.log('[Tahap 2] Mengarahkan ke Dashboard Utama (Unifikasi Modul)...');
    if (typeof pindahFase === 'function') {
        pindahFase('view-dashboard');
    } else if (typeof showPage === 'function') {
        showPage('page-dashboard');
    }
    if (typeof syncAllModuleCardStates === 'function') {
        syncAllModuleCardStates();
    }
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
}

/**
 * Memperbarui status kartu modul di Dashboard Tahap 2
 * Mengunci tombol tes yang sudah dikerjakan agar tidak bisa diakses kembali
 */
function updateDashboardTahap2Progress() {
    const cfitSelesai = localStorage.getItem('cfit_selesai') === 'true';
    const msdtSelesai = localStorage.getItem('msdt_selesai') === 'true';
    const mbtiSelesai = localStorage.getItem('mbti_selesai') === 'true' || localStorage.getItem('mcmi_selesai') === 'true';
    const eppsSelesai = localStorage.getItem('epps_selesai') === 'true';

    tahap2State.modulSelesai.cfit = cfitSelesai;
    tahap2State.modulSelesai.msdt = msdtSelesai;
    tahap2State.modulSelesai.mbti = mbtiSelesai;
    tahap2State.modulSelesai.epps = eppsSelesai;

    const modulConfig = [
        { key: 'msdt', isSelesai: msdtSelesai, badgeId: 'badge-status-msdt', btnId: 'btn-modul-msdt', label: 'MSDT' },
        { key: 'cfit', isSelesai: cfitSelesai, badgeId: 'badge-status-cfit', btnId: 'btn-modul-cfit', label: 'Inteligent 2' },
        { key: 'mbti', isSelesai: mbtiSelesai, badgeId: 'badge-status-mbti', btnId: 'btn-modul-mbti', label: 'MBTI' },
        { key: 'epps', isSelesai: eppsSelesai, badgeId: 'badge-status-epps', btnId: 'btn-modul-epps', label: 'EPPS' }
    ];

    modulConfig.forEach(m => {
        // 1. Update Badge Status
        const badgeEl = document.getElementById(m.badgeId);
        if (badgeEl) {
            if (m.isSelesai) {
                badgeEl.className = "text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 flex items-center gap-1";
                badgeEl.innerHTML = '<i class="fa-solid fa-check text-emerald-600"></i> Selesai';
            } else {
                badgeEl.className = "text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20";
                badgeEl.innerHTML = '<i class="fa-solid fa-clock mr-1"></i> Siap Dikerjakan';
            }
        }

        // 2. Kunci Tombol Jika Modul Sudah Selesai
        const btnEl = document.getElementById(m.btnId);
        if (btnEl) {
            if (m.isSelesai) {
                btnEl.disabled = true;
                btnEl.className = "w-full py-3.5 bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs rounded-xl shadow-none flex items-center justify-center gap-2 cursor-not-allowed select-none";
                btnEl.innerHTML = `<i class="fa-solid fa-lock text-slate-400"></i> <span>Sudah Selesai (Terkunci)</span>`;
            } else {
                btnEl.disabled = false;
                btnEl.className = "w-full py-3.5 bg-gradient-to-r from-[#003865] to-[#0a4980] hover:from-[#002747] hover:to-[#083c6b] text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer";
                btnEl.innerHTML = `<span>Mulai Tes ${m.label}</span> <i class="fa-solid fa-arrow-right"></i>`;
            }
        }
    });
}

/**
 * Konfirmasi Selesai Sesi Tahap 2 oleh Kandidat
 * Berfungsi jika kandidat hanya ditugaskan mengerjakan sebagian tes (fleksibel)
 */
async function konfirmasiSelesaiTahap2() {
    const cfitSelesai = localStorage.getItem('cfit_selesai') === 'true';
    const msdtSelesai = localStorage.getItem('msdt_selesai') === 'true';
    const mbtiSelesai = localStorage.getItem('mbti_selesai') === 'true' || localStorage.getItem('mcmi_selesai') === 'true';
    const eppsSelesai = localStorage.getItem('epps_selesai') === 'true';

    const selesaiList = [];
    if (msdtSelesai) selesaiList.push("MSDT");
    if (cfitSelesai) selesaiList.push("Inteligent 2");
    if (mbtiSelesai) selesaiList.push("MBTI");
    if (eppsSelesai && document.getElementById('btn-modul-epps')) selesaiList.push("EPPS");

    if (selesaiList.length === 0) {
        if (typeof customAlert === 'function') {
            customAlert(
                "Belum Ada Tes Selesai",
                "Anda belum menyelesaikan modul asesmen apapun. Silakan kerjakan modul yang ditugaskan terlebih dahulu sebelum mengakhiri sesi.",
                "warning"
            );
        } else {
            alert("Anda belum menyelesaikan modul asesmen apapun.");
        }
        return;
    }

    const doFinalize = async () => {
        const btn = document.getElementById('btnFinalisasiTahap2');
        const btnText = document.getElementById('btnFinalisasiTahap2Text');
        if (btn) btn.disabled = true;
        if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengakhiri Sesi...';

        const waktuSelesaiISO = new Date().toISOString();
        if (typeof updateHasilTes === 'function') {
            try {
                await updateHasilTes('status_tahap_2', 'selesai');
                await updateHasilTes('waktu_selesai_tahap2', waktuSelesaiISO);
            } catch (e) {
                console.warn('[Finalize Tahap 2 Warning]', e);
            }
        } else {
            const idPeserta = localStorage.getItem('id_peserta');
            const sbClient = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
            if (sbClient && idPeserta) {
                try {
                    await sbClient.from('kandidat_psikotes').update({
                        status_tahap_2: 'selesai',
                        waktu_selesai_tahap2: waktuSelesaiISO
                    }).eq('id', idPeserta);
                } catch (e) {
                    console.warn('[Finalize Tahap 2]', e);
                }
            }
        }

        localStorage.setItem('altrak_tahap2_final_selesai', 'true');

        if (typeof customAlert === 'function') {
            customAlert(
                "Asesmen Tahap 2 Berhasil Diselesaikan",
                `Terima kasih! Anda telah menyelesaikan ${selesaiList.join(', ')}. Seluruh lembar jawaban Anda telah tersimpan aman dan terkirim ke Tim HRD PT Altrak 1978.`,
                "success",
                false,
                () => {
                    pindahFase('view-selesai');
                }
            );
        } else {
            alert("Asesmen Tahap 2 Berhasil Diselesaikan.");
            pindahFase('view-selesai');
        }
    };

    const pesanKonfirmasi = `Anda telah menyelesaikan modul: ${selesaiList.join(', ')}. Apakah Anda yakin ingin mengakhiri sesi Asesmen Tahap 2 dan mengunci seluruh lembar jawaban sekarang?`;

    if (typeof customAlert === 'function') {
        customAlert(
            "Akhiri & Kunci Asesmen Tahap 2?",
            pesanKonfirmasi,
            "warning",
            true,
            () => { doFinalize(); }
        );
    } else {
        if (confirm(pesanKonfirmasi)) {
            doFinalize();
        }
    }
}

/**
 * Menandai seluruh rangkaian asesmen kepemimpinan selesai 100%
 */
async function selesaikanSeluruhTahap2() {
    const waktuISO = new Date().toISOString();
    if (typeof updateHasilTes === 'function') {
        try {
            await updateHasilTes('status_tahap_2', 'selesai');
            await updateHasilTes('waktu_selesai', waktuISO);
        } catch (e) {
            console.warn('[Selesaikan Seluruh Tahap 2 Warning]', e);
        }
    } else {
        const idPeserta = localStorage.getItem('id_peserta');
        const sbClient = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabase;
        if (sbClient && idPeserta) {
            try {
                await sbClient.from('kandidat_psikotes').update({
                    status_tahap_2: 'selesai',
                    waktu_selesai: waktuISO
                }).eq('id', idPeserta);
            } catch (e) {
                console.warn('[Tahap 2] Gagal update status_tahap_2:', e);
            }
        }
    }
}

function bukaModulMSDT() {
    if (localStorage.getItem('msdt_selesai') === 'true') {
        if (typeof customAlert === 'function') {
            customAlert(
                "Modul Telah Selesai",
                "Tes MSDT telah berhasil Anda selesaikan dan lembar jawaban sudah tersimpan aman di server PT Altrak 1978. Modul ini telah dikunci untuk menjaga integritas data.",
                "info"
            );
        } else {
            alert("Tes MSDT telah selesai dan dikunci.");
        }
        return;
    }

    if (typeof window.startMsdtTest === 'function') {
        window.startMsdtTest();
    } else if (typeof pindahFase === 'function') {
        pindahFase('view-msdt');
    }
}

function bukaModulEPPS() {
    if (localStorage.getItem('epps_selesai') === 'true') {
        if (typeof customAlert === 'function') {
            customAlert(
                "Modul Telah Selesai",
                "Tes EPPS telah berhasil Anda selesaikan dan lembar jawaban sudah tersimpan aman di server PT Altrak 1978. Modul ini telah dikunci untuk menjaga integritas data.",
                "info"
            );
        } else {
            alert("Tes EPPS telah selesai dan dikunci.");
        }
        return;
    }

    if (typeof window.startEppsTest === 'function') {
        window.startEppsTest();
    } else if (typeof pindahFase === 'function') {
        pindahFase('view-epps');
    }
}

function bukaModulCFIT() {
    if (localStorage.getItem('cfit_selesai') === 'true') {
        if (typeof customAlert === 'function') {
            customAlert(
                "Modul Telah Selesai",
                "Tes Inteligent 2 telah berhasil Anda selesaikan dan lembar jawaban sudah tersimpan aman di server PT Altrak 1978. Modul ini telah dikunci untuk menjaga integritas data.",
                "info"
            );
        } else {
            alert("Tes Inteligent 2 telah selesai dan dikunci.");
        }
        return;
    }

    if (typeof window.startCfitTest === 'function') {
        window.startCfitTest();
    } else if (typeof pindahFase === 'function') {
        pindahFase('view-cfit');
    }
}

function bukaModulMBTI() {
    if (localStorage.getItem('mbti_selesai') === 'true' || localStorage.getItem('mcmi_selesai') === 'true') {
        if (typeof customAlert === 'function') {
            customAlert(
                "Modul Telah Selesai",
                "Tes MBTI telah berhasil Anda selesaikan dan lembar jawaban sudah tersimpan aman di server PT Altrak 1978. Modul ini telah dikunci untuk menjaga integritas data.",
                "info"
            );
        } else {
            alert("Tes MBTI telah selesai dan dikunci.");
        }
        return;
    }

    if (typeof window.startMbtiTest === 'function') {
        window.startMbtiTest();
    } else if (typeof pindahFase === 'function') {
        pindahFase('view-mbti');
    }
}

if (typeof window !== 'undefined') {
    window.tahap2State = tahap2State;
    window.bukaModalTokenTahap2 = bukaModalTokenTahap2;
    window.bukaDashboardTahap2 = bukaDashboardTahap2;
    window.updateDashboardTahap2Progress = updateDashboardTahap2Progress;
    window.selesaikanSeluruhTahap2 = selesaikanSeluruhTahap2;
    window.konfirmasiSelesaiTahap2 = konfirmasiSelesaiTahap2;
    window.bukaModulMSDT = bukaModulMSDT;
    window.bukaModulEPPS = bukaModulEPPS;
    window.bukaModulCFIT = bukaModulCFIT;
    window.bukaModulMBTI = bukaModulMBTI;
}

