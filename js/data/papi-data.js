// ====================================================================
// MODUL DATA PAPI KOSTICK (PETUNJUK, CONTOH SOAL, & 90 SOAL)
// Format aman tanpa label aspek untuk mencegah kecurangan via F12
// Isi 90 soal disalin dari buku soal PAPI (SOAL_PAPI_FULL.pdf)
// ====================================================================

// 1. PETUNJUK RESMI PENGERJAAN
window.PAPI_INSTRUCTIONS = {
  judul: "Tes Kepribadian PAPI Kostick",
  deskripsi: [
    "Pada tes ini terdapat 90 pasang pernyataan.",
    "Anda diminta untuk memilih SATU pernyataan dari setiap pasangan yang paling mendekati gambaran diri Anda, atau yang paling mendekati gambaran perasaan Anda.",
    "Terkadang Anda merasa kedua pernyataan sama-sama cocok, atau sebaliknya kedua pernyataan sama-sama tidak sesuai dengan diri Anda. Meskipun demikian, Anda TETAP HARUS MEMILIH SATU di antara keduanya yang paling mendekati diri Anda.",
    "Tidak ada jawaban yang 'Benar' atau 'Salah' dalam tes ini. Bekerjalah secepat yang Anda bisa, dengan jujur dan spontan, tetapi pastikan Anda memilih salah satu pernyataan dari setiap 90 pasangan pernyataan yang ada."
  ]
};

// 2. CONTOH SOAL LATIHAN SEBELUM MEMULAI TES
window.PAPI_EXAMPLES = [
  {
    no: 1,
    a: "Saya seorang pekerja keras.",
    b: "Saya tidak mudah dipengaruhi oleh kondisi emosi saya.",
    penjelasan_a: "Jika Anda memilih (A), berarti Anda merasa pernyataan 'Saya seorang pekerja keras' lebih mencerminkan diri Anda dibandingkan pernyataan B.",
    penjelasan_b: "Jika Anda memilih (B), berarti Anda merasa pernyataan 'Saya tidak mudah dipengaruhi oleh kondisi emosi saya' lebih mencerminkan diri Anda dibandingkan pernyataan A."
  },
  {
    no: 2,
    a: "Saya suka membantu orang mengambil keputusan.",
    b: "Saya ingin menjadi orang yang sangat berhasil.",
    penjelasan_a: "Jika Anda memilih (A), berarti Anda lebih menyukai peran membantu orang lain dalam memutuskan sesuatu.",
    penjelasan_b: "Jika Anda memilih (B), berarti dorongan terbesar Anda adalah menjadi orang yang sangat berhasil."
  }
];

