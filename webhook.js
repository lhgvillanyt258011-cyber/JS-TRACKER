// Vercel Serverless Function: SMS Webhook for JS TRACKER

function parseSMSMessage(text) {
  const lower = (text || '').toLowerCase();

  // 1. Amount extraction
  let amount = 0;
  const match = text.match(/(?:rs\.?|inr|usd|\$|€|£)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
                text.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:usd|inr|rs\.?)/i) ||
                text.match(/(?:spent|debited|paid|charged|withdrawn|sent|received|added|deposited)\s+(?:of\s+)?(?:rs\.?|inr|usd|\$|€|£)?\s*([\d,]+(?:\.\d{1,2})?)/i) ||
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(200).json({
      message: 'JS TRACKER SMS Webhook Serverless Endpoint is active on Vercel.',
      help: 'Send POST request with JSON { "text": "..." } or Twilio webhook format.'
    });
    return;
  }

  try {
    const payload = req.body || {};
    const smsText = payload.text || payload.body || payload.message || payload.Body || '';
    const sender = payload.sender || payload.from || payload.From || 'BANK-SMS';
    const parsed = parseSMSMessage(smsText);

    res.status(200).json({
      success: true,
      message: 'SMS successfully received and parsed by JS TRACKER Vercel Webhook',
      receivedAt: new Date().toISOString(),
      sender,
      parsedTransaction: parsed
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Invalid request payload: ' + err.message
    });
  }
};
