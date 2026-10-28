-- =========================================================================
-- MIGRATION 03: MODUL TES GRAFIS (DAP, BAUM/POHON, HOUSE-TREE-PERSON)
-- PT Altrak 1978 - Online Assessment Portal
-- Idempotent Migration: Aman dijalankan berulang kali tanpa merusak data
-- =========================================================================

-- 1. Tambah kolom hasil_grafis (tipe JSONB) ke tabel kandidat_psikotes jika belum ada
ALTER TABLE public.kandidat_psikotes 
ADD COLUMN IF NOT EXISTS hasil_grafis JSONB DEFAULT NULL;

-- 2. Update fungsi update_hasil_tes_aman agar mengizinkan kolom hasil_grafis
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
    IF p_kolom NOT IN (
        'hasil_grafis', 'hasil_pauli', 'hasil_ist', 'hasil_papi', 'hasil_disc',
        'hasil_msdt', 'hasil_epps', 'hasil_cfit', 'hasil_mbti', 'hasil_mcmi',
        'jawaban_ist', 'jawaban_disc',
        'token_tahap_2', 'status_tahap_2', 'waktu_selesai', 'waktu_selesai_tahap2'
    ) THEN
        RETURN json_build_object('success', false, 'pesan', 'Kolom tidak diizinkan untuk diperbarui.');
    END IF;

    SELECT true INTO v_is_valid
    FROM public.kandidat_psikotes
    WHERE id::text = p_kandidat_id
      AND session_secret = p_session_secret;

    IF NOT v_is_valid THEN
        RETURN json_build_object('success', false, 'pesan', 'Otorisasi sesi gagal: Session secret tidak cocok.');
    END IF;

    EXECUTE format(
        'UPDATE public.kandidat_psikotes SET %I = $1, waktu_selesai = to_char(now(), ''YYYY-MM-DD HH24:MI:SS'') WHERE id::text = $2 AND session_secret = $3',
        p_kolom
    ) USING p_payload, p_kandidat_id, p_session_secret;

    RETURN json_build_object('success', true, 'pesan', 'Data hasil tes berhasil disimpan aman.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_hasil_tes_aman(text, text, text, jsonb) TO anon, authenticated;

-- 3. Kebijakan Storage Bucket untuk Berkas Grafis (Mendukung JPG, PNG, WEBP, dan PDF maks 10MB)
-- Perbarui bucket 'foto_kandidat' agar mendukung MIME application/pdf dan ukuran hingga 10MB
UPDATE storage.buckets 
SET file_size_limit = 10485760, -- 10MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'foto_kandidat';
