const fs = require('fs');
const https = require('https');

const seedContent = fs.readFileSync('prisma/seed.js', 'utf8');
const urls = [...new Set(seedContent.match(/https?:\/\/[^\s'"`,\)]+/g) || [])]
  .filter(u => u.includes('unsplash.com') || u.includes('.jpg') || u.includes('.png') || u.includes('.webp'));

console.log(`Found ${urls.length} image URLs in prisma/seed.js. Testing each one...`);

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        resolve({ url, status: res.statusCode, location: res.headers.location });
      });
      req.on('error', (err) => resolve({ url, status: 'ERROR', error: err.message }));
      req.setTimeout(6000, () => {
        req.destroy();
        resolve({ url, status: 'TIMEOUT' });
      });
    } catch (e) {
      resolve({ url, status: 'EXCEPTION', error: e.message });
    }
  });
}

async function run() {
  for (let i = 0; i < urls.length; i++) {
    const res = await checkUrl(urls[i]);
    if (res.status === 200 || res.status === 301 || res.status === 302) {
      console.log(`[OK ${res.status}] ${res.url.substring(0, 70)}`);
    } else {
      console.log(`[FAIL ${res.status}] ${res.url}`);
    }
  }
}

run();

