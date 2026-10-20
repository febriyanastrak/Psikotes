// =========================================================================
// DATA RESMI INSTRUMEN SOAL & NORMA SKORING MBTI (MYERS-BRIGGS TYPE INDICATOR)
// PT Altrak 1978 - Leadership & Executive Assessment System
// Modul Tes Kepribadian Tahap 2 (Menggantikan MCMI)
// 60 Soal Forced-Choice Berpasangan (15 Soal per 4 Dimensi Utama)
// =========================================================================

const MBTI_CONFIG = {
    judul: 'Myers-Briggs Type Indicator (MBTI)',
    subjudul: 'Pemetaan 16 Tipe Kepribadian, Pola Pikir Kerja, dan Gaya Kepemimpinan Manajerial',
    totalSoal: 60,
    alokasiWaktuMenit: 30,
    pedoman: {
        judul: 'Petunjuk & Pedoman Pengerjaan MBTI',
        deskripsi: 'Di bawah ini terdapat 60 nomor pernyataan. Masing-masing nomor menyajikan dua pernyataan yang bertolak belakang (PERNYATAAN A dan PERNYATAAN B). Pilihlah salah satu pernyataan yang paling menggambarkan kecenderungan spontan dan alamiah diri Anda.',
        aturan: [
            'Pilihlah salah satu pernyataan yang paling dominan menggambarkan diri Anda.',
            'Ini adalah tes kepribadian kerja, TIDAK ADA jawaban yang benar atau salah.',
            'Jawablah secara jujur, spontan, dan tidak ada nomor yang dilewati.'
        ]
    },
    dimensiInfo: {
        EI: { nama: 'Pemusatan Energi', kiri: { kode: 'E', label: 'Ekstrovert (E)' }, kanan: { kode: 'I', label: 'Introvert (I)' } },
        SN: { nama: 'Pengolahan Informasi', kiri: { kode: 'S', label: 'Sensing (S)' }, kanan: { kode: 'N', label: 'Intuition (N)' } },
        TF: { nama: 'Pengambilan Keputusan', kiri: { kode: 'T', label: 'Thinking (T)' }, kanan: { kode: 'F', label: 'Feeling (F)' } },
        JP: { nama: 'Orientasi Gaya Hidup / Kerja', kiri: { kode: 'J', label: 'Judging (J)' }, kanan: { kode: 'P', label: 'Perceiving (P)' } }
    },
    empatSkala: {
        EI: {
            judul: "1. Extrovert (E) vs. Introvert (I)",
            dimensi: "Pemusatan & Orientasi Energi",
            deskripsi: "Dimensi EI melihat orientasi energi kita ke dalam atau ke luar.",
            ekstrovert: "Ekstrovert artinya tipe pribadi yang menyukai dunia luar. Mereka suka bergaul, menyenangi interaksi sosial, beraktifitas dengan orang lain, serta berfokus pada dunia luar dan action oriented. Mereka bagus dalam hal berurusan dengan orang dan hal operasional.",
            introvert: "Sebaliknya, tipe introvert adalah mereka yang suka dunia dalam (diri sendiri). Mereka senang menyendiri, merenung, membaca, menulis dan tidak begitu suka bergaul dengan banyak orang. Mereka mampu bekerja sendiri, penuh konsentrasi dan fokus. Mereka bagus dalam pengolahan data secara internal dan pekerjaan back office."
        },
        SN: {
            judul: "2. Sensing (S) vs. Intuition (N)",
            dimensi: "Pengolahan & Pemrosesan Data",
            deskripsi: "Dimensi SN melihat bagaimana individu memproses data dan informasi.",
            sensing: "Sensing memproses data dengan cara bersandar pada fakta yang konkrit, praktis, realistis dan melihat data apa adanya. Mereka menggunakan pedoman pengalaman dan data konkrit serta memilih cara-cara yang sudah terbukti. Mereka fokus pada masa kini (apa yang bisa diperbaiki sekarang). Mereka bagus dalam perencanaan teknis dan detail aplikatif.",
            intuition: "Tipe intuition memproses data dengan melihat pola dan hubungan, pemikir abstrak, konseptual serta melihat berbagai kemungkinan yang bisa terjadi. Mereka berpedoman imajinasi, memilih cara unik, dan berfokus pada masa depan (apa yang mungkin dicapai di masa mendatang). Mereka inovatif, penuh inspirasi dan ide unik. Mereka bagus dalam penyusunan konsep, ide, dan visi jangka panjang."
        },
        TF: {
            judul: "3. Thinking (T) vs. Feeling (F)",
            dimensi: "Pengambilan Keputusan",
            deskripsi: "Dimensi TF melihat bagaimana seseorang mengambil keputusan dan kesimpulan.",
            thinking: "Thinking adalah mereka yang selalu menggunakan logika dan kekuatan analisa untuk mengambil keputusan. Mereka cenderung berorientasi pada tugas dan objektif. Terkesan kaku dan berpegang pada prinsip secara konsisten. Bagus dalam melakukan analisa dan menjaga prosedur/standar.",
            feeling: "Sementara feeling adalah mereka yang melibatkan perasaan, empati serta nilai-nilai yang diyakini ketika hendak mengambil keputusan. Mereka berorientasi pada hubungan dan subjektif. Mereka akomodatif, empatik dan menginginkan harmoni. Bagus dalam menjaga keharmonisan dan memelihara hubungan interpersonal."
        },
        JP: {
            judul: "4. Judging (J) vs. Perceiving (P)",
            dimensi: "Gaya Hidup & Fleksibilitas Kerja",
            deskripsi: "Dimensi JP melihat derajat fleksibilitas dan orientasi keteraturan seseorang.",
            judging: "Judging diartikan sebagai tipe orang yang selalu bertumpu pada rencana yang sistematis, serta senantiasa berpikir dan bertindak teratur (tidak melompat-lompat). Mereka tidak suka hal-hal mendadak dan di luar perencanaan. Mereka ingin merencanakan pekerjaan dan mengikuti rencana itu. Mereka bagus dalam penjadwalan, penetapan struktur, dan perencanaan step by step.",
            perceiving: "Sementara tipe perceiving adalah mereka yang bersikap fleksibel, spontan, adaptif, dan bertindak secara luwes untuk melihat beragam peluang yang muncul. Perubahan mendadak tidak masalah dan ketidakpastian membuat mereka bergairah. Bagus dalam menghadapi perubahan dan situasi mendadak."
        }
    },
    temperamenInfo: {
        "Idealist": {
            nama: "The Idealists (NF)",
            tipeList: ["ENFJ", "ENFP", "INFJ", "INFP"],
            karakter: "Abstrak dan penyayang. Mencari arti dan makna, peduli pada pertumbuhan pribadi dan menemukan identitas unik diri sendiri. Kekuatan terbesar mereka adalah diplomasi, pemersatu, dan inspirasi."
        },
        "Guardian": {
            nama: "The Guardians (SJ)",
            tipeList: ["ESTJ", "ESFJ", "ISTJ", "ISFJ"],
            karakter: "Konkret dan terorganisir. Mencari keamanan, keteraturan, dan rasa memiliki, peduli dengan tugas dan tanggung jawab. Kekuatan terbesar mereka adalah logistik, administrasi, dan kepatuhan standar."
        },
        "Artisan": {
            nama: "The Artisans (SP)",
            tipeList: ["ESTP", "ESFP", "ISTP", "ISFP"],
            karakter: "Konkret dan mudah menyesuaikan diri. Mencari pendorong dan keahlian, peduli membuat dampak langsung. Kekuatan terbesar mereka adalah taktik, pemecahan masalah praktis, dan manipulasi instrumen/alat."
        },
        "Rational": {
            nama: "The Rationals (NT)",
            tipeList: ["ENTJ", "ENTP", "INTJ", "INTP"],
            karakter: "Abstrak dan objektif. Mencari penguasaan dan pengendalian diri, peduli dengan pengetahuan dan kompetensi logis. Kekuatan terbesar mereka adalah strategi, konseptualisasi, dan penyelidikan sistematis."
        }
    },
    profilTipe: {
        "ENFJ": {
            nama: "The Teacher / The Giver",
            alias: "Smooth Talking Persuader",
            temperamen: "Idealist",
            populasi: "2–5% dari populasi dunia",
            karakter: "Kharismatik, hangat, berempati tinggi, dan pendengar yang bertanggung jawab.",
            gayaKerja: "Membangun konsensus tim, memfasilitasi kolaborasi, dan memotivasi pencapaian potensi optimal.",
            kekuatan: "Kepemimpinan transformasional, komunikasi persuasif, coaching, dan diplomasi.",
            gambaranSingkat: "Bersifat hangat, berempati, pendengar yang baik, dan bertanggung jawab. Sangat menyesuaikan diri dengan emosi, kebutuhan, dan motivasi orang lain. Mereka melihat potensi pada setiap orang dan ingin membantu mencapai potensi tersebut. Dapat bertindak sebagai pendorong pertumbuhan individu dan kelompok. Loyal, terbuka pada saran/kritik, dan menghadirkan kepemimpinan bersemangat.",
            definisi: "ENFJ (Extraversion, Intuition, Feeling, Judging) dikategorikan ke dalam Temperamen Idealist (David Keirsey). Tipe ini merupakan pribadi abstrak dan penyayang yang mencari arti dan makna hidup. Kekuatan terbesar mereka terletak pada diplomasi, mengklarifikasi visi, menyatukan tim, dan menginspirasi lingkungan sekitar.",
            dimensiMBTI: {
                E: "Termotivasi melalui interaksi sosial, menikmati jaringan pertemanan yang luas, dan memperoleh energi prima dalam kebersamaan.",
                N: "Fokus pada gambaran besar daripada detail kecil, dan berorientasi pada peluang masa depan daripada sekadar realitas hari ini.",
                F: "Mengambil keputusan dengan menghargai pertimbangan rasa kemanusiaan dan implikasi sosial di atas logika impersonal.",
                J: "Terencana, membuat keputusan di awal, mengontrol alur kerja secara teratur, dan menyukai kejelasan struktur."
            },
            ciriUmum: [
                "Benar-benar hangat dan tulus tertarik pada orang lain",
                "Sangat memegang nilai tentang perasaan dan kenyamanan orang lain",
                "Memegang nilai struktur dan organisasi yang tertib",
                "Menjunjung tinggi nilai harmoni dan mahir menciptakannya",
                "Memiliki keterampilan komunikasi interpersonal yang luar biasa",
                "Tidak menyukai logika dingin yang kaku dan analisis impersonal",
                "Kemampuan manajerial dan organisasi yang kuat",
                "Loyal, jujur, kreatif, dan imajinatif",
                "Menyukai variasi tugas dan tantangan baru",
                "Mendapatkan kepuasan batin saat berhasil membantu orang lain berkembang",
                "Sensitif terhadap kritik dan perpecahan dalam kelompok"
            ],
            karirCatatan: "ENFJ memiliki kinerja terbaik pada bidang yang membutuhkan kecerdasan emosional, komunikasi tatap muka, pembinaan SDM, dan kepemimpinan suportif.",
            saranKarir: [
                "Konsultan Manajemen & SDM", "Psikolog", "Pekerja Sosial / Penasihat", "Pengajar / Dosen / Trainer",
                "Bidang Keagamaan / Rohani", "Tenaga Penjualan / Sales Executive", "Pengelola SDM (HRD Manager)",
                "Manajer Operasional", "Koordinator Acara (Event Director)", "Politikus / Diplomat", "Penulis / Editor", "Fasilitator Publik"
            ],
            partnerAlami: {
                mitra: "INFP atau ISFP",
                deskripsi: "Fungsi dominan Extraverted Feeling (EF) paling selaras dan saling melengkapi dengan kepribadian yang didominasi oleh fungsi Introverted Feeling (IF)."
            },
            saranPengembangan: [
                "Jangan mengorbankan diri sendiri hanya demi menyenangkan semua orang.",
                "Jangan mengukur harga diri semata-mata dari perlakuan atau validasi orang lain; jangan mudah kecewa jika ekspektasi tidak terpenuhi.",
                "Belajarlah untuk lebih tegas (asertif) dalam mengambil keputusan rasional dan menghadapi konflik secara terbuka.",
                "Jangan terlalu bersikap keras terhadap diri sendiri ketika rencana belum berjalan sempurna."
            ],
            kataKunci: ["Terorganisir", "Mengembangkan SDM", "Pembangun Kesepakatan", "Terampil", "Energik", "Antusias"],
            tokohTerkenal: ["Abraham Lincoln", "Sean Connery", "Dennis Hopper", "Diane Sawyer", "Johnny Depp", "Oprah Winfrey", "Abraham Maslow", "Ronald Reagan", "Peyton Manning", "Barack Obama"]
        },
        "ENFP": {
            nama: "The Champion / The Inspirer",
            alias: "Giving Life an Extra Squeeze",
            temperamen: "Idealist",
            populasi: "6–8% dari populasi dunia",
            karakter: "Kreatif, antusias, berwawasan luas, dan pembawa energi perubahan positif.",
            gayaKerja: "Menginspirasi tim kerja, menginisiasi inovasi terobosan, dan bergerak dinamis.",
            kekuatan: "Komunikasi persuasif, ide kreatif orisinal, adaptabilitas, dan pemecah kebuntuan.",
            gambaranSingkat: "Sosok hangat yang memiliki antusiasme tinggi dan imajinatif. Melihat kehidupan sebagai sesuatu yang penuh kemungkinan. Mampu memahami hubungan antara kejadian dan informasi dengan sangat mudah, serta percaya diri mengeksekusi sesuatu berdasarkan pola yang mereka lihat. Spontan dan fleksibel, seringkali mengandalkan kemampuan berimprovisasi dan kefasihan lisan.",
            definisi: "ENFP (Extraversion, Intuition, Feeling, Perception) tergolong Temperamen Idealist. Merupakan inisiator perubahan yang memiliki persepsi tajam tentang berbagai peluang masa depan. Menularkan semangat dan kebahagiaan dalam lingkungan kerja, serta paling unggul pada fase awal proyek yang membutuhkan eksplorasi kreatif.",
            dimensiMBTI: {
                E: "Memperoleh energi dari interaksi eksternal dan sangat senang membangun relasi baru yang beragam.",
                N: "Fokus pada gambaran besar, pola konseptual, dan potensi kemungkinan masa depan.",
                F: "Mengutamakan nilai moral, empati, dan dampak sosial dalam menentukan langkah.",
                P: "Fleksibel, menahan penilaian kaku, dan lebih suka menjaga opsi tetap terbuka agar leluasa beradaptasi."
            },
            ciriUmum: [
                "Berorientasi kuat pada proyek dan terobosan ide baru",
                "Cerdas, tanggap, dan berkemampuan serba bisa",
                "Hangat dan tulus tertarik pada orang lain dengan empati tinggi",
                "Sangat intuitif dan peka membaca situasi lingkungan",
                "Berorientasi pelayanan; sigap membantu rekan yang membutuhkan",
                "Berorientasi ke masa depan dan tidak menyukai tugas rutin monoton",
                "Memerlukan apresiasi positif dan pengakuan atas kreativitasnya",
                "Komunikator ulung secara lisan maupun tulisan",
                "Pemimpin alami yang demokratis dan tidak suka mengontrol mikro orang lain",
                "Menolak untuk dikendalikan secara sepihak oleh sistem birokrasi kaku",
                "Mampu memahami teori dan konsep rumit secara cepat"
            ],
            karirCatatan: "ENFP sangat sukses di lingkungan kerja dinamis yang memberikan kebebasan berekspresi, komunikasi publik, pemecahan masalah kreatif, dan ketiadaan rutinitas membosankan.",
            saranKarir: [
                "Konsultan Kreatif & Strategi", "Psikolog / Konselor", "Pengusaha / Wirausahawan", "Aktor / Public Speaker",
                "Guru / Dosen Inspiratif", "Penasihat Karir", "Politikus / Advokat Publik", "Penulis / Jurnalis",
                "Reporter Televisi / Media", "Programmer / System Analyst", "Pakar Ilmu Pengetahuan", "Insinyur Inovasi", "Seniman / Desainer"
            ],
            partnerAlami: {
                mitra: "INTJ atau INFJ",
                deskripsi: "Fungsi Extraverted Intuition (EN) berpadu harmonis dan seimbang saat berpasangan dengan stabilitas analitis Introverted Intuition (IN)."
            },
            saranPengembangan: [
                "Belajarlah untuk lebih fokus, disiplin, tegas, dan konsisten menuntaskan proyek hingga tuntas.",
                "Hadapi kritik dan konflik secara konstruktif tanpa harus menghindar atau merasa tertekan.",
                "Pikirkan dan rawat kebutuhan diri sendiri; jangan mengabaikan kesehatan batin karena terlalu sibuk membantu orang lain.",
                "Belajarlah mengelola anggaran finansial dan ketertiban administrasi sedikit demi sedikit."
            ],
            kataKunci: ["Penuh Ide & Kemungkinan", "Antusias", "Energik", "Terampil", "Mudah Beradaptasi", "Kreatif"],
            tokohTerkenal: ["Andy Kaufman", "Bob Dylan", "Charles Dickens", "Dr. Seuss", "Robin Williams", "Will Smith", "Charlotte Bronte"]
        },
        "ENTJ": {
            nama: "The Commander / The Executive",
            alias: "Life's Natural Leaders",
            temperamen: "Rational",
            populasi: "2–5% dari populasi dunia",
            karakter: "Tegas, visioner, berterus terang, dan siap memikul tanggung jawab kepemimpinan tertinggi.",
            gayaKerja: "Mendisain sistem menyeluruh, menetapkan KPI ambisius, dan mengeksekusi rencana strategis.",
            kekuatan: "Kepemimpinan eksekutif, ketegasan analisis logis, manajemen proyek makro, dan efisiensi.",
            gambaranSingkat: "Berterus terang, menentukan, dan siap memikul kepemimpinan. Mampu dengan mudah melihat prosedur atau kebijakan yang tidak efisien dan tidak logis, serta mengembangkan sistem yang luas untuk menyelesaikan masalah organisasi. Menyukai rencana jangka panjang dan penetapan target terukur. Berpengetahuan luas, pembaca tekun, dan senang membagikan wawasan.",
            definisi: "ENTJ (Extraversion, Intuition, Thinking, Judging) tergolong Temperamen Rational (David Keirsey). Karakter ini berfokus pada penguasaan kompetensi logis dan keunggulan strategi. Unggul dalam merancang penyelidikan objektif, konseptualisasi korporat, dan pengarahan organisasi berskala besar.",
            dimensiMBTI: {
                E: "Memimpin dari depan, berenergi tinggi dalam forum publik, dan tegas dalam koordinasi eksternal.",
                N: "Berfokus pada gambaran besar strategis, tren makro industri, dan visi jangka panjang.",
                T: "Mengambil keputusan berdasarkan fakta objektif, rasionalitas murni, dan tolok ukur efisiensi tugas.",
                J: "Sangat terstruktur, mengontrol prediktabilitas sistem, dan menyukai ketepatan tenggat waktu."
            },
            ciriUmum: [
                "Terdorong mengubah konsep teoritis menjadi rencana aksi nyata",
                "Sangat menghargai pengetahuan, kompetensi, dan profesionalisme tinggi",
                "Berorientasi kuat pada masa depan dan pertumbuhan jangka panjang",
                "Pemimpin alami yang berani mengambil keputusan sulit",
                "Kurang sabar terhadap ketidakefisienan, kelambanan, atau inkompetensi",
                "Menginginkan lingkungan kerja yang tertata, terstruktur, dan teratur",
                "Keterampilan komunikasi verbal yang sangat tajam, berwibawa, dan meyakinkan",
                "Fokus pada hasil makro; tidak suka berkutat pada rutinitas administratif sepele",
                "Percaya diri tinggi dan determinatif dalam mencapai target"
            ],
            karirCatatan: "ENTJ memiliki kecocokan luar biasa pada posisi manajerial puncak, direksi perusahaan, konsultan bisnis strategis, dan bidang yang menuntut ketegasan arah.",
            saranKarir: [
                "Direktur Eksekutif / CEO", "Staf Pelaksana Perusahaan / General Manager", "Pengusaha / Wirausahawan",
                "Konsultan Manajemen & IT", "Pengacara Korporat", "Hakim", "Pimpinan Usaha / Manajer Operasional", "Profesor / Pimpinan Universitas"
            ],
            partnerAlami: {
                mitra: "INTP atau ISTP",
                deskripsi: "Fungsi Extraverted Thinking (ET) sangat sinergis bila dipadukan dengan nalar mandiri dan ketajaman teknis Introverted Thinking (IT)."
            },
            saranPengembangan: [
                "Belajarlah untuk rileks; tidak perlu selalu perfeksionis dan kompetitif dalam segala situasi.",
                "Ungkapkan empati dan dengarkan masukan anggota tim; memperhatikan perasaan rekan bukanlah tanda kelemahan.",
                "Kelola emosi dengan bijak; jangan mudah meledak atau frustrasi ketika orang lain memerlukan waktu adaptasi.",
                "Apresiasi kontribusi bawahan secara tulus dan bangun iklim kerja yang saling menghormati.",
                "Hindari kesan arogan; lihat sisi positif dari berbagai cara kerja alternatif."
            ],
            kataKunci: ["Berorganisasi", "Problem Solver Sistemik", "Tegas", "Analitis", "Visi Jangka Panjang"],
            tokohTerkenal: ["Margaret Thatcher", "Franklin D. Roosevelt", "Candace Bergen", "Al Gore", "Harrison Ford", "David Letterman", "Richard M. Nixon", "Patrick Stewart"]
        },
        "ENTP": {
            nama: "The Visionary / The Innovator",
            alias: "One Exciting Challenge After Another",
            temperamen: "Rational",
            populasi: "2–5% dari populasi dunia",
            karakter: "Cepat tanggap, cerdas, kreatif, strategis, dan tertantang memecahkan persoalan pelik.",
            gayaKerja: "Mengeksplorasi konsep baru yang mendisrupsi status quo dan menguji ide lewat diskusi.",
            kekuatan: "Inovasi out-of-the-box, pemecahan masalah multidimensi, negosiasi lincah, dan adaptif.",
            gambaranSingkat: "Cepat, berbakat, pendorong, siaga, dan blak-blakan. Cerdik dalam menyelesaikan masalah baru yang menantang. Terampil menghasilkan berbagai kemungkinan konseptual lalu menganalisisnya secara strategis. Mahir membaca karakter orang lain. Cepat bosan dengan rutinitas harian dan selalu terpikat pada tantangan segar.",
            definisi: "ENTP (Extraversion, Intuition, Thinking, Perception) tergolong Temperamen Rational (David Keirsey). Terkenal sebagai penemu gagasan dan pendebat intelektual yang unggul dalam riset strategis, teknik inovatif, serta perancangan sistem yang fleksibel dan canggih.",
            dimensiMBTI: {
                E: "Termotivasi melalui perdebatan ide terbuka, dinamika sosial interaktif, dan kolaborasi konseptual.",
                N: "Melihat pola tersembunyi, hubungan abstrak, dan berbagai terobosan kemungkinan masa depan.",
                T: "Menilai segala sesuatu dengan nalar kritis, logika objektif, dan pertimbangan rasional.",
                P: "Fleksibel, adaptif, menolak kekakuan birokrasi, dan menjaga opsi kerja tetap dinamis."
            },
            ciriUmum: [
                "Berorientasi pada inovasi proyek dan pengembangan teori baru",
                "Merasa bergairah ketika merancang ide dan konsep yang belum pernah ada",
                "Kreatif, orisinal, dan multitalenta",
                "Cerdas, tanggap, dan berkemampuan teknis tinggi",
                "Fleksibel dan mampu berpindah cepat antar bidang keilmuan",
                "Keterampilan komunikasi verbal yang tajam, cerdas, dan diplomatis",
                "Senang menguji argumen dan memperdebatkan masalah secara logis",
                "Pemimpin alami yang tidak suka mendikte atau mengekang kebebasan orang lain",
                "Menolak dikendalikan oleh tradisi yang tidak masuk akal",
                "Bersemangat tinggi dan mampu menularkan motivasi ke rekan tim"
            ],
            karirCatatan: "ENTP unggul pada profesi yang membutuhkan kecerdasan taktis, pemecahan masalah tanpa rumus baku, kebebasan berpikir, dan dinamika kompetitif tinggi.",
            saranKarir: [
                "Pengacara / Konsultan Hukum", "Psikolog Organisasi", "Pebisnis / Wirausahawan", "Fotografer / Direktur Kreatif",
                "Konsultan Manajemen & Bisnis", "Insinyur Riset & Teknologi", "Ahli Keilmuan / Peneliti", "Aktor / Entertainer",
                "Staf Penjualan Tingkat Tinggi", "Staf Pemasaran & Strategi Brand", "Programmer / System Analyst"
            ],
            partnerAlami: {
                mitra: "INFJ atau INTJ",
                deskripsi: "Fungsi Extraverted Intuition (EN) berpadu dinamis dengan kedalaman visi dan struktur Introverted Intuition (IN)."
            },
            saranPengembangan: [
                "Prioritaskan solusi menang-menang (win-win); jangan berorientasi sekadar memenangkan debat.",
                "Tingkatkan disiplin dan konsistensi untuk menuntaskan ide hingga implementasi selesai.",
                "Hindari membuang energi pada perdebatan argumen yang tidak substantif.",
                "Seimbangkan optimisme dengan perhitungan risiko realistis.",
                "Berikan perhatian dan kehangatan pada perasaan serta kenyamanan rekan kerja."
            ],
            kataKunci: ["Kreatif", "Problem Solver Sistemik", "Analitis", "Paham Hal Teknis", "Wirausahawan"],
            tokohTerkenal: ["Thomas Edison", "John Adams", "Theodore Roosevelt", "Alexander the Great", "Lewis Carroll", "Julia Child", "Alfred Hitchcock", "Walt Disney"]
        },
        "ISFJ": {
            nama: "The Protector / The Nurturer",
            alias: "A High Sense of Duty",
            temperamen: "Guardian",
            populasi: "9–14% dari populasi dunia",
            karakter: "Teliti, tenang, bertanggung jawab, ramah, dan sangat berdedikasi menjaga stabilitas.",
            gayaKerja: "Bekerja cermat, memastikan standar kualitas operasional, dan mendukung kelancaran tim.",
            kekuatan: "Ketelitian luar biasa, loyalitas tinggi, manajemen logistik rapi, dan empati kerja.",
            gambaranSingkat: "Tenang, ramah, bertanggung jawab, dan teliti. Berkomitmen dan bersungguh-sungguh dalam memenuhi kewajiban. Cermat, telaten, dan akurat. Loyal, baik hati, perhatian dan selalu mengingat secara spesifik tentang rekan kerja penting. Berupaya keras menciptakan lingkungan kerja yang tertib, harmonis, dan stabil.",
            definisi: "ISFJ (Introversion, Sensing, Feeling, Judging) adalah bagian terbesar dari Temperamen Guardian (David Keirsey). Mengutamakan keamanan, tradisi, dan tanggung jawab nyata. Sangat unggul dalam logistik, pengorganisasian data akurat, pemeriksaan kepatuhan, dan fasilitasi kerja sama tim.",
            dimensiMBTI: {
                I: "Tenang, reflektif, memulihkan energi dalam suasana kerja hening dan fokus mandiri.",
                S: "Mengutamakan fakta konkret, bukti nyata, prosedur yang terbukti, dan ketelitian detail.",
                F: "Mempertimbangkan empati, harmoni kerja, dan kepedulian manusiawi dalam setiap keputusan.",
                J: "Terencana, menyukai alur kerja terstruktur, patuh jadwal, dan taat SOP."
            },
            ciriUmum: [
                "Kaya akan memori detail mengenai fakta kerja dan kebutuhan manusia di sekitarnya",
                "Sangat jeli memahami perasaan dan kebutuhan rekan tim",
                "Memiliki daya ingat luar biasa untuk rincian prosedur operasional",
                "Sangat selaras dan peka terhadap lingkungan kerja fisik",
                "Sangat andal dan selalu menuntaskan pekerjaan sampai akhir",
                "Pekerja keras yang rela meluangkan waktu demi memastikan mutu terbaik",
                "Stabil, praktis, bersahaja; tidak menyukai spekulasi teori tanpa guna konkret",
                "Menjunjung tinggi nilai keamanan, tradisi, dan etika kerja yang baik",
                "Berorientasi pada pelayanan dan dukungan tim secara nyata",
                "Sangat tidak nyaman dengan konflik terbuka dan konfrontasi"
            ],
            karirCatatan: "ISFJ berkinerja unggul di lingkungan yang membutuhkan keteraturan administratif, ketelitian pemeliharaan standar, pelayanan tulus, dan manajemen operasional terpercaya.",
            saranKarir: [
                "Dekorator Interior / Perancang Ruang", "Desainer Produk", "Perawat / Tenaga Medis", "Pengelola & Manajer Fasilitas",
                "Asisten Administratif / Sekretaris Eksekutif", "Pemerhati & Pendidik Anak Usia Dini", "Pekerja Sosial / Konselor",
                "Paralegal / Pembantu Hukum", "Pengelola Organisasi Sosial / Keagamaan", "Pimpinan Usaha Ritel", "Manajer Keuangan / Akuntan", "Konsultan Ekonomi Perkantoran"
            ],
            partnerAlami: {
                mitra: "ESTP atau ESFP",
                deskripsi: "Fungsi Introverted Sensing (IS) sangat seimbang bila berpasangan dengan dinamika aksi Extraverted Sensing (ES)."
            },
            saranPengembangan: [
                "Tingkatkan antusiasme dan beranikan diri menyuarakan ide inovatif secara terbuka.",
                "Belajarlah berkata 'TIDAK'; jangan berusaha menyenangkan semua pihak hingga membebani diri sendiri.",
                "Jangan terjebak di zona nyaman; cobalah metode dan teknologi baru yang dapat meningkatkan efisiensi.",
                "Terimalah evaluasi secara objektif tanpa merasa bersalah berlebihan."
            ],
            kataKunci: ["Terorganisir", "Mempertahankan Keberhasilan", "Membangun Kesepakatan", "Terampil", "Setia & Andal"],
            tokohTerkenal: ["Bunda Teresa (Mother Teresa)", "Louisa May Alcott", "Ratu Elizabeth II", "Jenderal Robert E. Lee", "Ratu Mary I", "Kristi Yamaguchi", "Michael Caine", "Alfred Lord Tennyson"]
        },
        "ISFP": {
            nama: "The Composer / The Artist",
            alias: "Sees Much But Shares Little",
            temperamen: "Artisan",
            populasi: "5–9% dari populasi dunia",
            karakter: "Tenang, sensitif, ramah, berpikiran terbuka, dan menghargai keindahan serta harmoni.",
            gayaKerja: "Bekerja dengan dedikasi tenang, fleksibel tanpa friksi, dan mengutamakan sentuhan praktis.",
            kekuatan: "Adaptabilitas tinggi, kepekaan estetika, ketenangan dalam bekerja, dan integritas batin.",
            gambaranSingkat: "Tenang, ramah, sensitif, dan baik hati. Menikmati apa yang sedang terjadi saat ini di sekitar mereka. Ingin memiliki ruang kerja pribadi dan rentang waktu kerja sendiri. Loyal dan berkomitmen penuh untuk nilai prinsip yang dipegang. Tidak menyukai perselisihan dan tidak memaksakan prinsip pada orang lain.",
            definisi: "ISFP (Introversion, Sensing, Feeling, Perception) tergolong Temperamen Artisan (David Keirsey). Sosok yang mengedepankan taktik adaptif, kepekaan sensorik, manipulasi alat/instrumen fisik, dan penyelesaian masalah praktis secara luwes dan berjiwa seni.",
            dimensiMBTI: {
                I: "Pendiam, berorientasi batin, membutuhkan ruang privasi untuk berkreasi maksimal.",
                S: "Berakar pada detail sensorik nyata, fakta empiris, dan keindahan saat ini.",
                F: "Membuat keputusan berdasarkan keselarasan nurani, nilai personal, dan empati tulus.",
                P: "Fleksibel, santai, spontan, dan tidak suka dibatasi oleh aturan birokrasi kaku."
            },
            ciriUmum: [
                "Kesadaran mendalam mengenai lingkungan fisik, estetika, dan suasana sekitar",
                "Fokus menikmati dan menjalani momen masa kini secara utuh",
                "Menyukai tempo kerja yang mengalir tanpa tekanan terburu-buru",
                "Praktis; enggan berkutat pada teori abstrak tanpa implementasi nyata",
                "Sangat setia dan berintegritas kepada nilai serta orang yang dipercaya",
                "Mandiri dan individualistis; tidak berhasrat mendikte ataupun didikte",
                "Memiliki rasa kasih dan empati alami pada manusia dan alam sekitar",
                "Rendah hati, bersahaja, dan tidak suka menyombongkan keahlian",
                "Pola pikir dan karya yang orisinal serta antimainstream",
                "Belajar paling efektif melalui tindakan praktik langsung di lapangan"
            ],
            karirCatatan: "ISFP paling berkembang dalam lingkungan kerja suportif yang menghargai kebebasan berkreasi, aplikasi estetika, karya konkret, dan interaksi yang damai.",
            saranKarir: [
                "Seniman / Pelukis / Ilustrator", "Desainer Grafis / Mode / Interior", "Pemerhati Tumbuh Kembang Anak",
                "Pekerja Sosial / Konselor Empatik", "Guru Seni / Instruktur Kreatif", "Psikolog", "Dokter Hewan",
                "Polisi Hutan / Konservasi Lingkungan", "Dokter Anak"
            ],
            partnerAlami: {
                mitra: "ESFJ atau ENFJ",
                deskripsi: "Fungsi Introverted Feeling (IF) berpadu harmonis dengan kehangatan komunikasi dan fasilitasi Extraverted Feeling (EF)."
            },
            saranPengembangan: [
                "Jangan takut pada penolakan atau diskusi kritis; hadapi perbedaan pandangan secara wajar.",
                "Mulailah menyusun rencana dan memikirkan dampak jangka panjang dari keputusan hari ini.",
                "Asah dan kembangkan talenta kreatif menjadi nilai kompetitif profesional yang terukur.",
                "Belajarlah untuk lebih terbuka mengekspresikan gagasan dan perasaan kepada anggota tim."
            ],
            kataKunci: ["Membujuk Lemah Lembut", "Pengrajin / Taktisi", "Mudah Beradaptasi", "Terampil", "Membangun Kesepakatan"],
            tokohTerkenal: ["Fred Astaire", "Marilyn Monroe", "Marie Antoinette", "Elizabeth Taylor", "Barbara Streisand", "Paul McCartney", "Auguste Rodin", "Wolfgang Amadeus Mozart"]
        },
        "ISTJ": {
            nama: "The Inspector / Duty Fulfiller",
            alias: "Doing What Should be Done",
            temperamen: "Guardian",
            populasi: "11–14% dari populasi dunia",
            karakter: "Praktis, berbasis fakta, serius, andal, dan sangat berpegang teguh pada komitmen.",
            gayaKerja: "Bekerja metodis, taat SOP, menjaga ketepatan pembukuan, dan menegakkan standar mutu.",
            kekuatan: "Disiplin kerja tinggi, ketelitian detail, loyalitas organisasi, dan tanggung jawab penuh.",
            gambaranSingkat: "Tenang, serius, meraih kesuksesan melalui ketelitian dan kehandalan dalam bekerja. Praktis, berorientasi fakta, realistis, dan bertanggung jawab. Memutuskan apa yang harus dilakukan secara logis, dan bekerja tekun pada satu hal tanpa terpengaruh gangguan. Menikmati segala sesuatu yang tertib dan teratur dalam organisasi.",
            definisi: "ISTJ (Introversion, Sensing, Thinking, Judging) tergolong Temperamen Guardian (David Keirsey). Merupakan benteng ketertiban organisasi yang menjaga kontinuitas operasional, kepatuhan hukum/standar, dan eksekusi tugas tanpa kompromi.",
            dimensiMBTI: {
                I: "Tenang, mandiri, mampu bekerja dalam konsentrasi mendalam tanpa perlu distraksi sosial.",
                S: "Mengutamakan fakta konkret, bukti empiris teruji, data akurat, dan kepatuhan prosedur.",
                T: "Mengambil keputusan secara objektif, rasional, adil, dan berorientasi pada aturan formal.",
                J: "Sangat sistematis, menghormati jadwal, terencana bertahap, dan disiplin tenggat waktu."
            },
            ciriUmum: [
                "Menjunjung tinggi nilai tradisi, etika kerja, dan kesejahteraan organisasi",
                "Pekerja keras yang mampu bekerja lama menyelesaikan tugas berat",
                "Sangat dapat diandalkan dan konsisten menepati janji serta target",
                "Loyal, setia, stabil, praktis, dan berpijak pada kenyataan",
                "Mengutamakan akal sehat dan tidak suka hal yang tidak masuk akal",
                "Pemimpin alami yang tenang, berwibawa, dan memimpin dengan contoh nyata",
                "Sangat jeli merekam dan mengolah fakta konkret secara internal",
                "Membuat keputusan objektif berbasis logika dan data tanpa bias subjektif",
                "Menciptakan dan memelihara lingkungan kerja yang terstruktur dan tertib"
            ],
            karirCatatan: "ISTJ sangat cocok pada ranah manajemen operasional, pembukuan keuangan, penegakan regulasi, audit sistem, dan kepemimpinan berintegritas tinggi.",
            saranKarir: [
                "Dokter / Spesialis Medis", "Eksekutif Bisnis & Manajer Operasional", "Akuntan Publik & Auditor Finansial",
                "Polisi & Detektif Investigasi", "Hakim", "Pengacara Korporat", "Dokter Gigi",
                "Pemrogram Komputer / System Analyst", "Pemimpin Militer / Keamanan Korporat"
            ],
            partnerAlami: {
                mitra: "ESFP atau ESTP",
                deskripsi: "Fungsi Introverted Sensing (IS) sangat seimbang bila berkolaborasi dengan aksi dinamis Extraverted Sensing (ES)."
            },
            saranPengembangan: [
                "Belajarlah memahami kebutuhan emosional dan dinamika perasaan rekan kerja.",
                "Kurangi kecenderungan terlalu kaku mengontrol orang lain atau mendikte aturan berlebihan.",
                "Lihatlah lebih banyak sisi positif dan inovasi pada metode kerja baru.",
                "Terbukalah terhadap perubahan sistem yang dapat meningkatkan fleksibilitas tim."
            ],
            kataKunci: ["Terorganisir", "Tegas", "Mengikuti Alur Baku", "Menyelesaikan Tugas", "Menjaga Kerangka Kerja"],
            tokohTerkenal: ["George Washington", "Henry Ford", "Johnny Carson", "Ratu Elizabeth II", "Calvin Coolidge", "Evander Holyfield", "Warren Buffett"]
        },
        "ISTP": {
            nama: "The Mechanics / The Craftsman",
            alias: "Ready to Try Anything Once",
            temperamen: "Artisan",
            populasi: "4–6% dari populasi dunia",
            karakter: "Teknis, tenang, fleksibel, rasional, dan pemecah masalah praktis yang tangguh.",
            gayaKerja: "Menganalisis sistem langsung di lapangan, sigap menangani krisis teknis dan operasional.",
            kekuatan: "Problem solving teknis, ketenangan di bawah tekanan, efisiensi kerja, dan akal sehat.",
            gambaranSingkat: "Bersikap toleran dan fleksibel; pengamat tenang sampai timbul masalah, kemudian bertindak cepat menemukan solusi terbaik. Menganalisis apa yang membuat sesuatu bekerja, dan mampu segera menemukan inti persoalan. Tertarik dengan sebab dan akibat, mengolah fakta logis, efisien, dan berorientasi hasil nyata.",
            definisi: "ISTP (Introversion, Sensing, Thinking, Perception) tergolong Temperamen Artisan (David Keirsey). Ahli taktik dan penanganan krisis lapangan yang menguasai pengoperasian alat, perbaikan mesin/perangkat lunak, serta penyelesaian masalah dengan nalar dingin.",
            dimensiMBTI: {
                I: "Tenang, mandiri, mengumpulkan fakta secara hening dan berfokus pada observasi mendalam.",
                S: "Berakar pada realitas mekanis fisik, fakta konkret, dan detail teknis langsung.",
                T: "Menilai berdasarkan kriteria objektif, efisiensi fungsional, dan prinsip sebab-akibat.",
                P: "Fleksibel, adaptif, tidak suka terikat jadwal kaku, dan responsif terhadap kondisi darurat."
            },
            ciriUmum: [
                "Tertarik mendalam pada bagaimana dan mengapa suatu sistem bekerja",
                "Cepat merasa letih dalam lingkungan kerja yang monoton dan birokratis kaku",
                "Pengumpul data empiris yang tajam dan analitis",
                "Kemampuan luar biasa menerapkan logika praktis untuk mengatasi masalah rumit",
                "Turun tangan langsung di lapangan adalah metode belajar terbaik mereka",
                "Berorientasi pada aksi nyata dan pencapaian hasil seketika",
                "Fokus menjalani hidup pada saat ini; sangat realistis",
                "Pemecah masalah praktis yang hebat dan tenang saat menghadapi krisis",
                "Mandiri, percaya diri, dan berani mengambil risiko terukur"
            ],
            karirCatatan: "ISTP berprestasi tinggi dalam bidang rekayasa teknologi, investigasi forensik, penerbangan, manajemen krisis darurat, dan pemeliharaan sistem industri.",
            saranKarir: [
                "Polisi / Detektif Lapangan", "Ahli Forensik Kriminalitas", "Programmer / System Analyst",
                "Insinyur Mekanikal / Elektrikal", "Pemahat / Desainer Industri", "Mekanik Ahli",
                "Pilot / Penerbang", "Atlet Profesional", "Pengusaha Manufaktur / Kontraktor"
            ],
            partnerAlami: {
                mitra: "ESTJ atau ENTJ",
                deskripsi: "Fungsi Introverted Thinking (IT) berpadu efektif dengan dorongan eksekutif Extraverted Thinking (ET)."
            },
            saranPengembangan: [
                "Observasilah dinamika sosial; pahami apa yang memotivasi dan menyenangkan rekan kerja.",
                "Belajarlah mengenali perasaan pribadi dan mengomunikasikannya secara konstruktif.",
                "Jadilah pribadi yang lebih terbuka; diskusikan rencana kerja dan jangan bekerja sendirian.",
                "Hindari mencari-cari kesalahan orang lain hanya demi membuktikan logika Anda.",
                "Delegasikan tanggung jawab dan percayakan tugas pada anggota tim."
            ],
            kataKunci: ["Analitis", "Pemecah Masalah", "Keahlian Teknis Murni", "Mudah Beradaptasi", "Berani Mengambil Risiko"],
            tokohTerkenal: ["Tom Cruise", "Keith Richards", "James Dean", "Clint Eastwood", "Zachary Taylor", "Chuck Yeager", "Alan Shepard", "Amelia Earhart", "Frida Kahlo", "Tiger Woods"]
        },
        "ESFJ": {
            nama: "The Provider / The Caregiver",
            alias: "Hosts and Hostesses of the World",
            temperamen: "Guardian",
            populasi: "9–13% dari populasi dunia",
            karakter: "Peduli, kooperatif, bersahabat, loyal, dan organisator tim yang sangat solid.",
            gayaKerja: "Memastikan koordinasi antaranggota tim rukun, teratur, teliti, dan tepat waktu.",
            kekuatan: "Manajemen relasi interpersonal, pelayanan pelanggan prima, kerja tim, dan ketertiban.",
            gambaranSingkat: "Bersahabat, bersungguh-sungguh, dan dapat bekerja sama secara harmonis. Bekerja dengan kebulatan tekad dan loyalitas tinggi. Senang berkolaborasi menyelesaikan tugas dengan teliti dan tepat waktu. Peka terhadap kebutuhan rekan kerja dan berusaha memenuhinya. Ingin dihargai atas dedikasi dan kontribusinya.",
            definisi: "ESFJ (Extraversion, Sensing, Feeling, Judging) adalah pilar Temperamen Guardian (David Keirsey). Menguasai koordinasi fasilitas, fasilitasi kerja tim, pelayanan prima, dan pemeliharaan prosedur kerja yang menyejahterakan seluruh anggota organisasi.",
            dimensiMBTI: {
                E: "Energik dalam interaksi publik, ramah, dan aktif memelihara komunikasi tim yang erat.",
                S: "Memperhatikan detail praktis, kebutuhan konkret sehari-hari, dan fakta lapangan.",
                F: "Mengambil keputusan dengan mengedepankan empati, kepedulian sosial, dan keharmonisan.",
                J: "Terencana, tertib jadwal, menghargai aturan baku, dan disiplin dalam eksekusi."
            },
            ciriUmum: [
                "Sangat terorganisir, loyal, dan dapat diandalkan menyelesaikan tugas hingga tuntas",
                "Senang menciptakan ketertiban, struktur, dan jadwal yang teratur",
                "Ramah, bersahabat, simpatik, dan mudah bergaul",
                "Cenderung menempatkan kebutuhan orang lain di atas kebutuhan pribadi",
                "Sangat terampil dalam memberikan perawatan dan dukungan praktis",
                "Anggota tim yang luar biasa kooperatif dan suportif",
                "Memegang teguh nilai keamanan, tradisi, dan suasana kerja yang damai",
                "Mampu menangani tugas rutin secara rapi dan konsisten",
                "Memperoleh kepuasan batin yang mendalam dengan memberi kontribusi nyata",
                "Fokus pada realitas saat ini daripada spekulasi abstrak"
            ],
            karirCatatan: "ESFJ menunjukkan performa luar biasa dalam manajemen kepegawaian, layanan pelanggan, pendidikan, administrasi kesehatan, dan koordinasi acara.",
            saranKarir: [
                "Konsultan Ekonomi Perkantoran / Rumah Tangga", "Perawat / Koordinator Medis", "Pengajar / Kepala Sekolah",
                "Pengelola Fasilitas & Manajer Operasional", "Pemerhati Anak", "Dokter Praktik Keluarga",
                "Pengelola Organisasi Sosial / Keagamaan", "Pimpinan Usaha Ritel", "Penasihat / Pekerja Sosial",
                "Akuntan", "Asisten Administratif Eksekutif"
            ],
            partnerAlami: {
                mitra: "ISFP atau INFP",
                deskripsi: "Fungsi Extraverted Feeling (EF) bersinergi sangat serasi dengan ketulusan nurani Introverted Feeling (IF)."
            },
            saranPengembangan: [
                "Jangan mengorbankan waktu dan kesehatan diri sendiri hanya demi menyenangkan semua orang.",
                "Jangan mengukur harga diri semata-mata dari perlakuan, penghargaan, atau pujian orang lain.",
                "Mintalah pertimbangan objektif dan belajarlah untuk lebih tegas (asertif) saat mengambil keputusan.",
                "Terima tanggung jawab secara dewasa; hadapi kritik dan konflik tanpa harus lari."
            ],
            kataKunci: ["Mengembangkan Prosedur Efektif", "Tegas", "Memelihara Keberhasilan", "Terampil", "Menciptakan Kesepakatan"],
            tokohTerkenal: ["Terry Bradshaw", "Sally Field", "Bill Clinton", "William McKinley", "Nancy Kerrigan"]
        },
        "ESFP": {
            nama: "The Performer / The Entertainer",
            alias: "You Only Go Around Once in Life",
            temperamen: "Artisan",
            populasi: "4–9% dari populasi dunia",
            karakter: "Ramah, antusias, spontan, menyenangkan, dan penyemangat lingkungan kerja.",
            gayaKerja: "Membangun suasana kerja yang hidup, kolaboratif, luwes, dan berorientasi aksi nyata.",
            kekuatan: "Kecerdasan sosial tinggi, presentasi publik memikat, optimisme, dan negosiasi dinamis.",
            gambaranSingkat: "Ramah, bersahabat, dan menerima situasi apa adanya. Sosok yang mencintai kehidupan, sesama, dan kenyamanan lingkungan. Menggunakan akal sehat dan pendekatan realistis dalam pekerjaan, serta menjadikan tugas sebagai hal yang menyenangkan. Fleksibel, spontan, dan cepat beradaptasi. Belajar paling optimal dengan mencoba keterampilan baru bersama rekan kerja.",
            definisi: "ESFP (Extraversion, Sensing, Feeling, Perception) tergolong Temperamen Artisan (David Keirsey). Merupakan komunikator publik dan praktisi lapangan yang unggul dalam mencairkan ketegangan, membangun antusiasme tim, negosiasi lincah, dan demonstrasi praktis.",
            dimensiMBTI: {
                E: "Sangat ekspresif, energik, senang berada di pusat kegiatan sosial, dan menghidupkan tim.",
                S: "Sangat jeli mengamati lingkungan fisik nyata dan mengutamakan fakta konkret.",
                F: "Hangat, peduli perasaan orang lain, dan berempati tulus dalam berinteraksi.",
                P: "Spontan, adaptif, luwes, dan tidak menyukai belenggu struktur yang kaku."
            },
            ciriUmum: [
                "Hidup di momen sekarang dengan semangat dan kegembiraan tinggi",
                "Praktis, realistis, dan berorientasi pada aksi nyata",
                "Hangat dan berbakat membangun keakraban dengan cepat",
                "Mampu menciptakan suasana yang ceria dan menyenangkan bagi tim",
                "Mandiri, cerdas, dan tangkas dalam beradaptasi",
                "Spontan dalam bekerja dan jarang terpaku pada rencana kaku",
                "Tidak menyukai teori abstrak yang berbelit-belit dan teks laporan panjang",
                "Apresiasi estetika dan detail penampilan yang sangat baik",
                "Keterampilan komunikasi interpersonal dan persuasi yang hebat"
            ],
            karirCatatan: "ESFP sangat berhasil dalam penjualan, kehumasan (PR), industri kreatif, hospitality, penyiaran, dan bidang yang mengandalkan pesona komunikasi personal.",
            saranKarir: [
                "Seniman, Performer & Aktor", "Tenaga Penjualan (Sales Executive)", "Penasihat / Pekerja Sosial",
                "Pemerhati Anak", "Desainer Pakaian / Mode", "Dekorator Interior", "Konsultan Hospitality & Pariwisata", "Fotografer Komersial"
            ],
            partnerAlami: {
                mitra: "ISTJ atau ISFJ",
                deskripsi: "Fungsi Extraverted Sensing (ES) sangat harmonis dipadukan dengan stabilitas dan keteraturan Introverted Sensing (IS)."
            },
            saranPengembangan: [
                "Jangan terburu-buru mengambil keputusan; belajarlah fokus dan tidak mudah berubah-ubah pada hal strategis.",
                "Sadari bahwa Anda tidak bisa menyenangkan semua orang, begitu pun sebaliknya.",
                "Hadapi kritik dan konflik secara dewasa tanpa menghindar.",
                "Waspadai kecenderungan konsumtif/materialistis; buatlah perencanaan finansial dan komitmen kerja jangka panjang."
            ],
            kataKunci: ["Mudah Beradaptasi", "Antusias", "Energik", "Memotivasi Orang Lain", "Negosiasi", "Membangun Kesepakatan", "Pemecah Masalah"],
            tokohTerkenal: ["Bill Clinton", "Ronald Reagan", "Bob Hope", "Marilyn Monroe", "Pablo Picasso", "Woody Harrelson", "Goldie Hawn", "Saint Mark"]
        },
        "ESTJ": {
            nama: "The Supervisor / The Overseer",
            alias: "Life's Administrator",
            temperamen: "Guardian",
            populasi: "8–12% dari populasi dunia",
            karakter: "Tegas, terorganisir, praktis, realistis, berorientasi target, dan berjiwa pemimpin kuat.",
            gayaKerja: "Menegakkan disiplin, mengelola alur kerja sistematis, dan mengawal kepatuhan SOP terukur.",
            kekuatan: "Manajemen proyek handal, ketegasan memimpin, efisiensi operasional, dan integritas.",
            gambaranSingkat: "Praktis, realistis, dan berpegang teguh pada fakta. Tegas, dengan cepat mengimplementasikan keputusan. Mampu mengatur pekerjaan dan orang lain, terfokus untuk mendapatkan hasil dengan cara yang paling efisien. Selalu menjaga detail rutinitas. Memiliki standar logika jelas yang secara sistematis menuntun alur kerja tim.",
            definisi: "ESTJ (Extraversion, Sensing, Thinking, Judging) tergolong Temperamen Guardian (David Keirsey). Pilar pengawas operasional yang memastikan seluruh tata tertib, regulasi, jadwal produksi, dan standar mutu terlaksana secara konsisten tanpa deviasi.",
            dimensiMBTI: {
                E: "Memimpin komunikasi secara terbuka, vokal, berwibawa, dan aktif menggerakkan tim.",
                S: "Mengandalkan fakta konkret, bukti empiris teruji, data akurat, dan kepatuhan prosedur.",
                T: "Mengambil keputusan secara objektif, rasional, adil, dan berorientasi pada pencapaian tugas.",
                J: "Sangat terstruktur, menyukai jadwal rapi, taat proses, dan menuntut kepastian hasil."
            },
            ciriUmum: [
                "Pemimpin alami yang selalu siap memikul tanggung jawab penuh",
                "Menggenggam erat nilai keamanan, tradisi, dan etika kerja tinggi",
                "Setia, pekerja keras, dan sangat dapat diandalkan",
                "Memiliki aturan standar yang jelas dan konsisten menjalankannya",
                "Tidak toleran terhadap ketidakmampuan, kelalaian, atau inefisiensi",
                "Kemampuan pengorganisasian kerja yang sangat kuat",
                "Senang menciptakan ketertiban dan struktur dalam organisasi",
                "Sangat teliti mengawal jalannya tugas hingga tuntas",
                "Selalu berterus terang, lugas, jujur, dan berorientasi pada kewajiban"
            ],
            karirCatatan: "ESTJ berkinerja puncak pada kepemimpinan operasional, penegakan hukum/audit, perwira militer, manajemen rantai pasok (supply chain), dan direktur penjualan.",
            saranKarir: [
                "Pimpinan Militer / Keamanan", "Pengelola Usaha & Manajer Operasional", "Polisi / Detektif Investigasi",
                "Hakim", "Petugas Keuangan / Financial Officer", "Pengajar / Instruktur Kedisiplinan", "Tenaga Penjualan Manajerial"
            ],
            partnerAlami: {
                mitra: "ISTP atau INTP",
                deskripsi: "Fungsi Extraverted Thinking (ET) sangat klop bila berpasangan dengan nalar analitis independen Introverted Thinking (IT)."
            },
            saranPengembangan: [
                "Kurangi keinginan untuk terlalu mengontrol atau memaksakan kehendak pada orang lain.",
                "Belajarlah mengontrol emosi dan dengarkan keberatan bawahan secara bijaksana.",
                "Luangkan waktu untuk introspeksi diri dan merenungkan perbaikan jangka panjang.",
                "Belajarlah untuk lebih sabar, low profile, dan apresiatif terhadap proses orang lain.",
                "Pahami sudut pandang dan perasaan rekan kerja yang berbeda latar belakang."
            ],
            kataKunci: ["Mengatur Orang & Tugas", "Analitis", "Problem Solver Fungsional", "Menjalankan Prosedur", "Pengambil Keputusan"],
            tokohTerkenal: ["James Monroe", "Harry S. Truman", "George W. Bush", "Sam Walton", "John D. Rockefeller", "Billy Graham", "Bette Davis"]
        },
        "ESTP": {
            nama: "The Dynamo / The Doer",
            alias: "The Ultimate Realistic",
            temperamen: "Artisan",
            populasi: "4–5% dari populasi dunia",
            karakter: "Enerjik, taktis, berani mengambil risiko, fleksibel, dan berorientasi hasil cepat.",
            gayaKerja: "Mengambil tindakan langsung di lapangan untuk menyelesaikan hambatan tanpa berbelit-belit.",
            kekuatan: "Keputusan cepat di tengah krisis, negosiasi lincah, akal sehat praktis, dan keuletan.",
            gambaranSingkat: "Fleksibel dan toleran, mengambil pendekatan praktis yang berfokus pada hasil instan. Teori dan penjelasan konseptual membosankan bagi mereka; mereka bertindak cepat dan energik untuk memecahkan masalah. Berfokus pada situasi saat ini, spontan, menikmati kenyamanan materi dan gaya hidup dinamis. Belajar terbaik dengan melakukan aksi langsung.",
            definisi: "ESTP (Extraversion, Sensing, Thinking, Perception) tergolong Temperamen Artisan (David Keirsey). Merupakan negosiator taktis dan operator tangguh yang unggul dalam mengatasi krisis mendesak dengan kecerdikan improvisasi dan kecepatan eksekusi.",
            dimensiMBTI: {
                E: "Sangat aktif, berenergi tinggi dalam interaksi sosial bisnis, dan persuasif.",
                S: "Memusatkan perhatian pada situasi nyata di lapangan dan detail fisik lingkungan.",
                T: "Rasional, logis, tidak berbelit-belit, dan fokus pada solusi praktis paling menguntungkan.",
                P: "Fleksibel, responsif, berani berimprovisasi, dan tidak suka terikat jadwal kaku."
            },
            ciriUmum: [
                "Berorientasi kuat pada tindakan dan hasil langsung",
                "Hidup penuh energi pada momen saat ini",
                "Tidak menyukai teori abstrak tanpa aplikasi praktis nyata",
                "Ingin melihat hasil langsung atas setiap upaya yang dikerahkan",
                "Serba cepat, energik, tangkas, dan banyak akal",
                "Fleksibel dan sangat mudah beradaptasi di berbagai medan kerja",
                "Jarang terpaku pada rencana kaku; bertindak taktis sesuai keadaan",
                "Sangat jeli dengan memori tajam untuk fakta dan detail teknis",
                "Kemampuan prima melihat masalah seketika dan menemukan solusinya",
                "Tertarik dengan petualangan, kompetisi bisnis, dan risiko terukur"
            ],
            karirCatatan: "ESTP sangat berprestasi dalam penjualan tingkat tinggi, penanganan krisis lapangan, wirausaha kompetitif, pemeliharaan teknis darurat, dan kepolisian.",
            saranKarir: [
                "Tenaga Penjualan / Sales Executive", "Tenaga Pemasaran & Negosiasi Bisnis", "Polisi / Detektif Investigasi",
                "Paramedis / Tanggap Darurat", "Teknisi Jaringan & Komputer", "Technical Support Engineer", "Pengusaha / Wirausahawan", "Atlet Profesional"
            ],
            partnerAlami: {
                mitra: "ISFJ atau ISTJ",
                deskripsi: "Fungsi Extraverted Sensing (ES) sangat stabil bila didampingi oleh ketelitian dan keteraturan Introverted Sensing (IS)."
            },
            saranPengembangan: [
                "Belajarlah memahami perasaan dan pemikiran mendalam orang lain saat berkomunikasi.",
                "Belajarlah bersabar dan menikmati proses; tidak semua target dapat dicapai secara instan.",
                "Luangkan waktu untuk merenung dan merencanakan masa depan jangka panjang secara tertulis.",
                "Cobalah mencatat hasil pengamatan dan komitmen kerja secara rapi dan disiplin."
            ],
            kataKunci: ["Wirausahawan", "Manajemen Krisis", "Mahir Penjualan & Promosi", "Mudah Beradaptasi", "Pengambil Risiko"],
            tokohTerkenal: ["James Buchanan", "Madonna", "Chuck Yeager", "Donald Trump", "Lucille Ball"]
        },
        "INFJ": {
            nama: "The Counselor / The Protector",
            alias: "An Inspiration to Other",
            temperamen: "Idealist",
            populasi: "1–3% dari populasi dunia (Tipe Paling Langka)",
            karakter: "Visioner, idealis, berprinsip kokoh, berwawasan mendalam, dan berkomitmen melayani sesama.",
            gayaKerja: "Fokus pada dampak jangka panjang, transformasi nilai manusiawi, dan kepemimpinan teladan.",
            kekuatan: "Wawasan strategis intuitif, integritas moral, komunikasi empatik, dan dedikasi visi.",
            gambaranSingkat: "Pencari makna dan keterhubungannya dengan ide, relasi sosial, dan karya. Selalu ingin memahami pola pikir orang lain dan mencari tahu apa yang memotivasi seseorang. Berkomitmen kuat pada misi kemanusiaan yang jelas. Terorganisir dan tegas dalam melaksanakan visi mereka, memberikan pengaruh mendalam dari balik layar.",
            definisi: "INFJ (Introversion, Intuition, Feeling, Judging) adalah tipe kepribadian paling langka di dunia (1–3%), tergolong Temperamen Idealist (David Keirsey). Mencari arti hidup sejati, peduli pertumbuhan sesama, dan memiliki kekuatan terbesar dalam diplomasi, keteladanan moral, serta inspirasi filosofis.",
            dimensiMBTI: {
                I: "Tenang, pendiam, mendalam, memberikan pengaruh di balik layar, memulihkan energi dalam perenungan hening.",
                N: "Sangat intuitif, menangkap gambaran besar, makna tersembunyi, dan kemungkinan masa depan.",
                F: "Membuat keputusan berdasarkan pertimbangan kemanusiaan, empati mendalam, dan nilai etika luhur.",
                J: "Terorganisir, sistematis, merencanakan langkah dengan disiplin, dan berpegang teguh pada komitmen."
            },
            ciriUmum: [
                "Intuitif luar biasa dalam memahami orang dan dinamika situasi",
                "Idealis, visioner, dan menjunjung standar kualitas tinggi",
                "Berorientasi kuat pada masa depan dan kemajuan kemanusiaan",
                "Memegang teguh prinsip moral dan integritas nurani",
                "Kepribadian yang kompleks, mendalam, dan menginspirasi",
                "Pemimpin alami berbasis keteladanan dan integritas",
                "Sensitif dan penuh kasih sayang terhadap kesejahteraan orang lain",
                "Menjaga privasi diri namun hangat dalam hubungan autentik jangka panjang",
                "Fokus pada tujuan mulia dan enggan berkutat pada detail sepele tanpa arti",
                "Mampu bekerja logis dan rasional untuk mewujudkan visi idealisnya"
            ],
            karirCatatan: "INFJ membutuhkan karir yang bermakna dan selaras dengan prinsip batinnya, terutama di bidang pengembangan manusia, kesehatan mental, riset humaniora, dan penulisan visioner.",
            saranKarir: [
                "Penasihat / Konselor Karir & Psikologi", "Psikiater", "Psikolog Klinis", "Pemberdaya Keagamaan / Rohani",
                "Pengajar / Pendidik / Trainer Pengembangan Diri", "Penyusun Strategi Pemasaran Humanis", "Artis / Sastrawan",
                "Dokter Medis", "Praktisi Kesehatan Holistik", "Fotografer Seni", "Pemerhati Tumbuh Kembang Anak"
            ],
            partnerAlami: {
                mitra: "ENTP atau ENFP",
                deskripsi: "Fungsi Introverted Intuition (IN) berpadu harmonis dan dinamis dengan percikan kreativitas Extraverted Intuition (EN)."
            },
            saranPengembangan: [
                "Seimbangkan cara pandang; jangan terlalu banyak melihat risiko negatif, lihatlah peluang positifnya.",
                "Bersabarlah; jangan mudah marah atau kecewa ketika situasi dan orang lain belum memenuhi idealisme Anda.",
                "Lebih rilekslah; jangan terus-menerus memikul beban tanggung jawab, berikan waktu santai untuk fisik dan jiwa.",
                "Hindari perfeksionisme berlebihan dalam hubungan interpersonal."
            ],
            kataKunci: ["Visioner & Terorganisir", "Kreatif", "Pemimpin Teladan", "Pengembang Manusia", "Imajinatif", "Pencari Makna"],
            tokohTerkenal: ["Billy Crystal", "Plato", "Carl Gustav Jung", "Niels Bohr", "Mary Wollstonecraft", "Adolf Hitler", "George Harrison", "Chaucer", "Gillian Anderson", "Nathaniel Hawthorne", "Robert Burns", "Nicole Kidman", "Nelson Mandela", "Johann Wolfgang von Goethe", "Martin Luther King, Jr."]
        },
        "INFP": {
            nama: "The Healer / The Idealist",
            alias: "Performing Noble Service to Aid Society",
            temperamen: "Idealist",
            populasi: "4–5% dari populasi dunia",
            karakter: "Idealis, kreatif, berpegang teguh pada nilai nurani, reflektif, dan penuh empati.",
            gayaKerja: "Mendorong inovasi yang selaras dengan kemanusiaan dan bekerja mandiri dengan tulus.",
            kekuatan: "Kreativitas puitis, komitmen pada nilai organisasi, empati mendalam, dan fleksibilitas.",
            gambaranSingkat: "Idealis sejati, setia kepada prinsip yang diyakini serta orang-orang terkasih. Menginginkan kehidupan lahir batin yang selaras dengan nilai-nilai luhur. Penuh rasa ingin tahu, mudah melihat berbagai peluang positif, dan mampu menjadi pemantik gagasan segar. Berusaha memahami orang lain dan membantu mereka mencapai potensi optimal.",
            definisi: "INFP (Introversion, Intuition, Feeling, Perception) tergolong Temperamen Idealist (David Keirsey). Sosok mediator pembawa damai yang mencari jati diri dan harmoni moral. Unggul dalam komunikasi tertulis yang menggugah, empati konseling, dan pembelaan nilai-nilai kemanusiaan.",
            dimensiMBTI: {
                I: "Tenang, reflektif, menyukai suasana hening untuk merenung dan menggali kedalaman makna.",
                N: "Imajinatif, berorientasi masa depan, dan melihat berbagai kemungkinan konseptual.",
                F: "Dipandu oleh nilai nurani murni, empati tulus, dan keselarasan moral.",
                P: "Luwes, santai, terbuka pada alternatif baru, dan tidak menyukai paksaan birokrasi kaku."
            },
            ciriUmum: [
                "Sangat memegang teguh prinsip etika dan integritas nurani",
                "Hangat, tulus, dan peduli pada perkembangan orang lain",
                "Berorientasi pelayanan; menempatkan kebaikan sesama di atas kepentingan pribadi",
                "Loyal dan mengabdikan diri untuk nilai yang diperjuangkan",
                "Berorientasi pada masa depan dan pertumbuhan ke arah positif",
                "Kreatif, inspiratif, puitis, dan berwawasan orisinal",
                "Fleksibel dan santai dalam bekerja, selama prinsip dasar tidak dilanggar",
                "Sensitif, kompleks, dan enggan berkutat pada rincian administratif rutin",
                "Orisinal dan berani tampil berbeda dari arus utama (keluar dari zona mainstream)",
                "Kemampuan komunikasi tertulis yang luar biasa memikat",
                "Menghargai kedalaman dan keautentikan hubungan sejati"
            ],
            karirCatatan: "INFP berkembang sangat pesat dalam karya sastra, konseling psikologis, pendidikan humaniora, lembaga sosial/filantropi, dan industri kreatif.",
            saranKarir: [
                "Penulis / Sastrawan / Editor", "Penasihat / Konselor Psikologi", "Guru / Profesor Humaniora",
                "Psikolog", "Psikiater", "Pekerja Kemanusiaan / LSM / Filantropi", "Penerjemah / Copywriter Kreatif"
            ],
            partnerAlami: {
                mitra: "ENFJ atau ESFJ",
                deskripsi: "Fungsi Introverted Feeling (IF) berpasangan harmonis dengan kehangatan komunikasi dan dukungan Extraverted Feeling (EF)."
            },
            saranPengembangan: [
                "Belajarlah menghadapi evaluasi kritis secara objektif tanpa merasa diserang secara personal.",
                "Belajarlah bersikap tegas; bertindak baik harus selaras dengan bertindak benar.",
                "Jangan terlalu menyalahkan diri sendiri ketika menghadapi kegagalan; kegagalan adalah proses belajar yang wajar.",
                "Seimbangkan empati kepada orang lain dengan kepedulian terhadap kesejahteraan diri sendiri."
            ],
            kataKunci: ["Pencari Makna", "Kreatif", "Terampil", "Mudah Beradaptasi", "Membujuk Lemah Lembut"],
            tokohTerkenal: ["Aldous Huxley", "Audrey Hepburn", "Helen Keller", "Isabel Myers Briggs", "J. R. R. Tolkien", "Laura Ingalls Wilder", "Putri Diana (Princess Diana)", "Peter Jackson", "William Shakespeare"]
        },
        "INTJ": {
            nama: "The Mastermind / The Scientist",
            alias: "Everything Has Room for Improvement",
            temperamen: "Rational",
            populasi: "2–4% dari populasi dunia",
            karakter: "Inovatif, mandiri, strategis, analitis tajam, dan berorientasi efisiensi tingkat tinggi.",
            gayaKerja: "Merancang sistem jangka panjang, membedah masalah kompleks, dan mengejar keunggulan konseptual.",
            kekuatan: "Pemikiran strategis makro, pemodelan sistem, kemandirian tinggi, dan ketajaman logika.",
            gambaranSingkat: "Memiliki pemikiran orisinil dan motivasi membaja untuk mewujudkan ide-ide besar hingga mencapai sasaran. Cepat melihat pola tersembunyi dari berbagai fenomena dan mampu menyusun perspektif jangka panjang yang jernih. Begitu memutuskan tujuan, ia mengorganisir dan melaksanakannya secara metodis. Mandiri, analitis, kritis, dan berstandar kinerja sangat tinggi.",
            definisi: "INTJ (Introversion, Intuition, Thinking, Judging) tergolong Temperamen Rational (David Keirsey). Arsitek strategi dan master perencana sistem korporat yang unggul dalam penyelidikan logis, rekayasa teknologi, konseptualisasi ilmiah, dan efisiensi operasional.",
            dimensiMBTI: {
                I: "Mandiri, tenang, memusatkan energi dalam pemikiran analitis dan pengolahan data internal.",
                N: "Berorientasi pada gambaran besar (big picture), konsep abstrak, dan visi strategis masa depan.",
                T: "Mengambil keputusan secara objektif menggunakan logika rasional murni tanpa bias emosional.",
                J: "Sangat terstruktur, sistematis, merencanakan langkah di awal, dan mengontrol melalui kepastian."
            },
            ciriUmum: [
                "Mampu menyerap teori rumit dan materi multidimensi dengan sangat cepat",
                "Terdorong menciptakan keteraturan dan sistem terstruktur dari abstraksi teoritis",
                "Ahli dalam merancang strategi korporat jangka panjang",
                "Berorientasi kuat pada masa depan dan gambaran besar (big picture)",
                "Memiliki intuisi analitis tajam yang didukung logika rasional kokoh",
                "Menuntut standar kompetensi sangat tinggi untuk diri sendiri dan orang lain",
                "Menyukai tantangan teoritis yang sulit; cepat bosan dengan rutinitas biasa",
                "Sangat menghargai nilai ilmu pengetahuan dan efisiensi sistem",
                "Tidak sabar dengan ketidakefisienan, kelalaian, dan kebingungan kerja",
                "Mandiri, tenang, orisinil, inovatif, dan bekerja terbaik saat mandiri"
            ],
            karirCatatan: "INTJ memiliki kecocokan luar biasa pada riset dan pengembangan (R&D), rekayasa sistem teknologi, perencanaan korporat, sains murni, dan kepemimpinan strategis.",
            saranKarir: [
                "Ahli Keilmuan / Peneliti R&D", "Insinyur Sistem / Rekayasa Teknologi", "Profesor & Pengajar Akademik",
                "Dokter / Dokter Gigi Spesialis", "Ahli Strategi Perusahaan / Konsultan Manajemen", "Pimpinan Perusahaan / Direktur Eksekutif",
                "Pimpinan Perencanaan Militer", "Pengacara Korporat / Hakim", "Programmer atau Lead System Analyst"
            ],
            partnerAlami: {
                mitra: "ENFP atau ENTP",
                deskripsi: "Fungsi Introverted Intuition (IN) sangat terinspirasi oleh energi kreatif dan eksplorasi Extraverted Intuition (EN)."
            },
            saranPengembangan: [
                "Belajarlah mengungkapkan apresiasi dan emosi secara terbuka kepada rekan kerja.",
                "Hindari perdebatan atau sikap perfeksionis berlebihan yang dapat menghambat kerja sama tim.",
                "Cobalah lebih terbuka pada dunia luar; perluas wawasan melalui pergaulan dan membaca ragam topik baru.",
                "Kembangkan empati dan kepekaan sosial terhadap rekan kerja yang memiliki gaya berpikir berbeda."
            ],
            kataKunci: ["Strategis", "Analitis", "Problem Solver Konseptual", "Desainer Sistem", "Perencana Unggul"],
            tokohTerkenal: ["Thomas Jefferson", "John F. Kennedy", "C. S. Lewis", "Jane Austen", "Susan B. Anthony", "Arthur Ashe", "Emily Bronte"]
        },
        "INTP": {
            nama: "The Architect / The Thinker",
            alias: "A Love of Problem Solving",
            temperamen: "Rational",
            populasi: "3–5% dari populasi dunia",
            karakter: "Analitis mendalam, konseptual, objektif, tenang, cerdas, dan mencintai logika teori kompleks.",
            gayaKerja: "Mendiagnosis masalah mendasar, membedah prinsip logika, dan merancang solusi alternatif inovatif.",
            kekuatan: "Analisis logis mendalam, inovasi konseptual, pemecahan masalah rumit, dan rasa ingin tahu ilmiah.",
            gambaranSingkat: "Berusaha membangun penjelasan yang masuk akal untuk segala fenomena yang menarik minat mereka. Teoritis dan abstrak, lebih terpikat pada ide-ide dibanding basa-basi sosial. Tenang, cerdas, fleksibel, dan memiliki kemampuan konsentrasi luar biasa untuk mendalami pemecahan masalah pada bidang minatnya. Skeptis, kritis, dan selalu analitis.",
            definisi: "INTP (Introversion, Intuition, Thinking, Perception) tergolong Temperamen Rational (David Keirsey). Filsuf dan arsitek logika komputasional yang mendedikasikan analisis untuk menguji kebenaran prinsipil, hukum alam, struktur kode, dan sistem pengetahuan murni.",
            dimensiMBTI: {
                I: "Tenang, mandiri, mencurahkan konsentrasi mendalam di dunia pemikiran internal.",
                N: "Fokus pada konsep teoretis, pola logika tersembunyi, dan kemungkinan inovasi masa depan.",
                T: "Menilai berdasarkan kriteria objektif, logika deduktif, dan konsistensi nalar tanpa bias emosi.",
                P: "Fleksibel, adaptif, terbuka pada fakta baru, dan tidak menyukai batasan jadwal kaku."
            },
            ciriUmum: [
                "Mencintai teori, prinsip ilmu pengetahuan, dan ide-ide abstrak",
                "Pencari kebenaran murni yang mengurai struktur dan hukum dasar fenomena",
                "Menilai kecerdasan dan kompetensi intelektual di atas segalanya",
                "Menetapkan standar kinerja intelektual yang sangat tinggi untuk diri sendiri",
                "Independen, orisinil, dan pemikir mandiri (kadang tampak eksentrik)",
                "Bekerja sangat produktif saat sendiri dengan otonomi penuh",
                "Tidak menyukai detail biasa dan tugas-tugas administratif rutin",
                "Kreatif, berwawasan luas, dan brilian dalam merancang solusi konseptual",
                "Hidup utamanya di dalam pikiran mereka sendiri secara intens"
            ],
            karirCatatan: "INTP menunjukkan keunggulan mutlak pada penelitian sains (fisika/kimia/matematika), rekayasa perangkat lunak, perancangan arsitektur data, dan strategi teoritis.",
            saranKarir: [
                "Ahli Keilmuan (Fisika, Kimia, Matematika)", "Fotografer Ilmiah / Seni", "Perencana Strategi Korporat & R&D",
                "Ahli Ilmu Pasti & Statistika", "Profesor Universitas", "Programmer Komputer / Software Architect",
                "Penulis Teknis & Riset", "Insinyur Riset", "Pengacara / Hakim", "Penyidik Forensik Digital", "Ilmu Kehutanan / Konservasi Alam"
            ],
            partnerAlami: {
                mitra: "ENTJ atau ESTJ",
                deskripsi: "Fungsi Introverted Thinking (IT) berpadu efektif dengan dorongan implementasi eksekutif Extraverted Thinking (ET)."
            },
            saranPengembangan: [
                "Belajarlah membangun relasi hangat dengan rekan kerja; dengarkan secara aktif dan berempati.",
                "Relaks; jangan selalu overthinking atau menganalisis segalanya tanpa henti.",
                "Cobalah fokus memilih satu ide, susun rencana, dan wujudkan secara nyata sampai selesai.",
                "Kembangkan kemampuan mengomunikasikan teori rumit ke dalam bahasa praktis yang mudah dipahami rekan kerja non-teknis."
            ],
            kataKunci: ["Analitis Mendalam", "Problem Solver Sistemik", "Keahlian Teknis Murni", "Mudah Beradaptasi", "Desainer Konseptual"],
            tokohTerkenal: ["Albert Einstein", "Charles Darwin", "William James", "Dwight D. Eisenhower", "Carl Gustav Jung", "Socrates", "Sir Isaac Newton", "J.K. Rowling", "Abraham Lincoln"]
        }
    }
};

