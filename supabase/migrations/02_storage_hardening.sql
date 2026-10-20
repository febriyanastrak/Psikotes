-- =========================================================================
-- MIGRATION 02: STORAGE HARDENING (PRIVATE BUCKET & ACCESS POLICIES)
-- PT Altrak 1978 - Online Assessment Portal
-- Idempotent Migration: Aman dijalankan berulang kali tanpa merusak data
-- =========================================================================

-- 1. Pastikan bucket 'foto_kandidat' ada dan bersifat PRIVATE (bukan public)
-- Mencegah akses langsung via URL publik tanpa otentikasi admin
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'foto_kandidat', 
    'foto_kandidat', 
    false, 
    5242880, -- Batas 5MB per file foto
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE 
SET public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Update baris jika bucket sudah dibuat sebelumnya agar status public pasti false
UPDATE storage.buckets 
SET public = false 
WHERE id = 'foto_kandidat';

-- -------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) PADA STORAGE.OBJECTS
-- (RLS pada storage.objects sudah aktif secara otomatis bawaan Supabase)
-- -------------------------------------------------------------------------

-- Bersihkan policy lama terkait bucket foto_kandidat untuk mencegah konflik
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anon Upload Foto Kandidat" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon upload foto_kandidat" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin read foto_kandidat" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete foto_kandidat" ON storage.objects;
DROP POLICY IF EXISTS "Admin Full Access Foto Kandidat" ON storage.objects;
DROP POLICY IF EXISTS "Admin Read Foto Kandidat" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Foto Kandidat" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Foto Kandidat" ON storage.objects;

-- -------------------------------------------------------------------------
-- 3. POLICY ANONYMOUS (PESERTA UJIAN):
-- Hanya boleh INSERT (Upload foto webcam selama tes)
-- Anonymous TIDAK BOLEH SELECT (Download/Lihat foto orang lain), UPDATE, atau DELETE
-- -------------------------------------------------------------------------
CREATE POLICY "Anon Upload Foto Kandidat"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
    bucket_id = 'foto_kandidat'
);

-- -------------------------------------------------------------------------
-- 4. POLICY ADMIN HRD (AUTHENTICATED & TERDAFTAR DI admin_users):
-- Hanya user admin HRD yang lolos fungsi public.is_admin() yang boleh
-- membaca (SELECT), mengunduh via Signed URL, memperbarui, atau menghapus foto
-- -------------------------------------------------------------------------
CREATE POLICY "Admin Full Access Foto Kandidat"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'foto_kandidat' 
    AND public.is_admin()
)
WITH CHECK (
    bucket_id = 'foto_kandidat' 
    AND public.is_admin()
);
