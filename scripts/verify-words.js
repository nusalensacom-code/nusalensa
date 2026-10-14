const fs = require('fs');

const content = fs.readFileSync('prisma/seed.js', 'utf8');
const regex = /title:\s*["'`]([^"'`]+)["'`],[\s\S]*?content:\s*`([\s\S]*?)`/g;
let match;
let count = 0;

console.log('=== VERIFIKASI PANJANG KATA 20 ARTIKEL SEED ===');
while ((match = regex.exec(content)) !== null) {
  count++;
  const title = match[1];
  const articleContent = match[2];
  const plainText = articleContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(' ').filter(w => w.length > 0).length;
  console.log(`[#${count}] ${wordCount} kata: ${title.substring(0, 50)}...`);
}
console.log(`Total artikel yang diverifikasi: ${count}`);

