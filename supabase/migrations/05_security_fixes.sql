-- =========================================================================
-- MIGRATION 05: SECURITY & DATABASE WHITELIST HARDENING
-- PT Altrak 1978 - Online Assessment Portal
-- Menambahkan whitelist 'hasil_apm' pada update_hasil_tes_aman
-- Idempotent Migration: Aman dijalankan berulang kali tanpa merusak data
-- =========================================================================

-- 1. Pastikan kolom hasil_apm (tipe JSONB) ada di tabel kandidat_psikotes
ALTER TABLE public.kandidat_psikotes 
ADD COLUMN IF NOT EXISTS hasil_apm JSONB DEFAULT NULL;

-- 2. Update fungsi update_hasil_tes_aman agar mengizinkan kolom 'hasil_apm'
--    Mendukung penyimpanan offline queue dan sinkronisasi fallback
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
    -- Whitelist seluruh modul resmi tes PT Altrak 1978
    IF p_kolom NOT IN (
        'hasil_grafis', 'hasil_apm', 'hasil_pauli', 'hasil_ist', 'hasil_papi', 'hasil_disc',
        'hasil_msdt', 'hasil_epps', 'hasil_cfit', 'hasil_mbti', 'hasil_mcmi',
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

    -- Eksekusi update secara aman (tanpa menyentuh kolom updated_at yang tidak ada)
    EXECUTE format(
        'UPDATE public.kandidat_psikotes SET %I = $1, waktu_selesai = to_char(now(), ''YYYY-MM-DD HH24:MI:SS'') WHERE id::text = $2 AND session_secret = $3',
        p_kolom
    ) USING p_payload, p_kandidat_id, p_session_secret;

    RETURN json_build_object('success', true, 'pesan', 'Data hasil tes berhasil disimpan aman.');
END;
$$;

-- Berikan izin akses eksekusi ke peran anon dan authenticated
REVOKE ALL ON FUNCTION public.update_hasil_tes_aman(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_hasil_tes_aman(text, text, text, jsonb) TO anon, authenticated;

