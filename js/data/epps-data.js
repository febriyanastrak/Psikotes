// =========================================================================
// BANK SOAL & DATA METRIK: EPPS (EDWARDS PERSONAL PREFERENCE SCHEDULE)
// PT Altrak 1978 - Leadership & Management Assessment System
// 225 Soal Resmi & 15 Variabel Kebutuhan Pokok Edwards/Murray
// =========================================================================

const EPPS_CONFIG = {
    totalSoal: 225,
    namaTes: "EPPS (Edwards Personal Preference Schedule)",
    waktuStandarDetik: 3600, // 60 Menit (Alokasi Standar Termasuk Pedoman & Contoh)
    pedoman: {
        judul: "Petunjuk & Pedoman Pelaksanaan Tes EPPS",
        subjudul: "Edwards Personal Preference Schedule (Standar Psikodiagnostik Resmi)",
        kutipanResmi: "Setiap pilihan Anda hendaknya didasarkan atas kemiripan dengan gambaran atau perasaan Anda sekarang. Dan tidak didasarkan atas hal-hal yang Anda anggap wajar.\n\nIni tes kepribadian, tidak ada jawban yang benar atau salah. Apapun yang Anda pilih hendaknya merupakan suatu penggambaran dari hal-hal yang Anda lakukan atau rasakan. Tetapkan pilihan Anda setelah membaca pernyataan yang berpasangan ini, dan jangan ada yang terlewati. Bacalah setiap pasangan dan pilihlah pernyataan yang 'lebih menggambarkan diri Anda' dengan cara memilih huruf A atau B.",
        contoh: [
            {
                no: "Contoh 1",
                a: "Saya suka berbicara tentang diri saya dengan orang lain.",
                b: "Saya suka bekerja untuk suatu tujuan yang telah saya tentukan bagi diri saya.",
                penjelasan: "Bila Anda lebih mirip pernyataan A, pilihlah A. Bila Anda lebih mirip pernyataan B, pilihlah B. Tetap pilih salah satu yang paling mendekati diri Anda."
            },
            {
                no: "Contoh 2",
                a: "Saya bersusah hati, bila gagal dalam sesuatu.",
                b: "Saya merasa gugup bila harus bicara di depan orang banyak.",
                penjelasan: "Pilihlah salah satu yang lebih menggambarkan perasaan Anda saat ini secara spontan."
            }
        ]
    },
    skala: {
        ach: { kode: "ach", nama: "Achievement", arti: "Dorongan berprestasi, bekerja keras & menyelesaikan tugas sulit dengan sukses" },
        def: { kode: "def", nama: "Deference", arti: "Kesediaan mentaati peraturan, menghargai pimpinan & menghormati pendapat orang lain" },
        ord: { kode: "ord", nama: "Order", arti: "Keteraturan, perencanaan sistematis, kerapian & kedisiplinan kerja" },
        exh: { kode: "exh", nama: "Exhibition", arti: "Kebutuhan tampil menonjol, berbicara di depan umum & menarik perhatian positif" },
        aut: { kode: "aut", nama: "Autonomy", arti: "Kemandirian, kebebasan membuat keputusan tanpa ketergantungan orang lain" },
        aff: { kode: "aff", nama: "Affiliation", arti: "Kebutuhan menjalin persahabatan, kerja sama tim & loyalitas sosial yang hangat" },
        int: { kode: "int", nama: "Intraception", arti: "Kemampuan menganalisis motif, perasaan, psikologi & empati tinggi terhadap orang lain" },
        suc: { kode: "suc", nama: "Succorance", arti: "Kebutuhan menerima dorongan semangat, simpati & dukungan saat menghadapi kesulitan" },
        dom: { kode: "dom", nama: "Dominance", arti: "Kebutuhan memimpin, memengaruhi orang lain, membimbing & mengambil inisiatif" },
        aba: { kode: "aba", nama: "Abasement", arti: "Kecenderungan introspeksi, berani mengakui kesalahan diri & bersikap rendah hati" },
        nur: { kode: "nur", nama: "Nurturance", arti: "Kepedulian menolong, memperlakukan orang lain dengan ramah, murah hati & dermawan" },
        chg: { kode: "chg", nama: "Change", arti: "Kebutuhan akan inovasi, variasi pengalaman baru, fleksibel & anti-monoton" },
        end: { kode: "end", nama: "Endurance", arti: "Daya tahan, ketekunan, kegigihan menyelesaikan tugas panjang sampai tuntas" },
        het: { kode: "het", nama: "Heterosexuality", arti: "Keberanian sosial, pergaulan luas & dinamika relasi interpersonal yang aktif" },
        agg: { kode: "agg", nama: "Aggression", arti: "Ketegasan bersikap, keberanian menyampaikan argumen & berkompetisi secara terbuka" }
    },
    consistencyPairs: [
        [1, 151], [26, 101], [51, 201],
        [7, 157], [32, 107], [57, 207],
        [13, 163], [38, 113], [63, 213],
        [19, 169], [44, 119], [69, 219],
        [25, 175], [50, 125], [75, 225]
    ]
};

