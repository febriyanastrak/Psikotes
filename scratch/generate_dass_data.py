import json

with open('scratch/dass_extracted.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

questions = data['questions']
norma = data['norma']

header = """// =========================================================================
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
"""

js_content = header + '\nconst DASS_QUESTIONS = ' + json.dumps(questions, ensure_ascii=False, indent=2) + ';\n\n'
js_content += 'const DASS_NORMA = ' + json.dumps(norma, ensure_ascii=False, indent=2) + ';\n\n'

footer = """if (typeof window !== 'undefined') {
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
"""
js_content += footer

with open('js/data/dass-data.js', 'w', encoding='utf-8') as f_out:
    f_out.write(js_content)

print('js/data/dass-data.js created successfully!')

