// =========================================================================
// BANK SOAL & DATA METRIK: MSDT (MANAGEMENT STYLE DIAGNOSTIC TEST)
// PT Altrak 1978 - Leadership & Management Assessment System
// 64 Soal Resmi & Matriks Norma Gaya Kepemimpinan Reddin 3-D Model
// =========================================================================

const MSDT_CONFIG = {
    totalSoal: 64,
    namaTes: "MSDT (Management Style Diagnostic Test)",
    waktuStandarDetik: 1800, // 30 Menit (Berjalan Senyap di Belakang Layar)
    pedoman: {
        judul: "Petunjuk & Pedoman Pengerjaan MSDT",
        deskripsi: "Pada halaman-halaman berikut, Anda akan membaca sejumlah pernyataan mengenai tindakan yang mungkin Anda lakukan dalam tugas Anda di perusahaan. Anda diminta untuk memilih salah satu pernyataan yang paling sesuai dengan diri Anda, atau paling mungkin Anda lakukan.",
        contoh: {
            a: "Saya datang ke kantor lebih awal bila sedang banyak pekerjaan.",
            b: "Saya bersedia bekerja lembur bila tugas saya belum selesai.",
            penjelasan: "Manakah dari dua pernyataan tersebut yang paling mungkin Anda lakukan? Jika Anda lebih memilih datang lebih awal daripada bekerja lembur maka pilihlah pernyataan A. Tetapi bila Anda lebih memilih bekerja lembur, maka pilihlah pernyataan B."
        },
        catatan: "Karena kedua pernyataan selalu disajikan berpasangan, mungkin saja Anda memilih pernyataan A maupun B sekaligus. Dalam hal ini, Anda tetap diminta hanya memilih satu pernyataan. Ini bukan suatu tes kemampuan teknis, tidak ada jawaban 'benar' atau 'salah'. Apapun yang Anda pilih hendaknya sungguh-sungguh menggambarkan diri Anda."
    },
    gayaKepemimpinan: {
        EXECUTIVE: {
            kode: "E",
            nama: "Executive (Eksekutif)",
            tipe: "Efektif",
            deskripsi: "Mampu memotivasi tim kerja, menetapkan standar prestasi yang tinggi, memperlakukan bawahan secara adil, dan efektif mencapai target organisasi dengan menjaga hubungan tim yang harmonis."
        },
        DEVELOPER: {
            kode: "Dv",
            nama: "Developer (Pembangun / Pembina)",
            tipe: "Efektif",
            deskripsi: "Menaruh kepercayaan penuh pada bawahan, fokus pada pengembangan potensi anggota tim, dan menciptakan iklim kerja kolaboratif yang sangat positif."
        },
        BENEVOLENT_AUTOCRAT: {
            kode: "Ba",
            nama: "Benevolent Autocrat (Otokrat Bijak)",
            tipe: "Efektif",
            deskripsi: "Tegas, sangat berorientasi target dan hasil nyata tanpa memicu kebencian. Mampu mengambil keputusan cepat dan memastikan tugas selesai tepat waktu."
        },
        BUREAUCRAT: {
            kode: "Bu",
            nama: "Bureaucrat (Birokrat / Tertib Aturan)",
            tipe: "Efektif",
            deskripsi: "Sangat taat pada SOP dan regulasi, teliti terhadap aturan dan prosedur, menjaga stabilitas sistem organisasi dan integritas proses kerja."
        },
        COMPROMISER: {
            kode: "Co",
            nama: "Compromiser (Kompromis)",
            tipe: "Kurang Efektif",
            deskripsi: "Terlalu mudah berkompromi di bawah tekanan, sering bimbang antara target kerja dan menyenangkan bawahan sehingga efektivitas kepemimpinan menurun."
        },
        MISSIONARY: {
            kode: "Mi",
            nama: "Missionary (Misionaris / Penyenang)",
            tipe: "Kurang Efektif",
            deskripsi: "Terlalu mengutamakan keharmonisan hubungan pribadi sehingga enggan menegur bawahan dan sering mengorbankan pencapaian target organisasi."
        },
        AUTOCRAT: {
            kode: "Au",
            nama: "Autocrat (Otokrat)",
            tipe: "Kurang Efektif",
            deskripsi: "Terlalu memaksakan kehendak dan mendominasi, kurang mempercayai bawahan sehingga menciptakan ketegangan dan resistensi dalam tim kerja."
        },
        DESERTER: {
            kode: "Ds",
            nama: "Deserter (Pelarian / Pasif)",
            tipe: "Kurang Efektif",
            deskripsi: "Cenderung lepas tangan dari tanggung jawab, pasif dalam menghadapi masalah, dan kurang memiliki komitmen terhadap tugas maupun tim kerja."
        }
    }
};

