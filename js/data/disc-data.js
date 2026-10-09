// =========================================================================
// DATA 24 SOAL TES DISC - PT Altrak 1978
// Teks asli diambil dari 'Software_Skoring_DISC.xls' sheet 'DISC Test'.
// CATATAN KEAMANAN: kunci dimensi D/I/S/C TIDAK disimpan di sini.
// Kunci hanya ada di Supabase (fungsi public.disc_kunci()), tidak bisa dibaca via F12.
// =========================================================================
const DISC_QUESTIONS = [
  { no: 1, statements: [
      "Gampangan, Mudah setuju",
      "Percaya, Mudah percaya pada orang",
      "Petualang, Mengambil resiko",
      "Toleran, Menghormati"
    ] },
  { no: 2, statements: [
      "Lembut suara, Pendiam",
      "Optimistik, Visioner",
      "Pusat Perhatian, Suka gaul",
      "Pendamai, Membawa Harmoni"
    ] },
  { no: 3, statements: [
      "Menyemangati orang",
      "Berusaha sempurna",
      "Bagian dari kelompok",
      "Ingin membuat tujuan"
    ] },
  { no: 4, statements: [
      "Menjadi frustrasi",
      "Menyimpan perasaan saya",
      "Menceritakan sisi saya",
      "Siap beroposisi"
    ] },
  { no: 5, statements: [
      "Hidup, Suka bicara",
      "Gerak cepat, Tekun",
      "Usaha menjaga keseimbangan",
      "Usaha mengikuti aturan"
    ] },
  { no: 6, statements: [
      "Kelola waktu secara efisien",
      "Sering terburu-buru, Merasa tertekan",
      "Masalah sosial itu penting",
      "Suka selesaikan apa yang saya mulai"
    ] },
  { no: 7, statements: [
      "Tolak perubahan mendadak",
      "Cenderung janji berlebihan",
      "Tarik diri di tengah tekanan",
      "Tidak takut bertempur"
    ] },
  { no: 8, statements: [
      "Penyemangat yang baik",
      "Pendengar yang baik",
      "Penganalisa yang baik",
      "Delegator yang baik"
    ] },
  { no: 9, statements: [
      "Hasil adalah penting",
      "Lakukan dengan benar, Akurasi penting",
      "Dibuat menyenangkan",
      "Mari kerjakan bersama"
    ] },
  { no: 10, statements: [
      "Akan berjalan terus tanpa kontrol diri",
      "Akan membeli sesuai dorongan hati",
      "Akan menunggu, Tanpa tekanan",
      "Akan mengusahakan  yang kuinginkan"
    ] },
  { no: 11, statements: [
      "Ramah, Mudah bergabung",
      "Unik, Bosan rutinitas",
      "Aktif mengubah sesuatu",
      "Ingin hal-hal yang pasti"
    ] },
  { no: 12, statements: [
      "Non-konfrontasi, Menyerah",
      "Dipenuhi hal detail",
      "Perubahan pada menit terakhir",
      "Menuntut, Kasar"
    ] },
  { no: 13, statements: [
      "Ingin kemajuan",
      "Puas dengan segalanya",
      "Terbuka memperlihatkan perasaan",
      "Rendah hati, Sederhana"
    ] },
  { no: 14, statements: [
      "Tenang, Pendiam",
      "Bahagia, Tanpa beban",
      "Menyenangkan, Baik hati",
      "Tak gentar, Berani"
    ] },
  { no: 15, statements: [
      "Menggunakan waktu berkualitas dgn teman",
      "Rencanakan masa depan, Bersiap",
      "Bepergian demi petualangan baru",
      "Menerima ganjaran atas tujuan yg dicapai"
    ] },
  { no: 16, statements: [
      "Aturan perlu dipertanyakan",
      "Aturan membuat adil",
      "Aturan membuat bosan",
      "Aturan membuat aman"
    ] },
  { no: 17, statements: [
      "Pendidikan, Kebudayaan",
      "Prestasi, Ganjaran",
      "Keselamatan, keamanan",
      "Sosial, Perkumpulan kelompok"
    ] },
  { no: 18, statements: [
      "Memimpin, Pendekatan langsung",
      "Suka bergaul, Antusias",
      "Dapat diramal, Konsisten",
      "Waspada, Hati-hati"
    ] },
  { no: 19, statements: [
      "Tidak mudah dikalahkan",
      "Kerjakan sesuai perintah, Ikut pimpinan",
      "Mudah terangsang, Riang",
      "Ingin segalanya teratur, Rapi"
    ] },
  { no: 20, statements: [
      "Saya akan pimpin mereka",
      "Saya akan melaksanakan",
      "Saya akan meyakinkan mereka",
      "Saya dapatkan fakta"
    ] },
  { no: 21, statements: [
      "Memikirkan orang dahulu",
      "Kompetitif, Suka tantangan",
      "Optimis, Positif",
      "Pemikir logis, Sistematik"
    ] },
  { no: 22, statements: [
      "Menyenangkan orang, Mudah setuju",
      "Tertawa lepas, Hidup",
      "Berani, Tak gentar",
      "Tenang, Pendiam"
    ] },
  { no: 23, statements: [
      "Ingin otoritas lebih",
      "Ingin kesempatan baru",
      "Menghindari konflik",
      "Ingin petunjuk yang jelas"
    ] },
  { no: 24, statements: [
      "Dapat diandalkan, Dapata dipercaya",
      "Kreatif, Unik",
      "Garis dasar, Orientasi hasil",
      "Jalankan standar yang tinggi, Akurat"
    ] },
];

if (typeof window !== 'undefined') {
    window.DISC_QUESTIONS = DISC_QUESTIONS;
}
