const fs = require('fs');

['index.html', 'psikotes.html'].forEach(filename => {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Replace light altrak-card backgrounds with dark slate-900 for modals
    content = content.split('bg-altrak-card border border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full text-center p-7 relative')
                     .join('bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-sm w-full text-center p-7 relative');
    content = content.split('bg-altrak-card border border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center')
                     .join('bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center');
    
    // Fix heading text that was changed to text-black (wrong on dark bg)
    content = content.split('font-black text-black mb-1">Otorisasi HRD')
                     .join('font-black text-white mb-1">Otorisasi HRD');
    
    fs.writeFileSync(filename, content, 'utf8');
    console.log('Fixed:', filename);
});
