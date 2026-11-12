/**
 * OKXPay (WPay) Bangladesh PayIn Server - LIVE
 * ------------------------------------------------
 * POST /api/create-payment   -> নতুন পেমেন্ট লিংক তৈরি
 * POST /api/payment-callback -> গেটওয়ে থেকে পেমেন্ট রেজাল্ট (IPN)
 * GET  /api                  -> সার্ভার চালু আছে কিনা দেখা
 */

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const qs = require('querystring');
const https = require('https');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CORS (ফ্রন্টএন্ড GitHub-এ থাকলে দরকার) ====================
// শুধু এই সাইট থেকে কল করা যাবে। আরও সাইট দিতে হলে কমা দিয়ে যোগ করুন।
const ALLOWED_ORIGINS = ['https://bridge-wallet-9ik.pages.dev'];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes('*')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204); // preflight
    next();
});

// ==================== LIVE কনফিগ ====================
const MCH_ID = '5393';
const SECRET_KEY = 'd8490b215ef5248d7fb693a101f9898d';
const API_URL = 'https://api.wpay.life';

const NOTIFY_URL = 'https://imcagro.top/api/payment-callback';
const CALLBACK_URL = 'https://bridge-wallet-9ik.pages.dev/api/notify';
const RETURN_URL = 'https://bridge-wallet-9ik.pages.dev/deposit';

// ==================== সাইন তৈরি (ডক অনুযায়ী) ====================
// ১. sign ও খালি ভ্যালু বাদ  ২. নামের ASCII ক্রমে সাজানো
// ৩. key=value&... জোড়া, শেষে &key=SECRET  ৪. MD5, ছোট হাতের অক্ষর
function makeSign(params) {
    const str = Object.keys(params)
        .filter(k => k !== 'sign' && params[k] !== undefined && params[k] !== null && params[k] !== '')
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join('&');
    return crypto.createHash('md5').update(`${str}&key=${SECRET_KEY}`).digest('hex').toLowerCase();
}

const router = express.Router();

// ==================== স্ট্যাটাস ====================
router.get('/', (req, res) => {
    res.json({ status: 'OKXPay Bangladesh PayIn Server is live!' });
});

router.get('/create-payment', (req, res) => {
    res.json({ message: 'Server is working! Please use POST method to create Bangladesh PayIn.' });
});

// ==================== পেমেন্ট তৈরি ====================
// Body (JSON বা form): { "amount": 100, "orderId": "ORD1001", "payType": "BKASH" }
// payType: BKASH | NAGAD | ROCKET | BKASH-C | NAGAD-C   (ডিফল্ট BKASH)
router.post('/create-payment', async (req, res) => {
    try {
        const { amount, money, orderId, payType, attach, returnUrl } = req.body;
        const value = amount !== undefined ? amount : money;

        if (!value || !orderId) {
            return res.status(400).json({ success: false, message: 'amount and orderId are required' });
        }

        const intMoney = Math.round(Number(value)); // গেটওয়ে পূর্ণসংখ্যা চায়
        if (isNaN(intMoney) || intMoney <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        let safeReturnUrl = RETURN_URL;
        if (returnUrl) {
            const candidate = new URL(returnUrl);
            if (candidate.protocol !== 'https:' || candidate.hostname !== 'bridge-wallet-9ik.pages.dev') {
                return res.status(400).json({ success: false, error: 'Invalid returnUrl' });
            }
            safeReturnUrl = candidate.toString();
        }

        const payload = {
            mchId: MCH_ID,
            currency: 'BDT',
            out_trade_no: String(orderId), // প্রতিটা অর্ডার আইডি ইউনিক হতে হবে
            pay_type: payType || 'BKASH',
            money: String(intMoney),
            attach: attach ? String(attach) : '',
            notify_url: NOTIFY_URL,
            returnUrl: safeReturnUrl
        };
        payload.sign = makeSign(payload);

        const response = await axios.post(`${API_URL}/v1/Collect`, qs.stringify(payload), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 15000
        });

        const gw = response.data;

        // Some gateway responses serialize code as "0" instead of 0.
        if (gw && String(gw.code) === '0' && gw.data && typeof gw.data.url === 'string' && gw.data.url) {
            return res.json({
                success: true,
                paymentUrl: gw.data.url,
                transactionId: gw.data.transaction_Id
            });
        }

        console.error('Gateway rejected payment:', { httpStatus: response.status, code: gw && gw.code, message: gw && (gw.msg || gw.message), data: gw && gw.data });
        return res.status(502).json({ success: false, message: (gw && (gw.msg || gw.message)) || 'Gateway rejected payment', gatewayResponse: gw });
    } catch (error) {
        const detail = error.response ? { status: error.response.status, data: error.response.data } : error.message;
        console.error('create-payment error:', detail);
        return res.status(500).json({ success: false, error: detail });
    }
});

// ==================== কলব্যাক (IPN) ====================
// status: 0 = pending, 1 = পেমেন্ট সফল, 2 = পেমেন্ট ব্যর্থ
// গেটওয়েকে শুধু  success  লিখে ফেরত দিতে হবে, নইলে ৫ বার পুনরায় পাঠাবে
router.post('/payment-callback', (req, res) => {
    const data = req.body;
    console.log('Callback Received:', JSON.stringify(data));

    // সাইন যাচাই
    const received = String(data.sign || '').toLowerCase();
    const expected = makeSign(data);
    if (!received || received !== expected) {
        console.warn('Invalid callback signature. expected:', expected, 'received:', received);
        return res.status(400).send('fail');
    }

    const callbackUrl = CALLBACK_URL;
    const body = qs.stringify(data);
    const target = new URL(callbackUrl);
    const proxy = https.request({ hostname: target.hostname, path: target.pathname + target.search, method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, upstream => {
        let response = '';
        upstream.on('data', chunk => response += chunk);
        upstream.on('end', () => {
            if (upstream.statusCode === 200 && response.trim() === 'success') return res.send('success');
            console.error('Callback target rejected notification:', upstream.statusCode, response.slice(0, 500));
            return res.status(502).send('fail');
        });
    });
    proxy.on('error', error => { console.error('Callback forwarding failed:', error.message); res.status(502).send('fail'); });
    proxy.setTimeout(15000, () => proxy.destroy(new Error('callback timeout')));
    proxy.write(body);
    proxy.end();
});

app.use('/', router);
app.use('/api', router);

// অজানা পাথের জন্য JSON 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`LIVE PayIn server running on port ${PORT} | mchId ${MCH_ID} | ${API_URL}`);
});

