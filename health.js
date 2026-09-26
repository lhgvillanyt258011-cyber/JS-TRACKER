module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  res.status(200).json({
    status: 'ok',
    app: 'JS TRACKER',
    version: '1.0.0',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString()
  });
};