// 3. BANK 90 SOAL UTAMA
window.PAPI_QUESTIONS = [
  { no: 1, a: "Saya seorang pekerja keras.", b: "Saya bukan seorang pemurung." },
  { no: 2, a: "Saya suka bekerja lebih baik dari yang lain.", b: "Saya suka menekuni pekerjaan yang saya lakukan sampai selesai." },
  { no: 3, a: "Saya suka menunjukkan orang bagaimana melakukan hal-hal.", b: "Saya ingin berbuat sebaik mungkin." },
  { no: 4, a: "Saya suka melakukan hal-hal yang lucu.", b: "Saya senang memberitahukan orang apa yang harus dikerjakan." },
  { no: 5, a: "Saya suka bergabung dalam kelompok.", b: "Saya suka jika diperhatikan oleh kelompok." },
  { no: 6, a: "Saya suka membuat teman pribadi yang dekat.", b: "Saya suka berteman dengan suatu kelompok." },
  { no: 7, a: "Saya cepat berubah jika saya rasa diperlukan.", b: "Saya berusaha membuat teman-teman pribadi yang dekat." },
  { no: 8, a: "Saya suka membalas jika saya disakiti.", b: "Saya suka melakukan hal-hal yang baru dan berbeda." },
  { no: 9, a: "Saya ingin agar atasan menyukai saya.", b: "Saya suka memberitahu orang jika mereka salah." },
  { no: 10, a: "Saya suka mengikuti petunjuk-petunjuk yang diberikan kepada saya.", b: "Saya suka menyenangkan atasan." },
  { no: 11, a: "Saya berusaha sangat keras.", b: "Saya seorang yang teratur. Saya menempatkan semua barang pada tempatnya." },
  { no: 12, a: "Saya dapat membuat orang melakukan apa yang saya inginkan.", b: "Saya tidak mudah marah." },
  { no: 13, a: "Saya suka memberitahu kepada kelompok apa yang harus mereka kerjakan.", b: "Saya selalu menekuni suatu pekerjaan sampai selesai." },
  { no: 14, a: "Saya ingin tampak menarik dan ceria.", b: "Saya ingin menjadi orang yang sangat berhasil." },
  { no: 15, a: "Saya ingin sesuai dan diterima dalam kelompok.", b: "Saya suka membantu orang mengambil keputusan." },
  { no: 16, a: "Saya cemas bila seseorang tidak menyukai saya.", b: "Saya suka orang memperhatikan saya." },
  { no: 17, a: "Saya suka mencoba hal-hal yang baru.", b: "Saya lebih suka bekerja bersama orang lain daripada sendiri." },
  { no: 18, a: "Saya kadang-kadang menyalahkan orang lain jika terjadi kesalahan.", b: "Saya merasa terganggu jika ada yang tidak menyukai saya." },
  { no: 19, a: "Saya suka menyenangkan atasan.", b: "Saya suka mencoba pekerjaan-pekerjaan yang baru dan berbeda." },
  { no: 20, a: "Saya menyukai petunjuk-petunjuk terperinci dalam menyelesaikan pekerjaan.", b: "Bila saya terganggu oleh siapapun, saya akan memberitahukannya." },
  { no: 21, a: "Saya selalu berusaha keras.", b: "Saya suka melaksanakan setiap langkah dengan hati-hati." },
  { no: 22, a: "Saya akan menjadi seorang pemimpin yang baik.", b: "Saya dapat mengorganisir suatu pekerjaan dengan baik." },
  { no: 23, a: "Saya mudah tersinggung.", b: "Saya lambat dalam membuat keputusan." },
  { no: 24, a: "Saya suka mengerjakan beberapa pekerjaan sekaligus.", b: "Bila saya berada dalam satu kelompok, saya suka berdiam diri." },
  { no: 25, a: "Saya sangat suka bila saya diundang.", b: "Saya ingin lebih baik dari yang lain dalam mengerjakan sesuatu." },
  { no: 26, a: "Saya suka membuat teman-teman pribadi yang dekat.", b: "Saya suka menasehati orang lain." },
  { no: 27, a: "Saya suka melakukan hal-hal yang baru dan berbeda.", b: "Saya suka menceritakan bagaimana saya berhasil melakukan sesuatu." },
  { no: 28, a: "Bila saya betul, saya suka mempertahankannya.", b: "Saya ingin diterima dan diakui dalam suatu kelompok." },
  { no: 29, a: "Saya menghindar menjadi seorang yang berbeda.", b: "Saya berusaha menjadi sangat dekat dengan orang." },
  { no: 30, a: "Saya senang diberitahu bagaimana melakukan sesuatu pekerjaan.", b: "Saya mudah bosan." },
  { no: 31, a: "Saya bekerja keras.", b: "Saya banyak berpikir dan merencana." },
  { no: 32, a: "Saya memimpin kelompok.", b: "Detail (hal-hal kecil) menarik bagi saya." },
  { no: 33, a: "Saya dapat mengambil keputusan secara mudah dan tepat.", b: "Saya menyimpan barang-barang saya secara rapih dan teratur." },
  { no: 34, a: "Saya cepat dalam melaksanakan suatu pekerjaan.", b: "Saya tidak sering marah atau sedih." },
  { no: 35, a: "Saya ingin menjadi bagian dari kelompok.", b: "Saya hanya ingin melakukan satu pekerjaan pada suatu saat." },
  { no: 36, a: "Saya berusaha membuat teman dekat.", b: "Saya berusaha keras menjadi yang terbaik." },
  { no: 37, a: "Saya suka mode terbaru untuk pakaian dan mobil.", b: "Saya suka bertanggungjawab bagi orang lain." },
  { no: 38, a: "Saya menyukai perdebatan.", b: "Saya suka mendapat perhatian." },
  { no: 39, a: "Saya suka menyenangkan atasan.", b: "Saya tertarik menjadi bagian dari kelompok." },
  { no: 40, a: "Saya suka mengikuti peraturan dengan hati-hati.", b: "Saya suka orang mengenal saya dengan baik." },
  { no: 41, a: "Saya berusaha sangat keras.", b: "Saya mempunyai sifat bersahabat." },
  { no: 42, a: "Orang berpendapat saya seorang pemimpin yang baik.", b: "Saya berpikir panjang dan berhati-hati." },
  { no: 43, a: "Saya sering mengambil kesempatan.", b: "Saya senang mengurus hal-hal kecil." },
  { no: 44, a: "Orang berpendapat bahwa saya bekerja cepat.", b: "Orang berpendapat bahwa saya rapih dan teratur." },
  { no: 45, a: "Saya senang berolahraga.", b: "Saya mempunyai pribadi yang menyenangkan." },
  { no: 46, a: "Saya senang jika orang dekat dan bersahabat dengan saya.", b: "Saya selalu berusaha untuk menyelesaikan sesuatu yang telah saya mulai." },
  { no: 47, a: "Saya senang bereksperimen dan mencoba hal-hal baru.", b: "Saya suka melaksanakan suatu pekerjaan sulit dengan baik." },
  { no: 48, a: "Saya suka diperlakukan secara adil.", b: "Saya suka memberitahu orang lain bagaimana melaksanakan sesuatu." },
  { no: 49, a: "Saya suka melakukan apa yang diharapkan dari saya.", b: "Saya suka memperoleh perhatian." },
  { no: 50, a: "Saya suka petunjuk-petunjuk terperinci dalam melaksanakan suatu pekerjaan.", b: "Saya suka berada bersama orang-orang." },
  { no: 51, a: "Saya selalu berusaha menyelesaikan pekerjaan secara sempurna.", b: "Orang mengatakan bahwa saya tidak mengenal lelah." },
  { no: 52, a: "Saya tipe pemimpin.", b: "Saya mudah berteman." },
  { no: 53, a: "Saya mengambil spekulasi.", b: "Saya banyak sekali berpikir." },
  { no: 54, a: "Saya bekerja dengan kecepatan yang teratur.", b: "Saya senang bekerja dengan hal-hal kecil/terperinci." },
  { no: 55, a: "Saya mempunyai banyak tenaga untuk berolahraga.", b: "Saya suka mengatur dan menyimpan barang-barang secara rapih dan teratur." },
  { no: 56, a: "Saya dapat bergaul baik dengan semua orang.", b: "Saya seorang yang mudah marah." },
  { no: 57, a: "Saya ingin bertemu dengan orang-orang baru dan melakukan hal-hal yang baru.", b: "Saya selalu ingin menyelesaikan pekerjaan yang telah saya mulai." },
  { no: 58, a: "Saya biasanya mempertahankan pendapat yang saya yakini.", b: "Saya biasanya suka bekerja keras." },
  { no: 59, a: "Saya suka saran-saran dari orang-orang yang saya kagumi.", b: "Saya suka melayani orang-orang yang berwenang terhadap saya." },
  { no: 60, a: "Saya biarkan diri saya banyak dipengaruhi oleh orang lain.", b: "Saya suka jika mendapat banyak perhatian." },
  { no: 61, a: "Saya biasanya bekerja sangat keras.", b: "Saya biasanya bekerja cepat." },
  { no: 62, a: "Apabila saya bicara, kelompok mendengarkan.", b: "Saya terampil dengan perkakas (alat-alat)." },
  { no: 63, a: "Saya lambat dalam membuat teman.", b: "Saya lambat dalam mengambil keputusan." },
  { no: 64, a: "Saya biasanya makan secara cepat.", b: "Saya suka membaca." },
  { no: 65, a: "Saya suka pekerjaan dimana saya banyak bergerak.", b: "Saya suka pekerjaan yang harus dilaksanakan secara hati-hati." },
  { no: 66, a: "Saya membuat sebanyak mungkin teman.", b: "Saya menemukan kembali apa yang telah saya simpan." },
  { no: 67, a: "Saya merencanakan jauh-jauh sebelumnya.", b: "Saya selalu menyenangkan." },
  { no: 68, a: "Saya mempertahankan dengan bangga nama baik saya.", b: "Saya terus menekuni suatu masalah sampai selesai." },
  { no: 69, a: "Saya suka menyenangkan orang-orang yang saya kagumi.", b: "Saya ingin sukses." },
  { no: 70, a: "Saya suka orang lain yang membuat keputusan-keputusan untuk kelompok.", b: "Saya suka membuat keputusan-keputusan untuk kelompok." },
  { no: 71, a: "Saya selalu berusaha keras.", b: "Saya mengambil keputusan secara cepat dan mudah." },
  { no: 72, a: "Kelompok biasanya melakukan apa yang saya inginkan.", b: "Saya biasanya bekerja cepat." },
  { no: 73, a: "Saya sering merasa lelah.", b: "Saya lamban dalam mengambil keputusan." },
  { no: 74, a: "Saya bekerja cepat.", b: "Saya mudah berteman." },
  { no: 75, a: "Saya biasanya mempunyai gairah dan tenaga.", b: "Saya banyak menghabiskan waktu dengan berpikir." },
  { no: 76, a: "Saya sangat ramah terhadap orang.", b: "Saya suka pekerjaan yang memerlukan ketelitian." },
  { no: 77, a: "Saya banyak berpikir dan merencana.", b: "Saya menyimpan segala sesuatu pada tempatnya." },
  { no: 78, a: "Saya suka pekerjaan yang menuntut hal-hal yang terperinci.", b: "Saya tidak mudah marah." },
  { no: 79, a: "Saya suka menurut orang yang saya kagumi.", b: "Saya selalu menyelesaikan pekerjaan yang telah saya mulai." },
  { no: 80, a: "Saya suka petunjuk-petunjuk yang jelas.", b: "Saya suka bekerja keras." },
  { no: 81, a: "Saya mengejar apa yang saya inginkan.", b: "Saya seorang pemimpin yang baik." },
  { no: 82, a: "Saya dapat membuat orang lain bekerja keras.", b: "Saya seorang yang bertipe santai tapi beruntung." },
  { no: 83, a: "Saya mengambil keputusan secara cepat.", b: "Saya bicara dengan cepat." },
  { no: 84, a: "Saya biasanya bekerja cepat.", b: "Saya berolahraga secara teratur." },
  { no: 85, a: "Saya tidak suka bertemu orang.", b: "Saya cepat merasa lelah." },
  { no: 86, a: "Saya membuat banyak sekali teman.", b: "Saya banyak menghabiskan waktu dengan berpikir." },
  { no: 87, a: "Saya suka bekerja dengan teori.", b: "Saya suka bekerja dengan hal-hal yang terperinci." },
  { no: 88, a: "Saya suka bekerja dengan hal-hal yang terperinci.", b: "Saya suka mengorganisir pekerjaan saya." },
  { no: 89, a: "Saya menaruh barang pada tempatnya.", b: "Saya selalu menyenangkan." },
  { no: 90, a: "Saya suka diberitahu tentang apa yang saya perlu lakukan.", b: "Saya harus menyelesaikan apa yang saya mulai." }
];
