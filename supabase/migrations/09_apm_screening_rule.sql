-- =========================================================================
-- MIGRATION 09: ATURAN SKRINING SET 1 APM (MINIMAL 10 BENAR)
-- PT Altrak 1978 - Online Assessment Portal
-- Standard Resmi Raven Advanced Progressive Matrices (Set 1 sebagai Trial/Screening Test)
-- Jika Subtes 1 >= 10 Benar -> Lolos Skrining, Set 2 sah dinilai ke norma Grade I s/d V.
-- Jika Subtes 1 < 10 Benar  -> Gugur Skrining, status Diskualifikasi Skrining.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.hitung_dan_simpan_apm(
    p_id_peserta text,
    p_jawaban jsonb,
    p_pelanggaran_tab integer DEFAULT 0,
    p_durasi_detik integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    -- KUNCI MASTER RESMI (HANYA ADA DI SERVER SUPABASE, TIDAK BISA DIINTIP PESERTA)
    -- Set 1: 12 Soal
    v_kunci_set1 jsonb := '{"1":"8","2":"4","3":"5","4":"1","5":"2","6":"5","7":"6","8":"3","9":"7","10":"8","11":"7","12":"6"}'::jsonb;
    -- Set 2: 36 Soal
    v_kunci_set2 jsonb := '{"1":"5","2":"1","3":"7","4":"4","5":"3","6":"1","7":"6","8":"1","9":"8","10":"4","11":"5","12":"6","13":"2","14":"1","15":"2","16":"4","17":"6","18":"7","19":"3","20":"8","21":"8","22":"7","23":"6","24":"3","25":"7","26":"2","27":"7","28":"5","29":"6","30":"5","31":"4","32":"8","33":"5","34":"1","35":"3","36":"2"}'::jsonb;

    v_jawaban_s1 jsonb := coalesce(p_jawaban->'subtes_1', '{}'::jsonb);
    v_jawaban_s2 jsonb := coalesce(p_jawaban->'subtes_2', '{}'::jsonb);

    v_skor1 integer := 0;
    v_skor2 integer := 0;
    v_total_skor integer := 0;

    v_rincian1 jsonb := '[]'::jsonb;
    v_rincian2 jsonb := '[]'::jsonb;

    v_ans text;
    v_key text;
    v_benar boolean;
    i integer;

    v_lolos_skrining boolean := false;
    v_status_skrining text := 'GUGUR SKRINING (TIDAK MEMENUHI SYARAT)';
    v_rekomendasi_hrd text;

    v_grade text := 'Grade V';
    v_persentil text := '< 10%';
    v_kategori text := 'Intelektual Rendah (Intellectually Defective)';

    v_hasil_final jsonb;
    v_target_id uuid;
BEGIN
    -- 1. Evaluasi Subtes 1 (12 Soal)
    FOR i IN 1..12 LOOP
        v_ans := coalesce(v_jawaban_s1->>i::text, '');
        v_key := v_kunci_set1->>i::text;
        v_benar := (trim(v_ans) = trim(v_key));

        IF v_benar THEN
            v_skor1 := v_skor1 + 1;
        END IF;

        v_rincian1 := v_rincian1 || jsonb_build_object(
            'no', i,
            'jawaban', v_ans,
            'kunci', v_key,
            'benar', v_benar
        );
    END LOOP;

    -- 2. Evaluasi Subtes 2 (36 Soal)
    FOR i IN 1..36 LOOP
        v_ans := coalesce(v_jawaban_s2->>i::text, '');
        v_key := v_kunci_set2->>i::text;
        v_benar := (trim(v_ans) = trim(v_key));

        IF v_benar THEN
            v_skor2 := v_skor2 + 1;
        END IF;

        v_rincian2 := v_rincian2 || jsonb_build_object(
            'no', i,
            'jawaban', v_ans,
            'kunci', v_key,
            'benar', v_benar
        );
    END LOOP;

    v_total_skor := v_skor1 + v_skor2;
    v_lolos_skrining := (v_skor1 >= 10);

    -- 3. Aturan Skrining Raven APM: Wajib Minimal 10 Benar di Subtes 1
    IF v_lolos_skrining THEN
        v_status_skrining := 'LOLOS (MEMENUHI SYARAT)';
        v_rekomendasi_hrd := 'Kandidat memenuhi ambang dasar penalaran pola. Hasil Subtes 2 valid untuk evaluasi kapasitas kognitif.';

        -- Konversi Norma Raven APM (Berdasarkan Subtes 2 / Set II)
        IF v_skor2 >= 33 THEN
            v_grade := 'Grade I';
            v_persentil := '>= 95%';
            v_kategori := 'Intelektual Superior / Luar Biasa (Intellectually Superior)';
        ELSIF v_skor2 >= 29 THEN
            v_grade := 'Grade II+';
            v_persentil := '90% - 94%';
            v_kategori := 'Intelektual Sangat Tinggi (Distinctly Above Average)';
        ELSIF v_skor2 >= 25 THEN
            v_grade := 'Grade II';
            v_persentil := '75% - 89%';
            v_kategori := 'Intelektual Di Atas Rata-rata (Above Average)';
        ELSIF v_skor2 >= 20 THEN
            v_grade := 'Grade III+';
            v_persentil := '50% - 74%';
            v_kategori := 'Intelektual Rata-rata Tinggi (High Average)';
        ELSIF v_skor2 >= 15 THEN
            v_grade := 'Grade III';
            v_persentil := '50%';
            v_kategori := 'Intelektual Rata-rata / Cukup (Average)';
        ELSIF v_skor2 >= 10 THEN
            v_grade := 'Grade IV';
            v_persentil := '25% - 49%';
            v_kategori := 'Intelektual Di Bawah Rata-rata (Below Average)';
        ELSE
            v_grade := 'Grade V';
            v_persentil := '< 10%';
            v_kategori := 'Intelektual Rendah (Intellectually Defective)';
        END IF;
    ELSE
        v_status_skrining := 'GUGUR SKRINING (TIDAK MEMENUHI SYARAT)';
        v_grade := 'Diskualifikasi Skrining';
        v_persentil := '< 10% (Gugur Set 1)';
        v_kategori := 'Tidak Memenuhi Syarat Skrining Matriks (< 10 Benar)';
        v_rekomendasi_hrd := 'Kandidat tidak memenuhi ambang batas penalaran matriks dasar (hanya ' || v_skor1::text || '/12 benar, syarat minimal 10). Hasil Subtes 2 tidak valid untuk interpretasi Grade APM lanjut.';
    END IF;

    -- 4. Rakit JSON Hasil yang kompatibel dengan renderApmResults() di HRD
    v_hasil_final := jsonb_build_object(
        'modul', 'Intelegent 3',
        'status', 'selesai',
        'skor_mentah_subtes1', v_skor1,
        'skor_mentah_subtes2', v_skor2,
        'total_skor_mentah', v_total_skor,
        'lolos_skrining', v_lolos_skrining,
        'status_skrining', v_status_skrining,
        'rekomendasi_hrd', v_rekomendasi_hrd,
        'grade', v_grade,
        'persentil', v_persentil,
        'kategori_intelektual', v_kategori,
        'pelanggaran_tab_switch', coalesce(p_pelanggaran_tab, 0),
        'durasi_detik', coalesce(p_durasi_detik, 0),
        'waktu_submit', now()::text,
        'rincian_subtes1', v_rincian1,
        'rincian_subtes2', v_rincian2,
        'answers', p_jawaban,
        'raw_answers', p_jawaban
    );

    -- 5. Safe Merge Update ke kandidat_psikotes (Tanpa updated_at)
    BEGIN
        v_target_id := p_id_peserta::uuid;
        UPDATE public.kandidat_psikotes
        SET hasil_apm = v_hasil_final
        WHERE id = v_target_id;
    EXCEPTION WHEN OTHERS THEN
        UPDATE public.kandidat_psikotes
        SET hasil_apm = v_hasil_final
        WHERE email = p_id_peserta
           OR token = p_id_peserta
           OR token_tahap_2 = p_id_peserta;
    END;

    -- Kembalikan hasil ke pemanggil
    RETURN jsonb_build_object('success', true, 'data', v_hasil_final);
END;
$$;

-- Berikan izin akses eksekusi ke anon dan authenticated
GRANT EXECUTE ON FUNCTION public.hitung_dan_simpan_apm(text, jsonb, integer, integer) TO anon, authenticated;

