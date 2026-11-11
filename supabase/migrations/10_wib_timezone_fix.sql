-- =========================================================================
-- MIGRATION 10: STANDARDISASI ZONA WAKTU WIB (Asia/Jakarta, GMT+7)
-- PT Altrak 1978 - Online Assessment Portal
-- Memperbarui RPC update_hasil_tes_aman agar menyimpan waktu_selesai
-- dalam format ISO-8601 eksplisit WIB (+07:00) secara zero-downtime.
-- =========================================================================

-- Update isi fungsi update_hasil_tes_aman tanpa mengubah signature parameter,
-- whitelist kolom, validasi session_secret, maupun izin akses (100% backward-compatible).
CREATE OR REPLACE FUNCTION public.update_hasil_tes_aman(
    p_kandidat_id text,
    p_session_secret text,
    p_kolom text,
    p_payload jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_valid boolean := false;
BEGIN
    -- Whitelist seluruh modul resmi tes PT Altrak 1978 termasuk modul 11 (DASS-21)
    IF p_kolom NOT IN (
        'hasil_grafis', 'hasil_apm', 'hasil_pauli', 'hasil_ist', 'hasil_papi', 'hasil_disc',
        'hasil_msdt', 'hasil_epps', 'hasil_cfit', 'hasil_mbti', 'hasil_mcmi',
        'hasil_dass', 'dass_selesai',
        'jawaban_ist', 'jawaban_disc',
        'token_tahap_2', 'status_tahap_2', 'waktu_selesai', 'waktu_selesai_tahap2'
    ) THEN
        RETURN json_build_object('success', false, 'pesan', 'Kolom tidak diizinkan untuk diperbarui.');
    END IF;

    -- Validasi identitas & session_secret peserta secara ketat
    SELECT true INTO v_is_valid
    FROM public.kandidat_psikotes
    WHERE id::text = p_kandidat_id
      AND session_secret = p_session_secret;

    IF NOT v_is_valid THEN
        RETURN json_build_object('success', false, 'pesan', 'Otorisasi sesi gagal: Session secret tidak cocok.');
    END IF;

    -- Eksekusi update secara aman dengan timestamp WIB eksplisit (+07:00)
    EXECUTE format(
        'UPDATE public.kandidat_psikotes SET %I = $1, waktu_selesai = to_char(now() AT TIME ZONE ''Asia/Jakarta'', ''YYYY-MM-DD"T"HH24:MI:SS"+07:00"'') WHERE id::text = $2 AND session_secret = $3',
        p_kolom
    ) USING p_payload, p_kandidat_id, p_session_secret;

    RETURN json_build_object('success', true, 'pesan', 'Data hasil tes berhasil disimpan aman.');
END;
$$;

-- Berikan izin akses eksekusi ke peran anon dan authenticated
REVOKE ALL ON FUNCTION public.update_hasil_tes_aman(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_hasil_tes_aman(text, text, text, jsonb) TO anon, authenticated;

