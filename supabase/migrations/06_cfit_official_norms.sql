-- =========================================================================
-- MIGRATION 06: PENYELARASAN NORMA RESMI CFIT SKALA 3A (DEWASA 16+)
-- PT Altrak 1978 - Online Assessment Portal
-- Diselaraskan 100% dengan file 'Software Skorings CFIT Skala 3A & 3B.xls'
-- Kunci jawaban tersimpan aman di Database Server Supabase (Zero Client Leak)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.hitung_dan_simpan_cfit(
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
    -- KUNCI RESMI 50 SOAL (CATTELL CFIT SKALA 3A FORM A)
    -- Subtes 1: 13 Soal
    v_kunci1 jsonb := '{"1":"B","2":"C","3":"B","4":"D","5":"E","6":"B","7":"D","8":"B","9":"F","10":"C","11":"B","12":"B","13":"E"}'::jsonb;
    -- Subtes 2: 14 Soal (2 Pilihan)
    v_kunci2 jsonb := '{"1":"BE","2":"AE","3":"AD","4":"CE","5":"BE","6":"AD","7":"BE","8":"BE","9":"AD","10":"BD","11":"AE","12":"CD","13":"BC","14":"AB"}'::jsonb;
    -- Subtes 3: 13 Soal
    v_kunci3 jsonb := '{"1":"E","2":"E","3":"E","4":"B","5":"C","6":"D","7":"E","8":"E","9":"A","10":"A","11":"F","12":"C","13":"C"}'::jsonb;
    -- Subtes 4: 10 Soal
    v_kunci4 jsonb := '{"1":"B","2":"A","3":"D","4":"D","5":"A","6":"B","7":"C","8":"D","9":"A","10":"D"}'::jsonb;

    -- TABEL NORMA RESMI IQ (RS 0 s/d 50 -> IQ 38 s/d 183)
    -- Diambil 100% persis dari Sheet 'CFIT 3A&3B (16+)$' Kolom C26:C27
    v_norma_iq constant integer[] := ARRAY[
        38, 40, 43, 45, 47, 48, 52, 55, 57, 60,
        63, 67, 70, 72, 75, 78, 81, 85, 88, 91,
        94, 96, 100, 103, 106, 109, 113, 116, 119, 121,
        124, 128, 131, 133, 137, 140, 142, 145, 149, 152,
        155, 157, 161, 165, 167, 169, 173, 176, 179, 183, 183
    ];

    v_jawaban_s1 jsonb := coalesce(p_jawaban->'subtes_1', '{}'::jsonb);
    v_jawaban_s2 jsonb := coalesce(p_jawaban->'subtes_2', '{}'::jsonb);
    v_jawaban_s3 jsonb := coalesce(p_jawaban->'subtes_3', '{}'::jsonb);
    v_jawaban_s4 jsonb := coalesce(p_jawaban->'subtes_4', '{}'::jsonb);

    v_s1 integer := 0;
    v_s2 integer := 0;
    v_s3 integer := 0;
    v_s4 integer := 0;
    v_total_benar integer := 0;
    v_iq integer := 38;

    v_rincian jsonb := '[]'::jsonb;
    v_ans text;
    v_key text;
    v_benar boolean;
    i integer;
    v_elem text;
    v_arr text[];

    v_kategori text := 'Mentally Defective';
    v_hasil_final jsonb;
    v_target_id uuid;
BEGIN
    -- 1. Evaluasi Subtes 1 (13 Soal)
    FOR i IN 1..13 LOOP
        v_ans := upper(trim(coalesce(v_jawaban_s1->>i::text, '')));
        v_key := v_kunci1->>i::text;
        v_benar := (v_ans <> '' AND v_ans = v_key);

        IF v_benar THEN
            v_s1 := v_s1 + 1;
        END IF;

        v_rincian := v_rincian || jsonb_build_object(
            'subtes', 1,
            'no', i,
            'jawaban', v_ans,
            'nilai', CASE WHEN v_benar THEN 1 ELSE 0 END
        );
    END LOOP;

    -- 2. Evaluasi Subtes 2 (14 Soal - Multi-select / Pasangan)
    FOR i IN 1..14 LOOP
        -- Tangani jika jawaban berbentuk array JSON ["B", "E"] atau string "BE"
        IF jsonb_typeof(v_jawaban_s2->i::text) = 'array' THEN
            SELECT string_agg(upper(trim(x)), '' ORDER BY upper(trim(x)))
            INTO v_ans
            FROM jsonb_array_elements_text(v_jawaban_s2->i::text) AS x;
        ELSE
            -- Urutkan huruf string (misal "EB" menjadi "BE")
            v_ans := upper(trim(coalesce(v_jawaban_s2->>i::text, '')));
            IF length(v_ans) = 2 THEN
                IF substr(v_ans, 1, 1) > substr(v_ans, 2, 1) THEN
                    v_ans := substr(v_ans, 2, 1) || substr(v_ans, 1, 1);
                END IF;
            END IF;
        END IF;

        v_key := v_kunci2->>i::text;
        v_benar := (v_ans <> '' AND v_ans = v_key);

        IF v_benar THEN
            v_s2 := v_s2 + 1;
        END IF;

        v_rincian := v_rincian || jsonb_build_object(
            'subtes', 2,
            'no', i,
            'jawaban', coalesce(v_ans, '-'),
            'nilai', CASE WHEN v_benar THEN 1 ELSE 0 END
        );
    END LOOP;

    -- 3. Evaluasi Subtes 3 (13 Soal)
    FOR i IN 1..13 LOOP
        v_ans := upper(trim(coalesce(v_jawaban_s3->>i::text, '')));
        v_key := v_kunci3->>i::text;
        v_benar := (v_ans <> '' AND v_ans = v_key);

        IF v_benar THEN
            v_s3 := v_s3 + 1;
        END IF;

        v_rincian := v_rincian || jsonb_build_object(
            'subtes', 3,
            'no', i,
            'jawaban', v_ans,
            'nilai', CASE WHEN v_benar THEN 1 ELSE 0 END
        );
    END LOOP;

    -- 4. Evaluasi Subtes 4 (10 Soal)
    FOR i IN 1..10 LOOP
        v_ans := upper(trim(coalesce(v_jawaban_s4->>i::text, '')));
        v_key := v_kunci4->>i::text;
        v_benar := (v_ans <> '' AND v_ans = v_key);

        IF v_benar THEN
            v_s4 := v_s4 + 1;
        END IF;

        v_rincian := v_rincian || jsonb_build_object(
            'subtes', 4,
            'no', i,
            'jawaban', v_ans,
            'nilai', CASE WHEN v_benar THEN 1 ELSE 0 END
        );
    END LOOP;

    v_total_benar := v_s1 + v_s2 + v_s3 + v_s4;

    -- 5. Konversi Skor Mentah ke IQ Resmi (Array 1-indexed: 1 = RS 0, 51 = RS 50)
    v_iq := v_norma_iq[least(greatest(v_total_benar + 1, 1), 51)];

    -- 6. Tentukan Kategori Kecerdasan Standar CFIT
    IF v_iq >= 130 THEN
        v_kategori := 'Very Superior';
    ELSIF v_iq >= 120 THEN
        v_kategori := 'Superior';
    ELSIF v_iq >= 110 THEN
        v_kategori := 'High Average';
    ELSIF v_iq >= 90 THEN
        v_kategori := 'Average';
    ELSIF v_iq >= 80 THEN
        v_kategori := 'Low Average';
    ELSIF v_iq >= 70 THEN
        v_kategori := 'Borderline';
    ELSE
        v_kategori := 'Mentally Defective';
    END IF;

    -- 7. Susun JSON hasil yang kompatibel 100% dengan renderCfitResults() di HRD
    v_hasil_final := jsonb_build_object(
        'modul', 'Inteligent 2',
        'status', 'selesai',
        'total_benar', v_total_benar,
        'raw_score', v_total_benar,
        'skor_iq', v_iq,
        'iq_score', v_iq,
        'kategori_iq', v_kategori,
        'kategori', v_kategori,
        'pelanggaran_tab_switch', coalesce(p_pelanggaran_tab, 0),
        'durasi_detik', coalesce(p_durasi_detik, 0),
        'waktu_submit', now()::text,
        'rincian_subtes', jsonb_build_object(
            's1', v_s1,
            's2', v_s2,
            's3', v_s3,
            's4', v_s4
        ),
        'rincian_jawaban', v_rincian,
        'answers', p_jawaban,
        'raw_answers', p_jawaban
    );

    -- 8. Safe Update ke tabel kandidat_psikotes (Tanpa updated_at)
    BEGIN
        v_target_id := p_id_peserta::uuid;
        UPDATE public.kandidat_psikotes
        SET hasil_cfit = v_hasil_final
        WHERE id = v_target_id;
    EXCEPTION WHEN OTHERS THEN
        UPDATE public.kandidat_psikotes
        SET hasil_cfit = v_hasil_final
        WHERE email = p_id_peserta
           OR token = p_id_peserta
           OR token_tahap_2 = p_id_peserta;
    END;

    RETURN jsonb_build_object('success', true, 'data', v_hasil_final);
END;
$$;

-- Alias kompatibilitas jika dipanggil hitung_skor_cfit
CREATE OR REPLACE FUNCTION public.hitung_skor_cfit(
    p_id_peserta text,
    p_jawaban jsonb,
    p_pelanggaran_tab integer DEFAULT 0,
    p_durasi_detik integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT public.hitung_dan_simpan_cfit(p_id_peserta, p_jawaban, p_pelanggaran_tab, p_durasi_detik);
$$;

-- Berikan izin akses eksekusi ke anon dan authenticated
REVOKE ALL ON FUNCTION public.hitung_dan_simpan_cfit(text, jsonb, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hitung_dan_simpan_cfit(text, jsonb, integer, integer) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.hitung_skor_cfit(text, jsonb, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hitung_skor_cfit(text, jsonb, integer, integer) TO anon, authenticated;

