// Lightweight zero-dependency HTTP server for JS TRACKER
// Includes static file serving + REST Webhook API for SMS Expense Tracking
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Built-in lightweight SMS Regex Parser for incoming webhook requests
function parseSMSMessage(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase();

  // 1. Amount
  let amount = null;
  const match = text.match(/(?:\$|usd|rs\.?|inr|eur|£)\s*([\d,]+\.?\d*)/i) ||
                text.match(/([\d,]+\.?\d*)\s*(?:\$|usd|rs\.?|inr|eur|£)/i) ||
                text.match(/\b\d+\.\d{2}\b/);
  if (match) {
    const raw = (match[1] || match[0]).replace(/,/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) amount = num;
  }

  // 2. Type
  let type = 'expense';
  if ((lower.includes('credited') || lower.includes('deposited') || lower.includes('salary') || lower.includes('received')) && !lower.includes('debited')) {
    type = 'income';
  }

  // 3. Merchant
  let merchant = 'Bank Transaction';
  const mMatch = text.match(/(?:at|to|paid to|charged at|vpa|from)\s+([A-Za-z0-9\s&'.-]{2,30}?)(?:\s+on|\s+ref|\s+avail|\.|\s*$)/i);
  if (mMatch && mMatch[1]) {
    merchant = mMatch[1].trim();
  }

  // 4. Inferred Category
  let category = type === 'income' ? 'cat_job' : 'cat_misc';
  if (/starbucks|cafe|coffee|chipotle|burrito|pizza|burger|mcdonald|subway|taco|swiggy|zomato/i.test(lower)) category = 'cat_food';
  else if (/trader joe|whole foods|aldi|safeway|walmart|target|kroger|grocery|supermarket/i.test(lower)) category = 'cat_groceries';
  else if (/uber|lyft|transit|metro|train|bus|gas|fuel|parking/i.test(lower)) category = 'cat_transit';
  else if (/spotify|netflix|apple|google|amazon prime|youtube|hulu|github/i.test(lower)) category = 'cat_subs';
  else if (/bookstore|vitalsource|chegg|textbook|library|udemy/i.test(lower)) category = 'cat_books';
  else if (/cinema|amc|imax|movie|concert|ticketmaster/i.test(lower)) category = 'cat_entertainment';
  else if (/rent|apartment|landlord|dorm/i.test(lower)) category = 'cat_housing';
  else if (/cvs|walgreens|pharmacy|clinic|hospital/i.test(lower)) category = 'cat_health';
  else if (/payroll|stipend|salary/i.test(lower)) category = 'cat_job';

  return {
    amount: amount || 0,
    type,
    merchant,
    category,
    date: new Date().toISOString().slice(0, 10),
    parsedAt: new Date().toISOString()
  };
}

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('?');
  const pathname = urlParts[0];

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Route: Incoming SMS Webhook (Twilio / Android forwarder / curl)
  if (pathname === '/api/sms/webhook' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        let payload = {};
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
          payload = JSON.parse(body);
        } else {
          // Parse URL encoded
          const params = new URLSearchParams(body);
          payload = {
            sender: params.get('From') || params.get('sender') || 'SMS-GATEWAY',
            text: params.get('Body') || params.get('text') || params.get('message') || body
          };
        }

        const smsText = payload.text || payload.body || payload.message || '';
        const sender = payload.sender || payload.from || 'BANK-SMS';
        const parsed = parseSMSMessage(smsText);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'SMS received and parsed successfully',
          sender,
          rawText: smsText,
          parsed
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Static file serving
  let safePath = path.normalize(decodeURI(pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  const filePath = path.join(ROOT, safePath);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`JS TRACKER running at: http://localhost:${PORT}`);
  console.log(`SMS Webhook endpoint available at: http://localhost:${PORT}/api/sms/webhook`);
});
