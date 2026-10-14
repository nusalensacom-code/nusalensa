const fs = require('fs');
const https = require('https');

const md = fs.readFileSync('C:\\Users\\admin\\.gemini\\antigravity\\brain\\9f64c6b8-f549-41c6-886d-41404a2951b0\\.system_generated\\steps\\1919\\content.md', 'utf8');

const imgMatches = md.match(/src="([^"]+)"/g) || [];
const urls = [...new Set(imgMatches.map(m => m.replace('src="', '').replace('"', '').replace(/&amp;/g, '&')))];

console.log(`Found ${urls.length} images on live homepage https://updateyuk.pages.dev/`);

function check(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => resolve({ url, status: 'ERR: ' + e.message }));
  });
}

async function run() {
  for (const u of urls) {
    if (u.startsWith('http')) {
      const r = await check(u);
      console.log(`[${r.status}] ${u.substring(0, 80)}`);
    } else {
      console.log(`[LOCAL] ${u}`);
    }
  }
}

run();

