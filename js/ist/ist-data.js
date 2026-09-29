// =========================================================================
// DATA RESMI MODUL IST (INTELLIGENCE STRUCTURE TEST) - SOAL 01
// PT ALTRAK 1978 - REKRUTMEN & ASESMEN
// =========================================================================

const istSoal01 = {
    id: "soal_01",
    nama: "Soal 01",
    waktuContoh: 30000, 
    waktuUjian: 360000, 
    petunjuk: "Soal-soal 01 - 20 terdiri atas kalimat-kalimat. Pada setiap kalimat satu kata hilang dan disediakan 5 (lima) kata pilihan sebagai penggantinya. Pilihlah kata yang tepat yang dapat menyempurnakan kalimat itu!",
    contoh: [
        { 
            no: "01", 
            pertanyaan: "Seekor kuda mempunyai kesamaan terbanyak dengan seekor ..............", 
            pilihan: ["A. Kucing", "B. Bajing", "C. Keledai", "D. Lembu", "E. Anjing"],
            jawabanBenar: "C",
            penjelasan: "Cara mengerjakan: Jawaban yang benar ialah C (keledai). Oleh karena itu, Anda harus memilih huruf C."
        },
        { 
            no: "02", 
            pertanyaan: "Lawan 'harapan' adalah ...............", 
            pilihan: ["A. Duka", "B. Putus Asa", "C. Sengsara", "D. Cinta", "E. Benci"],
            jawabanBenar: "B",
            penjelasan: "Cara mengerjakan: Jawabannya ialah B (putus asa). Maka huruf B yang seharusnya dipilih."
        }
    ],
    soal: [
        { no: 1, pertanyaan: "Pengaruh seseorang terhadap orang lain seharusnya bergantung pada ...............", pilihan: ["A. Kekuasaan", "B. Bujukan", "C. Kekayaan", "D. Keberanian", "E. Kewibawaan"] },
        { no: 2, pertanyaan: "Lawan 'hemat' ialah ...............", pilihan: ["A. Murah", "B. Kikir", "C. Boros", "D. Bernilai", "E. Kaya"] },
        { no: 3, pertanyaan: "............... tidak termasuk cuaca", pilihan: ["A. Angin puyuh", "B. Halilintar", "C. Salju", "D. Gempa bumi", "E. Kabut"] },
        { no: 4, pertanyaan: "Lawannya 'setia' ialah ...............", pilihan: ["A. Cinta", "B. Benci", "C. Persahabatan", "D. Khianat", "E. Permusuhan"] },
        { no: 5, pertanyaan: "Seekor kuda selalu mempunyai ...............", pilihan: ["A. Kandang", "B. Ladam", "C. Pelana", "D. Kuku", "E. Surai"] },
        { no: 6, pertanyaan: "Seorang paman ............... lebih tua dari kemenakannya.", pilihan: ["A. Jarang", "B. Biasanya", "C. Selalu", "D. Tidak pernah", "E. Kadang-kadang"] },
        { no: 7, pertanyaan: "Pada jumlah yang sama, nilai kalori yang tertinggi terdapat pada ...............", pilihan: ["A. Ikan", "B. Daging", "C. Lemak", "D. Tahu", "E. Sayuran"] },
        { no: 8, pertanyaan: "Pada suatu pertandingan selalu terdapat ...............", pilihan: ["A. Lawan", "B. Wasit", "C. Penonton", "D. Sorak", "E. Kemenangan"] },
        { no: 9, pertanyaan: "Suatu pernyataan yang belum dipastikan dikatakan sebagai pernyataan yang ...............", pilihan: ["A. Paradoks", "B. Tergesa-gesa", "C. Mempunyai arti rangkap", "D. Menyesatkan", "E. Hipotesis"] },
        { no: 10, pertanyaan: "Pada sepatu selalu terdapat ...............", pilihan: ["A. Kulit", "B. Sol", "C. Tali sepatu", "D. Gesper", "E. Lidah"] },
        { no: 11, pertanyaan: "Suatu ............... tidak menyangkut persoalan pencegahan kecelakaan.", pilihan: ["A. Lampu lalu lintas", "B. Kacamata pelindung", "C. Kotak PPPK", "D. Tanda peringatan", "E. Palang kereta api"] },
        { no: 12, pertanyaan: "Lembar kertas uang Rp. 50.000,- mempunyai panjang ............... cm.", pilihan: ["A. 20", "B. 29", "C. 17", "D. 15", "E. 24"] },
        { no: 13, pertanyaan: "Seseorang yang bersikap menyangsikan setiap kemajuan ialah seorang yang ...............", pilihan: ["A. Demokratis", "B. Radikal", "C. Liberal", "D. Konservatif", "E. Anarkis"] },
        { no: 14, pertanyaan: "Lawannya 'tidak pernah' ialah ...............", pilihan: ["A. Sering", "B. Kadang-kadang", "C. Jarang", "D. Kerap kali", "E. Selalu"] },
        { no: 15, pertanyaan: "Jarak antara Jakarta - Surabaya kira-kira ............... km.", pilihan: ["A. 650", "B. 1000", "C. 800", "D. 600", "E. 950"] },
        { no: 16, pertanyaan: "Untuk dapat membuat nada yang rendah dan mendalam, kita memerlukan banyak ...............", pilihan: ["A. Kekuatan", "B. Peranan", "C. Ayunan", "D. Berat", "E. Suara"] },
        { no: 17, pertanyaan: "Ayah ............... lebih berpengalaman dari pada anaknya.", pilihan: ["A. Selalu", "B. Biasanya", "C. Jauh", "D. Jarang", "E. Pada dasarnya"] },
        { no: 18, pertanyaan: "Di antara kota-kota berikut ini, maka kota ............... letaknya paling selatan.", pilihan: ["A. Jakarta", "B. Bandung", "C. Cirebon", "D. Semarang", "E. Surabaya"] },
        { no: 19, pertanyaan: "Jika kita mengetahui jumlah presentase nomor-nomor lotere yang tidak menang, maka kita dapat menghitung ...............", pilihan: ["A. Jumlah nomor yang menang", "B. Pajak lotere", "C. Kemungkinan menang", "D. Tinggi keuntungan", "E. Jumlah pengikut"] },
        { no: 20, pertanyaan: "Seorang anak yang berumur 10 tahun tingginya rata-rata ............... cm.", pilihan: ["A. 150", "B. 130", "C. 110", "D. 105", "E. 115"] }
    ]
};

