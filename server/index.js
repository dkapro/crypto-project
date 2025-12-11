const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


let cacheData = null;
let lastFetchTime = 0;
let historyCache = {};
let historyTimestamps = {};

const BACKUP_COINS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin (Backup)', current_price: 94000, price_change_percentage_24h: 0, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum (Backup)', current_price: 3200, price_change_percentage_24h: 0, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
];

const generateBackupHistory = () => {
  const data = [];
  const now = Date.now();
  let price = 50000;
  for (let i = 7; i >= 0; i--) {
    price = price * (1 + (Math.random() * 0.1 - 0.05));
    data.push([now - (i * 24 * 60 * 60 * 1000), price]);
  }
  return data;
};


app.get('/', (req, res) => {
  res.send('Server is RUNNING! Go to /api/coins to see data.');
});


app.get('/api/coins', async (req, res) => {
  const now = Date.now();
  if (cacheData && (now - lastFetchTime < 60000)) {
    return res.json(cacheData);
  }
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets', 
      { 
        headers: {
          'x-cg-demo-api-key': 'CG-frC8PGqKcXPSjk2qDZTpiPjq'
        },
        params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 10, page: 1, sparkline: false } 
      }
    );
    cacheData = response.data;
    lastFetchTime = now;
    res.json(response.data);
  } catch (error) {
    if (cacheData) return res.json(cacheData);
    res.json(BACKUP_COINS);
  }
});


app.get('/api/coins/:id/history', async (req, res) => {
  const { id } = req.params;
  const days = req.query.days || 7;
  const cacheKey = `${id}_${days}`;
  const now = Date.now();

  if (historyCache[cacheKey] && (now - historyTimestamps[cacheKey] < 60000)) {
    return res.json(historyCache[cacheKey]);
  }
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      { 
        headers: {
          'x-cg-demo-api-key': 'CG-frC8PGqKcXPSjk2qDZTpiPjq'
        },
        params: { vs_currency: 'usd', days: days } 
      }
    );
    historyCache[cacheKey] = response.data.prices; 
    historyTimestamps[cacheKey] = now;            
    res.json(response.data.prices);
  } catch (error) {
    if (historyCache[cacheKey]) return res.json(historyCache[cacheKey]);
    res.json(generateBackupHistory());
  }
});


app.get('/api/fng', async (req, res) => {
  try {
    const response = await axios.get('https://api.alternative.me/fng/');
    res.json(response.data);
  } catch (error) {
    res.json({ data: [{ value: "50", value_classification: "Neutral" }] });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});