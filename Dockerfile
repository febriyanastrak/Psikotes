# =========================================================================
# DOCKERFILE - PORTAL ASESMEN PSIKOTES PT ALTRAK 1978
# Lightweight Alpine Node.js Container (Enterprise Security Hardened)
# =========================================================================

FROM node:20-alpine

# Set direktori kerja di dalam kontainer
WORKDIR /app

# Atur environment default
ENV NODE_ENV=production \
    PORT=3000

# Salin metadata dependensi (jika ada)
COPY package*.json ./

# Salin seluruh aset dan source code antarmuka
COPY assets ./assets
COPY css ./css
COPY js ./js
COPY index.html ./
COPY hrd.html ./
COPY server.js ./

# Amankan hak akses file agar dimiliki oleh user non-root 'node'
RUN chown -R node:node /app

# Gunakan user non-root demi standar keamanan kontainer
USER node

# Buka port 3000
EXPOSE 3000

# Healthcheck otomatis untuk memastikan server aktif merespon
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/index.html || exit 1

# Jalankan server aplikasi
CMD ["node", "server.js"]
