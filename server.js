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

    let rawUrl = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    if (rawUrl === '/' || rawUrl === '') {
        rawUrl = '/index.html';
    }

    // Proteksi Directory Traversal: Normalisasi & pastikan path berada di dalam ROOT_DIR
    const safeRelPath = path.normalize(rawUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.resolve(ROOT_DIR, '.' + path.sep + safeRelPath);

    if (!filePath.startsWith(ROOT_DIR)) {
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
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
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

    // Buka browser hanya jika diberikan argumen --open (mencegah tab terbuka 2 kali saat menggunakan Go Live / debugger)
    if (process.argv.includes('--open')) {
        const startCmd = process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`;
        exec(startCmd, () => {});
    }
});

