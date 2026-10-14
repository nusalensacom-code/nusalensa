const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', '.next', 'server', 'app', 'api', 'articles', 'route.js');
if (fs.existsSync(target)) {
  const code = fs.readFileSync(target, 'utf8');
  console.log('Total length:', code.length);
  const snippet = code.slice(Math.max(0, 4930 - 250), Math.min(code.length, 4930 + 250));
  console.log('Snippet around 4930:');
  console.log(snippet);
} else {
  console.log('File not found:', target);
}