const MBTI_QUESTIONS = [
    {
        "no": 1,
        "pernyataanA": "Spontan, Fleksibel, tidak diikat waktu",
        "pernyataanB": "Terencana dan memiliki deadline jelas",
        "dimensi": "JP",
        "skorA": "P",
        "skorB": "J"
    },
    {
        "no": 2,
        "pernyataanA": "Lebih memilih berkomunikasi dengan menulis",
        "pernyataanB": "Lebih memilih berkomunikasi dengan bicara",
        "dimensi": "EI",
        "skorA": "I",
        "skorB": "E"
    },
    {
        "no": 3,
        "pernyataanA": "Tidak menyukai hal-hal yang bersifat mendadak dan di luar perencanaan",
        "pernyataanB": "Perubahan mendadak tidak jadi masalah",
        "dimensi": "JP",
        "skorA": "J",
        "skorB": "P"
    },
    {
        "no": 4,
        "pernyataanA": "Obyektif",
        "pernyataanB": "Subyektif",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 5,
        "pernyataanA": "Menemukan dan mengembangkan ide dengan mendiskusikannya",
        "pernyataanB": "Menemukan dan mengembangkan ide dengan merenungkan",
        "dimensi": "EI",
        "skorA": "E",
        "skorB": "I"
    },
    {
        "no": 6,
        "pernyataanA": "Bergerak dari gambaran umum baru ke detail",
        "pernyataanB": "Bergerak dari detail ke gambaran umum sebagai kesimpulan akhir",
        "dimensi": "SN",
        "skorA": "N",
        "skorB": "S"
    },
    {
        "no": 7,
        "pernyataanA": "Berorientasi pada dunia eksternal (kegiatan, orang)",
        "pernyataanB": "Berorientasi pada dunia internal (memori, pemikiran, ide)",
        "dimensi": "EI",
        "skorA": "E",
        "skorB": "I"
    },
    {
        "no": 8,
        "pernyataanA": "Berbicara mengenai masalah yang dihadapi hari ini dan langkah-langkah praktis mengatasinya",
        "pernyataanB": "Berbicara mengenai visi masa depan dan konsep-konsep mengenai visi tersebut",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 9,
        "pernyataanA": "Diyakinkan dengan penjelasan yang menyentuh perasaan",
        "pernyataanB": "Diyakinkan dengan penjelasan yang masuk akal",
        "dimensi": "TF",
        "skorA": "F",
        "skorB": "T"
    },
    {
        "no": 10,
        "pernyataanA": "Fokus pada sedikit hobi namun mendalam",
        "pernyataanB": "Fokus pada banyak hobi secara luas dan umum",
        "dimensi": "EI",
        "skorA": "I",
        "skorB": "E"
    },
    {
        "no": 11,
        "pernyataanA": "Tertutup dan mandiri",
        "pernyataanB": "Sosial dan ekspresif",
        "dimensi": "EI",
        "skorA": "I",
        "skorB": "E"
    },
    {
        "no": 12,
        "pernyataanA": "Aturan, jadwal dan target sangat mengikat dan membebani",
        "pernyataanB": "Aturan, jadwal dan target akan sangat membantu dan memperjelas tindakan",
        "dimensi": "JP",
        "skorA": "P",
        "skorB": "J"
    },
    {
        "no": 13,
        "pernyataanA": "Menggunakan pengalaman sebagai pedoman",
        "pernyataanB": "Menggunakan imajinasi dan perenungan sebagai pedoman",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 14,
        "pernyataanA": "Berorientasi tugas dan job description",
        "pernyataanB": "Berorientasi pada manusia dan hubungan",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 15,
        "pernyataanA": "Pertemuan dengan orang lain dan aktivitas sosial melelahkan",
        "pernyataanB": "Bertemu orang dan aktivitas sosial membuat bersemangat",
        "dimensi": "EI",
        "skorA": "I",
        "skorB": "E"
    },
    {
        "no": 16,
        "pernyataanA": "SOP sangat membantu",
        "pernyataanB": "SOP sangat membosankan",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 17,
        "pernyataanA": "Mengambil keputusan berdasar logika dan aturan main",
        "pernyataanB": "Mengambil keputusan berdasar perasaan pribadi dan kondisi orang lain",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 18,
        "pernyataanA": "Bebas dan dinamis",
        "pernyataanB": "Prosedural dan tradisional",
        "dimensi": "SN",
        "skorA": "N",
        "skorB": "S"
    },
    {
        "no": 19,
        "pernyataanA": "Berorientasi pada hasil",
        "pernyataanB": "Berorientasi pada proses",
        "dimensi": "JP",
        "skorA": "J",
        "skorB": "P"
    },
    {
        "no": 20,
        "pernyataanA": "Beraktifitas sendirian di rumah menyenangkan",
        "pernyataanB": "Beraktifitas sendirian di rumah membosankan",
        "dimensi": "EI",
        "skorA": "I",
        "skorB": "E"
    },
    {
        "no": 21,
        "pernyataanA": "Membiarkan orang lain bertindak bebas asalkan tujuan tercapai",
        "pernyataanB": "Mengatur orang lain dengan tata tertib agar tujuan tercapai",
        "dimensi": "JP",
        "skorA": "P",
        "skorB": "J"
    },
    {
        "no": 22,
        "pernyataanA": "Memilih ide inspiratif lebih penting daripada fakta",
        "pernyataanB": "Memilih fakta lebih penting daripada ide inspiratif",
        "dimensi": "SN",
        "skorA": "N",
        "skorB": "S"
    },
    {
        "no": 23,
        "pernyataanA": "Mengemukakan tujuan dan sasaran lebih dahulu",
        "pernyataanB": "Mengemukakan kesepakatan terlebih dahulu",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 24,
        "pernyataanA": "Fokus pada target dan mengabaikan hal-hal baru",
        "pernyataanB": "Memperhatikan hal-hal baru dan siap menyesuaikan diri serta mengubah target",
        "dimensi": "JP",
        "skorA": "J",
        "skorB": "P"
    },
    {
        "no": 25,
        "pernyataanA": "Kontinuitas dan stabilitas lebih diutamakan",
        "pernyataanB": "Perubahan dan variasi lebih diutamakan",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 26,
        "pernyataanA": "Pendirian masih bisa berubah tergantung situasi nantinya",
        "pernyataanB": "Berpegang teguh pada pendirian",
        "dimensi": "JP",
        "skorA": "P",
        "skorB": "J"
    },
    {
        "no": 27,
        "pernyataanA": "Bertindak step by step dengan timeframe yang jelas",
        "pernyataanB": "Bertindak dengan semangat tanpa menggunakan timeframe",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 28,
        "pernyataanA": "Berinisiatif tinggi hampir dalam berbagai hal meskipun tidak berhubungan dengan dirinya",
        "pernyataanB": "Berinisiatif bila situasi memaksa atau berhubungan dengan kepentingan sendiri",
        "dimensi": "EI",
        "skorA": "E",
        "skorB": "I"
    },
    {
        "no": 29,
        "pernyataanA": "Lebih memilih tempat yang tenang dan pribadi untuk berkonsentrasi",
        "pernyataanB": "Lebih memilih tempat yang ramai dan banyak interaksi / aktifitas",
        "dimensi": "EI",
        "skorA": "I",
        "skorB": "E"
    },
    {
        "no": 30,
        "pernyataanA": "Menganalisa",
        "pernyataanB": "Berempati",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 31,
        "pernyataanA": "Berpikir secara matang sebelum bertindak",
        "pernyataanB": "Berani bertindak tanpa terlalu lama berfikir",
        "dimensi": "EI",
        "skorA": "I",
        "skorB": "E"
    },
    {
        "no": 32,
        "pernyataanA": "Menghargai seseorang karena sifat dan perilakunya",
        "pernyataanB": "Menghargai seseorang karena skill dan faktor teknis",
        "dimensi": "TF",
        "skorA": "F",
        "skorB": "T"
    },
    {
        "no": 33,
        "pernyataanA": "Merasa nyaman bila situasi tetap terbuka terhadap pilihan-pilihan lain",
        "pernyataanB": "Merasa tenang bila semua sudah diputuskan",
        "dimensi": "JP",
        "skorA": "P",
        "skorB": "J"
    },
    {
        "no": 34,
        "pernyataanA": "Menarik kesimpulan dengan lama dan hati-hati",
        "pernyataanB": "menarik kesimpulan dengan cepat sesuai naluri",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 35,
        "pernyataanA": "Mengekspresikan semangat",
        "pernyataanB": "Menyimpan semangat dalam hati",
        "dimensi": "EI",
        "skorA": "E",
        "skorB": "I"
    },
    {
        "no": 36,
        "pernyataanA": "Mengklarifikasi ide dan teori sebelum dipraktekkan",
        "pernyataanB": "Memahami ide dan teori saat mempraktekkannya langsung",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 37,
        "pernyataanA": "Melibatkan perasaan itu tidak profesional",
        "pernyataanB": "Terlalu kaku pada peraturan dan pekerjaan itu kejam",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 38,
        "pernyataanA": "Mencari kesempatan untuk berkomunikasi secara perorangan",
        "pernyataanB": "Memilih berkomunikasi pada sekelompok orang",
        "dimensi": "EI",
        "skorA": "I",
        "skorB": "E"
    },
    {
        "no": 39,
        "pernyataanA": "Yang penting situasi harmonis terjaga",
        "pernyataanB": "Yang penting tujuan tercapai",
        "dimensi": "TF",
        "skorA": "F",
        "skorB": "T"
    },
    {
        "no": 40,
        "pernyataanA": "Ketidakpastian itu seru, menegangkan dan membuat hati lebih senang",
        "pernyataanB": "Ketidakpastian membuat bingung dan meresahkan",
        "dimensi": "JP",
        "skorA": "P",
        "skorB": "J"
    },
    {
        "no": 41,
        "pernyataanA": "Berfokus pada masa kini (apa yang bisa diperbaiki sekarang)",
        "pernyataanB": "Berfokus pada masa depan (apa yang mungkin dicapai di masa depan)",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 42,
        "pernyataanA": "Mempertanyakan",
        "pernyataanB": "Mengakomodasi",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 43,
        "pernyataanA": "Secara konsisten mengamati dan mengingat detail",
        "pernyataanB": "Mengamati dan mengingat detail hanya bila berhubungan dengan pola",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 44,
        "pernyataanA": "Situasi last minute membuat bersemangat dan memunculkan potensi",
        "pernyataanB": "Situasi last minute sangat menyiksa, membuat stress dan merupakan kesalahan",
        "dimensi": "JP",
        "skorA": "P",
        "skorB": "J"
    },
    {
        "no": 45,
        "pernyataanA": "Lebih suka komunikasi tidak langsung (telp, surat, e-mail)",
        "pernyataanB": "Lebih suka komunikasi langsung (tatap muka)",
        "dimensi": "EI",
        "skorA": "I",
        "skorB": "E"
    },
    {
        "no": 46,
        "pernyataanA": "Praktis",
        "pernyataanB": "Konseptual",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 47,
        "pernyataanA": "Perubahan adalah musuh",
        "pernyataanB": "Perubahan adalah semangat hidup",
        "dimensi": "JP",
        "skorA": "J",
        "skorB": "P"
    },
    {
        "no": 48,
        "pernyataanA": "Sering dianggap keras kepala",
        "pernyataanB": "Sering dianggap terlalu memihak",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 49,
        "pernyataanA": "Bersemangat saat menolong orang keluar dari kesalahan dan meluruskan",
        "pernyataanB": "Bersemangat saat mengkritik dan menemukan kesalahan",
        "dimensi": "TF",
        "skorA": "F",
        "skorB": "T"
    },
    {
        "no": 50,
        "pernyataanA": "Bertindak sesuai situasi dan kondisi yang terjadi saat itu",
        "pernyataanB": "Bertindak sesuai apa yang sudah direncanakan",
        "dimensi": "JP",
        "skorA": "P",
        "skorB": "J"
    },
    {
        "no": 51,
        "pernyataanA": "Menggunakan keterampilan yang sudah dikuasai",
        "pernyataanB": "Menyukai tantangan untuk menguasai keterampilan baru",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 52,
        "pernyataanA": "Membangun ide pada saat berbicara",
        "pernyataanB": "Membangun ide dengan matang baru membicarakannya",
        "dimensi": "EI",
        "skorA": "E",
        "skorB": "I"
    },
    {
        "no": 53,
        "pernyataanA": "Memilih cara yang sudah ada dan sudah terbukti",
        "pernyataanB": "Memilih cara yang unik dan belum dipraktekkan orang lain",
        "dimensi": "SN",
        "skorA": "S",
        "skorB": "N"
    },
    {
        "no": 54,
        "pernyataanA": "Hidup harus sudah diatur dari awal",
        "pernyataanB": "Hidup seharusnya mengalir sesuai kondisi",
        "dimensi": "JP",
        "skorA": "J",
        "skorB": "P"
    },
    {
        "no": 55,
        "pernyataanA": "Standar harus ditegakkan di atas segalanya (itu menunjukkan kehormatan dan harga diri)",
        "pernyataanB": "Perasaan manusia lebih penting dari sekadar standar (yang adalah benda mati)",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 56,
        "pernyataanA": "Daftar dan checklist adalah panduan penting",
        "pernyataanB": "Daftar dan checklist adalah tugas dan beban",
        "dimensi": "JP",
        "skorA": "J",
        "skorB": "P"
    },
    {
        "no": 57,
        "pernyataanA": "Menuntut perlakuan yang adil dan sama pada semua orang",
        "pernyataanB": "Menuntut perlakuan khusus sesuai karakteristik masing-masing orang",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 58,
        "pernyataanA": "Mementingkan sebab-akibat",
        "pernyataanB": "Mementingkan nilai-nilai personal",
        "dimensi": "TF",
        "skorA": "T",
        "skorB": "F"
    },
    {
        "no": 59,
        "pernyataanA": "Puas ketika mampu beradaptasi dengan momentum yang terjadi",
        "pernyataanB": "Puas ketika mampu menjalankan semuanya sesuai rencana",
        "dimensi": "JP",
        "skorA": "P",
        "skorB": "J"
    },
    {
        "no": 60,
        "pernyataanA": "Spontan, Easy Going, fleksibel",
        "pernyataanB": "Berhati-hati, penuh pertimbangan, kaku",
        "dimensi": "EI",
        "skorA": "E",
        "skorB": "I"
    }
];

if (typeof window !== 'undefined') {
    window.MBTI_CONFIG = MBTI_CONFIG;
    window.MBTI_QUESTIONS = MBTI_QUESTIONS;
}
