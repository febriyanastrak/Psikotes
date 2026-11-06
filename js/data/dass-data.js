// =========================================================================
// DATA SOAL & NORMA KLINIS DASS-21 - PT ALTRAK 1978
// Sumber: 'DASS-21 (1).xlsx' (Sheet 'DASS-21' & Sheet 'NORMA')
// Referensi: Lovibond, S.H. & Lovibond, P.F. (1995)
// =========================================================================

const DASS_SCALE_INFO = {
    title: "Depression Anxiety Stress Scales (DASS-21)",
    total_soal: 21,
    durasi_menit: 5,
    durasi_detik: 300,
    instruksi: "Silahkan baca setiap pernyataan dan pilih nilai 0-3 yang paling menandakan kondisi diri Anda dalam seminggu terakhir. Tidak ada jawaban benar atau salah.",
    referensi: "Lovibond, S.H. & Lovibond, P.F. (1995). Manual for the Depression Anxiety Stress Scales (2nd. Ed.). Sydney: Psychology Foundation."
};

const DASS_OPTIONS = [
    { value: 0, label: "Tidak pernah", sublabel: "0 hari / minggu", desc: "Tidak pernah atau tidak berlaku sama sekali pada diri saya." },
    { value: 1, label: "Kadang-kadang", sublabel: "1-2 hari / minggu", desc: "Berlaku sampai batas tertentu, atau kadang-kadang." },
    { value: 2, label: "Sering", sublabel: "3-5 hari / minggu", desc: "Berlaku untuk tingkat yang cukup besar, atau sering kali." },
    { value: 3, label: "Hampir selalu", sublabel: "6-7 hari / minggu", desc: "Sangat berlaku pada saya, atau sebagian besar waktu." }
];

const DASS_SUBSCALE_ITEMS = {
    D: [3, 5, 10, 13, 16, 17, 21], // Depresi (7 butir)
    A: [2, 4, 7, 9, 15, 19, 20],   // Kecemasan (7 butir)
    S: [1, 6, 8, 11, 12, 14, 18]   // Stres (7 butir)
};

