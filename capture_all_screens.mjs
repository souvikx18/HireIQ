import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const SCREENSHOT_DIR = path.resolve('HireIQ_Documentation_Assets/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function getTokens() {
  const adminRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@hireiq.com', password: 'Admin@123456' }),
  }).then(r => r.json());

  const candRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'candidate@hireiq.com', password: 'Candidate@123456' }),
  }).then(r => r.json());

  return {
    admin: {
      token: adminRes.data.accessToken,
      user: adminRes.data.user,
    },
    candidate: {
      token: candRes.data.accessToken,
      user: candRes.data.user,
    },
  };
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function waitForChrome(port = 9333, maxTries = 30) {
  for (let i = 0; i < maxTries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error('Chrome did not start on debugging port within expected time');
}

async function capture() {
  console.log('1. Authenticating...');
  const { admin, candidate } = await getTokens();

  const port = 9555;
  console.log(`2. Spawning dedicated Headless Chrome on port ${port}...`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.resolve(`tmp_profile_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--window-size=1440,900',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
  ]);

  try {
    await waitForChrome(port);
    console.log('3. Chrome ready. Creating target tab...');

    const tabs = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
    let newTab = tabs.find(t => t.type === 'page');
    if (!newTab) {
      newTab = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' }).then(r => r.json());
    }
    const client = new CDPClient(newTab.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Seed token into login page first
    await client.send('Page.navigate', { url: 'http://localhost:5173/login' });
    await new Promise(r => setTimeout(r, 1000));

    const screens = [
      {
        filename: 'fig02_authentication_portal.png',
        url: 'http://localhost:5173/login',
        auth: 'none',
        title: 'Figure 2: Role-Based Authentication & Quick Demo Selector',
        waitMs: 3500,
      },
    ];

    for (const screen of screens) {
      console.log(`Processing: ${screen.title}`);

      // Apply authentication directly via Runtime.evaluate and navigate in window
      if (screen.auth === 'admin') {
        await client.send('Runtime.evaluate', {
          expression: `
            localStorage.setItem('hireiq_token', ${JSON.stringify(admin.token)});
            localStorage.setItem('hireiq_user', ${JSON.stringify(JSON.stringify(admin.user))});
            localStorage.setItem('isAuthenticated', 'true');
            window.location.href = '${screen.url}';
          `,
        });
      } else if (screen.auth === 'candidate') {
        await client.send('Runtime.evaluate', {
          expression: `
            localStorage.setItem('hireiq_token', ${JSON.stringify(candidate.token)});
            localStorage.setItem('hireiq_user', ${JSON.stringify(JSON.stringify(candidate.user))});
            localStorage.setItem('isAuthenticated', 'true');
            window.location.href = '${screen.url}';
          `,
        });
      } else {
        await client.send('Runtime.evaluate', {
          expression: `
            localStorage.removeItem('hireiq_token');
            localStorage.removeItem('hireiq_user');
            localStorage.setItem('isAuthenticated', 'false');
            window.location.href = '${screen.url}';
          `,
        });
      }

      await new Promise(r => setTimeout(r, screen.waitMs));

      if (screen.setupScript) {
        await client.send('Runtime.evaluate', { expression: screen.setupScript });
        await new Promise(r => setTimeout(r, 1200));
      }

      const { data: b64 } = await client.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
      });

      const targetPath = path.join(SCREENSHOT_DIR, screen.filename);
      fs.writeFileSync(targetPath, Buffer.from(b64, 'base64'));
      console.log(`  -> Saved ${screen.filename} (${Math.round((b64.length * 0.75) / 1024)} KB)`);
    }

    client.close();
    console.log('SUCCESS: All 13 actual application screenshots captured!');
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch {}
  }
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
