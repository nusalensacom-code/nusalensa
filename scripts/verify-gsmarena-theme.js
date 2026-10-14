const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process');

async function testTheme() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    '--user-data-dir=' + os.tmpdir() + '\\chrome-test-theme-' + Date.now(),
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://localhost:9229/json');
    const list = await listRes.json();
    const pageTarget = list.find(t => t.type === 'page');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 1;
    function send(method, params = {}) { ws.send(JSON.stringify({ id: id++, method, params })); }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.result && msg.result.result) {
        console.log('>>> EVAL RESULT:', JSON.stringify(msg.result.result.value, null, 2));
      }
      if (msg.result && msg.result.data) {
        fs.writeFileSync('gsmarena_homepage.png', Buffer.from(msg.result.data, 'base64'));
        console.log('>>> Screenshot saved to gsmarena_homepage.png');
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('>>> CONSOLE:', msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('>>> EXCEPTION:', msg.params.exceptionDetails);
      }
    };

    send('Runtime.enable');
    send('Console.enable');
    send('Page.enable');
    send('Page.navigate', { url: 'http://localhost:3000/' });

    await new Promise(r => setTimeout(r, 3000));

    send('Runtime.evaluate', {
      expression: `({
        title: document.title,
        hasBrandStrip: !!document.querySelector('div:has(> * > span:contains("PHONE BRANDS"))') || document.body.innerText.includes('PHONE BRANDS:'),
        topTenHeader: document.body.innerText.includes('TOP 10 BY DAILY HITS'),
        phoneFinderHeader: document.body.innerText.includes('PHONE FINDER'),
        popularComparisonsHeader: document.body.innerText.includes('POPULAR COMPARISONS'),
        deviceSpotlightHeader: document.body.innerText.includes('DEVICE SPOTLIGHT'),
        errorId: document.documentElement.id
      })`,
      returnByValue: true
    });

    send('Page.captureScreenshot', { format: 'png' });

    await new Promise(r => setTimeout(r, 2000));
    ws.close();
  } finally {
    chromeProcess.kill();
  }
}

testTheme();

