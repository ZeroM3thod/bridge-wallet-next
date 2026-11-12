const http = require('http');
const https = require('https');
const crypto = require('crypto');
const qs = require('querystring');
const fs = require('fs');
const path = require('path');

// cPanel-এর Environment variables থেকে কনফিগারেশন লোড হবে
const MCH_ID = '5393';
const MCH_KEY = 'd8490b215ef5248d7fb693a101f9898d';
const API_HOST = 'https://api.wpay.life';
const NOTIFY_URL = 'https://imcagro.top/api/payment-callback';
const RETURN_URL = 'https://bridge-wallet-9ik.pages.dev/deposit';
const ALLOWED_ORIGIN = 'https://bridge-wallet-9ik.pages.dev';
const PAY_TYPES = ['BKASH', 'NAGAD', 'ROCKET', 'BKASH-C', 'NAGAD-C'];
const LOG = path.join(__dirname, 'orders.log');

function log(obj) {
  try {
    fs.appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), ...obj }) + '\n');
  } catch (e) {}
}

function sign(params) {
  const str = Object.keys(params)
    .filter((k) => k !== 'sign' && params[k] !== undefined && params[k] !== null && String(params[k]) !== '')
    .sort()
    .map((k) => k + '=' + params[k])
    .join('&');
  return crypto.createHash('md5').update(str + '&key=' + MCH_KEY).digest('hex');
}

function postForm(pathname, params) {
  return new Promise((resolve, reject) => {
    const body = qs.stringify(params);
    const req = https.request(
      {
        host: API_HOST,
        path: pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(new Error('Bad response: ' + d.slice(0, 200)));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
    req.write(body);
    req.end();
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', (c) => {
      d += c;
      if (d.length > 100000) req.destroy();
    });
    req.on('end', () => resolve(d));
    req.on('error', reject);
  });
}

async function createOrder(amount, payType) {
  const money = parseInt(amount, 10);
  if (!(money > 0)) throw new Error('invalid amount');
  if (!PAY_TYPES.includes(payType)) throw new Error('invalid pay_type');
  
  const orderNo = String(Date.now()) + String(Math.floor(Math.random() * 900) + 100);
  const params = {
    mchId: MCH_ID,
    currency: 'BDT',
    out_trade_no: orderNo,
    pay_type: payType,
    money: money,
    notify_url: NOTIFY_URL,
    returnUrl: RETURN_URL,
  };
  
  params.sign = sign(params);
  const r = await postForm('/v1/Collect', params);
  log({ type: 'create', orderNo, money, payType, resp: r });
  
  if (r.code !== 0) throw new Error('gateway code ' + r.code + ': ' + r.msg);
  return { orderNo, url: r.data.url };
}

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const route = u.pathname.replace(/^\/api/, '') || '/';
  
  try {
    if (req.method === 'OPTIONS') return send(res, 204, '');

    // ১. ব্রাউজারে মূল পেজ ভিজিট করলে public/index.html দেখানোর রুট
    if (route === '/' && req.method === 'GET') {
      try {
        const htmlPath = path.join(__dirname, 'public', 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        return send(res, 200, htmlContent, 'text/html');
      } catch (e) {
        return send(res, 404, 'Frontend index.html not found', 'text/plain');
      }
    }

    // ২. ফ্রন্টএন্ড থেকে পেমেন্ট রিকোয়েস্ট পাঠানোর রুট
    if (route === '/pay' && req.method === 'POST') {
      const b = JSON.parse((await readBody(req)) || '{}');
      const result = await createOrder(b.amount, b.pay_type);
      return send(res, 200, result);
    }

    // ৩. পেমেন্ট সফল হওয়ার পর গে트ওয়ে থেকে নোটিফিকেশন পাওয়ার রুট (Webhook)
    if (route === '/notify' && req.method === 'POST') {
      const raw = await readBody(req);
      const p = qs.parse(raw);
      const ok = p.sign && p.sign === sign(p);
      
      log({ type: 'notify', ok, body: p });
      if (!ok) return send(res, 200, 'fail', 'text/plain');
      
      return send(res, 200, 'success', 'text/plain');
    }

    send(res, 404, { error: 'Route not found' });
  } catch (e) {
    log({ type: 'error', msg: e.message });
    send(res, 500, { error: e.message });
  }
});

server.listen(process.env.PORT || 3000);
