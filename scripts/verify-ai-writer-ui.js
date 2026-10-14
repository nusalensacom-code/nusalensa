const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

function createAdminCookie() {
  const JWT_SECRET = process.env.JWT_SECRET || 'nusalensa-super-secure-portal-secret-key-global-2026';
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const payload = { userId: 1, email: 'admin@nusalensa.com', name: 'Administrator', role: 'SUPER_ADMIN', exp };
  const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(base64Data).digest('base64url');
  return `${base64Data}.${signature}`;
}

async function testAiWriterUI() {
  const artifactDir = 'C:\\Users\\admin\\.gemini\\antigravity\\brain\\b1b55558-0ca1-4eb2-b760-7eed4676cd9f';
  const screenshotPath = path.join(artifactDir, 'ai_writer_dashboard.png');
  const sessionToken = createAdminCookie();

  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9231',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    '--user-data-dir=' + os.tmpdir() + '\\chrome-test-ai-writer-' + Date.now(),
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://localhost:9231/json');
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
        fs.writeFileSync(screenshotPath, Buffer.from(msg.result.data, 'base64'));
        console.log('>>> Screenshot saved to:', screenshotPath);
      }
    };

    send('Runtime.enable');
    send('Page.enable');
    send('Network.enable');

    // Set cookie directly
    send('Network.setCookie', {
      name: 'nusalensa_session',
      value: sessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true
    });

    // Navigate to /admin/ai-writer
    send('Page.navigate', { url: 'http://localhost:3000/admin/ai-writer' });
    await new Promise(r => setTimeout(r, 4000));

    // Also populate localStorage for client session
    send('Runtime.evaluate', {
      expression: `localStorage.setItem('nusalensa_session_user', JSON.stringify({ userId: 1, email: 'admin@nusalensa.com', name: 'Administrator', role: 'SUPER_ADMIN' }))`,
    });

    // Re-verify and evaluate page
    send('Runtime.evaluate', {
      expression: `({
        title: document.title,
        heading: document.querySelector('h1')?.innerText,
        hasPrimaryKeywordInput: !!document.querySelector('input[placeholder*="Best smartphones"]'),
        hasGenerateButton: !!Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Generate Article')),
        hasRecentJobs: document.body.innerText.includes('Recent Generation Jobs'),
        sidebarHasAiWriter: document.body.innerText.includes('AI Article Generator'),
        recentJobTitleInTable: document.querySelector('table tbody tr td')?.innerText
      })`,
      returnByValue: true
    });

    // Capture screenshot
    send('Page.captureScreenshot', { format: 'png' });
    await new Promise(r => setTimeout(r, 2500));

    ws.close();
  } catch (err) {
    console.error('Error testing UI:', err);
  } finally {
    chromeProcess.kill();
  }
}

testAiWriterUI();