/**
 * 64 Soal Lengkap MSDT Sesuai Dokumen Resmi
 */
const MSDT_QUESTIONS = [
    {
        no: 1,
        a: "Saya tidak akan menegur pelanggar-pelanggar peraturan bila saya merasa pasti bahwa tidak ada satu orangpun yang mengetahui tentang pelanggaran-pelanggaran tersebut.",
        b: "Bila saya mengumumkan suatu keputusan yang kurang menyenangkan, saya akan menjelaskan kepada bawahan saya bahwa keputusan ini dibuat oleh direktur.",
        styleA: "Ds",
        styleB: "Bu"
    },
    {
        no: 2,
        a: "Bila ada seorang karyawan yang hasil kerjanya selalu tidak memuaskan saya, saya akan menunggu suatu kesempatan untuk memindahkannya dan bukan untuk memecatnya.",
        b: "Bila ada bawahan saya yang dikucilkan dari kelompok kerjanya, saya akan mencari jalan agar orang lain dapat berteman dengannya.",
        styleA: "Ds",
        styleB: "Mi"
    },
    {
        no: 3,
        a: "Bila direktur memberikan perintah yang kurang menyenangkan, saya piker adalah cukup bijaksana bila saya menyebutkan namanya dan bukan nama saya.",
        b: "Bila biasanya membuat keputusan-keputusan sendiri dan menyampaikannya kepada bawahan saya.",
        styleA: "Ds",
        styleB: "Au"
    },
    {
        no: 4,
        a: "Bila saya ditegur oleh atasan saya, saya akan memanggil semua bawahan saya dan mengatakan semua teguran tersebut kepada mereka.",
        b: "Saya selalu memberikan tugas-tugas yang sangat sulit kepada karyawan-karyawan yang paling berpengalaman.",
        styleA: "Ds",
        styleB: "Co"
    },
    {
        no: 5,
        a: "Saya selalu melakukan diskusi-diskusi untuk mencapai kata sepakat.",
        b: "Saya selalu menganjurkan kepada bawahan saya untuk memberikan usul-usul, tetapi kadang-kadang saya langsung mengambil tindakan tertentu.",
        styleA: "Ds",
        styleB: "Bu"
    },
    {
        no: 6,
        a: "Seringkali saya lebih mementingkan tugas daripada diri saya sendiri.",
        b: "Saya mengijinkan bawahan-bawahan saya untuk ikut serta dalam mengambil keputusan.",
        styleA: "Ds",
        styleB: "Dv"
    },
    {
        no: 7,
        a: "Bila jumlah dan mutu hasil kerja bagian saya tidak memuaskan, saya mengatakan kepada bawahan-bawahan saya bahwa direktur merasa kecewa. Oleh karena itu mereka harus memperbaiki kerja mereka.",
        b: "Saya membuat keputusan-keputusan sendiri dan kemudian saya mencoba untuk \"menjual\" keputusan-keputusan itu kepada bawahan saya.",
        styleA: "Ds",
        styleB: "Ba"
    },
    {
        no: 8,
        a: "Bila saya mengumumkan suatu keputusan yang kurang menyenangkan, saya akan menjelaskan kepada bawahan saya bahwa keputusan ini dibuat oleh direktur.",
        b: "Saya mengijinkan bawahan-bawahan saya untuk ikut serta di dalam pengambilan keputusan, tetapi sayapun menyediakan sesuatu yang jitu sebagai keputusan terakhir.",
        styleA: "Ds",
        styleB: "E"
    },
    {
        no: 9,
        a: "Saya akan memberikan tugas-tugas yang sulit kepada bawahan saya yang belum berpengalaman, tetapi bila mereka memperoleh kesukaran, saya akan mengambil alih tanggung jawab mereka.",
        b: "Bila jumlah dan mutu hasil kerja bagian saya tidak memuaskan, saya mengatakan kepada bawahan-bawahan saya bahwa direktur merasa kecewa. Oleh karena itu mereka harus memperbaiki kerja mereka.",
        styleA: "Mi",
        styleB: "Ds"
    },
    {
        no: 10,
        a: "Saya merasa bahwa dengan bekerja keras untuk bawahan saya, mereka akan menyukai saya.",
        b: "Saya membiarkan orang lain menangani tugas mereka masing-masing, walaupun mereka membuat banyak kesalahan.",
        styleA: "Mi",
        styleB: "Bu"
    },
    {
        no: 11,
        a: "Saya menunjukkan minat saya terhadap kehidupan pribadi bawahan-bawahan saya, karena sayapun mengharapkan mereka berbuat seperti itu kepada saya.",
        b: "Saya merasa bahwa bawahan-bawahan saya tidak perlu mengerti mengapa mereka mengerjakan sesuatu hal, sejauh mereka mengerjakan hal tersebut.",
        styleA: "Mi",
        styleB: "Au"
    },
    {
        no: 12,
        a: "Saya percaya bahwa bawahan-bawahan yang tidak disiplin tidak akan memperbaiki jumlah atau mutu kerja mereka dalam jangka waktu yang panjang.",
        b: "Bila menghadapi masalah yang sulit, saya berusaha untuk mencapai pemecahan yang dapat diterima oleh sebagian besar orang.",
        styleA: "Mi",
        styleB: "Co"
    },
    {
        no: 13,
        a: "Bila beberapa bawahan saya merasa tidak bahagia, saya akan mencoba melakukan sesuatu untuk mengatasi hal tersebut.",
        b: "Saya berusaha bekerja sebaik mungkin dan memberikan ide-ide pengembangan pada pimpinan.",
        styleA: "Mi",
        styleB: "Bu"
    },
    {
        no: 14,
        a: "Saya menyetujui kenaikan tunjangan-tunjangan untuk staf dan karyawan.",
        b: "Saya mendukung bawahan saya yang ingin meningkatkan pengetahuan tentang pekerjaan dan perusahaan, walaupun hal itu sebenarnya belum diperlukan untuk kedudukan mereka sekarang.",
        styleA: "Mi",
        styleB: "Dv"
    },
    {
        no: 15,
        a: "Saya membiarkan orang lain menangani tugas mereka masing-masing, walaupun mereka banyak membuat kesalahan.",
        b: "Saya membuat keputusan-keputusan sendiri, tetapi saya akan mempertimbangkan usul-usul dari bawahan-bawahan saya.",
        styleA: "Mi",
        styleB: "Ba"
    },
    {
        no: 16,
        a: "Bila bawahan saya yang dikucilkan dari kelompok kerjanya, saya akan mencari cara agar orang lain dapat berteman dengannya.",
        b: "Bila seorang karyawan tidak sanggup menyelesaikan tugasnya, saya akan membantu dia untuk menyelesaikan tugas tersebut.",
        styleA: "Mi",
        styleB: "E"
    },
    {
        no: 17,
        a: "Saya percaya bahwa penerapan disiplin merupakan contoh untuk karyawan-karyawan lain.",
        b: "Saya merasa lebih mementingkan tugas daripada diri saya sendiri.",
        styleA: "Au",
        styleB: "Ds"
    },
    {
        no: 18,
        a: "Saya mencela pembicaraan-pembicaraan yang tidak perlu diantara bawahan-bawahan saya, selama mereka bekerja.",
        b: "Saya menyetujui kenaikan tunjangan-tunjangan untuk staf dan karyawan.",
        styleA: "Au",
        styleB: "Mi"
    },
    {
        no: 19,
        a: "Saya selalu memperhatikan keterlambatan dan kemangkiran bawahan saya.",
        b: "Saya percaya bahwa serikat-serikat buruh akan mencoba meruntuhkan kewibawaan pimpinan perusahaan.",
        styleA: "Au",
        styleB: "Bu"
    },
    {
        no: 20,
        a: "Kadang-kadang saya merasa bahwa apa yang dikeluhkan oleh serikat buruh bukanlah masalah yang mendasar.",
        b: "Saya merasa bahwa keluhan-keluhan tidak dapat dicegah dan saya akan berusaha untuk menghilangkan keluhan tersebut.",
        styleA: "Au",
        styleB: "Co"
    },
    {
        no: 21,
        a: "Adalah penting bagi saya untuk memperoleh penghargaan atas ide-ide saya yang baik.",
        b: "Saya mengemukakan pendapat-pendapat saya dimuka umum hanya bila saya merasa bahwa orang lain akan setuju dengan saya.",
        styleA: "Au",
        styleB: "Bu"
    },
    {
        no: 22,
        a: "Saya percaya bahwa serikat-serikat buruh akan mencoba meruntuhkan kewibawaan pimpinan perusahaan.",
        b: "Saya percaya bahwa pertemuan-pertemuan yang sering dengan karyawan secara pribadi akan membantu pengembangan diri mereka.",
        styleA: "Au",
        styleB: "Dv"
    },
    {
        no: 23,
        a: "Saya merasa bahwa bawahan-bawahan saya tidak perlu mengerti mengapa mereka mengerjakan sesuatu hal, sejauh mereka mengerjakan hal tersebut.",
        b: "Saya merasa bahwa jam pencatat waktu datang dan pulangnya para pegawai akan mengurangi keterlambatan.",
        styleA: "Au",
        styleB: "Ba"
    },
    {
        no: 24,
        a: "Saya biasanya membuat keputusan-keputusan sendiri dan menyampaikannya kepada bawahan saya.",
        b: "Saya merasa bahwa serikat-serikat buruh dan pimpinan perusahaan dapat bekerjasama untuk mencapai tujuan-tujuan bersama.",
        styleA: "Au",
        styleB: "E"
    },
    {
        no: 25,
        a: "Saya menyukai penggunaan skala penggajian karyawan.",
        b: "Saya selalu melakukan diskusi-diskusi untuk mencapai kata sepakat.",
        styleA: "Co",
        styleB: "Ds"
    },
    {
        no: 26,
        a: "Saya tidak akan memberikan tugas yang tidak saya senangi kepada orang lain.",
        b: "Bila beberapa bawahan saya merasa tidak berbahagia, saya akan mencoba melakukan sesuatu untuk mengatasi hal tersebut.",
        styleA: "Co",
        styleB: "Mi"
    },
    {
        no: 27,
        a: "Bila ada tugas yang mendesak, walaupun semua peralatannya sudah diselesaikan, saya akan membiarkannya saja dan meminta salah seorang bawahan saya untuk mengerjakan tugas tersebut.",
        b: "Adalah penting bagi saya untuk memperoleh penghargaan atas ide-ide saya yang baik.",
        styleA: "Co",
        styleB: "Au"
    },
    {
        no: 28,
        a: "Tujuan saya adalah berusaha mengerjakan tugas sebaik mungkin tanpa mengeluh.",
        b: "Saya memberikan tugas kepada bawahan saya tanpa banyak mempertimbangkan pengalaman atau kemampuan saya lebih menuntut pencapaian hasilnya saja.",
        styleA: "Co",
        styleB: "Bu"
    },
    {
        no: 29,
        a: "Saya memberikan tugas kepada bawahan saya tanpa banyak mempertimbangkan pengalaman atau kemampuan saya lebih menuntut pencapaian hasilnya saja.",
        b: "Saya dengan sabar mendengarkan keluhan-keluhan dan ketidakpuasan-ketidakpuasan bawahan saya, tetapi sering kali saya meralat apa yang mereka katakan.",
        styleA: "Co",
        styleB: "Bu"
    },
    {
        no: 30,
        a: "Saya merasa bahwa keluhan-keluhan tidak dapat dicegah dan saya berusaha untuk menghilangkan keluhan tersebut.",
        b: "Saya percaya bahwa bawahan-bawahan saya akan merasakan kepuasan kerja tanpa merasa tertekan oleh saya.",
        styleA: "Co",
        styleB: "Dv"
    },
    {
        no: 31,
        a: "Bila menghadapi masalah yang sulit, saya berusaha untuk mencapai pemecahan yang dapat diterima oleh sebagian besar orang.",
        b: "Saya percaya bahwa pengalaman bekerja lebih bermanfaat daripada pendidikan teoritis.",
        styleA: "Co",
        styleB: "Ba"
    },
    {
        no: 32,
        a: "Saya selalu memberikan tugas-tugas yang sangat sulit kepada karyawan-karyawan yang paling berpengalaman.",
        b: "Saya percaya bahwa kenaikan jabatan adalah semata-mata berdasarkan kemampuan yang ada.",
        styleA: "Co",
        styleB: "E"
    },
    {
        no: 33,
        a: "Saya merasa bahwa masalah-masalah yang timbul diantara para karyawan biasanya akan dapat diselesaikan di antara mereka sendiri, tanpa campur tangan dari saya.",
        b: "Bila saya ditegur oleh atasan saya, saya akan memanggil semua bawahan saya dan mengatakan semua teguran tersebut kepada mereka.",
        styleA: "Bu",
        styleB: "Ds"
    },
    {
        no: 34,
        a: "Saya tidak peduli dengan apa yang dikerjakan oleh karyawan saya di luar jam kerja kantornya.",
        b: "Saya percaya bahwa bawahan-bawahan yang tidak disiplin tidak akan memperbaiki jumlah atau mutu kerja mereka dalam jangka waktu yang panjang.",
        styleA: "Bu",
        styleB: "Mi"
    },
    {
        no: 35,
        a: "Saya memberikan informasikepada pimpinan perusahaan tidak lebih dari apa yang mereka tanyakan.",
        b: "Kadang-kadang saya merasa bahwa apa yang dikeluhkan oleh serikat buruh bukanlah masalah yang mendasar.",
        styleA: "Bu",
        styleB: "Au"
    },
    {
        no: 36,
        a: "Saya kadang ragu-ragu untuk membuat suatu keputusan yang akan tidak disukai oleh bawahan-bawahan saya.",
        b: "Tujuan saya adalah berusaha mengerjakan tugas sebaik mungkin tanpa mengeluh.",
        styleA: "Bu",
        styleB: "Co"
    },
    {
        no: 37,
        a: "Saya dengan sabar mendengarkan keluhan-keluhan dan ketidakpuasan-ketidakpuasan bawahan saya, tetapi sering kali saya meralat apa yang mereka katakan.",
        b: "Saya kadang ragu-ragu untuk membuat suatu keputusan yang akan tidak disukai oleh bawahan-bawahan saya.",
        styleA: "Bu",
        styleB: "Bu"
    },
    {
        no: 38,
        a: "Saya mengemukakan pendapat-pendapat saya dimuka umum hanya bila saya merasa bahwa orang lain akan setuju dengan saya.",
        b: "Sebagian besar dari bawahan-bawahan saya dapat menyelesaikan tugas-tugas mereka, bila perlu tanpa kehadiran saya.",
        styleA: "Bu",
        styleB: "Dv"
    },
    {
        no: 39,
        a: "Saya berusaha bekerja sebaik mungkin dan memberikan ide-ide pengembangan pada pimpinan perusahaan.",
        b: "Bila saya memberikan tugas kepada bawahan-bawahan saya, saya akan menentukan batas waktu penyelesaiannya.",
        styleA: "Bu",
        styleB: "Ba"
    },
    {
        no: 40,
        a: "Saya selalu menganjurkan kepada bawahan saya untuk memberikan usul-usul, tetapi kadang-kadang saya langsung mengambil tindakan tertentu.",
        b: "Saya mencoba membuat bawahan-bawahan saya merasa senang apabila mereka berbicara dengan saya.",
        styleA: "Bu",
        styleB: "E"
    },
    {
        no: 41,
        a: "Di dalam diskusi-diskusi saya memberikan fakta-fakta sesuai pemahaman bawahan saya, dan membiarkan mereka untuk membuat kesimpulan sendiri.",
        b: "Bila direktur memberikan perintah yang kurang menyenangkan, saya piker adalah cukup bijaksana bila saya menyebutkan namanya dan bukan nama saya.",
        styleA: "Dv",
        styleB: "Ds"
    },
    {
        no: 42,
        a: "Bila ada tugas-tugas mendadak atau tugas yang tidak menyenangkan, sebelumnya saya akan meminta beberapa sukarelawan yang mau mengerjakan tugas tersebut.",
        b: "Saya menunjukkan minat saya terhadap kehidupan pribadi bawahan-bawahan saya, karena sayapun mengharapkan mereka berbuat seperti itu kepada saya.",
        styleA: "Dv",
        styleB: "Mi"
    },
    {
        no: 43,
        a: "Saya selalu memperhatikan kebahagiaan karyawan-karyawan saya saat mereka mengerjakan tugas-tugas mereka.",
        b: "Saya selalu memperhatikan keterlambatan dan kemangkiran bawahan saya.",
        styleA: "Dv",
        styleB: "Au"
    },
    {
        no: 44,
        a: "Sebagian besar dari bawahan-bawahan saya dapat menyelesaikan tugas-tugas mereka, bila perlu tanpa kehadiran saya.",
        b: "Bila ada tugas yang mendesak, walaupun semua peralatannya sudah diselesaikan, saya akan membiarkannya saja dan meminta salah seorang bawahan saya untuk mengerjakan tugas tersebut.",
        styleA: "Dv",
        styleB: "Co"
    },
    {
        no: 45,
        a: "Saya percaya bahwa bawahan bawahan saya akan merasakan kepuasan kerja tanpa merasa tertekan oleh saya.",
        b: "Saya memberikan informasi kepada \"dewan pimpinan perusahaan\" tidak lebih dari apa yang mereka tanyakan.",
        styleA: "Dv",
        styleB: "Bu"
    },
    {
        no: 46,
        a: "Saya percaya bahwa pertemuan-pertemuan yang sering dengan karyawan secara pribadi akan membantu pengembangan diri mereka.",
        b: "Saya selalu memperhatikan kebahagiaan karyawan-karyawan saya saat mereka mengerjakan tugas-tugas mereka.",
        styleA: "Dv",
        styleB: "Dv"
    },
    {
        no: 47,
        a: "Saya mendukung bawahan saya yang ingin meningkatkan pengetahuan tentang pekerjaan dan perusahaan, walaupun hal itu sebenarnya belum diperlukan untuk kedudukan mereka sekarang.",
        b: "Saya mengawasi benar bawahan-bawahan saya yang kurang mahir dalam pekerjaannya atau bawahan-bawahan saya yang hasil kerjanya kurang memuaskan.",
        styleA: "Dv",
        styleB: "Ba"
    },
    {
        no: 48,
        a: "Saya mengijinkan bawahan-bawahan saya untuk ikut serta dalam mengambil keputusan dan saya selalu mematuhi keputusan yang dibuat berdasarkan suara terbanyak.",
        b: "Saya membuat bawahan-bawahan saya bekerja keras, dan saya berusaha meyakinkan mereka bahwa biasanya mereka akan mendapatkan perlakuan yang adil dari pimpinan perusahaan.",
        styleA: "Dv",
        styleB: "E"
    },
    {
        no: 49,
        a: "Saya merasa bahwa semua karyawan pada jabatan yang sama seharusnya memperoleh gaji yang sama.",
        b: "Bila ada seseorang karyawan yang hasil kerjanya selalu tidak memuaskan saya, saya akan menunggu suatu kesempatan untuk memindahkannya dan bukan untuk memecatnya.",
        styleA: "Ba",
        styleB: "Ds"
    },
    {
        no: 50,
        a: "Saya merasa bahwa tujuan-tujuan serikat buruh dan tujuan-tujuan perusahaan saling berbeda.",
        b: "Saya merasa bahwa dengan bekerja keras bagi bawahan saya, mereka akan menyenangi saya.",
        styleA: "Ba",
        styleB: "Mi"
    },
    {
        no: 51,
        a: "Saya mengawasi benar bawahan-bawahan saya yang kurang mahir dalam pekerjaannya atau bawahan-bawahan saya yang hasil kerjanya kurang memuaskan.",
        b: "Saya mencela pembicaraan-pembicaraan yang tidak perlu diantara bawahan-bawahan saya, selama mereka bekerja.",
        styleA: "Ba",
        styleB: "Au"
    },
    {
        no: 52,
        a: "Bila saya memberikan tugas kepada bawahan-bawahan saya, saya akan menentukan batas waktu penyelesaiannya.",
        b: "Saya tidak akan memberikan tugas yang tidak saya senangi kepada orang lain.",
        styleA: "Ba",
        styleB: "Co"
    },
    {
        no: 53,
        a: "Saya percaya bahwa pengalaman bekerja lebih bermanfaat daripada pendidikan teoritis.",
        b: "Saya tidak peduli dengan apa yang dikerjakan oleh karyawan saya di luar jam kantornya.",
        styleA: "Ba",
        styleB: "Bu"
    },
    {
        no: 54,
        a: "Saya merasa bahwa jam pencatat waktu datang dan pulangnya para pegawai akan mengurangi keterlambatan.",
        b: "Saya mengijinkan bawahan-bawahan saya untuk ikut serta dalam mengambil keputusan dan saya selalu mematuhi keputusan yang dibuat berdasarkan suara terbanyak.",
        styleA: "Ba",
        styleB: "Dv"
    },
    {
        no: 55,
        a: "Saya membuat keputusan-keputusan sendiri, tetapi saya dapat mempertimbangkan saran-saran yang wajar dari bawahan-bawahan saya.",
        b: "Saya merasa bahwa tujuan-tujuan serikat buruh dan tujuan-tujuan perusahaan adalah saling berbeda.",
        styleA: "Ba",
        styleB: "Ba"
    },
    {
        no: 56,
        a: "Saya membuat keputusan-keputusan sendiri dan kemudian saya mencoba untuk \"menjual\" keputusan-keputusan itu kepada bawahan saya.",
        b: "Apabila mungkin, saya akan membentuk kelompok-kelompok kerja yang terdiri dari orang-orang yang sudah menjadi teman-teman baik saya.",
        styleA: "Ba",
        styleB: "E"
    },
    {
        no: 57,
        a: "Saya tidak akan ragu-ragu untuk mempekerjakan pegawai-pegawai yang cacat jasmani, bilamana saya merasa pasti bahwa mereka dapat menangani pekerjaannya.",
        b: "Saya tidak akan menegur pelanggar-pelanggar peraturan bila saya merasa pasti bahwa tidak ada satu orangpun yang mengetahui tentang pelanggaran-pelanggaran tersebut.",
        styleA: "E",
        styleB: "Ds"
    },
    {
        no: 58,
        a: "Apabila mungkin, saya akan membentuk kelompok-kelompok kerja yang terdiri dari orang-orang yang sudah menjadi teman-teman baik saya.",
        b: "Saya akan memberikan tugas-tugas yang sulit kepada bawahan saya yang belum berpengalaman, tetapi bila mereka memperoleh kesukaran, saya akan mengambil alih tanggung jawab mereka.",
        styleA: "E",
        styleB: "Mi"
    },
    {
        no: 59,
        a: "Saya membuat bawahan-bawahan saya bekerja keras, dan saya berusaha meyakinkan mereka bahwa biasanya mereka akan mendapatkan perlakuan yang adil dari pimpinan perusahaan.",
        b: "Saya percaya bahwa penerapan disiplin merupakan contoh untuk karyawan-karyawan lain.",
        styleA: "E",
        styleB: "Au"
    },
    {
        no: 60,
        a: "Saya mencoba membuat bawahan-bawahan saya merasa senang apabila mereka berbicara dengan saya.",
        b: "Saya menyukai penggunaan skala penggajian karyawan.",
        styleA: "E",
        styleB: "Co"
    },
    {
        no: 61,
        a: "Saya percaya bahwa kenaikan jabatan adalah semata-mata berdasarkan kemampuan yang ada.",
        b: "Saya merasa bahwa masalah-masalah yang timbul diantara para karyawan biasanya akan dapat diselesaikan di antara mereka sendiri, tanpa campur tangan dari saya.",
        styleA: "E",
        styleB: "Bu"
    },
    {
        no: 62,
        a: "Saya merasa bahwa serikat-serikat buruh dan pimpinan perusahaan bekerja untuk mencapai tujuan-tujuan yang sama.",
        b: "Di dalam diskusi-diskusi saya memberikan fakta-fakta sesuai pemahaman bawahan saya, dan membiarkan mereka untuk membuat kesimpulan sendiri.",
        styleA: "E",
        styleB: "Dv"
    },
    {
        no: 63,
        a: "Bila seorang karyawan tidak sanggup menyelesaikan tugasnya, saya akan membantu dia untuk menyelesaikan tugas tersebut.",
        b: "Saya merasa bahwa semua karyawan pada jabatan yang sama seharusnya memperoleh gaji yang sama.",
        styleA: "E",
        styleB: "Ba"
    },
    {
        no: 64,
        a: "Saya mengijinkan bawahan-bawahan saya untuk ikut serta di dalam pengambilan keputusan, tetapi sayapun menyediakan sesuatu yang jitu sebagai keputusan terakhir.",
        b: "Saya tidak akan ragu-ragu untuk mempekerjakan pegawai-pegawai yang cacat jasmani, bilamana saya merasa pasti bahwa mereka dapat menangani pekerjaannya.",
        styleA: "E",
        styleB: "E"
    }
];

if (typeof window !== 'undefined') {
    window.MSDT_CONFIG = MSDT_CONFIG;
    window.MSDT_QUESTIONS = MSDT_QUESTIONS;
}
