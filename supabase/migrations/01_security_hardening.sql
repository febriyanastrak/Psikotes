-- =========================================================================
-- MIGRATION 01: SECURITY HARDENING (RLS & OTORISASI AMAN)
-- PT Altrak 1978 - Online Assessment Portal
-- Menjaga 100% fungsi & kunci jawaban asli yang sudah ada di Supabase Anda
-- =========================================================================

-- 1. Pastikan ekstensi pgcrypto tersedia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------------------------
-- 2. TABEL ADMIN & FUNGSI OTORISASI (is_admin)
-- -------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin view own record" ON public.admin_users;
CREATE POLICY "Admin view own record" ON public.admin_users
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Daftarkan akun admin HRD ke admin_users
INSERT INTO public.admin_users (user_id, email)
SELECT id, email FROM auth.users 
WHERE lower(email) = 'febriyandah3@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Fungsi verifikasi status admin HRD
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN (auth.uid() IS NOT NULL) AND EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- -------------------------------------------------------------------------
-- 3. HARDENING RLS TABEL KANDIDAT & TOKEN (DATA TETAP UTUH)
-- -------------------------------------------------------------------------

-- Tambahkan kolom session_secret jika belum ada
ALTER TABLE public.kandidat_psikotes 
    ADD COLUMN IF NOT EXISTS session_secret text DEFAULT encode(gen_random_bytes(24), 'hex');

CREATE INDEX IF NOT EXISTS idx_kandidat_session_secret 
    ON public.kandidat_psikotes(id, session_secret);

-- Aktifkan RLS
ALTER TABLE public.kandidat_psikotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_ujian ENABLE ROW LEVEL SECURITY;

-- Policy Admin: HRD memiliki akses penuh untuk melihat & mengoreksi hasil
DROP POLICY IF EXISTS "Admin full access on kandidat_psikotes" ON public.kandidat_psikotes;
CREATE POLICY "Admin full access on kandidat_psikotes" ON public.kandidat_psikotes
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage token_ujian" ON public.token_ujian;
CREATE POLICY "Admin manage token_ujian" ON public.token_ujian
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy Anon: Peserta hanya boleh INSERT saat mendaftar ujian
DROP POLICY IF EXISTS "Anon insert kandidat_psikotes" ON public.kandidat_psikotes;
CREATE POLICY "Anon insert kandidat_psikotes" ON public.kandidat_psikotes
    FOR INSERT TO anon
    WITH CHECK (true);

-- Proteksi tabel cfit_master_kunci agar tidak bisa di-SELECT oleh peserta
ALTER TABLE IF EXISTS public.cfit_master_kunci ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin view cfit_master_kunci" ON public.cfit_master_kunci;
CREATE POLICY "Admin view cfit_master_kunci" ON public.cfit_master_kunci
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- -------------------------------------------------------------------------
-- 4. FUNGSI BARU UNTUK FASE 3: DAFTAR KANDIDAT & UPDATE AMAN
-- -------------------------------------------------------------------------

-- Mencegah penimpaan baris kandidat lama (selalu buat ID UUID baru & session_secret)
DROP FUNCTION IF EXISTS public.daftar_kandidat(text, text, text, text, text, text, text);
CREATE OR REPLACE FUNCTION public.daftar_kandidat(
    p_token text,
    p_nama text,
    p_email text,
    p_phone text,
    p_posisi text,
    p_domisili text,
    p_penempatan text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_token text := trim(lower(coalesce(p_token, '')));
    v_clean_nama text := trim(coalesce(p_nama, ''));
    v_clean_email text := trim(lower(coalesce(p_email, '')));
    v_clean_phone text := trim(coalesce(p_phone, ''));
    v_clean_posisi text := trim(coalesce(p_posisi, ''));
    v_clean_domisili text := trim(coalesce(p_domisili, ''));
    v_clean_penempatan text := trim(coalesce(p_penempatan, ''));
    v_token_rec record;
    v_new_id uuid := gen_random_uuid();
    v_secret text := encode(gen_random_bytes(24), 'hex');
BEGIN
    -- Validasi token sekali pakai secara atomic
    SELECT * INTO v_token_rec
    FROM public.token_ujian
    WHERE lower(token) = v_clean_token
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'pesan', 'Token tidak terdaftar.');
    END IF;

    IF lower(coalesce(v_token_rec.status, 'tersedia')) != 'tersedia' THEN
        RETURN json_build_object('success', false, 'pesan', 'Token sudah pernah digunakan.');
    END IF;

    -- Update token menjadi terpakai
    UPDATE public.token_ujian
    SET status = 'terpakai',
        digunakan_oleh = v_clean_nama,
        nomor_hp = v_clean_phone,
        waktu_digunakan = now()
    WHERE lower(token) = v_clean_token;

    -- Buat baris baru di tabel kandidat_psikotes (UUID unik)
    INSERT INTO public.kandidat_psikotes (
        id,
        nama_lengkap,
        email,
        no_wa,
        posisi,
        posisi_dilamar,
        domisili,
        penempatan,
        token,
        session_secret,
        created_at
    ) VALUES (
        v_new_id,
        v_clean_nama,
        v_clean_email,
        v_clean_phone,
        v_clean_posisi,
        v_clean_posisi,
        v_clean_domisili,
        v_clean_penempatan,
        v_clean_token,
        v_secret,
        now()
    );

    RETURN json_build_object(
        'success', true,
        'id', v_new_id,
        'session_secret', v_secret,
        'pesan', 'Pendaftaran sesi ujian berhasil.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.daftar_kandidat(text, text, text, text, text, text, text) TO anon, authenticated;

-- Update hasil tes aman yang memvalidasi session_secret
DROP FUNCTION IF EXISTS public.update_hasil_tes_aman(text, text, text, jsonb);
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
        'hasil_pauli', 'hasil_ist', 'hasil_papi', 'hasil_disc',
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

-- -------------------------------------------------------------------------
-- 5. KUNCI AKSES PADA FUNGSI-FUNGSI ASLI YANG SUDAH ANDA BUAT DI SUPABASE
-- (Hanya mencabut izin akses anonim/peserta, TANPA mengubah isi rumusnya sama sekali!)
-- -------------------------------------------------------------------------

-- Kunci akses RPC kunci jawaban asli Anda
REVOKE ALL ON FUNCTION public.ist_kunci() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ist_kunci() TO authenticated;

REVOKE ALL ON FUNCTION public.papi_kunci() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.papi_kunci() TO authenticated;

REVOKE ALL ON FUNCTION public.disc_kunci() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.disc_kunci() TO authenticated;

-- Kunci akses RPC penghapusan token agar tidak bisa dipanggil oleh peserta
REVOKE ALL ON FUNCTION public.hapus_semua_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hapus_semua_data() TO authenticated;

REVOKE ALL ON FUNCTION public.hapus_semua_token() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hapus_semua_token() TO authenticated;

REVOKE ALL ON FUNCTION public.bersihkan_token_terpakai() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bersihkan_token_terpakai() TO authenticated;

REVOKE ALL ON FUNCTION public.hapus_token_ujian(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hapus_token_ujian(text) TO authenticated;

REVOKE ALL ON FUNCTION public.buat_batch_token(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buat_batch_token(int) TO authenticated;