// ==========================================
// DATA SOAL 02
// ==========================================
const istSoal02 = {
    id: "soal_02",
    nama: "Soal 02",
    waktuContoh: 30000,
    waktuUjian: 360000, 
    petunjuk: "Ditentukan 5 kata. Pada 4 dari 5 kata itu terdapat suatu kesamaan. Carilah kata yang kelima yang tidak memiliki kesamaan dengan keempat kata itu.",
    contoh: [
        { 
            no: "01", 
            pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", 
            pilihan: ["A. Meja", "B. Kursi", "C. Burung", "D. Lemari", "E. Tempat tidur"], 
            jawabanBenar: "C",
            penjelasan: "Cara mengerjakan: A, B, D, dan E ialah perabot rumah (meubel). C (burung) bukan perabot rumah atau tidak memiliki kesamaan dengan keempat kata itu. Oleh karena itu, jawaban yang benar adalah C."
        },
        { 
            no: "02", 
            pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", 
            pilihan: ["A. Duduk", "B. Berbaring", "C. Berdiri", "D. Berjalan", "E. Berjongkok"], 
            jawabanBenar: "D",
            penjelasan: "Cara mengerjakan: Pada A, B, C, dan E orang berada dalam keadaan tidak bergerak, sedangkan D (berjalan) orang dalam keadaan bergerak. Maka jawaban yang benar ialah D."
        }
    ],
    soal: [
        { no: 1, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Lingkungan", "B. Panah", "C. Elips", "D. Busur", "E. Lengkungan"], jawabanBenar: "B" },
        { no: 2, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Mengetuk", "B. Memaki", "C. Menjahit", "D. Menggergaji", "E. Memukul"], jawabanBenar: "B" },
        { no: 3, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Lebar", "B. Keliling", "C. Luas", "D. Isi", "E. Panjang"], jawabanBenar: "B" },
        { no: 4, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Mengikat", "B. Menyatukan", "C. Melepaskan", "D. Mengaitkan", "E. Melekatkan"], jawabanBenar: "C" },
        { no: 5, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Arah", "B. Timur", "C. Perjalanan", "D. Tujuan", "E. Selatan"], jawabanBenar: "C" },
        { no: 6, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Jarak", "B. Perpisahan", "C. Tugas", "D. Batas", "E. Perceraian"], jawabanBenar: "C" },
        { no: 7, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Saringan", "B. Kelambu", "C. Payung", "D. Tapisan", "E. Jala"], jawabanBenar: "C" },
        { no: 8, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Putih", "B. Pucat", "C. Buram", "D. Kasar", "E. Berkilauan"], jawabanBenar: "D" },
        { no: 9, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Otobis", "B. Pesawat terbang", "C. Sepeda motor", "D. Sepeda", "E. Kapal api"], jawabanBenar: "D" },
        { no: 10, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Biola", "B. Seruling", "C. Klarinet", "D. Terompet", "E. Saxophon"], jawabanBenar: "A" },
        { no: 11, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Bergelombang", "B. Kasar", "C. Berduri", "D. Licin", "E. Lurus"], jawabanBenar: "B" },
        { no: 12, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Jam", "B. Kompas", "C. Penunjuk jalan", "D. Bintang pari", "E. Arah"], jawabanBenar: "D" },
        { no: 13, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Kebijaksanaan", "B. Pendidikan", "C. Perencanaan", "D. Penempatan", "E. Pengerahan"], jawabanBenar: "B" },
        { no: 14, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Bermotor", "B. Berjalan", "C. Berlayar", "D. Bersepeda", "E. Berkuda"], jawabanBenar: "A" },
        { no: 15, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Gambar", "B. Lukisan", "C. Potret", "D. Patung", "E. Ukiran"], jawabanBenar: "D" },
        { no: 16, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Panjang", "B. Lonjong", "C. Runcing", "D. Bulat", "E. Bersudut"], jawabanBenar: "E" },
        { no: 17, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Kunci", "B. Palang pintu", "C. Gerendel", "D. Gunting", "E. Obeng"], jawabanBenar: "D" },
        { no: 18, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Jembatan", "B. Batas", "C. Perkawinan", "D. Pagar", "E. Masyarakat"], jawabanBenar: "E" },
        { no: 19, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Mengetam", "B. Menasehati", "C. Mengasah", "D. Melicinkan", "E. Menggosok"], jawabanBenar: "B" },
        { no: 20, pertanyaan: "Carilah kata yang tidak memiliki kesamaan:", pilihan: ["A. Batu", "B. Baja", "C. Bulu", "D. Karet", "E. Kayu"], jawabanBenar: "C" }
    ]
};

// ==========================================
// DATA SOAL 03
// ==========================================
const istSoal03 = {
    id: "soal_03",
    nama: "Soal 03",
    waktuContoh: 30000,
    waktuUjian: 420000, 
    petunjuk: "Ditentukan 3 (tiga) kata. Antara kata pertama dan kata kedua terdapat suatu hubungan tertentu. Antara kata ketiga dan salah satu diantara lima kata pilihan harus pula terdapat hubungan yang sama itu. Carilah kata itu.",
    contoh: [
        { 
            no: "01", 
            pertanyaan: "Hutan : pohon = tembok : ?", 
            pilihan: ["A. Batu bata", "B. Rumah", "C. Semen", "D. Putih", "E. Dinding"], 
            jawabanBenar: "A",
            penjelasan: "Cara mengerjakan: Hubungan antara hutan dan pohon ialah bahwa hutan terdiri atas pohon-pohon. Maka hubungan antara tembok dan salah satu kata pilihan adalah bahwa tembok terdiri atas batu bata. Oleh karena itu, jawaban yang benar adalah A."
        },
        { 
            no: "02", 
            pertanyaan: "Gelap : terang = basah : ?", 
            pilihan: ["A. Hujan", "B. Hari", "C. Lembab", "D. Angin", "E. Kering"], 
            jawabanBenar: "E",
            penjelasan: "Cara mengerjakan: Gelap ialah lawannya dari terang, maka untuk basah lawannya ialah kering. Maka jawaban yang benar ialah E."
        }
    ],
    soal: [
        { no: 1, pertanyaan: "Menemukan : menghilangkan = Mengingat : ?", pilihan: ["A. Menghapal", "B. Mengenai", "C. Melupakan", "D. Berpikir", "E. Memimpikan"], jawabanBenar: "C" },
        { no: 2, pertanyaan: "Bunga : jambangan = Burung : ?", pilihan: ["A. Sarang", "B. Langit", "C. Pagar", "D. Pohon", "E. Sangkar"], jawabanBenar: "E" },
        { no: 3, pertanyaan: "Kereta api : rel = Otobis : ?", pilihan: ["A. Roda", "B. Poros", "C. Ban", "D. Jalan raya", "E. Kecepatan"], jawabanBenar: "D" },
        { no: 4, pertanyaan: "Perak : emas = Cincin : ?", pilihan: ["A. Arloji", "B. Berlian", "C. Permata", "D. Gelang", "E. Platina"], jawabanBenar: "D" },
        { no: 5, pertanyaan: "Lingkaran : bola = Bujur sangkar : ?", pilihan: ["A. Bentuk", "B. Gambar", "C. Segi empat", "D. Kubus", "E. Piramida"], jawabanBenar: "D" },
        { no: 6, pertanyaan: "Saran : kepustakaan = Merundingkan : ?", pilihan: ["A. Menawarkan", "B. Menentukan", "C. Menilai", "D. Menimbang", "E. Merenungkan"], jawabanBenar: "D" },
        { no: 7, pertanyaan: "Lidah : asam = Hidung : ?", pilihan: ["A. Mencium", "B. Bernapas", "C. Mengecap", "D. Tengik", "E. Asin"], jawabanBenar: "D" },
        { no: 8, pertanyaan: "Darah : pembuluh = Air : ?", pilihan: ["A. Pintu air", "B. Sungai", "C. Talang", "D. Hujan", "E. Ember"], jawabanBenar: "C" },
        { no: 9, pertanyaan: "Saraf : penyalur = Pupil : ?", pilihan: ["A. Penyinaran", "B. Mata", "C. Melihat", "D. Cahaya", "E. Pelindung"], jawabanBenar: "E" },
        { no: 10, pertanyaan: "Pengantar surat : pengantar telegram = Pandai besi : ?", pilihan: ["A. Palu godam", "B. Pedagang", "C. Api", "D. Tukang emas", "E. Besi tempa"], jawabanBenar: "D" },
        { no: 11, pertanyaan: "Buta : warna = Tuli : ?", pilihan: ["A. Pendengaran", "B. Mendengar", "C. Nada", "D. Kata", "E. Telinga"], jawabanBenar: "C" },
        { no: 12, pertanyaan: "Makanan : bumbu = Ceramah : ?", pilihan: ["A. Penghinaan", "B. Pidato", "C. Kelakar", "D. Kesan", "E. Ayat"], jawabanBenar: "C" },
        { no: 13, pertanyaan: "Marah : emosi = Duka cita : ?", pilihan: ["A. Suka cita", "B. Sakit hati", "C. Suasana hati", "D. Sedih", "E. Rindu"], jawabanBenar: "C" },
        { no: 14, pertanyaan: "Mantel : jubah = Wool : ?", pilihan: ["A. Bahan sandang", "B. Domba", "C. Sutra", "D. Jas", "E. Tekstil"], jawabanBenar: "E" },
        { no: 15, pertanyaan: "Ketinggian puncak : tekanan udara = Ketinggian nada : ?", pilihan: ["A. Garpu tala", "B. Sopran", "C. Nyanyian", "D. Panjang senar", "E. Suara"], jawabanBenar: "D" },
        { no: 16, pertanyaan: "Negara : revolusi = Hidup : ?", pilihan: ["A. Biologi", "B. Keturunan", "C. Mutasi", "D. Seleksi", "E. Ilmu hewan"], jawabanBenar: "C" },
        { no: 17, pertanyaan: "Kekurangan : penemuan = Panas : ?", pilihan: ["A. Haus", "B. Khatulistiwa", "C. Es", "D. Matahari", "E. Dingin"], jawabanBenar: "B" },
        { no: 18, pertanyaan: "Kayu : diketam = Besi : ?", pilihan: ["A. Dipalu", "B. Digergaji", "C. Dituang", "D. Dikikir", "E. Ditempa"], jawabanBenar: "D" },
        { no: 19, pertanyaan: "Olahragawan : lembing = Cendekiawan : ?", pilihan: ["A. Perpustakaan", "B. Penelitian", "C. Karya", "D. Studi", "E. Mikroskop"], jawabanBenar: "A" },
        { no: 20, pertanyaan: "Keledai : kuda pacuan = Pembakaran : ?", pilihan: ["A. Pemadam api", "B. Obor", "C. Letupan", "D. Korek api", "E. Lautan api"], jawabanBenar: "C" }
    ]
};

// ==========================================
// DATA SOAL 04
// ==========================================
const istSoal04 = {
    id: "soal_04",
    nama: "Soal 04",
    waktuContoh: 30000,
    waktuUjian: 480000, // 8 Menit
    petunjuk: "Ditentukan dua kata. Carilah satu perkataan yang meliputi pengertian kedua kata tadi. Ketiklah perkataan itu pada kolom yang disediakan.",
    contoh: [
        { 
            no: "01", 
            pertanyaan: "Ayam - itik", 
            tipe: "isian",
            jawabanBenar: "burung",
            penjelasan: "Cara mengerjakan: Perkataan 'burung' dapat meliputi pengertian kedua kata itu. Maka ketik 'burung' sebagai jawaban."
        },
        { 
            no: "02", 
            pertanyaan: "Gaun - celana", 
            tipe: "isian",
            jawabanBenar: "pakaian",
            penjelasan: "Cara mengerjakan: Perkataan yang tepat meliputi pengertian gaun dan celana adalah 'pakaian'."
        }
    ],
    soal: [
        { no: 1, pertanyaan: "mawar - melati", tipe: "isian", jawabanBenar: "bunga" },
        { no: 2, pertanyaan: "mata - telinga", tipe: "isian", jawabanBenar: "indera" },
        { no: 3, pertanyaan: "gula - intan", tipe: "isian", jawabanBenar: "kristal" },
        { no: 4, pertanyaan: "hujan - salju", tipe: "isian", jawabanBenar: "cuaca" },
        { no: 5, pertanyaan: "pengantar surat - telepon", tipe: "isian", jawabanBenar: "komunikasi" },
        { no: 6, pertanyaan: "kamera - kacamata", tipe: "isian", jawabanBenar: "lensa" },
        { no: 7, pertanyaan: "lambung - usus", tipe: "isian", jawabanBenar: "pencernaan" },
        { no: 8, pertanyaan: "banyak - sedikit", tipe: "isian", jawabanBenar: "jumlah" },
        { no: 9, pertanyaan: "telur - benih", tipe: "isian", jawabanBenar: "bibit" },
        { no: 10, pertanyaan: "bendera - lencana", tipe: "isian", jawabanBenar: "simbol" },
        { no: 11, pertanyaan: "rumput - gajah", tipe: "isian", jawabanBenar: "makhluk hidup" },
        { no: 12, pertanyaan: "ember - kantong", tipe: "isian", jawabanBenar: "wadah" },
        { no: 13, pertanyaan: "awal - akhir", tipe: "isian", jawabanBenar: "batas" },
        { no: 14, pertanyaan: "kikir - boros", tipe: "isian", jawabanBenar: "sifat" },
        { no: 15, pertanyaan: "penawaran - permintaan", tipe: "isian", jawabanBenar: "ekonomi" },
        { no: 16, pertanyaan: "atas - bawah", tipe: "isian", jawabanBenar: "arah" }
    ]
};

// ==========================================
// DATA SOAL 05
// ==========================================
const istSoal05 = {
    id: "soal_05",
    nama: "Soal 05",
    waktuContoh: 30000,
    waktuUjian: 600000, // 10 Menit
    petunjuk: "Persoalan berikutnya ialah soal-soal hitungan. Ketiklah angka jawaban pada kolom yang disediakan.",
    contoh: [
        { 
            no: "01", 
            pertanyaan: "Sebatang pensil harganya 25 rupiah. Berapakah harga 3 batang?", 
            tipe: "isian",
            jawabanBenar: "75",
            penjelasan: "Cara mengerjakan: 25 x 3 = 75. Ketik angka 75."
        },
        { 
            no: "02", 
            pertanyaan: "Dengan sepeda Husin dapat mencapai 15 km dalam waktu 1 jam. Berapa km-kah yang dapat ia capai dalam waktu 4 jam?", 
            tipe: "isian",
            jawabanBenar: "60",
            penjelasan: "Cara mengerjakan: 15 x 4 = 60. Ketik angka 60."
        }
    ],
    soal: [
        { no: 1, pertanyaan: "Jika seorang anak memiliki 50 rupiah dan memberikan 15 rupiah kepada orang lain, berapa rupiahkah yang masih tinggal padanya?", tipe: "isian", jawabanBenar: "35" },
        { no: 2, pertanyaan: "Berapa km-kah yang dapat ditempuh oleh kereta api dalam waktu 7 jam, jika kecepatannya 40 km/jam?", tipe: "isian", jawabanBenar: "280" },
        { no: 3, pertanyaan: "15 peti buah-buahan beratnya 250 kg dan setiap peti kosong beratnya 3 kg, berapakah berat buah-buahan itu?", tipe: "isian", jawabanBenar: "205" },
        { no: 4, pertanyaan: "Seseorang mempunyai persediaan rumput yang cukup untuk 7 ekor kuda selama 78 hari. Berapa harikah persediaan itu cukup untuk 21 ekor kuda?", tipe: "isian", jawabanBenar: "26" },
        { no: 5, pertanyaan: "3 batang coklat harganya Rp 5,- Berapa batangkah yang dapat kita beli dengan Rp 50,-?", tipe: "isian", jawabanBenar: "30" },
        { no: 6, pertanyaan: "Seseorang dapat berjalan 1,75 m dalam waktu 1/4 detik. Berapakah meterkah yang dapat ia tempuh dalam waktu 10 detik?", tipe: "isian", jawabanBenar: "70" },
        { no: 7, pertanyaan: "Jika sebuah batu terletak 15 m di sebelah selatan dari sebatang pohon dan pohon itu berada 30 m di sebelah selatan dari sebuah rumah, berapa meterkah jarak antara batu dan rumah itu?", tipe: "isian", jawabanBenar: "45" },
        { no: 8, pertanyaan: "Jika 4 1/2 m bahan sandang harganya Rp 90,- berapakah rupiahkah harganya 2 1/2 m?", tipe: "isian", jawabanBenar: "50" },
        { no: 9, pertanyaan: "7 orang dapat menyelesaikan sesuatu pekerjaan dalam 6 hari. Berapa orangkah yang diperlukan untuk menyelesaikan pekerjaan itu dalam setengah hari?", tipe: "isian", jawabanBenar: "84" },
        { no: 10, pertanyaan: "Karena dipanaskan, kawat yang panjangnya 48 cm akan mengembang menjadi 52 cm. setelah pemanasan, berapakah panjangnya kawat yang berukuran 72 cm?", tipe: "isian", jawabanBenar: "78" },
        { no: 11, pertanyaan: "Suatu pabrik dapat menghasilkan 304 batang pensil dalam waktu 8 jam. Berapa batangkah dihasilkan dalam waktu setengah jam?", tipe: "isian", jawabanBenar: "19" },
        { no: 12, pertanyaan: "Untuk suatu campuran diperlukan 2 bagian perak dan 3 bagian timah. Berapa gramkah perak yang diperlukan untuk mendapatkan campuran itu yang beratnya 15 gram?", tipe: "isian", jawabanBenar: "6" },
        { no: 13, pertanyaan: "Untuk setiap Rp 3,- yang dimiliki Sidin, Hamid memiliki Rp 5,- Jika mereka bersama mempunyai Rp 120,- berapa rupiahkah yang dimiliki Hamid?", tipe: "isian", jawabanBenar: "75" },
        { no: 14, pertanyaan: "Mesin A menenun 60 m kain, sedangkan mesin B menenun 40 m. berapa meterkah yang ditenun mesin A, jika mesin B menenun 60 m?", tipe: "isian", jawabanBenar: "90" },
        { no: 15, pertanyaan: "Seseorang membelanjakan 1/10 dari uangnya untuk perangko dan 4 kali jumlah itu untuk alat tulis. Sisa uangnya masih Rp 60,- Berapa rupiahkah uang semula?", tipe: "isian", jawabanBenar: "120" },
        { no: 16, pertanyaan: "Di dalam dua peti terdapat 43 piring. Di dalam peti yang satu terdapat 9 piring lebih banyak dari pada di dalam peti yang lain. Berapa buah piring terdapat di dalam peti yang lebih kecil?", tipe: "isian", jawabanBenar: "17" },
        { no: 17, pertanyaan: "Suatu lembaran kain yang panjangnya 60 cm harus dibagikan sedemikian rupa sehingga panjangnya satu bagian ialah 2/3 dari bagian yang lain. Berapa panjangnya bagian yang terpendek?", tipe: "isian", jawabanBenar: "24" },
        { no: 18, pertanyaan: "Suatu perusahaan mengekspor 3/4 dari hasil produksinya dan menjual 4/5 dari sisa itu dalam negeri. Berapa % kah hasil produksi yang masih tinggal?", tipe: "isian", jawabanBenar: "5" },
        { no: 19, pertanyaan: "Jika suatu botol berisi anggur hanya 7/8 bagian dan harganya ialah Rp 84,- berapakah harga anggur itu jika botol itu hanya terisi 1/2 penuh?", tipe: "isian", jawabanBenar: "48" },
        { no: 20, pertanyaan: "Di dalam suatu keluarga setiap anak perempuan mempunyai jumlah saudara laki-laki yang sama dengan jumlah saudara perempuan dan setiap anak laki-laki mempunyai dua kali lebih banyak saudara perempuan dari pada saudara laki-laki. Berapa anak laki-lakikah yang terdapat di dalam keluarga tersebut?", tipe: "isian", jawabanBenar: "3" }
    ]
};

// ==========================================
// DATA SOAL 06
// ==========================================
const istSoal06 = {
    id: "soal_06",
    nama: "Soal 06",
    waktuContoh: 30000,
    waktuUjian: 600000, // 10 Menit
    petunjuk: "Pada persoalan berikut akan diberikan deret angka. Setiap deret tersusun menurut suatu aturan yang tertentu dan dapat dilanjutkan menurut aturan itu. Carilah untuk setiap deret, angka berikutnya dan ketiklah jawaban saudara pada kolom yang disediakan.",
    contoh: [
        { 
            no: "01", 
            pertanyaan: "2   4   6   8   10   12   14   ?", 
            tipe: "isian",
            jawabanBenar: "16",
            penjelasan: "Cara mengerjakan: Pada deret ini angka berikutnya selalu didapat jika angka di depannya ditambah dengan 2. Maka jawabannya ialah 16."
        },
        { 
            no: "02", 
            pertanyaan: "9   7   10   8   11   9   12   ?", 
            tipe: "isian",
            jawabanBenar: "10",
            penjelasan: "Cara mengerjakan: Pada deret ini berganti-ganti harus dikurangi dengan 2 dan setelah itu ditambah dengan 3. Maka jawabannya ialah 10."
        }
    ],
    soal: [
        { no: 1, pertanyaan: "6   9   12   15   18   21   24   ?", tipe: "isian", jawabanBenar: "27" },
        { no: 2, pertanyaan: "15   16   18   19   21   22   24   ?", tipe: "isian", jawabanBenar: "25" },
        { no: 3, pertanyaan: "19   18   22   21   25   24   28   ?", tipe: "isian", jawabanBenar: "27" },
        { no: 4, pertanyaan: "16   12   17   13   18   14   19   ?", tipe: "isian", jawabanBenar: "15" },
        { no: 5, pertanyaan: "2   4   8   10   20   22   44   ?", tipe: "isian", jawabanBenar: "46" },
        { no: 6, pertanyaan: "15   13   16   12   17   11   18   ?", tipe: "isian", jawabanBenar: "10" },
        { no: 7, pertanyaan: "25   22   11   33   30   15   45   ?", tipe: "isian", jawabanBenar: "42" },
        { no: 8, pertanyaan: "49   51   54   27   9   11   14   ?", tipe: "isian", jawabanBenar: "7" },
        { no: 9, pertanyaan: "2   3   1   3   4   2   4   ?", tipe: "isian", jawabanBenar: "5" },
        { no: 10, pertanyaan: "19   17   20   16   21   15   22   ?", tipe: "isian", jawabanBenar: "14" },
        { no: 11, pertanyaan: "94   92   46   44   22   20   10   ?", tipe: "isian", jawabanBenar: "8" },
        { no: 12, pertanyaan: "5   8   9   8   11   12   11   ?", tipe: "isian", jawabanBenar: "14" },
        { no: 13, pertanyaan: "12   15   19   23   28   33   39   ?", tipe: "isian", jawabanBenar: "45" },
        { no: 14, pertanyaan: "7   5   10   7   21   17   68   ?", tipe: "isian", jawabanBenar: "63" },
        { no: 15, pertanyaan: "11   15   18   9   13   16   8   ?", tipe: "isian", jawabanBenar: "12" },
        { no: 16, pertanyaan: "3   8   15   24   35   48   63   ?", tipe: "isian", jawabanBenar: "80" },
        { no: 17, pertanyaan: "4   5   7   4   8   13   7   ?", tipe: "isian", jawabanBenar: "14" },
        { no: 18, pertanyaan: "8   5   15   18   6   3   9   ?", tipe: "isian", jawabanBenar: "12" },
        { no: 19, pertanyaan: "15   6   18   10   30   23   69   ?", tipe: "isian", jawabanBenar: "63" },
        { no: 20, pertanyaan: "5   35   28   4   11   77   70   ?", tipe: "isian", jawabanBenar: "10" }
    ]
};

// Map referensi seluruh subtes IST
const IST_SUBTEST_MAP = {
    '01': istSoal01,
    'soal_01': istSoal01,
    '02': istSoal02,
    'soal_02': istSoal02,
    '03': istSoal03,
    'soal_03': istSoal03,
    '04': istSoal04,
    'soal_04': istSoal04,
    '05': istSoal05,
    'soal_05': istSoal05,
    '06': istSoal06,
    'soal_06': istSoal06
};

// Daftar subtes untuk dashboard modul IST
const IST_DAFTAR_SUBTES = [
    { no: "01", nama: "Soal 01", jumlahSoal: 20, deskripsi: "Melengkapi Kalimat" },
    { no: "02", nama: "Soal 02", jumlahSoal: 20, deskripsi: "Mencari Kata Berbeda" },
    { no: "03", nama: "Soal 03", jumlahSoal: 20, deskripsi: "Hubungan Kata" },
    { no: "04", nama: "Soal 04", jumlahSoal: 16, deskripsi: "Persamaan Kata" },
    { no: "05", nama: "Soal 05", jumlahSoal: 20, deskripsi: "Hitungan Angka" },
    { no: "06", nama: "Soal 06", jumlahSoal: 20, deskripsi: "Deret Angka" },
    { no: "07", nama: "Soal 07", jumlahSoal: 20, deskripsi: "Potongan Gambar" },
    { no: "08", nama: "Soal 08", jumlahSoal: 20, deskripsi: "Latihan Kubus" },
    { no: "09", nama: "Soal 09", jumlahSoal: 20, deskripsi: "Mengingat Kata" }
];
