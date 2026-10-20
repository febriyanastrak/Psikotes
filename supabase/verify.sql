-- =========================================================================
-- VERIFIKASI KEAMANAN SUPABASE DATABASE (AUDIT QUERY)
-- PT Altrak 1978 - Online Assessment Portal
-- Jalankan query ini di Supabase SQL Editor untuk memverifikasi hardening
-- =========================================================================

-- 1. CEK STATUS ROW LEVEL SECURITY (RLS) PADA SEMUA TABEL
-- Hasil yang diharapkan: rowsecurity = true untuk kandidat_psikotes, token_ujian, admin_users
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_aktif
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('kandidat_psikotes', 'token_ujian', 'admin_users', 'token_claim_attempts')
ORDER BY tablename;

-- 2. CEK DAFTAR POLICY AKTIF PADA TABEL
-- Memastikan tidak ada policy anon yang mengizinkan SELECT seluruh baris
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. CEK HAK AKSES EKSEKUSI FUNGSI RPC OLEH ANON DAN PUBLIC
-- Memastikan fungsi admin (buat_batch_token, hapus_semua_data, ist_kunci, dll.)
-- TIDAK BISA dipanggil oleh anon maupun PUBLIC
SELECT 
    routine_schema,
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_schema = 'public'
  AND grantee IN ('anon', 'PUBLIC')
  AND routine_name IN (
      'is_admin', 
      'buat_batch_token', 
      'hapus_token_ujian', 
      'bersihkan_token_terpakai', 
      'hapus_semua_token', 
      'hapus_semua_data',
      'ist_kunci',
      'klaim_token_ujian',
      'daftar_kandidat',
      'update_hasil_tes_aman'
  )
ORDER BY routine_name, grantee;

-- 4. CEK PRIVASI STORAGE BUCKETS
-- Memastikan bucket foto_kandidat terdaftar dan status public-nya terpantau
SELECT 
    id, 
    name, 
    public,
    created_at
FROM storage.buckets
WHERE name IN ('foto_kandidat');

-- 5. CEK DAFTAR ADMIN YANG TERDAFTAR DI TABEL admin_users
SELECT 
    a.user_id,
    a.email,
    u.email AS auth_email,
    a.created_at
FROM public.admin_users a
LEFT JOIN auth.users u ON a.user_id = u.id;

-- 6. CEK POLICY KEAMANAN STORAGE.OBJECTS (FOTO_KANDIDAT)
-- Memastikan Anon hanya boleh INSERT, dan Admin memiliki full access
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
