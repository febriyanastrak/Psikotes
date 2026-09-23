// =========================================================================
// SERVER LOKAL STATIS (ZERO DEPENDENCY)
// PT Altrak 1978 - Online Assessment Portal
// =========================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

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
    let cleanUrl = req.url.split('?')[0].split('#')[0];
    if (cleanUrl === '/' || cleanUrl === '') {
        cleanUrl = '/index.html';
    }

    // Hindari directory traversal attack
    const safePath = path.normalize(cleanUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(`<h2>404 - Halaman Tidak Ditemukan</h2><p><a href="/index.html">Kembali ke Beranda</a></p>`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Content-Type-Options': 'nosniff'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}/index.html`;
    console.log(`\n======================================================`);
    console.log(`  Portal Psikotes PT Altrak 1978 Aktif!`);
    console.log(`  Akses di browser: ${url}`);
    console.log(`  Tekan Ctrl + C untuk menghentikan server`);
    console.log(`======================================================\n`);

    // Buka browser secara otomatis di Windows
    const startCmd = process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`;
    exec(startCmd, () => {});
});
