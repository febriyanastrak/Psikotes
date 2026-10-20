// =========================================================================
// SERVER LOKAL STATIS (SECURITY HARDENED)
// PT Altrak 1978 - Online Assessment Portal
// =========================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname);

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // Hanya izinkan metode GET dan HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('405 - Method Not Allowed');
        return;
    }

    let rawUrl = '';
    try {
        rawUrl = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    } catch (e) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('400 - Bad Request');
        return;
    }

    if (rawUrl === '/' || rawUrl === '') {
        rawUrl = '/index.html';
    }

    // Proteksi Directory Traversal: Normalisasi & pastikan path berada di dalam ROOT_DIR
    const safeRelPath = path.normalize(rawUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.resolve(ROOT_DIR, '.' + path.sep + safeRelPath);

    // Proteksi Keamanan: Tolak jika mengarah ke luar root, file/folder tersembunyi (berawalan .), atau file internal sensitif
    const urlParts = rawUrl.split(/[\/\\]/).filter(Boolean);
    const hasHiddenPart = urlParts.some(part => part.startsWith('.'));
    const baseName = path.basename(filePath).toLowerCase();
    const ext = path.extname(filePath).toLowerCase();
    const blockedExtensions = ['.xlsx', '.xls', '.json', '.env', '.md', '.lock', '.yml', '.yaml', '.sql', '.sh', '.bat'];
    const isSensitiveFile = baseName === 'server.js' || baseName === 'package.json' || baseName === 'package-lock.json' || blockedExtensions.includes(ext);
    const isInsideRoot = filePath.startsWith(ROOT_DIR + path.sep) || filePath === ROOT_DIR;

    if (!isInsideRoot || hasHiddenPart || isSensitiveFile) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(`<h2>403 - Akses Ditolak (Security Alert)</h2>`);
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(`<h2>404 - Halaman Tidak Ditemukan</h2><p><a href="/index.html">Kembali ke Beranda</a></p>`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Enterprise Security Headers
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
                "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.jsdelivr.net",
                "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com",
                "img-src 'self' data: blob: https://rvflmznbihunezzqhobm.supabase.co https://*.supabase.co",
                "connect-src 'self' https://rvflmznbihunezzqhobm.supabase.co wss://rvflmznbihunezzqhobm.supabase.co",
                "media-src 'self' blob:",
                "frame-ancestors 'self'"
            ].join('; '),
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        });

        if (req.method === 'HEAD') {
            res.end();
            return;
        }

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}/index.html`;
    console.log(`\n======================================================`);
    console.log(`  Portal Psikotes PT Altrak 1978 Aktif (Security Hardened)`);
    console.log(`  Akses di browser: ${url}`);
    console.log(`  Tekan Ctrl + C untuk menghentikan server`);
    console.log(`======================================================\n`);

    // Buka browser jika diberikan argumen --open (mendukung Windows, macOS, dan Linux)
    if (process.argv.includes('--open')) {
        let startCmd = `xdg-open "${url}"`;
        if (process.platform === 'win32') {
            startCmd = `start "" "${url}"`;
        } else if (process.platform === 'darwin') {
            startCmd = `open "${url}"`;
        }
        exec(startCmd, () => {});
    }
});

