const http = require('http');
const https = require('https');
const crypto = require('crypto');
const qs = require('querystring');
const fs = require('fs');
const path = require('path');

// cPanel-এর Environment variables থেকে কনফিগারেশন লোড হবে
const MCH_ID = '5393';
const MCH_KEY = 'REPLACE_WITH_ROTATED_MERCHANT_KEY';
const PROXY_SECRET = 'REPLACE_WITH_SHARED_PROXY_SECRET';
const API_HOST = 'https://api.wpay.life';
const NOTIFY_URL = 'https://imcagro.top/api/payment-callback';
const CALLBACK_URL = 'https://bridge-wallet-9ik.pages.dev/api/notify';
const RETURN_URL = 'https://bridge-wallet-9ik.pages.dev/deposit';
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
    const api = new URL(API_HOST);
    const req = https.request(
      {
        hostname: api.hostname,
        port: api.port || 443,
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

async function createOrder(amount, payType, orderId, attach, returnUrl) {
  if (!MCH_ID || !MCH_KEY) throw new Error('Payment gateway is not configured');
  const money = parseInt(amount, 10);
  if (!(money > 0)) throw new Error('invalid amount');
  if (!PAY_TYPES.includes(payType)) throw new Error('invalid pay_type');
  
  const orderNo = String(orderId || `${Date.now()}${crypto.randomInt(100, 1000)}`);
  const params = {
    mchId: MCH_ID,
    currency: 'BDT',
    out_trade_no: orderNo,
    pay_type: payType,
    money: money,
    attach: attach || '',
    notify_url: NOTIFY_URL,
    returnUrl: returnUrl || RETURN_URL,
  };
  
  params.sign = sign(params);
  const r = await postForm('/v1/Collect', params);
  log({ type: 'create', orderNo, money, payType, resp: r });
  
  if (String(r.code) !== '0' || !r.data?.url) throw new Error('gateway code ' + r.code + ': ' + r.msg);
  const paymentUrl = new URL(r.data.url);
  if (paymentUrl.protocol !== 'https:' || !['wpay.life', 'wpay.one', 'okexpay.dev'].some((domain) => paymentUrl.hostname === domain || paymentUrl.hostname.endsWith(`.${domain}`))) throw new Error('Invalid gateway payment URL');
  return { success: true, orderNo, paymentUrl: paymentUrl.toString(), transactionId: r.data.transaction_Id };
}

function authorized(req) {
  const supplied = Buffer.from(req.headers['x-proxy-secret'] || '');
  const expected = Buffer.from(PROXY_SECRET || '');
  return expected.length > 0 && supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

function postCallback(raw) {
  return new Promise((resolve, reject) => {
    const target = new URL(CALLBACK_URL);
    const req = https.request({ hostname: target.hostname, path: target.pathname + target.search, method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(raw) } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => res.statusCode === 200 && data.trim() === 'success' ? resolve() : reject(new Error(`Callback forward rejected: ${res.statusCode}`)));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('Callback timeout')));
    req.end(raw);
  });
}

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'application/json',
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
    if ((route === '/pay' || route === '/create-payment') && req.method === 'POST') {
      if (!authorized(req)) return send(res, 401, { success: false, error: 'Unauthorized' });
      const b = JSON.parse((await readBody(req)) || '{}');
      const result = await createOrder(b.amount ?? b.money, b.payType ?? b.pay_type, b.orderId, b.attach, b.returnUrl);
      return send(res, 200, result);
    }

    // ৩. পেমেন্ট সফল হওয়ার পর গে트ওয়ে থেকে নোটিফিকেশন পাওয়ার রুট (Webhook)
    if ((route === '/notify' || route === '/payment-callback') && req.method === 'POST') {
      const raw = await readBody(req);
      const p = qs.parse(raw);
      const received = String(p.sign || '').toLowerCase();
      const ok = received && received === sign(p);
      
      log({ type: 'notify', ok, body: p });
      if (!ok) return send(res, 400, 'fail', 'text/plain');
      await postCallback(raw);
      return send(res, 200, 'success', 'text/plain');
    }

    send(res, 404, { error: 'Route not found' });
  } catch (e) {
    log({ type: 'error', msg: e.message });
    send(res, 500, { error: e.message });
  }
});

server.listen(3000);