const EPPS_QUESTIONS = [
    {
        "no": 1,
        "a": "Saya suka menolong teman-teman saya, apabila mereka dalam kesulitan.",
        "b": "Saya ingin melakukan apa saja sebaik mungkin.",
        "skalaA": "nur",
        "skalaB": "ach"
    },
    {
        "no": 2,
        "a": "Saya ingin mengetahui bagimana pandangan orang-orang besar, mengenai berbagai masalah yang menarik perhatian saya.",
        "b": "Saya ingin menyelesaikan sesuatu yang sangat penting artinya.",
        "skalaA": "def",
        "skalaB": "ach"
    },
    {
        "no": 3,
        "a": "Saya menghendaki bahwa setiap pekerjaan tulis saya teliti, rapi dan tersusun dengan baik.",
        "b": "Saya ingin menjadi seorang ahli yang diakui dalam suatu pekerjaan, jabatan atau bidang yang khusus.",
        "skalaA": "ord",
        "skalaB": "ach"
    },
    {
        "no": 4,
        "a": "Saya suka menceritakan cerita-cerita yang lucu dan lelucon-lelucon waktu pesta.",
        "b": "Saya ingin menulis roman atau sandiwara yang hebat.",
        "skalaA": "exh",
        "skalaB": "ach"
    },
    {
        "no": 5,
        "a": "Saya ingin dapat berbuat sekehendak hati saya.",
        "b": "Saya ingin bisa mengatakan bahwa saya telah melakukan dengan baik suatu pekerjaan yang sulit.",
        "skalaA": "aut",
        "skalaB": "ach"
    },
    {
        "no": 6,
        "a": "Saya ingin dapat memecahkan teka-teki dan persoalan-persoalan yang sukar bagi orang lain.",
        "b": "Saya suka mengikuti petunjuk-petunjuk dan melakukan apa yang diharapkan orang lain dari saya.",
        "skalaA": "ach",
        "skalaB": "def"
    },
    {
        "no": 7,
        "a": "Saya ingin mengalami pembaharuan dan perubahan dalam kehidupan saya sehari-hari.",
        "b": "Saya suka menyatakan kepada atasan saya bahwa mereka telah melakukan sesuatu pekerjaan yang baik, apabila menurut pendapat saya memang demikian adanya.",
        "skalaA": "chg",
        "skalaB": "def"
    },
    {
        "no": 8,
        "a": "Saya suka merencanakan dan mengatur detail-detail dari setiap pekerjaan yang harus saya lakukan.",
        "b": "Saya suka mengikuti petunjuk-petunjuk dan melakukan apa yang diharapkan orang dari diri saya.",
        "skalaA": "ord",
        "skalaB": "def"
    },
    {
        "no": 9,
        "a": "Saya ingin orang-orang memperhatikan dan memberikan komentar mengenai penampilan saya di depan umum.",
        "b": "Saya suka membaca riwayat hidup orang-orang besar.",
        "skalaA": "exh",
        "skalaB": "def"
    },
    {
        "no": 10,
        "a": "Saya suka mengelakkan situasi-situasi yang mengharapkan saya melakukan hal-hal dengan cara konvensional (kebiasaan yang umum dilakukan orang).",
        "b": "Saya suka membaca riwayat hidup orang-orang besar.",
        "skalaA": "aut",
        "skalaB": "def"
    },
    {
        "no": 11,
        "a": "Saya ingin menjadi seorang ahli yang diakui dalam suatu pekerjaan, jabatan atau bidang khusus.",
        "b": "Sebelum memulai sesuatu pekerjaan saya ingin pekerjaan itu teratur dan terencanakan.",
        "skalaA": "ach",
        "skalaB": "ord"
    },
    {
        "no": 12,
        "a": "Saya ingin mengetahui bagaimana pandangan orang-orang besar/ahli, mengenai berbagai masalah yang menarik perhatian saya.",
        "b": "Jika saya akan bepergian, saya senang apabila segala sesuatunya telah direncanakan sebelumnya.",
        "skalaA": "def",
        "skalaB": "ord"
    },
    {
        "no": 13,
        "a": "Saya suka menyelesaikan setiap pekerjaan atau tugas yang telah saya mulai.",
        "b": "Saya ingin barang-barang saya tersusun rapi dan teratur di atas meja atau di dalam ruang kerja saya.",
        "skalaA": "end",
        "skalaB": "ord"
    },
    {
        "no": 14,
        "a": "Saya suka bercerita kepada orang-orang lain tentang petualangan-petualangan saya dan hal-hal aneh yang pernah saya alami.",
        "b": "Saya suka makan saya teratur dan ada waktu-waktu tertentu untuk makan.",
        "skalaA": "exh",
        "skalaB": "ord"
    },
    {
        "no": 15,
        "a": "Saya ingin tidak tergantung dari orang lain dalam menentukan apa yang akan saya lakukan.",
        "b": "Saya ingin barang-barang saya tersusun rapi dan teratur di atas meja atau di dalam ruang kerja saya.",
        "skalaA": "aut",
        "skalaB": "ord"
    },
    {
        "no": 16,
        "a": "Saya ingin bisa mengerjakan segala sesuatu lebih baik daripada orang-orang lain.",
        "b": "Saya suka menceritakan cerita-cerita lucu dan lelucon-lelucon waktu pesta.",
        "skalaA": "ach",
        "skalaB": "exh"
    },
    {
        "no": 17,
        "a": "Saya suka mengikuti adat-istiadat dan menghindarkan melakukan hal-hal yang mungkin dianggap tidak wajar oleh orang-orang yang saya hormati.",
        "b": "Saya suka berbicara tentang hal-hal yang telah saya capai.",
        "skalaA": "def",
        "skalaB": "exh"
    },
    {
        "no": 18,
        "a": "Saya ingin agar hidup saya teratur sedemikian rupa, sehingga berjalan lancar dan tanpa banyak perubahan-perubahan dalam rencana saya.",
        "b": "Saya suka bercerita kepada orang-orang lain tentang petualangan-petualangan saya dan hal-hal aneh yang pernah saya alami.",
        "skalaA": "ord",
        "skalaB": "exh"
    },
    {
        "no": 19,
        "a": "Saya suka membaca buku-buku dan sandiwara, terutama yang berkisar sekitar masalah seks.",
        "b": "Saya suka menjadi pusat perhatian, apabila saya ada di dalam suatu kelompok.",
        "skalaA": "het",
        "skalaB": "exh"
    },
    {
        "no": 20,
        "a": "Saya suka mengecam orang-orang yang kedudukannya memegang kekuasaan.",
        "b": "Saya suka menggunakan kata-kata yang maknanya seringkali tidak diketahui oleh orang lain.",
        "skalaA": "aut",
        "skalaB": "exh"
    },
    {
        "no": 21,
        "a": "Saya suka menyelesaikan tugas-tugas yang dianggap orang lain sebagai tugas yang membutuhkan keterampilan dan usaha.",
        "b": "Saya ingin dapat berbuat sekehendak hati saya.",
        "skalaA": "ach",
        "skalaB": "aut"
    },
    {
        "no": 22,
        "a": "Saya suka memuji orang yang saya kagumi.",
        "b": "Saya ingin merasa bebas untuk melakukan apa yang saya kehendaki.",
        "skalaA": "def",
        "skalaB": "aut"
    },
    {
        "no": 23,
        "a": "Saya suka menyimpan surat-surat, bon-bon, dan kertas-kertas lain secara tersusun rapi dan menurut sistem tertentu.",
        "b": "Saya ingin tidak tergantung dari orang lain dalam menentukan apa yang akan saya lakukan.",
        "skalaA": "ord",
        "skalaB": "aut"
    },
    {
        "no": 24,
        "a": "Saya suka mengajukan pertanyaan-pertanyaan yang menurut saya tidak seorangpun akan dapat menjawabnya.",
        "b": "Saya suka mengecam orang-orang yang kedudukannya memegang kekuasaan.",
        "skalaA": "exh",
        "skalaB": "aut"
    },
    {
        "no": 25,
        "a": "Saya menjadi sedemikian marahnya, sehingga rasanya ingin melemparkan dan merusak barang-barang.",
        "b": "Saya suka mengelakkan tanggung jawab dan kewajiban-kewajiban.",
        "skalaA": "agg",
        "skalaB": "aut"
    },
    {
        "no": 26,
        "a": "Saya ingin berhasil dalam apa yang saya lakukan.",
        "b": "Saya suka membuat teman-teman baru.",
        "skalaA": "ach",
        "skalaB": "aff"
    },
    {
        "no": 27,
        "a": "Saya suka mengikuti petunjuk-petunjuk dan melakukan apa yang diharapkan orang dari diri saya.",
        "b": "Saya ingin mempunyai ikatan perasaan yang kuat dengan teman teman saya.",
        "skalaA": "def",
        "skalaB": "aff"
    },
    {
        "no": 28,
        "a": "Saya menghendaki bahwa setiap pekerjaan tulis saya teliti, rapi dan tersusun dengan baik.",
        "b": "Saya ingin membuat teman sebanyak mungkin.",
        "skalaA": "ord",
        "skalaB": "aff"
    },
    {
        "no": 29,
        "a": "Saya suka menceritakan cerita-cerita lucu dan lelucon-lelucon waktu pesta.",
        "b": "Saya suka berkirim surat pada teman-teman saya.",
        "skalaA": "exh",
        "skalaB": "aff"
    },
    {
        "no": 30,
        "a": "Saya ingin berbuat sekehendak hati saya.",
        "b": "Saya suka dalam melakukan atau menjalani segala sesuatu bersama-sama dengan teman-teman.",
        "skalaA": "aut",
        "skalaB": "aff"
    },
    {
        "no": 31,
        "a": "Saya ingin dapat memecahkan teka teki dan persoalan-persoalan yang sukar bagi orang lain.",
        "b": "Saya suka menilai orang berdasarkan sebab-sebab mengapa mereka melakukan sesuatu, bukan berdasar apa yang sesungguhnya mereka lakukan.",
        "skalaA": "ach",
        "skalaB": "int"
    },
    {
        "no": 32,
        "a": "Saya suka menerima pimpinan dari orang-orang yang saya kagumi.",
        "b": "Saya ingin memahami bagimana perasaan teman-teman saya dalam menghadapi berbagai masalah.",
        "skalaA": "def",
        "skalaB": "int"
    },
    {
        "no": 33,
        "a": "Saya suka makan saya teratur dan ada waktu-waktu tertentu untuk makan.",
        "b": "Saya suka mempelajari dan menganalisa tingkah laku orang-orang lain.",
        "skalaA": "ord",
        "skalaB": "int"
    },
    {
        "no": 34,
        "a": "Saya suka mengatakan hal yang dianggap lucu dan cerdas oleh orang lain.",
        "b": "Saya suka untuk menempatkan diri saya ditempat orang lain, dan membayangkan bagaimana perasaan saya apabila saya dalam keadaan atau situasi yang sama.",
        "skalaA": "exh",
        "skalaB": "int"
    },
    {
        "no": 35,
        "a": "Saya ingin merasa bebas untuk melakukan apa yang saya kehendaki.",
        "b": "Saya suka mengamat-amati bagaimana perasaan orang lain dalam satu keadaan tertentu.",
        "skalaA": "aut",
        "skalaB": "int"
    },
    {
        "no": 36,
        "a": "Saya suka menyelesaikan tugas-tugas yang dianggap orang lain sebagai tugas yang membutuhkan keterampilan dan usaha.",
        "b": "Saya ingin teman-teman saya memberi dorongan-dorongan kepada saya bila saya menghadapi kegagalan.",
        "skalaA": "ach",
        "skalaB": "suc"
    },
    {
        "no": 37,
        "a": "Dalam merencanakan sesuatu, saya ingin mendapat saran-saran dari orang-orang yang pendapatnya saya hormati.",
        "b": "Saya ingin diperlakukan dengan ramah oleh teman-teman saya.",
        "skalaA": "def",
        "skalaB": "suc"
    },
    {
        "no": 38,
        "a": "Saya ingin agar hidup saya teratur sedemikian rupa sehingga berjalan lancar dan tanpa banyak perubahan-perubahan dalam rencana saya.",
        "b": "Saya ingin teman-teman saya merasa kasihan pada saya apabila saya sedang sakit.",
        "skalaA": "ord",
        "skalaB": "suc"
    },
    {
        "no": 39,
        "a": "Saya suka menjadi pusat perhatian, apabila syaa ada dalam suatu kelompok.",
        "b": "Saya ingin agar teman-teman saya meributkan tentang diri saya, apabila mendapatkan cedera atau sakit.",
        "skalaA": "exh",
        "skalaB": "suc"
    },
    {
        "no": 40,
        "a": "Saya suka mengelakkan situasi-situasi yang mengharapkan saya melakukan hal-hal dengan konvensional (kebiasaan yang umum dilakukan orang).",
        "b": "Saya ingin agar teman-teman saya bersimpati terhadap saya dan menghibur saya bila saya bersusah hati.",
        "skalaA": "aut",
        "skalaB": "suc"
    },
    {
        "no": 41,
        "a": "Saya ingin menulis roman atau sandiwara yang hebat.",
        "b": "Apabila saya bekerja dalam suatu panitia, saya ingin ditunjuk atau dipilih sebagai ketuanya.",
        "skalaA": "ach",
        "skalaB": "dom"
    },
    {
        "no": 42,
        "a": "Apabila saya berada dalam kelompok saya suka menerima pimpinan orang lain dalam memutuskan apa yang akan dilakukan oleh kelompok tersebut.",
        "b": "Sedapat mungkin saya ingin membimbing dan mengarahkan tindakan atau perbuatan orang lain.",
        "skalaA": "def",
        "skalaB": "dom"
    },
    {
        "no": 43,
        "a": "Saya suka menyimpan surat-surat, bon-bon, dan kertas-kertas lainnya secara tersusun rapi dan menurut sistem tertentu.",
        "b": "Saya ingin menjadi salah seorang pemimpin dalam organisasi-organisasi atau kelompok-kelompok dimana saya menjadi anggotanya.",
        "skalaA": "ord",
        "skalaB": "dom"
    },
    {
        "no": 44,
        "a": "Saya suka mengajukan pertanyaan-pertanyaan yang menurut saya tidak seorangpun akan dapat menjawabnya.",
        "b": "Saya suka mengatakan pada orang-orang lain bagimana mereka harus melakukan pekerjaan mereka.",
        "skalaA": "exh",
        "skalaB": "dom"
    },
    {
        "no": 45,
        "a": "Saya suka mengelakkan tanggung jawab dan kewajiban-kewajiban.",
        "b": "Saya senang untuk diminta menyelesaikan pertentangan-pertentangan atau perselisihan-perselisihan.",
        "skalaA": "aut",
        "skalaB": "dom"
    },
    {
        "no": 46,
        "a": "Saya ingin menjadi ahli yang diakui dalam pekerjaan, jabatan atau bidang khusus.",
        "b": "Saya merasa bersalah, apabila saya telah melakukan sesuatu yang saya ketahui keliru.",
        "skalaA": "ach",
        "skalaB": "aba"
    },
    {
        "no": 47,
        "a": "Saya suka membaca riwayat orang-orang besar.",
        "b": "Saya merasa bahwa saya harus mengakui hal-hal yang telah saya lakukan dan saya anggap salah.",
        "skalaA": "def",
        "skalaB": "aba"
    },
    {
        "no": 48,
        "a": "Saya suka merencanakan dan mengatur detail-detail dari setiap pekerjaan yang harus saya lakukan.",
        "b": "Bila keadaan kurang menguntungkan bagi saya, maka saya merasa bahwa saya harus lebih disalahkan daripada orang lain.",
        "skalaA": "ord",
        "skalaB": "aba"
    },
    {
        "no": 49,
        "a": "Saya suka menggunakan kata-kata yang maknanya seringkali tidak diketahui oleh orang lain.",
        "b": "Saya merasa bahwa dalam banyak hal, saya kalah bila dibandingkan dengan orang-orang lain.",
        "skalaA": "exh",
        "skalaB": "aba"
    },
    {
        "no": 50,
        "a": "Saya suka mengecam orang-orang yang kedudukannya memegang kekuasaan.",
        "b": "Saya merasa canggung ditengah-tengah orang-orang lain yang saya anggap sebagai atasan saya.",
        "skalaA": "aut",
        "skalaB": "aba"
    },
    {
        "no": 51,
        "a": "Saya suka melakukan pekerjaan apa saja terbaik mungkin.",
        "b": "Saya suka menolong orang-orang lain, yang tidak begitu beruntung apabila dibandingkan dengan keadaan saya.",
        "skalaA": "ach",
        "skalaB": "nur"
    },
    {
        "no": 52,
        "a": "Saya ingin mengetahui bagimana pandangan orang-orang besar mengenai berbagai masalah yang menarik perhatian saya.",
        "b": "Saya suka bermurah hati terhadap teman teman saya.",
        "skalaA": "def",
        "skalaB": "nur"
    },
    {
        "no": 53,
        "a": "Saya suka membuat rencana sebelum memulai pekerjaan yang sulit.",
        "b": "Saya suka memberi pertolongan-pertolongan kecil kepada teman-teman saya.",
        "skalaA": "ord",
        "skalaB": "nur"
    },
    {
        "no": 54,
        "a": "Saya suka bercerita kepada orang-orang lain tentang petualangan-petualangan saya dan hal-hal aneh yang pernah saya alami.",
        "b": "Saya ingin teman-teman saya mempercayai saya dan menceritakan kesulitan-kesulitan mereka kepada saya.",
        "skalaA": "exh",
        "skalaB": "nur"
    },
    {
        "no": 55,
        "a": "Saya suka menyatakan pendapat saya tentang berbagai hal.",
        "b": "Saya suka memaafkan teman-teman saya yang menyakiti hati saya.",
        "skalaA": "aut",
        "skalaB": "nur"
    },
    {
        "no": 56,
        "a": "Saya ingin bisa mengerjakan segala sesuatu lebih baik daripada orang-orang lain.",
        "b": "Saya suka makan di restoran-restoran yang baru atau asing.",
        "skalaA": "ach",
        "skalaB": "chg"
    },
    {
        "no": 57,
        "a": "Saya suka mengikuti adat-istiadat dan menghindarkan melakukan hal-hal yang mungkin dianggap tidak wajar oleh orang-orang yang saya hormati.",
        "b": "Saya suka mengikuti mode-mode baru.",
        "skalaA": "def",
        "skalaB": "chg"
    },
    {
        "no": 58,
        "a": "Sebelum memulai sesuatu pekerjaan saya ingin pekerjaan itu teratur dan terencanakan.",
        "b": "Saya suka bepergian melihat-lihat daerah pedalaman.",
        "skalaA": "ord",
        "skalaB": "chg"
    },
    {
        "no": 59,
        "a": "Saya ingin orang-orang memperhatikan dan memberikan komentar mengenai penampilan saya di depan umum.",
        "b": "Saya suka berkeliling di pedalaman dan tinggal di berbagai tempat.",
        "skalaA": "exh",
        "skalaB": "chg"
    },
    {
        "no": 60,
        "a": "Saya ingin tidak tergantung dari orang lain dalam menentukan apa yang akan saya lakukan.",
        "b": "Saya suka mengerjakan hal-hal yang baru dan berbeda-beda.",
        "skalaA": "aut",
        "skalaB": "chg"
    },
    {
        "no": 61,
        "a": "Saya ingin bisa mengatakan bahwa saya telah melakukan dengan baik suatu pekerjaan yang sulit.",
        "b": "Saya suka bekerja keras pada tiap pekerjaan yang saya hadapi.",
        "skalaA": "ach",
        "skalaB": "end"
    },
    {
        "no": 62,
        "a": "Saya suka menyatakan kepada atasan saya bahwa mereka telah melakukan sesuatu pekerjaan yang baik, apabila menurut pendapat saya memang demikian keadaannya.",
        "b": "Saya ingin menyelesaikan pekerjaan satu-persatu sebelum memulai yang lainnya.",
        "skalaA": "def",
        "skalaB": "end"
    },
    {
        "no": 63,
        "a": "Jika saya akan bepergian, saya senang apabila segala sesuatunya telah direncanakan sebelumnya..",
        "b": "Saya suka mengerjakan teka-teki atau memecahkan persoalan-persoalan sampai selesai.",
        "skalaA": "ord",
        "skalaB": "end"
    },
    {
        "no": 64,
        "a": "Saya kadang-kadang suka melakukan hal-hal hanya untuk melihat bagaimana pengaruhnya terhadap orang lain.",
        "b": "Saya suka bertahan menghadapi suatu pekerjaan atau masalah, sekalipun tampaknya seolah-olah saya tak akan berhasil.",
        "skalaA": "exh",
        "skalaB": "end"
    },
    {
        "no": 65,
        "a": "Saya suka melakukan hal-hal yang dianggap orang lain tidak sesuai dengan adat kebiasaan.",
        "b": "Saya ingin bekerja berjam-jam tanpa diganggu.",
        "skalaA": "aut",
        "skalaB": "end"
    },
    {
        "no": 66,
        "a": "Saya ingin menyelesaikan sesuatu yang sangat penting artinya.",
        "b": "Saya mempunyai keinginan untuk mencium orang yang menarik dari lawan jenis saya.",
        "skalaA": "ach",
        "skalaB": "het"
    },
    {
        "no": 67,
        "a": "Saya suka memuji orang yang saya kagumi.",
        "b": "Saya ingin dianggap punya daya tarik fisik oleh orang-orang dari lawan jenis saya.",
        "skalaA": "def",
        "skalaB": "het"
    },
    {
        "no": 68,
        "a": "Saya ingin barang-barang saya tersusun rapi dan teratur di atas meja atau di dalam ruang kerja saya.",
        "b": "Saya mudah jatuh cinta pada seseorang dari lawan jenis saya.",
        "skalaA": "ord",
        "skalaB": "het"
    },
    {
        "no": 69,
        "a": "Saya suka berbicara tentang hal-hal yang saya capai.",
        "b": "Saya suka mendengarkan atau menceritakan lelucon-lelucon yang terutama berkisar soal seks.",
        "skalaA": "exh",
        "skalaB": "het"
    },
    {
        "no": 70,
        "a": "Saya ingin melakukan hal-hal dengan cara saya sendiri tanpa menghiraukan apa yang mungkin dipikirkan orang lain.",
        "b": "Saya suka membaca buku-buku dan sandiwara, terutama yang berkisar sekitar masalah seks.",
        "skalaA": "aut",
        "skalaB": "het"
    },
    {
        "no": 71,
        "a": "Saya ingin menulis roman atau sandiwara yang hebat.",
        "b": "Saya suka menyerang pendirian-pendirian yang bertentangan dengan pendirian saya.",
        "skalaA": "ach",
        "skalaB": "agg"
    },
    {
        "no": 72,
        "a": "Apabila saya berada dalam kelompok saya suka menerima pimpinan orang lain dalam memutuskan apa yang akan dilakukan oleh kelompok tersebut.",
        "b": "Saya rasanya ingin mengecam seseorang di muka umum bila orang itu patut menerimanya.",
        "skalaA": "def",
        "skalaB": "agg"
    },
    {
        "no": 73,
        "a": "Saya ingin agar hidup saya teratur sedemikian rupa, sehingga berjalan lancar dan tanpa banyak perubahan-perubahan dalam rencana saya.",
        "b": "Saya menjadi sedemikian marahnya, sehingga rasanya ingin melemparkan dan merusak barang-barang.",
        "skalaA": "ord",
        "skalaB": "agg"
    },
    {
        "no": 74,
        "a": "Saya suka mengajukan pertanyaan-pertanyaan yang menurut saya tidak seorangpun akan dapat menjawabnya.",
        "b": "Saya suka mengatakan kepada orang-orang lain bagimana pendapat saya mengenai mereka.",
        "skalaA": "exh",
        "skalaB": "agg"
    },
    {
        "no": 75,
        "a": "Saya suka mengelakkan tanggung jawab dan kewajiban-kewajiban.",
        "b": "Saya rasanya ingin memperolok-olok orang-orang yang melakukan hal-hal yang saya anggap bodoh.",
        "skalaA": "aut",
        "skalaB": "agg"
    },
    {
        "no": 76,
        "a": "Saya ingin loyal terhadap teman-teman saya.",
        "b": "Saya ingin melakukan pekerjaan apa saja sebaik mungkin.",
        "skalaA": "aff",
        "skalaB": "ach"
    },
    {
        "no": 77,
        "a": "Saya suka mengamat-amati bagaimana perasaan orang lain dalam suatu keadaan tertentu.",
        "b": "Saya ingin bisa mengatakan bahwa saya telah melakukan dengan baik sesuatu pekerjaan yang sulit.",
        "skalaA": "int",
        "skalaB": "ach"
    },
    {
        "no": 78,
        "a": "Saya ingin teman-teman memberi dorongan kepada saya bila saya menghadapi kegagalan.",
        "b": "Saya ingin berhasil dalam apa yang saya lakukan.",
        "skalaA": "suc",
        "skalaB": "ach"
    },
    {
        "no": 79,
        "a": "Saya ingin menjadi salah seorang pemimpin dalam organisasi-organisasi atau kelompok-kelompok dimana saya menjadi anggotanya.",
        "b": "Saya ingin bisa mengerjakan segala sesuatu lebih baik daripada orang-orang lain.",
        "skalaA": "dom",
        "skalaB": "ach"
    },
    {
        "no": 80,
        "a": "Bila keadaan kurang menguntungkan bagi saya, maka saya merasa bahwa saya harus lebih disalahkan daripada orang lain.",
        "b": "Saya suka memecahkan teka teki dan persoalan-persoalan yang sukar bagi orang lain.",
        "skalaA": "aba",
        "skalaB": "ach"
    },
    {
        "no": 81,
        "a": "Saya suka melakukan sesuatu untuk teman-teman saya.",
        "b": "Dalam merencanakan sesuatu, saya ingin mendapat saran-saran dari orang-orang yang pendapatnya saya hormati.",
        "skalaA": "aff",
        "skalaB": "def"
    },
    {
        "no": 82,
        "a": "Saya suka untuk menempatkan diri saya ditempat orang lain, dan membayangkan bagaimana perasaan saya apabila saya dalam keadaan atau situasi yang sama.",
        "b": "Saya suka menyatakan kepada atasan saya bahwa mereka telah melakukan sesuatu pekerjaan yang baik, apabila menurut pendapat saya memang demikian adanya.",
        "skalaA": "int",
        "skalaB": "def"
    },
    {
        "no": 83,
        "a": "Saya ingin agar teman-teman saya menunjukkan simpati dan pengertian bila saya mengalami kesukaran-kesukaran.",
        "b": "Saya suka menerima pempinan dari orang-orang yang saya kagumi.",
        "skalaA": "suc",
        "skalaB": "def"
    },
    {
        "no": 84,
        "a": "Apabila saya bekerja dalam suatu panitia, saya ingin ditunjuk atau dipilih sebagai ketuanya.",
        "b": "Apabila saya berada dalam kelompok saya suka menerima pimpinan orang lain dalam memutuskan apa yang akan dilakukan oleh kelompok tersebut.",
        "skalaA": "dom",
        "skalaB": "def"
    },
    {
        "no": 85,
        "a": "Apabila saya melakukan sesuatu hal yang salah, saya merasa bahwa untuk itu saya harus dihukum.",
        "b": "Saya suka mengikuti adat-istiadat dan menghindarkan melakukan hal-hal yang mungkin dianggap tidak wajar oleh orang-orang yang saya hormati.",
        "skalaA": "aba",
        "skalaB": "def"
    },
    {
        "no": 86,
        "a": "Saya suka dalam melakukan atau menjalani segala sesuatu bersama-sama dengan teman-teman.",
        "b": "Saya suka membuat perencanaan sebelum mulai pekerjaan yang sulit.",
        "skalaA": "aff",
        "skalaB": "ord"
    },
    {
        "no": 87,
        "a": "Saya ingin memahami bagimana perasaan teman-teman saya dalam menghadapi berbagai masalah.",
        "b": "Jika saya akan bepergian, saya senang apabila segala sesuatunya telah direncanakan sebelumnya..",
        "skalaA": "int",
        "skalaB": "ord"
    },
    {
        "no": 88,
        "a": "Saya ingin diperlakukan dengan ramah oleh teman-teman saya.",
        "b": "Sebelum memulai sesuatu pekerjaan saya ingin pekerjaan itu teratur dan terencanakan.",
        "skalaA": "suc",
        "skalaB": "ord"
    },
    {
        "no": 89,
        "a": "Saya ingin dianggap sebagai pemimpin oleh orang-orang lain.",
        "b": "Saya suka menyimpan surat-surat, bon-bon, dan kertas-kertas lain secara tersusun rapi dan menurut sistem tertentu.",
        "skalaA": "dom",
        "skalaB": "ord"
    },
    {
        "no": 90,
        "a": "Saya merasa bahwa pilu hati dan kesusahan yang telah saya alami, lebih banyak membawa kebaikan daripada kerugian bagi saya.",
        "b": "Saya ingin agar hidup saya teratur sedemikian rupa, sehingga berjalan lancar dan tanpa banyak perubahan-perubahan dalam rencana saya.",
        "skalaA": "aba",
        "skalaB": "ord"
    },
    {
        "no": 91,
        "a": "Saya ingin mempunyai ikatan perasaan yang kuat dengan teman teman saya.",
        "b": "Saya suka mengatakan hal yang dianggap lucu dan cerdas oleh orang lain.",
        "skalaA": "aff",
        "skalaB": "exh"
    },
    {
        "no": 92,
        "a": "Saya suka merenungkan kepribadian teman-teman saya dan mencoba mengerti apa yang menyebabkan mereka mempunyai kepribadian yang demikian.",
        "b": "Saya kadang-kadang suka melakukan hal-hal hanya untuk melihat bagaimana pengaruhnya terhadap orang lain.",
        "skalaA": "int",
        "skalaB": "exh"
    },
    {
        "no": 93,
        "a": "Saya ingin agar teman-teman saya meributkan tentang diri saya, apabila mendapatkan cedera atau sakit.",
        "b": "Saya suka berbicara tentang hal-hal yang telah saya capai.",
        "skalaA": "suc",
        "skalaB": "exh"
    },
    {
        "no": 94,
        "a": "Saya suka mengatakan pada orang-orang lain bagimana mereka harus melakukan pekerjaan mereka.",
        "b": "Saya suka menjadi pusat perhatian, apabila saya ada di dalam suatu kelompok.",
        "skalaA": "dom",
        "skalaB": "exh"
    },
    {
        "no": 95,
        "a": "Saya merasa canggung ditengah-tengah orang-orang lain yang saya anggap sebagai atasan saya.",
        "b": "Saya suka menggunakan kata-kata yang maknanya seringkali tidak diketahui oleh orang lain.",
        "skalaA": "aba",
        "skalaB": "exh"
    },
    {
        "no": 96,
        "a": "Saya lebih suka mengerjakan sesuatu bersama-sama dengan teman-teman saya daripada sendirian.",
        "b": "Saya suka menyatakan pendapat saya tentang berbagai hal.",
        "skalaA": "aff",
        "skalaB": "aut"
    },
    {
        "no": 97,
        "a": "Saya suka mempelajari dan menganalisa tingkah laku orang-orang lain.",
        "b": "Saya suka melakukan hal-hal yang dianggap orang lain tidak sesuai dengan adat kebiasaan.",
        "skalaA": "int",
        "skalaB": "aut"
    },
    {
        "no": 98,
        "a": "Saya ingin teman-teman saya merasa kasihan pada saya apabila saya sedang sakit.",
        "b": "Saya suka mengelakkan situasi-situasi yang mengharapkan saya melakukan hal-hal dengan cara konvensional (kebiasaan yang umum dilakukan orang).",
        "skalaA": "suc",
        "skalaB": "aut"
    },
    {
        "no": 99,
        "a": "Sedapat mungkin saya ingin membimbing dan mengarahkan tindakan atau perbuatan orang lain.",
        "b": "Saya ingin melakukan hal-hal dengan cara saya sendiri tanpa menghiraukan apa yang mungkin dipikirkan orang lain.",
        "skalaA": "dom",
        "skalaB": "aut"
    },
    {
        "no": 100,
        "a": "Saya merasa bahwa dalam banyak hal, saya kalah bila dibandingkan dengan orang-orang lain.",
        "b": "Saya suka mengelakkan tanggung jawab dan kewajiban-kewajiban.",
        "skalaA": "aba",
        "skalaB": "aut"
    },
    {
        "no": 101,
        "a": "Saya ingin berhasil dalam apa yang saya lakukan.",
        "b": "Saya suka membuat teman-teman baru.",
        "skalaA": "ach",
        "skalaB": "aff"
    },
    {
        "no": 102,
        "a": "Saya suka menganalisa perasaan-perasaan saya dan sebab-sebab mengapa saya melakukan sesuatu.",
        "b": "Saya ingin melakukan sesuatu untuk teman-teman saya.",
        "skalaA": "int",
        "skalaB": "aff"
    },
    {
        "no": 103,
        "a": "Saya ingin agar teman-teman saya membantu saya bila saya mengalami kesulitan.",
        "b": "Saya suka melakukan sesuatu untuk teman-teman saya.",
        "skalaA": "suc",
        "skalaB": "aff"
    },
    {
        "no": 104,
        "a": "Saya suka memperdebatkan pendirian saya bila diserang oleh orang-orang lain.",
        "b": "Saya suka berkirim surat kepada teman-teman saya.",
        "skalaA": "dom",
        "skalaB": "aff"
    },
    {
        "no": 105,
        "a": "Saya merasa bersalah, apabila saya telah melakukan sesuatu yang saya ketahui keliru.",
        "b": "Saya ingin mempunyai ikatan perasaan yang kuat dengan teman teman saya.",
        "skalaA": "aba",
        "skalaB": "aff"
    },
    {
        "no": 106,
        "a": "Saya suka dalam melakukan atau menjalani segala sesuatu bersama-sama dengan teman-teman.",
        "b": "Saya suka menganalisa perasaan-perasaan saya dan sebab-sebab mengapa saya melakukan sesuatu.",
        "skalaA": "aff",
        "skalaB": "int"
    },
    {
        "no": 107,
        "a": "Saya suka menerima pimpinan dari orang-orang yang saya kagumi.",
        "b": "Saya ingin memahami bagimana perasaan teman-teman saya dalam menghadapi berbagai masalah.",
        "skalaA": "def",
        "skalaB": "int"
    },
    {
        "no": 108,
        "a": "Saya ingin agar teman-teman saya dengan gembira memberikan pertolongan-pertolongan kecil kepada saya.",
        "b": "Saya suka menilai orang berdasarkan sebab-sebab mengapa mereka melakukan sesuatu, bukan berdasar apa yang sesungguhnya mereka lakukan.",
        "skalaA": "suc",
        "skalaB": "int"
    },
    {
        "no": 109,
        "a": "Bila saya berada dalam suatu kelompok, saya ingin menentukan apa yang akan kami kerjakan.",
        "b": "Saya suka meramalkan bagimana teman-teman saya akan bertindak dalam berbagai situasi.",
        "skalaA": "dom",
        "skalaB": "int"
    },
    {
        "no": 110,
        "a": "Saya lebih suka mengalah dan menghindarkan perkelahian daripada memaksakan kemauan saya.",
        "b": "Saya suka menganalisa perasaan-perasaan orang lain dan sebab-sebab mengapa mereka melakukan sesuatu.",
        "skalaA": "aba",
        "skalaB": "int"
    },
    {
        "no": 111,
        "a": "Saya suka membuat teman-teman baru.",
        "b": "Saya ingin agar teman-teman saya membantu saya bila saya mengalami kesulitan.",
        "skalaA": "aff",
        "skalaB": "suc"
    },
    {
        "no": 112,
        "a": "Saya suka menilai orang berdasarkan sebab-sebab mengapa mereka melakukan sesuatu, bukan berdasar apa yang sesungguhnya mereka lakukan.",
        "b": "Saya ingin teman-teman saya banyak menujukkan rasa sayang mereka terhadap saya.",
        "skalaA": "int",
        "skalaB": "suc"
    },
    {
        "no": 113,
        "a": "Saya ingin agar hidup saya teratur sedemikian rupa, sehingga berjalan lancar dan tanpa banyak perubahan-perubahan dalam rencana saya.",
        "b": "Saya ingin teman-teman saya merasa kasihan pada saya apabila saya sedang sakit.",
        "skalaA": "ord",
        "skalaB": "suc"
    },
    {
        "no": 114,
        "a": "Saya senang untuk diminta menyelesaikan pertentangan-pertentangan atau perselisihan-perselisihan.",
        "b": "Saya ingin agar teman-teman saya dengan gembira memberikan pertolongan-pertolongan kecil kepada saya.",
        "skalaA": "dom",
        "skalaB": "suc"
    },
    {
        "no": 115,
        "a": "Saya merasa bahwa saya harus mengakui hal-hal yang telah saya lakukan dan saya anggap salah.",
        "b": "Saya ingin agar teman-teman saya bersimpati terhadap saya dan menghibur saya bila saya bersusah hati.",
        "skalaA": "aba",
        "skalaB": "suc"
    },
    {
        "no": 116,
        "a": "Saya lebih suka mengerjakan sesuatu bersama-sama dengan teman-teman saya daripada sendirian.",
        "b": "Saya suka memperdebatkan pendirian saya bila diserang oleh orang-orang lain.",
        "skalaA": "aff",
        "skalaB": "dom"
    },
    {
        "no": 117,
        "a": "Saya suka merenungkan kepribadian teman-teman saya dan mencoba mengerti apa yang menyebabkan mereka mempunyai kepribadian yang demikian.",
        "b": "Saya ingin dapat membujuk dan mempengaruhi orang lain untuk melakukan apa yang saya kehendaki.",
        "skalaA": "int",
        "skalaB": "dom"
    },
    {
        "no": 118,
        "a": "Saya ingin agar teman-teman saya bersimpati terhadap saya dan menghibur saya bila saya bersusah hati.",
        "b": "Bila saya berada dalam suatu kelompok, saya ingin menentukan apa yang akan kami kerjakan.",
        "skalaA": "suc",
        "skalaB": "dom"
    },
    {
        "no": 119,
        "a": "Saya suka mengajukan pertanyaan-pertanyaan yang menurut saya tidak seorangpun akan dapat menjawabnya.",
        "b": "Saya suka menyatakan kepada orang lain bagaimana mereka harus melakukan pekerjaan mereka.",
        "skalaA": "exh",
        "skalaB": "dom"
    },
    {
        "no": 120,
        "a": "Saya merasa canggung ditengah-tengah orang-orang lain yang saya anggap sebagai atasan saya.",
        "b": "Sedapat mungkin saya ingin membimbing dan mengarahkan tindakan atau perbuatan orang lain.",
        "skalaA": "aba",
        "skalaB": "dom"
    },
    {
        "no": 121,
        "a": "Saya suka bergaul dalam kelompok yang para anggotanya akrab dan bersahabat satu sama lainnya.",
        "b": "Saya merasa bersalah, apabila saya telah melakukan sesuatu yang saya ketahui keliru.",
        "skalaA": "aff",
        "skalaB": "aba"
    },
    {
        "no": 122,
        "a": "Saya suka menganalisa perasaan-perasaan orang lain dan sebab-sebab mengapa mereka melakukan sesuatu.",
        "b": "Saya merasa sedih akan ketidakmampuan saya untuk menghadapi berbagai macam keadaan.",
        "skalaA": "int",
        "skalaB": "aba"
    },
    {
        "no": 123,
        "a": "Saya ingin teman-teman saya merasa kasihan pada saya apabila saya sedang sakit.",
        "b": "Saya lebih suka mengalah dan menghindarkan perkelahian daripada memaksakan kemauan saya.",
        "skalaA": "suc",
        "skalaB": "aba"
    },
    {
        "no": 124,
        "a": "Saya ingin dapat membujuk dan mempengaruhi orang lain untuk melakukan apa yang saya kehendaki.",
        "b": "Saya merasa sedih akan ketidakmampuan saya untuk menghadapi berbagai macam keadaan.",
        "skalaA": "dom",
        "skalaB": "aba"
    },
    {
        "no": 125,
        "a": "Saya suka mengecam orang-orang yang kedudukannya memegang kekuasaan.",
        "b": "Saya merasa canggung ditengah-tengah orang-orang lain yang saya anggap sebagai atasan saya.",
        "skalaA": "aut",
        "skalaB": "aba"
    },
    {
        "no": 126,
        "a": "Saya suka bergaul dalam kelompok yang para anggotanya akrab dan bersahabat satu sama lainnya.",
        "b": "Saya suka menolong teman-teman saya, apabila mereka dalam kesulitan.",
        "skalaA": "aff",
        "skalaB": "nur"
    },
    {
        "no": 127,
        "a": "Saya suka menganalisa perasaan-perasaan saya dan sebab-sebab mengapa saya melakukan sesuatu.",
        "b": "Saya suka menunjukkan simpati saya kepada teman-teman saya bila mereka mendapat cedera atau sakit.",
        "skalaA": "int",
        "skalaB": "nur"
    },
    {
        "no": 128,
        "a": "Saya ingin agar teman-teman saya membantu saya bila saya mengalami kesulitan.",
        "b": "Saya suka memperlakukan orang lain dengan ramah dan simpatik.",
        "skalaA": "suc",
        "skalaB": "nur"
    },
    {
        "no": 129,
        "a": "Saya ingin menjadi salah seorang pemimpin dalam organisasi-organisasi kelompok yang saya masuki.",
        "b": "Saya suka menunjukkan simpati saya kepada teman-teman saya bila mereka mendapat cedera atau sakit.",
        "skalaA": "dom",
        "skalaB": "nur"
    },
    {
        "no": 130,
        "a": "Saya merasa bahwa pilu hati dan kesusahan yang telah saya alami, lebih banyak membawa kebaikan daripada kerugian bagi saya.",
        "b": "Saya suka berlaku ramah tehadap teman-teman saya.",
        "skalaA": "aba",
        "skalaB": "nur"
    },
    {
        "no": 131,
        "a": "Saya lebih suka mengerjakan sesuatu bersama-sama dengan teman-teman saya daripada sendirian.",
        "b": "Saya suka bereksperimen dalam mencoba hal-hal yang baru.",
        "skalaA": "aff",
        "skalaB": "chg"
    },
    {
        "no": 132,
        "a": "Saya suka merenungkan kepribadian teman-teman saya dan mencoba mengerti apa yang menyebabkan mereka mempunyai kepribadian yang demikian.",
        "b": "Saya suka mencoba pekerjaan yang baru dan berbeda-beda, daripada melakukan pekerjaan yang sama dan terus menerus.",
        "skalaA": "int",
        "skalaB": "chg"
    },
    {
        "no": 133,
        "a": "Saya ingin agar teman-teman saya menunjukkan simpati dan pengertian bila saya mengalami kesukaran-kesukaran.",
        "b": "Saya suka bertemu dengan orang-orang baru.",
        "skalaA": "suc",
        "skalaB": "chg"
    },
    {
        "no": 134,
        "a": "Saya suka memperdebatkan pendirian saya bila diserang oleh orang-orang lain.",
        "b": "Saya ingin mengalami pembaharuan dan perubahan dalam kehidupan saya sehari hari.",
        "skalaA": "dom",
        "skalaB": "chg"
    },
    {
        "no": 135,
        "a": "Saya lebih suka mengalah dan menghindarkan perkelahian daripada memaksakan kemauan saya.",
        "b": "Saya suka berkeliling di pedalaman dan tinggal di berbagai tempat.",
        "skalaA": "aba",
        "skalaB": "chg"
    },
    {
        "no": 136,
        "a": "Saya suka melakukan sesuatu untuk teman-teman saya.",
        "b": "Bila saya harus melakukan suatu tugas, saya ingin mengerjakannya sampai selesai.",
        "skalaA": "aff",
        "skalaB": "end"
    },
    {
        "no": 137,
        "a": "Saya suka menganalisa perasaan-perasaan orang lain dan sebab-sebab mengapa mereka melakukan sesuatu.",
        "b": "Saya ingin menghindarkan gangguan bila saya sedang bekerja.",
        "skalaA": "int",
        "skalaB": "end"
    },
    {
        "no": 138,
        "a": "Saya suka memberi pertolongan-pertolongan kecil kepada teman-teman saya.",
        "b": "Saya suka bekerja sampai jauh malam untuk menyelesaikan suatu pekerjaan.",
        "skalaA": "suc",
        "skalaB": "end"
    },
    {
        "no": 139,
        "a": "Saya ingin dianggap sebagai pemimpin oleh orang-orang lain.",
        "b": "Saya ingin bekerja berjam-jam tanpa diganggu.",
        "skalaA": "dom",
        "skalaB": "end"
    },
    {
        "no": 140,
        "a": "Apabila saya melakukan sesuatu hal yang salah, saya merasa bahwa untuk itu saya harus dihukum.",
        "b": "Saya suka bertahan menghadapi suatu pekerjaan atau masalah, sekalipun tampaknya seolah-olah saya tak akan berhasil.",
        "skalaA": "aba",
        "skalaB": "end"
    },
    {
        "no": 141,
        "a": "Saya ingin loyal terhadap teman-teman saya.",
        "b": "Saya suka bepergian dengan lawan jenis saya yang menarik (bagi laki-laki dengan wanita;bagi wanita dengan laki-laki).",
        "skalaA": "aff",
        "skalaB": "het"
    },
    {
        "no": 142,
        "a": "Saya suka meramalkan bagaimana teman-teman saya akan bertindak dalam berbagai situasi.",
        "b": "Saya suka ikut serta dalam diskusi-diskusi tentang seks dan aktifitas seksuil.",
        "skalaA": "int",
        "skalaB": "het"
    },
    {
        "no": 143,
        "a": "Saya ingin teman teman saya menunjukkan rasa sayang mereka terhadap saya.",
        "b": "Saya suka nafsu saya terangsang.",
        "skalaA": "suc",
        "skalaB": "het"
    },
    {
        "no": 144,
        "a": "Bila saya berada dalam suatu kelompok, saya ingin menentukan apa yang akan kami kerjakan.",
        "b": "Saya suka ikut dalam aktivitas-aktivitas sosial bersama-sama dengan orang-orang dari lawan jenis saya.",
        "skalaA": "dom",
        "skalaB": "het"
    },
    {
        "no": 145,
        "a": "Saya merasa sedih akan ketidakmampuan saya untuk menghadapi berbagai macam keadaan.",
        "b": "Saya suka membaca buku-buku dan sandiwara, terutama yang berkisar sekitar masalah seks.",
        "skalaA": "aba",
        "skalaB": "het"
    },
    {
        "no": 146,
        "a": "Saya suka berkirim surat kepada teman-teman saya.",
        "b": "Saya suka membaca berita-berita surat kabar tentang pembunuhan-pembunuhan dan lain-lain perbuatan kekerasan.",
        "skalaA": "aff",
        "skalaB": "agg"
    },
    {
        "no": 147,
        "a": "Saya suka meramalkan bagimana teman-teman saya akan bertindak dalam berbagai situasi.",
        "b": "Saya suka menyerang pendirian-pendirian yang bertentangan dengan pendirian saya.",
        "skalaA": "int",
        "skalaB": "agg"
    },
    {
        "no": 148,
        "a": "Saya ingin agar teman-teman saya meributkan tentang diri saya, apabila mendapatkan cedera atau sakit.",
        "b": "Saya rasanya ingin menyalahkan orang lain bila keadaannya kurang menguntungkan saya.",
        "skalaA": "suc",
        "skalaB": "agg"
    },
    {
        "no": 149,
        "a": "Saya suka menyatakan kepada orang lain bagaimana mereka harus melakukan pekerjaan mereka.",
        "b": "Rasa rasanya ingin membalas dendam bila seseorang menghina saya.",
        "skalaA": "dom",
        "skalaB": "agg"
    },
    {
        "no": 150,
        "a": "Saya merasa bahwa dalam banyak hal, saya kalah bila dibandingkan dengan orang-orang lain.",
        "b": "Saya rasanya ingin menghardik orang lain bila saya berbeda pendapat dengan mereka.",
        "skalaA": "aba",
        "skalaB": "agg"
    },
    {
        "no": 151,
        "a": "Saya suka menolong teman-teman saya, apabila mereka dalam kesulitan.",
        "b": "Saya suka melakukan pekerjaan apa saja sebaik mungkin.",
        "skalaA": "nur",
        "skalaB": "ach"
    },
    {
        "no": 152,
        "a": "Saya suka bepergian melihat-lihat daerah pedalaman.",
        "b": "Saya suka menyelesaikan tugas-tugas yang dianggap orang lain sebagai tugas yang membutuhkan keterampilan dan usaha.",
        "skalaA": "chg",
        "skalaB": "ach"
    },
    {
        "no": 153,
        "a": "Saya suka bekerja keras pada tiap pekerjaan yang saya hadapi.",
        "b": "Saya ingin menyelesaikan sesuatu yang sangat penting artinya.",
        "skalaA": "end",
        "skalaB": "ach"
    },
    {
        "no": 154,
        "a": "Saya suka bepergian dengan lawan jenis saya yang menarik (bagi laki-laki dengan wanita;bagi wanita dengan laki-laki).",
        "b": "Saya ingin berhasil dalam apa yang saya lakukan.",
        "skalaA": "het",
        "skalaB": "ach"
    },
    {
        "no": 155,
        "a": "Sayas suka membaca berita-berita surat kabar tentang pembunuhan-pembunuhan dan lain-lain perbuatan kekerasan.",
        "b": "Saya ingin menulis roman atau sandiwara yang hebat.",
        "skalaA": "agg",
        "skalaB": "ach"
    },
    {
        "no": 156,
        "a": "Saya suka memberi pertolongan-pertolongan kecil kepada teman-teman saya.",
        "b": "Dalam merencanakan sesuatu, saya ingin mendapat saran-saran dari orang-orang yang pendapatnya saya hormati.",
        "skalaA": "nur",
        "skalaB": "def"
    },
    {
        "no": 157,
        "a": "Saya ingin mengalami pembaharuan dan perubahan dalam kehidupan saya sehari-hari.",
        "b": "Saya suka menyatakan kepada atasan saya bahwa mereka telah melakukan sesuatu pekerjaan yang baik, apabila menurut pendapat saya memang demikian adanya.",
        "skalaA": "chg",
        "skalaB": "def"
    },
    {
        "no": 158,
        "a": "Saya suka bekerja sampai jauh malam untuk menyelesaikan suatu pekerjaan.",
        "b": "Saya suka memuji orang yang saya kagumi.",
        "skalaA": "end",
        "skalaB": "def"
    },
    {
        "no": 159,
        "a": "Saya suka nafsu saya terangsang.",
        "b": "Saya suka menerima pimpinan dari orang-orang yang saya kagumi.",
        "skalaA": "het",
        "skalaB": "def"
    },
    {
        "no": 160,
        "a": "Rasa rasanya ingin membalas dendam bila seseorang menghina saya.",
        "b": "Apabila saya berada dalam kelompok saya suka menerima pimpinan orang lain dalam memutuskan apa yang akan dilakukan oleh kelompok tersebut.",
        "skalaA": "agg",
        "skalaB": "def"
    },
    {
        "no": 161,
        "a": "Saya suka bermurah hati terhadap teman-teman saya.",
        "b": "Saya suka membuat rencana sebelum memulai pekerjaan yang sulit.",
        "skalaA": "nur",
        "skalaB": "ord"
    },
    {
        "no": 162,
        "a": "Saya suka bertemu dengan orang-orang baru.",
        "b": "Saya menghendaki bahwa setiap pekerjaan tulis saya teliti, rapi dan tersusun dengan baik.",
        "skalaA": "chg",
        "skalaB": "ord"
    },
    {
        "no": 163,
        "a": "Saya suka menyelesaikan setiap pekerjaan atau tugas yang telah saya mulai.",
        "b": "Saya ingin barang-barang saya tersusun rapi dan teratur di atas meja atau di dalam ruang kerja saya.",
        "skalaA": "end",
        "skalaB": "ord"
    },
    {
        "no": 164,
        "a": "Saya ingin dianggap punya daya tarik fisik oleh orang-orang dari lawan jenis saya.",
        "b": "Saya suka merencanakan dan mengatur detail-detail dari setiap pekerjaan yang harus saya lakukan.",
        "skalaA": "het",
        "skalaB": "ord"
    },
    {
        "no": 165,
        "a": "Saya suka mengatakan kepada orang-orang lain bagaimana pendapat saya mengenai mereka.",
        "b": "Saya suka makan saya teratur dan ada waktu-waktu tertentu untuk makan.",
        "skalaA": "agg",
        "skalaB": "ord"
    },
    {
        "no": 166,
        "a": "Saya suka berlaku ramah tehadap teman-teman saya.",
        "b": "Saya suka mengatakan hal yang dianggap lucu dan cerdas oleh orang lain.",
        "skalaA": "nur",
        "skalaB": "exh"
    },
    {
        "no": 167,
        "a": "Saya suka mencoba pekerjaan yang baru dan berbeda-beda, daripada melakukan pekerjaan yang sama dan terus menerus.",
        "b": "Saya kadang-kadang suka melakukan hal-hal hanya untuk melihat bagaimana pengaruhnya terhadap orang lain.",
        "skalaA": "chg",
        "skalaB": "exh"
    },
    {
        "no": 168,
        "a": "Saya suka bertahan menghadapi suatu pekerjaan atau masalah, sekalipun tampaknya seolah-olah saya tak akan berhasil.",
        "b": "Saya ingin orang-orang memperhatikan dan memberikan komentar mengenai penampilan saya di depan umum.",
        "skalaA": "end",
        "skalaB": "exh"
    },
    {
        "no": 169,
        "a": "Saya suka membaca buku-buku dan sandiwara, terutama yang berkisar sekitar masalah seks.",
        "b": "Saya suka menjadi pusat perhatian, apabila saya ada di dalam suatu kelompok.",
        "skalaA": "het",
        "skalaB": "exh"
    },
    {
        "no": 170,
        "a": "Saya rasanya ingin menyalahkan orang lain bila keadaannya kurang menguntungkan saya.",
        "b": "Saya suka mengajukan pertanyaan-pertanyaan yang menurut saya tidak seorangpun akan dapat menjawabnya.",
        "skalaA": "agg",
        "skalaB": "exh"
    },
    {
        "no": 171,
        "a": "Saya suka menunjukkan simpati saya kepada teman-teman saya bila mereka mendapat cedera atau sakit.",
        "b": "Saya suka mengatakan pendapat saya tentang berbagai hal.",
        "skalaA": "nur",
        "skalaB": "aut"
    },
    {
        "no": 172,
        "a": "Saya suka makan di restoran-restoran yang baru atau asing.",
        "b": "Saya suka melakukan hal-hal yang dianggap orang lain tidak sesuai dengan adat kebiasaan.",
        "skalaA": "chg",
        "skalaB": "aut"
    },
    {
        "no": 173,
        "a": "Saya ingin menyelesaikan pekerjaan satu persatu sebelum memulai yang lain.",
        "b": "Saya ingin merasa bebas untuk melakukan apa yang saya kehendaki.",
        "skalaA": "end",
        "skalaB": "aut"
    },
    {
        "no": 174,
        "a": "Saya suka ikut serta dalam diskusi-diskusi tentang seks dan aktifitas seksuil.",
        "b": "Saya ingin melakukan hal-hal dengan cara saya sendiri tanpa menghiraukan apa yang mungkin dipikirkan orang lain.",
        "skalaA": "het",
        "skalaB": "aut"
    },
    {
        "no": 175,
        "a": "Saya menjadi sedemikian marahnya, sehingga rasanya ingin melemparkan dan merusak barang-barang.",
        "b": "Saya suka mengelakkan tanggung jawab dan kewajiban-kewajiban.",
        "skalaA": "agg",
        "skalaB": "aut"
    },
    {
        "no": 176,
        "a": "Saya suka menolong teman-teman saya, apabila mereka dalam kesulitan.",
        "b": "Saya ingin loyal terhadap teman-teman saya.",
        "skalaA": "nur",
        "skalaB": "aff"
    },
    {
        "no": 177,
        "a": "Saya suka mengerjakan hal-hal yang baru dan berbeda-beda.",
        "b": "Saya suka membuat teman teman baru.",
        "skalaA": "chg",
        "skalaB": "aff"
    },
    {
        "no": 178,
        "a": "Bila saya harus melakukan suatu tugas, saya ingin mengerjakannya sampai selesai.",
        "b": "Saya suka bergaul dalam kelompok yang para anggotanya akrab dan bersahabat satu sama lainnya.",
        "skalaA": "end",
        "skalaB": "aff"
    },
    {
        "no": 179,
        "a": "Saya suka bepergian dengan lawan jenis saya yang menarik (bagi laki-laki dengan wanita;bagi wanita dengan laki-laki).",
        "b": "Saya ingin membuat teman sebanyak mungkin.",
        "skalaA": "het",
        "skalaB": "aff"
    },
    {
        "no": 180,
        "a": "Saya suka menyerang pendirian-pendirian yang bertentangan dengan pendirian saya.",
        "b": "Saya suka berkirim surat pada teman-teman saya.",
        "skalaA": "agg",
        "skalaB": "aff"
    },
    {
        "no": 181,
        "a": "Saya suka bermurah hati terhadap teman teman saya.",
        "b": "Saya suka mengamat-amati bagaimana perasaan orang lain dalam satu keadaan tertentu.",
        "skalaA": "nur",
        "skalaB": "int"
    },
    {
        "no": 182,
        "a": "Saya suka makan di restoran-restoran yang baru atau asing.",
        "b": "Saya suka untuk menempatkan diri saya ditempat orang lain, dan membayangkan bagaimana perasaan saya apabila saya dalam keadaan atau situasi yang sama.",
        "skalaA": "chg",
        "skalaB": "int"
    },
    {
        "no": 183,
        "a": "Saya suka bekerja sampai jauh malam untuk menyelesaikan suatu pekerjaan.",
        "b": "Saya ingin memahami bagaimana perasaan teman-teman saya dalam menghadapi berbagai masalah.",
        "skalaA": "end",
        "skalaB": "int"
    },
    {
        "no": 184,
        "a": "Saya suka nafsu saya terangsang.",
        "b": "Saya suka mempelajari dan menganalisa tingkah laku orang-orang lain.",
        "skalaA": "het",
        "skalaB": "int"
    },
    {
        "no": 185,
        "a": "Saya rasanya ingin memperolok-olok orang-orang yang melakukan hal-hal yang saya anggap bodoh.",
        "b": "Saya suka meramalkan bagimana teman-teman saya akan bertindak dalam berbagai situasi.",
        "skalaA": "agg",
        "skalaB": "int"
    },
    {
        "no": 186,
        "a": "Saya suka memaafkan teman-teman saya yang menyakiti hati saya.",
        "b": "Saya ingin teman-teman saya memberi dorongan-dorongan kepada saya bila saya menghadapi kegagalan.",
        "skalaA": "nur",
        "skalaB": "suc"
    },
    {
        "no": 187,
        "a": "Saya suka bereksperimen dalam mencoba hal-hal yang baru.",
        "b": "Saya ingin agar teman-teman saya menunjukkan simpati dan pengertian bila saya mengalami kesukaran-kesukaran.",
        "skalaA": "chg",
        "skalaB": "suc"
    },
    {
        "no": 188,
        "a": "Saya suka mengerjakan teka-teki atau memecahkan persoalan-persoalan sampai selesai.",
        "b": "Saya ingin diperlakukan dengan ramah oleh teman-teman saya.",
        "skalaA": "end",
        "skalaB": "suc"
    },
    {
        "no": 189,
        "a": "Saya ingin dianggap punya daya tarik fisik oleh orang-orang dari lawan jenis saya.",
        "b": "Saya ingin teman-teman saya banyak menujukkan rasa sayang mereka terhadap saya.",
        "skalaA": "het",
        "skalaB": "suc"
    },
    {
        "no": 190,
        "a": "Saya rasanya ingin mengecam seseorang di muka umum bila orang itu patut menerimanya.",
        "b": "Saya ingin agar teman-teman saya meributkan tentang diri saya, apabila mendapatkan cedera atau sakit.",
        "skalaA": "agg",
        "skalaB": "suc"
    },
    {
        "no": 191,
        "a": "Saya suka berlaku ramah tehadap teman-teman saya.",
        "b": "Saya ingin dianggap sebagai pemimpin oleh orang-orang lain.",
        "skalaA": "nur",
        "skalaB": "dom"
    },
    {
        "no": 192,
        "a": "Saya lebih suka mencoba pekerjaan-pekerjaan yang baru dan lain daripada terus menerus melakukan pekerjaan yang sama.",
        "b": "Apabila saya bekerja dalam suatu panitia, saya ingin ditunjuk atau dipilih sebagai ketuanya.",
        "skalaA": "chg",
        "skalaB": "dom"
    },
    {
        "no": 193,
        "a": "Saya suka menyelesaikan setiap pekerjaan atau tugas yang telah saya mulai.",
        "b": "Saya ingin dapat membujuk dan mempengaruhi orang lain untuk melakukan apa yang saya kehendaki.",
        "skalaA": "end",
        "skalaB": "dom"
    },
    {
        "no": 194,
        "a": "Saya suka ikut serta dalam diskusi-diskusi tentang seks dan aktifitas seksuil.",
        "b": "Saya senang untuk diminta menyelesaikan pertentangan-pertentangan atau perselisihan-perselisihan.",
        "skalaA": "het",
        "skalaB": "dom"
    },
    {
        "no": 195,
        "a": "Saya menjadi sedemikian marahnya, sehingga rasanya ingin melemparkan dan merusak barang-barang.",
        "b": "Saya suka menyatakan kepada orang lain bagaimana mereka harus melakukan pekerjaan mereka.",
        "skalaA": "agg",
        "skalaB": "dom"
    },
    {
        "no": 196,
        "a": "Saya suka berlaku sangat ramah terhadap teman teman saya.",
        "b": "Bila keadaan kurang menguntungkan bagi saya, maka saya merasa bahwa saya harus lebih disalahkan daripada orang lain.",
        "skalaA": "nur",
        "skalaB": "aba"
    },
    {
        "no": 197,
        "a": "Saya suka berkeliling di pedalaman dan tinggal di berbagai tempat.",
        "b": "Apabila saya melakukan sesuatu hal yang salah, saya merasa bahwa untuk itu saya harus dihukum.",
        "skalaA": "chg",
        "skalaB": "aba"
    },
    {
        "no": 198,
        "a": "Saya suka bertahan menghadapi suatu pekerjaan atau masalah, sekalipun tampaknya seolah-olah saya tak akan berhasil.",
        "b": "Saya merasa bahwa pilu hati dan kesusahan yang telah saya alami, lebih banyak membawa kebaikan daripada kerugian bagi saya.",
        "skalaA": "end",
        "skalaB": "aba"
    },
    {
        "no": 199,
        "a": "Saya suka membaca buku-buku dan sandiwara, terutama yang berkisar sekitar masalah seks.",
        "b": "Saya merasa bahwa saya harus mengakui hal-hal yang telah saya lakukan dan saya anggap salah.",
        "skalaA": "het",
        "skalaB": "aba"
    },
    {
        "no": 200,
        "a": "Saya rasanya ingin menyalahkan orang lain bila keadaannya kurang menguntungkan saya.",
        "b": "Saya merasa bahwa dalam banyak hal, saya kalah bila dibandingkan dengan orang-orang lain.",
        "skalaA": "agg",
        "skalaB": "aba"
    },
    {
        "no": 201,
        "a": "Saya suka melakukan pekerjaan apa saja terbaik mungkin.",
        "b": "Saya suka menolong orang-orang lain, yang tidak begitu beruntung apabila dibandingkan dengan keadaan saya.",
        "skalaA": "ach",
        "skalaB": "nur"
    },
    {
        "no": 202,
        "a": "Saya suka mengerjakan hal-hal yang baru dan berbeda-beda.",
        "b": "Saya suka memperlakukan orang lain dengan ramah dan simpatik.",
        "skalaA": "chg",
        "skalaB": "nur"
    },
    {
        "no": 203,
        "a": "Bila saya harus melakukan suatu tugas, saya ingin mengerjakannya sampai selesai.",
        "b": "Saya suka menolong orang-orang lain, yang tidak begitu beruntung apabila dibandingkan dengan keadaan saya.",
        "skalaA": "end",
        "skalaB": "nur"
    },
    {
        "no": 204,
        "a": "Saya suka ikut dalam aktivitas-aktivitas sosial bersama-sama dengan orang-orang dari lawan jenis saya.",
        "b": "Saya suka memaafkan teman-teman saya yang menyakiti hati saya.",
        "skalaA": "het",
        "skalaB": "nur"
    },
    {
        "no": 205,
        "a": "Saya suka menyerang pendirian-pendirian yang bertentangan dengan pendirian saya.",
        "b": "Saya ingin teman-teman saya mempercayai saya dan menceritakan kesulitan-kesulitan mereka kepada saya.",
        "skalaA": "agg",
        "skalaB": "nur"
    },
    {
        "no": 206,
        "a": "Saya suka memperlakukan orang lain dengan ramah dan simpatik.",
        "b": "Saya suka bepergian melihat-lihat daerah pedalaman.",
        "skalaA": "nur",
        "skalaB": "chg"
    },
    {
        "no": 207,
        "a": "Saya suka mengikuti adat-istiadat dan menghindarkan melakukan hal-hal yang mungkin dianggap tidak wajar oleh orang-orang yang saya hormati.",
        "b": "Saya suka mengikuti mode baru.",
        "skalaA": "def",
        "skalaB": "chg"
    },
    {
        "no": 208,
        "a": "Saya suka bekerja keras pada tiap pekerjaan yang saya hadapi.",
        "b": "Saya ingin mengalami pembaharuan dan perubahan dalam kehidupan saya sehari-hari.",
        "skalaA": "end",
        "skalaB": "chg"
    },
    {
        "no": 209,
        "a": "Saya mempunyai keinginan untuk mencium orang yang menarik dari lawan jenis saya.",
        "b": "Saya suka bereksperimen dalam mencoba hal-hal yang baru.",
        "skalaA": "het",
        "skalaB": "chg"
    },
    {
        "no": 210,
        "a": "Saya rasanya ingin menghardik orang lain bila saya berbeda pendapat dengan mereka.",
        "b": "Saya suka mengikuti mode-mode baru.",
        "skalaA": "agg",
        "skalaB": "chg"
    },
    {
        "no": 211,
        "a": "Saya suka menolong orang-orang lain, yang tidak begitu beruntung apabila dibandingkan dengan keadaan saya.",
        "b": "Saya suka menyelesaikan setiap pekerjaan atau tugas yang telah saya mulai.",
        "skalaA": "nur",
        "skalaB": "end"
    },
    {
        "no": 212,
        "a": "Saya suka berkeliling di pedalaman dan tinggal di berbagai tempat.",
        "b": "Saya ingin bekerja berjam-jam tanpa diganggu.",
        "skalaA": "chg",
        "skalaB": "end"
    },
    {
        "no": 213,
        "a": "Jika saya akan bepergian, saya senang apabila segala sesuatunya telah direncanakan sebelumnya.",
        "b": "Saya suka mengerjakan teka-teki dan memcahkan persoalan-persoalan sampai selesai.",
        "skalaA": "ord",
        "skalaB": "end"
    },
    {
        "no": 214,
        "a": "Saya mudah jatuh cinta pada seseorang dari lawan jenis saya.",
        "b": "Saya ingin menyelesaikan pekerjaan satu persatu sebelum memulai yang lain.",
        "skalaA": "het",
        "skalaB": "end"
    },
    {
        "no": 215,
        "a": "Saya suka mengatakan kepada orang-orang lain bagimana pendapat saya mengenai mereka.",
        "b": "Saya ingin menghindarkan diganggu bila saya sedang bekerja.",
        "skalaA": "agg",
        "skalaB": "end"
    },
    {
        "no": 216,
        "a": "Saya suka memberi pertolongan-pertolongan kecil kepada teman-teman saya.",
        "b": "Saya suka ikut dalam aktivitas-aktivitas sosial bersama-sama dengan orang-orang dari lawan jenis saya.",
        "skalaA": "nur",
        "skalaB": "het"
    },
    {
        "no": 217,
        "a": "Saya suka bertemu dengan orang-orang baru.",
        "b": "Saya mempunyai keinginan untuk mencium orang yang menarik dari lawan jenis saya.",
        "skalaA": "chg",
        "skalaB": "het"
    },
    {
        "no": 218,
        "a": "Saya ingin mengerjakan teka-teki atau memecahkan persoalan-persoalan sampai selesai.",
        "b": "Saya mudah jatuh cinta pada seseorang dari lawan jenis saya.",
        "skalaA": "end",
        "skalaB": "het"
    },
    {
        "no": 219,
        "a": "Saya suka berbicara tentang hal-hal yang telah saya capai.",
        "b": "Saya suka mendengarkan atau menceritakan lelucon-lelucon yang terutama berkisar soal seks.",
        "skalaA": "exh",
        "skalaB": "het"
    },
    {
        "no": 220,
        "a": "Saya rasanya ingin memperolok orang-orang yang melakukan hal-hal yang saya anggap bodoh.",
        "b": "Saya suka mendengarkan atau menceritakan lelucon-lelucon yang terutama berkisar soal seks.",
        "skalaA": "agg",
        "skalaB": "het"
    },
    {
        "no": 221,
        "a": "Saya ingin teman-teman saya mempercayai saya dan menceritakan kesulitan-kesulitan mereka kepada saya.",
        "b": "Sayas suka membaca berita-berita surat kabar tentang pembunuhan-pembunuhan dan lain-lain perbuatan kekerasan.",
        "skalaA": "nur",
        "skalaB": "agg"
    },
    {
        "no": 222,
        "a": "Saya suka mengikuti mode baru.",
        "b": "Saya rasanya ingin mengecam seseorang di muka umum bila orang itu patut menerimanya.",
        "skalaA": "chg",
        "skalaB": "agg"
    },
    {
        "no": 223,
        "a": "Saya ingin menghindarkan diganggu bila saya sedang bekerja.",
        "b": "Saya rasanya ingin menghardik orang lain bila saya berbeda pendapat dengan mereka.",
        "skalaA": "end",
        "skalaB": "agg"
    },
    {
        "no": 224,
        "a": "Saya suka mendengarkan atau menceritakan lelucon-lelucon yang terutama berkisar soal seks.",
        "b": "Rasa rasanya ingin membalas dendam bila seseorang menghina saya.",
        "skalaA": "het",
        "skalaB": "agg"
    },
    {
        "no": 225,
        "a": "Saya suka mengelakkan tanggung jawab dan kewajiban-kewajiban.",
        "b": "Saya rasanya ingin memperolok-olok orang-orang yang melakukan hal-hal yang saya anggap bodoh.",
        "skalaA": "aut",
        "skalaB": "agg"
    }
];

if (typeof window !== 'undefined') {
    window.EPPS_CONFIG = EPPS_CONFIG;
    window.EPPS_QUESTIONS = EPPS_QUESTIONS;
}
