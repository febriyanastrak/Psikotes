import os, re, glob, json

print("="*60)
print("1. AUDIT ZERO CLIENT LEAK (ANSWER KEYS IN CLIENT JS)")
print("="*60)

candidate_files = [
    'js/apm.js', 'js/data/apm-data.js', 
    'js/cfit.js', 'js/data/cfit-data.js', 
    'js/ist-logic.js', 'js/data/ist-data.js'
]

for fpath in candidate_files:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
            found_keys = []
            for idx, line in enumerate(lines, 1):
                if re.search(r'\b(kunci|kunciJawaban|k1|k2|correctAnswer|answerKey)\b', line, re.IGNORECASE):
                    # Check if it is in an example context or main test
                    found_keys.append((idx, line.strip()))
            print(f"{fpath}: {len(found_keys)} references found.")
            for lno, text in found_keys[:5]:
                print(f"   Line {lno}: {text[:100]}")

print("\n" + "="*60)
print("2. HTML TAG INTEGRITY & SUSPICIOUS PATTERNS")
print("="*60)

html_files = ['index.html', 'hrd.html']
for hf in html_files:
    with open(hf, 'r', encoding='utf-8', errors='ignore') as f:
        txt = f.read()
        div_open = len(re.findall(r'<div\b', txt, re.IGNORECASE))
        div_close = len(re.findall(r'</div\b', txt, re.IGNORECASE))
        p_open = len(re.findall(r'<p\b', txt, re.IGNORECASE))
        p_close = len(re.findall(r'</p\b', txt, re.IGNORECASE))
        li_open = len(re.findall(r'<li\b', txt, re.IGNORECASE))
        li_close = len(re.findall(r'</li\b', txt, re.IGNORECASE))
        ul_open = len(re.findall(r'<ul\b', txt, re.IGNORECASE))
        ul_close = len(re.findall(r'</ul\b', txt, re.IGNORECASE))
        print(f"{hf}:")
        print(f"   <div>: {div_open} open, {div_close} close -> diff: {div_open - div_close}")
        print(f"   <p>:   {p_open} open, {p_close} close -> diff: {p_open - p_close}")
        print(f"   <ul>:  {ul_open} open, {ul_close} close -> diff: {ul_open - ul_close}")
        print(f"   <li>:  {li_open} open, {li_close} close -> diff: {li_open - li_close}")

print("\n" + "="*60)
print("3. TYPO & LANGUAGE AUDIT (BAKU VS NON-BAKU)")
print("="*60)

typo_targets = {
    r'\bnomer\b': 'nomor',
    r'\bdi isi\b': 'diisi',
    r'\bdi pilih\b': 'dipilih',
    r'\bdi selesaikan\b': 'diselesaikan',
    r'\bdi kerjakan\b': 'dikerjakan',
    r'\bmengambarkan\b': 'menggambarkan',
    r'\bmerubah\b': 'mengubah',
    r'\bresiko\b': 'risiko',
    r'\bpraktek\b': 'praktik',
    r'\banalisa\b': 'analisis',
    r'\bstandard\b': 'standar',
    r'\.li>': 'typo tag .li>',
    r'<tr>.*?</tr>(?=.*?</p>)': 'tr inside p'
}

all_src_files = glob.glob('js/**/*.js', recursive=True) + glob.glob('*.html')
typo_results = {}

for fpath in all_src_files:
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        for idx, line in enumerate(lines, 1):
            for pat, correction in typo_targets.items():
                m = re.findall(pat, line, re.IGNORECASE)
                if m:
                    if fpath not in typo_results:
                        typo_results[fpath] = []
                    typo_results[fpath].append((idx, pat, correction, line.strip()))

for fpath, items in typo_results.items():
    print(f"\n{fpath} ({len(items)} hits):")
    for lno, pat, corr, snippet in items[:8]:
        print(f"   Line {lno} [{pat} -> {corr}]: {snippet[:110]}")

print("\n" + "="*60)
print("4. AUDIT 11 MODUL FLOW & STATE RESUME")
print("="*60)

modules = [
    ('IST', 'modal-module-ist', 'startISTTest', 'ist-logic.js'),
    ('PAPI', 'modal-module-papi', 'startPapiTest', 'papi.js'),
    ('DISC', 'modal-module-disc', 'startDiscTest', 'disc.js'),
    ('EPPS', 'modal-module-epps', 'startEppsTest', 'epps.js'),
    ('Pauli', 'view-pauli-test', 'startPauliTest', 'pauli.js'),
    ('MSDT', 'view-msdt', 'bukaModulMSDT', 'msdt.js'),
    ('CFIT', 'view-cfit', 'bukaModulCFIT', 'cfit.js'),
    ('MBTI', 'view-mbti', 'bukaModulMBTI', 'mbti.js'),
    ('Grafis', 'view-grafis', 'bukaModulGrafis', 'grafis.js'),
    ('APM', 'modal-module-apm', 'startApmFromModal', 'apm.js'),
    ('DASS', 'modal-module-dass', 'startDassTest', 'dass.js'),
]

with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
    idx_content = f.read()

for mod_name, modal_id, start_fn, js_file in modules:
    has_modal_or_view = modal_id in idx_content
    js_path = os.path.join('js', js_file)
    has_js = os.path.exists(js_path)
    js_has_start = False
    if has_js:
        with open(js_path, 'r', encoding='utf-8', errors='ignore') as f:
            js_txt = f.read()
            js_has_start = (start_fn in js_txt) or (start_fn in idx_content)
    print(f"Modul {mod_name:8}: UI Container={has_modal_or_view}, JS File={has_js}, Start Fn ({start_fn})={js_has_start}")

