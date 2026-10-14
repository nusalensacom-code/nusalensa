const https = require('https');
const url = 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80';
https.get(url, res => {
  console.log('Status of photo-1541888946425-d0fbb186c5f7:', res.statusCode);
}).on('error', e => console.log('Err:', e.message));