const DASS_SEVERITY_RANGES = {
    D: [
        { level: 'NORMAL', min: 0, max: 4, label: 'Normal', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { level: 'MILD', min: 5, max: 6, label: 'Ringan (Mild)', color: '#f59e0b', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
        { level: 'MODERATE', min: 7, max: 10, label: 'Sedang (Moderate)', color: '#f97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
        { level: 'SEVERE', min: 11, max: 13, label: 'Berat (Severe)', color: '#ef4444', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
        { level: 'EXTREME', min: 14, max: 21, label: 'Sangat Berat (Extreme)', color: '#b91c1c', bg: 'bg-red-100 text-red-900 border-red-300' }
    ],
    A: [
        { level: 'NORMAL', min: 0, max: 3, label: 'Normal', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { level: 'MILD', min: 4, max: 5, label: 'Ringan (Mild)', color: '#f59e0b', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
        { level: 'MODERATE', min: 6, max: 7, label: 'Sedang (Moderate)', color: '#f97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
        { level: 'SEVERE', min: 8, max: 9, label: 'Berat (Severe)', color: '#ef4444', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
        { level: 'EXTREME', min: 10, max: 21, label: 'Sangat Berat (Extreme)', color: '#b91c1c', bg: 'bg-red-100 text-red-900 border-red-300' }
    ],
    S: [
        { level: 'NORMAL', min: 0, max: 7, label: 'Normal', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { level: 'MILD', min: 8, max: 9, label: 'Ringan (Mild)', color: '#f59e0b', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
        { level: 'MODERATE', min: 10, max: 12, label: 'Sedang (Moderate)', color: '#f97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
        { level: 'SEVERE', min: 13, max: 16, label: 'Berat (Severe)', color: '#ef4444', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
        { level: 'EXTREME', min: 17, max: 21, label: 'Sangat Berat (Extreme)', color: '#b91c1c', bg: 'bg-red-100 text-red-900 border-red-300' }
    ]
};

const DASS_QUESTIONS = [
  {
    "no": 1,
    "type": "S",
    "statement": "Saya merasa bahwa diri saya menjadi marah karena hal-hal sepele."
  },
  {
    "no": 2,
    "type": "A",
    "statement": "Saya merasa mulut saya sering kering."
  },
  {
    "no": 3,
    "type": "D",
    "statement": "Saya sama sekali tidak dapat merasakan perasaan positif."
  },
  {
    "no": 4,
    "type": "A",
    "statement": "Saya mengalami kesulitan bernafas (misalnya: sering kali terengah-engah atau tidak dapat bernafas padahal tidak melakukan aktivitas fisik sebelumnya)."
  },
  {
    "no": 5,
    "type": "D",
    "statement": "Saya sepertinya tidak kuat lagi untuk melakukan suatu kegiatan."
  },
  {
    "no": 6,
    "type": "S",
    "statement": "Saya cenderung bereaksi berlebihan terhadap suatu situasi."
  },
  {
    "no": 7,
    "type": "A",
    "statement": "Saya merasa gemetar (misalnya: pada tangan)."
  },
  {
    "no": 8,
    "type": "S",
    "statement": "Saya merasa telah menghabiskan banyak energi disaat merasa cemas."
  },
  {
    "no": 9,
    "type": "A",
    "statement": "Saya merasa khawatir dengan situasi dimana saya mungkin menjadi panik dan mempermalukan diri sendiri."
  },
  {
    "no": 10,
    "type": "D",
    "statement": "Saya merasa tidak ada hal yang dapat diharapkan di masa depan."
  },
  {
    "no": 11,
    "type": "S",
    "statement": "Saya sedang merasa gelisah."
  },
  {
    "no": 12,
    "type": "S",
    "statement": "Saya merasa sulit untuk bersantai"
  },
  {
    "no": 13,
    "type": "D",
    "statement": "Saya merasa sedih dan tertekan"
  },
  {
    "no": 14,
    "type": "S",
    "statement": "Saya sulit untuk sabar dalam menghadapi gangguan terhadap hal yang sedang saya lakukan."
  },
  {
    "no": 15,
    "type": "A",
    "statement": "Saya merasa saya hampir panik."
  },
  {
    "no": 16,
    "type": "D",
    "statement": "Saya tidak merasa antusias dalam hal apapun."
  },
  {
    "no": 17,
    "type": "D",
    "statement": "Saya merasa bahwa saya tidak berharga sebagai seorang manusia."
  },
  {
    "no": 18,
    "type": "S",
    "statement": "Saya merasa bahwa saya mudah tersinggung."
  },
  {
    "no": 19,
    "type": "A",
    "statement": "Saya menyadari perubahan detak jantung, walaupun tidak sehabis melakukan aktivitas fisik (misalnya: merasa detak jantung meningkat atau melemah)."
  },
  {
    "no": 20,
    "type": "A",
    "statement": "Saya merasa takut tanpa alasan yang jelas."
  },
  {
    "no": 21,
    "type": "D",
    "statement": "Saya merasa bahwa hidup tidak bermanfaat."
  }
];

const DASS_NORMA = {
  "D": {
    "0": {
      "type": "D- NORMAL",
      "desc": "Anda tidak memiliki gangguan depresi, pertahankan pola hidup sehat."
    },
    "1": {
      "type": "D- NORMAL",
      "desc": "Anda tidak memiliki gangguan depresi, pertahankan pola hidup sehat."
    },
    "2": {
      "type": "D- NORMAL",
      "desc": "Anda tidak memiliki gangguan depresi, pertahankan pola hidup sehat."
    },
    "3": {
      "type": "D- NORMAL",
      "desc": "Anda tidak memiliki gangguan depresi, pertahankan pola hidup sehat."
    },
    "4": {
      "type": "D- NORMAL",
      "desc": "Anda tidak memiliki gangguan depresi, pertahankan pola hidup sehat."
    },
    "5": {
      "type": "D- MILD",
      "desc": "Depresi adalah gangguan suasana hati. Anda menunjukkan gejala depresi, tetap menjalin komunikasi dengan seseorang yang dipercaya dan jika dirasa mengalami kesulitan tidur juga perubahan nafsu makan berkepanjangan segera mencari bantuan profesional (Psikolog/ Konselor)"
    },
    "6": {
      "type": "D- MILD",
      "desc": "Depresi adalah gangguan suasana hati. Anda menunjukkan gejala depresi, tetap menjalin komunikasi dengan seseorang yang dipercaya dan jika dirasa mengalami kesulitan tidur juga perubahan nafsu makan berkepanjangan segera mencari bantuan profesional (Psikolog/ Konselor)"
    },
    "7": {
      "type": "D- MODERATE",
      "desc": "Depresi adalah gangguan suasana hati. Anda menunjukkan gejala depresi, jika dirasa mengalami kesulitan tidur juga perubahan nafsu makan berkepanjangan segera mencari bantuan profesional (Psikolog/ Konselor)"
    },
    "8": {
      "type": "D- MODERATE",
      "desc": "Depresi adalah gangguan suasana hati. Anda menunjukkan gejala depresi, jika dirasa mengalami kesulitan tidur juga perubahan nafsu makan berkepanjangan segera mencari bantuan profesional (Psikolog/ Konselor)"
    },
    "9": {
      "type": "D- MODERATE",
      "desc": "Depresi adalah gangguan suasana hati. Anda menunjukkan gejala depresi, jika dirasa mengalami kesulitan tidur juga perubahan nafsu makan berkepanjangan segera mencari bantuan profesional (Psikolog/ Konselor)"
    },
    "10": {
      "type": "D- MODERATE",
      "desc": "Depresi adalah gangguan suasana hati. Anda menunjukkan gejala depresi, jika dirasa mengalami kesulitan tidur juga perubahan nafsu makan berkepanjangan segera mencari bantuan profesional (Psikolog/ Konselor)"
    },
    "11": {
      "type": "D- SEVERE",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi. Segera cari bantuan profesional dan ingat bahwa anda tidak sendiri"
    },
    "12": {
      "type": "D- SEVERE",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi. Segera cari bantuan profesional dan ingat bahwa anda tidak sendiri"
    },
    "13": {
      "type": "D- SEVERE",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi. Segera cari bantuan profesional dan ingat bahwa anda tidak sendiri"
    },
    "14": {
      "type": "D- EXTREME",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi yang berat. Segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "15": {
      "type": "D- EXTREME",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi yang berat. Segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "16": {
      "type": "D- EXTREME",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi yang berat. Segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "17": {
      "type": "D- EXTREME",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi yang berat. Segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "18": {
      "type": "D- EXTREME",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi yang berat. Segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "19": {
      "type": "D- EXTREME",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi yang berat. Segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "20": {
      "type": "D- EXTREME",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi yang berat. Segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "21": {
      "type": "D- EXTREME",
      "desc": "Depresi adalah gangguan suasana hati, anda menunjukkan gejala depresi yang berat. Segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    }
  },
  "A": {
    "0": {
      "type": "A- NORMAL",
      "desc": "Kondisi anda saat ini tidak sedang dalam kondisi cemas, tetap pertahankan pola pikir yang positif."
    },
    "1": {
      "type": "A- NORMAL",
      "desc": "Kondisi anda saat ini tidak sedang dalam kondisi cemas, tetap pertahankan pola pikir yang positif."
    },
    "2": {
      "type": "A- NORMAL",
      "desc": "Kondisi anda saat ini tidak sedang dalam kondisi cemas, tetap pertahankan pola pikir yang positif."
    },
    "3": {
      "type": "A- NORMAL",
      "desc": "Kondisi anda saat ini tidak sedang dalam kondisi cemas, tetap pertahankan pola pikir yang positif."
    },
    "4": {
      "type": "A- MILD",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menunjukkan gejala kecemasan, mulai melakukan aktivitas fisik yang dapat meringankan gejala cemas."
    },
    "5": {
      "type": "A- MILD",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menunjukkan gejala kecemasan, mulai melakukan aktivitas fisik yang dapat meringankan gejala cemas."
    },
    "6": {
      "type": "A- MODERATE",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menunjukkan gejala kecemasan, mulai melakukan aktivitas fisik yang dapat meringankan gejala cemas, seperti meditasi, latihan pernafasan, atau aktivitas lainnya."
    },
    "7": {
      "type": "A- MODERATE",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menunjukkan gejala kecemasan, mulai melakukan aktivitas fisik yang dapat meringankan gejala cemas, seperti meditasi, latihan pernafasan, atau aktivitas lainnya."
    },
    "8": {
      "type": "A- SEVERE",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "9": {
      "type": "A- SEVERE",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "10": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "11": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "12": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "13": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "14": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "15": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "16": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "17": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "18": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "19": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "20": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "21": {
      "type": "A- EXTREME",
      "desc": "Kecemasan merupakan kekhawatiran dalam diri seseorang yang sebabnya tidak jelas sehingga menimbulkan ketidakpastian dan perasaan tidak berdaya pada diri seseorang. Anda menununjukkan gejala kecemasan yang cukup tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    }
  },
  "S": {
    "0": {
      "type": "S- NORMAL",
      "desc": "Anda saat ini sedang tidak dalam kondisi stress, tetap pertahankan aktifitas dan pola pikir yang positif."
    },
    "1": {
      "type": "S- NORMAL",
      "desc": "Anda saat ini sedang tidak dalam kondisi stress, tetap pertahankan aktifitas dan pola pikir yang positif."
    },
    "2": {
      "type": "S- NORMAL",
      "desc": "Anda saat ini sedang tidak dalam kondisi stress, tetap pertahankan aktifitas dan pola pikir yang positif."
    },
    "3": {
      "type": "S- NORMAL",
      "desc": "Anda saat ini sedang tidak dalam kondisi stress, tetap pertahankan aktifitas dan pola pikir yang positif."
    },
    "4": {
      "type": "S- NORMAL",
      "desc": "Anda saat ini sedang tidak dalam kondisi stress, tetap pertahankan aktifitas dan pola pikir yang positif."
    },
    "5": {
      "type": "S- NORMAL",
      "desc": "Anda saat ini sedang tidak dalam kondisi stress, tetap pertahankan aktifitas dan pola pikir yang positif."
    },
    "6": {
      "type": "S- NORMAL",
      "desc": "Anda saat ini sedang tidak dalam kondisi stress, tetap pertahankan aktifitas dan pola pikir yang positif."
    },
    "7": {
      "type": "S- NORMAL",
      "desc": "Anda saat ini sedang tidak dalam kondisi stress, tetap pertahankan aktifitas dan pola pikir yang positif."
    },
    "8": {
      "type": "S- MILD",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini ada menunjukkan gejala stress, dapat dicoba mencari aktivitas lain yang mengurangi rasa stress."
    },
    "9": {
      "type": "S- MILD",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini ada menunjukkan gejala stress, dapat dicoba mencari aktivitas lain yang mengurangi rasa stress."
    },
    "10": {
      "type": "S- MODERATE",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress, mulai melakukan aktivitas fisik yang dapat meringankan gejala stress, seperti meditasi, latihan pernafasan, dan melakukan rekreasi."
    },
    "11": {
      "type": "S- MODERATE",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress, mulai melakukan aktivitas fisik yang dapat meringankan gejala stress, seperti meditasi, latihan pernafasan, dan melakukan rekreasi."
    },
    "12": {
      "type": "S- MODERATE",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress, mulai melakukan aktivitas fisik yang dapat meringankan gejala stress, seperti meditasi, latihan pernafasan, dan melakukan rekreasi."
    },
    "13": {
      "type": "S- SEVERE",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress yang cukup tinggi, mulai melakukan aktivitas fisik yang dapat meringankan gejala stress, seperti meditasi, latihan pernafasan, melakukan rekreasi, atau mencari orang terpercaya untuk berbagi cerita."
    },
    "14": {
      "type": "S- SEVERE",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress yang cukup tinggi, mulai melakukan aktivitas fisik yang dapat meringankan gejala stress, seperti meditasi, latihan pernafasan, melakukan rekreasi, atau mencari orang terpercaya untuk berbagi cerita."
    },
    "15": {
      "type": "S- SEVERE",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress yang cukup tinggi, mulai melakukan aktivitas fisik yang dapat meringankan gejala stress, seperti meditasi, latihan pernafasan, melakukan rekreasi, atau mencari orang terpercaya untuk berbagi cerita."
    },
    "16": {
      "type": "S- SEVERE",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress yang cukup tinggi, mulai melakukan aktivitas fisik yang dapat meringankan gejala stress, seperti meditasi, latihan pernafasan, melakukan rekreasi, atau mencari orang terpercaya untuk berbagi cerita."
    },
    "17": {
      "type": "S- EXTREME",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress yang tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "18": {
      "type": "S- EXTREME",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress yang tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "19": {
      "type": "S- EXTREME",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress yang tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "20": {
      "type": "S- EXTREME",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress yang tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    },
    "21": {
      "type": "S- EXTREME",
      "desc": "Stres adalah reaksi atau respon tubuh akibat stresor psikososial. Pada saat ini, stres digunakan untuk menjelaskan berbagai stimulus dengan intensitas berlebihan yang tidak disukai, berupa respon Fisik, perilaku, dan subjektif terhadap stress. Saat ini anda menunjukkan gejala stress yang tinggi, segera cari bantuan profesional (Psikolog/ Psikiater) dan ingat bahwa anda tidak sendiri."
    }
  }
};

if (typeof window !== 'undefined') {
    window.DASS_SCALE_INFO = DASS_SCALE_INFO;
    window.DASS_OPTIONS = DASS_OPTIONS;
    window.DASS_QUESTIONS = DASS_QUESTIONS;
    window.DASS_SUBSCALE_ITEMS = DASS_SUBSCALE_ITEMS;
    window.DASS_SEVERITY_RANGES = DASS_SEVERITY_RANGES;
    window.DASS_NORMA = DASS_NORMA;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DASS_SCALE_INFO,
        DASS_OPTIONS,
        DASS_QUESTIONS,
        DASS_SUBSCALE_ITEMS,
        DASS_SEVERITY_RANGES,
        DASS_NORMA
    };
}
