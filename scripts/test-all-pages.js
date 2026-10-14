const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      getHtmlFiles(full, files);
    } else if (item.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = getHtmlFiles('dist');
console.log(`Found ${htmlFiles.length} HTML files in dist/`);

const allImgSrcs = new Set();
const fileWithImgs = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/<img[^>]+src=["']([^"']+)["']/g);
  if (matches) {
    matches.forEach(m => {
      const srcMatch = m.match(/src=["']([^"']+)["']/);
      if (srcMatch) {
        allImgSrcs.add(srcMatch[1]);
        fileWithImgs.push({ file: path.relative('dist', file), src: srcMatch[1] });
      }
    });
  }
}

console.log(`\nTotal unique img srcs in dist: ${allImgSrcs.size}`);
console.log('Unique srcs:');
for (const s of allImgSrcs) {
  console.log(' - ' + s);
}

